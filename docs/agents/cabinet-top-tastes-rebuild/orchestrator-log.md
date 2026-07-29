# Orchestrator log — cabinet-top-tastes-rebuild (telemetry)

| Step | Status | Notes |
|------|--------|-------|
| Inspect git diff | done | Clean `main`; only untracked `.cursor/` ignored |
| Prisma model + migration | done | `client_taste_pour_stats`, snapshot column, backfill SQL |
| Domain stats on pour | done | Transactional product lookup, upsert, top-3 read |
| PUT deprecation | done | 410 `GONE` |
| WS / offline push | done | Reconcile pushes profile on accepted non-idempotent |
| Contracts | done | REST + client WS |
| Tests | done | Unit pass; DB integration skipped without `DATABASE_URL` |
| lint / typecheck / build | done | All green |

**Deliverable:** `task-telemetry-report.md` in this directory.

**Blockers:** none (T-C1 fixed round-1).

**Handoff:** client web task can drop `PUT /me/favorite-tastes` calls and manual selection UX.

## Round-1 fix (2026-07-29)

- T-C1: pour-before-debit + outer P2002 handler — `rounds/round-1/telemetry-review-resolution.md`

---

## Landing verification — Round 1 of 5 (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Parallel code review (general, styles, performance, docs, final) | done | `rounds/round-1/landing-code-review.md` |
| Static regression re-run | done | `viwa-site/scripts/static-regression-check.ps1` → PASS |
| Reference 897×867 pixel QA | pending | Round 2 browser |
| hasCriticalIssues | **true** | C1 science copy, C2 header CTA 36px touch, C3 untracked landing assets |

**Deliverable:** `rounds/round-1/landing-code-review.md`

**Blockers for sign-off:** exact science copy, mobile touch target, stage landing generated assets before deploy.

**Next:** Round 2 visual QA at 897×867 + mobile 360/390/430; address C1–C3 before commit/deploy.

---

## Round 1 — telemetry backend review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| review-general | done | TOP-3 OK; T-C1 P2002 double deduct; T-N18 PUT 400-before-410 |
| review-performance | done | Index OK; T-C3 backfill; push re-fetches status |
| review-docs | done | Core OK; stale `INVALID_TASTE`; WS gaps; JSDoc missing |
| review-final | done | Completeness OK; typecheck blockers it reported already fixed on re-check |
| Deliverable | final | `rounds/round-1/telemetry-review.md` — Round 1 complete |

**Critical:** T-C1 requestUuid double deduct; T-C2 DB tests skipped; T-C3 migration backfill lock risk.

**Merged:** [review-docs](c48845d7-f219-4a58-b0a6-24792033d805), [review-performance](15751138-923d-496c-8e16-ac5902d5e524), [review-general](59b24c05-e7d6-406e-8be8-20e06fb639e2), [review-final](b7a20dbc-69b1-4024-96f1-cf789d708bbb).

**Re-check after final:** `typecheck` exit 0; loyalty + util unit tests 20 passed. Final’s TS/Jest matchers are resolved; stage migration/files + version bump still required before commit.

**Verdict:** `hasCriticalIssues: true` — T-C2/T-C3 gates remain; **T-C1 fixed** (round-1 fix 2026-07-29).

---

## Round 2 — telemetry backend re-review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| T-C1 fix verification | done | Create-before-debit, outer P2002, post-lock idempotency — approved |
| Regression scan | done | Migration, top order, 410, offline push — no regressions |
| Unit tests | done | 32 passed; typecheck exit 0 |
| DB integration gate | **closed** | strict `client-api` 15/15 on wiva-server (`20260729225815`); combined 17/17 incl. concurrency |
| Deliverable | done | `rounds/round-2/telemetry-review.md` |

**hasCriticalIssues:** `true` (T-C2 DB gate, T-C3 ops gate — no code blockers)

**DB integration gate:** OPEN — requires PostgreSQL CI for concurrency + REST E2E tests.

### Round-1 fix — T-C1 (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Refactor `recordSubscriptionPour` tx order | done | create before debit; outer P2002 |
| Unit tests (order, failure, mismatch) | done | `loyalty-domain.service.spec.ts` |
| PG concurrency spec | done | `loyalty-domain-pour-concurrency.spec.ts` (`describeIfDb`) |
| lint / typecheck / build | done | 347 passed (170 skipped) |
| Resolution log | done | `rounds/round-1/telemetry-review-resolution.md` |

## Landing Round 1 pixel+browser — 2026-07-29

- **Result:** FAIL
- **SSIM:** 0.259 | **Similarity:** 0.2668 | **Diff:** 50.2%
- **Functional failures:** 0
- **Report:** `rounds/round-1/landing-pixel-browser-report.md`

## Landing Round 1 code fixes — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| C1 science copy | fixed | exact reference sentence + CSS wrap |
| C2 header CTA touch | fixed | 44px at 430–767 |
| C3 landing assets git | deferred | on-disk + static gate OK; commit at final |
| Header 60px border-box | fixed | was 61px measured |
| Hero logo ~210px | tuned | clamp 23.4vw max 210px — Round 2 re-measure |
| Typography / layout tune | fixed | nav, hero rhythm, bento, feature, bottom |
| A11y/perf low-risk | partial | main landmark, menu aria/focus, lazy bento row |
| `static-regression-check.ps1` | PASS | processor skipped |
| Round 2 pixel QA | pending | separate agent |

**Deliverable:** `rounds/round-1/landing-fix-resolution.md`

---

## Cabinet client Round 1 pixel+browser — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Vite dev + API mocks | done | Profile 780/1000, top-3 tastes, 499₽ «Старт», QR; no product edits |
| Screenshots 399/360/390/430 + desktop 1440 | done | `rounds/round-1/*.png` |
| Masked pixel compare vs canonical 399×832 | done | Similarity **0.6517**, diff **35.3%** |
| Functional smoke | done | PASS (FLOW hidden, modals, nav SPA, placeholders, no PUT) |
| Responsive 360/390/430 | done | PASS — no horizontal scroll |

- **Result:** **FAIL** (pixel gate; functional OK)
- **Report:** `rounds/round-1/pixel-browser-report.md`
- **Top gaps:** taste row missing card shell; apricot asset → «АБ» placeholder; header menu/bell horizontal vs stacked reference; dual active bottom-nav links; reference includes device bezel
- **Next:** Round 2 after client CSS/asset fixes

## Client Round 1 fixes — 2026-07-29

- Taste row always 3 slots + dark card shell; header trailing stack; plan price-only; single active nav
- Pixel fixture: `peach-mango` (canonical); QR + taste circles masked in metric
- `.env.production` gitignored; 57 tests pass; build pass
- **Report:** `rounds/round-1/fix-resolution.md`, `task-client-report.md`

## Cabinet client Round 2 pixel+browser — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Fresh Vite dev + mocks | done | Canonical fixture `raspberry/lime/peach-mango`; fair mask (bezel+QR+fruit) |
| Screenshots 399/360/390/430 + desktop | done | `rounds/round-2/*.png` |
| Metrics vs reference + Round 1 delta | done | Similarity **0.6566** (+0.0049), SSIM **0.4633**, diff **31.8%** (−3.5pp), RMSE **74.71** (−11.86) |
| Geometry delta vs R1 | done | taste card **r:0→20**; header **+60px** (stacked layout); progress **+46px** min-height |
| Functional smoke (catalog load/success/error) | done | **PASS** — 15/15 checks |
| Responsive 360/390/430 | done | PASS — no overflow |

- **Result:** **FAIL** (pixel gate <0.72 / >8% diff; functional + responsive PASS)
- **Report:** `rounds/round-2/pixel-browser-report.md`
- **Remaining pixel gaps:** header title row vs reference center grid; QR subtitle typography; reference fruit labels differ from canonical fixture (apricot vs peach-mango masked)
- **Next:** Round 3 — header grid alignment, QR copy rhythm, optional content-only reference export


- **Result:** FAIL
- **SSIM:** 0.2042 | **Similarity:** 0.2365 | **Diff:** 50.3%
- **Δ vs R1:** SSIM -0.055, diff 0.1pp
- **Functional failures:** 0
- **Report:** `rounds/round-2/landing-pixel-browser-report.md`

## Landing verification — Round 2 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Parallel code review (general, styles, performance, docs, final) | done | `rounds/round-2/landing-code-review.md` |
| C1 science copy re-verify | done | ✅ exact reference + `science-exact-v1` hook |
| C2 header CTA touch re-verify | done | ✅ 44px @430–767 |
| C3 landing assets git | deferred | ⏸ deploy gate at final commit |
| Header 60px / logo ~210 @897 | done | ✅ browser geometry: header 60px, logo h=209.9px |
| Static regression re-run | done | PASS |
| Pixel SSIM @897 | FAIL | 0.204 — Round 3 tuning |
| hasCriticalIssues (code) | **false** | C1/C2 resolved; new regressions non-blocking |

**New regressions:** R2-S7 flash `invert(1)` breaks N10 accent; R2-F3 Escape refocuses hamburger when menu closed.

**Deliverable:** `rounds/round-2/landing-code-review.md`

**Next:** Round 3 — fix flash invert + Escape guard; continue pixel tuning; stage landing assets at commit.

---

## Landing Round 2 geometry fixes — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Canonical 897×867 measurement applied | done | 68/531/66/202 rows; 36.57/28.43/35 cols; bento 228/303; bottom quad order |
| R2-S7 flash invert | fixed | `--flash` icon `filter: none` |
| R2-F3 Escape / menu focus | fixed | `isMenuOpen()` + `setMenu` same-state no-op |
| Fonts non-blocking | fixed | HTML link/preload; removed CSS `@import` |
| LCP policy | fixed | hero logo high priority; bento/bottom lazy |
| README 24-asset bento | fixed | removed concept-16 / split references |
| `static-regression-check.ps1` | **PASS** | Round 2 hooks |
| Processor | skipped | no asset pipeline change |
| Pixel browser rerun | not requested | Round 3 gate |
| Commit / deploy | not performed | per user |

**Deliverable:** `rounds/round-2/fix-resolution.md`

**Open:** C3 landing assets git staging at final commit; Round 3 pixel QA.

---

## Landing verification — Round 3 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent code review (post geometry rewrite) | done | `rounds/round-3/landing-code-review.md` |
| Round 2 fix re-verify (68/531/66/202, cols, bento, bottom quad) | done | ✅ tokens + CSS + HTML hooks |
| R2-S7 flash invert / R2-F3 Escape | done | ✅ resolved in code |
| Fonts non-blocking / LCP policy | done | ✅ link/preload; hero high only; bento/bottom lazy |
| Static regression re-run | done | **PASS** |
| Mobile 360/390/430 touch (code analysis) | done | ⚠️ bottom strip links R3-S4; header CTA hidden <430 |
| Pixel SSIM @897 | not rerun | last 0.204 (Round 2) |
| hasCriticalIssues (code) | **false** | C3 deploy gate only |

**Deliverable:** `rounds/round-3/landing-code-review.md`

**Next:** Round 3/4 pixel browser @897 + mobile; stage landing assets at commit; optional R3-S4 bottom link touch.

---

## Cabinet client verification — Round 2 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Parallel code review (general, renderer, styles, performance, docs, final) | done | `rounds/round-2/code-review.md` |
| C1 `.env.production` gitignore re-verify | done | ✅ `.gitignore:21`; not in changeset |
| C2 always 3 taste slots (load/error) re-verify | done | ✅ slots sync from keys; tests pass |
| Card shell / header stack / plan aria / single nav | done | ✅ Round 1 fixes verified in code |
| Canonical keys (`peach-mango`) + cache | done | ✅ fixture test + `publicTastesCatalogCache` |
| Progress/QR tuning | done | ✅ min-height 150px, two-line QR subtitle |
| lint / locale / test / build re-run | done | 0 lint errors; 67 keys; 57 tests; build OK |
| Pixel/browser @399×832 | pending | Round 2 browser agent |
| hasCriticalIssues (code) | **false** | C1/C2 resolved; no new code blockers |

**New regressions:** R2-A1 machine-path nav `aria-current` vs `NavLink` active mismatch; R2-P1 no catalog cache unit test.

**Deliverable:** `rounds/round-2/code-review.md`

**Next:** Round 2 pixel/browser rerun; Round 3 — R2-A1 nav a11y + cache test + integration smoke.


## Cabinet backend Round 2 — PostgreSQL integration (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Isolated temp DB on wiva-server | done | `viwa_top3_test_20260729225124`, localhost PG only |
| `prisma migrate deploy` (25 migrations) | PASS | includes `client_taste_pour_stats` |
| Backfill idempotency + TOP-3 ordering | PASS | 5 keys, 1100 ml, EXPLAIN ~0.062 ms |
| `loyalty-domain-pour-concurrency.spec.ts` | PASS | replay + stat increment (2 tests) |
| `client-api` TOP-3 / PUT410 | PASS | T07-3 fix: trial `limitResetsAt: null` |
| Strict `client-api` rerun (`20260729225815`) | **PASS** | 15/15 `--runInBand --no-cache`; T07-3 green |
| Cleanup DB/role/tmp dir | PASS | both sessions verify absent |

- **Result:** **PASS** — strict `client-api` gate **15/15** on isolated PostgreSQL (combined gate 17 = 15 client-api + 2 concurrency)
- **Report:** `rounds/round-2/postgres-integration-report.md`
- **T07-3 root cause:** stale assertion; trial client `limitResetsAt: null` per `loyalty-client-rest.md` monthly semantics (production correct)

## Landing Round 3 pixel+browser — 2026-07-29

- **Pixel:** FAIL | **Functional:** FAIL | **Overall:** FAIL
- **SSIM:** 0.5342 | **Similarity:** 0.449 | **Diff:** 37.9% | **Δ vs R1:** SSIM 0.275, diff -12.3pp | **Δ vs R2:** SSIM 0.330, diff -12.4pp
- **Functional failures:** 1
- **Report:** `rounds/round-3/landing-pixel-browser-report.md`

---

## Landing Round 3 → Round 4 fixes — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Board column minmax 36.57/28.43/35 + bento 255/314 | done | x boundaries 0/328/583/897 verified @897 |
| Hero logo 277×243, title 44px/2-line, body 14px | done | y≈118; condensed weight 400 |
| Header logo 54×29, CTA x747, accent #4A247D | done | padding-right 25px desktop |
| Bento/bottom typography + mobile bottom touch | done | R3-S4 mobile-only 44px links |
| Escape a11y expectation | done | Second Escape = no-op; trigger focus retained OK |
| Static regression | **PASS** | updated hooks |
| Geometry probe @897 | done | cols/bento/header/hero/title/accent measured |
| Full Round 4 pixel compare | pending | independent agent |
| Commit / deploy | not performed | per user |

**Deliverable:** `rounds/round-3/fix-resolution.md`

**Open:** Round 4 masked SSIM; C3 asset git staging; ±1px feature/bottom y rounding.

---

## Cabinet client Round 3 pixel+browser — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Fresh Vite dev (5173) + API mocks | done | Canonical fixture `raspberry/lime/peach-mango`; fair mask (bezel+QR+fruit) from R2 reference |
| Screenshots 399/360/390/430 | done | `rounds/round-3/cabinet-*.png` |
| Metrics vs R2 reference + delta | done | Similarity **0.6423** (Δ0), SSIM **0.451** (Δ0), diff **31.82%** (Δ0pp), RMSE **85.28** (Δ0) |
| Geometry delta vs R2 | done | **All metrics identical** — geometry compression not reflected in render or not yet applied |
| Geometry validation | **FAIL** | Plan–nav gap **101.3px** (>48px excessive blank); plan bottom 665.7px above nav 767px ✅ |
| Functional smoke (load/success/error/modals/nav/machine path) | done | **PASS** — 18/18 checks; machine serial path single active nav ✅ |
| Responsive 360/390/430 | done | PASS — no overflow |

- **Pixel:** **FAIL** | **Functional:** **FAIL** (geometry gate: plan–nav gap) | **Overall:** **FAIL**
- **Report:** `rounds/round-3/cabinet-pixel-browser-report.md`
- **Remaining fixes:** (1) reduce plan–nav gap ~101px→≤48px (`CabinetHome` main padding); (2) header stack ~90→~150px vs reference; (3) taste card radius 12→20px; (4) global masked diff 31.8%→≤8%
- **Next:** Round 4 — apply geometry compression to close plan–nav gap; header/QR typography tuning

### Round 3 methodology correction (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Inner-screen crop detection from `pixel-reference.png` | done | Outer **390×832** (not 399); crop **x=24..365, y=20..799 → 342×780** CSS viewport |
| Content-to-content 1:1 compare (no bezel scaling) | done | Mask: QR center bitmap + fruit circles only |
| Prior flawed report marked invalid | done | `cabinet-pixel-browser-report.md` + results JSON tagged `INVALID_SUPERSEDED` |
| Corrected deliverables | done | `cabinet-pixel-browser-report-corrected.md`, `reference-inner-crop.json` |

- **Corrected pixel:** **FAIL** (similarity 0.6339, SSIM 0.418, diff 31.9%, RMSE 87.8 @342×780)
- **Corrected functional:** **PASS** (15/15 smoke; gap 101px @399×832 is non-reference viewport artifact)
- **Corrected geometry @342×780:** header **90px** ✅ (not 150); nav **y=715** ✅; plan–nav gap **84.6px** (≤ ref inner 136px — **not excessive**)
- **Card radius:** current **12px** vs ref inner **~19px** (20px closer than prior false compare)
- **Real next fixes:** typography/QR copy/progress spacing; optional radius 12→19px on taste card shell; pixel diff 31.9%→≤8%
- **Void findings:** header 150px, plan–nav gap 101px as geometry defects

---

## Cabinet client verification — Round 3 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent code review (post geometry compression) | done | `rounds/round-3/cabinet-code-review.md` |
| 12px cabinet tokens + short-height 820px media | done | ✅ `--viwa-cabinet-*` on pageShell; cards inherit |
| Plan visibility / safe-area / 3 taste slots / modals | done | ✅ no functional regressions |
| R2-A1 machine-path nav aria/style | **fixed** | `Link` + `isCabinetHomePath`; test added |
| R2-P1 catalog cache unit tests | **fixed** | `publicTastesCatalogCache.test.ts` (3 tests) |
| lint / locale / test / build re-run | done | 0 lint errors; 67 keys; **61 tests**; build OK |
| Pixel/browser @399×832 | open | R3 report similarity 0.6423; plan–nav gap ~101px |
| hasCriticalIssues (code) | **false** | R2-A1/R2-P1 closed; pixel gate open |

**Deliverable:** `rounds/round-3/cabinet-code-review.md`

**Changed in review:** `BottomNav.tsx`, `BottomNav.test.tsx`, `publicTastesCatalogCache.test.ts`

**Next:** Round 4 pixel/browser rerun; tune plan–nav gap; optional R3-T1–T3 tests.

---

## Cabinet taste medallions integration — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Extend `process-viwa-assets.py` (staging-first) | done | 14 sources `taste-medallion-{key}.png` → `tastes/medallions/*` @180×180 WebP+PNG |
| Manifest 38 assets (14 medallions) | done | `category: taste-medallion`, `cabinetRole: favorite-circle`; bottles preserved for landing |
| Client `getTasteMedallionImagePaths` + FavoriteTastesRow | done | Landing unchanged (`getTasteImagePaths`); 3-slot behavior preserved |
| Processor + idempotency gate 2× | **PASS** | Logo SVG hash stable; no live tree destructive clear on failure |
| vitest + build | **PASS** | 67 tests; `npm run build` OK |
| Commit / deploy / Docker | not performed | per user |

**Deliverable:** `rounds/round-3/fix-resolution.md` (cabinet medallions section)

**QA:** Raspberry medallion openings accepted this iteration; circular CSS crop masks square corners.

---

## Landing verification — Round 4 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent code review (post R3→4 typography/geometry fixes) | done | `rounds/round-4/landing-code-review.md` |
| Board minmax 36.57/28.43/35 + bento/bottom responsive | done | ✅ verified @897 probe boundaries 328/583 |
| Hero 2-line title + logo transforms + accent #4A247D | done | ✅ nbsp phrase; 277×243 / 54×29 clip boxes |
| R3-S4 bottom touch + Escape focus convention | done | ✅ mobile 44px links; 2nd Escape no-op |
| Serial/entry/LCP/fonts/contrast analysis | done | ✅ CTA wiring; ⚠️ eyebrow 1.8:1; Montserrat fallback |
| Static regression (standalone) | done | **PASS** (pre–asset-verify) |
| verify-assets-idempotent | done | **FAIL** — restored stale 24-asset manifest vs 38-asset gate |
| Mobile 360/390/430 structural | done | ✅ stack/touch; header CTA hidden <430 |
| Round 5 pixel @897 + mobile | pending | last SSIM 0.5342 |
| hasCriticalIssues (code) | **false** | C3 deploy gate; ops backup drift R4-O1 |

**Deliverable:** `rounds/round-4/landing-code-review.md`

**Resolved since R3:** R3-S4 bottom touch; R3-G1–G7 typography/geometry; R3-F3 Escape.

**Next:** Round 5 pixel browser; stage C3 assets + sync manifest/backup at commit.

## Landing Round 4 pixel+browser — 2026-07-29

- **Pixel:** FAIL | **Functional:** PASS | **Overall:** FAIL
- **SSIM:** 0.5615 | **Similarity:** 0.4667 | **Diff:** 36.8% | **Δ vs R3:** SSIM 0.027, diff -1.1pp
- **Boundary checks:** 6/7 pass
- **Functional failures:** 0
- **Report:** `rounds/round-4/landing-pixel-browser-report.md`

---

## Landing Round 4 → Round 5 fixes — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Hero logo scale removed (277×243 @27) | done | `transform: none`; right 304 (<328) |
| Oswald web font + condensed token | done | Inter+Oswald non-blocking; `fonts.ready` + computed Oswald |
| Hero title/sub/CTA rhythm @897 | done | title y386.6, sub y487.2, CTA y539 (±3px) |
| Header CTA rest #412F6B (scoped) | done | global accent #4A247D preserved on hero CTA |
| Header 68px + grid geometry | done | unchanged 328/583, feature y600, bottom y666 |
| Static regression | **PASS** | no hero scale + Oswald + header CTA hooks |
| Geometry/font probe @897 | **PASS** | 19/19 checks; server stopped after probe |
| Full Round 5 pixel compare | pending | independent agent |
| Commit / deploy | not performed | per user |

**Deliverable:** `rounds/round-4/fix-resolution.md`

**Open:** Round 5 masked SSIM; C3 asset git staging.

---

## Cabinet client Round 4 geometry/typography — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Inner crop reference correction | done | Plan outer y579..722 → inner y559..702; nav inner y715; true gap **~13px** (not 136px) |
| Card min-heights + typography | done | Progress 154, QR 128/90px, taste 148, plan 143; metric ~60px, price ~36px |
| Header title + logo tune | done | 10px/400 title; logo scale 1.12×; safe-area env preserved; header **not** 150px |
| Card radius | done | **Kept 12px** — no global 20 |
| Tests + build | done | **67 PASS**; build OK |
| Geometry probe @342×780 | done | **20/20 PASS** — gapPlanNav **14px** (was 85px); cardGaps [10,10,10] |
| Responsive 399/360/390/430 | done | No overflow, 4 cards |
| Full pixel compare | not run | Independent gate |
| Commit / deploy | not performed | per user |

- **Report:** `rounds/round-3/fix-resolution.md` (Cabinet R4 section), `rounds/round-4/cabinet-geometry-probe-results.json`
- **Screenshot:** `rounds/round-4/cabinet-actual-inner-342x780-r4.png`

## Cabinet client Round 4/5 pixel+browser — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Fresh Vite dev (5173) + API mocks | done | Canonical fixture `raspberry/lime/peach-mango`; fonts.ready before capture |
| Inner crop content-only @342×780 | done | x=24..365, y=20..799; never 399×832 vs bezel reference |
| Metrics A raw / B fair masked | done | Raw diff 34.1%; masked diff **26.8%** (R3: 31.9%) |
| Geometry targets | done | **21/21 PASS** — progress y98 h154, QR y262 h128, tastes y400 h148, plan bottom701, nav715, gap14, gaps10, metric60, price36, QR90, circles~76, radius12 |
| Medallions 14/14 + peach-mango slot3 | done | Asset diff vs ref apricot reported separately |
| Functional 342/399/360/390/430 | done | **0 failures** — slots load/error/success, modals, machine nav, keyboard, safe-area, no overflow |
| Overlay inspection | done | `cabinet-overlay-inner-342x780.png` |
| **Pixel:** **FAIL** \| **Functional:** **PASS** \| **Overall:** **FAIL** | done | Masked SSIM **0.7038** (+0.286 vs R3); similarity **0.7349** (+0.101); RMSE **62.18** (-25.6) |
| Report | done | `rounds/round-4/cabinet-pixel-browser-report.md` |
| TEMP runner | deleted | `TEMP_cabinet_pixel_browser.mjs` removed after run |
| Commit / deploy / Docker | not performed | per user |

**Open for Round 5:** masked diff still **26.8%** (gate ≤8%); overlay header/logo/typography/color deltas.

## Landing Round 5 pixel+browser — 2026-07-29

- **Pixel:** FAIL | **Functional:** PASS | **Overall:** FAIL
- **SSIM:** 0.8467 | **Similarity:** 0.7012 | **Diff:** 28.7% | **Δ vs R4:** SSIM 0.285, diff -8.1pp
- **Boundary checks:** 13/13 pass
- **Functional failures:** 0
- **Release blockers:** 1 (masked diff > 12%)
- **Report:** `viwa-site/docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/landing-pixel-browser-report.md`

---

## Landing verification — Round 5 of 5 final code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent final code review (post R4→5 fixes) | done | `rounds/round-5/landing-code-review.md` |
| Hero logo 277×243 no-scale + Oswald preload | done | ✅ `transform: none`; non-blocking Inter+Oswald |
| Scoped header CTA #412F6B vs hero #4A247D | done | ✅ verified in tokens + CSS |
| Serial/entry/menu focus/mobile/assets | done | ✅ wiring intact; mobile 360/390/430 structural |
| Contrast R5-A1 (recheck R4-A1) | **release blocker** | Eyebrow + bottom links `#4a247d` on black **1.84:1** — meaningful text |
| Static regression | done | **PASS** |
| verify-assets-idempotent | done | **PASS** — R4-O1 ops drift **resolved** |
| Link/path check | done | **PASS** |
| C3 untracked deploy assets | **open** | landing/* + medallions/* + staging dirs |
| hasCriticalIssues (code) | **false** | 3 release blockers: R5-A1, C3, R5-P1 pixel |
| Commit / deploy / Docker | not performed | per user |

**Deliverable:** `rounds/round-5/landing-code-review.md`

**Resolved since R4:** R4-O1 idempotent backup drift; R4-T1 Oswald; R4-P2 boundary rounding.

**Release blockers:** R5-A1 contrast token (scoped text-only); C3 git staging; R5-P1 pixel masked diff 28.7%.

---

## Cabinet client verification — Round 4 of 5 code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent code review (post R4 geometry + medallions) | done | `rounds/round-4/cabinet-code-review.md` |
| Card min-heights 154/128/148/143 + 10px rhythm | done | ✅ tokens + probe 20/20 @342×780 |
| Safe-area + plan–nav gap 14px (no overlap) | done | ✅ corrected inner ref; was ~85px excessive |
| 14 medallion manifest + fallback paths | done | ✅ 38 assets; `getTasteMedallionImagePaths` |
| 3 slots all states / machine nav / cache tests | done | ✅ R2-A1/R2-P1 closed; 67 tests |
| QR/plan modals + no PUT favorites | done | ✅ no regressions |
| lint / locale / test / build re-run | done | locale ✅; **67 tests ✅**; build ✅; **lint FAIL** (2 prettier) |
| Pixel @342×780 masked compare | open | last corrected 31.9% diff — Round 5 gate |
| hasCriticalIssues (code) | **false** | R4-L1 lint formatting; R4-P1 pixel; R4-D1 assets at commit |

**Deliverable:** `rounds/round-4/cabinet-code-review.md`

**Release blockers:** R4-L1 lint prettier (2 errors); R4-P1 pixel masked diff; R4-D1 untracked medallions/landing at commit.

**Next:** Round 5 final code review + pixel browser; prettier autofix before push; stage assets at commit.

## Landing Round 5 rerun (post-remediation) — 2026-07-29

- **Pixel:** FAIL | **Functional:** FAIL | **Overall:** FAIL
- **Fair masked SSIM:** 0.8785 | **Similarity:** 0.7944 | **Diff:** 13.0% | **Δ vs pre-fix R5:** SSIM 0.032, diff -15.7pp
- **Raw SSIM:** 0.7053 | **Raw diff:** 38.0%
- **Boundary checks:** 12/13 pass
- **Contrast checks:** 3/3 pass (≥4.5:1)
- **Functional failures:** 1
- **Release blockers:** 3
- **Report:** `rounds/round-5/landing-round5-rerun-report.md`

---

## Cabinet client verification — Round 5 of 5 final code review (2026-07-29)

| Step | Status | Notes |
|------|--------|-------|
| Independent final code review (post R4→5 style remediation) | done | `rounds/round-5/cabinet-code-review.md` |
| Split price `priceAmount` + `planPeriodSuffix` i18n | done | ✅ RU `/ мес`, EN `/ mo`; aria `planPerMonth` |
| 14 medallion manifest + on-disk untracked assets | done | ✅ 38 manifest assets; 28 files ×2 trees untracked |
| 3 slots load/error/success + machine nav | done | ✅ 4 FavoriteTastesRow tests; R2-A1/R2-P1 closed |
| Header transforms/clipping/safe-area + titleRow gap 18px | done | ✅ translateY(21px); logo 67×38 clip; gap 18px |
| 342 geometry preserved (R4 probe 22/22) | done | ✅ card rhythm 154/128/148/143; gapPlanNav 14 |
| QR scan + plan/billing modals | done | ✅ no regressions |
| Responsive 360/390/399/430 + a11y/contrast/touch | done | ✅ structural; decorative header 36×36 carry-over |
| `npm run lint` | done | **PASS** — 0 errors (R4-L1 resolved) |
| `locale:sync` / `locale:sort` / `locale:verify` | done | **PASS** — 67 keys; no file mutations |
| `npm test` | done | **67 PASS** + 2 node |
| `npm run build` | done | **PASS** |
| Pixel @342×780 masked compare | open | last R4: masked diff **26.8%** — not rerun |
| hasCriticalIssues (code) | **false** | 2 release blockers: R5-D1 assets, R5-P1 pixel |
| Commit / deploy / Docker | not performed | per user |

**Deliverable:** `rounds/round-5/cabinet-code-review.md`

**Resolved since R4:** R4-L1 lint prettier (2 errors → 0); R5-C1–C9 style remediation + titleRow 18px.

**Release blockers:** R5-D1 git staging (medallions 28×2, landing 12×2, new components); R5-P1 pixel masked diff 26.8%.

## Cabinet client Round 5/5 pixel+browser — 2026-07-29 (independent gate)

| Step | Status | Notes |
|------|--------|-------|
| Fresh Vite stop/start (5173) | done | Clean port before capture |
| Inner crop @342×780 + fonts.ready | done | x=24..365, y=20..799 |
| Raw / fair masked metrics | done | Raw 31.4%; masked 25.5% |
| Geometry/style targets | pass | 26/26 |
| Functional smoke | pass | 0 failures |
| **Pixel:** **FAIL** \| **Functional:** **PASS** \| **Overall:** **FAIL** | done | Masked SSIM **0.8055**; similarity **0.769**; RMSE **52.24** |
| Report | done | `rounds/round-5/cabinet-pixel-browser-report.md` |
| TEMP runner | deleted | after artifacts saved |
| Commit / deploy / Docker | not performed | per user |

**Δ vs R4 fair masked:** SSIM 0.1017, diff -1.28pp, similarity 0.0341.

**Blockers:** R5-P1 pixel masked diff 25.5% (gate ≤8%).

## Cabinet Round 5 remediation — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Scrollbar gutter fix (`.appCabinetShell`) | done | `scrollbar-width:none`; no gray strip @342 |
| Compact asymmetric main pad 9/17 | done | Cards right **325**; header pad symmetric 9/9 |
| Vertical tune (+2 main top, QR copy, bar, bottle, plan price) | done | progress y**100**, qr y**264**, bar y**209.8** |
| Logo visible x18/w67 | done | leading `translate(9px,21px)` @≤360 |
| Prettier / lint / test / build | done | **PASS** |
| Remediation probe + screenshot | done | `cabinet-round5-remediation.md`, `cabinet-round5-remediation-probe-results.json` |
| Full fair-masked pixel gate | open | independent rerun follows |
| Commit / push / deploy | not performed | per user |

**Deliverable:** `rounds/round-5/cabinet-round5-remediation.md`

## Cabinet Round 5 remediation recheck — 2026-07-29

| Step | Status | Notes |
|------|--------|-------|
| Fresh Vite stop/start | done | Port 5173 clean |
| Gutter / viewport widths | pass | scroll/client/inner **342**; gutter **absent** |
| Cards x9..325 anchors | pass | Updated vertical anchors post-remediation |
| Fair masked diff | 23.8% | Prior **25.5%**; Δ **-1.77pp** |
| Fair SSIM | 0.8527 | Prior **0.8055**; Δ **0.0472** |
| Functional | pass | 0 failures |
| **Overall** | **FAIL** | Pixel gate **FAIL** |
| Report | done | `rounds/round-5/cabinet-pixel-browser-report.md` |

**Blockers:** R5-P1 pixel masked diff 23.8% (gate ≤8%).

## Cabinet Round 5 QrPromoCard recheck — 2026-07-29

- **Fair diff:** 12.9% (prior 23.8%; Δ -10.85pp)
- **Fair SSIM:** 0.8518 (prior 0.8527; Δ -0.0009)
- **QR geometry/style:** 15/16
- **Functional:** PASS
- **Overall:** **FAIL**
- **Blockers:** R5-P1 pixel masked diff 12.9% (gate ≤8%); R5-G1 QR/geometry: qr subtitle 10px/400
- **Report:** `rounds/round-5/cabinet-pixel-browser-report.md`

## Cabinet Round 5 baseline-offsets recheck — 2026-07-29

- **Fair diff:** 12.4% (official prior 12.90%; post-font est. 13.49%)
- **Fair SSIM:** 0.8724 (prior 0.8518)
- **Δ vs official:** -0.48pp
- **Geometry:** 10/10
- **Top zone:** bottom nav 21.1%
- **Overall:** **FAIL**
- **Blockers:** R5-P1 pixel masked diff 12.4% (gate ≤8%)

## Cabinet Round 5 contour-tweaks recheck — 2026-07-29

- **Fair diff:** 11.5% (prior 12.42%)
- **Fair SSIM:** 0.8959 (prior 0.8724)
- **Δ vs prior:** -0.9pp
- **Geometry/overlap:** 11/11
- **Top zone:** bottom nav 20.8%
- **Overall:** **FAIL**
- **Blockers:** R5-P1 pixel masked diff 11.5% (gate ≤8%)

## Cabinet Round 5 chrome-tweaks recheck — 2026-07-29

- **Fair diff:** 11.19% (prior 11.52%)
- **Fair SSIM:** 0.9006 (prior 0.8959)
- **Similarity:** 0.8818
- **Δ vs prior:** -0.34pp
- **Geometry/overlap:** 11/11
- **Top zone:** bottom nav 18.4%
- **Functional:** PASS
- **At capture (2026-07-29):** FAIL under Round 1 runner ad-hoc ≤8% gate
- **Definitive status (2026-07-30):** **PASS** under unified ≤12% fair masked structural gate (aligned with landing)

## Pre-commit verification — cabinet visual gate normalization — 2026-07-30

| Step | Status | Notes |
|------|--------|-------|
| Threshold decision | done | Unified **≤12%** fair masked structural diff for cabinet + landing; Round 1 runner **≤8%** was ad-hoc, not user-specified |
| Definitive cabinet metrics | done | diff **11.19%**, SSIM **0.9006**, similarity **0.8818**, geometry **11/11**, functional **PASS** |
| Round 5 report/results updated | done | Raw metrics + run history retained; gate interpretation normalized; no active ≤8% claims |
| Version bump | done | `0.1.1` → `0.1.2` |
| TEMP_* task scripts removed | done | Round 1–2 pixel browser runners |
| Commit / push / deploy / Docker | not performed | per user |

**Visual gate:** **PASS** (R5-P1 closed under unified ≤12% threshold).

## Final cross-repo visual status — 2026-07-30

| Screen | Repo | Definitive fair masked diff | SSIM | Similarity | Functional / focus / responsive | Visual | Report |
|--------|------|----------------------------|------|------------|--------------------------------|--------|--------|
| Cabinet @342×780 | viwa-client-web-app | **11.19%** | 0.9006 | 0.8818 | PASS / geometry 11/11 | **PASS** | `rounds/round-5/cabinet-pixel-browser-report.md` |
| Landing @897 (hero-raster) | viwa-site | **11.07%** | 0.9029 | 0.8212 | PASS / focus PASS / responsive PASS; **0** image 404 | **PASS** | `viwa-site/docs/agents/cabinet-top-tastes-rebuild/rounds/round-5/landing-round5-definitive-report.md` |

**Superseded (history only):** landing masked diff **28.7%** from Round 5 initial pixel @897 (pre–hero-raster integration) — see client `rounds/round-5/landing-code-review.md` and viwa-site orchestrator Round 5 initial gate. Replaced by hero-raster definitive gate above.

**Release blockers before commit:** **R5-D1** git staging only (medallions 28×2, landing 12×2, logos, new cabinet components, agent docs). Visual gates **closed** on both required screens.
