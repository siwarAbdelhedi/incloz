import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import helmet from 'helmet'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import { apiLimiter } from './middleware/rateLimiters.js'
import { PUBLIC_UPLOADS_DIR } from './config/paths.js'

import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import customRequestRoutes from './routes/customRequestRoutes.js'

// Cette application est volontairement découplée de la connexion à MongoDB et
// de app.listen() : server.js s'occupe du câblage runtime, et les tests
// peuvent instancier l'API contre une base éphémère sans ouvrir de port.
const app = express()

// L'API est derrière un reverse proxy en production : sans ça, express-rate-limit
// voit l'IP du proxy pour tout le monde et limite tous les visiteurs ensemble.
app.set('trust proxy', 1)

app.use(helmet())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://incloz.com',
      'https://www.incloz.com',
    ],
    credentials: true,
  })
)

// Corps JSON plafonné : sans limite, express accepte des charges arbitraires.
app.use(express.json({ limit: '100kb' }))

app.use('/api', apiLimiter)

app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/custom-request', customRequestRoutes)

// Uniquement les visuels du catalogue. Les pièces jointes des demandes
// sur-mesure vivent dans private-uploads/, qui n'est volontairement pas ici.
app.use('/uploads', express.static(PUBLIC_UPLOADS_DIR))

app.get('/', (req, res) => {
  res.send('incloz API is running....')
})

app.use(notFound)
app.use(errorHandler)

export default app
