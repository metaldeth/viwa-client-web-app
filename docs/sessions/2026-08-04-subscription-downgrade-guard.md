# 2026-08-04 — subscription downgrade guard

## Done

- Guard against subscription downgrade in the client cabinet: weaker tiers are hidden; renew and upgrade remain available.
- Added `subscriptionLevels` (ranking, weaker-tier filter, legacy unknown-tier handling) and `subscriptionPaymentError` (409 mapping).
- Updated `SubscriptionPage`, `planSummary`, `subscriptionStatus`, `tierCardBackground` and related tests.
- i18n: downgrade/payment error keys in `en.json` / `ru.json`; `subscriptionLocale` + locale verify script extended.
- Version bumped to **`0.1.28`** in `package.json`.

## Decisions

- Frontend hides weaker plans; backend returns **409** on downgrade payment attempts.
- Trial, expired, admin-disabled, and no-subscription states stay unrestricted for plan selection.
- Same-tier renew and upgrade to a stronger tier are allowed.
- Nullable `sortOrder` falls back to catalog volume ordering.
- Legacy unknown tier: conservative UI (no downgrade affordance).

## Risks

- If backend lacks a legacy tier relation, ranking may fail-open server-side.
- If current legacy tier ranks above catalog, frontend may show no selectable plans.

## Verification

- `npm run lint` — **PASS**, 0 errors, 23 pre-existing warnings.
- `npm run locale:sync` / `locale:sort` / `locale:verify` — **PASS**, exit 0.
- `npm test` — **PASS**, 173 Vitest + 2 node tests.
- `npm run build` — **PASS**; version **0.1.28**.
- Browser smoke — **skipped** (`browserTesting` not enabled in `AGENTS.md`).

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev`
- **HEAD (unchanged):** `ce830ad` — `fix: исправить OTP-поля, этап FlashCall и шапку кабинета`
- **commit:** none — **pending**
- **version:** `0.1.28` (`package.json`)
- **task diff (unstaged + untracked, subscription scope):** 15 files — modified 11 (+112 / −54); new 4 (`subscriptionLevels.ts`, `subscriptionLevels.test.ts`, `subscriptionPaymentError.ts`, `subscriptionPaymentError.test.ts`)
- **working tree note:** contains **unrelated** changes — **do not commit** with this task:
  - `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-round5-remediation.md`
  - `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`

## Next

- Commit **task-only** files (exclude unrelated docs above).
- Push to `dev`, deploy API then SPA, manual smoke on subscription page (downgrade hidden, renew/upgrade work, 409 surfaced).
