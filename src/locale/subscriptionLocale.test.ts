import { setSubscriptionLocale, tSubscription } from './subscriptionLocale';

describe('subscriptionLocale', () => {
  it('R2-3: reads EN catalog when locale switched', () => {
    setSubscriptionLocale('en');
    expect(tSubscription('planTitle')).toBe('VIWA plans');
    expect(tSubscription('progressExpired', { date: '01.01.2026' })).toContain('expired');

    setSubscriptionLocale('ru');
    expect(tSubscription('planTitle')).toBe('Тарифы VIWA');
  });
});
