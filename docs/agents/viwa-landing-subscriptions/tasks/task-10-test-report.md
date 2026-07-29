# task-10-test-report (path alias / cutover fix)

**Task:** task-10 — infra bugfix (Windows junction `viwa-client-web-app` → `wiva-client-web-app`)  
**Repo:** `viwa-client-web-app`  
**Date:** 2026-07-29  
**Scope:** Config-only; no product/UI changes; no commit/push/deploy

## Root cause

On this machine `C:\wiva\viwa-client-web-app` is a **junction** to `C:\wiva\wiva-client-web-app`. Vite/Vitest used `path.dirname(fileURLToPath(import.meta.url))` and `process.cwd()` inconsistently:

- Test discovery and Vitest banner used the **junction** path (`viwa-*`).
- Config aliases, HTML entry, and module resolution used the **target** path (`wiva-*`).
- TSX suites (jsdom + `@vitejs/plugin-react-swc`) failed with mixed IDs (`viwa-*` vs `wiva-*`).
- Production build emitted invalid Rollup chunk name `../wiva-client-web-app/index.html`.

Prior task-05 reports documented the workaround (“run from `wiva-client-web-app`”) but did not canonicalize roots.

## Fix

| File | Change |
|------|--------|
| `scripts/projectRoot.mjs` | **NEW** — `fs.realpathSync.native()` canonical root + `resolveFromRoot()` |
| `scripts/projectRoot.mjs.d.ts` | **NEW** — types for `tsc -b` on config imports |
| `scripts/projectRoot.test.mjs` | **NEW** — Node `node:test` regression (2 cases) |
| `vite.config.ts` | `root: projectRoot`, alias via `resolveFromRoot`, `process.chdir(projectRoot)` |
| `vitest.config.ts` | same + removed duplicate `path` import |
| `package.json` | `test` runs vitest **and** `node --test scripts/projectRoot.test.mjs` |
| `tsconfig.json` | include `scripts` for `.d.ts` |

No hardcoded `viwa-*` or `wiva-*` path strings — resolution is filesystem-driven.

## Verification (2026-07-29)

### Canonical path `C:\wiva\viwa-client-web-app`

| Command | Result |
|---------|--------|
| `npm test` | **PASS** — vitest 17 files / 40 tests; node regression 2/2 |
| `npm run lint` | **PASS** — exit 0 (23 pre-existing warnings) |
| `npm run locale:verify` | **PASS** — 47 keys ru/en parity |
| `npm run build` | **PASS** — exit 0; no invalid `../wiva-client-web-app/index.html` chunk |

### Legacy alias smoke `C:\wiva\wiva-client-web-app`

| Command | Result |
|---------|--------|
| `npm test` | **PASS** — 40/40 + regression 2/2 |
| `npm run build` | **PASS** — exit 0 |

## Regression check

`node --test scripts/projectRoot.test.mjs` asserts:

1. `projectRoot` contains `package.json`, `src/`, `index.html`.
2. `projectRoot === realpath(package.json parent)` (junction-stable).

## Deferred follow-ups (not user decisions; owned elsewhere)

| Item | Owner / when |
|------|----------------|
| Browser smoke B-1…B-18 | task-10 remainder — `/browser-test-orchestrator` or manual per `TEMP_TEST_SCENARIOS.md` |
| `viwa-telemetry` / `viwa-site` lint/build gates | Separate task-10 wave / other repos — not this infra subtask |
| task-11 folder cutover (remove junction, rename on disk) | Future/deferred — `realpath` fix remains valid before and after |
| Commit, push, deploy, CI/CD | `/task-completion` after browser gate + user confirmation |

**openQuestions:** none for this subtask.

## Subtask: `viwa-telemetry` — Vitest jest-dom fix (2026-07-29)

**Repo:** `viwa-telemetry` (`apps/web`)  
**Scope:** Vitest + `@testing-library/jest-dom` setup only; no assertion rewrites; no Docker; no commit/push

### Symptom (before)

| Layer | Result |
|-------|--------|
| `@viwa/api` (`npm test -w @viwa/api`) | **335 passed** (169 skipped without `DATABASE_URL`) |
| `@viwa/web` (`npm test -w @viwa/web`) | **64 files / 78 tests failed** — `Invalid Chai property: toBeInTheDocument` (~155 occurrences); many suites also reported `No test suite found` |

### Root cause

1. **`@testing-library/jest-dom` matchers were not attached to the same `expect` instance used by tests.** `setup.ts` imported `expect` from a separately resolved `vitest` module while tests with `globals: true` used Vitest's global `expect`.
2. **Duplicate repo paths on Windows (`C:\wiva\viwa-telemetry` junction vs `C:\wiva\wiva-telemetry` real path)** each had their own `node_modules`. Running tests from the junction cwd loaded two Vitest instances → suite registration failures (`No test suite found`, `Vitest failed to find the runner`) and missing DOM matchers.

`@testing-library/jest-dom@6.9.1` was already present; no new dependency required.

### Fix

| File | Change |
|------|--------|
| `apps/web/src/test/setup.ts` | `expect.extend(matchers)` on **global** `expect`; explicit `vi` import for `matchMedia` mock |
| `apps/web/vite.config.ts` | `defineConfig` from `vitest/config`; `realpathSync` for `configDir` / `repoRoot`; `dedupe` vitest + jest-dom |
| `apps/web/tsconfig.json` | types: `@testing-library/jest-dom/vitest` |
| `apps/web/scripts/vitest-run.mjs` | run Vitest from canonical realpath cwd (junction-safe) |
| `apps/web/package.json` | `"test": "node ./scripts/vitest-run.mjs"` |

### Verification (after)

| Command | Exit | Result |
|---------|------|--------|
| `npm test -w @viwa/web` (from `C:\wiva\viwa-telemetry`) | 0 | **66 files, 502 tests passed** |
| `npm test` (root, api + web) | 0 | API **335 passed** + web **502 passed** |
| `npm run lint` | 0 | 0 errors (2 pre-existing warnings) |
| `npm run typecheck` | 0 | OK |
| `npm run build` | 0 | OK |

**openQuestions:** none for this subtask.

## Subtask: browser FAIL developer round — B-3 / B-10 / B-14 (2026-07-29)

**Scope:** Diagnose and fix 3 browser gate FAILs; site regression + client verification; update TEMP runner; **no** full browser rerun (browser agent owns B-3/B-10/B-14 retest); no commit/push/deploy.

### Diagnosis

| ID | Classification | Root cause | Fix |
|----|----------------|------------|-----|
| **B-3** | **real bug** (+ runner order) | JS `setTiersState` targeted `#viwa-tiers` but HTML `id="tiers"` → `data-state` stuck at `loading`; retry rendered in list but gate waited on wrong selector. Stale tier prices when 503 intercepted after cached 200 from earlier B-3 success runs. | `viwa-site`: `id="viwa-tiers"`, nav anchors, `fetch` `cache: 'no-store'`, clear list on tier reload. Runner: error subtest before success; leak check scoped to `#viwa-tiers-list`. |
| **B-10** | **test bug** | OTP runner filled one input with `1234`; `CodeInputGroup` requires 4 single-digit fields → `check-code` never fired. Mock contract (`check-code` 200 + tokens) and product navigation (`navigate('/home')` + `replaceBrowserUrl`) OK. | `TEMP_browser_gate.mjs`: fill 4 OTP digits; `waitForURL(/\/home/)`. |
| **B-14** | **test bug** | Active 12 L mock profile → `shouldShowRenewalPlans` false → plan grid hidden (by design). B-13 matched `/12/` in status/progress, not purchase cards. | Runner: `MOCK_PROFILE_TRIAL` for B-13/B-14; assert price/volume inside plan section. **Product semantics documented** — no misleading upgrade UI for active subs; mid-cycle upgrade deferred. |

### Product semantics (B-14)

- **Trial / no subscription / expired:** home shows plan section with **both** 12 L and 18 L cards (UC-6, B-13/B-14).
- **Active monthly subscription:** home shows progress, tier name, QR — **no** plan purchase grid (`subscriptionStatus.shouldShowRenewalPlans`). Renewal at expiry; mid-cycle upgrade out of scope (architecture/tz_review).

### Files changed

| Repo | File |
|------|------|
| `viwa-site` | `index.html`, `js/landing-api.js`, `scripts/static-regression-check.ps1` |
| `viwa-client-web-app` | `docs/agents/viwa-landing-subscriptions/TEMP_browser_gate.mjs` |

### Verification (2026-07-29)

| Check | Result |
|-------|--------|
| `viwa-site/scripts/static-regression-check.ps1` | **PASS** |
| `npm run lint` (client) | **PASS** — 0 errors |
| `npm run locale:verify` | **PASS** — 47 keys |
| `npm test` (client) | **PASS** — 40 + 2 regression |
| `npm run build` (client) | **PASS** |
| Browser B-3/B-10/B-14 rerun | **Pending** — browser agent |

**openQuestions:** none (mid-cycle upgrade intentionally deferred; not a gate blocker).

## Git

- Branch: `dev` (assumed)
- **No commit** per task instructions
