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
import { buildSmsAuthRelativePath, getSendCodeErrorMessage } from '../../utils/authSendCode';

const AuthPage: FC = () => {
  const dispatch = useAppDispatch();
  const isOnRequest = true;
  const navigate = useNavigate();

  const { ref, unmaskedValue } = useIMask<HTMLInputElement, ReactMaskOpts>({
    mask: '+{7}(000)000-00-00',
  });

  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation>({
    isValid: false,
    message: '',
  });
  const [sendError, setSendError] = useState('');

  useEffect(() => {
    setPhoneValidation(checkPhoneValidation(unmaskedValue));
    setSendError('');
  }, [unmaskedValue]);

  const handleSendCode = () => {
    if (isOnRequest) {
      setSendError('');
      dispatch(sendCodeToPhoneThunk(unmaskedValue))
        .unwrap()
        .then((response) => {
          navigate(
            buildSmsAuthRelativePath(response.cooldownSeconds, unmaskedValue, response.channel),
          );
        })
        .catch((error: unknown) => {
          setSendError(getSendCodeErrorMessage(error));
        });
    } else {
      navigate(buildSmsAuthRelativePath(10, unmaskedValue, 'FLASHCALL'));
    }
  };

  const renderHeader = () => (
    <Text size="2xl" weight="semibold" lineHeight="xs">
      Авторизация
    </Text>
  );

  const renderDeliveryHint = () => (
    <Text className={styles.instructionText} size="m" lineHeight="s" align="center">
      Мы позвоним на указанный номер — введите 4 последние цифры входящего звонка
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
      {renderDeliveryHint()}
      {renderPhoneTextField()}
      {sendError ? (
        <Text size="xs" lineHeight="m" align="center" view="alert">
          {sendError}
        </Text>
      ) : null}
      {renderAcceptContainer()}
    </VerticalContainer>
  );
};

export default AuthPage;
