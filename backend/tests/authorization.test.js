import { describe, it, expect } from 'vitest'
import { api, createUser, auth } from './helpers.js'
import Product from '../src/models/productModel.js'

const unProduit = {
  title: 'T-shirt Fitness',
  description: 'T-shirt en coton',
  price: 29.9,
  image: 'tshirt.png',
}

describe('Produits', () => {
  it('expose le catalogue publiquement', async () => {
    await Product.create(unProduit)
    const res = await api().get('/api/products')

    expect(res.status).toBe(200)
    expect(res.body).toHaveLength(1)
  })

  it('expose une fiche produit publiquement', async () => {
    const produit = await Product.create(unProduit)
    const res = await api().get(`/api/products/${produit._id}`)

    expect(res.status).toBe(200)
    expect(res.body.title).toBe('T-shirt Fitness')
  })

  it('renvoie 404 sur un produit inexistant', async () => {
    const res = await api().get('/api/products/60a0000000000000000000ff')
    expect(res.status).toBe(404)
  })

  // Régression : la route était ouverte, n'importe qui pouvait remplir le
  // catalogue.
  it('refuse la création sans authentification', async () => {
    const res = await api().post('/api/products').send(unProduit)

    expect(res.status).toBe(401)
    expect(await Product.countDocuments()).toBe(0)
  })

  it('refuse la création à un utilisateur non administrateur', async () => {
    const { token } = await createUser({ email: 'simple@incloz.fr' })
    const res = await api()
      .post('/api/products')
      .set(...auth(token))
      .send(unProduit)

    expect(res.status).toBe(403)
    expect(await Product.countDocuments()).toBe(0)
  })

  it('autorise la création à un administrateur', async () => {
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })
    const res = await api()
      .post('/api/products')
      .set(...auth(token))
      .send(unProduit)

    expect(res.status).toBe(201)
    expect(await Product.countDocuments()).toBe(1)
  })
})

describe('Liste des comptes', () => {
  it('refuse un utilisateur non administrateur', async () => {
    const { token } = await createUser({ email: 'simple@incloz.fr' })
    const res = await api()
      .get('/api/users')
      .set(...auth(token))

    expect(res.status).toBe(403)
  })

  // Régression : la réponse contenait les hashs bcrypt de tous les comptes.
  it('ne renvoie jamais les mots de passe à un administrateur', async () => {
    const { token } = await createUser({ email: 'admin@incloz.fr', admin: true })
    await createUser({ email: 'autre@incloz.fr' })

    const res = await api()
      .get('/api/users')
      .set(...auth(token))

    expect(res.status).toBe(200)
    expect(res.body.length).toBeGreaterThan(1)
    for (const user of res.body) {
      expect(user.password).toBeUndefined()
    }
  })
})

describe('Panier', () => {
  it('exige une authentification en lecture', async () => {
    expect((await api().get('/api/cart')).status).toBe(401)
  })

  it('exige une authentification en écriture', async () => {
    const res = await api().post('/api/cart').send({ productId: 'x' })
    expect(res.status).toBe(401)
  })

  it('ajoute un produit au panier de l’utilisateur connecté', async () => {
    const { token } = await createUser({ email: 'panier@incloz.fr' })
    const produit = await Product.create(unProduit)

    const ajout = await api()
      .post('/api/cart')
      .set(...auth(token))
      .send({ productId: produit._id, size: 'M', adaptation: 'pression', quantity: 2 })
    expect(ajout.status).toBe(201)

    const panier = await api()
      .get('/api/cart')
      .set(...auth(token))
    expect(panier.status).toBe(200)
    expect(panier.body.products).toHaveLength(1)
    expect(panier.body.products[0].quantity).toBe(2)
  })

  it('ne laisse pas voir le panier d’un autre utilisateur', async () => {
    const alice = await createUser({ email: 'alice@incloz.fr' })
    const bob = await createUser({ email: 'bob@incloz.fr' })
    const produit = await Product.create(unProduit)

    await api()
      .post('/api/cart')
      .set(...auth(alice.token))
      .send({ productId: produit._id, size: 'M', adaptation: 'pression', quantity: 1 })

    const res = await api()
      .get('/api/cart')
      .set(...auth(bob.token))
    expect(res.status).toBe(404)
  })
})
