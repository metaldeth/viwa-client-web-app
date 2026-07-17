import { FC, useCallback, useEffect, useState } from 'react';
import VerticalContainer from '../../components/VerticalContainer';
import { Button } from '@asnefedov/uikit/Button';
import ContentCard from '../../components/ContentCard';
import HorizontalContainer from '../../components/HorizontalContainer';
import { IconArrowRight } from '../../assets/icon/iconArrowRight';
import { Text } from '@asnefedov/uikit/Text';
import styles from './SubscriptionPage.module.scss';
import VolumeCircle from '../../components/VolumeCircle';
import BottomSheetModal from '../../components/BottomSheetModal';
import subscriptionImg from '../../assets/img/subscription.png';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { getClientInfoAction } from '../../state/loyalty/actions';
import { selectClientInfo } from '../../state/loyalty/selectors';
import { IconHeart } from '../../assets/icon/iconHeart';
import { IconBrilliant } from '../../assets/icon/iconBrilliant';
import { IconSparkles } from '../../assets/icon/iconSparkles';
import { IconDoubleDrops } from '../../assets/icon/iconDoubleDrops';
import { QRCodeSVG } from 'qrcode.react';
import { ClientDataType } from '../../types/enums/clientDataType';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { litersFieldToMl } from '../../helpers/litersFieldToMl';
import { api } from '../../app/api';
import type { SubscriptionLevelDTO } from '../../types/subscriptionLevel';

type PayPhase =
  | 'idle'
  | 'loading_levels'
  | 'ready'
  | 'init'
  | 'await_payment'
  | 'await_subscription'
  | 'done'
  | 'error';

/**
 * Подключение подписки (выбор уровня, оплата СБП через billing API)
 */
const SubscriptionPage: FC = () => {
  const dispatch = useAppDispatch();

  const { state: client } = useAppSelector(selectClientInfo());

  const clientId = localStorage.getItem(ClientDataType.CLIENT_TOKEN) || null;
  const isTrial = client?.subscriptionEnd === null;
  const isActiveSubscription = client?.isActiveSubscribe;
  const volumeMl = litersFieldToMl(client?.remainingVolume ?? client?.volume);
  const maxLimitMlFromApi = litersFieldToMl(client?.maxVolume ?? client?.dailyVolumeLimit);
  const maxVolumeMl = maxLimitMlFromApi > 0 ? maxLimitMlFromApi : volumeMl > 0 ? volumeMl : 0;
  const isDailyLimitExhausted =
    volumeMl === 0 && maxLimitMlFromApi > 0 && (isTrial || isActiveSubscription);
  const subscriptionEnd = formatDateDDMMYYYY(client?.subscriptionEnd);
  const qrPayload = client ? `CLIENT_${client.id}` : '';

  const subscriptionBenefits = [
    { icon: <IconDoubleDrops className={styles.icon} />, label: 'До 31 литра спортивных напитков' },
    { icon: <IconSparkles className={styles.icon} />, label: 'Природные витамины' },
    { icon: <IconBrilliant className={styles.icon} />, label: 'Полезные минералы' },
    { icon: <IconHeart className={styles.icon} />, label: 'Без сахара и калорий' },
  ];

  const [levels, setLevels] = useState<SubscriptionLevelDTO[]>([]);
  const [selectedLevelUuid, setSelectedLevelUuid] = useState<string | null>(null);
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  useEffect(() => {
    clientId && dispatch(getClientInfoAction(clientId));
  }, [dispatch, clientId]);

  useEffect(() => {
    if (!client?.organizationId) return;
    let cancelled = false;
    setPayPhase('loading_levels');
    api.loyalty
      .fetchSubscriptionLevels(client.organizationId)
      .then((list) => {
        if (cancelled) return;
        const active = (list || []).filter((l) => !l.isArchive);
        setLevels(active);
        setPayPhase('ready');
      })
      .catch(() => {
        if (!cancelled) {
          setPayPhase('error');
          setPayError('Не удалось загрузить тарифы');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [client?.organizationId]);

  const waitPaymentLoop = useCallback(async (sid: string) => {
    for (;;) {
      const r = await api.billing.longPollPayment(sid);
      if (r.status === 'PAID') return;
      if (r.status === 'FAILED') {
        throw new Error(r.message || 'Оплата не прошла');
      }
    }
  }, []);

  const waitSubscriptionLoop = useCallback(async (sid: string) => {
    for (;;) {
      const r = await api.billing.longPollSubscription(sid);
      if (r.status === 'COMPLETED') return;
      if (r.status === 'FAILED') {
        throw new Error(r.message || 'Не удалось подтвердить абонемент');
      }
    }
  }, []);

  const handlePurchase = useCallback(async () => {
    if (!clientId || !client?.organizationId || !selectedLevelUuid) return;
    setPayError(null);
    setPayPhase('init');
    try {
      const init = await api.billing.initSubscriptionPayment({
        clientId,
        organizationId: client.organizationId,
        subscriptionLevelUuid: selectedLevelUuid,
      });
      setPaymentUrl(init.paymentUrl);
      setPayPhase('await_payment');
      await waitPaymentLoop(init.sessionId);
      setPayPhase('await_subscription');
      await waitSubscriptionLoop(init.sessionId);
      setPayPhase('done');
      dispatch(getClientInfoAction(clientId));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка оплаты';
      setPayError(msg);
      setPayPhase('ready');
    }
  }, [
    clientId,
    client?.organizationId,
    selectedLevelUuid,
    dispatch,
    waitPaymentLoop,
    waitSubscriptionLoop,
  ]);

  const handleScanModalOpen = () => {
    setIsScanModalOpen(true);
  };

  const handleScanModalClose = () => {
    setIsScanModalOpen(false);
  };

  const handleDescriptionModalOpen = () => {
    setIsDescriptionModalOpen(true);
  };

  const handleDescriptionModalClose = () => {
    setIsDescriptionModalOpen(false);
    setPaymentUrl(null);
    setPayError(null);
    if (client?.organizationId) {
      setPayPhase('ready');
    }
  };

  const renderScanSubscriptionCard = () => (
    <ContentCard className={styles.scanSubscriptionCard} onClick={handleScanModalOpen}>
      <VerticalContainer space="m">
        <HorizontalContainer space={0}>
          <Text size="xl" weight="semibold">
            Сканируй абонемент на автомате
          </Text>
          <IconArrowRight size="m" />
        </HorizontalContainer>
        <HorizontalContainer isAutoWidth isAutoSpace>
          <VolumeCircle currentVolume={volumeMl} maxVolume={maxVolumeMl} />
          <div className={styles.qrWhitePad}>
            <QRCodeSVG value={qrPayload} size={133} />
          </div>
        </HorizontalContainer>
        <VerticalContainer space={0}>
          {isDailyLimitExhausted && (
            <Text size="s" weight="medium" align="center">
              Лимит израсходован, обновится завтра
            </Text>
          )}
          <Text size="s" weight="medium" align="center">
            {isTrial
              ? 'Пробный абонемент активен'
              : isActiveSubscription
                ? `Абонемент действует до ${subscriptionEnd}`
                : 'Абонемент не активен'}
          </Text>
        </VerticalContainer>
      </VerticalContainer>
    </ContentCard>
  );

  const renderMakeSubscriptionCard = () => (
    <ContentCard className={styles.makeSubscriptionCard} onClick={handleDescriptionModalOpen}>
      <HorizontalContainer space="xs">
        <VerticalContainer space="l" className={styles.textContainer}>
          <Text size="xl" weight="semibold">
            Оформи выгодный абонемент
          </Text>
          <Text size="m" weight="medium">
            До 31 литра спортивных напитков за 499 ₽/мес
          </Text>
        </VerticalContainer>
        <img src={subscriptionImg} alt="Bottle and fruits" className={styles.img} />
      </HorizontalContainer>
    </ContentCard>
  );

  const renderScanModalBody = () => (
    <VerticalContainer space="l" isAutoWidth align="center">
      <div className={styles.qrWhitePadLarge}>
        <QRCodeSVG value={qrPayload} size={315} />
      </div>
      <VerticalContainer space="s">
        <Text size="xl" weight="medium" align="center">
          Доступно {volumeMl} мл спортивного напитка
        </Text>
        <VerticalContainer space={0}>
          {isDailyLimitExhausted && (
            <Text size="s" weight="medium" align="center">
              Лимит израсходован, обновится завтра
            </Text>
          )}
          {!isTrial && isActiveSubscription && (
            <Text size="s" weight="medium" align="center">
              Абонемент действует до {subscriptionEnd}
            </Text>
          )}
        </VerticalContainer>
      </VerticalContainer>
    </VerticalContainer>
  );

  const renderModalInfo = (icon: JSX.Element, label: string) => (
    <HorizontalContainer space="m">
      <HorizontalContainer className={styles.iconContainer}>{icon}</HorizontalContainer>
      <Text size="m" weight="medium">
        {label}
      </Text>
    </HorizontalContainer>
  );

  const selectedLevel = levels.find((l) => l.uuid === selectedLevelUuid);

  const renderDescriptionModalBody = () => (
    <VerticalContainer space="l">
      <VerticalContainer space="s">
        {subscriptionBenefits.map((item) => renderModalInfo(item.icon, item.label))}
      </VerticalContainer>

      <VerticalContainer space="s">
        <Text size="m" weight="semibold">
          Выберите тариф
        </Text>
        {payPhase === 'loading_levels' && (
          <Text size="m" view="secondary">
            Загрузка…
          </Text>
        )}
        {levels.length === 0 && payPhase === 'ready' && (
          <Text size="m" view="secondary">
            Нет доступных тарифов
          </Text>
        )}
        {levels.map((lvl) => (
          <label key={lvl.uuid} className={styles.levelRow}>
            <input
              type="radio"
              name="level"
              checked={selectedLevelUuid === lvl.uuid}
              onChange={() => setSelectedLevelUuid(lvl.uuid)}
            />
            <Text size="m" weight="medium">
              {lvl.name} — {lvl.price} ₽ / мес
            </Text>
          </label>
        ))}
      </VerticalContainer>

      {paymentUrl && (
        <VerticalContainer space="m" align="center">
          <Text size="m" weight="medium" align="center">
            Оплата СБП
          </Text>
          <div className={styles.qrWhitePad}>
            <QRCodeSVG value={paymentUrl} size={200} />
          </div>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.payLink}>
            Открыть оплату в банке
          </a>
        </VerticalContainer>
      )}

      <VerticalContainer space="2xs">
        <Button
          size="l"
          label={
            payPhase === 'init' || payPhase === 'await_payment' || payPhase === 'await_subscription'
              ? 'Подождите…'
              : 'Оформить'
          }
          disabled={
            !selectedLevelUuid ||
            !clientId ||
            payPhase === 'init' ||
            payPhase === 'await_payment' ||
            payPhase === 'await_subscription' ||
            payPhase === 'loading_levels'
          }
          onClick={() => void handlePurchase()}
        />
        {payPhase === 'await_payment' && (
          <Text size="s" weight="medium" align="center" view="secondary">
            Ожидаем оплату…
          </Text>
        )}
        {payPhase === 'await_subscription' ? (
          <Text size="s" weight="medium" align="center" view="secondary">
            Оплата прошла, подтверждаем абонемент…
          </Text>
        ) : null}
        {payPhase === 'done' && (
          <Text size="m" weight="medium" align="center">
            Абонемент активирован
          </Text>
        )}
        {payError && (
          <Text size="m" weight="medium" align="center" view="alert">
            {payError}
          </Text>
        )}
        <VerticalContainer space="3xs" align="center">
          <Text size="m" weight="medium" view="secondary">
            Лимит 1000 мл в сутки
          </Text>
          {selectedLevel && (
            <Text size="s" weight="medium" align="center" view="secondary">
              Выбрано: {selectedLevel.name}, {selectedLevel.price} ₽/мес
            </Text>
          )}
        </VerticalContainer>
      </VerticalContainer>
    </VerticalContainer>
  );

  const renderScanModal = () => (
    <BottomSheetModal
      isOpen={isScanModalOpen}
      className={styles.ScanSheetModal}
      modalTitle="Сканируй абонемент на автомате"
      onClose={handleScanModalClose}
    >
      {renderScanModalBody()}
    </BottomSheetModal>
  );

  const renderDescriptionModal = () => (
    <BottomSheetModal
      isOpen={isDescriptionModalOpen}
      className={styles.DescriptionSheetModal}
      modalTitle="Получи заряд силы и энергии во время тренировки"
      onClose={handleDescriptionModalClose}
    >
      {renderDescriptionModalBody()}
    </BottomSheetModal>
  );

  return (
    <VerticalContainer space="m" className={styles.SubscriptionPage}>
      {renderScanSubscriptionCard()}
      {renderMakeSubscriptionCard()}
      {renderScanModal()}
      {renderDescriptionModal()}
    </VerticalContainer>
  );
};

export default SubscriptionPage;
