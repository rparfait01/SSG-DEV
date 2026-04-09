import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Prevent Rollup from ever bundling Node.js-only modules into the browser build.
      // These are only used by api.js / storage.js (server-side) — never by JSX.
      external: (id) => {
        if (id.includes('/config/env.js')) return true;
        if (id.includes('/core/storage.js') && !id.includes('storage.browser')) return true;
        return false;
      }
    }
  }
});
