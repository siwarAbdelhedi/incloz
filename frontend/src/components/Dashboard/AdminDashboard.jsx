import { Box, Typography, Paper, Button, Stack } from '@mui/material';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Point d'entrée de l'administration.
 *
 * Le panneau « Commandes récentes » qui occupait cette place annonçait un
 * tableau « avec statut, montant, client » : une note d'intention livrée en
 * production, devant une fonctionnalité qui n'existe pas — les contrôleurs de
 * commande et de paiement sont des fichiers vides.
 *
 * Ce qui existe vraiment et n'était accessible d'aucun écran, ce sont les
 * demandes sur-mesure.
 */
const AdminDashboard = ({ user }) => {
  return (
    <Box sx={{ p: 4, backgroundColor: 'brand.sand', minHeight: '80vh' }}>
      <Typography variant="h4" component="h1" sx={{ color: 'brand.navy', mb: 3 }}>
        Bienvenue, {user.name}
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Typography variant="h6" component="h2" sx={{ mb: 1, color: 'brand.navy' }}>
          Demandes sur-mesure
        </Typography>
        <Stack spacing={2} sx={{ alignItems: 'flex-start' }}>
          <Typography sx={{ color: 'text.secondary' }}>
            Les fiches déposées par les visiteurs, avec leurs mensurations, leur
            pièce jointe et la date à laquelle elles seront effacées.
          </Typography>
          <Button component={Link} to="/admin/demandes" variant="contained">
            Consulter les demandes
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};

AdminDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

export default AdminDashboard;
