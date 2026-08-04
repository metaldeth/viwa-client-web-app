const TIER_CARD_BACKGROUNDS = [
  '/assets/viwa/plans/viwa-tier-card-01.webp',
  '/assets/viwa/plans/viwa-tier-card-02.webp',
] as const;

/** Deterministic promo-card background by sorted telemetry tier index. */
export function resolveTierCardBackground(sortedIndex: number): string {
  if (sortedIndex < 0) {
    return TIER_CARD_BACKGROUNDS[0];
  }

  return TIER_CARD_BACKGROUNDS[sortedIndex % TIER_CARD_BACKGROUNDS.length];
}

/** Background tied to tier identity in the full catalog (stable after filtering). */
export function resolveTierCardBackgroundForLevel(
  levelId: string,
  catalogLevels: readonly { id: string }[],
): string {
  const index = catalogLevels.findIndex((level) => level.id === levelId);
  return resolveTierCardBackground(index);
}
