import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    // `useNewUrlParser` et `useUnifiedTopology` ont disparu avec Mongoose 6 :
    // leur comportement est devenu celui par défaut, et les passer encore
    // fait désormais échouer la connexion au lieu d'être ignoré.
    const conn = await mongoose.connect(process.env.MONGO_URI)

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
  } catch (error) {
    console.error(`Error: ${error.message}`.red.underline.bold)
    process.exit(1)
  }
}

export default connectDB

