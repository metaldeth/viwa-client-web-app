# task-10-review: Path alias / junction-safe project root (infra subtask)

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-client-web-app` (branch `dev`, uncommitted)  
**Task (parent):** [task-10.md](./task-10.md) — formal browser gate B-1…B-18 (all repos)  
**Infra subtask:** junction `C:\wiva\viwa-client-web-app` → `C:\wiva\wiva-client-web-app` — Vite/Vitest cwd vs realpath mismatch  
**Test report:** [task-10-test-report.md](./task-10-test-report.md)  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (infra subtask scope)

| Файл | Кратко |
|------|--------|
| `scripts/projectRoot.mjs` | **NEW** — `fs.realpathSync.native()` canonical root + `resolveFromRoot()` |
| `scripts/projectRoot.mjs.d.ts` | **NEW** — types for `tsc -b` on config imports |
| `scripts/projectRoot.test.mjs` | **NEW** — Node `node:test` regression (2 cases) |
| `vite.config.ts` | `root: projectRoot`, alias via `resolveFromRoot`, `process.chdir(projectRoot)` |
| `vitest.config.ts` | same + removed duplicate `path` import |
| `package.json` | `test` chains vitest + `node --test scripts/projectRoot.test.mjs` |
| `tsconfig.json` | `include` adds `scripts` for `.d.ts` |

**Не тронуто (OK):** product/UI code, locale strings, Docker, commit/push/deploy.

---

## Root cause vs fix (review consensus)

| До | После |
|----|-------|
| Test discovery / Vitest banner used **junction** path (`viwa-*`) | Единый canonical root через `realpathSync.native` от `scripts/` |
| Config aliases / HTML entry used **target** path (`wiva-*`) | `root` + aliases абсолютные от `projectRoot` |
| TSX suites failed (mixed module IDs) | 17 files / 40 Vitest tests PASS с обоих cwd |
| Build emitted invalid chunk `../wiva-client-web-app/index.html` | `dist/index.html` at repo root — PASS |

Hardcoded `viwa-*` / `wiva-*` path strings в scope-файлах: **нет** (filesystem-driven).

---

## Acceptance (infra subtask)

| Критерий | Статус |
|----------|--------|
| Junction/symlink-safe canonical `projectRoot` | ✅ `realpathSync.native(path.join(scriptDir, '..'))` |
| Vite/Vitest consistent `root` + aliases | ✅ shared `projectRoot.mjs` |
| `npm test` from `viwa-*` and `wiva-*` cwd | ✅ 17 files / 40 + node 2/2 (re-checked) |
| `npm run build` from both paths | ✅ exit 0; `dist/index.html` (no invalid parent chunk) |
| `npm run lint` | ✅ exit 0 (0 errors, 23 pre-existing warnings) |
| Tests not accidentally excluded | ✅ `tsconfig exclude` test files for `tsc -b`; Vitest `include: src/**/*.{test,spec}.{ts,tsx}` → 17 files on disk |
| Windows/Linux portability | ✅ `realpathSync.native`; anchor from script dir, not cwd |
| Regression test for `projectRoot` | ✅ `node --test scripts/projectRoot.test.mjs` |
| `tsconfig.eslint.json` still valid | ✅ includes vite/vitest configs; excludes `scripts/*.test.mjs` (correct for .mjs) |
| Parent task-10 browser B-1…B-18 | ⚠️ **Deferred** — not this subtask |
| `viwa-telemetry` / `viwa-site` gates | ⚠️ **Elsewhere** in task-10 wave |

---

## Verification (re-checked in review)

| Check | Path | Result |
|-------|------|--------|
| `npm test` | `C:\wiva\viwa-client-web-app` | ✅ Vitest 17/17 files, 40/40; node regression 2/2 |
| `npm test` | `C:\wiva\wiva-client-web-app` | ✅ Vitest 17/17 files, 40/40; node regression 2/2 |
| `npm run build` | `viwa-*` | ✅ exit 0; `dist/index.html` |
| `npm run build` | `wiva-*` | ✅ exit 0; `dist/index.html` |
| `npm run lint` | `viwa-*` | ✅ exit 0 |
| Test file count on disk | `src/**/*.{test,spec}.{ts,tsx}` | ✅ 17 files (matches Vitest banner) |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ✅ 0 критичных, 5 предложений | — |
| review-performance | ✅ 0 критичных, 3 предложения (bootstrap-only) | — |
| review-docs | ⚠️ 2 docs 🔴 (JSDoc on `.d.ts` exports), 7 предложений | — |
| review-final | ✅ готов к коммиту (infra subtask) | — |

**hasCriticalIssues (functional):** `false`  
**Docs-only 🔴:** missing JSDoc on `projectRoot.mjs.d.ts` exports — не блокирует infra fix; optional follow-up.

---

## review-general

### Суммаризация

Fix адресует root cause: единый canonical root от расположения `scripts/projectRoot.mjs` + `realpath`, явный `root` и `chdir` в Vite/Vitest. Регрессия junction покрыта отдельным `node:test`.

### Проблемы

🔴 **Критично:** не выявлено.

🟡 **Предложение:**
- [`vite.config.ts:6`, `vitest.config.ts:5`] `process.chdir(projectRoot)` — глобальный side effect при import конфига; осознанный trade-off, хрупко при in-process композиции конфигов.
- [`vite.config.ts:20-25`, `vitest.config.ts:10-15`] Дублированный `resolve.alias` — риск drift.
- [`package.json:11`] `test:watch` без `node --test scripts/projectRoot.test.mjs` — junction-регрессия только в полном `npm test`.
- `tsc -b` / ESLint не используют `projectRoot`; build/lint из legacy cwd подтверждены re-check, но asymmetry `@` alias (Vite only, не tsconfig paths) — pre-existing.

### Вывод

✅ К merge готов для infra subtask.

---

## review-performance

### Проблемы

🔴 **Критично:** нет.

🟡 **Предложение:**
- [`projectRoot.mjs:8`] sync `realpathSync.native` на cold-start каждого Node CLI — пренебрежимо vs Vite/Vitest bootstrap.
- [`vite.config.ts:6`, `vitest.config.ts:5`] `chdir` — дешёвый syscall, глобальный side effect.
- [`package.json:10`] два Node entrypoints в `npm test` → 2× bootstrap import `projectRoot.mjs`.

**Без замечаний:** `pool: 'forks'` не умножает `realpath`; vite и vitest — разные процессы, нет double-chdir race.

### Вывод

✅ Минимальный perf-риск (config-only).

---

## review-docs

### Проблемы

🔴 **Критично (JSDoc standards, не functional):**
- [`projectRoot.mjs.d.ts:1-3`] нет JSDoc на `projectRoot` / `resolveFromRoot` — IDE берёт типы из `.d.ts`.
- [`projectRoot.mjs:10-11`] `resolveFromRoot` — `@param` без описания назначения.

🟡 **Предложение:**
- [`vite.config.ts`, `vitest.config.ts`] нет комментария зачем `chdir` + `root` (junction fix).
- [`tsconfig.json:27`] `"scripts"` в include без inline rationale.
- [`task-10-test-report.md`] заголовок «infra bugfix» vs parent browser gate — уточнить subtask scope.
- [`AGENTS.md:15`] transitional note не упоминает, что workaround «run from wiva-* only» снят task-10 fix.

### Вывод

⚠️ Docs gaps — optional polish, не блокер infra.

---

## review-final

### Статус предыдущих ревью

- Все acceptance-критерии infra subtask выполнены.
- `cwd` на junction (`viwa-*`) может отличаться от `projectRoot` (`wiva-*`) — ожидаемо; tooling использует canonical root.

### Новые замечания

🟡 [`projectRoot.test.mjs:14-17`] не assert'ит явно «cwd junction ≠ projectRoot» — поведение подтверждено manual/re-check.
🟡 Duplicate alias blocks; `test:watch` без node regression; `vite-tsconfig-paths` unused (pre-existing).

### Итог

✅ **Infra subtask готов к коммиту.** Browser B-1…B-18 и cross-repo gates — remainder task-10.

---

## Рекомендации (не блокеры; developer optional)

1. Документировать `chdir`/`root` one-liner в vite/vitest configs или AGENTS.md Notes.
2. JSDoc на `projectRoot.mjs.d.ts` exports.
3. При следующем alias change — вынести shared `resolve.alias` (DRY).
4. Optional: `test:watch` doc note что junction regression только в `npm test`.

---

## Следующий шаг

- **Remainder task-10:** browser smoke B-1…B-18 per `TEMP_TEST_SCENARIOS.md`; `viwa-telemetry` / `viwa-site` lint/build gates.
- **Commit/push/deploy:** `/task-completion` after full task-10 gate + user confirmation.

---

# task-10-review: Browser FAIL fix round — B-3 / B-10 / B-14

**Session:** `viwa-landing-subscriptions`  
**Repos:** `viwa-site` (product fix B-3); `viwa-client-web-app` docs (`TEMP_browser_gate.mjs` only)  
**Parent:** [task-10.md](./task-10.md) — formal browser gate B-1…B-18  
**Test report:** [task-10-test-report.md](./task-10-test-report.md) § Subtask: browser FAIL developer round  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые файлы (fix round scope)

| Repo | Файл | Кратко |
|------|------|--------|
| `viwa-site` | `index.html` | `id="viwa-tiers"`; nav `#viwa-tiers`; `data-state="loading"` on section |
| `viwa-site` | `js/landing-api.js` | `fetchJson` `cache: 'no-store'`; `loadAndRenderTiers` clears `#viwa-tiers-list` before skeleton |
| `viwa-site` | `scripts/static-regression-check.ps1` | Assert `id="viwa-tiers"` (regression guard for B-3 root cause) |
| `viwa-client-web-app` | `docs/.../TEMP_browser_gate.mjs` | B-3 error-before-success + scoped leak; B-10 four OTP fills; B-13/B-14 `MOCK_PROFILE_TRIAL` + plan-section assertions |

**Не тронуто (OK):** client product/UI, locale strings, Docker, commit/push/deploy.

---

## Scenario verdicts (review focus)

| ID | Classification | Fix correct? | Review |
|----|----------------|--------------|--------|
| **B-3** | Real product bug + runner hygiene | ✅ | `viwa-tiers` id/HTML/JS aligned; nav anchors consistent; `no-store` + list clear address stale prices; runner order + `#viwa-tiers-list` leak scope |
| **B-10** | Test bug | ✅ | Four `maxLength=1` fields match `CodeInputGroup.onComplete`; mock check-code + `navigate('/home')` path exercised |
| **B-14** | Test bug / product semantics | ✅ | Trial profile matches `shouldShowRenewalPlans`; assertions inside `planSection` avoid progress/status false positives |

---

## Acceptance (fix round)

| Критерий | Статус |
|----------|--------|
| B-3 real fix: id/HTML/JS/`data-state`/`#viwa-tiers-retry` | ✅ |
| B-3 `cache: 'no-store'` reasonable for live tier prices | ✅ |
| B-3 nav `#viwa-tiers` desktop + mobile | ✅ |
| B-3 static regression guard | ✅ `static-regression-check.ps1` |
| B-10 OTP test matches product (`CodeInput` × 4) | ✅ |
| B-14 trial profile + plan-section scoped asserts | ✅ |
| B-14 aligns architecture v1.2 / `subscriptionStatus.ts` | ✅ |
| Product code unchanged for B-10/B-14 | ✅ runner-only |
| Browser rerun B-3/B-10/B-14 | ⚠️ **Pending** — browser agent |
| Full task-10 gate + `/task-completion` | ⚠️ **Blocked** until rerun pass |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ✅ 0 критичных, 4 предложения | — |
| review-performance | ✅ минимальный риск (2 API fetches) | — |
| review-docs | ✅ 0 🔴, 3 предложения | — |
| review-final | ✅ fixes согласованы; rerun pending | — |

**hasCriticalIssues (functional):** `false`

---

## review-general

### Суммаризация

**Что решали:** три FAIL browser gate — реальный mismatch id тарифов на лендинге (B-3), неверный ввод OTP в runner (B-10), неверный mock-профиль для сценария покупки тарифа (B-14).

**Как работает (B-3):** `setTiersState` / `renderTiersError` пишут `data-state` на `#viwa-tiers`; список — `#viwa-tiers-list`. `fetchJson` с `cache: 'no-store'` + очистка list при reload исключают stale tier cards при 503 после успешных subtests. Runner: error subtest до success; leak check только в `#viwa-tiers-list`.

**Как работает (B-10):** runner заполняет 4 OTP-поля по одной цифре → `CodeInputGroup` вызывает `onComplete` → mock `check-code` → `SmsPage` `navigate(POST_AUTH_HOME_PATH)` → assert `/home` без serial в path.

**Как работает (B-14):** `MOCK_PROFILE_TRIAL` (`tierName: null`, `subscriptionEndsAt: null`, limits 0) → `shouldShowRenewalPlans` true → plan grid visible; price/volume ищутся внутри `planSection`, не по всей странице.

**Валидация логики:** ✅ root causes подтверждены кодом продукта (`CodeInput.maxLength=1`, `shouldShowRenewalPlans`, `getElementById('viwa-tiers')`).

### Проблемы

🔴 **Критично:** не выявлено.

🟡 **Предложение:**
- [`TEMP_browser_gate.mjs:524`] OTP selector `.CodeInput input` зависит от CSS-modules имени класса; при rename — fallback `input[inputmode="numeric"]` уже есть, но count-check стоит оставить.
- [`TEMP_browser_gate.mjs:610-614`] `[class*="planSection"]` / `[class*="planGrid"]` — хрупко при смене CSS-module hash; для gate OK, для долгоживущего runner — data-testid на plan section (future).
- [`landing-api.js:98`] `loadManifest` без `cache: 'no-store'` — pre-existing; не блокирует B-3 (manifest не участвует в error path tiers).
- [`runLandingB3Success:270-271`] success subtest ищет `/499/`/`/699/` page-wide — на текущем лендинге безопасно; при добавлении других секций с ценами — scope как в error path.

### Вывод

✅ Fix round корректен; готов к browser-agent rerun B-3/B-10/B-14.

---

## review-performance

### Проблемы

🔴 **Критично:** нет.

🟡 **Предложение:**
- [`landing-api.js:70`] `cache: 'no-store'` на двух public GET — пренебрежимо vs freshness tier prices; acceptable trade-off for marketing landing.
- [`landing-api.js:304-306`] `list.innerHTML = ''` на каждый retry — O(1) DOM; no leak.

### Вывод

✅ Минимальный perf-риск (vanilla JS landing + TEMP runner).

---

## review-docs

### Проблемы

🔴 **Критично:** нет.

🟡 **Предложение:**
- [`TEMP_browser_gate.mjs:68-80`] JSDoc на `MOCK_PROFILE_TRIAL` — ✅ уже есть; хороший образец для TEMP runner.
- [`static-regression-check.ps1:55-57`] inline rationale для `viwa-tiers` id — ✅ достаточно для regression script.
- [`landing-api.js:65-71`] `cache: 'no-store'` без комментария «why» — optional one-liner (B-3 stale cache).

### Вывод

✅ Docs gaps не блокируют fix round.

---

## review-final

### Статус предыдущих ревью

- Developer diagnosis (task-10-test-report, orchestrator-log) **подтверждён** кодом и product semantics.
- Infra subtask (projectRoot junction) — отдельный scope; не затронут.

### Новые замечания

🟡 Browser rerun **не выполнен** в этом review — acceptance fix round = code review pass, не gate pass.  
🟡 `TEMP_*` runner/report остаются до закрытия task-10 (expected).

### Итог

✅ **Fix round approved for browser rerun.** ⚠️ Task-10 gate остаётся blocked до PASS B-3/B-10/B-14 retest.

---

## Strict JSON

```json
{
  "sessionId": "viwa-landing-subscriptions",
  "subtask": "task-10-browser-fail-fix-review",
  "date": "2026-07-29",
  "reviewAgents": ["review-general", "review-performance", "review-docs", "review-final"],
  "model": "composer-2.5-fast",
  "hasCriticalIssues": false,
  "filesReviewed": [
    "viwa-site/index.html",
    "viwa-site/js/landing-api.js",
    "viwa-site/scripts/static-regression-check.ps1",
    "viwa-client-web-app/docs/agents/viwa-landing-subscriptions/TEMP_browser_gate.mjs"
  ],
  "scenarios": {
    "B-3": {
      "classification": "real_bug_plus_runner_hygiene",
      "fixCorrect": true,
      "cacheNoStoreReasonable": true,
      "idsNavConsistent": true,
      "staticRegressionGuard": true,
      "verdict": "pass_review"
    },
    "B-10": {
      "classification": "test_bug",
      "exercisesOtpAccurately": true,
      "productCodeChanged": false,
      "verdict": "pass_review"
    },
    "B-14": {
      "classification": "test_bug_product_semantics",
      "alignsArchitecture": true,
      "avoidsFalseRegexMatches": true,
      "productCodeChanged": false,
      "verdict": "pass_review"
    }
  },
  "agentSummaries": {
    "review-general": { "critical": 0, "suggestions": 4, "status": "pass" },
    "review-performance": { "critical": 0, "suggestions": 2, "status": "pass" },
    "review-docs": { "critical": 0, "suggestions": 3, "status": "pass" },
    "review-final": { "critical": 0, "status": "pass_pending_browser_rerun" }
  },
  "blockers": [],
  "pending": ["browser_agent_rerun_B-3_B-10_B-14", "full_task_10_gate", "task_completion"],
  "recommendations": [
    "Rerun TEMP_browser_gate.mjs for B-3/B-10/B-14 only before marking gate pass",
    "Optional: data-testid on SubscriptionPage planSection for durable B-13/B-14 selectors",
    "Optional: one-line comment on fetchJson cache no-store in landing-api.js"
  ]
}
```
