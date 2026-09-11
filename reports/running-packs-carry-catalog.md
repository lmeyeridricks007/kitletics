# Running Packs, Vests & Carry Systems Catalog Report

Generated: 2026-09-04

## Summary

| Metric | Count |
| --- | ---: |
| Packs & Vests category SKUs (`cat-packs-vests`) | **42** |
| Published (existing hydration/race inventory) | **16** |
| Draft — carry wave2 (awaiting authentic heroes) | **16** |
| Draft — other packs/vests (media-gated from prior waves) | **10** |
| Running Belts (`cat-running-belts`) | **10** (6 published) |
| Brands across packs + belts | **18** |
| Inventory-backed pack subcategories | **6** |
| Inventory-backed belt subcategories | **3** |
| Best guides (carry lane) | **1 new** + existing hydration/belt guides reused |
| Carry comparisons | **4** |
| Carry recommendations | **51** |
| Duplicate Product IDs (vests re-seeded as new records) | **0** |

**Identity rule:** one Product entity per model. Salomon ADV Skin 12 remains `prod-adv-skin-12` whether surfaced under Hydration, Trail, Packs & Vests, or Ultra — via `subcategoryIds`, use cases, guides and relationships, never a second SKU.

## Duplication audit vs Hydration

### Audit method

1. Listed all hydration-vest / race-vest product IDs from `gear-wave1`, `hydration-wave2`, and `products.ts`.
2. Confirmed `packs-carry-wave2.ts` intentionally **excludes** race/hydration vests and belts already seeded.
3. Verified no duplicate `id` values across the full products array.
4. Verified vest models use multi-subcategory tagging instead of clone records.

### Shared entities (no duplication)

These products are the **same** catalog records as Hydration’s vest inventory. Packs taxonomy dual-tags them; Hydration guides continue to own race-vest SEO.

| Product ID | Surfaces as | Hydration guide home | Packs subcategory tags |
| --- | --- | --- | --- |
| `prod-adv-skin-12` | ADV Skin 12 | Best Hydration Vests / Ultra / Trail | hydration-vests + race-vests |
| `prod-salomon-adv-skin-5` | ADV Skin 5 | same | hydration-vests + race-vests |
| `prod-nathan-vaporair-4` | VaporAir 4 | same | hydration-vests + race-vests |
| `prod-ud-race-vest-6` | Race Vest 6 | same | hydration-vests + race-vests |
| `prod-camelbak-apex-pro` | Apex Pro | same | hydration-vests + running-backpacks |
| `prod-osprey-duro-15` | Duro 15 | contrast in packs guide | backpacks + fastpacking + hydration-vests |
| `prod-on-ultra-vest-pro` | Ultra Vest Pro | ultra vest contrast | backpacks + fastpacking + hydration-vests |
| `prod-black-diamond-distance-8` | Distance 8 | trail vest lane | backpacks + hydration-vests |
| (+ 18 more race/hydration vests) | — | hydration guides | hydration-vests ± race-vests |

**Belts** similarly share IDs across phone / race / hydration belt subs (`prod-salomon-pulse-belt`, `prod-ud-race-belt`, `prod-naked-running-band`, etc.) — no FlipBelt / Pulse Belt clones.

### Carry-only new entities (not Hydration duplicates)

| Product ID | Role | Why not a Hydration vest |
| --- | --- | --- |
| `prod-ud-fastpack-20` / `her-20` / `30` | Fastpacking packs | Rear volume / overnight job vs race flask vest |
| `prod-osprey-talon-velocity-20` / `30` | Running backpacks | Daypack / Velocity lane |
| `prod-osprey-tempest-velocity-20` | Women’s Velocity | Gender-fit peer to Talon |
| `prod-black-diamond-distance-15` / `22` | Higher Distance volumes | Extends Distance family beyond Distance 8 vest |
| `prod-salomon-xa-15` | Mid trail pack | Between ADV Skin and Fastpack |
| `prod-camelbak-octane-22` | Bladder-forward pack | Pack capacity, not race vest |
| `prod-salomon-trailblazer-20` | Commute / day pack | Non-race carry |
| `prod-salomon-custom-quiver` | Pole quiver | Accessory, compatible-with ADV Skin |
| `prod-leki-trail-running-quiver` | Pole quiver | Accessory |
| `prod-ud-utility-bag` | Accessory pouch | Bolt-on stash |
| `prod-salomon-soft-flask-stash` | Accessory pouch | Flask/stash add-on |
| `prod-nathan-zippered-stash` | Accessory pouch | Bolt-on stash |

### Explicit non-duplicates confirmed

| Would-be anti-pattern | Status |
| --- | --- |
| Second ADV Skin 12 under Packs | **Not created** |
| Second VaporAir / Race Vest 6 / Zephyr / Duro 6 | **Not created** |
| “Best Running Vests” guide cloning hydration vests | **Not created** |
| “Best Ultra Running Vests” guide | **Not created** (use `best-hydration-vests-ultra`) |
| Second “Best Running Belts” | **Not created** (existing guide enriched for lanes) |

## Taxonomy (inventory-backed)

### Packs & Vests (`cat-packs-vests`)

| Subcategory | Depth | Notes |
| --- | ---: | --- |
| Hydration Vests | 26 | Shared with Hydration decision IA |
| Race Vests | 21 | Same products dual-tagged where race-day fit applies |
| Running Backpacks | 15 | Includes Fastpack / Velocity / Distance / XA / Octane + higher-capacity vest-hybrids |
| Fastpacking Packs | 9 | Overnight / multi-day run-capable |
| Pole Quivers | 2 | Salomon + LEKI |
| Accessory Pouches | 3 | UD / Salomon / Nathan |

### Belts (`cat-running-belts`)

| Subcategory | Depth | Notes |
| --- | ---: | --- |
| Phone / Essentials | 7 | FlipBelt, SPIbelt, Mirage, etc. |
| Race Belts | 6 | Pulse, Naked, Fitted, Free Belt Pro, UD Race/Ultra |
| Hydration Belts | 4 | Peak, UD Race/Ultra, Pulse |

### Use cases added / used

- `uc-fastpacking` — overnight / multi-day run-hike
- `uc-commute-running` — day-kit commute carry
- Existing: trail, ultra, long runs, daily / marathon via belt + vest guides

## Specs (packs lane)

Capacity, weight, fit, size/genderFit, storage layout (front/rear/pockets), hydration compatibility (flasks, reservoir, bladder), pole attachment / quiverCompatible, helmetCompatible, raceKitCapacity, bounceControl, compression, reflectivity, waterResistance, phoneStorage, raceBibAttachment, flask/reservoir fields.

## Catalog by brand (packs + belts)

Black Diamond, CamelBak, Compressport, Decathlon (Kiprun), FlipBelt, LEKI, NNormal, Naked, Nathan, On, Osprey, Patagonia, RaidLight, SPIbelt, Salomon, USWE, Ultimate Direction, UltrAspire.

Wave2 intentionally goes beyond Salomon flagship vests: UD Fastpack family, Osprey Velocity, BD Distance volumes, CamelBak Octane, LEKI quiver.

## Best / comparison (anti-cannibalization)

| Requested | Decision |
| --- | --- |
| Best Running Packs | **Added** — `best-running-packs` / `running-packs` (backpacks & fastpacks only) |
| Best Running Vests | **Deferred** — covered by `best-running-hydration-vests` |
| Best Ultra Running Vests | **Deferred** — covered by `best-hydration-vests-ultra` |
| Best Running Belts | **Existing** — intro enriched for phone / race / hydration lanes |

### New guide focus

**Best Running Packs & Fastpacking Packs 2026** shortlists Fastpack 20/30, Talon/Tempest Velocity, BD Distance 22, XA 15, Octane 22, Duro 15, On Ultra Vest Pro (race-capacity contrast). Links related hydration vest / ultra / trail / belts guides. Explains when Fastpack beats ADV Skin 12.

### Comparisons

1. Fastpack 20 vs ADV Skin 12  
2. Fastpack 20 vs Talon Velocity 20  
3. BD Distance 22 vs Fastpack 20  
4. Salomon XA 15 vs Osprey Duro 15  

## Editorial graph

- Families: Fastpack, Talon/Tempest Velocity, XA, Octane, Trailblazer, Custom Quiver, LEKI quiver, Utility Bag; Distance family extended for 15/22  
- Relationships: Fastpack ↔ ADV Skin (similar job, different capacity); quivers ↔ ADV Skin (compatible-with); Utility Bag / Soft Flask Stash ↔ UD / Salomon vest ecosystem  
- Recommendations: capacity, bounce-control, race-kit, pole-carry, versatility, weight, value across fastpacking / trail / ultra / long runs / commute  
- Offers: EUR seeds for all 16 carry SKUs  

## Media / publish status

| Status | Products |
| --- | --- |
| Published vest/belt inventory | Existing hydration wave (authentic heroes) |
| Media-gated draft | All 16 `packs-carry-wave2` SKUs |
| Reviews for carry wave2 | **0 / 16** — run `npm run reviews:backfill` after heroes land |

Same honesty gate as clothing/hydration: structure complete; publish when authentic manufacturer/retailer heroes are registered.

## Files touched

| Area | Path |
| --- | --- |
| Carry products | `src/content/running/products/packs-carry-wave2.ts` |
| Wire | `src/content/products.ts` |
| Taxonomy | `src/content/taxonomy/subcategories.ts`, `use-cases.ts` |
| Specs | `src/content/specs/definitions.ts` |
| Families | `src/content/running/packs-carry-families.ts` |
| Recommendations | `src/content/running/packs-carry-recommendations.ts` |
| Guides | `src/content/running/best-guides-gear.ts` |
| Comparisons / relationships | `src/content/running/comparisons.ts`, `relationships.ts` |
| Dual-tags | `hydration-wave2.ts`, `gear-wave1.ts`, existing vest IDs |
| Brand | LEKI in running brands |

## Acceptance checklist

- [x] Hydration vest products audited — **shared IDs, zero clones**
- [x] Race / hydration / backpack / fastpack / quiver / pouch taxonomy inventory-backed
- [x] Specs cover capacity through race-bib / flask compatibility
- [x] Use cases include fastpacking + commute running
- [x] Multi-brand catalog (not Salomon-only)
- [x] Best Running Packs only where distinct from Hydration guides
- [x] Best Running Vests / Ultra Vests **not** duplicated
- [x] Best Running Belts enriched, not recreated
- [x] Report at `reports/running-packs-carry-catalog.md`
- [ ] Published depth for backpacks/fastpacks/quivers — **blocked on authentic media + review backfill**

## Deferred

- Additional mid-market fastpacks (e.g. Montane, RaidLight overnight) until heroes available  
- Dedicated “Best Pole Quivers” guide (inventory too thin; surface via vest relationships)  
- Full review backfill for the 16 draft carry SKUs  
