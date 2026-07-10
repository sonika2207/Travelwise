import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Use native fs events on Windows (not polling) to avoid spurious reloads
      usePolling: false,
      // Add a small stabilization delay so rapid CSS rewrites from tailwindcss/vite
      // are batched into a single HMR update instead of cascading reloads
      stabilityThreshold: 100,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    },
  },
})
