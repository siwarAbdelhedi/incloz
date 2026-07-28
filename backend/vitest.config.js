import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./tests/setup.js'],
    // Une seule base éphémère partagée : les suites tournent en série pour ne
    // pas se marcher dessus sur les collections.
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 120000,
  },
})
