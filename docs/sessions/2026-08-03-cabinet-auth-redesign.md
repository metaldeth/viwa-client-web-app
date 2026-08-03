# 2026-08-03 — cabinet auth redesign

## Done

- Redesigned phone and OTP screens with shared `CabinetAuthShell`, VIWA logo, cabinet dark card, responsive controls, accessible resend button and OTP fields.
- Preserved auth behavior: FLASHCALL→SMS flow, 5/day limit, absolute SMS paths from prior commit `962ba4e`.
- Fixed `useTimer` stability: rerenders no longer reset the timer; `restart` does not fire completion; clean unmount.
- Fixed collapsed OTP slots by sizing the outer motion wrappers instead of calculating width inside an auto-sized parent.
- Clarified FLASHCALL copy: the call is the active step, SMS is presented only as the fallback available after 30 seconds.
- Removed the cabinet header's out-of-flow `translateY(21px)` so the logo and burger no longer overlap the first card.
- Version bumped to **`0.1.27`** in `package.json`.

## Decisions

- UI-only redesign on top of existing auth contract — no changes to OTP send limits or resend path semantics.
- Backend prod env already configured: `OTP_SEND_COOLDOWN_SECONDS=30`, `OTP_SEND_MAX_PER_HOUR=5`, `OTP_SEND_MAX_PER_DAY=5` (aligned with client cooldown/resend UX).

## Risks

- `browserTesting` not configured in `AGENTS.md` — no automated browser visual smoke for auth screens.
- Manual mobile smoke at **320–430px** recommended before production deploy.

## Verification

- `npm run locale:verify` — **PASS**, 83 subscription keys with ru/en parity.
- `npm run lint` — **PASS**, 0 errors and 23 pre-existing warnings.
- `npm test` — **PASS**, 156 Vitest tests.
- `npm run build` — **PASS**; `dist/version.json` reports `0.1.27`.

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev` (up to date with `origin/dev`)
- **starting commit:** `962ba4e` — `fix: absolute path при повторной отправке OTP и cooldown 30с`
- **commit:** none — **pending**
- **version:** `0.1.27` (`package.json`)
- **task diff (auth scope, unstaged):** 10 files, +477 / −301 — `package.json`, `CabinetAuthShell/` (new), `CodeInputGroup/` (+ `CodeInputGroup.module.scss` new), `useTimer.ts`, `useTimer.test.ts` (new), `AuthPage/`, `SmsPage/`
- **excluded (pre-existing unrelated docs, not part of this task):** `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-round5-remediation.md`, `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`

## Next

- Commit and push `0.1.27` on `dev`.
- Deploy `0.1.27` and production smoke (phone → OTP, resend cooldown, mobile widths 320–430px).
