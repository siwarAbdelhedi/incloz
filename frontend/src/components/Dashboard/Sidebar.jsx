import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

const Sidebar = () => {
  return (
    <Box sx={{ width: 240, backgroundColor: '#FD5C35', minHeight: '100vh', p: 2 }}>
      <Typography variant="h6" sx={{ color: '#FFF', mb: 3, fontFamily: 'Decalotype' }}>
        Dashboard
      </Typography>
      <List>
        <ListItem button>
          <ListItemText primary="Commandes" sx={{ color: '#FFF', fontFamily: 'Decalotype' }} />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Profil" sx={{ color: '#FFF', fontFamily: 'Decalotype' }} />
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;
