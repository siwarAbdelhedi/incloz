import { useState, useEffect } from 'react'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Link as LienTexte,
  Paper,
  Skeleton,
  Typography,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { Link, useNavigate, useParams } from 'react-router-dom'
import PropTypes from 'prop-types'
import axios from 'axios'

import { EcranAdmin, Impasse, PastilleEcheance } from '../components/Admin/EcranAdmin'
import { useRessourceAdmin } from '../hooks/useRessourceAdmin'
import { useAuth } from '../hooks/useAuth'
import { API_URL } from '../config/api'
import { libelleVetement } from '../config/vetements'
import { formaterDate, formaterDateHeure } from '../utils/dates'

const RETOUR = { to: '/admin/demandes', libelle: 'Retour aux demandes' }

/**
 * Ligne d'une liste de définitions. Une valeur absente affiche un tiret visible
 * et « Non renseigné » pour qui écoute la page : un blanc ne se distinguerait
 * pas d'un champ oublié à l'affichage.
 */
const Champ = ({ libelle, valeur, unite }) => (
  <>
    <Typography component="dt" variant="body2" sx={{ color: 'text.secondary' }}>
      {libelle}
    </Typography>
    <Typography component="dd" sx={{ m: 0, mb: 1.5, fontWeight: 500 }}>
      {valeur === null || valeur === undefined || valeur === '' ? (
        <>
          <span aria-hidden="true">—</span>
          <Box component="span" sx={visuallyHidden}>
            Non renseigné
          </Box>
        </>
      ) : (
        <>
          {valeur}
          {unite ? ` ${unite}` : null}
        </>
      )}
    </Typography>
  </>
)

Champ.propTypes = {
  libelle: PropTypes.string.isRequired,
  valeur: PropTypes.node,
  unite: PropTypes.string,
}

const Section = ({ titre, children }) => (
  <Paper sx={{ p: 3, height: '100%' }}>
    <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'brand.navy' }}>
      {titre}
    </Typography>
    <Box component="dl" sx={{ m: 0 }}>
      {children}
    </Box>
  </Paper>
)

Section.propTypes = {
  titre: PropTypes.string.isRequired,
  children: PropTypes.node,
}

/**
 * Pièce jointe d'une demande.
 *
 * Elle ne peut pas être posée dans un `src` : la route qui la sert exige un
 * en-tête `Authorization`, que le navigateur n'envoie jamais en chargeant une
 * image. Le fichier est donc récupéré par requête, puis transformé en URL
 * locale — libérée au démontage, sinon le navigateur garde le contenu en
 * mémoire pour toute la durée de la session.
 *
 * L'API accepte aussi les PDF : un `<img>` n'afficherait alors rien.
 */
const PieceJointe = ({ id }) => {
  const { user } = useAuth()
  const jeton = user?.token

  const [fichier, setFichier] = useState(null)
  const [statut, setStatut] = useState('chargement')

  useEffect(() => {
    let annule = false
    let urlLocale = null

    axios
      .get(`${API_URL}/custom-request/${id}/photo`, {
        responseType: 'blob',
        headers: { Authorization: `Bearer ${jeton}` },
      })
      .then(({ data }) => {
        if (annule) return
        urlLocale = URL.createObjectURL(data)
        setFichier({ url: urlLocale, estPdf: data.type === 'application/pdf' })
        setStatut('ok')
      })
      .catch((erreur) => {
        if (annule) return
        console.error('Chargement de la pièce jointe impossible', erreur)
        setStatut('erreur')
      })

    return () => {
      annule = true
      if (urlLocale) URL.revokeObjectURL(urlLocale)
    }
  }, [id, jeton])

  if (statut === 'chargement') {
    return <Skeleton variant="rectangular" height={260} />
  }

  if (statut === 'erreur') {
    return (
      <Alert severity="warning">
        La pièce jointe n’a pas pu être chargée. Le fichier a peut-être déjà été
        effacé par la purge.
      </Alert>
    )
  }

  if (fichier.estPdf) {
    return (
      <Button component="a" href={fichier.url} target="_blank" rel="noreferrer" variant="outlined">
        Ouvrir le document joint (PDF)
      </Button>
    )
  }

  return (
    <Box
      component="img"
      src={fichier.url}
      alt="Photo jointe à la demande sur-mesure"
      sx={{ maxWidth: '100%', borderRadius: 1, display: 'block' }}
    />
  )
}

PieceJointe.propTypes = {
  id: PropTypes.string.isRequired,
}

/**
 * Fiche complète d'une demande sur-mesure, et seul endroit d'où elle peut être
 * effacée à la main.
 */
const AdminFicheDemande = () => {
  const { id } = useParams()
  const { donnees: demande, statut, recharger } = useRessourceAdmin(`/custom-request/${id}`)
  const { user } = useAuth()
  const navigate = useNavigate()

  const [confirmation, setConfirmation] = useState(false)
  const [effacement, setEffacement] = useState('inactif')

  const effacer = async () => {
    setEffacement('encours')

    try {
      await axios.delete(`${API_URL}/custom-request/${id}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      })
      setConfirmation(false)
      navigate('/admin/demandes')
    } catch (erreur) {
      console.error('Effacement impossible', erreur)
      setEffacement('erreur')
    }
  }

  if (statut === 'chargement') {
    return (
      <EcranAdmin titre="Chargement de la demande">
        <Skeleton variant="rectangular" height={320} />
      </EcranAdmin>
    )
  }

  if (statut === 'introuvable') {
    return (
      <EcranAdmin titre="Demande introuvable">
        <Impasse
          severite="warning"
          message="Cette demande n’existe pas, ou elle a déjà été effacée."
          retour={RETOUR}
        />
      </EcranAdmin>
    )
  }

  if (statut === 'erreur') {
    return (
      <EcranAdmin titre="Demande indisponible">
        <Impasse
          severite="error"
          message="La demande n’a pas pu être chargée. L’API est peut-être injoignable."
          onReessayer={recharger}
          retour={RETOUR}
        />
      </EcranAdmin>
    )
  }

  const adresse = [demande.rue, demande.codePostal, demande.ville].filter(Boolean).join(', ')

  return (
    <EcranAdmin
      titre={`${demande.prenom} ${demande.nom}`}
      action={
        <Button component={Link} to={RETOUR.to} variant="outlined">
          {RETOUR.libelle}
        </Button>
      }
    >
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Section titre="Coordonnées">
            {/* Joignables d'un clic : recopier une adresse à la main depuis un
                écran est la première source d'erreur d'un échange par e-mail. */}
            <Champ
              libelle="Adresse e-mail"
              valeur={
                <LienTexte href={`mailto:${demande.email}`} sx={{ color: 'primary.dark' }}>
                  {demande.email}
                </LienTexte>
              }
            />
            <Champ
              libelle="Téléphone"
              valeur={
                <LienTexte href={`tel:${demande.telephone}`} sx={{ color: 'primary.dark' }}>
                  {demande.telephone}
                </LienTexte>
              }
            />
            <Champ libelle="Adresse postale" valeur={adresse || null} />
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Section titre="Vêtement et mensurations">
            <Champ libelle="Vêtement demandé" valeur={libelleVetement(demande.typeVetement)} />
            <Champ libelle="Taille" valeur={demande.taille} unite="cm" />
            <Champ libelle="Hanches" valeur={demande.hanches} unite="cm" />
            <Champ libelle="Cuisse" valeur={demande.cuisse} unite="cm" />
            <Champ libelle="Entrejambe" valeur={demande.entrejambe} unite="cm" />
          </Section>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'brand.navy' }}>
              Pièce jointe
            </Typography>
            {demande.aUnePhoto ? (
              <PieceJointe id={id} />
            ) : (
              <Typography sx={{ color: 'text.secondary' }}>
                Aucun fichier n’accompagne cette demande.
              </Typography>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" component="h2" sx={{ mb: 2, color: 'brand.navy' }}>
              Consentement et conservation
            </Typography>

            {/* Ce bloc est ce qui rend la détention de la fiche justifiable :
                à quoi la personne a consenti, quand, et jusqu'à quand ces
                données peuvent être gardées. */}
            <Box component="dl" sx={{ m: 0 }}>
              <Champ libelle="Déposée le" valeur={formaterDateHeure(demande.createdAt)} />
              <Champ
                libelle="Consentement recueilli le"
                valeur={formaterDateHeure(demande.consentementLe)}
              />
              <Champ
                libelle="Version de la politique acceptée"
                valeur={demande.versionPolitique}
              />
              <Champ libelle="Effacement prévu le" valeur={formaterDate(demande.expireLe)} />
            </Box>

            <Box sx={{ mt: 1 }}>
              <PastilleEcheance expireLe={demande.expireLe} />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              Toute personne peut demander l’effacement de ses données avant ce
              terme. L’effacement retire la fiche et le fichier joint, et ne peut
              pas être annulé.
            </Typography>

            {effacement === 'erreur' && (
              <Alert severity="error" role="alert" sx={{ mb: 2 }}>
                L’effacement a échoué. La demande est toujours enregistrée.
              </Alert>
            )}

            <Button color="error" variant="contained" onClick={() => setConfirmation(true)}>
              Effacer cette demande
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={confirmation} onClose={() => setConfirmation(false)}>
        <DialogTitle>Effacer la demande de {demande.prenom} {demande.nom} ?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            La fiche et la photo jointe seront supprimées définitivement. Cette
            action ne peut pas être annulée.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmation(false)}>Annuler</Button>
          <Button
            color="error"
            variant="contained"
            onClick={effacer}
            disabled={effacement === 'encours'}
          >
            {effacement === 'encours' ? 'Effacement…' : 'Effacer définitivement'}
          </Button>
        </DialogActions>
      </Dialog>
    </EcranAdmin>
  )
}

export default AdminFicheDemande
