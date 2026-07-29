# Landing Code Review — viwa-site Bento Rebuild (Round 4 of 5)

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Scope:** Independent re-review after Round 3→4 measured geometry/typography fixes  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`, `viwa-site/README.md`  
**Historical context:** `rounds/round-3/landing-code-review.md`, `rounds/round-3/fix-resolution.md`  
**Mode:** Read-only — no production edits, no commit/push/deploy

---

## Executive summary

Round 3→4 typography and geometry compression fixes are **verified in current CSS/HTML/JS**. Board `minmax(0, …%)` tracks, bento inner `28.43fr/35fr`, hero exact two-line title semantics (`Вкус` / `в&nbsp;точной&nbsp;дозе`), logo transform boxes with `overflow: hidden`, accent `#4A247D`, mobile bottom-strip link touch (R3-S4), Escape/`isMenuOpen()` focus convention, serial/`entry=website` CTA wiring, and LCP policy all match `fix-resolution.md` and updated static gate hooks.

Standalone **`static-regression-check.ps1` → PASS** on first run (pre–asset-verify). **`verify-assets-idempotent.ps1` → FAIL** restored stale 24-asset manifest from `.generated-good`, causing a **post-restore static FAIL** (manifest expects 38 IDs incl. medallions). This is an **ops/backup drift artifact**, not a regression in landing markup/CSS.

**hasCriticalIssues:** `false` for Round 4 code sign-off. **C3** (untracked landing assets + manifest staging at commit) remains the deploy gate.

**Pixel gate:** not rerun this round — last masked SSIM **0.5342** (Round 3 pixel report).

---

## Round 3→4 fix verification

| ID | Fix | Round 4 status | Evidence |
|----|-----|----------------|----------|
| R3-G1 | Board `minmax(0, 36.57/28.43/35%)` + bento inner cols | **✅ RESOLVED** | `viwa-landing.css:356-366`, `573-580`; `min-width:0` + `overflow:hidden` on hero/bento |
| R3-G2 | Hero logo 277×243 + CSS scale | **✅ RESOLVED** | `viwa-landing.css:135-152`; probe y≈118 (`fix-resolution.md`) |
| R3-G3 | Hero title 44px / weight 400 / exact 2 lines | **✅ RESOLVED** | `index.html:98` `<br>` + `.viwa-hero-brand__title-phrase` nbsp; `viwa-landing.css:519-540` |
| R3-G4 | Hero subtitle 14px | **✅ RESOLVED** | `.viwa-hero-brand__sub { font-size: 0.875rem }` |
| R3-G5 | Header logo visible 54×29 | **✅ RESOLVED** | `.viwa-logo--header .viwa-logo__picture` 54×29 + `scale(0.195, 0.119)` |
| R3-G6 | Header CTA x747, accent #4A247D | **✅ RESOLVED** | `--viwa-accent: #4a247d`; desktop `padding-right: 25px`; CTA 125×30 @768+ |
| R3-G7 | Bento/bottom typography regular weight | **✅ RESOLVED** | Labels 10px/400; bottom title 18px/400; flavor `strong { font-weight: 400 }` |
| R3-S4 | Bottom strip link touch mobile | **✅ RESOLVED** | `@media (max-width: 767px)` restores `min-height: var(--viwa-touch-min)` (`viwa-landing.css:936-943`) |
| R3-F3 | Escape: focus return on close; 2nd Escape no-op | **✅ RESOLVED** | `setMenu` same-state guard; `Escape && isMenuOpen()`; close → `openBtn.focus()` |
| — | Vertical geometry 68/531/66/202 | **✅ PRESERVED** | `viwa-tokens.css:36-41` |
| — | Bottom quad order/widths | **✅ PRESERVED** | bubble → science → station → rhythm; fr 22.2/25.3/32.55/19.95 |

---

## Focus-area review

### Board minmax tracks & responsive overrides

- Desktop `@media (min-width: 768px)`: `.viwa-board` uses `grid-template-columns: minmax(0, 36.57%) minmax(0, 28.43%) minmax(0, 35%)` and fixed row tokens `--viwa-hero-height` / `--viwa-feature-height` / `--viwa-bottom-height`.
- Bento nests `minmax(0, 28.43fr) minmax(0, 35fr)` with unequal rows `228px / 303px`.
- Bottom quad uses tokenized fr tracks; mobile stacks single column with preserved DOM order.
- `@897` structural probe (Round 3 fix-resolution): column boundaries **0 / 328 / 583 / 897** — matches 36.57/28.43/35 intent (±1px rounding).

### Hero exact two-line semantics

- Line 1: `Вкус` before `<br>`.
- Line 2: `<span class="viwa-hero-brand__title-phrase">в&nbsp;точной&nbsp;дозе</span>` with `white-space: nowrap` — prevents orphan wrap on «дозе».
- Typography: `--viwa-font-condensed`, weight **400**, `2.75rem` @768+, uppercase via CSS.

### Logo transforms / clipping

- Hero: fixed picture box **277×243**, `overflow: hidden`, img `object-fit: fill` + `transform: scale(1.108, 1.094)` — compensates SVG whitespace without viewBox edits.
- Header: **54×29** clip box + `scale(0.195, 0.119)` on full SVG asset — no visible clipping reported in probe.
- Text fallback hooks preserved (`viwa-logo--text-fallback`).

### Font fallbacks

- UI: Inter preloaded via HTML (`media="print" onload`) — non-blocking.
- Display: `'Montserrat', var(--viwa-font-ui)` — **Montserrat not preloaded** (carry-over **R4-P1**); falls back to Inter silently.
- Condensed hero/bottom: `'Arial Narrow', … Arial` — cross-OS variance expected (**R4-T1**).

### CTA / touch targets

| Control | Mobile 360–429 | Mobile 430–767 | Desktop ≥768 |
|---------|----------------|----------------|--------------|
| Hamburger / menu links | 44px | 44px | hidden |
| Header CTA «Найти станцию» | hidden | 44px min | 125×30 (compact) |
| Hero CTA «Пить больше» | 44px | 44px | 197×36 |
| Bottom strip links | **44px** (R3-S4 fix) | 44px | compact row |
| Serial input + «Продолжить» | 44px | 44px | 44px |
| Header logo link | ~29px height | ~29px | ~29px (**R4-S1** trade-off) |

### Contrast (computed)

| Pair | Ratio | WCAG AA (normal) |
|------|-------|------------------|
| `#ffffff` on `#000000` | 21.0:1 | ✅ |
| `#ffffff` on `#4a247d` (primary btn) | 11.4:1 | ✅ |
| `#a0a0a0` on `#000000` (muted) | 8.0:1 | ✅ |
| `#4a247d` on `#000000` (eyebrow) | **1.8:1** | ❌ (**R4-A1** — 9px uppercase label) |
| `#111111` on `#e8e8e8` (light bento cell) | 15.4:1 | ✅ |

### Menu Escape / focus convention

```javascript
// index.html:286-309 — verified behavior
if (open === isMenuOpen()) return;           // same-state no-op
if (e.key === 'Escape' && isMenuOpen()) setMenu(false);  // closed → handler skipped
// close path: openBtn.focus() — second Escape while closed is no-op (focus unchanged)
```

Matches Round 3 browser gate expectation: retain trigger focus after close; no focus theft on closed menu.

### Serial / source registration

- `landing-cta.js`: `entry=website` default; serial from `#viwa-serial-input` or `?serial=` query → `/register?entry=website&serial=…`.
- `data-viwa-cta="register"` on hero + serial continue; `auth` on nav/footer cabinet links.
- `landing-api.js` init prefills serial from query and refreshes CTA hrefs — unchanged.

### Asset loading / LCP

- Hero logo: single `fetchpriority="high"` (LCP candidate).
- Six bento + two bottom images: `loading="lazy"`.
- No CSS `@import` for fonts.
- On-disk landing WebP/PNG present under `assets/generated/landing/` (12 files); **git untracked** (**C3**).

---

## Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| 897×867 canonical geometry | ✅ code | Tokens + minmax cols; pixel SSIM open |
| Hero 2-line title semantics | ✅ | nbsp phrase + nowrap |
| Logo stretch hero-only | ✅ | Transform + overflow clip |
| Live API / no hardcoded prices | ✅ | Static gate + JS |
| Mobile stack 360–430 | ✅ | hero → bento → feature → bottom → below-fold |
| Touch ≥44px mobile CTAs | ⚠️ | Bottom links fixed; header logo + desktop compact CTAs excepted |
| Escape / focus | ✅ | R3-F3 convention |
| LCP policy | ✅ | Hero high; rest lazy |
| C3 asset git staging | ⏸ | Deploy gate at final commit |
| Manifest 38-asset gate | ⚠️ | PASS pre-verify; FAIL after idempotent restore (ops drift) |

---

## Critical findings (🔴)

| ID | Area | Finding | New? |
|----|------|---------|------|
| — | — | **No Round 4 code blockers** | — |
| **C3** | Deploy | `assets/generated/landing/*` + staging dirs still **untracked** — 404 risk if deployed without staging | carry-over |

> **Round-4 code verdict:** Typography/geometry fixes verified. C3 deploy-only. No production edits made.

---

## Noncritical findings (🟡)

### Resolved since Round 3

| ID | Status |
|----|--------|
| R3-S4 bottom strip link touch | ✅ mobile 44px restored |
| R3-G1–G7 geometry/typography compression | ✅ verified |

### Carry-over / new

| ID | Area | Finding |
|----|------|---------|
| R4-F1 | A11y | Closed menu `role="dialog"` + toggling `aria-modal` — APG-inconsistent (was R3-F1) |
| R4-F2 | A11y | No Tab trap / `inert` on page when menu open (was R3-F2) |
| R4-S1 | Touch | Header logo link ~54×29 — below 44px by design for 68px header |
| R4-S2 | Touch | Desktop header CTA 125×30, hero CTA 197×36 — compact by design (G7) |
| R4-S3 | Styles | Bento labels on dark photo cells lack text-shadow (indices/list have it) |
| R4-P1 | Perf | Montserrat referenced but not preloaded — silent Inter fallback |
| R4-T1 | Typography | Condensed face OS-dependent (Arial Narrow) |
| R4-A1 | Contrast | Eyebrow `#4a247d` on black **1.8:1** — fails AA for 9px text |
| R4-O1 | Ops | `verify-assets-idempotent.ps1` restored `.generated-good` backup → manifest **24** assets vs gate **38**; post-restore static FAIL — refresh backup before idempotent runs |
| R4-G1 | General | Empty tastes API → blank grid; tiers hard-fail when `items.length !== 2` |
| R4-G2 | General | Dev-facing subcopy in flavors/tiers sections |
| R4-P2 | Pixel | ±1px feature/bottom y vs reference (599/665) — border rounding |

---

## Mobile 360 / 390 / 430 (structural code review)

| Check | 360 | 390 | 430 | Notes |
|-------|-----|-----|-----|-------|
| Stack order | ✅ | ✅ | ✅ | hero → bento → feature → bottom → flavors → tiers → serial |
| Horizontal scroll guard | ✅ | ✅ | ✅ | `overflow-x: hidden` |
| Header 68px | ✅ | ✅ | ✅ | Token-driven |
| Hamburger 44×44 | ✅ | ✅ | ✅ | |
| Header CTA visible | ❌ | ❌ | ✅ | Hidden <430px |
| Header CTA touch @430–767 | — | — | ✅ | 44px min |
| Hero CTA 44px | ✅ | ✅ | ✅ | |
| Feature strip 44px items | ✅ | ✅ | ✅ | |
| Bottom link touch | ✅ | ✅ | ✅ | R3-S4 fix |
| Safe-area insets | ✅ | ✅ | ✅ | body, menu, below-fold, footer |

> Formal browser pixel/smoke at 360/390/430 **not run** this round — CSS/static analysis only.

---

## Verification run (this review)

| Check | Result | Notes |
|-------|--------|-------|
| `powershell -File scripts/static-regression-check.ps1` | **PASS** | First run, pre–asset-verify |
| `powershell -File scripts/verify-assets-idempotent.ps1` | **FAIL** | Processor run + restore; manifest drift to 24 assets |
| `static-regression-check.ps1` (post-restore) | **FAIL** | Missing 14 medallion assets — backup stale vs gate |
| `git status` | 10 modified + untracked `assets/generated/landing/`, `.generated-good/`, `.staging-viwa-assets/` | No commit |
| Code read | Complete | `index.html`, `viwa-landing.css`, `viwa-tokens.css`, `landing-api.js`, `landing-cta.js`, `config.js` |
| Round 4 pixel @897 | **Not rerun** | Last SSIM 0.5342 (Round 3) |
| Browser functional smoke | **Not rerun** | No JS flow changes since Round 3 fixes |
| TEMP files created | **None** | Review read-only |

---

## Delta vs Round 3

| Area | Round 3 | Round 4 |
|------|---------|---------|
| R3-S4 bottom touch | ⚠️ open | ✅ fixed mobile-only |
| Hero title | 32px bold / 3-line risk | ✅ 44px / 400 / 2-line nbsp |
| Header logo | ~33×29 | ✅ 54×29 transform clip |
| Accent | `#5C2DA8` era | ✅ `#4A247D` |
| Board columns | drift concern | ✅ minmax % verified @897 |
| Static gate | PASS | PASS (pre-verify); ops drift post-verify |
| hasCriticalIssues (code) | false | **false** |
| Pixel gate | SSIM 0.534 FAIL | open (not rerun) |

---

## Suggested fix priority (Round 5)

1. **Round 5 pixel browser @897** + mobile 360/390/430 — post-typography SSIM gate.
2. **Stage C3** landing assets + align manifest/backup with 38-asset gate at commit.
3. Refresh `.generated-good` backup after manifest bump (**R4-O1**).
4. Optional: eyebrow contrast lift or size bump (**R4-A1**); Montserrat preload or drop (**R4-P1**).
5. Optional: Tab trap when menu open (**R4-F2**).

---

## JSON summary

```json
{
  "round": 4,
  "scope": "viwa-site-landing",
  "hasCriticalIssues": false,
  "criticalCount": 0,
  "deployGateAtCommit": ["C3-untracked-landing-assets", "manifest-38-asset-sync"],
  "pixelGate": "not-rerun",
  "lastMaskedSSIM": 0.5342,
  "round3to4FixesVerified": [
    "R3-G1-minmax-board-cols",
    "R3-G2-hero-logo-277x243",
    "R3-G3-hero-title-2line",
    "R3-G4-subtitle-14px",
    "R3-G5-header-logo-54x29",
    "R3-G6-accent-4A247D-cta-position",
    "R3-G7-bento-bottom-typography",
    "R3-S4-bottom-touch-mobile",
    "R3-F3-escape-focus-convention"
  ],
  "noncriticalCount": 12,
  "newFindingIds": ["R4-F1", "R4-F2", "R4-S1", "R4-S2", "R4-S3", "R4-P1", "R4-T1", "R4-A1", "R4-O1", "R4-G1", "R4-G2", "R4-P2"],
  "resolvedFromR3": ["R3-S4", "R3-G1", "R3-G2", "R3-G3", "R3-G4", "R3-G5", "R3-G6", "R3-G7", "R3-F3"],
  "requirementCompliance": "pass-with-reservations",
  "staticRegressionCheck": "PASS-pre-verify",
  "verifyAssetsIdempotent": "FAIL-backup-drift",
  "functionalSmoke": "not-rerun"
}
```
