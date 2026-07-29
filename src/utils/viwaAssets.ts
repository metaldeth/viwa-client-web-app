import manifest from '../data/viwaAssetManifest.json';

const VIWA_ASSETS_BASE = '/assets/viwa';

export type TasteImagePaths = {
  webp: string;
  png: string;
  altRu: string;
};

export type LogoImagePaths = {
  svg: string;
  webp?: string;
  png: string;
  altRu: string;
  width: number;
  height: number;
};

type ManifestAsset = {
  id: string;
  category?: string;
  cabinetRole?: string;
  tasteMediaKey?: string;
  altRu: string;
  files: {
    svg?: { path: string; width?: number; height?: number };
    webp?: { path: string; width?: number; height?: number };
    png?: { path: string; width?: number; height?: number };
  };
};

const tasteBottleAssetsByKey = new Map<string, ManifestAsset>();
const tasteMedallionAssetsByKey = new Map<string, ManifestAsset>();
let logoAsset: ManifestAsset | undefined;
let cabinetHeaderLogoAsset: ManifestAsset | undefined;

for (const asset of manifest.assets as ManifestAsset[]) {
  if (asset.tasteMediaKey) {
    if (asset.category === 'taste-medallion') {
      tasteMedallionAssetsByKey.set(asset.tasteMediaKey, asset);
    } else if (asset.category === 'taste') {
      tasteBottleAssetsByKey.set(asset.tasteMediaKey, asset);
    }
  }
  if (asset.id === 'logo-viwa-mark') {
    logoAsset = asset;
  }
  if (asset.id === 'logo-viwa-mark-cabinet-header') {
    cabinetHeaderLogoAsset = asset;
  }
}

function resolveTasteAssetPaths(
  asset: ManifestAsset | undefined,
  fallbackWebp: string,
  fallbackPng: string,
  fallbackAltRu: string,
): TasteImagePaths {
  if (asset?.files.webp?.path && asset.files.png?.path) {
    return {
      webp: `${VIWA_ASSETS_BASE}/${asset.files.webp.path}`,
      png: `${VIWA_ASSETS_BASE}/${asset.files.png.path}`,
      altRu: asset.altRu,
    };
  }

  return {
    webp: fallbackWebp,
    png: fallbackPng,
    altRu: fallbackAltRu,
  };
}

/** Landing grid and editorial bottle imagery (800×1000). */
export function getTasteImagePaths(mediaKey: string, nameRu: string): TasteImagePaths {
  return resolveTasteAssetPaths(
    tasteBottleAssetsByKey.get(mediaKey),
    `${VIWA_ASSETS_BASE}/tastes/${mediaKey}.webp`,
    `${VIWA_ASSETS_BASE}/tastes/${mediaKey}.png`,
    nameRu,
  );
}

/** Cabinet favorite-circle medallions (180×180, circular CSS crop). */
export function getTasteMedallionImagePaths(mediaKey: string, nameRu: string): TasteImagePaths {
  return resolveTasteAssetPaths(
    tasteMedallionAssetsByKey.get(mediaKey),
    `${VIWA_ASSETS_BASE}/tastes/medallions/${mediaKey}.webp`,
    `${VIWA_ASSETS_BASE}/tastes/medallions/${mediaKey}.png`,
    nameRu,
  );
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

/** Cabinet header mark — canonical inner-crop raster (67×38), SVG fallback unchanged. */
export function getCabinetHeaderLogoImagePaths(): LogoImagePaths {
  const canonical = getLogoImagePaths();

  if (cabinetHeaderLogoAsset?.files.webp?.path && cabinetHeaderLogoAsset.files.png?.path) {
    return {
      svg: canonical.svg,
      webp: `${VIWA_ASSETS_BASE}/${cabinetHeaderLogoAsset.files.webp.path}`,
      png: `${VIWA_ASSETS_BASE}/${cabinetHeaderLogoAsset.files.png.path}`,
      altRu: cabinetHeaderLogoAsset.altRu,
      width: cabinetHeaderLogoAsset.files.png.width ?? 67,
      height: cabinetHeaderLogoAsset.files.png.height ?? 38,
    };
  }

  return {
    svg: canonical.svg,
    webp: `${VIWA_ASSETS_BASE}/logo/logo-viwa-mark-cabinet-header.webp`,
    png: `${VIWA_ASSETS_BASE}/logo/logo-viwa-mark-cabinet-header.png`,
    altRu: canonical.altRu,
    width: 67,
    height: 38,
  };
}

export function getViwaAssetManifestVersion(): string {
  return manifest.version;
}
