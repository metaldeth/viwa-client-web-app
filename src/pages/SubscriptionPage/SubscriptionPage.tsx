import { FC, memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Button } from '@asnefedov/uikit/Button';
import { Text } from '@asnefedov/uikit/Text';
import classNames from 'classnames';
import { QRCodeSVG } from 'qrcode.react';
import styles from './SubscriptionPage.module.scss';
import BottomSheetModal from '../../components/BottomSheetModal';
import CabinetHeader from '../../components/CabinetHeader';
import CabinetLegalFooter from '../../components/CabinetLegalFooter';
import PwaInstallPrompt from '../../components/PwaInstallPrompt';
import SubscriptionPriceConsentPanel, {
  SubscriptionPriceNoticeFetchError,
} from '../../components/SubscriptionPriceConsentPanel/SubscriptionPriceConsentPanel';
import RecurringConsentModal from '../../components/RecurringConsentModal';
import RecurringStatusBlock from '../../components/RecurringStatusBlock';
import MonthlyProgressCard from '../../components/MonthlyProgressCard';
import QrPromoCard from '../../components/QrPromoCard';
import FavoriteTastesRow from '../../components/FavoriteTastesRow';
import PlanSummaryCard from '../../components/PlanSummaryCard';
import { useAppDispatch, useAppSelector } from '../../app/hooks/store';
import { getCurrentClientProfileAction } from '../../state/loyalty/actions';
import { selectClientProfile } from '../../state/loyalty/selectors';
import { api } from '../../app/api';
import type { SubscriptionLevelDTO } from '../../types/subscriptionLevel';
import { hasAuthTokens, getMachineSerialFromPath } from '../ValidationPage/helpers';
import { useClientSubscriptionWs } from '../../hooks/useClientSubscriptionWs';
import { useRecurringAgreement } from '../../hooks/useRecurringAgreement';
import { useSubscriptionPriceNotice } from '../../hooks/useSubscriptionPriceNotice';
import { RECURRING_CONSENT_VERSION } from '../../constants/recurringConsent';
import { LEGAL_OFFER_URL } from '../../constants/legalLinks';
import {
  resolveCheckoutReturnPath,
  sanitizeMachineSerial,
  writePendingPayment,
} from '../../constants/pendingPayment';
import { formatLitersFromMl, formatPriceRub, tSubscription } from '../../locale/subscriptionLocale';
import { resolveMonthlyProgress } from '../../utils/monthlyProgress';
import { resolvePlanSummaryDisplay } from '../../utils/planSummary';
import {
  isSubscriptionLevelDisabled,
  isSubscriptionLevelSelectable,
  levelVolumeMl,
  normalizeSelectedSubscriptionLevelId,
  resolveDisabledTierCopy,
  resolveSubscriptionTierAvailability,
  sortLevelsByOrder,
  type SubscriptionProfileInput,
} from '../../utils/subscriptionLevels';
import { resolveSubscriptionPaymentErrorMessage } from '../../utils/subscriptionPaymentError';
import { isActiveSubscriptionProfile } from '../../utils/subscriptionStatus';
import { resolveUnlimitedWaterBenefitVariant } from '../../utils/unlimitedWaterBenefit';
import { resolveTierCardBackgroundForLevel } from '../../utils/tierCardBackground';

type PayPhase = 'idle' | 'loading_levels' | 'ready' | 'init' | 'error';

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

const SubscriptionPage: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const { state: client, isReject } = useAppSelector(selectClientProfile());

  const isAuthed = hasAuthTokens();
  useClientSubscriptionWs(isAuthed);

  const subscriptionProfile = useMemo(
    (): SubscriptionProfileInput => ({
      tierName: client?.tierName ?? null,
      subscriptionEndsAt: client?.subscriptionEndsAt ?? null,
      monthlyLimitMl: client?.monthlyLimitMl,
      dailyLimitMl: client?.dailyLimitMl,
      active: client?.active,
    }),
    [
      client?.tierName,
      client?.subscriptionEndsAt,
      client?.monthlyLimitMl,
      client?.dailyLimitMl,
      client?.active,
    ],
  );

  const hasActiveSubscription = isActiveSubscriptionProfile(subscriptionProfile);

  const {
    data: recurringData,
    loading: recurringLoading,
    error: recurringError,
    patching: recurringPatching,
    refetch: refetchRecurring,
    patchAgreement,
  } = useRecurringAgreement(isAuthed && hasActiveSubscription);

  const {
    notice: priceNotice,
    fetchState: priceNoticeFetchState,
    fetchError: priceNoticeFetchError,
    submitting: priceNoticeSubmitting,
    submitError: priceNoticeSubmitError,
    isRetrying: priceNoticeIsRetrying,
    load: reloadPriceNotice,
    submitDecision: submitPriceNoticeDecision,
    clearSubmitError: clearPriceNoticeSubmitError,
  } = useSubscriptionPriceNotice(isAuthed, client?.tierName ?? null);

  const monthlyProgress = useMemo(() => resolveMonthlyProgress(client), [client]);
  const waterBenefitVariant = useMemo(() => resolveUnlimitedWaterBenefitVariant(client), [client]);
  const qrPayload = client?.qrPayload ?? '';
  const favoriteKeys = client?.favoriteTasteKeys ?? [];

  const [levels, setLevels] = useState<SubscriptionLevelDTO[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [payPhase, setPayPhase] = useState<PayPhase>('idle');
  const [payError, setPayError] = useState<string | null>(null);
  const [autoRenew, setAutoRenew] = useState(false);
  const [offerAccepted, setOfferAccepted] = useState(false);
  const [recurringConsentAccepted, setRecurringConsentAccepted] = useState(false);
  const [isRecurringDetailsOpen, setIsRecurringDetailsOpen] = useState(false);
  const [isConsentModalOpen, setIsConsentModalOpen] = useState(false);
  const [recurringActionError, setRecurringActionError] = useState<string | null>(null);
  const offerAcceptCheckboxId = useId();
  const offerAcceptLinkId = useId();
  const autoRenewCheckboxId = useId();
  const autoRenewHintId = useId();
  const recurringConsentCheckboxId = useId();
  const recurringConsentDetailsId = useId();

  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);

  /** Synchronous guard — blocks same-frame double-clicks before React re-render disables the CTA. */
  const purchaseInFlightRef = useRef(false);

  const releasePurchaseLock = useCallback(() => {
    purchaseInFlightRef.current = false;
  }, []);

  const tryAcquirePurchaseLock = useCallback((): boolean => {
    if (purchaseInFlightRef.current) {
      return false;
    }
    purchaseInFlightRef.current = true;
    return true;
  }, []);

  const planSummary = useMemo(
    () => resolvePlanSummaryDisplay(subscriptionProfile, levels),
    [subscriptionProfile, levels],
  );
  const tierAvailability = useMemo(
    () => resolveSubscriptionTierAvailability(subscriptionProfile, levels),
    [subscriptionProfile, levels],
  );
  const catalogLevels = tierAvailability.catalog;
  const selectableLevels = tierAvailability.selectable;

  useEffect(() => {
    setSelectedLevelId((current) => {
      if (isSubscriptionLevelSelectable(current, selectableLevels)) {
        return current;
      }
      return normalizeSelectedSubscriptionLevelId(current, selectableLevels, planSummary?.levelId);
    });
  }, [selectableLevels, planSummary?.levelId]);

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
        const sorted = sortLevelsByOrder(response.items || []);
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

  const resetCheckoutConsentState = useCallback(() => {
    setAutoRenew(false);
    setOfferAccepted(false);
    setRecurringConsentAccepted(false);
    setIsRecurringDetailsOpen(false);
  }, []);

  const handleRobokassaPurchase = useCallback(async () => {
    const levelId = selectedLevelId;
    if (!levelId || !isSubscriptionLevelSelectable(levelId, selectableLevels)) return;

    if (!offerAccepted || (autoRenew && !recurringConsentAccepted)) {
      return;
    }

    if (!tryAcquirePurchaseLock()) return;

    setPayError(null);
    setPayPhase('init');

    try {
      const init = await api.billing.initRobokassaPayment({
        subscriptionLevelId: levelId,
        requestUuid: crypto.randomUUID(),
        autoRenew,
        ...(autoRenew ? { consentVersion: RECURRING_CONSENT_VERSION } : {}),
      });

      const returnPath = resolveCheckoutReturnPath(location.pathname);
      const machineSerial =
        sanitizeMachineSerial(getMachineSerialFromPath(location.pathname)) ?? undefined;

      writePendingPayment({
        paymentId: init.paymentId,
        startedAt: Date.now(),
        returnPath,
        ...(machineSerial ? { machineSerial } : {}),
      });

      window.location.href = init.paymentUrl;
    } catch (e: unknown) {
      releasePurchaseLock();
      setPayError(resolveSubscriptionPaymentErrorMessage(e));
      setPayPhase('ready');
    }
  }, [
    autoRenew,
    location.pathname,
    offerAccepted,
    recurringConsentAccepted,
    releasePurchaseLock,
    selectedLevelId,
    selectableLevels,
    tryAcquirePurchaseLock,
  ]);

  const handlePurchase = useCallback(() => {
    void handleRobokassaPurchase();
  }, [handleRobokassaPurchase]);

  const handleConsentAccept = useCallback(async () => {
    setIsConsentModalOpen(false);
    setRecurringActionError(null);

    try {
      await patchAgreement({
        enabled: true,
        consentVersion: RECURRING_CONSENT_VERSION,
      });
    } catch (e: unknown) {
      setRecurringActionError(resolveSubscriptionPaymentErrorMessage(e));
    }
  }, [patchAgreement]);

  const handleRecurringDisable = useCallback(async () => {
    setRecurringActionError(null);

    try {
      await patchAgreement({ enabled: false });
    } catch (e: unknown) {
      setRecurringActionError(resolveSubscriptionPaymentErrorMessage(e));
    }
  }, [patchAgreement]);

  const openSubscribeModal = useCallback(
    (levelId?: string | null) => {
      resetCheckoutConsentState();
      const nextLevelId = normalizeSelectedSubscriptionLevelId(
        levelId ?? selectedLevelId,
        selectableLevels,
        planSummary?.levelId,
      );
      setSelectedLevelId(nextLevelId);
      setIsDescriptionModalOpen(true);
    },
    [resetCheckoutConsentState, selectableLevels, planSummary?.levelId, selectedLevelId],
  );

  const handleEnableNewParent = useCallback(() => {
    openSubscribeModal(planSummary?.levelId);
  }, [openSubscribeModal, planSummary?.levelId]);

  const handleRecurringReEnable = useCallback(() => {
    setIsConsentModalOpen(true);
  }, []);

  const handleAutoRenewChange = useCallback((checked: boolean) => {
    setAutoRenew(checked);
    if (!checked) {
      setRecurringConsentAccepted(false);
      setIsRecurringDetailsOpen(false);
    }
  }, []);

  const handleDescriptionModalClose = () => {
    releasePurchaseLock();
    setIsDescriptionModalOpen(false);
    setPayError(null);
    setPayPhase('ready');
    resetCheckoutConsentState();
  };

  const showTariffSelection = payPhase !== 'init';
  const isPayFlowBusy = payPhase === 'init';
  const isCheckoutConsentComplete = offerAccepted && (!autoRenew || recurringConsentAccepted);
  const isPayButtonDisabled =
    !isSubscriptionLevelSelectable(selectedLevelId, selectableLevels) ||
    isPayFlowBusy ||
    payPhase === 'loading_levels' ||
    !isCheckoutConsentComplete;

  const renderAutoRenewRow = () => {
    if (!showTariffSelection) {
      return null;
    }

    return (
      <label
        className={styles.autoRenewRow}
        htmlFor={autoRenewCheckboxId}
        data-testid="checkout-auto-renew-row"
      >
        <input
          id={autoRenewCheckboxId}
          type="checkbox"
          className={styles.autoRenewCheckbox}
          checked={autoRenew}
          disabled={isPayFlowBusy}
          aria-describedby={autoRenewHintId}
          data-testid="checkout-auto-renew-checkbox"
          onChange={(event) => handleAutoRenewChange(event.target.checked)}
        />
        <span className={styles.autoRenewCopy}>
          <span className={styles.autoRenewLabel}>{tSubscription('autoRenewLabel')}</span>
          <span id={autoRenewHintId} className={styles.autoRenewHint}>
            {tSubscription('autoRenewSoon')}
          </span>
        </span>
      </label>
    );
  };

  const renderOfferAcceptSection = () => {
    if (!showTariffSelection) {
      return null;
    }

    return (
      <div className={styles.offerAcceptRow} data-testid="checkout-offer-accept-row">
        <label className={styles.offerAcceptLabelRow} htmlFor={offerAcceptCheckboxId}>
          <input
            id={offerAcceptCheckboxId}
            type="checkbox"
            className={styles.consentCheckboxInput}
            checked={offerAccepted}
            disabled={isPayFlowBusy}
            aria-describedby={offerAcceptLinkId}
            data-testid="checkout-offer-accept-checkbox"
            onChange={(event) => setOfferAccepted(event.target.checked)}
          />
          <span className={styles.consentCheckboxLabel}>
            {tSubscription('checkoutOfferAcceptBefore')}
          </span>
        </label>
        <a
          id={offerAcceptLinkId}
          className={styles.consentOfferLink}
          href={LEGAL_OFFER_URL}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="checkout-offer-accept-link"
        >
          {tSubscription('recurringConsentOfferLink')}
        </a>
      </div>
    );
  };

  const renderRecurringConsentSection = () => {
    if (!showTariffSelection || !autoRenew) {
      return null;
    }

    return (
      <div
        className={styles.checkoutConsentSection}
        data-testid="checkout-recurring-consent-section"
      >
        <label
          className={styles.consentCheckboxRow}
          htmlFor={recurringConsentCheckboxId}
          data-testid="checkout-recurring-consent-label"
        >
          <input
            id={recurringConsentCheckboxId}
            type="checkbox"
            className={styles.consentCheckboxInput}
            checked={recurringConsentAccepted}
            disabled={isPayFlowBusy}
            data-testid="checkout-recurring-consent-checkbox"
            onChange={(event) => setRecurringConsentAccepted(event.target.checked)}
          />
          <span className={styles.consentCheckboxLabel}>
            {tSubscription('recurringConsentAccept')}
          </span>
        </label>
        <button
          type="button"
          className={styles.consentDetailsToggle}
          data-testid="checkout-recurring-consent-details-toggle"
          aria-expanded={isRecurringDetailsOpen}
          aria-controls={recurringConsentDetailsId}
          onClick={() => setIsRecurringDetailsOpen((open) => !open)}
        >
          {isRecurringDetailsOpen
            ? tSubscription('recurringConsentDetailsHide')
            : tSubscription('recurringConsentDetailsShow')}
        </button>
        {isRecurringDetailsOpen ? (
          <p
            id={recurringConsentDetailsId}
            className={styles.consentBody}
            data-testid="checkout-recurring-consent-details"
          >
            {tSubscription('recurringConsentBody')}
          </p>
        ) : null}
      </div>
    );
  };

  const renderDescriptionModalBody = () => (
    <div className={styles.subscribeModalBody}>
      <div className={styles.subscribeModalScroll}>
      {showTariffSelection && (
        <div className={styles.tierSelection}>
          {payPhase !== 'loading_levels' && catalogLevels.length > 0 ? (
            <Text size="s" view="secondary" className={styles.tierSelectionHint}>
              {tSubscription('planSelect')}
            </Text>
          ) : null}

          {payPhase === 'loading_levels' && (
            <Text size="m" view="secondary">
              {tSubscription('planLoading')}
            </Text>
          )}

          {catalogLevels.length === 0 && payPhase === 'ready' && (
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
            {catalogLevels.map((level) => {
              const isDisabled = isSubscriptionLevelDisabled(
                level.id,
                catalogLevels,
                selectableLevels,
              );
              const isSelected = !isDisabled && selectedLevelId === level.id;
              const disabledStatusId = `tier-disabled-status-${level.id}`;
              const disabledExplanationId = `tier-disabled-explanation-${level.id}`;
              const disabledCopy = isDisabled
                ? resolveDisabledTierCopy(subscriptionProfile, level)
                : null;

              return (
                <label
                  key={level.id}
                  className={classNames(
                    styles.tierCard,
                    isSelected && styles.tierCardSelected,
                    isDisabled && styles.tierCardDisabled,
                  )}
                  aria-disabled={isDisabled || undefined}
                >
                  <input
                    type="radio"
                    name="subscription-tier"
                    className={styles.tierCardInput}
                    checked={isSelected}
                    disabled={isDisabled}
                    aria-describedby={
                      isDisabled ? `${disabledStatusId} ${disabledExplanationId}` : undefined
                    }
                    onChange={() => {
                      if (!isDisabled) {
                        setSelectedLevelId(level.id);
                      }
                    }}
                  />
                  <span
                    className={styles.tierCardBackground}
                    style={{
                      backgroundImage: `url(${resolveTierCardBackgroundForLevel(level.id, levels)})`,
                    }}
                    aria-hidden="true"
                  />
                  <span className={styles.tierCardGradient} aria-hidden="true" />
                  <span className={styles.tierCardContent}>
                    <span className={styles.tierCardName}>{level.name}</span>
                    <span className={styles.tierCardMeta}>
                      {tSubscription('tierFlavoredVolume', {
                        liters: formatLitersFromMl(levelVolumeMl(level)),
                      })}
                    </span>
                    <span
                      className={styles.tierCardMeta}
                      data-testid="tier-unlimited-water-benefit"
                    >
                      {tSubscription('tierUnlimitedWaterBenefit')}
                    </span>
                    {disabledCopy ? (
                      <span className={styles.tierCardDisabledCopy}>
                        <span id={disabledStatusId} className={styles.tierCardDisabledStatus}>
                          {disabledCopy.status}
                        </span>
                        <span
                          id={disabledExplanationId}
                          className={styles.tierCardDisabledExplanation}
                        >
                          {disabledCopy.explanation}
                        </span>
                      </span>
                    ) : null}
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

      {renderAutoRenewRow()}
      {renderRecurringConsentSection()}
      {renderOfferAcceptSection()}
      </div>

      {isPayFlowBusy ? (
        <Text size="s" view="secondary" align="center" className={styles.robokassaHint}>
          {tSubscription('paymentChecking')}
        </Text>
      ) : null}

      <div className={styles.subscribeActions}>
        <Button
          size="l"
          label={isPayFlowBusy ? tSubscription('subscribeWait') : tSubscription('subscribePay')}
          disabled={isPayButtonDisabled}
          data-testid="subscription-pay-button"
          onClick={() => void handlePurchase()}
        />
        {payError && payPhase !== 'error' && (
          <Text size="m" weight="medium" align="center" view="alert">
            {payError}
          </Text>
        )}
        {payError && payPhase === 'ready' ? (
          <Button
            size="s"
            view="secondary"
            label={tSubscription('paymentReturnRetryCheck')}
            onClick={() => void handlePurchase()}
          />
        ) : null}
      </div>
    </div>
  );

  const renderSheetCloseHeader = (onClose: () => void) => (
    <header className={styles.scanSheetHeader}>
      <button
        type="button"
        className={styles.scanSheetClose}
        aria-label={tSubscription('subscribeModalClose')}
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

      {priceNoticeFetchState === 'error' && priceNoticeFetchError ? (
        <SubscriptionPriceNoticeFetchError
          message={priceNoticeFetchError}
          isRetrying={priceNoticeIsRetrying}
          onRetry={() => void reloadPriceNotice()}
        />
      ) : null}

      {priceNotice ? (
        <SubscriptionPriceConsentPanel
          notice={priceNotice}
          submitting={priceNoticeSubmitting}
          submitError={priceNoticeSubmitError}
          onAccept={() => void submitPriceNoticeDecision('ACCEPTED')}
          onDecline={() => void submitPriceNoticeDecision('DECLINED')}
          onReviewStart={clearPriceNoticeSubmitError}
        />
      ) : null}

      <main className={styles.main}>
        <MonthlyProgressCard
          progress={monthlyProgress}
          subscriptionEndsAt={client?.subscriptionEndsAt ?? null}
          waterBenefitVariant={waterBenefitVariant}
          limitExhausted={client?.limitExhausted}
        />
        {hasActiveSubscription ? (
          <RecurringStatusBlock
            agreement={recurringData?.agreement ?? null}
            capabilities={recurringData?.capabilities ?? null}
            loading={recurringLoading}
            error={recurringActionError ?? recurringError}
            patching={recurringPatching}
            onDisable={() => void handleRecurringDisable()}
            onReEnable={handleRecurringReEnable}
            onEnableNewParent={handleEnableNewParent}
            onRetry={() => void refetchRecurring()}
          />
        ) : null}
        <QrPromoCard qrPayload={qrPayload} onOpen={() => setIsScanModalOpen(true)} />
        <PlanSummaryCard
          plan={planSummary}
          isLoading={payPhase === 'loading_levels'}
          isTrial={monthlyProgress.isTrial}
          waterBenefitVariant={waterBenefitVariant}
          onOpen={() => openSubscribeModal(planSummary?.levelId)}
        />
        <FavoriteTastesRow favoriteKeys={favoriteKeys} />
        <PwaInstallPrompt variant="section" className={styles.pwaInstallSection} />
      </main>

      <CabinetLegalFooter />

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

      <RecurringConsentModal
        isOpen={isConsentModalOpen}
        submitting={recurringPatching}
        onClose={() => setIsConsentModalOpen(false)}
        onAccept={() => void handleConsentAccept()}
      />
    </div>
  );
};

export default SubscriptionPage;
