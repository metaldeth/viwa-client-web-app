import { FC } from 'react';
import HorizontalContainer from '../../components/HorizontalContainer';
import { Text } from '@asnefedov/uikit/Text';

type ErrorPageProps = {
  message?: string;
};

const ErrorPage: FC<ErrorPageProps> = ({ message = 'Ресурс не найден' }) => {
  return (
    <HorizontalContainer isAutoWidth justify="center">
      <Text size="l">{message}</Text>
    </HorizontalContainer>
  );
};

export default ErrorPage;
