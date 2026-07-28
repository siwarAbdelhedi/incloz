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

  res.status(statusCode)
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  })
}

export { notFound, errorHandler }
