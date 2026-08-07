import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import {
  createCustomRequest,
  getCustomRequests,
  getCustomRequestById,
  getCustomRequestPhoto,
  deleteCustomRequest,
} from '../controllers/customRequestController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { formLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import { customRequestRules } from '../validators/customRequestValidators.js'
import { PRIVATE_UPLOADS_DIR } from '../config/paths.js'

const router = express.Router()

fs.mkdirSync(PRIVATE_UPLOADS_DIR, { recursive: true })

// Destination hors du dossier servi en statique : ces photos accompagnent des
// mensurations corporelles et ne sortent que par la route protégée
// GET /:id/photo. Elles atterrissaient auparavant dans uploads/, exposé sur
// Internet avec des noms de fichiers énumérables.
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, PRIVATE_UPLOADS_DIR)
  },
  filename(req, file, cb) {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
  },
})

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

router
  .route('/')
  .post(
    formLimiter,
    upload.single('photos'),
    customRequestRules,
    validate,
    createCustomRequest
  )
  .get(protect, admin, getCustomRequests)

router
  .route('/:id')
  .get(protect, admin, getCustomRequestById)
  .delete(protect, admin, deleteCustomRequest)

router.get('/:id/photo', protect, admin, getCustomRequestPhoto)

export default router
