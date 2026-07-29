import React, { FC, useMemo } from 'react';
import { tSubscription } from '../../locale/subscriptionLocale';
import styles from './VolumeCircle.module.scss';
import { VolumeCircleProps } from './types';

const SIZE = 152;
const STROKE_WIDTH = 16;

const VolumeCircle: FC<VolumeCircleProps> = ({
  consumedVolume,
  limitVolume,
  centerValue,
  ariaLabel,
  percent: percentOverride,
}) => {
  const { radius, circumference, dashOffset, displayValue, percent, valueNow, valueMax } =
    useMemo(() => {
      const r = (SIZE - STROKE_WIDTH) / 2;
      const c = 2 * Math.PI * r;
      const safeLimit = Math.max(limitVolume, 0);
      const safeConsumed = Math.max(consumedVolume, 0);
      const ratio = safeLimit > 0 ? Math.min(safeConsumed / safeLimit, 1) : 0;
      const offset = c * (1 - ratio);
      const remaining = Math.max(0, safeLimit - safeConsumed);
      const computedPercent = percentOverride ?? (safeLimit > 0 ? Math.round(ratio * 100) : 0);

      return {
        radius: r,
        circumference: c,
        dashOffset: offset,
        displayValue: centerValue ?? remaining,
        percent: computedPercent,
        valueNow: Math.round(safeConsumed),
        valueMax: Math.round(safeLimit),
      };
    }, [consumedVolume, limitVolume, centerValue, percentOverride]);

  const label =
    ariaLabel ??
    tSubscription('progressUsed', {
      used: valueNow,
      limit: valueMax,
    });

  return (
    <div
      className={styles.VolumeCircle}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={valueMax}
      aria-valuenow={valueNow}
      aria-label={label}
    >
      <svg
        className={styles.svg}
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-hidden="true"
      >
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          <circle
            className={styles.bg}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
          />
          <circle
            className={styles.progress}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </g>
      </svg>

      <div className={styles.label} aria-hidden="true">
        <span className={styles.value}>{Math.round(displayValue)}</span>
        <span className={styles.unit}>{tSubscription('volumeUnit')}</span>
        <span className={styles.percent}>{percent}%</span>
      </div>
    </div>
  );
};

export default VolumeCircle;
