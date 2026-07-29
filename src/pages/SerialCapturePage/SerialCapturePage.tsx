import { FC, FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import VerticalContainer from '../../components/VerticalContainer';
import { Text } from '@asnefedov/uikit/Text';
import { TextField } from '@asnefedov/uikit/TextField';
import { Button } from '@asnefedov/uikit/Button';
import { api } from '../../app/api';
import { persistLandingContext } from '../../utils/landingEntry';
import { markMachineSerialValidated } from '../../utils/machineSerialValidationCache';
import { isMachineSerialFormatValid } from '../ValidationPage/machineSerialValidation';
import styles from './SerialCapturePage.module.scss';

const SerialCapturePage: FC = () => {
  const navigate = useNavigate();
  const [serial, setSerial] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const normalizedSerial = serial.trim();

    if (!isMachineSerialFormatValid(normalizedSerial)) {
      setErrorMessage('Некорректный серийный номер автомата');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await api.publicApi.fetchMachineBySerial(normalizedSerial);
      persistLandingContext({ serial: normalizedSerial });
      markMachineSerialValidated(normalizedSerial);
      navigate(`/m/${encodeURIComponent(normalizedSerial)}/auth`, { replace: true });
    } catch (error: unknown) {
      const apiError = error as { code?: string; message?: string };

      if (apiError.code === '404') {
        setErrorMessage('Автомат с таким серийным номером не найден');
      } else {
        setErrorMessage(apiError.message || 'Не удалось проверить автомат');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <VerticalContainer space="m" isAutoWidth align="center" className={styles.container}>
      <Text size="2xl" weight="semibold" lineHeight="xs" align="center">
        Введите номер автомата
      </Text>
      <Text size="m" lineHeight="s" align="center">
        Отсканируйте QR на станции или введите номер VIWA-XXXXXX
      </Text>

      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          view="default"
          width="full"
          size="l"
          label="Серийный номер"
          placeholder="VIWA-000004"
          value={serial}
          onChange={(value) => {
            setSerial(value ?? '');
            if (errorMessage) {
              setErrorMessage('');
            }
          }}
          status={errorMessage ? 'alert' : undefined}
          caption={errorMessage}
          disabled={isSubmitting}
        />

        <Button
          view="primary"
          label="Продолжить"
          width="full"
          size="l"
          type="submit"
          loading={isSubmitting}
          disabled={!serial.trim() || isSubmitting}
        />
      </form>
    </VerticalContainer>
  );
};

export default SerialCapturePage;
