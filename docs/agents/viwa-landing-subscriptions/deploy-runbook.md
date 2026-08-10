# Production deploy runbook — viwa-landing-subscriptions

**sessionId:** `viwa-landing-subscriptions`  
**Date:** 2026-07-29 (paths verified read-only on server)  
**UC:** UC-8  
**Status:** gates-only documentation — **no auto-deploy**

> **Ownership:** commit, version bump, push, and ordered production deploy are executed only via **`/task-completion`** after explicit user confirmation. This document prepares commands and checklists; **task-11 does not commit, push, or deploy.**

> **User authorization (2026-07-29):** production deploy is explicitly authorized. Execution still waits for `/task-completion`.

> **Docker:** not used for these surfaces. Do not change Docker/compose files. Topology is static files + symlink releases + systemd API.

---

## SSH access

| Item | Value |
|------|-------|
| **Canonical alias (this dev machine)** | **`wiva-server`** |
| **Do not use** | `viwa-server` — **does not resolve** on this PC (`Could not resolve hostname`) |
| Host | `194.67.74.147` |
| User | `root` |
| Identity | `%USERPROFILE%\.ssh\id_ed25519` |
| Full telemetry server reference | `viwa-telemetry/docs/deployment/server.md` (alias there may say `viwa-server`; on deploy use **`wiva-server`**) |

Connect:

```powershell
ssh wiva-server
```

---

## Pre-deploy gates (must pass before `/task-completion` deploy)

### Gate A — Wave 1 telemetry (staging / CI)

| Check | Command / criterion |
|-------|---------------------|
| T1–T3 | `listMarketingSubscriptionLevels()` → exactly **2** items; `monthlyVolumeMl` ∈ `{12000, 18000}` |
| T4–T6 | Monthly pool invariants; legacy MSK reset preserved |
| T8 | CORS preflight `Origin: https://vitamin-water.ru` → 204 + matching `Access-Control-Allow-Origin` |
| T9–T11 | Auth attribution matrix; `SERIAL_REQUIRED`; existing client attribution immutable |
| Staging HTTP | `GET https://tl.vitamin-water.ru/api/v1/public/subscription-levels` → 200, `items.length === 2` |
| Staging HTTP | `GET https://tl.vitamin-water.ru/api/v1/public/tastes` → 200, 14 items |

### Gate B — Local verification (all three repos)

| Repo | Branch target | Commands | Required result (2026-07-29 baseline) |
|------|---------------|----------|--------------------------------------|
| `viwa-telemetry` | `main` | `npm run lint` → `npm run typecheck` → `npm test` → `npm run build` | API **335** pass (+ integration skip without `DATABASE_URL`); web **502** pass; lint/typecheck/build **0** |
| `viwa-client-web-app` | `main` | `npm run lint` → `npm run locale:verify` → `npm test` → `npm run build` | **42** total tests (40 Vitest + 2 node regression); lint **0 errors**; locale 47 keys; build **0** |
| `viwa-site` | `master` | `powershell -File scripts/static-regression-check.ps1` | static regression **PASS**; `useMockApi: false`; no hardcoded tier prices in HTML |

Production client build env (from `.env.production` or inline export; **build fails without valid value**):

```text
VITE_VIWA_TELEMETRY_API_URL=https://cabinet.vitamin-water.ru/api/v1
```

Copy `.env.production.example` → `.env.production` for local production builds. The Vite config validates this at `npm run build` time (https URL, path ends with `/api/v1`, no localhost) to prevent shipping `undefinedapi/v1` bundles.

Site public fetch (browser CORS to telemetry origin):

```text
https://tl.vitamin-water.ru/api/v1
```

(configured in `viwa-site/js/config.js` — `apiBaseUrl`)

### Gate C — Browser gate (task-10)

| Metric | Result |
|--------|--------|
| Automated scenarios B-1…B-16 | **36 PASS / 0 FAIL** |
| Post-deploy deferred | **2** — **B-17**, **B-18** |
| Report | `browser-test-report.md` |

**Pre-deploy clear:** all local automated browser rows pass. **B-17** and **B-18** are **not** fabrication targets — run only after production/staging deploy with real admin DB and physical machine access.

### Gate D — Asset pipeline (before packaging site + client)

**Lock rule (mandatory):**

1. Run **`viwa-site/scripts/verify-assets-idempotent.ps1` alone** — it holds `assets/.staging-viwa-assets/processor.lock`.
2. **Do not** run `process-viwa-assets.py` while Vite dev server or another processor holds files under `assets/generated/` or `public/assets/viwa/` (WinError 32 / partial tree).
3. Processor uses **staging-first → validate → atomic publish** (site dir swap; client per-file retry).
4. Pre-deploy gate must pass: processor ×2 + static-regression ×2 + manifest triple-sync + logo hash unchanged.

**Canonical logo (no droplet):**

| Artifact | Requirement |
|----------|-------------|
| Source | Diagonal-cut **VIWA wordmark only** — `logo-viwa-mark.svg`, viewBox **277×243**, single `currentColor` path |
| **Forbidden** | Legacy droplet PNG/SVG (`512×512`, water-drop mark) |
| SVG SHA256 (canonical = site = client) | `7f41f638f06917260e19b5e09e956fa66c350abf2c8bf20857f1ad6a484b129e` |
| Manifest SHA256 (triple-sync) | `cb431680e5bf0d75579ce6c7b1acbebde24c5cc7509d02c3102359c7ed0dbeb5` |
| Verify | `powershell -File viwa-site/scripts/static-regression-check.ps1` (droplet guards) |

Regenerate assets only via:

```powershell
cd c:\wiva\viwa-site
powershell -File scripts/verify-assets-idempotent.ps1
```

### Gate E — User confirmation

- [ ] User re-confirms production deploy window (authorized 2026-07-29; repeat at `/task-completion` if days elapsed)
- [ ] Rollback artifacts plan acknowledged (PG dump, prev release symlinks, site tar)
- [ ] `/ci-cd-status` — **only if user separately requests** CI monitoring after push

---

## Production topology (validated 2026-07-29 via `ssh wiva-server`)

| Hostname | nginx `root` / target | Release layout | Process / owner |
|----------|----------------------|----------------|-----------------|
| **`tl.vitamin-water.ru`** | `/opt/viwa-telemetry/current/apps/web/dist` | `/opt/viwa-telemetry/releases/{releaseId}` → symlink `current` | API: systemd **`viwa-telemetry-api`** (User **`viwa`**); `/api/` → `127.0.0.1:3000` |
| **`cabinet.vitamin-water.ru`** | `/opt/viwa-client-web-app/current` | `/opt/viwa-client-web-app/releases/{YYYYMMDD-HHMMSS}` → symlink `current` | Static SPA; API via nginx proxy / direct `tl.*` for public CORS from site |
| **`vitamin-water.ru`** | `/var/www/vitamin-water-ru` | In-place static tree (no symlink release) | Owner **`www-data:www-data`** |

**Observed live pointers (2026-07-29):**

```text
/opt/viwa-telemetry/current → /opt/viwa-telemetry/releases/202607291138-662322e
/opt/viwa-client-web-app/current → /opt/viwa-client-web-app/releases/20260728113442
/var/www/vitamin-water-ru — docroot exists (www-data)
viwa-telemetry-api — active
Disk / — ~22% used (~28G VPS)
```

**Env / secrets (not in git):**

- API: `/etc/viwa-telemetry/api.env` — `DATABASE_URL=postgresql://viwa:<password>@127.0.0.1:5432/viwa_telemetry`
- PostgreSQL **18.4** on `127.0.0.1:5432`

**Release ID conventions:**

| Repo | Release id |
|------|------------|
| `viwa-telemetry` | `{YYYYMMDD-HHMM}-{gitSha}` or git SHA (match existing `/opt/viwa-telemetry/releases/*` pattern) |
| `viwa-client-web-app` | `{YYYYMMDD-HHMMSS}` timestamp |
| `viwa-site` | Backup timestamp `{YYYYMMDD-HHMMSS}` under `/var/backups/vitamin-water-ru/` |

---

## Deploy order (strict)

```text
1. viwa-telemetry   (API + admin + tl web static)
2. viwa-client-web-app   (cabinet SPA)
3. viwa-site   (vitamin-water.ru landing)
```

**Rationale:** API migration + public tiers/CORS must be live before cabinet and landing fetch prices; cabinet deep-links should exist before landing CTA goes live.

---

## Pre-flight checklist (day of deploy)

- [ ] All gates A–E green
- [ ] `git fetch --all --prune` in each repo; on target branch (`main` / `master` for site)
- [ ] Version bump per repo `AGENTS.md` / `commits.mdc` (done in `/task-completion`, not task-11)
- [ ] Maintenance window communicated (telemetry API restart ~ seconds; site swap ~ seconds)
- [ ] **M1 — PostgreSQL dump** captured **before** `prisma migrate deploy` (see below)
- [ ] Previous release IDs noted for rollback (`readlink -f /opt/viwa-telemetry/current`, client `current`, site tar path)
- [ ] Asset idempotent gate PASS; logo/manifest hashes match § Gate D
- [ ] No Docker changes

---

## Backups

### M1 — PostgreSQL dump (mandatory before telemetry migration)

Run on server **before** switching symlink and **before** `npx prisma migrate deploy` for migration `20260729120000_monthly_subscription_and_registration_source` (and any newer pending migrations).

```bash
ssh wiva-server

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR=/root/backups/viwa-landing-subscriptions
mkdir -p "$BACKUP_DIR"

# Custom format (recommended for pg_restore)
sudo -u postgres pg_dump -Fc -d viwa_telemetry -f "$BACKUP_DIR/viwa_telemetry-pre-migrate-${TS}.dump"

# Optional plain SQL second copy
sudo -u postgres pg_dump -d viwa_telemetry > "$BACKUP_DIR/viwa_telemetry-pre-migrate-${TS}.sql"

# Verify non-empty
ls -lh "$BACKUP_DIR"/viwa_telemetry-pre-migrate-${TS}.*
```

**Gate:** archive exists and size > 0; copy off-server to secure storage when possible.

**Restore (telemetry rollback — migration failed):**

```bash
systemctl stop viwa-telemetry-api
sudo -u postgres dropdb viwa_telemetry
sudo -u postgres createdb -O viwa viwa_telemetry
sudo -u postgres pg_restore -d viwa_telemetry "$BACKUP_DIR/viwa_telemetry-pre-migrate-${TS}.dump"
# Revert symlink to previous release (see Rollback § Telemetry)
systemctl start viwa-telemetry-api
```

### Site static backup (mandatory before site deploy)

```bash
ssh wiva-server

TS=$(date +%Y%m%d-%H%M%S)
BACKUP_ROOT=/var/backups/vitamin-water-ru
mkdir -p "$BACKUP_ROOT"

tar -czf "$BACKUP_ROOT/pre-deploy-${TS}.tar.gz" -C /var/www vitamin-water-ru
tar -tzf "$BACKUP_ROOT/pre-deploy-${TS}.tar.gz" | head
```

Retain at least **2** recent `pre-deploy-*.tar.gz` until smoke S1–S8 pass.

### Optional telemetry rollback artifacts

Per `viwa-telemetry/docs/deployment/server.md`:

- nginx config snapshot (e.g. `/root/rollback-nginx-{timestamp}/`)
- copy of `/etc/viwa-telemetry/api.env` (secure, not git)

---

## Step 1 — Deploy `viwa-telemetry`

### Local (dev machine)

```powershell
cd c:\wiva\viwa-telemetry
npm run lint
npm run typecheck
npm test
npm run build
```

Record git SHA for release folder name:

```powershell
git rev-parse --short HEAD
```

### Upload release artifact

From local repo root after build (example — adjust paths to your rsync/scp tooling):

```powershell
$RELEASE = "20260729-1430-$(git rev-parse --short HEAD)"  # example pattern
scp -r . wiva-server:/opt/viwa-telemetry/releases/$RELEASE/
```

Or rsync excluding `.git`:

```powershell
rsync -av --delete --exclude .git --exclude node_modules ./ wiva-server:/opt/viwa-telemetry/releases/$RELEASE/
```

On server, install deps and build if artifact is source tree:

```bash
ssh wiva-server

RELEASE=/opt/viwa-telemetry/releases/<releaseId>
cd "$RELEASE"
npm ci
npm run build
chown -R viwa:viwa "$RELEASE"
```

### M1 already done → apply migrations

```bash
PREV=$(readlink -f /opt/viwa-telemetry/current)

cd /opt/viwa-telemetry/releases/<releaseId>/apps/api
sudo -u viwa npx prisma migrate deploy
```

**Post-migrate audit** (each must return `0` for marketing tiers):

```bash
sudo -u postgres psql -d viwa_telemetry -c \
  "SELECT COUNT(*) FROM subscription_levels WHERE is_marketing_visible = true AND monthly_volume_ml IN (12000, 18000);"
# Expect: 2
```

### Activate release

```bash
ln -sfn /opt/viwa-telemetry/releases/<releaseId> /opt/viwa-telemetry/current
chown -h viwa:viwa /opt/viwa-telemetry/current
systemctl restart viwa-telemetry-api
systemctl is-active viwa-telemetry-api
journalctl -u viwa-telemetry-api -n 50 --no-pager
```

### Telemetry smoke (immediate)

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://tl.vitamin-water.ru/login
curl -sS https://tl.vitamin-water.ru/api/v1/public/subscription-levels | jq '.items | length'
# Expect HTTP 200 and items length 2

curl -sS -I -X OPTIONS https://tl.vitamin-water.ru/api/v1/public/subscription-levels \
  -H 'Origin: https://vitamin-water.ru' -H 'Access-Control-Request-Method: GET' | grep -i access-control
```

Admin login smoke (manual or scripted with credentials from secure store — never commit):

- `POST /api/v1/auth/login` → session cookie `viwa_session`
- `GET /api/v1/auth/me` → 200

### Disk cleanup (mandatory after telemetry deploy)

Per `docs/deployment/server.md` — keep **`current` + 1 previous** release under `/opt/viwa-telemetry/releases/`; delete older dirs; record `df -h /` before/after.

---

## Step 2 — Deploy `viwa-client-web-app`

### Local

```powershell
cd c:\wiva\viwa-client-web-app
npm run lint
npm run locale:verify
npm test
npm run build
# Uses .env.production → VITE_VIWA_TELEMETRY_API_URL=https://cabinet.vitamin-water.ru/api/v1
```

### Upload `dist/`

```powershell
$TS = Get-Date -Format "yyyyMMddHHmmss"
scp -r dist/* wiva-server:/opt/viwa-client-web-app/releases/$TS/
```

On server:

```bash
TS=<YYYYMMDD-HHMMSS>
PREV=$(readlink -f /opt/viwa-client-web-app/current)

ln -sfn /opt/viwa-client-web-app/releases/$TS /opt/viwa-client-web-app/current
# nginx serves /opt/viwa-client-web-app/current — no systemd restart required

curl -sS -o /dev/null -w "%{http_code}\n" https://cabinet.vitamin-water.ru/
curl -sS -o /dev/null -w "%{http_code}\n" https://cabinet.vitamin-water.ru/register?entry=website
curl -sS -o /dev/null -w "%{http_code}\n" https://cabinet.vitamin-water.ru/auth
```

Verify mirrored assets under `current/assets/viwa/` including logo SVG hash if needed.

---

## Step 3 — Deploy `viwa-site`

### Local

```powershell
cd c:\wiva\viwa-site
powershell -File scripts/verify-assets-idempotent.ps1
powershell -File scripts/static-regression-check.ps1
# Confirm js/config.js: useMockApi false, apiBaseUrl https://tl.vitamin-water.ru/api/v1
```

Optional version stamp (for support):

```text
# site-version.txt at repo root — plain text deploy timestamp or manifest version
2026-07-29T14:30:00Z manifest=1.0.0
```

### Site backup already done (§ Backups) → atomic swap

On server:

```bash
TS=$(date +%Y%m%d-%H%M%S)
STAGING=/var/www/vitamin-water-ru-staging-${TS}
DOCROOT=/var/www/vitamin-water-ru

mkdir -p "$STAGING"
# From dev machine: rsync -av ./ wiva-server:$STAGING/
# Include index.html, css/, js/, assets/, icons/, legacy pages

chown -R www-data:www-data "$STAGING"
find "$STAGING" -type d -exec chmod 755 {} \;
find "$STAGING" -type f -exec chmod 644 {} \;

test -f "$STAGING/index.html"

mv "$DOCROOT" "${DOCROOT}.prev-${TS}"
mv "$STAGING" "$DOCROOT"

nginx -t && systemctl reload nginx
```

**Never** `rsync --delete` directly into live `$DOCROOT` without backup + staging.

### Site smoke (immediate)

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://vitamin-water.ru/
curl -sS -o /dev/null -w "%{http_code}\n" https://vitamin-water.ru/assets/generated/logo/logo-viwa-mark.svg
```

Browser: DevTools → Network → landing fetch to `tl.vitamin-water.ru/api/v1/public/subscription-levels` (CORS 200).

---

## Post-deploy smoke S1–S8

Map to architecture §8 and browser scenarios where applicable.

| ID | Check | How to verify |
|----|-------|---------------|
| **S1** | Public tiers → exactly **2** items; `monthlyVolumeMl` ∈ `{12000, 18000}`; no legacy rows | `curl -sS https://tl.vitamin-water.ru/api/v1/public/subscription-levels \| jq '.items'` |
| **S2** | `vitamin-water.ru` prices match API | Browser: tier cards show same `priceKopecks` as S1 (499/699 ₽ display); no stale hardcoded HTML prices |
| **S3** | Flow A registration → admin `registrationSource=WEBSITE` | Landing with serial+`entry=website` → complete new reg → admin client card (**B-17**) |
| **S4** | Flow B serial capture succeeds | `cabinet/register?entry=website` → enter valid serial → OTP path |
| **S5** | Flow C returning `/auth` without serial | Existing client login → `/home` |
| **S6** | First reg → URL has no serial | After OTP on `/m/{serial}/auth` → `/home` clean URL |
| **S7** | SBP purchase 12 L → monthly pool active | Staging/test SBP or production payment adapter; profile shows `monthlyLimitMl=12000`, pool active |
| **S8** | QR pour on staging machine debits monthly pool | **Requires real machine** — see B-18 (**cannot be fabricated**) |

---

## Post-deploy deferred — B-17 and B-18

These were **DEFERRED** in the task-10 browser gate (2 of 38 rows). They are **required after deploy** but **not** pre-deploy blockers.

### B-17 — Admin WEBSITE attribution

| Field | Value |
|-------|-------|
| **Prerequisites** | Production/staging telemetry admin login; migration with `registration_source` applied; new client registration via landing flow |
| **Flow** | Landing with `serial` + `entry=website` → complete registration → telemetry admin → client card |
| **Expect** | **Registration source: Website** (`WEBSITE`); optional registration machine serial if serial was supplied |
| **Cannot fabricate without** | Live admin dashboard + DB write from real OTP registration |

### B-18 — Network-wide QR pour

| Field | Value |
|-------|-------|
| **Prerequisites** | Client with **active monthly subscription** (S7); **physical staging or production machine** different from registration machine; operator access to complete pour |
| **Flow** | Note `monthlyRemainingMl` → scan client QR at **different** machine → pour → refresh profile |
| **Expect** | Pour accepted network-wide; `monthlyUsedMl` increased once; no spurious MSK daily reset on monthly tier |
| **Cannot fabricate without** | Accessible staging/real machine hardware — **do not mark PASS from mocks alone** |

Document results in `browser-test-report.md` and `TEMP_TEST_SCENARIOS.md` execution log after manual run.

---

## Rollback

Target: **< 2 min** for site-only rollback; telemetry may take longer if PG restore required.

| Layer | When | Action |
|-------|------|--------|
| **Telemetry** | API error / bad migration | `systemctl stop viwa-telemetry-api` → `ln -sfn "$PREV" /opt/viwa-telemetry/current` → `systemctl start viwa-telemetry-api`. If migration applied and broken → **PG restore** from M1 dump |
| **Client** | Cabinet regression | `ln -sfn /opt/viwa-client-web-app/releases/<prevTS> /opt/viwa-client-web-app/current` (instant) |
| **Site** | Landing regression | **Option A:** `mv docroot.failed` + `mv docroot.prev-{TS} docroot` (< 2 min). **Option B:** `tar -xzf /var/backups/vitamin-water-ru/pre-deploy-{TS}.tar.gz -C /var/www` + `chown www-data` |
| **Mitigation** | Client/API down but site up | Patch `index.html` CTA block to «Кабинет временно недоступен» from backup single file — limits bad registrations |

**Stop line:** if telemetry migration fails — **do not** deploy client or site; restore PG or revert symlink first.

---

## Related documents

- `architecture.md` §8 — topology, S1–S8, static swap
- `plan.md` — Wave 4 / task-11 scope
- `browser-test-report.md` — 36 PASS / 0 FAIL / 2 deferred
- `viwa-telemetry/docs/deployment/server.md` — systemd, nginx, Prisma, disk cleanup
- `TEMP_TEST_SCENARIOS.md` — B-1…B-18 matrix
- `/task-completion` — version bump, commits (3 repos), push, execute this runbook
