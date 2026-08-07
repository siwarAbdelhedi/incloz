/**
 * Identité de l'éditeur du site et paramètres de conformité.
 *
 * Les trois pages légales lisent ce fichier : c'est le seul endroit à modifier
 * quand une de ces informations change, et le seul à remplir avant la mise en
 * ligne.
 *
 * Les valeurs à `null` sont celles qui ne peuvent venir que de l'exploitant.
 * Tant qu'elles le restent, les pages affichent un marqueur visible à leur
 * place plutôt qu'un blanc ou un « undefined » : une mention légale
 * incomplète doit se voir.
 */

/**
 * Éditeur du site — mentions obligatoires de l'article 6 III de la loi pour la
 * confiance dans l'économie numérique.
 *
 * La page « Nous contacter » affiche déjà une adresse postale, un téléphone et
 * une adresse e-mail. Ils n'ont pas été repris ici : rien ne dit qu'ils
 * correspondent au siège social ni au contact légal, et une mention légale
 * fausse est pire qu'absente.
 */
export const EDITEUR = {
  denomination: 'Incloz',
  // « SAS », « SASU », « SARL », « entreprise individuelle »...
  formeJuridique: null,
  // Montant en euros, ou null si la forme juridique n'en prévoit pas.
  capitalSocial: null,
  siret: null,
  // Ville et numéro d'immatriculation, ou null si non immatriculée au RCS.
  rcs: null,
  // Numéro de TVA intracommunautaire, ou null si non assujettie.
  tva: null,
  // Adresse du siège social, sur une seule ligne.
  adresse: null,
  directeurPublication: null,
  emailContact: null,
  telephoneContact: null,
}

/**
 * Hébergeur du site. Sa dénomination, son adresse et son téléphone sont
 * obligatoires, même quand l'hébergement est mutualisé ou gratuit.
 */
export const HEBERGEUR = {
  denomination: null,
  adresse: null,
  telephone: null,
}

/**
 * Adresse à laquelle un visiteur exerce ses droits sur ses données.
 *
 * Aucun délégué à la protection des données n'est désigné : ce n'est pas
 * obligatoire ici — l'activité ne repose pas sur un suivi à grande échelle et
 * la structure n'est pas un organisme public.
 */
export const CONTACT_DONNEES = null

/**
 * Durée de conservation d'une demande sur-mesure, photo comprise, à compter de
 * son dépôt. Au-delà, la fiche et le fichier joint sont supprimés.
 *
 * Cette valeur est annoncée au visiteur ici et appliquée côté API par
 * `backend/src/config/conservation.js`. Les deux doivent rester d'accord.
 */
export const DUREE_CONSERVATION_MOIS = 12

/**
 * Version de la politique de confidentialité, enregistrée avec chaque demande.
 *
 * Le RGPD demande de pouvoir démontrer à quoi une personne a consenti, pas
 * seulement qu'elle a consenti. Conserver la version du texte accepté est ce
 * qui rend cette preuve possible. À incrémenter à chaque modification de fond
 * de la politique.
 */
export const VERSION_POLITIQUE = '2026-08-07'

/** Date affichée en tête des trois pages légales. */
export const DERNIERE_MISE_A_JOUR = '7 août 2026'

/**
 * Autorité de contrôle compétente, auprès de laquelle toute personne peut
 * introduire une réclamation. Informations publiques.
 */
export const CNIL = {
  denomination: 'Commission nationale de l’informatique et des libertés',
  adresse: '3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07',
  site: 'https://www.cnil.fr',
}
