import express from 'express'
import { createCustomRequest } from '../controllers/customRequestController.js'
import multer from 'multer'
import path from 'path'

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
    cb('Images et PDF uniquement')
  }
}

const upload = multer({ storage, fileFilter })

// Route POST avec fichier
router.post('/', upload.single('photos'), createCustomRequest)

export default router
