import manifest from '../data/viwaAssetManifest.json';
import { CABINET_PIXEL_FAVORITE_KEYS } from './cabinetPixelFixture';

describe('cabinetPixelFixture', () => {
  it('uses only canonical catalog keys present in asset manifest', () => {
    const bottleKeys = new Set(
      manifest.assets
        .filter((asset) => asset.category === 'taste' && asset.tasteMediaKey)
        .map((asset) => asset.tasteMediaKey as string),
    );
    const medallionKeys = new Set(
      manifest.assets
        .filter((asset) => asset.category === 'taste-medallion' && asset.tasteMediaKey)
        .map((asset) => asset.tasteMediaKey as string),
    );

    expect(CABINET_PIXEL_FAVORITE_KEYS).toEqual(['raspberry', 'lime', 'peach-mango']);
    CABINET_PIXEL_FAVORITE_KEYS.forEach((key) => {
      expect(bottleKeys.has(key)).toBe(true);
      expect(medallionKeys.has(key)).toBe(true);
    });
    expect(bottleKeys.has('apricot')).toBe(false);
    expect(medallionKeys.has('apricot')).toBe(false);
  });
});
