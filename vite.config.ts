import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: '/',
  plugins: [react(), checker({ typescript: true })],
  server: {
    port: 3000,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@consta/uikit': path.resolve(__dirname, 'node_modules/@asnefedov/uikit'),
      '@consta/icons': path.resolve(__dirname, 'node_modules/@asnefedov/icons'),
    },
  },
});
