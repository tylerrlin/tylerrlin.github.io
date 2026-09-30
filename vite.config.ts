import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Keep React (and the CJS interop it shares with R3F) out of the
          // three chunk, so the entry never has to preload three.js.
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id) || id.includes('\0')) {
            return 'react'
          }
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          ) {
            return 'three'
          }
        },
      },
    },
  },
})
