/**
 * Уровень подписки (Viwa Telemetry GET /client/subscription-levels)
 */
export type SubscriptionLevelDTO = {
  id: string;
  name: string;
  monthlyVolumeMl: number;
  /** @deprecated one-release alias — prefer monthlyVolumeMl */
  dailyVolumeMl?: number;
  priceKopecks: number;
  sortOrder: number | null;
  /** Marketing copy when provided by client API; null/absent on older backends */
  description?: string | null;
};

export type SubscriptionLevelsResponse = {
  items: SubscriptionLevelDTO[];
};
