import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../app/api';
import {
  BILLING_POLL_INTERVAL_MS,
  BILLING_POLL_MAX_MS,
} from '../app/api/modules/billing/billingModule';
import {
  clearPendingPayment,
  DEFAULT_SAFE_CABINET_RETURN_PATH,
  readPendingPayment,
  resolveSafeReturnPath,
  type PendingPaymentSession,
} from '../constants/pendingPayment';
import { isTransientRefreshError } from '../app/api/axiosCore';
import { tSubscription } from '../locale/subscriptionLocale';

export type RobokassaPaymentReturnPhase =
  | 'idle'
  | 'checking'
  | 'await_subscription'
  | 'done'
  | 'error'
  | 'missing_pending';

export type UseRobokassaPaymentReturnOptions = {
  mode: 'success' | 'failed';
};

export type UseRobokassaPaymentReturnResult = {
  phase: RobokassaPaymentReturnPhase;
  errorMessage: string | null;
  returnPath: string;
  pendingSession: PendingPaymentSession | null;
  retry: () => void;
};

function isTransientPollError(error: unknown): boolean {
  return isTransientRefreshError(error);
}

function navigateToSafeReturnPath(
  navigate: ReturnType<typeof useNavigate>,
  session: PendingPaymentSession | null,
): void {
  navigate(resolveSafeReturnPath(session), { replace: true });
}

export function useRobokassaPaymentReturn({
  mode,
}: UseRobokassaPaymentReturnOptions): UseRobokassaPaymentReturnResult {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<RobokassaPaymentReturnPhase>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [returnPath, setReturnPath] = useState(DEFAULT_SAFE_CABINET_RETURN_PATH);
  const [pendingSession, setPendingSession] = useState<PendingPaymentSession | null>(null);
  const [runId, setRunId] = useState(0);
  const cancelledRef = useRef(false);

  const retry = useCallback(() => {
    setRunId((value) => value + 1);
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    const session = readPendingPayment();

    if (!session) {
      setPendingSession(null);
      setReturnPath(DEFAULT_SAFE_CABINET_RETURN_PATH);
      setPhase('missing_pending');
      setErrorMessage(tSubscription('paymentReturnMissingSession'));
      return () => {
        cancelledRef.current = true;
      };
    }

    const safeReturnPath = resolveSafeReturnPath(session);

    setPendingSession(session);
    setReturnPath(safeReturnPath);

    if (mode === 'failed') {
      clearPendingPayment();
      setPhase('error');
      setErrorMessage(tSubscription('paymentReturnFailedDescription'));
      return () => {
        cancelledRef.current = true;
      };
    }

    const pollPayment = async () => {
      setPhase('checking');
      setErrorMessage(null);

      const deadline = session.startedAt + BILLING_POLL_MAX_MS;

      while (!cancelledRef.current && Date.now() < deadline) {
        try {
          const response = await api.billing.getPaymentStatus(session.paymentId);

          if (response.status === 'PAID') {
            setPhase('await_subscription');

            while (!cancelledRef.current && Date.now() < deadline) {
              try {
                const subscription = await api.billing.getSubscriptionStatus(session.paymentId);

                if (subscription.status === 'COMPLETED') {
                  clearPendingPayment();
                  setPhase('done');
                  navigateToSafeReturnPath(navigate, session);
                  return;
                }

                if (subscription.status === 'FAILED') {
                  setPhase('error');
                  setErrorMessage(
                    subscription.message || tSubscription('paymentReturnActivationFailed'),
                  );
                  return;
                }
              } catch (subscriptionError) {
                if (!isTransientPollError(subscriptionError)) {
                  const message =
                    subscriptionError instanceof Error
                      ? subscriptionError.message
                      : tSubscription('paymentReturnActivationFailed');
                  setPhase('error');
                  setErrorMessage(message);
                  return;
                }
              }

              await new Promise((resolve) => setTimeout(resolve, BILLING_POLL_INTERVAL_MS));
            }

            setPhase('error');
            setErrorMessage(tSubscription('paymentReturnActivationTimeout'));
            return;
          }

          if (response.status === 'FAILED' || response.status === 'EXPIRED') {
            clearPendingPayment();
            setPhase('error');
            setErrorMessage(response.message || tSubscription('paymentReturnFailedDescription'));
            return;
          }
        } catch (pollError) {
          if (!isTransientPollError(pollError)) {
            const message =
              pollError instanceof Error
                ? pollError.message
                : tSubscription('paymentReturnCheckFailed');
            setPhase('error');
            setErrorMessage(message);
            return;
          }
        }

        await new Promise((resolve) => setTimeout(resolve, BILLING_POLL_INTERVAL_MS));
      }

      if (!cancelledRef.current) {
        setPhase('error');
        setErrorMessage(tSubscription('paymentReturnCheckTimeout'));
      }
    };

    void pollPayment();

    return () => {
      cancelledRef.current = true;
    };
  }, [mode, navigate, runId]);

  return {
    phase,
    errorMessage,
    returnPath,
    pendingSession,
    retry,
  };
}
