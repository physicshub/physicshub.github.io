import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Assicura che questo sia impostato sulla root
  build: {
    outDir: 'dist', // Directory di output per la build
    rollupOptions: {
      input: {
        main: './index.html' // Specifica il punto di ingresso principale
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src' // Opzionale: Aggiunge un alias per la directory source
    }
  }
})