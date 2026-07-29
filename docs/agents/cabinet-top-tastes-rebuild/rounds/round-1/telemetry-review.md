# Telemetry Backend Review — Cabinet TOP-3 (Round 1 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-telemetry` (`C:\wiva\viwa-telemetry`)  
**Scope:** Uncommitted backend implementation — computed `favoriteTasteKeys`, migration/backfill, domain stats, PUT 410, WS/offline push  
**Spec sources:** `task-telemetry-report.md`, `docs/contracts/loyalty-client-rest.md`, `docs/contracts/client-ws.md`  
**Reviewers:** review-general, review-performance, review-docs, review-final (`composer-2.5-fast`)  
**Mode:** Read-only — no code edits

---

## Executive summary

The implementation delivers the analyst/task spec: lifetime TOP-3 `favoriteTasteKeys` from `client_taste_pour_stats`, transactional upsert on new FLAVORED pours, read path via indexed `findMany`, PUT deprecation to **410 Gone**, WS contract updated, offline reconcile profile push on accepted non-idempotent pours only, rollback SQL retained.

Architecture and core TOP-3 contracts are largely aligned. Open gates: pre-existing **`requestUuid` P2002 double volume deduct** (T-C1), **DB integration tests skipped** without `DATABASE_URL` (T-C2), **monolithic migration backfill** lock risk (T-C3). Docs drift remains: stale `INVALID_TASTE` error-code row, incomplete WS field/trigger lists. TOP-3 stats path itself is race-safe (increment only after successful `loyaltyPour.create`).

**hasCriticalIssues:** `true` (`T-C1`, `T-C2`, `T-C3`)

---

## Requirement compliance matrix

| Requirement (spec / contracts) | Status | Evidence |
|--------------------------------|--------|----------|
| Computed TOP-3 from lifetime FLAVORED pour volume | ✅ | `ClientTastePourStats`, `incrementClientTastePourStats`, `getTopFavoriteTasteKeys` |
| Sort: volume desc → lastPouredAt desc → tasteMediaKey asc | ✅ | `TOP_FAVORITE_TASTE_ORDER_BY`, migration index matches |
| Length 0–3, never padded | ✅ | `take: 3`, `buildClientStatus` passes array as-is |
| Plain water / anonymous / invalid keys skipped | ✅ | `shouldTrackClientTastePourStats` + `isValidTasteMediaKey` |
| Idempotent replay does not increment stats | ✅ | Stats only after successful create; early return on existing pour |
| `GET /client/me` returns computed keys | ✅ | `getClientStatus` → `getTopFavoriteTasteKeys` |
| `PUT /me/favorite-tastes` → 410 `GONE` | ✅ | `client-favorite-tastes.controller.ts`, `goneApiError` |
| `client_favorite_tastes` retained, API unused | ✅ | Schema unchanged; `replaceFavoriteTastes` removed |
| WS `client.profile.updated` includes `favoriteTasteKeys` | ✅ | Existing mapper; contract updated |
| Profile push after online pour + offline reconcile (non-idempotent) | ✅ | `telemetry-pour-report.handler.ts`, reconcile service |
| Migration + backfill + down.sql | ✅ | `20260729180000_client_taste_pour_stats` |
| Unit tests for core paths | ✅ | `loyalty-domain.service.spec.ts`, util spec, reconcile spec |
| DB integration tests | ⚠️ | `client-api.spec.ts` uses `describeIfDb` — skipped without PostgreSQL |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| **T-C1** | requestUuid race | **RESOLVED (round-1 fix).** `recordSubscriptionPour` now creates `loyaltyPour` **before** `client.update`; P2002 propagates out of `$transaction` (rollback, no orphan debit). Post-lock idempotency check + outer catch with identity assert. Tests: `T-C1-order`, `T-C1-failure`, `T-C1-mismatch`, `loyalty-domain-pour-concurrency.spec.ts`. |
| **T-C2** | Tests / verification | **`GET /client/me` TOP-3 ordering and `PUT` 410 tests live inside `describeIfDb`** (`client-api.spec.ts:25`). With no `DATABASE_URL`, both are skipped — the task report’s “344 passed” run did not execute the only end-to-end TOP-3 REST assertions. **Gate:** run in CI/staging with PostgreSQL before release. |
| **T-C3** | Migration ops | **Monolithic backfill in Prisma migration** (`migration.sql:27–90`): single-tx `INSERT … GROUP BY` + full `UPDATE loyalty_pours` for snapshot. On large `loyalty_pours` — long locks / deploy timeout risk ([review-performance](15751138-923d-496c-8e16-ac5902d5e524)). **Gate:** confirm table size; if large, batch backfill outside migrate or schedule maintenance window. |

> **Round-1 verdict:** T-C1 loyalty race (pre-existing). T-C2 DB integration not proven locally. T-C3 deploy risk on large pour history. Core TOP-3 semantics otherwise sound.

---

## Noncritical findings (🟡)

### Architecture / general (review-general) — [review-general](59b24c05-e7d6-406e-8be8-20e06fb639e2)

| ID | Finding |
|----|---------|
| T-N1 | **`lastPouredAt` via separate `updateMany`** (not in upsert `update`) — correct for backdated offline `soldAt`; volume grows, timestamp does not regress. |
| T-N2 | **Migration hardcodes 14 taste keys** in SQL while runtime uses `TASTE_MEDIA_KEYS` — allowlist drift risk. |
| T-N3 | **Two write ops per flavored pour** for snapshot (`create` then `update`) — acceptable; could set snapshot in one INSERT. |
| T-N4 | **`offline-entitlement-grant.service.ts:248`** passes `[]` to `buildClientStatus` — intentional (grant signing). |
| T-N5 | **Missing tests:** tie-break / exactly-3-of-4+ tastes; P2002 race on FLAVORED path asserting stats upsert not called. |
| T-N6 | **Untracked `viwa-telemetry/.cursor/`** — exclude from commit. |
| T-N18 | **PUT may return 400 before 410:** global `ValidationPipe` validates `UpdateFavoriteTastesDto` before `goneApiError`. Malformed/missing body → 400, not 410. Contract implies Gone for the endpoint; relax DTO/pipe on deprecated route if strict 410 required. |
| T-N19 | **Dead code after deprecation:** `toFavoriteTastesResponse`, `FavoriteTastesResponseDto` unused — cleanup. |
| T-N20 | **Controller formatting:** excessive blank lines in `client-favorite-tastes.controller.ts` — style only. |

### Performance (review-performance) — [review-performance](15751138-923d-496c-8e16-ac5902d5e524)

| ID | Finding |
|----|---------|
| T-N7 | **Composite TOP-3 index matches `orderBy`** — design OK; index-only top-N per client. |
| T-N8 | **Per FLAVORED pour ~4–5 SQL in tx** + **`pushToClient` re-fetches full `getClientStatus`** after pour already built `clientStatus` — duplicate top-3/client queries on hot path. Prefer `pushToClient(status)`. |
| T-N9 | *(Elevated to T-C3)* Monolithic migration backfill. |
| T-N10 | **`pouredVolumeMl` is `Int`:** overflow ~2³¹ ml/taste theoretically; low risk at ~700 ml/pour. Prefer `BIGINT` or document. |
| T-N15 | Double product lookup (handler + domain tx); snapshot via separate `loyaltyPour.update`; top-3 query holds client `FOR UPDATE` lock longer than needed. |

### Documentation (review-docs) — [review-docs](c48845d7-f219-4a58-b0a6-24792033d805)

| ID | Finding |
|----|---------|
| T-N11 | **Missing JSDoc on exports** (skill 🔴): `TOP_FAVORITE_TASTE_ORDER_BY`, `TOP_FAVORITE_TASTE_LIMIT`, `shouldTrackClientTastePourStats`, `ClientFavoriteTastesController`. Treated as non-blocking hygiene for this round (not runtime). |
| T-N12 | **Stale error-code row:** `loyalty-client-rest.md:387` still lists `INVALID_TASTE` for `PUT /favorite-tastes`; endpoint always returns `GONE` (410). Replace or remove. |
| T-N13 | **`down.sql` / core TOP-3 semantics / PUT 410 envelope** — accurate and aligned with code. |
| T-N14 | **WS contract incomplete:** `client-ws.md` profile field list omits monthly/pool fields present in `toClientProfileUpdate()`; push-trigger list understates billing/machine-WS/telemetry pour paths. |
| T-N16 | **check-code example** (`loyalty-client-rest.md` ~148–164) omits `favoriteTasteKeys` though profile mapper includes it. |
| T-N17 | Migration SQL allowlist should comment-link `taste-media-keys.ts` (same as T-N2). |

### Security

| ID | Finding |
|----|---------|
| — | **No new client write surface for taste stats** — stats updated only in `recordSubscriptionPour` server path with product allowlist. PUT 410 rejects before domain. No auth bypass observed. |

---

## Reviewer stage summaries

### review-general

**Суммаризация:** Computed favorites replace manual favorites. Pour → tx stats upsert → top-3 → status/WS; idempotent skips stats.  
**Валидация логики:** ⚠️ T-C1 P2002 double volume deduct; TOP-3 stats path OK.  
**Вывод:** ⚠️ 1 critical (T-C1) + suggestions incl. PUT 400-vs-410 (T-N18), dead DTO (T-N19), test gaps (T-N5).

### review-performance

**Вывод:** ⚠️ Index OK. 🔴 T-C3 backfill lock risk + duplicate `getClientStatus` on push (T-N8). Overflow low practical risk (T-N10).

### review-docs

**Вывод:** ⚠️ Core TOP-3 + PUT 410 + rollback docs accurate. Drift: stale `INVALID_TASTE` (T-N12), incomplete WS fields/triggers (T-N14), missing JSDoc (T-N11).

### review-final — [review-final](b7a20dbc-69b1-4024-96f1-cf789d708bbb)

**Статус предыдущих ревью:** T-C1–T-C3 still open; docs/perf/general N* tracked.

**Reported by final (then re-checked):**
| Finding | Final said | Re-check (parent, post-merge) |
|---------|------------|-------------------------------|
| TS2322 narrowing in `incrementClientTastePourStats` | 🔴 typecheck fail | ✅ Fixed — `trackedKey` cast; `npm run typecheck -w @viwa/api` exit 0 |
| `toHaveBeenCalledBefore` in spec | 🔴 TS2551 | ✅ Gone — tests use `callOrder`; loyalty + util specs **20 passed** |
| Untracked migration/util files | 🟡 must stage | Still untracked — stage before commit; exclude `.cursor/` |
| Stale `INVALID_TASTE` | 🟡 | Still present (`loyalty-client-rest.md:387`) — T-N12 |
| `versionName` bump | 🟡 | Still required before deployable commit |
| Task report “typecheck pass” | 🟡 contradicted at final time | Now consistent with tree |

**Additional final notes (kept as 🟡):** `gen_random_uuid()` vs `::text` inconsistency in migration; no WS payload test for favoriteTasteKeys change; AGENTS.md gate is `typecheckCommand` not only `nest build`.

**Итог:** ⚠️ **Not ready to commit** until T-C1 disposition, CI DB integration (T-C2), backfill size check (T-C3). Typecheck/unit blockers reported by final appear **already fixed** in current tree — do not re-open as T-C4.

---

## Rollback assessment

| Step | Assessment |
|------|------------|
| `down.sql` drops stats table + snapshot column | ✅ Correct; preserves `client_favorite_tastes` |
| API revert re-enables manual PUT | ⚠️ Requires controller/service revert — not automatic |
| Deploy order | ✅ Documented: old API first, then down migration |

---

## JSON summary (orchestrator)

```json
{
  "round": 1,
  "repo": "viwa-telemetry",
  "hasCriticalIssues": true,
  "criticalIds": ["T-C1", "T-C2", "T-C3"],
  "requirementCompliance": "pass-with-reservations",
  "verdict": "not-ready-until-race-db-and-backfill-gates",
  "top3ImplementationQuality": "good",
  "recommendedNextSteps": [
    "Fix or formally accept T-C1 (requestUuid P2002 double deduct) with integration test",
    "Run client-api.spec.ts TOP-3 cases in CI with DATABASE_URL",
    "Confirm loyalty_pours size / batch backfill before migrate deploy (T-C3)",
    "Replace INVALID_TASTE row with GONE in loyalty-client-rest.md error table",
    "Ensure deprecated PUT always 410 (bypass body ValidationPipe) if contract requires it",
    "Stage untracked migration + util/spec; exclude .cursor/; bump versionName before commit",
    "Add JSDoc to client-taste-pour-stats.util + ClientFavoriteTastesController exports",
    "Expand client-ws.md profile fields and push triggers to match mapper/call sites"
  ]
}
```

---

## Files reviewed

- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260729180000_client_taste_pour_stats/migration.sql`
- `apps/api/prisma/migrations/20260729180000_client_taste_pour_stats/down.sql`
- `apps/api/src/loyalty/client-taste-pour-stats.util.ts`
- `apps/api/src/loyalty/loyalty-domain.service.ts`
- `apps/api/src/loyalty/client-api/client-favorite-tastes.controller.ts`
- `apps/api/src/common/api-errors.util.ts`
- `apps/api/src/offline-entitlement/offline-entitlement-reconcile.service.ts`
- `apps/api/src/offline-entitlement/offline-entitlement.module.ts`
- `apps/api/test/client-taste-pour-stats.util.spec.ts`
- `apps/api/test/loyalty-domain.service.spec.ts`
- `apps/api/test/client-api.spec.ts`
- `apps/api/test/offline-entitlement-grant-reconcile.service.spec.ts`
- `docs/contracts/loyalty-client-rest.md`
- `docs/contracts/client-ws.md`
