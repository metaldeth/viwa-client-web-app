/**
 * Canonical favorite taste keys for cabinet pixel/smoke fixtures.
 * Must exist in public catalog and `viwaAssetManifest.json` — do not use non-catalog keys (e.g. `apricot`).
 */
export const CABINET_PIXEL_FAVORITE_KEYS = ['raspberry', 'lime', 'peach-mango'] as const;

export type CabinetPixelFavoriteKey = (typeof CABINET_PIXEL_FAVORITE_KEYS)[number];
