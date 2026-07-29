# Landing Code Review — viwa-site Bento Rebuild (Round 1 of 5)

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Scope:** Uncommitted bento landing rebuild (above-fold editorial grid + preserved below-fold API shell)  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`  
**Reviewers:** review-general, review-styles, review-performance, review-docs, review-final (parallel, `composer-2.5-fast`)  
**Mode:** Read-only — no code edits

---

## Executive summary

The bento rebuild is architecturally sound: `viwa-board` 40/30/30 + 2×2 bento, hero-only logo stretch, live API hooks preserved, `useMockApi: false` with production fail-closed, error/retry UI for tiers/tastes, and static regression gate **PASS**. Asset processor and idempotent verify are aligned (24 manifest entries, 6 landing sources).

**Blocking for reference fidelity (Round 1):** science section body copy does not match the reference opening; header CTA violates the stated mobile touch ≥44px spec on tablet widths (430–767px).

**Blocking for deploy (not Round 2 visual QA):** `assets/generated/landing/*` is untracked — production would 404 above-fold images if committed without staging.

**hasCriticalIssues:** `true` (3 reference/deploy blockers; no functional API regressions)

---

## Requirement checklist (reference + task-site-report)

| Requirement | Status | Notes |
|-------------|--------|-------|
| 897×867 bento grid (40/30/30 hero + 2×2) | ⚠️ | CSS `40fr 30fr 30fr` from 768px; `--viwa-ref-width` / `--viwa-above-fold` unused — pixel parity unverified |
| Edge-to-edge black board, 1px `#333` borders | ✅ | `--viwa-border`, no rounded cards above fold |
| Header 60px | ✅ | `--viwa-header-height: 60px` |
| Accent `#5C2DA8` | ✅ | `viwa-tokens.css` |
| Hero logo stretch only | ✅ | `.viwa-logo__img--hero { object-fit: fill }`; header/footer preserve aspect |
| Exact copy vs reference | ⚠️ | Science body differs; dev meta-text in flavors/tiers subs |
| Nav IA + CTA targets | ✅ | `#product`, `#flavors`, `#science`, `#serial`, `data-viwa-cta` |
| Feature strip (B3/B6/B12, Mg Zn, calories) | ✅ | Matches reference labels |
| Bento cells 01–03 + Lab Range flavors | ✅ | Layout/copy aligned; Apricot is mock-only (no catalog key) |
| Below-fold hooks preserved | ✅ | `#viwa-flavors-grid`, `#viwa-tiers-list`, `#viwa-serial-input` |
| Live API, no hardcoded tier prices in HTML | ✅ | `static-regression-check.ps1` gate + `landing-api.js` render |
| `useMockApi: false`, production mock guard | ✅ | `config.js:11`; `resolveUseMock()` fail-closed on prod hosts |
| Error/retry states | ✅ | `renderFlavorsError` / `renderTiersError` + retry buttons |
| Asset pipeline 24 assets, idempotent | ✅ | task-report PASS 2×; regression PASS (re-run this review) |
| Mobile: stack, hamburger, touch ≥44px, safe-area | ⚠️ | Header CTA `min-height: 36px` at 430–767px |
| Semantic HTML / a11y baseline | ⚠️ | Skip link scope, `<main>` landmark, menu focus trap gaps |
| Performance / LCP | ⚠️ | Fonts `@import`, 4 eager bento images vs hero LCP |
| `site-version.txt` not bumped | ✅ | Intentional per task-site-report |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| C1 | Exact copy | **Science body** (`index.html:179`) reads «Натуральные экстракты и точная дозировка…» — reference requires «**Мы используем** натуральные экстракты и точные дозировки витаминов и минералов.» Title «Наука вкуса» matches; opening/tone do not. |
| C2 | Mobile touch | **Header CTA** `.viwa-header__cta` sets `min-height: 36px` (`viwa-landing.css:394-398`) while task-site-report requires touch ≥44px (`--viwa-touch-min: 44px`). Visible from 430px alongside hamburger before desktop nav at 768px. |
| C3 | Deploy hygiene | **`assets/generated/landing/*` (12 files) untracked** — `index.html` references these paths; commit/deploy without staging breaks above-fold images. Also gitignore gaps for `assets/.generated-good/`, `assets/.staging-viwa-assets/`, `manifest.json.good.bak`. |

> **Round-1 verdict:** No broken API hooks or mock leak. C1–C3 block reference sign-off and safe deploy respectively; visual QA at 897×867 remains Round 2.

---

## Noncritical findings (🟡)

### Architecture / general (review-general)

| ID | Finding |
|----|---------|
| N1 | Below-fold sections (`#flavors`, `#viwa-tiers`, `#serial`) outside `#main` (`index.html:207-238`); skip link targets `#main` only — keyboard users miss catalog/tiers after skip. |
| N2 | `#main` on `<div class="viwa-board">`, not `<main>` — missing document landmark. |
| N3 | Bento/bottom `<img alt="">` despite `altRu` in manifest/processor — decorative-only policy loses SR context on photo-only cells. |
| N4 | Station section `aria-labelledby="station-lines"` points at `<ul>`, not a heading — weak section label. |
| N5 | Mobile menu: no `aria-modal`, focus trap, or return-focus to `#viwa-menu-open` (`index.html:266-290`). |
| N6 | Dev-facing UI copy: «Каталог с сервера…» / «Цены загружаются из public API…» (`index.html:210,216`). |
| N7 | `#flavors` lacks initial `data-state="loading"` (tiers has it) — minor HTML/JS inconsistency. |
| N8 | `renderTiers` hard-fails when `items.length !== 2` (`landing-api.js:264-267`) — brittle if API shape changes. |
| N9 | `process-viwa-assets.py:21` hardcoded `SRC_DIR` — not portable to CI/other machines. |
| N10 | `icons/flash.svg` still `#7F5AF0` (legacy accent) vs `#5C2DA8` tokens — feature-bar drift. |
| N11 | `[data-viwa-cta]` links use `href="#"` until JS — no `<noscript>` fallback. |
| N12 | Empty tastes API (`items: []`) renders blank grid without empty-state (`landing-api.js:165-199`). |

### Styles (review-styles)

| ID | Finding |
|----|---------|
| N13 | Bento indices `01`/`02`/`03` and labels over full-bleed photos without scrim — contrast not guaranteed on light image areas (`viwa-landing.css:547-582`). |
| N14 | Hardcoded `color: #111` on light bento cell vs token system (`viwa-landing.css:586`). |
| N15 | `--viwa-accent-active: #4a2489` vs reference `#4B2691` — minor shift. |
| N16 | Reference dimension tokens declared but unused in layout math — 897×867 calibration manual only. |
| N17 | Desktop grid from 768px, not 897px — tablet layout may diverge from artboard. |
| N18 | `.viwa-bento__flavor` ~9px type — very small even on dark overlay. |
| N19 | Hardcoded `rgba(92, 45, 168, …)` instead of accent-derived alpha tokens. |
| N20 | Duplicate `@media (min-width: 430px)` for header CTA — dead overlap with 768px rule. |
| N21 | Google Fonts `@import` in CSS duplicates preconnect strategy — render-blocking. |

### Performance (review-performance)

| ID | Finding |
|----|---------|
| N22 | `@import` Google Fonts in `viwa-landing.css:1` — serial blocking after CSS fetch. |
| N23 | Four bento images `loading="eager"` compete with LCP hero logo bandwidth (`index.html:105-142`). |
| N24 | Hero logo: `fetchpriority="high"` + `decoding="async"` — may delay LCP paint. |
| N25 | Logo duplicated 4× (overlay, header, hero, footer) — extra requests before/after fold. |
| N26 | No `<link rel="preload">` for hero logo asset. |
| N27 | `init()` waits for manifest before tiers/tastes — unnecessary waterfall (`landing-api.js:337-339`). |
| N28 | Public API fetches use `cache: 'no-store'` — no HTTP cache on repeat visits. |
| N29 | Scripts at end of body without `defer`; CTA `applyLinks()` on every serial keystroke. |

### Documentation (review-docs)

| ID | Finding |
|----|---------|
| N30 | **README.md stale:** concept-16 split, cabinet mock, 18 manifest IDs, hero-station/hero-bottle — rebuild is bento 24 assets at 768px grid. |
| N31 | `conceptRef: "concept-bento-station-first"` in manifest not reflected in README/architecture docs. |
| N32 | Python processor functions lack per-function docstrings; PS functions lack Comment-Based Help. |
| N33 | No HTML section comments for major blocks in 290-line `index.html`. |
| N34 | `static-regression-check.ps1` duplicate `object-fit: fill` assertion — copy-paste drift risk. |

### Final / cross-cutting (review-final)

| ID | Finding |
|----|---------|
| N35 | Bento «Apricot / Абрикос» — no `apricot` in 14-taste catalog (mock fidelity vs product accuracy). |
| N36 | `#viwa-tiers` `data-state="loading"` in HTML; `#flavors` sets state only in JS. |
| N37 | Tablet 430–767px: header CTA + hamburger without desktop nav — crowded header. |
| N38 | Visual QA at exactly 897×867 not performed in code review — mandatory Round 2 browser pass. |

---

## Reviewer section summaries

### review-general — ⚠️ 0 🔴 / 12 🟡

API wiring, asset pipeline, and hero stretch isolation are mature. Main gaps: landmark/skip scope, image alt policy, mobile menu a11y, dev copy in UI.

### review-styles — ⚠️ 3 🔴 (WCAG/visual) / 9 🟡

Grid and token split match bento reference structurally. Touch target, bento label contrast on photos, and one hardcoded color flagged as style-critical; folded into C2/N13–N14 above.

### review-performance — ⚠️ 3 🔴 (LCP/fonts) / 8 🟡

Good foundations (preconnect, WebP, dimensions, lazy below-fold). Fonts `@import`, eager bento vs LCP hero, and manifest/API waterfall are top CWV risks.

### review-docs — ⚠️ 5 🔴 (README drift) / 7 🟡

`task-site-report.md` accurate; README and science copy diverge from rebuild reality and reference text.

### review-final — ✅ ready for visual QA Round 2

Static regression **PASS** (re-run 2026-07-29). Functional hooks intact. Commit/deploy hygiene (C3) and copy/touch blockers (C1–C2) before sign-off.

---

## Verification run (this review)

| Check | Result |
|-------|--------|
| `powershell -File scripts/static-regression-check.ps1` | **PASS** |
| `git diff --stat` (8 modified + untracked landing) | 1103 insertions / 446 deletions |
| Browser pixel QA 897×867 | Not run (Round 2) |
| `verify-assets-idempotent.ps1` | Not re-run (task-report PASS 2×) |

---

## Suggested fix priority (Round 2+)

1. **Restore reference science copy** opening (C1).
2. **Raise header CTA to `--viwa-touch-min`** on all breakpoints where visible (C2).
3. **Stage `assets/generated/landing/*`**; gitignore staging/backup dirs (C3).
4. Wrap editorial + below-fold in `<main>`; extend skip-link target (N1–N2).
5. Replace fonts `@import` with `<link>` in HTML; demote bento `loading` or add `fetchpriority="low"` (N22–N24).
6. Update README for bento rebuild + 24 assets (N30).
7. Visual QA at 897×867 and mobile 360/390/430 in browser (Round 2).

---

## JSON summary

```json
{
  "round": 1,
  "scope": "viwa-site-landing",
  "hasCriticalIssues": true,
  "criticalCount": 3,
  "noncriticalCount": 38,
  "requirementCompliance": "pass-with-reservations",
  "blockers": [
    "C1-science-copy-vs-reference",
    "C2-header-cta-touch-36px",
    "C3-untracked-landing-assets"
  ],
  "staticRegressionCheck": "PASS"
}
```
