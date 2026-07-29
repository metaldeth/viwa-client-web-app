# Browser test report — task-10 gate

**sessionId:** `viwa-landing-subscriptions`  
**Date:** 2026-07-29 (rerun failed scenarios 19:00 UTC+5)  
**Runner:** Playwright headless Chromium (`TEMP_browser_gate.mjs --rerun-failed`, temp install — no manifest changes)  
**Env:** local static site `http://127.0.0.1:8080` (viwa-site) + Vite preview `http://127.0.0.1:5173` (viwa-client-web-app dist)  
**Mocks:** Playwright route intercept — public tiers/tastes (2 tiers 12 000/18 000 ml, 499/699 ₽), machine/auth/profile/billing endpoints for client flows. No real OTP/SBP.

## Summary

| Status | Count |
|--------|------:|
| PASS | 36 |
| FAIL | 0 |
| DEFERRED | 2 |
| **Total rows** | **38** |

**Gate verdict:** **PRE-DEPLOY CLEAR** — all automated B-1…B-16 scenarios pass locally; **B-17** and **B-18** remain post-deploy deferred.

## Rerun (2026-07-29) — previously failed

| ID | Viewport | Rerun result | Notes |
|----|----------|--------------|-------|
| **B-3** | 360×800, 390×844, 430×932 | **PASS** | Fresh browser context per width; `#viwa-tiers[data-state="error"]` + retry; no stale prices; 390×844 retry → loaded 2 tiers |
| **B-10** | 390×844 | **PASS** | Four separate OTP digit inputs → `/home`; serial absent from URL |
| **B-14** | 390×844 | **PASS** | Trial profile (`MOCK_PROFILE_TRIAL`); plan section shows 2 cards with 499/699 ₽ and 12/18 L |

## Deferred post-deploy

| ID | Reason |
|----|--------|
| **B-17** | Admin WEBSITE attribution — requires telemetry dashboard login + staging DB after deploy. |
| **B-18** | Network-wide QR pour — requires physical staging machine + active subscription. |

## Per-scenario results (highlights)

### Landing B-3 tiers

| Viewport | Result | Screenshot | Notes |
|----------|--------|------------|-------|
| mock success (1440/360/390/430) | PASS | `B-3_ok_*.png` | 2 tiers 499/699 ₽ |
| 360×800 API error | PASS | `B-3_err_360x800.png` | error + retry, no price leak |
| 390×844 error+recovery | PASS | `B-3_recovery_390x844.png` | error → retry → loaded |
| 430×932 API error | PASS | `B-3_err_430x932.png` | error + retry, no price leak |

### Client

| Scenario | Viewport | Result | Screenshot | Notes |
|----------|----------|--------|------------|-------|
| B-10 | 390×844 | PASS | `B-10_390x844.png` | mock OTP → `/home`, no serial in URL |
| B-14 | 390×844 | PASS | `B-14_390x844.png` | trial profile; both 12 L / 18 L in plan section |

(Full B-1…B-16 matrix unchanged PASS from initial gate — see `TEMP_browser_gate_results.json`.)

## Artifacts

- Raw JSON: `docs/agents/viwa-landing-subscriptions/TEMP_browser_gate_results.json`
- Runner: `docs/agents/viwa-landing-subscriptions/TEMP_browser_gate.mjs`
- Screenshots: `docs/agents/viwa-landing-subscriptions/screenshots/2026-07-29/`

## Product code

**Not modified.** Initial B-3/B-10/B-14 failures were runner isolation / test-data issues; rerun passes with updated script.
