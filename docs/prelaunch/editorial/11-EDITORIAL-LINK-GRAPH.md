# Editorial Internal Link Graph — Editorial 47

**Document ID:** `11-EDITORIAL-LINK-GRAPH`  
**Generated:** 2026-09-09  
**Scope:** Contextual linking across Reviews, Best, Guides, Comparisons, Categories, Brands  
**Data:** [`data/47-editorial-link-graph.json`](data/47-editorial-link-graph.json) · helpers [`../../src/content/link-graph-p47.ts`](../../src/content/link-graph-p47.ts) · audit `scripts/tmp/prelaunch-47-editorial-link-graph.ts`

## Executive status

| Metric | Value |
|---|---:|
| Contextual edges (assembler graph) | **8,630** |
| Missing required outs | **0** |
| Editorial orphans | **0** |
| Policy | Contextual only — no everything↔everything |

## Required relationships (shipped)

| From | Required outs | How wired |
|---|---|---|
| **Review** | Product · Alternatives · Comparison · Best · Guide | `ReviewRelatedLinks` + existing product CTA; comparisons union seed + `getComparisonsForProduct`; Best/Guide via product + category fallbacks (`link-graph-p47`) |
| **Best** | Product · Review · Comparison · Finder · Guide | Existing pick cards + `BestGuideRelatedComparisons` / LowerCards; empty `relatedBuyingGuideIds` → category defaults; empty compares → same-category comps |
| **Guide** | Guide · Best · Product · Finder · Compare | Peer guides in `GuideSidebar` (`relatedPeerGuides`); Best/Finder/Compare fallbacks in `getBuyingGuidePageData` |
| **Comparison** | Both products · Both reviews · Alternatives | Existing product/review links + Alternatives page CTAs for each side |
| **Category** | Best · Guides · Finder · Products | Already assembled in `assembleCategoryPage` / `CategoryPage` |
| **Brand** | Products · Reviews · Comparisons · Best | Already assembled in `BrandHubPage` |

## What changed (Fix 47)

1. **Review “Keep reading” rail** — renders Product, Alternatives page, editorial Comparisons (`/compare/{slug}`), Best guides, Buying guides with natural anchors (`ReviewRelatedLinks.tsx`).
2. **Review page-data** — fills comparisons beyond seed IDs; resolves buying guides + category Best fallbacks.
3. **Best page-data** — category buying-guide + comparison fallbacks when explicit ids are empty.
4. **Guide page-data + sidebar** — peer guide clusters; Best/Finder/Compare fallbacks; merge cluster peers with any explicit `relatedGuideIds`.
5. **Comparison page** — “Full alternatives to {name}” → `/products/{slug}/alternatives` (also when the peer-alt list is empty).
6. **Schemas** — `Review.relatedBuyingGuideIds`, `BuyingGuide.relatedGuideIds`.

## Anchors

Descriptive, role-correct labels only — e.g. “What to buy instead of Vomero 18”, “Nike Vomero 18 specs & offers”, guide/Best titles as written. No keyword-stuffed “best best running shoes review comparison” strings.

## Orphans

**Target met: 0 editorial orphans** in the repository link graph (inbound from Product / Review / Best / Guide / Comparison / Brand / Category contextual edges).

Entry hubs (category/brand) with outbound decision links are treated as navigational roots, not orphans.

## Intentionally not linked

- Random cross-sport jumps (e.g. padel racket ↔ running sock) outside shared category/cluster.
- Stamping every review with every comparison in the category when the product is not a participant — comparison outs are **product-participating only**.
- Duplicate hero recycling or SEO dump footers.

## Definition of done

- [x] Required outs present when corpus targets exist  
- [x] 0 editorial orphans  
- [x] Natural anchors  
- [x] UI surfaces Review → Best / Guide / Comparison / Alternatives (previously assembled but unrendered)  
- [x] Report + machine-readable audit JSON  

## Follow-ups (non-blocking)

- Live HTML crawl (`prelaunch-05`) can re-validate rendered anchors after deploy.  
- Thin verticals without a buying guide remain N/A for Review→Guide until a real guide exists (not invented).
