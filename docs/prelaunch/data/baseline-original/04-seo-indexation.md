# Kitletics Pre-Launch Audit 04 — SEO, Crawl & Indexation

**Mode:** READ-ONLY forensic (no SEO auto-fixes)
**Generated:** 2026-09-06T10:23:59.578Z
**Runtime base:** `http://127.0.0.1:3010`
**Canonical host (config):** `https://kitletics.com`
**Machine-readable:** [`data/04-seo-indexation.json`](./data/04-seo-indexation.json)

> Production-equivalent `next build` + `next start` crawl. Conclusions use live HTTP responses, not source alone.

---

## 1. Production build notes

- Built with `next build --no-lint`. Temporary `typescript.ignoreBuildErrors` used during build then **reverted** from `next.config.ts`.
- `tsconfig.json` excludes `scripts/` from Next app typecheck (pre-existing script type errors).
- Minimal sharp typing fix in `scripts/lib/logo-hero-detect.ts` (build unblock only).
- No SEO auto-fixes applied to routes, robots, sitemap, canonicals, or metadata.

---

## 2. URL universe

| Metric | Count |
|---|---:|
| Sitemap URLs | 1651 |
| Crawled sample | 340 |
| BFS-discovered from home | 811 |
| Raw product records | 717 |
| Production-exposed products | 623 |
| Draft/future product URL probes | 94 |

### Classifications on crawl sample

| Class | Count |
|---|---:|
| 404 | 7 |
| INDEXABLE | 302 |
| NOINDEX | 13 |
| CANONICALIZED | 0 |
| REDIRECT | 5 |
| DRAFT_FUTURE_PROTECTED | 13 |
| ACCIDENTALLY_EXPOSED | 0 |
| UNKNOWN | 0 |

### Sitemap by page type

| Page type | URLs |
|---|---:|
| Product | 623 |
| Review | 412 |
| Brand | 191 |
| Comparison | 102 |
| Category | 89 |
| Guide | 68 |
| Best | 58 |
| Alternatives | 36 |
| Sport | 25 |
| Setup | 16 |
| Finder | 16 |
| Calculator | 5 |
| Subcategory | 4 |
| Tool | 4 |
| Home | 1 |
| Author | 1 |

---

## 3. Page types

Covered in crawl/sitemap classification: Home, Sport, Discipline/Category segments, Subcategory listings, Brand, Product, Review, Best, Guide, Comparison, Alternatives, Tool/Finder/Calculator, Finder Result, Search, Filters, Setup, Author, Hub. **Deals:** no `/deals` route found (404 in probe). Brand+Category via query on brands hub where applicable.

Full per-type table: §18.

---

## 4. Robots

```
User-Agent: *
Allow: /
Disallow: /go/
Disallow: /api/
Disallow: /admin/
Disallow: /preview/

Sitemap: https://kitletics.com/sitemap.xml
```


| Check | Result |
|---|---|
| Sitewide Disallow: / | false |
| Blocks CSS/JS /_next | false |
| Disallow /go | true |
| Disallow /api | true |
| Disallow /preview | true |
| Disallow /admin | true |

### Indexation risk checks

- Search `/search`: status=200, robots=noindex, follow, class=NOINDEX
- Finder results samples: /tools/running-shoe-finder/results → NOINDEX (noindex, follow); /tools/running-shoe-finder/results?s=test → NOINDEX (noindex, follow)
- Filter samples indexable: **1**

---

## 5. Canonicals

| Issue | Count |
|---|---:|
| Missing (200 + indexable intent) | 15 |
| Self-canonical | 299 |
| Cross-canonical | 2 |
| Localhost | 0 |
| Relative | 0 |
| Cross-host | 0 |

### Cross-canonical examples

- `/compare/brooks-ghost-18-vs-asics-novablast-6` → `https://kitletics.com/compare/asics-novablast-6-vs-brooks-ghost-18`
- `/tools/compare-products` → `https://kitletics.com/compare`

### Missing canonical examples

- `/`
- `/setups`
- `/how-we-review`
- `/methodology`
- `/affiliate-disclosure`
- `/contact`
- `/about`
- `/privacy`
- `/terms`
- `/fitness/cross-training`
- `/fitness/hyrox`
- `/hyrox/hydration`
- `/hyrox/functional-fitness`
- `/hyrox/ski-ergs`
- `/running/ultra`

### Query-state canonical behavior

- `/running/shoes?brand=asics` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/running/shoes?gender=men` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/running/shoes?cushion=max&stability=neutral` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/running/shoes?brand=asics&gender=men` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/running/shoes?gender=women` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/compare?products=asics-novablast-6,brooks-ghost-18` → canonical `https://kitletics.com/compare` · robots=noindex, follow · NOINDEX
- `/running/shoes?brand=asics&brand=nike&gender=men&cushion=max` → canonical `https://kitletics.com/running/shoes` · robots=noindex, follow · NOINDEX
- `/running/shoes?sort=price-asc` → canonical `https://kitletics.com/running/shoes` · robots=— · INDEXABLE
- `/search?q=novablast` → canonical `https://kitletics.com/search` · robots=noindex, follow · NOINDEX
- `/running/clothing?gender=men` → canonical `https://kitletics.com/running/clothing` · robots=noindex, follow · NOINDEX
- `/tools?type=finder` → canonical `https://kitletics.com/tools` · robots=— · INDEXABLE

---

## 6. Sitemaps

| Metric | Value |
|---|---|
| File | /sitemap.xml |
| URL count | 1651 |
| Contains /search | false |
| Query-string URLs | 0 |
| Preview URLs | false |
| Unique lastmod values | 1 |
| Draft products in sitemap | 0 |
| Draft reviews in sitemap | 0 |

Sitemap generated via src/app/sitemap.ts using production publication resolver (getProducts/getReviews/etc).

---

## 7. Titles

- Missing titles (sample crawl): **0**
- Duplicate clusters (≥2): **6**

### Major duplicate clusters

- ×8 “running shoes: compare trainers, race &amp; trail shoes · kitletics”: `/running/shoes`, `/running/shoes?brand=asics`, `/running/shoes?gender=men`, `/running/shoes?cushion=max&stability=neutral`, `/running/shoes?brand=asics&gender=men`
- ×4 “hyrox gear: shoes, race kit &amp; training equipment · kitletics”: `/fitness/hyrox`, `/hyrox/hydration`, `/hyrox/functional-fitness`, `/hyrox/ski-ergs`
- ×2 “compare sports gear side by side · kitletics”: `/compare`, `/tools/compare-products`
- ×2 “sports gear finders, calculators &amp; comparison tools · kitletics”: `/tools`, `/tools?type=finder`
- ×2 “search · kitletics”: `/search`, `/search?q=novablast`
- ×2 “your running shoe finder matches · kitletics”: `/tools/running-shoe-finder/results`, `/tools/running-shoe-finder/results?s=test`

---

## 8. Descriptions

- Missing: **2**
- Duplicate clusters: **6**

- ×8 “compare running shoes by cushion, stability, drop and terrain. browse daily trainers, race shoes and trail shoes — or use kitletics match to find your fit.”: `/running/shoes`, `/running/shoes?brand=asics`, `/running/shoes?gender=men`, `/running/shoes?cushion=max&stability=neutral`
- ×4 “find hyrox race shoes, build a race kit, plan splits and choose training equipment.”: `/fitness/hyrox`, `/hyrox/hydration`, `/hyrox/functional-fitness`, `/hyrox/ski-ergs`
- ×3 “structured sports equipment discovery, recommendations, comparisons and buying guides — built around your sport, goals and experience.”: `/`, `/tools/running-shoe-finder/results`, `/tools/running-shoe-finder/results?s=test`
- ×2 “choose products and see the differences that matter — specs, use cases and prices.”: `/compare`, `/tools/compare-products`
- ×2 “discover kitletics finders, comparison tools, planners and calculators — structured decision tools for sport gear.”: `/tools`, `/tools?type=finder`
- ×2 “search kitletics products, brands, guides and tools.”: `/search`, `/search?q=novablast`

---

## 9. H1

- Missing: **2**
- Multiple H1 pages: **0**
- Duplicate H1 clusters: **6**

- ×8 “running shoes”: `/running/shoes`, `/running/shoes?brand=asics`, `/running/shoes?gender=men`, `/running/shoes?cushion=max&stability=neutral`
- ×4 “find the right gear for training and race day.”: `/fitness/hyrox`, `/hyrox/hydration`, `/hyrox/functional-fitness`, `/hyrox/ski-ergs`
- ×4 “find the right gear for you”: `/tools/hyrox-shoe-finder`, `/tools/pull-up-bar-finder`, `/tools/adjustable-dumbbell-finder`, `/tools/treadmill-finder`
- ×2 “compare accessories”: `/compare`, `/tools/compare-products`
- ×2 “find, compare &amp; buildthe right gear for you”: `/tools`, `/tools?type=finder`
- ×2 “gymnastic rings”: `/fitness/gymnastic-rings`, `/products/gornation-gymnastic-rings`

---

## 10. Structured data

### Types observed by page type

- **Sport**: BreadcrumbList×6, ItemList×3, CollectionPage×3
- **Home**: Organization×1, WebSite×1
- **Category**: BreadcrumbList×19, CollectionPage×17, ItemList×17, FAQPage×8
- **Brand**: BreadcrumbList×11, CollectionPage×11, ItemList×11
- **Other**: (none)
- **Search**: BreadcrumbList×2
- **Finder Result**: (none)
- **Comparison**: BreadcrumbList×27, FAQPage×3, Article×27
- **Subcategory**: BreadcrumbList×4, CollectionPage×4, ItemList×4
- **Product**: BreadcrumbList×74, Product×74, Review×61, FAQPage×1
- **Alternatives**: (none)
- **Review**: BreadcrumbList×40, Review×40, Product×40
- **Best**: BreadcrumbList×29, Article×29, ItemList×29, FAQPage×12
- **Author**: (none)
- **Guide**: BreadcrumbList×25, Article×25, FAQPage×25
- **Setup**: BreadcrumbList×15, ItemList×15
- **Finder**: BreadcrumbList×15, WebApplication×15
- **Calculator**: WebApplication×5, BreadcrumbList×2, FAQPage×2
- **Tool**: BreadcrumbList×1, WebApplication×3

### Schema problems (sample)

_None flagged by heuristics._


---

## 11. Internal discovery / orphans

- Sitemap URLs not reached in homepage BFS (within crawl caps): **1022**

### Orphan examples

- `/running/track`
- `/running/treadmill`
- `/running/socks`
- `/running/headphones`
- `/running/sunglasses`
- `/running/lights`
- `/running/treadmills`
- `/running/safety`
- `/running/belts`
- `/fitness/cross-training`
- `/fitness/watches`
- `/fitness/heart-rate-monitors`
- `/fitness/hydration`
- `/fitness/headphones`
- `/fitness/treadmills`
- `/fitness/ski-ergs`
- `/fitness/parallettes`
- `/fitness/accessories`
- `/fitness/gymnastic-rings`
- `/fitness/weighted-vests`
- `/fitness/gym-flooring`
- `/fitness/gym-storage`
- `/fitness/lifting-accessories`
- `/hyrox/shoes`
- `/hyrox/training-shoes`
- `/hyrox/watches`
- `/hyrox/heart-rate-monitors`
- `/hyrox/hydration`
- `/hyrox/kettlebells`
- `/hyrox/rowing-machines`
- `/hyrox/air-bikes`
- `/hyrox/treadmills`
- `/hyrox/ski-ergs`
- `/hyrox/recovery`
- `/hyrox/accessories`
- `/hyrox/nutrition`
- `/hyrox/weighted-vests`
- `/hyrox/functional-fitness`
- `/calisthenics/pull-up-bars`
- `/calisthenics/parallettes`

_Note: orphans may be false positives if not linked within depth/cap; full link graph exceeds sample crawl._

---

## 12. Crawl depth (sitemap URLs found via BFS)

| Depth | Count |
|---|---:|
| 1 click | 82 |
| 2 | 546 |
| 3 | 0 |
| 4 | 0 |
| 5+ | 0 |
| Unreached in crawl | 1022 |

---

## 13. Filter / facet explosion

**Finding:** Most facet query URLs are `noindex, follow` and canonicalize to the clean category URL. **Exception observed:** `/running/shoes?sort=price-asc` returned **INDEXABLE** (no robots noindex) while still canonicalizing to `/running/shoes` — sort-only params are a residual indexation risk.

- `/running/shoes?brand=asics` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?gender=men` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?cushion=max&stability=neutral` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?brand=asics&gender=men` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?gender=women` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?brand=asics&brand=nike&gender=men&cushion=max` → NOINDEX · status=200 · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?sort=price-asc` → INDEXABLE · status=200 · robots=— · canonical=https://kitletics.com/running/shoes

Category pages with query filters set robots noindex + canonicalize to clean category URL (src/app/[sport]/[segment]/page.tsx).

---

## 14. Comparison explosion

| Metric | Value |
|---|---|
| Editorial comparisons (prod-visible) | 102 |
| Theoretical shoe pairs | 3403 |
| Combinatorial indexable pages? | **false** |

generateStaticParams uses editorial getComparisons() only; dynamic pairs are noindex.

---

## 15. Men/Women URL behavior

Gender is a ProductVariant/audience dimension and catalog filter (?gender=), not separate product URLs.

- `/running/shoes?gender=men` → NOINDEX · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/shoes?gender=women` → NOINDEX · robots=noindex, follow · canonical=https://kitletics.com/running/shoes
- `/running/clothing?gender=men` → NOINDEX · robots=noindex, follow · canonical=https://kitletics.com/running/clothing

Duplicate indexable product variant URLs: **false**

Men/Women share /products/{slug}; variants are on-page, not separate indexable URLs.

---

## 16. HTTP status (crawl sample)

| Status | Count |
|---|---:|
| 200 | 320 |
| 301 (in chain) | 0 |
| 302 (in chain) | 0 |
| 404 | 20 |
| 500+ | 0 |
| Redirect chains >1 hop | 0 |
| Loops | 0 |

---

## 17. Future / draft content leakage

### Direct URL probes

- `/products/patagonia-slope-runner-vest` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/raidlight-responsiv-12` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/kiprun-trail-10` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/hydrapak-shape-shift-15` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/example-unpublished-trainer` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/nathan-quickdraw-plus-handheld` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/bombas-performance-running-quarter` → 404 / DRAFT_FUTURE_PROTECTED 
- `/products/hilly-marathon-fresh` → 404 / DRAFT_FUTURE_PROTECTED 
- `/reviews/asics-novablast-5-deep-dive` → 404 / DRAFT_FUTURE_PROTECTED 
- `/reviews/bear-komplex-valor` → 404 / DRAFT_FUTURE_PROTECTED 
- `/reviews/domyos-mid-500` → 404 / DRAFT_FUTURE_PROTECTED 
- `/reviews/nobull-trail` → 404 / DRAFT_FUTURE_PROTECTED 
- `/reviews/zeraus-classic` → 404 / DRAFT_FUTURE_PROTECTED 

- Draft products in sitemap: **0**
- Draft reviews in sitemap: **0**
- Preview sample: /preview/products/asics-novablast-6 → 404 / 404 / robots=undefined

Draft entities are excluded from getProducts()/getReviews() production resolver — should not appear in nav cards fed by repositories.

---

## 18. SEO page-type summary

| Page Type | Sitemap URLs | Crawled | Indexable (sample) | Noindex (sample) | Problems | Dup risk | Orphans |
|---|---:|---:|---:|---:|---|---|---:|
| Home | 1 | 1 | 1 | 0 | missing_canonical | low | 0 |
| Sport | 25 | 23 | 21 | 2 | missing_canonical | yes | 2 |
| Discipline | 0 | 0 | 0 | 0 | — | low | 0 |
| Category | 89 | 25 | 15 | 7 | missing_canonical | yes | 48 |
| Subcategory | 4 | 4 | 4 | 0 | — | low | 4 |
| Brand | 191 | 15 | 11 | 0 | — | low | 0 |
| Brand+Category | 0 | 0 | 0 | 0 | — | low | 0 |
| Product | 623 | 82 | 74 | 0 | — | low | 477 |
| Review | 412 | 45 | 40 | 0 | — | low | 370 |
| Best | 58 | 29 | 29 | 0 | — | low | 17 |
| Guide | 68 | 25 | 25 | 0 | — | low | 20 |
| Comparison | 102 | 27 | 26 | 0 | — | low | 51 |
| Alternatives | 36 | 15 | 15 | 0 | — | low | 23 |
| Tool | 4 | 4 | 3 | 0 | — | yes | 1 |
| Finder | 16 | 15 | 15 | 0 | — | low | 0 |
| Finder Result | 0 | 2 | 0 | 2 | — | yes | 0 |
| Calculator | 5 | 5 | 5 | 0 | — | low | 0 |
| Search | 0 | 2 | 0 | 2 | — | yes | 0 |
| Deals | 0 | 1 | 0 | 0 | — | low | 0 |
| Filters | 0 | 0 | 0 | 0 | — | low | 0 |
| Setup | 16 | 15 | 15 | 0 | — | low | 8 |
| Author | 1 | 1 | 1 | 0 | — | low | 1 |
| Hub | 0 | 0 | 0 | 0 | — | low | 0 |

---

## 19. Baseline rule

No SEO fixes applied in this audit. Issues are reported as-is.

## End of baseline
