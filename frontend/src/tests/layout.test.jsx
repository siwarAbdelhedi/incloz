import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import App from '../App'
import theme from '../theme'
import ShopCards from '../components/BoutiquePages/ShopCards'
import { setStoredUser } from '../utils/auth'

// Le catalogue et la fiche produit appellent l'API au montage. Ce qui est testé
// ici est la structure du document, pas le chargement des données : on neutralise
// donc l'appel réseau plutôt que de dépendre d'un serveur.
vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: [] })) },
}))

// App embarque son propre BrowserRouter : on choisit la route par l'URL.
const afficherApp = (route = '/') => {
  window.history.pushState({}, '', route)
  return render(<App />)
}

beforeEach(() => {
  window.history.pushState({}, '', '/')
})

describe('Repères de navigation', () => {
  it('expose un contenu principal unique', () => {
    afficherApp('/')

    expect(screen.getAllByRole('main')).toHaveLength(1)
  })

  it('expose une bannière et un pied de page', () => {
    afficherApp('/')

    expect(screen.getAllByRole('banner')).toHaveLength(1)
    expect(screen.getAllByRole('contentinfo')).toHaveLength(1)
  })

  // Le menu était une simple <div> de boutons : rien ne permettait à un lecteur
  // d'écran d'identifier la navigation, ni d'y sauter.
  it('expose la navigation principale comme telle', () => {
    afficherApp('/')

    const navigation = screen.getByRole('navigation', {
      name: 'Navigation principale',
    })
    expect(within(navigation).getByText('La boutique')).toBeInTheDocument()
  })
})

describe("Lien d'évitement", () => {
  it('est le tout premier élément atteignable au clavier', async () => {
    afficherApp('/')

    await userEvent.tab()

    expect(document.activeElement).toHaveTextContent('Aller au contenu')
  })

  // `display: none` et `visibility: hidden` retireraient le lien de l'ordre de
  // tabulation : il serait invisible ET inatteignable, donc inutile.
  it('reste dans le flux, donc focusable', () => {
    afficherApp('/')

    expect(screen.getByRole('link', { name: 'Aller au contenu' })).toBeVisible()
  })

  it('pointe vers le contenu principal', () => {
    afficherApp('/')

    const lien = screen.getByRole('link', { name: 'Aller au contenu' })
    const cible = lien.getAttribute('href').replace('#', '')

    expect(document.getElementById(cible)).toBe(screen.getByRole('main'))
  })
})

describe('Titre de premier niveau', () => {
  // On interroge la balise plutôt que le rôle : le calcul de l'arbre
  // d'accessibilité fait planter jsdom sur deux de ces pages, et c'est bien le
  // niveau du titre dans le document qui nous intéresse ici.
  //
  // /product/:id reste absent de cette liste : son titre dépend de l'état de
  // l'appel — chargement, produit introuvable, panne — et se vérifie donc avec
  // le reste de ces états, dans boutiqueEtats.test.jsx. L'invariant y est le
  // même : un <h1> et un seul, quel que soit l'état.
  const routes = [
    ['/', 'Votre marque de vêtements de sport'],
    ['/boutique', 'La boutique'],
    ['/panier', 'Votre panier'],
    ['/ContactForm', 'Contactez-nous'],
    ['/blog', /Jeux Paralympiques/],
    ['/about', /Incloz, le style qui vous suit/],
    ['/login', 'Connexion'],
    ['/register', 'Créer un compte'],
    ['/custom-request', 'Fiche de renseignement'],
    // Casse de phrase, conforme à l'usage typographique français : les titres
    // de ces pages ne portaient qu'une majuscule initiale une fois rédigés.
    ['/cgu', /Conditions générales d’utilisation/],
    ['/mentions-legales', 'Mentions légales'],
    ['/politique-confidentialite', /Politique de confidentialité/],
    ['/cette-page-nexiste-pas', /Page introuvable/],
  ]

  it.each(routes)('%s annonce son sujet par un titre unique', (route, attendu) => {
    const { container } = afficherApp(route)

    const titres = container.querySelectorAll('h1')

    expect(titres).toHaveLength(1)
    expect(titres[0]).toHaveTextContent(attendu)
  })

  it('le tableau de bord annonce son sujet', () => {
    setStoredUser({ _id: '1', name: 'Camille Martin', isAdmin: false, token: 'j' })
    const { container } = afficherApp('/dashboard')

    const titres = container.querySelectorAll('h1')

    expect(titres).toHaveLength(1)
    expect(titres[0]).toHaveTextContent('Bonjour, Camille Martin')
  })
})

// ShopCards est monté sur l'accueil ET sur /boutique. Faire de son titre un <h1>
// sans condition donnait deux <h1> sur l'accueil.
describe('Niveau du titre du catalogue', () => {
  const monter = (props) =>
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter>
          <ShopCards {...props} />
        </MemoryRouter>
      </ThemeProvider>
    )

  it('est une section par défaut', () => {
    const { container } = monter()

    expect(container.querySelector('h2')).toHaveTextContent('La boutique')
    expect(container.querySelector('h1')).toBeNull()
  })

  it('devient le titre de la page quand on le demande', () => {
    const { container } = monter({ titreComposant: 'h1' })

    expect(container.querySelector('h1')).toHaveTextContent('La boutique')
  })
})

// Le rendu réel du décalage se vérifie dans un navigateur : jsdom n'applique pas
// les feuilles de style injectées par MUI. Ce qui se verrouille ici, c'est
// l'organisation — une seule déclaration, issue du thème.
describe('Décalage sous la barre fixe', () => {
  const sourcesJsx = (dossier, acc = []) => {
    for (const entree of readdirSync(dossier, { withFileTypes: true })) {
      const chemin = join(dossier, entree.name)
      if (entree.isDirectory()) sourcesJsx(chemin, acc)
      else if (/\.jsx?$/.test(entree.name) && !chemin.includes('tests')) acc.push(chemin)
    }
    return acc
  }

  const fichiers = sourcesJsx('src')

  it('est appliqué à un seul endroit', () => {
    const consommateurs = fichiers.filter((f) =>
      readFileSync(f, 'utf8').includes('layout.headerOffset')
    )

    expect(consommateurs).toEqual(['src/App.jsx'])
  })

  // Neuf pages compensaient la barre elles-mêmes, à 70px — une valeur fausse aux
  // deux breakpoints — et quatre l'oubliaient. Les marges hautes décoratives
  // (20px, 30px) restent permises : seule une compensation de barre est traquée.
  it("aucune page ne recommence à compenser la barre elle-même", () => {
    // theme.js est écarté : c'est là que la valeur est définie, et son
    // commentaire cite justement l'ancienne écriture qu'on traque ici.
    const fautifs = fichiers.filter((f) => f !== 'src/theme.js').filter((f) => {
      const declarations = readFileSync(f, 'utf8').matchAll(
        /(?:marginTop|mt):\s*['"](\d+)px['"]/g
      )
      return [...declarations].some(([, valeur]) => Number(valeur) >= 60)
    })

    expect(fautifs).toEqual([])
  })
})
