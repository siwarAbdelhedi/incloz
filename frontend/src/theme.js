import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#FD4802',
    },
    secondary: {
      main: '#14235E',
    },
    background: {
      default: '#FFE5CF',
    },
    text: {
      primary: '#14235E',
      secondary: '#FD5C3',
    },
  },
  typography: {
    fontFamily: ['Decalotype', 'Poppins', 'sans-serif'].join(','),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    body1: {
      fontWeight: 400,
    },
  },
});

export default theme;
