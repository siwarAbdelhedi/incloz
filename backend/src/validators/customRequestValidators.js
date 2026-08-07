import { body } from 'express-validator'

// Le formulaire est public et non authentifié : c'est la seule barrière entre
// Internet et la base. Les champs arrivent en multipart, donc toujours en
// chaînes — d'où les isFloat/toFloat plutôt que isNumeric.
const mesure = (champ) =>
  body(champ)
    .optional({ values: 'falsy' })
    .isFloat({ gt: 0, lt: 400 })
    .withMessage(`${champ} doit être un nombre plausible (en cm)`)
    .toFloat()

export const customRequestRules = [
  // Le formulaire recueille des mensurations et parfois une photographie, dans
  // un contexte où elles peuvent révéler une situation de handicap. Ces
  // données ne peuvent être traitées que sur consentement exprès : sans case
  // cochée, la demande est refusée plutôt qu'enregistrée.
  //
  // Les champs arrivent en multipart, donc en chaînes : le front envoie la
  // valeur littérale « true ». Les autres formes usuelles d'une case cochée
  // sont acceptées pour ne pas dépendre d'un détail d'implémentation.
  body('consentement')
    .customSanitizer((valeur) => String(valeur).toLowerCase())
    .isIn(['true', 'on', '1'])
    .withMessage(
      'Le consentement au traitement des données est obligatoire pour envoyer une demande'
    ),
  body('nom').trim().notEmpty().withMessage('Le nom est obligatoire').isLength({ max: 100 }),
  body('prenom').trim().notEmpty().withMessage('Le prénom est obligatoire').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Adresse e-mail invalide'),
  body('telephone')
    .trim()
    .notEmpty()
    .withMessage('Le téléphone est obligatoire')
    .isLength({ max: 30 }),
  body('typeVetement')
    .isIn(['tshirt', 'short', 'jogging'])
    .withMessage('Type de vêtement inconnu'),
  body('rue').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
  body('ville').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
  body('codePostal').optional({ values: 'falsy' }).trim().isLength({ max: 20 }),
  mesure('taille'),
  mesure('hanches'),
  mesure('cuisse'),
  mesure('entrejambe'),
]
