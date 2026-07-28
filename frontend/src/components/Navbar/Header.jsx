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
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link } from "react-router-dom";
import Logo from "../../assets/logo.png";

const pages = [
  { label: "Qui sommes nous ?", path: "/about" },
  { label: "La boutique", path: "/boutique" },
  { label: "Nos adaptations", path: "/adaptations" },
  { label: "Blog", path: "/blog" },
];

const StyledAppBar = styled(AppBar)({
  backgroundColor: "#FFF6EB",
  color: "#14235E",
  boxShadow: "none",
});

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(1, 4),
}));

const NavButtons = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(4),
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const StyledButton = styled(Button)({
  color: "#14235E",
  fontFamily: "Decalotype, sans-serif",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "none",
  "&:hover": {
    backgroundColor: "#FCDAAF",
  },
});

const ConnectButton = styled(Button)({
  backgroundColor: "#FD4802",
  color: "#FFF6EB",
  fontFamily: "Decalotype, sans-serif",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "none",
  padding: "8px 20px",
  borderRadius: "20px",
  "&:hover": {
    backgroundColor: "#14235E",
  },
});

function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <StyledAppBar position="fixed">
      <StyledToolbar>
        {/* Left: Burger + Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <IconButton onClick={toggleDrawer} sx={{ color: "#FD4802" }}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Box
            component={Link}
            to="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <img src={Logo} alt="Incloz Logo" style={{ height: "30px" }} />
          </Box>
        </Box>

        {/* Center: Navigation */}
        <NavButtons>
          {pages.map((page) => (
            <StyledButton key={page.label} component={Link} to={page.path}>
              {page.label}
            </StyledButton>
          ))}
        </NavButtons>

        {/* Right: Se connecter + panier */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <ConnectButton
            variant="contained"
            component={Link}
            to="/login"
            sx={{ display: { xs: "none", md: "block" } }}
          >
            Se connecter
          </ConnectButton>
          <IconButton
            component={Link}
            to="/panier"
            sx={{ color: "#FD4802" }}
          >
            <ShoppingCartIcon />
          </IconButton>
        </Box>
      </StyledToolbar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={mobileOpen} onClose={toggleDrawer}>
        <Box
          sx={{
            width: 300,
            backgroundColor: "#FFF6EB",
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
            sx={{
              alignSelf: "flex-start",
              color: "#FD4802",
              mb: 2,
              ml: -1,
            }}
          >
            <CloseIcon />
          </IconButton>

          <List>
            {pages.map((page) => (
              <ListItem
                button
                key={page.label}
                component={Link}
                to={page.path}
                onClick={toggleDrawer}
              >
                <ListItemText
                  primary={page.label}
                  primaryTypographyProps={{
                    fontWeight: "bold",
                    textAlign: "center",
                    color: "#14235E",
                    fontFamily: "Decalotype, sans-serif",
                  }}
                />
              </ListItem>
            ))}
            <ListItem
              button
              component={Link}
              to="/login"
              onClick={toggleDrawer}
            >
              <ListItemText
                primary="Se connecter"
                primaryTypographyProps={{
                  fontWeight: "bold",
                  textAlign: "center",
                  color: "#14235E",
                  fontFamily: "Decalotype, sans-serif",
                }}
              />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </StyledAppBar>
  );
}

export default Header;
