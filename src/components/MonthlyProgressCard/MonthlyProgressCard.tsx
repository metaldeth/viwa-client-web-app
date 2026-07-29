import { FC } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { MonthlyProgress } from '../../utils/monthlyProgress';
import styles from './MonthlyProgressCard.module.scss';

export type MonthlyProgressCardProps = {
  progress: MonthlyProgress;
};

const MonthlyProgressCard: FC<MonthlyProgressCardProps> = ({ progress }) => {
  const usedLabel = tSubscription('progressMetricUsed', { used: progress.usedMl });

  return (
    <section className={styles.MonthlyProgressCard} aria-labelledby="monthly-progress-title">
      <div className={styles.content}>
        <div className={styles.main}>
          <h2 id="monthly-progress-title" className={styles.title}>
            {tSubscription('progressCardTitle')}
          </h2>

          <p className={styles.metric} aria-label={usedLabel}>
            <span className={styles.metricValue}>{progress.usedMl}</span>
            <span className={styles.metricUnit}>{tSubscription('volumeUnit')}</span>
          </p>

          <div
            className={styles.progressTrack}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={progress.limitMl}
            aria-valuenow={progress.usedMl}
            aria-label={tSubscription('progressUsed', {
              used: progress.usedMl,
              limit: progress.limitMl,
            })}
          >
            <span className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
          </div>

          <div className={styles.limits} aria-hidden="true">
            <span>0</span>
            <span>{progress.limitMl}</span>
          </div>
        </div>

        <div className={styles.bottleWrap} aria-hidden="true">
          <svg className={styles.bottle} viewBox="0 0 48 96" fill="none">
            <rect
              x="14"
              y="4"
              width="20"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M12 14h24v68c0 3.3-2.7 6-6 6H18c-3.3 0-6-2.7-6-6V14Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M16 34h16M16 48h16M16 62h10"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              opacity="0.55"
            />
          </svg>
        </div>
      </div>
    </section>
  );
};

export default MonthlyProgressCard;
