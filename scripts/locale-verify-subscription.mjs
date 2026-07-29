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
  'subscription.progressTrial',
  'subscription.progressActive',
  'subscription.progressInactive',
  'subscription.progressExpired',
  'subscription.progressUsed',
  'subscription.progressRemaining',
  'subscription.limitExhausted',
  'subscription.limitResetMonthly',
  'subscription.limitResetLegacy',
  'subscription.scanTitle',
  'subscription.scanModalTitle',
  'subscription.scanOpenHint',
  'subscription.favoritesTitle',
  'subscription.favoritesHint',
  'subscription.favoritesSaving',
  'subscription.favoritesError',
  'subscription.favoritesLoadError',
  'subscription.planTitle',
  'subscription.planSubtitle',
  'subscription.planSelect',
  'subscription.planLoading',
  'subscription.planEmpty',
  'subscription.planError',
  'subscription.planPerMonth',
  'subscription.planVolume',
  'subscription.subscribeCta',
  'subscription.subscribeModalTitle',
  'subscription.subscribePay',
  'subscription.subscribeWait',
  'subscription.subscribeAwaitPayment',
  'subscription.subscribeAwaitActivation',
  'subscription.subscribeDone',
  'subscription.subscribeSbp',
  'subscription.subscribeOpenBank',
  'subscription.benefitVitamins',
  'subscription.benefitMinerals',
  'subscription.benefitSugarFree',
  'subscription.benefitVolume',
  'subscription.navHome',
  'subscription.navProfile',
  'subscription.navHistory',
  'subscription.navSettings',
  'subscription.navStub',
  'subscription.navAriaLabel',
  'subscription.brand',
  'subscription.volumeUnit',
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
