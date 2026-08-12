import { FC, useEffect, useId, useState } from 'react';
import { Button } from '@asnefedov/uikit/Button';
import { Text } from '@asnefedov/uikit/Text';
import BottomSheetModal from '../BottomSheetModal';
import { LEGAL_OFFER_URL } from '../../constants/legalLinks';
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

  const body = tSubscription('recurringConsentBody');
  const confirmLabel = tSubscription('recurringConsentConfirm');

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
          <span className={styles.checkboxLabel}>
            {tSubscription('recurringConsentAcceptBefore')}
            <a
              className={styles.offerLink}
              href={LEGAL_OFFER_URL}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="recurring-consent-offer-link"
              onClick={(event) => event.stopPropagation()}
            >
              {tSubscription('recurringConsentOfferLink')}
            </a>
          </span>
        </label>
        <div className={styles.actions}>
          <Button
            size="l"
            label={confirmLabel}
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
