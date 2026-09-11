# Fix 07 — Best Guide Readiness (P0 Running)

**Mode:** Remediation (decision-depth enrichment; gate unchanged)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/03-editorial-quality.md`, `docs/prelaunch/data/03-editorial-quality.json`  
**Bar:** same LAUNCH_READY rules as audit (high contextual reasoning on majority of picks + methodology/criteria + who suits/avoids + comparison or choose-instead + intro ≥100 words)

---

## 1. Overall Best Guide movement

| Status | Before | After |
|---|---:|---:|
| LAUNCH_READY | **1** | **9** |
| NEEDS_MINOR_WORK | 41 | 33 |
| THIN | 16 | 16 |
| BLOCKED | 0 | 0 |

Gate not lowered. Non-P0 Running and non-Running Best Guides left for later waves.

---

## 2. P0 Running Best Guides — before / after / gap

| Route | Before | After | Remaining gap |
|---|---|---|---|
| `/best/running-shoes` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/running-shoes-beginners` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/running-watches` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/stability-running-shoes` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/daily-trainers` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/running-shoes-long-runs` | LAUNCH_READY | **LAUNCH_READY** | — (evidenceIds attached) |
| `/best/marathon-shoes` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/running-hydration-vests` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |
| `/best/heart-rate-monitors-running` | NEEDS_MINOR_WORK | **LAUNCH_READY** | — |

**P0 target:** all nine → LAUNCH_READY. **Met.**

---

## 3. What was weak (per audit)

Shared blockers across P0 (except long-runs):

| Gap | Guides hit |
|---|---|
| Low / medium contextual depth (`whyItFits` missing; thin `whyRecommended`) | shoes hub, watches, stability, marathon, vests, HRM, dailies |
| Missing `bestForProfiles` / `whoShouldAvoid` on picks | shoes hub, dailies, stability, marathon, vests, HRM, watches |
| Missing `chooseInsteadWhen` (even when comparison table existed) | beginners (intro also thin), marathon, others |
| Intro depth &lt; 100 words | nearly all P0 |
| No guide-level `evidenceIds` | beginners, dailies, stability, marathon, long-runs |
| Empty considered / shortlisted layers | several category guides |

Long-runs was already LAUNCH_READY (template bar).

---

## 4. Fixes applied

| Area | Change |
|---|---|
| Enrichment module | `src/content/running/best-guides-p0-launch-ready.ts` |
| Wiring | `src/content/best-guides.ts` → `applyBestGuideP0LaunchReadyEnrichment` |
| Per pick | `whyItFits`, `whyItWon`, `tradeoffs`, `bestForProfiles`, `whoShouldAvoid`, `notIdealFor`, `chooseInsteadWhen`, evidence |
| Guide shell | deeper intro + whatMatters, methodology, decisionShortcuts / quickTake, considered + shortlisted layers, evidenceIds |
| Duplicate intent | Differentiated **Best Race Shoes** vs **Best Marathon Shoes** (race = timed geometry across distances; marathon = race + first-marathon comfort + training-block roles) |
| Products | All P0 recommendations use published catalog products only |

Affiliate commission language remains explicit in methodology; rankings are role-based, not commission-weighted.

---

## 5. Decision-depth checklist (P0)

For each recommendation card after enrichment:

- [x] Why it fits this use case (`whyItFits`)
- [x] Who it is best for (`bestForProfiles`)
- [x] Who should skip (`whoShouldAvoid` / `notIdealFor`)
- [x] Context strengths + trade-offs
- [x] When to choose an alternative (`chooseInsteadWhen`)
- [x] Why it beat close peers (`whyItWon`)
- [x] Considered / shortlisted / recommended kept distinct
- [x] Decision shortcuts (“Choose X if…”)
- [x] Comparison product set retained

---

## 6. Remaining (non-P0)

Still NEEDS_MINOR_WORK or THIN (examples): carbon-plated, max-cushion, trail shoes, tempo shoes, wide feet, heavy runners, watch sub-guides, clothing/gear Bests, fitness/padel Bests, thin card-shelf hydration/belt variants.

**Next wave candidates:** `/best/trail-running-shoes`, `/best/tempo-running-shoes`, `/best/carbon-plated-running-shoes`, `/best/max-cushion-running-shoes`, `/best/running-socks`, `/best/running-packs`.

THIN trail/ultra hydration sub-guides remain soft candidates to deepen or further differentiate from `/best/running-hydration-vests`.

---

## 7. Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-03-editorial-quality.ts
```

Confirm Best Guides classCounts LAUNCH_READY ≥ 9 and each P0 route status in `docs/prelaunch/03-editorial-quality.md` §5–6.
