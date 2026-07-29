# task-09-review: Cross-repo integration + mobile landing polish

**Session:** `viwa-landing-subscriptions`  
**Repos:** `viwa-telemetry` + `viwa-client-web-app` + `viwa-site` (uncommitted)  
**Task:** [task-09.md](./task-09.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 §0, §1, §viwa-site, mobile parity gate  
**Test report:** [task-09-test-report.md](./task-09-test-report.md)  
**Review agents (parallel):** `review-general`, `review-renderer-structure`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`; plan override — cross-repo task)

## Изменённые / новые файлы (task-09 scope)

| Repo | Файл | Кратко |
|------|------|--------|
| site | `js/config.js` | `useMockApi: false`, live `apiBaseUrl` |
| site | `js/landing-api.js` | Live tiers/tastes; error/retry; tier count guard; `sizes` on taste images |
| site | `css/viwa-landing.css` | Mobile stack reorder, safe-area, hero-station mobile, touch ≥44px |
| site | `index.html` | hero-station mobile, SVG logo `<picture>` + text fallback, section order classes |
| site | `assets/manifest.json` | Logo SVG 277×243 + hero-station; triple-sync |
| site | `assets/generated/logo/*` | Corrected canonical SVG + re-rasterized PNG/WebP |
| site | `scripts/static-regression-check.ps1` | task-09 guards: logo SVG, hero-station, safe-area |
| site | `scripts/process-viwa-assets.py` | Client root auto-detect `viwa-*` / `wiva-*` |
| site | `README.md` | task-09 mobile parity + logo docs |
| client | `.env.staging.example` | `VITE_VIWA_TELEMETRY_API_URL=https://tl.vitamin-water.ru/api/v1` |
| client | `.env.example` | Cross-ref staging direct API |
| client | `src/utils/viwaAssets.ts` | `getLogoImagePaths()` SVG+PNG from manifest |
| client | `src/components/ViwaBrandLogo/*` | SVG primary, PNG fallback, text «VIWA» on error |
| client | `src/pages/SubscriptionPage/*` | `ViwaBrandLogo` in brand header |
| client | `public/assets/viwa/logo/*`, manifests | Mirror corrected logo assets |
| telemetry | — | **No changes** (no integration blockers found) |

**Не тронуто (OK):** Docker/compose; telemetry API handlers; uncommitted analytics UI slice.

---

## Acceptance task-09 (code/static review)

| Критерий | Статус |
|----------|--------|
| Live API default site (`useMockApi: false`) | ✅ [`config.js:11`] |
| No mock leak on production hosts / live failure | ✅ `resolveUseMock()` + `isProductionHost()` fail-closed; tastes/tiers error+retry |
| No hardcoded tier prices in HTML | ✅ static-regression + manual inspect |
| 14 tastes from public API + manifest imagery | ✅ `loadTastes` + `createTastePicture` lazy `<picture>` |
| 2 marketing tiers guard (`items.length === 2`) | ✅ [`landing-api.js:263-267`] |
| Serial attribution `entry=website` in CTAs | ✅ [`landing-cta.js:22-28`] |
| Client `registrationHint` from `viwa_entry` | ✅ task-05/06 `landingEntry.ts` + `thunk.ts` |
| Mobile stack order hero→flavors→tiers→serial→cabinet | ✅ [`viwa-landing.css:319-343`] `display:contents` + `order` |
| Not scaled-down desktop split on mobile | ✅ column stack + dedicated hero-station block |
| Safe-area insets | ✅ header/menu/footer/body |
| Touch ≥44px, `prefers-reduced-motion`, `overflow-x: hidden` | ✅ tokens + CSS |
| hero-station wired mobile (<1024px) | ✅ [`index.html:93-108`] + CSS hide desktop |
| Corrected logo SVG (single path, no droplet) | ✅ viewBox 277×243, `currentColor`, no `#7F5AF0` |
| Logo used site header/menu/hero/footer + client brand | ✅ `logoIntegrationDeferred: false` |
| Manifest triple-sync | ✅ SHA256 identical site / public / `viwaAssetManifest.json` |
| Desktop 1440 split retained (≥1024px) | ✅ sticky cabinet aside |
| Flows A–F browser E2E | ⚠️ **Deferred task-10** (static/code only) |
| Mobile 360/390/430 browser parity | ⚠️ **Deferred task-10** formal gate |
| Staging CORS + DB integration (`DATABASE_URL`) | ⚠️ **Staging gate** — not run locally |
| Telemetry lint/typecheck/API test/build | ✅ per test report (335 pass, 169 skip) |
| Client lint/locale/test/build | ✅ 40/40 |

---

## Verification (re-checked in review)

| Check | Result |
|-------|--------|
| `powershell -File viwa-site/scripts/static-regression-check.ps1` | ✅ PASS (exit 0) |
| Manifest triple-sync (SHA256) | ✅ identical |
| Logo SVG: 1 `<path>`, no `#7F5AF0` | ✅ |
| Logo manifest dimensions 277×243 | ✅ |
| Site `index.html` references `hero-station`, `logo-viwa-mark.svg` | ✅ |
| Telemetry repo diff in task-09 | ✅ none |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | ⚠️ 0 критичных, 8 предложений | — |
| review-renderer-structure | ⚠️ 0 блокеров, 5 предложений | — |
| review-styles | ⚠️ 6 предложений, 0 блокеров | — |
| review-performance | ⚠️ 5 предложений, 0 критичных | — |
| review-docs | ⚠️ 3 предложения | — |
| review-final | ✅ 0 blockers | — |

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Cross-repo live API wire-up after Wave 1; mobile landing parity (dedicated stack, safe-area, hero-station); corrected canonical VIWA wordmark SVG integration; staging env docs for client.

**Как работает:** Site `config.js` → `landing-api.js` parallel manifest+tier+taste fetch from `tl.vitamin-water.ru/api/v1/public/*`; mock only on explicit localhost opt-in. `landing-cta.js` builds cabinet URLs with `entry=website` + optional serial. Mobile CSS reorders sections via flex `order` on `<1024px`. Client uses real `PublicModule` fetch; staging example points at direct telemetry URL; production `.env.example` keeps same-origin cabinet proxy per nginx deploy model.

**Валидация логики:** ✅ Architecture v1.2 §0 attribution via query `entry` + client `registrationHint` (not client `registrationSource`). ✅ §1 two-tier invariant enforced client-side on landing. ✅ task-07 mock blockers remain closed. ⚠️ Site still does not write `sessionStorage` `viwa_entry`/`viwa_serial` (Flow A canon partial — CTA href carries params directly). ⚠️ Live CORS/browser flows unverified until staging + task-10.

### Проблемы

🟡 **`sessionStorage` handoff missing on site** — architecture §0 Flow A lists site→client `viwa_entry`/`viwa_serial`. Site prefills serial input and embeds serial in CTA URL only; client `persistLandingContext` runs on cabinet mount from query. Direct same-tab CTA works; cross-tab / query-loss fallback weaker than canon.

🟡 **CTA `href="#"` before JS** — [`index.html:59`, `:129`, `:186`] pre-`landing-cta.js` navigation is dead-end; progressive enhancement risk on slow JS.

🟡 **Inline `onerror` handlers** — logo/hero/cabinet use inline handlers; future strict CSP may require refactor (carried from task-07).

🟡 **MOCK_TIERS prices in JS** — [`landing-api.js:47-53`] dev-only when `useMockApi === true`; acceptable with fail-closed production guard but document clearly for local preview.

🟡 **Client production API URL model** — `.env.example` / `.env.production` use `cabinet.vitamin-water.ru/api/v1` (nginx proxy); `.env.staging.example` uses direct `tl.vitamin-water.ru`. Intentional per deploy docs — ensure staging smoke uses staging example, not production env conflation.

🟡 **Browser flows A–F + mobile viewports** — code paths align with task-05/06/07; no browser evidence in task-09 scope → task-10 gate.

🟡 **Staging gates open** — `DATABASE_URL` unset → integration tests skip; CORS OPTIONS from `vitamin-water.ru` origin not exercised locally.

🟡 **Telemetry `@viwa/web` full test suite** — excluded from task-09 gate (pre-existing vitest matcher failures); acceptable per scope but note for pre-push.

### Новые паттерны

- **`ViwaBrandLogo` + `getLogoImagePaths()`** — mirrors site `<picture>` SVG→PNG→text fallback; good cross-repo consistency.
- **Mobile section reorder via `display: contents` + `order`** — avoids DOM duplication; verify task-10 no a11y focus-order surprises.

### Вывод

⚠️ **0 критичных** для task-09 code scope; staging + browser gates remain downstream.

---

## Ревью: Структура компонентов / markup

### Проблемы

🟡 **DOM source order vs visual order on mobile** — serial block remains before flavors in HTML [`index.html:133-157` before `:153-157`]; CSS `order` fixes visual stack but keyboard/anchor `#serial` scroll order differs from visual (serial appears after tiers). Acceptable if intentional; task-10 should confirm focus/scroll UX.

🟡 **Hero brand duplicate logo instances** — header + hero wordmark + footer + menu (4× SVG fetch); cache mitigates but redundant network on first paint.

🟡 **Cabinet aside on mobile** — moves to bottom (order 5) with full mock image; good parity but large block after tiers — task-10 overflow check on 360px width.

🟡 **Client `ViwaBrandLogo` stateful fallback** — `useState` per instance; fine for single header use on SubscriptionPage.

🟡 **Static HTML hero/cabinet paths** — hero-bottle/cabinet-mock still hardcoded in HTML (not manifest-driven render); drift risk if manifest paths change without HTML edit (task-08 carryover).

### Вывод

✅ Structure supports mobile parity intent; 🟡 focus/DOM order and duplicate logo loads for task-10 polish.

---

## Ревью: Стили

### Проблемы

🟡 **B-8 accent-on-dark** — `.viwa-hero__eyebrow` `#7F5AF0` on `#0A0A0A` likely below WCAG AA 4.5:1 for small text (carried task-07); task-10 B-8 audit.

🟡 **No viewport-specific breakpoints for 360/390/430** — relies on fluid `clamp`, 2-col flavor grid, `minmax(0,1fr)`; generally sound but formal gate still required.

🟡 **hero-station `max-height: 220px` + `aspect-ratio 16/9`** — may crop station on narrow 360px; verify no clipped critical content.

🟡 **Inline `<style>` visually-hidden** — [`index.html:215-227`] could move to CSS file for consistency.

🟡 **Client `ViwaBrandLogo.module.scss`** — follows token sizing; no issues vs site tokens.

🟡 **`prefers-reduced-motion`** — global + menu + skeleton shimmer disabled ✅.

### Вывод

⚠️ **0 блокеров**; B-8 and narrow-viewport crop checks deferred task-10.

---

## Ревью: Производительность

### Проблемы

🟡 **~22 MB generated payload unchanged** — task-08 baseline; task-09 adds mobile hero-station download (~2.7 MB PNG path) on first mobile visit even with `loading="lazy"` below hero LCP.

🟡 **No `<link rel="preload">` for hero-bottle LCP** — `fetchpriority="high"` on img only; optional improvement from task-08 backlog.

🟡 **14 taste `<picture>` elements** — lazy + `sizes` ✅; manifest fetch serializes tier/taste render after manifest (acceptable).

🟡 **Logo SVG repeated 4× in HTML** — browser cache helps; consider single sprite or CSS mask later.

🟡 **Parallel tier+taste fetch after manifest** — good; no redundant polling.

### Вывод

⚠️ **0 критичных**; mobile hero-station weight is main LCP/bandwidth 🟡 for 360–430 viewports.

---

## Ревью: Документация

### Проблемы

🟡 **`task-09-test-report.md`** — duplicate line «Flow E SBP» (items 68–69); minor editorial fix.

🟡 **JSDoc on site IIFE exports** — `window.ViwaLandingApi` / `ViwaLandingCta` public surface undocumented (task-07 carryover).

🟡 **`README.md` updated** ✅ — task-09 mobile parity, logo, config table; aligns with implementation.

### Вывод

⚠️ Minor doc nits; README adequate for task-09.

---

## Финальное ревью

### Статус предыдущих ревью

- review-general: ⚠️ sessionStorage, staging/browser gates — not blockers for code merge
- review-renderer-structure: ⚠️ DOM vs visual order, static hero paths
- review-styles: ⚠️ B-8, viewport formal gate task-10
- review-performance: ⚠️ hero-station payload on mobile
- review-docs: ⚠️ minor

### Canonical logo source (user correction)

| Check | Status |
|-------|--------|
| Erroneous droplet SVG integration removed | ✅ orchestrator log + code |
| Corrected `logo-viwa-mark.svg` — single `currentColor` path, viewBox 277×243 | ✅ |
| No `#7F5AF0` in logo SVG | ✅ static-regression |
| PNG/WebP re-rasterized from SVG (not task-08 droplet PNG) | ✅ per test report |
| Site: header, menu, hero, footer wired | ✅ |
| Client: `ViwaBrandLogo` on SubscriptionPage | ✅ |
| Manifest byte-sync (277×243, svg/png/webp) | ✅ |
| Text «VIWA» fallback on image error | ✅ `.viwa-logo--text-fallback` |
| `logoIntegrationDeferred` | ✅ **false** |

### Cross-repo live API contract

| Check | Status |
|-------|--------|
| Site default live API | ✅ |
| Mock fail-closed production | ✅ |
| Tastes/tiers error UI (no mock on live failure) | ✅ |
| No HTML hardcoded prices | ✅ |
| Client `publicModule` real fetch | ✅ task-06 baseline |
| `.env.staging.example` direct tl URL | ✅ |
| CORS browser proof | ⚠️ staging gate |

### Новые замечания (финальный взгляд)

🟡 [`static-regression-check.ps1:98`] Logo path guard allows ≤2 `<path>` elements; spec says single path — tighten to `=== 1` for stricter enforcement.

🟡 Site logo header `<img alt="">` with parent `aria-label` — OK decorative pattern; hero logo uses `alt="VIWA"` ✅.

### Итог

✅ **Task-09 code/static scope готов** — live API contract, mock guards, mobile CSS parity, corrected logo pipeline, hero-station mobile, manifests synced.

**hasCriticalIssues: false** for task-09 implementation.

**Downstream gates (not code blockers):** task-10 browser B-1…B-18 on 360/390/430 + desktop 1440; staging Wave 1 (`DATABASE_URL`, migrate, 2× marketing tiers, CORS OPTIONS curl); Flow E SBP E2E on staging.

**Следующий шаг:** task-10 browser gate → optional 🟡 backlog (sessionStorage site-side, B-8, preload LCP, manifest-driven hero HTML, SVG path count guard).

---

## Re-review after idempotence fix (2026-07-29)

**Trigger:** developer `process_logo_assets()` staging publish + `verify-assets-idempotent.ps1` (post droplet-regen blocker fix).  
**Scope:** pipeline idempotence, canonical SVG preservation, manifest triple-sync, site/client logo usage — **not** re-litigating live/mobile blockers unless changed.

### Pipeline (current `process-viwa-assets.py`)

| Mechanism | Status |
|-----------|--------|
| Generate to `assets/.staging-viwa-assets/{site-generated,client-viwa}` before touching live trees | ✅ |
| `validate_staging()` — 18 assets, ≥37 files/tree, logo SVG sha256 == canonical source | ✅ |
| `assert_logo_svg_canonical()` — no `#7F5AF0`, ≤2 `<path>` | ✅ |
| Logo: `shutil.copy2` canonical SVG + resvg PNG + Pillow WebP (never droplet raster) | ✅ |
| Atomic publish: site `replace` swap + client per-file copy + manifest triple-write | ✅ |
| Processor lock (`processor.lock`) + retry on Windows file locks | ✅ |
| `verify-assets-idempotent.ps1` — 2× process + 2× static-regression, backup/restore on failure | ✅ |

### Idempotence verification (re-run this review)

| Check | Result |
|-------|--------|
| `powershell -File scripts/verify-assets-idempotent.ps1` (no concurrent `python`) | ✅ **PASS** — `IDEMPOTENT ASSETS GATE: PASS` |
| SVG SHA256 run 1 | `7f41f638f06917260e19b5e09e956fa66c350abf2c8bf20857f1ad6a484b129e` |
| SVG SHA256 run 2 | `7f41f638f06917260e19b5e09e956fa66c350abf2c8bf20857f1ad6a484b129e` (unchanged) |
| Canonical source `C:\Users\metal\.cursor\projects\c-wiva\assets\logo-viwa-mark.svg` | ✅ same hash as site + client deployed SVG |
| Manifest triple-sync after each run | ✅ byte-identical site / `public/assets/viwa/manifest.json` / `viwaAssetManifest.json` |
| `static-regression-check.ps1` after each run | ✅ PASS (droplet guard, hero-station, safe-area, logo wired) |
| On-disk completeness post-gate | site 37 raster/SVG files; client 38 (+ manifest) |

🟡 **Operational note:** concurrent `process-viwa-assets.py` runs (lock bypass / overlapping debug) leave `site-generated` empty while `client-viwa` fills — validate fails and verify script restores `.generated-good` backup. Gate header requires **run alone**; lock file enforces this in normal use.

### Canonical logo / droplet / usage (unchanged vs prior review)

| Check | Status |
|-------|--------|
| Single `currentColor` path, viewBox 277×243, no `#7F5AF0` | ✅ |
| Site: header, menu, hero, footer — `<picture>` SVG + PNG + `viwa-logo--text-fallback` | ✅ [`index.html`] |
| Client: `ViwaBrandLogo` → `getLogoImagePaths()` + text fallback | ✅ |
| Manifest `logo-viwa-mark` svg/png/webp @ 277×243 | ✅ |
| `logoIntegrationDeferred` | ✅ **false** |

### Prior task-09 live / mobile findings — unchanged

No code changes in `config.js`, `landing-api.js`, `landing-cta.js`, `viwa-landing.css`, client `publicModule` / routing since prior review. Status carry-forward:

| Area | Status |
|------|--------|
| Live API default + mock fail-closed + error/retry | ✅ unchanged |
| No HTML hardcoded prices; 2-tier guard; 14 tastes | ✅ unchanged |
| Mobile stack/safe-area/hero-station/hamburger | ✅ unchanged (formal browser gate still **task-10**) |
| 🟡 site `sessionStorage` handoff | unchanged |
| 🟡 B-8 accent-on-bg, CTA `href="#"`, inline onerror/CSP | unchanged |
| 🟡 staging CORS/DB browser proof | unchanged gate |
| Flows A–F E2E | still **task-10** |

### Re-review verdict

✅ **Idempotence fix closed** — two processor runs preserve canonical SVG hash and complete asset trees; manifests stay triple-synced; droplet regression guards hold.

**hasCriticalIssues: false** (task-09 scope + idempotence follow-up).

**Следующий шаг:** task-10 browser gate (unchanged).
