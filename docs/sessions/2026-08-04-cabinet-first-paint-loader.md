# 2026-08-04 — cabinet first-paint loader

## Done

- **Outcome:** inline first-packet boot loader in `index.html` — black screen + spinner before React mounts; no white flash on cold load / reload.
- **Design:** `#viwa-app-boot` overlay (fixed, full viewport, safe-area padding, fade-out transition); spinner + status copy; `#root` stays black underneath.
- **Lifecycle (`appBoot` / `appVersionBoot`):**
  - **Normal** — hide overlay after app ready (2× `requestAnimationFrame` then fade).
  - **Initial update** — version mismatch on first load → reload with cache-bust.
  - **Background update** — newer build detected while app running → soft prompt / guard path via `AppVersionGuard`.
  - **Error retry** — version check failure → retry UI with backoff; timeout **4 s** then proceed without blocking boot.
- **iOS / PWA surface:** `viewport-fit=cover`, `theme-color`, `apple-mobile-web-app-capable`, `black-translucent` status bar, `env(safe-area-inset-*)` on overlay.
- **Tests:** unit + integration coverage for boot helpers, version boot, and `AppVersionGuard` (Vitest + node smoke scripts).

## Decisions

- Boot overlay **outside `#root`** — survives React mount/unmount; no portal race on first paint.
- **Hide, not remove** — overlay stays in DOM with `--hidden` / `--fade-out`; avoids reflow flicker and simplifies retry paths.
- Version check **timeout 4 s** — do not block first paint indefinitely on slow/offline API.
- **2 RAF** before hide — wait one painted frame after React commit before starting fade.
- **No PWA / service worker** for this task — loader is pure inline HTML/CSS/JS in `index.html`; no SW registration or install prompt work.

## Risks

- **No real iOS Safari smoke** — safe-area / standalone meta behavior validated by markup + CSS only, not device/browser pass.
- **Inline script/style CSP** — if a strict Content-Security-Policy is added later, inline boot block may need nonce/hash or external chunk.
- **Main chunk size warning** — Vite build may warn on large JS bundle; unrelated to loader artifact but visible in build output.

## Verification

- `npm run lint` — **PASS**, 0 errors, 23 pre-existing warnings.
- `npm run locale:sync` / `locale:sort` / `locale:verify` — **PASS**, 0 missing keys.
- `npm test` — **PASS**, 210 Vitest + 2 node tests.
- `npm run build` — **PASS**; version **0.1.30**.
- Build artifact `dist/index.html` — **11,264 B** raw / **3,289 B** gzip (inline boot payload included).
- Node smoke checks (boot / version scripts) — **PASS**.
- Browser smoke — **skipped** (`browserTesting` not enabled in `AGENTS.md`).

## Git facts

- **repo:** `viwa-client-web-app` (`c:\wiva\viwa-client-web-app`)
- **branch:** `dev` (tracking `origin/dev`)
- **HEAD:** `283ee50` — `fix: показывать недоступный тариф до окончания подписки`
- **commit:** none for this task — **pending**
- **version:** `0.1.30` (`package.json`, unstaged)
- **task scope (uncommitted):**
  - modified: `index.html`, `package.json`, `src/components/AppVersionGuard/AppVersionGuard.tsx`, `src/index.css`, `src/utils/appVersion.ts`, `vitest.config.ts`
  - added: `src/utils/appBoot.ts`, `src/utils/appVersionBoot.ts`, related `*.test.ts(x)` files
- **excluded (unrelated — do not commit with this task):**
  - `docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/cabinet-round5-remediation.md`
  - `docs/agents/cabinet-top-tastes-rebuild/task-site-report.md`

## Next

- Commit **task-only** files above (exclude unrelated cabinet-top-tastes docs).
- Push to `dev`, deploy SPA only.
- Production HTTP smoke: confirm `index.html` serves inline loader, version **0.1.30** in deployed assets, and boot → app transition on cold load / reload.
