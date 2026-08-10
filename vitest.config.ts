import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';
import { projectRoot, resolveFromRoot } from './scripts/projectRoot.mjs';

process.chdir(projectRoot);

export default defineConfig({
  root: projectRoot,
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolveFromRoot('src'),
      '@consta/uikit': resolveFromRoot('node_modules/@asnefedov/uikit'),
      '@consta/icons': resolveFromRoot('node_modules/@asnefedov/icons'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    pool: 'forks',
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    env: {
      DEV: 'false',
      VITE_VIWA_TELEMETRY_API_URL: 'http://localhost:3000/api/v1',
    },
  },
  define: {
    '__APP_VERSION__': JSON.stringify('1.0.0-test'),
    'import.meta.env.DEV': false,
  },
});
