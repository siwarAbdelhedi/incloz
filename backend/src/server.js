// Doit rester le tout premier import : les modules chargés ensuite (app.js et
// sa chaîne de dépendances) lisent process.env dès leur évaluation.
import 'dotenv/config'
import colors from 'colors'
import connectDB from './config/db.js'
import app from './app.js'

connectDB()

const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold
  )
)
