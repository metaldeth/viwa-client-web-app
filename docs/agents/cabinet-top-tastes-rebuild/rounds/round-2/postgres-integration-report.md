# Round 2 — PostgreSQL integration gate (wiva-server)

**Date:** 2026-07-29  
**Repo under test:** `C:\wiva\viwa-telemetry` (uncommitted local tree packaged)  
**Session ids:** `20260729225124` (initial combined gate), `20260729225815` (strict `client-api` rerun)  
**Isolation:** temp role/DB per session on localhost PostgreSQL only; no production credentials, Docker, deploy, or git changes

## Environment

| Item | Value |
|------|--------|
| Host | `wiva-server` (194.67.74.147) |
| Node | v22.22.1 |
| PostgreSQL | 18.4, bound `127.0.0.1:5432` |
| `NODE_ENV` | `test` |
| Secrets | `.env.example` placeholders + test helper overrides at runtime |

## Pipeline

1. Pack/upload source (excluded `.git`, `node_modules`, `dist`, `.env`, `TEMP_*`).
2. `npm ci` (~34s), `prisma migrate deploy` — **25/25 migrations applied** including `20260729180000_client_taste_pour_stats`.
3. Manual backfill validation on seeded data (5 taste keys, 6 pours, 1100 ml total).
4. Jest: `loyalty-domain-pour-concurrency.spec.ts`, `client-api.spec.ts` (full `describeIfDb` blocks).

## Backfill / TOP-3 ordering validation

After clearing `client_taste_pour_stats` for seed client `cl_top3_bf_seed`:

- **Upsert backfill** (migration-shaped SQL + `ON CONFLICT DO UPDATE`): **5 stat rows**, `total_ml=1100`.
- **Second idempotent run:** unchanged aggregates (still 5 rows, same volumes/counts/timestamps).
- **TOP-3 query order:** `lime-mint` (400) → `peach-mango` (300) → `raspberry` (200).
- **EXPLAIN ANALYZE** (`statement_timeout=120s`): index scan on `client_taste_pour_stats_client_id_poured_volume_ml_last_poured_*`; **execution ~0.062 ms** on sample.

## Jest results

### Initial combined gate (`20260729225124`)

| Suite | Result | Notes |
|-------|--------|-------|
| `loyalty-domain-pour-concurrency.spec.ts` | **PASS** | T-C1 plain-water replay: one pour, one debit; FLAVORED concurrency: one stat row, `pour_count=1`, `poured_volume_ml=300` |
| `client-api.spec.ts` | **FAIL → fixed** | T07-3 stale assertion — see diagnosis below |

**Combined totals (initial):** 17 tests — 16 passed, 1 failed (T07-3).

### Strict `client-api` rerun (`20260729225815`, post T07-3 fix)

| Suite | Result | Notes |
|-------|--------|-------|
| `client-api.spec.ts` | **PASS** | `npx jest test/client-api.spec.ts --runInBand --no-cache`; T07-3 green with `limitResetsAt: null` |

**Strict client-api totals:** **15/15 passed**, 0 failed, 0 pending. (Suite contains 15 `it` blocks; combined gate 17 = 15 client-api + 2 concurrency.)

### T07-3 diagnosis (resolved 2026-07-29)

- **Symptom:** `T07-3: profile includes qrPayload=CLIENT_{id}` expected `limitResetsAt: Any<String>`, received `null`.
- **Root cause:** Stale integration assertion from pre–monthly-subscription migration. `loginClient()` creates a **trial client** (no `subscriptionLevelId`, `volumeMl: 1000`). After monthly-package semantics, `LoyaltyDomainService.buildClientStatus` sets `limitResetsAt` to MSK midnight **only** when `subscriptionLevel.isLegacyDailySemantics === true`; otherwise `null` (marketing monthly **and** trial/no-tier).
- **Contract (canonical):** `docs/contracts/loyalty-client-rest.md` — `limitResetsAt: null` for monthly marketing tiers; trial uses `volumeMl` / `LOYALTY_TRIAL_VOLUME_ML`, not daily MSK reset. DTOs (`ClientStatusDto`, `ClientProfileDto`) and web client types (`ClientProfileDTO.limitResetsAt?: string | null`) already allow null. Production code is correct; no derivation bug.
- **Fix:** `apps/api/test/client-api.spec.ts` T07-3 — expect `limitResetsAt: null` for trial profile. Unit coverage for legacy MSK midnight remains in `loyalty-domain.service.spec.ts` (T4/T5) and `loyalty-machine-ws*.spec.ts` (T06-8).
- **Strict DB rerun (`20260729225815`):** **PASS** — 15/15 `client-api.spec.ts` on isolated PostgreSQL; T07-3 confirms trial `limitResetsAt: null`.

## Gate verdict

| Criterion | Status |
|-----------|--------|
| Isolated temp DB + migrate deploy | **PASS** |
| Backfill idempotency + TOP-3 ordering | **PASS** (initial gate) |
| Pour concurrency + taste stat increment | **PASS** (initial gate) |
| PUT410 + computed favorites API | **PASS** |
| Full `client-api` suite (strict rerun) | **PASS** — 15/15; T07-3 `limitResetsAt: null` |

**Overall Round 2 DB integration gate:** **PASS** — combined scope validated on initial run; strict `client-api` gate confirmed **15/15** after T07-3 fix (`20260729225815`).

## Cleanup evidence

Post-run `trap` cleanup on server (both sessions):

| Session | DB | Role | Workdir |
|---------|-----|------|---------|
| `20260729225124` | `CLEANUP_VERIFY_DB=absent` | `CLEANUP_VERIFY_ROLE=absent` | `/tmp/viwa-top3-test-20260729225124` absent |
| `20260729225815` | `CLEANUP_VERIFY_DB=absent` | `CLEANUP_VERIFY_ROLE=absent` | `/tmp/viwa-top3-test-20260729225815` absent |

- `DROP DATABASE` / `DROP ROLE` executed via trap on both runs.
- Generated DB password stored only in ephemeral `.db_creds` (removed with workdir); not logged.
- No production DB/service/symlink changes were made.

Artifacts retained locally: `%TEMP%\viwa-top3-run-remote.log`, `%TEMP%\viwa-top3-summary.txt` (initial); `%TEMP%\viwa-top3-rerun-remote.log`, `%TEMP%\viwa-top3-rerun-summary.txt` (strict rerun).

## Blockers / next steps

1. ~~Investigate `limitResetsAt` null in `client-api.spec.ts` T07-3~~ — **resolved:** stale test; trial client correctly returns `null` per monthly contract.
2. ~~Strict isolated PostgreSQL rerun of `client-api.spec.ts`~~ — **done (`20260729225815`): 15/15 PASS.**
3. No further DB gate blockers for cabinet-top-tastes Round 2 telemetry scope.

### Rerun command (isolated PostgreSQL)

```powershell
cd C:\wiva\viwa-telemetry\apps\api
$env:DATABASE_URL = '<isolated-postgres-url>'
$env:NODE_ENV = 'test'
# applyMachineTestEnv equivalents + CLIENT_JWT_SECRET from test-helpers
npx jest test/client-api.spec.ts --runInBand --no-cache
```
