// Supprime les demandes sur-mesure arrivées au terme de leur conservation.
//
//   npm --prefix backend run purge:demandes
//
// À faire tourner régulièrement — une fois par jour suffit. Tant qu'aucune
// planification n'est en place, la durée annoncée aux visiteurs par la
// politique de confidentialité n'est pas tenue : c'est le lancement de ce
// script qui la rend vraie, pas son existence.
//
// Exemple d'entrée cron, à adapter au déploiement :
//   0 3 * * *  cd /chemin/vers/incloz/backend && npm run purge:demandes
import 'dotenv/config'
import mongoose from 'mongoose'
import connectDB from '../config/db.js'
import { purgerDemandesExpirees } from '../services/purgeDemandes.js'
import { DUREE_CONSERVATION_MOIS } from '../config/conservation.js'

await connectDB()

try {
  const bilan = await purgerDemandesExpirees()

  console.log(
    `Purge des demandes de plus de ${DUREE_CONSERVATION_MOIS} mois : ` +
      `${bilan.fiches} fiche(s) et ${bilan.photos} photo(s) supprimées.`
  )

  if (bilan.echecs.length > 0) {
    console.error(
      `${bilan.echecs.length} demande(s) conservée(s), leur photo n'ayant pas pu être supprimée :`
    )
    bilan.echecs.forEach(({ id, raison }) => console.error(`  ${id} — ${raison}`))
  }

  await mongoose.connection.close()
  // Une purge partielle doit se voir : un ordonnanceur ne lit que le code de
  // sortie, et un échec silencieux laisserait des données au-delà du terme.
  process.exit(bilan.echecs.length > 0 ? 1 : 0)
} catch (erreur) {
  console.error(`Échec de la purge : ${erreur.message}`)
  await mongoose.connection.close()
  process.exit(1)
}
