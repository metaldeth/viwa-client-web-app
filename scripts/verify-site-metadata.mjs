#!/usr/bin/env node
/**
 * Narrow checks for cabinet site metadata and static assets.
 * Exit 0 when all required files and HTML tags are present.
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brandingCacheQuery,
  readCabinetReleaseVersion,
  resolveStaticOgImageUrl,
  withBrandingCacheBust,
} from './lib/cabinet-site-metadata.mjs';
import { verifyCabinetSiteAssets } from './verify-cabinet-site-assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const releaseVersion = readCabinetReleaseVersion(root);
const cacheQuery = brandingCacheQuery(releaseVersion);
const staticOgImageUrl = resolveStaticOgImageUrl(releaseVersion);

const requiredFiles = [
  'public/favicon.svg',
  'public/icons/icon-192.png',
  'public/icons/icon-512.png',
  'public/icons/apple-touch-icon.png',
  'public/icons/favicon-32.png',
  'public/assets/social/source/landing-station-product.png',
  'public/assets/social/og-card.png',
  'public/assets/viwa/logo/logo-viwa-mark.svg',
  'public/manifest.webmanifest',
];

const html = readFileSync(join(root, 'index.html'), 'utf8');
const manifest = readFileSync(join(root, 'public/manifest.webmanifest'), 'utf8');

function htmlIncludesAll(parts) {
  return parts.every((part) => html.includes(part));
}

const requiredHtmlChecks = [
  ['title', '<title>Viwa — личный кабинет</title>'],
  ['description', 'name="description"'],
  ['robots', 'name="robots" content="noindex, nofollow"'],
  ['canonical', 'rel="canonical" href="https://cabinet.vitamin-water.ru/"'],
  ['og:title', 'property="og:title"'],
  ['og:description', 'property="og:description"'],
  ['og:url', 'property="og:url" content="https://cabinet.vitamin-water.ru/"'],
  ['og:image', 'property="og:image"', staticOgImageUrl],
  ['twitter:card', 'name="twitter:card" content="summary_large_image"'],
  ['twitter:image', 'name="twitter:image"', staticOgImageUrl],
  ['theme-color', 'name="theme-color" content="#000000"'],
  [
    'manifest',
    'rel="manifest"',
    `href="${withBrandingCacheBust('/manifest.webmanifest', releaseVersion)}"`,
  ],
  [
    'apple-touch-icon',
    'rel="apple-touch-icon"',
    `href="${withBrandingCacheBust('/icons/apple-touch-icon.png', releaseVersion)}"`,
  ],
  ['favicon.svg', `href="${withBrandingCacheBust('/favicon.svg', releaseVersion)}"`],
  ['favicon-32', `href="${withBrandingCacheBust('/icons/favicon-32.png', releaseVersion)}"`],
  ['icon-192', `href="${withBrandingCacheBust('/icons/icon-192.png', releaseVersion)}"`],
];

let failed = false;

for (const rel of requiredFiles) {
  const abs = join(root, rel);
  if (!existsSync(abs)) {
    console.error('MISSING file:', rel);
    failed = true;
  }
}

for (const check of requiredHtmlChecks) {
  const [, ...parts] = check;
  if (!htmlIncludesAll(parts)) {
    console.error('MISSING html check:', check[0], parts);
    failed = true;
  }
}

function readPngDimensions(filePath) {
  const buf = readFileSync(filePath);
  if (buf.length < 24 || buf.toString('ascii', 1, 4) !== 'PNG') {
    return null;
  }
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

if (html.includes('vite.svg')) {
  console.error('UNEXPECTED: index.html still references vite.svg');
  failed = true;
}

if (html.includes('/sw.js?v=') || html.includes('/sw.js?')) {
  console.error('UNEXPECTED: service worker URL must not carry cache-bust query');
  failed = true;
}

for (const iconPath of ['/icons/icon-192.png', '/icons/icon-512.png']) {
  const versioned = withBrandingCacheBust(iconPath, releaseVersion);
  if (!manifest.includes(`"src": "${versioned}"`)) {
    console.error('MISSING manifest icon src:', versioned);
    failed = true;
  }
}

const ogCardPath = join(root, 'public/assets/social/og-card.png');
const ogDims = existsSync(ogCardPath) ? readPngDimensions(ogCardPath) : null;
if (!ogDims || ogDims.width !== 1200 || ogDims.height !== 630) {
  console.error('INVALID og-card.png dimensions:', ogDims);
  failed = true;
}

if (failed) {
  process.exit(1);
}

const geometryIssues = verifyCabinetSiteAssets({ rootDir: root });
if (geometryIssues.length > 0) {
  console.error('Cabinet icon/logo geometry FAILED:');
  for (const issue of geometryIssues) {
    console.error(' -', issue);
  }
  process.exit(1);
}

console.log('Site metadata and assets OK');
console.log(`release cache-bust: ${cacheQuery}`);
console.log(`og:image: ${staticOgImageUrl}`);
console.log(`og-card.png: ${ogDims.width}x${ogDims.height}`);
