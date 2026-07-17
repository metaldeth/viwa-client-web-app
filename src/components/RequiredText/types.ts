import { TextProps } from '@asnefedov/uikit/Text';
import { ReactNode } from 'react';

/**
 * Свойства компонента RequiredText
 */
export type RequiredTextProps = TextProps & {
  /**
   *  параметры текста
   */
  children: ReactNode;
};
