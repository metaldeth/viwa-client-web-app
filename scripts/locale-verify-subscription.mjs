#!/usr/bin/env node
/**
 * Subscription locale parity check for task-06 acceptance.
 * Verifies ru.json and en.json contain identical subscription.* key sets.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const localesDir = join(root, 'src', 'assets', 'locales');

const REQUIRED_KEYS = [
  'subscription.progressTitle',
  'subscription.progressCardTitle',
  'subscription.progressMetricUsed',
  'subscription.progressMetricRemaining',
  'subscription.progressRemainingCaption',
  'subscription.progressOfLimit',
  'subscription.progressValidUntil',
  'subscription.progressTrial',
  'subscription.progressActive',
  'subscription.progressInactive',
  'subscription.progressExpired',
  'subscription.progressUsed',
  'subscription.progressRemaining',
  'subscription.limitExhausted',
  'subscription.limitResetMonthly',
  'subscription.limitResetLegacy',
  'subscription.unlimitedWaterBenefitActive',
  'subscription.unlimitedWaterBenefitTrial',
  'subscription.unlimitedWaterBenefitExpired',
  'subscription.scanTitle',
  'subscription.qrCardTitle',
  'subscription.qrCardSubtitle',
  'subscription.qrCardSubtitleLine1',
  'subscription.qrCardSubtitleLine2',
  'subscription.scanModalTitle',
  'subscription.scanOpenHint',
  'subscription.favoritesTitle',
  'subscription.favoritesRowTitle',
  'subscription.favoritesTryTaste',
  'subscription.favoritesDoseRank',
  'subscription.favoritesUnknownKey',
  'subscription.favoritesHint',
  'subscription.favoritesSaving',
  'subscription.favoritesError',
  'subscription.favoritesLoadError',
  'subscription.planTitle',
  'subscription.planCardTitle',
  'subscription.planCardOpenHint',
  'subscription.planOfferLabel',
  'subscription.planCurrentLabel',
  'subscription.planTrialLiter',
  'subscription.planCtaOffer',
  'subscription.planCtaCurrent',
  'subscription.planBenefitSavings',
  'subscription.planBenefitPriority',
  'subscription.planBenefitBonuses',
  'subscription.planSubtitle',
  'subscription.planSelect',
  'subscription.planLoading',
  'subscription.planEmpty',
  'subscription.planError',
  'subscription.planPerMonth',
  'subscription.planVolume',
  'subscription.planFlavoredVolume',
  'subscription.planUnlimitedWaterActive',
  'subscription.planUnlimitedWaterOffer',
  'subscription.tierFlavoredVolume',
  'subscription.tierUnlimitedWaterBenefit',
  'subscription.tierDisabledStatus',
  'subscription.tierDisabledExplanation',
  'subscription.tierDisabledExplanationGeneric',
  'subscription.subscribeCta',
  'subscription.subscribeModalTitle',
  'subscription.subscribeModalClose',
  'subscription.autoRenewLabel',
  'subscription.autoRenewSoon',
  'subscription.recurringConsentTitle',
  'subscription.recurringConsentBody',
  'subscription.recurringConsentAccept',
  'subscription.recurringNextCharge',
  'subscription.recurringDisabled',
  'subscription.recurringRequiresAction',
  'subscription.recurringEnableCta',
  'subscription.recurringReenableConsent',
  'subscription.paymentChecking',
  'subscription.paymentSuccess',
  'subscription.paymentFailed',
  'subscription.subscribePay',
  'subscription.subscribeDowngradeNotAllowed',
  'subscription.subscribeWait',
  'subscription.paymentReturnSuccessTitle',
  'subscription.paymentReturnCheckingDescription',
  'subscription.paymentReturnCheckingStatus',
  'subscription.paymentReturnAwaitActivation',
  'subscription.paymentReturnFailedTitle',
  'subscription.paymentReturnFailedDescription',
  'subscription.paymentReturnErrorTitle',
  'subscription.paymentReturnCheckFailed',
  'subscription.paymentReturnCheckTimeout',
  'subscription.paymentReturnActivationFailed',
  'subscription.paymentReturnActivationTimeout',
  'subscription.paymentReturnMissingSession',
  'subscription.paymentReturnBackToSubscription',
  'subscription.paymentReturnRetryCheck',
  'subscription.benefitVitamins',
  'subscription.benefitMinerals',
  'subscription.benefitSugarFree',
  'subscription.benefitVolume',
  'subscription.navHome',
  'subscription.navProfile',
  'subscription.navHistory',
  'subscription.navAwards',
  'subscription.navFab',
  'subscription.navSettings',
  'subscription.navStub',
  'subscription.navAriaLabel',
  'subscription.brand',
  'subscription.volumeUnit',
  'subscription.cabinetMenuAria',
  'subscription.cabinetMenuLogOut',
  'subscription.legalFooterAria',
  'subscription.legalRequisites',
  'subscription.legalOffer',
  'subscription.legalPersonalData',
  'subscription.legalMadeBy',
  'subscription.legalReqInn',
  'subscription.legalReqName',
  'subscription.legalReqAddress',
  'subscription.legalReqOgrn',
  'subscription.legalReqAccount',
  'subscription.legalReqBank',
  'subscription.legalReqBik',
  'subscription.legalReqCorrAccount',
  'subscription.legalAuthAgreement',
  'subscription.legalAuthPrivacy',
  'subscription.priceNoticeTitle',
  'subscription.priceNoticeTierContext',
  'subscription.priceNoticePendingLead',
  'subscription.priceNoticeCurrentPriceLabel',
  'subscription.priceNoticeNewPriceLabel',
  'subscription.priceNoticePriceValue',
  'subscription.priceNoticeAccept',
  'subscription.priceNoticeDecline',
  'subscription.priceNoticeAcceptedTitle',
  'subscription.priceNoticeAcceptedSummary',
  'subscription.priceNoticeChangeDecision',
  'subscription.priceNoticeDeclinedTitle',
  'subscription.priceNoticeDeclinedSummary',
  'subscription.priceNoticeAcceptAfterDecline',
  'subscription.priceNoticeSubmitError',
  'subscription.priceNoticeFetchError',
  'subscription.priceNoticeRetry',
  'subscription.priceNoticeAriaLabel',
  'subscription.pwaInstallTitle',
  'subscription.pwaInstallDescription',
  'subscription.pwaInstallAndroidTab',
  'subscription.pwaInstallIosTab',
  'subscription.pwaInstallInstallButton',
  'subscription.pwaInstallDismiss',
  'subscription.pwaInstallAndroidManualStep1',
  'subscription.pwaInstallAndroidManualStep2',
  'subscription.pwaInstallAndroidManualStep3',
  'subscription.pwaInstallIosStep1',
  'subscription.pwaInstallIosStep2',
  'subscription.pwaInstallIosStep3',
  'subscription.pwaInstallAriaLabel',
  'subscription.pwaInstallTabsAria',
  'subscription.authMarketingSectionAriaLabel',
  'subscription.authMarketingHeading',
  'subscription.authMarketingDescription',
  'subscription.authMarketingBenefitsAriaLabel',
  'subscription.authMarketingBenefitFlavors',
  'subscription.authMarketingBenefitSugarFree',
  'subscription.authMarketingBenefitVitamins',
  'subscription.authMarketingBenefitMinerals',
  'subscription.authMarketingTariffsTitle',
  'subscription.authMarketingTariffsLoading',
  'subscription.authMarketingTariffsError',
  'subscription.authMarketingTariffsRetry',
  'subscription.authMarketingTariffDescriptionFallback',
];

function loadTranslation(localeFile) {
  const raw = readFileSync(join(localesDir, localeFile), 'utf8');
  const parsed = JSON.parse(raw);
  return parsed.translation ?? {};
}

function subscriptionKeys(translation) {
  return Object.keys(translation)
    .filter((key) => key.startsWith('subscription.'))
    .sort();
}

const ru = loadTranslation('ru.json');
const en = loadTranslation('en.json');
const ruKeys = subscriptionKeys(ru);
const enKeys = subscriptionKeys(en);

const missingRequiredRu = REQUIRED_KEYS.filter((key) => !(key in ru));
const missingRequiredEn = REQUIRED_KEYS.filter((key) => !(key in en));
const ruOnly = ruKeys.filter((key) => !(key in en));
const enOnly = enKeys.filter((key) => !(key in ru));

let failed = false;

if (missingRequiredRu.length > 0) {
  failed = true;
  console.error('Missing required keys in ru.json:', missingRequiredRu.join(', '));
}

if (missingRequiredEn.length > 0) {
  failed = true;
  console.error('Missing required keys in en.json:', missingRequiredEn.join(', '));
}

if (ruOnly.length > 0 || enOnly.length > 0) {
  failed = true;
  if (ruOnly.length > 0) {
    console.error('Keys only in ru.json:', ruOnly.join(', '));
  }
  if (enOnly.length > 0) {
    console.error('Keys only in en.json:', enOnly.join(', '));
  }
}

if (failed) {
  process.exit(1);
}

console.log(`locale:verify OK — ${REQUIRED_KEYS.length} subscription keys in ru/en parity`);
