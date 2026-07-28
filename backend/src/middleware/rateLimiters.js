import rateLimit from 'express-rate-limit'

const minutes = (n) => n * 60 * 1000

/**
 * Fabrique un limiteur. Les plafonds sont paramétrables par variable
 * d'environnement pour pouvoir être relevés en test sans désactiver le
 * middleware — un limiteur qu'on retire en test n'est jamais exercé.
 */
export const createRateLimiter = ({ windowMs, max, message }) =>
  rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message },
  })

const num = (name, fallback) => Number(process.env[name]) || fallback

// Connexion et inscription : cible privilégiée du bruteforce.
export const authLimiter = createRateLimiter({
  windowMs: minutes(15),
  max: num('RATE_LIMIT_AUTH_MAX', 10),
  message: 'Trop de tentatives, réessayez dans quelques minutes.',
})

// Formulaire sur-mesure : public, non authentifié, et il écrit sur le disque.
export const formLimiter = createRateLimiter({
  windowMs: minutes(60),
  max: num('RATE_LIMIT_FORM_MAX', 5),
  message: 'Trop de demandes envoyées, réessayez plus tard.',
})

// Filet global sur le reste de l'API.
export const apiLimiter = createRateLimiter({
  windowMs: minutes(15),
  max: num('RATE_LIMIT_GLOBAL_MAX', 300),
  message: 'Trop de requêtes, réessayez plus tard.',
})
