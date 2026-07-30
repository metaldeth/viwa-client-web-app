import { resolvePlanSummaryDisplay } from './planSummary';
import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';
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

describe('planSummary', () => {
  it('shows recommended lowest sortOrder tier for trial/no plan', () => {
    const trialProfile = {
      tierName: null,
      subscriptionEndsAt: null,
      monthlyLimitMl: 0,
      dailyLimitMl: 0,
    } satisfies Pick<
      ClientProfileDTO,
      'tierName' | 'subscriptionEndsAt' | 'monthlyLimitMl' | 'dailyLimitMl'
    >;

    const summary = resolvePlanSummaryDisplay(trialProfile, levels);

    expect(summary).toMatchObject({
      variant: 'offer',
      tierName: '12 литров',
      priceKopecks: 49900,
      monthlyVolumeMl: 12000,
      levelId: 'tier-12',
      isRecommended: true,
      subscriptionEndsAt: null,
    });
  });

  it('shows active tier name and API price when subscribed', () => {
    const activeProfile = {
      tierName: '18 литров',
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
      monthlyLimitMl: 18000,
      dailyLimitMl: 18000,
    } satisfies Pick<
      ClientProfileDTO,
      'tierName' | 'subscriptionEndsAt' | 'monthlyLimitMl' | 'dailyLimitMl'
    >;

    const summary = resolvePlanSummaryDisplay(activeProfile, levels);

    expect(summary).toMatchObject({
      variant: 'current',
      tierName: '18 литров',
      priceKopecks: 69900,
      monthlyVolumeMl: 18000,
      levelId: 'tier-18',
      isRecommended: false,
      subscriptionEndsAt: '2099-01-01T00:00:00.000Z',
    });
  });

  it('does not borrow recommended price/volume when active tier is missing from levels', () => {
    const activeProfile = {
      tierName: 'Legacy VIP',
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
      monthlyLimitMl: 25000,
      dailyLimitMl: 25000,
    } satisfies Pick<
      ClientProfileDTO,
      'tierName' | 'subscriptionEndsAt' | 'monthlyLimitMl' | 'dailyLimitMl'
    >;

    const summary = resolvePlanSummaryDisplay(activeProfile, levels);

    expect(summary).toMatchObject({
      variant: 'current',
      tierName: 'Legacy VIP',
      priceKopecks: null,
      monthlyVolumeMl: null,
      levelId: null,
      isRecommended: false,
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
    });
  });

  it('keeps active plan identity when the levels catalog is empty', () => {
    const activeProfile = {
      tierName: 'Legacy VIP',
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
      monthlyLimitMl: 25000,
      dailyLimitMl: 25000,
    } satisfies Pick<
      ClientProfileDTO,
      'tierName' | 'subscriptionEndsAt' | 'monthlyLimitMl' | 'dailyLimitMl'
    >;

    expect(resolvePlanSummaryDisplay(activeProfile, [])).toMatchObject({
      variant: 'current',
      tierName: 'Legacy VIP',
      priceKopecks: null,
      monthlyVolumeMl: null,
      levelId: null,
      subscriptionEndsAt: '2099-06-15T00:00:00.000Z',
    });
  });
});
