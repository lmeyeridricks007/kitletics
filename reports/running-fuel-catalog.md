# Running Fuel & Nutrition Catalog Report

Generated: 2026-09-04

## Summary

| Metric | Count |
| --- | ---: |
| Total nutrition SKUs | **38** |
| Published | **0** (all media-gated draft) |
| Brands | **20** |
| Inventory-backed subcategories | **8** |
| Best guide picks | **11** |
| Educational buying guides | **4** |
| Comparisons | **6** |
| Recommendations | **50** |
| Product families | **32** |

**Content boundary:** sports-product decision catalog only. No medical treatment advice, deficiency diagnosis, or unsupported health claims. Label fields are factual (or `null` when unverified).

## Taxonomy

Running → Fuel & Hydration (`cat-nutrition` / `/running/nutrition`)

| Subcategory | Depth | Notes |
| --- | ---: | --- |
| Energy Gels | 16 | Includes dual-tagged race-fuel gels |
| Energy Chews | 5 | Incl. SaltStick Fastchews (electrolyte chew) |
| Energy Bars | 4 | Clif, Näak, PowerBar, Veloforte |
| Sports Drinks | 8 | Dual-tagged with carb/electrolyte mixes |
| Electrolyte Drink Mixes | 2 | Skratch Sport Hydration, PH 1500 |
| Carbohydrate Drink Mixes | 8 | Maurten, SiS Beta, Tailwind, PF30, C30, STYRKR, Näak |
| Electrolyte Tablets | 4 | Nuun, High5 ZERO, SaltStick Caps/Fastchews |
| Race Fuel Systems | 10 | High-carb gels + drink mixes dual-tagged |

**Excluded:** pre-workouts, fat burners, hormone/testosterone products, and other unsafe/unregulated supplement lanes.

## Specs (label data)

servingSize, calories, carbsPerServing, sugars, sodium, caffeine, caffeineAmount, protein, fluidRequired, form, flavour, packSize, dietaryLabels (verified only), allergens (source-provided only).

## Use cases

short-training, long-runs, half/marathon/ultra, high-carb-fueling, caffeinated-fuel, non-caffeinated-fuel, easy-carry-fuel, drink-based-fueling.

## Brands (not Maurten/SiS/GU only)

Maurten, Science in Sport, GU Energy, Precision Fuel & Hydration, Tailwind, Skratch Labs, Clif Bar, Honey Stinger, Spring Energy, Neversecond, High5, Nuun, SaltStick, PowerBar, Enervit, 226ERS, Hüma, Näak, STYRKR, Veloforte.

## Recommendation boundary

Factors used: **format**, **carbohydrate-delivery**, **caffeine-preference**, **carrying**, **taste-texture**, **race-use**, **value**.

Not used: medical suitability, deficiency treatment, invented health outcomes.

## Guides

### Best

- `best-running-race-fuel` — **Best Running Race Fuel 2026** (format-first; practice in training; not medical advice)

### Educational buying guides

1. Running Gels Explained (`guide-running-gels-explained`)
2. How to Carry Fuel on Long Runs (`guide-carry-fuel-long-runs`)
3. Gel vs Drink Mix vs Chews (`guide-gel-vs-drink-vs-chews`)
4. Caffeine in Running Fuel Explained (`guide-caffeine-running-fuel`)

Any g/hour carbohydrate discussion is framed as general endurance sports-nutrition consensus with individual tolerance caveats — not prescriptions.

### Comparisons (6)

Maurten Gel 100 vs SiS GO · Maurten Gel 100 vs PF30 · Drink Mix 320 vs Tailwind · Beta Fuel Gel vs Neversecond C30 · Clif Bloks vs GU Chews · Nuun Sport vs PH 1500

## Sample catalog by lane

### Gels (excerpt)

Maurten Gel 100 / 100 Caf / 160 · SiS GO Isotonic · SiS Beta Fuel Gel · GU Energy / Roctane · Precision PF30 · Neversecond C30 · Spring Awesome Sauce · Hüma · Honey Stinger · High5 · 226ERS High Energy · Enervit C2:1 · STYRKR GEL30

### Drink mixes

Maurten 160/320 · SiS Beta Fuel · Tailwind Endurance · PF30 Drink · Neversecond C30 Drink · STYRKR MIX90 · Näak Ultra Energy Drink · Skratch Sport Hydration · PH 1500

### Chews / bars / tablets

Clif Bloks · GU Chews · Skratch Chews · Veloforte Chews · SaltStick Fastchews · Clif Bar · Näak Ultra Bar · PowerBar Energize · Veloforte Bar · Nuun Sport · High5 ZERO · SaltStick Caps

## Publish status

All 38 SKUs are **draft** pending authentic product heroes (same honesty gate as clothing/packs). Structure, offers seeds, guides, and recommendation graph are complete.

## Acceptance checklist

- [x] Structured Fuel & Hydration taxonomy (8 inventory-backed lanes)
- [x] Broad multi-brand catalog (20 brands, 38 SKUs) — not Maurten/SiS/GU only
- [x] Factual label specs without inferred health suitability
- [x] Use cases for training/race/caffeine/carry/drink fueling
- [x] Recommendations bounded to format/carbs/caffeine/carry/texture/race/value
- [x] Educational guides + Best Race Fuel + comparisons
- [x] No unsafe/unregulated supplement categories
- [ ] Published depth — blocked on authentic media
- [x] Report at `reports/running-fuel-catalog.md`
