/**
 * Client price-change consent — Viwa Telemetry /client/price-change/*
 * @see viwa-telemetry apps/api/src/loyalty/client-api/client-price-change.controller.ts
 */

/** Backend enum ClientPriceChangeDecisionValue */
export type ClientPriceChangeDecisionWire = 'ACCEPTED' | 'REFUSED';

/** GET /client/price-change/notice — wire payload */
export type ClientPriceChangeNoticeWire = {
  schedule: {
    id: string;
    subscriptionLevelId: string;
    currentPriceKopecks: number;
    newPriceKopecks: number;
    effectiveAt: string;
  } | null;
  latestDecision: ClientPriceChangeDecisionWire | null;
};

/** POST /client/price-change/accept|decline — request body */
export type ClientPriceChangeDecisionBodyWire = {
  scheduleId: string;
};

/** POST /client/price-change/accept|decline — response */
export type ClientPriceChangeDecisionResponseWire = {
  decision: ClientPriceChangeDecisionWire;
  decidedAt: string;
};

/** UI-facing decision (DECLINED maps backend REFUSED) */
export type SubscriptionPriceDecision = 'ACCEPTED' | 'DECLINED';

/** Normalized notice for SubscriptionPriceConsentPanel */
export type SubscriptionPriceNoticeDTO = {
  scheduleId: string;
  subscriptionLevelId: string;
  currentPriceKopecks: number;
  newPriceKopecks: number;
  effectiveAt: string;
  latestDecision: SubscriptionPriceDecision | null;
  /** Optional display context — not returned by notice endpoint */
  tierName?: string | null;
};
