import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import "./App.css";
import theme from "./theme";

//Import components
import Header from "./components/Navbar/Header";
import HomeScreen from "./components/HomeScreen/Home";
import Footer from "./components/Footer";
import BoutiquePage from "./pages/BoutiquePage";
import Panier from "./components/BoutiquePages/Panier";
import ContactForm from "./components/Cantact/ContactForm";
import Blog from "./components/Blog/Blog";
import HistoryPage from "./pages/HistoryPage";
import DashboardPage from "./pages/DashboardPage";
import LoginForm from "./components/Auth/LoginForm";
import RegisterForm from "./components/Auth/RegisterForm";
import ProductDetail from "./components/BoutiquePages/ProductDetail";
import CustomRequest from "./components/Forms/CustomRequest";
import CGU from "./pages/CGU";
import MentionsLegales from "./pages/MentionsLegales";
import PolitiqueConfidentialite from "./pages/PolitiqueConfidentialite";
import NotFound from "./pages/NotFound";
import AuthProvider from "./context/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      {/* Applique la typographie et le fond du thème au document entier. Sans
          lui, seuls les composants MUI héritaient de la police de marque : le
          body et les éléments HTML bruts restaient en police par défaut du
          navigateur. */}
      <CssBaseline />
      <Router>
        {/* AuthProvider est à l'intérieur du Router : le header et
            ProtectedRoute ont besoin des deux contextes. */}
        <AuthProvider>
          {/* Premier élément focusable de la page. Sans lui, un utilisateur au
              clavier doit traverser tout le header — logo, 4 liens de menu,
              session, panier — avant d'atteindre le contenu, et cela sur chaque
              page visitée. */}
          <a className="lien-evitement" href="#contenu">
            Aller au contenu
          </a>
          <Header />
          {/* Le décalage sous la barre fixe est appliqué ici, une seule fois,
              plutôt que recopié dans chaque page. Neuf pages le déclaraient à
              70px — une valeur fausse aux deux breakpoints — et quatre autres
              (blog, contact, connexion, inscription) l'oubliaient purement et
              simplement : leur contenu passait sous la barre. */}
          <Box component="main" id="contenu" sx={{ pt: theme.layout.headerOffset }}>
            <Routes>
              <Route path="/" element={<HomeScreen />} />
              <Route path="/boutique" element={<BoutiquePage />} />
              <Route path="/panier" element={<Panier />} />
              <Route path="/ContactForm" element={<ContactForm />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/about" element={<HistoryPage />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/custom-request" element={<CustomRequest />} />

              {/* Pages légales : les composants existaient mais n'étaient routés
                  nulle part, donc inaccessibles depuis le site. */}
              <Route path="/cgu" element={<CGU />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route
                path="/politique-confidentialite"
                element={<PolitiqueConfidentialite />}
              />

              {/* Sans ce filet, toute URL inconnue affichait une page blanche. */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          <Footer />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
