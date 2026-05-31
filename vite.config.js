import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// El proxy reenvía /api/* al backend en desarrollo, evitando el bloqueo CORS
// del navegador (el backend resolverá CORS en producción).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
