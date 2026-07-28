import { Box, Typography, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import bgPattern from "../../assets/photo2.png";


const HeroContainer = styled(Box)(() => ({
  backgroundColor: "#FD5C35",
  backgroundImage: `url(${bgPattern})`,
  backgroundRepeat: "repeat",
  backgroundSize: "400px",
  padding: "80px 60px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minHeight: "0vh",
  position: "relative",
  fontFamily: "Decalotype, sans-serif",
}));


const Wave = styled("div")(() => ({
  position: "absolute",
  bottom: 0,
  left: 0,
  width: "100%",
  overflow: "hidden",
  lineHeight: 0,
}));

const Svg = styled("svg")(() => ({
  display: "block",
  width: "100%",
  height: "60px",
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: "#FFE5CF", 
  color: "#14235E", 
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  fontFamily: "Decalotype, sans-serif",
  borderRadius: "20px",
  marginTop: "20px",
  boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
  "&:hover": {
    backgroundColor: "#FFD4A3",
  },
}));

const HeroSection = () => {
  return (
    <HeroContainer sx={{ marginTop: '70px' }}>
      <Typography variant="h4" fontWeight="bold" color="#232A45">
        Incloz, le style qui vous suit.
      </Typography>
      <Typography variant="body1" color="#232A45" sx={{ mt: 1, fontStyle: "italic" }}>
        Nous mettons au cœur de nos design les <br /> besoins et les désirs de chacun
      </Typography>
      <StyledButton>Je découvre Incloz</StyledButton>

      {/* Wave SVG en bas */}
      <Wave>
        <Svg viewBox="0 0 500 150" preserveAspectRatio="none">
          <path d="M0.00,49.98 C150.00,150.00 350.00,-50.00 500.00,49.98 L500.00,150.00 L0.00,150.00 Z" style={{ fill: "#FFF7F0" }} />
        </Svg>
      </Wave>
    </HeroContainer>
  );
};

export default HeroSection;
