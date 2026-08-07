import fs from 'fs/promises'
import CustomRequest from '../models/customRequestModel.js'
import { resolvePrivateUpload } from '../config/paths.js'

/**
 * Supprime les demandes sur-mesure arrivées au terme de leur durée de
 * conservation, ainsi que leurs pièces jointes.
 *
 * Un index TTL de MongoDB aurait suffi à effacer les fiches, mais il ignore le
 * système de fichiers : les photos seraient restées sur le disque, orphelines
 * et sans rien pour les rattacher à une demande — c'est-à-dire dans un état
 * pire qu'avant, puisque plus rien n'aurait indiqué qu'elles doivent partir.
 * La photo est donc supprimée d'abord, la fiche ensuite.
 *
 * Si la photo ne peut pas être supprimée, la fiche est conservée : elle est le
 * seul lien qui permettra de retrouver le fichier au prochain passage. Une
 * photo déjà absente n'est en revanche pas une erreur.
 *
 * @returns {Promise<{fiches: number, photos: number, echecs: Array<{id: string, raison: string}>}>}
 */
export const purgerDemandesExpirees = async (maintenant = new Date()) => {
  const expirees = await CustomRequest.find({ expireLe: { $lte: maintenant } })

  const bilan = { fiches: 0, photos: 0, echecs: [] }

  for (const demande of expirees) {
    if (demande.photos) {
      const chemin = resolvePrivateUpload(demande.photos)

      if (!chemin) {
        bilan.echecs.push({
          id: String(demande._id),
          raison: `nom de fichier refusé : ${demande.photos}`,
        })
        continue
      }

      try {
        await fs.unlink(chemin)
        bilan.photos += 1
      } catch (erreur) {
        // Fichier déjà absent : la conservation a bien pris fin, on continue.
        if (erreur.code !== 'ENOENT') {
          bilan.echecs.push({ id: String(demande._id), raison: erreur.message })
          continue
        }
      }
    }

    await demande.deleteOne()
    bilan.fiches += 1
  }

  return bilan
}

export default purgerDemandesExpirees
