import express from 'express'
const router = express.Router()
import {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
} from '../controllers/userController.js'
import { protect, admin } from '../middleware/authMiddleware.js'
import { authLimiter } from '../middleware/rateLimiters.js'
import validate from '../middleware/validate.js'
import {
  registerRules,
  loginRules,
  updateProfileRules,
  updateUserRules,
} from '../validators/userValidators.js'

router
  .route('/')
  .post(authLimiter, registerRules, validate, registerUser)
  .get(protect, admin, getUsers)

router.post('/login', authLimiter, loginRules, validate, authUser)

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateProfileRules, validate, updateUserProfile)

router
  .route('/:id')
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUserRules, validate, updateUser)

export default router
