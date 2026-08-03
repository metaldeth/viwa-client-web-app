# viwa-client-web-app — AI agent config

| Field | Value |
|-------|-------|
| project | viwa-client-web-app |
| productName | Viwa |
| stack | React, TypeScript, Vite, Redux |
| buildCommand | `npm run build` |
| lintCommand | `npm run lint` |
| testCommand | `npm test` |
| mrTarget | dev |
| versionFormat | semver in package.json; emitted to dist/version.json and __APP_VERSION__ |
| workspace | `c:\viwa` |
| agentRules | `c:\viwa\.cursor\rules\` (общие правила и скиллы — не дублировать в репозитории) |

> **Transitional note (folder cutover task-11):** на этой машине каталог может ещё называться `c:\wiva\wiva-client-web-app`. Целевой workspace — `c:\viwa\viwa-client-web-app`. GitHub remote после rename — `metaldeth/viwa-client-web-app`.

## Notes

- **Client web loyalty/auth/billing** — **`VITE_VIWA_TELEMETRY_API_URL`** (base URL ending before `/client/*` or `/public/*`; e.g. `https://host/api/v1`). All client-web loyalty flows use this override; **do not** call `telemetry-loyalty` or `shaker-billing` for auth, profile, tiers, billing, or public machine entry.
- **Modules on viwa-telemetry:** `authModule`, `loyaltyModule` (client methods), `billingModule`, `publicModule` → `${viwaTelemetryApiUrl}/client/*` or `/public/*`.
- **Legacy URLs** (`loyaltyBaseUrl`, `billingBaseUrl` in `baseUrlFront.ts`) remain for **dashboard/admin** flows only (`fetchClientsList`, `fetchWaterHistoryList`); not used by `/m/:machineSerial/*` routes.
- Legacy backend URLs and gateway route ids (`ishaker.ru`, Telegram bot usernames) are kept when they point to real services — do not rename runtime paths without a coordinated backend change.
- Agent rules/skills: only `c:\viwa\.cursor` (open Cursor from workspace root). Do not add a nested project `.cursor/` or copy foreign rules into this repo.
- Telemetry dashboard (separate repo): `c:\viwa\viwa-telemetry\AGENTS.md`.

## Client web routes

- Entry: `/m/:machineSerial/*` (machine validated via public API before auth UI).
- Auth tokens: client JWT pair in `localStorage` (`api/accessToken`, `api/refreshToken`, `CLIENT_TOKEN` = clientId).
- Live profile on subscription page: WebSocket `ws(s)://<telemetry-host>/api/v1/client/ws?access_token=…` (see `viwa-telemetry` `docs/contracts/client-ws.md`). One-shot `GET /client/me` on mount; no 5s HTTP poll.

## Env (client web loyalty)

| Variable | Purpose |
|----------|---------|
| `VITE_VIWA_TELEMETRY_API_URL` | Base URL for viwa-telemetry client/public REST (e.g. `http://localhost:3000/api/v1`). Required for local loyalty dev; production build must set to deployed telemetry API. |
| `VITE_APP_BASE_URL` | Legacy gateway prefix for dashboard modules only — **not** client-web loyalty flows. |
