import { describe, it, expect } from 'vitest'
import express from 'express'
import request from 'supertest'
import { createRateLimiter } from '../src/middleware/rateLimiters.js'

// Les limiteurs de l'application tournent avec des plafonds très hauts pendant
// les tests, pour ne pas gêner les appels légitimes des autres suites. On
// vérifie donc le comportement de limitation sur une app dédiée, avec un
// plafond bas — la fabrique testée ici est exactement celle qu'utilise l'API.
const appAvecLimite = (max) => {
  const app = express()
  app.use(
    createRateLimiter({ windowMs: 60000, max, message: 'Trop de tentatives' })
  )
  app.get('/', (req, res) => res.json({ ok: true }))
  return app
}

describe('Limitation de débit', () => {
  it('laisse passer les requêtes sous le plafond', async () => {
    const app = appAvecLimite(3)

    for (let i = 0; i < 3; i++) {
      expect((await request(app).get('/')).status).toBe(200)
    }
  })

  it('renvoie 429 au-delà du plafond', async () => {
    const app = appAvecLimite(3)

    for (let i = 0; i < 3; i++) await request(app).get('/')

    const res = await request(app).get('/')
    expect(res.status).toBe(429)
    expect(res.body.message).toBe('Trop de tentatives')
  })

  it('annonce le quota restant dans les en-têtes', async () => {
    const app = appAvecLimite(5)
    const res = await request(app).get('/')

    expect(res.headers['ratelimit-remaining']).toBe('4')
  })
})
