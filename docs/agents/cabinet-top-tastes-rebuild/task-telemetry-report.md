# Task report — telemetry backend (computed TOP-3 favorites)

**Date:** 2026-07-29  
**Repo:** `viwa-telemetry` (`C:\wiva\viwa-telemetry`)  
**Scope:** Backend only — computed `favoriteTasteKeys`, stats table, migration/backfill, API/WS contracts, PUT deprecation.

## Summary

Implemented lifetime computed TOP-3 `favoriteTasteKeys` from `client_taste_pour_stats` (FLAVORED subscription pours only). Manual `PUT /client/me/favorite-tastes` returns **410 Gone**. `client_favorite_tastes` table retained for rollback; API no longer reads/writes it.

## Changes

| Area | Detail |
|------|--------|
| **Prisma** | `ClientTastePourStats` model; optional `LoyaltyPour.tasteMediaKeySnapshot` |
| **Migration** | `20260729180000_client_taste_pour_stats` — table + backfill from `loyalty_pours` ⋈ `products` + snapshot column |
| **Domain** | `recordSubscriptionPour` upserts stats in same transaction for new FLAVORED pours; `getTopFavoriteTasteKeys` for reads |
| **REST** | `GET /client/me` returns computed 0..3 keys; PUT favorite-tastes → 410 `GONE` |
| **WS** | `client.profile.updated` already includes `favoriteTasteKeys`; offline reconcile now triggers push on accepted non-idempotent pour |
| **Contracts** | `loyalty-client-rest.md`, `client-ws.md` updated |

## Modified / new files

### Schema & migration
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/migrations/20260729180000_client_taste_pour_stats/migration.sql`
- `apps/api/prisma/migrations/20260729180000_client_taste_pour_stats/down.sql`

### Source
- `apps/api/src/loyalty/client-taste-pour-stats.util.ts` *(new)*
- `apps/api/src/loyalty/loyalty-domain.service.ts`
- `apps/api/src/loyalty/client-api/client-favorite-tastes.controller.ts`
- `apps/api/src/common/api-errors.util.ts` (`goneApiError`)
- `apps/api/src/offline-entitlement/offline-entitlement-reconcile.service.ts`
- `apps/api/src/offline-entitlement/offline-entitlement.module.ts`
- `apps/api/src/offline-entitlement/offline-entitlement-grant.service.ts` (buildClientStatus call fix)

### Tests
- `apps/api/test/client-taste-pour-stats.util.spec.ts` *(new)*
- `apps/api/test/loyalty-domain.service.spec.ts`
- `apps/api/test/client-api.spec.ts`
- `apps/api/test/offline-entitlement-grant-reconcile.service.spec.ts`

### Docs
- `docs/contracts/loyalty-client-rest.md`
- `docs/contracts/client-ws.md`

## Tests run

| Command | Result |
|---------|--------|
| `npx prisma generate` (apps/api) | pass |
| `npm test -w @viwa/api` | **344 passed**, 168 skipped (no `DATABASE_URL`) |
| `npm run typecheck -w @viwa/api` | pass |
| `npm run lint -w @viwa/api` | pass |
| `npm run build` | pass |

### Unit coverage (new/updated)
- Upsert/increment on FLAVORED pour
- Idempotent replay — no double count
- PLAIN_WATER skip
- Top-3 order query contract
- PUT → 410
- Offline reconcile profile push (non-idempotent only)

### Integration (requires `DATABASE_URL`)
- `client-api.spec.ts`: `GET /client/me returns computed favoriteTasteKeys from FLAVORED pours` — **skipped** locally (no DB). Run in CI/staging with PostgreSQL.

## Migration / rollback

**Apply:** `npm run prisma:migrate -w @viwa/api` (or `cd apps/api && npx prisma migrate deploy`).

**Backfill:** aggregates historical FLAVORED client pours with canonical `taste_media_key`; sets `taste_media_key_snapshot` on matching rows.

**Down:** `down.sql` drops `client_taste_pour_stats` and snapshot column; does **not** drop `client_favorite_tastes`. Re-enable manual PUT only after API revert + optional down migration.

## openQuestions

[]

## Round-1 fix (T-C1) — 2026-07-29

**Issue:** `requestUuid` P2002 race could commit client volume deduct without owning the pour row.

**Fix:** Transaction order — `FOR UPDATE` → idempotency check → balance checks → product resolve → `loyaltyPour.create` → `client.update` → stats. P2002 caught **outside** `$transaction` (full rollback); outer handler returns idempotent result after identity assert.

**Tests added:** `T-C1-order`, `T-C1-failure`, `T-C1-mismatch`; updated `T03-2b`; `loyalty-domain-pour-concurrency.spec.ts` (`describeIfDb`).

**Deferred:** T-C2 full REST integration — isolated Postgres CI round (not open question). T-C3 ops backfill gate unchanged.

See `rounds/round-1/telemetry-review-resolution.md`.

## Next (client web)

- Remove manual favorite selection UI; consume computed `favoriteTasteKeys` read-only.
- Empty-state UX when API returns 0..2 keys (client concern).
