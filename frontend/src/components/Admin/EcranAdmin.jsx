import { Box, Chip, Container, Typography, Button, Alert, Stack } from '@mui/material'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { echeance } from '../../utils/dates'

/**
 * Coquille commune aux écrans d'administration.
 *
 * Le fond sable est la nuance que la charte réserve à l'espace connecté — voir
 * `theme.js`. L'écrire ici plutôt que dans chaque page évite qu'une quatrième
 * teinte n'apparaisse à la prochaine page ajoutée.
 *
 * Le titre est toujours un `<h1>` : une page annonce son sujet, y compris quand
 * ce sujet est une panne ou une absence.
 */
export const EcranAdmin = ({ titre, action, children }) => (
  <Box sx={{ backgroundColor: 'brand.sand', minHeight: '80vh', py: { xs: 3, md: 5 } }}>
    <Container maxWidth="lg">
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ mb: 3, alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography variant="h4" component="h1" sx={{ color: 'brand.navy' }}>
          {titre}
        </Typography>
        {action}
      </Stack>
      {children}
    </Container>
  </Box>
)

EcranAdmin.propTypes = {
  titre: PropTypes.node.isRequired,
  action: PropTypes.node,
  children: PropTypes.node,
}

/**
 * Message occupant la place du contenu attendu : panne, fiche introuvable,
 * liste vide.
 *
 * `onReessayer` n'est passé que lorsque réessayer a un sens. Sur une fiche
 * introuvable, la même requête donnerait indéfiniment le même résultat : le
 * bouton ferait espérer autre chose.
 */
export const Impasse = ({ severite = 'info', message, onReessayer, retour }) => (
  <Alert severity={severite} sx={{ backgroundColor: 'background.paper' }}>
    <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
      <span>{message}</span>
      <Stack direction="row" spacing={1}>
        {onReessayer && (
          <Button variant="contained" size="small" onClick={onReessayer}>
            Réessayer
          </Button>
        )}
        {retour && (
          <Button component={Link} to={retour.to} size="small" variant="outlined">
            {retour.libelle}
          </Button>
        )}
      </Stack>
    </Stack>
  </Alert>
)

Impasse.propTypes = {
  severite: PropTypes.oneOf(['info', 'warning', 'error', 'success']),
  message: PropTypes.node.isRequired,
  onReessayer: PropTypes.func,
  retour: PropTypes.shape({
    to: PropTypes.string.isRequired,
    libelle: PropTypes.string.isRequired,
  }),
}

/**
 * Pastille d'échéance de conservation.
 *
 * Trois traitements visuels pour trois degrés d'urgence : rempli, contourné,
 * neutre. La forme porte donc l'information autant que la teinte — deux rouges
 * voisins seraient difficiles à départager pour qui distingue mal ces couleurs,
 * et impossibles sur une capture en noir et blanc.
 *
 * `warning` de MUI n'est pas employé pour l'échéance proche : blanc sur son
 * `#ed6c02` ne donne que 3,11:1, sous le seuil AA de 4,5:1 que le projet
 * s'impose. `primary.dark`, contourné sur fond blanc, atteint 6,35:1 — et
 * c'est une teinte de la charte, pas une couleur inventée pour l'occasion.
 */
export const PastilleEcheance = ({ expireLe }) => {
  const { texte, urgence } = echeance(expireLe)

  if (urgence === 'echue') {
    return <Chip size="small" color="error" label={texte} sx={{ fontWeight: 600 }} />
  }

  if (urgence === 'proche') {
    return (
      <Chip
        size="small"
        variant="outlined"
        label={texte}
        sx={{ color: 'primary.dark', borderColor: 'primary.dark', fontWeight: 600 }}
      />
    )
  }

  return <Chip size="small" label={texte} />
}

PastilleEcheance.propTypes = {
  expireLe: PropTypes.string,
}

export default EcranAdmin
