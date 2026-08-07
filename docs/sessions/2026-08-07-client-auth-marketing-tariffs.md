# 2026-08-07 — client auth marketing tariffs (cabinet)

Cross-repo: [`viwa-telemetry` session log](../../viwa-telemetry/docs/sessions/2026-08-07-client-auth-marketing-tariffs.md) — optional tier `description`, migrations `103000`/`112000`, telemetry release **`20260807-1122-2578e3f-0.10.30`**.

## Done

- `AuthMarketingSection` on auth/register: below PWA prompt, outside the OTP form; localized VIWA product facts; public API tariff cards with loading, empty, error, and retry states; accessibility basics.
- `CabinetAuthShell` scoped layout slot for marketing block; `publicSubscriptionLevels` util + types wired to public REST `description`.
- Locales RU/EN updated; subscription locale verify script extended; auth thunk tests for marketing fetch path.
- **Equal-height tariff cards:** CSS chain `role=listitem` / card / body `height: 100%`; price block `margin-top: auto`; focused review **PASS**.
- `version` **0.1.40**; production release **`20260807120142`**; previous release **`20260807112540`** (0.1.39).
- Deleted plan/payment assets kept out of worktree by user choice; **five safety assets restored in production `dist` only from `HEAD`**, not re-added to git tree.
- Release cleanup kept exactly current + previous; rollback prepared but unused.

## Decisions

- Marketing block is presentational — no OTP or payment side effects; lives outside form for a11y/focus isolation.
- Tariff copy comes from telemetry public API (`description`), not hardcoded tier lists.
- Equal-height layout via flex column + `margin-top: auto` on price — no JS height sync.
- PWA/install and prior cabinet-top-tastes WIP left in tree but **out of scope** for this task’s commit boundary.
- Production asset recovery: restore missing safety files in deployed bundle from last committed HEAD; preserve intentional worktree deletions (large plan webp, sbp icon).

## Risks

- **Uncommitted working tree:** production bundle **`20260807120142`** is not fully represented in git; reproducibility risk until scoped commit.
- Mixed dirty tree: PWA (`PwaInstallPrompt`, `sw.js`, `manifest.webmanifest`, site-asset scripts), agent docs under `docs/agents/cabinet-top-tastes-rebuild/`, and `?? .deploy-ts` are unrelated to marketing tariffs.
- Browser OTP smoke not run — marketing + public API alignment verified via HTTP/API checks only.

## Verification

- Full **0.1.40** semantics: `npm run lint` — **0 errors**, 23 warnings (pre-existing style); locale verify — **147** keys; `npm test` — **292** passed; `npm run build` — **0** errors.
- After formatting/version sync: Prettier check — **0**; targeted metadata tests — **7/7**; rebuild — **0** errors.
- Focused equal-height CSS review — **PASS**.
- Production routes/assets/API smokes — green; CSS bundle hash/rules smoke — green.
- Browser interactive / OTP — **not run** (paid OTP; `browserTesting` absent).

## Git facts

- **repo:** `viwa-client-web-app` (`C:\wiva\viwa-client-web-app`)
- **branch:** `dev` — tracking `origin/dev` (even)
- **HEAD:** `2b2c522` — `feat: добавить согласие на повышение цены подписки`
- **task diff/stat (tracked):** 35 files, **+606 / −215** — `AuthPage`, `RegisterPage`, `CabinetAuthShell`, locales, `publicSubscriptionLevels` types/utils, subscription locale verify, auth thunk tests, asset manifest tweaks, deleted plan assets in worktree
- **task untracked (in scope):** `src/components/AuthMarketingSection/`, `src/utils/publicSubscriptionLevels.ts`, `src/utils/publicSubscriptionLevels.test.ts`
- **unrelated / pre-existing dirty:** `??` PWA stack (`src/pwa/`, `PwaInstallPrompt`, `public/sw.js`, `manifest.webmanifest`, pwa/social assets, generate/verify site scripts), `?? .deploy-ts`, `?? docs/sessions/2026-08-06-pwa-website-registration-seo.md`, agent round docs under `docs/agents/cabinet-top-tastes-rebuild/`
- **commit/push:** none

## Next

- User-requested **scoped commits and push** on `dev` if desired (`AuthMarketingSection`, shell wiring, public API util, equal-height CSS, locales, tests — exclude PWA WIP and agent docs unless explicitly included).
- After telemetry commits land, re-smoke public tariff cards on auth/register against live `description` fields.
- Decide separately whether to commit or drop deleted plan assets and PWA work.
