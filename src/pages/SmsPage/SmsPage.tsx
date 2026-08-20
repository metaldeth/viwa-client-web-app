import { FC, useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import styles from './SmsPage.module.scss';
import CabinetAuthShell from '../../components/CabinetAuthShell';
import CodeInputGroup from '../../components/CodeInputGroup/CodeInputGroup';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getFormatPhone } from '../../helpers/getFormattedPhone';
import { useTimer } from '../../hooks/useTimer';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { selectSendCodeToPhone } from '../../state/auth/selectors';
import { Loader } from '@asnefedov/uikit/Loader';
import { CheckCodeResponse } from '../../types/serverInterface/clientDTO';
import { AnimatePresence, motion } from 'framer-motion';
import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from '../../state/auth/thunk';
import { POST_AUTH_HOME_PATH } from '../../state/auth/navigation';
import {
  buildSmsAuthPath,
  getCodeEntryTitle,
  getFlashcallFallbackHint,
  getResendReadyLabel,
  getResendWaitingLabel,
  getSendCodeErrorMessage,
  OtpChannel,
  parseOtpChannel,
  parseSendCodeApiError,
} from '../../utils/authSendCode';

const smsCodeLength = 4;

const SmsPage: FC = () => {
  const dispatch = useAppDispatch();

  const { machineSerial, time, phone, channel: channelParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const sendCodeState = useAppSelector(selectSendCodeToPhone());
  const optimisticSend = Boolean(
    (location.state as { optimisticSend?: boolean } | null)?.optimisticSend,
  );

  const [channel, setChannel] = useState<OtpChannel>(() => parseOtpChannel(channelParam));
  const [canRequest, setCanRequest] = useState(false);
  const [isLoadRequest, setIsLoadRequest] = useState(false);
  const [isValidCode, setIsValidCode] = useState(true);
  const [resetVersion, setResetVersion] = useState(0);
  const [resendError, setResendError] = useState('');

  const codeInputGroupInvalidRef = useRef<() => void>();

  const { currentTime, start } = useTimer();

  const formattedPhone = String(phone);
  const isOnRequest = true;
  const isValidRequest = true;

  const channelEyebrow = channel === 'SMS' ? 'SMS' : 'ЗВОНОК';

  useEffect(() => {
    setChannel(parseOtpChannel(channelParam));
  }, [channelParam]);

  const handleCompleteTimer = useCallback(() => {
    setCanRequest(true);
  }, []);

  const handleStartTimer = useCallback(() => {
    start(Number(time), handleCompleteTimer);
  }, [start, time, handleCompleteTimer]);

  useEffect(() => {
    if (!optimisticSend || sendCodeState.isLoading) {
      return;
    }

    if (sendCodeState.isReject) {
      setResendError(getSendCodeErrorMessage(sendCodeState.lastError));
      return;
    }

    const result = sendCodeState.lastResult;
    if (!result || !phone) {
      return;
    }

    setResendError('');
    setChannel(result.channel);
    start(result.cooldownSeconds, handleCompleteTimer);

    const nextPath = buildSmsAuthPath(result.cooldownSeconds, phone, result.channel, machineSerial);
    if (location.pathname !== nextPath) {
      navigate(nextPath, { replace: true, state: location.state });
    }
  }, [
    handleCompleteTimer,
    location.pathname,
    location.state,
    machineSerial,
    navigate,
    optimisticSend,
    phone,
    sendCodeState.isLoading,
    sendCodeState.isReject,
    sendCodeState.lastError,
    sendCodeState.lastResult,
    start,
  ]);

  useEffect(() => {
    if (!canRequest) {
      handleStartTimer();
    }
  }, [canRequest, handleStartTimer]);

  const handleInvalidRequest = () => {
    codeInputGroupInvalidRef.current?.();
  };

  const handleChangeCode = (codeLength: number) => {
    if (codeLength <= smsCodeLength) {
      setIsValidCode(true);
    }
  };

  const handleCompleteCode = (code: string) => {
    setIsLoadRequest(true);

    if (isOnRequest) {
      dispatch(
        checkCodeAndCreateClientThunk({
          phoneNumber: formattedPhone,
          code,
          machineSerial,
        }),
      )
        .unwrap()
        .then((response: CheckCodeResponse) => {
          if (response?.accessToken) {
            setIsValidCode(true);
            navigate(POST_AUTH_HOME_PATH, { replace: true });
          } else {
            setIsValidCode(false);
          }

          setIsLoadRequest(false);
        })
        .catch(() => {
          setIsValidCode(false);
          setIsLoadRequest(false);
        });
    } else {
      setTimeout(() => {
        if (isValidRequest) {
          setIsValidCode(true);
          navigate(POST_AUTH_HOME_PATH, { replace: true });
        } else {
          setIsValidCode(false);
          handleInvalidRequest();
        }

        setIsLoadRequest(false);
      }, 3000);
    }
  };

  const handleTryRequestCode = () => {
    setCanRequest(false);
    setIsValidCode(true);
    setResendError('');
    setResetVersion((v) => v + 1);

    if (isOnRequest) {
      dispatch(sendCodeToPhoneThunk(formattedPhone))
        .unwrap()
        .then((response) => {
          setChannel(response.channel);
          start(response.cooldownSeconds, handleCompleteTimer);
          navigate(
            buildSmsAuthPath(
              response.cooldownSeconds,
              formattedPhone,
              response.channel,
              machineSerial,
            ),
            { replace: true },
          );
        })
        .catch((error: unknown) => {
          const parsed = parseSendCodeApiError(error);
          setResendError(getSendCodeErrorMessage(error));

          if (parsed.retryAfterSeconds != null && parsed.retryAfterSeconds > 0) {
            start(parsed.retryAfterSeconds, handleCompleteTimer);
            setCanRequest(false);
            return;
          }

          setCanRequest(true);
        });
    }
  };

  const renderDescription = () => {
    const formatted = phone ? getFormatPhone(phone, true) : '';

    if (channel === 'SMS') {
      return (
        <>
          Мы отправили SMS на номер <span className={styles.phoneHighlight}>{formatted}</span>
        </>
      );
    }

    return (
      <>
        Ответить не нужно — введите последние 4 цифры номера входящего звонка на{' '}
        <span className={styles.phoneHighlight}>{formatted}</span>
      </>
    );
  };

  const resendLabel = canRequest
    ? getResendReadyLabel(channel)
    : getResendWaitingLabel(currentTime, channel);

  return (
    <CabinetAuthShell
      eyebrow={channelEyebrow}
      title={getCodeEntryTitle(channel)}
      description={renderDescription()}
      mainLayout="scroll"
    >
      <div className={styles.codeSection}>
        <CodeInputGroup
          count={smsCodeLength}
          resetVersion={resetVersion}
          isValid={isValidCode}
          disabled={isLoadRequest}
          onChangeInput={handleChangeCode}
          onComplete={handleCompleteCode}
          onExternalInvalid={(handler) => (codeInputGroupInvalidRef.current = handler)}
        />

        <div className={styles.statusRow} aria-live="polite" aria-busy={isLoadRequest}>
          <AnimatePresence mode="wait">
            {isLoadRequest ? (
              <motion.div
                key="loader"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <Loader view="primary" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        {!isValidCode ? (
          <p className={styles.errorBanner} role="alert" aria-live="assertive">
            Неверный код. Проверьте цифры и попробуйте снова.
          </p>
        ) : null}

        {resendError ? (
          <p className={styles.errorBanner} role="alert" aria-live="assertive">
            {resendError}
          </p>
        ) : null}

        <div className={styles.resendBlock}>
          {channel === 'FLASHCALL' ? (
            <p className={styles.resendHint}>{getFlashcallFallbackHint()}</p>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={canRequest ? 'ready' : 'waiting'}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                className={classNames(
                  styles.resendButton,
                  !canRequest && styles.resendButtonWaiting,
                )}
                onClick={canRequest ? handleTryRequestCode : undefined}
                disabled={!canRequest}
                aria-live="polite"
              >
                {resendLabel}
              </button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </CabinetAuthShell>
  );
};

export default SmsPage;
