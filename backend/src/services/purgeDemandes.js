import fs from 'fs/promises'
import CustomRequest from '../models/customRequestModel.js'
import { resolvePrivateUpload } from '../config/paths.js'

/**
 * Efface une demande sur-mesure et sa pièce jointe.
 *
 * L'ordre n'est pas indifférent : la photo part d'abord, la fiche ensuite. Un
 * index TTL de MongoDB aurait suffi à effacer les fiches, mais il ignore le
 * système de fichiers — les photos seraient restées sur le disque, orphelines
 * et sans rien pour les rattacher à une demande, c'est-à-dire dans un état pire
 * qu'avant puisque plus rien n'aurait indiqué qu'elles doivent partir.
 *
 * Si la photo ne peut pas être supprimée, la fonction lève et la fiche est
 * conservée : elle est le seul lien qui permettra de retrouver le fichier plus
 * tard. Une photo déjà absente n'est en revanche pas une erreur — le résultat
 * recherché est atteint.
 *
 * @returns {Promise<{photoSupprimee: boolean}>}
 */
export const supprimerDemande = async (demande) => {
  let photoSupprimee = false

  if (demande.photos) {
    const chemin = resolvePrivateUpload(demande.photos)

    if (!chemin) {
      throw new Error(`nom de fichier refusé : ${demande.photos}`)
    }

    try {
      await fs.unlink(chemin)
      photoSupprimee = true
    } catch (erreur) {
      if (erreur.code !== 'ENOENT') throw erreur
    }
  }

  await demande.deleteOne()

  return { photoSupprimee }
}

/**
 * Supprime les demandes arrivées au terme de leur durée de conservation.
 *
 * Une demande dont l'effacement échoue n'interrompt pas les suivantes : elle
 * est reportée au bilan et retentée au prochain passage.
 *
 * @returns {Promise<{fiches: number, photos: number, echecs: Array<{id: string, raison: string}>}>}
 */
export const purgerDemandesExpirees = async (maintenant = new Date()) => {
  const expirees = await CustomRequest.find({ expireLe: { $lte: maintenant } })

  const bilan = { fiches: 0, photos: 0, echecs: [] }

  for (const demande of expirees) {
    try {
      const { photoSupprimee } = await supprimerDemande(demande)

      if (photoSupprimee) bilan.photos += 1
      bilan.fiches += 1
    } catch (erreur) {
      bilan.echecs.push({ id: String(demande._id), raison: erreur.message })
    }
  }

  return bilan
}

export default purgerDemandesExpirees
