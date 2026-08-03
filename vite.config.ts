import fs from 'fs';
import path from 'path';
import { readFileSync } from 'fs';
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import { projectRoot, resolveFromRoot } from './scripts/projectRoot.mjs';

process.chdir(projectRoot);

const pkg = JSON.parse(readFileSync(resolveFromRoot('package.json'), 'utf-8')) as {
  version: string;
};
const version = pkg.version;

const versionJsonPlugin = (appVersion: string): Plugin => ({
  name: 'version-json',
  writeBundle() {
    const outDir = path.join(projectRoot, 'dist');
    const payload = JSON.stringify({
      version: appVersion,
      builtAt: new Date().toISOString(),
    });
    fs.writeFileSync(path.join(outDir, 'version.json'), payload);
  },
});

export default defineConfig({
  root: projectRoot,
  base: '/',
  define: {
    __APP_VERSION__: JSON.stringify(version),
  },
  plugins: [react(), checker({ typescript: true }), versionJsonPlugin(version)],
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
