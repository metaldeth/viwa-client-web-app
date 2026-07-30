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
