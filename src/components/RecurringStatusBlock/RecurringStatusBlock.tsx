import { FC, useCallback } from 'react';
import { Button } from '@asnefedov/uikit/Button';
import { Text } from '@asnefedov/uikit/Text';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { RecurringAgreementDTO, RecurringCapabilitiesDTO } from '../../types/recurring';
import styles from './RecurringStatusBlock.module.scss';

export type RecurringStatusBlockProps = {
  agreement: RecurringAgreementDTO | null;
  capabilities: RecurringCapabilitiesDTO | null;
  loading?: boolean;
  error?: string | null;
  patching?: boolean;
  onDisable: () => void;
  onReEnable: () => void;
  onEnableNewParent: () => void;
  onRetry: () => void;
};

function formatNextCharge(nextChargeAt: string | null): string | null {
  if (!nextChargeAt) {
    return null;
  }

  return formatDateDDMMYYYY(nextChargeAt) ?? nextChargeAt;
}

const RecurringStatusBlock: FC<RecurringStatusBlockProps> = ({
  agreement,
  capabilities,
  loading = false,
  error = null,
  patching = false,
  onDisable,
  onReEnable,
  onEnableNewParent,
  onRetry,
}) => {
  const handleToggle = useCallback(() => {
    if (!agreement || !capabilities?.canToggleAutoRenew || patching) {
      return;
    }

    if (agreement.status === 'ACTIVE' && agreement.autoRenewEnabled) {
      onDisable();
      return;
    }

    if (agreement.status === 'DISABLED') {
      onReEnable();
    }
  }, [agreement, capabilities?.canToggleAutoRenew, onDisable, onReEnable, patching]);

  if (loading && !agreement) {
    return (
      <section className={styles.block} aria-busy="true" data-testid="recurring-status-block">
        <Text size="s" view="secondary" className={styles.statusLine}>
          {tSubscription('paymentChecking')}
        </Text>
      </section>
    );
  }

  if (error && !agreement) {
    return (
      <section className={styles.block} data-testid="recurring-status-block">
        <div className={styles.retryRow}>
          <Text size="s" view="alert" className={styles.errorText} role="alert">
            {error}
          </Text>
          <Button
            size="s"
            view="secondary"
            label={tSubscription('priceNoticeRetry')}
            onClick={onRetry}
          />
        </div>
      </section>
    );
  }

  const showRequiresAction =
    agreement?.status === 'REQUIRES_ACTION' || capabilities?.requiresNewParentPayment;
  const nextChargeLabel = formatNextCharge(agreement?.nextChargeAt ?? null);
  const isAutoRenewOn = agreement?.status === 'ACTIVE' && agreement.autoRenewEnabled;
  const isDisabledAgreement = agreement?.status === 'DISABLED';
  const switchChecked = isAutoRenewOn;
  const switchDisabled =
    patching || !capabilities?.canToggleAutoRenew || agreement?.status === 'REQUIRES_ACTION';

  return (
    <section
      className={styles.block}
      aria-label={tSubscription('autoRenewLabel')}
      data-testid="recurring-status-block"
    >
      <div className={styles.header}>
        <h2 className={styles.title}>{tSubscription('autoRenewLabel')}</h2>
      </div>

      {nextChargeLabel && isAutoRenewOn ? (
        <Text size="s" className={styles.statusLine}>
          {tSubscription('recurringNextCharge', { date: nextChargeLabel })}
        </Text>
      ) : null}

      {isDisabledAgreement ? (
        <Text size="s" view="secondary" className={styles.statusLine}>
          {tSubscription('recurringDisabled')}
        </Text>
      ) : null}

      {showRequiresAction ? (
        <Text
          size="s"
          className={styles.warning}
          role="status"
          data-testid="recurring-requires-action"
        >
          {tSubscription('recurringRequiresAction')}
        </Text>
      ) : null}

      {agreement && capabilities?.canToggleAutoRenew && !capabilities.requiresNewParentPayment ? (
        <div className={styles.autoRenewRow}>
          <span className={styles.autoRenewLabel}>{tSubscription('autoRenewLabel')}</span>
          <button
            type="button"
            className={styles.autoRenewSwitch}
            role="switch"
            aria-checked={switchChecked}
            aria-label={tSubscription('autoRenewLabel')}
            disabled={switchDisabled}
            data-testid="recurring-auto-renew-switch"
            onClick={handleToggle}
          >
            <span className={styles.autoRenewThumb} aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className={styles.actions}>
        {capabilities?.requiresNewParentPayment ? (
          <Button
            size="m"
            label={tSubscription('recurringEnableCta')}
            disabled={patching}
            data-testid="recurring-enable-new-parent-cta"
            onClick={onEnableNewParent}
          />
        ) : null}

        {isDisabledAgreement &&
        capabilities?.requiresConsent &&
        !capabilities.requiresNewParentPayment ? (
          <Button
            size="m"
            label={tSubscription('recurringReenableConsent')}
            disabled={patching}
            data-testid="recurring-reenable-cta"
            onClick={onReEnable}
          />
        ) : null}
      </div>

      {error ? (
        <div className={styles.retryRow}>
          <Text size="s" view="alert" className={styles.errorText} role="alert">
            {error}
          </Text>
          <Button
            size="s"
            view="secondary"
            label={tSubscription('priceNoticeRetry')}
            onClick={onRetry}
          />
        </div>
      ) : null}
    </section>
  );
};

export default RecurringStatusBlock;
