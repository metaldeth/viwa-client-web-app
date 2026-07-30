import { FC, useMemo } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './RemainingVolumeBar.module.scss';

export type RemainingVolumeBarProps = {
  remainingMl: number;
  limitMl: number;
};

const GOAL_GREEN = '#A6FFE0';

/** Horizontal remaining bar — same logic as circular gauge (green used bite + remaining fill). */
const RemainingVolumeBar: FC<RemainingVolumeBarProps> = ({ remainingMl, limitMl }) => {
  const { usedPercent, remainingPercent, remaining, limit } = useMemo(() => {
    const safeLimit = Math.max(limitMl, 0);
    const safeRemaining = Math.max(0, Math.min(remainingMl, safeLimit));
    const safeUsed = Math.max(0, safeLimit - safeRemaining);
    const usedPercent = safeLimit > 0 ? (safeUsed / safeLimit) * 100 : 0;
    const remainingPercent = safeLimit > 0 ? (safeRemaining / safeLimit) * 100 : 0;

    return {
      usedPercent,
      remainingPercent,
      remaining: Math.round(safeRemaining),
      limit: Math.round(safeLimit),
    };
  }, [limitMl, remainingMl]);

  return (
    <div
      className={styles.RemainingVolumeBar}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={limit}
      aria-valuenow={remaining}
      aria-label={tSubscription('progressRemaining', { remaining })}
    >
      <p className={styles.caption}>{tSubscription('progressRemainingCaption')}</p>
      <p className={styles.metric}>
        <span className={styles.metricValue}>{remaining}</span>
        <span className={styles.metricUnit}>{tSubscription('volumeUnit')}</span>
      </p>
      <p className={styles.ofLimit}>{tSubscription('progressOfLimit', { limit })}</p>

      <div className={styles.track} aria-hidden="true">
        <span className={styles.goal} style={{ width: `${usedPercent}%`, background: GOAL_GREEN }} />
        <span className={styles.remaining} style={{ width: `${remainingPercent}%` }} />
      </div>

      <div className={styles.scale} aria-hidden="true">
        <span>0</span>
        <span>{limit}</span>
      </div>
    </div>
  );
};

export default RemainingVolumeBar;
