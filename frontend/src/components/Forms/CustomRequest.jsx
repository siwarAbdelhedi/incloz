import {
  Alert,
  Box,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Link,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import bgPattern from "../../assets/photo2.png";
import axios from "axios";
import { DUREE_CONSERVATION_MOIS } from "../../config/entreprise";

const API_URL = import.meta.env.VITE_API_URL;

const CHAMPS_VIDES = {
  nom: "", prenom: "", email: "", telephone: "",
  rue: "", ville: "", codePostal: "", typeVetement: "",
  taille: "", hanches: "", cuisse: "", entrejambe: "",
  photos: null,
  // Jamais pré-cochée : un consentement pré-coché n'en est pas un.
  consentement: false,
};

const CustomRequest = () => {
  const [formData, setFormData] = useState(CHAMPS_VIDES);

  const [fileName, setFileName] = useState("");
  const [erreur, setErreur] = useState("");

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (files) {
      setFileName(files[0].name);
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");

    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => data.append(key, value));

    try {
      await axios.post(`${API_URL}/custom-request`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Demande envoyée !");
      setFormData(CHAMPS_VIDES);
      setFileName("");
    } catch (err) {
      // L'API refuse désormais une demande sans consentement. Sans ce retour,
      // le refus serait invisible : le visiteur repartirait en croyant sa
      // demande envoyée. Les autres retours du formulaire — état d'envoi,
      // champs obligatoires, remplacement de l'alerte — relèvent de la refonte
      // des formulaires.
      setErreur(
        err.response?.data?.message ??
          "L’envoi a échoué. Vérifiez votre connexion et réessayez."
      );
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "#FFF6EB",
        backgroundImage: `url(${bgPattern})`,
        backgroundRepeat: "repeat",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 10,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 600,
          backgroundColor: "#fff7f0",
          borderRadius: "16px",
          padding: 4,
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography variant="h4" component="h1" fontWeight="bold" color="#14235E" mb={4} textAlign="center">
          Fiche de renseignement
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            {[
              { label: "Nom", name: "nom" },
              { label: "Prénom", name: "prenom" },
              { label: "Mail", name: "email", type: "email" },
              { label: "Téléphone", name: "telephone" },
              { label: "Rue", name: "rue" },
              { label: "Ville", name: "ville" },
              { label: "Code Postal", name: "codePostal" },
            ].map((field, idx) => (
              <Grid item xs={12} sm={field.name === "ville" || field.name === "codePostal" ? 6 : 12} key={idx}>
                <TextField
                  fullWidth variant="outlined" label={field.label}
                  name={field.name} value={formData[field.name]}
                  type={field.type || "text"} onChange={handleChange}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <TextField
                select fullWidth label="Type de vêtements"
                name="typeVetement" value={formData.typeVetement}
                onChange={handleChange}
              >
                <MenuItem value="tshirt">T-shirt fitness</MenuItem>
                <MenuItem value="short">Short fitness</MenuItem>
                <MenuItem value="jogging">Jogging fitness</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" color="#14235E">Mesures</Typography>
            </Grid>

            {[
              { label: "Tour de taille (en cm)", name: "taille" },
              { label: "Largeur des hanches (en cm)", name: "hanches" },
              { label: "Cuisse (en cm)", name: "cuisse" },
              { label: "Entrejambe (en cm)", name: "entrejambe" },
            ].map((field, idx) => (
              <Grid item xs={12} sm={6} key={idx}>
                <TextField
                  fullWidth type="number" variant="outlined"
                  label={field.label} name={field.name}
                  value={formData[field.name]} onChange={handleChange}
                />
              </Grid>
            ))}

            <Grid item xs={12}>
              <Typography color="#14235E" fontWeight="bold" mt={2}>
                Partagez des photos complémentaires*
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1 }}>
                <Button
                  variant="contained" component="label"
                  sx={{ backgroundColor: "#14235E" }}
                >
                  Télécharger
                  <input type="file" hidden name="photos" onChange={handleChange} />
                </Button>
                {fileName && (
                  <Typography variant="body2" color="text.secondary">
                    {fileName}
                  </Typography>
                )}
              </Box>
              <Typography variant="caption" mt={1} display="block">Formats : png, jpeg, pdf</Typography>
            </Grid>

            {/* Les mensurations et la photo peuvent révéler une situation de
                handicap : elles ne peuvent être traitées que sur consentement
                exprès. La case est obligatoire et n'est jamais pré-cochée, et
                l'API refuse la demande si elle n'est pas transmise. */}
            <Grid item xs={12}>
              <Box sx={{ mt: 3, p: 2, backgroundColor: "brand.cream", borderRadius: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      required
                      name="consentement"
                      checked={formData.consentement}
                      onChange={handleChange}
                      sx={{ color: "secondary.main", alignSelf: "flex-start", pt: 0 }}
                    />
                  }
                  sx={{ alignItems: "flex-start", m: 0 }}
                  label={
                    <Typography variant="body2" color="text.primary">
                      J’accepte qu’Incloz utilise les informations de ce
                      formulaire — mes mensurations et, le cas échéant, ma
                      photographie — pour étudier ma demande de vêtement adapté.
                      Elles sont conservées {DUREE_CONSERVATION_MOIS} mois, puis
                      supprimées. Je peux retirer mon accord à tout moment. Voir
                      la{" "}
                      <Link
                        component={RouterLink}
                        to="/politique-confidentialite"
                        color="primary.dark"
                      >
                        politique de confidentialité
                      </Link>
                      .
                    </Typography>
                  }
                />
              </Box>
            </Grid>

            {erreur && (
              <Grid item xs={12}>
                <Alert severity="error" role="alert" sx={{ mt: 2 }}>
                  {erreur}
                </Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                sx={{ backgroundColor: "#FD4802", borderRadius: 2, mt: 4, px: 5 }}
              >
                Envoyer
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Box>
  );
};

export default CustomRequest;
