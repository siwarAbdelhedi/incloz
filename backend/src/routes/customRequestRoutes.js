import express from 'express'
import { createCustomRequest } from '../controllers/customRequestController.js'
import multer from 'multer'
import path from 'path'
import { formLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import { customRequestRules } from '../validators/customRequestValidators.js'

const router = express.Router()

// Configuration du stockage pour multer
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/')
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    )
  },
})

// Vérification du type de fichier
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf/
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
  const mimetype = allowedTypes.test(file.mimetype)

  if (extname && mimetype) {
    cb(null, true)
  } else {
    // multer attend une Error : lui passer une chaîne produisait un 500 opaque
    // au lieu d'un refus lisible côté client.
    cb(new Error('Images et PDF uniquement'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  // Sans plafond, un envoi unique peut saturer le disque du serveur.
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
})

router.post(
  '/',
  formLimiter,
  upload.single('photos'),
  customRequestRules,
  validate,
  createCustomRequest
)

export default router
