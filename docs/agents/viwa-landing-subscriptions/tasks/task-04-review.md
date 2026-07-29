# task-04-review: registrationSource + auth + favorites + admin analytics

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-telemetry` (`apps/api`, isolated `apps/web` slice)  
**Baseline:** uncommitted diff on `main` (cumulative task-02 schema/domain + parallel task-03 `public-api` preserved)  
**Task:** [task-04.md](./task-04.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 (§0 attribution, §2 derivation, M5)  
**Test report:** [task-04-test-report.md](./task-04-test-report.md)  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-renderer-structure`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (task-04 scope)

| Файл | Кратко |
|------|--------|
| `apps/api/src/client-auth/client-auth.service.ts` | Serial gate; derivation on new client only |
| `apps/api/src/client-auth/registration-source.util.ts` | **NEW** — `deriveRegistrationSource()`, origin allowlist |
| `apps/api/src/client-auth/client-auth.constants.ts` | `MARKETING_ALLOWED_ORIGINS` |
| `apps/api/src/client-auth/dto/client-auth.dto.ts` | `registrationHint`, monthly profile fields |
| `apps/api/src/client-auth/client-profile.mapper.ts` | Monthly + favorites + deprecated daily alias |
| `apps/api/src/loyalty/client-api/client-favorite-tastes.controller.ts` | **NEW** — `PUT /client/me/favorite-tastes` |
| `apps/api/src/loyalty/client-api/dto/favorite-tastes.dto.ts` | **NEW** |
| `apps/api/src/loyalty/client-api/client-api.module.ts` | Register favorites controller |
| `apps/api/src/loyalty/client-api/client-tiers.controller.ts` | `listMarketingSubscriptionLevels()` + `schemaVersion: 2` |
| `apps/api/src/loyalty/admin-api/admin-clients.service.ts` | `registrationSource` + machine serial on list/card |
| `apps/api/src/loyalty/admin-api/admin-analytics.service.ts` | `registrationSourceBreakdown` (all-clients snapshot) |
| `apps/api/src/loyalty/admin-api/dto/admin-*.dto.ts` | DTO extensions |
| `apps/api/src/loyalty/client-ws/client-profile.mapper.ts` | Monthly + favorites + `registrationSource` on WS update |
| `apps/api/src/loyalty/machine-ws/loyalty-machine-ws.util.ts` | Monthly fields + deprecated daily alias (no attribution) |
| `apps/api/test/client-api.spec.ts` | T7, T9–T11, favorite-tastes integration |
| `apps/api/test/client-auth.spec.ts` | Serial default / omit for returning |
| `apps/web/src/modules/clients/registrationSourceDisplay.tsx` | **NEW** — chip + breakdown widget |
| `apps/web/src/modules/clients/ClientsPage.tsx` | Source chip in list |
| `apps/web/src/modules/clients/ClientDetailPage.tsx` | Source chip on card |
| `apps/web/src/modules/analytics/tabs/ClientsTab.tsx` | Additive breakdown card only |
| `apps/web/src/types/api.ts`, `analytics-contract-fixtures.ts` | Types + fixtures |

**Ripple / shared baseline (not task-04 primary):** task-02 Prisma/domain, task-03 `public-api/` + CORS + `public-api.spec.ts` — **preserved, not reverted**.

**Не тронуто (OK):** Docker/compose, `TEMP_deploy*`.

---

## Acceptance task-04

| Критерий | Статус |
|----------|--------|
| T9: `registrationHint=website` + allowed Origin → `WEBSITE` | ⚠️ **не прогонено локально** (`describeIfDb` skip); test code present |
| T10: existing client + `machineSerial` → attribution unchanged | ⚠️ skip; implementation path skips derivation for existing |
| T11: new client without serial → `400 SERIAL_REQUIRED` | ⚠️ skip; gate in `checkCode` present |
| T7: monthly pour debits once; idempotent replay | ⚠️ skip; domain pour idempotency covered task-02 unit |
| `PUT /client/me/favorite-tastes` max 3, `INVALID_TASTE` | ⚠️ skip integration; controller validation present |
| Admin analytics breakdown WEBSITE / MACHINE_QR / UNKNOWN | ✅ API + web widget + contract |
| Uncommitted analytics chart work preserved | ✅ `ClientsTab` additive-only diff |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 1 🔴 staging SKIP + 6 🟡 | — |
| review-performance | ⚠️ N+1 OTP list (pre-existing) + scaling | — |
| review-docs | 🔴 admin `monthly*` vs `daily*` contract; check-code shape | — |
| review-renderer-structure | 🔴 `colSpan` empty-state | — |
| review-final | ⚠️ staging gates G1–G8; domain OK | — |

---

## Ревью: Общее архитектурное

> Источник: [review-general](8d6167bd-17be-477a-8995-7fd4b04f4c59)

### Суммаризация

**Что решали:** Server-side `registrationSource` on new registration; serial gate; existing immutable; profile monthly + favorites; admin display/breakdown; isolated web slice.

**Как работает:** `checkCode` → existing → `getClientStatus` (no derivation); new → `SERIAL_REQUIRED` / machine lookup → `deriveRegistrationSource` → `createClient`. Favorites: controller max 3 + canonical keys → TX replace. Analytics: all-clients `registrationSource` snapshot.

**Валидация логики:** ✅ Matches architecture v1.2 §0/§2. ⚠️ T7/T9–T11 + favorites integration SKIP without `DATABASE_URL`.

### Проблемы

🔴 **Критично (verification gate, не дефект кода):**

- Acceptance T7/T9–T11 + favorites integration в `client-api.spec.ts` не прогнаны (`describeIfDb` SKIP). Formal close task-04 — только после CI/staging PostgreSQL.

🟡 **Предложение:**

- Unit matrix для `registration-source.util.ts` (без DB).
- Origin/Referer spoofing — MVP risk (architecture § Risks); post-MVP signed cookie.
- `machineSerial && fromWebsite → WEBSITE` выше `hint=machine_qr` — product expectation (matches §2).
- Admin list **filter** by source не реализован (acceptance — только display/breakdown).
- `replaceFavoriteTastes` — validation только в controller; domain defense-in-depth слабый.
- `ensureDailyReset` legacy update `include` без `favoriteTastes` → кратковременно `favoriteTasteKeys: []` после MSK midnight (monthly no-op).
- `ClientsTab` `empty={!breakdown?.length}` всегда false (API всегда 3 buckets); empty UX внутри `RegistrationSourceBreakdown`.
- Мёртвый `registrationSourceLabel()` в `client-auth/client-profile.mapper.ts`.

### Новые паттерны

- Pure `registration-source.util.ts` + shared `toClientProfile` REST/WS ✅
- Isolated `registrationSourceDisplay.tsx` без revert analytics ✅

### Вывод

⚠️ **1 🔴 (staging gate) + 6 🟡.** Domain OK vs v1.2.

---

## Ревью: Производительность

> Источник: [review-performance](1096a61f-e63e-4ff9-8b58-be81e317e290)

### Проблемы

🔴 **Критично (pre-existing, не регресс task-04):**

- [admin-clients.service.ts:240–245] `listClients` — N+1: до `MAX_PAGE_SIZE` (100) параллельных `otpDeliveryLog.count()` на страницу. Усиливает нагрузку на pool при каждом открытии списка. **Не введено task-04** (паттерн уже был); batch `groupBy` / raw SQL — techdebt.

- [admin-clients.service.ts:55–61] Последовательный `ensureDailyReset` в цикле списка — до 100 round-trip; **pre-existing**.

🟡 **Предложение (task-04 / growth):**

- [admin-analytics.service.ts:355–359] `groupBy registrationSource` без `where` — full-table snapshot на каждый Clients analytics request. Индекса на `registration_source` в `schema.prisma` **нет** (low-cardinality enum; MVP OK). При росте — cache/TTL или denormalized counters.

- [admin-analytics.service.ts:306–390] ~15 запросов в одном `Promise.all` (в т.ч. новый groupBy) — пиковая нагрузка на pool при открытии вкладки.

- [loyalty-domain.service.ts:537–550] `replaceFavoriteTastes` всегда delete+create + полный `getClientStatus()`; контроллер возвращает только `{ favoriteTasteKeys }` — over-fetch. Early-exit при unchanged keys желателен.

### Вывод

⚠️ **6 findings** (2 pre-existing 🔴 на list path, 4 🟡 scaling). Для task-04 acceptance не блокируют; N+1 OTP — кандидат в `/tech-debt`, не круг 2 attribution.

---

## Ревью: Документация

> Источник: [review-docs](a2cf5c8f-a977-4511-921e-f824f4fe3b88)

### Проблемы

🔴 **Критично (contract ↔ runtime shape):**

- [`loyalty-admin-rest.md` `GET /admin/clients/:id`] Документирует primary `monthlyLimitMl` / `monthlyUsedMl` / `monthlyRemainingMl` + deprecated `daily*`. Реализация [`admin-client.dto.ts`](c:\wiva\viwa-telemetry\apps\api\src\loyalty\admin-api\dto\admin-client.dto.ts) / `toListItem` отдаёт **только** `daily*` (значения из monthly pool). Dashboard по контракту будет искать отсутствующие `monthly*`. Круг 2: либо добавить `monthly*` в admin DTO, либо поправить контракт под as-is (+ deprecated note).

- [`loyalty-client-rest.md` `POST /check-code` 200] Пример с `limitResetsAt`; код вызывает `toClientProfile(status)` **без** `includeLimits` → нет `limitResetsAt` / `limitExhausted` / `poolExpiresAt`. При этом `favoriteTasteKeys` всегда есть — в примере check-code часто отсутствует. Синхронизировать docs ↔ mapper.

🟡 **Предложение:**

- Client `GET /subscription-levels` — undocumented deprecated `dailyVolumeMl` alias (код + тест ожидают).
- `PUT /favorite-tastes` — не описаны `[]` clear и duplicate → `INVALID_TASTE`.
- Analytics breakdown — нет integration-теста endpoint (контракт OK).
- Admin subscription-levels CRUD fields в том же md — drift вне scope task-04.

### Согласовано

Attribution §0, serial errors, immutability, `GET /me`, favorites max 3, admin list `registrationSource`, analytics snapshot breakdown — OK.

### Вывод

⚠️ **2 🔴 contract shape + 4 🟡.** Ядро attribution/favorites/analytics docs согласованы; admin detail + check-code examples — блокер для consumers docs.

---

## Ревью: Структура компонентов (dashboard web)

> Источник: [review-renderer-structure](b3c5d0c0-3bf1-4182-86b1-55e190dac059)

### Проблемы

🔴 **Критично (регресс task-04):**

- [ClientsPage.tsx:130] После колонки «Источник» в таблице **8** колонок, empty-state всё ещё `colSpan={7}` — «Клиенты не найдены» не на всю ширину. **Исправить в круг 2:** `colSpan={8}`.

🟡 **Предложение:**

- `registrationSourceDisplay.tsx` импортирует `RegistrationSource` из `@prisma/client`; остальной web — union из `api.ts`. Выровнять тип без Prisma в UI.
- Prop-интерфейсы / naming: flat camelCase file vs PascalCase neighbors; опционально папка `RegistrationSourceDisplay/`.
- [ClientDetailPage.tsx:171–175] Chip + рядом `formatRegistrationSource()` — дубль label.
- [ClientsTab.tsx] hardcoded `data-testid="clients-tab-registration-source"` вместо `CLIENTS_TAB_PANEL_IDS`; mobile order делит `ranks` с machine ranking — добавить `registrationSource` в layout constants.
- Cross-module import `analytics → clients`; shared display логичнее в `components/` / `modules/shared/`.
- `api.ts` — union `'WEBSITE' \| 'MACHINE_QR' \| 'UNKNOWN'` продублирован; один экспортный тип.

### Изолированность

- `ClientsTab.tsx` — **только additive** (import + Grid card); charts не revert ✅
- Shared chip/breakdown reused by list/detail/analytics ✅

### Вывод

⚠️ **1 критичное (colSpan) + 8 предложений.** Isolated analytics preservation — OK.

---

## Финальное ревью

> Источник: [review-final](6d6aaac8-08b6-4ced-839e-2c7f57c49b44) + синтез child reviewers

### Spoof-proof / serial / favorites / analytics / M5 / scope

| Check | Verdict |
|-------|---------|
| Server-only derivation; hint non-authoritative | ✅ |
| Existing attribution immutable | ✅ |
| Serial new-only `SERIAL_REQUIRED` | ✅ |
| Favorites max 3 + TX + `INVALID_TASTE` | ✅ |
| Admin breakdown WEBSITE/MACHINE_QR/UNKNOWN snapshot | ✅ |
| Analytics charts preserved (additive) | ✅ |
| M5 `daily_usage_date` retained | ✅ |
| task-03 public-api not reverted | ✅ |
| Admin DTO monthly* vs contract | 🔴 docs/runtime drift |
| check-code limits fields vs contract example | 🔴 docs/runtime drift |
| ClientsPage `colSpan` | 🔴 task-04 UI regression |
| T7/T9–T11/favorites integration | ⚠️ SKIP — staging gate |

### Staging gates (до merge / task-05/06)

| # | Gate |
|---|------|
| G1 | `prisma migrate` на staging DB |
| G2 | Assert 2× `is_marketing_visible` marketing tiers |
| G3–G4 | `jest client-api.spec client-auth.spec` — T7/T9–T11 + favorites PASS |
| G5 | Full API suite с PostgreSQL |
| G6 | CORS T8 (task-03) OPTIONS smoke |
| G7 | Manual: Clients tab breakdown + client card chip |
| G8 | Commit: `versionName`; не revert `apps/web` analytics |

### Итог

⚠️ **Круг 2 обязателен** перед закрытием task-04:

1. UI `colSpan={8}`  
2. Выровнять admin client detail / check-code **contract ↔ runtime** (`monthly*` или docs; check-code limits/`favoriteTasteKeys` examples)  
3. Staging G1–G5 с PostgreSQL  

Domain attribution/favorites/analytics **соответствует** architecture v1.2. Critical code defect в derivation не найден; blockers — UI regression + contract shape + unverified integration.

**hasCriticalIssues: true**

---

## Рекомендации developer-complex (круг 2)

1. **Обязательно:** `ClientsPage` empty-state `colSpan={8}`.
2. **Обязательно:** sync admin client detail — добавить `monthly*` (+ keep deprecated `daily*`) **или** поправить `loyalty-admin-rest.md` под as-is `daily*`-only.
3. **Обязательно:** sync `loyalty-client-rest.md` check-code example с `toClientProfile(status)` (limits optional; document `favoriteTasteKeys`).
4. **Staging gate:** G1–G5 (`DATABASE_URL`) до task-05/06 live wire-up.
5. **Желательно:** `registration-source.util.spec.ts`; `ensureDailyReset` include `favoriteTastes`; domain-level taste validation; ClientsTab empty/layout constants; drop dead `registrationSourceLabel`.
6. **Techdebt:** batch OTP counts / sequential reset on admin list; analytics source snapshot cache.
7. **Не смешивать:** M5 DROP `daily_usage_date`.
