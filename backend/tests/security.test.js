import { describe, it, expect } from 'vitest'
import { api, createUser, auth } from './helpers.js'

describe('En-têtes de sécurité (helmet)', () => {
  it('renvoie les en-têtes de durcissement', async () => {
    const res = await api().get('/')

    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-frame-options']).toBeDefined()
    expect(res.headers['x-dns-prefetch-control']).toBeDefined()
  })

  it("n'annonce plus Express dans les en-têtes", async () => {
    const res = await api().get('/')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })
})

// Le site et l'API sont sur deux domaines distincts. helmet posant
// `Cross-Origin-Resource-Policy: same-origin` partout, le navigateur bloquait
// le chargement des visuels produit : le catalogue s'affichait sans images,
// sans la moindre erreur côté serveur pour le signaler.
describe('Visuels du catalogue (/uploads)', () => {
  it('sont lisibles depuis un autre domaine', async () => {
    const res = await api().get('/uploads/tshirt.png')

    expect(res.status).toBe(200)
    expect(res.headers['cross-origin-resource-policy']).toBe('cross-origin')
  })

  it('conservent le reste du durcissement', async () => {
    const res = await api().get('/uploads/tshirt.png')

    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['x-powered-by']).toBeUndefined()
  })

  // L'ouverture ne doit valoir que pour ce dossier : le reste de l'API n'a
  // aucune raison d'être lisible depuis un autre domaine.
  it("n'ouvrent pas la politique au reste de l'API", async () => {
    for (const route of ['/', '/api/products']) {
      const res = await api().get(route)
      expect(res.headers['cross-origin-resource-policy'], route).toBe('same-origin')
    }
  })
})

// Cette route pousse sur le compte Cloudinary du projet et n'était protégée
// par rien.
describe('POST /api/upload', () => {
  it('refuse une requête anonyme', async () => {
    const res = await api().post('/api/upload')
    expect(res.status).toBe(401)
  })

  it('refuse un utilisateur non administrateur', async () => {
    const { token } = await createUser({ email: 'simple@incloz.fr' })
    const res = await api()
      .post('/api/upload')
      .set(...auth(token))

    expect(res.status).toBe(403)
  })
})

describe('Validation des entrées', () => {
  it('refuse une inscription sans nom', async () => {
    const res = await api()
      .post('/api/users')
      .send({ email: 'x@incloz.fr', password: 'Motdepasse123' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/nom/i)
  })

  it('refuse une adresse e-mail malformée', async () => {
    const res = await api()
      .post('/api/users')
      .send({ name: 'X', email: 'pas-une-adresse', password: 'Motdepasse123' })

    expect(res.status).toBe(400)
  })

  it('refuse un mot de passe trop court', async () => {
    const res = await api()
      .post('/api/users')
      .send({ name: 'X', email: 'x@incloz.fr', password: 'court' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/8 caractères/)
  })

  it('refuse une connexion sans mot de passe', async () => {
    const res = await api().post('/api/users/login').send({ email: 'x@incloz.fr' })
    expect(res.status).toBe(400)
  })

  it('refuse un produit à prix négatif', async () => {
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })
    const res = await api()
      .post('/api/products')
      .set(...auth(token))
      .send({ title: 'X', description: 'X', image: 'x.png', price: -10 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/prix/i)
  })

  it('refuse un produit sans titre', async () => {
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })
    const res = await api()
      .post('/api/products')
      .set(...auth(token))
      .send({ description: 'X', image: 'x.png', price: 10 })

    expect(res.status).toBe(400)
  })

  it('refuse une demande sur-mesure incomplète', async () => {
    const res = await api()
      .post('/api/custom-request')
      .field('nom', 'Martin')
      .field('email', 'pas-une-adresse')

    expect(res.status).toBe(400)
  })

  it('refuse un type de vêtement inconnu', async () => {
    const res = await api()
      .post('/api/custom-request')
      .field('nom', 'Martin')
      .field('prenom', 'Camille')
      .field('email', 'camille@incloz.fr')
      .field('telephone', '0600000000')
      .field('typeVetement', 'combinaison-spatiale')

    expect(res.status).toBe(400)
  })

  it('accepte une demande sur-mesure valide', async () => {
    const res = await api()
      .post('/api/custom-request')
      .field('nom', 'Martin')
      .field('prenom', 'Camille')
      .field('email', 'camille@incloz.fr')
      .field('telephone', '0600000000')
      .field('typeVetement', 'tshirt')
      .field('taille', '175')

    expect(res.status).toBe(201)
  })
})

describe('Erreurs mal typées', () => {
  // Renvoyait un 500 avec une trace de pile.
  it('renvoie 404 sur un identifiant de produit malformé', async () => {
    const res = await api().get('/api/products/pas-un-objectid')
    expect(res.status).toBe(404)
  })

  it('renvoie 404 sur une route inconnue', async () => {
    const res = await api().get('/api/nexiste-pas')
    expect(res.status).toBe(404)
  })
})
