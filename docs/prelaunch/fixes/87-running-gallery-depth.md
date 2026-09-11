# Fix 87 — Running product media depth

**Date:** 2026-09-11  
**Status:** Implemented  
**Scope:** Indexable Running products (375) — gallery depth for **P1 top 50**  
**Evidence:** `docs/prelaunch/data/rc-87/` · `src/content/product-gallery-media.ts`  
**Gate:** Do **not** block launch for hero-only products with authentic primaries

---

## 1. Priority ranking

Ranked all **375** indexable Running products by:

| Signal | Weight |
|--------|--------|
| Best Guide appearances (indexable guides weighted higher) | high |
| Indexable Review on the product | high |
| Comparison frequency | medium-high |
| Finder recommendation IDs (when present) | medium |
| Category importance (shoes > watches > packs/HRM > clothing) | medium |
| Commercial proxy (`recommendationScore` + offer presence) | low |

Tiers:

| Tier | Count | Role |
|------|------:|------|
| **P1** | 50 | Gallery depth this pass |
| **P2** | 100 | Next wave |
| **P3** | 225 | Remainder |

Lists: `docs/prelaunch/data/rc-87/running-priority.json`, `p1-top-50.json`.

---

## 2. Before → after (gallery registry)

| Metric | Before | After |
|--------|-------:|------:|
| Products with `PRODUCT_GALLERY_MEDIA` (catalog-wide) | **23** | **43** |
| Gallery extra files registered | **92** | **152** |
| P1 with ≥1 gallery extra | **8** | **28** |
| P1 hero-only (authentic primary retained) | **42** | **22** |
| Running indexable with authentic primary | 375 | 375 (unchanged) |

**20** P1 products gained meaningful gallery depth this fix.  
**22** P1 remain hero-only because no **safe authentic multi-angle CDN** was available without inventing or using wrong-variant imagery.

---

## 3. P1 products deepened (this fix)

| Slug | Before | After | Views | Provenance |
|------|-------:|------:|-------|------------|
| asics-novablast-6 | 0 | 2 | side, outsole | ASICS Scene7 `1011C243_001` |
| asics-gel-kayano-32 | 0 | 2 | side, outsole | ASICS Scene7 `1011C052_001` |
| brooks-adrenaline-gts-25 | 0 | 4 | side, detail, rear, outsole | SportsShoes BigCommerce CDN |
| new-balance-fresh-foam-x-1080-v14 | 0 | 4 | side, outsole, rear, detail | NB Scene7 `m1080b14` |
| new-balance-fuelcell-supercomp-trainer-v3 | 0 | 4 | side, detail, rear, outsole | Running Warehouse watermark family |
| garmin-forerunner-970 | 0 | 4 | side, detail, rear, top | Garmin `res.garmin.com` packshots |
| garmin-enduro-3 | 0 | 4 | side, detail, rear, top | Garmin official catalog |
| salomon-adv-skin-12 | 0 | 4 | side, detail, rear, top | Running Warehouse product page |
| salomon-adv-skin-5 | 0 | 4 | side, detail, rear, top | Running Warehouse |
| nathan-vaporair-4 | 0 | 4 | side, detail, rear, top | Running Warehouse |
| ultimate-direction-race-vest-6 | 0 | 4 | side, detail, rear, top | Running Warehouse |
| osprey-duro-15 | 0 | 4 | side, detail, rear, top | Bergfreunde / Osprey CDN |
| patagonia-houdini-men | 0 | 4 | side, detail, rear, top | Running Warehouse |
| janji-multi-short-men | 0 | 4 | side, detail, rear, top | Janji Shopify CDN |
| hydrapak-skyflask-speed-500 | 0 | 3 | side, detail, rear | HydraPak product photography |
| polar-h10 / polar-h9 | 0 | 1 each | side | Polar product photography |
| wahoo-trackr | 0 | 1 | side | Wahoo product photography |
| suunto-run / suunto-vertical-2 | 0 | 1 each | side | Suunto product photography |

Already had depth (unchanged heroes): COROS Pace 4 / Apex 4 / Pace Pro, Garmin Fenix 8 / Vivoactive 6, ASICS Nimbus 27 / Cumulus 27 / Novablast 5.

Full machine rows: `docs/prelaunch/data/rc-87/final-summary.json`.

---

## 4. Could not source safely (22 P1)

No AI, no random web scrape, no wrong-variant substitution. These remain **hero-only** until a manufacturer/authorized multi-angle CDN is confirmed:

| Group | Slugs |
|-------|-------|
| Nike (generic/homepage provenance on hero) | vaporfly-4, alphafly-3, pegasus-42, vomero-18, structure-plus |
| HOKA (no safe multi-angle CDN without page scrape risk) | clifton-10, bondi-9, speedgoat-6 |
| Brooks (hero provenance incomplete) | ghost-18, glycerin-22 |
| Saucony | endorphin-speed-5, endorphin-pro-4, ride-18 |
| ASICS (SKU angles unavailable for these colorways) | superblast-2, metaspeed-sky-paris |
| Adidas (RunRepeat-only hero provenance) | adios-pro-4, boston-12 |
| Garmin (page / filter miss) | forerunner-165, hrm-600 |
| Other | apple-watch-ultra-3, ultimate-direction-fastpack-20, flipbelt-classic |

**Launch impact:** none — authentic heroes remain; gallery depth is additive.

---

## 5. Source rules followed

- Manufacturer Scene7 / Garmin / brand Shopify CDNs  
- Authorized retailer CDNs (Running Warehouse, SportsShoes BigCommerce, Bergfreunde)  
- Every gallery row has `sourceUrl`, `licence`, `attribution`, `usageType`  
- **Never** overwrote `*-hero.*`  
- Cap **≤4** distinct useful views (side / outsole / rear / top / detail / on-foot)  
- Rejected homepage placeholders (`asics.com/`, bare `runrepeat.com/`) as angle sources  

---

## 6. PDP UX / performance

`ProductMediaGallery` already:

- Lazy-loads thumbs and non-active main frames  
- Eager/priority only for active index 0  
- Keyboard arrows + prev/next controls  
- Responsive thumb rail  

No change required for ≤2.5 MB page budgets — extras go through `next/image` + `writeWebMaster` gallery limits (≤1600px, JPEG when needed).

---

## 7. Tests

`tests/product-gallery-depth.test.ts` — registry ≥40 products, merge preserves authentic hero, provenance on extras.

---

## 8. Definition of done

- [x] P1 / P2 / P3 ranking for 375 Running indexable  
- [x] P1 gallery depth where authentic assets available (28/50)  
- [x] Documented could-not-source without fabricating  
- [x] Provenance on every new gallery row  
- [x] No launch block for remaining hero-only P1  
- [x] No hero overwrites; quality over count  

---

## 9. Follow-ups (P2 / FUTURE)

- Confirm Nike `static.nike.com` / HOKA media CDN colorway codes for Clifton 10, Bondi 9, Vomero 18, Vaporfly 4  
- Expand P2 (next 100) with the same manufacturer-first pipeline  
- Repair incomplete hero `sourceUrl` placeholders (`https://www.asics.com/` on non-ASICS SKUs) so gallery expansion can chain from real CDNs  
