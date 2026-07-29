# task-03-test-report

**Task:** Public tiers/tastes + CORS + contracts/tests T1–T3, T8  
**Repo:** `viwa-telemetry`  
**Date:** 2026-07-29

## Scope delivered

- `PublicApiModule` with `GET /api/v1/public/subscription-levels` and `GET /api/v1/public/tastes`
- `SubscriptionLevelService.listMarketingSubscriptionLevels()` wired to public controller (`schemaVersion: 2`, `monthlyVolumeMl`, no `dailyVolumeMl`)
- `PublicTastesService` — DRY re-export from `TASTE_MEDIA_KEYS` / `TASTE_MEDIA_KEY_LABELS_RU` (14 items)
- CORS allowlist for `/api/v1/public/*` via `registerPublicCors()` in `main.ts` + test factory
- Rate limit 60/min (`@Throttle`) + Cache-Control headers per architecture §1
- Integration tests: T2 (public legacy exclusion), T8 (OPTIONS preflight)

## Test matrix (T1–T3, T8)

| ID | Invariant | File | Result |
|----|-----------|------|--------|
| T1 | `listMarketingSubscriptionLevels()` returns exactly 2 items | `subscription-level.service.spec.ts` | PASS |
| T2 | Legacy grandfather tier absent from public response | `client-api.spec.ts` | SKIP (no `DATABASE_URL`) |
| T3 | All marketing tiers `monthlyVolumeMl` ∈ {12000, 18000} | `subscription-level.service.spec.ts` | PASS |
| T8 | CORS preflight `Origin: https://vitamin-water.ru` → 204 + Allow-Origin | `public-api.spec.ts` | SKIP (no `DATABASE_URL`) |

Additional (non-matrix):

| Check | File | Result |
|-------|------|--------|
| Public tastes 14 keys + RU labels | `public-api.spec.ts` | SKIP (no `DATABASE_URL`) |
| Cache-Control on subscription-levels | `public-api.spec.ts` | SKIP (no `DATABASE_URL`) |

## Verification commands

```powershell
cd c:\wiva\viwa-telemetry
npm run lint          # exit 0 (web: 2 pre-existing warnings)
npm run typecheck     # exit 0
cd apps\api
node --experimental-vm-modules ../../node_modules/jest/bin/jest.js subscription-level client-api public-api --runInBand
# 9 passed, 19 skipped (integration suites need DATABASE_URL)
npm run build         # exit 0 (from repo root: npm run build)
```

## Deferred verification

| Item | Reason | When |
|------|--------|------|
| T2 integration (DB seed legacy + public GET) | `DATABASE_URL` unset locally | staging gate / CI with Postgres |
| T8 CORS preflight integration | same — `createTestApp` requires Prisma connect | staging smoke or CI |
| Manual staging curl OPTIONS | not run in this session | deploy gate before task-09 wire-up |

## Parallel work notes

- `client-api.spec.ts` merged with in-progress task-04 tests (T7, T9–T11, favorites) — T2 block preserved, no rollback
- Pre-existing uncommitted task-01/02 docs and analytics UI untouched; no Docker / `apps/web` analytics changes

## Risks / out of scope (by plan)

| Item | Owner | Notes |
|------|-------|-------|
| Auth attribution + profile monthly fields | task-04 | not modified except `PublicApiModule` registration in `app.module.ts` |
| Client tier picker switch to marketing filter | task-04 | `ClientTiersController` unchanged in task-03 |
| Live landing wire-up | task-09 | blocked until Wave 1 gate on staging |
