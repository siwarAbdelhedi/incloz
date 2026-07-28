import { useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { AuthContext } from './AuthContext'
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/auth'

/**
 * Source de vérité unique pour l'utilisateur connecté.
 *
 * Avant, chaque écran lisait le localStorage de son côté : les formulaires
 * écrivaient sous une clé, le dashboard relisait sous une autre, et le header
 * ne savait jamais si quelqu'un était connecté. Passer par un contexte rend
 * cette divergence impossible et permet à toute l'interface de réagir à une
 * connexion ou une déconnexion sans recharger la page.
 */
const AuthProvider = ({ children }) => {
  // Initialisé depuis le stockage : la session survit à un rechargement.
  const [user, setUser] = useState(() => getStoredUser())

  const login = useCallback((data) => {
    setStoredUser(data)
    setUser(data)
  }, [])

  const logout = useCallback(() => {
    clearStoredUser()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      estConnecte: Boolean(user),
      estAdmin: Boolean(user?.isAdmin),
    }),
    [user, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

AuthProvider.propTypes = {
  children: PropTypes.node,
}

export default AuthProvider
