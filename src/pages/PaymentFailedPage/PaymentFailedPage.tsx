import { FC, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@asnefedov/uikit/Button';
import CabinetAuthShell from '../../components/CabinetAuthShell';
import { resolveSafeReturnPath } from '../../constants/pendingPayment';
import { useRobokassaPaymentReturn } from '../../hooks/useRobokassaPaymentReturn';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './PaymentFailedPage.module.scss';

const PaymentFailedPage: FC = memo(function PaymentFailedPage() {
  const navigate = useNavigate();
  const { errorMessage, returnPath, pendingSession } = useRobokassaPaymentReturn({
    mode: 'failed',
  });

  const goBack = () => {
    navigate(resolveSafeReturnPath(pendingSession), { replace: true });
  };

  return (
    <CabinetAuthShell
      title={tSubscription('paymentReturnFailedTitle')}
      description={errorMessage || tSubscription('paymentReturnFailedDescription')}
    >
      <div className={styles.actions}>
        <Button
          label={tSubscription('paymentReturnBackToSubscription')}
          view="primary"
          width="full"
          onClick={goBack}
        />
      </div>
    </CabinetAuthShell>
  );
});

PaymentFailedPage.displayName = 'PaymentFailedPage';

export default PaymentFailedPage;
