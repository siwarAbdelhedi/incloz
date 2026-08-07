import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'

import theme from '../theme'
import CGU from '../pages/CGU'
import MentionsLegales from '../pages/MentionsLegales'
import PolitiqueConfidentialite from '../pages/PolitiqueConfidentialite'
import { Valeur } from '../components/PageLegale'
import { DUREE_CONSERVATION_MOIS } from '../config/entreprise'

const afficher = (ui) =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>
  )

const PAGES = [
  ['Mentions légales', <MentionsLegales key="ml" />],
  ["Conditions générales d’utilisation", <CGU key="cgu" />],
  ['Politique de confidentialité', <PolitiqueConfidentialite key="pc" />],
]

// Ces trois pages étaient routées, donc publiquement accessibles, et ne
// contenaient qu'un titre. Ce fichier verrouille le fait qu'elles ont un
// contenu réel et une structure exploitable.
describe.each(PAGES)('Page « %s »', (titre, page) => {
  it('porte un titre de premier niveau, et un seul', () => {
    afficher(page)

    const titresPrincipaux = screen.getAllByRole('heading', { level: 1 })
    expect(titresPrincipaux).toHaveLength(1)
    expect(titresPrincipaux[0]).toHaveTextContent(titre)
  })

  it('découpe son contenu en sections annoncées', () => {
    afficher(page)
    expect(screen.getAllByRole('heading', { level: 2 }).length).toBeGreaterThan(2)
  })

  // Les trois pages tenaient en une quarantaine de caractères : un <h1> et
  // rien d'autre. Le seuil est volontairement bas — plusieurs informations
  // légales sont encore des marqueurs « à compléter » — mais il suffit à
  // constater qu'aucune de ces pages n'est retombée à l'état de coquille.
  it('ne se réduit plus à son titre', () => {
    const { container } = afficher(page)
    expect(container.textContent.length).toBeGreaterThan(800)
  })

  it('indique sa date de mise à jour', () => {
    afficher(page)
    // Le deux-points distingue l'en-tête de page des mentions de la date dans
    // le corps du texte.
    expect(screen.getByText(/Dernière mise à jour :/i)).toBeInTheDocument()
  })
})

describe('Marqueur des informations manquantes', () => {
  // Une mention légale incomplète ne doit pas se lire comme un blanc ni comme
  // « undefined » : elle doit se voir, et être annoncée au lecteur d'écran.
  it('rend un marqueur visible quand la valeur est absente', () => {
    afficher(<Valeur champ="SIRET">{null}</Valeur>)

    const marqueur = screen.getByRole('status')
    expect(marqueur).toHaveTextContent(/à compléter\s*:\s*SIRET/i)
  })

  it('rend la valeur telle quelle quand elle est fournie', () => {
    afficher(<Valeur champ="SIRET">123 456 789 00012</Valeur>)

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('123 456 789 00012')).toBeInTheDocument()
  })

  it('traite une chaîne vide comme une valeur absente', () => {
    afficher(<Valeur champ="SIRET">{''}</Valeur>)
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})

describe('Politique de confidentialité — contenu attendu', () => {
  it('annonce la durée de conservation appliquée par l’API', () => {
    afficher(<PolitiqueConfidentialite />)

    const tableau = screen.getByRole('table')
    expect(
      within(tableau).getByText(new RegExp(`${DUREE_CONSERVATION_MOIS} mois`))
    ).toBeInTheDocument()
  })

  // Le site ne dépose aucun cookie et ne charge aucun domaine tiers. C'est ce
  // qui justifie l'absence de bandeau de consentement : si cela changeait, la
  // page devrait changer aussi.
  it('affirme l’absence de cookies et de traceurs', () => {
    afficher(<PolitiqueConfidentialite />)
    expect(screen.getByText(/ne dépose aucun cookie/i)).toBeInTheDocument()
  })

  it('traite le cas des données révélant un état de santé', () => {
    afficher(<PolitiqueConfidentialite />)
    expect(screen.getByRole('heading', { name: /état de santé/i })).toBeInTheDocument()
  })

  it('énumère les droits et indique l’autorité de recours', () => {
    afficher(<PolitiqueConfidentialite />)

    expect(screen.getByRole('heading', { name: /vos droits/i })).toBeInTheDocument()
    expect(screen.getAllByText(/CNIL|informatique et des libertés/i).length).toBeGreaterThan(0)
  })
})

describe('CGU — contenu attendu', () => {
  // Le site ne peut rien vendre : commande et paiement n'existent pas. Les
  // conditions doivent le dire, faute de quoi elles laisseraient croire à un
  // parcours d'achat et appelleraient des CGV.
  it('indique qu’aucun achat en ligne n’est possible', () => {
    afficher(<CGU />)
    expect(screen.getByText(/ne permet pas.*d’acheter un produit en ligne/i)).toBeInTheDocument()
  })

  it('précise qu’une demande sur-mesure n’est pas une commande', () => {
    afficher(<CGU />)
    expect(screen.getByText(/n’est pas une commande/i)).toBeInTheDocument()
  })
})

describe('Mentions légales — contenu attendu', () => {
  // L'hébergeur est une mention obligatoire, souvent oubliée.
  it('réserve une place à l’hébergeur', () => {
    afficher(<MentionsLegales />)
    expect(screen.getByRole('heading', { name: /hébergeur/i })).toBeInTheDocument()
  })

  it('renvoie vers les deux autres pages légales', () => {
    afficher(<MentionsLegales />)

    expect(
      screen.getByRole('link', { name: /politique de confidentialité/i })
    ).toHaveAttribute('href', '/politique-confidentialite')
    expect(
      screen.getByRole('link', { name: /conditions générales/i })
    ).toHaveAttribute('href', '/cgu')
  })
})
