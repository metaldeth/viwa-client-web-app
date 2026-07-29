# task-11-review: Deploy runbook + architecture §8 (gates-only docs)

**Session:** `viwa-landing-subscriptions`  
**Task:** [task-11.md](./task-11.md) — deploy runbooks, smoke S1–S8, ordering (gates only)  
**Review agents (parallel):** `review-docs`, `review-general`, `review-final` (`composer-2.5-fast`)  
**Scope (no code changes):** `deploy-runbook.md`, `architecture.md` §8, `plan.md` Wave 4 / task-11, cross-ref `viwa-telemetry/docs/deployment/server.md`, observed topology (orchestrator-log developer-complex entry)

## Files reviewed

| File | Role |
|------|------|
| `deploy-runbook.md` | **NEW** operational runbook |
| `architecture.md` §8 | Topology, static swap, S1–S8, rollback |
| `plan.md` | Wave 4 exit criteria, task-11 gate |
| `tasks/task-11.md` | Acceptance, allowed scope |
| `viwa-telemetry/docs/deployment/server.md` | Canonical telemetry server reference |
| `orchestrator-log.md` | Observed live pointers (read-only verify) |

**Не тронуто (OK):** product code, Docker files, commit/push/deploy execution.

---

## Validation matrix (user checklist)

| Criterion | Status | Notes |
|-----------|--------|-------|
| Commands safe / copy-paste | ⚠️ | Telemetry/client blocks mostly paste-ready; site **upload** is comment-only; mixed `sudo` vs root-SSH |
| Backup before migration (M1) | ✅ | `pg_dump` **before** `prisma migrate deploy`; explicit stop line if migration fails |
| Release symlink ownership | ✅ | `chown -R viwa:viwa` on release; `chown -h viwa:viwa` on `current` after `ln -sfn` |
| Service restart / smoke / rollback | ✅ | `systemctl restart viwa-telemetry-api`; per-layer smoke curls; rollback table + PG restore |
| Site atomic swap | ✅ | staging → `mv` `.prev-${TS}` → live; forbids `rsync --delete` into docroot |
| No Docker | ✅ | Explicit ban; topology = static + symlinks + systemd |
| Correct **`wiva-server`** alias | ✅ | Canonical everywhere; `viwa-server` marked **does not resolve**; cross-ref to server.md |
| No secrets in git | ✅ | `<password>` placeholder only; admin creds “secure store”; api.env not in git |
| S1–S8 honest | ✅ | S3/S7 manual or payment-dependent; **S8** explicitly requires real machine |
| B-17 / B-18 honest | ✅ | Deferred pre-deploy; post-deploy required; **cannot fabricate** without admin DB + hardware |

---

## Acceptance (task-11.md)

| Criterion | Status |
|-----------|--------|
| `deploy-runbook.md`: SSH `wiva-server`, paths, ordering, backup/swap | ✅ |
| Pre-deploy: Wave 1, task-10 browser pass, user confirmation | ✅ Gates A–E |
| Rollback per surface; site <2 min path | ✅ (minor rollback label drift — see 🟡) |
| No auto-deploy; `/task-completion` owns deploy | ✅ |
| PG dump (M1) before telemetry migration | ✅ |

---

## review-docs

### Проблемы

🟡 **Предложение:**
- [`deploy-runbook.md:392-393`] Step 3 site upload — only commented `rsync`; no concrete PowerShell/bash one-liner unlike telemetry/client → operator must infer from architecture §8.
- [`architecture.md:688`] vs [`deploy-runbook.md:59,336`] — client build env: §8 says `VITE_VIWA_TELEMETRY_API_URL=https://tl.vitamin-water.ru/api/v1`; runbook + `.env.production` use `https://cabinet.vitamin-water.ru/api/v1`. Intentional nginx-proxy model (task-09) but **cross-doc contradiction** — add footnote in §8 or align to cabinet URL.
- [`architecture.md:694-696`] vs [`deploy-runbook.md:137-142`] — telemetry release id: §8 table `{gitSha}` only; runbook + live pointer `202607291138-662322e` use `{YYYYMMDD-HHMM}-{gitSha}` — align §8 table.
- [`deploy-runbook.md:471`] Rollback site Option A references `docroot.failed` / `docroot.prev-{TS}`; deploy step uses `${DOCROOT}.prev-${TS}` — naming mismatch in rollback prose.
- [`deploy-runbook.md:211-218`] vs [`architecture.md:737-740`] — site backup/swap: architecture uses `sudo`; runbook omits `sudo` (OK when SSH as root, but copy-paste diverges).
- [`architecture.md:712-713`] Step 2 local commands omit `locale:verify` present in runbook Gate B / Step 2.

### Вывод

⚠️ Runbook is operationally strong; **3 cross-doc drifts** (client API URL, release id, sudo) and **1 incomplete paste block** (site rsync).

---

## review-general

### Суммаризация

**Что решали:** Gates-only deploy documentation for UC-8 — ordered telemetry → client → site, M1 PG backup, atomic site swap, smoke S1–S8, honest B-17/B-18 deferral, rollback without Docker.

**Как работает:** Preflight gates A–E (Wave 1, local build/test, browser 36/0/2 deferred, asset lock, user confirm) → M1 dump + site tar → telemetry release (build, migrate, symlink, restart, curl smoke) → client dist symlink → site staging swap → post-deploy S1–S8 + manual B-17/B-18. Observed topology matches orchestrator read-only verify (`current` pointers, nginx roots, `viwa-telemetry-api` active).

**Валидация логики:** ✅ Ordering rationale (API+CORS before surfaces) sound. ✅ Stop line: failed migration blocks client/site. ✅ B-17/B-18 not marked pre-deploy PASS targets. ⚠️ Client release has no explicit `chown`/perms after `scp` (root-owned dist may work if world-readable; not documented). ⚠️ `scp -r .` example could upload `node_modules` if operator skips rsync variant.

### Проблемы

🔴 **Критично:** не выявлено (docs-only; no deploy execution).

🟡 **Предложение:**
- [`deploy-runbook.md:254-257`] Prefer rsync exclude block as **primary** upload path; demote full-tree `scp -r .` or add “ensure no node_modules” warning.
- [`deploy-runbook.md:348-353`] Client `PREV=$(readlink -f ...)` captured but rollback section expects operator to remember `<prevTS>` — link to `PREV` variable in rollback table.
- [`deploy-runbook.md:320-322`] Disk cleanup references `server.md` but defers full script — acceptable; ensure `/task-completion` agent reads server.md § Release disk cleanup.
- [`viwa-telemetry/docs/deployment/server.md:3,17`] Still canonical `viwa-server`; runbook warning sufficient for this PC — optional upstream note in server.md “dev machine may use `wiva-server`”.

### Новые паттерны

- Single **`deploy-runbook.md`** as operational source of truth with architecture §8 as structural reference — good split; minor sync debt on env URL and release id.

### Вывод

✅ Architecture and runbook fit task-11 scope; ready for `/task-completion` execution with noted doc nits.

---

## review-final

### Статус предыдущих ревью

- review-docs: ⚠️ cross-doc drifts + site upload comment-only
- review-general: ✅ 0 critical; operational flow validated vs observed topology

### Согласованность plan ↔ task-11 ↔ runbook

| Check | Status |
|-------|--------|
| plan.md Wave 4 exit: ordering, S1–S8, M1, 36/0/2 deferred | ✅ |
| task-11 allowed scope respected (docs only, no deploy) | ✅ |
| architecture §8 links to `deploy-runbook.md` | ✅ |
| Browser gate numbers match `browser-test-report.md` reference | ✅ (36 PASS / 0 FAIL / 2 deferred) |
| Migration name `20260729120000_monthly_subscription_and_registration_source` | ✅ exists in repo |
| Docker ban consistent | ✅ |
| `wiva-server` alias consistent in session docs | ✅ |

### S1–S8 / B-17 / B-18 honesty audit

| ID | Pre-deploy blocker? | Fabrication risk | Doc verdict |
|----|---------------------|------------------|-------------|
| S1 | API curl | Low | ✅ |
| S2 | Browser compare | Low | ✅ |
| S3 | Manual admin | Medium — ties B-17 | ✅ labeled |
| S4–S6 | Browser flows | Low with staging | ✅ |
| S7 | SBP / payment | Medium | ✅ “staging/test or production adapter” |
| S8 | Physical QR pour | **High** | ✅ **cannot be fabricated**; refs B-18 |
| B-17 | No (deferred) | **High** | ✅ explicit prerequisites |
| B-18 | No (deferred) | **High** | ✅ explicit machine hardware |

### Новые замечания (финальный взгляд)

🟡 Site rollback Option A label `docroot.failed` does not match deploy `docroot.prev-${TS}` — fix before first production deploy to avoid panic under rollback.

🟡 No `site-version.txt` template added — task-11 listed optional; acceptable omission.

### Итог

✅ **Task-11 docs scope approved** — runbook + §8 cross-links meet acceptance; **hasCriticalIssues: false**.

**Non-blocking follow-ups:** align architecture §8 client API URL + telemetry release id; add concrete site rsync command; harmonize rollback naming and `sudo` usage.

**Downstream:** `/task-completion` — version bump, commits (3 repos), push, execute runbook; B-17/B-18 manual post-deploy.

---

## Strict JSON

```json
{
  "sessionId": "viwa-landing-subscriptions",
  "subtask": "task-11-deploy-runbook-review",
  "date": "2026-07-29",
  "reviewAgents": ["review-docs", "review-general", "review-final"],
  "model": "composer-2.5-fast",
  "hasCriticalIssues": false,
  "filesReviewed": [
    "viwa-client-web-app/docs/agents/viwa-landing-subscriptions/deploy-runbook.md",
    "viwa-client-web-app/docs/agents/viwa-landing-subscriptions/architecture.md",
    "viwa-client-web-app/docs/agents/viwa-landing-subscriptions/plan.md",
    "viwa-client-web-app/docs/agents/viwa-landing-subscriptions/tasks/task-11.md",
    "viwa-telemetry/docs/deployment/server.md"
  ],
  "validationChecklist": {
    "commandsCopyPasteSafe": "partial",
    "backupBeforeMigrationM1": true,
    "releaseSymlinkOwnership": true,
    "serviceRestartSmokeRollback": true,
    "siteAtomicSwap": true,
    "noDocker": true,
    "wivaServerAliasCorrect": true,
    "noSecretsInDocs": true,
    "s1s8Honest": true,
    "b17b18Honest": true
  },
  "acceptance": {
    "deployRunbookPathsOrdering": true,
    "preDeployGates": true,
    "rollbackDocumented": true,
    "noAutoDeploy": true,
    "pgDumpBeforeMigrate": true
  },
  "agentSummaries": {
    "review-docs": { "critical": 0, "suggestions": 6, "status": "pass_with_nits" },
    "review-general": { "critical": 0, "suggestions": 4, "status": "pass" },
    "review-final": { "critical": 0, "suggestions": 2, "status": "pass" }
  },
  "blockers": [],
  "pending": ["task_completion_deploy_execution", "manual_B-17_B-18_post_deploy"],
  "recommendations": [
    "Add concrete site rsync/scp upload command in deploy-runbook Step 3 (not comment-only)",
    "Align architecture.md §8 VITE_VIWA_TELEMETRY_API_URL with .env.production (cabinet proxy) or add dual-URL footnote",
    "Align architecture §8 telemetry release id pattern with observed {YYYYMMDD-HHMM}-{gitSha}",
    "Harmonize site rollback Option A naming with deploy .prev-${TS} convention",
    "Prefer rsync-with-excludes as primary telemetry upload; warn on scp -r . with node_modules",
    "Optional: document client release file ownership after scp"
  ],
  "observedTopologyVerified": {
    "sshAlias": "wiva-server",
    "telemetryCurrent": "202607291138-662322e",
    "clientCurrent": "20260728113442",
    "siteDocroot": "/var/www/vitamin-water-ru",
    "apiService": "viwa-telemetry-api active"
  }
}
```
