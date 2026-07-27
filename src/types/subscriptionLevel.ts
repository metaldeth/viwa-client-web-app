/**
 * Уровень подписки (Viwa Telemetry GET /client/subscription-levels)
 */
export type SubscriptionLevelDTO = {
  id: string;
  name: string;
  dailyVolumeMl: number;
  priceKopecks: number;
  sortOrder: number;
};

export type SubscriptionLevelsResponse = {
  items: SubscriptionLevelDTO[];
};
