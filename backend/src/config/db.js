import mongoose from 'mongoose'
// `colors` agit en modifiant String.prototype : sans cet import, les `.cyan`
// et `.red` ci-dessous valent undefined et lèvent une TypeError. Le module en
// dépendait sans jamais le charger — cela ne se voyait pas, parce que
// server.js l'importait juste avant. Le premier autre point d'entrée à appeler
// connectDB, le script de purge, a planté aussitôt, y compris sur le chemin
// où la connexion réussissait.
import 'colors'

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

