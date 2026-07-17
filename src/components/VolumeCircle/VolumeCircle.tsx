import React, { FC, useMemo } from 'react';
import styles from './VolumeCircle.module.scss';
import { VolumeCircleProps } from './types';

// Все “настройки” круга — константы внутри компонента
const SIZE = 152; // px
const STROKE_WIDTH = 16; // толщина кольца
const COLOR = '#7c3aed'; // purple

const VolumeCircle: FC<VolumeCircleProps> = ({ currentVolume, maxVolume }) => {
  const { radius, circumference, dashOffset, normalizedValue } = useMemo(() => {
    const r = (SIZE - STROKE_WIDTH) / 2;
    const c = 2 * Math.PI * r;

    const ratio = maxVolume > 0 ? Math.min(currentVolume / maxVolume, 1) : 0;
    const offset = c * (1 - ratio);

    return {
      radius: r,
      circumference: c,
      dashOffset: offset,
      normalizedValue: Math.round(currentVolume),
    };
  }, [currentVolume, maxVolume]);

  return (
    <div className={styles.VolumeCircle} style={{ width: SIZE, height: SIZE }}>
      <svg className={styles.svg} width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`}>
        <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>
          {/* фон (серый круг) */}
          <circle
            className={styles.bg}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
          />

          {/* активная часть */}
          <circle
            className={styles.progress}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={radius}
            strokeWidth={STROKE_WIDTH}
            stroke={COLOR}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </g>
      </svg>

      <div className={styles.label}>
        <span className={styles.value}>{normalizedValue}</span>
        <span className={styles.unit}>МЛ</span>
      </div>
    </div>
  );
};

export default VolumeCircle;
