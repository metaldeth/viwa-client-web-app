import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LOGO_VIEWBOX_H,
  LOGO_VIEWBOX_W,
  analyzeIconForegroundBbox,
  buildSquareIconSvg,
  computeSquareIconLogoTransform,
  patchLogoMarkManifestDimensions,
  readCanonicalLogoInner,
  validateIconGeometry,
} from './lib/cabinet-logo-assets.mjs';
import { verifyCabinetSiteAssets } from './verify-cabinet-site-assets.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoSvgPath = join(root, 'public', 'assets', 'viwa', 'logo', 'logo-viwa-mark.svg');

describe('cabinet logo asset helpers', () => {
  it('preserves inner scaleY transform when reading canonical logo inner', () => {
    const inner = readCanonicalLogoInner(logoSvgPath);
    assert.match(inner, /scale\(1 0\.617284\)/);
    assert.match(inner, /<path[\s\S]*fill="#ffffff"/);
  });

  it('buildSquareIconSvg embeds canonical inner without stripping transforms', () => {
    const inner = readCanonicalLogoInner(logoSvgPath);
    const svg = buildSquareIconSvg(192, inner);
    assert.match(svg, /scale\(1 0\.617284\)/);
    assert.doesNotMatch(svg, /scale\(1 0\.617284\)[\s\S]*scale\([^)]+\)[\s\S]*scale\(1 0\.617284\)/);
  });

  it('computeSquareIconLogoTransform centers 277x150 wordmark in square canvas', () => {
    const t192 = computeSquareIconLogoTransform(192);
    assert.ok(Math.abs(t192.tx - (192 - t192.renderedW) / 2) < 0.01);
    assert.ok(Math.abs(t192.ty - (192 - t192.renderedH) / 2) < 0.01);
    assert.equal(t192.renderedW / t192.renderedH, LOGO_VIEWBOX_W / LOGO_VIEWBOX_H);
  });

  it('validateIconGeometry passes centered symmetric bbox', () => {
    const analysis = analyzeIconForegroundBbox({
      width: 100,
      height: 100,
      minX: 20,
      minY: 35,
      maxX: 79,
      maxY: 64,
    });
    assert.deepEqual(validateIconGeometry(analysis, 'sample'), []);
  });

  it('validateIconGeometry flags vertical offset beyond tolerance', () => {
    const analysis = analyzeIconForegroundBbox({
      width: 100,
      height: 100,
      minX: 20,
      minY: 10,
      maxX: 79,
      maxY: 39,
    });
    assert.ok(validateIconGeometry(analysis, 'sample').some((msg) => msg.includes('vertical center offset')));
  });

  it('patchLogoMarkManifestDimensions updates only logo-viwa-mark sizes', () => {
    const manifest = JSON.parse(
      readFileSync(join(root, 'src', 'data', 'viwaAssetManifest.json'), 'utf8'),
    );
    const heroBefore = manifest.assets.find((a) => a.id === 'logo-viwa-mark-hero')?.files.png;
    patchLogoMarkManifestDimensions(manifest, 277, 150);
    const mark = manifest.assets.find((a) => a.id === 'logo-viwa-mark');
    assert.equal(mark.files.svg.width, 277);
    assert.equal(mark.files.svg.height, 150);
    assert.equal(mark.files.png.height, 150);
    const heroAfter = manifest.assets.find((a) => a.id === 'logo-viwa-mark-hero')?.files.png;
    assert.deepEqual(heroBefore, heroAfter);
  });
});

describe('cabinet site asset verification (integration)', () => {
  it('passes geometry checks for generated icons and logo rasters', () => {
    const issues = verifyCabinetSiteAssets({ rootDir: root });
    assert.deepEqual(issues, [], issues.join('\n'));
  });
});
