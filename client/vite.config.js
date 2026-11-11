import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3121,
    proxy: {
      '/api': {
        target: 'http://localhost:5439',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5439',
        changeOrigin: true,
      },
    },
  },
});
