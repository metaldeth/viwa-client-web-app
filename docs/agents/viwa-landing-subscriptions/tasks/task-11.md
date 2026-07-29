# task-11: Deploy runbooks + smoke ordering (gates only)

**Зависимости:** task-10

**UC:** UC-8

**Repo:** docs across all three (+ reference `viwa-telemetry/docs/deployment/server.md`)  
**Branch target:** `main` + `dev` + `master` (docs commits only)

## Описание

Подготовить/обновить deploy runbook, ordering telemetry → client → site, post-deploy smoke S1–S8, rollback steps. **Commit/push/deploy НЕ выполнять** — только после `/task-completion` и явного подтверждения пользователя.

## Allowed scope

- `viwa-client-web-app/docs/agents/viwa-landing-subscriptions/deploy-runbook.md` (NEW)
- Cross-links in session `plan.md` / `architecture.md` §8 if gaps found
- `viwa-site/site-version.txt` template (optional)
- **Не** SSH deploy, rsync, migration apply on production
- **Не** version bump / git commit (task-completion)

## Запрет Docker

Не изменять Docker/compose файлы. Deploy topology — static + symlink releases, **без Docker**.

## Deploy ordering (canon)

```
1. viwa-telemetry (tl.vitamin-water.ru + API)
   - Local: lint, typecheck, test, build
   - Server (wiva-server): releases/{gitSha}, prisma migrate deploy, symlink current, systemctl restart viwa-telemetry-api
   - Smoke: GET /public/subscription-levels (2 items), admin login

2. viwa-client-web-app (cabinet.vitamin-water.ru)
   - Local: lint, test, build with VITE_VIWA_TELEMETRY_API_URL production
   - Server: releases/{timestamp}, symlink current
   - Smoke: /register, /auth, /m/{serial}/auth, /home

3. viwa-site (vitamin-water.ru)
   - Pre-deploy tar backup to /var/backups/vitamin-water-ru
   - Staging dir → atomic swap docroot /var/www/vitamin-water-ru
   - Smoke: landing tiers, 14 tastes, CTA links
```

## Post-deploy smoke S1–S8 (from architecture §8)

| ID | Check |
|----|-------|
| S1 | Public tiers → exactly 2 items, monthlyVolumeMl ∈ {12000, 18000} |
| S2 | vitamin-water.ru prices match API |
| S3 | Flow A registration → admin `registrationSource=WEBSITE` |
| S4 | Flow B serial capture succeeds |
| S5 | Flow C returning `/auth` |
| S6 | First reg → URL has no serial |
| S7 | SBP purchase 12 L → monthly pool active |
| S8 | QR pour on staging machine debits monthly pool |

## Rollback summary

| Layer | Action |
|-------|--------|
| Telemetry | Symlink `current` → prev gitSha; PG restore if migration failed |
| Client | Symlink → prev timestamp release |
| Site | `.prev-*` swap or tar restore from backup |
| Mitigation | Hide landing CTA via static HTML patch |

## Acceptance

- [ ] `deploy-runbook.md` documents SSH alias `wiva-server`, paths, ordering, backup/swap
- [ ] Pre-deploy checklist: Wave 1 gate, task-10 browser pass, user confirmation
- [ ] Rollback per surface documented (<2 min site rollback path)
- [ ] Explicit note: **no auto-deploy**; task-completion owns commit/push/deploy
- [ ] PG dump step before telemetry migration (M1)

## Tests / build

Docs-only — verify commands copy-paste match `architecture.md` §8 and `viwa-telemetry/docs/deployment/server.md`.

## Downstream

- **`/task-completion`** — version bump, conventional commits (3 repos), push, ordered deploy, optional `/ci-cd-status` on user request
