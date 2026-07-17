/**
 * Свойства группы кодовых полей
 */
export type CodeInputGroupProps = {
  /**
   * Количество полей
   */
  count: number;
  /**
   * Флаг валидности полей
   */
  isValid?: boolean;
  /**
   * Флаг выключения полей
   */
  disabled?: boolean;
  /**
   * Сигнал на сброс введённого кода.
   * При изменении значения CodeInputGroup очищает поля и фокусит первый инпут.
   */
  resetVersion?: number;
  /**
   * Обработчик ввода кода с параметром длины кода
   */
  onChangeInput?: (codeLength: number) => void;
  /**
   * Обработчик завершения ввода кода
   */
  onComplete: (code: string) => void;
  /**
   * Обработчик внешнего вызова для реализации логики недействительного ввода
   */
  onExternalInvalid?: (internalInvalidHandler: () => void) => void;
};
