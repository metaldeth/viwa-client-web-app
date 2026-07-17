export enum SubscriptionStatus {
  /**
   * Пробная подписка активна
   */
  TRIAL_ACTIVE = 'TRIAL_ACTIVE',
  /**
   * Пробная подписка закончилась
   */
  TRIAL_ENDED = 'TRIAL_ENDED',
  /**
   * Подписка активная
   */
  ACTIVE = 'ACTIVE',
  /**
   * Подписка активна, но лимит по напиткам достигнут
   */
  ACTIVE_LIMIT_REACHED = 'ACTIVE_LIMIT_REACHED',
}
