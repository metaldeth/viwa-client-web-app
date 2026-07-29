# Telemetry Backend Review — Cabinet TOP-3 (Round 2 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-telemetry` (`C:\wiva\viwa-telemetry`)  
**Scope:** Re-review T-C1 fix + full current diff (computed TOP-3, migration, 410 PUT, WS/offline push)  
**Prior:** `rounds/round-1/telemetry-review.md`, `rounds/round-1/telemetry-review-resolution.md`  
**Mode:** Read-only — no code edits

---

## Executive summary

**T-C1 is verified fixed.** `recordSubscriptionPour` now acquires `FOR UPDATE` first, re-checks `requestUuid` under lock, creates `loyaltyPour` **before** `client.update`, and handles P2002 **outside** the transaction (full rollback, outer idempotent read + identity assert). Stats increment only after successful create+debit; failure on stats aborts the whole tx. Unit tests cover order, P2002 rollback, identity mismatch, and TOP-3 paths; PostgreSQL concurrency specs exist but are skipped locally.

No regressions found in migration/backfill, top ordering, 410 semantics, or offline push gating. Round-1 noncritical items (docs drift, push dedup, JSDoc) unchanged.

**hasCriticalIssues:** `true` — **code blockers cleared**; remaining **T-C2** (DB integration gate) and **T-C3** (ops backfill gate).

---

## T-C1 fix verification

| Check | Round 1 bug | Round 2 status | Evidence |
|-------|-------------|----------------|----------|
| Create before debit | Debit committed on P2002 loser | ✅ Fixed | `loyalty-domain.service.ts:305–333` — `loyaltyPour.create` then `client.update` |
| P2002 inside tx | Returned idempotent, committed debit | ✅ Fixed | No inner P2002 catch; `catch` at `:356–367` outside `$transaction` |
| Client lock ordering | Stale pre-lock `findUnique` | ✅ Fixed | `FOR UPDATE` at `:235–237` **before** post-lock `findUnique` at `:239–245` |
| Concurrent same `requestUuid` | Double deduct possible | ✅ Mitigated | Second waiter sees existing pour after lock; unit `T-C1-order`, `T03-2b`; DB `T-C1-db` (gated) |
| Stats exactly once | N/A (was OK) | ✅ | Stats after create+update; idempotent early return skips upsert; `T-top-replay`, `T-C1-db` FLAVORED |
| Failure rollback | Debit without pour / partial commit | ✅ | `T-C1-failure`: stats throw after create+update → tx aborts (mock); pour snapshot in single create |
| Outer identity assert | N/A | ✅ | `T-C1-mismatch` → `CONFLICT` on clientId mismatch; no `client.update` |
| P2002 FLAVORED stats skip | Gap in round 1 | ✅ | P2002 path never reaches stats (`create` fails first) |

### Transaction flow (current)

```
try $transaction:
  FOR UPDATE client
  findUnique(requestUuid) → idempotent return if exists
  balance / pool checks
  resolve product + tasteMediaKey (FLAVORED)
  loyaltyPour.create (incl. tasteMediaKeySnapshot)
  client.update (debit)
  incrementClientTastePourStats (if tracked)
  getTopFavoriteTasteKeys → buildClientStatus
catch P2002 request_uuid:
  findUnique (outer prisma) → assert identity → buildIdempotentPourResult
```

**Improvements since round 1:** snapshot written in `create` (no follow-up `loyaltyPour.update`); product key resolved once and passed to stats increment.

---

## Test realism assessment

| Test | Type | Realism | Notes |
|------|------|---------|-------|
| `T03-2b` | Unit mock | ✅ Good | Asserts `client.update` **not** called on P2002; outer idempotent |
| `T-C1-order` | Unit mock | ✅ Good | `callOrder === ['create', 'update']` |
| `T-C1-failure` | Unit mock | ⚠️ Partial | Proves throw + order; **does not** assert DB rollback (mock tx) |
| `T-C1-mismatch` | Unit mock | ✅ Good | Outer handler rejects cross-client raced uuid |
| `T-top*` | Unit mock | ✅ Good | FLAVORED upsert, replay skip, plain skip, order contract |
| `T-C1-db` (×2) | Integration PG | ✅ High | `Promise.all` concurrent same `requestUuid`; volume + stats counts — **`describeIfDb` skipped locally** |
| `client-api.spec` TOP-3 / PUT 410 | Integration PG | ✅ High | E2E REST — **`describeIfDb` skipped locally** |

**Local run (parent):** `typecheck` exit 0; loyalty + util + reconcile specs **32 passed**, concurrency suite **2 skipped**.

---

## Regression re-check (unchanged areas)

| Area | Status | Notes |
|------|--------|-------|
| Prisma `ClientTastePourStats` + index | ✅ | Sort index matches `TOP_FAVORITE_TASTE_ORDER_BY` |
| Migration + backfill + `down.sql` | ✅ | Unchanged; allowlist hardcoded (T-N2/T-C3) |
| Top-3 read / ordering | ✅ | `take: 3`, desc/desc/asc |
| `PUT /me/favorite-tastes` → 410 | ✅ | `goneApiError` + `@HttpCode(410)` |
| Offline reconcile push | ✅ | `!result.idempotent` only (`offline-entitlement-reconcile.service.ts:174–176`) |
| Online pour push | ✅ | Existing `telemetry-pour-report.handler.ts` gating preserved |
| Security (no client stats write) | ✅ | Stats server-side only |

---

## Critical / gate findings

| ID | Status | Finding |
|----|--------|---------|
| **T-C1** | ✅ **RESOLVED** | Create-before-debit + outer P2002 + post-lock idempotency — verified in code and unit tests |
| **T-C2** | 🔴 **OPEN (DB integration gate)** | PostgreSQL-required tests not executed locally |
| **T-C3** | 🟠 **OPEN (ops gate)** | Monolithic backfill; confirm `loyalty_pours` size before deploy |

### T-C2 — DB integration gate (detail)

Must pass in CI/staging with `DATABASE_URL`:

| Suite | Tests |
|-------|-------|
| `apps/api/test/loyalty-domain-pour-concurrency.spec.ts` | `T-C1-db`: concurrent same `requestUuid` → 1 pour, 1 deduct, 0/1 stats |
| `apps/api/test/client-api.spec.ts` | `PUT /client/me/favorite-tastes returns 410 Gone` |
| `apps/api/test/client-api.spec.ts` | `GET /client/me returns computed favoriteTasteKeys from FLAVORED pours` |

Until these run green on PostgreSQL, REST/concurrency proof remains **unverified in CI**.

### T-C3 — ops gate (unchanged)

Pre-deploy: estimate `loyalty_pours` row count; schedule maintenance window or batched backfill if large.

---

## Noncritical (carried from round 1)

| ID | Item |
|----|------|
| T-N8 | `pushToClient` re-fetches `getClientStatus` after pour already built status |
| T-N12 | Stale `INVALID_TASTE` row in `loyalty-client-rest.md:387` |
| T-N18 | PUT may return 400 on malformed body before 410 |
| T-N11 | Missing JSDoc on util exports / controller |
| T-N2 | Migration allowlist drift vs `taste-media-keys.ts` |

---

## JSON summary

```json
{
  "round": 2,
  "repo": "viwa-telemetry",
  "hasCriticalIssues": true,
  "codeCriticalIssues": false,
  "resolvedCriticalIds": ["T-C1"],
  "openGateIds": ["T-C2", "T-C3"],
  "dbIntegrationGate": {
    "status": "open",
    "requires": "DATABASE_URL / PostgreSQL CI or staging",
    "suites": [
      "loyalty-domain-pour-concurrency.spec.ts (2 tests)",
      "client-api.spec.ts TOP-3 GET + PUT 410"
    ],
    "localStatus": "skipped (2 concurrency + describeIfDb REST)"
  },
  "tC1FixVerified": true,
  "regressions": "none",
  "verdict": "ready-for-commit-after-db-ci-and-ops-check"
}
```

---

## Verdict

**T-C1 fix: approved.** Transaction ordering, lock discipline, and outer P2002 handling correctly prevent double volume deduction; stats remain exactly-once.

**Not release-ready until:** T-C2 DB integration gate passes on PostgreSQL; T-C3 ops sign-off on migration backfill.

**hasCriticalIssues:** `true` (gates only — no open code defects from this re-review)

**DB integration gate:** **OPEN** — run `loyalty-domain-pour-concurrency.spec.ts` + `client-api.spec.ts` TOP-3/410 cases in CI with `DATABASE_URL`.
