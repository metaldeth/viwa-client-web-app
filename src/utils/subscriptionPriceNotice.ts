import type {
  ClientPriceChangeDecisionWire,
  ClientPriceChangeNoticeWire,
  SubscriptionPriceDecision,
  SubscriptionPriceNoticeDTO,
} from '../types/subscriptionPriceNotice';

export function mapWireDecisionToUi(
  decision: ClientPriceChangeDecisionWire | null,
): SubscriptionPriceDecision | null {
  if (decision === 'REFUSED') {
    return 'DECLINED';
  }
  return decision;
}

export type NormalizePriceChangeNoticeOptions = {
  tierName?: string | null;
};

/** Returns null when backend has no applicable schedule (schedule: null). */
export function normalizePriceChangeNotice(
  wire: ClientPriceChangeNoticeWire,
  options?: NormalizePriceChangeNoticeOptions,
): SubscriptionPriceNoticeDTO | null {
  if (!wire.schedule) {
    return null;
  }

  return {
    scheduleId: wire.schedule.id,
    subscriptionLevelId: wire.schedule.subscriptionLevelId,
    currentPriceKopecks: wire.schedule.currentPriceKopecks,
    newPriceKopecks: wire.schedule.newPriceKopecks,
    effectiveAt: wire.schedule.effectiveAt,
    latestDecision: mapWireDecisionToUi(wire.latestDecision),
    tierName: options?.tierName ?? undefined,
  };
}

/** POST accept/decline 404 when scheduleId is stale or superseded. */
export function isStalePriceScheduleSubmitError(error: unknown): boolean {
  if (!error || typeof error !== 'object') {
    return false;
  }

  const record = error as { status?: number; code?: string; message?: string };

  if (record.status === 404 || record.code === '404') {
    return true;
  }

  if (typeof record.message === 'string' && /schedule not found/i.test(record.message)) {
    return true;
  }

  return false;
}
