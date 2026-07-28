import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import Athlete from "../assets/home.png";
import PatternBg from "../assets/photo2.png";
import { Link } from "react-router-dom";

const HeroContainer = styled(Box)(() => ({
  backgroundColor: "#FD5C35",
  backgroundImage: `url(${PatternBg})`,
  backgroundRepeat: "repeat",
  backgroundSize: "contain",
  minHeight: "100vh",
  width: "100%",
  display: "flex",
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingLeft: "5%",
  paddingRight: "2%",
  overflow: "hidden",
  "@media (max-width: 960px)": {
    flexDirection: "column",
    padding: "40px 20px",
    textAlign: "center",
  },
}));

const TextContainer = styled(Box)(() => ({
  maxWidth: "600px",
  "@media (max-width: 960px)": {
    textAlign: "center",
    marginBottom: "30px",
  },
}));

const HeroImage = styled("img")(() => ({
  maxHeight: "450px", 
  width: "auto",
  objectFit: "contain",
  "@media (max-width: 960px)": {
    maxWidth: "80%",
    height: "auto",
    marginTop: "30px",
  },
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: "white",
  color: "#14235E",
  fontWeight: "bold",
  fontSize: "18px",
  textTransform: "none",
  padding: "12px 24px",
  borderRadius: "30px",
  boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
  marginTop: "30px",
  "&:hover": {
    backgroundColor: "#FFE5CF",
  },
}));

const Hero = () => {
  return (
    <HeroContainer sx={{ marginTop: '70px' }}>
      <TextContainer>
        <Typography
          variant="h2"
          sx={{
            fontWeight: "bold",
            color: "#14235E",
            fontFamily: "Decalotype, sans-serif",
            fontSize: { xs: "1.75rem", sm: "2.5rem", md: "3rem" },
          }}
        >
          Votre marque de vêtements de sport <br />
          <span style={{ color: "#14235E" }}>100% adaptable</span>
        </Typography>

        <StyledButton component={Link} to="/about">
          Qui sommes nous ?
        </StyledButton>
      </TextContainer>

      <HeroImage src={Athlete} alt="Athlète en fauteuil roulant" />
    </HeroContainer>
  );
};

export default Hero;
