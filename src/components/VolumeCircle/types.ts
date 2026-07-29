/**
 * Свойства компонента VolumeCircle
 */
export type VolumeCircleProps = {
  /** Consumed volume for progress ring (monthlyUsedMl or trial used) */
  consumedVolume: number;
  /** Limit volume (monthlyLimitMl or trial allowance) */
  limitVolume: number;
  /** Value shown in the center (defaults to remaining = limit - consumed) */
  centerValue?: number;
  /** Accessible label for the progress ring */
  ariaLabel?: string;
  /** Optional percent override for aria (0–100) */
  percent?: number;
};
