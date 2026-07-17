import { FC, useEffect, useState } from 'react';
import styles from './AuthPage.module.scss';
import VerticalContainer from '../../components/VerticalContainer';
import { Text } from '@asnefedov/uikit/Text';
import { TextField } from '@asnefedov/uikit/TextField';
import { ReactMaskOpts, useIMask } from 'react-imask';
import { PhoneValidation } from './types';
import { Button } from '@asnefedov/uikit/Button';
import { checkPhoneValidation } from './helpers';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks/store';
import { sendCodeToPhoneThunk } from '../../state/auth/thunk';

/**
 * Страница авторизации
 */
const AuthPage: FC = () => {
  const dispatch = useAppDispatch();

  const isOnRequest = true; // Флаг для включения/выключения запроса кода по номеру телефона (предназначено для тестирования)

  const navigate = useNavigate();

  const { ref, unmaskedValue } = useIMask<HTMLInputElement, ReactMaskOpts>({
    mask: '+{7}(000)000-00-00',
  });

  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation>({
    isValid: false,
    message: '',
  });

  useEffect(() => {
    setPhoneValidation(checkPhoneValidation(unmaskedValue));
  }, [unmaskedValue]);

  // Обработчики
  const handleSendCode = () => {
    if (isOnRequest) {
      dispatch(sendCodeToPhoneThunk(unmaskedValue))
        .unwrap()
        .then((response: string) => {
          if (response) {
            navigate(`sms/${response}/${unmaskedValue}`);
          }
        })
        .catch((error: Error) => {
          setPhoneValidation({
            isValid: false,
            message: `Ошибка запроса: ${error.message}`,
          });
        });
    } else {
      navigate(`sms/${10}/${unmaskedValue}`);
    }
  };

  // Рендер методы
  const renderHeader = () => (
    <Text size="2xl" weight="semibold" lineHeight="xs">
      Авторизация
    </Text>
  );

  const renderPhoneTextField = () => (
    <TextField
      view="default"
      width="full"
      size="l"
      label="Введите номер телефона"
      placeholder="+7"
      inputRef={ref}
      type="tel"
      inputMode="tel"
      status={unmaskedValue.length > 0 && !phoneValidation.isValid ? 'alert' : undefined}
      caption={unmaskedValue.length > 0 && !phoneValidation.isValid ? phoneValidation.message : ''}
    />
  );

  const renderUserAgreement = () => (
    <span className={styles.link}>пользовательским соглашением</span>
  );

  const renderPolicyAgreement = () => (
    <span className={styles.link}>политикой конфиденциальности</span>
  );

  const renderAcceptContainer = () => (
    <VerticalContainer isAutoWidth space="2xs">
      <Button
        view={!phoneValidation.isValid ? 'secondary' : 'primary'}
        label="Подтвердить вход"
        width="full"
        size="l"
        disabled={!phoneValidation.isValid}
        onClick={handleSendCode}
      />
      <Text size="xs" lineHeight="m" align="center">
        Нажимая кнопку, вы соглашаетесь с {renderUserAgreement()} и {renderPolicyAgreement()}
      </Text>
    </VerticalContainer>
  );

  return (
    <VerticalContainer space="m" isAutoWidth align="center">
      {renderHeader()}
      {renderPhoneTextField()}
      {renderAcceptContainer()}
    </VerticalContainer>
  );
};

export default AuthPage;
