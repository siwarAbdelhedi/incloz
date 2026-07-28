// UserDashboard.jsx
import { Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import Sidebar from './Sidebar';

const UserDashboard = ({ user }) => {
  // mt: 70px pour passer sous la navbar fixe, comme les autres pages
  return (
    <Box sx={{ display: 'flex', mt: '70px', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#FCDAAF' }}>
        <Typography variant="h4" sx={{ color: '#14235E', mb: 2 }}>
          Bonjour, {user.name}
        </Typography>
        <Typography sx={{ color: '#232A45' }}>
          Vous pourrez consulter votre historique de commandes ici prochainement.
        </Typography>
      </Box>
    </Box>
  );
};

UserDashboard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
  }).isRequired,
};

export default UserDashboard;
