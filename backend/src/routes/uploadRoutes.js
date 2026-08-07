import express from 'express';
import asyncHandler from 'express-async-handler';
import upload, { envoyerSurCloudinary } from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cette route pousse directement sur le compte Cloudinary du projet. Elle était
// ouverte à tout Internet : n'importe qui pouvait y déposer des fichiers, au
// frais du projet et sous son domaine. Aucun écran du front ne l'appelle ; elle
// sert d'outil d'administration pour les visuels produits, d'où protect + admin.
// L'envoi vers Cloudinary se fait ici plutôt que dans un moteur de stockage
// multer : le fichier arrive en mémoire, la route décide quoi en faire. La
// réponse garde la même forme qu'avant — { url } — pour ne rien casser côté
// appelant.
router.post(
  '/',
  protect,
  admin,
  upload.single('file'),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const resultat = await envoyerSurCloudinary(req.file);
    res.json({ url: resultat.secure_url });
  })
);

export default router;
