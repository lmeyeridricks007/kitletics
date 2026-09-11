# Fix 21 — Product media depth (gallery extras)

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** HIGH residual (depth only — correctness already excellent)  
**Reference:** [`../06-media-offers-trust.md`](../06-media-offers-trust.md)  
**Machine data:** [`../data/../staging` →](../../staging/) `data/staging/21-gallery-fetch-report.json`, `data/staging/21-priority-products.json`

## Objective

Keep **623/623 authentic primaries**, **0 placeholders**, **0 identity mismatches**, **100% provenance** — and add **legitimate secondary gallery** media for priority products (not all 623).

---

## 1. Primaries preserved (MEASURED)

| Metric | Before (audit 06) | After fix 21 |
|---|---:|---:|
| Published products | 623 | **623** |
| Authentic primary | 623 | **623** |
| Placeholders | 0 | **0** |
| Identity mismatches | 0 | **0** (`npm run media:ci`) |
| Unknown provenance | 0 | **0** |
| Heroes overwritten | — | **0** (no `*-hero.*` writes) |

`media:ci` after gallery work: **Coverage 100% (623/623), P0 gaps 0, broken 0**.

---

## 2. Priority scope (not all catalog)

Priority set (**166** products) = union of:

- Running shoes (83)
- GPS watches (33)
- Heart-rate monitors (15)
- Running packs & vests (35)
- Overlap with Best Guide + comparison product IDs within those categories

Full list: `data/staging/21-priority-products.json`.

**No attempt** to depth-fill all 623 in this pass.

---

## 3. What shipped

### Architecture

| Piece | Role |
|---|---|
| `src/content/product-gallery-media.ts` | Gallery registry (non-hero only) + full provenance fields |
| `resolveRunningProductImages` | Merges **registry hero + gallery extras**; never drops authentic primary |
| `ProductMediaGallery` | Thumbs already lazy; main image `priority`/`eager` **only** for active index 0 |
| `scripts/tmp/prelaunch-21-fetch-gallery-media.mjs` | Manufacturer/retailer CDN fetch (no AI brand imagery) |

### Secondary media sources used

| Source | Usage |
|---|---|
| ASICS Scene7 angle codes (`SL_LT`, `SB_BT`, …) | Side / outsole |
| New Balance Scene7 (`_nb_03_i` … `_nb_07_i`) | Side / outsole / rear / detail / top |
| Garmin `res.garmin.com` `/g/` packshots | Side / detail / on-wrist |
| Coros / selected manufacturer PDP assets | Multi-angle product shots |
| Nathan / pack manufacturer pages (when CDN assets present) | Limited pack depth |

**Rejected:** AI review `sections/*.png`, random web scrapes, low-byte thumbs (&lt;12–20 KB), hero overwrites.

Every gallery asset stores: `sourceUrl`, `licence`, `attribution`/`source`, `alt` (generated), `width`, `height`, `usageType`.

---

## 4. Depth results (MEASURED)

| Metric | Audit 06 | After fix 21 |
|---|---:|---:|
| Products with gallery extras (`usageType ≠ hero` or &gt;1 image) | **0** | **23** |
| Total gallery extra files registered | 0 | **92** |
| Products with lifestyle / on-foot usage | **0** | **≥1** (Garmin on-wrist frames; more tagged `detail`/`side`) |

### By priority category (products with ≥1 extra)

| Category | Products deepened |
|---|---:|
| Running shoes | 6 |
| GPS watches | 12 |
| Heart-rate monitors | 3 |
| Running packs & vests | 2 |

Examples: Nimbus 27 / Novablast / Cumulus (side+outsole), 1080 v13 & Rebel v5 (5 angles), Forerunner 965 / Fenix 8 / Instinct 3 (multi Garmin packshots), Coros Pace/Apex line, Garmin HRM 200/Fit, Nathan Zippered Stash.

---

## 5. PDP / guides

- **PDP:** `buildGalleryImages()` already concatenates authentic `product.images` after primary → multi-thumb gallery appears when extras exist.
- **Lazy load:** Non-active main + all thumbs use `loading="lazy"`; only the first main frame is priority.
- **Reviews / Best / Compare:** Continue to use shared `src` paths (no duplicated masters). Review section resolver may consume unused gallery extras when present (`resolve-section-visuals.ts`).

---

## 6. Quality bar

- No low-res filler: CDN requests at **1200** where supported; reject small buffers.
- No AI-generated branded product shots for gallery.
- No replacement of verified heroes.

---

## 7. Residual / next passes

1. **~143 priority products** still lack CDN-expandable sourceUrls (many RunRepeat / Running Warehouse homepage provenance only). Need SKU/page-level manufacturer URLs before angles can be derived.
2. Packs remain thin — many registry `sourceUrl`s are RW homepage, not product CDNs.
3. Lifestyle/on-foot depth is still early (mostly Garmin wrist frames).
4. Continue wave-by-wave: Nike/Hoka/Brooks/Adidas Scene7 maps; Osprey/UD/CamelBak product CDNs; remaining Garmin pages with `en-US/p/` URLs.

---

## 8. Files

| Path | Change |
|---|---|
| `src/content/product-gallery-media.ts` | Gallery registry |
| `src/content/running/media.ts` | Hero-preserving merge |
| `src/components/product/ProductMediaGallery.tsx` | Eager load only active hero frame |
| `scripts/tmp/prelaunch-21-fetch-gallery-media.mjs` | Fetch + registry writer |
| `public/images/**/gallery/*` | 92 secondary assets |
| `tests/product-gallery-depth.test.ts` | Registry + merge smoke tests |

---

## 9. Verdict

**Primary correctness unchanged (excellent).**  
**Gallery depth started on the right priority slice** — 23 products / 92 extras with full provenance — without inventing imagery or touching heroes. Further depth is blocked mainly by missing manufacturer CDN identifiers on the remaining priority rows, not by gallery plumbing.
