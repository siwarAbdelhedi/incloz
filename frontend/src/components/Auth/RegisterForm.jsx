import { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/api";
import { useAuth } from "../../hooks/useAuth";

const StyledForm = styled(Box)(({ theme }) => ({
  maxWidth: "400px",
  margin: "auto",
  backgroundColor: "#FFF6EB",
  padding: theme.spacing(4),
  borderRadius: "10px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}));

const StyledButton = styled(Button)(() => ({
  backgroundColor: "#FD4802",
  color: "#FFF6EB",
  borderRadius: "25px",
  textTransform: "none",
  fontWeight: "bold",
  marginTop: "16px",
  "&:hover": {
    backgroundColor: "#14235E",
  },
}));

const RegisterForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Pas de champ isAdmin ici : le rôle ne doit jamais être choisi par le
  // visiteur. Un compte admin se promeut via PUT /api/users/:id (admin only).
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      login(data);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <StyledForm component="form" onSubmit={handleRegister}>
      <Typography variant="h5" component="h1" color="#14235E" fontWeight="bold" gutterBottom>
        Créer un compte
      </Typography>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <TextField
        fullWidth
        label="Nom complet"
        name="name"
        value={formData.name}
        onChange={handleChange}
        margin="normal"
        required
      />

      <TextField
        fullWidth
        label="Adresse mail"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        margin="normal"
        required
      />

      {/* Le minimum est aussi appliqué côté API : autant le dire avant l'envoi
          plutôt que de renvoyer l'utilisateur sur un message d'erreur. */}
      <TextField
        fullWidth
        label="Mot de passe"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
        inputProps={{ minLength: 8 }}
        helperText="8 caractères minimum"
      />

      <StyledButton fullWidth type="submit">
        S’inscrire
      </StyledButton>
    </StyledForm>
  );
};

export default RegisterForm;
