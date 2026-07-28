import path from 'path'

const root = path.resolve()

/**
 * Visuels du catalogue. Servis en statique : ils sont publics par nature.
 */
export const PUBLIC_UPLOADS_DIR = path.join(root, 'uploads')

/**
 * Pièces jointes des demandes sur-mesure. Ce dossier n'est jamais servi en
 * statique : les photos y côtoient des mensurations corporelles et ne doivent
 * sortir que par une route authentifiée.
 */
export const PRIVATE_UPLOADS_DIR = path.join(root, 'private-uploads')

/**
 * Résout un nom de fichier dans le dossier privé en refusant tout ce qui
 * s'échapperait du dossier (`../`, chemin absolu). Le nom vient de la base et
 * a été généré par multer, mais une donnée qui sort de la base et retourne
 * dans un accès disque mérite d'être revalidée.
 */
export const resolvePrivateUpload = (filename) => {
  if (!filename) return null

  const resolved = path.resolve(PRIVATE_UPLOADS_DIR, path.basename(filename))
  return resolved.startsWith(PRIVATE_UPLOADS_DIR + path.sep) ? resolved : null
}
