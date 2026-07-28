// Accès centralisé à l'utilisateur connecté.
// La clé était écrite sous "userInfo" par les formulaires et relue sous "user"
// par le dashboard : personne n'était jamais reconnu comme connecté. Tout passe
// désormais par ces trois fonctions pour que la clé ne puisse plus diverger.
const STORAGE_KEY = "userInfo";

export const setStoredUser = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // Entrée corrompue : on considère l'utilisateur déconnecté plutôt que de
    // laisser JSON.parse casser le rendu de la page.
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};
