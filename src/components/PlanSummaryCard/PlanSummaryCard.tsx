import { FC } from 'react';
import { tSubscription, formatPriceRub } from '../../locale/subscriptionLocale';
import type { PlanSummaryDisplay } from '../../utils/planSummary';
import styles from './PlanSummaryCard.module.scss';

export type PlanSummaryCardProps = {
  plan: PlanSummaryDisplay | null;
  isLoading: boolean;
  onOpen: () => void;
};

const PLAN_BENEFIT_KEYS = [
  'planBenefitSavings',
  'planBenefitPriority',
  'planBenefitBonuses',
] as const;

function buildPlanAriaLabel(plan: PlanSummaryDisplay | null): string {
  if (!plan) {
    return tSubscription('planCardOpenHint');
  }

  return `${tSubscription('planCardOpenHint')}. ${plan.tierName}, ${tSubscription('planPerMonth', {
    price: formatPriceRub(plan.priceKopecks),
  })}`;
}

/** Summary plan card opening the subscription/billing modal. */
const PlanSummaryCard: FC<PlanSummaryCardProps> = ({ plan, isLoading, onOpen }) => {
  return (
    <button
      type="button"
      className={styles.PlanSummaryCard}
      onClick={onOpen}
      aria-label={buildPlanAriaLabel(plan)}
      disabled={isLoading || !plan}
    >
      <div className={styles.content}>
        <div className={styles.main}>
          <h2 className={styles.title}>{tSubscription('planCardTitle')}</h2>

          {isLoading && <p className={styles.loading}>{tSubscription('planLoading')}</p>}

          {!isLoading && plan && (
            <>
              <p className={styles.priceLine} aria-hidden="true">
                <span className={styles.priceAmount}>{formatPriceRub(plan.priceKopecks)} ₽</span>
                <span className={styles.pricePeriod}>{tSubscription('planPeriodSuffix')}</span>
              </p>

              <ul className={styles.benefits}>
                {PLAN_BENEFIT_KEYS.map((key) => (
                  <li key={key}>
                    <svg className={styles.checkIcon} viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="M3 8.5 6.5 12 13 4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.75"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{tSubscription(key)}</span>
                  </li>
                ))}
              </ul>
            </>
          )}

          {!isLoading && !plan && <p className={styles.loading}>{tSubscription('planEmpty')}</p>}
        </div>

        <span className={styles.chevron} aria-hidden="true">
          <svg viewBox="0 0 24 24">
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
      </div>
    </button>
  );
};

export default PlanSummaryCard;
