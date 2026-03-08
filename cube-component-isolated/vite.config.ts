import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Generate a single JS file and a single CSS file to make embedding easy
    rollupOptions: {
      output: {
        entryFileNames: `assets/water-cube-widget.js`,
        chunkFileNames: `assets/water-cube-widget.js`,
        assetFileNames: `assets/water-cube-widget.[ext]`
      }
    }
  }
})
