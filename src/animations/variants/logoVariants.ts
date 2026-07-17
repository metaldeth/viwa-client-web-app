import { TargetAndTransition } from 'motion';

/**
 * Начальное состояние
 */
export const initialLogo: TargetAndTransition = {
  scale: 0,
  filter: 'blur(100px)',
  width: '100%',
};

/**
 * Анимация появления
 */
export const visibleLogo: TargetAndTransition = {
  scale: 1,
  filter: 'blur(0px)',
  width: 'auto',
  transition: { duration: 0.8, ease: 'backInOut' },
};
