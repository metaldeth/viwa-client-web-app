import { useParams } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Хук валидации параметров базового пути
 *
 * @returns params - параметры проверки.
 * @returns errors - ошибки валидации.
 * @returns isValid - флаг валидности пути
 */
export const useValidatedBaseParams = <T extends string[]>(
  requiredParams: T,
): {
  params: Record<T[number], string>;
  errors: string[];
  isValid: boolean;
} => {
  const rawParams = useParams();

  return useMemo(() => {
    const errors: string[] = [];
    const validatedParams: Record<string, string> = {};

    requiredParams.forEach((paramName) => {
      const value = rawParams[paramName];

      if (!value) {
        errors.push(`Отсутствует параметр: ${paramName}`);
        return;
      }

      if (!/^\d+$/.test(value)) {
        errors.push(`Параметр ${paramName} должен содержать только цифры`);
        return;
      }

      validatedParams[paramName] = value;
    });

    return {
      params: validatedParams as Record<T[number], string>,
      errors,
      isValid: errors.length === 0,
    };
  }, [rawParams, requiredParams]);
};
