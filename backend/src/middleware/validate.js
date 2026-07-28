import { validationResult } from 'express-validator'

/**
 * À placer après une liste de règles express-validator. Renvoie un 400 lisible
 * plutôt que de laisser une entrée malformée provoquer un 500 plus loin.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req)

  if (errors.isEmpty()) {
    return next()
  }

  res.status(400).json({
    message: errors.array()[0].msg,
    errors: errors.array().map(({ path, msg }) => ({ champ: path, message: msg })),
  })
}

export default validate
