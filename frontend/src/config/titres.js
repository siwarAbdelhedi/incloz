import { matchPath } from 'react-router-dom'

/**
 * Titre de l'onglet, route par route.
 *
 * Le site en servait un seul pour ses quatorze pages — et il contenait une
 * coquille (« Inclozing »). Un titre identique partout rend les favoris et
 * l'historique du navigateur inutilisables, et prive les moteurs de recherche
 * du principal signal décrivant chaque page.
 *
 * Les libellés reprennent volontairement les <h1> des pages : ce que le
 * visiteur lit dans l'onglet doit être ce qu'il lit en haut de la page.
 */
export const NOM_DU_SITE = 'Incloz'

export const TITRE_PAR_DEFAUT =
  'Incloz — Vêtements de sport adaptés pour parathlètes'

// L'ordre compte : la première correspondance gagne.
const TITRES = [
  ['/', TITRE_PAR_DEFAUT],
  ['/boutique', 'La boutique'],
  ['/panier', 'Votre panier'],
  ['/ContactForm', 'Nous contacter'],
  ['/blog', 'Le blog'],
  ['/about', 'Qui sommes-nous ?'],
  ['/dashboard', 'Votre espace'],
  // La route la plus spécifique en premier, comme partout dans cette liste.
  // « Fiche de demande » et non « Demande sur-mesure » : ce dernier titre est
  // déjà celui du formulaire public, et deux pages ne peuvent pas porter le
  // même — c'est précisément ce que cette liste corrige.
  ['/admin/demandes/:id', 'Fiche de demande'],
  ['/admin/demandes', 'Demandes sur-mesure'],
  ['/login', 'Connexion'],
  ['/register', 'Créer un compte'],
  ['/product/:id', 'Fiche produit'],
  ['/custom-request', 'Demande sur-mesure'],
  ['/cgu', "Conditions générales d'utilisation"],
  ['/mentions-legales', 'Mentions légales'],
  ['/politique-confidentialite', 'Politique de confidentialité'],
]

/** Titre complet à poser dans document.title pour un chemin donné. */
export const titrePour = (chemin) => {
  const trouve = TITRES.find(([motif]) => matchPath({ path: motif, end: true }, chemin))

  if (!trouve) return `Page introuvable — ${NOM_DU_SITE}`
  // L'accueil porte déjà le nom du site : le suffixer le répéterait.
  return trouve[1] === TITRE_PAR_DEFAUT ? trouve[1] : `${trouve[1]} — ${NOM_DU_SITE}`
}
