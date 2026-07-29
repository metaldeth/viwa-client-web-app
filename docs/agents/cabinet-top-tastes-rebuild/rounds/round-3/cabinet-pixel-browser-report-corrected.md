# Cabinet pixel+browser report — Round 3 (CORRECTED)

> **Supersedes** `cabinet-pixel-browser-report.md` from 2026-07-29T18:01Z — that run used **invalid methodology** (399×832 browser viewport vs 390×832 outer mockup with bezel). Prior metrics/geometry findings for header 150px and plan–nav gap 101px are **void**.

**Date:** 2026-07-29T18:09:32.796Z
**Base URL:** http://127.0.0.1:5173
**Reference:** `round-2/pixel-reference.png` (outer 390×832)
**Inner crop:** x=24..365, y=20..799 → **342×780** CSS viewport
**Pixel:** **FAIL** | **Functional:** **PASS** | **Overall:** **FAIL**

## Inner crop rationale

- Outer PNG is 390×832 (includes physical phone bezel; prior runs wrongly used 390×832 as CSS viewport).
- Left/right screen edge from column median luminance in y=120..700: raw 0..389, refined 24..365.
- Right bezel begins ~x=390 where column median jumps (e.g. x=375 med≈125 on this asset).
- Top inset y=20 skips status bar / Dynamic Island chrome.
- Bottom y=799 is last content row before home-indicator grey lift (~y=807). Inner height clamped to 780px.
- CSS viewport for capture must match crop 342×780, not outer 390×832.

## Metrics (342×780, mask: QR center + fruit circles only)

| Metric | Corrected R3 | Flawed R3 | Δ |
|--------|--------------|-----------|---|
| Masked similarity | 0.6339 | 0.6423 | -0.0084 |
| SSIM | 0.4181 | 0.451 | -0.0329 |
| Masked diff ratio | 31.92% | 31.82% | 0.1pp |
| RMSE | 87.8 | 85.28 | 2.52 |

## Geometry (inner viewport)

| Element | Current | Reference inner |
|---------|---------|-----------------|
| header.h | 90 | — |
| header.y | 0 | 0 |
| progressCard.h | 120 | — |
| qrCard.h | 140 | 37 |
| tasteSection.r | 12 | 19 |
| planCard.y | 522.4 | — |
| bottomNav.y | 715 | 763 |
| gapPlanNav | 84.6 | 136 |
| sideInsetLeft | 16 | ~16 |

## Geometry validation

- ✅ Side inset L: 16px
- ✅ Header height ~90px: 90px
- ✅ Progress bar 780/1000
- ✅ 3 taste circle slots measured
- ✅ Plan card bottom (630.4px) above nav top (715px)
- ✅ Plan–nav gap 84.6px (≤ ref inner 136px — not excessive vs reference)
- ✅ Nav top y≈715 on 780h viewport (expected ~715 on 780h)
- ✅ No horizontal overflow
- ✅ Taste card radius 12px (Δ12=0, Δ20=8; ref inner≈19)

## Top deviations (corrected)

### 1. taste card shell radius
- **Expected:** ref inner≈19px
- **Actual:** 12px (closer to 12px)
- **Fix:** FavoriteTastesRow.module.scss — radius token if ref confirms 20px

### 2. global layout (dynamic mask only)
- **Expected:** ≤8% masked diff
- **Actual:** 31.9%
- **Fix:** Typography/QR copy line-breaks, progress card spacing, logo/title positions

### 3. INVALID prior plan–nav gap @399×832
- **Expected:** content-normalized inner viewport only
- **Actual:** flawed report claimed 101.3px — artifact of taller non-reference viewport
- **Fix:** Use inner crop geometry only (superseded)

## Functional smoke

- ✅ Catalog loading: 3 slots visible before catalog resolves
- ✅ Catalog success: exactly 3 taste slots
- ✅ Catalog error: 3 slots still visible
- ✅ Catalog error: status message shown
- ✅ Placeholder case (1 favorite → 2 placeholders)
- ✅ No favorite PUT
- ✅ No FLOW header
- ✅ No horizontal scroll
- ✅ Single active bottom-nav item on /home (aria-current=page)
- ✅ QR modal opens
- ✅ Plan opens billing modal
- ✅ Bottom nav SPA (no reload)
- ✅ Keyboard focus: BUTTON
- ✅ Machine path /m/VIWA-TEST-001/home: single aria-current=page
- ✅ Machine path: 3 taste slots

## Responsive (functional only — NOT pixel targets)

- `cabinet-functional-399x832.png`: overflow=no, inset=16px
- `cabinet-responsive-360x800.png`: overflow=no, inset=16px
- `cabinet-responsive-390x844.png`: overflow=no, inset=16px
- `cabinet-responsive-430x932.png`: overflow=no, inset=16px

## Invalid superseded artifacts

- `cabinet-pixel-reference-aligned-399x832.png` — flawed outer-viewport compare
- `cabinet-actual-399x832.png` — flawed outer-viewport compare
- `cabinet-diff-399x832-masked.png` — flawed outer-viewport compare
- `cabinet-overlay-399x832.png` — flawed outer-viewport compare
- `cabinet-pixel-browser-report.md (2026-07-29T18:01Z)` — flawed outer-viewport compare
- `cabinet-pixel-browser-results.json (2026-07-29T18:01Z)` — flawed outer-viewport compare

## Corrected artifacts

- `reference-inner-crop.json`
- `cabinet-pixel-reference-inner-crop.png`
- `cabinet-actual-inner-342x780.png`
- `cabinet-diff-inner-342x780-masked.png`
- `cabinet-pixel-browser-report-corrected.md`
- `cabinet-pixel-browser-results-corrected.json`
- `cabinet-functional-399x832.png`
- `cabinet-responsive-360x800.png`
- `cabinet-responsive-390x844.png`
- `cabinet-responsive-430x932.png`