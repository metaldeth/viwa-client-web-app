import { FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import type {
  SubscriptionPriceDecision,
  SubscriptionPriceNoticeDTO,
} from '../../types/subscriptionPriceNotice';
import styles from './SubscriptionPriceConsentPanel.module.scss';

export type SubscriptionPriceConsentPanelProps = {
  notice: SubscriptionPriceNoticeDTO;
  submitting: SubscriptionPriceDecision | null;
  submitError: string | null;
  onAccept: () => void;
  onDecline: () => void;
  onReviewStart?: () => void;
};

export type SubscriptionPriceNoticeFetchErrorProps = {
  message: string;
  onRetry: () => void;
  isRetrying?: boolean;
};

function formatEffectiveDate(isoDate: string): string {
  return formatDateDDMMYYYY(isoDate) ?? isoDate;
}

function formatMonthlyPrice(priceKopecks: number): string {
  return tSubscription('priceNoticePriceValue', { price: formatPriceRub(priceKopecks) });
}

/** Mandatory consent UI for scheduled subscription price changes. */
export const SubscriptionPriceConsentPanel: FC<SubscriptionPriceConsentPanelProps> = ({
  notice,
  submitting,
  submitError,
  onAccept,
  onDecline,
  onReviewStart,
}) => {
  const [isReviewing, setIsReviewing] = useState(false);
  const effectiveDate = formatEffectiveDate(notice.effectiveAt);

  useEffect(() => {
    setIsReviewing(false);
  }, [notice.scheduleId, notice.latestDecision]);
  const isPending = notice.latestDecision == null;
  const isAccepted = notice.latestDecision === 'ACCEPTED';
  const isDeclined = notice.latestDecision === 'DECLINED';
  const showFullConsent = isPending || isReviewing;

  const panelClassName = classNames(styles.panel, {
    [styles.panelCompact]: !showFullConsent,
    [styles.panelAccepted]: isAccepted && !isReviewing,
    [styles.panelDeclined]: isDeclined && !isReviewing,
  });

  return (
    <section
      className={panelClassName}
      role="status"
      aria-live="polite"
      aria-label={tSubscription('priceNoticeAriaLabel')}
      data-testid="subscription-price-consent-panel"
    >
      {showFullConsent ? (
        <>
          <h2 className={styles.title}>{tSubscription('priceNoticeTitle')}</h2>
          {notice.tierName ? (
            <p className={styles.tierContext}>
              {tSubscription('priceNoticeTierContext', { tier: notice.tierName })}
            </p>
          ) : null}
          <p className={styles.lead}>
            {tSubscription('priceNoticePendingLead', { date: effectiveDate })}
          </p>

          <div className={styles.priceRow} aria-hidden="false">
            <div className={styles.priceBlock}>
              <span className={styles.priceLabel}>
                {tSubscription('priceNoticeCurrentPriceLabel')}
              </span>
              <span className={styles.priceValue}>
                {formatMonthlyPrice(notice.currentPriceKopecks)}
              </span>
            </div>
            <span className={styles.priceArrow} aria-hidden="true">
              →
            </span>
            <div className={classNames(styles.priceBlock, styles.priceBlockNew)}>
              <span className={styles.priceLabel}>
                {tSubscription('priceNoticeNewPriceLabel', { date: effectiveDate })}
              </span>
              <span className={classNames(styles.priceValue, styles.priceValueNew)}>
                {formatMonthlyPrice(notice.newPriceKopecks)}
              </span>
            </div>
          </div>

          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}

          <div className={styles.actions}>
            <button
              type="button"
              className={classNames(styles.button, styles.buttonAccept)}
              disabled={submitting != null}
              aria-busy={submitting === 'ACCEPTED' ? 'true' : undefined}
              onClick={onAccept}
            >
              {tSubscription('priceNoticeAccept')}
            </button>
            <button
              type="button"
              className={classNames(styles.button, styles.buttonDecline)}
              disabled={submitting != null}
              aria-busy={submitting === 'DECLINED' ? 'true' : undefined}
              onClick={onDecline}
            >
              {tSubscription('priceNoticeDecline')}
            </button>
          </div>
        </>
      ) : isAccepted ? (
        <>
          <h2 className={classNames(styles.title, styles.titleAccepted)}>
            {tSubscription('priceNoticeAcceptedTitle')}
          </h2>
          <p className={styles.compactSummary}>
            {tSubscription('priceNoticeAcceptedSummary', {
              date: effectiveDate,
              price: formatPriceRub(notice.newPriceKopecks),
            })}
          </p>
          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}
          <div className={classNames(styles.actions, styles.actionsSingle)}>
            <button
              type="button"
              className={classNames(styles.button, styles.buttonSecondary)}
              disabled={submitting != null}
              onClick={() => {
                onReviewStart?.();
                setIsReviewing(true);
              }}
            >
              {tSubscription('priceNoticeChangeDecision')}
            </button>
          </div>
        </>
      ) : (
        <>
          <h2 className={styles.title}>{tSubscription('priceNoticeDeclinedTitle')}</h2>
          <p className={styles.compactSummary}>
            {tSubscription('priceNoticeDeclinedSummary', { date: effectiveDate })}
          </p>
          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}
          <div className={styles.actions}>
            <button
              type="button"
              className={classNames(styles.button, styles.buttonAccept)}
              disabled={submitting != null}
              aria-busy={submitting === 'ACCEPTED' ? 'true' : undefined}
              onClick={onAccept}
            >
              {tSubscription('priceNoticeAcceptAfterDecline')}
            </button>
            <button
              type="button"
              className={classNames(styles.button, styles.buttonSecondary)}
              disabled={submitting != null}
              onClick={() => {
                onReviewStart?.();
                setIsReviewing(true);
              }}
            >
              {tSubscription('priceNoticeChangeDecision')}
            </button>
          </div>
        </>
      )}
    </section>
  );
};

/** Inline fetch failure with retry — does not affect auth tokens. */
export const SubscriptionPriceNoticeFetchError: FC<SubscriptionPriceNoticeFetchErrorProps> = ({
  message,
  onRetry,
  isRetrying = false,
}) => (
  <section
    className={styles.fetchErrorPanel}
    role="status"
    aria-live="polite"
    aria-label={tSubscription('priceNoticeAriaLabel')}
    data-testid="subscription-price-notice-fetch-error"
  >
    <p className={styles.error}>{message}</p>
    <div className={styles.fetchErrorActions}>
      <button
        type="button"
        className={classNames(styles.button, styles.buttonSecondary)}
        disabled={isRetrying}
        aria-busy={isRetrying ? 'true' : undefined}
        onClick={onRetry}
      >
        {tSubscription('priceNoticeRetry')}
      </button>
    </div>
  </section>
);

export default SubscriptionPriceConsentPanel;
