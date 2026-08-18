import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  brandingCacheQuery,
  readCabinetReleaseVersion,
  resolveStaticOgImageUrl,
  withBrandingCacheBust,
} from './lib/cabinet-site-metadata.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const releaseVersion = readCabinetReleaseVersion(root);
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const manifest = readFileSync(join(root, 'public', 'manifest.webmanifest'), 'utf8');

describe('cabinet site metadata cache-bust', () => {
  it('uses package.json release version for branding query', () => {
    assert.equal(releaseVersion, readCabinetReleaseVersion(root));
    assert.equal(brandingCacheQuery(releaseVersion), `?v=${releaseVersion}`);
  });

  it('builds absolute OG preview URL with release query', () => {
    const ogImageUrl = resolveStaticOgImageUrl(releaseVersion);
    assert.equal(
      ogImageUrl,
      `https://cabinet.vitamin-water.ru/assets/social/og-card.png?v=${releaseVersion}`,
    );
  });

  it('indexes versioned favicon, apple-touch, manifest and OG URLs in index.html', () => {
    const ogImageUrl = resolveStaticOgImageUrl(releaseVersion);
    assert.ok(indexHtml.includes(`href="${withBrandingCacheBust('/favicon.svg', releaseVersion)}"`));
    assert.ok(indexHtml.includes(`href="${withBrandingCacheBust('/icons/favicon-32.png', releaseVersion)}"`));
    assert.ok(indexHtml.includes(`href="${withBrandingCacheBust('/icons/icon-192.png', releaseVersion)}"`));
    assert.ok(
      indexHtml.includes(`href="${withBrandingCacheBust('/icons/apple-touch-icon.png', releaseVersion)}"`),
    );
    assert.ok(
      indexHtml.includes(`href="${withBrandingCacheBust('/manifest.webmanifest', releaseVersion)}"`),
    );
    assert.ok(indexHtml.includes('property="og:image"'));
    assert.ok(indexHtml.includes(ogImageUrl));
    assert.ok(indexHtml.includes('name="twitter:image"'));
    assert.ok(indexHtml.includes(ogImageUrl));
    assert.doesNotMatch(indexHtml, /\/sw\.js\?v=/);
  });

  it('indexes versioned PWA icon src entries in manifest.webmanifest', () => {
    const icon192Src = `"src": "${withBrandingCacheBust('/icons/icon-192.png', releaseVersion)}"`;
    const icon512Src = `"src": "${withBrandingCacheBust('/icons/icon-512.png', releaseVersion)}"`;
    assert.ok(manifest.includes(icon192Src));
    assert.equal(manifest.split(icon512Src).length - 1, 2);
  });

  it('keeps canonical and og:url without cache-bust query', () => {
    assert.match(indexHtml, /rel="canonical" href="https:\/\/cabinet\.vitamin-water\.ru\/"/);
    assert.match(indexHtml, /property="og:url" content="https:\/\/cabinet\.vitamin-water\.ru\/"/);
  });

  it('leaves underlying branding asset files on disk without query suffix', () => {
    for (const rel of [
      'public/favicon.svg',
      'public/icons/favicon-32.png',
      'public/icons/icon-192.png',
      'public/icons/apple-touch-icon.png',
      'public/assets/social/og-card.png',
      'public/manifest.webmanifest',
    ]) {
      assert.ok(existsSync(join(root, rel)), rel);
    }
  });

  it('replaces stale query when re-syncing branding URLs', () => {
    assert.equal(
      withBrandingCacheBust('/icons/icon-192.png?v=0.1.41', releaseVersion),
      withBrandingCacheBust('/icons/icon-192.png', releaseVersion),
    );
  });
});


