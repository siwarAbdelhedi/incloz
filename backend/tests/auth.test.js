import { describe, it, expect } from 'vitest'
import { api, createUser, auth } from './helpers.js'
import User from '../src/models/userModel.js'

describe('Inscription', () => {
  it('crée un compte et renvoie un jeton', async () => {
    const res = await api()
      .post('/api/users')
      .send({ name: 'Camille', email: 'camille@incloz.fr', password: 'Motdepasse123' })

    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.email).toBe('camille@incloz.fr')
  })

  it('ne renvoie jamais le mot de passe', async () => {
    const res = await api()
      .post('/api/users')
      .send({ name: 'Camille', email: 'camille@incloz.fr', password: 'Motdepasse123' })

    expect(res.body.password).toBeUndefined()
  })

  it('stocke le mot de passe haché, jamais en clair', async () => {
    await createUser({ email: 'hash@incloz.fr', password: 'Motdepasse123' })

    const stored = await User.findOne({ email: 'hash@incloz.fr' })
    expect(stored.password).not.toBe('Motdepasse123')
    expect(stored.password).toMatch(/^\$2[aby]\$/)
  })

  it('refuse une adresse déjà utilisée', async () => {
    await createUser({ email: 'doublon@incloz.fr' })
    const res = await api()
      .post('/api/users')
      .send({ name: 'Autre', email: 'doublon@incloz.fr', password: 'Motdepasse123' })

    expect(res.status).toBe(400)
  })

  it("ignore un isAdmin envoyé par le client (pas d'élévation de privilèges)", async () => {
    const res = await api().post('/api/users').send({
      name: 'Pirate',
      email: 'pirate@incloz.fr',
      password: 'Motdepasse123',
      isAdmin: true,
    })

    expect(res.status).toBe(201)
    expect(res.body.isAdmin).toBe(false)
    const stored = await User.findOne({ email: 'pirate@incloz.fr' })
    expect(stored.isAdmin).toBe(false)
  })
})

describe('Connexion', () => {
  it('accepte les bons identifiants', async () => {
    await createUser({ email: 'ok@incloz.fr', password: 'Motdepasse123' })
    const res = await api()
      .post('/api/users/login')
      .send({ email: 'ok@incloz.fr', password: 'Motdepasse123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })

  it('refuse un mauvais mot de passe', async () => {
    await createUser({ email: 'ok@incloz.fr', password: 'Motdepasse123' })
    const res = await api()
      .post('/api/users/login')
      .send({ email: 'ok@incloz.fr', password: 'mauvais' })

    expect(res.status).toBe(401)
  })

  it('refuse un compte inexistant', async () => {
    const res = await api()
      .post('/api/users/login')
      .send({ email: 'fantome@incloz.fr', password: 'Motdepasse123' })

    expect(res.status).toBe(401)
  })
})

// Le hook pre('save') appelle bcrypt et conditionne son travail à
// isModified('password'). C'est le point le plus facile à casser du modèle : une
// erreur de branche ici rend des comptes inaccessibles sans qu'aucun autre test
// ne s'en aperçoive, et il n'existe pas de parcours « mot de passe oublié » pour
// s'en remettre. Ces tests verrouillent l'invariant.
//
// Note : ils passent aussi bien avec qu'sans le `return` devant next(), en
// Mongoose 5 comme en 8 — appeler next() valide la sauvegarde immédiatement,
// donc le re-hachage qui suit n'est jamais persisté. Le `return` reste la
// bonne écriture, mais ce n'est pas lui que ces tests protègent.
describe('Mot de passe — invariants du hook de hachage', () => {
  it('permet de se reconnecter après un changement de nom', async () => {
    const { token } = await createUser({
      email: 'profil@incloz.fr',
      password: 'Motdepasse123',
    })

    const update = await api()
      .put('/api/users/profile')
      .set(...auth(token))
      .send({ name: 'Nouveau Nom' })
    expect(update.status).toBe(200)
    expect(update.body.name).toBe('Nouveau Nom')

    const login = await api()
      .post('/api/users/login')
      .send({ email: 'profil@incloz.fr', password: 'Motdepasse123' })
    expect(login.status).toBe(200)
  })

  it('laisse le hash intact quand le mot de passe n’est pas modifié', async () => {
    const { token } = await createUser({ email: 'hashintact@incloz.fr' })
    const before = (await User.findOne({ email: 'hashintact@incloz.fr' })).password

    await api()
      .put('/api/users/profile')
      .set(...auth(token))
      .send({ name: 'Encore un autre nom' })

    const after = (await User.findOne({ email: 'hashintact@incloz.fr' })).password
    expect(after).toBe(before)
  })

  it('prend bien en compte un vrai changement de mot de passe', async () => {
    const { token } = await createUser({
      email: 'motdepasse@incloz.fr',
      password: 'Motdepasse123',
    })

    await api()
      .put('/api/users/profile')
      .set(...auth(token))
      .send({ password: 'NouveauMotDePasse456' })

    const avecAncien = await api()
      .post('/api/users/login')
      .send({ email: 'motdepasse@incloz.fr', password: 'Motdepasse123' })
    expect(avecAncien.status).toBe(401)

    const avecNouveau = await api()
      .post('/api/users/login')
      .send({ email: 'motdepasse@incloz.fr', password: 'NouveauMotDePasse456' })
    expect(avecNouveau.status).toBe(200)
  })
})

describe('Middleware protect', () => {
  it('refuse une requête sans en-tête Authorization', async () => {
    const res = await api().get('/api/users/profile')
    expect(res.status).toBe(401)
  })

  it('refuse un jeton invalide', async () => {
    const res = await api().get('/api/users/profile').set(...auth('nimportequoi'))
    expect(res.status).toBe(401)
  })

  it('refuse un en-tête sans le préfixe Bearer', async () => {
    const { token } = await createUser()
    const res = await api().get('/api/users/profile').set('Authorization', token)
    expect(res.status).toBe(401)
  })

  // Régression réelle : req.user valait null et les handlers plantaient en 500.
  it('refuse un jeton valide dont le compte a été supprimé', async () => {
    const { token } = await createUser({ email: 'supprime@incloz.fr' })
    await User.deleteOne({ email: 'supprime@incloz.fr' })

    const res = await api().get('/api/users/profile').set(...auth(token))
    expect(res.status).toBe(401)
  })

  it('laisse passer un jeton valide', async () => {
    const { token } = await createUser({ email: 'valide@incloz.fr' })
    const res = await api().get('/api/users/profile').set(...auth(token))

    expect(res.status).toBe(200)
    expect(res.body.email).toBe('valide@incloz.fr')
  })
})
