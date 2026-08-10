import { FC, useEffect, useId, useState } from 'react';
import { Button } from '@asnefedov/uikit/Button';
import { Text } from '@asnefedov/uikit/Text';
import BottomSheetModal from '../BottomSheetModal';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './RecurringConsentModal.module.scss';

export type RecurringConsentModalVariant = 'checkout' | 'reenable';

export type RecurringConsentModalProps = {
  isOpen: boolean;
  variant: RecurringConsentModalVariant;
  submitting?: boolean;
  onClose: () => void;
  onAccept: () => void;
};

const RecurringConsentModal: FC<RecurringConsentModalProps> = ({
  isOpen,
  variant,
  submitting = false,
  onClose,
  onAccept,
}) => {
  const checkboxId = useId();
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setAccepted(false);
    }
  }, [isOpen]);

  const title =
    variant === 'reenable'
      ? tSubscription('recurringReenableConsent')
      : tSubscription('recurringConsentTitle');

  const body =
    variant === 'reenable'
      ? tSubscription('recurringConsentBody')
      : tSubscription('recurringConsentBody');

  const acceptLabel = tSubscription('recurringConsentAccept');

  return (
    <BottomSheetModal isOpen={isOpen} onClose={onClose}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${checkboxId}-title`}
        data-testid="recurring-consent-modal"
      >
        <Text id={`${checkboxId}-title`} size="l" weight="semibold">
          {title}
        </Text>
        <p className={styles.body}>{body}</p>
        <label className={styles.checkboxRow} htmlFor={checkboxId}>
          <input
            id={checkboxId}
            type="checkbox"
            className={styles.checkboxInput}
            checked={accepted}
            disabled={submitting}
            data-testid="recurring-consent-checkbox"
            onChange={(event) => setAccepted(event.target.checked)}
          />
          <span className={styles.checkboxLabel}>{acceptLabel}</span>
        </label>
        <div className={styles.actions}>
          <Button
            size="l"
            label={acceptLabel}
            disabled={!accepted || submitting}
            data-testid="recurring-consent-accept"
            onClick={onAccept}
          />
        </div>
      </div>
    </BottomSheetModal>
  );
};

export default RecurringConsentModal;
