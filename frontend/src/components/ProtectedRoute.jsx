import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useAuth } from '../hooks/useAuth'

/**
 * Protège une route. Chaque page vérifiait sa session elle-même, avec sa propre
 * logique et ses propres redirections ; ici la règle est écrite une fois.
 *
 * `adminOnly` renvoie un utilisateur connecté mais non administrateur vers son
 * tableau de bord plutôt que vers la page de connexion : il est authentifié,
 * lui redemander ses identifiants n'aurait aucun sens.
 */
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { estConnecte, estAdmin } = useAuth()
  const location = useLocation()

  if (!estConnecte) {
    // On mémorise la page demandée pour y revenir après la connexion.
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !estAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  adminOnly: PropTypes.bool,
}

export default ProtectedRoute
