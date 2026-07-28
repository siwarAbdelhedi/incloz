import path from 'path'
import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import morgan from 'morgan'
import cors from 'cors'
import connectDB from './config/db.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

import userRoutes from './routes/userRoutes.js'
import productRoutes from './routes/productRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import customRequestRoutes from './routes/customRequestRoutes.js'

// import orderRoutes from './routes/orderRoutes.js'

dotenv.config()
connectDB()

const app = express()

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'))
}

app.use(express.json())

app.use(cors({
  origin: ['http://localhost:5173', 'https://incloz.com', 'https://www.incloz.com'],
  credentials: true
}));

// Routes
app.use('/api/users', userRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/custom-request', customRequestRoutes)
// app.use('/api/orders', orderRoutes)


const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))

// Static files for production

  app.get('/', (req, res) => {
    res.send('incloz API is running....')
  }
  ) 

// Error handling
app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold)
)
