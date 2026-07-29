# task-02: Prisma migration + monthly pool domain + marketing filter

**Зависимости:** task-01

**UC:** UC-5, UC-6

**Repo:** `viwa-telemetry`  
**Branch target:** `main`

## Описание

Prisma migration `20260729_monthly_subscription_and_registration_source`: rename daily→monthly, enum `RegistrationSource`, `ClientFavoriteTaste`, tier flags `isLegacyDailySemantics` / `isMarketingVisible`. Реализовать `ensureDailyReset` legacy-only gate, monthly pour, atomic `applySubscription`, `listMarketingSubscriptionLevels()`.

## Allowed scope

- `apps/api/prisma/**`
- `apps/api/src/loyalty/loyalty-domain.service.ts`
- `apps/api/src/loyalty/subscription-level.service.ts`
- `apps/api/src/billing/billing.service.ts` (monthly pool reset in apply)
- `apps/api/test/subscription-level.service.spec.ts`
- `apps/api/test/loyalty-domain.service.spec.ts`
- **Не трогать** `apps/web/` analytics uncommitted work

## Запрет Docker

Не изменять Docker/compose файлы.

## Точные touchpoints

| Файл / модуль | Изменение |
|---------------|-----------|
| `apps/api/prisma/schema.prisma` | Enum `RegistrationSource`; rename columns; `ClientFavoriteTaste`; tier flags |
| `apps/api/prisma/migrations/20260729_*` | M2–M3 SQL + down.sql; backfill tiers + registration_source |
| `apps/api/src/loyalty/loyalty-domain.service.ts` | `ensureDailyReset` no-op unless `isLegacyDailySemantics`; monthly pour; no MSK reset for marketing |
| `apps/api/src/loyalty/subscription-level.service.ts` | `listMarketingSubscriptionLevels()` — filter §1 architecture |
| `apps/api/src/billing/billing.service.ts` | `applySubscription` atomic TX: `monthlyUsedMl=0` |
| `apps/api/test/subscription-level.service.spec.ts` | T1–T3 |
| `apps/api/test/loyalty-domain.service.spec.ts` | T4–T6 |

## Acceptance

- [ ] Migration applies locally: exactly 2 rows `is_marketing_visible=true` (12 L / 18 L)
- [ ] Legacy tiers: `isLegacyDailySemantics=true`, excluded from marketing query
- [ ] T4: monthly client — MSK midnight → `monthlyUsedMl` unchanged
- [ ] T5: legacy client — MSK midnight → usage reset (regression)
- [ ] T6: `applySubscription` sets `monthlyUsedMl=0` atomically
- [ ] M5 DROP `daily_usage_date` — **только** если gated code не читает column (может быть отложено в task-04)

## Tests / build

```powershell
cd c:\wiva\viwa-telemetry
npm run lint
npm run typecheck
npm test -- subscription-level.service.spec loyalty-domain.service.spec
npm run build
cd apps\api
npx prisma migrate dev --name 20260729_monthly_subscription_and_registration_source
```

## Downstream

- **task-03, task-04** — parallel после merge
