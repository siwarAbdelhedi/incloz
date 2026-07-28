import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/userModel.js'

const protect = asyncHandler(async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }

  const token = authorization.split(' ')[1]

  let decoded
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET)
  } catch (error) {
    console.error(error)
    res.status(401)
    throw new Error('Not authorized, token failed')
  }

  // Un jeton peut rester valide après la suppression du compte : sans ce
  // garde-fou, req.user vaut null et les handlers plantent sur req.user._id.
  const user = await User.findById(decoded.id).select('-password')

  if (!user) {
    res.status(401)
    throw new Error('Not authorized, user no longer exists')
  }

  req.user = user
  next()
})

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as an admin')
  }
}

export { protect, admin }
