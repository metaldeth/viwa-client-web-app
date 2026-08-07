import {
  resolvePublicTierDescription,
  sortPublicSubscriptionLevels,
} from './publicSubscriptionLevels';
import type { PublicSubscriptionLevelDTO } from '../types/publicCatalog';

const levels: PublicSubscriptionLevelDTO[] = [
  {
    id: 'tier-18',
    name: '18 литров',
    monthlyVolumeMl: 18000,
    priceKopecks: 69900,
    sortOrder: 2,
  },
  {
    id: 'tier-12',
    name: '12 литров',
    monthlyVolumeMl: 12000,
    priceKopecks: 49900,
    sortOrder: 1,
  },
];

describe('sortPublicSubscriptionLevels', () => {
  it('sorts by sortOrder then monthly volume', () => {
    expect(sortPublicSubscriptionLevels(levels).map((level) => level.id)).toEqual([
      'tier-12',
      'tier-18',
    ]);
  });
});

describe('resolvePublicTierDescription', () => {
  it('returns trimmed API description when present', () => {
    expect(
      resolvePublicTierDescription({ description: '  Вкусовые напитки + вода  ' }, 'fallback'),
    ).toBe('Вкусовые напитки + вода');
  });

  it('uses fallback when description is missing, null, or blank', () => {
    expect(resolvePublicTierDescription({}, 'fallback')).toBe('fallback');
    expect(resolvePublicTierDescription({ description: null }, 'fallback')).toBe('fallback');
    expect(resolvePublicTierDescription({ description: '   ' }, 'fallback')).toBe('fallback');
  });
});
