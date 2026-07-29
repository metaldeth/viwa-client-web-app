# Plan review — viwa-landing-subscriptions

**Дата:** 2026-07-29  
**Ревьюер:** plan-reviewer  
**Вход:** `tz.md` v1, `architecture.md` v1.2, `plan.md`, `tasks/task-01.md`…`task-11.md`, `TEMP_TEST_SCENARIOS.md`  
**AGENTS:** `viwa-telemetry`, `viwa-client-web-app` (viwa-site без AGENTS.md)

---

## Краткий вывод

План **пригоден к исполнению** (`hasCriticalIssues: false`). Все UC-1…UC-8 и browser-сценарии B-1…B-18 покрыты задачами или явно делегированы task-10; волны, repo ownership и Wave 1 API gate согласованы с architecture v1.2. Границы commit/push/deploy корректны: task-10/11 **не деплоят**; task-11 только runbook после quality gates; фактический deploy и version bump — `/task-completion` после явного подтверждения пользователя; `/ci-cd-status` — только по отдельному запросу (зафиксировано в task-11 downstream).

Сильные стороны: contract-first (task-01), telemetry-first Wave 1 gate (T1–T11), canon §0 (`entry` / `registrationHint`), parent-only GenerateImage (task-08), preserve uncommitted analytics в `apps/web/`, Docker-запрет во всех tasks, migration M1–M6 + rollback в architecture/task-11.

**Некритичные замечания (4):** B-8 не в acceptance task-07; WebSocket live behavior не явлен в task-06; M5 DROP `daily_usage_date` — размытая ownership между task-02/task-04; `localeCommands` не в AGENTS client-web (команды есть в task-06 — работает, но формальный gate слабее).

---

## Покрытие UC-1…UC-8

| UC | Описание | Задачи | Статус |
|----|----------|--------|--------|
| UC-1 | Landing split/stack, 14 вкусов, live tiers | task-07, task-08, task-09, task-10 (B-1…B-3) | ✅ |
| UC-2 | CTA → cabinet с `entry=website`, serial capture | task-05, task-07, task-10 (B-4, B-5) | ✅ |
| UC-3 | Первичная регистрация, serial required, URL strip | task-04, task-05, task-09, task-10 (B-9, B-10, B-15) | ✅ |
| UC-4 | Returning `/auth` без serial | task-04, task-05, task-10 (B-11) | ⚠️ refresh-token auto-login не в test cases task-05 (as-is, не блокер) |
| UC-5 | Client cabinet UI, favorites, monthly progress | task-06, task-08, task-10 (B-12) | ⚠️ WS live updates не явлены в task-06 (сохранить as-is) |
| UC-6 | Покупка 12/18 L, network-wide | task-02…04, task-06, task-09, task-10 (B-13, B-14, B-18) | ✅ |
| UC-7 | Admin attribution Website vs Machine QR | task-01, task-04, task-10 (B-17) | ✅ |
| UC-8 | Production deploy | task-11 (runbook only); deploy → `/task-completion` | ✅ |

**Непокрытые юзер-кейсы:** нет.

---

## Покрытие B-1…B-18

| ID | Owner | TEMP_TEST_SCENARIOS | Task acceptance | Статус |
|----|-------|---------------------|-----------------|--------|
| B-1 | task-10 | ✅ URL/viewport/actions | task-07 | ✅ |
| B-2 | task-10 | ✅ | task-08 | ✅ |
| B-3 | task-10 | ✅ + Wave 1 prereq | task-03, task-07 | ✅ |
| B-4 | task-10 | ✅ | task-07 | ✅ |
| B-5 | task-10 | ✅ | task-07, task-05 | ✅ |
| B-6 | task-10 | ✅ | task-07 (focus styles) | ✅ |
| B-7 | task-10 | ✅ | task-07 | ✅ |
| B-8 | task-10 | ✅ | — | ⚠️ только в TEMP; нет в task-07 acceptance |
| B-9…B-16 | task-10 | ✅ | task-05, task-06 | ✅ |
| B-17 | task-10 | ✅ | task-04, task-09 | ✅ |
| B-18 | task-10 | ✅ + skip policy | task-02, task-09 | ✅ |

**Висячие сценарии:** нет. Skip policy в TEMP_TEST_SCENARIOS покрывает env-ограничения (staging machine, mock phase).

---

## Волны и repo ownership

| Волна | Задачи | Repo | Gate / примечание |
|-------|--------|------|-------------------|
| 0 | task-01 | viwa-telemetry (docs) | Contracts §0 |
| 1 | task-02 → task-03 ∥ task-04 | viwa-telemetry | **Wave 1 gate:** T1–T11, public API + CORS; блокирует live wire-up 05/06/07 |
| 2 | task-05→06, task-07, parent 2D | client-web, viwa-site, parent | Mocks до gate; GenerateImage **только parent** |
| 3 | task-08, task-09 | all three | Live API после gate |
| 4 | task-10 → task-11 | all three + docs | Browser + build; runbook без deploy |

Dependency graph в `plan.md` согласован: нет ранних задач, зависящих от поздних. task-05/07 стартуют после task-01 с mocks — корректно.

---

## API gates (явные)

- **plan.md Wave 1 exit criteria:** T1–T3, T4–T6, T8, T9–T11, staging public endpoints — ✅
- **task-03:** «Wave 1 gate для client/site live API wire-up» — ✅
- **task-05/06/07:** mock до gate; live → task-09 — ✅
- **task-09:** explicit «Не deploy» — ✅
- **CORS:** task-03, до Wave 2C wire-up (architecture) — ✅

---

## Migration / rollback

| Элемент | Где зафиксировано | Статус |
|---------|-------------------|--------|
| Prisma M1–M6 order | architecture.md, task-02 | ✅ |
| M1 PG dump pre-migration | task-11 acceptance, architecture §8 | ✅ (deploy-time, не dev task-02) |
| down.sql / rollback SQL | task-02 touchpoints | ✅ |
| M5 DROP `daily_usage_date` gated | task-02 «may defer task-04» | ⚠️ ownership размыта — рекомендуется явно закрепить в task-04 или deploy-runbook |
| Site backup + atomic swap | task-11, architecture §8 | ✅ |
| Telemetry/client symlink rollback | task-11 | ✅ |
| FEATURE_MONTHLY_POOL flag | architecture only | ℹ️ optional mention in deploy-runbook |

---

## Tests / build per AGENTS

| Repo | AGENTS commands | План / tasks | Статус |
|------|-----------------|--------------|--------|
| viwa-telemetry | lint, typecheck, test, build | task-02…04, task-09, task-10 | ✅ |
| viwa-client-web-app | lint, test, build | task-05, task-06, task-08, task-09, task-10 | ✅ |
| viwa-site | static validation (plan) | task-07, task-10 | ✅ (нет AGENTS — plan compensates) |

**tdd: true** в AGENTS — **не задан** → формальные test-case таблицы в tasks не обязательны по skill; task-05/06 содержат test cases — плюс.

---

## Locale checks

- task-06: `locale:sync`, `locale:sort`, `locale:verify` — ✅
- task-10: `locale:verify` при изменённых строках — ✅
- **Замечание:** `localeCommands` не в `viwa-client-web-app/AGENTS.md`; команды есть в task-06 — developer должен следовать task, не AGENTS flag.

---

## Generated assets — parent-only contract

- plan.md: «субагентам запрещено генерировать assets» — ✅
- task-08: «Запрет генерации», external input from parent, §7 manifest — ✅
- Wave 2D: parent GenerateImage parallel — ✅

---

## Чужие telemetry changes (apps/web analytics)

- plan.md, task-04: preserve uncommitted work, isolated registrationSource slice — ✅
- task-02: «Не трогать apps/web/» — ✅
- task-09: «Не revert analytics» — ✅

---

## Docker

Запрет во всех task-01…11 и plan.md — ✅. Deploy topology static + symlink, без Docker — ✅.

---

## Version / commit / deploy boundaries

| Действие | Owner | Статус |
|----------|-------|--------|
| version bump | `/task-completion` (не task-11) | ✅ task-11 «Не version bump» |
| git commit/push | `/task-completion` | ✅ task-10/11 explicit |
| production deploy | `/task-completion` после user confirmation | ✅ |
| task-11 scope | docs/runbook only, no SSH/rsync/migrate prod | ✅ |
| Pre-deploy checklist | task-11: Wave 1 gate + task-10 browser pass + user confirmation | ✅ |
| CI/status monitoring | task-11 downstream: `/ci-cd-status` **on user request only** | ✅ |

**task-11 не деплоит до quality gates:** зависимость task-10 → task-11; task-11 acceptance требует task-10 browser pass — ✅.

---

## Задачи без достаточного описания

| Task | Замечание | Severity |
|------|-----------|----------|
| task-01 | Нет test-case таблицы (docs-only; tdd не в AGENTS) | info |
| task-07 | B-8 (WCAG contrast) не в acceptance; только static checklist | minor |
| task-06 | Не явлено «сохранить WebSocket live profile» (UC-5 alt) | minor |
| task-02/04 | M5 DROP ownership — «may defer task-04» без acceptance критерия | minor |

Все задачи имеют: формулировку, touchpoints, зависимости, acceptance, tests/build block, Docker ban.

---

## Замечания по тест-сценариям

`browserTesting: true` в AGENTS client-web **не задан**, но ТЗ и plan.md **обязуют** browser smoke → `TEMP_TEST_SCENARIOS.md` создан корректно.

**Качество TEMP_TEST_SCENARIOS.md:**

- ✅ B-1…B-18 с URL, viewport, actions, expectations, prerequisites
- ✅ Canon attribution (`entry=website`, `registrationHint`)
- ✅ Wave 1 gate / mock mode skip policy
- ✅ Execution log table для task-10
- ✅ Cross-surface B-17, B-18 с admin/staging prereqs

**Рекомендации (некритично):**

1. Добавить B-8 в acceptance task-07 или явную ссылку «verify in task-10».
2. Добавить в task-06 acceptance: «WebSocket `client.profile.updated` preserved».
3. В task-04 или deploy-runbook явно: «M5 DROP только после deploy gated code + smoke».

---

## Сверка с architecture v1.2

| Требование architecture | План | Статус |
|-------------------------|------|--------|
| Canon §0 entry/registrationHint | task-01, task-05, task-07, TEMP | ✅ |
| Marketing filter 2 tiers | task-02, task-03 | ✅ |
| ensureDailyReset legacy-only | task-02 | ✅ |
| CORS main.ts Wave 1 | task-03 | ✅ |
| Serial Capture (не dead-end) | task-05, task-07 | ✅ |
| No iframe primary | task-07 | ✅ |
| Image manifest §7 | task-08 | ✅ |
| Deploy order telemetry→client→site | task-11 | ✅ |
| Preserve analytics uncommitted | task-04, plan | ✅ |

---

## Итог для orchestrator

- **Продолжать:** Wave 0 task-01 + parent image gen (2D) параллельно.
- **Не блокирует:** 4 minor замечания выше — можно закрыть точечными правками tasks или при первом developer pass.
- **hasCriticalIssues:** `false`
