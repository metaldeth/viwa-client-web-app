# 2026-07-29 — viwa-landing-subscriptions

## Done

- **viwa-telemetry** (`main` `84a96fc`, v0.10.6): monthly subscription 12/18 L, public tiers/tastes API, CORS, `registrationSource`, favorites, admin breakdown, migration applied on production.
- **viwa-client-web-app** (`dev` `3cef6b9`, v0.1.1): concept-16 cabinet redesign, `/register` `/auth` `/home`, serial flows, locale 47 keys, session docs + browser screenshots.
- **viwa-site** (`master` `4fe1298`, local): VIWA responsive landing, live API integration, 14 flavors, canonical no-droplet logo.
- **Production deploy** (ordered): telemetry → client → site via `ssh wiva-server`.
- **TEMP cleanup:** removed gate runner/scenarios JSON; preserved permanent browser report and screenshots.

## Decisions

- Monthly pool semantics; canon §0 attribution (`entry` / `registrationHint` / `registrationSource=WEBSITE`).
- Site deploy: staging dir + atomic swap (no rsync --delete into live).
- `.env.production` not committed (local build only).

## Risks

- B-17/B-18 not verified post-deploy (no test OTP identity / physical machine).
- `viwa-site` has no git remote — deploy artifact is server-side only.
- 169 API integration tests skipped locally (no `DATABASE_URL`).

## Verification

- Pre-deploy: browser 36/0/2; telemetry lint/typecheck/build 0; client lint/locale/build 0; site static-regression PASS.
- Post-deploy S1: public tiers 2 items 12000/18000 ml, 499/699 ₽ — PASS.
- Post-deploy CORS vitamin-water.ru → tl API — PASS.
- Post-deploy tastes count 14 — PASS.
- Cabinet / /register /auth — HTTP 200.
- B-17, B-18 — DEFERRED.

## Git facts

| Repo | Branch | Commit | Push |
|------|--------|--------|------|
| viwa-telemetry | main | 84a96fc | pushed |
| viwa-client-web-app | dev | 3cef6b9 (+ docs follow-up) | pushed |
| viwa-site | master | 4fe1298 | no remote |

## Deploy facts

| Surface | Release / backup | Rollback |
|---------|------------------|----------|
| Telemetry | `20260729-1430-84a96fc` | `202607291138-662322e` |
| Client | `20260729192328` | `20260728113442` |
| Site | swap 20260729-142424 | `.prev-20260729-142424` or tar backup |
| PG | `viwa_telemetry-pre-migrate-20260729-142033.dump` | pg_restore per runbook |

## Next

- Manual B-17: landing registration → admin `registrationSource=WEBSITE`.
- Manual B-18: QR pour debits monthly pool on network machine.
- Optional: add git remote for `viwa-site`.
