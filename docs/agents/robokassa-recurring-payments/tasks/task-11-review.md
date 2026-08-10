# task-11-review: Frontend API, types, return routes

**Session:** `robokassa-recurring-payments`  
**Task:** [task-11.md](../../../../viwa-telemetry/docs/agents/robokassa-recurring-payments/tasks/task-11.md)  
**Round:** 2 (`code-reviewer-complex`, **focused closure F1–F6**)  
**Review agents (`composer-2.5-fast`):** `review-general`, `review-styles`, `review-final`  
**Test report:** [task-11-test-report.md](./task-11-test-report.md)  
**Auth rule:** `.cursor/rules/universal/cabinet-auth-persistence.mdc`

## Verdict

**PASS** — все code-review findings F1–F4 и F6 закрыты; auth persistence сохранён.  
**Residual:** F5 (`npm run build` deferred), task-12 `writePendingPayment` call site, minor style nits.

---

## F1–F6 closure matrix

| ID | Round 1 finding | Round 2 status | Evidence |
|----|-----------------|----------------|----------|
| **F1** | `returnPath` без `isSafeReturnPath` | ✅ **Closed** | `resolveSafeReturnPath` + `navigateToSafeReturnPath` в hook; `goBack()` на обеих страницах; `resolvePaymentReturnAuthRedirect` для auth redirect |
| **F2** | HomeAuthGuard теряет `/m/:serial` | ✅ **Closed** | `/payment/*` → `resolvePaymentReturnAuthRedirect()` (returnPath → `getMachineAuthPath` → `machineSerial` → `/auth`) |
| **F3** | `retry()` не в UI | ✅ **Closed** | `PaymentSuccessPage` кнопка `paymentReturnRetryCheck` на `phase === 'error'` |
| **F4** | Subscription poll + extra 120s | ✅ **Closed** | Оба while-цикла используют один `deadline = startedAt + BILLING_POLL_MAX_MS` |
| **F5** | `npm run build` deferred | ⚠️ **Open (residual)** | `tsc -b` + scoped vitest PASS; full build не запускался |
| **F6** | Нет timeout/unmount/auth tests | ✅ **Closed** | 30 scoped tests: timeout, unmount, unsafe path, auth redirect, retry UI |

---

## Files reviewed (round 2 delta)

| File | Change verified |
|------|-----------------|
| `src/constants/pendingPayment.ts` | `resolveSafeReturnPath`, `resolvePaymentReturnAuthRedirect`, `sanitizeMachineSerial` |
| `src/constants/pendingPayment.test.ts` | Safe/unsafe paths, auth redirect order |
| `src/hooks/useRobokassaPaymentReturn.ts` | Shared deadline, safe navigate |
| `src/hooks/useRobokassaPaymentReturn.test.tsx` | +timeout, +unmount, +unsafe returnPath |
| `src/pages/HomeAuthGuard/HomeAuthGuard.tsx` | Machine-aware `/payment/*` redirect |
| `src/pages/HomeAuthGuard/HomeAuthGuard.test.tsx` | Payment → machine auth |
| `src/pages/PaymentSuccessPage/PaymentSuccessPage.tsx` | Retry + safe goBack |
| `src/pages/PaymentFailedPage/PaymentFailedPage.tsx` | Safe goBack |
| `src/assets/locales/{ru,en}.json` | +`paymentReturnRetryCheck` (13 keys total) |

---

## Validation matrix (round 2)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Routes `/payment/success`, `/payment/failed` — no query | ✅ | Unchanged; tests PASS |
| Auth persistence on poll 5xx/offline | ✅ | `isTransientRefreshError`; hook + failed-page tests keep tokens |
| `returnPath` validation on **every** navigation | ✅ | Hook success navigate + both page `goBack()` + auth redirect helper |
| Machine serial trust/normalization | ✅ | `sanitizeMachineSerial` (`/^[A-Za-z0-9-]+$/`); stripped on read/write |
| Machine-aware auth redirect (no tokens) | ✅ | `HomeAuthGuard` + `resolvePaymentReturnAuthRedirect` tests |
| Shared poll deadline (payment + subscription) | ✅ | Single `deadline` variable in hook |
| Retry UI on error | ✅ | Success page; test clicks retry |
| Polling timeout / unmount | ✅ | Tests: expired window, unmount no navigate |
| Unified status endpoint | ✅ | Unchanged |
| SBP regression | ✅ | Unchanged |
| i18n ru/en | ✅ | 13 keys; `locale:verify` PASS |
| Scoped tests (8 files, 30) | ✅ | Re-run round 2: **30/30 PASS** |
| `npm run build` | ⚠️ | **Deferred** (F5 residual) |

---

## review-general (round 2)

**Суммаризация:** Round 1 findings addressed via centralized `pendingPayment` helpers. Flow: task-12 writes session → return → guard (machine auth if no tokens) → hook polls within single 120s window → safe navigate or retry.

**Проблемы:** 🔴 none. 🟡 residual only (F5 build, task-12 writer).

**Вывод:** ✅ Logic and security hardening complete for task-11 scope.

---

## review-styles (round 2)

**Improvements:** `PaymentSuccessPage` now uses Consta `Text` for status line.

**Residual nits (non-blocking):**
- [`PaymentSuccessPage.module.scss:5-6,12-13`] Hardcoded px gaps/font-size on `.statusText` (partially redundant with `Text size="s"`)
- [`PaymentFailedPage.tsx:12`] Unused `returnPath` destructure from hook

**Вывод:** ✅ Acceptable; style nits optional cleanup.

---

## review-final (round 2)

### Acceptance (task-11.md)

| Criterion | Status |
|-----------|--------|
| AC-21: routes without query | ✅ |
| AC-20: auth preserved on transient poll errors | ✅ |
| Unified status endpoint | ✅ |
| Types match contracts | ✅ |
| SBP regression | ✅ |
| F1–F4, F6 fixes | ✅ |
| `npm run lint`, `npm run build` | ⚠️ scoped lint PASS; **full build deferred (F5)** |

### Итог

✅ **PASS** for task-11 code review round 2. Ready for task-completion after `npm run build` gate and task-12 integration.

---

## Strict JSON (gate / findings)

```json
{
  "reviewReportFile": "docs/agents/robokassa-recurring-payments/tasks/task-11-review.md",
  "sessionId": "robokassa-recurring-payments",
  "subtask": "task-11-frontend-api-return-routes",
  "round": 2,
  "date": "2026-08-10",
  "reviewAgents": ["review-general", "review-styles", "review-final"],
  "model": "composer-2.5-fast",
  "verdict": "PASS",
  "hasCriticalIssues": false,
  "gate": "pass",
  "findingsClosure": {
    "F1_returnPathValidation": "closed",
    "F2_machineAuthRedirect": "closed",
    "F3_retryUI": "closed",
    "F4_sharedDeadline": "closed",
    "F5_npmRunBuild": "open_residual",
    "F6_testsTimeoutUnmount": "closed"
  },
  "scopedTests": {
    "command": "npx vitest run (8 files)",
    "result": "30/30 PASS",
    "verifiedByReviewer": true
  },
  "validationChecklist": {
    "routesExactNoQuery": true,
    "authPersistencePollTransient": true,
    "returnPathValidationAllNavigations": true,
    "machineSerialSanitization": true,
    "machineAwareAuthRedirect": true,
    "sharedPollDeadline": true,
    "retryUI": true,
    "pollingTimeoutUnmountTests": true,
    "unifiedStatusEndpoint": true,
    "sbpRegression": true,
    "i18nA11yResponsive": true,
    "npmRunBuild": "deferred"
  },
  "residualFindings": [
    {
      "id": "R1",
      "severity": "low",
      "area": "verification",
      "summary": "npm run build still deferred (F5); required before task-completion"
    },
    {
      "id": "R2",
      "severity": "low",
      "area": "integration",
      "summary": "writePendingPayment call site in SubscriptionPage deferred to task-12"
    },
    {
      "id": "R3",
      "severity": "low",
      "area": "styles",
      "summary": "PaymentSuccessPage.module.scss hardcoded px on .statusText; PaymentFailedPage unused returnPath destructure"
    },
    {
      "id": "R4",
      "severity": "low",
      "area": "tests",
      "summary": "No explicit test for subscription phase hitting shared deadline near PAID (implementation correct)"
    }
  ],
  "blockers": [],
  "commentsSummary": "Round 2 PASS: F1-F4 and F6 closed with resolveSafeReturnPath, machine auth redirect, shared deadline, retry UI, and expanded tests. Auth persistence intact. Residual: full build (F5), task-12 writer, minor style nits."
}
```
