import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { readFileSync } from 'node:fs'

import App from '../App'
import { titrePour, TITRE_PAR_DEFAUT, NOM_DU_SITE } from '../config/titres'

vi.mock('axios', () => ({
  default: { get: vi.fn(() => Promise.resolve({ data: [] })) },
}))

const afficherApp = (route = '/') => {
  window.history.pushState({}, '', route)
  return render(<App />)
}

beforeEach(() => {
  window.history.pushState({}, '', '/')
  document.title = ''
})

describe('Titre par route', () => {
  const attendus = [
    ['/', TITRE_PAR_DEFAUT],
    ['/boutique', 'La boutique — Incloz'],
    ['/panier', 'Votre panier — Incloz'],
    ['/ContactForm', 'Nous contacter — Incloz'],
    ['/blog', 'Le blog — Incloz'],
    ['/about', 'Qui sommes-nous ? — Incloz'],
    ['/dashboard', 'Votre espace — Incloz'],
    ['/admin/demandes', 'Demandes sur-mesure — Incloz'],
    ['/admin/demandes/64f0a1', 'Fiche de demande — Incloz'],
    ['/login', 'Connexion — Incloz'],
    ['/register', 'Créer un compte — Incloz'],
    ['/product/64f0a1', 'Fiche produit — Incloz'],
    ['/custom-request', 'Demande sur-mesure — Incloz'],
    ['/cgu', "Conditions générales d'utilisation — Incloz"],
    ['/mentions-legales', 'Mentions légales — Incloz'],
    ['/politique-confidentialite', 'Politique de confidentialité — Incloz'],
    ['/une-route-inconnue', 'Page introuvable — Incloz'],
  ]

  it.each(attendus)('%s → « %s »', (chemin, attendu) => {
    expect(titrePour(chemin)).toBe(attendu)
  })

  // Un titre identique sur deux pages rend l'historique et les favoris du
  // navigateur inexploitables — c'était le cas des quatorze pages du site.
  it('donne un titre distinct à chaque route', () => {
    const titres = attendus.map(([chemin]) => titrePour(chemin))
    expect(new Set(titres).size).toBe(titres.length)
  })

  it("n'ajoute pas le nom du site à l'accueil, qui le porte déjà", () => {
    expect(titrePour('/')).toBe(TITRE_PAR_DEFAUT)
    expect(titrePour('/').endsWith(`— ${NOM_DU_SITE}`)).toBe(false)
  })

  it('nomme le site dans chaque titre', () => {
    for (const [chemin] of attendus) {
      expect(titrePour(chemin), chemin).toContain(NOM_DU_SITE)
    }
  })

  it('ne fait pas correspondre une route au motif de l’accueil', () => {
    expect(titrePour('/boutique')).not.toBe(TITRE_PAR_DEFAUT)
  })
})

describe("Titre de l'onglet dans l'application", () => {
  it('est posé au premier rendu', async () => {
    afficherApp('/boutique')

    await waitFor(() => expect(document.title).toBe('La boutique — Incloz'))
  })

  // Sans effet sur le changement de route, le navigateur ne rechargeant rien,
  // l'onglet garderait indéfiniment le titre de la page d'arrivée.
  it('suit une navigation interne', async () => {
    afficherApp('/')
    await waitFor(() => expect(document.title).toBe(TITRE_PAR_DEFAUT))

    const lien = document.querySelector('nav a[href="/blog"]')
    await userEvent.click(lien)

    await waitFor(() => expect(document.title).toBe('Le blog — Incloz'))
  })
})

describe('Coquille HTML', () => {
  const html = readFileSync('index.html', 'utf8')

  it('déclare le français', () => {
    expect(html).toMatch(/<html lang="fr">/)
  })

  // Le titre servi aux robots qui n'exécutent pas le JavaScript contenait une
  // coquille : « Inclozing ».
  it('ne contient plus la coquille du titre', () => {
    expect(html).not.toContain('Inclozing')
    expect(html).toContain(`<title>${TITRE_PAR_DEFAUT}</title>`)
  })

  it('décrit le site pour les moteurs de recherche', () => {
    const description = html.match(/name="description"[\s\S]*?content="([^"]+)"/)?.[1]

    expect(description).toBeTruthy()
    // Au-delà d'environ 160 caractères, Google tronque.
    expect(description.length).toBeLessThanOrEqual(160)
    expect(description.length).toBeGreaterThan(60)
  })

  it('porte le favicon Incloz et non celui de Vite', () => {
    expect(html).not.toContain('vite.svg')
    expect(html).toContain('/favicon-32.png')
    expect(html).toContain('/favicon-180.png')
  })

  it('décrit un aperçu de partage complet', () => {
    for (const balise of [
      'og:type', 'og:site_name', 'og:locale', 'og:title',
      'og:description', 'og:url', 'og:image', 'og:image:alt',
      'twitter:card',
    ]) {
      expect(html, balise).toContain(balise)
    }
  })

  // Une URL relative dans og:image est ignorée par Facebook comme par
  // LinkedIn : l'aperçu s'affiche alors sans visuel.
  it('construit des URL de partage absolues', () => {
    const image = html.match(/property="og:image" content="([^"]+)"/)?.[1]
    const url = html.match(/property="og:url" content="([^"]+)"/)?.[1]

    expect(image).toBe('%VITE_SITE_URL%/partage-incloz.png')
    expect(url).toBe('%VITE_SITE_URL%/')
  })

  // Sans cette variable, Vite laisserait le marqueur « %VITE_SITE_URL% » tel
  // quel dans le HTML produit, et l'aperçu serait cassé en production.
  it('définit la variable substituée au build', () => {
    expect(readFileSync('.env', 'utf8')).toMatch(/^VITE_SITE_URL=https?:\/\/\S+$/m)
  })
})
