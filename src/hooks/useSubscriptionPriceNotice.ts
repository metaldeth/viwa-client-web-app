import { useCallback, useEffect, useRef, useState } from 'react';

import { api } from '../app/api';

import { tSubscription } from '../locale/subscriptionLocale';

import type {
  ClientPriceChangeNoticeWire,
  SubscriptionPriceDecision,
  SubscriptionPriceNoticeDTO,
} from '../types/subscriptionPriceNotice';

import {
  isStalePriceScheduleSubmitError,
  mapWireDecisionToUi,
  normalizePriceChangeNotice,
} from '../utils/subscriptionPriceNotice';

export type SubscriptionPriceNoticeFetchState = 'idle' | 'loading' | 'ready' | 'error';

export function useSubscriptionPriceNotice(isAuthed: boolean, tierName?: string | null) {
  const [notice, setNotice] = useState<SubscriptionPriceNoticeDTO | null>(null);

  const [fetchState, setFetchState] = useState<SubscriptionPriceNoticeFetchState>('idle');

  const [fetchError, setFetchError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState<SubscriptionPriceDecision | null>(null);

  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitInFlightRef = useRef(false);

  const enrichNotice = useCallback(
    (normalized: SubscriptionPriceNoticeDTO | null): SubscriptionPriceNoticeDTO | null => {
      if (!normalized) {
        return null;
      }

      if (tierName == null || tierName === normalized.tierName) {
        return normalized;
      }

      return { ...normalized, tierName };
    },

    [tierName],
  );

  const applyNoticeFromWire = useCallback(
    (wire: ClientPriceChangeNoticeWire) => {
      setNotice(enrichNotice(normalizePriceChangeNotice(wire, { tierName })));

      setFetchState('ready');

      setFetchError(null);
    },

    [enrichNotice, tierName],
  );

  const load = useCallback(async () => {
    if (!isAuthed) {
      setNotice(null);

      setFetchState('idle');

      setFetchError(null);

      return;
    }

    setFetchState('loading');

    setFetchError(null);

    try {
      const response = await api.subscriptionPriceNotice.fetchNotice();

      applyNoticeFromWire(response);
    } catch {
      setFetchError(tSubscription('priceNoticeFetchError'));

      setFetchState('error');
    }
  }, [isAuthed, applyNoticeFromWire]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    setNotice((current) => enrichNotice(current));
  }, [enrichNotice]);

  const applyOptimisticDecision = useCallback((decision: SubscriptionPriceDecision) => {
    setNotice((current) => {
      if (!current) {
        return current;
      }

      return { ...current, latestDecision: decision };
    });
  }, []);

  const submitDecision = useCallback(
    async (decision: SubscriptionPriceDecision) => {
      if (!notice || submitInFlightRef.current) {
        return;
      }

      const scheduleId = notice.scheduleId;

      submitInFlightRef.current = true;

      setSubmitting(decision);

      setSubmitError(null);

      try {
        const body = { scheduleId };

        const response =
          decision === 'ACCEPTED'
            ? await api.subscriptionPriceNotice.accept(body)
            : await api.subscriptionPriceNotice.decline(body);

        const uiDecision = mapWireDecisionToUi(response.decision);

        if (uiDecision) {
          applyOptimisticDecision(uiDecision);
        }

        try {
          const refreshed = await api.subscriptionPriceNotice.fetchNotice();

          applyNoticeFromWire(refreshed);
        } catch {
          setFetchError(tSubscription('priceNoticeFetchError'));

          setFetchState('error');
        }
      } catch (error) {
        if (isStalePriceScheduleSubmitError(error)) {
          try {
            const refreshed = await api.subscriptionPriceNotice.fetchNotice();

            const normalized = normalizePriceChangeNotice(refreshed, { tierName });

            if (!normalized) {
              setNotice(null);

              setFetchState('ready');

              setFetchError(null);

              setSubmitError(null);
            } else if (normalized.scheduleId !== scheduleId) {
              applyNoticeFromWire(refreshed);

              setSubmitError(null);
            } else {
              setSubmitError(tSubscription('priceNoticeSubmitError'));
            }
          } catch {
            setSubmitError(tSubscription('priceNoticeSubmitError'));
          }
        } else {
          setSubmitError(tSubscription('priceNoticeSubmitError'));
        }
      } finally {
        submitInFlightRef.current = false;

        setSubmitting(null);
      }
    },

    [notice, tierName, applyOptimisticDecision, applyNoticeFromWire],
  );

  const clearSubmitError = useCallback(() => {
    setSubmitError(null);
  }, []);

  const isRetrying = fetchState === 'loading' && notice != null;

  return {
    notice,

    fetchState,

    fetchError,

    submitting,

    submitError,

    isRetrying,

    load,

    submitDecision,

    clearSubmitError,
  };
}
