import React, { ChangeEvent, LegacyRef } from 'react';

/**
 * Свойства кодового поля
 */
export type CodeInputProps = {
  /*
   * Идентификатор поля
   */
  index: number;
  /*
   * Ссылка на поле
   */
  inputRef?: LegacyRef<HTMLInputElement> | undefined;
  /*
   * Значение поля
   */
  value?: string | number;
  /*
   * Флаг валидности поля
   */
  isValid?: boolean;
  /*
   * Флаг выключения поля
   */
  disabled?: boolean;
  /*
   * Обработчик изменения поля
   */
  onChange?: (e: ChangeEvent<HTMLInputElement>, index: number) => void;
  /*
   * Обработчик нажатия клавиши
   */
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, index: number) => void;
};
