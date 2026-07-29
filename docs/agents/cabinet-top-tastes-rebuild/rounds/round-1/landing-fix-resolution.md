# Landing Round 1 — fix resolution

**Date:** 2026-07-29  
**Repo:** `c:\wiva\viwa-site`  
**Inputs:** `landing-code-review.md`, `landing-pixel-browser-report.md`, `landing-pixel-browser-results.json`

## Critical fixes

| ID | Issue | Resolution | Status |
|----|-------|------------|--------|
| C1 | Science body copy ≠ reference | Exact text in `index.html` + `data-viwa-ref-copy="science-exact-v1"` hook; line breaks via `.viwa-bottom__body { max-width: 22ch }` | **fixed** |
| C2 | Header CTA `min-height: 36px` at 430–767px | `.viwa-header__cta { min-height: var(--viwa-touch-min) }`; tablet-specific display rule 430–767 | **fixed** |
| C3 | Untracked `assets/generated/landing/*` | **Deferred to final commit** (per task policy). Processor/static gate confirm 12 files on disk + manifest entries; not staged in this round | **deferred** |

## Pixel-driven tuning (Round 1)

| Deviation | Expected | Fix applied |
|-----------|----------|-------------|
| Header height 61px | 60px incl. border | `.viwa-header { height: 60px }` border-box; inner `height: 100%` |
| Hero logo bbox 251.2px | ~210px @897 | `.viwa-logo__picture--hero { height: clamp(130px, 23.4vw, 210px); width: min(76%, 228px) }` |
| Typography / vertical rhythm | Reference board | Hero split into eyebrow / flex logo / copy block; H1 `4.9vw`; nav gap `clamp(1rem, 2.2vw, 1.75rem)` + tracking `0.12em`; bento overlay sizes/tracking; feature/bottom type tuned |
| Above-fold overflow | none | `.viwa-page`, `.viwa-board { overflow-x: hidden }` |

## Noncritical (low-risk) addressed

| ID | Fix |
|----|-----|
| N1–N2 | `<main id="main">` wraps board + below-fold; skip link target preserved |
| N5 | Menu `role="dialog"`, `aria-modal`, focus to close on open / return to hamburger on close |
| N10 | `icons/flash.svg` accent `#5C2DA8` |
| N13 | Bento overlay `text-shadow` on dark cells |
| N14 | `--viwa-text-on-light` token replaces hardcoded `#111` |
| N22–N24 | Removed `loading="eager"` from bento; bottom row `loading="lazy"`; hero logo keeps `fetchpriority="high"` |

## Not in scope (Round 2+)

- Full masked pixel re-run (separate agent)
- C3 git staging / `.gitignore` for staging dirs
- README refresh (N30)
- Fonts `@import` → `<link>` (N21–N22)
- Dev-facing flavors/tiers subcopy removal (N6)

## Verification

| Check | Result |
|-------|--------|
| `process-viwa-assets.py` | **skipped** (no asset code changes) |
| `static-regression-check.ps1` | **PASS** |
| Landing assets on disk (12 files) | **present** |
| `site-version.txt` | not bumped |

## Open for Round 2

- Re-measure hero logo bbox @897 (target ~210px)
- Header height @897 (target 60px)
- Masked SSIM / structural diff vs reference
- Stage `assets/generated/landing/*` at final commit
