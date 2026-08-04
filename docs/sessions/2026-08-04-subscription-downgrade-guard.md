# 2026-08-04 — subscription downgrade guard

## Done

- Guard against subscription downgrade in the client cabinet.
- **Initial (0.1.28, `e352d4b`):** weaker tiers hidden; `subscriptionLevels`, `subscriptionPaymentError`, 409 mapping; `SubscriptionPage`, `planSummary`, `subscriptionStatus`, `tierCardBackground` + tests; i18n keys.
- **Follow-up UX (0.1.29, `283ee50`):** weaker tiers visible but disabled — price after status/explanation; disabled card styling, aria hints; current / upgrade / trial / expired / admin-disabled tiers remain enabled.
- **Follow-up copy (0.1.31, pending):** `resolveDisabledTierCopy` — status «Недоступен сейчас»; explanation with `currentTier` / `date` / `targetTier` when params available, generic fallback otherwise; no downgrade scheduling. Backend **409** on downgrade payment — unchanged.

## Decisions

- Weaker plans: show disabled with clear lock reason instead of hiding.
- Disabled copy: fixed status label + tier/date explanation or generic fallback; no client-side downgrade scheduling.
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
- `npm run locale:sync` / `locale:sort` / `locale:verify` — **PASS**, 0 missing keys (87 checked).
- `npm test` — **PASS**, 212 Vitest + 2 node tests.
- `npm run build` — **PASS**; version **0.1.31**.
- Browser smoke — **skipped** (`browserTesting` not enabled in `AGENTS.md`).

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev` (tracking `origin/dev`)
- **HEAD:** `d7f62ce` — `feat: добавить плавный стартовый экран кабинета` (unrelated)
- **task commits:** `e352d4b` (initial guard), `283ee50` (disabled weaker tiers)
- **follow-up commit:** none — **pending**
- **version:** `0.1.31` (`package.json`, unstaged)
- **follow-up diff (unstaged, task scope):** 9 files — +194 / −54 (`subscriptionLevels`, `SubscriptionPage`, locales, styles, tests)
- **working tree note:** contains **unrelated** changes — **do not commit** with this task:
  - `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-round5-remediation.md`
  - `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`

## Next

- Commit **task-only** follow-up files (exclude unrelated docs above).
- Push to `dev`, deploy SPA only, then verify disabled weaker-tier UX and production version.
