import { useRef, useState } from 'react';

/**
 * Хук таймера
 *
 * @returns {boolean} isActive - Флаг активного состояния таймера.
 * @returns {number} currentTime - Текущее время.
 * @returns {void} start - Функция запуска таймера с установкой максимального времени и обработчика завершения таймера
 * @returns {void} stop - Функция остановки таймера
 */
export const useTimer = () => {
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const completeRef = useRef<() => void | null>(() => {});

  const clear = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    setCurrentTime(0);
    setIsActive(false);

    completeRef.current();
    completeRef.current = () => null;
  };

  const start = (maxTime: number, onComplete?: () => void) => {
    clear();

    if (onComplete) {
      completeRef.current = onComplete;
    }

    setCurrentTime(maxTime);

    setIsActive(true);

    timerRef.current = setInterval(() => {
      setCurrentTime((prev) => {
        const newTime = prev - 1;

        if (newTime <= 0) {
          clear();
        }

        return newTime;
      });
    }, 1000);
  };

  const stop = () => {
    clear();
  };

  return { isActive, currentTime, start, stop };
};
