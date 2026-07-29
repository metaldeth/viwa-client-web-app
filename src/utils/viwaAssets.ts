import manifest from '../data/viwaAssetManifest.json';

const VIWA_ASSETS_BASE = '/assets/viwa';

export type TasteImagePaths = {
  webp: string;
  png: string;
  altRu: string;
};

export type LogoImagePaths = {
  svg: string;
  png: string;
  altRu: string;
  width: number;
  height: number;
};

type ManifestAsset = {
  id: string;
  tasteMediaKey?: string;
  altRu: string;
  files: {
    svg?: { path: string; width?: number; height?: number };
    webp?: { path: string; width?: number; height?: number };
    png?: { path: string; width?: number; height?: number };
  };
};

const tasteAssetsByKey = new Map<string, ManifestAsset>();
let logoAsset: ManifestAsset | undefined;

for (const asset of manifest.assets as ManifestAsset[]) {
  if (asset.tasteMediaKey) {
    tasteAssetsByKey.set(asset.tasteMediaKey, asset);
  }
  if (asset.id === 'logo-viwa-mark') {
    logoAsset = asset;
  }
}

export function getTasteImagePaths(mediaKey: string, nameRu: string): TasteImagePaths {
  const asset = tasteAssetsByKey.get(mediaKey);
  if (asset?.files.webp?.path && asset.files.png?.path) {
    return {
      webp: `${VIWA_ASSETS_BASE}/${asset.files.webp.path}`,
      png: `${VIWA_ASSETS_BASE}/${asset.files.png.path}`,
      altRu: asset.altRu,
    };
  }

  return {
    webp: `${VIWA_ASSETS_BASE}/tastes/${mediaKey}.webp`,
    png: `${VIWA_ASSETS_BASE}/tastes/${mediaKey}.png`,
    altRu: nameRu,
  };
}

export function getTastePlaceholderLabel(nameRu: string): string {
  return nameRu.slice(0, 2).toUpperCase();
}

/** Diagonal-cut VIWA wordmark — SVG primary, PNG raster fallback, text fallback in UI on error. */
export function getLogoImagePaths(): LogoImagePaths {
  if (logoAsset?.files.svg?.path && logoAsset.files.png?.path) {
    return {
      svg: `${VIWA_ASSETS_BASE}/${logoAsset.files.svg.path}`,
      png: `${VIWA_ASSETS_BASE}/${logoAsset.files.png.path}`,
      altRu: logoAsset.altRu,
      width: logoAsset.files.svg.width ?? 277,
      height: logoAsset.files.svg.height ?? 243,
    };
  }

  return {
    svg: `${VIWA_ASSETS_BASE}/logo/logo-viwa-mark.svg`,
    png: `${VIWA_ASSETS_BASE}/logo/logo-viwa-mark.png`,
    altRu: 'VIWA',
    width: 277,
    height: 243,
  };
}

export function getViwaAssetManifestVersion(): string {
  return manifest.version;
}
