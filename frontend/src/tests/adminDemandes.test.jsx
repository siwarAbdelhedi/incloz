import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import axios from 'axios'

import theme from '../theme'
import App from '../App'
import AuthProvider from '../context/AuthProvider'
import AdminDemandes from '../pages/AdminDemandes'
import AdminFicheDemande from '../pages/AdminFicheDemande'
import { setStoredUser, clearStoredUser } from '../utils/auth'
import { formaterDate, formaterDateHeure, joursAvant, echeance } from '../utils/dates'

vi.mock('axios')

const ADMIN = { _id: 'a1', name: 'Camille Martin', isAdmin: true, token: 'jeton-admin' }

/**
 * Une demande telle que l'API la renvoie : le nom du fichier n'y figure pas,
 * seuls `aUnePhoto` et `photoUrl` le remplacent.
 */
const demande = (surcharge = {}) => ({
  _id: 'd1',
  nom: 'Durand',
  prenom: 'Alex',
  email: 'alex@exemple.fr',
  telephone: '0600000000',
  rue: '12 rue des Sports',
  ville: 'Nantes',
  codePostal: '44000',
  typeVetement: 'jogging',
  taille: 172,
  hanches: 96,
  cuisse: 58,
  entrejambe: 78,
  aUnePhoto: true,
  photoUrl: '/api/custom-request/d1/photo',
  createdAt: '2026-08-01T09:30:00.000Z',
  consentementLe: '2026-08-01T09:30:00.000Z',
  versionPolitique: '2026-08-07',
  expireLe: '2027-08-01T09:30:00.000Z',
  ...surcharge,
})

/** Date ISO située dans N jours — les échéances relatives se testent mal en dur. */
const nDansNJours = (n) => new Date(Date.now() + n * 864e5).toISOString()

const enAttente = () => new Promise(() => {})
const echecReseau = () => Object.assign(new Error('Network Error'), { response: undefined })
const echec404 = () => Object.assign(new Error('Not Found'), { response: { status: 404 } })

const afficher = (element, route = '/admin/demandes') =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter initialEntries={[route]}>
        <AuthProvider>
          <Routes>
            <Route path="/admin/demandes" element={element} />
            <Route path="/admin/demandes/:id" element={element} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    </ThemeProvider>
  )

beforeEach(() => {
  vi.clearAllMocks()
  vi.spyOn(console, 'error').mockImplementation(() => {})
  setStoredUser(ADMIN)
})

afterEach(() => {
  vi.restoreAllMocks()
  clearStoredUser()
})

describe('Accès à l’administration', () => {
  const afficherApp = (route) => {
    window.history.pushState({}, '', route)
    return render(<App />)
  }

  it('renvoie un visiteur anonyme vers la connexion', async () => {
    clearStoredUser()
    axios.get.mockResolvedValue({ data: [] })

    afficherApp('/admin/demandes')

    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })

  // Il est authentifié : lui redemander ses identifiants n'aurait aucun sens.
  it('renvoie un compte ordinaire vers son propre espace', async () => {
    setStoredUser({ ...ADMIN, isAdmin: false })
    axios.get.mockResolvedValue({ data: [] })

    afficherApp('/admin/demandes')

    await waitFor(() => expect(window.location.pathname).toBe('/dashboard'))
  })

  it('laisse passer un administrateur', async () => {
    axios.get.mockResolvedValue({ data: [] })

    afficherApp('/admin/demandes')

    await waitFor(() => expect(window.location.pathname).toBe('/admin/demandes'))
  })
})

describe('Liste des demandes — chargement', () => {
  it('annonce le chargement au lieu d’un tableau vide', () => {
    axios.get.mockImplementation(enAttente)
    const { container } = afficher(<AdminDemandes />)

    expect(screen.getByText(/chargement des demandes en cours/i)).toBeInTheDocument()
    expect(container.querySelector('[aria-busy="true"]')).toBeInTheDocument()
    expect(container.querySelectorAll('.MuiSkeleton-root').length).toBeGreaterThan(0)
  })

  // La route refuse une requête sans en-tête Authorization : sans le jeton,
  // l'écran ne pourrait afficher qu'une erreur 401.
  it('présente le jeton de session à l’API', async () => {
    axios.get.mockResolvedValue({ data: [] })
    afficher(<AdminDemandes />)

    await waitFor(() => expect(axios.get).toHaveBeenCalled())
    const [, options] = axios.get.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer jeton-admin')
  })
})

describe('Liste des demandes — panne et vide', () => {
  it('dit que les demandes n’ont pas pu être chargées', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficher(<AdminDemandes />)

    expect(await screen.findByText(/n’ont pas pu être chargées/i)).toBeInTheDocument()
  })

  it('propose de réessayer, et relance vraiment l’appel', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficher(<AdminDemandes />)

    const bouton = await screen.findByText('Réessayer')
    expect(axios.get).toHaveBeenCalledTimes(1)

    axios.get.mockResolvedValue({ data: [demande()] })
    fireEvent.click(bouton)

    await waitFor(() => expect(screen.getByText('Alex Durand')).toBeInTheDocument())
    expect(axios.get).toHaveBeenCalledTimes(2)
  })

  // Une liste vide et une panne sont deux vérités différentes.
  it('distingue « aucune demande » d’une panne', async () => {
    axios.get.mockResolvedValue({ data: [] })
    afficher(<AdminDemandes />)

    expect(await screen.findByText(/aucune demande sur-mesure/i)).toBeInTheDocument()
    expect(screen.queryByText(/n’ont pas pu être chargées/i)).not.toBeInTheDocument()
  })
})

describe('Liste des demandes — contenu', () => {
  it('affiche chaque demande et mène à sa fiche', async () => {
    axios.get.mockResolvedValue({ data: [demande()] })
    const { container } = afficher(<AdminDemandes />)

    await screen.findByText('Alex Durand')

    const lien = container.querySelector('a[href="/admin/demandes/d1"]')
    expect(lien).toHaveTextContent('Alex Durand')
  })

  // Le code stocké en base ne se lit pas : l'écran affiche le libellé que le
  // visiteur a lui-même choisi dans le formulaire.
  it('nomme le vêtement comme le formulaire le propose', async () => {
    axios.get.mockResolvedValue({ data: [demande()] })
    afficher(<AdminDemandes />)

    expect(await screen.findByText('Jogging fitness')).toBeInTheDocument()
    expect(screen.queryByText('jogging')).not.toBeInTheDocument()
  })

  it('compte les demandes conservées', async () => {
    axios.get.mockResolvedValue({ data: [demande(), demande({ _id: 'd2' })] })
    afficher(<AdminDemandes />)

    expect(await screen.findByText(/2 demandes conservées/i)).toBeInTheDocument()
  })

  it('signale une fiche que la purge aurait dû emporter', async () => {
    axios.get.mockResolvedValue({
      data: [demande({ expireLe: '2020-01-01T00:00:00.000Z' })],
    })
    afficher(<AdminDemandes />)

    expect(await screen.findByText('Conservation échue')).toBeInTheDocument()
  })
})

describe('Fiche — états', () => {
  it('dit qu’une demande est introuvable, sans proposer de réessayer', async () => {
    axios.get.mockRejectedValue(echec404())
    afficher(<AdminFicheDemande />, '/admin/demandes/inconnue')

    expect(await screen.findByText(/n’existe pas, ou elle a déjà été effacée/i)).toBeInTheDocument()
    expect(screen.queryByText('Réessayer')).not.toBeInTheDocument()
  })

  it('distingue une panne d’une fiche introuvable', async () => {
    axios.get.mockRejectedValue(echecReseau())
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    expect(await screen.findByText(/n’a pas pu être chargée/i)).toBeInTheDocument()
    expect(screen.getByText('Réessayer')).toBeInTheDocument()
  })

  it('annonce son sujet par un titre unique, quel que soit l’état', async () => {
    axios.get.mockRejectedValue(echec404())
    const { container } = afficher(<AdminFicheDemande />, '/admin/demandes/inconnue')

    await screen.findByText(/n’existe pas/i)
    expect(container.querySelectorAll('h1')).toHaveLength(1)
  })
})

describe('Fiche — contenu', () => {
  const afficherFiche = (surcharge = {}) => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/photo')
        ? Promise.resolve({ data: new Blob(['x'], { type: 'image/png' }) })
        : Promise.resolve({ data: demande(surcharge) })
    )
    return afficher(<AdminFicheDemande />, '/admin/demandes/d1')
  }

  it('affiche les coordonnées, joignables d’un clic', async () => {
    const { container } = afficherFiche()

    await screen.findByText('alex@exemple.fr')
    expect(container.querySelector('a[href="mailto:alex@exemple.fr"]')).toBeInTheDocument()
    expect(container.querySelector('a[href="tel:0600000000"]')).toBeInTheDocument()
  })

  it('affiche les mensurations avec leur unité', async () => {
    afficherFiche()

    expect(await screen.findByText('172 cm')).toBeInTheDocument()
    expect(screen.getByText('96 cm')).toBeInTheDocument()
  })

  // Ce bloc est ce qui rend la détention de la fiche justifiable.
  it('affiche la preuve du consentement et le terme de conservation', async () => {
    afficherFiche()

    await screen.findByText(/Consentement recueilli le/i)
    expect(screen.getByText('2026-08-07')).toBeInTheDocument()
    expect(screen.getByText(/Effacement prévu le/i)).toBeInTheDocument()
  })

  it('signale une mensuration non renseignée plutôt que de laisser un blanc', async () => {
    afficherFiche({ cuisse: undefined })

    expect(await screen.findAllByText('Non renseigné')).not.toHaveLength(0)
  })

  it('dit quand aucun fichier n’accompagne la demande', async () => {
    axios.get.mockResolvedValue({ data: demande({ aUnePhoto: false }) })
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    expect(await screen.findByText(/aucun fichier n’accompagne/i)).toBeInTheDocument()
  })
})

describe('Fiche — pièce jointe', () => {
  beforeEach(() => {
    // jsdom n'implémente pas createObjectURL : c'est une API du navigateur.
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:photo'),
      revokeObjectURL: vi.fn(),
    })
  })

  // Un <img src> ne porterait pas d'en-tête Authorization : le navigateur n'en
  // envoie jamais en chargeant une image. La photo doit donc être récupérée par
  // requête, puis transformée en URL locale.
  it('récupère la photo avec le jeton, en binaire', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/photo')
        ? Promise.resolve({ data: new Blob(['x'], { type: 'image/png' }) })
        : Promise.resolve({ data: demande() })
    )
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    await waitFor(() => {
      const appel = axios.get.mock.calls.find(([url]) => url.endsWith('/photo'))
      expect(appel?.[1].responseType).toBe('blob')
      expect(appel?.[1].headers.Authorization).toBe('Bearer jeton-admin')
    })
  })

  it('affiche la photo obtenue', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/photo')
        ? Promise.resolve({ data: new Blob(['x'], { type: 'image/png' }) })
        : Promise.resolve({ data: demande() })
    )
    const { container } = afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    await waitFor(() =>
      expect(container.querySelector('img[src="blob:photo"]')).toBeInTheDocument()
    )
  })

  // L'API accepte aussi les PDF : un <img> n'afficherait alors rien du tout.
  it('propose d’ouvrir un PDF plutôt que de l’afficher comme une image', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/photo')
        ? Promise.resolve({ data: new Blob(['x'], { type: 'application/pdf' }) })
        : Promise.resolve({ data: demande() })
    )
    const { container } = afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    expect(await screen.findByText(/ouvrir le document joint/i)).toBeInTheDocument()
    expect(container.querySelector('img[src="blob:photo"]')).toBeNull()
  })

  it('ne bloque pas la fiche quand la photo manque', async () => {
    axios.get.mockImplementation((url) =>
      url.endsWith('/photo')
        ? Promise.reject(echec404())
        : Promise.resolve({ data: demande() })
    )
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    expect(await screen.findByText(/pièce jointe n’a pas pu être chargée/i)).toBeInTheDocument()
    expect(screen.getByText('alex@exemple.fr')).toBeInTheDocument()
  })
})

describe('Fiche — effacement', () => {
  const ouvrirEtEffacer = async () => {
    axios.get.mockResolvedValue({ data: demande({ aUnePhoto: false }) })
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    fireEvent.click(await screen.findByText('Effacer cette demande'))
    return screen.findByText('Effacer définitivement')
  }

  // Un effacement irréversible déclenché par un clic unique, au milieu d'une
  // page de données personnelles, se produirait par accident.
  it('demande confirmation avant d’effacer', async () => {
    axios.get.mockResolvedValue({ data: demande({ aUnePhoto: false }) })
    afficher(<AdminFicheDemande />, '/admin/demandes/d1')

    fireEvent.click(await screen.findByText('Effacer cette demande'))

    expect(await screen.findByText(/ne peut pas être annulée/i)).toBeInTheDocument()
    expect(axios.delete).not.toHaveBeenCalled()
  })

  it('efface avec le jeton une fois confirmé', async () => {
    axios.delete.mockResolvedValue({ data: { message: 'Demande effacée' } })
    const confirmer = await ouvrirEtEffacer()

    fireEvent.click(confirmer)

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1))
    const [url, options] = axios.delete.mock.calls[0]
    expect(url).toMatch(/\/custom-request\/d1$/)
    expect(options.headers.Authorization).toBe('Bearer jeton-admin')
  })

  it('garde la fiche et le dit quand l’effacement échoue', async () => {
    axios.delete.mockRejectedValue(echecReseau())
    const confirmer = await ouvrirEtEffacer()

    fireEvent.click(confirmer)

    const alerte = await screen.findByText(/l’effacement a échoué/i)
    expect(alerte.closest('[role="alert"]')).toBeInTheDocument()
    expect(screen.getByText('alex@exemple.fr')).toBeInTheDocument()
  })
})

describe('Pastilles d’échéance', () => {
  // `warning` de MUI plafonne à 3,11:1 avec du texte blanc, sous le seuil AA
  // que le projet s'impose et revérifie — voir theme.test.js.
  it('n’emploie pas la teinte « warning » de MUI, illisible', async () => {
    axios.get.mockResolvedValue({ data: [demande({ expireLe: nDansNJours(4) })] })
    const { container } = afficher(<AdminDemandes />)

    await screen.findByText(/expire dans 4 jours/i)
    expect(container.querySelector('.MuiChip-colorWarning')).toBeNull()
  })

  // Deux rouges voisins ne se départageraient pas au premier regard, ni pour
  // qui distingue mal ces teintes, ni sur une capture en noir et blanc.
  it('distingue les deux urgences par la forme, pas seulement par la teinte', async () => {
    axios.get.mockResolvedValue({
      data: [
        demande({ _id: 'echue', expireLe: '2020-01-01T00:00:00.000Z' }),
        demande({ _id: 'proche', nom: 'Bernard', prenom: 'Sacha', expireLe: nDansNJours(4) }),
      ],
    })
    const { container } = afficher(<AdminDemandes />)

    await screen.findByText('Conservation échue')

    expect(container.querySelectorAll('.MuiChip-outlined')).toHaveLength(1)
    expect(container.querySelectorAll('.MuiChip-filled')).toHaveLength(1)
  })
})

describe('Mise en forme des dates', () => {
  it('écrit une date en français', () => {
    expect(formaterDate('2026-08-07T12:00:00.000Z')).toBe('7 août 2026')
  })

  it('ajoute l’heure quand elle compte', () => {
    expect(formaterDateHeure('2026-08-07T12:00:00.000Z')).toMatch(/^7 août 2026 à \d{2}:\d{2}$/)
  })

  it('ne casse pas sur une date absente ou illisible', () => {
    expect(formaterDate(undefined)).toBeNull()
    expect(formaterDate('pas une date')).toBeNull()
    expect(joursAvant(null)).toBeNull()
  })

  // `new Date(null)` ne renvoie pas une date invalide mais le 1ᵉʳ janvier 1970 :
  // une fiche sans terme de conservation aurait été annoncée bonne à effacer.
  it('n’invente pas une échéance quand la date manque', () => {
    expect(echeance(null).texte).toBe('Échéance inconnue')
    expect(echeance(undefined).urgence).toBe('inconnue')
  })

  // Une échéance fixée à 9h et consultée à 10h la veille tombe bien le
  // lendemain, pas « dans 0 jour ».
  it('compte les jours en journées entières', () => {
    const maintenant = new Date('2026-08-06T10:00:00')
    expect(joursAvant('2026-08-07T09:00:00', maintenant)).toBe(1)
  })

  it('bascule sur un décompte quand le terme approche', () => {
    const maintenant = new Date('2026-08-01T12:00:00')

    expect(echeance('2026-08-05T12:00:00', maintenant).texte).toBe('Expire dans 4 jours')
    expect(echeance('2026-08-02T12:00:00', maintenant).texte).toBe('Expire dans 1 jour')
    expect(echeance('2026-08-01T12:00:00', maintenant).texte).toBe("Expire aujourd'hui")
  })

  it('garde une date lisible quand le terme est lointain', () => {
    const maintenant = new Date('2026-08-01T12:00:00')

    expect(echeance('2027-08-01T12:00:00', maintenant)).toEqual({
      texte: 'Expire le 1 août 2027',
      urgence: 'lointaine',
    })
  })

  it('signale une conservation dépassée', () => {
    const maintenant = new Date('2026-08-01T12:00:00')

    expect(echeance('2026-07-31T12:00:00', maintenant)).toEqual({
      texte: 'Conservation échue',
      urgence: 'echue',
    })
  })
})
