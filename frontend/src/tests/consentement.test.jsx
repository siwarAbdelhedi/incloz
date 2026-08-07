import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import axios from 'axios'

import theme from '../theme'
import CustomRequest from '../components/Forms/CustomRequest'
import { DUREE_CONSERVATION_MOIS } from '../config/entreprise'

vi.mock('axios')

// Ni `getByRole` ni `userEvent` ne sont utilisables sur cet écran : jsdom
// échoue à calculer les styles de ce sous-arbre — `resolveLengthInPixels` sur
// les tailles de police — et tout ce qui passe par getComputedStyle plante.
//
// Le défaut est antérieur à ce formulaire de consentement : la même requête
// échoue déjà sur le bouton « Envoyer » de la version précédente du composant.
// Il est signalé à part ; le contourner ici serait le masquer, l'éviter permet
// au moins de tester le consentement aujourd'hui.
//
// `getByLabelText` et `fireEvent` ne calculent aucun style. Le premier vérifie
// en prime ce qui compte ici : que le libellé est bien associé à la case, donc
// annoncé avec elle par un lecteur d'écran.
const afficher = () =>
  render(
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <CustomRequest />
      </MemoryRouter>
    </ThemeProvider>
  )

const caseConsentement = () => screen.getByLabelText(/j’accepte qu’incloz utilise/i)

const remplirEtEnvoyer = ({ consentir = true } = {}) => {
  fireEvent.change(screen.getByLabelText('Nom'), { target: { value: 'Durand' } })
  fireEvent.change(screen.getByLabelText('Prénom'), { target: { value: 'Camille' } })
  fireEvent.change(screen.getByLabelText('Mail'), {
    target: { value: 'camille@exemple.fr' },
  })
  fireEvent.change(screen.getByLabelText('Téléphone'), {
    target: { value: '0600000000' },
  })

  if (consentir) fireEvent.click(caseConsentement())

  fireEvent.submit(document.querySelector('form'))
}

beforeEach(() => {
  // `restoreAllMocks` rétablit les espions mais ne vide pas l'historique des
  // appels du module simulé : sans ce nettoyage, `mock.calls[0]` désigne
  // l'envoi du test précédent, et l'assertion porte sur la mauvaise requête.
  vi.clearAllMocks()
  vi.spyOn(window, 'alert').mockImplementation(() => {})
  axios.post.mockResolvedValue({ data: { message: 'Demande enregistrée' } })
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('Consentement sur le formulaire sur-mesure', () => {
  it('présente une case de consentement', () => {
    afficher()
    expect(caseConsentement()).toBeInTheDocument()
  })

  // Un consentement pré-coché n'en est pas un : il doit résulter d'un acte
  // positif de la personne.
  it('ne la pré-coche pas', () => {
    afficher()
    expect(caseConsentement()).not.toBeChecked()
  })

  it('la rend obligatoire', () => {
    afficher()
    expect(caseConsentement()).toBeRequired()
  })

  it('annonce la durée de conservation', () => {
    afficher()
    expect(
      screen.getByText(new RegExp(`conservées ${DUREE_CONSERVATION_MOIS} mois`, 'i'))
    ).toBeInTheDocument()
  })

  it('renvoie vers la politique de confidentialité', () => {
    const { container } = afficher()
    const lien = container.querySelector('a[href="/politique-confidentialite"]')

    expect(lien).toBeInTheDocument()
    expect(lien).toHaveTextContent(/politique de confidentialité/i)
  })

  it('transmet le consentement à l’API quand la case est cochée', async () => {
    afficher()
    remplirEtEnvoyer()

    await waitFor(() => expect(axios.post).toHaveBeenCalled())

    const corps = axios.post.mock.calls[0][1]
    expect(corps.get('consentement')).toBe('true')
    expect(corps.get('nom')).toBe('Durand')
  })

  // La case non cochée part quand même, avec la valeur « false » : c'est l'API
  // qui tranche, pas seulement le navigateur. Un envoi contournant la
  // validation HTML doit être refusé côté serveur.
  it('transmet un refus explicite quand la case reste décochée', async () => {
    afficher()
    remplirEtEnvoyer({ consentir: false })

    await waitFor(() => expect(axios.post).toHaveBeenCalled())
    expect(axios.post.mock.calls[0][1].get('consentement')).toBe('false')
  })

  it('remet la case à zéro après un envoi réussi', async () => {
    afficher()
    remplirEtEnvoyer()

    await waitFor(() => expect(caseConsentement()).not.toBeChecked())
  })
})

describe('Retour en cas de refus de l’API', () => {
  // L'API refuse désormais une demande sans consentement. Avant, l'échec ne
  // partait qu'en console : le visiteur repartait en croyant sa demande
  // envoyée.
  it('affiche le message de refus renvoyé par l’API', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { message: 'Le consentement au traitement des données est obligatoire' },
      },
    })

    afficher()
    remplirEtEnvoyer({ consentir: false })

    expect(await screen.findByText(/consentement au traitement/i)).toBeInTheDocument()
  })

  it('reste compréhensible quand l’API ne répond pas du tout', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'))

    afficher()
    remplirEtEnvoyer()

    expect(await screen.findByText(/l’envoi a échoué/i)).toBeInTheDocument()
  })

  it('n’annonce pas un succès quand l’envoi a échoué', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'))

    afficher()
    remplirEtEnvoyer()

    await screen.findByText(/l’envoi a échoué/i)
    expect(window.alert).not.toHaveBeenCalled()
  })
})
