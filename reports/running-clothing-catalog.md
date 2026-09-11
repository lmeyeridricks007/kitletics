# Running Clothing Catalog Report

Generated: 2026-09-04

## Summary

| Metric | Count |
| --- | ---: |
| Clothing + socks SKUs seeded | **76** (67 wave2 + 9 gear-wave1) |
| Published today | **1** (Feetures Elite Light Cushion) |
| Draft (media-gated) | **75** |
| Brands in apparel set | **20+** |
| Inventory-backed clothing subcategories | **13** |
| Best guides | **7** |
| Comparisons | **9** |
| Recommendations | **287** |
| Product families | **57** |
| ProductVariant apparel support | **yes** (men / women / unisex) |

Running Clothing is modeled as a **structured product catalog** (not a 10-item editorial list). Every major P0 lane has a commercially useful model set. Authentic hero photography is the remaining publish gate — retailers/manufacturers blocked automated CDN scrape in this pass (same honesty rule as hydration: no fake heroes).

## Taxonomy (inventory-backed)

Running → Clothing (`cat-running-clothing`) + Socks (`cat-running-socks`)

| Subcategory | Wave2 depth | Notes |
| --- | ---: | --- |
| Running Shorts | 14 | Men + women SKUs (Session, Multi, Pace, Strider, Hotty Hot, etc.) |
| Running Tights | 8 | Road/cold mix |
| Running T-Shirts | 6 | + Ghost SS from wave1 |
| Singlets / Tanks | 3 | Race focus |
| Long-Sleeve Tops | 4 | Training / cold |
| Running Jackets | 6 | Wind / thermal |
| Running Rain Jackets | 4 | Bonatti, Rainrunner, TNF Flight |
| Running Vests | 3 | Insulated / wind |
| Base Layers | 3 | Capilene / Odlo / Craft |
| Running Underwear | 2 | SAXX / Lululemon |
| Sports Bras | 4 | Brooks / Nike / Lululemon / Tracksmith |
| Hats / Caps | 3 | Ciele / Brooks beanie / Nike |
| Gloves | 3 | Smartwool / Nike / Craft |
| Socks (category) | 4 wave2 + 4 wave1 | Feetures published |

**Not added (insufficient differentiation / thin inventory):** dedicated Running Pants lane, Cold-Weather Accessories mega-sub (covered by base + gloves + caps + winter guide).

## Men / Women / Unisex

- Apparel products carry explicit `genderFit` (`men` | `women` | `unisex`).
- Separate SKUs when cuts differ (e.g. Tracksmith Session Men vs Women, Janji Multi vs Pace, Pace Breaker vs Hotty Hot, Bonatti Men vs Women).
- `ProductVariant` architecture extended for `cat-running-clothing` and `cat-running-socks`:
  - audience, sizeRangeLabel, cut (from fit), optional `mediaSrc` / `sizeChartUrl` fields on the type
  - never invents dual charts or women’s weights

## Specs

Category-aware clothing fields: material, weight, fit, inseam, pockets, phonePocket, liner, compression, reflectivity, waterResistance, waterproofRating (string — never fabricated HH), breathability, windResistance, hood, packability, seams, antiChafe, temperatureSuitability, weather, season, UPF, sizeRange, colors, care, genderFit.

## Brands researched / onboarded

Tracksmith, Janji, Patagonia, Rabbit, Nike, Adidas, ASICS, Brooks, On, New Balance, Lululemon, Salomon, The North Face, Craft, Odlo, Ciele, Smartwool, Darn Tough, Stance, SAXX, Balega, Injinji, CEP, Feetures — plus existing footwear brands used for apparel lines.

Not blindly whitelisted: Soar, Ronhill, Under Armour apparel depth deferred (UA brand exists via fitness; no UA apparel SKUs in this wave).

## Best guides

- Best Running Shorts
- Best Running Jackets
- Best Running Rain Jackets
- Best Running Tights
- Best Running Socks (enriched)
- Best Running Gear for Winter
- Best Running Clothing for Hot Weather

Gender intent handled in pick rationales — no duplicated Men/Women guide shells.

## Editorial graph

- Recommendations with apparel factors (fit, comfort, breathability, weather-protection, storage, anti-chafe, versatility, value, packability, visibility)
- Comparisons across shorts, jackets, rain shells, tights, tees, bras, socks
- Relationships for competitors / similar lanes

## Media / publish status

| Status | Products |
| --- | --- |
| Authentic hero registered | Feetures Elite Light Cushion |
| Media-gated draft | All other clothing + sock SKUs |

Automated Running Warehouse / manufacturer fetches were blocked or JS-rendered without usable product CDNs in this session. Draft gate matches hydration honesty: **structure complete, publish when authentic heroes land**.

## Acceptance checklist

- [x] Structured catalog (not a 10-item list) — **76** SKUs across P0 lanes
- [x] Taxonomy only where inventory exists
- [x] Men/Women/Unisex via ProductVariant + gender-specific SKUs
- [x] Apparel specs without fabricated waterproof/UPF numbers
- [x] Substantial best guides (7) + comparisons + recommendations
- [x] Expert-research review pipeline wired (drafts media-blocked until heroes)
- [ ] Published depth per lane — **blocked on authentic media**
- [x] Report at `reports/running-clothing-catalog.md`

## Follow-ups (P0)

1. Register authentic heroes under `public/images/clothing/products/` and `public/images/socks/products/`; remove IDs from `MEDIA_PENDING_DRAFT_IDS`
2. Publish shorts / jackets / rain / tights / socks first (Best Guide lanes)
3. Attach variant `mediaSrc` / `sizeChartUrl` / `offerIds` where manufacturer cuts differ
4. Deepen editorial reviews for Session Short, Strider Pro, Bonatti, Hotty Hot toward Vomero-18 bar
5. Pricing refresh for NL offer seeds
