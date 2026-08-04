import { formatDateDDMMYYYY } from '../helpers/transformDateDDMMYYY';
import { getSubscriptionLocale, tSubscription } from '../locale/subscriptionLocale';
import type { SubscriptionLevelDTO } from '../types/subscriptionLevel';
import { isActiveSubscriptionProfile } from './subscriptionStatus';

export type SubscriptionLevelMatchInput = {
  tierName?: string | null;
  monthlyLimitMl?: number;
  dailyLimitMl?: number;
};

export type SubscriptionProfileInput = {
  tierName: string | null;
  subscriptionEndsAt: string | null;
  monthlyLimitMl?: number;
  dailyLimitMl?: number;
  active?: boolean;
};

export function levelVolumeMl(level: SubscriptionLevelDTO): number {
  return level.monthlyVolumeMl ?? level.dailyVolumeMl ?? 0;
}

export function profileLimitMl(profile: SubscriptionLevelMatchInput): number {
  return profile.monthlyLimitMl ?? profile.dailyLimitMl ?? 0;
}

function bothTiersHaveSortOrder(a: SubscriptionLevelDTO, b: SubscriptionLevelDTO): boolean {
  return a.sortOrder != null && b.sortOrder != null;
}

/** Rank pair aligned with backend `ranksForComparison` (sortOrder when both set, else volume). */
export function tierRanksForComparison(
  a: SubscriptionLevelDTO,
  b: SubscriptionLevelDTO,
): { rankA: number; rankB: number } {
  if (bothTiersHaveSortOrder(a, b)) {
    return { rankA: a.sortOrder!, rankB: b.sortOrder! };
  }

  return { rankA: levelVolumeMl(a), rankB: levelVolumeMl(b) };
}

/** True when `level` is same tier or stronger than `floor` (renew/upgrade eligible). */
export function isTierRankAtLeast(
  level: SubscriptionLevelDTO,
  floor: SubscriptionLevelDTO,
): boolean {
  const { rankA, rankB } = tierRanksForComparison(level, floor);
  return rankA >= rankB;
}

function compareTierRank(a: SubscriptionLevelDTO, b: SubscriptionLevelDTO): number {
  const { rankA, rankB } = tierRanksForComparison(a, b);
  if (rankA !== rankB) {
    return rankA - rankB;
  }

  const volumeDiff = levelVolumeMl(a) - levelVolumeMl(b);
  if (volumeDiff !== 0) {
    return volumeDiff;
  }

  return a.id.localeCompare(b.id);
}

export function sortLevelsByOrder(levels: SubscriptionLevelDTO[]): SubscriptionLevelDTO[] {
  return [...levels].sort(compareTierRank);
}

export function findLevelByTierName(
  levels: SubscriptionLevelDTO[],
  tierName: string,
): SubscriptionLevelDTO | undefined {
  return (
    levels.find((level) => level.name === tierName) ??
    levels.find((level) => level.name.toLowerCase() === tierName.toLowerCase())
  );
}

function pickConservativeVolumeMatch(
  matches: SubscriptionLevelDTO[],
): SubscriptionLevelDTO | undefined {
  if (matches.length === 0) {
    return undefined;
  }

  return sortLevelsByOrder(matches).at(-1);
}

/** Matches profile tier to catalog level by name, then by monthly pool volume. */
export function findCurrentSubscriptionLevel(
  profile: SubscriptionLevelMatchInput,
  levels: SubscriptionLevelDTO[],
): SubscriptionLevelDTO | undefined {
  if (profile.tierName) {
    const byName = findLevelByTierName(levels, profile.tierName);
    if (byName) {
      return byName;
    }
  }

  const limitMl = profileLimitMl(profile);
  if (limitMl > 0) {
    return pickConservativeVolumeMatch(levels.filter((level) => levelVolumeMl(level) === limitMl));
  }

  return undefined;
}

function resolveActivePaidSelectableLevels(
  profile: SubscriptionProfileInput,
  sorted: SubscriptionLevelDTO[],
): SubscriptionLevelDTO[] {
  const currentLevel = findCurrentSubscriptionLevel(profile, sorted);
  if (currentLevel) {
    return sorted.filter((level) => isTierRankAtLeast(level, currentLevel));
  }

  const limitMl = profileLimitMl(profile);
  if (limitMl <= 0) {
    return [];
  }

  return sorted.filter((level) => levelVolumeMl(level) >= limitMl);
}

export type SubscriptionTierAvailability = {
  catalog: SubscriptionLevelDTO[];
  selectable: SubscriptionLevelDTO[];
};

/** Full sorted catalog for modal display (never filtered by subscription state). */
export function resolveVisibleSubscriptionLevels(
  levels: SubscriptionLevelDTO[],
): SubscriptionLevelDTO[] {
  return sortLevelsByOrder(levels);
}

/**
 * Active paid subscription: current tier + stronger ranks for renew/upgrade.
 * Unmatched legacy active: volume floor (no weaker tiers); empty when none qualify.
 * Trial, expired, admin-disabled, or missing subscription: all marketing tiers.
 */
export function resolveSelectableSubscriptionLevels(
  profile: SubscriptionProfileInput | null | undefined,
  levels: SubscriptionLevelDTO[],
  nowMs: number = Date.now(),
): SubscriptionLevelDTO[] {
  const sorted = resolveVisibleSubscriptionLevels(levels);
  if (sorted.length === 0) {
    return [];
  }

  if (!isActiveSubscriptionProfile(profile, nowMs)) {
    return sorted;
  }

  return resolveActivePaidSelectableLevels(profile!, sorted);
}

/** Visible catalog vs selectable subset for tier modal. */
export function resolveSubscriptionTierAvailability(
  profile: SubscriptionProfileInput | null | undefined,
  levels: SubscriptionLevelDTO[],
  nowMs: number = Date.now(),
): SubscriptionTierAvailability {
  const catalog = resolveVisibleSubscriptionLevels(levels);
  const selectable = resolveSelectableSubscriptionLevels(profile, levels, nowMs);
  return { catalog, selectable };
}

/** True when tier is shown in catalog but blocked by active paid / legacy floor rules. */
export function isSubscriptionLevelDisabled(
  levelId: string,
  catalog: SubscriptionLevelDTO[],
  selectable: SubscriptionLevelDTO[],
): boolean {
  if (!catalog.some((level) => level.id === levelId)) {
    return false;
  }
  return !isSubscriptionLevelSelectable(levelId, selectable);
}

export type DisabledTierCopy = {
  status: string;
  explanation: string;
};

export type DisabledTierCopyInput = {
  tierName: string | null;
  subscriptionEndsAt: string | null;
};

function hasDisabledTierExplanationParams(
  profile: DisabledTierCopyInput,
  targetLevel: Pick<SubscriptionLevelDTO, 'name'>,
): profile is DisabledTierCopyInput & { tierName: string; subscriptionEndsAt: string } {
  const currentTier = profile.tierName?.trim();
  const targetTier = targetLevel.name?.trim();
  if (!currentTier || !targetTier || !profile.subscriptionEndsAt) {
    return false;
  }

  const endMs = new Date(profile.subscriptionEndsAt).getTime();
  const formatted = formatDateDDMMYYYY(profile.subscriptionEndsAt);
  return Number.isFinite(endMs) && Boolean(formatted);
}

/** Status badge + explanation for tiers disabled while current subscription is active. */
export function resolveDisabledTierCopy(
  profile: DisabledTierCopyInput,
  targetLevel: Pick<SubscriptionLevelDTO, 'name'>,
  locale: 'ru' | 'en' = getSubscriptionLocale(),
): DisabledTierCopy {
  const status = tSubscription('tierDisabledStatus', undefined, locale);

  if (hasDisabledTierExplanationParams(profile, targetLevel)) {
    const formatted = formatDateDDMMYYYY(profile.subscriptionEndsAt)!;
    return {
      status,
      explanation: tSubscription(
        'tierDisabledExplanation',
        {
          currentTier: profile.tierName.trim(),
          date: formatted,
          targetTier: targetLevel.name.trim(),
        },
        locale,
      ),
    };
  }

  return {
    status,
    explanation: tSubscription('tierDisabledExplanationGeneric', undefined, locale),
  };
}

/** Keeps selection within available tiers; prefers explicit hint, then first available. */
export function normalizeSelectedSubscriptionLevelId(
  selectedId: string | null,
  availableLevels: SubscriptionLevelDTO[],
  preferredId?: string | null,
): string | null {
  if (availableLevels.length === 0) {
    return null;
  }

  const availableIds = new Set(availableLevels.map((level) => level.id));

  if (selectedId && availableIds.has(selectedId)) {
    return selectedId;
  }

  if (preferredId && availableIds.has(preferredId)) {
    return preferredId;
  }

  return availableLevels[0]?.id ?? null;
}

export function isSubscriptionLevelSelectable(
  levelId: string | null | undefined,
  availableLevels: SubscriptionLevelDTO[],
): boolean {
  if (!levelId) {
    return false;
  }
  return availableLevels.some((level) => level.id === levelId);
}
