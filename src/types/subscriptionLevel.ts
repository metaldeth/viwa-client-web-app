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
  sortOrder: number;
};

export type SubscriptionLevelsResponse = {
  items: SubscriptionLevelDTO[];
};
