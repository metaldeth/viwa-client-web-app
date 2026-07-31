import { resolveUnlimitedWaterBenefitVariant } from './unlimitedWaterBenefit';

describe('resolveUnlimitedWaterBenefitVariant', () => {
  const now = Date.parse('2026-07-01T12:00:00.000Z');

  it('returns active for subscribed profile with future end date', () => {
    expect(
      resolveUnlimitedWaterBenefitVariant(
        {
          tierName: '12 литров',
          subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
          monthlyLimitMl: 12000,
          dailyLimitMl: 12000,
        },
        now,
      ),
    ).toBe('active');
  });

  it('returns trial for profile without tier', () => {
    expect(
      resolveUnlimitedWaterBenefitVariant(
        {
          tierName: null,
          subscriptionEndsAt: null,
          monthlyLimitMl: 0,
          dailyLimitMl: 0,
        },
        now,
      ),
    ).toBe('trial');
  });

  it('returns expired for past subscription end date', () => {
    expect(
      resolveUnlimitedWaterBenefitVariant(
        {
          tierName: '12 литров',
          subscriptionEndsAt: '2025-01-01T00:00:00.000Z',
          monthlyLimitMl: 0,
          dailyLimitMl: 0,
        },
        now,
      ),
    ).toBe('expired');
  });

  it('returns inactive when admin-disabled despite valid dates', () => {
    expect(
      resolveUnlimitedWaterBenefitVariant(
        {
          tierName: '12 литров',
          subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
          monthlyLimitMl: 12000,
          dailyLimitMl: 12000,
          active: false,
        },
        now,
      ),
    ).toBe('inactive');
  });
});
