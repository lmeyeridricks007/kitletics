# Fix 74 — Resolve final four unexplained Alternatives pages

**Date:** 2026-09-10  
**Status:** Implemented  
**Target:** `THIN_UNEXPLAINED` = **0**  
**Evidence:** [`../data/rc-74/alts-classify.json`](../data/rc-74/alts-classify.json) · `scripts/tmp/prelaunch-74-alts.ts`  
**Tests:** `tests/alternatives-hold-classification.test.ts`

The Zero Known Debt audit found **four** Alternatives pages that failed `canPublishAlternativesPage`, had **≥3 cluster peers**, and had **no** explicit hold class. That is the Fix 65 “unexplained thin” state.

Slugs:

- `ciele-gocap-athletics`
- `brooks-notch-thermal-beanie`
- `horizon-t202-treadmill`
- `woodway-curve-trainer`

None of these was fixed by stamping a hold label. Each was re-clustered to its real buying job. Live classify: **THIN_UNEXPLAINED = 0**.

---

## 1. Why they looked like a market (and were not)

`classifyAlternativesHold` treats “same `alternativeMarketCluster`, ≥3 other published products” as enough of a market to require a READY page. If `canPublish` still fails, the leftover class is `THIN_UNEXPLAINED`.

Fix 65 fill (`applyAlternativesP65Graph`) pads from that cluster, **skipping INVALID** pairs. Fix 70 (`applyDecisionGraphP70Quality`) then **drops INVALID** and does **not** refill to three. After Fix 70, these four still sat in **too-wide clusters**, so classify thought the market was large, while the surviving same-job edges were 0–2.

That is the Fix 70 outcome change: edges that were never substitutes disappeared; the cluster regex did not.

---

## 2. Investigation (from scratch)

### `ciele-gocap-athletics`

| | |
|---|---|
| Source | Ciele GOCap Athletics (`prod-ciele-gocap-athletics`) |
| Sport / category | Running · `cat-running-clothing` · `sub-running-caps` |
| Job | Lightweight **summer/mild run cap** (hot/mild weather; “Not a winter beanie”) |
| Authored alts | `prod-nike-aerobill-cap` only |
| Old cluster | `clothing:headwear` via `/beanie\|gocap\|sherpa\|cap/` |

**Real peer universe:** two published run caps — GOCap and Nike AeroBill. Buff neck tubes share `sub-running-caps` but are gaiters, not hats. Brooks Notch Thermal Beanie is a winter knit. Brooks Sherpa 7" shorts matched `/sherpa/` and inflated the cluster.

**Why `canPublish` failed:** after Fix 70, cap↔shorts is INVALID (dropped); cap↔beanie is a different season. Surviving graph: **1** (AeroBill). Gate needs ≥3.

**Disposition:** **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET**. Two caps is not a standalone Alternatives page. Do not invent a third cap.

Decision dimensions that would matter if the aisle grew: sun coverage, breathability, packability, visibility, price — not warmth.

### `brooks-notch-thermal-beanie`

| | |
|---|---|
| Source | Brooks Notch Thermal Beanie |
| Sport / category | Running · `cat-running-clothing` · `sub-running-caps` |
| Job | **Winter thermal beanie** (cold/frigid; “Not a summer sun cap”) |
| Authored / overlay alts | GOCap + AeroBill (season-wrong) |

**Real peer universe:** **zero** other published running beanies.

**Why `canPublish` failed:** overlay pointed at two summer caps. Fix 70 / clothing-form split now scores cap vs beanie **INVALID**. Graph: **0**. Old headwear cluster still counted GOCap, AeroBill, and Sherpa shorts → unexplained.

**Disposition:** **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET**. A beanie is not a cap alternative. Buff Polar is neckwear. Notch Thermal *hoodie* is a different garment (already held as `brooks-notch-thermal-men`).

### `horizon-t202-treadmill`

| | |
|---|---|
| Source | Horizon Fitness T202 |
| Sport / category | Training · `cat-treadmills` |
| Job | Motorised **folding** apartment/jog deck (~€799, foldable, 16 km/h) |
| Authored alts | none (`cardioProduct` starts empty; Fix 65 filled from the whole treadmill category) |

**Published treadmill catalog (6):**

| SKU | Drive | Job |
|---|---|---|
| Horizon T202 | motorised, folding | apartment / small-space |
| Mirafit Folding | motorised, folding | apartment / small-space |
| Sole F80 | motorised, folding | serious home running |
| Woodway Curve | **non-motorised curved** | HIIT / HYROX, ~€4990 |
| AssaultRunner Pro | non-motorised curved | sprint / conditioning |
| AssaultRunner Elite | non-motorised curved | premium curved |

**Same-job peers for Horizon:** Sole + Mirafit (**2**). Publish gate needs **≥3 alternatives** → cannot READY without mixing curved sprint trainers into a folding walk/jog page.

**Why `canPublish` failed:** Fix 65 filled from `cat-treadmills`. Fix 70 kept WEAK motorised↔curved pairs (same category, no use-case overlap) because they were not INVALID yet, but copy/types still failed the gate — **or** dropped enough INVALID/WEAK that the page stayed thin while the cluster still had five “peers.”

**Disposition:** **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET**. Do not compare a folding apartment motor deck to a commercial curved trainer merely to hit three.

Related (same evidence, not in the original four): Sole F80, Mirafit Folding — also **HOLD** after the split. They had been completable only by mixing drive types.

### `woodway-curve-trainer`

| | |
|---|---|
| Source | Woodway Curve Trainer |
| Sport / category | Training · `cat-treadmills` |
| Job | Non-motorised **curved** sprint / HYROX (garage-gym, not foldable, premium) |
| Authored alts | none |

**Same-job peers:** AssaultRunner Pro + Elite (**2**). Same ≥3-alt gate. Motorised folders are a different machine (electricity, belt feel, training purpose, price class).

**Disposition:** **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET**.

A **comparison** of motorised vs curved (buyer fork: “do I want a motor?”) remains valid. `scoreComparisonPair` keeps that fork; only **alternatives** (substitutes) are INVALID across drive types.

---

## 3. What we did not do

- Did **not** add a third cap, beanie, motorised treadmill, or curved trainer.
- Did **not** treat Buff neck tubes as GOCap alternatives.
- Did **not** treat Brooks Sherpa 7" shorts as headwear.
- Did **not** loosen `canPublishAlternativesPage`.
- Did **not** put these four on `ALTERNATIVES_HOLD_INSUFFICIENT_MARKET` as a slug stamp. The hold is **derived** from the corrected cluster / same-job peer count.

Sherpa 7" now clusters as `clothing:short` and is **READY** against other 7" run shorts — that is the real aisle, not a padded headwear page.

---

## 4. Implementation

### Clusters (`alternativeMarketCluster`)

| Before | After |
|---|---|
| `clothing:headwear` (`beanie\|gocap\|sherpa\|cap`) | `clothing:cap` vs `clothing:beanie`; shorts via subcategory/`short` **first** (Sherpa is not a hat) |
| `cat-treadmills` (all six) | `treadmill:motorised` vs `treadmill:curved-manual` (`specifications.motorised`) |

Cap regex stays `gocap|(^\|-)cap-|-cap$` — **not** `/cap/` (Capilene tees must remain tees; Fix 70).

### Scorer (`scoreAlternativePair`)

- Clothing form: `beanie` vs `cap` (and shorts) → **INVALID** substitutes.
- Treadmill drive: motorised vs curved → **INVALID** substitutes.
- `scoreComparisonPair`: motorised vs curved stays a **VALID** buyer fork; seasonal cap vs beanie comparison stays **WEAK**, not an alternatives page.

### Classifier

If cluster peers **or** non-INVALID same-job peers **&lt; 3** → `HOLD_INSUFFICIENT_ALTERNATIVE_MARKET`. A regex that accidentally lumps shorts into hats can no longer recreate unexplained thin.

---

## 5. Final states (the four)

| Slug | State |
|---|---|
| `ciele-gocap-athletics` | **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** |
| `brooks-notch-thermal-beanie` | **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** |
| `horizon-t202-treadmill` | **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** |
| `woodway-curve-trainer` | **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** |

No `READY`. No `HOLD_DUPLICATE_INTENT`. No `HOLD_OBSOLETE_SOURCE`. No `THIN_UNEXPLAINED`.

Live graph inventory (`alts.length ≥ 1`): **481** pages · **459 READY** · **21 HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** · **1 HOLD_DUPLICATE_INTENT** · **0 unexplained**. Beanie / Horizon / Woodway currently have **0** remaining alt edges (P70 dropped cross-job IDs; P65 will not refill a 2-peer cluster). `classifyAlternativesHold` still returns HOLD for those slugs; the regression test asserts that directly.

Market-hold count vs Fix 65’s 15: the extra with-graph holds are Ciele, AeroBill, and the four treadmill SKUs that still have a leftover same-drive edge (Sole / Mirafit / Assault Pro / Elite). Same evidence as the original four.

---

## 6. Regression test

`tests/alternatives-hold-classification.test.ts`:

1. Cap vs beanie / Sherpa cluster + INVALID scoring.
2. Motorised vs curved cluster + INVALID scoring; comparison still allowed.
3. The four slugs classify as `HOLD_INSUFFICIENT_ALTERNATIVE_MARKET`.
4. **Every published Alternatives candidate** (approved alt edges, `canPublish` fail) must have an explained hold (`HOLD_INSUFFICIENT_ALTERNATIVE_MARKET` \| `HOLD_DUPLICATE_INTENT` \| `HOLD_OBSOLETE_SOURCE`). **`THIN_UNEXPLAINED` must stay empty** when the graph changes.

Also covered in `tests/decision-graph-semantic-quality.test.ts` (GOCap vs beanie; Horizon vs Woodway; Capilene still a tee).

`npm run alternatives:qa` includes the new file.

---

## 7. What we did not reverse

- Fix 67–69 (links, lint, brand depth / NNormal).
- Fix 70 scorer tightness (Capilene, trail roles).
- Held verticals are still not padded. Media-gated products stay unpublished.
- `ALTERNATIVES_INDEXABLE_CATEGORIES` unchanged (clothing and treadmills were never Day-1 indexable Alternatives).
