import asyncHandler from 'express-async-handler'
import Adaptatio from '../models/adaptationModel.js'

// @desc    Get all adaptations
// @route   GET /api/adaptations
// @access  Public
export const getAdaptations = asyncHandler(async (req, res) => {
  const adaptations = await Adaptatio.find({})
  res.json(adaptations)
})

// @desc    Get one adaptation by ID
// @route   GET /api/adaptations/:id
// @access  Public
export const getAdaptationById = asyncHandler(async (req, res) => {
  const adaptation = await Adaptatio.findById(req.params.id)

  if (adaptation) {
    res.json(adaptation)
  } else {
    res.status(404)
    throw new Error('Adaptation not found')
  }
})

// @desc    Create new adaptation
// @route   POST /api/adaptations
// @access  Private/Admin
export const createAdaptation = asyncHandler(async (req, res) => {
  const { name, image, description, advice, side } = req.body

  const newAdapt = new Adaptatio({
    name,
    image,
    description,
    advice,
    side,
  })

  const createdAdapt = await newAdapt.save()
  res.status(201).json(createdAdapt)
})

// @desc    Delete adaptation
// @route   DELETE /api/adaptations/:id
// @access  Private/Admin
export const deleteAdaptation = asyncHandler(async (req, res) => {
  const adaptation = await Adaptatio.findById(req.params.id)

  if (adaptation) {
    await adaptation.remove()
    res.json({ message: 'Adaptation removed' })
  } else {
    res.status(404)
    throw new Error('Adaptation not found')
  }
})

// @desc    Update adaptation
// @route   PUT /api/adaptations/:id
// @access  Private/Admin
export const updateAdaptation = asyncHandler(async (req, res) => {
  const { name, image, description, advice, side } = req.body

  const adaptation = await Adaptatio.findById(req.params.id)

  if (adaptation) {
    adaptation.name = name
    adaptation.image = image
    adaptation.description = description
    adaptation.advice = advice
    adaptation.side = side

    const updatedAdaptation = await adaptation.save()
    res.json(updatedAdaptation)
  } else {
    res.status(404)
    throw new Error('Adaptation not found')
  }
})
