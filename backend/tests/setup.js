import { beforeAll, afterAll, afterEach } from 'vitest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// Les tests tournent contre une instance MongoDB éphémère, démarrée en mémoire.
// Aucune base réelle n'est touchée et rien n'est à installer localement.
let mongod

// Doit être défini avant que les modules applicatifs ne soient importés :
// generateToken et authMiddleware lisent process.env.JWT_SECRET.
process.env.JWT_SECRET = 'secret_de_test'
process.env.NODE_ENV = 'test'

// Les limiteurs restent actifs mais avec des plafonds hauts : la suite fait
// beaucoup d'appels d'authentification légitimes. Le comportement de limitation
// lui-même est testé à part, dans rateLimit.test.js, sur une app dédiée.
process.env.RATE_LIMIT_AUTH_MAX = '100000'
process.env.RATE_LIMIT_FORM_MAX = '100000'
process.env.RATE_LIMIT_GLOBAL_MAX = '100000'

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri())
})

afterEach(async () => {
  // Chaque test repart d'une base vide : pas d'ordre implicite entre les tests.
  const { collections } = mongoose.connection
  await Promise.all(Object.values(collections).map((c) => c.deleteMany({})))
})

afterAll(async () => {
  await mongoose.connection.close()
  await mongod?.stop()
})
