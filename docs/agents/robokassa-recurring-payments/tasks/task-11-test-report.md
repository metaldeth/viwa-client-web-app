# task-11-test-report — Frontend API, types, return routes

**Session:** `robokassa-recurring-payments`  
**Repo:** `viwa-client-web-app`  
**Date:** 2026-08-10  
**Round:** 2 (review fixes F1–F6)

## Scope

- Billing API: Robokassa init, unified payment status, recurring GET/PATCH
- Types: `billing.ts`, `recurring.ts`
- Hook: `useRobokassaPaymentReturn` (sessionStorage + 2s / 120s polling, single deadline window)
- Pages: `/payment/success`, `/payment/failed` (no query params)
- Safe return path + machine auth redirect hardening (round 2)
- i18n: 13 `subscription.paymentReturn*` keys (ru/en)
- Routes: top-level, `HomeAuthGuard` with machine-aware `/payment/*` redirect

## Round 2 changes

| Finding | Fix |
|---------|-----|
| F1 | `resolveSafeReturnPath` + `isSafeReturnPath` on all navigations (hook + pages) |
| F2 | `HomeAuthGuard` uses `resolvePaymentReturnAuthRedirect()` on `/payment/*` |
| F3 | `PaymentSuccessPage` retry button on error phase |
| F4 | Subscription poll shares `startedAt + 120s` deadline (no extra 120s window) |
| F6 | Tests: timeout, unmount, unsafe returnPath, auth redirect, retry UI |
| — | Optional `machineSerial` on pending payload; sanitized on read/write |

## Tests run

| Command | Result |
|---------|--------|
| Scoped vitest (8 files, 30 tests) | PASS |
| `npx tsc -b` | PASS |
| `npm run locale:verify` | PASS (147 keys ru/en parity) |
| Scoped eslint | PASS |
| `npm run build` | **Deferred** per task scope |

## Acceptance mapping

| Criterion | Status |
|-----------|--------|
| AC-21: routes without query | ✅ |
| AC-20: auth preserved on transient poll errors | ✅ |
| Unified status endpoint | ✅ |
| Types match contracts | ✅ |
| SBP regression | ✅ |
| returnPath validation (F1) | ✅ |
| Machine auth redirect on unauthenticated return (F2) | ✅ |
| `npm run build` | Deferred |

## Not tested (deferred)

- Full `npm run build` / E2E Robokassa redirect
- SubscriptionPage `writePendingPayment` call site (task-12)

## Notes

- `writePendingPayment` accepts optional `machineSerial`; task-12 should pass `{ paymentId, startedAt, returnPath, machineSerial? }`.
- Unsafe/missing `returnPath` falls back to `/m/:serial/home` when `machineSerial` present, else `/home`.
- Auth redirect order: safe `returnPath` → `getMachineAuthPath` → `machineSerial` → `/auth`.
