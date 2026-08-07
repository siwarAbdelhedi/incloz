import { Box, Container, Typography } from '@mui/material'
import PropTypes from 'prop-types'

/**
 * Coquille commune aux mentions légales, aux CGU et à la politique de
 * confidentialité.
 *
 * Ces trois pages sont faites pour être lues, pas parcourues : la largeur est
 * bornée pour tenir une longueur de ligne confortable, et la hiérarchie des
 * titres est celle du document — un <h1> pour la page, des <h2> pour ses
 * sections. Aucune couleur n'est réécrite ici, tout vient de theme.js.
 */
const PageLegale = ({ titre, miseAJour, chapeau, children }) => (
  <Box sx={{ backgroundColor: 'brand.cream', py: { xs: 5, md: 8 } }}>
    <Container maxWidth="md">
      <Typography variant="h3" component="h1" color="secondary.main" gutterBottom>
        {titre}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: chapeau ? 2 : 5 }}>
        Dernière mise à jour : {miseAJour}
      </Typography>

      {chapeau && (
        <Typography variant="body1" color="text.primary" sx={{ mb: 5 }}>
          {chapeau}
        </Typography>
      )}

      {children}
    </Container>
  </Box>
)

PageLegale.propTypes = {
  titre: PropTypes.string.isRequired,
  miseAJour: PropTypes.string.isRequired,
  chapeau: PropTypes.node,
  children: PropTypes.node,
}

/**
 * Une section de page légale. Le titre est un <h2> : il n'y a qu'un seul <h1>
 * par page, celui de PageLegale.
 */
export const Section = ({ titre, children }) => (
  <Box component="section" sx={{ mb: 4 }}>
    <Typography variant="h5" component="h2" color="secondary.main" gutterBottom>
      {titre}
    </Typography>
    {children}
  </Box>
)

Section.propTypes = {
  titre: PropTypes.string.isRequired,
  children: PropTypes.node,
}

/** Paragraphe courant d'une page légale. */
export const Paragraphe = ({ children }) => (
  <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
    {children}
  </Typography>
)

Paragraphe.propTypes = { children: PropTypes.node }

/**
 * Affiche une information légale, ou un marqueur bien visible si elle n'a pas
 * encore été fournie.
 *
 * Une mention légale incomplète ne doit pas pouvoir passer inaperçue : elle
 * n'est pas rendue par un blanc, ni par « undefined », mais par une étiquette
 * que personne ne peut confondre avec du contenu. `role="status"` la fait
 * annoncer par un lecteur d'écran comme le reste du texte.
 */
export const Valeur = ({ children, champ }) => {
  if (children !== null && children !== undefined && children !== '') {
    return <>{children}</>
  }

  return (
    <Box
      component="span"
      role="status"
      sx={{
        backgroundColor: 'brand.sand',
        color: 'primary.dark',
        fontWeight: 700,
        px: 1,
        py: 0.25,
        borderRadius: 1,
        whiteSpace: 'nowrap',
      }}
    >
      à compléter : {champ}
    </Box>
  )
}

Valeur.propTypes = {
  children: PropTypes.node,
  champ: PropTypes.string.isRequired,
}

export default PageLegale
