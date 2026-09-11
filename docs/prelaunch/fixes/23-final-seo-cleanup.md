# Fix 23 — Final technical SEO cleanup

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** MEDIUM (deterministic leftovers after major SEO blockers)  
**Reference:** [`../04-seo-indexation.md`](../04-seo-indexation.md)

## Objective

Close remaining deterministic SEO gaps: meta descriptions, duplicate metadata triage, use-case routes, QA probes, sitemap `lastmod`, schema sanity, and sitemap eligibility re-count after Prompt 15 gates.

---

## 1. Meta descriptions

| Finding | Action |
|---|---|
| Audit “Missing: **2**” | Only `/sitemap.xml` and `/robots.txt` (non-HTML) |
| Indexable HTML pages in sample | **0** missing descriptions |

**Fix:** None required for real indexable pages. Documented as false positives from crawling non-document routes.

---

## 2. Duplicate titles / descriptions

| Cluster | Indexable? | Action |
|---|---|---|
| `/running/shoes` + `?brand=` / `?gender=` / facet combos | **NOINDEX** query-state (canonical → clean category) | **Leave** — harmless duplicate titles on noindex URLs |
| `/tools` + `/tools?type=finder` | Finder query **NOINDEX** | **Leave** |
| `/search` + `/search?q=` | Search **NOINDEX** | **Leave** |
| Compare reverse slugs (`brooks-…-vs-asics-…` ↔ `asics-…-vs-brooks-…`) | Both may resolve; cross-canonicalized | **Leave** — intentional pair, not broken metadata |

**Fix:** No title/description rewrites for NOINDEX query-state duplicates. Only true indexable duplicates were the compare reverse-slug pair (already handled).

---

## 3. Routes — `/running/shoes/daily-trainers`

### Investigation

- Lab/audit **404** on path `/running/shoes/daily-trainers`.
- Architecture mismatch: race / stability / trail / heavy-runners were **path** use-case listings; daily lived only as **query** `/running/shoes?type=daily-trainers` (facet NOINDEX).
- Internal chrome (type nav, How you run, primary menu, guides) still linked the query URL — and QA probed the path.

### Fix

Implemented canonical use-case listing (same pattern as race):

| Item | Detail |
|---|---|
| Config | `dailyTrainersListingConfig` in `src/lib/use-case-listing/config.ts` |
| Path | `/running/shoes/daily-trainers` |
| Lock | `subcategorySlug: "daily-trainers"` |
| SEO | Dedicated `seoTitle` / `seoDescription`; clean URL indexable; query refinements NOINDEX via existing listing metadata |
| Sitemap | Included via `getUseCaseListingConfigs()` |

Internal links updated to the path:

- `src/lib/catalog/get-running-shoes-category-page.ts` (type chip + Daily Training card)
- `src/lib/navigation/primary-menu-panels.ts`
- Guide configs (`what-is-a-daily-trainer`, cushioning, stability explained, long-form)

Query facet URLs remain valid for ad-hoc filtering; primary discovery now points at the listing.

---

## 4. QA script

`scripts/tmp/prelaunch-07-route-lab.mjs`:

| Before | After |
|---|---|
| `/tools/pace-calculator` | `/tools/running-pace-calculator` |
| `/running/shoes/daily-trainers` | Unchanged probe — now a real 200 route |

---

## 5. Sitemap `lastmod`

### Problem

Audit: **1** unique `lastmod` — everything stamped `SEED_DATES.updated` / entity `updatedAt` alone, ignoring verification freshness.

### Fix

- Helper: `src/lib/seo/sitemap-lastmod.ts` → `sitemapLastModified(...candidates)` takes the newest **real** ISO among candidates; does not invent dates.
- `src/app/sitemap.ts` uses max of `publishedAt` / `updatedAt` / `lastVerifiedAt` per entity.
- Content model has **no `reviewedAt`**; `lastVerifiedAt` is the verification field (mapped as review freshness).
- Evergreen policy/static pages use `SEED_DATES.published` where appropriate (not fake “today”).

### Measured (generator, production eligibility)

| Metric | Before (audit 04) | After fix 23 |
|---|---:|---:|
| Unique lastmod values | **1** | **3** |
| `2026-02-01T10:00:00.000Z` (published) | — | 10 |
| `2026-09-01T08:00:00.000Z` (updated) | ~all | 11 |
| `2026-09-04T18:31:38.610Z` (verified) | — | 967 |

No fabricated freshness beyond existing seed timestamps.

---

## 6. Schema validation

Source: `src/lib/seo/jsonld.tsx` + audit 04 crawl heuristics.

| Type | Status |
|---|---|
| Product | Emits name/url/brand/offers when fresh — **no AggregateRating** |
| Review | `reviewRating` from editorial score; Product `itemReviewed`; Person vs Organization byline |
| Article | Guides / comparisons / Best |
| BreadcrumbList | Category, product, review, hubs |
| ItemList | Listings / Best / brands |
| FAQPage | When FAQs present |
| Organization | Home + desk authors |
| Person | Named non-desk authors only |
| Fake AggregateRating | **None** (explicit policy + no builder) |

Audit 04: “Schema problems (sample): _None flagged_.” No code change required beyond confirmation.

---

## 7. Sitemap eligibility re-run

Post Prompt 15 gates + daily-trainers listing (generator, `isDev: false`):

| Metric | Audit 04 | Fix 23 |
|---|---:|---:|
| Sitemap URL count | **867** | **988** |
| Use-case shoe listings | 4 | **5** (adds daily-trainers) |
| Query-string sitemap URLs | 0 | 0 |
| `/search` in sitemap | false | false |

Indexable entity counts (eligibility, not full sitemap row types): products **251**, reviews **367**, best **44**, comparisons **55**, buying guides **34**, brands **103**, tools **12**, sports **1**, listings **5**.

Delta vs audit 04 is mostly eligibility expansion already in code (more Best/reviews indexable) plus **+1** listing URL — not a sitemap policy regression.

---

## 8. Tests

- `tests/use-case-listing.test.ts` — includes `daily-trainers`
- `tests/sitemap-lastmod.test.ts` — newest-candidate / no fabrication

```bash
npx vitest run tests/use-case-listing.test.ts tests/sitemap-lastmod.test.ts
```

---

## 9. Definition of done

- [x] Missing meta descriptions audited — no indexable HTML gaps
- [x] NOINDEX duplicate titles left alone; indexable compare pair unchanged
- [x] `/running/shoes/daily-trainers` canonical listing + internal links
- [x] QA pace calculator probe corrected
- [x] Meaningful multi-value lastmod from real content fields
- [x] Schema types validated; no fake AggregateRating
- [x] Sitemap eligibility re-counted
- [x] This report written

**Do not publish. Do not commit unless asked.**
