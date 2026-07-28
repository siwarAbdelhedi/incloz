import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
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

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/boutique" element={<BoutiquePage />} />
          <Route path="/panier" element={<Panier />} />
          <Route path="/ContactForm" element={<ContactForm />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<HistoryPage />}  />
          <Route path="/dashboard" element={<DashboardPage />} />
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
        <Footer />
      </Router>
    </ThemeProvider>
  );
};

export default App;
