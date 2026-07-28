import asyncHandler from 'express-async-handler'
import CustomRequest from '../models/customRequestModel.js'

// @desc    Créer une demande personnalisée
// @route   POST /api/custom-request
// @access  Public
export const createCustomRequest = asyncHandler(async (req, res) => {
  const {
    nom,
    prenom,
    email,
    telephone,
    rue,
    ville,
    codePostal,
    typeVetement,
    taille,
    hanches,
    cuisse,
    entrejambe,
  } = req.body

  const photoPath = req.file ? req.file.filename : null

  const customRequest = new CustomRequest({
    nom,
    prenom,
    email,
    telephone,
    rue,
    ville,
    codePostal,
    typeVetement,
    taille,
    hanches,
    cuisse,
    entrejambe,
    photos: photoPath,
  })

  const created = await customRequest.save()
  res.status(201).json(created)
})
