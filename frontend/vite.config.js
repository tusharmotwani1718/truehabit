import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import dotenv from 'dotenv';
dotenv.config();

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL,
        changeOrigin: true,
        secure: false,
        ws: true,
        // cookieDomainRewrite: "", // Ensure cookies are set correctly
        headers: {
          "X-Forwarded-For": "127.0.0.1",
        }
      },

    }
  },
  plugins: [
    react(),
    tailwindcss({
      config: {
        darkMode: 'class'
      }
    })
  ],
})
