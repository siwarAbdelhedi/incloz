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

// Derrière un reverse proxy, express-rate-limit voit l'IP du proxy pour tout
// le monde et limite tous les visiteurs ensemble : il faut alors lui dire de
// lire X-Forwarded-For.
//
// Mais cette confiance était accordée sans condition, y compris quand l'API
// est jointe directement — ce qui est le cas de la stack de développement, qui
// publie le port 5000. L'appelant choisissait alors son identité : en faisant
// tourner l'en-tête, la limitation ne comptait plus rien. Mesuré avec un
// plafond à 3 : 10 requêtes, 7 refusées sans l'en-tête, aucune avec.
//
// La confiance est donc explicite et vient du déploiement. TRUST_PROXY vaut le
// nombre de proxies traversés — 1 pour un nginx en frontal. Non renseignée,
// elle vaut 0 : aucun en-tête n'est cru, et la limitation s'applique sur l'IP
// réelle de la connexion.
app.set('trust proxy', Number(process.env.TRUST_PROXY) || 0)

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
//
// helmet() pose `Cross-Origin-Resource-Policy: same-origin` sur toutes les
// réponses. Or le site et l'API sont sur deux domaines distincts
// (incloz.com et api.incloz.com, cf. la liste CORS ci-dessus) : le navigateur
// refusait donc de charger les visuels produit, et le catalogue s'affichait
// sans aucune image. Le durcissement ajouté avec helmet avait rendu ce dossier
// inutilisable sans que rien ne le signale — ni erreur serveur, ni requête en
// échec, seulement des images vides.
//
// La politique n'est ouverte que pour ce dossier, qui ne contient que des
// visuels publics destinés à être affichés par le site. Toutes les autres
// réponses de l'API conservent `same-origin`.
app.use(
  '/uploads',
  helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }),
  express.static(PUBLIC_UPLOADS_DIR)
)

app.get('/', (req, res) => {
  res.send('incloz API is running....')
})

app.use(notFound)
app.use(errorHandler)

export default app
