import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
  // Chaque test repart d'une session vide : c'est la divergence entre écrans
  // sur le contenu du localStorage qui avait rendu le tableau de bord
  // inaccessible.
  localStorage.clear()
})
