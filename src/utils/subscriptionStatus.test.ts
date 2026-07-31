import {
  isActiveSubscriptionProfile,
  isExpiredSubscriptionProfile,
  shouldShowRenewalPlans,
} from './subscriptionStatus';

describe('subscriptionStatus', () => {
  const now = new Date('2026-07-29T12:00:00.000Z').getTime();

  it('R2-1: expired subscriptionEndsAt reveals renewal plans', () => {
    const expiredProfile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-01-01T00:00:00.000Z',
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    expect(isActiveSubscriptionProfile(expiredProfile, now)).toBe(false);
    expect(isExpiredSubscriptionProfile(expiredProfile, now)).toBe(true);
    expect(shouldShowRenewalPlans(expiredProfile, now)).toBe(true);
  });

  it('active subscription with future end date and positive limit hides renewal', () => {
    const activeProfile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(isActiveSubscriptionProfile(activeProfile, now)).toBe(true);
    expect(shouldShowRenewalPlans(activeProfile, now)).toBe(false);
  });

  it('future end date with zero monthly limit is not active', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    };

    expect(isActiveSubscriptionProfile(profile, now)).toBe(false);
    expect(shouldShowRenewalPlans(profile, now)).toBe(true);
  });

  it('admin-disabled profile (active: false) is not active despite valid tier and dates', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
      active: false,
    };

    expect(isActiveSubscriptionProfile(profile, now)).toBe(false);
    expect(shouldShowRenewalPlans(profile, now)).toBe(true);
  });

  it('active: true with valid tier, dates, and limit is active', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
      active: true,
    };

    expect(isActiveSubscriptionProfile(profile, now)).toBe(true);
    expect(shouldShowRenewalPlans(profile, now)).toBe(false);
  });

  it('absent active preserves tier/date/limit derivation', () => {
    const profile = {
      tierName: '12 литров',
      subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
      monthlyLimitMl: 12000,
      dailyLimitMl: 12000,
    };

    expect(isActiveSubscriptionProfile(profile, now)).toBe(true);
  });
});
