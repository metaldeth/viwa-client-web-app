import { resolveMonthlyProgress, isTrialProfile } from './monthlyProgress';
import { DEFAULT_LOYALTY_TRIAL_VOLUME_ML } from '../constants/loyalty';
import { formatPriceRub } from '../locale/subscriptionLocale';
import type { SubscriptionLevelDTO } from '../types/subscriptionLevel';

describe('monthlyProgress', () => {
  it('CW06-4: trial state when no active subscription', () => {
    const progress = resolveMonthlyProgress({
      volumeMl: 750,
      tierName: null,
      subscriptionEndsAt: null,
      dailyLimitMl: 0,
      dailyUsedMl: 0,
      dailyRemainingMl: 750,
    });

    expect(isTrialProfile({ tierName: null, subscriptionEndsAt: null })).toBe(true);
    expect(progress.isTrial).toBe(true);
    expect(progress.limitMl).toBe(DEFAULT_LOYALTY_TRIAL_VOLUME_ML);
    expect(progress.remainingMl).toBe(750);
    expect(progress.usedMl).toBe(250);
  });

  it('uses monthlyUsedMl / monthlyLimitMl for subscribed clients', () => {
    const progress = resolveMonthlyProgress({
      volumeMl: 0,
      monthlyLimitMl: 12000,
      monthlyUsedMl: 3500,
      monthlyRemainingMl: 8500,
      tierName: '12 литров',
      subscriptionEndsAt: '2026-08-27T00:00:00.000Z',
      dailyLimitMl: 12000,
      dailyUsedMl: 3500,
      dailyRemainingMl: 8500,
    });

    expect(progress.isTrial).toBe(false);
    expect(progress.usedMl).toBe(3500);
    expect(progress.limitMl).toBe(12000);
    expect(progress.percent).toBe(29);
  });
});

describe('subscription tier pricing', () => {
  it('CW06-3: tier cards display API priceKopecks', () => {
    const tiers: SubscriptionLevelDTO[] = [
      {
        id: 'a',
        name: '12 литров',
        monthlyVolumeMl: 12000,
        priceKopecks: 49900,
        sortOrder: 1,
      },
      {
        id: 'b',
        name: '18 литров',
        monthlyVolumeMl: 18000,
        priceKopecks: 69900,
        sortOrder: 2,
      },
    ];

    expect(formatPriceRub(tiers[0].priceKopecks)).toBe(499);
    expect(formatPriceRub(tiers[1].priceKopecks)).toBe(699);
    expect(tiers.every((t) => [12000, 18000].includes(t.monthlyVolumeMl))).toBe(true);
  });
});
