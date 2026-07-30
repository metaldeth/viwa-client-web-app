import manifest from '../data/viwaAssetManifest.json';
import {
  getCabinetHeaderLogoImagePaths,
  getTasteImagePaths,
  getTasteMedallionImagePaths,
} from './viwaAssets';

const CANONICAL_TASTE_KEYS = [
  'cherry',
  'blackberry-lime',
  'coconut',
  'cucumber',
  'grapefruit',
  'lemon',
  'lime',
  'lime-mint',
  'orange',
  'peach-mango',
  'pomegranate-blueberry',
  'raspberry',
  'strawberry-lemongrass',
  'watermelon',
];

describe('viwaAssets taste paths', () => {
  it('manifest includes exactly 14 bottle and 14 medallion taste assets', () => {
    const bottles = manifest.assets.filter((asset) => asset.category === 'taste');
    const medallions = manifest.assets.filter((asset) => asset.category === 'taste-medallion');

    expect(bottles).toHaveLength(14);
    expect(medallions).toHaveLength(14);
    expect(manifest.assets).toHaveLength(40);
  });

  it('resolves logo paths with corrected SVG aspect', () => {
    const paths = getCabinetHeaderLogoImagePaths();

    expect(paths.svg).toBe('/assets/viwa/logo/logo-viwa-mark.svg');
    expect(paths.png).toBe('/assets/viwa/logo/logo-viwa-mark.png');
    expect(paths.width).toBe(277);
    expect(paths.height).toBe(150);
  });

  it('resolves bottle paths for landing from manifest', () => {
    const paths = getTasteImagePaths('raspberry', 'Малина');

    expect(paths.webp).toBe('/assets/viwa/tastes/raspberry.webp');
    expect(paths.png).toBe('/assets/viwa/tastes/raspberry.png');
    expect(paths.altRu).toContain('Малина');
  });

  it('resolves medallion paths for cabinet favorite circles from manifest', () => {
    const paths = getTasteMedallionImagePaths('raspberry', 'Малина');

    expect(paths.webp).toBe('/assets/viwa/tastes/medallions/raspberry.webp');
    expect(paths.png).toBe('/assets/viwa/tastes/medallions/raspberry.png');
    expect(paths.altRu).toContain('Малина');
  });

  it('falls back to conventional paths for unknown keys', () => {
    const bottle = getTasteImagePaths('unknown-key', 'Тест');
    const medallion = getTasteMedallionImagePaths('unknown-key', 'Тест');

    expect(bottle.webp).toBe('/assets/viwa/tastes/unknown-key.webp');
    expect(medallion.webp).toBe('/assets/viwa/tastes/medallions/unknown-key.webp');
  });

  it('covers all canonical taste keys in both bottle and medallion manifests', () => {
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

    CANONICAL_TASTE_KEYS.forEach((key) => {
      expect(bottleKeys.has(key)).toBe(true);
      expect(medallionKeys.has(key)).toBe(true);
    });
  });
});
