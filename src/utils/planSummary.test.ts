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
      tierName: '12 литров',
      priceKopecks: 49900,
      levelId: 'tier-12',
      isRecommended: true,
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
      tierName: '18 литров',
      priceKopecks: 69900,
      levelId: 'tier-18',
      isRecommended: false,
    });
  });
});
