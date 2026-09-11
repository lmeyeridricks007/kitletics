# Fix 65 — Complete thin Alternatives decision graphs

**Date:** 2026-09-10  
**Status:** Implemented  
**V3 residual:** [`../FINAL-EDITORIAL-READINESS-V3.md`](../FINAL-EDITORIAL-READINESS-V3.md) — **157** Alternatives `thin_decision_shape` (`canPublishAlternativesPage` fail)  
**Gate (unchanged):** ≥3 alternatives, ≥2 relationship types, meaningful reasons, switch/trade-off copy on ≥2 cards  
**Scripts:** `scripts/tmp/prelaunch-65-alt-audit.ts`, `scripts/tmp/prelaunch-65-classify.ts`  
**Data:** [`../data/65-alt-thin-audit.json`](../data/65-alt-thin-audit.json) (pre-fill audit) · [`../data/65-alt-completion.json`](../data/65-alt-completion.json)

No products were onboarded merely to pass the gate. Extra edges come from **existing catalog peers in the same decision cluster**.

---

## Result

| Check | V3 | After |
|---|---|---|
| Original thin (`canPublish` fail) | **157** | **0 unexplained** |
| Became **READY** | — | **141** |
| `HOLD_INSUFFICIENT_ALTERNATIVE_MARKET` | (unexplained thin) | **15** |
| `HOLD_DUPLICATE_INTENT` | — | **1** |
| `HOLD_OBSOLETE_SOURCE` | — | **0** (previous-gen pages were completable from catalog) |
| Remaining unexplained thin | 157 | **0** |
| INDEXABLE Alternatives | 92 | **131** (indexable categories that now pass the gate) |
| INDEXABLE uniqueness `NEEDS_DIFF` / `DUPLICATIVE` | 0 / 0 | **0 / 0** |

READY ≠ INDEXABLE. Accessory / nutrition / clothing holds and READY pages outside `ALTERNATIVES_INDEXABLE_CATEGORIES` stay `PUBLIC_NOINDEX` or `HIDDEN_404` as before.

---

## 1. Audit of the 157

Live `{ isDev: false }` graph **before** catalog fill (156 still failing at session start; V3 listed 157 including pages Fix 64 had already returned to READY).

**Why they failed (pre-fill, 156):**

| Gate reason | Count |
|---|---:|
| need ≥2 distinct alternative types | 135 |
| need meaningful unique reasons on ≥3 alts | 103 |
| need switch/trade-off decision shape on ≥2 alts | 61 |
| need ≥3 alternatives (have 1) | 53 |
| need ≥3 alternatives (have 2) | 50 |

Most “have ≥3” pages were **one relationship type** (`direct-competitor`) after name-scrub-friendly inference. That is a typing/copy gap, not a missing market.

**By category (pre-fill):** Running Shoes 28 · Clothing 26 · Padel rackets 21 · Recovery 16 · Tennis rackets 14 · Hydration 8 · GPS 7 · Nutrition 6 · Padel shoes 5 · Socks 5 · Packs 4 · Lights 3 · HRM 3 · Safety 3 · Accessories 3 · Headphones 2 · Belts 2.

### Classification (A–F)

| Class | Meaning | Count (intent) | Outcome |
|---|---|---:|---|
| **A FIXABLE** | Catalog already has ≥3 genuine same-cluster peers, or ≥3 edges needed only types/copy | **141** | **READY** |
| **B TOO NICHE** | Category large, form-factor is a 1–2 SKU island | folded into **C** | holds |
| **C NOT ENOUGH REAL PEERS** | Same-cluster published peers **&lt; 3** | **15** | **HOLD_INSUFFICIENT_ALTERNATIVE_MARKET** |
| **D DUPLICATE INTENT** | Women’s SKU whose men’s Alternatives page is already READY and the women’s graph cannot add a third distinct peer | **1** | **HOLD_DUPLICATE_INTENT** |
| **E OBSOLETE** | Previous-gen with a current family SKU | 15 in first pass | **Completed (A)** — leftover Ultra 2 / Glycerin 21 / Vertex 04 still have shoppers |
| **F OTHER** | — | 0 | — |

Full pre-fill rows: `docs/prelaunch/data/65-alt-thin-audit.json`.

---

## 2–5. What we fixed (A only)

### Graph, not fake SKUs

1. **Sync padel + tennis** (was running-only). Listed `alternativeProductIds` on racket products were never becoming edges.  
2. **Same-cluster catalog fill** to ≥3 IDs when the cluster actually has ≥3 other published products (shoes, watches, HRM, trail, gels, padel/tennis, reservoirs with reservoirs, etc.).  
3. **Type diversity** when a source’s edges had collapsed to one type: catalog-backed `better-value` / `lighter-alternative` / race / trail / `similar` — not a second edge to the same product.  
4. **Reason enrichment** on short racket/legacy bullets so switch + give-up/keep verbs exist (`buildSyncedAltReasons`).  
5. **Keep-the-source framing** stays in card copy (who should stay / Keep {source}).

`previous-generation` remains **STRUCTURAL** (does not count toward the 3-alt gate). We did not retype Novablast 6’s previous-gen edge; existing tests pass.

### Decision dimensions used

Shoes: cushion, stability, weight, race vs daily, trail grip, value.  
Watches: maps, battery/display (MIP vs AMOLED), ecosystem, feature set.  
Hydration: flask vs reservoir vs handheld.  
Rackets: control vs power, value, weight.  
Nutrition: carb unit, sodium, format.

No invented unpublished specs.

### Alternative types

Assigned only from catalog evidence (weight, valueScore, use cases, cushion, trail). Not a forced “Best cheaper / lighter / premium” set on every card.

---

## 6. Small / niche — HOLD_INSUFFICIENT_ALTERNATIVE_MARKET (15)

Do not pad. Cluster size (same form-factor, same gender when the SKU is gendered) is **&lt; 3 other published products**.

| Source | Cluster | Graph alts | Why the market is short |
|---|---|---:|---|
| `2toms-sportshield` | anti-chafe | 2 | Only three anti-chafe SKUs in catalog |
| `body-glide-original` | anti-chafe | 2 | Same trio |
| `squirrels-nut-butter` | anti-chafe | 2 | Same trio |
| `nike-therma-fit-glove` | gloves | 2 | Three running gloves |
| `craft-adv-lumen-glove` | gloves | 2 | Same |
| `smartwool-thermal-merino-glove` | gloves | 2 | Same |
| `hydrapak-tube-kit` | hydration:tube | 1 | Tube kit is not a flask; no second hose SKU |
| `nathan-zippered-stash` | packs:stash | 1 | Stash/utility pocket, not a 5L vest |
| `cep-run-compression-sock-3` | socks:compression | 1 | Compression sock ≠ daily run sock |
| `nike-aeroswift-singlet-men` | singlet | 1 | No third men’s racing singlet |
| `patagonia-nano-puff-vest-men` | vest | 2 | Insulated vest aisle is tiny |
| `tracksmith-brighton-ls-men` | long-sleeve | 2 | LS run tops &lt; 3 peers |
| `odlo-active-warm-eco-bottom-men` | base-bottom | 2 | Base-layer bottoms island |
| `brooks-notch-thermal-men` | unique garment | 1 | Notch thermal has no same-piece trio |
| `salomon-bonatti-wp-women` | women’s jacket | 1 | Women’s WP jacket peers &lt; 3 (men’s Bonatti page is separate) |

---

## 7. Duplicate intent — HOLD_DUPLICATE_INTENT (1)

| Source | Why |
|---|---|
| `nike-dri-fit-miler-women` | Men’s Miler Alternatives is already READY. Women’s graph cannot add a third women’s tee without cloning that page. Use `/products/nike-dri-fit-miler-men/alternatives` for the switch decision; the women’s PDP stays the size/last page. |

---

## 8. Final classification of the 157

| Disposition | Count |
|---|---:|
| READY | **141** |
| HOLD_INSUFFICIENT_ALTERNATIVE_MARKET | **15** |
| HOLD_DUPLICATE_INTENT | **1** |
| HOLD_OBSOLETE_SOURCE | **0** |
| Unexplained thin | **0** |

Classifier: `classifyAlternativesHold()` · eligibility reason codes `hold_insufficient_alternative_market` / `hold_duplicate_intent` (no more blanket `thin_decision_shape` on these 16). Editorial workState for holds: `BLOCKED_INTENTIONALLY`.

---

## 9. Quality re-run

- `canPublish` unexplained fail among the original 157: **0**  
- Alternatives page tests: **9/9**  
- Relationship tests: **pass**  
- INDEXABLE uniqueness (Fix 59 Jaccard, name-scrub): **0 NEEDS_DIFF**, **0 DUPLICATIVE** (131 indexable pages). Six indexable collisions from graph expansion (255↔165, 570↔Pace Pro, Peregrine↔Trailfly Max) were split with product-specific intros + card voices.

Non-indexable READY pages may still sit in `TEMPLATE_SIMILAR_ACCEPTABLE` or isolated `NEEDS_DIFF` like the Fix 64 accessory set; they are not Day-1.

---

## Implementation

| File | Role |
|---|---|
| `src/content/alternatives-p65-completion.ts` | Cluster keys, catalog fill, type diversity, P65 intros/voices |
| `src/lib/product/classify-alternatives-hold.ts` | READY vs three hold classes vs `THIN_UNEXPLAINED` |
| `src/content/running/decision-graph-alt-sync.ts` | Padel/tennis sync + typed reasons |
| `src/repositories/relationships.ts` | Reason enrichment + per-source type split |
| `src/content/products.ts` | `applyAlternativesP65Graph` |
| `src/domain/launch/get-launch-eligibility.ts` | Hold reason codes |
| `src/domain/editorial-readiness/assess.ts` | Explicit hold → `BLOCKED_INTENTIONALLY` |

---

## What we did not do

- Did **not** invent anti-chafe, glove, or tube-kit SKUs to hit ≥3.  
- Did **not** treat a foam roller as an alternative to a massage gun, or a vest as an alternative to a rain jacket.  
- Did **not** add packs/sunglasses/nutrition/clothing to `ALTERNATIVES_INDEXABLE_CATEGORIES`.  
- Did **not** change uniqueness thresholds.

---

## Definition of done

- [x] All 157 audited (fail reason, cluster, peers)  
- [x] FIXABLE pages completed from catalog only  
- [x] Cards still explain keep-the-original vs switch  
- [x] Insufficient markets explicitly held  
- [x] One true duplicate-intent hold  
- [x] Unexplained thin = **0**  
- [x] Report at `docs/prelaunch/fixes/65-alternatives-completion.md`
