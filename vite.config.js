import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: '.',
  plugins: [react()],
  publicDir: "public",
  server: {
    port: 8080,
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
