import { useCallback, useEffect, useState } from 'react';
import { api } from '../app/api';
import { tSubscription } from '../locale/subscriptionLocale';
import type {
  PatchRecurringAgreementRequest,
  RecurringAgreementResponse,
} from '../types/recurring';
import { resolveSubscriptionPaymentErrorMessage } from '../utils/subscriptionPaymentError';
export type UseRecurringAgreementResult = {
  data: RecurringAgreementResponse | null;
  loading: boolean;
  error: string | null;
  patching: boolean;
  refetch: () => Promise<void>;
  patchAgreement: (body: PatchRecurringAgreementRequest) => Promise<RecurringAgreementResponse>;
};

export function useRecurringAgreement(enabled: boolean): UseRecurringAgreementResult {
  const [data, setData] = useState<RecurringAgreementResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patching, setPatching] = useState(false);

  const refetch = useCallback(async () => {
    if (!enabled) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.billing.getRecurringAgreement();
      setData(response);
    } catch (e: unknown) {
      setError(resolveSubscriptionPaymentErrorMessage(e, tSubscription));
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError(null);
      return;
    }

    void refetch();
  }, [enabled, refetch]);

  const patchAgreement = useCallback(
    async (body: PatchRecurringAgreementRequest): Promise<RecurringAgreementResponse> => {
      setPatching(true);
      setError(null);

      try {
        const response = await api.billing.patchRecurringAgreement(body);
        setData(response);
        return response;
      } catch (e: unknown) {
        setError(resolveSubscriptionPaymentErrorMessage(e, tSubscription));
        throw e;
      } finally {
        setPatching(false);
      }
    },
    [],
  );

  return {
    data,
    loading,
    error,
    patching,
    refetch,
    patchAgreement,
  };
}
