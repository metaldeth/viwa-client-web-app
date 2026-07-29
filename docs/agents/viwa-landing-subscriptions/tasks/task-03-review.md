# task-03-review: Public tiers/tastes + CORS + contracts/tests

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-telemetry`  
**Baseline:** uncommitted diff on `main` (+ cumulative task-01/02 docs/domain; parallel task-04 auth/profile in same tree)  
**Task:** [task-03.md](./task-03.md)  
**Test report:** [task-03-test-report.md](./task-03-test-report.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 §1  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (task-03 scope)

| Файл | Кратко |
|------|--------|
| `apps/api/src/loyalty/public-api/public-subscription-levels.controller.ts` | **NEW** — `GET /public/subscription-levels`, `@Throttle` 60/min, Cache-Control 300+SWR |
| `apps/api/src/loyalty/public-api/public-tastes.controller.ts` | **NEW** — `GET /public/tastes`, Cache-Control 3600 |
| `apps/api/src/loyalty/public-api/public-tastes.service.ts` | **NEW** — DRY re-export 14 tastes from `taste-media-keys` |
| `apps/api/src/loyalty/public-api/public-api.module.ts` | **NEW** — registers controllers, imports `LoyaltyModule` |
| `apps/api/src/common/public-cors.ts` | **NEW** — scoped CORS delegator for `/api/v1/public/*` |
| `apps/api/src/main.ts` | `registerPublicCors()` call |
| `apps/api/src/app.module.ts` | `PublicApiModule` import (task-04 also touches this file) |
| `apps/api/test/public-api.spec.ts` | **NEW** — T8 CORS, tastes 14, Cache-Control subscription-levels |
| `apps/api/test/client-api.spec.ts` | T2 public legacy exclusion (+ merged task-04 T7/T9–T11) |
| `apps/api/test/test-app.factory.ts` | `registerPublicCors()` for integration parity |

**Не в diff (reuse):** `SubscriptionLevelService.listMarketingSubscriptionLevels()` (task-02), `docs/contracts/loyalty-public-rest.md` (task-01, sync OK).

**Не тронуто (OK):** Docker/compose, `apps/web/` analytics, client-auth handlers (task-04 scope).

---

## Acceptance task-03

| Критерий | Статус |
|----------|--------|
| `GET /public/subscription-levels` → 200, `items.length === 2`, volumes 12000/18000 | ✅ код; ⚠️ integration SKIP без `DATABASE_URL` |
| No `dailyVolumeMl` in public response; `schemaVersion: 2` | ✅ controller maps `monthlyVolumeMl` only |
| `GET /public/tastes` → 14 items, `mediaKey` + RU labels | ✅ `PublicTastesService`; integration SKIP без DB |
| T8: CORS preflight from `https://vitamin-water.ru` → 204 + Allow-Origin | ✅ `public-cors.ts`; integration SKIP без DB |
| Rate limit 60/min + Cache-Control per architecture §1 | ✅ `@Throttle` + `@Header`; 429 не тестируется |
| Legacy grandfather tier **not** in public items (T2) | ✅ marketing filter; T2 integration SKIP без DB |
| lint / typecheck / build / T1/T3 unit | ✅ per test report (9 PASS, 19 SKIP) |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 8 предложений, 0 блокеров | — |
| review-performance | ⚠️ 5 предложений, 0 критичных | — |
| review-docs | ⚠️ 4 JSDoc gaps + 6 предложений; contract sync OK | — |
| review-final | ✅ ready for merge **with staging gate** | — |

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Public REST для landing/client — marketing tiers (2× 12/18 L) и taste catalog (14 keys); browser CORS только для `/api/v1/public/*`; rate limit + cache headers.

**Как работает:** `PublicApiModule` → `SubscriptionLevelService.listMarketingSubscriptionLevels()` + `PublicTastesService` (in-memory from `TASTE_MEDIA_KEYS`); `registerPublicCors()` path-prefix delegator with 3-origin allowlist, GET+OPTIONS.

**Валидация логики:** ✅ Согласовано с architecture v1.2 §1 и `loyalty-public-rest.md`. ⚠️ Acceptance HTTP-smoke полностью зависит от `DATABASE_URL`; DB-free сценарии (CORS, tastes) ошибочно внутри `describeIfDb`.

### Проблемы

🟡 **`describeIfDb` скрывает DB-free тесты** — [`public-api.spec.ts:10-12`] T8 CORS и tastes HTTP не прогоняются без Postgres, хотя Prisma не нужен.

🟡 **Неполный acceptance в `public-api.spec.ts`** — нет `items.length === 2`, volumes 12000/18000, `dailyVolumeMl` absent (есть только в `client-api.spec.ts` T2).

🟡 **CORS security coverage слабое** — только positive preflight для `vitamin-water.ru`; нет disallowed origin, `www`/cabinet preflight, non-public path negative.

🟡 **Rate limit не верифицируется** — `ThrottlerGuard` override в test factory + `skipIf` test env; нет 429 integration test.

🟡 **Дублирование allowlist** — `PUBLIC_CORS_ORIGINS` vs `MARKETING_ALLOWED_ORIGINS` (client-auth) — риск drift.

🟡 **CORS `!origin → true`** — [`public-cors.ts:22-24`] non-browser без Origin получает permissive callback; не browser bypass, но стоит staging smoke.

🟡 **T2 ownership в `client-api.spec.ts`** — task-03 acceptance test в suite «task-07 + task-04»; merge task-04 чистый (конфликт-маркеров нет), но навигация scope размыта.

🟡 **Cache-Control tastes не тестируется** — `max-age=3600` только в коде, не в spec.

### Вывод

⚠️ **8 предложений**, 🔴 **0 блокеров**. Архитектура корректна.

---

## Ревью: Производительность

### Проблемы

🟡 CORS delegator на каждый request (global `onRequest`) — микро-overhead на non-public paths.

🟡 Tastes catalog пересобирается на каждый GET — статическая константа была бы дешевле (при `max-age=3600` impact низкий).

🟡 In-memory throttler — при multi-replica лимит 60×N req/min/IP без edge/Redis limiter.

🟡 Двойной `map` service DTO → public DTO на subscription-levels.

🟡 Нет perf/regression теста rate limit и Cache-Control tastes.

### Вывод

✅ Минимальный риск для landing load; architecture cache/throttle декларации соблюдены.

---

## Ревью: Документация

### Проблемы

🟡 JSDoc отсутствует на экспортах: `PUBLIC_CORS_ORIGINS`, `PublicTastesController`, `PublicSubscriptionLevelsController`, `PublicApiModule`.

🟡 Contract touchpoint `loyalty-public-rest.md:33` — только `main.ts`, фактически `common/public-cors.ts`.

🟡 `AGENTS.md` Public namespace Consumers устарело; нет CORS summary в namespace table.

🟡 Несогласованные ссылки «architecture §1» vs «v1.2 §1» в комментариях.

**Contract sync:** ✅ schemaVersion, fields, cache headers, 14 tastes invariant, CORS paths/origins/methods — implementation matches `loyalty-public-rest.md`.

### Вывод

⚠️ JSDoc gaps некритичны для merge; contract ↔ code синхронизирован.

---

## Финальное ревью

### Статус предыдущих ревью

- review-general: ⚠️ test blind zone, CORS coverage
- review-performance: ✅ minimal risk
- review-docs: ⚠️ JSDoc + touchpoint drift
- review-final: staging gate required

### Cross-cutting risks

| Risk | Severity | Notes |
|------|----------|-------|
| DB integration SKIP locally | ⚠️ gate | T2/T8/public HTTP — staging/CI with Postgres |
| CORS wildcard on missing Origin | 🟡 | Staging curl with/without Origin |
| task-04 parallel merge | 🟡 | `client-api.spec.ts`, `app.module.ts` — T2 preserved, coordinate merge |
| Wave 1 gate before task-09 | ⚠️ gate | Manual OPTIONS curl on `tl.vitamin-water.ru` |

### Итог

✅ **Ready for merge with staging gate**

Код task-03 закрывает acceptance и architecture v1.2 §1. Merge допустим. **Live wire-up (task-09) — только после staging:** migrate + assert 2× marketing rows, T2/T8/public-api integration PASS, manual OPTIONS curl.

**hasCriticalIssues: false** — функциональных/security блокеров нет; открытый acceptance — DB/staging gate и некритичные test/docs gaps.

---

## Рекомендации developer-complex (круг 2, если потребуется)

1. **Staging gate (обязательно до task-09):** Postgres integration T2/T8/public-api + `curl OPTIONS` на staging.
2. **Желательно:** split `public-api.spec.ts` — DB-free `describe` для CORS/tastes/Cache-Control.
3. **Желательно:** negative CORS tests (disallowed origin, non-public path).
4. **Желательно:** unify `PUBLIC_CORS_ORIGINS` + `MARKETING_ALLOWED_ORIGINS`.
5. **Некритично:** JSDoc на public-api exports; update contract touchpoint to `common/public-cors.ts`.
