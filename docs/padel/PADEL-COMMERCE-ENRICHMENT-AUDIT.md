# Padel commerce enrichment audit

**Date:** 2026-09-13  
**Scope:** ALL current canonical Padel products (rackets, shoes, balls, bags, grips, accessories)  
**Primary market:** NL · Secondary: BE, DE, FR, ES · Then: UK, US, ZA  
**Rule:** Catalog inclusion ≠ retail availability. Never invent affiliate tags or FX prices.

## Architecture

| Layer | Role |
| --- | --- |
| Offers | Canonical `Offer` → `Retailer` → `region` (shared `getLowestOfferPrice`) |
| Research sidecar | `src/content/padel/commerce-enrichment/store.ts` |
| Pack normalization | `src/domain/commerce/pack-normalization.ts` |
| Coverage | `docs/padel/data/PADEL-COMMERCE-COVERAGE.csv` |
| Conflicts | `docs/padel/data/PADEL-COMMERCE-CONFLICTS.csv` |
| Admin | `/admin/catalog/padel-equipment/commerce` |

## Coverage by category

| Category | Current products | NL offer rows | EU offer rows | Affiliate-mapped | No Kitletics offer | Stale | Conflicts | NL_AVAILABLE | EU_* class | BRAND_DIRECT | NO_CURRENT_OFFER_FOUND |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rackets | 62 | 27 | 21 | 27 | 35 | 0 | 0 | 27 | 0 | 0 | 35 |
| shoes | 41 | 40 | 39 | 40 | 1 | 0 | 0 | 40 | 0 | 0 | 1 |
| balls | 62 | 13 | 0 | 1 | 49 | 0 | 0 | 13 | 4 | 2 | 43 |
| grips | 85 | 7 | 0 | 1 | 78 | 0 | 0 | 7 | 1 | 1 | 76 |
| bags | 124 | 19 | 0 | 1 | 105 | 0 | 0 | 19 | 11 | 10 | 84 |
| accessories | 84 | 8 | 0 | 0 | 76 | 0 | 0 | 8 | 2 | 3 | 71 |

**Totals:** 458 products researched · COMMERCE_PENDING remaining: **0** · RESEARCHED: 456

## Separate coverage metrics (do not conflate)

| Metric | Status / definition |
| --- | --- |
| **COMMERCE_RESEARCH** | **COMPLETE** — every current product has a terminal research state (`COMMERCE_PENDING` = 0) |
| **COMMERCE_COVERAGE** | **INCOMPLETE** — many products still lack a priced Kitletics Offer row |
| Any offer coverage | Product has ≥1 Kitletics Offer row (any region) |
| NL coverage | Product has ≥1 NL Offer row |
| EU coverage | Product has ≥1 BE/DE/FR/ES Offer row |
| Affiliate coverage | Product id present in `PRODUCT_AFFILIATE_URLS` (status still pending until env tags) |
| Fresh offer coverage | Offers in fresh/recent band (seed clock lifts seed/manual) |

**Honesty:** Catalog inclusion ≠ retail availability. Products without offers stay in the catalog; UI shows regional “no verified retailer offers” rather than dropping recommendations.

## Classification rules

1. **NL_AVAILABLE** — priced NL Offer in-stock (or low-stock/unknown) on Kitletics.
2. **EU_AVAILABLE_TO_NL** — EU Offer / EU listing evidence that ships to NL; no NL Kitletics Offer yet.
3. **EU_ONLY** — EU listing with inventory NL_available=no.
4. **BRAND_DIRECT** — manufacturer store listing only.
5. **OUT_OF_STOCK** — only OOS Offers.
6. **NO_CURRENT_OFFER_FOUND** — researched; no verified priced Kitletics Offer (listing URL may still exist as evidence).

## Pack normalization

Balls and grips with NL offers store `packNormalization` (price per can / per ball / per grip). Bulk packs must not be compared on sticker price alone.

## Conflicts

0 identity conflicts flagged. See `PADEL-COMMERCE-CONFLICTS.csv`.

## Representative canaries

| Category | Product IDs |
| --- | --- |
| Rackets (10) | prod-nox-at10-18k-2026, prod-bullpadel-vertex-04, prod-babolat-technical-viper, prod-head-coello-pro, prod-siux-diablo, prod-wilson-bela-pro, prod-starvie-titania-kepler, prod-adidas-metalbone-hrd, prod-kuikma-pr-soft-500, prod-drop-shot-canyon-pro |
| Shoes (5) | prod-adidas-courtstabil, prod-asics-gel-resolution-padel, prod-babolat-jet-premura, prod-asics-gel-challenger-court, prod-joma-t-slam |
| Balls (10) | prod-head-padel-pro-s, prod-wilson-padel-premier, prod-bullpadel-premium-pro, prod-adidas-speed-rx, prod-babolat-court-padel-balls, prod-dunlop-pro-padel, prod-head-padel-pro-plus, prod-wilson-padel-premier-speed, prod-tecnifibre-padel-team, prod-black-crown-one |
| Bags (10) | prod-nox-bag-10, prod-bullpadel-vertex-backpack, prod-tecnifibre-tour-endurance-backpack, prod-adidas-protour-padel, prod-wilson-super-tour-padel, prod-black-crown-spartan, prod-nox-at10-xxl-bag, prod-bullpadel-bpm26002-hack, prod-bullpadel-bpm26007-bpm26008-vertex, prod-bullpadel-bpp26022-xplo |
| Grips (10) | prod-wilson-overgrip, prod-nox-pro-overgrip, prod-head-xtreme-soft, prod-hesacore-padel, prod-bullpadel-gb1200-hac, prod-head-xtreme-soft-xtremesoft, prod-hesacore-tour-original, prod-bullpadel-gb1200, prod-babolat-pro-response, prod-kuikma-overgrip |
| Accessories (10) | prod-bullpadel-frame-protector, prod-nox-frame-protector, prod-alacran-wide-ancha, prod-shockout-padel-balls-design, prod-bullpadel-pascal-box, prod-bullpadel-custom-weight, prod-bullpadel-custom-weight-protector, prod-nox-transparent-protection-tape, prod-head-x3-pressurizer, prod-head-wristband |

Manual verification checklist (per canary): brand + model + generation + pack match; region/currency consistent; From-price via `getLowestOfferPrice` only; no commission in ranking.

## Affiliate independence

Commission is **not** a field on Offer ranking (`DEFAULT_OFFER_RANKING`). Finder / Best Guide / score paths must not read affiliate payout. Regression: `tests/padel-commerce.test.ts`, `tests/padel-commerce-enrichment.test.ts`.

## New offers this pass

25 priced NL specialist Offers fetched from product listing JSON-LD and merged via \`padelCommerceWaveOffers\` (total \`padelAllOffers\`: 243). No invented affiliate tags.

## Gate

COMMERCE_PENDING remaining: **0**  
**COMMERCE_RESEARCH:** COMPLETE · **COMMERCE_COVERAGE:** INCOMPLETE  
Gate PASS — every current product has a terminal commerce research state. Missing Offers are coverage debt, not unexplained research debt.

## Next

1. Run `node --import tsx scripts/tmp/enrich-padel-commerce.ts --fetch` to attach priced NL specialist Offers where JSON-LD is available.
2. Replace remaining Amazon/Decathlon homepage seeds with product listing URLs.
3. Import verified amzn.to shortlinks via `npm run offers:import-affiliate` (never invent tags).
4. Add BE/FR/ES/UK/US/ZA Offers only with real regional listings — no FX fabrication.
