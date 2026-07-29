# Ревью архитектуры — viwa-landing-subscriptions

**Последний круг:** 2 (architecture-reviewer)  
**Дата:** 2026-07-29  
**Вход:** `architecture.md` v1.2, `tz.md` v1, `architecture_review.md` круг 1  
**Метод:** повторная сверка критичных замечаний круга 1 + чеклист skill

---

## Краткий вывод (круг 2)

Архитектура **v1.2 закрывает все 3 критичных пробела** круга 1. Planner **может стартовать Wave 1** без блокера architect.

| Замечание круга 1 | Статус v1.2 | Где |
|-------------------|-------------|-----|
| Legacy tiers excluded from public | ✅ **Подтверждено** | § Marketing tier filter, `isMarketingVisible`, `listMarketingSubscriptionLevels()`, T1–T2 |
| `ensureDailyReset` legacy-only | ✅ **Подтверждено** | § Monthly pool invariants, gate pseudocode, touchpoints |
| Monthly pool invariants (no double reset/debit) | ✅ **Подтверждено** | Forbidden list, atomic `applySubscription`, renewal TX, T4–T7 |
| CORS | ✅ **Подтверждено** | § CORS, `main.ts` touchpoint, T8, Wave 1 gate |
| Единый `entry` / `registrationHint` контракт | ✅ **Подтверждено** | §0 canon, mapping TZ→v1.2, flows, site/client touchpoints |
| Migration order + test invariants | ✅ **Подтверждено** | M1–M6, T1–T11, Wave 1 gate |

**hasCriticalIssues:** false

**Некритично (остаётся):** timing DROP `daily_usage_date` (M5) при активных legacy subs; post-MVP attribution cookie; site/cabinet deploy paths ещё не в repo runbooks; `tz.md` v1 всё ещё содержит `source=website` — planner обновляет contracts по §0.

---

## Подтверждение критичных пунктов (круг 2)

### 1. Legacy tiers excluded from public API

**✅ Закрыто.**

- Двойной фильтр: `isMarketingVisible=true` AND `isLegacyDailySemantics=false` AND `monthly_volume_ml IN (12000, 18000)`.
- Data migration: existing tiers → `isLegacyDailySemantics=true`, `isMarketingVisible=false`; grandfather rows **не архивируются**, но **не попадают** в public/client picker.
- Invariant: `items.length === 2` на production seed; shared `listMarketingSubscriptionLevels()`.
- Public response **без** deprecated `dailyVolumeMl` — чище контракт для landing.
- Tests T1–T2, smoke S1.

**Согласовано с ТЗ:** acceptance «ровно 2 tier cards», цены из БД (`priceKopecks`).

### 2. `ensureDailyReset` legacy-only

**✅ Закрыто.**

```typescript
if (!tier?.isLegacyDailySemantics) return client; // NO-OP for monthly
```

- Вызывается из `getClientStatus`, `recordSubscriptionPour` — no-op для marketing tiers.
- Legacy grandfather: MSK reset сохранён до renewal.
- Touchpoint явно в `loyalty-domain.service.ts`.

### 3. Monthly pool invariants

**✅ Закрыто.**

| Invariant | Документировано |
|-----------|-----------------|
| Reset pool только в `applySubscription` / renewal TX | ✅ Single TX `{ tier, endsAt, monthlyUsedMl: 0 }` |
| Запрет MSK midnight reset для monthly | ✅ Forbidden list |
| Pour debits once, no double on replay | ✅ T7 |
| Mid-cycle change → next apply | ✅ MVP policy |

Tests T4–T6 покрывают monthly unchanged at midnight vs legacy regression.

### 4. CORS

**✅ Закрыто.**

- Primary: `apps/api/src/main.ts` — paths `/api/v1/public/*`, GET+OPTIONS, allowlist origins (`vitamin-water.ru`, `www`, `cabinet`).
- Fallback nginx snippet documented.
- Wave 1 gate: T8 before site wire-up (2C).
- Flow D явно mentions CORS.

### 5. Единый entry / registrationHint контракт

**✅ Закрыто.**

| Слой | Canon v1.2 |
|------|------------|
| URL query | `entry=website` |
| sessionStorage | `viwa_entry`, `viwa_serial` |
| check-code body | `registrationHint` (`website` \| `machine_qr`) |
| DB/API | `registrationSource` server-only |

Mapping table TZ v1 → canon; запрет `registrationSource` в request body. Flows A–B, routing §4, `landing-cta.js`, `landingEntry.ts` aligned.

**TZ drift:** `tz.md` UC-2/UC-3 ещё пишут `source=website` / body `registrationSource` — architecture §0 явно defer canon; planner обновляет `loyalty-client-rest.md` / `loyalty-public-rest.md` (не блокер, т.к. architecture — source of truth для implementation).

### 6. Migration order + test invariants

**✅ Закрыто.**

- **M1–M6:** dump → ADD/rename → backfill (gate: 2 marketing rows) → deploy gated API → DROP `daily_usage_date` → client+site.
- **T1–T11:** marketing filter, legacy exclusion, MSK behavior, CORS, auth matrix, SERIAL_REQUIRED, immutable attribution.
- **Wave 1 gate:** T1–T3 + T8 before 2B/2C.

---

## Покрытие ТЗ (круг 2)

| UC | v1.2 | Примечание |
|----|------|------------|
| UC-1…UC-8 | ✅ | Все flows сохранены; attribution naming через §0 |
| Acceptance «2 tiers from API» | ✅ | Marketing filter + invariant |
| Acceptance «website attribution» | ✅ | deriveRegistrationSource + admin breakdown |
| Acceptance «serial strip» | ✅ | `/home` clean URL |
| B-1…B-18 | ✅ | Test/smoke matrix linked |

---

## Некритичные рекомендации (перенос из круга 1)

1. **M5 `daily_usage_date` DROP:** gate «no code path reads column» конфликтует с legacy `ensureDailyReset`, пока есть grandfather subs. Planner: отложить M5 до нулевого legacy cohort **или** оставить column read-only для legacy path (nullable для monthly-only clients).

2. **Attribution hardening (post-MVP):** signed cookie `viwa_attr` — уже в risks §; не блокер.

3. **Operational docs:** перенести site docroot/backup из architecture §8 в `viwa-site/README.md` при реализации Wave 4.

4. **Public machines throttle:** 30/min as-is vs 60/min new family — выровнять при реализации public module.

5. **Contracts sync:** Wave 1 deliverable — обновить `loyalty-public-rest.md`, `loyalty-client-rest.md` по §0 до merge 2B/2C.

---

## История кругов

### Круг 1 (2026-07-29)

**hasCriticalIssues:** true — 3 пробела: public filter, ensureDailyReset gate, CORS+param naming.

**Вердict:** architect v1.2 required before planner.

### Круг 2 (2026-07-29)

**hasCriticalIssues:** false — все три закрыты в v1.2.

**Верdict:** **planner** — Wave 1 (schema M1–M3, gated domain M4, public API + CORS, T1–T3 + T8 gate).

---

## Чеклист skill (круг 2)

| Критерий | Статус |
|----------|--------|
| Покрытие UC из ТЗ | ✅ |
| Нет противоречий AGENTS.md / rules | ✅ |
| Границы компонентов | ✅ |
| Интерфейсы для planner | ✅ |
| Потоки данных согласованы | ✅ |
