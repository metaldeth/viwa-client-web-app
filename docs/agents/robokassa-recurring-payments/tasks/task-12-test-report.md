# task-12-test-report — Subscription UX + recurring block + i18n

**Session:** `robokassa-recurring-payments`  
**Repo:** `viwa-client-web-app`  
**Date:** 2026-08-10  
**Wave:** 4 frontend  
**Round:** 3 (scope correction — Robokassa-only checkout)

## Scope

- `SubscriptionPage`: **Robokassa-only** subscription purchase on web cabinet; no SBP tabs/QR/init in checkout UI
- Auto-renew opt-in (default off), consent modal, `writePendingPayment` + hosted redirect
- `RecurringStatusBlock` + `RecurringConsentModal` on subscription screen only
- Backend SBP API/types preserved (`billingModule.initSubscriptionPayment` unchanged)

## Round 3 changes (scope correction)

| Change | Detail |
|--------|--------|
| Payment method UI | Removed SBP vs card tabs; checkout uses Robokassa hosted init only |
| SBP checkout path | Removed `handleSbpPurchase`, in-modal QR/polling, `SbpPaymentQr` import |
| State cleanup | Removed `paymentMethod`, `paymentUrl`, SBP pay phases |
| Styles | Removed `.paymentMethodTabs`, `.paymentStage`, `.paymentQrPad`, `.payLink` |
| i18n | Removed task-specific keys: `paymentMethodSbp`, `paymentMethodCard`, `subscribeSbp`, `subscribeOpenBank`, unused await/done checkout strings |
| locale verify script | Dropped obsolete SBP checkout keys from `REQUIRED_KEYS`; added task-12 recurring/payment-return keys (170 keys parity) |

## Round 2 changes (review fixes)

| Finding | Fix |
|---------|-----|
| F1 | `purchaseInFlightRef` mutex |
| F2 | Localized recurring errors |
| F3/F4 | Consent + UC-11 page tests |
| S2–S4 | Style/i18n nits |

## Tests run

| Command | Result |
|---------|--------|
| Scoped vitest (5 files, 22 tests) | **PASS** |
| `npx tsc -b` | **PASS** |
| `npm run locale:verify` | **PASS** |
| Scoped eslint | **PASS** |
| `npm run build` | **Deferred** |

### Scoped vitest files

| File | Tests |
|------|-------|
| `RecurringConsentModal.test.tsx` | 2 |
| `RecurringStatusBlock.test.tsx` | 3 |
| `useRecurringAgreement.test.ts` | 3 |
| `SubscriptionPage.test.tsx` | 6 (Robokassa-only; no SBP regression test) |
| `pendingPayment.test.ts` | 8 |

## Acceptance mapping

| Criterion | Status |
|-----------|--------|
| Robokassa-only checkout on subscription screen | ✅ |
| No SBP option in purchase UI | ✅ |
| Backend SBP API preserved | ✅ |
| Auto-renew default off; consent when enabled | ✅ |
| `writePendingPayment` before redirect | ✅ |
| Recurring block on same screen | ✅ |
| Duplicate pay CTA guard | ✅ |
| `locale:verify` | ✅ |

## Not tested (deferred)

- Full `npm run build` / E2E Robokassa redirect
- SBP flows outside subscription checkout (legacy modules unchanged)

## Notes

- Robokassa/recurring UI components render only on `SubscriptionPage`.
- Payment return pages (`/payment/success`, `/payment/failed`) unchanged from task-11.
