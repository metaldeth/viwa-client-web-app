#!/usr/bin/env node
/**
 * Deterministic cabinet site assets from canonical logo-viwa-mark.svg.
 * Preserves inner SVG transforms (scaleY) — never strips <g transform="...">.
 *
 * Run after logo changes: node scripts/generate-cabinet-site-assets.mjs
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOGO_VIEWBOX_H,
  LOGO_VIEWBOX_W,
  buildLogoOverlaySvg,
  buildOgCardSvgFallback,
  buildSquareIconSvg,
  patchLogoMarkManifestDimensions,
  readCanonicalLogoInner,
} from './lib/cabinet-logo-assets.mjs';
import { syncManifestWebmanifestBrandingUrls } from './lib/cabinet-site-metadata.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

const LOGO_SVG_PATH = join(root, 'public', 'assets', 'viwa', 'logo', 'logo-viwa-mark.svg');
const LOGO_PNG_PATH = join(root, 'public', 'assets', 'viwa', 'logo', 'logo-viwa-mark.png');
const LOGO_WEBP_PATH = join(root, 'public', 'assets', 'viwa', 'logo', 'logo-viwa-mark.webp');
const MANIFEST_PATHS = [
  join(root, 'public', 'assets', 'viwa', 'manifest.json'),
  join(root, 'src', 'data', 'viwaAssetManifest.json'),
];
const ICONS_DIR = join(root, 'public', 'icons');
const SOCIAL_DIR = join(root, 'public', 'assets', 'social');
const SOCIAL_SOURCE_DIR = join(SOCIAL_DIR, 'source');
const SOCIAL_SOURCE_PATH = join(SOCIAL_SOURCE_DIR, 'landing-station-product.png');
const FAVICON_SVG_PATH = join(root, 'public', 'favicon.svg');
const OG_OUT = join(SOCIAL_DIR, 'og-card.png');
const CARD_W = 1200;
const CARD_H = 630;

const LOGO_INNER = readCanonicalLogoInner(LOGO_SVG_PATH);

mkdirSync(ICONS_DIR, { recursive: true });
mkdirSync(SOCIAL_DIR, { recursive: true });
mkdirSync(SOCIAL_SOURCE_DIR, { recursive: true });

function ogCardTextOverlaySvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_W}" height="${CARD_H}" viewBox="0 0 ${CARD_W} ${CARD_H}">
  <text x="72" y="430" fill="#ffffff"
        font-family="Inter, Segoe UI, system-ui, -apple-system, Roboto, Helvetica, Arial, sans-serif"
        font-size="46" font-weight="600" letter-spacing="0.01em">Личный кабинет</text>
</svg>`;
}

function resvgRender(svgContent, outPath, fitTo) {
  const tmpSvg = join(root, 'scripts', `.tmp-${outPath.split(/[/\\]/).pop()}.svg`);
  writeFileSync(tmpSvg, svgContent, 'utf8');
  try {
    const args = ['--yes', '@resvg/resvg-js-cli', '--fit-to', fitTo, tmpSvg, outPath];
    execFileSync('npx', args, { stdio: 'inherit', shell: true, cwd: root });
  } finally {
    try {
      unlinkSync(tmpSvg);
    } catch {
      // Non-fatal if temp cleanup fails.
    }
  }
}

function resvgRenderFile(svgPath, outPath, fitTo, extraArgs = []) {
  const args = [
    '--yes',
    '@resvg/resvg-js-cli',
    '--fit-to',
    fitTo,
    ...extraArgs,
    svgPath,
    outPath,
  ];
  execFileSync('npx', args, { stdio: 'inherit', shell: true, cwd: root });
}

function pngToWebp(pngPath, webpPath) {
  const pyScript = join(root, 'scripts', '.tmp-logo-webp.py');
  writeFileSync(
    pyScript,
    `import sys
from PIL import Image
img = Image.open(sys.argv[1]).convert("RGBA")
if img.size != (${LOGO_VIEWBOX_W}, ${LOGO_VIEWBOX_H}):
    raise SystemExit(f"Unexpected logo PNG size: {img.size}")
img.save(sys.argv[2], format="WEBP", quality=85, method=6)
print(f"Wrote {sys.argv[2]}")
`,
    'utf8',
  );
  try {
    execFileSync('python', [pyScript, pngPath, webpPath], { stdio: 'inherit', cwd: root });
  } finally {
    try {
      unlinkSync(pyScript);
    } catch {
      // Non-fatal.
    }
  }
}

function buildLogoMarkRasters() {
  resvgRenderFile(
    LOGO_SVG_PATH,
    LOGO_PNG_PATH,
    `${LOGO_VIEWBOX_W}x${LOGO_VIEWBOX_H}`,
    ['--background', 'transparent'],
  );
  console.log(`Wrote logo/logo-viwa-mark.png (${LOGO_VIEWBOX_W}x${LOGO_VIEWBOX_H})`);
  pngToWebp(LOGO_PNG_PATH, LOGO_WEBP_PATH);
}

function syncLogoManifestDimensions() {
  for (const manifestPath of MANIFEST_PATHS) {
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    patchLogoMarkManifestDimensions(manifest);
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
    console.log('Updated manifest logo-viwa-mark dimensions:', manifestPath);
  }
}

function composeOgCardFromPhoto(sourcePath, logoPngPath, textPngPath, outPath) {
  const pyScript = join(root, 'scripts', '.compose-og-card-tmp.py');
  writeFileSync(
    pyScript,
    `import sys
from PIL import Image, ImageDraw

card_w, card_h = ${CARD_W}, ${CARD_H}
source_path, logo_path, text_path, out_path = sys.argv[1:5]

photo = Image.open(source_path).convert('RGB')
scale = max(card_w / photo.width, card_h / photo.height)
scaled = photo.resize((int(photo.width * scale), int(photo.height * scale)), Image.Resampling.LANCZOS)
left = max(0, min(scaled.width - card_w, int(scaled.width * 0.34)))
top = max(0, (scaled.height - card_h) // 2)
base = scaled.crop((left, top, left + card_w, top + card_h))

overlay = Image.new('RGBA', (card_w, card_h), (0, 0, 0, 0))
draw = ImageDraw.Draw(overlay)
for x in range(card_w):
    t = x / (card_w - 1)
    if t <= 0.52:
        alpha = int(228 - t * 90)
        draw.line([(x, 0), (x, card_h)], fill=(8, 6, 14, alpha))
    elif t <= 0.78:
        fade = (t - 0.52) / 0.26
        alpha = int(138 * (1 - fade))
        draw.line([(x, 0), (x, card_h)], fill=(0, 0, 0, alpha))

base = base.convert('RGBA')
base.alpha_composite(overlay)

logo = Image.open(logo_path).convert('RGBA')
logo_x, logo_y = 72, 248
base.alpha_composite(logo, (logo_x, logo_y))

text = Image.open(text_path).convert('RGBA')
base.alpha_composite(text, (0, 0))

rgb = base.convert('RGB')
try:
    rgb = rgb.quantize(colors=192, method=Image.Quantize.MEDIANCUT).convert('RGB')
except Exception:
    pass
rgb.save(out_path, format='PNG', optimize=True, compress_level=9)
print(f"Wrote {out_path}")
`,
    'utf8',
  );

  try {
    execFileSync('python', [pyScript, sourcePath, logoPngPath, textPngPath, outPath], {
      stdio: 'inherit',
      cwd: root,
    });
  } finally {
    try {
      unlinkSync(pyScript);
    } catch {
      // Non-fatal.
    }
  }
}

function buildOgCard() {
  if (!existsSync(SOCIAL_SOURCE_PATH)) {
    console.warn('Social source missing at', SOCIAL_SOURCE_PATH, '— using SVG fallback');
    resvgRender(buildOgCardSvgFallback(LOGO_INNER), OG_OUT, `${CARD_W}x${CARD_H}`);
    console.log('Wrote assets/social/og-card.png (fallback)');
    return;
  }

  const logoTmp = join(root, 'scripts', '.tmp-og-logo.png');
  const textTmp = join(root, 'scripts', '.tmp-og-text.png');

  try {
    resvgRender(buildLogoOverlaySvg(248, 134, LOGO_INNER), logoTmp, '248x134');
    resvgRender(ogCardTextOverlaySvg(), textTmp, `${CARD_W}x${CARD_H}`);
    composeOgCardFromPhoto(SOCIAL_SOURCE_PATH, logoTmp, textTmp, OG_OUT);
    console.log('Wrote assets/social/og-card.png from', SOCIAL_SOURCE_PATH);
  } finally {
    for (const tmp of [logoTmp, textTmp]) {
      try {
        unlinkSync(tmp);
      } catch {
        // Non-fatal.
      }
    }
  }
}

buildLogoMarkRasters();
syncLogoManifestDimensions();

const faviconContent = buildSquareIconSvg(32, LOGO_INNER);
writeFileSync(FAVICON_SVG_PATH, faviconContent, 'utf8');
console.log('Wrote public/favicon.svg');

const iconSizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'favicon-32.png', size: 32 },
];

for (const { name, size } of iconSizes) {
  const out = join(ICONS_DIR, name);
  resvgRender(buildSquareIconSvg(size, LOGO_INNER), out, `${size}x${size}`);
  console.log(`Wrote icons/${name}`);
}

buildOgCard();

syncManifestWebmanifestBrandingUrls(root);

console.log('Cabinet site assets generated from', LOGO_SVG_PATH);
