/**
 * Уровень подписки (telemetry-loyalty SubscriptionLevel)
 */
export type SubscriptionLevelDTO = {
  uuid: string;
  name: string;
  volume: number;
  price: number;
  orgId: number;
  isArchive?: boolean | null;
};
