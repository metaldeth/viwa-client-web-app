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
| workspace | `c:\viwa` |
| agentRules | `c:\viwa\.cursor\rules\` (общие правила и скиллы — не дублировать в репозитории) |

> **Transitional note (folder cutover task-11):** на этой машине каталог может ещё называться `c:\wiva\wiva-client-web-app`. Целевой workspace — `c:\viwa\viwa-client-web-app`. GitHub remote после rename — `metaldeth/viwa-client-web-app`.

## Notes

- Legacy backend URLs and gateway route ids (`ishaker.ru`, `shaker-billing`, Telegram bot usernames) are kept when they point to real services — do not rename runtime paths without a coordinated backend change.
- Agent rules/skills: only `c:\viwa\.cursor` (open Cursor from workspace root). Do not add a nested project `.cursor/` or copy foreign rules into this repo.
- Telemetry dashboard (separate repo): `c:\viwa\viwa-telemetry\AGENTS.md`.
