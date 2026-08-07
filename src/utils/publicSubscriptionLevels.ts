import type { PublicSubscriptionLevelDTO } from '../types/publicCatalog';

export function sortPublicSubscriptionLevels(
  items: PublicSubscriptionLevelDTO[],
): PublicSubscriptionLevelDTO[] {
  return [...items].sort((a, b) => {
    const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
    const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    return a.monthlyVolumeMl - b.monthlyVolumeMl;
  });
}

export function resolvePublicTierDescription(
  level: Pick<PublicSubscriptionLevelDTO, 'description'>,
  fallback: string,
): string {
  const raw = level.description;
  if (raw == null) {
    return fallback;
  }
  const trimmed = raw.trim();
  return trimmed ? trimmed : fallback;
}
