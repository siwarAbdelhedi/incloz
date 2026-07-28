import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { readFileSync } from 'node:fs'

import theme from '../theme'
import AuthProvider from '../context/AuthProvider'
import Header from '../components/Navbar/Header'
import { setStoredUser } from '../utils/auth'

const afficher = (route = '/') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  )

describe('Boutons à icône', () => {
  // Les trois n'avaient aucun libellé : un lecteur d'écran annonçait
  // « bouton », sans dire lequel ni ce qu'il fait.
  it('le panier annonce sa destination', () => {
    afficher()
    expect(screen.getByRole('link', { name: 'Votre panier' })).toBeInTheDocument()
  })

  it("le burger annonce qu'il ouvre le menu", () => {
    afficher()
    expect(screen.getByRole('button', { name: 'Ouvrir le menu' })).toBeInTheDocument()
  })

  it('la fermeture du tiroir annonce son rôle', async () => {
    afficher()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))

    expect(screen.getByRole('button', { name: 'Fermer le menu' })).toBeInTheDocument()
  })

  // Le logo était décrit « Incloz Logo » : le mot « logo » n'apprend rien, et
  // le texte alternatif d'un lien doit dire où il mène.
  it('le logo annonce où il mène', () => {
    afficher()
    expect(
      screen.getByRole('link', { name: "Incloz, retour à l'accueil" })
    ).toBeInTheDocument()
  })
})

describe('État du menu déroulant', () => {
  it("annonce s'il est ouvert ou fermé", async () => {
    afficher()
    const burger = screen.getByRole('button', { name: 'Ouvrir le menu' })

    expect(burger).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(burger)
    expect(burger).toHaveAttribute('aria-expanded', 'true')
  })

  it('désigne le tiroir qu’il commande', async () => {
    afficher()
    const burger = screen.getByRole('button', { name: 'Ouvrir le menu' })
    const cible = burger.getAttribute('aria-controls')

    await userEvent.click(burger)
    expect(document.getElementById(cible)).toBeInTheDocument()
  })

  // <ListItem button> est déprécié en MUI v6 et supprimé en v7 : les entrées
  // doivent être de vrais éléments interactifs.
  it('expose des entrées réellement cliquables', async () => {
    afficher()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))

    const tiroirs = screen.getAllByRole('navigation', { name: 'Navigation principale' })
    const tiroir = tiroirs[tiroirs.length - 1]

    expect(within(tiroir).getByRole('link', { name: 'La boutique' })).toBeInTheDocument()
    expect(within(tiroir).getByRole('link', { name: 'Blog' })).toBeInTheDocument()
  })
})

describe('Page courante', () => {
  // Rien n'indiquait la page consultée, ni à l'œil ni au lecteur d'écran.
  it('est signalée sur le lien correspondant', () => {
    afficher('/boutique')

    const actif = screen.getAllByRole('link', { name: 'La boutique' })[0]
    expect(actif).toHaveAttribute('aria-current', 'page')
  })

  it("ne l'est pas sur les autres liens", () => {
    afficher('/boutique')

    for (const nom of ['Blog', 'Qui sommes nous ?', 'Nos adaptations']) {
      const lien = screen.getAllByRole('link', { name: nom })[0]
      expect(lien, nom).not.toHaveAttribute('aria-current')
    }
  })

  it("n'en signale aucune sur une page hors menu", () => {
    afficher('/panier')

    expect(document.querySelectorAll('[aria-current="page"]')).toHaveLength(0)
  })
})

describe('Session', () => {
  it('propose la déconnexion dans le tiroir quand on est connecté', async () => {
    setStoredUser({ _id: '1', name: 'Camille Martin', isAdmin: false, token: 'j' })
    afficher()
    await userEvent.click(screen.getByRole('button', { name: 'Ouvrir le menu' }))

    expect(screen.getAllByText('Déconnexion').length).toBeGreaterThan(0)
  })
})

// Le contraste réel se calcule sur les jetons du thème, vérifiés par
// theme.test.js. Ce qui se verrouille ici, c'est que le header les utilise
// plutôt que de réécrire ses couleurs — c'est ce qui l'avait fait diverger.
describe('Couleurs', () => {
  const source = readFileSync('src/components/Navbar/Header.jsx', 'utf8')

  it("ne contient plus aucune couleur en dur", () => {
    const hex = source.match(/#[0-9A-Fa-f]{3,8}\b/g) ?? []
    expect(hex).toEqual([])
  })

  // La teinte vive ne monte qu'à 3,22:1 avec du texte : elle ne peut pas
  // porter de libellé. Le header doit passer par primary.main ou primary.dark.
  it('ne pose pas de texte sur la teinte décorative', () => {
    expect(source).not.toContain('primary.light')
    expect(source).not.toContain('palette.primary.light')
  })
})
