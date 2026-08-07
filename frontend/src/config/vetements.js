/**
 * Vocabulaire des types de vêtement proposés à la demande sur-mesure.
 *
 * Les codes (`tshirt`, `short`, `jogging`) sont ceux que l'API accepte —
 * l'énumération du modèle Mongoose les verrouille. Les libellés sont ce que
 * lit un humain, dans le formulaire comme dans l'écran d'administration.
 *
 * Les deux écrans les écrivaient séparément : celui qui les affiche à
 * l'administrateur aurait fini par nommer autrement ce que le visiteur a
 * choisi.
 */
export const VETEMENTS = [
  { code: 'tshirt', libelle: 'T-shirt fitness' },
  { code: 'short', libelle: 'Short fitness' },
  { code: 'jogging', libelle: 'Jogging fitness' },
]

/**
 * Libellé d'un code. Un code inconnu est renvoyé tel quel plutôt que masqué :
 * si l'énumération de l'API évolue sans que cette liste suive, une fiche
 * ancienne doit rester lisible.
 */
export const libelleVetement = (code) =>
  VETEMENTS.find((v) => v.code === code)?.libelle ?? code
