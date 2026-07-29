# task-02-test-report

**Task:** Prisma migration + monthly pool domain + marketing filter  
**Repo:** `viwa-telemetry`  
**Date:** 2026-07-29

## Scope delivered

- Prisma schema: `RegistrationSource`, `ClientFavoriteTaste`, rename `daily_*` → `monthly_*` (usage/limit columns), tier flags `isLegacyDailySemantics` / `isMarketingVisible`
- Migration `20260729120000_monthly_subscription_and_registration_source` (M2–M3 SQL + `down.sql` + rollback notes)
- `LoyaltyDomainService`: legacy-only `ensureDailyReset`, monthly pour, atomic `applySubscription` with `monthlyUsedMl=0`
- `SubscriptionLevelService.listMarketingSubscriptionLevels()` — architecture §1 filter
- Unit tests T1–T6

## Test matrix (T1–T6)

| ID | Invariant | File | Result |
|----|-----------|------|--------|
| T1 | `listMarketingSubscriptionLevels()` returns exactly 2 items | `subscription-level.service.spec.ts` | PASS |
| T2 | Legacy tier excluded by marketing filter (`isMarketingVisible=false`, `isLegacyDailySemantics=true`) | `subscription-level.service.spec.ts` | PASS |
| T3 | All marketing tiers `monthlyVolumeMl` ∈ {12000, 18000} | `subscription-level.service.spec.ts` | PASS |
| T4 | Monthly client: MSK midnight → `monthlyUsedMl` unchanged | `loyalty-domain.service.spec.ts` | PASS |
| T5 | Legacy client: MSK midnight → usage reset | `loyalty-domain.service.spec.ts` | PASS |
| T6 | `applySubscription` atomically sets `monthlyUsedMl=0` | `loyalty-domain.service.spec.ts` | PASS |

## Verification commands

```powershell
cd c:\wiva\viwa-telemetry
npm run lint          # exit 0 (web: 2 pre-existing warnings)
npm run typecheck     # exit 0
npx jest subscription-level.service.spec loyalty-domain.service.spec --runInBand  # 18/18 PASS
npm run build         # exit 0
```

## Migration

```powershell
cd c:\wiva\viwa-telemetry\apps\api
npx prisma migrate dev --name 20260729120000_monthly_subscription_and_registration_source
```

**Post-apply acceptance (staging/deploy):** exactly 2 rows `is_marketing_visible=true` (12 L / 18 L); existing tiers `is_legacy_daily_semantics=true`.

## Deferred verification

| Item | Reason | When |
|------|--------|------|
| `prisma migrate dev` on dev/staging DB | `DATABASE_URL` unset locally — documented skip per agent-env; not a user blocker | staging/deploy gate before task-03 wire-up |
| Post-migration seed assert (`is_marketing_visible` count = 2) | requires applied migration on shared DB | same gate |

## Risks / out of scope (by plan)

| Item | Owner | Notes |
|------|-------|-------|
| M5 DROP `daily_usage_date` | **task-04** | Intentionally retained in M2–M3; gated code still reads column for legacy MSK reset |
| Public REST + CORS | task-03 | handlers not in task-02 |
| Auth attribution + admin wire-up | task-04 | |

## Notes

- Minimal compile fixes outside strict touchpoints: `limitResetsAt: null` types, Prisma field renames in integration test seeds.
- Pre-existing uncommitted docs (`AGENTS.md`, contracts) and `TEMP_deploy_a51fa6c.sh` untouched.
- No Docker changes.
