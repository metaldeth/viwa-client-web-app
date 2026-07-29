# task-07-review: Site one-page concept-16 + API shell + serial capture CTA

**Session:** `viwa-landing-subscriptions`  
**Repo:** `viwa-site`  
**Baseline:** uncommitted diff on `master` (modified `index.html`, `README.md`; new CSS/JS/assets)  
**Task:** [task-07.md](./task-07.md)  
**Architecture:** [architecture.md](../architecture.md) v1.2 §0, §viwa-site, Flow A/B, manifest  
**Concept reference:** [request.md](../request.md) — concept-16 editorial fruit lab, split composition, `#7F5AF0`  
**Review agents (parallel):** `review-general`, `review-styles`, `review-performance`, `review-docs`, `review-final` (`composer-2.5-fast`; no `AGENTS.md` / `reviewAgents` — plan override)

## Изменённые / новые файлы (task-07 scope)

| Файл | Кратко |
|------|--------|
| `index.html` | VIWA one-page: semantic landmarks, split shell, hero, serial capture, 14-flavor grid, tier slots, cabinet mock aside, mobile menu |
| `css/viwa-tokens.css` | **NEW** — shared tokens, B-8 contrast notes |
| `css/viwa-landing.css` | **NEW** — split ≥1024px / stack mobile, a11y focus, B-7 reduced-motion, touch ≥44px |
| `js/config.js` | **NEW** — `apiBaseUrl`, `cabinetBaseUrl`, `useMockApi`, `entryParam` |
| `js/landing-api.js` | **NEW** — public tiers/tastes fetch, skeleton/error/retry (tiers), mock fallback |
| `js/landing-cta.js` | **NEW** — cabinet deep-links `entry=website`, serial preservation |
| `assets/generated/.gitkeep` | Placeholder tree until task-08 |
| `README.md` | Static validation checklist, deploy notes, config table |

**Не в diff (OK):** legacy `sostav.html`, `podpiska.html`, `dlya-klubov.html`, `o-flow.html`, `css/style.css`, `js/main.js` — preserved; new landing does not reference legacy CSS/JS.

**Не тронуто (OK):** Docker/compose/nginx Docker configs.

---

## Acceptance task-07

| Критерий | Статус |
|----------|--------|
| Desktop split: marketing left + cabinet mock right + «Открыть кабинет» deep-link | ✅ `@media (min-width: 1024px)` row split; static mock + CTA |
| Mobile stack; touch ≥44px; no horizontal scroll (B-1) | ✅ column stack; `--viwa-touch-min: 44px`; `overflow-x: hidden` |
| 14 flavor slots with RU labels (API or static fallback) | ✅ 14 keys + render; круг 2: live failure → error/retry (no mock) |
| 2 tier cards; prices from API; skeleton on failure (B-3) | ✅ no prices in HTML; skeleton + error/retry; круг 2: `useMockApi: false` default |
| CTA with serial → serial + `entry=website` (B-4) | ✅ `landing-cta.js` `buildRegisterUrl` |
| CTA without serial → `/register?entry=website` (B-5) | ✅ no dead-end; Serial Capture in cabinet |
| `prefers-reduced-motion` (B-7) | ✅ global + menu + skeleton shimmer disabled |
| Brand VIWA on user-facing landing | ✅ title, logo, copy; legacy FLOW only on old pages |
| Legacy pages not removed | ✅ footer links |
| No Docker changes | ✅ |
| Iframe not primary | ✅ static mock panel |
| B-8 WCAG contrast | ⚠️ tokens documented; accent-on-bg eyebrow/link likely below AA normal |
| Architecture Flow A `sessionStorage` handoff | ⚠️ not implemented on site |
| Mock must not leak production | ✅ круг 2: `useMockApi: false`, `resolveUseMock()` + `isProductionHost()` fail-closed |

---

## Сводка ревью

| Агент | Статус | Коммит |
|-------|--------|--------|
| review-general | 🔴 2 критичных, 6 предложений | — |
| review-styles | ⚠️ 5 предложений, 0 блокеров | — |
| review-performance | ⚠️ 4 предложения, 0 критичных | — |
| review-docs | ⚠️ 3 JSDoc gaps + 4 предложения | — |
| review-final (круг 1) | 🔴 2 blockers | — |
| **code-review круг 2** | ✅ critical blockers closed | developer-complex fix applied |

---

## Ревью: Общее архитектурное

### Суммаризация

**Что решали:** Replace/extend `index.html` with concept-16 VIWA one-page — split desktop / stack mobile, public API shell for tiers+tastes, serial capture CTA to cabinet SPA, static cabinet mock (no iframe).

**Как работает:** `config.js` → `landing-cta.js` (URL builder on DOMContentLoaded + serial input) + `landing-api.js` (parallel tier/taste load, DOM render). CTAs use `data-viwa-cta` attributes; tiers re-call `applyLinks()` after render.

**Валидация логики:** ✅ CTA paths match architecture v1.2 §0 (`entry=website`, optional `serial`). ✅ Tier guard `items.length !== 2` blocks legacy tier leak. ⚠️ Missing site-side `sessionStorage` for `viwa_entry` / `viwa_serial` (Flow A). 🔴 Tastes error path always renders `MOCK_TASTES` even when live API intended.

### Проблемы

🔴 **Mock tastes leak on live API failure** — [`landing-api.js:211-213`] `loadAndRenderTastes().catch` always `renderTastes(MOCK_TASTES)`; ignores `useMockApi`. After task-09 (`useMockApi: false`), network/CORS failure shows dev mock catalog in production.

🔴 **No production guard for `useMockApi`** — [`config.js:9`] committed `useMockApi: true`; logic `useMockApi !== false` treats missing key as mock. Deploy without manual flip shows mock tier prices (`49900`/`69900` kopecks in JS) indefinitely.

🟡 **`sessionStorage` handoff missing** — architecture Flow A: landing stores `viwa_serial` / `viwa_entry`. Site only prefills input from `?serial=` and embeds serial in CTA href; never writes `viwa_entry`/`viwa_serial`. Direct CTA click works; cross-tab / partial navigation / client `resolveRegisterSerial` fallback weaker than canon.

🟡 **Landing QR query `entry=website` ignored on site** — [`landing-api.js:220-226`] reads `serial` from URL only; `entry` not persisted. CTA always sets `entry=website` (OK for website CTAs), but inbound QR `?entry=website&serial=` does not warm storage.

🟡 **CTA `href="#"` before JS** — all `[data-viwa-cta]` links start as `#`; no `<noscript>` cabinet URLs. JS failure → in-page dead-end (contrast with B-5 intent).

🟡 **Tastes: no error/retry UI** — tiers have skeleton + `role="alert"` + retry; tastes silently substitute mock (live) or mock (dev) with no user-visible error state.

🟡 **Tier fetch in mock mode skips network entirely** — intentional for Wave 1, but defers validation of CORS/public contract until task-09; document as gate dependency (README OK).

🟡 **`schemaVersion` not validated** — public responses accepted without version check; drift risk low for static landing.

### Новые паттерны

- IIFE modules on `window.ViwaLandingApi` / `window.ViwaLandingCta` — consistent with static site, no bundler.
- Recommend documenting sessionStorage contract alongside `landingEntry.ts` in client (cross-repo).

### Вывод

🔴 **2 критичных**, 🟡 **6 предложений**. Core split/CTA/serial capture architecture sound; mock-leak and storage handoff gaps block confident production gate.

---

## Ревью: Стили

### Проблемы

🟡 **Inline `style` on cabinet title** — [`index.html:118`] `style="font-size:1.25rem;margin-bottom:0.75rem;"` — should live in `viwa-landing.css`.

🟡 **Inline `<style>` block for `.visually-hidden`** — [`index.html:153-165`] duplicates pattern; move to CSS file for CSP/consistency.

🟡 **Hardcoded color outside tokens** — [`viwa-landing.css:600`] `#111` in cabinet mock gradient; breaks token-only rule.

🟡 **B-8: accent text on dark background** — `.viwa-hero__eyebrow`, default `a { color: var(--viwa-accent) }` use `#7F5AF0` on `#0A0A0A`; likely **below WCAG AA 4.5:1** for normal/small text (tokens claim AA for btn white-on-accent only). Full B-8 audit deferred to task-10 — partial gap now.

🟡 **Mobile menu: no focus trap / no `inert` on backdrop** — Escape closes menu (good); Tab can escape overlay while `aria-hidden="false"`.

### Вывод

⚠️ **5 предложений**, 🔴 **0 layout blockers**. Split/stack, touch targets, reduced-motion, focus-visible — aligned with B-1/B-6/B-7.

---

## Ревью: Производительность

### Проблемы

🟡 **`@import` Google Fonts in CSS** — [`viwa-landing.css:1`] render-blocking; consider `<link rel="preload">` or self-host (README notes network dependency).

🟡 **Parallel fetch without abort** — tier + taste requests independent; fast navigation/retry could race (low risk on static single page).

🟡 **Skeleton shimmer animation** — disabled under `prefers-reduced-motion` (good); still runs by default on tier load.

🟡 **14 lazy images below fold** — `loading="lazy"` on flavor grid (good); hero/cabinet images eager/lazy mix OK for LCP placeholder.

### Вывод

✅ Minimal risk for static landing; no listener leaks; no framework re-render cost.

---

## Ревью: Документация

### Проблемы

🟡 **JSDoc incomplete on exports** — `window.ViwaLandingApi` object fields (`formatRub`, `loadTiers`, …) lack per-method JSDoc; `ViwaLandingCta.init` undocumented.

🟡 **README vs architecture manifest path** — README references `assets/generated/**`; architecture also expects `assets/manifest.json` (task-08) — not mentioned in task-07 README scope (minor).

🟡 **B-8 ownership split** — task-07 acceptance omits B-8; README checklist + tokens comments compensate; task-10 owns full audit (plan_review known gap).

🟡 **Deploy gate wording** — README «set `useMockApi: false` after task-09» — should stress **mandatory before production** and tastes mock-leak fix.

**Contract sync:** ✅ Public paths `/public/subscription-levels`, `/public/tastes`; field names `monthlyVolumeMl`, `priceKopecks`, `mediaKey`, `nameRu` match architecture v1.2 §1.

### Вывод

⚠️ JSDoc gaps некритичны; README/checklist useful for no-AGENTS repo.

---

## Финальное ревью

### Статус предыдущих ревью

- review-general: 🔴 mock leak, sessionStorage gap
- review-styles: ⚠️ inline styles, B-8 accent-on-bg
- review-performance: ✅ minimal risk
- review-docs: ⚠️ JSDoc + gate docs
- review-final: staging/task-09 gate required

### Cross-cutting risks

| Risk | Severity | Notes |
|------|----------|-------|
| Tastes mock on API error when live | 🔴 | `landing-api.js` catch ignores `useMockApi` |
| `useMockApi: true` in shipped config | 🔴 | Mock tier prices until manual deploy edit |
| No site `sessionStorage` handoff | 🟡 | Flow A partial; CTA URLs compensate |
| CSP / inline handlers | 🟡 | `onerror=`, inline menu script, inline `<style>` |
| B-8 accent text contrast | 🟡 | Eyebrow + link color; task-10 full audit |
| CTA `href="#"` without JS | 🟡 | Progressive enhancement gap |
| Legacy FLOW pages unchanged | ✅ | Expected; index is VIWA |
| Docker untouched | ✅ | |

### Итог

⚠️ **Merge to session baseline OK for Wave 2C mock phase**; **not ready for production / task-09 live wire-up without круг 2 fixes.**

**hasCriticalIssues: true** — (1) tastes failure path leaks mock data when live API enabled; (2) no fail-safe preventing mock tier mode in production deploy (`useMockApi` default + `!== false` semantics).

---

## Рекомендации developer-complex (круг 2)

1. **Обязательно:** In `loadAndRenderTastes`, on failure when `!useMock`, show error/retry (mirror tiers) — never `MOCK_TASTES`.
2. **Обязательно:** Production guard — e.g. `useMockApi: location.hostname === 'localhost' || …` or deploy checklist enforced in `config.js` comment + fail-closed when hostname is `vitamin-water.ru`.
3. **Желательно:** Persist `viwa_entry` / `viwa_serial` to `sessionStorage` on load and serial input (align `landingEntry.ts`).
4. **Желательно:** Move inline styles/scripts to external files; replace inline `onerror` with JS listeners (CSP-friendly).
5. **Желательно:** Fix B-8 accent-on-bg (eyebrow/links) or mark as large-text only; verify with contrast tool before task-10.
6. **Некритично:** `<noscript>` static cabinet register URL; mobile menu focus trap; JSDoc on exported API surface.

---

## Code-review круг 2 (2026-07-29)

**Scope:** только закрытие 🔴 blockers из круга 1 + `scripts/static-regression-check.ps1` PASS.

### Blocker #1 — explicit mock opt-in / default false

| Проверка | Статус |
|----------|--------|
| `config.js` default `useMockApi: false` | ✅ [`config.js:11`] |
| Mock only when `config.useMockApi === true` (not `!== false`) | ✅ [`landing-api.js:20-25`] `resolveUseMock()` |
| Production hosts fail-closed (`vitamin-water.ru`, `www.`) | ✅ [`landing-api.js:9-17`, `14-17`] `isProductionHost()` → always live |
| README documents opt-in + production guard | ✅ |
| Static script rejects `useMockApi: true` default | ✅ `static-regression-check.ps1` |

**Вердикт:** ✅ **закрыт.**

### Blocker #2 — no MOCK_TASTES/tiers on live API failure

| Проверка | Статус |
|----------|--------|
| Tastes `catch`: mock only if `resolveUseMock()` | ✅ [`landing-api.js:265-270`] |
| Live failure → `renderFlavorsError` + retry | ✅ [`landing-api.js:159-171`, `270`] |
| Tiers `catch`: mock only if `resolveUseMock()` | ✅ [`landing-api.js:248-254`] |
| Live failure → `renderTiersError` + retry | ✅ [`landing-api.js:186-197`, `253`] |
| Invalid tier count (`!== 2`) → error, not mock | ✅ [`landing-api.js:207-209`] |
| Script rejects unconditional `MOCK_TASTES` in catch | ✅ regex guard in regression script |

**Вердикт:** ✅ **закрыт.**

### Verification

| Check | Result |
|-------|--------|
| `powershell -File scripts/static-regression-check.ps1` | ✅ PASS (exit 0) |
| Asset path smoke (orchestrator dev log) | ✅ |
| Live API E2E / CORS from browser | ⚠️ deferred task-09 (Wave 1 gate) |

### Некритичные замечания круга 1 (без изменений)

- 🟡 `sessionStorage` handoff (`viwa_entry` / `viwa_serial`) — не реализован
- 🟡 B-8 accent-on-bg, inline styles/CSP, CTA `href="#"` pre-JS
- 🟡 JSDoc gaps on exports

### Итог круга 2

✅ **Critical blockers закрыты.** `hasCriticalIssues: false` для mock/production guard scope.

Task-07 готов к merge в session baseline; **task-09 live wire-up** всё ещё требует staging gate (public API + CORS smoke), не mock-regression.
