import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Divider,
  Button,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";

const Panier = () => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartItems(storedCart);
  }, []);

  const updateCart = (items) => {
    localStorage.setItem("cart", JSON.stringify(items));
    setCartItems(items);
  };

  const handleQuantityChange = (productId, amount) => {
    const updated = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(1, item.quantity + amount) }
        : item
    );
    updateCart(updated);
  };

  const handleRemove = (productId) => {
    const updated = cartItems.filter((item) => item.productId !== productId);
    updateCart(updated);
  };

  const getTotal = () =>
    cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <Box sx={{ p: 4, backgroundColor: "#FFF6EB", minHeight: "100vh", marginTop: '70px'
    }}>
      <Button component={Link} to="/boutique" sx={{ color: "#FD4802", mb: 3 }}>
        Retourner à la boutique
      </Button>

      <Typography
        variant="h4"
        sx={{ fontFamily: "Decalotype, sans-serif", fontWeight: "bold", color: "#14235E", mb: 4 }}
      >
        Votre panier
      </Typography>

      {cartItems.length === 0 ? (
        <Typography sx={{ fontFamily: "Poppins" }}>Votre panier est vide</Typography>
      ) : (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cartItems.map((item) => (
              <Box key={item.productId} sx={{ mb: 4 }}>
                <Box sx={{ display: "flex", gap: 3 }}>
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: "#FD5C35",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Box component="img" src={item.image} alt={item.title} sx={{ maxHeight: "80%" }} />
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography sx={{ fontWeight: "bold", fontSize: "1.2rem", color: "#14235E" }}>{item.title}</Typography>
                    <Typography sx={{ fontStyle: "italic", color: "#14235E" }}>{item.subtitle || "Produit adaptable"}</Typography>
                    <Typography sx={{ color: "#14235E", mt: 1 }}>
                      Taille {item.size} – {item.adaptation.charAt(0).toUpperCase() + item.adaptation.slice(1)}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#14235E" }}>{item.price}€</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                      <IconButton onClick={() => handleQuantityChange(item.productId, -1)}>
                        <RemoveIcon />
                      </IconButton>
                      <Typography>{item.quantity}</Typography>
                      <IconButton onClick={() => handleQuantityChange(item.productId, 1)}>
                        <AddIcon />
                      </IconButton>
                    </Box>
                    <Button
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemove(item.productId)}
                      sx={{ mt: 1, fontSize: "0.8rem", color: "#E2775C" }}
                    >
                      Supprimer
                    </Button>
                  </Box>
                </Box>
                <Divider sx={{ mt: 2 }} />
              </Box>
            ))}
          </Grid>

          <Grid item xs={12} md={4}>
            <Box sx={{ border: "1px solid #FD5C35", p: 3, borderRadius: "4px" }}>
              <Typography sx={{ fontWeight: "bold", color: "#14235E", mb: 2 }}>
                Récapitulatif de la commande
              </Typography>
              <Divider />
              <Box sx={{ mt: 2 }}>
                <Typography>Totaux des articles : {getTotal().toFixed(2)} €</Typography>
                <Typography>Frais de livraison : 3,99 €</Typography>
                <Typography sx={{ mt: 1, fontWeight: "bold" }}>
                  Total : {(getTotal() + 3.99).toFixed(2)} €
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                sx={{ mt: 3, backgroundColor: "#14235E" }}
                onClick={() => navigate("/login")}
              >
                Passer au paiement
              </Button>
            </Box>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Panier;