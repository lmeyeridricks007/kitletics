---
name: catalog-media-audit
description: >-
  Audit the Kitletics catalog and website for missing or broken product hero
  images. Use when the user reports "Image unavailable", missing product photos,
  catalog media gaps, or asks to review/fix images across the site.
---

# Catalog Media Audit Agent

## Goal

Every **published** product shown on catalog cards, compare, search, best guides, and PDPs must resolve an **authentic primary hero** via `getPrimaryProductMedia()` with a file that exists under `public/`.

Placeholders (SVG fallbacks, `/fallbacks/`, kitletics-owned illustrations) count as **gaps**.

The agent also detects **wrong-product** heroes (OCR of model text vs catalog identity) and **shared-hero** files (identical bytes used by two different products).

Default identity behavior (unless `--no-identity`):
- **Shared-hash** for all published authentic heroes
- **OCR** for `running-shoes`, `training-shoes`, `gps-watches`, `hrm`, `adjustable-dumbbells`
- `--identity` forces OCR on every filtered product (CI)

## Quick start

```bash
# Full site audit + report (shared-hash + OCR on OCR-able categories)
npm run media:agent -- --mode=audit --write

# CI gate — fail on P0 gaps or identity mismatches
npm run media:ci

# Training shoes only (HYROX / fitness listings)
npm run media:agent -- --mode=audit --category=training-shoes --fail

# Watches / dumbbells (OCR on by default for these categories)
npm run media:agent -- --mode=audit --category=gps-watches --write
npm run media:agent -- --mode=audit --category=adjustable-dumbbells --write

# Audit then run known fetch scripts for a vertical
npm run media:agent -- --mode=full --category=training-shoes
```

Reports land in `data/staging/catalog-media-audit-YYYY-MM-DD.{json,md}`.
OCR text cache: `data/staging/hero-ocr-cache.json`.

## Audit workflow (follow in order)

1. **Run the agent** with filters matching the user's page (category, brand).
2. **Read the JSON report** — each gap row has `productId`, `slug`, `reason`, `categorySlug`.
3. **Fix in this order:**
   - `wrong-product` / `shared-hero` — replace the hero with a verified manufacturer packshot for **that** SKU; never reuse another model's photo. Confirm with Vision OCR or by reading the image (model name on midsole).
   - `broken-file` — registry points to missing file; re-download or fix `src` in `src/content/catalog-product-media.ts` or `src/content/running/product-media.ts`.
   - `no-primary` / `placeholder-only` — download hero to `public/images/{vertical}/products/{slug}-hero.jpg`, add registry entry in `catalog-product-media.ts` (same shape as existing entries: `retailer-authorized` or `manufacturer-marketing`, real `sourceUrl`).
4. **Verify visually** — open the listing URL or curl `http://localhost:3000/images/...` for 200. Read the image file and confirm the stamped model name matches the product.
5. **Re-run audit** until P0 + identity gaps for that scope are zero.

## Image sourcing rules

- Prefer **manufacturer CDN** (`assets.adidas.com`, `nb.scene7.com`, `static.nike.com`, `images.asics.com`) or **authorized retailer CDN** (SportsShoes BigCommerce, Tennis Warehouse, RunRepeat `product_primary`).
- Never invent specs or use unverified stock photos.
- RunRepeat lab cutaways are OK for cards but prefer clean **01_standard / HM1 packshots** when available.
- After download, confirm the image matches the product (read the file / OCR) before registering.
- Identity helpers: `scripts/lib/hero-identity.ts`, `scripts/lib/vision-ocr.swift` (macOS Vision).

## Key files

| Path | Role |
| --- | --- |
| `src/lib/product/media.ts` | `getPrimaryProductMedia`, `isAuthenticProductMedia` |
| `src/lib/product/logo-media.ts` | Reject brand logo / wordmark media at the authentic gate |
| `src/content/logo-hero-src-denylist.ts` | Audit-confirmed logo hero `src` denylist |
| `scripts/lib/hero-download.mjs` | Prefer manufacturer CDNs; reject shared-hero byte collisions after download |
| `src/content/catalog-product-media.ts` | Cross-vertical hero registry |
| `src/content/running/product-media.ts` | Running-specific heroes |
| `scripts/catalog-media-agent.ts` | CLI agent |
| `scripts/lib/catalog-media-audit.ts` | Audit logic |
| `scripts/lib/hero-identity.ts` | Wrong-product OCR + shared-hash detection |
| `scripts/fetch-training-shoes-media.mjs` | Batch fetch training gaps |
| `scripts/batch-fetch-running-media.mjs` | Batch fetch running gaps |
| `scripts/batch-fetch-p1-catalog-media.mjs` | Padel/tennis/other P1 |

## Vertical npm scripts

- `npm run media:ci` — **CI gate**: full published catalog + identity (`--fail`)
- `npm run media:qa` — running shoes authentic-primary gate
- `npm run racket:media-qa` — padel + tennis rackets
- `npm run media:agent` — **full catalog** (this skill)
- `npm run reviews:publish-path` — after media promotes SKUs: review backfill + section images

## Definition of done

- `npm run media:agent -- --mode=audit --category=<scope> --fail` exits 0
- Listing pages for that scope show zero "Image unavailable" cards
- No `wrong-product` / `shared-hero` rows for that scope
- New registry entries include `sourceUrl` and on-disk hero files
