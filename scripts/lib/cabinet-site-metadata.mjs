import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const CABINET_SITE_ORIGIN = 'https://cabinet.vitamin-water.ru';

export function readCabinetReleaseVersion(rootDir) {
  const pkg = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
  return pkg.version;
}

export function brandingCacheQuery(version) {
  return `?v=${version}`;
}

/** Append deterministic release query; strips any existing query on the path. */
export function withBrandingCacheBust(path, version) {
  const base = path.split('?')[0];
  return `${base}${brandingCacheQuery(version)}`;
}

export function resolveStaticOgImageUrl(version, origin = CABINET_SITE_ORIGIN) {
  return `${origin}/assets/social/og-card.png${brandingCacheQuery(version)}`;
}

export const MANIFEST_ICON_PATHS = ['/icons/icon-192.png', '/icons/icon-512.png'];

export function syncManifestWebmanifestBrandingUrls(rootDir, version = readCabinetReleaseVersion(rootDir)) {
  const manifestPath = join(rootDir, 'public', 'manifest.webmanifest');
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let changed = false;

  for (const icon of manifest.icons ?? []) {
    if (typeof icon.src !== 'string' || !icon.src.startsWith('/icons/')) {
      continue;
    }
    const next = withBrandingCacheBust(icon.src, version);
    if (icon.src !== next) {
      icon.src = next;
      changed = true;
    }
  }

  if (changed) {
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  }

  return changed;
}
