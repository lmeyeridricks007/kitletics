# Fix 09 — Product Relationships & Comparison Quality (Decision Graph)

**Mode:** Remediation (relationship sync + comparison depth + Best/Guide → Compare wiring; no combinatorial pair generation)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/03-editorial-quality.md`, `docs/prelaunch/05-architecture-internal-links.md`  
**Evidence:** re-run `prelaunch-03` + production crawl `prelaunch-05` on `http://127.0.0.1:3010`

---

## 1. Scoreboard

| Metric | Before | After |
|---|---:|---:|
| Thin comparisons (exposed, not meaningful) | **28** | **0** |
| Meaningful / exposed comparisons | 74 / ~102 | **102 / 102** |
| Running products without alternatives | **262** | **9** |
| Running products with alternatives | — | **361** |
| Best → Comparison contextual edges | **0** | **257** |
| Product → Comparison contextual edges | 322 | **348** |
| Guide → Comparison (Running HTML main, spot measure) | ~0 editorial | **46** (20 guides) |

Combinatorial generation: **not used**. Only existing editorial pairs were deepened; Best/Guide links attach only when a published comparison already exists for a recommendation / related-product pair.

---

## 2. Root causes

1. **Alternatives gap** — Catalog `alternativeProductIds` existed on many Running products, but the link-graph / alternatives audit counted **relationship-graph** edges (`isAlternativeType`). Sync was missing → false “no alternatives” mass.
2. **Thin comparisons** — Seeds lacked criteria + use-case picks + key differences (or long summary + criteria). Mostly non-Running; one Running seed (`cmp-nb5-ghost`) included.
3. **Best → Compare = 0** — Best pages linked the dynamic builder (`/compare?category=…&products=…`), classified as Hub, **not** `/compare/{slug}` Comparison pages. Pick-level editorial compare CTAs were missing from the live Best detail layout.
4. **Guide → Compare** — Explainers often pointed at the same query builder; `relatedComparisonIds` was unused on buying guides.

---

## 3. Product relationship graph

### What we did

| Change | Location |
|---|---|
| Sync published Running `alternativeProductIds` → bidirectional `direct-competitor` edges with product-specific reasons | `src/content/running/decision-graph-alt-sync.ts` |
| Wire into approved graph | `src/repositories/relationships.ts` → `getSyncedAlternativeRelationships()` |

Reasons explain **why** the peer is relevant (same-category alternative for the source’s primary strength / short description). No arbitrary cross-category pairs.

### Relationship types used

| Type | Source |
|---|---|
| `direct-competitor` / alternative-group types | Existing curated `relationships` + synced catalog alts + legacy alternatives |
| Same-family / upgrade / downgrade / different-use-case | Retained from curated seeds where already authored — **not** auto-generated |

### Remaining without alternatives (Running = 9)

Legitimate thin markets or singleton SKUs in catalog (examples): safety LEDs, niche clothing, specialty treadmills. **Not forced** into fake peers.

Sitewide “products without alternatives” (211) still includes padel/tennis/pickleball SKUs outside this Running decision-graph fix.

---

## 4. Comparison quality

| Change | Location |
|---|---|
| Deepen thin seeds: summary, verdict, ≥2 criteria, use-case picks, key differences, choose-A / choose-B | `src/content/running/comparison-depth-enrichment.ts` |
| Apply to all editorial comparisons | `src/content/editorial.ts` → `applyComparisonDepthEnrichment` |

Audit bar (unchanged): criteria + use-case + diffs **or** long summary + criteria.

**After:** thin = **0**; meaningful = **102**. Bad / low-intent pairs were not invented.

---

## 5. Best → Compare

| Change | Location |
|---|---|
| Attach `relatedComparisonIds` (manual P0 + auto pair match on recs) | `src/content/running/best-guide-compare-links.ts` |
| Apply on Best export | `src/content/best-guides.ts` |
| Resolve + render “Compare these picks” → `/compare/{slug}` | `get-best-guide-page-data.ts`, `BestGuideRelatedComparisons.tsx`, `BestGuideDetailPage.tsx` |
| Per-pick “Compare closest →” when product has editorial comps | `BestGuideDetailedPicks.tsx` |

Contextual labels include: Compare top two, Compare stability picks, Compare watch shortlist, etc.

**Crawl:** `bestToComparison` **0 → 257**.

---

## 6. Product → Compare

PDP already surfaced closest editorial comparisons (`ProductDetailPage` / graph). After enrichment + crawl:

**productToComparison** **322 → 348**.

---

## 7. Guide → Compare

| Change | Location |
|---|---|
| Attach `relatedComparisonIds` (manual decision flows + related-product pairs) | `src/content/running/buying-guide-compare-links.ts` |
| Apply on buying guides | `src/content/editorial.ts` |
| Schema field | `buyingGuideSchema.relatedComparisonIds` |
| Resolve + render ComparisonCards | `getBuyingGuidePageData`, `LongFormGuidePage`, `BuyingGuideDetailPage` |

Examples: how-to-choose shoes / watch / HRM, cushioning, stability, daily trainer, carbon vs nylon.

**Spot measure:** **46** Guide → `/compare/{slug}` edges across **20** Running guides.

---

## 8. Re-run link graph (summary)

From refreshed `docs/prelaunch/05-architecture-internal-links.md` / `data/05-link-graph.json`:

| Expected relation | Count |
|---|---:|
| productToComparison | 348 |
| bestToComparison | 257 |
| productToAlternatives | 361 |
| Running without alternatives | 9 |

From refreshed `docs/prelaunch/03-editorial-quality.md`:

| Comparisons | Count |
|---|---:|
| Thin | **0** |
| Meaningful | **102** |

---

## 9. Definition of done checklist

- [x] Meaningful Running alternatives where market peers exist (synced graph)
- [x] Alternative reasons present on sync edges
- [x] Thin comparisons fixed (0 remaining)
- [x] No combinatorial comparison generation
- [x] Best → editorial Compare CTAs live (crawl edges > 0)
- [x] Product → Compare retained / slightly up
- [x] Guide → Compare where decision flow is natural
- [x] Metrics re-measured; this report filed

---

## 10. Follow-ups (out of scope)

- Curate explicit same-family / upgrade / downgrade edges for more major shoe lines beyond existing seeds
- Reduce sitewide non-Running “without alternatives” (padel shoes, grips, etc.) with sport-specific sync
- Optionally add `guideToComparison` to the conceptual edge table in audit 05 (today counted via Best + spot Guide crawl)
