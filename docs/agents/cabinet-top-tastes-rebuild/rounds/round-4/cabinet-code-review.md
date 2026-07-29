# Code Review — Cabinet TOP-3 Rebuild (Round 4 of 5)

**Date:** 2026-07-29  
**Repo:** `viwa-client-web-app`  
**Scope:** Independent re-review after Round 4 inner-screen geometry correction + taste medallion integration  
**Reference:** Concept bento cabinet mock — inner crop **342×780** (outer 390×832, crop x=24..365, y=20..799)  
**Requirements:** `docs/agents/cabinet-top-tastes-rebuild/task-client-report.md`  
**Inputs:** `rounds/round-3/cabinet-code-review.md`, `rounds/round-3/fix-resolution.md`, `rounds/round-4/cabinet-geometry-probe-results.json`  
**Mode:** Read-only — no production edits, no commit/push/deploy

---

## Executive summary

Round 4 inner-screen geometry compression and medallion integration are **verified in current code and probe data**. Card min-heights (154 / 128 / 148 / 143), 10px card rhythm, 12px radius, safe-area insets, plan–nav gap **14px** (was ~85px excessive), and responsive structural checks at **399 / 360 / 390 / 430** all match `fix-resolution.md`. Fourteen taste medallions are mapped in manifest with conventional-path fallback; `FavoriteTastesRow` uses medallions while landing bottles stay on `getTasteImagePaths()`. Round 2 fixes **R2-A1** (machine-path active nav) and **R2-P1** (catalog cache tests) remain closed.

**hasCriticalIssues:** `false` for Round 4 code sign-off — no functional regressions, no broken modals/nav/slots/API contract.

**Release blockers (non-code-critical):** lint prettier (2 errors in cabinet diff), pixel masked-diff gate (~31.9% last corrected compare), untracked generated assets at commit.

---

## Verification commands (this round)

| Command | Result | Notes |
|---------|--------|-------|
| `npm run lint` | **FAIL** | 2 prettier errors in cabinet changeset; 23 pre-existing warnings elsewhere |
| `npm run locale:verify` | **PASS** | 67 subscription keys RU/EN parity |
| `npm test` | **PASS** | 67 vitest + 2 projectRoot node tests |
| `npm run build` | **PASS** | `tsc -b && vite build` exit 0 |

---

## Round 3→4 geometry verification

| Area | Status | Evidence |
|------|--------|----------|
| Progress card min-height 154px | ✅ | `MonthlyProgressCard.module.scss:7`; probe h=154, y=98 |
| QR card min-height 128px, visual 90×90 | ✅ | `QrPromoCard.module.scss:7,59-65`; probe h=128, qrVisual=90 |
| Taste card min-height 148px, circles ~74px | ✅ | `FavoriteTastesRow.module.scss:10,50-51`; probe h=148, circles 75.9 |
| Plan card min-height 143px, price ~36px | ✅ | `PlanSummaryCard.module.scss:5,45-50`; probe h=143, price 35.91px |
| Card gap 10px | ✅ | `--viwa-cabinet-gap: 10px`; probe cardGaps [10,10,10] |
| Card radius 12px (intentional, not 20) | ✅ | `--viwa-cabinet-card-radius: 12px`; probe cardRadii all 12 |
| Plan–nav gap ~13px (no overlap) | ✅ | probe gapPlanNav=14; plan bottom 701, nav y=715 |
| Header ~90px (not 150px void target) | ✅ | probe header h=90; title 10px/400 |
| Inner viewport 342×780 fit | ✅ | probe 20/20 PASS @342×780 |
| Responsive 399/360/390/430 | ✅ | probe responsive: 4 cards, no overflowX |
| Short-height 360×800 | ✅ | `@media (max-height: 820px)` tightens pad; scroll via `App.app` |

**Geometry probe:** `rounds/round-4/cabinet-geometry-probe-results.json` — **20/20 PASS**.

---

## Medallion manifest (14 keys)

| Check | Status | Evidence |
|-------|--------|----------|
| 14 medallion + 14 bottle assets | ✅ | `viwaAssets.test.ts` — manifest 38 assets total |
| All canonical keys covered | ✅ | cherry, blackberry-lime, coconut, cucumber, grapefruit, lemon, lime, lime-mint, orange, peach-mango, pomegranate-blueberry, raspberry, strawberry-lemongrass, watermelon |
| Cabinet uses medallions | ✅ | `getTasteMedallionImagePaths()` → `/tastes/medallions/{key}.webp\|png` |
| Landing unchanged (bottles) | ✅ | `getTasteImagePaths()` → `/tastes/{key}.webp\|png` |
| Unknown key fallback | ✅ | Conventional path + `onError` → placeholder glyph; unknown catalog key → `favoritesUnknownKey` label |
| Pixel fixture keys valid | ✅ | `cabinetPixelFixture.test.ts` — raspberry/lime/peach-mango in both maps; no `apricot` |

---

## Requirement checklist

| Requirement | Status | Notes |
|-------------|--------|-------|
| Exact card min-heights / rhythm | ✅ | See geometry table; tokens on `pageShell` inherited by modules |
| Safe-area (header + nav + scroll pad) | ✅ | `CabinetHeader` top inset; `BottomNav` bottom inset; `main` scroll-padding-bottom |
| 342×780 inner fit | ✅ | Probe PASS; methodology per `reference-inner-crop.json` |
| Responsive 360/390/399/430 | ✅ | No horizontal overflow; 4 cards visible structurally |
| No plan/nav overlap | ✅ | gapPlanNav 14px; sticky nav at y=715 |
| 14 medallion manifest + fallback | ✅ | Tests + `FavoriteTastesRow` medallion img paths |
| Exactly 3 slots (load/error/success) | ✅ | `buildFavoriteTasteSlots` + `FavoriteTastesRow.test.tsx` (4 cases) |
| Machine path active nav | ✅ | R2-A1 closed: `Link` + `isCabinetHomePath`; `BottomNav.test.tsx` |
| Catalog cache tests | ✅ | R2-P1 closed: `publicTastesCatalogCache.test.ts` (3 cases) |
| QR modal | ✅ | `QrPromoCard` → `BottomSheetModal` scan flow |
| Plan / billing modal | ✅ | `PlanSummaryCard` → SBP phase machine preserved |
| No client PUT favorite tastes | ✅ | `loyaltyModule.favorites.test.ts`; PUT removed from module |
| Single active nav | ✅ | Home only `aria-current="page"`; stubs disabled |
| C1 `.env.production` gitignore | ✅ carry-over | `.gitignore:21` |
| Locale RU/EN parity | ✅ | 67 keys verified |
| Legacy FLOW header hidden on shell | ✅ | `isViwaCabinetShellRoute` + `App.cabinet.test.tsx` |

---

## Round 2/3 finding recheck

| ID | Prior finding | Round 4 status |
|----|---------------|----------------|
| **R2-A1** | Machine path nav aria/style mismatch | **✅ CLOSED** — unchanged since R3 fix |
| **R2-P1** | No catalog cache unit test | **✅ CLOSED** — 3 tests pass |
| **R3-P1** | Plan–nav gap excessive @399×832 | **✅ RESOLVED** — corrected inner ref: gap 14px @342×780; prior 101px was wrong viewport methodology |
| **R3-S1** | Taste radius 12 vs ref ~19 | **✅ INTENTIONAL** — kept 12px per R4 fix-resolution |
| **R3-A1** | Header controls 36×36 | **⚠️ OPEN (non-blocking)** — decorative disabled menu/bell |

---

## Critical findings (🔴)

| ID | Area | Finding |
|----|------|---------|
| — | — | **No Round 4 code blockers** |

---

## Release blockers (push / visual sign-off)

| ID | Area | Finding | Gate |
|----|------|---------|------|
| **R4-L1** | lint | 2 prettier/prettier errors in cabinet diff: `BottomNav.tsx:153` (`.filter(Boolean)` wrap), `viwaAssets.test.ts:2` (import formatting) | **Push** — AGENTS requires 0 lint errors |
| **R4-P1** | pixel | Full masked compare not rerun; last corrected inner @342×780: similarity 0.6339, diff **31.9%** (target ≤8%) | **Visual sign-off** |
| **R4-D1** | deploy | Untracked: `public/assets/viwa/tastes/medallions/*`, `public/assets/viwa/landing/*`, new cabinet components, `docs/agents/cabinet-top-tastes-rebuild/` | **Commit/deploy** |

---

## Noncritical findings (🟡)

| ID | Area | Finding |
|----|------|---------|
| **R4-A1** | a11y / touch | Header menu/bell 36×36px decorative — below `--viwa-touch-min` 44px (carry-over R3-A1) |
| **R4-S1** | styles | Orphan `.tierName` rule in `PlanSummaryCard.module.scss:53-58` (JSX removed R1) |
| **R4-S2** | styles | Taste name label `0.5rem` (~8px) — reference fidelity; may stress readability on 360 |
| **R4-T1** | tests | `QrPromoCard.test.tsx` does not assert two-line subtitle DOM structure |
| **R4-T2** | tests | No component test for unknown taste key → fallback glyph after catalog ready |
| **R4-T3** | tests | `App.cabinet.test.tsx` covers `/home` only, not `/m/:serial/home` shell hide |
| **R4-N1** | carry-over | Decorative notification badge `"3"` in header |
| **R4-N2** | carry-over | Hardcoded `#ffffff` / `#333333` in QR card — reference fidelity |
| **R4-N3** | product | Home link on machine path navigates to `/home` (strips machine prefix) — intentional SPA choice |

---

## Area summaries

### Inner-screen geometry & rhythm

Round 4 closes the prior false-positive plan–nav gap (101px @399×832 outer). With corrected inner crop, plan bottom **701** and nav **715** yield **14px** gap — aligned with reference ~13px. Card stack compresses via explicit min-heights and 10px gap without clipping plan above sticky nav. Metric typography reaches ~60px; plan price ~36px per probe.

### Safe-area & scroll

`pageShell` is flex column; `BottomNav` is `sticky` + `margin-top: auto`. Header respects `env(safe-area-inset-top)`. Nav uses `max(env(safe-area-inset-bottom), 0.375rem)`. Outer `App.app` scrolls vertically with `overflow-y: auto` — plan card accessible on short viewports.

### Medallions vs bottles

Manifest split is clean: `category: taste-medallion` with `cabinetRole: favorite-circle` for cabinet circles; `category: taste` for landing bottles. `FavoriteTastesRow` loads medallion paths; image failure and unknown catalog keys degrade to glyph/label without breaking 3-slot layout.

### Modals & billing

QR scan and plan/subscribe modals unchanged in wiring. Plan card shows price-only summary (tier name in aria-label). Billing phase machine (`init` → `await_payment` → `await_subscription` → `done`) intact in `SubscriptionPage`.

### Accessibility & contrast

- Text `#f5f5f5` / muted `#a3a3a3` on `#0b0b0b` — AA per token comments.
- QR card `#333` on `#fff` — AA for small uppercase copy.
- Interactive cards (QR, plan) and nav links meet 44px min-height; FAB 48px disabled stub.
- Focus-visible outlines on QR/plan buttons and nav links.

### Regressions scan

- No reintroduction of `updateFavoriteTastes` PUT.
- No dual active bottom-nav links.
- Catalog cache dedup/error-retry behavior preserved.
- Machine serial shell route still hides legacy FLOW header.
- Landing bottle API untouched.

---

## Changed files in working tree (cabinet scope)

**Modified:** `SubscriptionPage.*`, `App.*`, `BottomNav.*`, `viwaAssets.ts`, manifests, locales, `loyaltyModule.ts`, `viwa-tokens.css`, `.gitignore`

**New (untracked):** `CabinetHeader/`, `FavoriteTastesRow/`, `MonthlyProgressCard/`, `PlanSummaryCard/`, `QrPromoCard/`, utils/tests, `public/assets/viwa/tastes/medallions/`, agent docs

---

## Sign-off matrix

| Gate | Round 4 |
|------|---------|
| Geometry @342×780 | **PASS** (probe 20/20) |
| Responsive structure | **PASS** |
| Functional code (slots/nav/modals/API) | **PASS** |
| Medallion mapping | **PASS** |
| Unit tests | **PASS** (67) |
| Locale | **PASS** (67 keys) |
| Build | **PASS** |
| Lint | **FAIL** (2 prettier errors) |
| Pixel masked compare | **OPEN** (~31.9%) |
| Git staging (assets) | **OPEN** |

---

## Recommendation

**Approve Round 4 code review** with `hasCriticalIssues: false`. Before push: run `npx prettier --write` on `BottomNav.tsx` and `viwaAssets.test.ts` (or `npm run lint -- --fix`). Stage medallion/landing generated assets with manifest triple-sync at commit. Round 5 should rerun corrected inner masked pixel compare and optionally close R4-T1–T3 test gaps.

**Next:** Round 5 final code review + pixel browser gate; lint autofix; asset git staging.
