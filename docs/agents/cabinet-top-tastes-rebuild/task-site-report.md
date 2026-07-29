# task-site-report — viwa-site bento landing rewrite

**Session:** `cabinet-top-tastes-rebuild`  
**Repo:** `c:\wiva\viwa-site`  
**Reference:** 897×867 PNG (`image-6858bf64-d4a3-4c50-9f98-d15528af69cd.png`)  
**Date:** 2026-07-29

## Done

### Initial rebuild
- Full landing rewrite: edge-to-edge black bento grid (`viwa-board`), 60px header, 40/30/30 hero + 2×2 bento, feature strip, bottom science/station duo.
- Hero-only logo stretch via `.viwa-logo__picture--hero` + `.viwa-logo__img--hero { object-fit: fill }`; header/footer logos unchanged; SVG path/viewBox untouched.
- Deep accent `#5C2DA8` in `css/viwa-tokens.css`; 1px `#333` cell borders; no cabinet aside; no rounded marketing cards above fold.
- Below-fold preserved: `#flavors` / `#viwa-flavors-grid`, `#viwa-tiers` / `#viwa-tiers-list`, `#serial` / `#viwa-serial-input`, `[data-viwa-cta]`; live API + error/retry; `useMockApi: false`.
- Extended `scripts/process-viwa-assets.py`: 6 landing sources → `assets/generated/landing/*` (PNG+WebP); manifest **24 assets** (14 tastes + logo + hero×2 + cabinet + landing×6).

### Round 1 fixes (2026-07-29)
- **C1:** Science body exact reference copy + `max-width: 22ch` line breaks; hook `data-viwa-ref-copy="science-exact-v1"`.
- **C2:** Header CTA `min-height: 44px` at 430–767px (tablet band preserved).
- **Header geometry:** `height: 60px` border-box (was 61px with border outside min-height).
- **Hero logo box:** clamp toward ~210px @897 (`23.4vw`, max 210px); hero layout eyebrow / flex logo / bottom copy block.
- **Typography:** nav gaps/tracking, H1 `4.9vw`, bento overlays, feature strip, bottom section tuned per pixel report.
- **A11y/perf (low-risk):** `<main id="main">`, menu `aria-modal` + focus handoff, bento eager loading removed (bottom row lazy), flash icon accent aligned.
- **C3:** landing generated files remain untracked until final commit; static gate confirms on-disk assets.

### Round 2 fixes (2026-07-29)
- **Canonical geometry:** header **68px**; hero row **531px**; columns **36.57 / 28.43 / 35**; bento rows **228 / 303**; feature **66px**; bottom **202px** quad **bubble | science | station | rhythm**.
- **Hero:** logo box ~**275×241** (277:243 aspect); condensed 2-line H1; desktop CTA **197×36**; header logo **57×29** stretch; nav **9px** regular muted; desktop header CTA **125×30** (44px touch mobile only).
- **Typography:** bento indices ~11px; feature two-level normal weight; bottom headings ~16px condensed, body ~9px.
- **Regressions:** flash icon no `invert`; Escape/`setMenu` guarded when menu closed; fonts via HTML link/preload (no CSS `@import`); LCP high priority hero logo only.
- **Docs:** README → 24-asset bento concept.

## Decisions

- Nav IA: О продукте → `#product`, Вкусы → `#flavors`, Наука → `#science`, Локации → `#serial`, Кабинет → `data-viwa-cta="auth"`.
- C3 staging deferred to final commit batch with full asset tree.
- Round 3 browser pixel QA @897 and mobile 360/390/430 (Round 2 code fixes applied; pixel rerun deferred).

## Verification

| Check | Result |
|-------|--------|
| `python scripts/process-viwa-assets.py` (initial) | PASS — 24 assets |
| `verify-assets-idempotent.ps1` (initial) | PASS 2× |
| Round 1 `static-regression-check.ps1` | **PASS** |
| Round 2 `static-regression-check.ps1` | **PASS** |
| Round 1/2 processor | skipped (no asset code change) |
| Landing assets on disk | 12 files in `assets/generated/landing/` |
| `site-version.txt` | not bumped |

## Git facts

- **repo:** `c:\wiva\viwa-site`
- **branch:** `master`
- **commit:** not committed (per user request)
- **Round 1 touched:** `index.html`, `css/viwa-landing.css`, `css/viwa-tokens.css`, `icons/flash.svg`, `scripts/static-regression-check.ps1`
- **Round 2 touched:** `index.html`, `css/viwa-landing.css`, `css/viwa-tokens.css`, `scripts/static-regression-check.ps1`, `README.md`

## Risks / next

- Round 3 masked pixel QA @897 and mobile 360/390/430.
- Stage `assets/generated/landing/*` at final commit (C3).
- Bump `site-version.txt` at task completion / deploy.

**Round 1 resolution detail:** `rounds/round-1/landing-fix-resolution.md`  
**Round 2 resolution detail:** `rounds/round-2/fix-resolution.md`
