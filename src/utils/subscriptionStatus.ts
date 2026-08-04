export type SubscriptionStatusInput = {
  tierName?: string | null;
  subscriptionEndsAt?: string | null;
  monthlyLimitMl?: number;
  dailyLimitMl?: number;
  active?: boolean;
};

export function isSubscriptionEndDateActive(
  subscriptionEndsAt: string | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!subscriptionEndsAt) {
    return false;
  }
  const endMs = new Date(subscriptionEndsAt).getTime();
  return Number.isFinite(endMs) && endMs > nowMs;
}

/**
 * Active marketing monthly subscription: future end date and positive monthly pool.
 * Expired profiles must surface renewal/plan cards (architecture v1.2 §3).
 * When backend sets `active: false` (admin-disabled), profile is never active.
 */
export function isActiveSubscriptionProfile(
  profile: SubscriptionStatusInput | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (profile?.active === false) {
    return false;
  }

  if (!profile?.tierName || !profile.subscriptionEndsAt) {
    return false;
  }

  if (!isSubscriptionEndDateActive(profile.subscriptionEndsAt, nowMs)) {
    return false;
  }

  const limitMl = profile.monthlyLimitMl ?? profile.dailyLimitMl ?? 0;
  return limitMl > 0;
}

export function isExpiredSubscriptionProfile(
  profile: SubscriptionStatusInput | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  if (!profile?.tierName || !profile.subscriptionEndsAt) {
    return false;
  }
  return !isSubscriptionEndDateActive(profile.subscriptionEndsAt, nowMs);
}

export function shouldShowRenewalPlans(
  profile: SubscriptionStatusInput | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  return !isActiveSubscriptionProfile(profile, nowMs);
}
