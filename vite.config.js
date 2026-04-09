import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: /.*\/config\/env\.js$/,
        replacement: resolve(__dirname, 'src/config/env.browser.js')
      },
      {
        find: /.*\/core\/storage\.js$/,
        replacement: resolve(__dirname, 'src/core/storage.browser.js')
      }
    ]
  },
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:3001'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
