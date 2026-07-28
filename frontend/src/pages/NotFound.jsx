import { Box, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

const NotFound = () => (
  <Box
    sx={{
      minHeight: "60vh",
      mt: "70px",
      px: 2,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      backgroundColor: "#FFF6EB",
    }}
  >
    <Typography variant="h3" sx={{ color: "#14235E", fontWeight: "bold", mb: 1 }}>
      404
    </Typography>
    <Typography sx={{ color: "#232A45", mb: 3 }}>
      Cette page n&apos;existe pas ou a été déplacée.
    </Typography>
    <Button
      component={Link}
      to="/"
      sx={{
        backgroundColor: "#FD4802",
        color: "#FFF6EB",
        borderRadius: "25px",
        textTransform: "none",
        fontWeight: "bold",
        px: 3,
        "&:hover": { backgroundColor: "#14235E" },
      }}
    >
      Retour à l&apos;accueil
    </Button>
  </Box>
);

export default NotFound;
