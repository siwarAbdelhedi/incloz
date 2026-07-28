import { body } from 'express-validator'

// Volontairement pas de normalizeEmail() : il met en minuscules et retire les
// points des adresses Gmail. Les comptes déjà en base ont été créés sans cette
// normalisation — l'appliquer ici empêcherait leurs titulaires de se
// reconnecter. Uniformiser les adresses demande une migration des données et un
// index unique insensible à la casse, pas une règle de validation.
export const registerRules = [
  body('name').trim().notEmpty().withMessage('Le nom est obligatoire'),
  body('email').trim().isEmail().withMessage('Adresse e-mail invalide'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit faire au moins 8 caractères'),
]

export const loginRules = [
  body('email').trim().isEmail().withMessage('Adresse e-mail invalide'),
  body('password').notEmpty().withMessage('Le mot de passe est obligatoire'),
]

export const updateProfileRules = [
  body('name').optional().trim().notEmpty().withMessage('Le nom ne peut pas être vide'),
  body('email').optional().trim().isEmail().withMessage('Adresse e-mail invalide'),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('Le mot de passe doit faire au moins 8 caractères'),
]
