import { body } from 'express-validator'

export const createProductRules = [
  body('title').trim().notEmpty().withMessage('Le titre est obligatoire'),
  body('description').trim().notEmpty().withMessage('La description est obligatoire'),
  body('image').trim().notEmpty().withMessage("L'image est obligatoire"),
  body('price')
    .isFloat({ gt: 0 })
    .withMessage('Le prix doit être un nombre supérieur à 0'),
  body('subtitle').optional().trim(),
]
