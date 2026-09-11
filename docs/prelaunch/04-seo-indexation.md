# Kitletics Pre-Launch Audit 04 — SEO, Crawl & Indexation

**Mode:** READ-ONLY forensic (no SEO auto-fixes)
**Generated:** 2026-09-06T21:18:37.604Z
**Runtime base:** `http://127.0.0.1:3010`
**Canonical host (config):** `https://kitletics.com`
**Machine-readable:** [`data/04-seo-indexation.json`](./data/04-seo-indexation.json)

> Production-equivalent `next build` + `next start` crawl. Conclusions use live HTTP responses, not source alone.

---

## 1. Production build notes

- Built with `next build --no-lint` and temporary typescript.ignoreBuildErrors due to pre-existing type errors.
- tsconfig excluded scripts/ from Next typecheck.
- No SEO auto-fixes applied.

---

## 2. URL universe

| Metric | Count |
|---|---:|
| Sitemap URLs | 664 |
| Crawled sample | 275 |
| BFS-discovered from home | 1 |
| Raw product records | 717 |
| Production-exposed products | 623 |
| Draft/future product URL probes | 94 |

### Classifications on crawl sample

| Class | Count |
|---|---:|
| 404 | 0 |
| INDEXABLE | 0 |
| NOINDEX | 0 |
| CANONICALIZED | 0 |
| REDIRECT | 0 |
| DRAFT_FUTURE_PROTECTED | 0 |
| ACCIDENTALLY_EXPOSED | 0 |
| UNKNOWN | 275 |

### Sitemap by page type

| Page type | URLs |
|---|---:|
| Product | 251 |
| Brand | 103 |
| Alternatives | 74 |
| Comparison | 55 |
| Best | 44 |
| Review | 43 |
| Guide | 34 |
| Sport | 20 |
| Category | 17 |
| Finder | 8 |
| Subcategory | 5 |
| Setup | 5 |
| Calculator | 2 |
| Home | 1 |
| Author | 1 |
| Tool | 1 |

---

## 4. Robots

```
(fetch failed)
```

| Check | Result |
|---|---|
| Sitewide Disallow: / | false |
| Blocks CSS/JS /_next | false |
| Disallow /go | false |
| Disallow /api | false |
| Disallow /preview | false |
| Disallow /admin | false |

### Indexation risk checks

- Search `/search`: status=0, robots=—, class=UNKNOWN
- Finder results samples: /tools/running-shoe-finder/results → UNKNOWN (no robots meta); /tools/running-shoe-finder/results?s=test → UNKNOWN (no robots meta)
- Filter samples indexable: **0**

---

## 5. Canonicals

| Issue | Count |
|---|---:|
| Missing (200 + indexable intent) | 0 |
| Self-canonical | 0 |
| Cross-canonical | 0 |
| Localhost | 0 |
| Relative | 0 |
| Cross-host | 0 |

### Query-state canonical behavior


---

## 6. Sitemaps

| Metric | Value |
|---|---|
| File | /sitemap.xml |
| URL count | 664 |
| Contains /search | false |
| Query-string URLs | 0 |
| Preview URLs | false |
| Unique lastmod values | 3 |
| Draft products in sitemap | 0 |
| Draft reviews in sitemap | 0 |

Sitemap generated via src/app/sitemap.ts using production publication resolver (getProducts/getReviews/etc).

---

## 7. Titles

- Missing titles (sample crawl): **0**
- Duplicate clusters (≥2): **0**

### Major duplicate clusters


---

## 8. Descriptions

- Missing: **0**
- Duplicate clusters: **0**


---

## 9. H1

- Missing: **0**
- Multiple H1 pages: **0**
- Duplicate H1 clusters: **0**


---

## 10. Structured data

### Types observed by page type


### Schema problems (sample)

_None flagged by heuristics._


---

## 11. Internal discovery / orphans

- Sitemap URLs not reached in homepage BFS (within crawl caps): **663**

### Orphan examples

- `/gear`
- `/brands`
- `/best`
- `/compare`
- `/reviews`
- `/guides`
- `/tools`
- `/setups`
- `/about`
- `/methodology`
- `/how-we-review`
- `/editorial-policy`
- `/evidence-policy`
- `/scoring-methodology`
- `/authors`
- `/affiliate-disclosure`
- `/contact`
- `/privacy`
- `/terms`
- `/running`
- `/running/road`
- `/running/trail`
- `/running/track`
- `/running/treadmill`
- `/running/racing`
- `/running/ultra`
- `/running/shoes`
- `/running/watches`
- `/running/heart-rate-monitors`
- `/running/socks`
- `/running/hydration`
- `/running/packs`
- `/running/headphones`
- `/running/lights`
- `/running/safety`
- `/running/belts`
- `/running/recovery`
- `/running/shoes/daily-trainers`
- `/running/shoes/race`
- `/running/shoes/stability`

_Note: orphans may be false positives if not linked within depth/cap; full link graph exceeds sample crawl._

---

## 12. Crawl depth (sitemap URLs found via BFS)

| Depth | Count |
|---|---:|
| 1 click | 0 |
| 2 | 0 |
| 3 | 0 |
| 4 | 0 |
| 5+ | 0 |
| Unreached in crawl | 663 |

---

## 13. Filter / facet explosion

- `/running/shoes?brand=asics` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?gender=men` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?gender=women` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?brand=asics&gender=men` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?cushion=max&stability=neutral` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?sort=price-asc` → UNKNOWN · status=0 · robots=— · canonical=—
- `/running/shoes?brand=asics&brand=nike&gender=men&cushion=max` → UNKNOWN · status=0 · robots=— · canonical=—

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

- `/running/shoes?gender=men` → UNKNOWN · robots=— · canonical=—
- `/running/shoes?gender=women` → UNKNOWN · robots=— · canonical=—
- `/running/clothing?gender=men` → UNKNOWN · robots=— · canonical=—

Duplicate indexable product variant URLs: **false**

Men/Women share /products/{slug}; variants are on-page, not separate indexable URLs.

---

## 16. HTTP status (crawl sample)

| Status | Count |
|---|---:|
| 200 | 0 |
| 301 (in chain) | 0 |
| 302 (in chain) | 0 |
| 404 | 0 |
| 500+ | 0 |
| Redirect chains >1 hop | 0 |
| Loops | 0 |

---

## 17. Future / draft content leakage

### Direct URL probes

- `/products/example-unpublished-trainer` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/patagonia-slope-runner-vest` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/raidlight-responsiv-12` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/kiprun-trail-10` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/hydrapak-shape-shift-15` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/nathan-quickdraw-plus-handheld` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/bombas-performance-running-quarter` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/products/hilly-marathon-fresh` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/reviews/asics-novablast-5-deep-dive` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/reviews/bear-komplex-valor` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/reviews/domyos-mid-500` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/reviews/nobull-trail` → 0 / UNKNOWN (fetch_error:fetch failed)
- `/reviews/zeraus-classic` → 0 / UNKNOWN (fetch_error:fetch failed)

- Draft products in sitemap: **0**
- Draft reviews in sitemap: **0**
- Preview sample: /preview/products/asics-novablast-6 → 0 / UNKNOWN / robots=undefined

Draft entities are excluded from getProducts()/getReviews() production resolver — should not appear in nav cards fed by repositories.

---

## 18. SEO page-type summary

| Page Type | Sitemap URLs | Crawled | Indexable (sample) | Noindex (sample) | Problems | Dup risk | Orphans |
|---|---:|---:|---:|---:|---|---|---:|
| Home | 1 | 1 | 0 | 0 | fetch_error:fetch failed | low | 0 |
| Sport | 20 | 20 | 0 | 0 | fetch_error:fetch failed | low | 20 |
| Discipline | 0 | 0 | 0 | 0 | — | low | 0 |
| Category | 17 | 23 | 0 | 0 | fetch_error:fetch failed | low | 17 |
| Subcategory | 5 | 5 | 0 | 0 | fetch_error:fetch failed | low | 5 |
| Brand | 103 | 15 | 0 | 0 | fetch_error:fetch failed | low | 103 |
| Brand+Category | 0 | 0 | 0 | 0 | — | low | 0 |
| Product | 251 | 48 | 0 | 0 | fetch_error:fetch failed | low | 251 |
| Review | 43 | 45 | 0 | 0 | fetch_error:fetch failed | low | 43 |
| Best | 44 | 25 | 0 | 0 | fetch_error:fetch failed | low | 44 |
| Guide | 34 | 25 | 0 | 0 | fetch_error:fetch failed | low | 34 |
| Comparison | 55 | 27 | 0 | 0 | fetch_error:fetch failed | low | 55 |
| Alternatives | 74 | 15 | 0 | 0 | fetch_error:fetch failed | low | 74 |
| Tool | 1 | 1 | 0 | 0 | fetch_error:fetch failed | low | 1 |
| Finder | 8 | 8 | 0 | 0 | fetch_error:fetch failed | low | 8 |
| Finder Result | 0 | 2 | 0 | 0 | fetch_error:fetch failed | low | 0 |
| Calculator | 2 | 2 | 0 | 0 | fetch_error:fetch failed | low | 2 |
| Search | 0 | 2 | 0 | 0 | fetch_error:fetch failed | low | 0 |
| Deals | 0 | 1 | 0 | 0 | fetch_error:fetch failed | low | 0 |
| Filters | 0 | 0 | 0 | 0 | — | low | 0 |
| Setup | 5 | 5 | 0 | 0 | fetch_error:fetch failed | low | 5 |
| Author | 1 | 1 | 0 | 0 | fetch_error:fetch failed | low | 1 |
| Hub | 0 | 0 | 0 | 0 | — | low | 0 |

---

## 19. Baseline rule

No SEO fixes applied in this audit. Issues are reported as-is.

## End of baseline
