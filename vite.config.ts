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
      // We do NOT use process.env here to avoid browser crashes.
      // We inject the key into a custom global variable.
      '__GEMINI_KEY__': JSON.stringify(env.API_KEY)
    }
  }
})
