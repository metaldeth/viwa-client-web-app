# task-01-review: Контракты §0 + REST

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-telemetry` (docs-only)  
**Baseline:** `main` (uncommitted diff; `TEMP_deploy_a51fa6c.sh` excluded)  
**Task:** [task-01.md](./task-01.md)  
**Review agents (круг 1):** `review-docs`, `review-general`, `review-final` (parallel, `composer-2.5-fast`)  
**Review (круг 2):** точечная проверка fix admin client card JSON (`loyalty-admin-rest.md`)

## Изменённые файлы (продуктовые)

| Файл | Кратко |
|------|--------|
| `docs/contracts/loyalty-public-rest.md` | Public tiers/tastes, CORS, marketing filter, UC-1 flow |
| `docs/contracts/loyalty-client-rest.md` | §0 mapping, check-code `registrationHint`, monthly profile, error codes |
| `docs/contracts/loyalty-admin-rest.md` | `registrationSource`, monthly tier CRUD, client card |
| `docs/contracts/analytics-admin-rest.md` | `registrationSourceBreakdown` |
| `AGENTS.md` | Ссылки на canon §0 и analytics contract |

---

## Acceptance task-01

| Критерий | Статус |
|----------|--------|
| Canon §0: `entry=website`, `registrationHint`, response-only `registrationSource` | ✅ |
| Mapping table TZ v1 → v1.2 | ✅ (`loyalty-client-rest.md`) |
| Public tiers invariant `items.length === 2` | ✅ (public + client) |
| Error codes `SERIAL_REQUIRED`, `MACHINE_NOT_FOUND`, `INVALID_TASTE` | ✅ |
| Monthly fields; `limitResetsAt: null` для monthly tiers | ✅ (client-rest) |

---

## Сводка ревью

| Этап | Статус | Коммит |
|------|--------|--------|
| review-docs (круг 1) | 🔴 1 критично, 7 предложений | — |
| review-general (круг 1) | ⚠️ 5 предложений, 0 критичных | — |
| review-final (круг 1) | 🔴 блокer: admin client card JSON | — |
| **code-review круг 2** | ✅ критичный fix проверен | developer-complex fix applied |

**Круг 2:** 🔴 блокер **закрыт**. Некритичные рекомендации круга 1 **остаются открытыми** (list DTO, tastes invariant, CORS headers, UC-1 narrative, WS drift и др.).

---

## Ревью: Документация

### Проблемы

🔴 **Критично** (противоречивый API-spec / drift в примере):

- [loyalty-admin-rest.md:89–109] Пример `GET /api/v1/admin/clients/:id` смешивает несовместимые семантики в одном DTO: `dailyLimitMl: 2000`, `tierName: "Стандарт"`, `limitResetsAt` с MSK midnight (legacy daily) **и одновременно** `monthlyLimitMl: 12000`, `monthlyUsedMl: 1550`. Для marketing-tier по client-контракту daily-поля должны **зеркалить** monthly, а `limitResetsAt` — `null`. Implementer/dashboard получит неверную модель карточки.

🟡 **Предложение**:

- [loyalty-admin-rest.md:57–78] `GET /api/v1/admin/clients` (list) по-прежнему показывает только `dailyLimitMl` / `dailyUsedMl`, без `monthly*` и без согласованности с detail. Добавить monthly-поля в list или явную пометку «list — урезанный DTO / daily deprecated».
- [loyalty-public-rest.md:101] Заявлен catalog **14** вкусов, но нет invariant в духе tiers (`items.length === 14`). Downstream task-03 явно требует 14 items — зафиксировать assert/invariant рядом с `GET /public/tastes`.
- [loyalty-public-rest.md:26–31] CORS-таблица не упоминает allowed headers; в architecture §1 есть `Content-Type` — добавить для parity с canon.
- [analytics-admin-rest.md:441] `registrationSourceBreakdown` описан как «snapshot total, not period-filtered», но endpoint — `GET /api/v1/admin/analytics/clients?from=&to=` с period-scoped метриками. Уточнить: игнорирует ли `from`/`to` или это опечатка.
- [loyalty-public-rest.md:162, 180–184] UC-1 flow и комментарий «`200` → AuthPage» отсылают к старому client-web deep link; canon flow — landing → `cabinet/register?entry=website` → validation. Согласовать narrative с §0 flow в architecture.
- [loyalty-client-rest.md:383–389] Таблица error codes использует сокращённые пути (`/client/auth/check-code`) без префикса `/api/v1`, тогда как остальной документ — full paths.
- [loyalty-admin-rest.md:251] Формулировка `isMarketingVisible | true — exactly 2 rows on production seed` читается как описание значения поля, а не глобального invariant — вынести invariant отдельной строкой (как в public/client contracts).

### Вывод

⚠️ Найдено **1 критичная** и **7 предложений**. Acceptance закрыт; блокер — противоречивый JSON admin client card.

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Contract-first фиксация landing-subscriptions: canon §0, TZ v1→v1.2 drift, public tiers/tastes, monthly pool, `registrationSource` в admin/analytics.

**Как работает:** Четыре REST-контракта + `AGENTS.md` — единая модель attribution (`entry` → `registrationHint` → `registrationSource`), marketing filter (`listMarketingSubscriptionLevels()`), monthly primary + deprecated daily alias, analytics breakdown.

**Валидация логики:** ✅ Acceptance закрыт. ⚠️ Admin JSON-примеры и WS drift требуют доработки downstream.

### Проблемы

🟡 **Предложение:** Admin client JSON-примеры (list + detail) противоречивы — legacy daily и marketing monthly в одном DTO; list без monthly-полей при detail с monthly.

🟡 **Предложение:** `loyalty-machine-ws.md` и `client-ws.md` не обновлены (daily semantics) — вне scope task-01, drift для task-02/05.

🟡 **Предложение:** `PUT /client/me/favorite-tastes` — response shape «implementation detail»; для mock task-05/07 лучше один канонический ответ.

🟡 **Предложение:** Derivation `registrationSource` в client-rest — bullets; architecture §2 — полный pseudo-code. Явная ссылка на algorithm §2 для edge cases.

### Новые паттерны

- Marketing tier filter — shared `listMarketingSubscriptionLevels()` ✅
- Attribution split: hint (client) vs `registrationSource` (server-only) ✅
- Monthly pool vs legacy daily dual semantics ✅ (admin examples не доведены)
- `schemaVersion` на public tiers/tastes ✅
- `registrationSourceBreakdown` snapshot vs machine ranking ✅

### Вывод

⚠️ **5 предложений**, 0 критичных в этом агенте. Контракты достаточны для task-02/03/05/07 при awareness admin example drift и WS gap.

---

## Финальное ревью

### Статус предыдущих ревью

- review-docs: ⚠️ 1 критично, 7 предложений
- review-general: ⚠️ 5 предложений
- review-final: независимая проверка по acceptance + cross-contract consistency

### Новые замечания

🔴 [loyalty-admin-rest.md:89–109] Блокер: пример `GET /admin/clients/:id` смешивает legacy daily + monthly — выровнять под marketing-tier (`tierName: "12 литров"`, `limitResetsAt: null`, daily-alias = monthly).

🟡 [loyalty-admin-rest.md:57–73] List: только `daily*` без `monthly*` при detail с monthly.

🟡 [loyalty-admin-rest.md:94–99 vs 104–106] Арифметика `dailyRemainingMl: 450` vs `monthlyRemainingMl: 10450` при одном used — конфликт legacy vs monthly.

🟡 [out of scope] WS-контракты daily-only — drift до follow-up.

🟡 [analytics-admin-rest.md] Tier name examples pre-existing («Базовый»), не отражают 12 L / 18 L seed.

🟡 [loyalty-client-rest.md:269] Favorite-tastes response shape loose для contract-first.

### Итог

⚠️ **Требует доработки:** acceptance закрыт, canon и error codes согласованы. **Блокер перед merge:** выровнять JSON-пример `GET /admin/clients/:id` (и желательно list) под marketing-tier semantics.

---

## Рекомендации developer-complex

1. **Обязательно:** исправить пример admin client card (и при необходимости list) — убрать смешение legacy daily + monthly в одном response; добавить второй пример для legacy grandfather tier при необходимости.
2. **Желательно:** tastes invariant `items.length === 14`; CORS allowed headers; UC-1 flow narrative; error table full paths; analytics breakdown period semantics.
3. **Downstream (не task-01):** обновить WS-контракты; зафиксировать favorite-tastes response shape в task-02.

---

## Code-review круг 2 (2026-07-29)

**Scope:** только fix 🔴 `GET /api/v1/admin/clients/:id` JSON DTO в `loyalty-admin-rest.md` (developer-complex после круга 1).

### Проверка fix

| Критерий (круг 1 блокер) | Статус |
|--------------------------|--------|
| Не смешивать legacy daily + marketing monthly в одном примере | ✅ — разделены Example A / Example B + таблица Usage semantics |
| Marketing tier: `tierName: "12 литров"`, `limitResetsAt: null` | ✅ Example A |
| Marketing tier: daily-alias зеркалит monthly (не отдельный pool) | ✅ Example A: 12000/3500/8500 |
| Legacy tier: согласованная арифметика daily/monthly | ✅ Example B: 2000/1550/450, MSK `limitResetsAt` |
| Согласованность с `loyalty-client-rest.md` `GET /client/me` | ✅ Example A совпадает с client profile (12000/3500/8500, alias, `limitResetsAt: null`) |
| Согласованность с `architecture.md` v1.2 §3 | ✅ monthly semantics, deprecated alias, `limitResetsAt: null`; legacy path §3/§4 (`isLegacyDailySemantics`) отражён в Example B |

### Остаётся некритичным (не блокирует merge task-01)

🟡 [loyalty-admin-rest.md:57–78] List DTO — только `daily*` без `monthly*` (рекомендация круга 1 не исправлена; сознательно out of fix scope).

🟡 Прочие предложения круга 1 без изменений: tastes invariant 14, CORS headers, analytics period semantics, UC-1 narrative, error table paths, WS contracts drift.

### Итог круга 2

✅ **hasCriticalIssues: false** — task-01 docs готов к merge; downstream task-02 может стартовать.
