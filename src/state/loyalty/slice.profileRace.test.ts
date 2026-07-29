vi.mock('../../app/api', () => ({
  api: {
    loyalty: {
      fetchCurrentClientProfile: vi.fn(),
    },
  },
}));

import { loyaltyReducer, patchClientProfile } from './slice';
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

describe('loyaltySlice profile merge race', () => {
  it('R2-2: stale GET fulfilled after WS patch keeps favoriteTasteKeys from patch', () => {
    let state = loyaltyReducer(undefined, { type: '@@INIT' });

    state = loyaltyReducer(state, {
      type: 'getCurrentClientProfile/fulfilled',
      payload: baseProfile,
    });

    state = loyaltyReducer(state, { type: 'getCurrentClientProfile/pending' });

    state = loyaltyReducer(
      state,
      patchClientProfile({
        id: baseProfile.id,
        favoriteTasteKeys: ['cherry', 'lime', 'orange'],
        monthlyUsedMl: 4200,
      }),
    );

    const staleGet: ClientProfileDTO = {
      ...baseProfile,
      favoriteTasteKeys: ['cherry'],
      monthlyUsedMl: 1000,
    };

    state = loyaltyReducer(state, {
      type: 'getCurrentClientProfile/fulfilled',
      payload: staleGet,
    });

    expect(state.clientProfile.state?.favoriteTasteKeys).toEqual(['cherry', 'lime', 'orange']);
    expect(state.clientProfile.state?.monthlyUsedMl).toBe(4200);
    expect(state.clientProfile.state?.phone).toBe(staleGet.phone);
  });
});
