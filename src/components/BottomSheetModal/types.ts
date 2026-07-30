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
   * Класс строки заголовка
   */
  headerClassName?: string;
  /**
   * Класс текста заголовка
   */
  titleClassName?: string;
  /**
   * Класс кнопки закрытия
   */
  closeButtonClassName?: string;
  /**
   * Кастомный заголовок (если задан — стандартный header не рендерится)
   */
  renderHeader?: () => ReactNode;
  /**
   * Класс корневого контейнера Modal (оверлей + позиционирование)
   */
  rootClassName?: string;
  /**
   * Обработчик закрытия модального окна
   */
  onClose?: () => void;
};
