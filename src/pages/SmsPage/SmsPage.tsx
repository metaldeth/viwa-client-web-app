import { FC, useEffect, useRef, useState } from 'react';
import VerticalContainer from '../../components/VerticalContainer';
import { Text } from '@asnefedov/uikit/Text';
import styles from './SmsPage.module.scss';
import HorizontalContainer from '../../components/HorizontalContainer';
import CodeInputGroup from '../../components/CodeInputGroup/CodeInputGroup';
import classNames from 'classnames';
import ContentCard from '../../components/ContentCard';
import { useNavigate, useParams } from 'react-router-dom';
import { getFormatPhone } from '../../helpers/getFormattedPhone';
import { useTimer } from '../../hooks/useTimer';
import { useAppDispatch } from '../../app/hooks/store';
import { Loader } from '@asnefedov/uikit/Loader';
import { CheckCodeResponse } from '../../types/serverInterface/clientDTO';
import { AnimatePresence, motion } from 'framer-motion';
import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from '../../state/auth/thunk';
import { POST_AUTH_HOME_PATH } from '../../state/auth/navigation';
import {
  buildSmsAuthRelativePath,
  getCodeEntryTitle,
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

  useEffect(() => {
    setChannel(parseOtpChannel(channelParam));
  }, [channelParam]);

  useEffect(() => {
    if (!canRequest) {
      handleStartTimer();
    }
  }, [canRequest]);

  const handleInvalidRequest = () => {
    codeInputGroupInvalidRef.current?.();
  };

  const handleCompleteTimer = () => {
    setCanRequest(true);
  };

  const handleStartTimer = () => {
    start(Number(time), handleCompleteTimer);
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
          navigate(
            buildSmsAuthRelativePath(response.cooldownSeconds, formattedPhone, response.channel),
            { replace: true },
          );
          start(response.cooldownSeconds, handleCompleteTimer);
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

  const renderPhoneNumber = () => (
    <span className={styles.link}>{phone && getFormatPhone(phone, true)}</span>
  );

  const renderInstructionSubtitle = () => {
    if (channel === 'SMS') {
      return (
        <Text className={styles.instructionText} size="m" lineHeight="s" align="center">
          Мы отправили SMS на номер телефона {renderPhoneNumber()}
        </Text>
      );
    }

    return (
      <Text className={styles.instructionText} size="m" lineHeight="s" align="center">
        Мы позвоним на номер телефона {renderPhoneNumber()}
      </Text>
    );
  };

  const renderInstructionsContainer = () => (
    <VerticalContainer isAutoWidth align="center" space="s">
      <Text size="2xl" weight="semibold" lineHeight="xs" align="center">
        {getCodeEntryTitle(channel)}
      </Text>
      {renderInstructionSubtitle()}
    </VerticalContainer>
  );

  const renderCodeEntryContainer = () => (
    <HorizontalContainer>
      <CodeInputGroup
        count={smsCodeLength}
        resetVersion={resetVersion}
        isValid={isValidCode}
        disabled={isLoadRequest}
        onChangeInput={handleChangeCode}
        onComplete={handleCompleteCode}
        onExternalInvalid={(handler) => (codeInputGroupInvalidRef.current = handler)}
      />
    </HorizontalContainer>
  );

  const renderLoader = () => (
    <motion.div
      key="loader"
      style={{ display: 'inherit' }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0, transition: { ease: 'backOut' } }}
      exit={{ opacity: 0, y: -10 }}
    >
      <Loader view="primary" />
    </motion.div>
  );

  const renderResendCodeCard = (id: number, title: string, onClick?: () => void) => (
    <motion.div
      key={id}
      style={{ width: '100%' }}
      initial={{
        opacity: 0,
        y: 10,
        filter: 'blur(10px)',
      }}
      animate={{
        opacity: 1,
        y: 0,
        filter: 'blur(0)',
        transition: { ease: 'backOut' },
      }}
      exit={{
        opacity: 0,
        y: 10,
        filter: 'blur(10px)',
      }}
      whileTap={onClick && { scale: 0.95 }}
      onClick={onClick}
    >
      <ContentCard className={classNames(styles.resendCodeCard, onClick && styles.asButton)}>
        <Text
          className={classNames(styles.text, onClick && styles.asButton)}
          size="xs"
          weight="medium"
        >
          {title}
        </Text>
      </ContentCard>
    </motion.div>
  );

  const renderResendCodeContainer = (canRequest: boolean) => (
    <AnimatePresence mode="wait">
      {canRequest
        ? renderResendCodeCard(0, getResendReadyLabel(channel), handleTryRequestCode)
        : renderResendCodeCard(1, getResendWaitingLabel(currentTime, channel))}
    </AnimatePresence>
  );

  const renderResendError = () =>
    resendError ? (
      <Text size="xs" lineHeight="m" align="center" view="alert">
        {resendError}
      </Text>
    ) : null;

  return (
    <VerticalContainer space="m" isAutoWidth align="center">
      {renderInstructionsContainer()}
      <VerticalContainer space="m" isAutoWidth align="center">
        {renderCodeEntryContainer()}
        <AnimatePresence mode="wait">{isLoadRequest && renderLoader()}</AnimatePresence>
        {renderResendError()}
        {renderResendCodeContainer(canRequest)}
      </VerticalContainer>
    </VerticalContainer>
  );
};

export default SmsPage;
