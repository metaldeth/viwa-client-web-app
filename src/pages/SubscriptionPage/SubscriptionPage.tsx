import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@asnefedov/uikit/Button';
import HorizontalContainer from '../../components/HorizontalContainer';
import VerticalContainer from '../../components/VerticalContainer';
import { Text } from '@asnefedov/uikit/Text';
import styles from './SubscriptionPage.module.scss';
import BottomSheetModal from '../../components/BottomSheetModal';
import BottomNav from '../../components/BottomNav';
import CabinetHeader from '../../components/CabinetHeader';
import MonthlyProgressCard from '../../components/MonthlyProgressCard';
import QrPromoCard from '../../components/QrPromoCard';
import FavoriteTastesRow from '../../components/FavoriteTastesRow';
import PlanSummaryCard from '../../components/PlanSummaryCard';
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
import { formatLitersFromMl, formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import { resolveMonthlyProgress, isTrialProfile } from '../../utils/monthlyProgress';
import { resolvePlanSummaryDisplay } from '../../utils/planSummary';
import { getLogoImagePaths } from '../../utils/viwaAssets';
import {
  isActiveSubscriptionProfile,
  isExpiredSubscriptionProfile,
} from '../../utils/subscriptionStatus';

type PayPhase =
  | 'idle'
  | 'loading_levels'
  | 'ready'
  | 'init'
  | 'await_payment'
  | 'await_subscription'
  | 'done'
  | 'error';

const LoyaltyQrCode = memo(function LoyaltyQrCode({
  value,
  size,
  label,
}: {
  value: string;
  size: number;
  label: string;
}) {
  const logo = getLogoImagePaths();

  if (!value) {
    return null;
  }

  return (
    <div role="img" aria-label={label}>
      <QRCodeSVG
        value={value}
        size={size}
        level="H"
        aria-hidden="true"
        imageSettings={{
          src: logo.png,
          height: Math.round(size * 0.16),
          width: Math.round(size * 0.16),
          excavate: true,
        }}
      />
    </div>
  );
});

function tierVolumeMl(level: SubscriptionLevelDTO): number {
  return level.monthlyVolumeMl ?? level.dailyVolumeMl ?? 0;
}

const SubscriptionPage: FC = () => {
  const dispatch = useAppDispatch();
  const { state: client, isReject } = useAppSelector(selectClientProfile());

  const isAuthed = hasAuthTokens();
  useClientSubscriptionWs(isAuthed);

  const monthlyProgress = useMemo(() => resolveMonthlyProgress(client), [client]);
  const isTrial = isTrialProfile(client);
  const isActiveSubscription = isActiveSubscriptionProfile(client);
  const isExpiredSubscription = isExpiredSubscriptionProfile(client);
  const subscriptionEnd = formatDateDDMMYYYY(client?.subscriptionEndsAt ?? null) ?? '';
  const qrPayload = client?.qrPayload ?? '';
  const favoriteKeys = client?.favoriteTasteKeys ?? [];

  const statusText = isTrial
    ? tSubscription('progressTrial')
    : isExpiredSubscription
      ? tSubscription('progressExpired', { date: subscriptionEnd })
      : isActiveSubscription
        ? tSubscription('progressActive', { tier: client?.tierName ?? '', date: subscriptionEnd })
        : tSubscription('progressInactive');

  const subscriptionBenefits = useMemo(
    () => [
      {
        icon: <IconDoubleDrops className={styles.icon} />,
        label: tSubscription('benefitVolume', { liters: '12–18' }),
      },
      { icon: <IconSparkles className={styles.icon} />, label: tSubscription('benefitVitamins') },
      { icon: <IconBrilliant className={styles.icon} />, label: tSubscription('benefitMinerals') },
      { icon: <IconHeart className={styles.icon} />, label: tSubscription('benefitSugarFree') },
    ],
    [],
  );

  const [levels, setLevels] = useState<SubscriptionLevelDTO[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  const planSummary = useMemo(() => resolvePlanSummaryDisplay(client, levels), [client, levels]);

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
          setPayError(tSubscription('planError'));
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
      const msg = e instanceof Error ? e.message : tSubscription('planError');
      setPayError(msg);
      setPayPhase('ready');
    }
  }, [selectedLevelId, dispatch]);

  const openSubscribeModal = useCallback(
    (levelId?: string | null) => {
      const nextLevelId = levelId ?? planSummary?.levelId ?? levels[0]?.id ?? null;
      if (nextLevelId) {
        setSelectedLevelId(nextLevelId);
      }
      setIsDescriptionModalOpen(true);
    },
    [levels, planSummary?.levelId],
  );

  const handleDescriptionModalClose = () => {
    setIsDescriptionModalOpen(false);
    setPaymentUrl(null);
    setPayError(null);
    setPayPhase('ready');
  };

  const selectedLevel = levels.find((l) => l.id === selectedLevelId);

  const renderModalInfo = (icon: JSX.Element, label: string) => (
    <HorizontalContainer space="m">
      <HorizontalContainer className={styles.iconContainer}>{icon}</HorizontalContainer>
      <Text size="m" weight="medium">
        {label}
      </Text>
    </HorizontalContainer>
  );

  const renderDescriptionModalBody = () => (
    <VerticalContainer space="l">
      <VerticalContainer space="s">
        {subscriptionBenefits.map((item) => renderModalInfo(item.icon, item.label))}
      </VerticalContainer>

      <VerticalContainer space="s">
        <Text size="m" weight="semibold">
          {tSubscription('planSelect')}
        </Text>
        {payPhase === 'loading_levels' && (
          <Text size="m" view="secondary">
            {tSubscription('planLoading')}
          </Text>
        )}
        {levels.length === 0 && payPhase === 'ready' && (
          <Text size="m" view="secondary">
            {tSubscription('planEmpty')}
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
              {lvl.name} —{' '}
              {tSubscription('planPerMonth', { price: formatPriceRub(lvl.priceKopecks) })}
              {' · '}
              {tSubscription('planVolume', { liters: formatLitersFromMl(tierVolumeMl(lvl)) })}
            </Text>
          </label>
        ))}
      </VerticalContainer>

      {paymentUrl && (
        <VerticalContainer space="m" align="center">
          <Text size="m" weight="medium" align="center">
            {tSubscription('subscribeSbp')}
          </Text>
          <div className={styles.qrWhitePad}>
            <QRCodeSVG value={paymentUrl} size={200} aria-label={tSubscription('subscribeSbp')} />
          </div>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.payLink}>
            {tSubscription('subscribeOpenBank')}
          </a>
        </VerticalContainer>
      )}

      <VerticalContainer space="2xs">
        <Button
          size="l"
          label={
            payPhase === 'init' || payPhase === 'await_payment' || payPhase === 'await_subscription'
              ? tSubscription('subscribeWait')
              : tSubscription('subscribePay')
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
            {tSubscription('subscribeAwaitPayment')}
          </Text>
        )}
        {payPhase === 'await_subscription' ? (
          <Text size="s" weight="medium" align="center" view="secondary">
            {tSubscription('subscribeAwaitActivation')}
          </Text>
        ) : null}
        {payPhase === 'done' && (
          <Text size="m" weight="medium" align="center">
            {tSubscription('subscribeDone')}
          </Text>
        )}
        {payError && payPhase !== 'error' && (
          <Text size="m" weight="medium" align="center" view="alert">
            {payError}
          </Text>
        )}
        {selectedLevel && (
          <Text size="s" weight="medium" align="center" view="secondary">
            {selectedLevel.name},{' '}
            {tSubscription('planPerMonth', { price: formatPriceRub(selectedLevel.priceKopecks) })}
          </Text>
        )}
      </VerticalContainer>
    </VerticalContainer>
  );

  const renderScanModalBody = () => (
    <VerticalContainer space="l" isAutoWidth align="center">
      <div className={styles.qrWhitePadLarge}>
        <LoyaltyQrCode value={qrPayload} size={315} label={tSubscription('scanModalTitle')} />
      </div>
      <VerticalContainer space="s">
        <Text size="xl" weight="medium" align="center">
          {tSubscription('progressRemaining', { remaining: monthlyProgress.remainingMl })}
        </Text>
        <Text size="s" weight="medium" align="center" view="secondary">
          {tSubscription('progressUsed', {
            used: monthlyProgress.usedMl,
            limit: monthlyProgress.limitMl,
          })}
        </Text>
        {!isTrial && (isActiveSubscription || isExpiredSubscription) && (
          <Text size="s" weight="medium" align="center">
            {statusText}
          </Text>
        )}
      </VerticalContainer>
    </VerticalContainer>
  );

  if (isReject && !isAuthed) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={styles.pageShell}>
      <CabinetHeader />

      <main className={styles.main}>
        <MonthlyProgressCard progress={monthlyProgress} />
        <QrPromoCard qrPayload={qrPayload} onOpen={() => setIsScanModalOpen(true)} />
        <FavoriteTastesRow favoriteKeys={favoriteKeys} />
        <PlanSummaryCard
          plan={planSummary}
          isLoading={payPhase === 'loading_levels'}
          onOpen={() => openSubscribeModal(planSummary?.levelId)}
        />
      </main>

      <BottomNav />

      <BottomSheetModal
        isOpen={isScanModalOpen}
        className={styles.ScanSheetModal}
        modalTitle={tSubscription('scanModalTitle')}
        onClose={() => setIsScanModalOpen(false)}
      >
        {renderScanModalBody()}
      </BottomSheetModal>

      <BottomSheetModal
        isOpen={isDescriptionModalOpen}
        className={styles.DescriptionSheetModal}
        modalTitle={tSubscription('subscribeModalTitle')}
        onClose={handleDescriptionModalClose}
      >
        {renderDescriptionModalBody()}
      </BottomSheetModal>
    </div>
  );
};

export default SubscriptionPage;
