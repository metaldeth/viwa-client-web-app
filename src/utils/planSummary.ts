import type { ClientProfileDTO } from '../types/serverInterface/clientDTO';
import type { SubscriptionLevelDTO } from '../types/subscriptionLevel';
import { isActiveSubscriptionProfile } from './subscriptionStatus';

export type PlanSummaryDisplay = {
  tierName: string;
  priceKopecks: number;
  levelId: string | null;
  isRecommended: boolean;
};

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
  const recommended = resolveRecommendedLevel(levels);
  if (!recommended) {
    return null;
  }

  if (profile && isActiveSubscriptionProfile(profile) && profile.tierName) {
    const tierName = profile.tierName;
    const activeLevel =
      levels.find((level) => level.name === tierName) ??
      levels.find((level) => level.name.toLowerCase() === tierName.toLowerCase());

    if (activeLevel) {
      return {
        tierName: activeLevel.name,
        priceKopecks: activeLevel.priceKopecks,
        levelId: activeLevel.id,
        isRecommended: false,
      };
    }

    return {
      tierName,
      priceKopecks: recommended.priceKopecks,
      levelId: recommended.id,
      isRecommended: false,
    };
  }

  return {
    tierName: recommended.name,
    priceKopecks: recommended.priceKopecks,
    levelId: recommended.id,
    isRecommended: true,
  };
}
