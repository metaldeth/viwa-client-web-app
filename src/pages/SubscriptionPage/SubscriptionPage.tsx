import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@asnefedov/uikit/Button';
import { Text } from '@asnefedov/uikit/Text';
import classNames from 'classnames';
import { QRCodeSVG } from 'qrcode.react';
import styles from './SubscriptionPage.module.scss';
import BottomSheetModal from '../../components/BottomSheetModal';
import SbpPaymentQr from '../../components/SbpPaymentQr';
import CabinetHeader from '../../components/CabinetHeader';
import MonthlyProgressCard from '../../components/MonthlyProgressCard';
import QrPromoCard from '../../components/QrPromoCard';
import FavoriteTastesRow from '../../components/FavoriteTastesRow';
import PlanSummaryCard from '../../components/PlanSummaryCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { getCurrentClientProfileAction } from '../../state/loyalty/actions';
import { selectClientProfile } from '../../state/loyalty/selectors';
import { api } from '../../app/api';
import type { SubscriptionLevelDTO } from '../../types/subscriptionLevel';
import { hasAuthTokens } from '../ValidationPage/helpers';
import { useClientSubscriptionWs } from '../../hooks/useClientSubscriptionWs';
import { formatLitersFromMl, formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import { resolveMonthlyProgress } from '../../utils/monthlyProgress';
import { resolvePlanSummaryDisplay } from '../../utils/planSummary';
import { resolveUnlimitedWaterBenefitVariant } from '../../utils/unlimitedWaterBenefit';
import { resolveTierCardBackground } from '../../utils/tierCardBackground';

type PayPhase =
  | 'idle'
  | 'loading_levels'
  | 'ready'
  | 'init'
  | 'await_payment'
  | 'await_subscription'
  | 'done'
  | 'error';

const PAYMENT_ACTIVE_PHASES: PayPhase[] = ['init', 'await_payment', 'await_subscription'];

const LoyaltyQrCode = memo(function LoyaltyQrCode({
  value,
  size,
  label,
}: {
  value: string;
  size: number;
  label: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div role="img" aria-label={label}>
      <QRCodeSVG value={value} size={size} level="M" aria-hidden="true" />
    </div>
  );
});

function tierVolumeMl(level: SubscriptionLevelDTO): number {
  return level.monthlyVolumeMl ?? level.dailyVolumeMl ?? 0;
}

function isPaymentFlowActive(payPhase: PayPhase, paymentUrl: string | null): boolean {
  return Boolean(paymentUrl) || PAYMENT_ACTIVE_PHASES.includes(payPhase);
}

const SubscriptionPage: FC = () => {
  const dispatch = useAppDispatch();
  const { state: client, isReject } = useAppSelector(selectClientProfile());

  const isAuthed = hasAuthTokens();
  useClientSubscriptionWs(isAuthed);

  const monthlyProgress = useMemo(() => resolveMonthlyProgress(client), [client]);
  const waterBenefitVariant = useMemo(() => resolveUnlimitedWaterBenefitVariant(client), [client]);
  const qrPayload = client?.qrPayload ?? '';
  const favoriteKeys = client?.favoriteTasteKeys ?? [];

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

  const showTariffSelection = !isPaymentFlowActive(payPhase, paymentUrl);
  const isPayButtonDisabled =
    !selectedLevelId ||
    payPhase === 'init' ||
    payPhase === 'await_payment' ||
    payPhase === 'await_subscription' ||
    payPhase === 'loading_levels';

  const renderDescriptionModalBody = () => (
    <div className={styles.subscribeModalBody}>
      {showTariffSelection && (
        <div className={styles.tierSelection}>
          {payPhase !== 'loading_levels' && levels.length > 0 ? (
            <Text size="s" view="secondary" className={styles.tierSelectionHint}>
              {tSubscription('planSelect')}
            </Text>
          ) : null}

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

          {payPhase === 'error' && payError && (
            <Text size="m" view="alert">
              {payError}
            </Text>
          )}

          <div
            className={styles.tierCardList}
            role="radiogroup"
            aria-label={tSubscription('planSelect')}
          >
            {levels.map((level, index) => {
              const isSelected = selectedLevelId === level.id;

              return (
                <label
                  key={level.id}
                  className={classNames(styles.tierCard, isSelected && styles.tierCardSelected)}
                >
                  <input
                    type="radio"
                    name="subscription-tier"
                    className={styles.tierCardInput}
                    checked={isSelected}
                    onChange={() => setSelectedLevelId(level.id)}
                  />
                  <span
                    className={styles.tierCardBackground}
                    style={{ backgroundImage: `url(${resolveTierCardBackground(index)})` }}
                    aria-hidden="true"
                  />
                  <span className={styles.tierCardGradient} aria-hidden="true" />
                  <span className={styles.tierCardContent}>
                    <span className={styles.tierCardName}>{level.name}</span>
                    <span className={styles.tierCardMeta}>
                      {tSubscription('tierFlavoredVolume', {
                        liters: formatLitersFromMl(tierVolumeMl(level)),
                      })}
                    </span>
                    <span
                      className={styles.tierCardMeta}
                      data-testid="tier-unlimited-water-benefit"
                    >
                      {tSubscription('tierUnlimitedWaterBenefit')}
                    </span>
                    <span className={styles.tierCardPrice}>
                      {formatPriceRub(level.priceKopecks)} ₽
                    </span>
                  </span>
                  {isSelected ? (
                    <span className={styles.tierCardCheck} aria-hidden="true">
                      <svg viewBox="0 0 20 20">
                        <path d="M5 10.5l3 3 7-7" />
                      </svg>
                    </span>
                  ) : null}
                </label>
              );
            })}
          </div>
        </div>
      )}

      {paymentUrl && (
        <div className={styles.paymentStage}>
          <p className={styles.paymentStageLabel}>{tSubscription('subscribeSbp')}</p>
          <div className={styles.paymentQrPad}>
            <SbpPaymentQr value={paymentUrl} ariaLabel={tSubscription('subscribeSbp')} />
          </div>
          <a href={paymentUrl} target="_blank" rel="noopener noreferrer" className={styles.payLink}>
            {tSubscription('subscribeOpenBank')}
          </a>
        </div>
      )}

      <div className={styles.subscribeActions}>
        <Button
          size="l"
          label={
            payPhase === 'init' || payPhase === 'await_payment' || payPhase === 'await_subscription'
              ? tSubscription('subscribeWait')
              : tSubscription('subscribePay')
          }
          disabled={isPayButtonDisabled}
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
      </div>
    </div>
  );

  const renderSheetCloseHeader = (onClose: () => void) => (
    <header className={styles.scanSheetHeader}>
      <button
        type="button"
        className={styles.scanSheetClose}
        aria-label="Закрыть"
        onClick={onClose}
      >
        <svg viewBox="0 0 20 20" aria-hidden="true">
          <path d="M5 5l10 10M15 5 5 15" />
        </svg>
      </button>
    </header>
  );

  const renderScanModalHeader = () => renderSheetCloseHeader(() => setIsScanModalOpen(false));

  const renderSubscribeModalHeader = () => renderSheetCloseHeader(handleDescriptionModalClose);

  const renderScanModalBody = () => (
    <div className={styles.scanBody}>
      <div className={styles.scanQrPad}>
        <LoyaltyQrCode value={qrPayload} size={340} label={tSubscription('scanModalTitle')} />
      </div>
    </div>
  );

  if (isReject && !isAuthed) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className={styles.pageShell}>
      <CabinetHeader />

      <main className={styles.main}>
        <MonthlyProgressCard
          progress={monthlyProgress}
          subscriptionEndsAt={client?.subscriptionEndsAt ?? null}
          waterBenefitVariant={waterBenefitVariant}
          limitExhausted={client?.limitExhausted}
        />
        <QrPromoCard qrPayload={qrPayload} onOpen={() => setIsScanModalOpen(true)} />
        <FavoriteTastesRow favoriteKeys={favoriteKeys} />
        <PlanSummaryCard
          plan={planSummary}
          isLoading={payPhase === 'loading_levels'}
          isTrial={monthlyProgress.isTrial}
          waterBenefitVariant={waterBenefitVariant}
          onOpen={() => openSubscribeModal(planSummary?.levelId)}
        />
      </main>

      <BottomSheetModal
        isOpen={isScanModalOpen}
        className={styles.ScanSheetModal}
        renderHeader={renderScanModalHeader}
        onClose={() => setIsScanModalOpen(false)}
      >
        {renderScanModalBody()}
      </BottomSheetModal>

      <BottomSheetModal
        isOpen={isDescriptionModalOpen}
        className={styles.DescriptionSheetModal}
        renderHeader={renderSubscribeModalHeader}
        onClose={handleDescriptionModalClose}
      >
        {renderDescriptionModalBody()}
      </BottomSheetModal>
    </div>
  );
};

export default SubscriptionPage;
