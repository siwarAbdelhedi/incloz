/**
 * Environnements où la trace d'exécution est renvoyée à l'appelant.
 *
 * Le test portait auparavant sur `!== 'production'` : n'importe quelle autre
 * valeur — variable oubliée au déploiement, mal orthographiée, `ENV_FILE`
 * incomplet — suffisait à exposer les chemins du serveur et la structure
 * interne de l'application. Le défaut est désormais fermé : la trace ne sort
 * que là où quelqu'un la lit.
 */
const ENVIRONNEMENTS_VERBEUX = new Set(['development', 'test'])

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Fichier trop lourd, trop nombreux, ou type refusé par le fileFilter : ce
  // sont des erreurs de saisie, pas des pannes serveur.
  if (err.name === 'MulterError' || err.message === 'Images et PDF uniquement') {
    statusCode = 400
  }

  // Un ObjectId malformé dans l'URL produisait un 500 ; c'est une ressource
  // introuvable du point de vue de l'appelant.
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404
    err.message = 'Ressource introuvable'
  }

  // Violation d'un index unique. Deux requêtes concurrentes peuvent passer la
  // vérification applicative en même temps et n'échouer qu'ici : c'est une
  // entrée refusée, pas une panne serveur.
  if (err.code === 11000) {
    statusCode = 400
    err.message = 'Cette valeur est déjà utilisée'
  }

  res.status(statusCode)
  res.json({
    message: err.message,
    stack: ENVIRONNEMENTS_VERBEUX.has(process.env.NODE_ENV) ? err.stack : null,
  })
}

export { notFound, errorHandler }
