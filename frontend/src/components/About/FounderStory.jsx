import { Box, Typography, Grid, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import FounderImage from "../../assets/founder.jpg";
import { Link } from "react-router-dom";

const StoryContainer = styled(Box)(() => ({
  backgroundColor: "#FFE5CF",
  padding: "60px 20px",
  display: "flex",
  justifyContent: "center",
  fontFamily: "Decalotype, sans-serif",
}));

const StyledText = styled(Typography)(({ theme }) => ({
  color: "#232A45",
  fontSize: "18px",
  lineHeight: "1.6",
  maxWidth: "600px",
  fontFamily: "Poppins, sans-serif",
  [theme.breakpoints.down("md")]: {
    textAlign: "center",
  },
}));

const HighlightedText = styled("span")(() => ({
  color: "#FD4802",
  fontWeight: "bold",
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: "#14235E",
  color: "white",
  padding: "10px 20px",
  fontSize: "16px",
  fontWeight: "bold",
  borderRadius: "20px",
  marginTop: "30px",
  fontFamily: "Decalotype, sans-serif",
  boxShadow: "2px 2px 10px rgba(0,0,0,0.2)",
  "&:hover": {
    backgroundColor: "#0F1C4F",
  },
}));

const FounderStory = () => {
  return (
    <StoryContainer>
      <Grid container spacing={4} alignItems="center" maxWidth="1200px">
        <Grid item xs={12} md={6}>
          <StyledText>
            Chez Incloz, nous croyons que chacun mérite de se sentir{" "}
            <HighlightedText>autonome</HighlightedText> et{" "}
            <HighlightedText>confortable</HighlightedText> dans ses vêtements.
            Nous avons créé cette collection en nous inspirant de l’histoire de
            mon cousin, qui, après avoir perdu l’usage de ses jambes tout en
            restant passionné de basket, a montré l’importance d’une{" "}
            <HighlightedText>adaptation vestimentaire</HighlightedText>.
          </StyledText>
          <StyledText>
            Nos vêtements allient style, confort et facilité d’utilisation,
            permettant à chacun de s’habiller en toute autonomie. Incloz, c’est
            plus qu’une marque : c’est un engagement pour{" "}
            <HighlightedText>la dignité et l’indépendance de tous</HighlightedText>.
          </StyledText>
          <Typography fontWeight="bold" sx={{ mt: 2, fontFamily: "Decalotype, sans-serif", color: "#14235E" }}>
            Marina Oliveira, Fondatrice d’Incloz
          </Typography>
        </Grid>

        <Grid item xs={12} md={6} sx={{ textAlign: "center" }}>
          <Box
            component="img"
            src={FounderImage}
            alt="Founder of Incloz"
            sx={{
              width: "100%",
              maxWidth: "350px",
              borderRadius: "10px",
              boxShadow: "4px 4px 15px rgba(0, 0, 0, 0.1)",
            }}
          />
        </Grid>

        <Grid item xs={12} textAlign="center">
          <Typography variant="h5" fontWeight="bold" color="#14235E" sx={{ fontFamily: "Decalotype, sans-serif" }}>
            Vous souhaitez une adaptation sur mesure ?
          </Typography>
          <Typography variant="body1" sx={{ color: "#14235E", fontStyle: "italic", mb: 2, fontFamily: "Decalotype, sans-serif" }}>
            Incloz vous fait un devis*
          </Typography>
          <StyledButton component={Link} to="/custom-request">
            Remplir la fiche de renseignement
          </StyledButton>
        </Grid>
      </Grid>
    </StoryContainer>
  );
};

export default FounderStory;
