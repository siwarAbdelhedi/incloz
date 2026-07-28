import request from 'supertest'
import app from '../src/app.js'
import User from '../src/models/userModel.js'

export const api = () => request(app)

/**
 * Crée un compte via l'API et renvoie { user, token }.
 * Passer { admin: true } pour promouvoir le compte puis re-générer un jeton :
 * aucun endpoint public ne permet de devenir administrateur, c'est voulu.
 */
export const createUser = async ({
  name = 'Test User',
  email = 'test@incloz.fr',
  password = 'Motdepasse123',
  admin = false,
} = {}) => {
  const res = await api().post('/api/users').send({ name, email, password })

  if (!admin) {
    return { user: res.body, token: res.body.token }
  }

  await User.updateOne({ email }, { $set: { isAdmin: true } })
  const login = await api().post('/api/users/login').send({ email, password })
  return { user: login.body, token: login.body.token }
}

export const auth = (token) => ['Authorization', `Bearer ${token}`]
