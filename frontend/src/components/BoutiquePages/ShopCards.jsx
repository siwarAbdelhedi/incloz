import { useCallback, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  Skeleton,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import PropTypes from "prop-types";
import axios from "axios";
import bgPattern from "../../assets/photo2.png";
import { API_URL, IMG_URL } from "../../config/api";

// Styled components adaptés pour correspondre au design
const StyledCard = styled(Card)(() => ({
  backgroundColor: "white",
  borderRadius: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  position: "relative",
  maxWidth: 230,
  minHeight: 80,
  paddingBottom: "40px",
}));

const ImageContainer = styled(Box)(() => ({
  backgroundColor: "#FD5C35",
  backgroundImage: `url(${bgPattern})`,
  backgroundRepeat: "repeat",
  backgroundSize: "cover",
  borderTopLeftRadius: "12px",
  borderTopRightRadius: "12px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "150px",
  padding: "20px",
  position: "relative",
}));


// Pastille « + » du bas de carte. C'était un <button> qui naviguait vers la
// fiche produit : seul ce cercle de 40px était cliquable, et lui seul était
// atteignable au clavier. La carte entière est devenue le lien ; la pastille
// n'est donc plus qu'un repère visuel — un bouton imbriqué dans un lien serait
// invalide, et donnerait deux cibles pour une seule destination.
const AddButton = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  fontWeight: 700,
  lineHeight: 1,
  position: "absolute",
  bottom: "-20px",
  left: "50%",
  transform: "translateX(-50%)",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  zIndex: 10,
}));

// Nombre de cartes affichées pendant le chargement. Reprendre la grille réelle
// évite que la page ne se réorganise sous les yeux du visiteur à l'arrivée des
// données.
const SQUELETTES = 4;

// Dimensions partagées par les cartes réelles et les squelettes : c'est ce qui
// fait qu'aucune ne bouge au moment où les données arrivent.
const CARTE = {
  position: "relative",
  overflow: "visible",
  mx: "auto",
  maxWidth: { xs: 240, sm: 250, md: 230 },
  minHeight: { xs: 280, sm: 300, md: 320 },
};

// Ce bloc est monté à deux endroits : sur /boutique, où « La boutique » est le
// sujet de la page, et sur l'accueil, où ce n'est qu'une section parmi d'autres.
// Le niveau du titre suit donc le contexte — sans ce réglage, l'accueil aurait
// deux <h1>, ce qui casse la structure du document.
const ShopCards = ({ titreComposant = "h2" }) => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [statut, setStatut] = useState("chargement");

  // Quand l'appel échouait, le catalogue se rabattait sur trois produits écrits
  // en dur — t-shirt, jogging, short — sans rien indiquer au visiteur. Il voyait
  // donc des articles qui n'existent pas forcément en base, avec des
  // identifiants « 1 », « 2 », « 3 » qui ne mènent nulle part : la fiche produit
  // restait alors bloquée sur « Chargement… ».
  //
  // Une panne doit se dire. Trois situations sont désormais distinguées, parce
  // que ce sont trois vérités différentes : le chargement, l'échec, et le
  // catalogue réellement vide.
  const chargerProduits = useCallback(async () => {
    setStatut("chargement");

    try {
      const { data } = await axios.get(`${API_URL}/products`);
      setItems(Array.isArray(data) ? data : []);
      setStatut("ok");
    } catch (err) {
      console.error("Chargement du catalogue impossible", err);
      setItems([]);
      setStatut("erreur");
    }
  }, []);

  useEffect(() => {
    chargerProduits();
  }, [chargerProduits]);

  return (
    <Box
      sx={{
        backgroundColor: "#14235E",
        backgroundImage: `url(${bgPattern})`,
        backgroundRepeat: "repeat",
        py: 10,
        px: 2,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "visible",
      }}
    >
      {/* Titre avec étiquette */}
      <Box sx={{ textAlign: "center", mb: 8, position: "relative" }}>
        {/* C'était une simple <div> stylée en gros et gras : visuellement un
            titre, mais invisible comme tel pour un lecteur d'écran. Le rendu
            est identique, seule la balise change. */}
        <Box
          component={titreComposant}
          sx={{
            backgroundColor: "white",
            px: 6,
            py: 1.5,
            m: 0,
            borderRadius: "20px",
            display: "inline-block",
            fontWeight: "bold",
            fontSize: "2.5rem",
            color: "#14235E",
          }}
        >
          La boutique
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: "100%",
            left: "50%",
            transform: "translateX(-50%) rotate(-5deg)",
            backgroundColor: "#FD4802",
            color: "white",
            px: 3,
            py: 0.7,
            borderRadius: "8px",
            mt: 1,
            fontSize: "0.9rem",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Une collection qui s&apos;adapte à vous
        </Box>
      </Box>

      {statut === "chargement" && (
        <Grid container spacing={4} justifyContent="center" aria-busy="true">
          {/* Le chargement est annoncé aux lecteurs d'écran : les squelettes ne
              sont qu'une indication visuelle, ils ne disent rien à qui ne voit
              pas la page. */}
          <Box component="p" sx={visuallyHidden}>
            Chargement du catalogue en cours.
          </Box>
          {Array.from({ length: SQUELETTES }, (_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index} sx={{ mb: { xs: 4, sm: 0 } }}>
              <StyledCard sx={CARTE}>
                <ImageContainer>
                  <Skeleton variant="rectangular" width="60%" height="60%" />
                </ImageContainer>
                <CardContent sx={{ pt: 3, pb: 6, textAlign: "center" }}>
                  <Skeleton variant="text" width="70%" sx={{ mx: "auto", fontSize: "1.25rem" }} />
                  <Skeleton variant="text" width="90%" sx={{ mx: "auto" }} />
                  <Skeleton variant="text" width="75%" sx={{ mx: "auto" }} />
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      )}

      {statut === "erreur" && (
        <Box role="alert" sx={{ textAlign: "center", maxWidth: 460, color: "brand.cream" }}>
          <Typography variant="h6" component="p" fontWeight="bold" gutterBottom>
            Le catalogue n’a pas pu être chargé.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
            Nos produits sont momentanément inaccessibles. Vérifiez votre
            connexion, puis réessayez — si cela persiste, la panne vient de
            notre côté.
          </Typography>
          <Button
            variant="contained"
            onClick={chargerProduits}
            sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
          >
            Réessayer
          </Button>
        </Box>
      )}

      {/* Un catalogue vide n'est pas une panne : le dire autrement évite
          d'inquiéter pour rien, et laisse une porte ouverte. */}
      {statut === "ok" && items.length === 0 && (
        <Box sx={{ textAlign: "center", maxWidth: 460, color: "brand.cream" }}>
          <Typography variant="h6" component="p" fontWeight="bold" gutterBottom>
            Le catalogue est vide pour le moment.
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
            Aucun produit n’est en ligne aujourd’hui. Vous pouvez déjà nous
            décrire le vêtement dont vous avez besoin.
          </Typography>
          <Button
            component={Link}
            to="/custom-request"
            variant="contained"
            sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
          >
            Faire une demande sur-mesure
          </Button>
        </Box>
      )}

      {statut === "ok" && items.length > 0 && (
      <Grid container spacing={4} justifyContent="center">
        {items.map((item) => (
          <Grid item
          xs={12} sm={6} md={4} lg={3}
          key={item._id}
          sx={{ mb: { xs: 4, sm: 0 } }}
          >
            {/* La carte entière est le lien vers la fiche produit. Seule la
                pastille « + » l'était, soit une cible de 40px — difficile à
                viser, et le reste de la carte semblait cliquable sans l'être. */}
            <StyledCard
              component={Link}
              to={`/product/${item._id}`}
              sx={{ ...CARTE, textDecoration: "none" }}
            >
              <ImageContainer>
                <CardMedia
                  component="img"
                  image={`${IMG_URL}/${item.image}`}
                  alt={item.title}
                  sx={{
                    height: { xs: "90px", sm: "110px", md: "120px" },
                    width: "auto",
                    objectFit: "contain",
                    margin: "auto"
                  }}
                />
              </ImageContainer>
              <CardContent sx={{ pt: 3, pb: 6, textAlign: "center" }}>
                <Typography
                  variant="h6"
                  sx={{ 
                    color: "#14235E", 
                    fontWeight: "bold", 
                    fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" }
                  }}
                >
                  {item.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#14235E",
                    mt: 1.5,
                    fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem" },
                    px: 1,
                    lineHeight: 1.4
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
              {/* Décoratif : la destination est déjà portée par la carte. Le
                  répéter à un lecteur d'écran n'ajouterait qu'un « plus ». */}
              <AddButton aria-hidden="true" sx={{ bottom: "-15px", zIndex: 5 }}>
                +
              </AddButton>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
      )}

      <Button
        variant="contained"
        sx={{
          mt: 8,
          backgroundColor: "#FFE5CF",
          color: "#14235E",
          fontWeight: "bold",
          fontSize: "1rem",
          textTransform: "none",
          px: 5,
          py: 1.2,
          borderRadius: "16px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.15)",
          "&:hover": {
            backgroundColor: "#F8D9BC",
          }
        }}
        onClick={() => navigate("/boutique")}
      >
        Je découvre la boutique
      </Button>
    </Box>
  );
};

ShopCards.propTypes = {
  titreComposant: PropTypes.string,
};

export default ShopCards;