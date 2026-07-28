import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Button,
  Typography,
  Grid,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { styled } from "@mui/material/styles";
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


const AddButton = styled(Button)({
  backgroundColor: "#FD4802",
  color: "#fff",
  width: "40px",
  height: "40px",
  borderRadius: "50%",
  minWidth: "0",
  padding: "0",
  fontSize: "24px",
  position: "absolute",
  bottom: "-20px",
  left: "50%",
  transform: "translateX(-50%)",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  zIndex: 10,
  "&:hover": {
    backgroundColor: "#e54402",
  },
});

const ShopCards = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  // Mock data temporaire pour le développement
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Essayer d'abord l'appel API
        const { data } = await axios.get(`${API_URL}/products`);
        setItems(data);
      } catch (err) {
        console.error("Failed to load products", err);
        // Fallback aux données par défaut en cas d'erreur
        setItems([
          {
            _id: '1',
            title: 'T-shirt Fitness',
            description: 'T-shirt en coton alliant style, confort et facilité d\'utilisation',
            image: 'tshirt.png'
          },
          {
            _id: '2',
            title: 'Jogging Fitness',
            description: 'Jogging en coton alliant style, confort et facilité d\'utilisation',
            image: 'jogging.png'
          },
          {
            _id: '3',
            title: 'Short Fitness',
            description: 'Short en coton alliant style, confort et facilité d\'utilisation',
            image: 'short.png'
          }
        ]);
      }
    };
    fetchProducts();
  }, []);

  const handleAddToCart = (id) => {
    navigate(`/product/${id}`);
  };

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
        marginTop: '70px'
      }}
    >
      {/* Titre avec étiquette */}
      <Box sx={{ textAlign: "center", mb: 8, position: "relative" }}>
        <Box
          sx={{
            backgroundColor: "white",
            px: 6,
            py: 1.5,
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

      <Grid container spacing={4} justifyContent="center">
        {items.map((item) => (
          <Grid item 
          xs={12} sm={6} md={4} lg={3} 
          key={item._id}
          sx={{ mb: { xs: 4, sm: 0 } }}
          >
            <StyledCard sx={{
                  position: "relative",
                  overflow: "visible",
                  mx: "auto",
                  maxWidth: { xs: 240, sm: 250, md: 230 },
                  minHeight: { xs: 280, sm: 300, md: 320 },
             }}>
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
              <AddButton
                onClick={() => handleAddToCart(item._id)}
                variant="contained"
                sx={{
                  position: "absolute",
                  bottom: "-15px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 5,
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                  minWidth: 0,
                  padding: 0
                }}
              >
                +
              </AddButton>
            </StyledCard>
          </Grid>
        ))}
      </Grid>

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

export default ShopCards;