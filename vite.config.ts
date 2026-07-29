import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import { projectRoot, resolveFromRoot } from './scripts/projectRoot.mjs';

process.chdir(projectRoot);

export default defineConfig({
  root: projectRoot,
  base: '/',
  plugins: [react(), checker({ typescript: true })],
  // Avoid /assets/ clash when served on same host as viwa-telemetry dashboard.
  build: {
    assetsDir: 'client-assets',
  },
  server: {
    port: 3000,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': resolveFromRoot('src'),
      '@consta/uikit': resolveFromRoot('node_modules/@asnefedov/uikit'),
      '@consta/icons': resolveFromRoot('node_modules/@asnefedov/icons'),
    },
  },
});
