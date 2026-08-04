# 2026-08-04 — subscription downgrade guard

## Done

- Guard against subscription downgrade in the client cabinet.
- **Initial (0.1.28, `e352d4b`):** weaker tiers hidden; `subscriptionLevels`, `subscriptionPaymentError`, 409 mapping; `SubscriptionPage`, `planSummary`, `subscriptionStatus`, `tierCardBackground` + tests; i18n keys.
- **Follow-up UX (0.1.29, pending):** weaker tiers **visible but disabled** — price shown, badge «Недоступен до DD.MM.YYYY» (or generic fallback); `resolveDisabledTierMessage`, disabled card styling, aria hints; current / upgrade / trial / expired / admin-disabled tiers remain **enabled**. Backend **409** on downgrade payment — unchanged.

## Decisions

- Weaker plans: show disabled with date badge instead of hiding (better discoverability, clear lock reason).
- Backend returns **409** on downgrade payment attempts — unchanged.
- Trial, expired, admin-disabled, and no-subscription states stay unrestricted for plan selection.
- Same-tier renew and upgrade to a stronger tier are allowed.
- Nullable `sortOrder` falls back to catalog volume ordering.
- Legacy unknown tier: conservative UI (no downgrade affordance).

## Risks

- If backend lacks a legacy tier relation, ranking may fail-open server-side.
- Disabled weaker cards may still invite clicks — mitigated by `disabled` + aria; 409 remains server fallback.

## Verification

- `npm run lint` — **PASS**, 0 errors, 23 pre-existing warnings.
- `npm run locale:sync` / `locale:sort` / `locale:verify` — **PASS**, 0 missing keys (86 checked).
- `npm test` — **PASS**, 184 Vitest + 2 node tests.
- `npm run build` — **PASS**; version **0.1.29**.
- Browser smoke — **skipped** (`browserTesting` not enabled in `AGENTS.md`).

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev`
- **HEAD:** `e352d4b` — `fix: запретить выбор слабого тарифа при активной подписке` (initial guard, 0.1.28)
- **follow-up commit:** none — **pending**
- **version:** `0.1.29` (`package.json`, unstaged)
- **follow-up diff (unstaged, task scope):** 9 files — +319 / −19 (`SubscriptionPage`, `subscriptionLevels`, locales, styles, tests)
- **working tree note:** contains **unrelated** changes — **do not commit** with this task:
  - `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-round5-remediation.md`
  - `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`

## Next

- Commit **task-only** follow-up files (exclude unrelated docs above).
- Push to `dev`, deploy SPA only, then verify the disabled weaker-tier UX and production version.
