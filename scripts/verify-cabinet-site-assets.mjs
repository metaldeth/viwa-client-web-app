#!/usr/bin/env node
/**
 * Deterministic geometry checks for cabinet logo/icon pipeline output.
 * - Square icons: foreground bbox center offsets and padding asymmetry
 * - logo-viwa-mark rasters: dimensions + manifest sync
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ICON_CENTER_TOLERANCE_PCT,
  ICON_PADDING_ASYMMETRY_PCT,
  LOGO_VIEWBOX_H,
  LOGO_VIEWBOX_W,
  analyzeIconForegroundBbox,
  patchLogoMarkManifestDimensions,
  readPngDimensions,
  validateIconGeometry,
} from './lib/cabinet-logo-assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const SQUARE_ICONS = [
  { rel: 'public/icons/icon-192.png', size: 192 },
  { rel: 'public/icons/icon-512.png', size: 512 },
  { rel: 'public/icons/apple-touch-icon.png', size: 180 },
  { rel: 'public/icons/favicon-32.png', size: 32 },
];

const LOGO_RASTERS = [
  { rel: 'public/assets/viwa/logo/logo-viwa-mark.png', width: LOGO_VIEWBOX_W, height: LOGO_VIEWBOX_H },
  { rel: 'public/assets/viwa/logo/logo-viwa-mark.webp', width: LOGO_VIEWBOX_W, height: LOGO_VIEWBOX_H },
];

const MANIFEST_PATHS = [
  join(root, 'public', 'assets', 'viwa', 'manifest.json'),
  join(root, 'src', 'data', 'viwaAssetManifest.json'),
];

function analyzePngForegroundBbox(absPath) {
  const pyScript = join(root, 'scripts', '.tmp-icon-bbox.py');
  writeFileSync(
    pyScript,
    `import json, sys
from PIL import Image

path = sys.argv[1]
im = Image.open(path).convert("RGBA")
px = im.load()
w, h = im.size
minx, miny, maxx, maxy = w, h, -1, -1
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if a > 16 and (r > 20 or g > 20 or b > 20):
            minx = min(minx, x)
            miny = min(miny, y)
            maxx = max(maxx, x)
            maxy = max(maxy, y)
if maxx < 0:
    raise SystemExit("no foreground pixels")
print(json.dumps({"width": w, "height": h, "minX": minx, "minY": miny, "maxX": maxx, "maxY": maxy}))
`,
    'utf8',
  );

  try {
    const out = execFileSync('python', [pyScript, absPath], { encoding: 'utf8', cwd: root }).trim();
    return JSON.parse(out);
  } finally {
    try {
      unlinkSync(pyScript);
    } catch {
      // Non-fatal.
    }
  }
}

function readWebpDimensions(absPath) {
  const pyScript = join(root, 'scripts', '.tmp-webp-dims.py');
  writeFileSync(
    pyScript,
    `import json, sys
from PIL import Image
im = Image.open(sys.argv[1])
print(json.dumps({"width": im.width, "height": im.height}))
`,
    'utf8',
  );

  try {
    const out = execFileSync('python', [pyScript, absPath], { encoding: 'utf8', cwd: root }).trim();
    return JSON.parse(out);
  } finally {
    try {
      unlinkSync(pyScript);
    } catch {
      // Non-fatal.
    }
  }
}

function verifyManifestLogoDimensions() {
  const issues = [];
  for (const manifestPath of MANIFEST_PATHS) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    const expected = JSON.parse(JSON.stringify(manifest));
    patchLogoMarkManifestDimensions(expected);

    const asset = manifest.assets.find((entry) => entry.id === 'logo-viwa-mark');
    const expectedAsset = expected.assets.find((entry) => entry.id === 'logo-viwa-mark');
    for (const format of ['svg', 'png', 'webp']) {
      const actual = asset?.files?.[format];
      const exp = expectedAsset?.files?.[format];
      if (!actual || !exp) continue;
      if (actual.width !== exp.width || actual.height !== exp.height) {
        issues.push(
          `${manifestPath}: logo-viwa-mark ${format} manifest ${actual.width}x${actual.height} != ${exp.width}x${exp.height}`,
        );
      }
    }
  }
  return issues;
}

function verifySvgPreservesScaleTransform() {
  const svgPath = join(root, 'public/assets/viwa/logo/logo-viwa-mark.svg');
  const svg = readFileSync(svgPath, 'utf8');
  const issues = [];
  if (!svg.includes('scale(1 0.617284)')) {
    issues.push('logo-viwa-mark.svg missing inner scaleY transform');
  }
  if (!/viewBox="0 0 277 150"/.test(svg)) {
    issues.push('logo-viwa-mark.svg viewBox must be 277x150');
  }
  return issues;
}

export function verifyCabinetSiteAssets({ rootDir = root } = {}) {
  const issues = [];

  issues.push(...verifySvgPreservesScaleTransform());

  for (const { rel, size } of SQUARE_ICONS) {
    const abs = join(rootDir, rel);
    if (!existsSync(abs)) {
      issues.push(`MISSING ${rel}`);
      continue;
    }
    const dims = readPngDimensions(abs);
    if (!dims || dims.width !== size || dims.height !== size) {
      issues.push(`${rel}: expected ${size}x${size}, got ${dims ? `${dims.width}x${dims.height}` : 'invalid PNG'}`);
      continue;
    }

    const raw = analyzePngForegroundBbox(abs);
    const analysis = analyzeIconForegroundBbox(raw);
    issues.push(...validateIconGeometry(analysis, rel));
  }

  for (const { rel, width, height } of LOGO_RASTERS) {
    const abs = join(rootDir, rel);
    if (!existsSync(abs)) {
      issues.push(`MISSING ${rel}`);
      continue;
    }
    const dims = rel.endsWith('.webp') ? readWebpDimensions(abs) : readPngDimensions(abs);
    if (!dims || dims.width !== width || dims.height !== height) {
      issues.push(`${rel}: expected ${width}x${height}, got ${dims ? `${dims.width}x${dims.height}` : 'invalid'}`);
    }
  }

  issues.push(...verifyManifestLogoDimensions());

  const faviconSvg = join(rootDir, 'public/favicon.svg');
  if (existsSync(faviconSvg)) {
    const content = readFileSync(faviconSvg, 'utf8');
    if (!content.includes('scale(1 0.617284)')) {
      issues.push('favicon.svg must preserve canonical inner scaleY transform');
    }
    if (content.match(/translate\([^)]+\)\s*scale\([^)]+\)[\s\S]*<path/)) {
      // outer layout transform + inner canonical g — OK
    } else if (!content.includes('<path')) {
      issues.push('favicon.svg missing logo path');
    }
  } else {
    issues.push('MISSING public/favicon.svg');
  }

  return issues;
}

function main() {
  const issues = verifyCabinetSiteAssets();
  if (issues.length > 0) {
    console.error('Cabinet site asset verification FAILED:');
    for (const issue of issues) {
      console.error(' -', issue);
    }
    process.exit(1);
  }

  console.log('Cabinet site asset geometry OK');
  console.log(
    `Square icons: center <= ${ICON_CENTER_TOLERANCE_PCT}%, padding asymmetry <= ${ICON_PADDING_ASYMMETRY_PCT}%`,
  );
  console.log(`logo-viwa-mark rasters: ${LOGO_VIEWBOX_W}x${LOGO_VIEWBOX_H}`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main();
}
