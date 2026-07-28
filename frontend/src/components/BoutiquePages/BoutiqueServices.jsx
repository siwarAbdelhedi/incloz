import { Box, Typography, Grid } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import PaymentIcon from "@mui/icons-material/Payment";
import ThreeSixtyIcon from "@mui/icons-material/ThreeSixty";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import StoreIcon from "@mui/icons-material/Store";

const services = [
  { icon: <LocalShippingIcon fontSize="large" />, text: "LIVRAISON OFFERTE" },
  { icon: <PaymentIcon fontSize="large" />, text: "PAIEMENT SÉCURISÉ" },
  { icon: <ThreeSixtyIcon fontSize="large" />, text: "PAIEMENT 3 x SANS FRAIS" },
  { icon: <SwapHorizIcon fontSize="large" />, text: "RETOURS & ÉCHANGES" },
  { icon: <StoreIcon fontSize="large" />, text: "POINT RELAY" }
];

const BoutiqueServices = () => {
  return (
    <Box sx={{ backgroundColor: "#FFE5CF", py: 4, textAlign: "center" }}>
      <Grid container spacing={4} justifyContent="center">
        {services.map((service, index) => (
          <Grid item xs={6} sm={4} md={2} key={index} sx={{ textAlign: "center" }}>
            <Box sx={{ color: "#14235E" }}>{service.icon}</Box>
            <Typography variant="body1" fontWeight="bold" sx={{ mt: 1, color: "#14235E" }}>
              {service.text}
            </Typography>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BoutiqueServices;
