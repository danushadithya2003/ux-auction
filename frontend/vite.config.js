import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// Dev: talks to the Flask backend on :5050 via proxy (npm run dev).
// Build: outputs into ../static/app so Flask can serve the built app
// directly - the end user only ever runs `python3 app.py`, never npm.
export default defineConfig({
  plugins: [react()],
  base: '/static/app/',
  build: {
    outDir: '../static/app',
    emptyOutDir: true,
  },
  server: {
    proxy: {
      '/api': 'http://localhost:5050',
    },
  },
})
