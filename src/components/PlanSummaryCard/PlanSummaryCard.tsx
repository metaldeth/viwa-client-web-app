import { FC } from 'react';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { formatLitersFromMl, formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import type { PlanSummaryDisplay } from '../../utils/planSummary';
import {
  unlimitedWaterBenefitLocaleKey,
  type UnlimitedWaterBenefitVariant,
} from '../../utils/unlimitedWaterBenefit';
import styles from './PlanSummaryCard.module.scss';

const OFFER_BG = '/assets/viwa/plans/subscription-offer-bg.webp';
const CURRENT_BG = '/assets/viwa/plans/current-plan-bg.webp';

export type PlanSummaryCardProps = {
  plan: PlanSummaryDisplay | null;
  isLoading: boolean;
  isTrial?: boolean;
  waterBenefitVariant: UnlimitedWaterBenefitVariant;
  onOpen: () => void;
};

function buildPlanAriaLabel(
  plan: PlanSummaryDisplay | null,
  waterBenefitVariant: UnlimitedWaterBenefitVariant,
): string {
  if (!plan) {
    return tSubscription('planCardOpenHint');
  }

  const parts = [tSubscription('planCardOpenHint'), plan.tierName];

  if (plan.monthlyVolumeMl != null) {
    parts.push(
      tSubscription('planFlavoredVolume', { liters: formatLitersFromMl(plan.monthlyVolumeMl) }),
    );
  }

  parts.push(tSubscription(unlimitedWaterBenefitLocaleKey(waterBenefitVariant)));

  if (plan.priceKopecks != null) {
    parts.push(tSubscription('planPerMonth', { price: formatPriceRub(plan.priceKopecks) }));
  }

  if (plan.variant === 'current' && plan.subscriptionEndsAt) {
    const formatted = formatDateDDMMYYYY(plan.subscriptionEndsAt);
    if (formatted) {
      parts.push(tSubscription('progressValidUntil', { date: formatted }));
    }
  }

  return parts.join('. ');
}

/** Editorial plan banner opening the subscription/billing modal. */
const PlanSummaryCard: FC<PlanSummaryCardProps> = ({
  plan,
  isLoading,
  isTrial = false,
  waterBenefitVariant,
  onOpen,
}) => {
  const variant = plan?.variant ?? 'offer';
  const backgroundImage = variant === 'current' ? CURRENT_BG : OFFER_BG;
  const microLabelKey = variant === 'current' ? 'planCurrentLabel' : 'planOfferLabel';
  const ctaKey = variant === 'current' ? 'planCtaCurrent' : 'planCtaOffer';
  const waterBenefitKey =
    variant === 'current' ? 'planUnlimitedWaterActive' : 'planUnlimitedWaterOffer';
  const expiryFormatted =
    plan?.subscriptionEndsAt != null ? formatDateDDMMYYYY(plan.subscriptionEndsAt) : null;

  return (
    <button
      type="button"
      className={styles.PlanSummaryCard}
      data-variant={variant}
      onClick={onOpen}
      aria-label={buildPlanAriaLabel(plan, waterBenefitVariant)}
      aria-busy={isLoading}
    >
      <span
        className={styles.background}
        style={{ backgroundImage: `url(${backgroundImage})` }}
        aria-hidden="true"
      />
      <span className={styles.gradient} aria-hidden="true" />

      <span className={styles.content}>
        <span className={styles.textBlock}>
          <span className={styles.microLabel}>{tSubscription(microLabelKey)}</span>

          {isTrial && variant === 'offer' ? (
            <span className={styles.trialBadge}>{tSubscription('planTrialLiter')}</span>
          ) : null}

          {isLoading ? (
            <span className={styles.headline}>{tSubscription('planLoading')}</span>
          ) : plan ? (
            <>
              <span className={styles.headline}>{plan.tierName}</span>

              <span className={styles.details}>
                {plan.monthlyVolumeMl != null ? (
                  <span className={styles.detail}>
                    {tSubscription('planFlavoredVolume', {
                      liters: formatLitersFromMl(plan.monthlyVolumeMl),
                    })}
                  </span>
                ) : null}

                <span
                  className={`${styles.detail} ${styles.waterBenefitDetail}`}
                  data-testid="plan-unlimited-water-benefit"
                >
                  {tSubscription(waterBenefitKey)}
                </span>

                {plan.priceKopecks != null ? (
                  <span className={styles.detail}>
                    {tSubscription('planPerMonth', {
                      price: formatPriceRub(plan.priceKopecks),
                    })}
                  </span>
                ) : null}

                {variant === 'current' && expiryFormatted ? (
                  <span className={styles.detail}>
                    {tSubscription('progressValidUntil', { date: expiryFormatted })}
                  </span>
                ) : null}
              </span>
            </>
          ) : (
            <span className={styles.headline}>{tSubscription('planEmpty')}</span>
          )}

          <span className={styles.cta}>
            <span>{tSubscription(ctaKey)}</span>
            <svg className={styles.ctaIcon} viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M9 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
};

export default PlanSummaryCard;
