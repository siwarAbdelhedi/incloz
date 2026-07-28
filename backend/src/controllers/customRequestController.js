import fs from 'fs'
import asyncHandler from 'express-async-handler'
import CustomRequest from '../models/customRequestModel.js'
import { resolvePrivateUpload } from '../config/paths.js'

/**
 * Le nom du fichier reste interne : il n'apparaît dans aucune réponse. La photo
 * ne s'obtient que par la route protégée ci-dessous.
 */
const presenter = (demande) => {
  const { photos, ...reste } = demande.toObject()

  return {
    ...reste,
    aUnePhoto: Boolean(photos),
    photoUrl: photos ? `/api/custom-request/${demande._id}/photo` : null,
  }
}

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
    photos: req.file ? req.file.filename : null,
  })

  const created = await customRequest.save()

  // On accuse réception sans renvoyer la fiche : l'appelant est anonyme, et la
  // réponse contenait jusqu'ici l'ensemble des données enregistrées ainsi que
  // le nom du fichier photo.
  res.status(201).json({
    message: 'Demande enregistrée',
    id: created._id,
  })
})

// @desc    Lister les demandes personnalisées
// @route   GET /api/custom-request
// @access  Privé/Admin
export const getCustomRequests = asyncHandler(async (req, res) => {
  const demandes = await CustomRequest.find({}).sort({ createdAt: -1 })
  res.json(demandes.map(presenter))
})

// @desc    Consulter une demande personnalisée
// @route   GET /api/custom-request/:id
// @access  Privé/Admin
export const getCustomRequestById = asyncHandler(async (req, res) => {
  const demande = await CustomRequest.findById(req.params.id)

  if (!demande) {
    res.status(404)
    throw new Error('Demande introuvable')
  }

  res.json(presenter(demande))
})

// @desc    Télécharger la photo jointe à une demande
// @route   GET /api/custom-request/:id/photo
// @access  Privé/Admin
export const getCustomRequestPhoto = asyncHandler(async (req, res) => {
  const demande = await CustomRequest.findById(req.params.id)

  if (!demande || !demande.photos) {
    res.status(404)
    throw new Error('Photo introuvable')
  }

  const chemin = resolvePrivateUpload(demande.photos)

  if (!chemin || !fs.existsSync(chemin)) {
    res.status(404)
    throw new Error('Photo introuvable')
  }

  // Ces fichiers ne doivent jamais être mis en cache par un intermédiaire.
  res.setHeader('Cache-Control', 'private, no-store')
  res.sendFile(chemin)
})
