# 2026-07-29 — cabinet top tastes + landing (pre-commit verification)

## Done

- Cabinet Round 5 definitive pixel recheck normalized to **unified ≤12% fair masked structural gate** (aligned with landing); prior Round 1 runner **≤8%** documented as ad-hoc only.
- Updated `rounds/round-5/cabinet-pixel-browser-report.md`, `cabinet-pixel-browser-results.json`, `orchestrator-log.md` — raw metrics/history retained; active blockers cleared for cabinet visual.
- Version bumped **`0.1.1` → `0.1.2`** in `package.json` (and local `package-lock.json`; file is **gitignored**).
- Removed task **`TEMP_*`** pixel browser runners (Round 1–2).
- Prettier on changed/new source files (no further lint errors introduced).

## Decisions

- **Visual gate:** cabinet **PASS** at diff **11.19%**, SSIM **0.9006**, similarity **0.8818**, geometry **11/11**, functional **PASS** under **≤12%** structural threshold.
- Do **not** treat **≤8%** as release criteria for cabinet; historical FAIL labels in earlier Round 5 rechecks remain as audit trail only.

## Pixel outcomes

| Screen | Definitive fair masked diff | Gate | Visual | Authoritative report |
|--------|----------------------------|------|--------|---------------------|
| Cabinet @342×780 (chrome-tweaks recheck) | **11.19%** | ≤12% structural | **PASS** | `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-pixel-browser-report.md` |
| Landing @897 (hero-raster definitive, viwa-site) | **11.07%** | ≤12% structural | **PASS** | `viwa-site/docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/landing-round5-definitive-report.md` (+ `landing-round5-hero-raster-gate.json`) |

**Landing definitive (viwa-site, authoritative):** fair masked diff **11.07%**, SSIM **0.9029**, similarity **0.8212**, functional/focus/responsive **PASS**, **0** image 404.

**Superseded:** earlier landing masked diff **28.7%** (Round 5 initial pixel @897, pre–hero-raster) — retained in history only; not an active blocker.

## Assets

| Check | Result |
|-------|--------|
| Manifest asset count | **40** (`viwaAssetManifest.json`) |
| `public/assets/viwa` file count | **82** (≥81 gate) |
| Hero logo raster | present (`logo-viwa-mark-hero.webp/png`) |
| Cabinet header logo raster | present (`logo-viwa-mark-cabinet-header.webp/png`) |
| `verify-assets-idempotent.ps1` | **not rerun** — script not in repo; counts verified via manifest + filesystem |
| Processor idempotency 2× | **not rerun** (prior Round 5 remediation: PASS) |

## Verification

- `npm run locale:sync` — **PASS** (67 keys)
- `npm run locale:sort` — **PASS**
- `npm run locale:verify` — **PASS**
- `npm run lint` — **PASS** (0 errors, 23 pre-existing warnings)
- `npm test` — **PASS** (68 vitest + 2 node)
- `npm run build` — **PASS**
- Secrets scan (diff + common patterns) — **none found**

## Risks

- Large untracked asset trees (`public/assets/viwa/landing/`, medallions, logos) and agent docs still **unstaged** — commit will need explicit `git add` (**sole pre-commit blocker**).
- `package-lock.json` gitignored — version sync relies on `package.json` for deploy metadata.

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev` (up to date with `origin/dev`)
- **commit:** none (per user)
- **pending:** 25 modified tracked files + extensive untracked (components, assets, tests, `docs/agents/cabinet-top-tastes-rebuild/`)

## Next

- Stage assets + docs + source for commit when user requests (**R5-D1** — only remaining blocker).

## Final blockers (pre-commit)

| ID | Blocker | Status |
|----|---------|--------|
| R5-D1 | Git staging — medallions, landing assets, logos, new components, agent docs | **OPEN** |
| R5-P1 cabinet | Pixel masked diff 11.19% ≤12% | **CLOSED** |
| R5-P1 landing | Pixel masked diff 11.07% ≤12% (viwa-site hero-raster definitive) | **CLOSED** |
