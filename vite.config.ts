import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    // IMPORTANT: base: './' is required for GitHub Pages deployment
    base: './',
    root: './',
    build: {
      outDir: 'dist',
    },
    define: {
      // Polyfill process.env to prevent "process is not defined" crash in browser
      'process.env': {},
      // Inject the API Key specifically
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})
