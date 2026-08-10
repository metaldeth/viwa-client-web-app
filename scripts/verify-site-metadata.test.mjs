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
    assert.equal(releaseVersion, '0.1.45');
    assert.equal(brandingCacheQuery(releaseVersion), '?v=0.1.45');
  });

  it('builds absolute OG preview URL with release query', () => {
    assert.equal(
      resolveStaticOgImageUrl(releaseVersion),
      'https://cabinet.vitamin-water.ru/assets/social/og-card.png?v=0.1.45',
    );
  });

  it('indexes versioned favicon, apple-touch, manifest and OG URLs in index.html', () => {
    assert.match(indexHtml, /href="\/favicon\.svg\?v=0\.1\.45"/);
    assert.match(indexHtml, /href="\/icons\/favicon-32\.png\?v=0\.1\.45"/);
    assert.match(indexHtml, /href="\/icons\/icon-192\.png\?v=0\.1\.45"/);
    assert.match(indexHtml, /href="\/icons\/apple-touch-icon\.png\?v=0\.1\.45"/);
    assert.match(indexHtml, /href="\/manifest\.webmanifest\?v=0\.1\.45"/);
    assert.match(
      indexHtml,
      /property="og:image"\s+content="https:\/\/cabinet\.vitamin-water\.ru\/assets\/social\/og-card\.png\?v=0\.1\.45"/,
    );
    assert.match(
      indexHtml,
      /name="twitter:image"\s+content="https:\/\/cabinet\.vitamin-water\.ru\/assets\/social\/og-card\.png\?v=0\.1\.45"/,
    );
    assert.doesNotMatch(indexHtml, /\/sw\.js\?v=/);
  });

  it('indexes versioned PWA icon src entries in manifest.webmanifest', () => {
    assert.match(manifest, /"src": "\/icons\/icon-192\.png\?v=0\.1\.45"/);
    assert.match(manifest, /"src": "\/icons\/icon-512\.png\?v=0\.1\.45"/g);
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
      '/icons/icon-192.png?v=0.1.45',
    );
  });
});
