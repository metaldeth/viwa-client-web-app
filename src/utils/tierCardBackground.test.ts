import { resolveTierCardBackground } from './tierCardBackground';

describe('resolveTierCardBackground', () => {
  it('maps sorted indices to stable card backgrounds', () => {
    expect(resolveTierCardBackground(0)).toBe('/assets/viwa/plans/viwa-tier-card-01.webp');
    expect(resolveTierCardBackground(1)).toBe('/assets/viwa/plans/viwa-tier-card-02.webp');
    expect(resolveTierCardBackground(2)).toBe('/assets/viwa/plans/viwa-tier-card-01.webp');
    expect(resolveTierCardBackground(3)).toBe('/assets/viwa/plans/viwa-tier-card-02.webp');
  });

  it('falls back to the first background for negative indices', () => {
    expect(resolveTierCardBackground(-1)).toBe('/assets/viwa/plans/viwa-tier-card-01.webp');
  });
});
