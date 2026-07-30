import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';
import type { SubscriptionLevelDTO } from '../types/subscriptionLevel';
import { isActiveSubscriptionProfile } from './subscriptionStatus';

export type PlanSummaryVariant = 'offer' | 'current';

export type PlanSummaryDisplay = {
  variant: PlanSummaryVariant;
  tierName: string;
  priceKopecks: number | null;
  monthlyVolumeMl: number | null;
  levelId: string | null;
  /** @deprecated prefer `variant === 'offer'` */
  isRecommended: boolean;
  subscriptionEndsAt: string | null;
};

function levelVolumeMl(level: SubscriptionLevelDTO): number {
  return level.monthlyVolumeMl ?? level.dailyVolumeMl ?? 0;
}

function findLevelByTierName(
  levels: SubscriptionLevelDTO[],
  tierName: string,
): SubscriptionLevelDTO | undefined {
  return (
    levels.find((level) => level.name === tierName) ??
    levels.find((level) => level.name.toLowerCase() === tierName.toLowerCase())
  );
}

/** Lowest `sortOrder` tier — used as recommended plan for trial/inactive clients. */
export function resolveRecommendedLevel(
  levels: SubscriptionLevelDTO[],
): SubscriptionLevelDTO | null {
  if (levels.length === 0) {
    return null;
  }
  return [...levels].sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null;
}

/**
 * Resolves plan card headline data: active tier from profile when subscribed,
 * otherwise the recommended lowest-sort tier from the public levels API.
 */
export function resolvePlanSummaryDisplay(
  profile: ClientProfileDTO | null | undefined,
  levels: SubscriptionLevelDTO[],
): PlanSummaryDisplay | null {
  if (profile && isActiveSubscriptionProfile(profile) && profile.tierName) {
    const tierName = profile.tierName;
    const activeLevel = findLevelByTierName(levels, tierName);

    if (activeLevel) {
      return {
        variant: 'current',
        tierName: activeLevel.name,
        priceKopecks: activeLevel.priceKopecks,
        monthlyVolumeMl: levelVolumeMl(activeLevel),
        levelId: activeLevel.id,
        isRecommended: false,
        subscriptionEndsAt: profile.subscriptionEndsAt,
      };
    }

    return {
      variant: 'current',
      tierName,
      priceKopecks: null,
      monthlyVolumeMl: null,
      levelId: null,
      isRecommended: false,
      subscriptionEndsAt: profile.subscriptionEndsAt,
    };
  }

  const recommended = resolveRecommendedLevel(levels);
  if (!recommended) {
    return null;
  }

  return {
    variant: 'offer',
    tierName: recommended.name,
    priceKopecks: recommended.priceKopecks,
    monthlyVolumeMl: levelVolumeMl(recommended),
    levelId: recommended.id,
    isRecommended: true,
    subscriptionEndsAt: null,
  };
}
