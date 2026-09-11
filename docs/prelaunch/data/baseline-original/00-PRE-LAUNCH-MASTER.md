# Kitletics Pre-Launch Master Evidence Pack

**Document ID:** `00-PRE-LAUNCH-MASTER`  
**Mode:** Consolidation only — no website changes, no fixes, no new content  
**Audit clock (shared across reports):** 2026-09-06  
**Purpose:** Self-contained evidence for an **external launch reviewer**. This document does **not** make a Day-1 launch recommendation.

**Supporting reports**

| # | Report | Data |
|---|---|---|
| 01 | [Catalog inventory](./01-catalog-inventory.md) | [JSON](./data/01-catalog-inventory.json) |
| 02 | [Product quality](./02-product-quality.md) | [JSON](./data/02-product-quality.json) |
| 03 | [Editorial quality](./03-editorial-quality.md) | [JSON](./data/03-editorial-quality.json) |
| 04 | [SEO / indexation](./04-seo-indexation.md) | [JSON](./data/04-seo-indexation.json) |
| 05 | [Architecture / links](./05-architecture-internal-links.md) | [JSON](./data/05-link-graph.json) |
| 06 | [Media / offers / trust](./06-media-offers-trust.md) | [JSON](./data/06-media-offers-trust.json) |
| 07 | [Performance / technical](./07-performance-technical.md) | [JSON](./data/07-performance-technical.json) |

Where reports disagree, see **§16 DATA DISCREPANCIES** — values are not silently preferred.

---

## 1. Executive snapshot

| Metric | Value | Source |
|---|---:|---|
| Sitemap / public URL universe (declared) | **1,651** | 04 |
| Indexable after crawl classification (sitemap ∩ 200 + not noindex) | **1,551** | 05 |
| Raw product records | **717** | 01, 02 |
| Production-exposed / indexable products | **623** | 01, 04, 06 |
| Product LAUNCH_READY (all evaluated) | **171** (23.8% of 717) | 02 |
| Product LAUNCH_READY among production-exposed | **171** (27.4% of 623) | 02 |
| Reviews (raw / published in sitemap) | **417 / 412** | 01/03 · 04 |
| Review LAUNCH_READY | **171** (41.0% of 417) | 03 |
| Best guides | **58** published | 03, 04 |
| Best LAUNCH_READY | **1** (1.7%) | 03 |
| Buying / educational guides | **68** | 03, 04 |
| Guide COMPLETE | **68** (100%) | 03 |
| Comparisons | **102** editorial (74 meaningful / 28 thin) | 03 |
| Tools (inventory) | **28** in 03 tooling eval · **25** sitemap Finder+Calculator+Tool | 03 · 04 |
| Running product records | **438** | 01, 02 |
| Running production-exposed | **367** | 01 |
| Running LAUNCH_READY | **139** (31.7% of 438 · 37.9% of 367 exposed) | 02 |
| Running shoes LAUNCH_READY | **56 / 84** (66.7%) | 02 |
| Indexable orphans (0 inbound) | **26** | 05 |
| Broken internal links (lab) | Representative wrong paths 404; not a full link-checker dump | 07 |
| SEO blockers (as-found) | Sort-param indexable residual; missing canonicals (sample); brand sitemap 404s | 04 |
| Performance blockers (lab) | Home LCP ~76s · `/running/shoes` LCP ~56s · multi-MB hubs · 7.8MB JS chunk | 07 |
| Trust blockers | **No** fake AggregateRating BLOCKER · **0** first-hand reviews · missing dedicated policy routes | 06 |

---

## 2. Page-type table

Counts use **sitemap totals** (04) for “Total / Indexable intent,” **quality gates** from 02/03 where defined, and SEO notes from 04/05. “Ready” = passes that report’s LAUNCH_READY / COMPLETE / meaningful gate (not a unified meta-gate).

| Page type | Total (sitemap 04) | Indexable intent | Ready | Thin / minor | Blocked | SEO issues | Notes |
|---|---:|---:|---:|---:|---:|---|---|
| Home | 1 | 1 | — | — | — | Missing canonical (sample) | LH LCP extreme |
| Sport | 25 | ~21 sample indexable | — | — | — | Some noindex; orphans | Coming-soon sports |
| Category | 89 | 87 (05) | — | — | — | Orphans; missing canonical sample | Hyrox/racket orphans |
| Subcategory | 4 | 4 | — | — | — | Path orphans | Query `?type=` used instead of path |
| Product | 623 | 623 | 171 LR | 369 minor + 83 thin (of 717 eval) | 94 | Cap-limited orphan signal in 04 BFS | Drafts not in sitemap |
| Review | 412 | 412 | 171 LR | 211 minor + 30 thin | 5 | — | All expert-research |
| Best | 58 | 58 | 1 LR | 41 minor + 16 thin | 0 | — | Thin shelf risk |
| Guide | 68 | 68 | 68 COMPLETE | 0 | 0 | — | Strongest editorial depth gate |
| Comparison | 102 | 94 (05) / 102 (04) | 74 meaningful | 28 thin | 0 | 05 vs 04 count | Not combinatorial |
| Alternatives | 36 | 36 | — | — | — | — | Relationship-gated |
| Brand | 191 | **101** (05) | — | — | — | **90 brands in sitemap not indexable in 05** | 04 sample saw brand 404s |
| Finder | 16 | 16 | Functional landings | — | — | Results noindex | JS required |
| Calculator | 5 | 5 | Functional | — | — | — | Correct slugs required |
| Tool | 4 | 4 | — | — | — | 1 orphan `/tools/compare-products` | Compare also at `/compare` |
| Setup | 16 | 16 | — | — | — | — | |
| Author | 1 | 1 | Generic editorial | — | — | No authors index | |
| Search | 0 sitemap | noindex | — | — | — | Intentionally noindex | |
| Filters | 0 sitemap | mostly noindex | — | — | — | **sort= still indexable** | 04 |

---

## 3. Running table

Product quality from **02** (includes non-exposed in category product counts). Editorial coverage from **05 topical map** (production cluster). Media: **06** reports **100%** authentic primary for published products sitewide. Offers: **06** NL displayable **623/623** published; regional gaps elsewhere.

| Category | Products (02) | Ready % (02) | Reviews (05) | Best (05) | Guides (05) | Comparisons (05) | Media % | Offer readiness | Status |
|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| Running Shoes | 84 | 66.7 | 83 | 13 | 12 | 12 | 100 published | NL strong | Core cluster |
| GPS Watches | 33 | 100 | 33 | 8 | 6 | 10 | 100 | NL strong | Core cluster |
| Heart Rate Monitors | 15 | 100 | 15 | 4 | 2 | 6 | 100 | NL strong | Core cluster |
| Running Clothing | 68 | 5.9 | 4 | 6 | 3 | 7 | 100 | NL | Thin review coverage |
| Running Socks | 14 | 42.9 | 6 | 1 | 1 | 1 | 100 | NL | Partial |
| Hydration | 19 | 0 | (in 05 packs/hydration split) | 1 | 4 | — | 100 | NL | 0% product ready |
| Packs & Vests | 42 | 45.2 | 19 | 5 | 2 | — | 100 | NL | Partial |
| Headphones | 17 | 23.5 | 6 | 1 | 1 | — | 100 | NL | Partial |
| Sunglasses | 17 | 0 | low | 1 | — | — | 100 | NL | Journey gap: ASSESS |
| Running Lights | 16 | 0 | 3 | 1 | 1 | — | 100 | NL | Weak |
| Treadmills | 3 | 0 | 6 | 1 | 1 | — | 100 | NL | Peripheral |
| Safety Gear | 14 | 0 | 1 | 1 | — | — | 100 | NL | Weak |
| Running Belts | 14 | 0 | 9 | 1 | 1 | — | 100 | NL | 0% ready |
| Recovery | 32 | 6.3 | 5 | 1 | 5 | — | 100 | NL | Weak |
| Accessories | 12 | 0 | low | 0 | 0 | 0 | 100 | NL | Journey gaps |
| Nutrition & Fuel | 38 | 0 | low | 1 | 4 | — | 100 | NL | Journey gap: ASSESS |

Running cluster (05): **807** indexable nodes · **1** connected component · **3** running orphans · coherent Sport→Category→Product↔Review edges; **Best→Comparison contextual edges = 0**.

---

## 4. Issue register

Root issues only (not per-URL duplication).

| ID | Area | Severity | Affected count | Representative URLs / scope | Evidence | Source |
|---|---|---|---:|---|---|---|
| I-01 | Performance | BLOCKER | Hub pages | `/`, `/running/shoes` | Mobile LH LCP ~76s / ~56s; weights ~28MB / ~47MB | 07 |
| I-02 | Performance | BLOCKER | layout + best + compare + tools | Shared chunk `918-*.js` **7.8MB** on disk; First Load JS 1.09–1.15MB | Catalog strings in client chunk | 07 |
| I-03 | Quality gates | BLOCKER | CI | lint exit 1 · tsc exit 2 · tests 10 fail | Cannot ship clean CI without ignore workarounds | 07 |
| I-04 | Product quality | HIGH | 452 / 623 exposed | Many clothing/nutrition/hydration PDPs | Not LAUNCH_READY among production-exposed | 02 |
| I-05 | Best guides | HIGH | 57 / 58 | `/best/running-shoes`, thin shelf set | Only **1** LAUNCH_READY; 16 THIN | 03 |
| I-06 | SEO | HIGH | Filter surfaces | `/running/shoes?sort=price-asc` | Sort-only query remained INDEXABLE | 04 |
| I-07 | SEO / brands | HIGH | ~90 brands | Brand sitemap vs live | Sitemap 191 brands; 05 indexable brands **101**; 04 crawl sample brand 404s | 04, 05 |
| I-08 | Architecture | HIGH | 26 orphans | `/hyrox/*`, `/racket/*`, `/fitness/*` listings | Sitemap URLs with 0 inbound HTML links | 05 |
| I-09 | Trust | HIGH | Sitewide reviews | All reviews | **0** first-hand / personal-test evidence; 412 expert-research | 03, 06 |
| I-10 | Trust pages | HIGH | 4 missing routes | `/editorial-policy`, `/evidence-policy`, `/scoring-methodology`, authors index | Methodology/about exist; dedicated routes absent | 06 |
| I-11 | A11y | HIGH | Many pages | Accent labels | `#c8f542` on white ~1.26:1 contrast (serious) | 07 |
| I-12 | Regional commerce | HIGH | BE/FR/ZA + weak US | Offer rows | BE/FR/ZA **0** rows; US 3; DE/UK ~40% displayable | 06 |
| I-13 | SEO | MEDIUM | 15 sample pages | Home + sports/categories | Missing canonicals in crawl sample | 04 |
| I-14 | SEO | MEDIUM | Title clusters | Hyrox hub titles; Best↔Guide pairs | Cannibalization / overlapping intent | 05 |
| I-15 | Relationships | MEDIUM | 262 running products | Product graph | Without alternatives; Best→Compare edges 0 | 05 |
| I-16 | Evidence | MEDIUM | 25 best guides | Best corpus | Best evidence coverage **56.9%** | 06 |
| I-17 | Authorship | MEDIUM | 412 reviews | `/authors/kitletics-editorial` | Single generic author, no photo | 06 |
| I-18 | Responsive | MEDIUM | Homepage | `/` @ 390px | Horizontal overflow | 07 |
| I-19 | Routing UX | MEDIUM | Wrong paths | `/tools/pace-calculator`, `/running/shoes/daily-trainers` | 404; correct slugs/query exist | 07 |
| I-20 | Security headers | LOW | Sitewide | Responses | No CSP (other headers present) | 07 |
| I-21 | Reviews thin/blocked | MEDIUM | 35 reviews | Thin 30 + blocked 5 | Quality shortfalls / non-exposed | 03 |
| I-22 | Comparisons thin | MEDIUM | 28 | Editorial comps | Thin vs 74 meaningful | 03 |

**Trust BLOCKER check:** Fake AggregateRating — **not found** (06). Do not invent a trust schema BLOCKER.

---

## 5. Top 20 risks (by launch impact)

Ranked for **potential damage if the site went public as-is**, not fix effort.

1. **Hub LCP / multi-MB image weight** — unusable first experience on `/` and `/running/shoes` (07).  
2. **7.8MB client catalog chunk** — sitewide JS cost on key money pages (07).  
3. **452 production products below LAUNCH_READY** — thin/blocked PDPs indexable today (02).  
4. **Best-guide corpus mostly not LAUNCH_READY** — commercial intent pages weak (03).  
5. **CI red (lint/tsc/tests)** — release engineering risk (07).  
6. **Indexable sort/filter residual** — soft facet spam risk (04).  
7. **Brand sitemap vs live mismatch / 404s** — crawl budget + soft-404 trust (04/05).  
8. **Orphan hyrox/racket/fitness URLs in sitemap** — indexable dead-ends (05).  
9. **Zero first-hand testing** — credibility ceiling if marketing implies testing (06/03).  
10. **Missing dedicated trust/policy URLs** — affiliate/editorial scrutiny (06).  
11. **Systemic contrast failures** — a11y / legal exposure (07).  
12. **BE/FR/ZA offer holes; US near-empty** — wrong-region “buy” experience (06).  
13. **Running accessories/nutrition/hydration 0% product ready** — vertical overclaim if promoted (02).  
14. **Clothing: many products, few reviews** — browse without assess (05).  
15. **Cannibalization Best↔Guide / Hyrox titles** — diluted rankings (05).  
16. **Weak alternatives coverage** — decision graph incomplete (05).  
17. **Generic single author** — E-E-A-T optics (06).  
18. **Homepage mobile overflow** — mobile UX (07).  
19. **Thin comparisons (28)** — compare intent under-served (03).  
20. **No CSP** — defense-in-depth gap (07).

---

## 6. Strongest assets (with routes)

**Products (02 representatives)**  
- `/products/asics-novablast-6`  
- `/products/salomon-adv-skin-12`  
- `/products/garmin-forerunner-970`  
- `/products/polar-h10`  
- `/products/nike-dri-fit-miler-men`

**Reviews (03 strongest)**  
- `/reviews/nathan-vaporair-4`  
- `/reviews/camelbak-circuit-run-vest`  
- `/reviews/janji-pace-short-women`  
- `/reviews/hydrapak-skyflask-speed-500`  
- `/reviews/wahoo-trackr`  
- `/reviews/therabody-theragun-prime`  
- `/reviews/shokz-openfit-2`  
- `/reviews/osprey-duro-lt`  
- `/reviews/garmin-hrm-200`  
- `/reviews/nnormal-race-vest`

**Best guides**  
- `/best/running-shoes-long-runs` (**only** LAUNCH_READY)  
- Near-ready examples: `/best/running-shoes`, `/best/running-shoes-beginners`, `/best/running-watches` (NEEDS_MINOR_WORK)

**Guides** — all 68 COMPLETE; examples:  
- `/guides/how-to-choose-running-shoes`  
- `/guides/running-shoe-cushioning`  
- `/guides/how-to-choose-running-watch`

**Tools** — functional landings (03/07):  
- `/tools/running-shoe-finder`  
- `/tools/running-pace-calculator`  
- `/tools/race-time-predictor`  
- `/tools/shoe-rotation-planner`

**Category pages** — coherent Running hubs with full journey (05):  
- `/running/shoes`, `/running/watches`, `/running/heart-rate-monitors`

---

## 7. Weakest areas (factual)

- **Best-guide quality bar:** 1/58 LAUNCH_READY; 16 THIN (03).  
- **Product readiness outside shoes/watches/HRM:** hydration, belts, lights, sunglasses, nutrition, accessories at **0%** LAUNCH_READY (02).  
- **Running clothing:** 68 products / **4** reviews (05).  
- **Performance of listing hubs:** multi-tens-of-MB transfers; extreme LCP (07).  
- **Client JS architecture:** megabyte catalog chunk on layout (07).  
- **First-hand / authorship / policy URL gaps** (06).  
- **Non-NL commerce coverage** (06).  
- **Orphan non-running sport listings in sitemap** (05).  
- **Quality-gate CI failure** (07).

---

## 8. Publication state

| State | Products (01) | Reviews (03) | Best (03) | Guides (03) | Comparisons (03) |
|---|---:|---:|---:|---:|---:|
| Published + indexable (sitemap) | 623 | 412 | 58 | 68 | 102 |
| Published + noindex | 1 (product URL class) | Search/filters separate | — | — | Dynamic compare noindex |
| Draft | 90 | 0 | 0 | 0 | 0 |
| Scheduled | 0 | 1 | 0 | 0 | 0 |
| Review (workflow) | 4 | 4 | 0 | 0 | 0 |
| Future / blocked flags | 1 future + 1 blocked | — | 0 | 0 | 0 |
| Production-hidden total | 94 | 5 | 0 | 0 | 0 |

Production visibility uses `isPubliclyVisible` + noindex filtering (01/04).

---

## 9. Possible Day-1 pool (passes **existing** quality gates)

**Not a launch recommendation** — counts of entities that already meet each report’s gate while production-exposed.

| Page type | Total (relevant corpus) | Passes existing gate | Fails gate |
|---|---:|---:|---:|
| Products (all records) | 717 | 171 LAUNCH_READY | 546 |
| Products (production-exposed) | 623 | 171 LAUNCH_READY | 452 |
| Running products (exposed) | 367 | 139 LAUNCH_READY | 228 |
| Reviews | 417 | 171 LAUNCH_READY exposed | 246 |
| Best guides | 58 | **1** LAUNCH_READY | 57 |
| Guides | 68 | **68** COMPLETE | 0 |
| Comparisons | 102 | **74** meaningful | 28 thin |
| Tools (03 functional exposed) | — | **25** | remainder unavailable / thin landing |

Day-1 route lists live in `03` JSON `day1Evidence.*Routes` (reviews 171, best 1, guides 68).

---

## 10. Schedulable pool

Content that is **not currently public** but **already passes** LAUNCH_READY / COMPLETE gates:

| Corpus | Count | Notes |
|---|---:|---|
| Products draft/scheduled/review ∩ LAUNCH_READY | **0** | Non-exposed products classified BLOCKED in 02 |
| Reviews scheduled/review ∩ LAUNCH_READY | **0** | 5 non-exposed reviews classified BLOCKED |
| Best / Guides / Comparisons waiting in draft | **0** observed | All best/guides/comps published in inventory |

**Implication for reviewer:** scheduling is **not** currently unlocking a hidden ready backlog; the ready pool is already mostly public (or blocked for non-quality reasons).

---

## 11. Not-ready pool (counts / reasons)

| Pool | Count | Primary reasons |
|---|---:|---|
| Products NEEDS_MINOR_WORK | 369 | Specs/SEO/positioning/review linkage gaps (02) |
| Products THIN | 83 | Insufficient decision depth (02) |
| Products BLOCKED | 94 | Mostly not production-exposed / hard blockers (02) |
| Reviews NEEDS_MINOR_WORK | 211 | Substance/SEO/structure gaps (03) |
| Reviews THIN | 30 | Depth/score heuristics (03) |
| Reviews BLOCKED | 5 | Not production-exposed (03) |
| Best NEEDS_MINOR_WORK | 41 | Intro/evidence/pick profiles (03) |
| Best THIN | 16 | Shelf / reasoning depth (03) |
| Comparisons thin | 28 | Insufficient meaning (03) |
| Running categories at 0% ready | 7 cats | Hydration, sunglasses, lights, treadmills, safety, belts, accessories, nutrition (02) |

---

## 12. Indexation exposure (if public **exactly as now**)

Assuming current robots + sitemap + live meta:

| Mechanism | URLs |
|---|---|
| Declared in `/sitemap.xml` | **1,651** |
| Likely indexable after fetch (05) | **≈1,551** |
| Explicitly noindex (examples) | `/search`, most filters, finder results, `/preview/*` |
| Residual indexable risk | Sort/query variants (04) |
| Orphans still in sitemap | **26** (05) — discoverable via sitemap even without internal links |
| Accidental draft exposure | **0** in 04 probes |

**By type (sitemap declared — 04):** Product 623 · Review 412 · Brand 191 · Comparison 102 · Category 89 · Guide 68 · Best 58 · Alternatives 36 · Sport 25 · Setup 16 · Finder 16 · Calculator 5 · Tool 4 · Subcategory 4 · Home/Author 1 each.

**Adjusted live indexable brands (05):** 101 — see discrepancies.

---

## 13. Raw appendix

- [01 Catalog inventory](./01-catalog-inventory.md) · [data](./data/01-catalog-inventory.json)  
- [02 Product quality](./02-product-quality.md) · [data](./data/02-product-quality.json)  
- [03 Editorial quality](./03-editorial-quality.md) · [data](./data/03-editorial-quality.json)  
- [04 SEO indexation](./04-seo-indexation.md) · [data](./data/04-seo-indexation.json)  
- [05 Architecture / links](./05-architecture-internal-links.md) · [data](./data/05-link-graph.json)  
- [06 Media / offers / trust](./06-media-offers-trust.md) · [data](./data/06-media-offers-trust.json)  
- [07 Performance / technical](./07-performance-technical.md) · [data](./data/07-performance-technical.json)  

Product-by-product and review-by-review inventories remain in those files — not duplicated here.

---

## 14. Questions for external launch review

*(Evidence only — this pack does **not** answer these questions.)*

1. Should the full Product catalog launch immediately?  
2. Which Product quality threshold should determine indexability?  
3. Which Reviews should launch Day 1?  
4. Which Best Guides should launch?  
5. Which Guides should launch?  
6. Should remaining ready editorial content be scheduled or published immediately?  
7. Which verticals should remain unavailable?  
8. What should the post-launch publishing cadence be?  
9. What should be prioritized for backlinks?  
10. What must be fixed before domain launch?  

---

## 15. DATA DISCREPANCIES

Do **not** silently prefer one source. Material mismatches:

| Topic | Report A | Report B | Notes |
|---|---|---|---|
| Public URL universe | 04 sitemap **1,651** | 05 indexable **1,551** | Sitemap includes URLs that 404/noindex or fail live indexable class |
| Brands | 04 sitemap **191** | 05 indexable **101** | ~90 brands not indexable in link-graph fetch; 04 sample also saw brand 404s |
| Comparisons | 04 sitemap **102** | 05 indexable **94** | Live classification narrower |
| Running products | 01/02 **438** records · **367** exposed | 05 cluster products **370** | Different membership (sportIds vs category sport set) |
| Running shoes | 02 **84** | 01 exposed **83** · 05 topical **83** | One non-exposed / blocked shoe in 02 |
| Reviews | 01/03 **417** | 04/05/06 published **412** | 5 non-published |
| Offers | 01 **1,271** | 06 active **1,293** | Refresh overlay / active filter timing |
| Orphans | 04 BFS unreachable **1,022** (capped) | 05 orphans **26** | Different definitions (crawl depth cap vs 0 inbound) |
| Tools count | 03 evaluations **28** | 04 sitemap Finder+Calc+Tool **25** | Some tools share `/compare` href or non-sitemap |
| Product ready % | 171/717 vs 171/623 | Same ready count; denominator changes meaning | Always state denominator |

---

## 16. Consolidation notes

- Audits share clock **2026-09-06**; runtime bases were local production builds (`next start`) for 04/05/07.  
- “Ready” always means **that audit’s gate**, not a new combined score.  
- No website modifications were made while writing this master pack.  
- No launch recommendation is implied by Day-1 pool counts.  
