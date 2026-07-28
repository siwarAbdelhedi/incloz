import { createContext } from 'react'

// Le contexte vit dans son propre fichier pour que AuthProvider.jsx n'exporte
// qu'un composant : c'est ce qu'attend le rafraîchissement à chaud de Vite.
export const AuthContext = createContext(null)
