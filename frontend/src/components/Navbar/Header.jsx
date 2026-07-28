import { useState } from "react";
import {
  AppBar,
  Box,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Logo from "../../assets/logo.png";
import { useAuth } from "../../hooks/useAuth";

// Le nom complet déborde de la barre : on n'affiche que le prénom.
const prenomDe = (user) => (user?.name || "").trim().split(" ")[0];

const pages = [
  { label: "Qui sommes nous ?", path: "/about" },
  { label: "La boutique", path: "/boutique" },
  { label: "Nos adaptations", path: "/adaptations" },
  { label: "Blog", path: "/blog" },
];

// Identifiant du tiroir, référencé par aria-controls sur le bouton qui l'ouvre.
const ID_TIROIR = "menu-mobile";

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.brand.cream,
  color: theme.palette.secondary.main,
  boxShadow: "none",
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  // Le rembourrage était fixé à 4 unités quelle que soit la largeur. Juste au
  // point de bascule du menu de bureau (900px), le contenu ne tenait alors plus
  // sur une ligne : la barre se repliait sur deux lignes et le contenu de la
  // page repassait dessous. Il se resserre donc jusqu'à ce qu'il y ait
  // réellement la place.
  padding: theme.spacing(1, 2),
  [theme.breakpoints.up("lg")]: {
    padding: theme.spacing(1, 4),
  },
}));

const NavButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  [theme.breakpoints.up("lg")]: {
    gap: theme.spacing(4),
  },
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  color: theme.palette.secondary.main,
  fontSize: "16px",
  "&:hover": {
    backgroundColor: theme.palette.brand.sand,
  },
  // La page consultée n'était signalée nulle part. Un soulignement discret
  // l'indique à l'œil, aria-current la donne aux lecteurs d'écran.
  "&[aria-current='page']": {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
    textDecorationThickness: "2px",
  },
}));

// Même signalement de page courante que sur la version bureau : l'attribut
// seul ne servirait qu'aux lecteurs d'écran.
const StyledListItemButton = styled(ListItemButton)({
  "&[aria-current='page'] .MuiListItemText-primary": {
    textDecoration: "underline",
    textUnderlineOffset: "6px",
    textDecorationThickness: "2px",
  },
});

const ConnectButton = styled(Button)(({ theme }) => ({
  // primary.main et non la teinte d'origine : celle-ci ne montait qu'à 3,22:1
  // avec le texte crème, sous le seuil AA de 4,5:1. Voir theme.js.
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: "16px",
  padding: "8px 20px",
  borderRadius: theme.layout.pillRadius,
  "&:hover": {
    backgroundColor: theme.palette.secondary.main,
  },
}));

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, estConnecte, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    // Retour à l'accueil : la page courante peut être devenue inaccessible.
    navigate("/");
  };

  // `undefined` plutôt que `false` : aria-current ne doit pas apparaître du
  // tout sur les liens qui ne pointent pas vers la page affichée.
  const pageCourante = (chemin) => (pathname === chemin ? "page" : undefined);

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        {/* Left: Burger + Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton
              onClick={toggleDrawer}
              aria-label="Ouvrir le menu"
              aria-expanded={mobileOpen}
              aria-controls={ID_TIROIR}
              sx={{ color: "primary.main" }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          <Box
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            {/* Le texte alternatif décrit la destination du lien, pas la nature
                du fichier : « logo » n'apprend rien à qui ne voit pas l'image. */}
            <img
              src={Logo}
              alt="Incloz, retour à l'accueil"
              style={{ height: "30px" }}
            />
          </Box>
        </Box>

        {/* Center: Navigation. L'AppBar rend déjà un <header> (rôle banner) ;
            c'est ce bloc qui doit porter le rôle de navigation pour qu'un
            lecteur d'écran puisse y sauter directement. */}
        <NavButtons component="nav" aria-label="Navigation principale">
          {pages.map((page) => (
            <StyledButton
              key={page.label}
              component={Link}
              to={page.path}
              aria-current={pageCourante(page.path)}
            >
              {page.label}
            </StyledButton>
          ))}
        </NavButtons>

        {/* Right: session + panier */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {estConnecte ? (
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              <StyledButton component={Link} to="/dashboard">
                Bonjour, {prenomDe(user)}
              </StyledButton>
              <ConnectButton variant="contained" onClick={handleLogout}>
                Déconnexion
              </ConnectButton>
            </Box>
          ) : (
            <ConnectButton
              variant="contained"
              component={Link}
              to="/login"
              sx={{ display: { xs: "none", md: "block" } }}
            >
              Se connecter
            </ConnectButton>
          )}
          <IconButton
            component={Link}
            to="/panier"
            aria-label="Votre panier"
            sx={{ color: "primary.main" }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Box>
      </StyledToolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <Box
          id={ID_TIROIR}
          sx={{
            // Était fixé à 300px : sur un écran de 320px, le tiroir couvrait
            // presque tout et ne laissait rien à toucher pour le refermer.
            width: { xs: "85vw", sm: 300 },
            maxWidth: 300,
            backgroundColor: "brand.cream",
            height: "100%",
            px: 3,
            py: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <IconButton
            onClick={toggleDrawer}
            aria-label="Fermer le menu"
            sx={{
              alignSelf: "flex-start",
              color: "primary.main",
              mb: 2,
              ml: -1,
            }}
          >
            <CloseIcon />
          </IconButton>

          {/* Le tiroir n'est monté que lorsqu'il est ouvert : il n'y a donc
              jamais deux navigations exposées en même temps. */}
          <List component="nav" aria-label="Navigation principale">
            {pages.map((page) => (
              // <ListItem button> est déprécié depuis MUI v6 et supprimé en v7.
              // ListItemButton rend un vrai <button>/<a>, donc atteignable au
              // clavier et annoncé comme cliquable.
              <ListItem key={page.label} disablePadding>
                <StyledListItemButton
                  component={Link}
                  to={page.path}
                  onClick={toggleDrawer}
                  aria-current={pageCourante(page.path)}
                >
                  <ListItemText
                    primary={page.label}
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "secondary.main",
                    }}
                  />
                </StyledListItemButton>
              </ListItem>
            ))}
            {estConnecte ? (
              <>
                <ListItem disablePadding>
                  <StyledListItemButton
                    component={Link}
                    to="/dashboard"
                    onClick={toggleDrawer}
                    aria-current={pageCourante("/dashboard")}
                  >
                    <ListItemText
                      primary={`Bonjour, ${prenomDe(user)}`}
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "secondary.main",
                      }}
                    />
                  </StyledListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <StyledListItemButton onClick={handleLogout}>
                    <ListItemText
                      primary="Déconnexion"
                      primaryTypographyProps={{
                        fontWeight: "bold",
                        textAlign: "center",
                        // primary.dark et non la teinte vive : de l'orange sur
                        // crème ne monte qu'à 3,22:1, contre 5,94:1 ici.
                        color: "primary.dark",
                      }}
                    />
                  </StyledListItemButton>
                </ListItem>
              </>
            ) : (
              <ListItem disablePadding>
                <StyledListItemButton
                  component={Link}
                  to="/login"
                  onClick={toggleDrawer}
                  aria-current={pageCourante("/login")}
                >
                  <ListItemText
                    primary="Se connecter"
                    primaryTypographyProps={{
                      fontWeight: "bold",
                      textAlign: "center",
                      color: "secondary.main",
                    }}
                  />
                </StyledListItemButton>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </StyledAppBar>
  );
}

export default Header;
