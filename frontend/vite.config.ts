import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' 

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      '/api': {
        // In Docker, use the backend service name as the host.
        // When running outside Docker (e.g. bare npm run dev), change this to http://localhost:8080.
        target: 'http://maillab-backend:8080',
        changeOrigin: true,
      },
    },
  },
})