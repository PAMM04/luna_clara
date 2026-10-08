import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'

function copy404Plugin() {
  return {
    name: 'copy-404',
    closeBundle() {
      try {
        const indexPath = path.resolve(import.meta.dirname, 'dist', 'index.html')
        const notFoundPath = path.resolve(import.meta.dirname, 'dist', '404.html')
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath)
        }
      } catch (err) {
        console.warn('Could not copy 404.html:', err)
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), copy404Plugin()],
  base: './',
  envPrefix: ['VITE_', 'SUPABASE_'],
})
