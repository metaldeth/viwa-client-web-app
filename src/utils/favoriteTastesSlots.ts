import { MAX_FAVORITE_TASTES } from '../constants/loyalty';
import { tSubscription } from '../locale/subscriptionLocale';

export type FavoriteTasteCatalogEntry = {
  nameRu: string;
};

export type FavoriteTasteCatalogItem = {
  mediaKey: string;
  nameRu: string;
  sortOrder: number;
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

export type FavoriteTasteFeedItem = {
  mediaKey: string;
  nameRu: string;
  /** Dose rank for poured favorites; null for catalog-only or shuffled tastes. */
  rank: number | null;
};

export type BuildCabinetTastesFeedOptions = {
  /** Returns a value in [0, 1). Injectable for deterministic shuffle tests. */
  random?: () => number;
};

function resolveTasteLabel(mediaKey: string, catalogEntry?: FavoriteTasteCatalogEntry): string {
  if (catalogEntry?.nameRu) {
    return catalogEntry.nameRu;
  }
  return mediaKey;
}

/** Fisher–Yates shuffle (mutates a copy). */
export function shuffleArray<T>(items: T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds the cabinet «ТВОЙ ВКУС» feed: favorites first (with dose ranks), then remaining
 * catalog tastes in sortOrder. When favorites are empty, returns all catalog tastes shuffled.
 */
export function buildCabinetTastesFeed(
  favoriteKeys: string[],
  catalogItems: FavoriteTasteCatalogItem[],
  options?: BuildCabinetTastesFeedOptions,
): FavoriteTasteFeedItem[] {
  const random = options?.random ?? Math.random;
  const catalogByKey = new Map(catalogItems.map((item) => [item.mediaKey, item]));
  const sortedCatalog = [...catalogItems].sort((a, b) => a.sortOrder - b.sortOrder);

  if (favoriteKeys.length === 0) {
    return shuffleArray(sortedCatalog, random).map((item) => ({
      mediaKey: item.mediaKey,
      nameRu: item.nameRu,
      rank: null,
    }));
  }

  const favoriteSet = new Set(favoriteKeys);
  const feed: FavoriteTasteFeedItem[] = favoriteKeys.map((mediaKey, index) => ({
    mediaKey,
    nameRu: resolveTasteLabel(mediaKey, catalogByKey.get(mediaKey)),
    rank: index + 1,
  }));

  sortedCatalog.forEach((item) => {
    if (!favoriteSet.has(item.mediaKey)) {
      feed.push({
        mediaKey: item.mediaKey,
        nameRu: item.nameRu,
        rank: null,
      });
    }
  });

  return feed;
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
