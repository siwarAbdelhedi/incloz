import { describe, it, expect } from 'vitest'
import theme, { BRAND_FONT } from '../theme'

/** Luminance relative, formule WCAG 2.1. */
const luminance = (hex) => {
  const canaux = hex
    .replace('#', '')
    .match(/../g)
    .map((paire) => {
      const v = parseInt(paire, 16) / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
  return 0.2126 * canaux[0] + 0.7152 * canaux[1] + 0.0722 * canaux[2]
}

const contraste = (a, b) => {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (clair + 0.05) / (sombre + 0.05)
}

const AA_TEXTE = 4.5

const { brand } = theme.palette
const fondsClairs = { crème: brand.cream, pêche: brand.peach, sable: brand.sand }

describe('Palette', () => {
  // Régression : text.secondary valait '#FD5C3', un hexadécimal à 5 caractères.
  // Le navigateur ignore silencieusement une couleur invalide — rien ne le
  // signalait, ni au build ni à l'exécution.
  it('ne contient que des hexadécimaux valides', () => {
    const couleurs = [
      ['primary.main', theme.palette.primary.main],
      ['primary.light', theme.palette.primary.light],
      ['primary.dark', theme.palette.primary.dark],
      ['secondary.main', theme.palette.secondary.main],
      ['text.primary', theme.palette.text.primary],
      ['text.secondary', theme.palette.text.secondary],
      ['background.default', theme.palette.background.default],
      ...Object.entries(brand),
    ]

    for (const [nom, valeur] of couleurs) {
      expect(valeur, `${nom} = ${valeur}`).toMatch(/^#[0-9a-fA-F]{6}$/)
    }
  })

  it('expose les trois nuances de crème de la charte', () => {
    expect(Object.keys(fondsClairs)).toHaveLength(3)
    expect(new Set(Object.values(fondsClairs)).size).toBe(3)
  })
})

describe('Contrastes WCAG AA', () => {
  it('le texte principal est lisible sur les trois fonds clairs', () => {
    for (const [nom, fond] of Object.entries(fondsClairs)) {
      const ratio = contraste(theme.palette.text.primary, fond)
      expect(ratio, `texte principal sur ${nom} : ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
    }
  })

  it('le texte secondaire est lisible sur les trois fonds clairs', () => {
    for (const [nom, fond] of Object.entries(fondsClairs)) {
      const ratio = contraste(theme.palette.text.secondary, fond)
      expect(ratio, `texte secondaire sur ${nom} : ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
    }
  })

  // L'orange de marque d'origine (#FD4802) plafonne à 3,44:1 avec du texte
  // blanc : il ne peut pas porter de texte. `main` est la version assombrie
  // qui passe le seuil, `light` reste réservée aux aplats décoratifs.
  it('le bouton primaire est lisible avec son contrastText', () => {
    const ratio = contraste(theme.palette.primary.contrastText, theme.palette.primary.main)
    expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
  })

  it('le bouton secondaire est lisible avec son contrastText', () => {
    const ratio = contraste(theme.palette.secondary.contrastText, theme.palette.secondary.main)
    expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
  })

  it("l'orange sombre est lisible en texte sur les trois fonds clairs", () => {
    for (const [nom, fond] of Object.entries(fondsClairs)) {
      const ratio = contraste(theme.palette.primary.dark, fond)
      expect(ratio, `orange sombre sur ${nom} : ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
    }
  })

  // Le blanc est le quatrième fond du site : c'est celui des cartes, des
  // tableaux et des panneaux d'administration. Il manquait à cette liste.
  it("l'orange sombre est lisible sur le fond des cartes", () => {
    const ratio = contraste(theme.palette.primary.dark, theme.palette.background.paper)
    expect(ratio, `${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(AA_TEXTE)
  })
})

describe('Typographie', () => {
  it('la police de marque est en tête de la pile', () => {
    expect(theme.typography.fontFamily.startsWith(BRAND_FONT)).toBe(true)
  })

  it('prévoit une police de repli', () => {
    expect(theme.typography.fontFamily.split(',').length).toBeGreaterThan(1)
  })

  it('définit une échelle de titres complète', () => {
    for (const niveau of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']) {
      expect(theme.typography[niveau].fontSize, niveau).toBeTruthy()
    }
  })
})

describe('Mise en page', () => {
  // Les pages appliquaient toutes `marginTop: '70px'` pour compenser la barre
  // fixe. Mesurée dans un navigateur sur dix largeurs de fenêtre, elle fait
  // 56px jusqu'à 599px puis 64px : le palier est `sm`, pas `md`. La première
  // estimation posée avec la charte (72/80px) dépassait de 16px.
  it('expose la hauteur réelle de la barre fixe', () => {
    expect(theme.layout.headerOffset).toEqual({ xs: '56px', sm: '64px' })
  })

  it('expose un rayon unique pour les boutons pilule', () => {
    expect(theme.layout.pillRadius).toBeTruthy()
  })
})
