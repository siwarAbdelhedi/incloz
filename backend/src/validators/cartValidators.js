import { body } from 'express-validator'

/**
 * Quantité maximale par ligne de panier. Sans plafond, rien n'empêchait une
 * ligne de croître indéfiniment au fil des ajouts.
 */
export const QUANTITE_MAX = 99

// POST /api/cart n'avait aucune règle : une quantité négative était acceptée
// et enregistrée telle quelle, et un identifiant de produit inexistant passait
// sans que rien ne le signale. Ce sera un défaut de facturation le jour où le
// panier repassera côté serveur — c'est-à-dire avant toute vente.
export const addToCartRules = [
  body('productId').isMongoId().withMessage('Produit inconnu'),
  body('size').trim().notEmpty().withMessage('La taille est obligatoire'),
  body('adaptation')
    .isIn(['pression', 'auto-grippant', 'aimants'])
    .withMessage('Adaptation inconnue'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: QUANTITE_MAX })
    .withMessage(`La quantité doit être un entier entre 1 et ${QUANTITE_MAX}`)
    .toInt(),
]
