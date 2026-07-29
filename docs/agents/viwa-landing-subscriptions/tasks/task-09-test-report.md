# task-09-test-report — Cross-repo integration + mobile landing polish

**Date:** 2026-07-29  
**Repos:** `viwa-telemetry`, `viwa-client-web-app`, `viwa-site`  
**Branch targets:** `main` / `dev` / `master` — uncommitted (per instruction)

## Done

### Live API wire-up
- **Site:** `js/config.js` — `useMockApi: false`, `apiBaseUrl=https://tl.vitamin-water.ru/api/v1` (unchanged default from task-07 круг 2).
- **Site:** `js/landing-api.js` — live tiers/tastes; error/retry on failure; `sizes` on taste images; tier count guard (expects 2 marketing tiers).
- **Client:** `publicModule` already uses real fetch (task-06); added `.env.staging.example` with `VITE_VIWA_TELEMETRY_API_URL=https://tl.vitamin-water.ru/api/v1`; `.env.example` cross-ref.

### Mobile landing parity (task-09)
- **Site:** `css/viwa-landing.css` — safe-area insets (header/menu/footer/body); mobile flex reorder (hero → flavors → tiers → serial → cabinet); not scaled desktop split.
- **Site:** `index.html` — `hero-station` wired for mobile (<1024px); hero-bottle LCP with `sizes`; section order classes.
- **Site:** hamburger nav, touch ≥44px, `prefers-reduced-motion`, `overflow-x: hidden` — retained/enhanced from task-07.

### Payload tuning
- Hero/taste `sizes` attributes; lazy below fold; no new runtime deps.
- `process-viwa-assets.py` — client root resolves `viwa-client-web-app` then `wiva-client-web-app` (removed hardcoded transitional path only).

### Pipeline robustness fix (WinError 32 / partial delete)

- **Root cause:** `process-viwa-assets.py` called `shutil.rmtree(SITE_OUT/CLIENT_OUT)` before generation; on Windows a locked file (`tastes/coconut.webp` — Vite/dev server) caused WinError 32, leaving site/client trees partially deleted (site 28 files, logo SVG missing).
- **Fix:** Staging-first pipeline — generate full tree in `assets/.staging-viwa-assets/`, validate 18 assets + SVG hash + ≥37 files, then publish:
  - **Site:** atomic directory swap with `.generated-prev` backup + retry/backoff on `PermissionError`
  - **Client:** per-file `.tmp` replace with retry/backoff; prune stale files only after successful copy; never rmtree live tree pre-generation
  - **Lock file:** `processor.lock` with pid; stale lock cleared when pid dead
- **`verify-assets-idempotent.ps1`:** sequential-only, lock guard, known-good backup/restore on failure, static regression only after each successful generation
- **Recovery (2026-07-29):** processor restore → static-regression PASS → idempotent 2× PASS → client build PASS
- **Evidence:** site generated **37** files; client viwa **38** (incl. manifest); SVG SHA256 unchanged `7f41f638…`; manifest 18 assets, logo 277×243

### Logo follow-up blocker fix (18:24 regression)

- **Root cause:** `process-viwa-assets.py` still used legacy `logo-viwa-mark.png` (512×512 droplet raster) and `shutil.rmtree` on regen — overwrote manifests/files, omitting SVG despite prior manual integration.
- **Fix:** `process_logo_assets()` copies canonical SVG, derives PNG/WebP via resvg from SVG only, writes manifest `svg` @ 277×243; `resolve_client_root()` prefers `viwa-client-web-app` junction (physical `wiva-client-web-app`, no duplicate repo).
- **Idempotence gate:** `scripts/verify-assets-idempotent.ps1` — processor ×2 + static-regression ×2 + manifest triple-sync + SVG SHA256 unchanged → **PASS**.
- **Evidence (2026-07-29):**
  - `Test-Path` site/client SVG/PNG/WebP: all **True**
  - SVG SHA256 (canonical = site = client = dist): `7f41f638f06917260e19b5e09e956fa66c350abf2c8bf20857f1ad6a484b129e`
  - Manifest SHA256 (triple-sync): `cb431680e5bf0d75579ce6c7b1acbebde24c5cc7509d02c3102359c7ed0dbeb5`
  - Droplet guard: `#7F5AF0` absent, `<path>` count = 1
  - `dist/assets/viwa/logo/logo-viwa-mark.svg` present after build

### Logo integration (corrected canonical SVG)
- **Canonical SVG:** `logo-viwa-mark.svg` — viewBox `0 0 277 243`, single `currentColor` path, no droplet (#7F5AF0 absent); IoU 96.89% per user spec.
- **Copied to:** `viwa-site/assets/generated/logo/`, `viwa-client-web-app/public/assets/viwa/logo/`.
- **PNG/WebP:** re-rasterized from corrected SVG via `@resvg/resvg-js-cli` (277×243) — replaces task-08 droplet PNG for visible fallback.
- **Manifests (byte-sync):** all three updated with `svg`/`png`/`webp` @ 277×243, `altRu: "VIWA"`.
- **Site:** header, mobile menu, hero wordmark, footer — `<picture>` SVG primary + PNG fallback + text «VIWA» on `onerror`.
- **Client:** `ViwaBrandLogo` in SubscriptionPage brand header; `getLogoImagePaths()` in `viwaAssets.ts`.
- **`logoIntegrationDeferred`:** **false**

### Logo (prior correction — superseded)
- Erroneous droplet SVG integration removed earlier same session; replaced by corrected canonical asset above.

### Flows (static/code review — browser gate task-10)
| Flow | Static/code status |
|------|-------------------|
| A — QR serial → register → OTP → `/home` serial stripped | Client task-05/06: `entry=website`, `registrationHint`, `history.replaceState` |
| B — no serial → SerialCapture | task-05 routes + validation cache |
| C — `/auth` returning | task-05 guards |
| D — tiers from `GET /public/subscription-levels` | site `landing-api.js` + client `fetchPublicSubscriptionLevels` |
| E — SBP 12 L purchase | client billing preserved (staging mock SBP if configured) |
| F — favorite tastes API | client `updateFavoriteTastes` + public catalog |
| CORS browser fetch | telemetry task-03; **staging curl/browser — gate below** |

## Verification

| Check | Result |
|-------|--------|
| Site `static-regression-check.ps1` | PASS |
| Telemetry `npm run lint` | PASS (0 errors, 2 pre-existing web warnings) |
| Telemetry `npm run typecheck` | PASS |
| Telemetry `npm run test -w @viwa/api` | PASS — 335 passed, 169 skipped (integration without `DATABASE_URL`) |
| Telemetry `npm run build` | PASS |
| Telemetry `npm test` (full incl. `@viwa/web`) | **NOT RUN as gate** — pre-existing `@viwa/web` vitest `toBeInTheDocument` failures (analytics slice; preserve uncommitted work) |
| Client `npm run lint` | PASS — 0 errors |
| Client `npm run locale:verify` | PASS — 47 keys |
| Client `npm test` | PASS — 40/40 |
| Client `npm run build` | PASS (dist includes logo SVG) |
| Idempotent processor gate (`verify-assets-idempotent.ps1`) | PASS (2× staging publish + 2× regression, SVG hash stable, backup/restore wired) |
| Post-recovery site file count | 37 generated + manifest |
| Post-recovery client file count | 38 (37 assets + manifest.json) |
| Manifest triple-sync + SVG droplet guard | PASS (277×243, 1 path, no #7F5AF0) |
| Browser flows A–F + mobile 360/390/430 | **Deferred to task-10** formal gate |
| CORS live OPTIONS/fetch from site origin | **Staging gate** — requires deployed/staging API + browser |

## Staging gates (documented, not user blockers)

1. **`DATABASE_URL` unset locally** — T2/T7–T11/public HTTP integration tests SKIP in CI/local; run on staging with migrate + 2× marketing tier seed assert.
2. **CORS smoke** — browser fetch from `vitamin-water.ru` / localhost to `tl.vitamin-water.ru/api/v1/public/*`.
3. **Flow E SBP** — end-to-end purchase on staging with mock/real SBP config.

## Modified files (task-09)

| Repo | Files |
|------|-------|
| viwa-site | `index.html`, `css/viwa-landing.css`, `js/landing-api.js`, `scripts/static-regression-check.ps1`, `scripts/process-viwa-assets.py`, `scripts/verify-assets-idempotent.ps1`, `README.md`, `assets/manifest.json`, `assets/generated/**` |
| viwa-client-web-app | `.env.staging.example`, `.env.example`, `src/utils/viwaAssets.ts`, `src/components/ViwaBrandLogo/*`, `src/pages/SubscriptionPage/*`, `src/data/viwaAssetManifest.json`, `public/assets/viwa/logo/*`, `public/assets/viwa/manifest.json` |
| viwa-telemetry | none (no integration blockers found) |

## Not in scope

- commit/push/deploy, Docker
- task-10 browser B-1…B-18 gate

## Acceptance mapping

- [x] Live API default site/client; no hardcoded prices in HTML
- [x] Mobile stack/reorder/safe-area/hero-station/touch/reduced-motion
- [x] Desktop 1440 split retained (≥1024px)
- [x] Cross-repo static + API unit checks green
- [x] Logo SVG in site header/hero + client brand (`logoIntegrationDeferred: false`)
- [ ] Formal browser parity 360/390/430 — **task-10**
- [ ] Staging CORS + DB integration — **staging gate**
