# task-12-review: Subscription UX + recurring block + i18n

**Session:** `robokassa-recurring-payments`  
**Task:** [task-12.md](../../../../viwa-telemetry/docs/agents/robokassa-recurring-payments/tasks/task-12.md)  
**Round:** 3 (`code-reviewer-complex`, **scope correction — Robokassa-only checkout**)  
**Review agents (`composer-2.5-fast`):** `review-general`, `review-styles`, `review-performance`, `review-final`  
**Test report:** [task-12-test-report.md](./task-12-test-report.md)  
**Auth rule:** `.cursor/rules/universal/cabinet-auth-persistence.mdc`  
**Contract:** [`robokassa-recurring-payments.md`](../../../../viwa-telemetry/docs/contracts/robokassa-recurring-payments.md)

## Verdict

**PASS** — SubscriptionPage checkout is Robokassa-only; no visible/reachable SBP payment tabs, QR, init, or in-page poll path. Recurring/consent/pending behavior intact.  
**Residual:** R1 `npm run build` deferred; S1 duplicate switch SCSS deferred; dead-code cleanup recommendations below (nonblocking).

> **Out of scope (round 3):** Android removal — not reviewed here.

---

## Scope correction matrix (round 3)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Checkout offers **only Robokassa** | ✅ | Single `handleRobokassaPurchase` / `handlePurchase`; no `paymentMethod` state or tabs |
| No SBP payment UI reachable | ✅ | No `SbpPaymentQr`, no payment QR stage, no `subscribeSbp` / `paymentMethodSbp` keys; test `does not expose SBP payment UI in checkout` |
| No SBP init/poll from SubscriptionPage | ✅ | No `initSubscriptionPayment`, `pollPaymentUntilPaid`, `pollSubscriptionUntilCompleted` imports or calls; `PayPhase` = `idle \| loading_levels \| ready \| init \| error` only |
| Robokassa checkout controls only on SubscriptionPage | ✅ | `checkout-auto-renew-*`, `RecurringConsentModal`, pay CTA only in `SubscriptionPage`; `RecurringStatusBlock` is post-purchase management (separate switch) |
| Loyalty scan QR ≠ payment SBP | ✅ | `LoyaltyQrCode` / scan modal = client loyalty QR at machine; not subscription payment |
| autoRenew default off + consent gating | ✅ | Unchanged; consent test PASS |
| `writePendingPayment` before redirect | ✅ | Unchanged; machine-safe `returnPath` test PASS |
| Recurring block (disable / re-enable / REQUIRES_ACTION) | ✅ | Unchanged; component + page CTA tests PASS |
| Removed SBP locale keys | ✅ | `paymentMethodSbp`, `paymentMethodCard`, `subscribeSbp`, `subscribeOpenBank` absent from `subscriptionLocale.ts` and ru/en |
| Tests reflect Robokassa-only scope | ✅ | SBP QR regression test removed; negative SBP UI test added; mocks drop SBP billing methods |
| Legacy API compat may remain unused | ✅ | See dead-code recommendations — not reachable from UI |

---

## Round 1–2 closure (unchanged)

| ID | Status |
|----|--------|
| F1–F4 | ✅ Closed (round 2) |
| S2–S4 | ✅ Closed (round 2) |
| S1 duplicate switch SCSS | ⏸️ Deferred (safe) |
| R1 `npm run build` | ⚠️ Open residual |

---

## Dead-code recommendations (nonblocking)

Unreachable from current UI; safe to keep for backend/API compat until a dedicated cleanup task.

| ID | Item | Reachable? | Recommendation |
|----|------|------------|----------------|
| **D1** | `src/components/SbpPaymentQr/` (+ tests) | ❌ No production imports | Remove in tech-debt pass or keep if dashboard reuse planned |
| **D2** | `billingModule.initSubscriptionPayment` + `InitSubscriptionPaymentRequest/Response` | ❌ UI | Keep module method for API compat; optional `@deprecated` JSDoc |
| **D3** | `billingModule.pollPaymentUntilPaid` / `pollSubscriptionUntilCompleted` | ❌ UI | Superseded by `useRobokassaPaymentReturn` direct `getPaymentStatus` / `getSubscriptionStatus` loops; candidates for removal |
| **D4** | `billingModule.test.ts` — `keeps SBP initSubscriptionPayment path unchanged` | N/A | Rename to compat test or fold into D2 cleanup |
| **D5** | Removed checkout SCSS (`.paymentMethodTabs`, `.paymentQrPad`, `.paymentStage`) | ❌ | Already removed from `SubscriptionPage.module.scss` ✅ |

None of D1–D4 expose SBP checkout to users.

---

## Validation matrix (round 3)

| Criterion | Status |
|-----------|--------|
| Robokassa-only checkout on SubscriptionPage | ✅ |
| No SBP payment path reachable | ✅ |
| autoRenew / consent / pending / recurring | ✅ |
| Auth persistence | ✅ |
| Scoped tests (5 files, 22) | ✅ Reviewer re-run: **22/22 PASS** |
| `npm run build` | ⚠️ deferred (R1) |

---

## Strict JSON (gate / findings)

```json
{
  "reviewReportFile": "docs/agents/robokassa-recurring-payments/tasks/task-12-review.md",
  "sessionId": "robokassa-recurring-payments",
  "subtask": "task-12-subscription-ux-recurring-i18n",
  "round": 3,
  "date": "2026-08-10",
  "reviewAgents": ["review-general", "review-styles", "review-performance", "review-final"],
  "model": "composer-2.5-fast",
  "verdict": "PASS",
  "hasCriticalIssues": false,
  "gate": "pass",
  "scopeCorrection": {
    "robokassaOnlyCheckout": true,
    "sbpPaymentUiReachable": false,
    "sbpInitPollFromSubscriptionPage": false,
    "robokassaControlsOnlyOnSubscriptionPage": true,
    "removedSbpLocaleKeys": true,
    "testsUpdatedForScope": true
  },
  "findingsClosure": {
    "F1_F4": "closed_round2",
    "S2_S4": "closed_round2",
    "S1_duplicateSwitchScss": "deferred_safe",
    "R1_npmRunBuild": "open_residual"
  },
  "deadCodeRecommendations": [
    {
      "id": "D1",
      "severity": "low",
      "reachable": false,
      "summary": "SbpPaymentQr component orphaned — no production imports"
    },
    {
      "id": "D2",
      "severity": "low",
      "reachable": false,
      "summary": "billingModule.initSubscriptionPayment + types — API compat only"
    },
    {
      "id": "D3",
      "severity": "low",
      "reachable": false,
      "summary": "pollPaymentUntilPaid / pollSubscriptionUntilCompleted unused — return hook polls directly"
    },
    {
      "id": "D4",
      "severity": "low",
      "reachable": false,
      "summary": "billingModule SBP compat unit test — rename or remove with D2/D3 cleanup"
    }
  ],
  "scopedTests": {
    "command": "npx vitest run (5 files)",
    "result": "22/22 PASS",
    "verifiedByReviewer": true
  },
  "residualFindings": [
    {
      "id": "S1",
      "severity": "low",
      "summary": "Duplicated auto-renew switch SCSS — safe to defer"
    },
    {
      "id": "R1",
      "severity": "low",
      "summary": "npm run build still deferred"
    }
  ],
  "blockers": [],
  "commentsSummary": "Round 3 PASS: scope corrected to Robokassa-only checkout on SubscriptionPage. SBP payment tabs/QR/init/in-page poll removed and tested absent. Recurring/consent/pending unchanged. Legacy billing API + SbpPaymentQr remain as unreachable dead code (nonblocking). Loyalty scan QR is not payment SBP."
}
```
