# task-04-test-report

**Task:** registrationSource + auth + favorites + admin analytics  
**Repo:** `viwa-telemetry`  
**Date:** 2026-07-29

## Scope delivered

- `deriveRegistrationSource()` + serial gate for new clients; existing attribution immutable
- `registrationHint` allowlist in check-code; `registrationSource` response-only
- Profile monthly fields + deprecated daily alias; `favoriteTasteKeys`; `poolExpiresAt`
- `PUT /client/me/favorite-tastes` (max 3 keys, `INVALID_TASTE`)
- `GET /client/subscription-levels` → `listMarketingSubscriptionLevels()` + `schemaVersion: 2`
- Admin client list/card: `registrationSource` + machine serial
- Admin analytics clients: `registrationSourceBreakdown` (WEBSITE / MACHINE_QR / UNKNOWN snapshot)
- Machine WS + client WS profile push: monthly fields + deprecated daily alias
- Dashboard web (isolated): client card/list source chip; Clients tab breakdown widget

## Test matrix (T7, T9–T11)

| ID | Invariant | File | Result |
|----|-----------|------|--------|
| T7 | Monthly pour debits pool once; idempotent replay | `client-api.spec.ts` | **SKIP** (no `DATABASE_URL`) |
| T9 | `registrationHint=website` + allowed Origin → `WEBSITE` | `client-api.spec.ts` | **SKIP** (no `DATABASE_URL`) |
| T10 | Existing client + `machineSerial` → attribution unchanged | `client-api.spec.ts` | **SKIP** (no `DATABASE_URL`) |
| T11 | New client without serial → `400 SERIAL_REQUIRED` | `client-api.spec.ts` | **SKIP** (no `DATABASE_URL`) |
| — | Favorite tastes valid / invalid / >3 keys | `client-api.spec.ts` | **SKIP** (no `DATABASE_URL`) |
| — | `createClient` sets `registrationSource` + favorites include | `loyalty-domain.service.spec.ts` | PASS |
| — | T1–T6 domain regression (task-02) | `loyalty-domain.service.spec.ts` | PASS (9/9 in suite) |
| — | `client-auth.spec` serial default + omit for returning | `client-auth.spec.ts` | **SKIP** (no `DATABASE_URL`) |

## Verification commands

```powershell
cd c:\wiva\viwa-telemetry
npm run lint          # exit 0 (web: 2 pre-existing warnings)
npm run typecheck     # exit 0
npx jest client-api.spec client-auth.spec loyalty-domain.service.spec --runInBand
# loyalty-domain.service.spec: 9/9 PASS; client-api/client-auth: skipped (describeIfDb)
npm run build         # see below
```

## Deferred verification

| Item | Reason | When |
|------|--------|------|
| T7, T9–T11 integration (client-api.spec) | `DATABASE_URL` unset locally — `describeIfDb` skip per AGENTS.md | staging/CI with PostgreSQL |
| `prisma migrate dev` apply | same env gate (schema from task-02) | staging deploy |

## Merge / parallel task notes

- Preserved uncommitted task-02 domain/schema diff and parallel task-03 `public-api.spec.ts` (not reverted)
- Did not touch Docker, `TEMP_deploy*`, or public/CORS handlers except shared types/util ripple
- M5 DROP `daily_usage_date` **not** executed (retained per architecture; ownership task-04 acknowledged, deferred)

## Risks / out of scope (by plan)

| Item | Owner | Notes |
|------|-------|-------|
| Public REST + CORS handlers | task-03 | No controller duplication |
| Client/site SPA wire-up | task-05/06 | Types/contracts only here |
| M5 column drop | post-staging | `daily_usage_date` still used for legacy MSK reset |

## Notes

- `client-auth.spec.ts` updated: default machine serial for new registration; `omitSerial` for returning login
- Admin analytics breakdown is **all-clients snapshot** (not period-filtered), per contract
