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
import { CreateClientDto, CreateClientRes } from '../../types/serverInterface/clientDTO';
import { ClientDataType } from '../../types/enums/clientDataType';
import { AnimatePresence, motion } from 'framer-motion';
import { checkCodeAndCreateClientThunk, sendCodeToPhoneThunk } from '../../state/auth/thunk';

const smsCodeLength = 4;

/**
 * Страница отправки смс кода
 */
const SmsPage: FC = () => {
  const dispatch = useAppDispatch();

  const { orgId, sportId, machineId, time, phone } = useParams();
  const navigate = useNavigate();

  const [canRequest, setCanRequest] = useState(false);
  const [isLoadRequest, setIsLoadRequest] = useState(false);
  const [isValidCode, setIsValidCode] = useState(true);
  const [resetVersion, setResetVersion] = useState(0);

  const codeInputGroupInvalidRef = useRef<() => void>();

  const { currentTime, start } = useTimer();

  const formattedOrgId = Number(orgId);
  const formattedSportId = String(sportId);
  const formattedMachineId = Number(machineId);
  const formattedPhone = String(phone);

  // TODO: В дальнейшем лучше добавить провайдер через контекст для приложения, где можно будет добавить состояние isDebug
  const isOnRequest = true; // Флаг для включения/выключения запроса токена (предназначено для тестирования)
  const isValidRequest = true; // Флаг для включения/выключения валидности запроса (предназначено для тестирования)

  useEffect(() => {
    if (!canRequest) {
      handleStartTimer();
    }
  }, [canRequest]);

  // Обработчики
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
      // Логика запроса
      const data: CreateClientDto = {
        organizationId: formattedOrgId,
        sportNetId: formattedSportId,
        machineId: formattedMachineId,
      };

      dispatch(
        checkCodeAndCreateClientThunk({ phoneNumber: formattedPhone, code: code, data: data }),
      )
        .unwrap()
        .then((response: CreateClientRes) => {
          if (response && response.clientId) {
            setIsValidCode(true);

            localStorage.setItem(ClientDataType.CLIENT_TOKEN, response.clientId);

            // Логика навигации на домашнюю страницу
            navigate('../home');
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
      // Логика эмуляции запроса
      setTimeout(() => {
        if (isValidRequest) {
          setIsValidCode(true);
          // Логика навигации на домашнюю страницу
          navigate('../home');
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
    setResetVersion((v) => v + 1);

    if (isOnRequest) dispatch(sendCodeToPhoneThunk(formattedPhone));
  };

  // Рендер методы
  const renderPhoneNumber = () => (
    <span className={styles.link}>{phone && getFormatPhone(phone, true)}</span>
  );

  const renderInstructionsContainer = () => (
    <VerticalContainer isAutoWidth align="center" space="s">
      <Text size="2xl" weight="semibold" lineHeight="xs" align="center">
        Введите 4 последние цифры входящего звонка
      </Text>
      <Text className={styles.instructionText} size="m" lineHeight="s" align="center">
        Мы позвоним на номер телефона {renderPhoneNumber()}
      </Text>
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
        ? renderResendCodeCard(0, 'Запросить код повторно', handleTryRequestCode)
        : renderResendCodeCard(1, `Запросить звонок повторно через ${currentTime} секунд`)}
    </AnimatePresence>
  );

  return (
    <VerticalContainer space="m" isAutoWidth align="center">
      {renderInstructionsContainer()}
      <VerticalContainer space="m" isAutoWidth align="center">
        {renderCodeEntryContainer()}
        <AnimatePresence mode="wait">{isLoadRequest && renderLoader()}</AnimatePresence>
        {renderResendCodeContainer(canRequest)}
      </VerticalContainer>
    </VerticalContainer>
  );
};

export default SmsPage;
