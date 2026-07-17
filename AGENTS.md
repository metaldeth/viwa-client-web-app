# wiva-client-web-app — AI agent config

| Field | Value |
|-------|-------|
| project | wiva-client-web-app |
| productName | Wiva |
| stack | React, TypeScript, Vite, Redux |
| buildCommand | `npm run build` |
| lintCommand | `npm run lint` |
| testCommand | `npm test` |
| mrTarget | dev |
| workspace | `c:\wiva` |
| agentRules | `c:\wiva\.cursor\rules\` (общие правила и скиллы — не дублировать в репозитории) |

## Notes

- Legacy backend URLs and gateway route ids (`ishaker.ru`, `shaker-billing`, Telegram bot usernames) are kept when they point to real services — do not rename runtime paths without a coordinated backend change.
- Agent rules/skills: only `c:\wiva\.cursor` (open Cursor from workspace root). Do not add a nested project `.cursor/` or copy foreign rules into this repo.
