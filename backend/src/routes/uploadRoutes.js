import express from 'express';
import upload from '../middleware/uploadMiddleware.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Cette route pousse directement sur le compte Cloudinary du projet. Elle était
// ouverte à tout Internet : n'importe qui pouvait y déposer des fichiers, au
// frais du projet et sous son domaine. Aucun écran du front ne l'appelle ; elle
// sert d'outil d'administration pour les visuels produits, d'où protect + admin.
router.post('/', protect, admin, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ url: req.file.path });
});

export default router;
