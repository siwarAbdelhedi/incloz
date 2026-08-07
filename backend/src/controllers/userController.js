import asyncHandler from 'express-async-handler'
import generateToken from '../utils/generateToken.js'
import User from '../models/userModel.js'

/**
 * Refuse une adresse déjà portée par un autre compte.
 *
 * Le schéma déclare bien `unique: true`, mais c'est une consigne de création
 * d'index, pas une validation : selon que l'index a pu être construit ou non,
 * la même requête produisait soit deux comptes avec la même adresse — et la
 * connexion ne retrouve alors jamais que le premier — soit une erreur MongoDB
 * brute ressortie en 500. Aucune des deux n'est le comportement attendu.
 *
 * L'index reste le filet de dernier recours pour les écritures concurrentes ;
 * le gestionnaire d'erreurs traduit sa violation en 400.
 */
const refuseSiEmailPris = async (res, email, idDuCompte) => {
  if (!email) return

  const autre = await User.findOne({ email })

  if (autre && !autre._id.equals(idDuCompte)) {
    res.status(400)
    throw new Error('Cette adresse e-mail est déjà utilisée')
  }
}

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  const user = await User.findOne({ email })

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body

  const userExists = await User.findOne({ email })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }

  const user = await User.create({
    name,
    email,
    password,
  })

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    await refuseSiEmailPris(res, req.body.email, user._id)

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email
    if (req.body.password) {
      user.password = req.body.password
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password')
  res.json(users)
})

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    // `remove()` sur un document a disparu avec Mongoose 7, remplacé par
    // `deleteOne()`. Sans ce changement, la suppression levait un TypeError
    // et ressortait en 500.
    await user.deleteOne()
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (user) {
    res.json(user)
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (user) {
    await refuseSiEmailPris(res, req.body.email, user._id)

    user.name = req.body.name || user.name
    user.email = req.body.email || user.email

    // L'affectation était inconditionnelle : un corps sans `isAdmin` — le cas
    // normal quand on ne modifie qu'un nom — passait le champ à `undefined`,
    // la validation du schéma échouait et la requête ressortait en 500.
    // `||` ne conviendrait pas ici : il écraserait un `false` volontaire.
    if (req.body.isAdmin !== undefined) {
      user.isAdmin = req.body.isAdmin
    }

    const updatedUser = await user.save()

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
}
