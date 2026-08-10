# Complex session summary — viwa-landing-subscriptions

**sessionId:** `viwa-landing-subscriptions`  
**Date:** 2026-07-29  
**Trigger:** `/complex` (multi-repo: landing + cabinet + telemetry)  
**Status:** **COMPLETE** — production deploy executed 2026-07-29 via `/task-completion`

> **Branch policy (2026-08-10):** `viwa-client-web-app` work/commit/deploy — **`main`** (`origin/main`). Ветка `dev` — temporary archive до успешного production deploy с `main`; исторические упоминания `dev` в task/session docs ниже относятся к периоду до cutover.

---

## Outcome (executive)

Delivered concept-16 VIWA landing (desktop split + **mobile parity**), client cabinet redesign with monthly **12 L / 18 L** tiers from live public API, telemetry backend (schema, public API, CORS, `registrationSource`, favorites), 14-taste asset pipeline with **canonical no-droplet logo**, browser gate **36 PASS / 0 FAIL / 2 DEFERRED**, production **`deploy-runbook.md`**, and **production deploy** (telemetry → client → site) on 2026-07-29.

---

## Phases and review rounds

| Phase | Artifacts / work | Review rounds | Result |
|-------|------------------|---------------|--------|
| **Init** | `request.md`, orchestrator-log | — | sessionId fixed; 3 repos scoped |
| **Analysis** | `tz.md` v1 | **tz-review k1** — no critical | 9/9 request requirements covered |
| **Architecture** | `architecture.md` v1 → v1.1 (paths) → **v1.2** (marketing filter, monthly invariants, canon §0) | **arch-review k1** — critical → fixes; **k2** — no critical | Planner unblocked |
| **Planning** | `plan.md`, `tasks/task-01…11`, `TEMP_TEST_SCENARIOS.md` | **plan-review** — no critical | 11 tasks, 5 waves |
| **Wave 0 — Contracts** | task-01 | **code-review k1** — critical (admin JSON); **k2** — pass | Canon §0 in loyalty contracts |
| **Wave 1 — Telemetry foundation** | task-02 ∥ task-03 + task-04 | task-02 review pass; task-03 review pass; task-04 **k1 critical → k2 pass** | T1–T6 unit green; T7–T11/T8 integration skip without DB |
| **Wave 2 — Surfaces** | task-05→06 (client), task-07 (site), parent image gen → task-08 | task-05 **k1→k2**; task-06 **k1→k2**; task-07 **k1 mock leak → k2**; task-08 pass | Mocks until Wave 1 staging gate |
| **Wave 3 — Integration** | task-09 (+ logo correction, idempotent asset pipeline) | task-09 pass; idempotence re-review pass | Live API wire-up; mobile polish |
| **Wave 4 — Verification & deploy prep** | task-10 (junction fix, telemetry Vitest, browser gate, B-3/B-10/B-14 fix round) | task-10 infra review pass; browser **31/3/2 → 36/0/2**; B-fix review pass | Pre-deploy clear |
| **Wave 4 — Runbook** | task-11 `deploy-runbook.md` | task-11 review pass (docs-only) | Gates A–E documented |

**User clarifications (docs updates, no product code):** mobile landing parity gate; production deploy authorization; canonical logo = diagonal-cut VIWA wordmark **without droplet**.

---

## Task status (task-01 … task-11)

| Task | Title | Repo(s) | Status | Notes |
|------|-------|---------|--------|-------|
| **01** | Contracts §0 + REST canon | viwa-telemetry (docs) | **Done** | Review k2 pass; admin client card examples split (marketing vs legacy) |
| **02** | Prisma + monthly pool + T1–T6 | viwa-telemetry | **Done** | `prisma migrate dev` locally skipped (`DATABASE_URL` unset); M5 DROP deferred |
| **03** | Public tiers/tastes + CORS | viwa-telemetry | **Done** | T2/T8 integration SKIP without DB; Wave 1 staging gate for live wire-up |
| **04** | Auth attribution + favorites + admin | viwa-telemetry | **Done** | Review k2 closed colSpan, admin DTO, check-code example |
| **05** | Client routing + serial flows | viwa-client-web-app | **Done** | Review k2: ESLint project sync, `/home` redirect, validation cache dedup |
| **06** | concept-16 UI + locale | viwa-client-web-app | **Done** | Review k2: expired UX, profile merge race, 47 keys, a11y, NavLink |
| **07** | Site landing static | viwa-site | **Done** | Review k2: mock fail-closed; `useMockApi: false` default |
| **08** | Asset manifest integration | site + client | **Done** | 18 manifest IDs; Pillow pipeline; triple-sync |
| **09** | Cross-repo live API + mobile polish | all three | **Done** | Logo SVG pipeline; staging-first atomic publish; idempotent gate PASS |
| **10** | Browser gate + build/test infra | all three | **Done** | **36 PASS / 0 FAIL / 2 DEFERRED**; junction `projectRoot`; telemetry web Vitest fix |
| **11** | Deploy runbook (gates only) | docs | **Done** | `deploy-runbook.md`; no commit/push/deploy in task scope |

---

## Repositories and files (high level)

### `viwa-telemetry` (`main`)

| Area | Key paths |
|------|-----------|
| Contracts | `docs/contracts/loyalty-public-rest.md`, `loyalty-client-rest.md`, `loyalty-admin-rest.md`, `analytics-admin-rest.md` |
| Schema / domain | `apps/api/prisma/schema.prisma`, migration `20260729120000_monthly_subscription_and_registration_source`, `loyalty-domain.service.ts`, `subscription-level.service.ts` |
| Public API | `apps/api/src/loyalty/public-api/` — tiers (marketing filter, 2 items), tastes (14 keys), CORS in `main.ts` |
| Auth / profile | `client-auth.service.ts` — `deriveRegistrationSource`, `registrationHint`; favorites; admin analytics breakdown |
| Tests | `subscription-level.service.spec.ts`, `loyalty-domain.service.spec.ts`, `client-api.spec.ts`, `public-api.spec.ts` |
| Dashboard slice | `apps/web/` — registrationSource chip + Clients breakdown (preserve uncommitted analytics work) |
| Test infra (task-10) | `apps/web/setup.ts`, `scripts/vitest-run.mjs` — jest-dom on global `expect` |

### `viwa-client-web-app` (`dev`)

| Area | Key paths |
|------|-----------|
| Routing / auth | `App.tsx` — `/register`, `/auth`, `/m/:serial/*`, `/home`; `SerialCapturePage`, `landingEntry.ts`, `machineSerialValidationCache.ts` |
| Subscription UI | `SubscriptionPage/`, `FavoriteFlavorsSection/`, `VolumeCircle/`, `BottomNav`, `viwa-tokens.css` |
| API / state | `publicModule.ts`, `loyaltyModule.ts`, `clientDTO.ts`, profile merge + `subscriptionStatus.ts` |
| Locale | `ru.json` / `en.json` — 47 `subscription.*` keys; `scripts/locale-verify-subscription.mjs` |
| Assets | `public/assets/viwa/**`, `src/data/viwaAssetManifest.json`, `viwaAssets.ts`, `ViwaBrandLogo` |
| Infra (task-10) | `scripts/projectRoot.mjs`, `vite.config.ts`, `vitest.config.ts` — junction-safe canonical root |

### `viwa-site` (`master`)

| Area | Key paths |
|------|-----------|
| Landing | `index.html`, `css/viwa-tokens.css`, `css/viwa-landing.css` |
| JS | `js/config.js`, `landing-api.js`, `landing-cta.js` — `entry=website`, live public fetch, error/retry |
| Assets | `assets/generated/**`, `assets/manifest.json`, canonical `logo-viwa-mark.svg` (277×243, no droplet) |
| Tooling | `scripts/process-viwa-assets.py`, `static-regression-check.ps1`, `verify-assets-idempotent.ps1` |

### Session docs (host)

`viwa-client-web-app/docs/agents/viwa-landing-subscriptions/` — request, tz, architecture, plan, tasks, reviews, test reports, `browser-test-report.md`, `deploy-runbook.md`, `orchestrator-log.md`, this summary.

---

## Key decisions

### Monthly 12 L / 18 L

- `dailyVolumeMl` → **`monthlyVolumeMl`** (12000 / 18000); monthly pool debited until `subscriptionEndsAt`.
- **`ensureDailyReset`** — **legacy-only** (`isLegacyDailySemantics`); marketing tiers: pool reset **only** in `applySubscription`.
- Public/client purchase UI: **`listMarketingSubscriptionLevels()`** — invariant **`items.length === 2`**; legacy grandfather rows excluded.
- **`limitResetsAt: null`** for marketing monthly; deprecated `daily*` alias one release.
- Mid-cycle tier upgrade / proration — **deferred** (renewal at expiry).

### Attribution — canon §0 (`entry` / `registrationHint` / `registrationSource`)

| Layer | Field | Value |
|-------|-------|-------|
| Landing/cabinet query | **`entry`** | `website` (not `source=website` in canon) |
| check-code body | **`registrationHint`** | `website` \| `machine_qr` (client hint only) |
| DB / API response | **`registrationSource`** | **`WEBSITE`** \| `MACHINE_QR` \| `UNKNOWN` — **server-derived only** |

Server: `deriveRegistrationSource()` — hint + allowed Origin/Referer; **existing client attribution immutable**.

### Serial flows

| Flow | Path |
|------|------|
| **A — QR with serial** | `vitamin-water.ru/?serial=…&entry=website` → CTA → `/register?serial=…` → `/m/{serial}/auth` → OTP → **`/home`** (serial stripped) |
| **B — no serial** | CTA → `/register?entry=website` → **Serial Capture** → validate → `/m/{serial}/auth` |
| **C — returning** | `/auth` — no serial; OTP; attribution unchanged |
| **Gate** | New client without serial → **`400 SERIAL_REQUIRED`** |

No fictitious «website-machine» serial.

### 14 tastes

- Canonical **`TASTE_MEDIA_KEYS`** (14) — public `/public/tastes`, landing grid, client favorites (max 3).
- Asset IDs: `taste-{mediaKey}` in manifest; lazy `<picture>` WebP/PNG.

### Canonical no-droplet SVG logo

- **Wordmark only** — diagonal-cut VIWA; **`logo-viwa-mark.svg`** viewBox **277×243**, single `currentColor` path.
- **Forbidden:** legacy droplet PNG/SVG (512×512 water-drop).
- SVG SHA256: `7f41f638f06917260e19b5e09e956fa66c350abf2c8bf20857f1ad6a484b129e`
- Manifest triple-sync SHA256: `cb431680e5bf0d75579ce6c7b1acbebde24c5cc7509d02c3102359c7ed0dbeb5`
- Pipeline: staging-first → validate → atomic publish; **`verify-assets-idempotent.ps1`** mandatory pre-deploy.

### Mobile parity

- User mandate: landing **first-class on mobile**, not scaled-down desktop split.
- Viewports: **360×800**, **390×844**, **430×932** + desktop **1440×900**.
- Stack reorder: hero → flavors → tiers → serial → cabinet; safe-area; touch ≥44px; B-1…B-8 on all mobile widths.

---

## Verification (exact facts)

| Gate | Command / tool | Result (2026-07-29) |
|------|----------------|---------------------|
| **Browser B-1…B-16** | Playwright `TEMP_browser_gate.mjs` (site `:8080` + client preview `:5173`) | **36 PASS / 0 FAIL / 2 DEFERRED** (38 rows total) |
| **Browser deferred** | B-17, B-18 | Post-deploy only (see below) |
| **viwa-telemetry API** | `npm test` (`@viwa/api`) | **335 pass**, **169 skip** (no `DATABASE_URL` locally) |
| **viwa-telemetry web** | `npm test -w @viwa/web` | **502 pass** (jest-dom fix; was 78 fail pre-fix) |
| **viwa-telemetry** | lint, typecheck, build | **exit 0** |
| **viwa-client-web-app** | `npm test` | **40** Vitest + **2** node `projectRoot` regression = **42** total — **PASS** |
| **viwa-client-web-app** | lint, `locale:verify` (47 keys), build | **exit 0** (23 pre-existing lint warnings) |
| **viwa-site** | `static-regression-check.ps1` | **PASS** — `useMockApi: false`, no hardcoded tier prices, droplet guards |
| **Asset idempotence** | `verify-assets-idempotent.ps1` (2× process + 2× static-regression) | **PASS** — SVG hash stable; site ~37 + client ~38 generated files |

**Not verified locally (staging/production gates):** Wave 1 T8 CORS curl; T2/T7–T11 DB integration; B-17 admin attribution; B-18 physical pour.

---

## Known warnings and risks

| Category | Item | Severity |
|----------|------|----------|
| **Staging** | `DATABASE_URL` unset locally — 169 API integration tests **skipped**; Wave 1 gate needs staging/CI with DB | Medium — must run before trusting live migration |
| **Migration** | M5 DROP `daily_usage_date` not applied until post-deploy gated code | Medium — documented in task-02/04 |
| **Attribution MVP** | Referer/hint spoofing possible; post-MVP signed cookie noted in architecture | Low |
| **Site UX 🟡** | sessionStorage handoff site→client incomplete; B-8 contrast; CTA `href="#"` pre-JS; inline onerror/CSP | Low — not blocking pre-deploy gate |
| **Client 🟡** | SubscriptionPage monolith; pre-task-08 image waterfall; 401 skipAuth; returning-flow hint edge cases | Low |
| **Assets** | ~22 MB payload; hero-station mobile weight | Low — performance follow-up |
| **Paths** | `viwa-*` / `wiva-*` junction on dev PC — mitigated by `projectRoot.mjs`; task-11 folder cutover deferred | Low |
| **Docs drift 🟡** | `architecture.md` §8 vs `deploy-runbook.md` — client API URL (`tl.*` vs `cabinet.*` proxy), telemetry release id pattern, rollback `.prev` naming | Low — runbook is operational source for deploy |
| **Telemetry** | Uncommitted analytics UI in `apps/web/` — must not revert; merge carefully | Medium at commit time |
| **Product policy** | Active subscribers see progress only — plan purchase UI for **trial/expired/no-sub**; mid-cycle upgrade out of scope | By design |
| **Deploy ops 🟡** | Site Step 3 rsync comment-only; `scp -r .` could include `node_modules` if careless | Low — operator discipline |

---

## Deployment authorization and order

### Authorization

- User **explicitly authorized production deploy** on **2026-07-29** (after all gates).
- Execution **only** via **`/task-completion`** — not automatic; re-confirm if days elapsed.
- **`/ci-cd-status`** — only if user separately requests after push.
- **Docker files** — not changed (ban holds).

### Strict order

```text
1. viwa-telemetry   — API migration + public tiers/CORS + admin (tl.vitamin-water.ru)
2. viwa-client-web-app   — cabinet SPA (cabinet.vitamin-water.ru)
3. viwa-site   — static landing (vitamin-water.ru)
```

**Rationale:** API + CORS + migration live before surfaces fetch prices; cabinet routes exist before landing CTA goes live.

### Pre-deploy (runbook Gates A–E)

- **A:** Wave 1 telemetry on staging (T1–T11, public HTTP, CORS OPTIONS).
- **B:** Local lint/test/build all repos (numbers above).
- **C:** Browser **36/0/2** — pre-deploy clear.
- **D:** Asset pipeline idempotent + logo/manifest hashes.
- **E:** User re-confirms deploy window + rollback plan.

### Backups (mandatory)

- **M1:** `pg_dump` **before** `prisma migrate deploy` (`20260729120000_monthly_subscription_and_registration_source`).
- **Site:** `tar` backup `/var/www/vitamin-water-ru` before atomic swap.

### SSH

- Canonical alias: **`wiva-server`** (`viwa-server` **does not resolve** on dev PC).

### Operational reference

Full steps, smoke **S1–S8**, rollback: **`deploy-runbook.md`**.

---

## Post-deploy: B-17, B-18, and real-machine limitation

| Scenario | What | Why deferred pre-deploy |
|----------|------|-------------------------|
| **B-17** | Landing → register → telemetry admin shows **`registrationSource=WEBSITE`** | Requires **real telemetry dashboard login** + **production/staging DB** after deploy — cannot mock/fabricate honestly in local Playwright gate |
| **B-18** | QR pour at **any** network machine debits **monthly pool** | Requires **physical staging/production machine** + active subscription + pour hardware — **cannot automate** in CI/local browser |

**Smoke mapping:** B-17 ↔ runbook **S3**; B-18 ↔ **S8**.

**Acceptance:** Pre-deploy gate treats B-17/B-18 as **DEFERRED with documented reason** — not FAIL. Post-deploy checklist must run manually; failure there blocks calling deploy «fully verified».

---

## Git facts (final — 2026-07-29 task-completion)

| Repo | Branch | Version | Commit | Push | Deploy release |
|------|--------|---------|--------|------|----------------|
| `viwa-telemetry` | `main` | **0.10.6** | `84a96fc` | ✅ `origin/main` | `20260729-1430-84a96fc` |
| `viwa-client-web-app` | `dev` | **0.1.1** | `3cef6b9` | ✅ `origin/dev` | `20260729192328` |
| `viwa-site` | `master` | `site-version.txt` | `4fe1298` | ⚠️ no remote configured | atomic swap 2026-07-29 |

**Production pointers (post-deploy):**

- `/opt/viwa-telemetry/current` → `releases/20260729-1430-84a96fc` (rollback: `202607291138-662322e`)
- `/opt/viwa-client-web-app/current` → `releases/20260729192328` (rollback: `20260728113442`)
- `/var/www/vitamin-water-ru` — new VIWA landing (rollback: `/var/www/vitamin-water-ru.prev-20260729-142424` or `/var/backups/vitamin-water-ru/pre-deploy-20260729-142424.tar.gz`)

**PG backup (M1):** `/root/backups/viwa-landing-subscriptions/viwa_telemetry-pre-migrate-20260729-142033.{dump,sql}`

**TEMP cleanup:** removed `TEMP_TEST_SCENARIOS.md`, `TEMP_browser_gate.mjs`, `TEMP_browser_gate_results.json`; screenshots preserved under `screenshots/2026-07-29/`.

---

## Artifact index

| Document | Purpose |
|----------|---------|
| `request.md` | User request + clarifications |
| `tz.md` | Full TZ, UC-1…UC-8, B-1…B-18 |
| `architecture.md` v1.2 | Canon §0, API, migration, deploy §8 |
| `plan.md` | 11 tasks, 5 waves |
| `deploy-runbook.md` | Production deploy (gates-only) |
| `browser-test-report.md` | 36/0/2 gate |
| `tasks/task-*.{md,review,test-report}` | Per-task detail |
| `orchestrator-log.md` | Chronological session log |

---

## Post-deploy smoke (2026-07-29)

| ID | Result | Evidence |
|----|--------|----------|
| **S1** | **PASS** | Public tiers HTTP 200, `items.length === 2`, `monthlyVolumeMl` 12000/18000, prices 49900/69900 ₽ |
| **S2** | **PASS** | Site `useMockApi: false`, `apiBaseUrl` → `tl.vitamin-water.ru`; live fetch via CORS |
| **S3** / **B-17** | **DEFERRED** | Requires real new client OTP + admin login — not fabricated |
| **S4** | **PASS** | `cabinet/register?entry=website` HTTP 200 |
| **S5** | **PASS** | `cabinet/auth` HTTP 200 |
| **S6** | **DEFERRED** | Requires completed first registration flow |
| **S7** | **DEFERRED** | Requires real SBP payment adapter |
| **S8** / **B-18** | **DEFERRED** | Requires physical machine pour |
| **CORS** | **PASS** | OPTIONS `Origin: https://vitamin-water.ru` → `access-control-allow-origin` match |
| **Tastes** | **PASS** | `GET /public/tastes` → **14** items |
| **Logo** | **PASS** | `logo-viwa-mark.svg` HTTP 200 on site |

---

## Next step

Manual **B-17** (admin WEBSITE attribution) and **B-18** (network QR pour) when test identity and staging machine available.
