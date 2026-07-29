# Code Review — Cabinet TOP-3 Rebuild (Round 5 of 5 — Final)

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)  
**Scope:** Independent final code review after Round 4→5 style remediation + parent `titleRow` gap **18px**  
**Reference:** Concept bento cabinet mock — inner crop **342×780** (outer 390×832, crop x=24..365, y=20..799)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-client-report.md`  
**Inputs:** `rounds/round-4/cabinet-code-review.md`, `rounds/round-4/fix-resolution.md`, `rounds/round-4/cabinet-geometry-probe-results.json`, `rounds/round-4/cabinet-pixel-browser-report.md`  
**Mode:** Read-only — no production edits, no commit/push/deploy/Docker

---

## Executive summary

Round 4→5 cabinet style remediation is **verified in current code**. Split plan price (`priceAmount` + `planPeriodSuffix`), header `translateY(21px)` with logo clip **67×38**, neutral card borders, QR/taste/plan typography tune, active nav icon white (not purple), and parent **`titleRow` gap 18px** are all present. Fourteen taste medallions map in manifest with conventional-path fallback; `FavoriteTastesRow` renders exactly **3** read-only slots across load/error/success. Machine-path active nav (R2-A1), catalog cache tests (R2-P1), QR/plan modals, and no client PUT favorites remain closed.

**Round 4 lint blockers resolved:** `npm run lint` → **0 errors** (23 pre-existing warnings elsewhere).

**hasCriticalIssues (code):** `false` — no functional regressions, no broken modals/nav/slots/API contract.

**releaseBlockers:** **2** — (1) deploy asset git staging **R5-D1**, (2) pixel masked diff gate **R5-P1** (last corrected inner @342×780: masked diff **26.8%**, target ≤8%; not rerun this round).

Round 5 is the **final code-review gate** for cabinet client web. Ship requires staging untracked assets at commit and independent pixel sign-off.

---

## Verification commands (this round)

| Command | Result | Notes |
|---------|--------|-------|
| `npm run lint` | **PASS** | 0 errors, 23 pre-existing warnings (legacy icons/tables) |
| `npm run locale:sync` | **PASS** | No file mutations |
| `npm run locale:sort` | **PASS** | No file mutations |
| `npm run locale:verify` | **PASS** | 67 subscription keys RU/EN parity |
| `npm test` | **PASS** | 67 vitest + 2 projectRoot node tests |
| `npm run build` | **PASS** | `tsc -b && vite build` exit 0 |
| Full Round 5 pixel compare | **Not run** | Independent visual gate; last R4 masked diff 26.8% |
| Commit / deploy / Docker | **Not performed** | per user |

---

## Round 4→5 style remediation verification

| Fix ID | Issue | Round 5 status | Evidence |
|--------|-------|----------------|----------|
| **R5-C1** | Header logo/title/bell ~21px too high | **✅** | `CabinetHeader.module.scss:11,20` — `translateY(21px)` on `.leading`/`.trailing`; header h stays 90px |
| **R5-C2** | Logo visible box vs ref | **✅** | `ViwaBrandLogo.module.scss:28-40` — clip 67×38, `translate(-9px) scale(1.18)` |
| **R5-C3** | Cards inset @342 | **✅** | `SubscriptionPage.module.scss:36-41` — `@media (max-width:360px)` `--viwa-cabinet-main-pad-x:9px` |
| **R5-C4** | Purple card borders | **✅** | `--viwa-cabinet-card-border: rgba(255,255,255,0.1)` on `pageShell:17` |
| **R5-C5** | Progress metric/bar/bottle tune | **✅** | `MonthlyProgressCard.module.scss` — metric 400, unit `top:5px`, bar `margin-top:6px`, bottle 43×86 |
| **R5-C6** | QR card size/copy/pad | **✅** | `QrPromoCard.module.scss` — 93px visual, pad 7/19/7/16, title 16/600, subtitle 11/400 #666 |
| **R5-C7** | Taste circles/labels | **✅** | `FavoriteTastesRow.module.scss` — gaps 24/25px, circles ~76px, name 9px/400, dose 8px/400 |
| **R5-C8** | Split price + period | **✅** | `PlanSummaryCard.tsx:46-48` + `.module.scss:53-68`; locales `planPeriodSuffix`; aria uses `planPerMonth` |
| **R5-C9** | Home active icon purple | **✅** | `BottomNav.module.scss:69-71` — `.linkActive .iconWrap` white |
| **Parent** | `titleRow` gap 18px | **✅** | `CabinetHeader.module.scss:23-26` — `gap: 18px` (was 14px in R2) |
| **R4-L1** | 2 prettier lint errors | **✅ RESOLVED** | Lint 0 errors; `BottomNav.tsx:153-155` formatted |

**Geometry (from R4 probe, preserved):** progress y98 h154, QR y262 h128, tastes y400 h148, plan h143, cardGaps [10,10,10], gapPlanNav 14, nav y715 — **22/22 PASS** per `fix-resolution.md`.

---

## Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Split plan price / period i18n | ✅ | Visual: `499 ₽` + `/ мес`; EN `/ mo`; modal/aria keeps `planPerMonth` |
| 14 medallion manifest + fallback | ✅ | `viwaAssets.test.ts` — 14 bottle + 14 medallion; 38 assets total |
| Exactly 3 slots (load/error/success) | ✅ | `buildFavoriteTasteSlots` + `FavoriteTastesRow.test.tsx` (4 cases) |
| Header transforms / clipping / safe-area | ✅ | translateY(21px); logo overflow clip; `env(safe-area-inset-top)` on header; nav bottom inset |
| 342×780 inner geometry | ✅ | Probe 22/22 PASS (R4 post-fix); card rhythm preserved |
| Nav semantics (single active, machine path) | ✅ | `Link` + `isCabinetHomePath`; `aria-current="page"`; stubs `aria-disabled`; FAB disabled |
| QR scan card + modal | ✅ | `QrPromoCard` → `BottomSheetModal`; `LoyaltyQrCode` 315px in scan sheet |
| Plan / billing modal | ✅ | SBP phase machine preserved; `PlanSummaryCard` opens subscribe sheet |
| Responsive 360/390/399/430 | ✅ | `max-width:360px` inset; `max-height:820px` pad tighten; no overflowX on shell |
| Accessibility / contrast / touch | ✅* | See Accessibility section; *decorative header controls carry-over |
| No client PUT favorite tastes | ✅ | `loyaltyModule.favorites.test.ts`; PUT removed from module |
| Legacy FLOW header hidden on shell | ✅ | `isViwaCabinetShellRoute` + `App.cabinet.test.tsx` |
| Locale RU/EN parity | ✅ | 67 keys verified; `planPeriodSuffix` in both catalogs |
| C1 `.env.production` gitignore | ✅ carry-over | `.gitignore:21` |

---

## Medallion manifest (14 keys)

| Check | Status | Evidence |
|-------|--------|----------|
| 14 medallion + 14 bottle assets | ✅ | `viwaAssets.test.ts:22-28` |
| All canonical keys covered | ✅ | cherry, blackberry-lime, coconut, cucumber, grapefruit, lemon, lime, lime-mint, orange, peach-mango, pomegranate-blueberry, raspberry, strawberry-lemongrass, watermelon |
| Cabinet uses medallions | ✅ | `getTasteMedallionImagePaths()` → `/tastes/medallions/{key}.webp\|png` |
| Landing unchanged (bottles) | ✅ | `getTasteImagePaths()` → `/tastes/{key}.webp\|png` |
| Unknown key fallback | ✅ | Conventional path + `onError` → placeholder glyph; unknown catalog → `favoritesUnknownKey` |
| On-disk deploy files (untracked) | ⏸ | 28 files ×2 trees (`viwa` + `.viwa-good`) — webp+png × 14 keys |

---

## Round 2/3/4 finding recheck

| ID | Prior finding | Round 5 status |
|----|---------------|----------------|
| **R2-A1** | Machine path nav aria/style mismatch | **✅ CLOSED** |
| **R2-P1** | No catalog cache unit test | **✅ CLOSED** — 3 tests pass |
| **R3-P1** | Plan–nav gap excessive | **✅ RESOLVED** — inner ref gap 14px |
| **R3-S1** | Taste radius 12 vs ref ~19 | **✅ INTENTIONAL** |
| **R4-L1** | Lint prettier errors | **✅ RESOLVED** |
| **R4-A1** | Header controls 36×36 decorative | **⚠️ OPEN (non-blocking)** — menu disabled; bell `role="img"` |
| **R4-P1** | Pixel masked diff | **⏸ OPEN → R5-P1** — 26.8% last run; not rerun |
| **R4-D1** | Untracked deploy assets | **⏸ OPEN → R5-D1** |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| — | — | **No Round 5 code blockers** |

---

## Release blockers (push / visual sign-off)

| ID | Area | Finding | Gate |
|----|------|---------|------|
| **R5-D1** | deploy | Untracked generated assets + new cabinet modules at commit: `public/assets/viwa/tastes/medallions/` (28 files), `public/assets/viwa/landing/` (12 files), mirror `.viwa-good/*`, all new `src/components/*` cabinet modules, utils/tests, `docs/agents/cabinet-top-tastes-rebuild/` | **Commit/deploy** — production 404 without staged assets |
| **R5-P1** | pixel | Full masked compare not rerun this round; last corrected inner @342×780 (R4): SSIM **0.7038**, similarity **0.7349**, masked diff **26.8%** (target ≤8%) | **Visual sign-off** |

---

## Noncritical findings (🟡)

| ID | Area | Finding |
|----|------|---------|
| **R5-A1** | a11y / touch | Header menu/bell 36×36px decorative — below `--viwa-touch-min` 44px (carry-over R4-A1); acceptable while disabled |
| **R5-S1** | styles | Orphan `.tierName` rule in `PlanSummaryCard.module.scss:70-75` (JSX removed R1) |
| **R5-S2** | styles | Taste dose label `0.5rem` (~8px) — reference fidelity; readability stress on 360 |
| **R5-T1** | tests | `QrPromoCard.test.tsx` does not assert two-line subtitle DOM |
| **R5-T2** | tests | No component test for unknown taste key → fallback glyph after catalog ready |
| **R5-T3** | tests | `App.cabinet.test.tsx` covers `/home` only, not `/m/:serial/home` shell hide |
| **R5-T4** | locale | `planPeriodSuffix` in catalogs + `subscriptionLocale.ts` but not in `REQUIRED_KEYS` of `locale-verify-subscription.mjs` — parity OK via full-key scan |
| **R5-N1** | carry-over | Decorative notification badge `"3"` in header (`aria-hidden`) |
| **R5-N2** | carry-over | Hardcoded `#ffffff` / `#666666` in QR card — reference fidelity |
| **R5-N3** | product | Home link on machine path navigates to `/home` (strips machine prefix) — intentional SPA choice |
| **R5-G1** | geometry | Logo visible x≈0 vs ref x18; title x241 vs ref x229 — within style gate tolerance per fix-resolution |

---

## Area summaries

### i18n split price period (R5-C8)

Plan card renders separate DOM spans: amount (`formatPriceRub` + literal ` ₽`) and period (`planPeriodSuffix`: RU `/ мес`, EN `/ mo`). Visual typography: amount ~36px/400 display, period 12px/400 uppercase muted. Screen reader label via `buildPlanAriaLabel` still uses combined `planPerMonth` template — correct for AT.

### Header transforms, clipping, safe-area

Fixed 90px header band; content optically lowered via `translateY(21px)` without growing layout. Logo uses overflow clip + horizontal scale trim. Safe-area: `calc(env(safe-area-inset-top) + 8px)` top padding. `titleRow` flex with **18px** gap between cabinet title and menu icon (final parent tune).

### 342 geometry & responsive

Card min-heights 154/128/148/143, 10px gap, 12px radius, plan–nav gap 14px preserved from R4 probe. `@media (max-width:360px)` reduces horizontal inset to 9px. `@media (max-height:820px)` tightens main pad-top. Outer `App.app` scrolls with `overflow-y: auto`; sticky nav + scroll-padding-bottom on `main`.

### Nav semantics

Five-slot grid: Home `Link` with `aria-current="page"` when pathname is `/home` or `*/home`; History/Awards/Profile as non-interactive stubs (`aria-disabled`, `title=navStub`); center FAB disabled button 48×48. Active home icon white; labels 400 weight uppercase.

### QR scan / modals

White QR promo card opens scan bottom sheet with large QR (315px), usage stats, subscription status. Plan card opens subscribe/billing sheet with level radio, SBP QR, poll phases. Both use `BottomSheetModal` with focus-visible on triggers.

### Accessibility, contrast, touch

| Pair | Ratio (approx) | Verdict |
|------|----------------|---------|
| `#f5f5f5` on `#0b0b0b` | ~18:1 | ✅ body/card text |
| `#a3a3a3` on `#0b0b0b` | ~7.5:1 | ✅ muted labels |
| `#666666` on `#ffffff` (QR subtitle) | ~5.7:1 | ✅ small uppercase |
| `#0a0a0a` on `#ffffff` (QR title) | ~19:1 | ✅ |
| Purple accent on `#000` (nav labels) | N/A | Labels use muted gray, not accent-on-black text |

Interactive targets: QR/plan cards full-width buttons; nav links `min-height: 44px`; FAB 48px; modal level rows 44px. Focus-visible outlines on QR, plan, nav links, enabled header menu pattern.

### Regressions scan

- No reintroduction of `updateFavoriteTastes` PUT.
- No dual active bottom-nav links.
- Catalog cache dedup/error-retry preserved.
- Machine serial shell route hides legacy FLOW header.
- Landing bottle API untouched.

---

## Untracked deploy assets (git status)

| Path | Files | Role |
|------|-------|------|
| `public/assets/viwa/tastes/medallions/` | 28 | Production medallion webp+png (14 keys) |
| `public/assets/.viwa-good/tastes/medallions/` | 28 | Good-manifest mirror |
| `public/assets/viwa/landing/` | 12 | Landing generated assets (shared manifest bump) |
| `public/assets/.viwa-good/landing/` | 12 | Good-manifest mirror |
| `src/components/CabinetHeader/` etc. | — | New cabinet UI modules (source) |
| `docs/agents/cabinet-top-tastes-rebuild/` | — | Agent session docs |

**Modified tracked:** manifests (`viwa` + `.viwa-good` + `src/data/*`), locales, cabinet page/components, `.gitignore`, `loyaltyModule.ts`, `viwaAssets.ts`.

---

## Sign-off matrix

| Gate | Round 5 |
|------|---------|
| Geometry @342×780 (probe) | **PASS** (22/22, R4 post-fix preserved) |
| Responsive structure | **PASS** |
| Functional code (slots/nav/modals/API) | **PASS** |
| Medallion mapping | **PASS** |
| Split price i18n | **PASS** |
| titleRow gap 18px | **PASS** |
| Unit tests | **PASS** (67) |
| Locale sync/sort/verify | **PASS** (67 keys) |
| Build | **PASS** |
| Lint | **PASS** (0 errors) |
| Pixel masked compare | **OPEN** (~26.8%) |
| Git staging (assets) | **OPEN** |

---

## Recommendation

**Approve Round 5 final cabinet code review** with `hasCriticalIssues: false`.

Before commit/deploy: stage all untracked medallion/landing assets with manifest triple-sync; rerun independent masked pixel compare @342×780 for visual sign-off (R5-P1).

Optional post-ship: add `planPeriodSuffix` to `REQUIRED_KEYS`; close R5-T1–T3 test gaps; remove orphan `.tierName` rule.

**Next:** Commit with staged assets + version bump; pixel browser gate for product sign-off.
