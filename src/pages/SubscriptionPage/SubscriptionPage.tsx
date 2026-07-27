import { FC, memo, useCallback, useEffect, useState } from 'react';
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
import { getCurrentClientProfileAction } from '../../state/loyalty/actions';
import { selectClientProfile } from '../../state/loyalty/selectors';
import { IconHeart } from '../../assets/icon/iconHeart';
import { IconBrilliant } from '../../assets/icon/iconBrilliant';
import { IconSparkles } from '../../assets/icon/iconSparkles';
import { IconDoubleDrops } from '../../assets/icon/iconDoubleDrops';
import { QRCodeSVG } from 'qrcode.react';
import { formatDateDDMMYYYY } from '../../helpers/transformDateDDMMYYY';
import { api } from '../../app/api';
import type { SubscriptionLevelDTO } from '../../types/subscriptionLevel';
import { hasAuthTokens } from '../ValidationPage/helpers';
import { useClientSubscriptionWs } from '../../hooks/useClientSubscriptionWs';

type PayPhase =
  | 'idle'
  | 'loading_levels'
  | 'ready'
  | 'init'
  | 'await_payment'
  | 'await_subscription'
  | 'done'
  | 'error';

const formatPriceRub = (priceKopecks: number) => Math.round(priceKopecks / 100);

const LoyaltyQrCode = memo(function LoyaltyQrCode({
  value,
  size,
}: {
  value: string;
  size: number;
}) {
  if (!value) {
    return null;
  }
  return <QRCodeSVG value={value} size={size} />;
});

const SubscriptionPage: FC = () => {
  const dispatch = useAppDispatch();
  const { state: client } = useAppSelector(selectClientProfile());

  const isAuthed = hasAuthTokens();
  useClientSubscriptionWs(isAuthed);
  const isTrial = !client?.tierName && client?.subscriptionEndsAt === null;
  const isActiveSubscription = Boolean(client?.tierName && client?.subscriptionEndsAt);
  // Trial has no daily tier: dailyRemainingMl is always 0 — show volumeMl (trial balance).
  // Subscribed clients show today's remaining daily allowance.
  const dailyLimitMl = client?.dailyLimitMl ?? 0;
  const volumeMl =
    dailyLimitMl > 0
      ? (client?.dailyRemainingMl ?? client?.volumeMl ?? 0)
      : (client?.volumeMl ?? 0);
  const maxVolumeMl = dailyLimitMl > 0 ? dailyLimitMl : volumeMl > 0 ? volumeMl : 0;
  const isDailyLimitExhausted = Boolean(client?.limitExhausted);
  const subscriptionEnd = formatDateDDMMYYYY(client?.subscriptionEndsAt ?? null);
  const qrPayload = client?.qrPayload ?? '';
  const limitResetHint = client?.limitResetsAt
    ? `Лимит израсходован, обновится ${formatDateDDMMYYYY(client.limitResetsAt)}`
    : 'Лимит израсходован, обновится завтра';

  const subscriptionBenefits = [
    { icon: <IconDoubleDrops className={styles.icon} />, label: 'До 31 литра спортивных напитков' },
    { icon: <IconSparkles className={styles.icon} />, label: 'Природные витамины' },
    { icon: <IconBrilliant className={styles.icon} />, label: 'Полезные минералы' },
    { icon: <IconHeart className={styles.icon} />, label: 'Без сахара и калорий' },
  ];

  const [levels, setLevels] = useState<SubscriptionLevelDTO[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const refreshProfile = useCallback(() => {
    if (isAuthed) {
      dispatch(getCurrentClientProfileAction());
    }
  }, [dispatch, isAuthed]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    if (!isAuthed) return;

    let cancelled = false;
    setPayPhase('loading_levels');

    api.loyalty
      .fetchSubscriptionLevels()
      .then((response) => {
        if (cancelled) return;
        const sorted = [...(response.items || [])].sort((a, b) => a.sortOrder - b.sortOrder);
        setLevels(sorted);
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
  }, [isAuthed]);

  const handlePurchase = useCallback(async () => {
    if (!selectedLevelId) return;

    setPayError(null);
    setPayPhase('init');

    try {
      const init = await api.billing.initSubscriptionPayment({
        subscriptionLevelId: selectedLevelId,
        requestUuid: crypto.randomUUID(),
      });

      setPaymentUrl(init.sbpQrUrl);
      setPayPhase('await_payment');
      await api.billing.pollPaymentUntilPaid(init.paymentId);
      setPayPhase('await_subscription');
      await api.billing.pollSubscriptionUntilCompleted(init.paymentId);
      setPayPhase('done');
      dispatch(getCurrentClientProfileAction());
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Ошибка оплаты';
      setPayError(msg);
      setPayPhase('ready');
    }
  }, [selectedLevelId, dispatch]);

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
    setPayPhase('ready');
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
            <LoyaltyQrCode value={qrPayload} size={133} />
          </div>
        </HorizontalContainer>
        <VerticalContainer space={0}>
          {isDailyLimitExhausted && (
            <Text size="s" weight="medium" align="center">
              {limitResetHint}
            </Text>
          )}
          <Text size="s" weight="medium" align="center">
            {isTrial
              ? 'Пробный абонемент активен'
              : isActiveSubscription
                ? `Абонемент «${client?.tierName}» действует до ${subscriptionEnd}`
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
        <LoyaltyQrCode value={qrPayload} size={315} />
      </div>
      <VerticalContainer space="s">
        <Text size="xl" weight="medium" align="center">
          Доступно {volumeMl} мл спортивного напитка
        </Text>
        <VerticalContainer space={0}>
          {isDailyLimitExhausted && (
            <Text size="s" weight="medium" align="center">
              {limitResetHint}
            </Text>
          )}
          {!isTrial && isActiveSubscription && (
            <Text size="s" weight="medium" align="center">
              Абонемент «{client?.tierName}» действует до {subscriptionEnd}
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

  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

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
          <label key={lvl.id} className={styles.levelRow}>
            <input
              type="radio"
              name="level"
              checked={selectedLevelId === lvl.id}
              onChange={() => setSelectedLevelId(lvl.id)}
            />
            <Text size="m" weight="medium">
              {lvl.name} — {formatPriceRub(lvl.priceKopecks)} ₽ / мес
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
            !selectedLevelId ||
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
            Лимит обновляется ежедневно (МСК)
          </Text>
          {selectedLevel && (
            <Text size="s" weight="medium" align="center" view="secondary">
              Выбрано: {selectedLevel.name}, {formatPriceRub(selectedLevel.priceKopecks)} ₽/мес
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
