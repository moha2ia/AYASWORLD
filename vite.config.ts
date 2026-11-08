import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH lets the same build work at a subpath (e.g. GitHub Pages).
// Netlify/Vercel need no special configuration.
const nodeProcess = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process;

export default defineConfig({
  base: nodeProcess?.env?.BASE_PATH || '/',
  plugins: [react()],
  build: {
    target: 'es2020',
    sourcemap: false,
  },
});
