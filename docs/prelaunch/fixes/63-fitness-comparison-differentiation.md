# Fix 63 — Fitness comparison differentiation

**Date:** 2026-09-10  
**Status:** Implemented (content complete — Fitness remains **vertical-held**)  
**V3 residual:** [`../FINAL-EDITORIAL-READINESS-V3.md`](../FINAL-EDITORIAL-READINESS-V3.md) — 2 Fitness comparison `NEEDS_DIFF`  
**Assessor (unchanged):** Fix 59 / V3 forensic — category-peer Jaccard after name-scrub on `summary + verdict + keyDifferences.join`, `classifyUniqueness` (`DUPLICATIVE` ≥ 0.90 / `NEEDS_DIFF` ≥ 0.72)  
**Script:** `scripts/tmp/prelaunch-63-fitness-cmp-uniqueness.ts`

Content readiness and vertical launch stay separate. Fitness `indexableKinds` is still `[]`. These URLs stay **non-INDEXABLE**.

---

## Result

| Check | Before | After |
|---|---|---|
| Fitness comparison `NEEDS_DIFF` | **2** | **0** |
| Fitness comparison `DUPLICATIVE` | 0 | **0** |
| All published comparison `NEEDS_DIFF` | 2 | **0** |
| Pair Jaccard (each other) | **0.735** | **0.258** |
| Fitness indexation | held | **held** (`HIDDEN_404`, `vertical_hold:fitness:selective`) |

Both pages remain editorial **READY**, comparison quality **MEANINGFUL**, generic “both excellent / pick on preference” verdicts **absent**.

---

## 1. Exact two

Nearest peer for both pages was **each other**. Category cluster: `cat-training-shoes`.

| URL | Product A | Product B | Nearest similar comparison | Jaccard | Duplicative sections | Reason `NEEDS_DIFF` |
|---|---|---|---|---:|---|---|
| `/compare/nike-romaleos-5-vs-adidas-adipower-3` | Nike Romaleos 5 | adidas Adipower Weightlifting 3 | `adidas-powerlift-5-vs-nike-romaleos-5` | 0.735 | Summary + verdict (depth-enrichment scaffold) | Same template after name-scrub: “split on weekly job, not a blended score” / “No universal winner” / “Skip forcing a compromise if your week clearly matches only one side.” Shared Romaleos strength tokens (`raised heel for squat depth`, `unsuitable for running or metcons`). |
| `/compare/adidas-powerlift-5-vs-nike-romaleos-5` | adidas Powerlift 5 | Nike Romaleos 5 | `nike-romaleos-5-vs-adidas-adipower-3` | 0.735 | Summary + verdict (same scaffold) | Same enrichment template. After scrub, both blobs collapsed onto one “lifter vs job” paragraph plus `[object Object]` `keyDifferences` join. |

Next-nearest (before): `nobull-trainer-vs-nike-metcon-9` / `inov8-f-lite-235-v3-vs-reebok-nano-x4` at **0.51–0.56** (also enrichment-template cousins). Those were below 0.72; the two lifting-shoe pages were the only Fitness `NEEDS_DIFF`.

Seed copy was thin (`<40` summary words, `<20` verdict words, no `keyDifferences`), so `applyComparisonDepthEnrichment` rewrote both with the same skeleton before P41. Romaleos 5 appears on both pairs, so name-scrub left the scaffold + Romaleos strengths as the overlapping mass.

---

## 2–4. Decision maps (catalog-backed only)

Unpublished in catalog for all three: heel height (mm), mass, toe-box last, midsole compression, forefoot flexibility. Those are **omitted**, not guessed.

### Pair A — Romaleos 5 vs Adipower 3

| Field | Decision |
|---|---|
| **Primary difference** | Planted Olympic platform + squat-depth heel vs midfoot lockdown on a competition-ready heel. Same dedicated-lifter aisle; different fit trigger. |
| **A strengths (Romaleos)** | Raised heel for squat depth; rock-solid platform; Olympic brief (squats, cleans, Olympic lifts); catalog audience includes intermediate through elite. |
| **B strengths (Adipower)** | Secure lockdown for heavy lifts; competition-ready heel; advanced/elite targeting. |
| **A trade-offs** | Unsuitable for running or metcons; running suitability very-low; not a walking/gym-circuit shoe. |
| **B trade-offs** | Single-purpose lifting shoe; advanced/elite only; same very-low running suitability. |
| **Who should choose A** | Olympic lifting is the weekly job; squat depth and a planted platform are why you left the trainer aisle; you may still be intermediate but already committed to a dedicated lifter. |
| **Who should choose B** | Midfoot lockdown under a heavy squat or pull is the shopping trigger; you already sit in the advanced/elite lane. |
| **Who should choose neither** | Any weekly block still needs running, HYROX, or mixed metcons — shop a trainer (Metcon 9 / Nano X4), not this pair. |
| **Spec differences** | Both: `stability: maximum`, `liftingSuitability: very-high`, `runningSuitability: very-low`, `hyroxSuitability: low`. Split is strengths + experience targeting, not a measured wedge-height fight. |
| **Use-case difference** | Olympic last (Romaleos) vs lockdown for heavy squat/pull (Adipower). Both refuse cardio/metcon. |
| **Price/value** | Same premium band (NL offers ~€200 vs ~€190; valueScore 70 vs 72). Spend is **not** the fork. |
| **Closest third** | Reebok Legacy Lifter III — weightlifting shoe that also bridges CrossFit-style sessions. |

**Verdict (actionable):** Buy Romaleos when squat-depth Olympic platform is the reason you are shopping. Buy Adipower when lockdown under load is the non-negotiable. Do not pick “whichever last you like” as if they were colourways.

### Pair B — Powerlift 5 vs Romaleos 5

| Field | Decision |
|---|---|
| **Primary difference** | Accessible very-stable gym heel vs premium **maximum**-stability Olympic platform. Not a discount Romaleos. |
| **A strengths (Powerlift)** | Strong value for a raised-heel lifter (valueScore **88**); secure midfoot lockdown; beginner-strength + presses + Olympic-lift practice. |
| **B strengths (Romaleos)** | Maximum stability; rock-solid platform; raised heel for squat depth; competition-oriented Olympic brief. |
| **A trade-offs** | Not for conditioning runs; `stability: very-stable` not maximum; not a competition last. |
| **B trade-offs** | Unsuitable for running or metcons; valueScore **70**; premium spend. |
| **Who should choose A** | Gym squats, presses, and Olympic practice on a cheaper raised heel; catalog very-stable is enough; beginner-to-advanced strength without competition-platform money. |
| **Who should choose B** | Maximum stability and a planted Olympic last are the requirement — a cheaper very-stable heel is not enough. |
| **Who should choose neither** | Mixed gym / walking / HYROX → Metcon 9. Flat heavy pulls/presses without a raised heel → The Total. |
| **Spec differences** | Powerlift `very-stable` vs Romaleos `maximum`; Powerlift `hyrox: very-low` vs Romaleos `low`; Powerlift use cases include `uc-beginner-strength`; Powerlift default experience includes beginner. Heel mm / weight unpublished. |
| **Use-case difference** | Practice + presses + entry strength vs competition Olympic platform. |
| **Price/value** | Catalog list ~€120 and valueScore 88 vs Romaleos Amazon NL offer €200 and valueScore 70. Verify live street price in offers. |
| **Closest third** | Nike Savaleos or Do-Win Classic (cheaper dedicated heels). Adipower lockdown at competition spend is **Pair A**, not this page. |

**Verdict (actionable):** Buy Powerlift to start a raised-heel strength shoe without paying for maximum-stability Olympic geometry. Buy Romaleos when that geometry is the requirement. Do not treat Powerlift as Romaleos at a lower sticker.

---

## 5. Uniqueness re-run (same forensic method)

Method match to V3 / `scripts/tmp/prelaunch-59-editorial-forensic-v3.ts`:

- Cluster by `comparison.categoryId`
- Blob: `normalize(scrub(summary + verdict + keyDifferences.join))`
- `classifyUniqueness({ maxPeerSimilarity, scaffoldHits: 0, uniqueSignalRatio: 0.5 })`

| URL | Before class | After class | After max Jaccard | Nearest after |
|---|---|---|---:|---|
| `/compare/nike-romaleos-5-vs-adidas-adipower-3` | `NEEDS_DIFF` | **GENUINELY_UNIQUE** | 0.258 | `adidas-powerlift-5-vs-nike-romaleos-5` |
| `/compare/adidas-powerlift-5-vs-nike-romaleos-5` | `NEEDS_DIFF` | **GENUINELY_UNIQUE** | 0.258 | `nike-romaleos-5-vs-adidas-adipower-3` |

Next-nearest after rewrite: Metcon/Nano and Dropset/Total at **0.09–0.17**.

Fitness comparisons: **30 / 30** under the 0.72 line. Estate comparison `NEEDS_DIFF` = **0**.

---

## 6. Fitness still held

| Gate | Value |
|---|---|
| `verticalLaunchStrategy` sport-training | `mode: selective`, `indexableKinds: []` |
| Eligibility | `HIDDEN_404` |
| Reason | `vertical_hold` / `fitness:selective` |
| `isIndexableEligibility` | **false** |
| Vertical strategy file | **not edited** |

Editorial READY ≠ indexable. Day-1 SEO still excludes Fitness deep entities.

---

## 7. What changed

| File | Change |
|---|---|
| `src/content/comparisons-p41-completion.ts` | Pair-specific P41 patches (summary, verdict, criteria, use cases, `keyDifferences`, choose reasons). P41 still runs after depth enrichment, so unique copy wins. |
| `src/content/fitness/seed.ts` | Seed summaries/verdicts thickened so enrichment no longer templates these two; generic “Both are single-purpose lifters — pick on fit and platform preference” removed. |

No eligibility, sitemap, or vertical-strategy edits.

---

## Residual

Non-Day-1: **30** non-INDEXABLE alternative `NEEDS_DIFF` (packs, sunglasses, nutrition, clothing, lights, hydration) — out of scope. Fitness comparisons no longer contribute uniqueness residuals.
