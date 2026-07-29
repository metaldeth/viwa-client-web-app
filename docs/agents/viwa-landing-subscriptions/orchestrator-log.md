# Orchestrator log — viwa-landing-subscriptions

## [init] 2026-07-29

- Триггер: `/complex` (sessionId: `viwa-landing-subscriptions`)
- Хост артефактов: `viwa-client-web-app/docs/agents/viwa-landing-subscriptions/`
- Созданы: `request.md`, `orchestrator-log.md`
- Целевые репо: `viwa-site`, `viwa-client-web-app`, `viwa-telemetry`
- Визуальный референс: concept-16 editorial fruit lab (утверждён пользователем)
- Ключевые темы: split landing+cabinet, serial-aware registration, website attribution, monthly 12/18 L tiers, all flavors imagery, deploy
- Ограничение: Docker-файлы не менять без явного согласия; deploy — после verification + подтверждения

## [analysis] Запуск analyst

- Субагент: analyst
- Вход: `request.md`, sessionId `viwa-landing-subscriptions`, exploration facts, visual reference
- Ожидание: `tz.md`, `blockingQuestions`
- Статус: completed
- Результат: `tz.md` v1 создан
- `blockingQuestions`: [] — рекомендации по attribution, monthly semantics и «все вкусы» зафиксированы в ТЗ; blocking не требуется для старта architect/planner

## [tz-review] Круг 1

- Субагент: tz-reviewer
- Вход: `tz.md` v1, `request.md`, concept-16 reference, AGENTS (`viwa-client-web-app`, `viwa-telemetry`), `viwa-site/README.md`
- Артефакт: `tz_review.md`
- **hasCriticalIssues:** false
- **Вывод:** ТЗ полное, 9/9 требований request покрыты; monthly 12/18 L, public API цен, serial/regression auth, registrationSource (не virtual machine), network subscription, 14 tastes, parent image gen, adaptive UI, browser B-1…B-18, deploy+rollback без Docker — отражены
- **Некритично:** нет `browserTesting: true` в AGENTS (формальный gate vs обязательность B-сценариев в ТЗ); tablet breakpoint; embed fallback; маппинг `source=website` → enum
- **Следующий шаг:** architect

## [architecture] 2026-07-29

- Субагент: architect
- Вход: `tz.md` v1, AGENTS.md (`viwa-client-web-app`, `viwa-telemetry`), `viwa-site/README.md`, exploration contracts/schema/routes
- Артефакт: `architecture.md` v1
- **Ключевые решения:** monthly pool 12/18 L (Prisma rename + legacy grandfather); public tiers/tastes + cache/rate-limit; `registrationSource` server-derived from hint+origin (immutable for existing); serial capture route `/register` для landing без serial; deep-link+mock (no iframe primary); image manifest contract; deploy telemetry→client→site; analytics uncommitted work preserved
- **blockingQuestions:** production docroot path для vitamin-water.ru (не задокументирован в repo)
- **Следующий шаг:** planner

## [architecture-update] 2026-07-29

- Триггер: снятие блокера read-only inspection production paths
- Обновлён: `architecture.md` v1.1
- **Подтверждённые пути:** SSH `wiva-server`; site docroot `/var/www/vitamin-water-ru` (www-data); cabinet `/opt/viwa-client-web-app/current` (releases/{timestamp}); telemetry web `/opt/viwa-telemetry/current/apps/web/dist` (releases/{gitSha}, owner viwa); `/api/` → 127.0.0.1:3000
- **Добавлено:** static site backup (tar pre-deploy) + atomic staging swap + rollback (.prev / tar restore); без Docker
- **blockingQuestions:** [] — блокер docroot снят
- **Следующий шаг:** planner

## [architecture] v1.2 — 2026-07-29

- Триггер: architecture-review круг 1 (hasCriticalIssues: true)
- Обновлён: `architecture.md` v1.2
- **Fix #1:** marketing tier filter (`isMarketingVisible` + `isLegacyDailySemantics=false` + volume allowlist); `listMarketingSubscriptionLevels()`; invariant `items.length === 2`
- **Fix #2:** `ensureDailyReset` legacy-only gate; monthly pool invariants; atomic `applySubscription`; migration M1–M6; tests T1–T11
- **Fix #3:** canon §0 — `entry=website`, `registrationHint`, `registrationSource` response-only; CORS `main.ts`
- **blockingQuestions:** []
- **Следующий шаг:** architecture-review круг 2

## [architecture-review] Круг 2

- Субагент: architecture-reviewer
- Вход: `architecture.md` v1.2, `tz.md` v1, `architecture_review.md` круг 1
- Артефакт: `architecture_review.md` (обновлён)
- **hasCriticalIssues:** false
- **Подтверждено:** legacy excluded from public (`isMarketingVisible`); `ensureDailyReset` legacy-only; monthly pool invariants + atomic apply; CORS in touchpoints; canon §0 `entry`/`registrationHint`; M1–M6 + T1–T11
- **Некритично:** M5 DROP `daily_usage_date` vs legacy subs; post-MVP attribution cookie; site deploy docs в README; sync contracts по §0
- **Следующий шаг:** planner

## [planner] 2026-07-29

- Субагент: planner
- Вход: `tz.md` v1, `architecture.md` v1.2, AGENTS.md (`viwa-client-web-app`, `viwa-telemetry`), `viwa-site/README.md`
- Артефакты:
  - `plan.md` — 11 задач, 5 волн, Wave 1 gate блокирует live API wire-up client/site
  - `tasks/task-01.md` … `tasks/task-11.md`
  - `viwa-client-web-app/TEMP_TEST_SCENARIOS.md` — B-1…B-18 с URL/actions/expectations/prerequisites
- **Ключевые решения planner:**
  - task-02/03/04 — telemetry foundation (schema, public+CORS, auth+admin) parallel после task-02
  - task-05/06/07 — parallel surface dev; mocks до Wave 1 gate
  - task-08 — assets integration only; **parent GenerateImage** — external input, субагентам запрещена генерация
  - task-09 — cross-repo live integration
  - task-10/11 — browser B-1…B-18 + deploy runbook; **commit/push/deploy → task-completion**
  - Uncommitted analytics в `apps/web/` — preserve; не включать в scope других задач
  - Docker — запрет во всех tasks
- **blockingQuestions:** []
- **Следующий шаг:** developer wave 0 (task-01) / parent image generation (parallel track 2D)

## [plan-review] 2026-07-29

- Субагент: plan-reviewer
- Вход: `plan.md`, `tasks/task-01.md`…`task-11.md`, `TEMP_TEST_SCENARIOS.md`, `tz.md` v1, `architecture.md` v1.2, AGENTS (`viwa-telemetry`, `viwa-client-web-app`)
- Артефакт: `plan_review.md`
- **hasCriticalIssues:** false
- **Вывод:** план пригоден к исполнению; UC-1…UC-8 и B-1…B-18 покрыты; Wave 1 API gate (T1–T11 + CORS) блокирует live wire-up client/site до task-03/04; parent-only GenerateImage (task-08); uncommitted analytics preserve; Docker ban; task-10→task-11 gates без deploy; commit/push/deploy/version → `/task-completion` после user confirmation; `/ci-cd-status` только по отдельному запросу
- **coverageIssues (minor):** B-8 не в task-07 acceptance; UC-4 refresh auto-login не в test cases; UC-5 WS live не явлен в task-06; M5 DROP ownership task-02/04
- **missingDescriptions (minor):** task-07 B-8; task-06 WS; task-02/04 M5 gate
- **Следующий шаг:** developer Wave 0 (task-01) + parent GenerateImage batch (Wave 2D parallel)

## [developer] task-01 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-telemetry` (docs-only; код/Prisma/handlers не тронуты)
- **Git baseline:** `main` clean except untracked `TEMP_deploy_a51fa6c.sh`; uncommitted analytics в `apps/web/` на момент задачи не обнаружены
- **Сделано:** contract-first canon §0 в `docs/contracts/loyalty-public-rest.md`, `loyalty-client-rest.md`, `loyalty-admin-rest.md`, `analytics-admin-rest.md`; минимальная ссылка в `AGENTS.md`
- **Acceptance:** `entry`/`registrationHint`/`registrationSource`; TZ→v1.2 mapping; public 2-tier invariant; error codes `SERIAL_REQUIRED`, `MACHINE_NOT_FOUND`, `INVALID_TASTE`; monthly fields + `limitResetsAt: null`
- **Verification:** `npm run lint`, `npm run typecheck` — exit 0 (см. subagent JSON)
- **Не в scope:** Prisma, API handlers, Docker, client/site code
- **Следующий шаг:** task-02 (schema/domain)

## [developer] task-01 — круг 2 — 2026-07-29

- Субагент: developer-complex (review fix)
- Вход: `tasks/task-01-review.md` — только 🔴 блокер admin client card JSON
- **Fix:** `loyalty-admin-rest.md` `GET /admin/clients/:id` — разделены Example A (marketing monthly: `limitResetsAt: null`, daily-alias = monthly) и Example B (legacy grandfather: MSK `limitResetsAt`, согласованная арифметика daily/monthly)
- **Не тронуто:** list DTO, tastes invariant, CORS headers, UC-1 narrative, analytics period semantics (некритичные рекомендации)
- **Verification:** `npm run lint`, `npm run typecheck` — exit 0
- **Следующий шаг:** merge task-01 → task-02

## [code-review] task-01 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-telemetry` (docs-only diff vs baseline; `TEMP_deploy_a51fa6c.sh` excluded)
- Review agents (parallel): `review-docs`, `review-general`, `review-final` (`composer-2.5-fast`)
- Артефакт: `tasks/task-01-review.md`
- **hasCriticalIssues:** true
- **Вывод:** acceptance task-01 закрыт (§0, TZ mapping, 2-tier invariant, error codes, monthly + `limitResetsAt: null`); cross-contract согласованность public/client/analytics/AGENTS — OK. **Блокер:** противоречивый JSON-пример `GET /admin/clients/:id` в `loyalty-admin-rest.md` (legacy daily + marketing monthly в одном DTO). Некритично: list DTO без monthly, tastes invariant 14, CORS headers, UC-1 narrative, WS contracts drift (out of scope task-01).
- **Следующий шаг:** developer-complex — правки admin client examples (или merge с awareness); task-02

## [code-review] task-01 — круг 2 — 2026-07-29

- Субагент: code-reviewer-complex
- Scope: только fix 🔴 admin client card JSON в `loyalty-admin-rest.md` (после developer-complex круг 2)
- Арtefact: `tasks/task-01-review.md` (обновлён)
- **hasCriticalIssues:** false
- **Вывод:** Example A (marketing monthly) и Example B (legacy grandfather) разделены; арифметика согласована; `limitResetsAt: null` для marketing; daily-alias = monthly; совпадает с `loyalty-client-rest.md` `GET /client/me` и architecture v1.2 §3. List DTO и прочие 🟡 рекомендации круга 1 — без изменений, не блокируют.
- **Следующий шаг:** merge task-01 → task-02

## [developer] task-02 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-telemetry`
- **Git baseline:** pre-existing uncommitted task-01 docs (`AGENTS.md`, `docs/contracts/*`); untracked `TEMP_deploy_a51fa6c.sh` not touched; no `apps/web/` changes
- **Сделано:**
  - Prisma schema + migration `20260729120000_monthly_subscription_and_registration_source` (M2–M3, `down.sql`, rollback notes; `daily_usage_date` retained until M5)
  - `LoyaltyDomainService`: legacy-only `ensureDailyReset`, monthly pour, `applySubscription` TX `monthlyUsedMl=0`, `limitResetsAt: null` for marketing tiers
  - `SubscriptionLevelService.listMarketingSubscriptionLevels()` — architecture §1 filter
  - Unit tests T1–T6 in `subscription-level.service.spec.ts`, `loyalty-domain.service.spec.ts`
- **Verification:** lint/typecheck/build exit 0; T1–T6 jest 18/18 PASS
- **Deferred verification:** `prisma migrate dev` + post-migration seed assert — staging/deploy gate (`DATABASE_URL` unset locally; documented skip, not user blocker)
- **Risks / by plan:** M5 DROP `daily_usage_date` → **task-04** (retained in M2–M3 by design)
- **Артефакт:** `tasks/task-02-test-report.md`
- **Не в scope:** public REST handlers, CORS (task-03); auth attribution + admin wire-up (task-04)
- **Следующий шаг:** task-03 + task-04 parallel (public API + auth/admin wire-up)

## [code-review] task-02 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-telemetry` (schema/domain/tests + compile-fix ripple; cumulative task-01 docs in same tree)
- Review agents (parallel): `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Артефакт: `tasks/task-02-review.md`
- **hasCriticalIssues:** false
- **Вывод:** domain monthly pool + legacy `ensureDailyReset` gate + marketing filter + T1–T6 unit — OK; migration SQL/backfill/down.sql согласованы с architecture v1.2. **Staging gate:** `prisma migrate dev` + assert 2× `is_marketing_visible` не выполнены локально (`DATABASE_URL` unset). Некритично: `applySubscription` idempotency race (P2002 вне TX), слабый T2 (query-only), `billing.service.ts` touchpoint делегирует в domain, docs/contracts/analytics scope creep (docs-only), нет изменений `apps/web`/Docker.
- **Следующий шаг:** merge task-02 с awareness staging gate → task-03 + task-04 parallel; опционально developer круг 2 по idempotency/T2/migration assert

## [developer] task-03 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-telemetry`
- **Git baseline:** pre-existing uncommitted task-01/02 schema/domain/docs + parallel task-04 auth/profile in same tree; `TEMP_deploy` / Docker / `apps/web` analytics untouched
- **Сделано:**
  - `PublicApiModule`: `GET /api/v1/public/subscription-levels` (marketing filter, `schemaVersion: 2`, `monthlyVolumeMl`), `GET /api/v1/public/tastes` (14 keys, RU labels via `PublicTastesService`)
  - CORS `registerPublicCors()` — paths `/api/v1/public/*`, origins vitamin-water.ru/www/cabinet, GET+OPTIONS
  - Rate limit 60/min + Cache-Control per architecture §1
  - Tests: T1/T3 unit PASS; T2 integration + T8 CORS in `client-api.spec.ts` / `public-api.spec.ts` (SKIP без `DATABASE_URL`)
- **Verification:** lint/typecheck/build exit 0; jest `subscription-level|client-api|public-api` — 9 PASS, 19 SKIP (integration)
- **Deferred:** T2/T8 DB integration + staging OPTIONS curl — staging gate (`DATABASE_URL` unset locally)
- **Артефакт:** `tasks/task-03-test-report.md`
- **Не в scope:** client-auth/admin attribution (task-04); только `PublicApiModule` в `app.module.ts`
- **Следующий шаг:** code-review task-03 → task-09 live wire-up после Wave 1 gate на staging

## [code-review] task-03 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-telemetry` (public-api module, CORS, tests; cumulative task-01/02 + parallel task-04 in same tree)
- Review agents (parallel): `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Арtefact: `tasks/task-03-review.md`
- **hasCriticalIssues:** false
- **Вывод:** acceptance task-03 и architecture v1.2 §1 закрыты в коде — public tiers (marketing filter, schemaVersion 2, monthlyVolumeMl), 14 tastes DRY, CORS allowlist `/api/v1/public/*`, @Throttle 60/min, Cache-Control 300/3600. **Staging gate:** T2/T8/public HTTP integration SKIP без `DATABASE_URL`; Wave 1 gate (migrate + assert 2 marketing rows + OPTIONS curl) обязателен до task-09 live wire-up. Некритично: describeIfDb скрывает DB-free CORS/tastes tests, слабое CORS negative coverage, JSDoc gaps, duplicated origin allowlists, task-04 merge coordination в `client-api.spec.ts`.
- **Следующий шаг:** merge task-03 с awareness staging gate → staging smoke → task-09; code-review task-04

## [developer] task-04 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-telemetry` (+ test report in client-web-app docs)
- **Git baseline:** merged with uncommitted task-02 domain/schema; parallel task-03 `public-api.spec.ts` preserved (not reverted)
- **Сделано:**
  - `deriveRegistrationSource()` + serial gate (`SERIAL_REQUIRED`); existing attribution immutable
  - Profile monthly fields + `favoriteTasteKeys`; `PUT /client/me/favorite-tastes` (`INVALID_TASTE`)
  - Marketing tier picker via `listMarketingSubscriptionLevels()`
  - Admin `registrationSource` on client card/list; analytics `registrationSourceBreakdown`
  - Machine/client WS monthly fields + deprecated daily alias
  - Dashboard web isolated slice: source chip + Clients tab breakdown widget
- **Tests:** T7/T9–T11 in `client-api.spec.ts` (integration — skip без `DATABASE_URL`); `loyalty-domain.service.spec` 9/9 PASS
- **Verification:** lint/typecheck/build exit 0
- **Deferred:** T7/T9–T11 integration on staging/CI; M5 DROP `daily_usage_date` not applied
- **Артефакт:** `tasks/task-04-test-report.md`
- **Не в scope:** public/CORS handlers (task-03), Docker, commit/push
- **Следующий шаг:** task-05/06 client SPA wire-up; code-review task-04

## [code-review] task-04 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-telemetry` (+ isolated `apps/web` slice; cumulative task-02/03 baseline preserved)
- Review agents (parallel): `review-general`, `review-performance`, `review-docs`, `review-renderer-structure`, `review-final` (`composer-2.5-fast`)
- Артефакт: `tasks/task-04-review.md`
- **hasCriticalIssues:** true
- **Вывод:** domain attribution/favorites/analytics OK vs architecture v1.2; analytics additive-only; task-03 public-api preserved. **Круг 2 blockers:** (1) `ClientsPage` `colSpan={7}`→8; (2) admin client detail contract `monthly*` vs runtime `daily*`-only; (3) check-code response example vs `toClientProfile` without `includeLimits`. Staging G1–G5: T7/T9–T11/favorites SKIP без `DATABASE_URL`. Pre-existing: N+1 OTP admin list (techdebt).
- **Следующий шаг:** developer-complex круг 2 → re-review → staging CI → task-05/06

## [architecture-review] Круг 1

- Субагент: architecture-reviewer
- Вход: `architecture.md` v1.1, `tz.md` v1, read-only сверка `viwa-telemetry` / `viwa-client-web-app` / `viwa-site` (Prisma, API, routes, contracts, deploy)
- Артефакт: `architecture_review.md`
- **hasCriticalIssues:** true
- **Вывод:** архитектура в целом пригодна для planner (UC-1…UC-8, Serial Capture без dead-end CTA, server-side attribution, manifest, deploy/rollback без Docker); критично закрыть до Wave 2: (1) public tiers filter исключает legacy grandfather rows (`isLegacyDailySemantics`), иначе >2 карточек на landing; (2) invariant daily→monthly — gate `ensureDailyReset` + reset pool только в `applySubscription`; (3) CORS для public API + выравнивание `source`/`from`/`registrationHint` с ТЗ
- **As-is подтверждено:** только `/m/:machineSerial/*`; optional machineSerial; MSK daily reset; нет public subscription-levels/CORS/registrationSource; `/products/tastes` под dashboard auth; site — FLOW static mirror
- **Следующий шаг:** architect v1.2 (точечные правки по критичным) → planner

## [developer] task-07 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-site`
- **Git baseline:** not committed (per instruction)
- **Сделано:**
  - `index.html` — concept-16 VIWA one-page: split desktop ≥1024px / stack mobile; hero; 14-flavor grid; 2 tier slots; serial capture; cabinet static mock + «Открыть кабинет» deep-link (no iframe)
  - `css/viwa-tokens.css`, `css/viwa-landing.css` — tokens (#7F5AF0 accent), a11y focus, B-7 reduced-motion, B-8 contrast notes, touch ≥44px
  - `js/config.js` — apiBaseUrl/cabinetBaseUrl/useMockApi override
  - `js/landing-api.js` — fetch public tiers/tastes; skeleton/error/retry; mock fallback (prices only via JS, not HTML)
  - `js/landing-cta.js` — `register?entry=website` (+ serial preservation), `/auth`
  - `assets/generated/.gitkeep` — placeholder until task-08
  - `README.md` — static validation checklist + deploy notes
- **Acceptance:** B-1/B-3/B-4/B-5/B-7/B-8 in scope; brand VIWA on landing; legacy pages preserved
- **Verification:** static path check — all CSS/JS/icon refs OK; `python -m http.server 8080` manual smoke recommended
- **Не в scope:** commit/push/deploy; generated images (parent task-08); live API (`useMockApi: true` → task-09)
- **Следующий шаг:** task-08 assets; task-09 live API wire-up; task-10 browser B-scenarios

## [developer] task-07 — круг 2 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-site`
- Вход: `tasks/task-07-review.md` — только 🔴 blockers (mock leak)
- **Fix #1:** `landing-api.js` — live API failure → `renderFlavorsError` + retry; never `MOCK_TASTES` when `!resolveUseMock()`
- **Fix #2:** `config.js` — `useMockApi: false` default; `resolveUseMock()` requires explicit `=== true`; `isProductionHost()` fail-closed for vitamin-water.ru
- **Fix #3:** tiers catch aligned — error/retry on live failure; mock only when opt-in
- **Added:** `scripts/static-regression-check.ps1`; README regression section; shared `.viwa-api-error` CSS
- **Verification:** `static-regression-check.ps1` exit 0
- **Continuation (2026-07-29):** re-verified current files — no duplicate edits; asset path check OK; blockers closed
- **Re-verify (continuation):** `static-regression-check.ps1` PASS; `useMockApi: false` + `resolveUseMock()` + tastes error/retry confirmed in tree
- **Не тронуто:** sessionStorage handoff, B-8 accent, inline styles (🟡 некритично)
- **Следующий шаг:** code-review task-07 круг 2 → task-08/09

## [code-review] task-07 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-site` (uncommitted diff on `master`; new CSS/JS/assets)
- Review agents (parallel): `review-general`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`; no AGENTS `reviewAgents`)
- Baseline: task-07.md + architecture v1.2 + request.md concept-16
- Артефакт: `tasks/task-07-review.md`
- **hasCriticalIssues:** true
- **Вывод:** split/stack, VIWA brand, B-4/B-5 CTA (serial + `entry=website`, no dead-end), no iframe, tier skeleton/error/retry, no HTML hardcoded prices, legacy pages preserved, Docker untouched — OK vs task/architecture. **Круг 2 blockers:** (1) `landing-api.js` tastes `catch` always renders `MOCK_TASTES` even when `useMockApi: false` (mock leak on live failure); (2) committed `useMockApi: true` + `!== false` semantics — production deploy risk before task-09 gate. **Некритично:** missing site `sessionStorage` handoff (Flow A), B-8 accent-on-bg, CSP inline handlers, tastes no error UI, CTA `href="#"` pre-JS.
- **Следующий шаг:** developer-complex круг 2 (mock guard + tastes error path) → re-review → task-08 assets parallel OK → task-09 live API

## [code-review] task-07 — круг 2 — 2026-07-29

- Субагент: code-reviewer-complex
- Scope: повторная проверка 🔴 blockers круга 1 (mock opt-in/default false; no MOCK on live API failure)
- Repo: `viwa-site`
- Verification: `scripts/static-regression-check.ps1` PASS (exit 0)
- Артефакт: `tasks/task-07-review.md` (обновлён)
- **hasCriticalIssues:** false
- **Вывод:** Blocker #1 закрыт — `useMockApi: false`, `resolveUseMock()` strict `=== true`, `isProductionHost()` fail-closed. Blocker #2 закрыт — tastes/tiers catch → error/retry on live failure; mock только при explicit opt-in. 🟡 sessionStorage, B-8, CSP inline — без изменений, не блокируют. Следующий gate — task-09 staging CORS/live API, не mock-regression.
- **Следующий шаг:** task-08 assets (parallel OK) → task-09 live wire-up → task-10 browser B-scenarios

## [developer] task-05 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-client-web-app`
- **Git baseline:** branch `dev`; untracked `docs/`, `.env.production`, `TEMP_TEST_SCENARIOS.md` preserved; no commit/push
- **Сделано:**
  - Routes `/register`, `/auth`, `/auth/sms/:time/:phone`, `/home` + existing `/m/:machineSerial/*`
  - `RegisterPage`, `SerialCapturePage`, `landingEntry.ts`, auth guards (returning/home)
  - `registrationHint=website` in check-code when `viwa_entry=website`; no `registrationSource` in body
  - Post-first-reg `history.replaceState` → `/home`; serial stripped from URL + `viwa_serial` cleared
  - Returning `/auth` without serial gate; `hasAuthTokens` → auto `/home`; 401 redirect → `/auth`
  - Tests CW05-1…CW05-5; vitest 3.2.4 + `globals: true` (Node 22 fix)
- **Verification:** lint exit 0; test 18/18 PASS; build exit 0 from `wiva-client-web-app` path
- **Артефакт:** `tasks/task-05-test-report.md`
- **Не в scope:** SubscriptionPage UI (task-06), live API gate (task-09), Docker, commit/push
- **Следующий шаг:** code-review task-05 → task-06 concept-16 UI on routes

## [code-review] task-05 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-client-web-app` (branch `dev`, uncommitted)
- Review agents (parallel): `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-final` (`composer-2.5-fast`)
- Арtefact: `tasks/task-05-review.md`
- **hasCriticalIssues:** true
- **Вывод:** CW05-1…CW05-5 и architecture v1.2 §0 routing/hint logic в коде — OK (`registrationHint`, не `registrationSource`; post-reg `/home`; returning `/auth`). **Blockers:** (1) ESLint 7 parsing errors — `tsconfig exclude` test files без sync ESLint project; test-report lint exit 0 устарел; (2) authed entry `/m/:serial/` → relative `home` = `/m/:serial/home`, не канон `/home`; (3) double `fetchMachineBySerial` SerialCapture → ValidationPage (Flow B). Некритично: 401+skipAuth, hint в returning flow, sessionStorage spoof MVP-risk, auth helpers в ValidationPage, слабые component tests, Vitest 3.2.4 infra.
- **Verification re-check:** lint exit 1; test 18/18 PASS; build exit 0 (`wiva-client-web-app` path)
- **Следующий шаг:** developer-complex круг 2 (lint/tsconfig.eslint, ValidationPage `/home`, dedup public lookup) → re-review → task-06

## [developer] task-05 — круг 2 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-client-web-app`
- Вход: `tasks/task-05-review.md` — только 3 🔴 blockers
- **Fix #1:** `tsconfig.eslint.json` + `.eslintrc` project sync — lint exit 0 (0 errors, 23 pre-existing warnings)
- **Fix #2:** `getMachineEntryRedirectPath` — authed entry `/m/:serial/` → `/home` (architecture v1.2 clean URL)
- **Fix #3:** `machineSerialValidationCache.ts` — SerialCapture marks pre-validated serial; hook consumes flag → single public API call on Flow B
- **Tests added:** `machineSerialValidationCache.test.ts`, `useMachineSerialValidation.test.tsx`, routing + SerialCapture updates
- **Infra:** `jsdom@26` devDep; `tsconfig.json` excludes `*.test.tsx`; vitest 24/24 PASS
- **Verification:** lint exit 0; test 24/24 PASS; build exit 0
- **Артефакт:** `tasks/task-05-test-report.md` (round 2)
- **Не в scope:** 401 skipAuth, hint returning flow, auth helpers extract, task-06 UI, commit/push
- **Следующий шаг:** code-review task-05 круг 2 → task-06

## [developer] task-05 — круг 2 resume — 2026-07-29

- Субагент: developer-complex (прерванный круг 2 — verify-only)
- **Состояние:** все 3 🔴 blockers уже применены в предыдущем ходе; дублирование правок не выполнялось
- **Re-verification:** lint exit 0; test 24/24 PASS; build exit 0 (`C:\wiva\wiva-client-web-app`)
- **Blockers closed:** ESLint `tsconfig.eslint.json`; authed entry → `/home`; `machineSerialValidationCache` dedup
- **Артефакт:** `tasks/task-05-test-report.md` (verification timestamp updated)
- **Не в scope:** commit/push
- **Следующий шаг:** code-review task-05 круг 2 re-review

## [developer] task-05 — круг 2 resume (2) — 2026-07-29

- Субагент: developer-complex (verify-only; no code delta)
- **Re-verification:** lint exit 0; test 24/24 PASS; build exit 0
- **hasCriticalIssues (task-05-review):** all 3 blockers closed in tree
- **Следующий шаг:** code-review task-05 круг 2 re-review → task-06

## [code-review] task-05 — круг 2 — 2026-07-29

- Субагент: code-reviewer-complex
- Scope: re-review 3 🔴 blockers круга 1 (lint parsing, authed entry `/home`, validation cache dedup)
- Repo: `viwa-client-web-app` (branch `dev`, uncommitted)
- Арtefact: `tasks/task-05-review.md` (обновлён, секция круг 2)
- **hasCriticalIssues:** false
- **Blockers closed:**
  1. ESLint — `tsconfig.eslint.json` + `.eslintrc` project sync; lint exit 0 (0 errors)
  2. Authed `/m/:serial/` entry → `getMachineEntryRedirectPath(true)` = `/home` (architecture v1.2)
  3. `machineSerialValidationCache` — one-shot mark/consume; Flow B single API call; refresh/direct entry re-fetch; no cross-serial consume
- **Verification:** lint exit 0; test 24/24 PASS; build exit 0 (`C:\wiva\wiva-client-web-app`)
- **🟡 без изменений:** 401 skipAuth, returning hint, auth helpers coupling, component tests, Vitest infra
- **Следующий шаг:** task-06 concept-16 UI on routes; optional 🟡 backlog; commit/push → user confirmation + `/task-completion`

## [developer] task-06 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-client-web-app`
- **Depends on:** task-05 closed (routing/auth)
- **Сделано:**
  - concept-16 SubscriptionPage: monthly progress (`monthlyUsedMl`/`monthlyLimitMl`, trial fallback), QR, plan cards 12/18 L with API `priceKopecks`
  - `FavoriteFlavorsSection` — ≤3 from public catalog; `loyaltyModule.updateFavoriteTastes`; manifest paths `/assets/viwa/tastes/{key}.webp|png` + placeholder
  - `VolumeCircle` — accent token ring, percent, a11y aria-label
  - `BottomNav` MVP — home + profile active; history/settings stubs
  - `viwa-tokens.css`, `publicModule` tastes/tiers, `clientDTO` monthly + favorites
  - WS `client.profile.updated` + billing flow preserved
- **Verification:** lint exit 0; test 32/32 PASS; build exit 0 (`C:\wiva\wiva-client-web-app`)
- **Locale:** RU via `subscriptionLocale.ts` + `ru.json`/`en.json`; `locale:sync/sort/verify` scripts absent in package.json
- **Артефакт:** `tasks/task-06-test-report.md`
- **Не в scope:** task-08 assets, task-09 live wire-up, Docker, commit/push
- **Следующий шаг:** code-review task-06 → task-08 assets / task-09 staging gate

## [developer] task-06 — круг 2 — 2026-07-29

- Субагент: developer-complex
- Вход: `tasks/task-06-review.md` — 5 🔴 blockers only
- **Fix #1:** `subscriptionStatus.ts` — expired `subscriptionEndsAt` / zero pool → `shouldShowRenewalPlans` + `progressExpired` status
- **Fix #2:** `mergeClientProfileFromServer` + slice `localRevision`/`pendingFetchRevision` — stale GET preserves volatile WS/PATCH fields
- **Fix #3:** 47 `subscription.*` keys ru/en parity; `tSubscription` from JSON; `scripts/locale-verify-subscription.mjs`; npm `locale:verify`
- **Fix #4:** progress card `<button>` + `VolumeCircle` `role="progressbar"` aria values
- **Fix #5:** `BottomNav` `NavLink` (no full reload)
- **Tests added:** R2-1…R2-3, R2-5 (+ slice race, merge, locale)
- **Verification:** lint exit 0; locale:verify exit 0; test 40/40 PASS; build exit 0
- **Артефакт:** `tasks/task-06-test-report.md` (round 2)
- **Не в scope:** task-08 assets, task-09, Docker, commit/push, 🟡 SCSS/token polish
- **Следующий шаг:** code-review task-06 круг 2 re-review

## [code-review] task-06 — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-client-web-app` (branch `dev`, uncommitted)
- Review agents (parallel): `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Baseline: task-06.md + architecture v1.2 + concept-16 + task-06-test-report.md
- Арtefact: `tasks/task-06-review.md`
- **hasCriticalIssues:** true
- **Вывод:** concept-16 SubscriptionPage, monthly progress (`resolveMonthlyProgress` + trial fallback), API `priceKopecks`, favorites max-3 from public catalog, WS `client.profile.updated` + billing preserved, viwa tokens, BottomNav MVP, no routing/task-08/09 leakage — OK vs task/architecture. **Blockers:** (1) `isActiveSubscription` ignores expired `subscriptionEndsAt` — plan cards hidden, renewal blocked; (2) GET `/client/me` full-replace races WS/PATCH merge — stale profile can overwrite favorites/monthly progress; (3) locale verify acceptance open — `locale:sync|sort|verify` absent, partial ru/en vs `subscriptionLocale.ts`; (4) progress card keyboard + `VolumeCircle` `role=img`; (5) `BottomNav` `<a href>` full SPA reload. Некритично: SubscriptionPage monolith, SCSS `var()` fallbacks, CW06-3 weak (helper not UI), pre-task-08 image waterfall, hardcoded RU aria fragments.
- **Verification re-check:** lint exit 0; test 32/32 PASS; build exit 0 (`C:\wiva\wiva-client-web-app`)
- **Следующий шаг:** developer-complex круг 2 (expired UX, profile merge race, locale/a11y/nav) → re-review → task-08 assets parallel OK → task-09 staging gate

## [developer] task-06 — круг 2 — 2026-07-29

- Субагент: developer-complex
- Repo: `viwa-client-web-app`
- Вход: `tasks/task-06-review.md` — 5 🔴 blockers круга 1
- **Fix:** `subscriptionStatus.ts` + renewal visibility; `mergeClientProfileFromServer` + slice revision race guard; 47-key locale parity + `locale:verify` script; progress `<button>` + `VolumeCircle` progressbar; `BottomNav` `NavLink`
- **Tests added:** R2-1…R2-3, R2-5; total 40/40 PASS
- **Verification:** lint exit 0; locale:verify exit 0 (47 keys); build exit 0
- **Артефакт:** `tasks/task-06-test-report.md` (round 2)
- **Не в scope:** SCSS token cleanup, SubscriptionPage extract, task-08/09, commit/push
- **Следующий шаг:** code-review task-06 круг 2 re-review

## [code-review] task-06 — круг 2 — 2026-07-29

- Субагент: code-reviewer-complex (re-review blockers only)
- Scope: verify closure of 5 🔴 blockers from task-06-review круг 1
- Repo: `viwa-client-web-app` (branch `dev`, uncommitted)
- Арtefact: `tasks/task-06-review.md` (обновлён, секция круг 2)
- **hasCriticalIssues:** false
- **Blockers closed:**
  1. Expired subscription — `isActiveSubscriptionProfile` + `shouldShowRenewalPlans`; plan cards visible; `progressExpired` copy; R2-1 test
  2. GET/WS race — `mergeClientProfileFromServer` + `localRevision`/`pendingFetchRevision`; volatile preserve on stale GET; R2-2 test
  3. Locale verify — 47 `subscription.*` keys ru/en; `tSubscription` from JSON + `setSubscriptionLocale`; `locale:verify` exit 0; R2-3 test
  4. a11y — progress card native `<button>`; `VolumeCircle` `role="progressbar"` + aria values; CW06-1
  5. BottomNav — `NavLink` SPA nav; localized `navAriaLabel`; R2-5 test
- **Verification:** lint exit 0; locale:verify exit 0 (47 keys); test 40/40 PASS; build exit 0 (`C:\wiva\wiva-client-web-app`)
- **🟡 без изменений:** SubscriptionPage monolith, SCSS var() fallbacks, CW06-3 UI gap, dual nav item `/home`, pre-task-08 image waterfall
- **Следующий шаг:** task-08 assets (parallel OK) → task-09 staging gate → task-10 browser B-scenarios; commit/push → user confirmation + `/task-completion`

## [developer] task-08 — 2026-07-29

- Субагент: developer-complex
- Repos: `viwa-site` + `viwa-client-web-app`
- **Сделано:**
  - Pillow pipeline `viwa-site/scripts/process-viwa-assets.py` — normalize/crop 18 assets from parent batch; WebP+PNG; originals outside repo
  - Canonical `viwa-site/assets/manifest.json` v1.0.0 (18 IDs, altRu, tasteMediaKey)
  - Site: `<picture>` hero/cabinet; `landing-api.js` manifest + taste tiles lazy WebP/PNG
  - Client: mirror `public/assets/viwa/**`; `src/data/viwaAssetManifest.json`; `viwaAssets.ts` manifest lookup; FavoriteFlavors `altRu`
- **Verification:** dimension check PASS; site static-regression PASS; client lint 0 errors; locale:verify PASS; test 40/40; build exit 0; dist/assets/viwa 37 files
- **Артефакт:** `tasks/task-08-test-report.md`
- **Не в scope:** task-09 prices/API, commit/push/deploy, Docker, GenerateImage
- **Следующий шаг:** code-review task-08 → task-09 staging gate → task-10 browser checks

## [user-clarification] mobile parity + deploy — 2026-07-29

- Триггер: пользователь — «лендинг сделай и в мобилке тоже; не только desktop» + повторное подтверждение production deploy
- **Обновлено (docs-only, без продуктового кода):**
  - `request.md` — append user message
  - `tz.md` — mobile landing parity gate, viewports, acceptance, deploy authorization
  - `plan.md` — task-09 owner mobile polish; task-10 browser gate; deploy via task-completion; no CI unless requested
  - `tasks/task-09.md`, `tasks/task-10.md` — roles clarified
  - `TEMP_TEST_SCENARIOS.md` — canonical viewports 360×800, 390×844, 430×932 + 1440×900; mobile parity checklist
- **Waves/dependencies:** без изменений
- **Deploy:** authorized пользователем; execution — `/task-completion` после task-10 gate; `/ci-cd-status` — только по отдельному запросу
- **blockingQuestions:** []
- **Следующий шаг:** task-09 (live API + mobile landing polish) → task-10 browser gate

## [code-review] task-08 — 2026-07-29

- Субагент: code-reviewer-complex
- Repos: `viwa-site` + `viwa-client-web-app` (uncommitted)
- Review agents (parallel): `review-general`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Baseline: task-08.md + architecture v1.2 §7 + task-08-test-report.md
- Verification re-check: `static-regression-check.ps1` PASS; manifest 18×webp/png on disk; Pillow 0 dimension mismatches; taste keys ≡ `TASTE_MEDIA_KEYS`; triple manifest byte-sync
- Арtefact: `tasks/task-08-review.md`
- **hasCriticalIssues:** false
- **Вывод:** §7 contract закрыт — 18 assets in manifest + generated files; site hero-bottle + cabinet mock + 14 lazy taste `<picture>` with manifest `altRu`; client mirror + `FavoriteFlavorsSection` manifest paths/fallback; no originals in repo; no price leakage. 🟡 `hero-station`/logo PNG not wired in site HTML (SVG logo follow-up separate — not blocker); ~22 MB payload; README stale; script hardcodes `wiva-client-web-app` path.
- **Следующий шаг:** task-09 staging gate (live API + mobile polish) → task-10 browser B-scenarios; optional 🟡 backlog (hero-station wire-up, README, preload LCP)

## [user-correction] logo canonical — 2026-07-29

- Триггер: пользователь — canonical logo = diagonal-cut **VIWA wordmark only** (no droplet); concept-16 source PNG; **не** использовать `logo-viwa-mark.svg`/droplet PNG
- **Действие в task-09:** откат ошибочной SVG-интеграции; text «VIWA» fallback на site + client; `logoIntegrationDeferred` до corrected SVG/PNG pipeline
- **Canonical assets (external):** `.../image-0ee4ddf0-....png` (wordmark), concept `.../viwa-concept-16-....png`

## [developer] task-09 — 2026-07-29

- Субагент: developer-complex
- Repos: `viwa-telemetry` + `viwa-client-web-app` + `viwa-site`
- **Сделано:**
  - Live API wire-up confirmed (site `useMockApi: false`, client `publicModule` real fetch); `.env.staging.example`
  - Mobile parity: safe-area, stack reorder (hero→flavors→tiers→serial→cabinet), hero-station mobile, `sizes`/lazy payload tuning
  - `process-viwa-assets.py` client root auto-detect (`viwa-*` / `wiva-*`)
  - Logo: erroneous droplet SVG integration **removed**; `logoIntegrationDeferred` per user correction
- **Verification:** site static-regression PASS; telemetry lint/typecheck/API test/build PASS (335 pass, 169 skip); client lint/locale/test/build PASS (40/40)
- **Deferred:** logo wire-up; task-10 browser A–F + 360/390/430; staging CORS/DB integration (`DATABASE_URL`); `@viwa/web` full test suite (pre-existing vitest matcher failures — not task-09 scope)
- **Артефакт:** `tasks/task-09-test-report.md`
- **Не в scope:** commit/push/deploy, Docker
- **Следующий шаг:** corrected logo SVG pipeline → task-10 browser gate

## [developer] task-09 logo resume — 2026-07-29

- Триггер: пользователь — corrected canonical SVG `logo-viwa-mark.svg` (viewBox 277×243, single currentColor path, no droplet)
- **Сделано:** SVG+PNG+WebP → site/client logo dirs; manifests byte-sync; site header/menu/hero/footer + client `ViwaBrandLogo`; PNG re-rasterized from SVG via resvg (not task-08 droplet PNG); text VIWA fallback on error; static-regression droplet guards
- **`logoIntegrationDeferred`:** false
- **Verification:** site static-regression PASS; manifest/SVG validation PASS; client lint/locale/test/build PASS (40/40)
- **Следующий шаг:** task-10 browser gate

## [developer] task-09 logo blocker fix — 2026-07-29

- Триггер: QA — site SVG/manifest отсутствуют после regen `process-viwa-assets.py` @18:24
- **Root cause:** processor всё ещё брал droplet PNG 512×512, rmtree затирал SVG
- **Fix:** `process_logo_assets()` — canonical SVG copy + resvg PNG/WebP + manifest svg 277×243; `verify-assets-idempotent.ps1`; client root via junction (viwa→wiva, без дубля repo)
- **Verification:** idempotent gate PASS; static-regression PASS; client lint/locale/test/build PASS; SVG hash stable `7f41f638…`; triple-sync manifest `cb431680…`
- **`logoIntegrationDeferred`:** false
- **Следующий шаг:** task-10 browser gate

## [developer] task-09 pipeline WinError32 fix — 2026-07-29

- Триггер: independent gate — `verify-assets-idempotent` failed WinError 32 on `rmtree(CLIENT_OUT)`; partial tree (site 28 files, logo SVG missing)
- **Root cause:** destructive pre-gen `rmtree` on live outputs while Vite/dev held file locks
- **Fix:** staging-first generate + validate + atomic publish (site dir swap, client per-file retry); processor lock; verify script backup/restore + sequential lock guard
- **Recovery:** processor restore → static-regression PASS → idempotent 2× PASS → client build PASS
- **Evidence:** site 37 generated files; client 38; SVG hash `7f41f638…` unchanged; manifest 18 assets logo 277×243
- **Следующий шаг:** task-10 browser gate

## [code-reviewer-complex] task-09 — 2026-07-29

- Субагент: code-reviewer-complex → parallel `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Baseline: `tasks/task-09.md`, `architecture.md` v1.2, `tasks/task-09-test-report.md`, corrected canonical logo SVG
- Repos reviewed: `viwa-site` + `viwa-client-web-app` (task-09 diff); `viwa-telemetry` — no task-09 changes
- **Артефакт:** `tasks/task-09-review.md`
- **hasCriticalIssues:** false
- **Вывод:** Live API default + fail-closed mock guards; tiers/tastes error+retry; no HTML hardcoded prices; 2-tier guard; 14 tastes + manifest lazy `<picture>`; mobile stack reorder/safe-area/hero-station; corrected logo SVG (277×243, single path, no droplet) wired site+client; manifest triple-sync; static-regression PASS. 🟡 sessionStorage site handoff, B-8 contrast, CTA `href="#"` pre-JS, inline onerror/CSP, hero-station mobile payload, static hero HTML paths — не блокируют. **Gates:** browser flows A–F + 360/390/430 → task-10; staging CORS/DB (`DATABASE_URL`) → Wave 1 staging smoke.
- **Следующий шаг:** task-10 browser B-scenarios → commit/push по user confirmation + `/task-completion`

## [code-reviewer-complex] task-09 idempotence re-review — 2026-07-29

- Триггер: focused re-review после idempotence fix (`process-viwa-assets.py` staging publish + `verify-assets-idempotent.ps1`)
- **Verification:** `verify-assets-idempotent.ps1` PASS (2× process + 2× static-regression); SVG SHA256 stable `7f41f638…` run1==run2==canonical source; manifest triple-sync; site 37 + client 38 files; droplet guards PASS
- **Pipeline:** staging validate (sha256 canonical SVG) → atomic publish; lock file; backup/restore on gate failure
- **Prior live/mobile findings:** unchanged (sessionStorage 🟡, B-8, task-10 browser, staging CORS/DB gates)
- **Артефакт:** `tasks/task-09-review.md` (§ Re-review after idempotence fix)
- **hasCriticalIssues:** false
- **Следующий шаг:** task-10 browser gate

## [developer-complex] task-10 — path alias fix — 2026-07-29

- Repo: `viwa-client-web-app` (branch `dev`, uncommitted)
- **Root cause:** Windows junction `viwa-client-web-app` → `wiva-client-web-app`; Vite/Vitest mixed junction cwd with realpath config dir → 4 TSX suite load failures + invalid build HTML chunk `../wiva-client-web-app/index.html`
- **Fix:** `scripts/projectRoot.mjs` (`realpathSync.native`), explicit `root` + `process.chdir(projectRoot)` in `vite.config.ts` / `vitest.config.ts`; Node regression `scripts/projectRoot.test.mjs` chained in `npm test`
- **Артефакт:** `tasks/task-10-test-report.md`
- **Verification (viwa canonical):** lint 0 errors; locale:verify 47 keys OK; test 40/40 + regression 2/2; build exit 0
- **Smoke (wiva alias):** test 40/40 + regression 2/2; build exit 0
- **Deferred follow-ups (not user decisions):** browser B-1…B-18 (task-10 remainder); viwa-telemetry/viwa-site gates (elsewhere); task-11 folder cutover (future); commit/push/deploy via `/task-completion`
- **openQuestions:** []
- **Следующий шаг:** browser gate B-1…B-18 per `task-10.md`; no commit/push until user + `/task-completion`

## [code-review] task-10 — path alias fix — 2026-07-29

- Субагент: code-reviewer-complex
- Scope: infra subtask only — junction-safe `projectRoot` (`scripts/projectRoot.mjs`, vite/vitest configs, package.json test chain, tsconfig)
- Review agents (parallel): `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Baseline: `tasks/task-10-test-report.md`, root cause viwa→wiva junction cwd/realpath mismatch
- Verification re-check: `npm test` 17 files/40 + node 2/2 PASS from `viwa-*` and `wiva-*`; `npm run build` exit 0 both paths (`dist/index.html`); lint exit 0
- Арtefact: `tasks/task-10-review.md`
- **hasCriticalIssues:** false
- **Вывод:** fix корректно канонизирует project root через `realpathSync.native`; Vite/Vitest согласованы; тесты не исключены (17 src test files); Windows junction + legacy cwd smoke OK. 🟡: global `chdir` side effect, duplicate alias blocks, `test:watch` без node regression, docs JSDoc gaps on `.d.ts`, AGENTS transitional note не упоминает снятие wiva-only workaround.
- **Следующий шаг:** remainder task-10 browser B-1…B-18 + other repos gates; commit/push via `/task-completion`

## [code-review] task-10 — viwa-telemetry Vitest infra — 2026-07-29

- Субагент: code-reviewer-complex
- Repo: `viwa-telemetry` (`apps/web` test infra only; uncommitted)
- Scope: `setup.ts`, `vite.config.ts`, `tsconfig.json`, `vitest-run.mjs` (NEW), `package.json`
- Review agents (parallel): `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- Baseline: task-10-test-report.md § viwa-telemetry; root cause duplicate Vitest + jest-dom on wrong `expect`
- Verification evidence: web **66 files / 502 tests** PASS; root API **335 pass** + **169 skip** + web 502; lint/typecheck/build exit 0
- Арtefact: `tasks/task-10-telemetry-test-setup-review.md`
- **hasCriticalIssues:** false
- **Вывод:** global `expect.extend(matchers)` + `realpathSync`/`dedupe` + junction-safe `vitest-run.mjs` — OK; 66 test files on disk = Vitest banner; no product behavior change. 🟡: spawn error/signal logging, unused `join` import, no `test:watch` wrapper, AGENTS.md junction note, junction-path smoke not in test report.
- **Следующий шаг:** remainder task-10 browser gate (3 FAIL); optional 🟡 polish; commit/push via `/task-completion`

## [browser-test-orchestrator] task-10 gate — 2026-07-29

- Skill: `/browser-test-orchestrator` (mandatory per task-10/TZ; AGENTS lacks `browserTesting` flag — overridden by task spec)
- Env: `viwa-site` python http.server `:8080`; `viwa-client-web-app` vite preview `:5173`; Playwright headless via temp install (no package manifest changes)
- Mocks: route intercept public tiers/tastes (2×12/18 L, 499/699 ₽), client machine/auth/profile/billing; no real OTP/SBP
- **Артефакты:** `browser-test-report.md`, `TEMP_TEST_SCENARIOS.md` (statuses), `screenshots/2026-07-29/` (34 PNG), `TEMP_browser_gate_results.json`, `TEMP_browser_gate.mjs`
- **Results:** 31 PASS / 3 FAIL / 2 DEFERRED (36 rows)
- **FAIL:** B-3 (390×844 API error path — error/retry/no-leak), B-10 (mock OTP → `/home` + URL strip), B-14 (18 L tier UI on home)
- **DEFERRED post-deploy:** B-17 admin WEBSITE attribution; B-18 network-wide pour
- **Product code:** not modified
- **Следующий шаг:** developer fix for 3 FAIL; retest; B-17/B-18 on staging after deploy; `/task-completion` blocked until gate clear or documented acceptance

## [browser-test-orchestrator] task-10 rerun failed — 2026-07-29

- Rerun: `--rerun-failed` for **B-3**, **B-10**, **B-14** only
- Fix: fresh browser context per B-3 mobile width; mutable tiers mock + retry recovery; OTP per-digit fill; trial profile for B-14 plan section
- **Rerun:** 5/5 PASS (B-3 ×3 mobile + B-10 + B-14)
- **Gate totals after merge:** 36 PASS / 0 FAIL / 2 DEFERRED (38 rows)
- **Screenshots:** `screenshots/2026-07-29/B-3_err_360x800.png`, `B-3_recovery_390x844.png`, `B-3_err_430x932.png`, updated `B-10_390x844.png`, `B-14_390x844.png`; removed obsolete `B-3_err_390x844.png`
- **Product code:** not modified
- **Следующий шаг:** B-17/B-18 post-deploy on staging; `/task-completion` when user authorizes

## [infra] task-10 — viwa-telemetry web Vitest jest-dom fix — 2026-07-29

- Repo: `viwa-telemetry` (`apps/web`, uncommitted)
- **Symptom:** `@viwa/web` — 64 files / 78 tests fail (`Invalid Chai property: toBeInTheDocument`); `@viwa/api` 335 pass
- **Root cause:** global `expect` vs setup `import { expect }` mismatch + Windows junction `viwa-telemetry` / `wiva-telemetry` duplicate `node_modules` → две копии Vitest
- **Fix:** `setup.ts` `expect.extend(matchers)` на global expect; `vitest/config` + `realpathSync`; `scripts/vitest-run.mjs`
- **Артефакт:** `tasks/task-10-test-report.md` (§ Subtask: viwa-telemetry)
- **Verification:** `npm test -w @viwa/web` **502/502**; root `npm test` **0** (api 335 + web 502); lint/typecheck/build **0**
- **openQuestions:** []
- **Следующий шаг:** remainder task-10 browser B-1…B-18 fixes (3 FAIL); `/task-completion` after gate clear

## [developer] task-10 browser FAIL round — 2026-07-29

- **Scope:** B-3, B-10, B-14 from browser gate; no commit/push/deploy; TEMP runner kept for browser-agent rerun
- **B-3 (real bug + test hygiene):** `landing-api.js` called `getElementById('viwa-tiers')` but `index.html` had `id="tiers"` → `data-state` never updated; error UI/retry existed in DOM but gate assertion on `#viwa-tiers[data-state=error]` failed. Stale 499/699 after intercept 503 exacerbated by HTTP cache after prior success subtests. **Fix:** `id="viwa-tiers"` + nav `#viwa-tiers`; `fetch` `cache: 'no-store'`; clear list on reload; runner runs error subtest before success + scoped price leak check.
- **B-10 (test bug):** `CodeInput` uses 4× `maxLength=1` fields; runner `.fill('1234')` on first input never triggered `onComplete` → check-code/navigation skipped. Product OTP + `replaceBrowserUrl('/home')` unchanged. **Fix:** fill digits 1–4 separately; `waitForURL(/\/home/)`.
- **B-14 (test bug / product semantics):** Gate used `MOCK_PROFILE` with **active 12 L subscription**; `shouldShowRenewalPlans` hides plan cards by design (architecture v1.2, task-06). B-13 false-pass matched `/12/` in status text, not purchase UI. **Fix:** `MOCK_PROFILE_TRIAL` for B-13/B-14; assert within plan section. **Product:** tier purchase UI for trial/expired/no-sub; active subscribers see progress + tier name only — mid-cycle upgrade deferred (tz_review § proration).
- **Repos touched:** `viwa-site` (`index.html`, `landing-api.js`, `static-regression-check.ps1`); `viwa-client-web-app` docs (`TEMP_browser_gate.mjs` only)
- **Verification:** site `static-regression-check.ps1` PASS; client lint 0 errors, locale:verify 47/47, test 40/40+2, build 0
- **Pending:** browser-agent rerun B-3/B-10/B-14 only (full gate not rerun)
- **openQuestions:** [] (mid-cycle tier upgrade remains deferred per architecture — not blocking this gate)

## [developer-complex] task-11 — 2026-07-29

- Субагент: developer-complex
- Repo: docs (`viwa-client-web-app/docs/agents/viwa-landing-subscriptions/`)
- **Сделано:**
  - **NEW** `deploy-runbook.md` — validated topology (`ssh wiva-server`; `viwa-server` does not resolve); preflight gates A–E; M1 `pg_dump` before `prisma migrate deploy`; ordered deploy telemetry → client → site; asset pipeline lock + canonical logo hash (no droplet); smoke S1–S8; rollback <2 min site; post-deploy B-17/B-18 (cannot fabricate without admin DB + physical machine)
  - Cross-links: `plan.md`, `architecture.md` §8
- **Final gates incorporated:** browser **36 PASS / 0 FAIL / 2 deferred**; telemetry **335 API + 502 web**; client **42** tests; site static-regression PASS
- **Server verification (read-only):** `wiva-server` — telemetry `current` → `202607291138-662322e`; client → `20260728113442`; site `/var/www/vitamin-water-ru`; nginx roots match architecture; `viwa-telemetry-api` active
- **Не в scope:** commit/push/deploy/version bump (→ `/task-completion`); Docker; SSH apply/migration on production
- **Следующий шаг:** `/task-completion` — version bump, conventional commits (3 repos), push, ordered deploy per runbook; optional B-17/B-18 manual post-deploy

## [code-reviewer-complex] task-10 B-3/B-10/B-14 fix review — 2026-07-29

- **Scope:** Review only (no code changes) — `viwa-site` `index.html`, `landing-api.js`, `static-regression-check.ps1`; `TEMP_browser_gate.mjs`
- **Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)
- **Артефакт:** `tasks/task-10-review.md` § Browser FAIL fix round + Strict JSON
- **B-3:** ✅ real fix confirmed — `id="viwa-tiers"` aligns HTML/JS/nav; `cache: 'no-store'` + list clear reasonable; runner error-before-success + scoped leak check
- **B-10:** ✅ test fix confirmed — 4× `maxLength=1` OTP fill matches `CodeInputGroup.onComplete`; mock check-code → `/home` path accurate; product unchanged
- **B-14:** ✅ test fix confirmed — `MOCK_PROFILE_TRIAL` matches `shouldShowRenewalPlans`; plan-section scoped asserts avoid progress/status false positives; architecture v1.2 semantics preserved
- **hasCriticalIssues:** false
- **🟡 (non-blocking):** CSS-module selectors in runner; page-wide price regex on B-3 success; manifest fetch without no-store (pre-existing)
- **Pending:** browser-agent rerun B-3/B-10/B-14; full task-10 gate; `/task-completion` blocked until rerun pass

## [code-reviewer-complex] task-11 — 2026-07-29

- Субагент: code-reviewer-complex → parallel `review-docs`, `review-general`, `review-final` (`composer-2.5-fast`)
- **Scope:** Review only (no fixes) — `deploy-runbook.md`, `architecture.md` §8, `plan.md` task-11 / Wave 4, cross-ref `viwa-telemetry/docs/deployment/server.md`, observed topology
- **Артефакт:** `tasks/task-11-review.md` + Strict JSON
- **Validation:** M1 pg_dump before migrate ✅; symlink `chown -h viwa:viwa` ✅; site atomic swap ✅; no Docker ✅; **`wiva-server`** alias ✅ (`viwa-server` does not resolve); no secrets ✅; S1–S8 / B-17 / B-18 honest ✅
- **hasCriticalIssues:** false
- **🟡 (non-blocking):** site Step 3 upload comment-only (no paste-ready rsync); architecture §8 vs runbook drift on `VITE_VIWA_TELEMETRY_API_URL` (tl vs cabinet) and telemetry release id pattern; rollback Option A `docroot.failed` vs deploy `.prev-${TS}` naming; mixed sudo vs root-SSH in site backup/swap
- **Acceptance task-11:** all criteria met (docs gates-only)
- **Pending:** `/task-completion` — version bump, commits (3 repos), push, ordered deploy per runbook; manual B-17/B-18 post-deploy

## [session-summary] 2026-07-29

- **Артефакт:** `summary.md` — final complex session summary (docs-only; product code not modified)
- **Источники:** request, tz, architecture v1.2, plan, tasks 01–11 + reviews/test reports, `browser-test-report.md`, `deploy-runbook.md`, orchestrator-log
- **Статус задач:** task-01…task-11 — **Done** (implementation + verification); deploy execution — **pending `/task-completion`**
- **Browser gate (final):** **36 PASS / 0 FAIL / 2 DEFERRED** (B-17 admin WEBSITE attribution, B-18 network pour — post-deploy only)
- **Verification baseline:** telemetry API **335** pass + **169** skip; web **502** pass; client **40** Vitest + **2** root alias = **42**; site static-regression + asset idempotent **PASS**
- **Ключевые решения зафиксированы:** monthly 12/18 L, canon §0 (`entry`/`registrationHint`/`registrationSource=WEBSITE`), serial flows A/B/C, 14 tastes, canonical no-droplet SVG logo, mobile parity viewports
- **Deploy:** user-authorized 2026-07-29; order telemetry → client → site; M1 pg_dump; SSH **`wiva-server`**
- **Git facts:** commits/push/deploy — **pending task-completion** (uncommitted changes in 3 repos at summary time)
- **blockingQuestions:** [] — none for summary; B-17/B-18 require real admin DB + physical machine post-deploy
- **Следующий шаг:** `/task-completion` on user request
