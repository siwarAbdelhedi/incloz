import {
  Link,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { Link as RouterLink } from 'react-router-dom'

import { EcranAdmin, Impasse, PastilleEcheance } from '../components/Admin/EcranAdmin'
import { useRessourceAdmin } from '../hooks/useRessourceAdmin'
import { libelleVetement } from '../config/vetements'
import { formaterDate } from '../utils/dates'

const COLONNES = ['Déposée le', 'Demandeur', 'Vêtement', 'Photo', 'Conservation']

const LigneSquelette = () => (
  <TableRow>
    {COLONNES.map((colonne) => (
      <TableCell key={colonne}>
        <Skeleton />
      </TableCell>
    ))}
  </TableRow>
)

/**
 * Liste des demandes sur-mesure déposées par les visiteurs.
 *
 * Ces fiches arrivaient en base sans qu'aucun écran ne permette de les lire :
 * les consulter supposait d'ouvrir un client MongoDB. C'est la seule donnée
 * personnelle que le site collecte réellement.
 */
const AdminDemandes = () => {
  const { donnees, statut, recharger } = useRessourceAdmin('/custom-request')
  const demandes = donnees ?? []

  const contenu = () => {
    if (statut === 'erreur') {
      return (
        <Impasse
          severite="error"
          message="Les demandes n’ont pas pu être chargées. L’API est peut-être injoignable."
          onReessayer={recharger}
        />
      )
    }

    if (statut === 'ok' && demandes.length === 0) {
      return (
        <Impasse message="Aucune demande sur-mesure n’a encore été déposée." />
      )
    }

    return (
      <>
        <Typography sx={{ mb: 2, color: 'text.secondary' }}>
          {statut === 'chargement'
            ? 'Chargement des demandes en cours…'
            : `${demandes.length} demande${demandes.length > 1 ? 's' : ''} conservée${
                demandes.length > 1 ? 's' : ''
              }`}
        </Typography>

        <TableContainer component={Paper}>
          <Table aria-label="Demandes sur-mesure" aria-busy={statut === 'chargement'}>
            <TableHead>
              <TableRow>
                {COLONNES.map((colonne) => (
                  <TableCell key={colonne} scope="col" sx={{ fontWeight: 700 }}>
                    {colonne}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {statut === 'chargement' &&
                [0, 1, 2].map((rang) => <LigneSquelette key={rang} />)}

              {demandes.map((demande) => (
                  <TableRow key={demande._id} hover>
                    <TableCell>{formaterDate(demande.createdAt)}</TableCell>
                    <TableCell>
                      {/* Le nom porte le lien : c'est ce qu'on cherche des yeux
                          pour ouvrir une fiche, et cela évite une colonne
                          « Ouvrir » dont chaque lien s'annoncerait pareil. */}
                      <Link
                        component={RouterLink}
                        to={`/admin/demandes/${demande._id}`}
                        sx={{ color: 'primary.dark', fontWeight: 600 }}
                      >
                        {demande.prenom} {demande.nom}
                      </Link>
                    </TableCell>
                    <TableCell>{libelleVetement(demande.typeVetement)}</TableCell>
                    <TableCell>
                      {demande.aUnePhoto ? (
                        'Oui'
                      ) : (
                        <>
                          <span aria-hidden="true">—</span>
                          <Typography component="span" sx={visuallyHidden}>
                            Aucune
                          </Typography>
                        </>
                      )}
                    </TableCell>
                    <TableCell>
                      <PastilleEcheance expireLe={demande.expireLe} />
                    </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </>
    )
  }

  return <EcranAdmin titre="Demandes sur-mesure">{contenu()}</EcranAdmin>
}

export default AdminDemandes
