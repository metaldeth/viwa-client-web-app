import { api } from '../app/api';
import type { PublicTasteItemDTO } from '../types/publicCatalog';

let cachedItems: PublicTasteItemDTO[] | null = null;
let pendingRequest: Promise<PublicTasteItemDTO[]> | null = null;

/** Clears in-memory catalog cache (tests only). */
export function resetPublicTastesCatalogCacheForTests(): void {
  cachedItems = null;
  pendingRequest = null;
}

/**
 * Loads public tastes catalog once per session; subsequent calls reuse the cached list.
 */
export async function loadPublicTastesCatalog(): Promise<PublicTasteItemDTO[]> {
  if (cachedItems) {
    return cachedItems;
  }

  if (pendingRequest) {
    return pendingRequest;
  }

  pendingRequest = api.publicApi
    .fetchPublicTastes()
    .then((response) => {
      cachedItems = response.items ?? [];
      return cachedItems;
    })
    .catch((error: unknown) => {
      pendingRequest = null;
      throw error;
    });

  return pendingRequest;
}
