import {
  findCurrentSubscriptionLevel,
  normalizeSelectedSubscriptionLevelId,
  resolveSelectableSubscriptionLevels,
  sortLevelsByOrder,
} from './subscriptionLevels';
import type { SubscriptionLevelDTO } from '../types/subscriptionLevel';

const levels: SubscriptionLevelDTO[] = [
  {
    id: 'tier-12',
    name: '12 литров',
    monthlyVolumeMl: 12000,
    priceKopecks: 49900,
    sortOrder: 1,
  },
  {
    id: 'tier-18',
    name: '18 литров',
    monthlyVolumeMl: 18000,
    priceKopecks: 69900,
    sortOrder: 2,
  },
];

const now = Date.parse('2026-07-01T12:00:00.000Z');

describe('resolveSelectableSubscriptionLevels', () => {
  it('active top tier shows only current level for renewal', () => {
    const profile = {
      tierName: '18 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-18']);
  });

  it('active lower tier shows current and stronger levels', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('trial profile shows all levels', () => {
    const profile = {
      tierName: null,
      subscriptionEndsAt: null,
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('expired profile shows all levels', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2025-01-01T00:00:00.000Z',
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('legacy fallback matches by monthlyLimitMl when tierName is unknown', () => {
    const profile = {
      tierName: 'Legacy VIP',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(findCurrentSubscriptionLevel(profile, levels)?.id).toBe('tier-12');

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('legacy 25L active hides weaker marketing tiers', () => {
    const profile = {
      tierName: 'Legacy VIP 25L',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 25000,
      dailyLimitMl: 25000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable).toEqual([]);
  });

  it('legacy 15L floor shows only catalog tiers at or above limit', () => {
    const profile = {
      tierName: 'Legacy mid',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 15000,
      dailyLimitMl: 15000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-18']);
  });

  it('admin-disabled profile shows all levels', () => {
    const profile = {
      tierName: '18 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
      active: false,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });
});

describe('sortLevelsByOrder', () => {
  it('sorts by volume when sortOrder is null on either tier', () => {
    const legacyLevels: SubscriptionLevelDTO[] = [
      {
        id: 'tier-null-high',
        name: '18 legacy',
        monthlyVolumeMl: 18000,
        priceKopecks: 69900,
        sortOrder: null,
      },
      {
        id: 'tier-null-low',
        name: '12 legacy',
        monthlyVolumeMl: 12000,
        priceKopecks: 49900,
        sortOrder: null,
      },
    ];

    expect(sortLevelsByOrder(legacyLevels).map((level) => level.id)).toEqual([
      'tier-null-low',
      'tier-null-high',
    ]);
  });

  it('picks the stronger tier on duplicate volume matches', () => {
    const duplicateVolumeLevels: SubscriptionLevelDTO[] = [
      {
        id: 'tier-a',
        name: 'Plan A',
        monthlyVolumeMl: 12000,
        priceKopecks: 49900,
        sortOrder: 1,
      },
      {
        id: 'tier-b',
        name: 'Plan B',
        monthlyVolumeMl: 12000,
        priceKopecks: 59900,
        sortOrder: 2,
      },
    ];

    const profile = {
      tierName: 'Unknown',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(findCurrentSubscriptionLevel(profile, duplicateVolumeLevels)?.id).toBe('tier-b');
  });
});

describe('normalizeSelectedSubscriptionLevelId', () => {
  it('keeps valid selection', () => {
    expect(normalizeSelectedSubscriptionLevelId('tier-18', levels)).toBe('tier-18');
  });

  it('falls back to preferred id when current selection is unavailable', () => {
    expect(normalizeSelectedSubscriptionLevelId('tier-12', [levels[1]!], 'tier-18')).toBe(
      'tier-18',
    );
  });

  it('falls back to first available level', () => {
    expect(normalizeSelectedSubscriptionLevelId('missing', [levels[1]!])).toBe('tier-18');
  });
});
