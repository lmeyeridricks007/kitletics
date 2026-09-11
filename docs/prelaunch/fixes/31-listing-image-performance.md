# Fix 31 — Daily trainers / use-case listing image performance

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Lab data:** [`../data/rc-final/31-listing-perf.json`](../data/rc-final/31-listing-perf.json) · diagnose [`../data/rc-final/31-diagnose.json`](../data/rc-final/31-diagnose.json)

## Objective

Cut `/running/shoes/daily-trainers` (and sibling use-case listings) under the **≤2.5 MB** initial-transfer budget (prefer **&lt;1.5 MB**) without hiding products from crawlers or removing listing UX.

---

## 1. Trace — product grid & chrome images

Listing already paginates (**24 / page**, **3 pages**, crawlable `?page=`).  
`CatalogProductCard` already used `next/image` + lazy (priority first 2).

On-disk masters still referenced by the page (before delivery fix):

| Surface | Count | Disk sum | Pattern |
|---|---:|---:|---|
| Product grid (page 1) | 24 | ~18.4 MB masters | Already via `/_next/image` card sizes |
| Featured comparison thumbs | 8 | ~6.2 MB | **Raw `<img>`** (e.g. Ghost 18 **2.7 MB** ×2) |
| Related guide covers | 3 | ~8.4 MB | **Raw `<img>`** of `guide-running-shoes.jpg` (**2.7 MB** each) |
| Hero | 1 | 163 KB | **Raw `<img>`** `use-daily.jpg` |

RC measurement (`perf-summary.json`): **~6.5 MB total / ~6.2 MB images** — matches raw comparison + guide masters dominating transfer (not card optimization failure alone).

---

## 2. Root cause

Shared use-case listing chrome loaded **PDP/guide-resolution files into tiny cells**:

- Comparison row thumbs (~40px) → full product heroes  
- Guide cards (~96×64) → full 2.7 MB editorial JPG  
- Hero column → unoptimized full JPG  

Product cards were largely correct; **shared listing chrome was not**.

---

## 3–4. Fixes

### Card delivery (shared)

- `CatalogProductCard`: compact/listing grids use `IMAGE_SIZES.productCardCompact` (~200px / 25vw) instead of full `productCard` 280px sizing  
- Unchanged: `quality=card`, lazy except `priority` for first **2** above-fold cards  

### Use-case chrome (shared template)

- `UseCaseHero` → `next/image`, `listingHero` sizes, hero quality, **priority** (LCP)  
- `UseCaseComparisonsAndGuides` → `next/image` for comparison thumbs (`compareThumb`) and guide covers (`listingGuideCover`), lazy  

### Pagination

Already present (`pageSize: 24`, SEO itemList capped, pagination nav). **No products removed from the crawlable set** — only delivery size fixed. Progressive hide-from-crawler was **not** used.

### Presets / guardrails

- `image-delivery.ts`: `listingHero`, `listingGuideCover`; tighter `productCardCompact`  
- `tests/image-delivery.test.ts`: critical files + `/running/shoes/daily-trainers` budget  

---

## 5. Re-measure (after)

Lab: `BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-31-listing-lab.mjs`  
Desktop 1440×900, `networkidle`.

| Route | Before | After total | After images | ≤2.5 MB | Prefer &lt;1.5 MB | Raw imgs |
|---|---:|---:|---:|---|---|---:|
| `/running/shoes/daily-trainers` | **6 478 KB** (img **6 198**) | **1 217 KB** | **100 KB** | PASS | **PASS** | **0** |
| `/running/shoes` | — | **1 308 KB** | **81 KB** | PASS | PASS | 0 |
| `/running/shoes/trail` | — | **1 110 KB** | **52 KB** | PASS | PASS | 0 |
| `/running/shoes/stability` | — | **1 088 KB** | **39 KB** | PASS | PASS | 0 |
| `/running/shoes/race` | — | **1 109 KB** | **55 KB** | PASS | PASS | 0 |

Daily trainers: **~6.5 MB → ~1.2 MB** (~**81%** cut). Images **~6.2 MB → ~0.1 MB**.

---

## 6. Regression

Same `ProductUseCaseListingPage` template drives race / trail / stability / heavy-runners / daily-trainers. Fixing hero + comparisons/guides + compact card sizes applies to **all** those listings. `/running/shoes` category hub also stays under prefer.

---

## 7. Files touched

| File | Change |
|---|---|
| `src/components/use-case-listing/UseCaseHero.tsx` | next/image LCP hero |
| `src/components/use-case-listing/UseCaseComparisonsAndGuides.tsx` | next/image thumbs + guides |
| `src/components/catalog/CatalogProductCard.tsx` | compact sizes |
| `src/lib/media/image-delivery.ts` | listing presets |
| `tests/image-delivery.test.ts` | critical files + budget |
| `scripts/tmp/prelaunch-31-listing-lab.mjs` | measure script |

---

## 8. Definition of done

- [x] Initial daily-trainers transfer ≤2.5 MB (and &lt;1.5 MB prefer)  
- [x] Listing cards not served at PDP hero resolution  
- [x] Above-fold priority limited; lower cards lazy  
- [x] Pagination preserved; products remain crawlable  
- [x] Sibling listing templates re-measured under budget  
