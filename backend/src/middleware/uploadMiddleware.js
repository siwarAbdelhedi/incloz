import multer from 'multer'
import cloudinary from '../config/cloudinaryConfig.js'

// Le visuel transite par la mémoire du processus puis part vers Cloudinary :
// il ne touche jamais le disque du serveur.
//
// C'est ce que faisait `multer-storage-cloudinary`, retiré ici. Ce paquet n'a
// pas été republié depuis 2022 et déclarait `cloudinary ^1.21.0` en dépendance
// de pair : il maintenait donc le SDK sur une branche 1.x portant un avis
// d'injection d'arguments, sans possibilité de la quitter. Cloudinary sait
// faire nativement ce que l'adaptateur enveloppait.
const upload = multer({
  storage: multer.memoryStorage(),
  // Sans plafond, un envoi unique pouvait saturer la mémoire du processus.
  // Un dépassement produit une MulterError, que le gestionnaire d'erreurs
  // traduit déjà en 400.
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})

/**
 * Pousse un fichier reçu en mémoire vers Cloudinary et résout avec la réponse
 * du service. Les options reprennent exactement celles de l'adaptateur
 * remplacé : même dossier, même conversion en PNG, même forme d'identifiant.
 *
 * `resource_type` vaut « image » par défaut : un fichier qui n'en est pas un
 * est refusé par Cloudinary, comme avant.
 */
export const envoyerSurCloudinary = (fichier) =>
  new Promise((resolve, reject) => {
    const flux = cloudinary.uploader.upload_stream(
      {
        folder: 'incloz_uploads',
        format: 'png',
        public_id: `${fichier.fieldname}-${Date.now()}`,
      },
      (erreur, resultat) => (erreur ? reject(erreur) : resolve(resultat))
    )

    flux.end(fichier.buffer)
  })

export default upload
