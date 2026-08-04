import { resolveTierCardBackground, resolveTierCardBackgroundForLevel } from './tierCardBackground';

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

describe('resolveTierCardBackgroundForLevel', () => {
  it('keeps background stable by level id in full catalog', () => {
    const catalog = [{ id: 'tier-12' }, { id: 'tier-18' }];

    expect(resolveTierCardBackgroundForLevel('tier-18', catalog)).toBe(
      '/assets/viwa/plans/viwa-tier-card-02.webp',
    );
    expect(resolveTierCardBackgroundForLevel('tier-18', [{ id: 'tier-18' }])).toBe(
      '/assets/viwa/plans/viwa-tier-card-01.webp',
    );
  });
});
