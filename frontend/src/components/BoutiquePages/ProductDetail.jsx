import { useCallback, useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  Grid,
  Dialog,
  DialogActions,
  Radio,
  Container,
  Skeleton,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Link as RouterLink, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { API_URL, IMG_URL } from "../../config/api";

// Create a custom theme to match the design
const theme = createTheme({
  palette: {
    primary: {
      main: "#FD5C35",
    },
    secondary: {
      main: "#14235E",
    },
    background: {
      default: "#FFF6EB",
    },
  },
  typography: {
    h5: {
      fontWeight: 700,
      color: "#14235E",
    },
    subtitle1: {
      fontStyle: "italic",
    },
  },
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: "1px solid #14235E",
          color: "#14235E",
          width: "48px",
          height: "36px",
          "&.Mui-selected": {
            backgroundColor: "#14235E",
            color: "white",
            "&:hover": {
              backgroundColor: "#14235E",
              opacity: 0.9,
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          backgroundColor: "#FD5C35",
          color: "white",
          borderRadius: "4px",
          padding: "10px 30px",
          textTransform: "none",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#e64d2e",
          },
        },
      },
    },
  },
});

// Fond commun aux écrans de chargement, d'absence et de panne.
const ECRAN = { backgroundColor: "brand.cream", minHeight: "60vh", py: 6 };

/**
 * Écran de sortie quand il n'y a pas de fiche à montrer.
 *
 * Toujours un titre — la page doit annoncer son sujet même quand ce sujet est
 * une absence — et toujours une issue : la boutique reste à un clic. Sans
 * `onReessayer`, seule cette issue est proposée : réessayer n'a aucun sens sur
 * un produit qui n'existe pas.
 */
const Impasse = ({ titre, message, onReessayer }) => (
  <Box sx={{ ...ECRAN, display: "flex", justifyContent: "center", alignItems: "center", px: 2 }}>
    <Box role="alert" sx={{ textAlign: "center", maxWidth: 480 }}>
      <Typography variant="h4" component="h1" color="secondary.main" fontWeight="bold" gutterBottom>
        {titre}
      </Typography>
      <Typography variant="body1" color="text.primary" sx={{ mb: 4 }}>
        {message}
      </Typography>
      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
        {onReessayer && (
          <Button
            variant="contained"
            onClick={onReessayer}
            sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
          >
            Réessayer
          </Button>
        )}
        <Button component={RouterLink} to="/boutique" variant="outlined" color="secondary">
          Retourner à la boutique
        </Button>
      </Box>
    </Box>
  </Box>
);

Impasse.propTypes = {
  titre: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  onReessayer: PropTypes.func,
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [statut, setStatut] = useState("chargement");
  const [size, setSize] = useState("S");
  const [adaptation, setAdaptation] = useState("pression");
  const [dialogOpen, setDialogOpen] = useState(false);

  // L'échec ne partait qu'en console et `product` restait à null : la page
  // affichait « Chargement… » indéfiniment, aussi bien pour un produit
  // inexistant que pour une API en panne. Deux causes très différentes, une
  // seule apparence — et aucune issue proposée au visiteur.
  //
  // L'API répond 404 aussi bien pour un identifiant malformé que pour un
  // produit absent : dans les deux cas, du point de vue de l'appelant, la fiche
  // n'existe pas.
  const chargerProduit = useCallback(async () => {
    setStatut("chargement");

    try {
      const res = await axios.get(`${API_URL}/products/${id}`);
      setProduct(res.data);
      setStatut("ok");
    } catch (error) {
      console.error("Chargement du produit impossible", error);
      setProduct(null);
      setStatut(error.response?.status === 404 ? "introuvable" : "erreur");
    }
  }, [id]);

  useEffect(() => {
    chargerProduit();
  }, [chargerProduit]);

  const handleAddToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    const newItem = {
      productId: product._id,
      title: product.title,
      image: `${IMG_URL}/${product.image}`,
      price: product.price,
      size,
      adaptation,
      quantity: 1,
    };

    const existingIndex = cart.findIndex(
      (item) =>
        item.productId === newItem.productId &&
        item.size === newItem.size &&
        item.adaptation === newItem.adaptation
    );

    if (existingIndex >= 0) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push(newItem);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    setDialogOpen(true);
  };

  // Les trois écrans qui suivent sont rendus hors du ThemeProvider local : ce
  // dernier ne redéfinit qu'une palette partielle, sans les nuances de la
  // charte. Ce thème local reste une dette, traitée à part.
  if (statut === "chargement") {
    return (
      <Box sx={ECRAN}>
        <Container maxWidth="lg" aria-busy="true">
          {/* Les squelettes n'existent que pour l'œil : le chargement doit être
              annoncé à qui ne voit pas la page. */}
          <Typography component="h1" sx={visuallyHidden}>
            Chargement de la fiche produit
          </Typography>
          <Grid container spacing={6}>
            <Grid item xs={12} md={5} lg={4}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
            <Grid item xs={12} md={7} lg={8}>
              <Skeleton variant="text" width="60%" sx={{ fontSize: "1.5rem" }} />
              <Skeleton variant="text" width="35%" />
              <Skeleton variant="text" width="20%" sx={{ fontSize: "1.75rem", mb: 3 }} />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="rectangular" width={260} height={40} sx={{ mt: 4 }} />
            </Grid>
          </Grid>
        </Container>
      </Box>
    );
  }

  if (statut === "introuvable") {
    return (
      <Impasse
        titre="Produit introuvable"
        message="Ce produit n’existe pas ou n’est plus proposé. Il a peut-être été retiré du catalogue."
      />
    );
  }

  if (statut === "erreur") {
    return (
      <Impasse
        titre="Ce produit n’a pas pu être chargé"
        message="La fiche est momentanément inaccessible. Vérifiez votre connexion, puis réessayez — si cela persiste, la panne vient de notre côté."
        onReessayer={chargerProduit}
      />
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ backgroundColor: "#FFF6EB", minHeight: "100vh", py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid item xs={12} md={5} lg={4}>
              <Box sx={{ position: "relative", height: "200px", display: "flex", justifyContent: "center" }}>
                <Box sx={{ backgroundColor: "#FD5C35", width: "50%", height: "100%", position: "absolute", left: 0, top: 0, zIndex: 1 }} />
                <Box
                  component="img"
                  src={`${IMG_URL}/${product.image}`}
                  alt={product.title}
                  sx={{ position: "relative", zIndex: 2, height: "100%", objectFit: "contain", maxWidth: "280px" }}
                />
              </Box>
            </Grid>

            <Grid item xs={12} md={7} lg={8}>
              {/* Le nom du produit est le sujet de la page : c'est lui le
                  titre de premier niveau. */}
              <Typography variant="h5" component="h1">{product.title}</Typography>
              <Typography variant="subtitle1">{product.subtitle}</Typography>
              <Typography color="secondary.main" fontSize="1.75rem" fontWeight="bold" mb={3}>
                {product.price} €
              </Typography>
              <Typography color="secondary.main" mb={4} fontSize="0.9rem" lineHeight={1.5} maxWidth="600px">
                {product.description}
              </Typography>

              <Box mb={4}>
                <ToggleButtonGroup
                  value={size}
                  exclusive
                  onChange={(e, newSize) => newSize && setSize(newSize)}
                  aria-label="taille"
                >
                  {["XS", "S", "M", "L", "XL", "XXL", "3XL"].map((t) => (
                    <ToggleButton key={t} value={t} aria-label={t}>
                      {t}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Box>

              <Box mb={4}>
                <Typography fontWeight="bold" mb={2}>Choix de l&apos;adaptation :</Typography>
                <Box sx={{ display: "flex", gap: 2 }}>
                  {["pression", "auto-grippant", "aimants"].map((option) => (
                    <Box
                      key={option}
                      onClick={() => setAdaptation(option)}
                      sx={{
                        border: "1px solid #14235E",
                        borderRadius: "2px",
                        width: "110px",
                        height: "110px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        cursor: "pointer",
                        backgroundColor: adaptation === option ? "rgba(20, 35, 94, 0.1)" : "transparent",
                      }}
                    >
                      <Typography>{option}</Typography>
                      <Radio checked={adaptation === option} value={option} name="adaptation-radio" />
                    </Box>
                  ))}
                </Box>
              </Box>

              <Button onClick={handleAddToCart} variant="contained">Ajouter au panier</Button>
            </Grid>
          </Grid>

          <Dialog
  open={dialogOpen}
  onClose={() => setDialogOpen(false)}
  PaperProps={{
    sx: {
      borderRadius: "4px",
      maxWidth: "500px",
      p: 2,
    },
  }}
>
  <Box>
    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
      <Typography variant="subtitle1" fontWeight="bold" color="secondary.main">
        Nouvel article ajouté au panier
      </Typography>
      <Button onClick={() => setDialogOpen(false)} sx={{ minWidth: "auto", color: "#14235E", fontSize: 20 }}>
        ×
      </Button>
    </Box>
    <Box sx={{ borderBottom: "1px solid #ccc", mb: 2 }} />

    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
      {/* Cadre orange avec image */}
      <Box sx={{ width: 80, height: 80, backgroundColor: "#FD5C35", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Box
          component="img"
          src={`${IMG_URL}/${product.image}`}
          alt={product.title}
          sx={{ width: "70%", height: "auto", objectFit: "contain" }}
        />
      </Box>

      {/* Infos produit */}
      <Box sx={{ flexGrow: 1 }}>
        <Typography sx={{ fontWeight: "bold", color: "#14235E" }}>{product.title}</Typography>
        <Typography fontStyle="italic" color="#14235E" fontSize="0.9rem" mb={0.5}>
          {product.subtitle || "T-shirt 100% adaptable"}
        </Typography>
        <Typography fontSize="0.85rem" fontWeight="500" color="#14235E">
          Taille {size} – {adaptation.charAt(0).toUpperCase() + adaptation.slice(1)}
        </Typography>
      </Box>

      {/* Prix */}
      <Typography fontWeight="bold" color="#14235E" fontSize="1.3rem">
        {product.price} €
      </Typography>
    </Box>

    {/* Boutons existants */}
    <DialogActions sx={{ mt: 3 }}>
      <Button onClick={() => setDialogOpen(false)} sx={{ color: "#14235E" }}>
        Continuer
      </Button>
      <Button variant="contained" onClick={() => navigate("/panier")}>
        Voir le panier
      </Button>
    </DialogActions>
  </Box>
</Dialog>

        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default ProductDetail;
