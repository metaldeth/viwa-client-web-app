import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';
import type { SubscriptionLocaleKey } from '../locale/subscriptionLocale';
import { isTrialProfile } from './monthlyProgress';
import { isActiveSubscriptionProfile, isExpiredSubscriptionProfile } from './subscriptionStatus';

export type UnlimitedWaterBenefitVariant = 'active' | 'trial' | 'expired' | 'inactive';

const BENEFIT_KEYS: Record<UnlimitedWaterBenefitVariant, SubscriptionLocaleKey> = {
  active: 'unlimitedWaterBenefitActive',
  trial: 'unlimitedWaterBenefitTrial',
  expired: 'unlimitedWaterBenefitExpired',
  inactive: 'unlimitedWaterBenefitTrial',
};

/** Resolves cabinet copy variant for unlimited-water messaging from profile state. */
export function resolveUnlimitedWaterBenefitVariant(
  profile: ClientProfileDTO | null | undefined,
  nowMs: number = Date.now(),
): UnlimitedWaterBenefitVariant {
  if (isActiveSubscriptionProfile(profile, nowMs)) {
    return 'active';
  }

  if (isTrialProfile(profile)) {
    return 'trial';
  }

  if (isExpiredSubscriptionProfile(profile, nowMs)) {
    return 'expired';
  }

  return 'inactive';
}

export function unlimitedWaterBenefitLocaleKey(
  variant: UnlimitedWaterBenefitVariant,
): SubscriptionLocaleKey {
  return BENEFIT_KEYS[variant];
}
