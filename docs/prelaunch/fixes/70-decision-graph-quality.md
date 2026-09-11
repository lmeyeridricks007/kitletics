# Fix 70 — Decision graph quality audit

**Date:** 2026-09-10  
**Mode:** Semantic quality (substitutability / buyer plausibility) — not ID resolution  
**Evidence:** [`../data/rc-70/graph-audit-summary-before.json`](../data/rc-70/graph-audit-summary-before.json) · [`../data/rc-70/graph-audit-summary-after.json`](../data/rc-70/graph-audit-summary-after.json) · [`../data/rc-70/graph-audit.json`](../data/rc-70/graph-audit.json)  
**Scorer:** `src/lib/decision-graph/semantic-quality.ts`  
**Overlay:** `src/content/decision-graph-p70-quality.ts` (after Fix 65 fill)  
**Audit:** `scripts/tmp/prelaunch-70-graph-audit.ts`

Priority was the **INDEXABLE Running** estate, then held verticals. Edge count was not maximized. `canPublishAlternativesPage` was not loosened.

---

## 1. Result

Every scored relationship class is **0 INVALID** after overlay. Remaining WEAK edges are editorial (routing picks, generation forks, complementary fuel/carry) and were **not** replaced unless a genuine STRONG same-job peer was unused.

| Relationship | Before (live graph) | After | INVALID Δ |
|---|---:|---:|---:|
| Product → Alternative | 2007 | **1902** | 146 → **0** |
| Product → Comparison | 94 | **94** | 1 → **0** |
| Product → Best | 366 | **365** | 3 → **0** |
| Product → Guide | 280 | **280** | 0 → **0** |
| Review → Alternative | 2226 | **1952** | 304 → **0** |
| Best → Comparison | 83 | **79** | 4 → **0** |
| Approved relationship-graph edges | 2731 | **2709** | −22 synced alts |
| INDEXABLE Running alt INVALID / WEAK | 42 / 64 | **0 / 13** | |

Catalog: 625 products · **369 INDEXABLE** (all Running).

---

## 2. Scores by class

### Product → Alternative

| Class | Before | After |
|---|---:|---:|
| STRONG | 1286 | **1421** |
| VALID | 339 | **330** |
| WEAK | 236 | **151** |
| INVALID | 146 | **0** |

Net −105 edges. STRONG **rose** because the first-pass scorer over-flagged adjacent jobs (Superblast vs Novablast, Sense Ride vs Peregrine, gel/chew, Miler vs Capilene). True INVALID was deleted, not refilled.

### Product → Comparison

| Class | Before | After |
|---|---:|---:|
| STRONG | 73 | **74** |
| VALID | 11 | **10** |
| WEAK | 9 | **10** |
| INVALID | 1 | **0** |

The one INVALID (`nike-miler-vs-patagonia-capilene-cool`) was a **clothing-form false positive** (`capilene` matched `/cap/` → headwear). Recalibrated. Pair kept.

### Product → Best

| Class | Before | After |
|---|---:|---:|
| STRONG | 359 | **360** |
| VALID | 0 | **0** |
| WEAK | 4 | **5** |
| INVALID | 3 | **0** |

Removed **Torin 8** from Best Trail Running Shoes (road zero-drop daily; Lone Peak already covers Altra trail). FlipBelt and Skyflask on Best Hydration for Marathon Training were **false INVALID** (guide mixes belts, handhelds, and light vests) — kept, now STRONG.

### Product → Guide

| Class | Before | After |
|---|---:|---:|
| STRONG | 58 | **58** |
| VALID | 190 | **190** |
| WEAK | 32 | **32** |
| INVALID | 0 | **0** |

WEAK “off-category” (flask on a vest explainer, belt on vest-vs-belt) is the guide doing its job. Not stripped.

### Review → Alternative

| Class | Before | After |
|---|---:|---:|
| STRONG | 1221 | **1197** |
| VALID | 430 | **476** |
| WEAK | 271 | **279** |
| INVALID | 304 | **0** |

Unpublished targets and remaining cross-category / non-substitutable IDs stripped at `getReviews` (`sanitize-review-alternatives.ts`). WEAK kept when the trade-off was not a better unused STRONG peer.

### Best → Comparison

| Class | Before | After |
|---|---:|---:|
| STRONG | 60 | **63** |
| VALID | 11 | **9** |
| WEAK | 8 | **7** |
| INVALID | 4 | **0** |

Dropped four **draft** comparison IDs (P41 broken peers) that Best pages still linked:

- `cmp-elite-8-active-powerbeats-pro-2`
- `cmp-hotty-pace`
- `cmp-knog-frog-nite-ize-radiant`
- `cmp-theragun-prime-renpho-r3`

`applyBestGuideComparisonLinks` / `applyBuyingGuideComparisonLinks` now ignore unpublished / `noindex` comparison IDs. Best-guides apply P41 before linking.

---

## 3. What was actually INVALID (removed)

Not “IDs fail to resolve” as the only test. Semantic fails:

| Pattern | Action |
|---|---|
| `alternativeProductIds` pointing at **media-gated / unpublished** SKUs | Dropped. Did **not** un-draft those products to make the edge resolve. |
| Vest ↔ quiver (e.g. Custom Quiver → ADV Skin 12) | Removed. Complementary, not a substitute. |
| Belt / flask ↔ vest as **alternatives** | Removed. Vest-vs-belt is a Guide, not an alt edge. |
| Tee vs headwear false positive | Recalibrated clothing form; Capilene stays a tee. |
| Road Torin 8 as a **trail Best rec** | Removed from trail recommendations, shortlist, and comparison list. Left on considered as “looked at.” Wide-feet Best rec **kept** (that context is real). |
| Draft comparison IDs on Best pages | Unlinked. |

P65 fill no longer uses one giant `shoes` bucket. Fill is `shoes:road-daily`, `shoes:trail-daily`, etc., and skips INVALID peers.

---

## 4. WEAK that stayed (on purpose)

Replace WEAK only when a genuine STRONG unused same-role peer exists. These did **not** qualify:

| Edge | Why WEAK stays |
|---|---|
| Marathon Best: Clifton / Novablast / Superblast | Cycle trainers on a race guide — editorial routing, not a strip. |
| Stability Best: Ghost / Clifton | “If you don’t need stability” routing. |
| Previous-gen Speed 4 / Rebel v4 vs a current other-family peer | Same role, different generation franchise. |
| Nutrition bar vs chew, drink vs chew | Complementary fuel formats. |
| Guide flasks on vest explainers | Compatible carry, not the same SKU job. |
| Held padel / tennis / fitness comparisons with thin use-case overlap | Buyer-plausible pairs; scorer conservative. **Not padded, not deleted.** |
| Best → Compare with only one overlapping rec | Distinguishes a rec vs a close peer that is not also a pick. Still useful. |

INDEXABLE Running alts still WEAK: **13** (mostly previous-gen vs another brand’s current, or fuel-form forks).

---

## 5. Scorer calibration (before overlay)

First-pass counts over-flagged real substitutes. Recalibrated **before** deleting:

1. **Shoe role** — unplated `sub-tempo` + max-cushion (Superblast) is max-cushion, not tempo. Daily trainers with `uc-tempo-runs` (Pegasus) stay daily. Trail family wins when terrain is trail, even with `sub-road-trail`. `trail-race` adjacent to `trail-ultra`.
2. **Clothing** — subcategory first; `/cap/` must not match Capilene.
3. **Nutrition** — gel ↔ chew VALID; gel/chew vs drink WEAK; same-brand fuel system VALID.
4. **Best hydration** — `needVest` is vest slugs, not every “hydrat*” Best.

---

## 6. What we did **not** do

- Did not invent comparisons, products, or unpublished peers.
- Did not refill INVALID with random same-category shoes.
- Did not pad padel / tennis / fitness graphs.
- Did not lower Alternatives publish gates.
- Did not treat WEAK marathon/stability routing picks as errors.

---

## 7. Files

| Path | Role |
|---|---|
| `src/lib/decision-graph/semantic-quality.ts` | STRONG / VALID / WEAK / INVALID scorer |
| `src/content/decision-graph-p70-quality.ts` | Drop INVALID alts; replace WEAK only with unused STRONG same-job peers |
| `src/content/alternatives-p65-completion.ts` | Role clusters + skip INVALID fill |
| `src/lib/decision-graph/sanitize-review-alternatives.ts` | Review alt IDs |
| `src/repositories/editorial.ts` | Apply sanitizer on review reads |
| `src/content/running/best-guides.ts` | Torin 8 off trail recs |
| `src/content/running/best-guide-compare-links.ts` | Drop unpublished comparison IDs |
| `src/content/best-guides.ts` | P41 before Best → Compare attach |
| `tests/decision-graph-semantic-quality.test.ts` | Role / trail Best / clothing checks |

---

## 8. Definition of done

- [x] Six relationship types classified semantically
- [x] INVALID removed
- [x] WEAK replaced only when a better STRONG peer existed
- [x] INDEXABLE Running first; held verticals cleaned of INVALID only
- [x] Before/after counts by type (this file + `rc-70` JSON)
