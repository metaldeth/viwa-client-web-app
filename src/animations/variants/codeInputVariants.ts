import { TargetAndTransition } from 'motion';

/**
 * Анимация тряски
 */
export const shakeCodeInput: TargetAndTransition = {
  x: [-5, 0],
  rotateZ: [-5, 0],
  transition: {
    type: 'spring',
    stiffness: 500,
    damping: 5,
  },
};

/**
 * Анимация подсветки
 */
export const highlightCodeInput: TargetAndTransition = {
  background: ['#ff1f26', '#ffd5d7'],
  transition: {
    duration: 0.5,
    ease: 'easeInOut',
  },
};

/**
 * Исходное состояние элемента
 */
export const initialCodeInput: TargetAndTransition = {
  filter: 'blur(100px)',
  opacity: 0,
  y: -10,
  scale: 0,
};

/**
 * Состояние отображения элемента
 */
export const visibleCodeInput = (index: number): TargetAndTransition => ({
  opacity: 1,
  y: 0,
  scale: 1,
  filter: 'blur(0px)',
  transition: {
    duration: 1,
    delay: index * 0.05,
    type: 'spring' as const,
  },
});
