# Round-1 telemetry review — resolution log

**Date:** 2026-07-29 (round-1 fix)  
**Repo:** `viwa-telemetry`  
**Fix scope:** T-C1 (`recordSubscriptionPour` P2002 double-deduct)

---

## T-C1 — RESOLVED

| Item | Resolution |
|------|------------|
| **Issue** | Loser in `requestUuid` race could commit `client.update` deduct after `loyaltyPour.create` P2002 inside the same transaction. |
| **Fix** | Reordered tx: `FOR UPDATE` → post-lock idempotency check → balance checks → **product resolve** → **`loyaltyPour.create`** → **`client.update`** → stats. P2002 is **not** caught inside `$transaction`; outer handler fetches raced pour, asserts identity, returns idempotent result. Entire tx rolls back on P2002 — no orphan debit. |
| **Tests** | `T03-2b`, `T-C1-order`, `T-C1-failure`, `T-C1-mismatch` (unit); `loyalty-domain-pour-concurrency.spec.ts` (PostgreSQL, `describeIfDb`) |
| **Files** | `apps/api/src/loyalty/loyalty-domain.service.ts`, `apps/api/test/loyalty-domain.service.spec.ts`, `apps/api/test/loyalty-domain-pour-concurrency.spec.ts` |

---

## T-C2 — DEFERRED (isolated Postgres round)

| Item | Status |
|------|--------|
| **Issue** | `client-api.spec.ts` TOP-3 / PUT 410 cases require `DATABASE_URL`. |
| **Disposition** | Not an open product question. Full REST integration suite scheduled for **isolated Postgres CI/staging round** (same gate as concurrency integration). Unit + domain tests cover T-C1 semantics locally. |

---

## T-C3 — OPEN (ops gate, unchanged)

| Item | Status |
|------|--------|
| **Issue** | Monolithic migration backfill lock risk on large `loyalty_pours`. |
| **Disposition** | Pre-deploy ops check: table size / maintenance window / batch backfill if needed. No code change in this fix. |

---

## Noncritical (round-1) — not in this fix

T-N1–T-N17 tracked for later rounds (docs drift, push dedup, JSDoc, migration allowlist comment).

---

## Verification (round-1 fix)

| Command | Result |
|---------|--------|
| `npm test -w @viwa/api` (loyalty-domain + full suite) | pass (integration skipped without DB) |
| `npm run lint -w @viwa/api` | pass |
| `npm run typecheck -w @viwa/api` | pass |
| `npm run build` | pass |

---

## JSON (orchestrator)

```json
{
  "round": 1,
  "fix": "T-C1",
  "resolved": ["T-C1"],
  "deferred": ["T-C2-full-db-integration-suite"],
  "openOps": ["T-C3-backfill-size-gate"],
  "openQuestions": []
}
```
