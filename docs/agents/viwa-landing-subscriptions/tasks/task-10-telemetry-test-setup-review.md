# task-10-telemetry-test-setup-review: Vitest jest-dom + junction-safe runner

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-telemetry` (`apps/web`, branch `main`, uncommitted)  
**Task (parent):** [task-10.md](./task-10.md) — formal browser gate B-1…B-18 + all-repo build gates  
**Infra subtask:** `@viwa/web` Vitest + `@testing-library/jest-dom` setup; junction `C:\wiva\viwa-telemetry` ↔ `C:\wiva\wiva-telemetry`  
**Test report:** [task-10-test-report.md](./task-10-test-report.md) § Subtask: `viwa-telemetry`  
**Review agents (parallel):** `review-general`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`)

## Изменённые / новые файлы (infra subtask scope)

| Файл | Кратко |
|------|--------|
| `apps/web/src/test/setup.ts` | `expect.extend(matchers)` на **global** `expect`; explicit `vi` для `matchMedia` mock |
| `apps/web/vite.config.ts` | `defineConfig` из `vitest/config`; `realpathSync` для `configDir`/`repoRoot`; `dedupe` vitest + jest-dom; react alias на root `node_modules` |
| `apps/web/tsconfig.json` | types: `@testing-library/jest-dom/vitest` (was `@testing-library/jest-dom`) |
| `apps/web/scripts/vitest-run.mjs` | **NEW** — `spawnSync(npx vitest run)` с `cwd: realpath(webRoot)` |
| `apps/web/package.json` | `"test": "node ./scripts/vitest-run.mjs"` |

**Не тронуто (OK):** product/UI code, API handlers, Prisma, Docker, commit/push/deploy.

---

## Root cause vs fix (review consensus)

| До | После |
|----|-------|
| `setup.ts` side-effect import `@testing-library/jest-dom/vitest` → matchers на **другом** `expect`, чем global при `globals: true` | `expect.extend(matchers)` на том же global `expect`, что используют тесты |
| Junction cwd (`viwa-*`) vs realpath (`wiva-*`) → **два** `node_modules` / два Vitest → `No test suite found`, `Invalid Chai property: toBeInTheDocument` | `realpathSync` в config + `vitest-run.mjs` canonical cwd; `dedupe` vitest/jest-dom |
| **64 files / 78 tests failed** (~155 matcher errors) | **66 files / 502 tests passed** |

Hardcoded `viwa-*` / `wiva-*` path strings в scope-файлах: **нет** (filesystem-driven `realpathSync`).

---

## Acceptance (infra subtask)

| Критерий | Статус |
|----------|--------|
| Global `expect` matcher registration | ✅ `setup.ts` L4–5 + `globals: true` + `setupFiles` в vite |
| Single Vitest instance / junction Win+Linux | ✅ `realpathSync` + `dedupe` + react alias; Win `npx.cmd` + `shell: true` |
| `spawnSync` error/signal handling | ⚠️ partial — exit 1 при null status; spawn error/signal не логируются (🟡) |
| No accidental test omission | ✅ 66 `*.{test,spec}.{ts,tsx}` on disk = 66 files in Vitest banner |
| Type config | ✅ `vitest/globals` + `@testing-library/jest-dom/vitest` |
| Scripts | ✅ root `npm test` → `@viwa/api` + `@viwa/web` via wrapper |
| No product behavior change | ✅ test infra + resolve only; dev proxy/port/build semantics unchanged |
| Parent task-10 browser B-1…B-18 | ⚠️ **Deferred** — separate gate (31 PASS / 3 FAIL at last run) |
| `viwa-client-web-app` / `viwa-site` gates | ⚠️ **Elsewhere** in task-10 wave |

---

## Verification (evidence from test report + review re-check)

| Check | Result |
|-------|--------|
| `npm test -w @viwa/web` | ✅ **66 files, 502 tests passed** |
| `npm test` (root) | ✅ API **335 passed**, **169 skipped** + web **502 passed** |
| `npm run lint` | ✅ exit 0 (2 pre-existing warnings) |
| `npm run typecheck` | ✅ exit 0 |
| `npm run build` | ✅ exit 0 |
| Test files on disk (`apps/web/src/**/*.{test,spec}.{ts,tsx}`) | ✅ **66** (matches Vitest banner) |

**Not re-run in this review:** junction-path smoke from `C:\wiva\wiva-telemetry` cwd (🟡 gap in test report; fix design supports both via `realpathSync`).

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ✅ 0 критичных, 6 предложений | — |
| review-performance | ✅ 0 критичных, 1 предложение (npx bootstrap) | — |
| review-docs | ⚠️ 0 🔴 functional, 5 🟡 docs gaps | — |
| review-final | ✅ готов к merge (infra subtask) | — |

**hasCriticalIssues (functional):** `false`  
**Docs-only 🟡:** `vitest-run.mjs` file header, AGENTS.md junction note — не блокируют infra fix.

---

## review-general

### Суммаризация

Fix закрывает двойную root cause: (1) matchers на чужом `expect`; (2) duplicate Vitest из junction paths. Трёхуровневая нормализация: wrapper cwd → config realpath/dedupe → setup `expect.extend`.

### Проблемы

🔴 **Критично:** не выявлено.

🟡 **Предложение:**
- [`vitest-run.mjs:16`] тихий fail при spawn error — `result.error` не пишется в stderr.
- [`package.json`] нет `test:watch` через wrapper — прямой `npx vitest watch` уязвим к junction.
- [`vite.config.ts` + `vitest-run.mjs`] дублирование `realpathSync` — допустимо (KISS), при расширении можно DRY.
- [`AGENTS.md`] не документирован junction-safe test entry point.
- [`setup.ts`] runtime `@testing-library/jest-dom/matchers` vs types `/vitest` — работает; коммент «почему не side-effect import» уже есть.

### Вывод

✅ К merge готов для infra subtask.

---

## review-performance

### Проблемы

🔴 **Критично:** нет.

🟡 **Предложение:**
- [`vitest-run.mjs`] `spawnSync` + `npx` добавляет ~100 ms–1.2 s cold bootstrap vs direct `vitest.mjs`; на full suite 502 tests (~118 s) **<1%** — не блокер.
- [`vite.config.ts:7-9`] три `realpathSync` за запуск — ~1 ms суммарно, пренебрежимо.
- `dedupe` + react alias — **net-positive** (единый module graph, потенциально быстрее workers).

### Вывод

✅ Минимальный perf-риск (config-only).

---

## review-docs

### Проблемы

🔴 **Критично (JSDoc/functional):** нет экспортируемых API в scope; JSDoc gaps не functional.

🟡 **Предложение:**
- [`vitest-run.mjs`] нет file-level комментария — главный entry point fix.
- [`vite.config.ts:16-20`] коммент junction не покрывает `dedupe`/react alias.
- [`AGENTS.md:16`] transitional note не упоминает web test fix / `vitest-run.mjs`.
- [`task-10-test-report.md`] нет junction-path smoke; fix table не перечисляет dedupe/alias; jest-dom version drift в тексте vs `^6.6.3` в package.json.

### Вывод

⚠️ Docs gaps — optional polish, не блокер infra.

---

## review-final

### Acceptance checklist (synthesized)

| Критерий | Вердикт |
|----------|---------|
| Global expect matchers | ✅ |
| Single Vitest / junction | ✅ |
| spawn/error/signal | ⚠️ partial (🟡) |
| 66 files = 66 on disk | ✅ |
| Type config | ✅ |
| Scripts | ✅ |
| No product change | ✅ |

### Оставшиеся 🟡 (non-blocking)

1. `result.error` / `result.signal` handling + stderr log in `vitest-run.mjs`
2. Unused import `join` in `vitest-run.mjs:3`
3. Trailing newline missing in `vite.config.ts`
4. `test:watch` wrapper + AGENTS.md one-liner
5. Junction-path verification in test report

### Итог

✅ **Infra subtask готов к merge.** Browser B-1…B-18 и cross-repo gates — remainder task-10.

---

## Рекомендации (не блокеры; developer optional)

1. File header comment in `vitest-run.mjs` + AGENTS.md note under Web/Notes.
2. `test:watch` script using same wrapper pattern.
3. Spawn error logging: `if (result.error) console.error(result.error.message)`.
4. Remove unused `join` import; add trailing newline to `vite.config.ts`.
5. Add junction-path smoke row to `task-10-test-report.md` (symmetry with client-web-app subtask).

---

## Следующий шаг

- **Remainder task-10:** browser smoke B-1…B-18 (3 FAIL at last gate); fix product issues from browser gate; staging B-17/B-18.
- **Telemetry gate:** lint/typecheck/test/build — **PASS** for this subtask.
- **Commit/push/deploy:** `/task-completion` after full task-10 gate + user confirmation.
