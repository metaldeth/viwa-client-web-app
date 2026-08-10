import { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@asnefedov/uikit/Button';
import { Loader } from '@asnefedov/uikit/Loader';
import { Text } from '@asnefedov/uikit/Text';
import CabinetAuthShell from '../../components/CabinetAuthShell';
import { resolveSafeReturnPath } from '../../constants/pendingPayment';
import { useRobokassaPaymentReturn } from '../../hooks/useRobokassaPaymentReturn';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './PaymentSuccessPage.module.scss';

const PaymentSuccessPage: FC = memo(function PaymentSuccessPage() {
  const navigate = useNavigate();
  const { phase, errorMessage, pendingSession, retry } = useRobokassaPaymentReturn({
    mode: 'success',
  });

  const isChecking = phase === 'idle' || phase === 'checking' || phase === 'await_subscription';
  const canRetryCheck = phase === 'error';

  const goBack = () => {
    navigate(resolveSafeReturnPath(pendingSession), { replace: true });
  };

  return (
    <CabinetAuthShell
      title={
        isChecking
          ? tSubscription('paymentReturnSuccessTitle')
          : tSubscription('paymentReturnErrorTitle')
      }
      description={
        isChecking
          ? phase === 'await_subscription'
            ? tSubscription('paymentReturnAwaitActivation')
            : tSubscription('paymentReturnCheckingDescription')
          : errorMessage || tSubscription('paymentReturnCheckFailed')
      }
    >
      {isChecking ? (
        <div className={styles.loaderWrap} aria-live="polite">
          <Loader size="m" />
          <Text size="s" view="secondary" className={styles.statusText}>
            {phase === 'await_subscription'
              ? tSubscription('paymentReturnAwaitActivation')
              : tSubscription('paymentReturnCheckingStatus')}
          </Text>
        </div>
      ) : (
        <div className={styles.actions}>
          {canRetryCheck ? (
            <Button
              label={tSubscription('paymentReturnRetryCheck')}
              view="primary"
              width="full"
              onClick={retry}
            />
          ) : null}
          <Button
            label={tSubscription('paymentReturnBackToSubscription')}
            view={canRetryCheck ? 'secondary' : 'primary'}
            width="full"
            onClick={goBack}
          />
        </div>
      )}
    </CabinetAuthShell>
  );
});

PaymentSuccessPage.displayName = 'PaymentSuccessPage';

export default PaymentSuccessPage;
