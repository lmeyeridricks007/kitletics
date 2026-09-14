# Padel Discovery UX Audit

**Date:** 2026-09-13  
**Status:** CONSUMER DISCOVERY POLISHED — **not** Padel GO / full INDEXABLE enablement  
**Scope:** Hub, category experiences, filters, search, Finder, database/explorers, brand hubs, collections, navigation, mobile notes, internal linking, analytics.

---

## Verdict

Padel now reads as a **coherent Kitletics vertical**: hub shop groups, premium category configs (decision + filters + Best/guides), contextual nav covering all six equipment categories, expanded search synonyms, padel-native brand hubs, verified family collections, and analytics aliases aligned to the discovery checklist.

Secondary **Ball/Bag Finders** and **Ball/Bag Explorers** were evaluated and **not built** — Best Guides + category filters already carry those decisions without inventing shallow tool UX.

---

## 1. Category readiness

| Category URL | Config | Decision intro | Primary filters | Best / guides / comps | Brands strip | Related cats |
| --- | --- | --- | --- | --- | --- | --- |
| `/padel/rackets` | `padel:padel-rackets` | Yes | shape, balance, weightMin, feel, brand, price | Finder + Best + guides | Via assemble | Via education CTAs |
| `/padel/shoes` | `padel:padel-shoes` | Yes | genderFit, support, cushioning, brand, price | Best + guides | Via assemble | Yes |
| `/padel/balls` | `padel:padel-balls` | Yes | ballType, use, speed, ballPositioning, packSize, brand, price | Best + guides | Via assemble | Yes |
| `/padel/bags` | `padel:padel-bags` | Yes | form, racketCompartments, thermalProtection, shoeCompartment, brand, price | Best + guides | Via assemble | Yes |
| `/padel/grips` | `padel:padel-grips` | Yes | gripType, tack, absorption, perforated, packQuantity, brand, price | Best + guides | Via assemble | Yes |
| `/padel/accessories` | `padel:padel-accessories` | Yes | type, compatibility, brand, price | Guides + Best accessories where present | Via assemble | Yes |

**Source:** `src/lib/catalog/padel-category-configs.ts` registered in `CATEGORY_PAGE_CONFIGS`. Running decision enrichment applies **only** when `sportSlug === "running"`.

**Not raw database grids:** Category pages still use `CategoryPage` + `CatalogInteractive` (editorial hero, decision block, Best/guide/compare cards, brand marks, then filtered discovery). Soft-goods explorers were deliberately skipped.

**Residual risk:** Market-wave long-tail SKUs can still thin the grid visually when media is missing — media gate remains separate from discovery IA.

---

## 2. Search coverage

| Intent example | Synonym / intent support | Resolves toward |
| --- | --- | --- |
| AT10 bag | `at10`, `at10 bag`, `padel bags` | Bags + AT10 family products |
| Fast padel balls | `fast padel balls`, `padel balls` | Balls category / speed cans |
| Overgrip sweaty hands | `overgrip sweaty hands`, HaC aliases | Grips / HaC |
| Padel ball pressurizer | `padel ball pressurizer`, Pascal Box | Accessories |
| Bullpadel protector | `bullpadel protector`, frame protector | Accessories |
| Brand one-word (nox, bullpadel, …) | Brand intent heuristic expanded | Brand hubs |

**Files:** `src/lib/search/synonyms.ts`, `src/lib/search/intent.ts`  
**Finder CTA:** padel queries still surface Padel Racket Finder (not running shoe finder).  
**Generic `finder` synonym** now expands to running **and** padel racket finder.

---

## 3. Navigation

### Hub `/padel`

Exposes:

- **Shop:** Rackets, Shoes, Balls, Bags, Grips, Accessories (groups: Rackets / Court kit / Decide)
- **Decide:** Finder, Compare, Best, Guides, Collections, Research, Brands
- **Footer:** all categories + database + collections + research + brands + starter kit
- **Best strips:** rackets intents + shoes + balls + bags + overgrips
- **Reviews / Comparisons / Brands:** existing SportHub modules

### Contextual rail (`PADEL_CONTEXTUAL_NAV`)

Desktop visible (10): **Padel · Rackets · Shoes · Balls · Bags · Grips · Accessories · Best · Reviews · Compare**  
Overflow / More: **Finder · Guides · Database** (collections match under Database prefix)

Mobile: full scroll + More pattern unchanged — soft goods now first-class rather than hub-only.

---

## 4. Finder

| Item | Status |
| --- | --- |
| `/tools/padel-racket-finder` | Live; commission-neutral scoring |
| Catalog eligibility | Published products only (`src/domain/finders/eligibility.ts`) |
| Specs / decision attributes | Uses current racket specs + priority weights |
| Hub + category CTAs | Wired to same tool slug |

**Revisit conclusion:** No new scoring model required for this pass — eligibility + existing PADEL_SCORING already ignore commission. Continue to refuse affiliate ranking.

### Secondary finders (evaluation)

| Candidate | Build? | Why |
| --- | --- | --- |
| Padel Ball Finder | **No** | Decision is low-dimensional (use × speed × pack). Best Balls intents + filters are enough. |
| Padel Bag Finder | **No** | Form × capacity × thermal × shoe bay is filterable; Best Bags intents cover jobs. A multi-step finder would add friction without new signal. |

---

## 5. Database / explorers

| Surface | Status | Decision |
| --- | --- | --- |
| Padel Racket Database | **Primary** structured data product — keep | Live |
| Padel Ball Explorer | **Not built** | Spec richness exists, but Best + filters beat an admin-like table for cans |
| Padel Bag Explorer | **Not built** | Same — category page + Best Bags is the consumer path |

**Collections** (new) fill the “family browse” gap without duplicating database UX:

- Index: `/padel/collections`
- Detail: `/padel/collections/{slug}` for AT10, ML10, Vertex, Hack, Coello, Bela, Metalbone
- Companion bags/backpacks/accessories shown **only when verified** in `RELATED_BY_FAMILY`

---

## 6. Brand hubs

| Brand slug | Padel hub config | Featured category | Running leakage |
| --- | --- | --- | --- |
| nox | Yes | `cat-padel-rackets` | None |
| bullpadel | Yes | `cat-padel-rackets` | None |
| adidas-padel | Yes (separate from `adidas`) | `cat-padel-rackets` | Avoided via separate slug |
| head / wilson / babolat / siux / starvie | Yes | `cat-padel-rackets` | Fit chips suppressed when padel-majority |

**Logic:** `get-brand-hub-data.ts` skips running shoe fit chips and prefers padel `allProductsHref` when products are majority `cat-padel*` or `featuredCategoryId` is padel.

Cross-category assortment (rackets / shoes / balls / bags / grips / accessories) still comes from live product grouping on the brand page — configs set editorial framing and families.

---

## 7. Orphan count (public discovery)

Intentional authority graph additions this pass:

- Hub → categories / Best / Finder / Database / Collections / Research / Brands
- Categories → Best / guides / Finder (rackets) / compare
- Collections → brand hub + products + verified companions
- Contextual nav → all six categories + decision surfaces

**Residual orphans (expected):**

- Long-tail market-wave products with **zero editorial relationships** (see `PADEL-EDITORIAL-COVERAGE.csv` coverageBand=`zero`) — catalogued but not decision-critical
- Soft-gated clothing remains out of discovery claims
- Research prices story still partial / withheld

Approximate orphan band from editorial graph (prior pass): **~294 / 458** products with zero editorial edges — discovery UX does not invent relationships for these.

Meaningful **public routes** (hub, 6 categories, finder, database, collections, research, brands, Best/guides/reviews/compare indexes) are linked from hub and/or contextual nav — **not orphaned**.

---

## 8. Mobile issues / notes

| Surface | Assessment | Follow-up |
| --- | --- | --- |
| Contextual nav | Soft goods on primary row; Finder/Guides/Database in overflow — manageable | Spot-check overflow “More” on 375px |
| Category filters | Existing sidebar / sheet pattern; primary keys curated | Ensure soft-goods boolean filters (thermal, shoe bay) read clearly in sheet |
| Product grids | Shared catalog cards — not admin tables | Media-missing tiles still thin; media gate separate |
| Compare | Existing compare builder | `compare_start` now mapped |
| Finder | Existing FinderFlow | OK |
| Database | Racket DB only | Keep; don’t ship soft-goods table UI |
| Collections | Simple editorial lists | Grid stacks to 1-col on small screens |

No new mobile regressions intentionally introduced; full device QA still recommended before GO.

---

## 9. Analytics coverage

| Checklist event | Kitletics event | Status |
| --- | --- | --- |
| category_filter | `category_filter` (+ existing `filter_use`) | Emitted from `CatalogInteractive` |
| product_view | `view_product` | Existing |
| compare_start | `compare_start` | Mapped from domain `compare_started` |
| finder_start / finder_complete | `finder_start` / `finder_complete` | Existing |
| guide_view | `view_guide` | Existing |
| retailer_click | `retailer_click` | Existing |
| database_filter | `database_filter` (+ `racket_database_filter`) | Emitted from racket DB analytics |
| internal_recommendation_click | `internal_recommendation_click` | **Registered** in taxonomy — wire on hub Best / alternatives CTAs as follow-up |

---

## 10. Files touched (this pass)

- `src/lib/catalog/padel-category-configs.ts` (new)
- `src/lib/catalog/running-shoes.ts` (register + running-only enrichment)
- `src/lib/brand-hub/padel-brand-configs.ts` (new)
- `src/lib/brand-hub/config.ts` / `get-brand-hub-data.ts`
- `src/lib/navigation/contextual-nav.ts`
- `src/lib/search/synonyms.ts` / `intent.ts`
- `src/lib/sport-hub/config.ts` (Decide + footer)
- `src/lib/padel-collections/*` + `src/app/padel/collections/**`
- `src/lib/analytics/types.ts` / `map-domain.ts`
- `src/components/catalog/CatalogInteractive.tsx`
- `src/lib/padel-racket-database/analytics.ts`

---

## Explicit non-claims

- **Not** Padel GO / vertical `enabled` like running
- Catalog ≠ media ≠ commerce ≠ editorial ≠ indexation
- No Ball/Bag Finder or Explorer tables
- No Best Wristbands / fake collection companions
- Affiliate commission still does not rank Finder or Best awards
