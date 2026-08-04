import {
  findCurrentSubscriptionLevel,
  isSubscriptionLevelDisabled,
  normalizeSelectedSubscriptionLevelId,
  resolveDisabledTierMessage,
  resolveSelectableSubscriptionLevels,
  resolveSubscriptionTierAvailability,
  resolveVisibleSubscriptionLevels,
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

const startProLevels: SubscriptionLevelDTO[] = [
  {
    id: 'tier-start',
    name: 'Start',
    monthlyVolumeMl: 12000,
    priceKopecks: 49900,
    sortOrder: 1,
  },
  {
    id: 'tier-pro',
    name: 'Pro',
    monthlyVolumeMl: 18000,
    priceKopecks: 69900,
    sortOrder: 2,
  },
];

const now = Date.parse('2026-07-01T12:00:00.000Z');

function disabledIds(
  profile: Parameters<typeof resolveSubscriptionTierAvailability>[0],
  catalog: SubscriptionLevelDTO[] = levels,
) {
  const { catalog: visible, selectable } = resolveSubscriptionTierAvailability(
    profile,
    catalog,
    now,
  );
  return visible
    .filter((level) => isSubscriptionLevelDisabled(level.id, visible, selectable))
    .map((level) => level.id);
}

describe('resolveVisibleSubscriptionLevels', () => {
  it('returns full sorted catalog regardless of profile', () => {
    expect(resolveVisibleSubscriptionLevels(levels).map((level) => level.id)).toEqual([
      'tier-12',
      'tier-18',
    ]);
  });
});

describe('resolveSelectableSubscriptionLevels', () => {
  it('active top tier keeps only current level selectable', () => {
    const profile = {
      tierName: '18 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-18']);
  });

  it('active lower tier keeps current and stronger levels selectable', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('trial profile keeps all levels selectable', () => {
    const profile = {
      tierName: null,
      subscriptionEndsAt: null,
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
  });

  it('expired profile keeps all levels selectable', () => {
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

  it('legacy 25L active leaves no selectable marketing tiers', () => {
    const profile = {
      tierName: 'Legacy VIP 25L',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 25000,
      dailyLimitMl: 25000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable).toEqual([]);
  });

  it('legacy 15L floor keeps only catalog tiers at or above limit selectable', () => {
    const profile = {
      tierName: 'Legacy mid',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 15000,
      dailyLimitMl: 15000,
    };

    const selectable = resolveSelectableSubscriptionLevels(profile, levels, now);

    expect(selectable.map((level) => level.id)).toEqual(['tier-18']);
  });

  it('admin-disabled profile keeps all levels selectable', () => {
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

describe('resolveSubscriptionTierAvailability disabled tiers', () => {
  it('active Pro shows Start disabled and Pro enabled', () => {
    const profile = {
      tierName: 'Pro',
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
    };

    const { catalog, selectable } = resolveSubscriptionTierAvailability(
      profile,
      startProLevels,
      now,
    );

    expect(catalog.map((level) => level.id)).toEqual(['tier-start', 'tier-pro']);
    expect(selectable.map((level) => level.id)).toEqual(['tier-pro']);
    expect(disabledIds(profile, startProLevels)).toEqual(['tier-start']);
  });

  it('active Start keeps both tiers enabled', () => {
    const profile = {
      tierName: 'Start',
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(disabledIds(profile, startProLevels)).toEqual([]);
  });

  it('trial keeps both tiers enabled', () => {
    const profile = {
      tierName: null,
      subscriptionEndsAt: null,
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    expect(disabledIds(profile, startProLevels)).toEqual([]);
  });

  it('expired keeps both tiers enabled', () => {
    const profile = {
      tierName: 'Start',
      subscriptionEndsAt: '2025-01-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(disabledIds(profile, startProLevels)).toEqual([]);
  });

  it('legacy 25L keeps full catalog visible but all tiers disabled', () => {
    const profile = {
      tierName: 'Legacy VIP 25L',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 25000,
      dailyLimitMl: 25000,
    };

    const { catalog, selectable } = resolveSubscriptionTierAvailability(profile, levels, now);

    expect(catalog.map((level) => level.id)).toEqual(['tier-12', 'tier-18']);
    expect(selectable).toEqual([]);
    expect(disabledIds(profile)).toEqual(['tier-12', 'tier-18']);
  });
});

describe('resolveDisabledTierMessage', () => {
  /** Local noon avoids UTC midnight day-shift in formatDateDDMMYYYY. */
  const stableEndDate = '2099-06-15T12:00:00';

  it('formats active subscription end date in RU', () => {
    expect(resolveDisabledTierMessage(stableEndDate, 'ru')).toBe('Недоступен до 15.06.2099');
  });

  it('formats active subscription end date in EN', () => {
    expect(resolveDisabledTierMessage(stableEndDate, 'en')).toBe('Unavailable until 15.06.2099');
  });

  it('falls back to generic copy when date is missing', () => {
    expect(resolveDisabledTierMessage(null, 'ru')).toBe('Недоступен при текущем тарифе');
    expect(resolveDisabledTierMessage(null, 'en')).toBe('Unavailable on your current plan');
  });

  it('falls back to generic copy when date is invalid', () => {
    expect(resolveDisabledTierMessage('not-a-date', 'ru')).toBe('Недоступен при текущем тарифе');
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

  it('does not keep disabled tier when only weaker tier was selected', () => {
    const profile = {
      tierName: 'Pro',
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
    };
    const { selectable } = resolveSubscriptionTierAvailability(profile, startProLevels, now);

    expect(normalizeSelectedSubscriptionLevelId('tier-start', selectable, 'tier-pro')).toBe(
      'tier-pro',
    );
  });
});
