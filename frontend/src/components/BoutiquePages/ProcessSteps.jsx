import { Box, Typography, Paper, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Link } from "react-router-dom";


const StepsContainer = styled(Box)(() => ({
  backgroundColor: "#FFF6F0",
  padding: "50px 0",
  textAlign: "center",
  position: "relative",
}));

const StepWrapper = styled(Box)(() => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StepBackgroundCard = styled(Paper)(({ color }) => ({
  position: "absolute",
  top: "12px",
  left: "12px",
  width: "100%",
  height: "100%",
  backgroundColor: color,
  borderRadius: "15px",
  transform: "rotate(6deg)",
  zIndex: 0,
}));

const StepCard = styled(Paper)(() => ({
  padding: "15px",
  borderRadius: "15px",
  textAlign: "center",
  position: "relative",
  boxShadow: "5px 5px 15px rgba(0,0,0,0.1)",
  backgroundColor: "white",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "200px",
  minHeight: "220px",
  zIndex: 1,
}));

const HandDrawnPath = styled(Box)(({ top, left, width, height, rotation }) => ({
  position: "absolute",
  top: top,
  left: left,
  width: width,
  height: height,
  background: "none",
  borderTop: "3px dashed #14235E",
  borderRadius: "100px 100px 0 0",
  transform: `rotate(${rotation})`,
}));

const StepNumber = styled(Typography)({
  color: "#FD5C35",
  fontWeight: "bold",
  fontSize: "22px",
  fontFamily: "Decalotype, sans-serif",
});

const StepTitle = styled(Typography)({
  fontWeight: "bold",
  fontSize: "16px",
  fontFamily: "Decalotype, sans-serif",
  color: "#14235E",
  marginTop: "6px",
});

const StepDescription = styled(Typography)({
  fontSize: "14px",
  fontFamily: "Decalotype, sans-serif",
  color: "#14235E",
  marginTop: "4px",
  textAlign: "center",
});

const StyledButton = styled(Button)(() => ({
  backgroundColor: "#14235E",
  color: "white",
  fontWeight: "bold",
  fontSize: "16px",
  textTransform: "none",
  padding: "10px 22px",
  borderRadius: "30px",
  marginTop: "20px",
  boxShadow: "3px 3px 10px rgba(0,0,0,0.2)",
  "&:hover": {
    backgroundColor: "#FD5C35",
  },
}));

const steps = [
  { number: "01", title: "Choix du vêtement", description: "Parmi notre collection", color: "#FD5C35" },
  { number: "02", title: "Choix de l'adaptation", description: "Parmi nos adaptations", color: "#FD7E50" },
  { number: "03", title: "Une demande plus précise ?", description: "Faites votre demande de devis", color: "#14235E" },
  { number: "04", title: "Livraison", description: "On vous livre chez vous", color: "#FD5C35" },
];

const ProcessSteps = () => {
  return (
    <StepsContainer>
      <Typography
        variant="h4"
        sx={{
          color: "#14235E",
          fontWeight: "bold",
          fontFamily: "Decalotype, sans-serif",
          marginBottom: 4,
        }}
      >
        Comment ça marche ?
      </Typography>
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "50px", flexWrap: "wrap", position: "relative" }}>
        {steps.map((step, index) => (
          <StepWrapper key={index}>
            {index !== steps.length - 1 && (
              <HandDrawnPath
                top="50%"
                left="100%"
                width="100px"
                height="50px"
                rotation={index % 2 === 0 ? "15deg" : "-15deg"}
              />
            )}
            <StepBackgroundCard color={step.color} />
            <StepCard>
              <StepNumber>{step.number}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </StepCard>
          </StepWrapper>
        ))}
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: "#14235E",
          fontWeight: "semibold",
          fontFamily: "Decalotype, sans-serif",
          marginTop: 5,
        }}
      >
        Vous souhaitez une adaptation sur mesure ?
      </Typography>
      <Typography
        variant="subtitle1"
        sx={{
          color: "#14235E",
          fontFamily: "Decalotype, sans-serif",
          fontStyle: "italic",
        }}
      >
        Incloz vous fait un devis*
      </Typography>

      <StyledButton component={Link} to="/custom-request">
        Remplir la fiche de renseignement
      </StyledButton>

      {/* Texte en bas */}
      <Typography
        variant="h6"
        sx={{
          color: "#14235E",
          fontFamily: "Decalotype, sans-serif",
          fontStyle: "italic",
          mt: 2,
          textAlign: "right",
          marginRight: 2
        }}
      >
        *Réponse sous 48H
      </Typography>


    </StepsContainer>
  );
};

export default ProcessSteps;
