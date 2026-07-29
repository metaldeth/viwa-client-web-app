import { DEFAULT_LOYALTY_TRIAL_VOLUME_ML } from '../constants/loyalty';
import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';

export type MonthlyProgress = {
  usedMl: number;
  limitMl: number;
  remainingMl: number;
  percent: number;
  isTrial: boolean;
};

export type MonthlyProgressInput = Pick<
  ClientProfileDTO,
  | 'volumeMl'
  | 'monthlyLimitMl'
  | 'monthlyUsedMl'
  | 'monthlyRemainingMl'
  | 'tierName'
  | 'subscriptionEndsAt'
  | 'dailyLimitMl'
  | 'dailyUsedMl'
  | 'dailyRemainingMl'
>;

export function isTrialProfile(profile: MonthlyProgressInput | null | undefined): boolean {
  if (!profile) {
    return true;
  }
  return !profile.tierName && profile.subscriptionEndsAt === null;
}

export function resolveMonthlyProgress(
  profile: MonthlyProgressInput | null | undefined,
): MonthlyProgress {
  if (!profile || isTrialProfile(profile)) {
    const limitMl = DEFAULT_LOYALTY_TRIAL_VOLUME_ML;
    const remainingMl = profile?.volumeMl ?? 0;
    const usedMl = Math.max(0, limitMl - remainingMl);
    const percent = limitMl > 0 ? Math.min(100, Math.round((usedMl / limitMl) * 100)) : 0;

    return { usedMl, limitMl, remainingMl, percent, isTrial: true };
  }

  const limitMl = profile.monthlyLimitMl ?? profile.dailyLimitMl ?? 0;
  const usedMl = profile.monthlyUsedMl ?? profile.dailyUsedMl ?? 0;
  const remainingMl =
    profile.monthlyRemainingMl ?? profile.dailyRemainingMl ?? Math.max(0, limitMl - usedMl);
  const percent = limitMl > 0 ? Math.min(100, Math.round((usedMl / limitMl) * 100)) : 0;

  return { usedMl, limitMl, remainingMl, percent, isTrial: false };
}
