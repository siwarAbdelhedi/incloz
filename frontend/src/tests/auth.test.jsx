import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'

import theme from '../theme'
import AuthProvider from '../context/AuthProvider'
import ProtectedRoute from '../components/ProtectedRoute'
import Header from '../components/Navbar/Header'
import { useAuth } from '../hooks/useAuth'
import { getStoredUser, setStoredUser } from '../utils/auth'

const unUtilisateur = {
  _id: '1',
  name: 'Camille Martin',
  email: 'camille@incloz.fr',
  isAdmin: false,
  token: 'jeton',
}

const unAdmin = { ...unUtilisateur, name: 'Alice Dupont', isAdmin: true }

const afficher = (ui, { route = '/' } = {}) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>{ui}</AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  )

// Petit composant pour piloter le contexte depuis un test.
const BoutonConnexion = () => {
  const { login } = useAuth()
  return <button onClick={() => login(unUtilisateur)}>connecter</button>
}

describe('Header — état de session', () => {
  it('propose de se connecter quand personne ne l’est', () => {
    afficher(<Header />)

    expect(screen.getByText('Se connecter')).toBeInTheDocument()
    expect(screen.queryByText('Déconnexion')).not.toBeInTheDocument()
  })

  it('affiche le prénom et la déconnexion quand on est connecté', () => {
    setStoredUser(unUtilisateur)
    afficher(<Header />)

    expect(screen.getByText('Bonjour, Camille')).toBeInTheDocument()
    expect(screen.getByText('Déconnexion')).toBeInTheDocument()
    expect(screen.queryByText('Se connecter')).not.toBeInTheDocument()
  })

  it('n’affiche que le prénom, pas le nom complet', () => {
    setStoredUser(unUtilisateur)
    afficher(<Header />)

    expect(screen.queryByText(/Martin/)).not.toBeInTheDocument()
  })

  // Le header ne réagissait pas à la connexion : il fallait recharger la page.
  it('réagit à une connexion sans rechargement', async () => {
    afficher(
      <>
        <Header />
        <BoutonConnexion />
      </>
    )

    expect(screen.getByText('Se connecter')).toBeInTheDocument()
    await userEvent.click(screen.getByText('connecter'))

    expect(screen.getByText('Bonjour, Camille')).toBeInTheDocument()
    expect(screen.queryByText('Se connecter')).not.toBeInTheDocument()
  })

  it('déconnecte, vide la session stockée et remet le bouton de connexion', async () => {
    setStoredUser(unUtilisateur)
    afficher(<Header />)

    await userEvent.click(screen.getByText('Déconnexion'))

    expect(screen.getByText('Se connecter')).toBeInTheDocument()
    expect(screen.queryByText('Bonjour, Camille')).not.toBeInTheDocument()
    expect(getStoredUser()).toBeNull()
  })
})

describe('ProtectedRoute', () => {
  const arbre = (adminOnly = false) => (
    <Routes>
      <Route path="/login" element={<p>page de connexion</p>} />
      <Route path="/dashboard" element={<p>tableau de bord</p>} />
      <Route
        path="/prive"
        element={
          <ProtectedRoute adminOnly={adminOnly}>
            <p>contenu protégé</p>
          </ProtectedRoute>
        }
      />
    </Routes>
  )

  it('renvoie un visiteur anonyme vers la connexion', () => {
    afficher(arbre(), { route: '/prive' })

    expect(screen.getByText('page de connexion')).toBeInTheDocument()
    expect(screen.queryByText('contenu protégé')).not.toBeInTheDocument()
  })

  it('laisse passer un utilisateur connecté', () => {
    setStoredUser(unUtilisateur)
    afficher(arbre(), { route: '/prive' })

    expect(screen.getByText('contenu protégé')).toBeInTheDocument()
  })

  it('renvoie un non-administrateur vers son tableau de bord, pas vers la connexion', () => {
    setStoredUser(unUtilisateur)
    afficher(arbre(true), { route: '/prive' })

    expect(screen.getByText('tableau de bord')).toBeInTheDocument()
    expect(screen.queryByText('page de connexion')).not.toBeInTheDocument()
  })

  it('laisse passer un administrateur', () => {
    setStoredUser(unAdmin)
    afficher(arbre(true), { route: '/prive' })

    expect(screen.getByText('contenu protégé')).toBeInTheDocument()
  })
})

describe('Stockage de la session', () => {
  it('relit ce qui a été écrit', () => {
    setStoredUser(unUtilisateur)
    expect(getStoredUser()).toEqual(unUtilisateur)
  })

  it('renvoie null quand rien n’est stocké', () => {
    expect(getStoredUser()).toBeNull()
  })

  // Un JSON corrompu faisait planter le rendu de la page.
  it('traite une entrée corrompue comme une absence de session', () => {
    localStorage.setItem('userInfo', '{ceci n est pas du json')
    expect(getStoredUser()).toBeNull()
  })

  it('restaure la session au montage, donc après un rechargement', () => {
    setStoredUser(unUtilisateur)
    afficher(<Header />)

    expect(screen.getByText('Bonjour, Camille')).toBeInTheDocument()
  })
})
