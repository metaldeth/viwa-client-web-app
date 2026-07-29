import { mergeClientProfileFromServer } from './mergeClientProfile';
import type { ClientProfileDTO } from '../../types/serverInterface/clientDTO';

const baseProfile: ClientProfileDTO = {
  id: 'client-1',
  phone: '+79001234567',
  volumeMl: 500,
  monthlyLimitMl: 12000,
  monthlyUsedMl: 1000,
  monthlyRemainingMl: 11000,
  favoriteTasteKeys: ['cherry'],
  dailyLimitMl: 12000,
  dailyUsedMl: 1000,
  dailyRemainingMl: 11000,
  tierName: '12 литров',
  subscriptionEndsAt: '2026-12-01T00:00:00.000Z',
  qrPayload: 'CLIENT_client-1',
};

describe('mergeClientProfileFromServer', () => {
  it('R2-2: preserves volatile fields from current profile when GET is stale', () => {
    const staleGet: ClientProfileDTO = {
      ...baseProfile,
      favoriteTasteKeys: [],
      monthlyUsedMl: 500,
      monthlyRemainingMl: 11500,
    };

    const merged = mergeClientProfileFromServer(baseProfile, staleGet, {
      preserveVolatileFromCurrent: true,
    });

    expect(merged.favoriteTasteKeys).toEqual(['cherry']);
    expect(merged.monthlyUsedMl).toBe(1000);
    expect(merged.monthlyRemainingMl).toBe(11000);
    expect(merged.phone).toBe(staleGet.phone);
  });

  it('replaces profile when no current state exists', () => {
    const merged = mergeClientProfileFromServer(null, baseProfile);
    expect(merged).toEqual(baseProfile);
  });
});
