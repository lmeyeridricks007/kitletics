# Caching / ISR audit

Sep 1–17: ISR Reads **$2.67** (almost all SoftwareGlimpse **$2.34**), ISR Writes **$0.16**. Kitletics ISR writes $0.00-level ($0.0007). HikingWithLee writes $0.09 / reads $0.26.

Vercel bills Incremental Cache **reads** even for pages you think of as “static SSG” when the CDN asks the cache. Deploys reset that cache.

---

## Policy by content type (all personal SEO sites)

| Content type | Current (worst offender) | Recommended | TTL | Revalidate style |
|---|---|---|---|---|
| Legal / about / authors | Static | Static | ∞ until deploy | Build |
| Product / software / trek / guide HTML | Kitletics force-dynamic; Glimpse draftMode-dynamic; Hiking SSG | **ISR** or static | **86400** or on-demand | `revalidateTag('catalog')` on publish |
| Prices / region | Kitletics cookies() | Client island or tagged cache | 3600 if needed | Tag `offers` |
| Best-of / compare canonical | Mixed | Static / ISR 86400 | 86400 | Tag |
| Search `?q=` | Glimpse ISR 3600 | **Never ISR** | CDN `s-maxage=60` or dynamic | — |
| Sitemap / llms.txt | Glimpse 86400; rebuilds full inventory | Build-time XML or revalidate **7d** | 604800 | On content ship |
| Faceted listing `?gender=` | Dynamic | Static default + client filter | — | — |
| Affiliate `/go` | no-store | Keep no-store | 0 | — |
| Amazon indicative price (Hiking) | fetch revalidate 86400 | Keep | 86400 | Fine |

---

## SoftwareGlimpse

| Item | Now | Problem | Change |
|---|---|---|---|
| Software/guides | Intended SSG, actually dynamic via `draftMode()` | Incremental Cache never warms for the crawl surface; every hit is origin | Remove draftMode → real static |
| `/search` | `revalidate = 3600` | Unbounded keys (`q`, `type`) | force-dynamic + short CDN cache **or** client-only |
| Sitemap / llms.txt | `revalidate = 86400`, `max-age=3600` vs `s-maxage=86400` | Frequent revalidate of full inventory | Align max-age; generate at build |
| Compare SSG | Static + reverse slugs prerendered | Build cost, not ISR $ | Drop reverse static params |

ISR Reads $2.34 with only $0.009 writes = **read-heavy Incremental Cache** of a huge static estate after deploys, plus search keys. HIGH.

---

## Kitletics

| Item | Now | Problem | Change |
|---|---|---|---|
| Home, reviews index, brands, guides, databases | `revalidate = 3600` | Hourly is tighter than content changes | 86400 |
| PDPs / reviews / best / brands / listings | `force-dynamic` (no ISR) | CPU, not ISR $ | ISR 86400, no cookies |
| `generateStaticParams` + force-dynamic | Still walks all slugs at build | Wasted build CPU | Remove params on dynamic routes |
| `unstable_cache` | Used on home/guides/brands/reviews index | Good | Extend to `getProductPageData` |
| Query variants | Gender, finder results, search | Fragmentation | Client filters |
| On-demand | Admin `revalidatePath` only | Fine | Add tags on catalog publish scripts |

Kitletics ISR $ is tiny because **the expensive pages are not in ISR at all**. Moving them to ISR will **raise ISR reads** and **cut Fluid** — a good trade (ISR reads are ~$0.40/million-scale vs Fluid hours).

---

## ExpatCopilot

`CONTENT_REVALIDATE = 3600` on **381** files. Dev sets `0`. Catch-all `/netherlands/[...slug]` is on-demand ISR without `generateStaticParams`.

**Change:** 86400 (or `false`) for evergreen guides. Keep 3600 only on pages that embed live fees if those exist.

---

## HikingWithLee

No page-level `revalidate`. Public MDX is SSG. Amazon `fetch` cache 86400 explains ISR reads $0.26. Keep.

---

## Fetch cache / Cache-Control

- Kitletics `/go` and admin CSVs: `no-store` — correct.
- Kitletics research CSV: `s-maxage=3600` — bump to 86400; robots Disallow.
- SoftwareGlimpse suggest API: `s-maxage=3600` — keep.
- Do not add `cache: 'no-store'` to catalog loaders.

---

## Cache fragmentation checklist

1. Query-string indexes (`?q=`, `?gender=`, `?category=`) on SSR.  
2. Region cookie on HTML (Kitletics).  
3. Preview/draft cookies on HTML (SoftwareGlimpse `draftMode`).  
4. Production deploys (all).  

Fix 3, 2, 4, then 1.
