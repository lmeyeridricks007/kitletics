# Fix 25 — Content uniqueness & programmatic quality audit

**Date:** 2026-09-06  
**Status:** Audited + Day-1 protected (pre-launch — **do not publish**)  
**Priority:** CRITICAL (index quality / semantic duplication)  
**Mode:** Detect → classify → hold DUPLICATIVE from Day-1 index. No mass paraphrase.

**Machine data:** [`../data/25-content-uniqueness.json`](../data/25-content-uniqueness.json)  
**Hold overlay:** `src/content/launch/content-uniqueness-holds.ts` (539 review slugs)  
**Auditor:** `scripts/tmp/prelaunch-25-content-uniqueness.ts`  
**Library:** `src/domain/content-uniqueness/`

---

## Objective

Scale produced **503 structurally LAUNCH_READY reviews** and large Best / Guide / Comparison corpora. Confirm that scale did **not** create indexable name-swapped / scaffold-templated duplication. Protect Day-1 indexation.

---

## Method

Within each category (reviews/products) or corpus (best/guides/comparisons):

1. Scrub product / brand / model names → `ENTITY`
2. Normalize whitespace / punctuation
3. Token Jaccard + 3-gram shingle Jaccard
4. Count shared scaffold phrases from programmatic review generation
5. Classify:

| Class | Rule (summary) |
|---|---|
| **GENUINELY UNIQUE** | Peer similarity &lt; ~0.48 and low scaffold |
| **TEMPLATE-SIMILAR BUT ACCEPTABLE** | Shared house voice / mild overlap; product-specific signal remains |
| **NEEDS DIFFERENTIATION** | High overlap or dense scaffold without full clone |
| **DUPLICATIVE** | ≥~0.90 peer similarity **or** ≥0.82 + dense scaffold (≥5 hits) |
| **HOLD** | Already blocked / vertical-held |

---

## Results (measured)

### Corpus classification counts

| Kind | UNIQUE | ACCEPTABLE | NEEDS DIFF | DUPLICATIVE |
|---|---:|---:|---:|---:|
| Reviews | 41 | 5 | 18 | **521** |
| Products | 593 | 30 | 0 | 0 |
| Best guides | 33 | 25 | 0 | 0 |
| Buying guides | **68** | 0 | 0 | 0 |
| Comparisons | 72 | 23 | 7 | 0 |

### Day-1 review indexation impact

| Metric | Before uniqueness gate | After Fix 25 |
|---|---:|---:|
| Assessed `LAUNCH_READY` reviews | ~500+ structural | **46** |
| Assessed `DUPLICATIVE` | 0 (type unused) | **539** |
| **INDEXABLE** reviews (`isDev: false`) | ~367 | **43** |

The 43 remaining indexable reviews are the differentiated flagship set (Vomero, Novablast, Ghost, Clifton, Bondi, Vaporfly, major watches/HRMs, etc.).

---

## 1. Review similarity — clusters

### Worst pairs (name-scrubbed)

| Score | Shared ¶ | Pair |
|---:|---:|---|
| 0.971 | 38 | `brooks-glycerin-gts-22` ↔ `hoka-gaviota-5` |
| 0.965 | 38 | `salomon-ultra-glide-2` ↔ `saucony-xodus-ultra-3` |
| 0.962 | 40 | `asics-gel-trabuco-13` ↔ `brooks-cascadia-18` |
| 0.960 | 36 | `asics-gel-trabuco-13` ↔ `salomon-ultra-glide-2` |
| 0.958 | 36 | `brooks-cascadia-18` ↔ `saucony-xodus-ultra-3` |
| 0.948 | — | `asics-gt-2000-14` ↔ `nike-structure-26` |

Pattern: **entity-name substitution** into a shared review scaffold (`built for a specific job…`, shared fit/cushion/ride/value paragraphs from `reviews-backfill` generation).

### Classification actions

| Class | Count | Day-1 action |
|---|---:|---|
| DUPLICATIVE | 521 | **PUBLIC_NOINDEX** via uniqueness hold → `assessReviewLaunchQuality` = `DUPLICATIVE` |
| NEEDS DIFFERENTIATION | 18 | **Held** (scaffold ≥5 or peer ≥0.78) — same gate |
| ACCEPTABLE / UNIQUE | 46 | Remain eligible if other launch gates pass |

**No mass paraphrase.** Rewriting 500+ reviews with superficial wording changes would only evade detectors. Substantive rewrites are a **post-launch backlog** per product evidence.

---

## 2. Product analysis

| Result | Count |
|---|---:|
| GENUINELY UNIQUE | 593 |
| TEMPLATE-SIMILAR ACCEPTABLE | 30 |
| DUPLICATIVE / NEEDS DIFF | **0** |

Product `shortDescription` / strengths / weaknesses stay largely product-specific. No Day-1 product holds from uniqueness.

---

## 3. Best guides

| Result | Count |
|---|---:|
| GENUINELY UNIQUE | 33 |
| TEMPLATE-SIMILAR ACCEPTABLE | 25 |

Highest overlaps (acceptable / intentional adjacency):

| Score | Pair | Note |
|---:|---|---|
| 0.708 | `race-shoes` ↔ `carbon-plated-running-shoes` | Overlapping race/plate universe — monitor cannibalization |
| 0.645 | `running-watches-trail` ↔ `running-watches-ultra` | Shared outdoor watch reasoning |
| ~0.63 | beginners / budget / small-wrists watch guides | Shared entry-GPS language |

**No DUPLICATIVE Best guides.** Cross-use-case reuse stayed below the duplicative bar. Remaining risk: race vs carbon plate SEO overlap (editorial, not template clone).

---

## 4. Guides (buying / explainers)

| Result | Count |
|---|---:|
| GENUINELY UNIQUE | **68** |
| Duplicate intros / sections flagged | **0** |

Buying guides pass uniqueness. Keep watching intent overlap vs Best (`daily-trainers` ↔ `what-is-a-daily-trainer`) as SEO architecture, not copy clone.

---

## 5. Comparisons

| Result | Count |
|---|---:|
| GENUINELY UNIQUE | 72 |
| TEMPLATE-SIMILAR ACCEPTABLE | 23 |
| NEEDS DIFFERENTIATION | 7 |

The 7 NEEDS DIFF comps are **padel / tennis / fitness rower** pairs with high peer similarity (0.72–0.84). All are already **`HIDDEN_404` via vertical hold** — not Day-1 indexable.

Running comparisons (Novablast vs Ghost, Vaporfly vs Alphafly, etc.) classify as unique/acceptable with pair-specific verdicts and choose-reasons.

---

## 6. Fixes shipped

| Fix | Detail |
|---|---|
| Uniqueness library | `src/domain/content-uniqueness/text.ts` |
| Audit CLI | `scripts/tmp/prelaunch-25-content-uniqueness.ts` |
| Hold set | `CONTENT_UNIQUENESS_REVIEW_HOLDS` — **539** slugs |
| Launch gate | `assessReviewLaunchQuality` returns **`DUPLICATIVE`** when held → eligibility **`PUBLIC_NOINDEX`** |
| Tests | `tests/content-uniqueness.test.ts` |

### What we deliberately did **not** do

- Did **not** auto-paraphrase DUPLICATIVE reviews to “beat” similarity
- Did **not** invent product-specific testing claims
- Did **not** force Best/Guide rewrites where class = ACCEPTABLE

### NEEDS DIFFERENTIATION — repair policy applied

| Set | Repair |
|---|---|
| 18 scaffold-dense gear/accessory reviews | **Hold** (same as DUPLICATIVE for Day-1) — rewrite only with real product evidence later |
| 7 racket/fitness comps | Already vertical-**HOLD**; differentiate before those verticals go live |

---

## 7. Publication / Day-1 policy

```
DUPLICATIVE review  →  PUBLIC_NOINDEX  (not Day-1 INDEXABLE)
High-risk NEEDS_DIFF review  →  same hold set
UNIQUE / ACCEPTABLE + other gates  →  may INDEX
Vertical-held comps  →  HIDDEN_404 (unchanged)
```

Re-run after editorial rewrites:

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-25-content-uniqueness.ts
npx vitest run tests/content-uniqueness.test.ts
```

Then rebuild so sitemap / robots reflect reduced review index set.

---

## 8. Remaining risks

| Risk | Severity | Mitigation |
|---|---|---|
| ~500 held reviews still public-noindex URLs | Med | Keep `PUBLIC_NOINDEX`; optional later prune to HIDDEN if crawl budget cares |
| Race shoes ↔ carbon-plated Best overlap | Med | Editorial differentiation / canonical intent map |
| Enricher may still expand templates at page-time | Med | Holds apply to enriched assessment path |
| Post-launch wave of unique rewrites needed | High effort | Prioritize top commercial SKUs still held |
| Launch-eligibility Best count test expects ≤12 | Pre-existing drift | Out of Fix 25 scope (44 indexable Best) |

---

## 9. Definition of done

- [x] Similarity audit across reviews / products / best / guides / comps  
- [x] Classification applied to suspicious pages  
- [x] DUPLICATIVE (and high-risk NEEDS DIFF) reviews blocked from Day-1 index  
- [x] No fake paraphrase farm  
- [x] Machine JSON + this report  
- [x] Tests for scrub similarity + hold → `PUBLIC_NOINDEX`

**Do not publish. Do not commit unless asked.**
