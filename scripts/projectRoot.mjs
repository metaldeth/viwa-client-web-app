import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));

/** @type {string} Canonical project root (junction/symlink-safe on Windows). */
export const projectRoot = fs.realpathSync.native(path.join(scriptDir, '..'));

/** @param {...string} segments */
export function resolveFromRoot(...segments) {
  return path.join(projectRoot, ...segments);
}
