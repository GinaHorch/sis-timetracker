import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/sis-timetracker/' : '/', // Only use subdirectory for production builds
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // this tells Vite what @ means
    },
  },
}))