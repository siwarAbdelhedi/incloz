import { Box, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import bgPattern from "../../assets/photo2.png";
import Siwar from "../../assets/siwar.png";
import Marina from "../../assets/marina.png";
import Julia from "../../assets/julia.png";
import Robin from "../../assets/robin.png";
import Apolline from "../../assets/appoline.png";
import Lea from "../../assets/léa.png";

const members = [
    { name: "Siwar Abdelhedi", role: "Tech lead", image: Siwar },
    { name: "Marina Oliveira", role: "Fondatrice", image: Marina },
    { name: "Julia LEVY", role: "Directrice artistique", image: Julia },
    { name: "Robin Dutilloy", role: "Directeur artistique", image: Robin },
    { name: "Apolline Champion", role: "Chargée de communication", image: Apolline },
    { name: "Léa Lelong", role: "Cheffe de projet marketing", image: Lea },
  ];
  
  const BackgroundBox = styled(Box)(({ theme }) => ({
    backgroundColor: "#14235E",
    backgroundImage: `url(${bgPattern})`,
    backgroundRepeat: "repeat",
    backgroundSize: "contain",
    backgroundPosition: "center",
    padding: theme.spacing(8, 2),
    textAlign: "center",
  }));
  
  const AvatarCircle = styled("img")(({ theme }) => ({
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "50%",
    marginBottom: theme.spacing(2),
    border: "4px solid white",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
  }));
  
  const TeamSection = () => {
    return (
      <BackgroundBox>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{
            mb: 6,
            fontFamily: "Decalotype, sans-serif",
            color: "white",
          }}
        >
          Notre équipe
        </Typography>
  
        <Grid container spacing={6} justifyContent="center">
          {members.map((member, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <AvatarCircle src={member.image} alt={member.name} />
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  sx={{ color: "white", fontFamily: "Poppins, sans-serif" }}
                >
                  {member.name}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontStyle: "italic",
                    color: "#FFE5CF",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {member.role}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </BackgroundBox>
    );
  };
  
  export default TeamSection;