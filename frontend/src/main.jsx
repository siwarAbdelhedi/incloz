import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Police de marque, auto-hébergée par le bundle : pas de requête vers un
// domaine tiers, donc pas de dépendance réseau ni de fuite d'adresse IP des
// visiteurs vers Google. Le nom de la famille est défini dans theme.js.
import '@fontsource-variable/outfit'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
