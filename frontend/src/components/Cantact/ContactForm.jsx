import { Box, Typography, TextField, Button, Grid } from "@mui/material";
import { styled } from "@mui/material/styles";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ContactContainer = styled(Box)(({ theme }) => ({
  backgroundColor: "white",
  padding: "40px",
  width: "100%",
  minHeight: "auto",
  marginTop: "-10px",
  display: "flex",
  justifyContent: "left", 
  alignItems: "flex-start", 
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
    flexDirection: "column",
  },
}));

const StyledTextField = styled(TextField)(() => ({
  marginBottom: "15px",
  "& .MuiInputBase-root": {
    borderRadius: "20px",
    backgroundColor: "white",
  },
}));

const SendButton = styled(Button)(() => ({
  backgroundColor: "#FD5C35",
  color: "white",
  padding: "10px 18px",
  borderRadius: "17px",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "none",
  width: "50%",
  display: "block",
  "&:hover": {
    backgroundColor: "#E44A26",
  },
}));

const ContactForm = () => {
  return (
    <ContactContainer>
      <Grid
        container
        spacing={4}
        alignItems="flex-start" 
        justifyContent="space-between" 
        maxWidth="1200px"
      >
        {/* Left Side: Form */}
        <Grid 
          item xs={12} md={7} 
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start", 
            textAlign: "left", 
            paddingLeft: "0px", 
          }}
        >
          <StyledTextField fullWidth label="Votre nom" variant="outlined" />
          <StyledTextField fullWidth label="Votre prénom" variant="outlined" />
          <StyledTextField fullWidth label="Le sujet" variant="outlined" />
          <StyledTextField fullWidth label="Votre message" variant="outlined" multiline rows={4} />
          <SendButton>Envoyez un message</SendButton>
        </Grid>

        {/* Right Side: Contact Details  */}
        <Grid 
          item xs={12} md={5} 
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start", 
            alignItems: "flex-start", 
            height: "100%", 
          }}
        >
          <Typography variant="h4" color="#FD5C35" fontWeight="bold" gutterBottom>
            Contactez-nous
          </Typography>
          <Typography variant="body1" marginBottom={2}>
            Adaptez vos vêtements à votre vie !
          </Typography>
          <Typography variant="body2" color="textSecondary" marginBottom={2}>
            Chez Incloz on s’adapte à votre mobilité et à <br></br>vos envies. 
            Pour toute demande de devis ou<br></br>
            d’informations complémentaires,contactez <br></br>notre équipe !
          </Typography>

          <Box display="flex" alignItems="center" marginBottom={1}>
            <LocationOnIcon sx={{ color: "#FD5C35", marginRight: "8px" }} />
            <Typography variant="body2">40 rue du chemin vert, Paris 75011</Typography>
          </Box>
          <Box display="flex" alignItems="center" marginBottom={1}>
            <PhoneIcon sx={{ color: "#FD5C35", marginRight: "8px" }} />
            <Typography variant="body2">01.81.44.36.76</Typography>
          </Box>
          <Box display="flex" alignItems="center">
            <EmailIcon sx={{ color: "#FD5C35", marginRight: "8px" }} />
            <Typography variant="body2" sx={{ textDecoration: "underline", cursor: "pointer" }}>
              incloz.fr@gmail.com
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </ContactContainer>
  );
};

export default ContactForm;
