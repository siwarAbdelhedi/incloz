// Point d'entrée unique pour les URLs de l'API.
// Le fallback localhost permet de développer sans .env : avant, LoginForm et
// RegisterForm avaient l'URL de production en dur et tapaient donc api.incloz.com
// même en local.
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const IMG_URL =
  import.meta.env.VITE_IMG_URL || "http://localhost:5000/uploads";
