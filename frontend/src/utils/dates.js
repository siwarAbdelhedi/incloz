/**
 * Mise en forme des dates pour l'affichage, en français.
 *
 * Les dates arrivent de l'API au format ISO 8601, en UTC. Les afficher telles
 * quelles montrerait « 2026-08-07T14:32:11.004Z » à quelqu'un qui cherche à
 * savoir quand une demande est arrivée.
 */

const FORMAT_JOUR = { day: 'numeric', month: 'long', year: 'numeric' }
const FORMAT_HEURE = { hour: '2-digit', minute: '2-digit' }

/** Millisecondes dans une journée. */
const JOUR = 24 * 60 * 60 * 1000

/**
 * Convertit une valeur en date, ou null si elle n'en est pas une.
 *
 * Le test d'absence est fait avant `new Date` : `new Date(null)` ne renvoie pas
 * une date invalide mais le 1ᵉʳ janvier 1970. Une fiche dont le terme de
 * conservation manquerait aurait donc été annoncée « Conservation échue »,
 * c'est-à-dire bonne à effacer.
 */
const enDate = (valeur) => {
  if (valeur === null || valeur === undefined || valeur === '') return null

  const date = new Date(valeur)
  return Number.isNaN(date.getTime()) ? null : date
}

/** « 7 août 2026 ». Renvoie null si la date est absente ou illisible. */
export const formaterDate = (valeur) => {
  const date = enDate(valeur)
  if (!date) return null

  return new Intl.DateTimeFormat('fr-FR', FORMAT_JOUR).format(date)
}

/** « 7 août 2026 à 14:32 ». Renvoie null si la date est absente ou illisible. */
export const formaterDateHeure = (valeur) => {
  const date = enDate(valeur)
  if (!date) return null

  const jour = new Intl.DateTimeFormat('fr-FR', FORMAT_JOUR).format(date)
  const heure = new Intl.DateTimeFormat('fr-FR', FORMAT_HEURE).format(date)

  return `${jour} à ${heure}`
}

/**
 * Nombre de jours entiers restants avant une échéance. Négatif si elle est
 * passée, null si la date est illisible.
 *
 * Les deux bornes sont ramenées à minuit avant comparaison : sans cela, une
 * échéance fixée à 9h et consultée à 10h la veille aurait affiché « 0 jour »
 * alors qu'elle tombe le lendemain.
 */
export const joursAvant = (valeur, maintenant = new Date()) => {
  const date = enDate(valeur)
  if (!date) return null

  const minuit = (d) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())

  return Math.round((minuit(date) - minuit(maintenant)) / JOUR)
}

/**
 * Phrase décrivant l'échéance de conservation d'une demande.
 *
 * Une date brute (« expire le 7 août 2027 ») ne dit rien de l'urgence à un an
 * de distance, mais tout à quatre jours : le libellé bascule donc sur un
 * décompte quand l'échéance approche, et signale explicitement une fiche que la
 * purge aurait dû emporter.
 */
export const echeance = (valeur, maintenant = new Date()) => {
  const jours = joursAvant(valeur, maintenant)
  if (jours === null) return { texte: 'Échéance inconnue', urgence: 'inconnue' }

  if (jours < 0) {
    return { texte: 'Conservation échue', urgence: 'echue' }
  }

  if (jours === 0) {
    return { texte: "Expire aujourd'hui", urgence: 'proche' }
  }

  if (jours <= 30) {
    return {
      texte: `Expire dans ${jours} jour${jours > 1 ? 's' : ''}`,
      urgence: 'proche',
    }
  }

  return { texte: `Expire le ${formaterDate(valeur)}`, urgence: 'lointaine' }
}
