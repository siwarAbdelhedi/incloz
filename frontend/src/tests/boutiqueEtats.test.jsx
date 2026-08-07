import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import axios from 'axios'

import theme from '../theme'
import ShopCards from '../components/BoutiquePages/ShopCards'
import ProductDetail from '../components/BoutiquePages/ProductDetail'

vi.mock('axios')

// `getByRole` fait planter jsdom sur ces deux écrans — le calcul des styles
// échoue sur `resolveLengthInPixels`. Les requêtes passent donc par le texte et
// par le DOM, qui n'en dépendent pas.
const PRODUITS = [
  { _id: 'p1', title: 'T-shirt Fitness', description: 'T-shirt en coton.', image: 'tshirt.png', price: 29.9 },
  { _id: 'p2', title: 'Jogging Fitness', description: 'Jogging en coton.', image: 'jogging.png', price: 49.9 },
]

const enAttente = () => new Promise(() => {})

const afficherCatalogue = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <ShopCards />
      </MemoryRouter>
    </ThemeProvider>
  )

const afficherFiche = (id = 'p1') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[`/product/${id}`]}>
        <Routes>
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    </ThemeProvider>
  )

const echecReseau = () => Object.assign(new Error('Network Error'), { response: undefined })
const echec404 = () => Object.assign(new Error('Not Found'), { response: { status: 404 } })

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Catalogue — chargement', () => {
  it('annonce le chargement au lieu d’afficher une grille vide', async () => {
    axios.get.mockImplementation(enAttente)
    const { container } = afficherCatalogue()

    expect(screen.getByText(/chargement du catalogue en cours/i)).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
  })

  it('affiche des squelettes de carte pendant l’attente', () => {
    axios.get.mockImplementation(enAttente)
    const { container } = afficherCatalogue()

    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })
})

describe('Catalogue — panne de l’API', () => {
  // Le cœur de cette PR : l'échec se rabattait sur trois produits écrits en
  // dur, sans rien dire. Le visiteur voyait un catalogue qui n'existait pas.
  it('ne montre plus de produits inventés quand l’API échoue', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficherCatalogue()

    await screen.findByText(/n’a pas pu être chargé/i)

    for (const invente of ['T-shirt Fitness', 'Jogging Fitness', 'Short Fitness']) {
      expect(screen.queryByText(invente)).not.toBeInTheDocument()
    }
  })

  it('dit que le catalogue n’a pas pu être chargé', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficherCatalogue()

    const message = await screen.findByText(/le catalogue n’a pas pu être chargé/i)
    expect(message.closest('[role="alert"]')).toBeInTheDocument()
  })

  it('propose de réessayer, et relance vraiment l’appel', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficherCatalogue()

    const bouton = await screen.findByText('Réessayer')
    expect(axios.get).toHaveBeenCalledTimes(1)

    axios.get.mockResolvedValue({ data: PRODUITS })
    fireEvent.click(bouton)

    await waitFor(() => expect(screen.getByText('T-shirt Fitness')).toBeInTheDocument())
    expect(axios.get).toHaveBeenCalledTimes(2)
  })
})

describe('Catalogue — vide', () => {
  // Un catalogue vide et une panne sont deux vérités différentes : les
  // confondre ferait passer une panne pour un choix commercial, et l'inverse.
  it('distingue « aucun produit » d’une panne', async () => {
    axios.get.mockResolvedValue({ data: [] })
    afficherCatalogue()

    expect(await screen.findByText(/le catalogue est vide pour le moment/i)).toBeInTheDocument()
    expect(screen.queryByText(/n’a pas pu être chargé/i)).not.toBeInTheDocument()
  })

  it('laisse une porte ouverte vers la demande sur-mesure', async () => {
    axios.get.mockResolvedValue({ data: [] })
    const { container } = afficherCatalogue()

    await screen.findByText(/le catalogue est vide/i)
    expect(container.querySelector('a[href="/custom-request"]')).toBeInTheDocument()
  })
})

describe('Catalogue — cartes', () => {
  it('affiche les produits renvoyés par l’API', async () => {
    axios.get.mockResolvedValue({ data: PRODUITS })
    afficherCatalogue()

    expect(await screen.findByText('T-shirt Fitness')).toBeInTheDocument()
    expect(screen.getByText('Jogging Fitness')).toBeInTheDocument()
  })

  // Seule la pastille « + » de 40px était cliquable ; le reste de la carte
  // semblait l'être sans l'être, et rien n'était atteignable au clavier.
  it('fait de la carte entière un lien vers la fiche produit', async () => {
    axios.get.mockResolvedValue({ data: PRODUITS })
    const { container } = afficherCatalogue()

    await screen.findByText('T-shirt Fitness')

    const carte = container.querySelector('a[href="/product/p1"]')
    expect(carte).toBeInTheDocument()
    expect(carte).toHaveTextContent('T-shirt Fitness')
    expect(carte).toHaveTextContent('T-shirt en coton.')
  })

  it('ne laisse pas la pastille « + » être annoncée comme un second lien', async () => {
    axios.get.mockResolvedValue({ data: PRODUITS })
    const { container } = afficherCatalogue()

    await screen.findByText('T-shirt Fitness')

    // Une carte, un lien : pas de bouton imbriqué doublant la destination.
    expect(container.querySelectorAll('a[href^="/product/"]')).toHaveLength(2)
    expect(container.querySelector('a[href="/product/p1"] button')).toBeNull()

    const pastille = [...container.querySelectorAll('[aria-hidden="true"]')].find(
      (n) => n.textContent === '+'
    )
    expect(pastille).toBeDefined()
  })
})

describe('Fiche produit — chargement', () => {
  it('annonce son sujet dès le chargement, par un titre unique', () => {
    axios.get.mockImplementation(enAttente)
    const { container } = afficherFiche()

    const titres = container.querySelectorAll('h1')
    expect(titres).toHaveLength(1)
    expect(titres[0]).toHaveTextContent(/chargement de la fiche produit/i)
  })

  it('affiche des squelettes plutôt qu’un écran figé', () => {
    axios.get.mockImplementation(enAttente)
    const { container } = afficherFiche()

    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })
})

describe('Fiche produit — produit inexistant', () => {
  // La page restait sur « Chargement… » indéfiniment, sans jamais dire que le
  // produit n'existait pas, et sans proposer la moindre issue.
  it('dit que le produit est introuvable', async () => {
    axios.get.mockRejectedValue(echec404())
    const { container } = afficherFiche('inconnu')

    expect(await screen.findByText(/produit introuvable/i)).toBeInTheDocument()
    expect(container.querySelectorAll('h1')).toHaveLength(1)
    expect(screen.queryByText(/chargement/i)).not.toBeInTheDocument()
  })

  it('ramène vers la boutique', async () => {
    axios.get.mockRejectedValue(echec404())
    const { container } = afficherFiche('inconnu')

    await screen.findByText(/produit introuvable/i)
    expect(container.querySelector('a[href="/boutique"]')).toBeInTheDocument()
  })

  // Réessayer n'a aucun sens sur un produit qui n'existe pas : le proposer
  // ferait espérer un résultat différent de la même requête.
  it('ne propose pas de réessayer', async () => {
    axios.get.mockRejectedValue(echec404())
    afficherFiche('inconnu')

    await screen.findByText(/produit introuvable/i)
    expect(screen.queryByText('Réessayer')).not.toBeInTheDocument()
  })
})

describe('Fiche produit — panne de l’API', () => {
  it('distingue une panne d’un produit inexistant', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficherFiche()

    expect(await screen.findByText(/n’a pas pu être chargé/i)).toBeInTheDocument()
    expect(screen.queryByText(/produit introuvable/i)).not.toBeInTheDocument()
  })

  it('propose de réessayer, et relance vraiment l’appel', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficherFiche()

    const bouton = await screen.findByText('Réessayer')
    expect(axios.get).toHaveBeenCalledTimes(1)

    axios.get.mockResolvedValue({ data: PRODUITS[0] })
    fireEvent.click(bouton)

    await waitFor(() => expect(screen.getByText('T-shirt Fitness')).toBeInTheDocument())
  })
})
