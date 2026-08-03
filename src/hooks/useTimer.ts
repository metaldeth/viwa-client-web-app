import { useCallback, useEffect, useRef, useState } from 'react';

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

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeRef = useRef(0);
  const completeRef = useRef<(() => void) | null>(null);
  const isMountedRef = useRef(true);

  const clearIntervalRef = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    clearIntervalRef();
    completeRef.current = null;
    timeRef.current = 0;

    if (isMountedRef.current) {
      setCurrentTime(0);
      setIsActive(false);
    }
  }, [clearIntervalRef]);

  const start = useCallback(
    (maxTime: number, onComplete?: () => void) => {
      clearIntervalRef();
      completeRef.current = onComplete ?? null;
      timeRef.current = maxTime;

      if (isMountedRef.current) {
        setCurrentTime(maxTime);
        setIsActive(true);
      }

      timerRef.current = setInterval(() => {
        const newTime = timeRef.current - 1;
        timeRef.current = newTime;

        if (isMountedRef.current) {
          setCurrentTime(newTime <= 0 ? 0 : newTime);
        }

        if (newTime <= 0) {
          clearIntervalRef();

          const callback = completeRef.current;
          completeRef.current = null;

          if (isMountedRef.current) {
            setIsActive(false);
          }

          callback?.();
        }
      }, 1000);
    },
    [clearIntervalRef],
  );

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      clearIntervalRef();
      completeRef.current = null;
    };
  }, [clearIntervalRef]);

  return { isActive, currentTime, start, stop };
};
