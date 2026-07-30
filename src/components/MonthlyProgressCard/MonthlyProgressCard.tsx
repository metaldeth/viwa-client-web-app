import { FC, useId, useMemo } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { MonthlyProgress } from '../../utils/monthlyProgress';
import styles from './MonthlyProgressCard.module.scss';

export type MonthlyProgressCardProps = {
  progress: MonthlyProgress;
};

const GAUGE_WIDTH = 280;
const GAUGE_HEIGHT = 148;
const STROKE_WIDTH = 14;
const RADIUS = 100;
const CENTER_X = GAUGE_WIDTH / 2;
const CENTER_Y = GAUGE_HEIGHT - 18;
const ARC_START_X = CENTER_X - RADIUS;
const ARC_END_X = CENTER_X + RADIUS;
const ARC_Y = CENTER_Y;

const ARC_PATH = `M ${ARC_START_X} ${ARC_Y} A ${RADIUS} ${RADIUS} 0 0 1 ${ARC_END_X} ${ARC_Y}`;
const ARC_LENGTH = Math.PI * RADIUS;

const MonthlyProgressCard: FC<MonthlyProgressCardProps> = ({ progress }) => {
  const gradientId = useId();

  const { remainingMl, limitMl, fillLength, remainingLabel } = useMemo(() => {
    const safeLimit = Math.max(progress.limitMl, 0);
    const safeRemaining = Math.max(0, Math.min(progress.remainingMl, safeLimit));
    const ratio = safeLimit > 0 ? safeRemaining / safeLimit : 0;

    return {
      remainingMl: Math.round(safeRemaining),
      limitMl: Math.round(safeLimit),
      fillLength: ratio * ARC_LENGTH,
      remainingLabel: tSubscription('progressMetricRemaining', { remaining: Math.round(safeRemaining) }),
    };
  }, [progress.limitMl, progress.remainingMl]);

  return (
    <section className={styles.MonthlyProgressCard} aria-labelledby="monthly-progress-title">
      <h2 id="monthly-progress-title" className={styles.title}>
        {tSubscription('progressCardTitle')}
      </h2>

      <div
        className={styles.gaugeWrap}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={limitMl}
        aria-valuenow={remainingMl}
        aria-label={tSubscription('progressRemaining', { remaining: remainingMl })}
      >
        <svg
          className={styles.gaugeSvg}
          viewBox={`0 0 ${GAUGE_WIDTH} ${GAUGE_HEIGHT}`}
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7f5af0" />
              <stop offset="50%" stopColor="#4361ee" />
              <stop offset="100%" stopColor="#2dd4bf" />
            </linearGradient>
          </defs>

          <path
            className={styles.gaugeTrack}
            d={ARC_PATH}
            strokeWidth={STROKE_WIDTH}
            pathLength={ARC_LENGTH}
          />
          <path
            className={styles.gaugeFill}
            d={ARC_PATH}
            strokeWidth={STROKE_WIDTH}
            pathLength={ARC_LENGTH}
            stroke={`url(#${gradientId})`}
            strokeDasharray={`${fillLength} ${ARC_LENGTH}`}
          />
        </svg>

        <div className={styles.center} aria-hidden="true">
          <p className={styles.metric} aria-label={remainingLabel}>
            <span className={styles.metricValue}>{remainingMl}</span>
            <span className={styles.metricUnit}>{tSubscription('volumeUnit')}</span>
          </p>
          <p className={styles.ofLimit}>{tSubscription('progressOfLimit', { limit: limitMl })}</p>
        </div>

        <div className={styles.scale} aria-hidden="true">
          <span className={styles.scaleMin}>0</span>
          <span className={styles.scaleMax}>{limitMl}</span>
        </div>
      </div>
    </section>
  );
};

export default MonthlyProgressCard;
