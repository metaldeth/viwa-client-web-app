# task-02-review: Prisma migration + monthly pool domain + marketing filter

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-telemetry`  
**Baseline:** uncommitted diff on `main` (+ cumulative task-01 docs in same working tree)  
**Task:** [task-02.md](./task-02.md)  
**Test report:** [task-02-test-report.md](./task-02-test-report.md)  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (продуктовые)

| Файл | Кратко |
|------|--------|
| `apps/api/prisma/schema.prisma` | `RegistrationSource`, `ClientFavoriteTaste`, rename `daily_*`→`monthly_*`, tier flags |
| `apps/api/prisma/migrations/20260729120000_*` | M2–M3 SQL, `down.sql`, rollback notes in header |
| `apps/api/src/loyalty/loyalty-domain.service.ts` | Legacy-only `ensureDailyReset`, monthly pour, `applySubscription` TX `monthlyUsedMl=0` |
| `apps/api/src/loyalty/subscription-level.service.ts` | `listMarketingSubscriptionLevels()` |
| `apps/api/test/subscription-level.service.spec.ts` | T1–T3 |
| `apps/api/test/loyalty-domain.service.spec.ts` | T4–T6 (+ existing T03-* pour/apply tests) |
| `apps/api/src/loyalty/dto/client-status.dto.ts` | `limitResetsAt: string \| null` |
| `apps/api/src/client-auth/dto/client-auth.dto.ts` | same nullability fix |
| `apps/api/src/loyalty/admin-api/dto/admin-client.dto.ts` | same |
| `apps/api/src/loyalty/admin-api/admin-clients.service.ts` | Prisma field renames (`monthlyVolumeMl`, `monthlyUsedMl`) |
| `apps/api/src/loyalty/machine-ws/loyalty-machine-ws.util.ts` | WS payload `limitResetsAt` nullable |
| `apps/api/test/*.spec.ts` (8 files) | Compile/seed fixes for Prisma renames |
| `docs/contracts/*.md`, `AGENTS.md` | Cumulative task-01 + task-02 contract drift (см. scope) |

**Не в diff (touchpoint task-02):** `apps/api/src/billing/billing.service.ts` — monthly reset реализован в `LoyaltyDomainService.applySubscription`, billing делегирует без изменений.

**Не тронуто (OK):** `apps/web/` analytics UI, Docker/compose.

---

## Acceptance task-02

| Критерий | Статус |
|----------|--------|
| Migration applies: exactly 2 rows `is_marketing_visible=true` (12 L / 18 L) | ⚠️ **не проверено локально** (`DATABASE_URL` unset; gate staging/deploy) |
| Legacy tiers: `isLegacyDailySemantics=true`, excluded from marketing query | ✅ SQL backfill + filter в коде; T2 частично |
| T4: monthly client — MSK midnight → `monthlyUsedMl` unchanged | ✅ unit PASS |
| T5: legacy client — MSK midnight → usage reset | ✅ unit PASS |
| T6: `applySubscription` sets `monthlyUsedMl=0` atomically | ✅ unit PASS (same `$transaction` as tier/history) |
| M5 DROP `daily_usage_date` отложен | ✅ column retained; gated code reads it |
| lint / typecheck / build / T1–T6 jest | ✅ per test report |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 2 предложения, 1 race/idempotency | — |
| review-performance | ✅ минимальный риск (backend-only) | — |
| review-docs | ⚠️ 4 предложения | — |
| review-final | ⚠️ staging gate + scope notes | — |

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Prisma monthly rename + tier flags; legacy-only MSK reset; marketing filter 12/18 L; atomic pool reset on subscription apply.

**Как работает:** `ensureDailyReset` no-op unless `subscriptionLevel.isLegacyDailySemantics`; `recordSubscriptionPour` debits `monthlyUsedMl` under active sub; `applySubscription` TX updates tier/`subscriptionEndsAt`/`monthlyUsedMl=0` + history; `listMarketingSubscriptionLevels()` — architecture §1 filter.

**Валидация логики:** ✅ T1–T6 unit invariants. ⚠️ post-migration DB assert и idempotency race на `applySubscription` не закрыты.

### Проблемы

🟡 **Предложение — idempotency race (`applySubscription`):**

- [loyalty-domain.service.ts:328–436] Idempotency (`subscribeHistory.findUnique` / `findFirst` by `paymentId`) выполняется **вне** `$transaction`; при параллельных retry с одним `requestUuid` второй запрос может получить необработанный `P2002` на `subscribeHistory.create` (в отличие от `recordSubscriptionPour`, где race обработан). Риск для SBP poll / двойного apply.

🟡 **Предложение — row lock на apply:**

- [loyalty-domain.service.ts:348–422] `recordSubscriptionPour` использует `SELECT … FOR UPDATE`; `applySubscription` — нет. Теоретическая interleaving apply + pour на одном client (низкая вероятность, но monthly debit/renewal «atomics» в architecture § Monthly invariants подразумевают строгую сериализацию).

🟡 **Предложение — touchpoint billing:**

- Task touchpoint указывает `billing.service.ts`; фактическая логика reset pool — в `LoyaltyDomainService`. Функционально OK (billing → domain), но traceability task-02 ↔ architecture § BillingService стоит явно зафиксировать в test report.

🟡 **Предложение — T2 слабый:**

- [subscription-level.service.spec.ts:80–97] T2 проверяет **shape `where`**, но mock всегда возвращает только 2 marketing tiers; не доказывает exclusion legacy row из результата (integration/seed test был бы сильнее).

### Новые паттерны

- Legacy gate через `isLegacyDailySemantics` на tier, не на client ✅
- Marketing filter как единый query + volume allowlist ✅
- Deprecated daily DTO alias (`dailyLimitMl`/`dailyUsedMl`) зеркалит monthly pool ✅
- `limitResetsAt: null` для marketing tiers ✅

### Вывод

⚠️ **4 предложения**, 0 блокеров по доменной логике. Staging gate на migration обязателен перед task-03 wire-up.

---

## Ревью: Производительность

### Проблемы

🟡 **Предложение:**

- [migration.sql:66] Index `(is_archived, is_marketing_visible, is_legacy_daily_semantics)` без `monthly_volume_ml` — filter всё равно узкий; при росте tiers допустимо, monitor не требуется на MVP seed.

### Вывод

✅ **Минимальный риск** — нет UI; marketing query с узким `where` + index; pour path уже с `FOR UPDATE`.

---

## Ревью: Документация

### Проблемы

🟡 **Предложение:**

- [loyalty-domain.service.ts:108–111] JSDoc на `ensureDailyReset` — хорошо; **`listMarketingSubscriptionLevels`** — только однострочный comment, без `@returns` invariant `items.length === 2` (architecture §1).
- [migration.sql:1–3] Rollback notes в header — OK; отдельного `README`/rollback runbook в каталоге migration нет (только `down.sql` comments) — для ops deploy task-11 может потребовать ссылку.
- [subscription-level.service.ts:181–194] `toDto` мапит `monthlyVolumeMl` → `dailyVolumeMl` без комментария «deprecated alias» — drift для public API task-03 (architecture: public без `dailyVolumeMl`).
- Cumulative **docs/contracts/** diff (task-01 + task-02) в одном commit tree — reviewer должен различать task-01 closure vs task-02 code; `analytics-admin-rest.md` `registrationSourceBreakdown` — **out of task-02 allowed scope** (docs-only, не runtime analytics).

### Вывод

⚠️ **4 предложения**, 0 критичных doc-блокеров для domain code.

---

## Финальное ревью

### Prisma migration correctness / idempotence / backfill

| Проверка | Вердикт |
|----------|---------|
| M2 enum + renames + `client_favorite_tastes` | ✅ Forward-safe; `daily_usage_date` retained |
| M3 backfill `registration_source` | ✅ MACHINE_QR if machine id; else UNKNOWN |
| M3 legacy tiers `is_legacy_daily_semantics=true`, `is_marketing_visible=false` | ✅ |
| M3 INSERT exactly 2 marketing tiers 12000/18000 ml | ✅ SQL |
| Re-run idempotence (manual re-apply SQL) | ⚠️ INSERT без `ON CONFLICT` — дубли при повторном прогоне вне Prisma tracker |
| `down.sql` rollback | ✅ Ordered reverse; DELETE marketing by name+volume+flags; **⚠️** удалит admin-renamed tiers с теми же name/volume |
| Local `prisma migrate dev` | ⚠️ **не выполнено** — acceptance «2 rows» не подтверждён на реальной БД |

### Exactly two marketing tiers / legacy gate / monthly atomics

| Invariant | Вердикт |
|-----------|---------|
| `listMarketingSubscriptionLevels()` filter matches architecture §1 | ✅ |
| Legacy excluded from marketing | ✅ query; T1/T3 PASS |
| `ensureDailyReset` legacy-only | ✅ T4/T5 PASS |
| `applySubscription` `monthlyUsedMl=0` in TX | ✅ T6 PASS |
| Billing delegation | ✅ unchanged wrapper |

### DTO consistency

| Surface | Вердикт |
|---------|---------|
| `ClientStatusDto.limitResetsAt` null for marketing | ✅ |
| Admin / client-auth / WS payloads aligned | ✅ compile fixes |
| Admin list still `daily*` alias only | 🟡 pre-existing; task-02 не расширял list DTO |

### Tests T1–T6

| ID | Вердикт |
|----|---------|
| T1 | ✅ |
| T2 | ⚠️ query-only |
| T3 | ✅ via `dailyVolumeMl` alias |
| T4–T6 | ✅ |
| Post-migration seed assert | ❌ отсутствует (deferred) |
| T7 (architecture pour idempotency) | out of task-02 scope; pour race handling pre-existing ✅ |

### Scope / accidental changes

| Item | Вердикт |
|------|---------|
| `apps/web/` analytics | ✅ not modified |
| Docker | ✅ not modified |
| `docs/contracts/analytics-admin-rest.md` | 🟡 scope creep (docs); runtime analytics untouched |
| 8 integration spec compile fixes | ✅ justified Prisma rename |
| `AGENTS.md` + contracts bundle | 🟡 mixed with task-01 uncommitted docs |

### Статус предыдущих ревью

- review-general: ⚠️ idempotency race, T2 gap
- review-performance: ✅
- review-docs: ⚠️ JSDoc / alias comments
- review-final: staging gate open

### Итог

⚠️ **Готово к merge с условием:** перед task-03 public API — **`prisma migrate dev` на staging/shared DB** + assert `COUNT(*) WHERE is_marketing_visible=true = 2` и legacy flags на existing tiers. **Рекомендуется** (не блокер merge кода): harden `applySubscription` idempotency (P2002 / TX guard как у pour); усилить T2 или добавить migration integration spec.

**hasCriticalIssues: false** — доменная реализация и unit T1–T6 соответствуют architecture v1.2; открытый acceptance — только DB migration gate и некритичные race/doc gaps.

---

## Рекомендации developer-complex (круг 2, если потребуется)

1. **Staging gate (обязательно до task-03):** `npx prisma migrate dev` + SQL assert 2 marketing rows / legacy backfill.
2. **Желательно:** `applySubscription` — catch `P2002` on `subscribeHistory.create` или idempotency inside TX; optional `FOR UPDATE` on client.
3. **Желательно:** integration test или усилить T2 — legacy tier в DB не попадает в marketing list.
4. **Желательно:** comment в `toDto` / public path prep — deprecated `dailyVolumeMl` alias vs `monthlyVolumeMl`.
5. **Не смешивать в task-02 fix:** analytics contract docs — отдельный commit slice или task-04.
