import { ReactNode } from 'react';

export type BottomSheetModalProps = {
  /**
   * Флаг открытия модального окна
   */
  isOpen?: boolean;
  /**
   * Заголовок модального окна
   */
  modalTitle?: string;
  /**
   * Контент модального окна
   */
  children?: ReactNode;
  /**
   * Внешний класс
   */
  className?: string;
  /**
   * Обработчик закрытия модального окна
   */
  onClose?: () => void;
};
