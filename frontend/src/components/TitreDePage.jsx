import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

import { titrePour } from '../config/titres'

/**
 * Ajuste le titre de l'onglet à chaque changement de route.
 *
 * Dans une application à page unique, le navigateur ne recharge rien : sans
 * cet effet, l'onglet garde indéfiniment le titre du document initial, quelle
 * que soit la page consultée.
 *
 * Ne rend rien — c'est un effet, pas un affichage.
 */
const TitreDePage = () => {
  const { pathname } = useLocation()

  useEffect(() => {
    document.title = titrePour(pathname)
  }, [pathname])

  return null
}

export default TitreDePage
