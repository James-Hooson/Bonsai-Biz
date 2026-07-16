/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    // Scope to the frontend only — functions/ is a separate npm package with
    // its own vitest config/environment; without this, vitest's default glob
    // also picks up functions/src/*.test.ts from here.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/storage', 'firebase/auth'],
          'vendor-auth0': ['@auth0/auth0-react'],
        },
      },
    },
  },
})
