import { MAX_FAVORITE_TASTES } from '../constants/loyalty';

/**
 * Toggle taste in selection. Returns null when max already reached.
 */
export function toggleFavoriteSelection(
  current: string[],
  mediaKey: string,
  max = MAX_FAVORITE_TASTES,
): string[] | null {
  if (current.includes(mediaKey)) {
    return current.filter((key) => key !== mediaKey);
  }
  if (current.length >= max) {
    return null;
  }
  return [...current, mediaKey];
}

export function isFavoriteSelectionFull(current: string[], max = MAX_FAVORITE_TASTES): boolean {
  return current.length >= max;
}
