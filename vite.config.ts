import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/LCEA-app/",
  server: {
    open: true, // open browser when you run npm run dev
  },
})
