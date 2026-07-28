import express from 'express'
import {
  getAdaptations,
  getAdaptationById,
  createAdaptation,
  deleteAdaptation,
  updateAdaptation,
} from '../controllers/adaptationController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

const router = express.Router()

router.route('/')
  .get(getAdaptations)
  .post(protect, admin, createAdaptation)

router.route('/:id')
  .get(getAdaptationById)
  .delete(protect, admin, deleteAdaptation)
  .put(protect, admin, updateAdaptation)

export default router
