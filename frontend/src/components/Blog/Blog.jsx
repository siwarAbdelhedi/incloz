import { Box, Typography, Button, Container, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import IMG from "../../assets/paralampique.jpg"

const HeroContainer = styled(Box)(({ theme }) => ({
  backgroundColor: '#FFF',
  padding: theme.spacing(4, 0),
}));

const LogoBadge = styled(Box)(({ theme }) => ({
  backgroundColor: '#FD4802', 
  color: '#FFF6EB', 
  padding: theme.spacing(1, 2),
  display: 'inline-block',
  marginRight: theme.spacing(2), 
}));

const HeroTitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Decalotype, sans-serif',
  fontWeight: 'bold',
  color: '#14235E', 
  marginBottom: theme.spacing(2),
}));

const OrangeText = styled('span')(() => ({
  color: '#FD4802', 
}));

const HeroSubtitle = styled(Typography)(({ theme }) => ({
  fontFamily: 'Decalotype, sans-serif',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(3),
}));

const ReadButton = styled(Button)(() => ({
  fontFamily: 'Decalotype, sans-serif',
  color: '#FD4802',
  padding: 0,
  '&:hover': {
    backgroundColor: 'transparent',
  },
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  textTransform: 'none', 
}));

const Hero = () => {
  return (
    <HeroContainer>
      <Container maxWidth="xl">
        <Grid container spacing={4} alignItems="center">
          {/* Texte de gauche */}
          <Grid item xs={12} md={6}>
            {/* Conteneur pour le badge et le titre */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <LogoBadge>
                <Typography variant="subtitle1" fontWeight="bold">
                  INCLOZ
                </Typography>
              </LogoBadge>
              <HeroTitle variant="h3" component="h1">
                L&apos;Impact des Jeux Paralympiques sur la perception du Handi Sport <OrangeText>dans la Société</OrangeText>
              </HeroTitle>
            </Box>
            <HeroSubtitle variant="body1">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
            </HeroSubtitle>
            <ReadButton endIcon={<ArrowForwardIcon />}>
              Lire l&apos;article
            </ReadButton>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              component="img"
              sx={{
                height: 'auto',
                width: '100%',
                maxHeight: 500,
                objectFit: 'cover',
                borderRadius: 2,
                boxShadow: 3,
              }}
              alt="Paralympic athlete playing tennis"
              src={IMG} 
            />
          </Grid>
        </Grid>
        <Box
      sx={{
        backgroundColor: '#FFF', 
        padding: '50px 0',
      }}
    >
      <Container maxWidth="lg">

        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
        Les Jeux Paralympiques, en tant qu&apos;événement mondial majeur, jouent un rôle crucial dans la façon dont la société perçoit le 
        handi sport et les personnes handicapées. Depuis leur création, ces jeux ont non seulement célébré les athlètes 
        paralympiques pour leurs performances exceptionnelles, mais ont également contribué à changer les attitudes et à 
        influencer les perceptions du public. Cet article explore comment les Jeux Paralympiques impactent la vision du handi sport 
        dans la société.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          1. Visibilité Accrue des Athlètes Paralympiques
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          Les Jeux Paralympiques offrent une plateforme internationale de visibilité aux athlètes handicapés. Cette 
          exposition médiatique accrue permet au grand public de découvrir les compétences et les talents de ces athlètes, 
          souvent sous-représentés dans les médias traditionnels. En voyant des personnes handicapées exceller dans des sports 
          de haut niveau, le public commence à remettre en question les stéréotypes négatifs et les préjugés associés au handicap. 
          Les performances impressionnantes et les histoires de résilience des athlètes paralympiques montrent que les personnes 
          handicapées peuvent atteindre des sommets d&apos;excellence sportive, tout comme leurs homologues valides.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          2. Sensibilisation et Éducation du Public
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          Les Jeux Paralympiques sont également un outil éducatif puissant. En mettant en avant des sports adaptés et des 
          disciplines spécifiques aux personnes handicapées, ils éduquent le public sur la diversité des capacités humaines et 
          les défis uniques auxquels les athlètes sont confrontés. Des campagnes médiatiques, des documentaires et des reportages 
          autour des jeux permettent de mieux comprendre les réalités du handisport, favorisant ainsi une plus grande empathie et 
          une sensibilisation accrue. Cette éducation aide à réduire les préjugés et à promouvoir une meilleure intégration des 
          personnes handicapées dans la société.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          3. Promotion de l&apos;Inclusion et de la Normalisation
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          En intégrant les Jeux Paralympiques dans le calendrier sportif mondial, la société commence à considérer le handisport 
          comme une partie intégrante du paysage sportif global. Cette normalisation contribue à briser les barrières entre les 
          athlètes handicapés et valides, en soulignant que le sport est universel et accessible à tous. Les événements 
          paralympiques renforcent l&apos;idée que le handicap n&apos;est pas un obstacle à la réussite sportive et favorisent une culture 
          de l&apos;inclusion.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          4. Impact sur les Politiques et les Infrastructures
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          L&aposattention accrue portée aux Jeux Paralympiques a un impact direct sur les politiques et les infrastructures. De 
          nombreux pays, en réponse au succès des jeux, investissent dans des installations sportives accessibles et adaptent 
          leurs politiques pour mieux soutenir les athlètes paralympiques. Ce soutien se traduit par une meilleure accessibilité 
          des infrastructures sportives, des opportunités de participation accrues et un soutien accru pour les programmes de 
          sport pour les personnes handicapées. Ces améliorations bénéficient non seulement aux athlètes de haut niveau mais 
          aussi aux personnes handicapées qui souhaitent participer à des activités sportives à un niveau amateur.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          5. Inspiration pour les Futures Générations
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          Les Jeux Paralympiques inspirent les jeunes générations, qu&apos;ils soient eux-mêmes handicapés ou non. En voyant des 
          athlètes paralympiques réaliser des exploits extraordinaires, les jeunes comprennent que les défis peuvent être 
          surmontés et que le handicap ne définit pas les limites des capacités. Cette inspiration joue un rôle clé dans le 
          développement de l&apos;estime de soi et dans l&apos;encouragement à poursuivre des rêves personnels, indépendamment des 
          obstacles.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Decalotype, sans-serif', color: '#FD4802' }}>
          Conclusion
        </Typography>
        <Typography paragraph sx={{ fontFamily: 'Decalotype, sans-serif', color: '#14235E' }}>
          Les Jeux Paralympiques ont un impact profond sur la perception du handisport dans la société. En offrant une 
          visibilité mondiale aux athlètes handicapés, en éduquant le public, en promouvant l&apos;inclusion, en influençant les 
          politiques et en inspirant les jeunes, les jeux contribuent à transformer les attitudes et à favoriser une vision 
          plus inclusive et respectueuse des personnes handicapées. Leur rôle dépasse le cadre sportif, en devenant un 
          catalyseur pour le changement social et culturel. Les Jeux Paralympiques ne sont pas seulement une célébration de 
          l&apos;excellence sportive, mais aussi un puissant levier pour la dignité et l&apos;égalité des personnes handicapées dans 
          la société.
        </Typography>
      </Container>
    </Box>
      </Container>
    </HeroContainer>
  );
};

export default Hero;