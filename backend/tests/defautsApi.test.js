import { describe, it, expect, afterEach } from 'vitest'
import express from 'express'
import request from 'supertest'
import { api, createUser, auth } from './helpers.js'
import User from '../src/models/userModel.js'
import Product from '../src/models/productModel.js'
import { createRateLimiter } from '../src/middleware/rateLimiters.js'

// Chacun de ces cas correspond à un défaut constaté sur l'API et reproduit
// avant correction. Ils sont ici pour qu'il ne puisse pas revenir.

describe("Trace d'exécution dans les réponses d'erreur", () => {
  const valeurInitiale = process.env.NODE_ENV

  afterEach(() => {
    process.env.NODE_ENV = valeurInitiale
  })

  // Le test portait sur `!== 'production'`. Une variable oubliée au
  // déploiement suffisait donc à exposer les chemins du serveur.
  it("ne sort pas quand NODE_ENV n'est pas renseignée", async () => {
    delete process.env.NODE_ENV

    const res = await api().get('/api/users/profile')

    expect(res.status).toBe(401)
    expect(res.body.stack).toBeNull()
  })

  it("ne sort pas non plus sur une valeur inattendue", async () => {
    process.env.NODE_ENV = 'prod'

    const res = await api().get('/api/users/profile')

    expect(res.body.stack).toBeNull()
  })

  it('reste disponible en développement', async () => {
    process.env.NODE_ENV = 'development'

    const res = await api().get('/api/users/profile')

    expect(res.body.stack).toBeTruthy()
  })
})

describe('Limitation de débit et en-tête X-Forwarded-For', () => {
  // Reconstruit la configuration de src/app.js : sans TRUST_PROXY, l'API ne
  // doit croire aucun en-tête. Auparavant `trust proxy` valait 1 en dur, et il
  // suffisait de faire tourner l'en-tête pour n'être jamais limité.
  const appDeTest = () => {
    const app = express()
    app.set('trust proxy', Number(process.env.TRUST_PROXY) || 0)
    app.use(createRateLimiter({ windowMs: 60000, max: 3, message: 'stop' }))
    app.post('/login', (req, res) => res.json({ ok: true }))
    return app
  }

  const compteLesRefus = async (app, enTete) => {
    let refusees = 0
    for (let i = 0; i < 10; i++) {
      const req = request(app).post('/login')
      if (enTete) req.set('X-Forwarded-For', `203.0.113.${i}`)
      if ((await req.send({})).status === 429) refusees++
    }
    return refusees
  }

  it('limite un appelant qui ne triche pas', async () => {
    expect(await compteLesRefus(appDeTest(), false)).toBe(7)
  })

  it("limite aussi un appelant qui fait tourner l'en-tête", async () => {
    expect(await compteLesRefus(appDeTest(), true)).toBe(7)
  })

  // L'inverse doit rester vrai, sinon la variable ne servirait à rien : avec
  // un reverse proxy déclaré, l'en-tête qu'il pose distingue bien les
  // visiteurs les uns des autres.
  it("distingue les visiteurs quand un proxy est déclaré", async () => {
    const avant = process.env.TRUST_PROXY
    process.env.TRUST_PROXY = '1'

    try {
      expect(await compteLesRefus(appDeTest(), true)).toBe(0)
    } finally {
      if (avant === undefined) delete process.env.TRUST_PROXY
      else process.env.TRUST_PROXY = avant
    }
  })
})

describe('PUT /api/users/:id', () => {
  // Le champ isAdmin était affecté sans condition : un corps qui ne le
  // contenait pas le passait à undefined, et la validation du schéma
  // renvoyait un 500.
  it('accepte un corps sans isAdmin', async () => {
    const { token } = await createUser({ email: 'chef@incloz.fr', admin: true })
    const { user } = await createUser({ email: 'membre@incloz.fr' })

    const res = await api()
      .put(`/api/users/${user._id}`)
      .set(...auth(token))
      .send({ name: 'Nouveau nom' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Nouveau nom')
    expect(res.body.isAdmin).toBe(false)
  })

  it('permet toujours de retirer les droits (isAdmin: false)', async () => {
    const { token } = await createUser({ email: 'chef@incloz.fr', admin: true })
    const { user } = await createUser({ email: 'promu@incloz.fr', admin: true })

    const res = await api()
      .put(`/api/users/${user._id}`)
      .set(...auth(token))
      .send({ isAdmin: false })

    expect(res.status).toBe(200)
    expect(res.body.isAdmin).toBe(false)
  })

  it('refuse un isAdmin qui n’est pas un booléen', async () => {
    const { token } = await createUser({ email: 'chef@incloz.fr', admin: true })
    const { user } = await createUser({ email: 'membre@incloz.fr' })

    const res = await api()
      .put(`/api/users/${user._id}`)
      .set(...auth(token))
      .send({ isAdmin: 'oui' })

    expect(res.status).toBe(400)
  })
})

describe("Unicité de l'adresse e-mail", () => {
  it('refuse une adresse déjà portée par un autre compte', async () => {
    await createUser({ email: 'occupe@incloz.fr' })
    const { token } = await createUser({ email: 'moi@incloz.fr' })

    const res = await api()
      .put('/api/users/profile')
      .set(...auth(token))
      .send({ email: 'occupe@incloz.fr' })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/déjà utilisée/i)
    expect(await User.countDocuments({ email: 'occupe@incloz.fr' })).toBe(1)
  })

  // Renvoyer sa propre adresse n'est pas un conflit : le formulaire de profil
  // repostera l'adresse inchangée à chaque modification du nom.
  it('laisse réenregistrer sa propre adresse', async () => {
    const { token } = await createUser({ email: 'moi@incloz.fr' })

    const res = await api()
      .put('/api/users/profile')
      .set(...auth(token))
      .send({ name: 'Autre nom', email: 'moi@incloz.fr' })

    expect(res.status).toBe(200)
    expect(res.body.name).toBe('Autre nom')
  })

  it("s'applique aussi à la modification par un administrateur", async () => {
    const { token } = await createUser({ email: 'chef@incloz.fr', admin: true })
    await createUser({ email: 'occupe@incloz.fr' })
    const { user } = await createUser({ email: 'membre@incloz.fr' })

    const res = await api()
      .put(`/api/users/${user._id}`)
      .set(...auth(token))
      .send({ email: 'occupe@incloz.fr' })

    expect(res.status).toBe(400)
  })
})

describe('POST /api/cart', () => {
  const creerProduit = () =>
    Product.create({
      title: 'T-shirt Fitness',
      description: 'T-shirt en coton.',
      image: 'tshirt.png',
      price: 29.9,
    })

  it('enregistre un ajout valide', async () => {
    const { token } = await createUser({ email: 'client@incloz.fr' })
    const produit = await creerProduit()

    const res = await api()
      .post('/api/cart')
      .set(...auth(token))
      .send({ productId: produit._id, size: 'M', adaptation: 'pression', quantity: 2 })

    expect(res.status).toBe(201)
    expect(res.body.products[0].quantity).toBe(2)
  })

  // Une quantité négative était acceptée et enregistrée telle quelle.
  it('refuse une quantité négative', async () => {
    const { token } = await createUser({ email: 'client@incloz.fr' })
    const produit = await creerProduit()

    const res = await api()
      .post('/api/cart')
      .set(...auth(token))
      .send({ productId: produit._id, size: 'M', adaptation: 'pression', quantity: -50 })

    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/quantité/i)
  })

  // Un identifiant bien formé mais absent du catalogue passait sans broncher.
  it('refuse un produit qui n’existe pas', async () => {
    const { token } = await createUser({ email: 'client@incloz.fr' })

    const res = await api()
      .post('/api/cart')
      .set(...auth(token))
      .send({
        productId: '507f1f77bcf86cd799439011',
        size: 'M',
        adaptation: 'pression',
      })

    expect(res.status).toBe(404)
  })

  it('refuse une adaptation inconnue', async () => {
    const { token } = await createUser({ email: 'client@incloz.fr' })
    const produit = await creerProduit()

    const res = await api()
      .post('/api/cart')
      .set(...auth(token))
      .send({ productId: produit._id, size: 'M', adaptation: 'scratch' })

    expect(res.status).toBe(400)
  })

  it('plafonne le cumul des ajouts successifs', async () => {
    const { token } = await createUser({ email: 'client@incloz.fr' })
    const produit = await creerProduit()
    const ligne = { productId: produit._id, size: 'M', adaptation: 'pression', quantity: 99 }

    await api().post('/api/cart').set(...auth(token)).send(ligne)
    const res = await api().post('/api/cart').set(...auth(token)).send(ligne)

    expect(res.body.products[0].quantity).toBe(99)
  })
})
