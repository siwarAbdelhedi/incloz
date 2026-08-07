import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

import { API_URL } from '../config/api'
import { useAuth } from './useAuth'

/**
 * Charge une ressource réservée aux administrateurs, avec le jeton de session.
 *
 * Les routes d'administration refusent une requête sans en-tête
 * `Authorization` : contrairement au catalogue, la donnée ne peut pas être
 * récupérée par un simple `axios.get`. Le jeton vient du contexte de session,
 * jamais d'une relecture directe du stockage local.
 *
 * `statut` distingue quatre situations, parce qu'elles appellent quatre écrans
 * différents : le chargement, la ressource obtenue, l'introuvable (404 — une
 * fiche effacée ou un identifiant erroné) et la panne. Confondre les deux
 * dernières ferait proposer un « Réessayer » là où la même requête donnerait
 * indéfiniment le même résultat.
 *
 * @param {string} chemin Chemin relatif à l'API, par exemple `/custom-request`.
 */
export const useRessourceAdmin = (chemin) => {
  const { user } = useAuth()
  const jeton = user?.token

  const [donnees, setDonnees] = useState(null)
  const [statut, setStatut] = useState('chargement')

  const charger = useCallback(async () => {
    setStatut('chargement')

    try {
      const { data } = await axios.get(`${API_URL}${chemin}`, {
        headers: { Authorization: `Bearer ${jeton}` },
      })
      setDonnees(data)
      setStatut('ok')
    } catch (erreur) {
      console.error(`Chargement de ${chemin} impossible`, erreur)
      setDonnees(null)
      setStatut(erreur.response?.status === 404 ? 'introuvable' : 'erreur')
    }
  }, [chemin, jeton])

  useEffect(() => {
    charger()
  }, [charger])

  return { donnees, statut, recharger: charger }
}

export default useRessourceAdmin
