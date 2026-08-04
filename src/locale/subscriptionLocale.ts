import ruLocale from '../assets/locales/ru.json';
import enLocale from '../assets/locales/en.json';

export type SubscriptionLocaleKey =
  | 'progressTitle'
  | 'progressCardTitle'
  | 'progressMetricUsed'
  | 'progressMetricRemaining'
  | 'progressRemainingCaption'
  | 'progressOfLimit'
  | 'progressValidUntil'
  | 'progressTrial'
  | 'progressActive'
  | 'progressInactive'
  | 'progressExpired'
  | 'progressUsed'
  | 'progressRemaining'
  | 'limitExhausted'
  | 'limitResetMonthly'
  | 'limitResetLegacy'
  | 'unlimitedWaterBenefitActive'
  | 'unlimitedWaterBenefitTrial'
  | 'unlimitedWaterBenefitExpired'
  | 'scanTitle'
  | 'qrCardTitle'
  | 'qrCardSubtitle'
  | 'qrCardSubtitleLine1'
  | 'qrCardSubtitleLine2'
  | 'scanModalTitle'
  | 'scanOpenHint'
  | 'favoritesTitle'
  | 'favoritesRowTitle'
  | 'favoritesTryTaste'
  | 'favoritesDoseRank'
  | 'favoritesUnknownKey'
  | 'favoritesHint'
  | 'favoritesSaving'
  | 'favoritesError'
  | 'favoritesLoadError'
  | 'planTitle'
  | 'planCardTitle'
  | 'planCardOpenHint'
  | 'planOfferLabel'
  | 'planCurrentLabel'
  | 'planTrialLiter'
  | 'planCtaOffer'
  | 'planCtaCurrent'
  | 'planBenefitSavings'
  | 'planBenefitPriority'
  | 'planBenefitBonuses'
  | 'planSubtitle'
  | 'planSelect'
  | 'planLoading'
  | 'planEmpty'
  | 'planError'
  | 'planPerMonth'
  | 'planPeriodSuffix'
  | 'planVolume'
  | 'planFlavoredVolume'
  | 'planUnlimitedWaterActive'
  | 'planUnlimitedWaterOffer'
  | 'tierFlavoredVolume'
  | 'tierUnlimitedWaterBenefit'
  | 'tierDisabledUntilDate'
  | 'tierDisabledGeneric'
  | 'subscribeCta'
  | 'subscribeModalTitle'
  | 'subscribePay'
  | 'subscribeDowngradeNotAllowed'
  | 'subscribeWait'
  | 'subscribeAwaitPayment'
  | 'subscribeAwaitActivation'
  | 'subscribeDone'
  | 'subscribeSbp'
  | 'subscribeOpenBank'
  | 'benefitVitamins'
  | 'benefitMinerals'
  | 'benefitSugarFree'
  | 'benefitVolume'
  | 'navHome'
  | 'navProfile'
  | 'navHistory'
  | 'navAwards'
  | 'navFab'
  | 'navSettings'
  | 'navStub'
  | 'navAriaLabel'
  | 'brand'
  | 'volumeUnit'
  | 'cabinetMenuAria'
  | 'cabinetMenuLogOut';

type LocaleCatalog = Record<SubscriptionLocaleKey, string>;

function extractSubscriptionCatalog(translation: Record<string, string>): LocaleCatalog {
  const catalog = {} as LocaleCatalog;

  for (const [fullKey, value] of Object.entries(translation)) {
    if (!fullKey.startsWith('subscription.')) {
      continue;
    }
    const key = fullKey.slice('subscription.'.length) as SubscriptionLocaleKey;
    catalog[key] = value;
  }

  return catalog;
}

const ruCatalog = extractSubscriptionCatalog(ruLocale.translation);
const enCatalog = extractSubscriptionCatalog(enLocale.translation);

let activeLocale: 'ru' | 'en' = 'ru';

export function getSubscriptionLocale(): 'ru' | 'en' {
  return activeLocale;
}

export function setSubscriptionLocale(locale: 'ru' | 'en'): void {
  activeLocale = locale;
}

export function getSubscriptionLocaleCatalog(locale: 'ru' | 'en' = activeLocale): LocaleCatalog {
  return locale === 'en' ? enCatalog : ruCatalog;
}

/** @deprecated use catalogs — kept for locale verify script parity */
export const subscriptionLocale = ruCatalog;

export function tSubscription(
  key: SubscriptionLocaleKey,
  params?: Record<string, string | number>,
  locale: 'ru' | 'en' = activeLocale,
): string {
  const catalog = getSubscriptionLocaleCatalog(locale);
  let text = catalog[key] ?? ruCatalog[key] ?? key;

  if (params) {
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(value));
    });
  }

  return text;
}

export function formatLitersFromMl(ml: number): number {
  return Math.round(ml / 1000);
}

export function formatPriceRub(priceKopecks: number): number {
  return Math.round(priceKopecks / 100);
}
