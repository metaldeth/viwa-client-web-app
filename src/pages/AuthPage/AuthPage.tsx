import { FC, FormEvent, useEffect, useState } from 'react';
import classNames from 'classnames';
import styles from './AuthPage.module.scss';
import CabinetAuthShell from '../../components/CabinetAuthShell';
import { ReactMaskOpts, useIMask } from 'react-imask';
import { PhoneValidation } from './types';
import { checkPhoneValidation } from './helpers';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks/store';
import { sendCodeToPhoneThunk } from '../../state/auth/thunk';
import { buildSmsAuthPath, getSendCodeErrorMessage } from '../../utils/authSendCode';

const AuthPage: FC = () => {
  const dispatch = useAppDispatch();
  const isOnRequest = true;
  const navigate = useNavigate();
  const { machineSerial } = useParams();

  const { ref, unmaskedValue } = useIMask<HTMLInputElement, ReactMaskOpts>({
    mask: '+{7}(000)000-00-00',
  });

  const [phoneValidation, setPhoneValidation] = useState<PhoneValidation>({
    isValid: false,
    message: '',
  });
  const [sendError, setSendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setPhoneValidation(checkPhoneValidation(unmaskedValue));
    setSendError('');
  }, [unmaskedValue]);

  const handleSendCode = () => {
    if (!phoneValidation.isValid || isSubmitting) {
      return;
    }

    if (isOnRequest) {
      setSendError('');
      setIsSubmitting(true);
      dispatch(sendCodeToPhoneThunk(unmaskedValue))
        .unwrap()
        .then((response) => {
          navigate(
            buildSmsAuthPath(
              response.cooldownSeconds,
              unmaskedValue,
              response.channel,
              machineSerial,
            ),
          );
        })
        .catch((error: unknown) => {
          setSendError(getSendCodeErrorMessage(error));
        })
        .finally(() => {
          setIsSubmitting(false);
        });
    } else {
      navigate(buildSmsAuthPath(10, unmaskedValue, 'FLASHCALL', machineSerial));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleSendCode();
  };

  const showValidationError = unmaskedValue.length > 0 && !phoneValidation.isValid;

  return (
    <CabinetAuthShell
      title="Авторизация"
      description="Мы позвоним на указанный номер — введите 4 последние цифры входящего звонка"
    >
      <form className={styles.actions} onSubmit={handleSubmit} noValidate>
        <div className={styles.phoneField}>
          <label className={styles.phoneLabel} htmlFor="auth-phone-input">
            Введите номер телефона
          </label>
          <input
            ref={ref}
            id="auth-phone-input"
            className={classNames(styles.phoneInput, showValidationError && styles.invalid)}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7"
            aria-invalid={showValidationError || undefined}
            aria-describedby={showValidationError ? 'auth-phone-error' : undefined}
          />
          <span
            id="auth-phone-error"
            className={styles.fieldHint}
            role={showValidationError ? 'alert' : undefined}
            aria-live="polite"
          >
            {showValidationError ? phoneValidation.message : '\u00a0'}
          </span>
        </div>

        {sendError ? (
          <p className={styles.errorBanner} role="alert" aria-live="assertive">
            {sendError}
          </p>
        ) : null}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={!phoneValidation.isValid || isSubmitting}
        >
          {isSubmitting ? 'Отправляем…' : 'Подтвердить вход'}
        </button>
      </form>
    </CabinetAuthShell>
  );
};

export default AuthPage;
