# Round 3 → Round 4 fix resolution — viwa-site landing

**Date:** 2026-07-29  
**Sources:** `landing-pixel-browser-report.md`, direct image inspection @897×867, geometry probe

## Fixes applied

| ID | Issue | Resolution |
|----|-------|------------|
| R3-G1 | Board columns drifted (bento 50/50 → x612) | Board `minmax(0, 36.57%) minmax(0, 28.43%) minmax(0, 35%)`; bento inner `28.43fr / 35fr`; `min-width:0` + overflow on grid children |
| R3-G2 | Hero logo visible ~250×222 @ y135 | Hero picture **277×243** @ x27 y≈118; CSS scale compensates SVG whitespace; desktop fixed width (no 92% cap) |
| R3-G3 | Hero title 32px bold, 3 lines | **44px** condensed weight **400**, 2 lines (`Вкус` / `в точной дозе` nbsp phrase), uppercase via CSS |
| R3-G4 | Hero body ~11px | **14px** (`0.875rem`) muted subtitle |
| R3-G5 | Header logo visible ~33×29 | Header picture **54×29** with scale transform on 277×243 SVG asset |
| R3-G6 | Header CTA x756 + wrong purple | CTA **x747..872** (`padding-right:25px`); accent **#4A247D** (hover #593591, active #3F2971) |
| R3-G7 | Bento/bottom typography small/bold | Labels 10px regular; bottom title 18px weight 400; body 11px; flavor strong weight 400 |
| R3-S4 | Bottom strip link touch <44px mobile | Mobile-only `min-height:44px` on science/rhythm links; desktop keeps compact row |
| R3-F3 | Escape test false positive | Browser gate now checks **focus unchanged** on second Escape (retain trigger focus after close is OK) |
| — | Vertical geometry 68/531/66/202 | **Preserved** — no revert to 40/30/30 |
| — | Bottom quad boundaries | **Untouched** (~0/199/426/718) — within 1px of reference |
| — | Serial/API/LCP | **Preserved** — no JS flow changes |

## Verification

| Check | Result |
|-------|--------|
| `static-regression-check.ps1` | **PASS** (updated hooks: minmax cols, accent #4A247D, hero 277×243, title phrase) |
| Geometry probe @897 (Playwright) | Board cols **328 / 255 / 314**; bento cells **328×255**, **583×314**; header logo **54×29@27**; CTA **747×125**; hero logo **277×243@27,117.5**; title **44px/400**; subtitle **14px**; accent **rgb(74,36,125)** |
| Full Round 4 pixel compare | **Not run** (independent gate) |
| Commit / deploy / Docker | **Not performed** |

## Remaining risks

- Hero logo vertical position y≈117.5 vs ref y119 (~1.5px) — acceptable; title/subtitle stack may need Round 4 pixel tune.
- Feature strip y=600 vs ref y599 (1px border rounding).
- Bottom strip y=666 vs ref y665 (1px).
- Condensed face depends on system **Arial Narrow** — minor cross-OS variance.
- SVG whitespace compensated via CSS scale, not viewBox trim — safe but asset-tied.
- C3 landing generated assets still untracked until final commit.

---

## Cabinet taste medallions — client integration (2026-07-29)

| Step | Result |
|------|--------|
| Source mapping | `taste-medallion-{key}.png` ×14 in `C:\Users\metal\.cursor\projects\c-wiva\assets` |
| Pipeline | `process-viwa-assets.py` → `tastes/medallions/{key}.webp/png` @ **180×180**; category `taste-medallion`, `cabinetRole: favorite-circle` |
| Manifest | **38 assets** total (14 bottle + **14 medallion** + logo/hero/cabinet/landing) |
| Client mapping | `getTasteMedallionImagePaths()` in `viwaAssets.ts`; `FavoriteTastesRow` uses medallions; landing keeps `getTasteImagePaths()` bottles |
| Fallback | Unknown catalog keys → placeholder glyph; missing image → `onError` glyph; conventional path fallback without base64/external URL |
| Idempotency gate | **PASS** 2× (`verify-assets-idempotent.ps1`); logo SVG hash unchanged |
| Static regression | **PASS** |
| Tests | **67 vitest PASS** (+5 `viwaAssets`, +1 `FavoriteTastesRow` medallion path, updated `cabinetPixelFixture`) |
| Build | **PASS** (`npm run build`) |
| Commit / deploy / Docker | **Not performed** |

### Medallion output sizes (optimized WebP ~3.4–6.9 KB, PNG ~37–49 KB @180px)

All 14 keys: cherry, blackberry-lime, coconut, cucumber, grapefruit, lemon, lime, lime-mint, orange, peach-mango, pomegranate-blueberry, raspberry, strawberry-lemongrass, watermelon.

### QA notes

- **Raspberry** source has visible openings in fruit cross-section — accepted for this iteration (same as generation brief).
- Circular CSS crop (`border-radius: 50%`, `object-fit: cover`) hides square corners; cabinet geometry unchanged.

### Changed / generated (medallion scope)

**Scripts:** `viwa-site/scripts/process-viwa-assets.py`, `verify-assets-idempotent.ps1`, `static-regression-check.ps1`

**Client code:** `src/utils/viwaAssets.ts`, `src/utils/viwaAssets.test.ts`, `src/components/FavoriteTastesRow/FavoriteTastesRow.tsx`, `FavoriteTastesRow.test.tsx`, `src/constants/cabinetPixelFixture.test.ts`

**Generated assets:** `public/assets/viwa/tastes/medallions/*` (28 files), synced `manifest.json` triple (`site` / `public` / `src/data/viwaAssetManifest.json`)

---

## Cabinet Round 3 → Round 4 geometry/typography (2026-07-29)

**Reference:** `round-2/pixel-reference.png` outer 390×832; inner crop x=24..365, y=20..799 → **342×780**.  
**Prior report correction:** ref plan card outer y579..722 → inner y559..702; nav outer y735 → inner y715; true plan–nav gap **~13px** (not 136px). Prior excessive blank was **~85px** (plan bottom y630 vs nav y715).

### Fixes applied

| ID | Issue (R3 @342×780) | Resolution |
|----|---------------------|------------|
| R4-CG1 | Progress y90 h120; metric ~46px | `main` pad-top **10px**; card `min-height:154px`; metric **clamp(2.75rem, 17.5vw, 3.75rem)** → ~60px @342 |
| R4-CG2 | QR y220 h140; QR 96px | Card `min-height:128px`, pad **16px**; QR **90px**; wrap 90×90 |
| R4-CG3 | Taste y371 h140; circles ~68px | `min-height:148px`; circles **clamp(68px, 21.6vw, 74px)**; compact labels |
| R4-CG4 | Plan y523 h107; gapPlanNav **85px** | `min-height:143px`; price **clamp(1.75rem, 10.5vw, 2.25rem)**; benefits gap **4px** |
| R4-CG5 | Header title 13px/600 crowded | Title **10px/400**, `white-space:nowrap`; safe-area env **preserved** |
| R4-CG6 | Logo visual whitespace | Header logo **72×38** + `scale(1.12,1)` transform-origin left |
| R4-CG7 | Card gap 12px | `--viwa-cabinet-gap:10px` |
| — | Global radius 20 (void) | **Kept 12px** on all card shells |
| — | Header 150px (void) | **Kept ~90px** header; no notch hardcode |
| — | Medallion integration / nav/cache tests | **Preserved** — no telemetry/asset-pipeline edits |

### Measured geometry @342×780 (probe after `document.fonts.ready`)

| Element | R3 actual | R4 actual | Reference target | Δ vs target |
|---------|-----------|-----------|------------------|-------------|
| progressCard | y90 h120 | **y98 h154** | y100 h154 | y −2, h ✓ |
| qrCard | y220 h140 | **y262 h128** | y264 h128 | y −2, h ✓ |
| tasteSection | y371 h142 | **y400 h148** | y401 h148 | y −1, h ✓ |
| planCard | y522 h108 | **y558 h143** | y559 h143 | y −1, h ✓ |
| plan bottom | 630 | **701** | ~702 | −1px |
| bottomNav | y715 | **y715** | y715 | ✓ |
| gapPlanNav | **84.6** | **14** | ~13 | was ~85px excessive → fixed |
| cardGaps | ~10–12 | **[10,10,10]** | ~10 | ✓ |
| metric height | ~46 | **59.8** | ~60 | ✓ |
| price font | ~22 | **35.91px** | ~36 | ✓ |
| qrVisual | 96 | **90** | ~90 | ✓ |
| tasteCircles | ~68 | **75.9** | ~74 | +2px (within tol) |
| cardRadii | 12 | **[12,12,12,12]** | ~12 | ✓ |
| header title | 13px/600 | **10px/400** | ~10px regular | ✓ |

### Verification

| Check | Result |
|-------|--------|
| `npm test` | **67 PASS** (machine path nav + catalog cache + medallion) |
| `npm run build` | **PASS** |
| Geometry probe @342×780 | **20/20 PASS** — `round-4/cabinet-geometry-probe-results.json` |
| Responsive 399/360/390/430 | **PASS** — no overflow, 4 cards, inset 16px |
| Full Round 4 pixel compare | **Not run** |
| Commit / deploy / Docker | **Not performed** |

### Changed files (cabinet geometry scope)

- `src/pages/SubscriptionPage.module.scss` — gap 10px, main pad-top 10px
- `src/components/MonthlyProgressCard/MonthlyProgressCard.module.scss` — min-height 154, metric ~60px
- `src/components/QrPromoCard/QrPromoCard.module.scss` + `.tsx` — min-height 128, QR 90px
- `src/components/FavoriteTastesRow/FavoriteTastesRow.module.scss` — min-height 148, circles ~74px
- `src/components/PlanSummaryCard/PlanSummaryCard.module.scss` — min-height 143, price ~36px
- `src/components/CabinetHeader/CabinetHeader.module.scss` — title 10px/400
- `src/components/ViwaBrandLogo/ViwaBrandLogo.module.scss` — header logo scale

## Changed files

- `viwa-site/css/viwa-tokens.css`
- `viwa-site/css/viwa-landing.css`
- `viwa-site/index.html`
- `viwa-site/scripts/static-regression-check.ps1`
- `rounds/round-3/TEMP_landing_pixel_browser.mjs` (Escape expectation only)
