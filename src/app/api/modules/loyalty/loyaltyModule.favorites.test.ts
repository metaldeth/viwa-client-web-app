import LoyaltyModule from './loyaltyModule';

describe('loyaltyModule favorites API', () => {
  it('does not expose client-side updateFavoriteTastes PUT', () => {
    const module = new LoyaltyModule({ request: {} as never });
    expect('updateFavoriteTastes' in module).toBe(false);
  });
});
