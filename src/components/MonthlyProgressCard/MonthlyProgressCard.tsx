import { FC, useId, useMemo } from 'react';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { tSubscription } from '../../locale/subscriptionLocale';
import type { MonthlyProgress } from '../../utils/monthlyProgress';
import styles from './MonthlyProgressCard.module.scss';

export type MonthlyProgressCardProps = {
  progress: MonthlyProgress;
  /** ISO end date of the current plan; null for trial / no plan. */
  subscriptionEndsAt?: string | null;
};

/** Horseshoe gauge: ~270° arc with opening at the bottom (not a semicircle). */
const GAUGE_WIDTH = 300;
const GAUGE_HEIGHT = 250;
const CENTER_X = GAUGE_WIDTH / 2;
const CENTER_Y = 128;
const SWEEP_DEG = 270;
const START_DEG = 225;
const END_DEG = 315;
const STROKE_WIDTH = 16;
const RADIUS = 102;
const TICK_OUTER = RADIUS + 18;
const TICK_INNER_MAJOR = RADIUS + 6;
const TICK_INNER_MINOR = RADIUS + 10;
const MAJOR_EVERY = 5;
const TICK_COUNT = 49;

/** Goal progress (used) — mint from brand palette. */
const GOAL_GREEN = '#A6FFE0';

function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function polar(cx: number, cy: number, r: number, deg: number): { x: number; y: number } {
  const rad = degToRad(deg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy - r * Math.sin(rad),
  };
}

function buildHorseshoePath(cx: number, cy: number, r: number): string {
  const start = polar(cx, cy, r, START_DEG);
  const end = polar(cx, cy, r, END_DEG);
  // large-arc=1, sweep=1 (clockwise in SVG) → 270° over the TOP (opening at bottom)
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r} ${r} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
}

const ARC_PATH = buildHorseshoePath(CENTER_X, CENTER_Y, RADIUS);
const ARC_LENGTH = (SWEEP_DEG / 360) * 2 * Math.PI * RADIUS;

type Tick = { x1: number; y1: number; x2: number; y2: number; major: boolean };

function buildTicks(): Tick[] {
  const ticks: Tick[] = [];
  for (let i = 0; i < TICK_COUNT; i += 1) {
    const t = i / (TICK_COUNT - 1);
    const deg = START_DEG - t * SWEEP_DEG;
    const major = i % MAJOR_EVERY === 0;
    const inner = major ? TICK_INNER_MAJOR : TICK_INNER_MINOR;
    const pOuter = polar(CENTER_X, CENTER_Y, TICK_OUTER, deg);
    const pInner = polar(CENTER_X, CENTER_Y, inner, deg);
    ticks.push({
      x1: pOuter.x,
      y1: pOuter.y,
      x2: pInner.x,
      y2: pInner.y,
      major,
    });
  }
  return ticks;
}

const TICKS = buildTicks();
const LABEL_0 = polar(CENTER_X, CENTER_Y, TICK_OUTER + 14, START_DEG);
const LABEL_MAX = polar(CENTER_X, CENTER_Y, TICK_OUTER + 14, END_DEG);

const MonthlyProgressCard: FC<MonthlyProgressCardProps> = ({
  progress,
  subscriptionEndsAt = null,
}) => {
  const gradientId = useId().replace(/:/g, '');

  const { remainingMl, limitMl, usedLength, remainingLength, remainingLabel } = useMemo(() => {
    const safeLimit = Math.max(progress.limitMl, 0);
    const safeRemaining = Math.max(0, Math.min(progress.remainingMl, safeLimit));
    const safeUsed = Math.max(0, safeLimit - safeRemaining);
    const usedRatio = safeLimit > 0 ? safeUsed / safeLimit : 0;
    const remainingRatio = safeLimit > 0 ? safeRemaining / safeLimit : 0;

    return {
      remainingMl: Math.round(safeRemaining),
      limitMl: Math.round(safeLimit),
      usedLength: usedRatio * ARC_LENGTH,
      remainingLength: remainingRatio * ARC_LENGTH,
      remainingLabel: tSubscription('progressMetricRemaining', {
        remaining: Math.round(safeRemaining),
      }),
    };
  }, [progress.limitMl, progress.remainingMl]);

  const validityText = useMemo(() => {
    const formatted = formatDateDDMMYYYY(subscriptionEndsAt);
    if (formatted) {
      return tSubscription('progressValidUntil', { date: formatted });
    }
    if (progress.isTrial) {
      return tSubscription('progressTrial');
    }
    return null;
  }, [subscriptionEndsAt, progress.isTrial]);

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
              <stop offset="0%" stopColor="#7F5AF0" />
              <stop offset="55%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#00E5FF" />
            </linearGradient>
          </defs>

          <g className={styles.tickRing}>
            {TICKS.map((tick, index) => (
              <line
                key={`tick-${index}`}
                x1={tick.x1}
                y1={tick.y1}
                x2={tick.x2}
                y2={tick.y2}
                className={tick.major ? styles.tickMajor : styles.tickMinor}
              />
            ))}
          </g>

          <path className={styles.gaugeTrack} d={ARC_PATH} strokeWidth={STROKE_WIDTH} />

          {/* Right: remaining balance (purple → cyan), after the green bite */}
          <path
            className={styles.gaugeRemaining}
            d={ARC_PATH}
            strokeWidth={STROKE_WIDTH}
            stroke={`url(#${gradientId})`}
            strokeDasharray={`${Math.max(remainingLength, 0)} ${ARC_LENGTH}`}
            strokeDashoffset={-usedLength}
          />

          {/* Left: goal progress “bite” in mint green #A6FFE0 */}
          <path
            className={styles.gaugeGoal}
            d={ARC_PATH}
            strokeWidth={STROKE_WIDTH}
            stroke={GOAL_GREEN}
            strokeDasharray={`${Math.max(usedLength, 0)} ${ARC_LENGTH}`}
          />

          <text
            className={styles.scaleText}
            x={LABEL_0.x}
            y={LABEL_0.y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            0
          </text>
          <text
            className={styles.scaleText}
            x={LABEL_MAX.x}
            y={LABEL_MAX.y}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {limitMl}
          </text>
        </svg>

        <div className={styles.center} aria-hidden="true">
          <p className={styles.remainingCaption}>{tSubscription('progressRemainingCaption')}</p>
          <p className={styles.metric} aria-label={remainingLabel}>
            <span className={styles.metricValue}>{remainingMl}</span>
            <span className={styles.metricUnit}>{tSubscription('volumeUnit')}</span>
          </p>
          <p className={styles.ofLimit}>{tSubscription('progressOfLimit', { limit: limitMl })}</p>
        </div>
      </div>

      {validityText ? <p className={styles.validityLine}>{validityText}</p> : null}
    </section>
  );
};

export default MonthlyProgressCard;
