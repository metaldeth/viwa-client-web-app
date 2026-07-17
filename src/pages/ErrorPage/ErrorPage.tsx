import { FC } from 'react';
import HorizontalContainer from '../../components/HorizontalContainer';
import { Text } from '@asnefedov/uikit/Text';

/**
 * Страница ошибки
 */
const ErrorPage: FC = () => {
  return (
    <HorizontalContainer isAutoWidth justify="center">
      <Text size="l">Ресурс не найден</Text>
    </HorizontalContainer>
  );
};

export default ErrorPage;
