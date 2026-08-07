/**
 * Durée de conservation d'une demande sur-mesure, en mois, à compter de son
 * dépôt. Au-delà, la fiche et sa pièce jointe sont supprimées.
 *
 * Aucune durée n'était appliquée jusqu'ici : les demandes s'accumulaient
 * indéfiniment, avec leurs mensurations et leurs photos.
 *
 * Cette valeur est annoncée au visiteur par la politique de confidentialité,
 * qui la lit dans `frontend/src/config/entreprise.js`. Les deux doivent rester
 * d'accord — le site ne peut pas promettre une durée que l'API n'applique pas.
 */
export const DUREE_CONSERVATION_MOIS = 12

/**
 * Date à laquelle une demande déposée maintenant devra être supprimée.
 *
 * Le calcul passe par `setMonth`, qui gère les mois de longueurs différentes :
 * une demande du 31 janvier n'expire pas un 31 février.
 */
export const dateExpiration = (depart = new Date()) => {
  const expiration = new Date(depart)
  expiration.setMonth(expiration.getMonth() + DUREE_CONSERVATION_MOIS)
  return expiration
}
