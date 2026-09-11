# Running Hydration Catalog Report

Generated: 2026-09-04

## Summary

| Metric | Count |
| --- | ---: |
| Published hydration-ecosystem products | **35** |
| Draft (awaiting authentic hero media) | **12** |
| Brands (published set) | **14+** |
| Inventory-backed subcategories | **6** |
| Best guides | **6** |
| Comparisons (hydration-focused) | **10** |
| Running Hydration Finder | **yes** |
| Reviews (published products) | **covered via backfill** |
| Authentic heroes (published) | **required for publish** |
| Offer seeds | **seeded** |

Hydration is modeled as a **decision category**, not a single grid:

| Buyer decision | Catalog home | Subcategory |
| --- | --- | --- |
| Race / trail vest | `cat-packs-vests` | Hydration Vests |
| Phone / essentials belt | `cat-running-belts` | Phone / Essentials Belts |
| Flask / bottle belt | `cat-running-belts` | Hydration Belts |
| Soft flask | `cat-hydration` | Soft Flasks |
| Handheld | `cat-hydration` | Handheld Bottles |
| Reservoir / bladder | `cat-hydration` | Hydration Bladders / Reservoirs |

**Deferred taxonomy** (insufficient published inventory): Running Bottles, Flask / Reservoir Accessories.

## Newly published from Draft(20) media gate (2026-09-04)

Authenticated manufacturer/retailer heroes registered; wrong-brand candidates rejected:

| Product | Source |
| --- | --- |
| Osprey Duro LT | Procamper Shopify CDN (DURO LT labeled) |
| On Ultra Vest Pro | On Contentful CDN |
| Black Diamond Distance 8 | Black Diamond Shopify CDN |
| Nathan Peak | Nathan Sports Shopify CDN |
| Nathan ExoShot 2 | Nathan Sports Shopify CDN |
| Nathan SpeedDraw Plus Insulated | Running Warehouse CDN |
| Ultimate Direction Ultra Belt | Running Warehouse CDN |
| Naked Running Band | Running Warehouse CDN |

**Rejected (not published):** Decathlon/Kiprun search hit that resolved to Quechua packshot; HydraPak SoftFlask Speed image offered for classic SoftFlask 500 SKU.

## Draft / media-gated (12 remaining)

Still held until authentic manufacturer/retailer heroes are registered:

- CamelBak Zephyr Pro, Osprey Dyna LT / Duro 15, Patagonia Slope Runner, Compressport Ultrun S Pack, RaidLight Responsiv 12, Kiprun Trail 10
- Compressport Free Belt Pro
- Osprey Hydraulics 1.5L, HydraPak Shape-Shift 1.5L, HydraPak Tube Kit
- HydraPak SoftFlask 500 (classic — manufacturer catalog now emphasizes SoftFlask Speed; do not reuse Speed packshot)

## Fit variants

`ProductVariant` audience backfill extended to `cat-packs-vests`:

- Osprey Duro / Dyna remain **separate men/women SKUs**
- Unisex race vests with dual published size charts get men + women variants (ADV Skin, VaporAir, UD Race, USWE, etc.)
- Weights never invented for women’s variants

## Specs

Vest, belt, and hydration specification definitions expanded for capacity, flask/reservoir system, bounce, race-kit, phone, poles, insulation, bite valve, and related finder filters.

## Recommendation factors

capacity · bounce-control · comfort-fit · race-kit · phone-carry · versatility · weight · value · flask-access · reservoir-option

## Best guides

- Best Running Hydration Vests
- Best Hydration Vests for Trail Running
- Best Hydration Vests for Ultra Running
- Best Running Belts
- Best Handheld Running Bottles
- Best Hydration Options for Marathon Training

## Finder

`/tools` — **Running Hydration Finder** (`running-hydration-finder`)

Inputs: distance, terrain, water required, mandatory gear, phone, poles, minimal vs storage, fit sizing, budget.

Spans `cat-packs-vests` + `cat-running-belts` + `cat-hydration`.

## Market coverage notes

**Strong:** soft-flask race vests (Salomon / Nathan / UD / UltrAspire / USWE / NNormal / On Ultra Vest Pro), entry + premium CamelBak, Osprey gendered mid packs + Duro LT, phone belts + Naked Band, Peak bottle belt, HydraPak soft flask / handheld ecosystem, Crux reservoir, BD Distance 8.

**Gaps (intentional drafts):** Instinct / TNF Summit Run, Rab Veil, Haimont budget clones, Decathlon Kiprun (media pending), Osprey Dyna LT / Duro 15 (media pending), Patagonia Slope Runner, Compressport / RaidLight SKUs, accessory reservoirs when authentic heroes unavailable.

## Acceptance checklist

- [x] Decision taxonomy (vest / belt / flask / handheld / reservoir) with inventory-backed lanes only
- [x] Not a thin sample — **35** published across lanes after media unlock
- [x] Premium / race / entry / previous-gen represented
- [x] Men / women / unisex fit modeled via variants + Osprey SKUs
- [x] Expert-research reviews (no fake first-hand)
- [x] Differentiated best guides + comparisons + relationships
- [x] Running Hydration Finder
- [x] Authentic heroes for every published SKU
- [x] Report at `reports/running-hydration-catalog.md`

## Follow-ups

1. Finish media for remaining **12** drafts (Dyna LT / Duro 15 / Patagonia / Zephyr Pro / Compressport / RaidLight / Kiprun / Free Belt Pro / Hydraulics / Shape-Shift / Tube Kit / SoftFlask classic) — publish only with verified brand packshots
2. Re-add Running Bottles / Accessories subcategories when ≥2 published products each
3. Deepen editorial reviews for ADV Skin 12 / ADV Skin 5 / VaporAir 4 / UD Race Vest toward the Vomero-18 bar
4. Pricing refresh after each media unlock batch
