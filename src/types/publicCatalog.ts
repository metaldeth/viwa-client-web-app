export type PublicTasteItemDTO = {
  mediaKey: string;
  nameRu: string;
  sortOrder: number;
  imageUrl?: string;
};

export type PublicTastesResponse = {
  items: PublicTasteItemDTO[];
  schemaVersion?: number;
};

export type PublicSubscriptionLevelDTO = {
  id: string;
  name: string;
  monthlyVolumeMl: number;
  priceKopecks: number;
  sortOrder: number;
  /** Marketing copy when provided by public API; null/absent on older backends */
  description?: string | null;
};

export type PublicSubscriptionLevelsResponse = {
  items: PublicSubscriptionLevelDTO[];
  schemaVersion?: number;
};

export type UpdateFavoriteTastesRequest = {
  tasteMediaKeys: string[];
};

export type UpdateFavoriteTastesResponse = {
  favoriteTasteKeys: string[];
};
