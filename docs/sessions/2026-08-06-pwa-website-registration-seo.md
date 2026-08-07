# 2026-08-06 — PWA, website registration, SEO

## Done

- **PWA (cabinet):** manifest, service worker, icons, install prompt; metadata/SEO hooks in `index.html`; registration/auth pages wired for site attribution.
- **Landing (`viwa-site`):** SEO assets (sitemap, robots, favicons, manifest), enriched `index.html`, static regression check extended.
- **Telemetry (admin web + API):** registration-source tracking, public/admin web metadata/branding hooks, client-auth registration flow updates — shipped via **clean TEMP release candidate** from `origin/main` overlay (not dirty local WIP tree).
- **Production redeploy (final):** telemetry **`20260806-1911-website-0.10.28`** (**0.10.28**, prev **0.10.27**); cabinet **`20260806191627`** (**0.1.38**, prev **0.1.37**); landing static swap with prev docroot **`/var/www/vitamin-water-ru.prev-20260806192000`**, backup **`/var/backups/vitamin-water-ru/pre-deploy-20260806-141852.tar.gz`**.
- **Production browser `/auth`:** 4 viewports **PASS**, no SMS sent; centered PWA icons geometry/hashes verified; nginx MIME types retained.
- **No commit/push** from source dirty trees in this session — deploy artifacts built from clean RC overlay.

## Decisions

- Release built from **clean `origin/main` overlay / TEMP candidate**, not from paused dirty recipe-sync WIP on local `main` (see build log: `dirty-main-recipe-wip-gate`).
- OTP E2E deferred — paid OTP cost; auth persistence rules unchanged; smoke covers deploy health only.
- Landing swap is file-level static replace with timestamped backup for rollback.

## Risks

- **Dirty source trees uncommitted:** `wiva-client-web-app`, `wiva-telemetry`, `viwa-site` hold WIP not yet pushed — production runs RC artifacts, not these working copies.
- **OTP E2E not run** — registration/auth attribution and refresh/session flows not fully validated on production.
- **Local dirty `main` gate still open** — root `npm test` / `npm run build` on recipe WIP tree not green; do not treat dirty tree as release source (brief ref: `wiva-telemetry/docs/agents/build-troubleshooting-log.md`).

## Verification

- **Production smoke:** PASS (telemetry **0.10.28**, cabinet **0.1.38**, landing swap).
- **Production browser `/auth`:** 4 viewports **PASS** (320×568, 360×640, 390×844, 430×932); layout/legal scroll/overlap checks OK; **no SMS** triggered.
- **PWA icons:** centered geometry and asset hashes verified post-deploy.
- **nginx MIME:** retained (no regression).
- **Clean RC (TEMP overlay):** full lint/typecheck/build + test gate — **PASS** before deploy.
- **OTP E2E:** not run (paid OTP).
- **Local dirty trees:** not used as deploy source; no commit/push in this session.

## Git facts

### `wiva-client-web-app` (`c:\wiva\wiva-client-web-app`)

- **branch:** `dev` (tracks `origin/dev`)
- **HEAD:** `2b2c522` — `feat: добавить согласие на повышение цены подписки`
- **status:** dirty — 31 tracked modified (+536/−216), many untracked (PWA assets, `public/manifest.webmanifest`, `public/sw.js`, `src/pwa/`, register/auth tests, site-metadata scripts)
- **commit/push this session:** none

### `wiva-telemetry` (`c:\wiva\wiva-telemetry`)

- **branch:** `main` — **behind `origin/main` by 1**
- **HEAD:** `d1fc44d` — `fix: запретить downgrade активной подписки`
- **status:** dirty — ~101 tracked modified (+6994/−1440), large untracked recipe-sync/pricing WIP; deploy used **clean TEMP RC**, not this tree
- **commit/push this session:** none

### `viwa-site` (`c:\wiva\viwa-site`)

- **branch:** `master` (no remote tracking shown)
- **HEAD:** `be1e91c` — `Revert "feat: добавить юридический футер как у Shaker"`
- **status:** dirty — 2 tracked modified (+252/−14), untracked SEO assets (`sitemap.xml`, `robots.txt`, favicons, `assets/seo/`, `site.webmanifest`)
- **commit/push this session:** none

## Production deploy

| Component | Release ID | Version | Prev | Smoke |
|-----------|------------|---------|------|-------|
| Telemetry (API + admin web) | `20260806-1911-website-0.10.28` | **0.10.28** | 0.10.27 | PASS |
| Client cabinet (PWA) | `20260806191627` | **0.1.38** | 0.1.37 | PASS |
| Landing (`viwa-site`) | swap `20260806192000` | — | — | PASS |

### Rollback refs

- **Telemetry:** redeploy **`20260806-1911-website-0.10.28`** prev **`20260806-1834-website-0.10.27`**; DB backup ref from prior migrate: `/root/backups/viwa-landing-subscriptions/viwa_telemetry-pre-migrate-20260806T111156Z.dump` (if schema unchanged since).
- **Cabinet:** previous release **`20260806183830`** / **0.1.37**.
- **Landing:** prev docroot **`/var/www/vitamin-water-ru.prev-20260806192000`**; backup **`/var/backups/vitamin-water-ru/pre-deploy-20260806-141852.tar.gz`**.

## Next

- Commit and push PWA/SEO/registration changes from dirty trees with selective staging (cabinet → `dev`, telemetry → `main`, landing → `master`/remote).
- Run OTP E2E on staging or with test OTP budget when available.
- Merge `origin/main` into paused dirty telemetry WIP **additively**; resolve local gate (`dirty-main-recipe-wip-gate` in build log).
- Re-run full locale/lint/test/build on each repo after commit prep.
