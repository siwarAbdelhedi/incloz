import { createTheme } from '@mui/material/styles';

/**
 * Source unique de la charte Incloz.
 *
 * Avant, chaque composant réécrivait ses couleurs en dur : trois crèmes
 * concurrents (#FFF6EB, #FFE5CF, #FCDAAF) et deux oranges (#FD4802, #FD5C35)
 * cohabitaient sans qu'aucun ne soit la référence, et `text.secondary` valait
 * `#FD5C3` — un hexadécimal à 5 caractères, donc invalide et silencieusement
 * ignoré par le navigateur.
 *
 * Les trois crèmes sont conservés : ce sont bien trois nuances distinctes de la
 * charte, elles avaient juste besoin d'un nom.
 */

// Police de marque. Decalotype n'a jamais pu être chargée (voir main.jsx) ;
// cette variable est le seul endroit à changer pour en essayer une autre.
export const BRAND_FONT = 'Outfit Variable';

const CREAM = '#FFF6EB'; // fond principal : header, formulaires, cartes
const PEACH = '#FFE5CF'; // sections éditoriales, footer
const SAND = '#FCDAAF'; // espace client et administration

// L'orange de marque #FD4802 ne dépasse pas 3,44:1 avec du texte blanc : il
// échoue au seuil AA (4,5:1). `main` est donc une version à peine assombrie qui
// atteint 4,52:1, `light` conserve la teinte d'origine pour les aplats
// décoratifs sans texte, et `dark` sert au texte et aux liens orange sur fond
// clair (5,94:1 sur crème, 4,77:1 sur sable).
const ORANGE = '#DC3A00';
const ORANGE_VIF = '#FD4802';
const ORANGE_SOMBRE = '#B32E00';

const NAVY = '#14235E';

const theme = createTheme({
  palette: {
    primary: {
      main: ORANGE,
      light: ORANGE_VIF,
      dark: ORANGE_SOMBRE,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: NAVY,
      contrastText: CREAM,
    },
    background: {
      default: CREAM,
      paper: '#FFFFFF',
    },
    text: {
      primary: NAVY,
      // Remplace le #FD5C3 invalide. 6,82:1 sur crème, 6,03:1 sur pêche.
      secondary: '#4C5578',
    },
    // Nuances de marque, à utiliser via theme.palette.brand.*
    brand: {
      cream: CREAM,
      peach: PEACH,
      sand: SAND,
      navy: NAVY,
      orange: ORANGE_VIF,
    },
  },

  typography: {
    fontFamily: [BRAND_FONT, 'Poppins', 'system-ui', 'sans-serif'].join(','),
    h1: { fontWeight: 700, fontSize: '2.75rem', lineHeight: 1.15 },
    h2: { fontWeight: 700, fontSize: '2.25rem', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.875rem', lineHeight: 1.25 },
    h4: { fontWeight: 600, fontSize: '1.5rem', lineHeight: 1.3 },
    h5: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.4 },
    h6: { fontWeight: 600, fontSize: '1.125rem', lineHeight: 1.4 },
    body1: { fontWeight: 400, lineHeight: 1.6 },
    body2: { fontWeight: 400, lineHeight: 1.6 },
    // Tous les boutons du site désactivaient textTransform individuellement.
    button: { fontWeight: 700, textTransform: 'none' },
  },

  shape: {
    borderRadius: 12,
  },

  // Valeurs de mise en page partagées.
  layout: {
    // Hauteur réelle de la barre fixe, mesurée dans un navigateur sur dix
    // largeurs de fenêtre : 56px jusqu'à 599px, 64px à partir de 600px. Ce sont
    // les hauteurs de la Toolbar de MUI, dont le palier est `sm` et non `md`.
    //
    // Une première estimation à 72/80px, posée avec la charte, dépassait de
    // 16px : elle n'était pas gênante à l'œil — juste du blanc en trop — mais
    // elle était fausse, et le `marginTop: '70px'` qu'elle remplaçait l'était
    // aussi, dans l'autre sens.
    headerOffset: { xs: '56px', sm: '64px' },
    // Rayon des boutons « pilule », déclaré tantôt à 20px tantôt à 30px.
    pillRadius: '999px',
  },
});

export default theme;
