import type { ClientProfileDTO } from '../../types/serverInterface/clientDTO';

/** Fields that WS/PATCH may update while GET /client/me is in flight. */
export const VOLATILE_CLIENT_PROFILE_FIELDS = [
  'favoriteTasteKeys',
  'monthlyUsedMl',
  'monthlyRemainingMl',
  'monthlyLimitMl',
  'volumeMl',
  'dailyUsedMl',
  'dailyRemainingMl',
  'dailyLimitMl',
  'limitExhausted',
  'active',
  'tierName',
  'subscriptionEndsAt',
  'qrPayload',
  'limitResetsAt',
  'poolExpiresAt',
] as const satisfies ReadonlyArray<keyof ClientProfileDTO>;

export type MergeClientProfileOptions = {
  /** Keep volatile fields from `current` when a realtime patch landed during GET. */
  preserveVolatileFromCurrent?: boolean;
};

export function mergeClientProfileFromServer(
  current: ClientProfileDTO | null,
  incoming: ClientProfileDTO,
  options?: MergeClientProfileOptions,
): ClientProfileDTO {
  if (!current || current.id !== incoming.id) {
    return incoming;
  }

  const merged: ClientProfileDTO = {
    ...current,
    ...incoming,
    qrPayload: incoming.qrPayload ?? current.qrPayload,
  };

  if (options?.preserveVolatileFromCurrent) {
    for (const field of VOLATILE_CLIENT_PROFILE_FIELDS) {
      const value = current[field];
      if (value !== undefined) {
        (merged[field] as typeof value) = value;
      }
    }
  }

  return merged;
}
