# wiva-client-web-app

Mobile-oriented web client for **Wiva** (React, TypeScript, Vite, Redux). Part of the Wiva workspace (`c:\wiva`); shared agent rules live in `c:\wiva\.cursor`.

Backend API paths and dev hosts may still reference legacy infrastructure where required for compatibility — do not rename gateway routes or infra URLs without a coordinated backend change.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run lint
npm test
```

## Environment

Copy `.env` and configure `VITE_APP_*` variables for auth, API base URL, and Telegram bots.

Optional Telegram bot usernames (defaults preserve legacy bot handles):

- `VITE_APP_TELEGRAM_SUPPORT_BOT` — support bot username without `@`
- `VITE_APP_TELEGRAM_DEV_ALERT_BOT` — dev telemetry alert bot username without `@`
