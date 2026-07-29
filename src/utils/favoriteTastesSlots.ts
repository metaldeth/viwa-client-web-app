import { MAX_FAVORITE_TASTES } from '../constants/loyalty';
import { tSubscription } from '../locale/subscriptionLocale';

export type FavoriteTasteCatalogEntry = {
  nameRu: string;
};

export type FavoriteTasteFilledSlot = {
  kind: 'filled';
  rank: number;
  mediaKey: string;
  nameRu: string;
};

export type FavoriteTastePlaceholderSlot = {
  kind: 'placeholder';
  rank: number;
};

export type FavoriteTasteSlot = FavoriteTasteFilledSlot | FavoriteTastePlaceholderSlot;

function resolveTasteLabel(mediaKey: string, catalogEntry?: FavoriteTasteCatalogEntry): string {
  if (catalogEntry?.nameRu) {
    return catalogEntry.nameRu;
  }
  return mediaKey;
}

/**
 * Builds exactly three read-only slots from API `favoriteTasteKeys` top order.
 * Empty tail slots become placeholders; never pads with fake favorites.
 */
export function buildFavoriteTasteSlots(
  favoriteKeys: string[],
  catalogByKey: Map<string, FavoriteTasteCatalogEntry>,
): FavoriteTasteSlot[] {
  const keys = favoriteKeys.slice(0, MAX_FAVORITE_TASTES);
  const slots: FavoriteTasteSlot[] = [];

  for (let index = 0; index < MAX_FAVORITE_TASTES; index += 1) {
    const rank = index + 1;
    const mediaKey = keys[index];

    if (mediaKey) {
      slots.push({
        kind: 'filled',
        rank,
        mediaKey,
        nameRu: resolveTasteLabel(mediaKey, catalogByKey.get(mediaKey)),
      });
    } else {
      slots.push({ kind: 'placeholder', rank });
    }
  }

  return slots;
}

/** Uppercase fallback label when catalog entry is missing after load. */
export function getUnknownTasteFallbackLabel(mediaKey: string): string {
  return tSubscription('favoritesUnknownKey', { key: mediaKey });
}
