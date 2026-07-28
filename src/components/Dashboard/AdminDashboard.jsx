import { Box, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';

const AdminDashboard = ({ user }) => {
  // mt: 70px pour passer sous la navbar fixe, comme les autres pages
  return (
    <Box sx={{ p: 4, mt: '70px', backgroundColor: '#FCDAAF', minHeight: '100vh' }}>
      <Typography variant="h4" sx={{ fontFamily: 'Decalotype', color: '#14235E', mb: 3 }}>
        Bienvenue, {user.name}
      </Typography>
      <Paper elevation={3} sx={{ p: 3, backgroundColor: '#fff' }}>
        <Typography variant="h6" sx={{ fontFamily: 'Decalotype', color: '#232A45', mb: 2 }}>
          Commandes récentes
        </Typography>
        <Typography sx={{ fontFamily: 'Decalotype', color: '#14235E' }}>
          Vous pourrez afficher ici un tableau des commandes avec statut, montant, client, etc.
        </Typography>
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