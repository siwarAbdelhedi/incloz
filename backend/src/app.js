import path from 'path'
import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import customRequestRoutes from './routes/customRequestRoutes.js'

// Cette application est volontairement découplée de la connexion à MongoDB et
// de app.listen() : server.js s'occupe du câblage runtime, et les tests
// peuvent instancier l'API contre une base éphémère sans ouvrir de port.
const app = express()

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

app.use(express.json())

app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/custom-request', customRequestRoutes)

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

app.get('/', (req, res) => {
  res.send('incloz API is running....')
})

app.use(notFound)
app.use(errorHandler)

export default app
