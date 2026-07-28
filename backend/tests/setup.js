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

beforeAll(async () => {
  mongod = await MongoMemoryServer.create()
  await mongoose.connect(mongod.getUri(), {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  })
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
