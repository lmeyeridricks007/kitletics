# Running Vertical Completeness QA

**Date:** 2026-09-04  
**Objective:** Credible 2026 runner equipment decision catalog — not “a few products per category.”  
**Benchmark:** Running Shoes quality bar (catalog depth + decision surfaces + media + reviews).

---

## Executive verdict

Running is **launch-ready as a coherent vertical skeleton**, with **Shoes / GPS Watches / Packs** at the COMPLETE bar and most other categories at **ADEQUATE inventory** that is still **media-gated (draft)** so featured grids look thinner than the catalog.

| Layer | State |
| --- | --- |
| **Catalog** | **437** running-linked products across 16 sport-running categories (post wave3 gap-fill) |
| **Featured UI** | `canFeatureProduct` = published + authentic hero — intentional; do not confuse with catalog size |
| **Best Guides** | Broad coverage for shoes, watches, HRM, hydration/packs/belts, apparel, accessories, fuel, recovery |
| **Finders** | Shoe + Hydration + Fitness Watch — do **not** invent clothing/nutrition finders without clear intent |
| **Hubs** | `/running` SHOP BY grouped hierarchy + `/running/gear` visual discovery |
| **SEO** | SiteQualityAgent launch: **READY WITH ISSUES** (0 BLOCKER; CONTENT-001 HIGH/MEDIUM on guide depth + review audience) |

**Do not read featureable card counts as catalog counts.** Clothing (68), Nutrition (38), Recovery (32), Sunglasses (17) etc. exist in catalog but are largely draft until authentic product photography lands.

---

## Distinguish: Catalog vs Featured vs Best

| Concept | Definition in Kitletics | Running note |
| --- | --- | --- |
| **Catalog** | Full Product universe in content | Complete enough for major areas; accessories/treadmills still thin/adjacent |
| **Featured** | `canFeatureProduct` subset for grids/hubs | Media + published gate — **not** an ingestion limit |
| **Best Guide** | Editorial shortlist with rationale | Exists where decision value is clear; not one Best per empty subcategory |

### Ingestion limits audit

Searched for accidental catalog caps (`slice(0,3|4|5)`, `maxProducts = 4`, `featuredOnly` on ingest).

| Finding | Action |
| --- | --- |
| Category assemble uses full `getProductsByCategory` then feature gate | **Keep** — quality gate, not ingest limit |
| Search products preview capped at 24 | **Raised to 100** (`get-search-page-data.ts`) when `type=products` |
| No `maxProducts` catalog ingest found | OK |

UI may show a subset. **Catalog must not be limited to the UI subset** — current architecture respects this.

---

## Discovered taxonomy (Running)

### Categories (`sport-running`)

| Category | pathSegment | slug |
| --- | --- | --- |
| Running Shoes | `shoes` | `running-shoes` |
| GPS Watches | `watches` | `gps-watches` |
| Heart Rate Monitors | `heart-rate-monitors` | `heart-rate-monitors` |
| Running Clothing | `clothing` | `running-clothing` |
| Running Socks | `socks` | `running-socks` |
| Hydration | `hydration` | `hydration` |
| Running Packs & Vests | `packs` | `running-packs-vests` |
| Headphones | `headphones` | `headphones` |
| Sunglasses | `sunglasses` | `sunglasses` |
| Running Lights | `lights` | `running-lights` |
| Safety Gear | `safety` | `safety-gear` |
| Running Belts | `belts` | `running-belts` |
| Recovery | `recovery` | `recovery` |
| Accessories | `accessories` | `accessories` |
| Nutrition & Fuel | `nutrition` | `nutrition-fuel` |
| Treadmills | `treadmills` | *(fitness-adjacent)* |

### Decision surfaces

- **Best Guides:** shoes family, watches family, HRM family, hydration vests/packs/belts/handhelds, clothing (shorts/jackets/tights/winter/hot), socks, headphones, sunglasses, headlamps, safety, race fuel, recovery, Hyrox shoes, treadmills-for-home
- **Comparisons:** 50+ running-relevant pairs (shoes, watches, HRM, packs, belts, clothing, socks, audio, eyewear, lights, safety, fuel, recovery)
- **Finders / tools:** `running-shoe-finder`, `running-hydration-finder`, `fitness-watch-finder` (+ pace/rotation calculators)
- **Gear hub:** `/running/gear`
- **Sport hub:** `/running` with grouped SHOP BY

---

## Category health matrix

Counts are **catalog** products with `categoryId` + `sport-running` after accessories wave2 + hydration/socks/belts wave3.

**MEDIA %** = share that pass `canFeatureProduct` (authentic featured media), not “has any image field.”  
Placeholder / fallback images do **not** count.

| CATEGORY | PRODUCTS | BRANDS | VARIANTS (M/W/U/unset) | MEDIA % | REVIEWS % | OFFERS % | BEST GUIDES | COMPARISONS | FINDER | STATUS | MAJOR GAPS |
| --- | ---: | ---: | --- | ---: | ---: | ---: | --- | --- | --- | --- | --- |
| Running Shoes | 84 | 14 | unset on all 84 | 99% | 99% | 73% | Many shoe Bests | Strong peer pairs | Shoe Finder | **COMPLETE** | `genderFit` unset on shoes; keep current-gen race/trail refresh queued |
| GPS Watches | 33 | 7 | unset | 100% | 100% | 100% | Watch Bests (incl. budget/music/trail/ultra) | FR vs COROS, Fenix vs FR, Apple Ultra | Fitness Watch Finder | **COMPLETE** | Research Huawei/Amazfit mid breadth |
| Heart Rate Monitors | 14 | 6 | unset | 100% | 100% | 100% | HRM running / chest / intervals / Hyrox | HRM Pro+ vs H10, HRM 600 pairs | Watch Finder (adj.) | **ADEQUATE** | Tickr X / Verity Sense gen checks |
| Running Packs & Vests | 42 | 15 | M6/W4/U32 | 38% | 38% | 100% | Vests, packs, trail/ultra vests | Duro/Dyna, XA/Osprey, Fastpack | Hydration Finder | **COMPLETE** | Authenticate draft heroes; women-specific vest breadth |
| Running Clothing | 68 | 18 | M45/W16/U7 | 0% | 0% | 100% | Shorts/jackets/tights/winter/hot | Multiple apparel pairs | none | **ADEQUATE (media-gated)** | Authentic media + expert-research reviews before feature; Bandit/Saysky research |
| Nutrition & Fuel | 38 | 20 | unset | 0% | 0% | 100% | Race fuel | Chews/electrolyte pairs | none | **ADEQUATE (media-gated)** | Authentic pack shots + claim-safe reviews |
| Recovery | 32 | 16 | sparse genderFit | 6% | 6% | 100% | Recovery gear | OOFOS vs HOKA slides | none | **ADEQUATE (media-gated)** | Media + Normatec/Compex research queue |
| Headphones | 17 | 9 | unset | 18% | 18% | 100% | Running headphones | Shokz vs Bose/AirPods, Jabra vs Beats | none | **ADEQUATE** | More authentic heroes; OpenFit gens |
| Sunglasses | 17 | 8 | unset | 0% | 0% | 100% | Running sunglasses | Oakley/Julbo/Smith pairs | none | **ADEQUATE (media-gated)** | Media + reviews |
| Running Lights | 16 | 7 | unset | 19% | 19% | 100% | Headlamps | Petzl/BD/BioLite pairs | none | **ADEQUATE** | Nitecore/Ledlenser research |
| Safety Gear | 14 | 9 | unset | 7% | 7% | 100% | Safety/visibility | Clip light / reflective pairs | none | **ADEQUATE** | Policy: no weapons; personal alarms only |
| Hydration (flasks/handhelds/reservoirs) | 19 | 7 | unset | 26% | 26% | 100% | Handhelds, marathon hydration | — | Hydration Finder | **ADEQUATE** | Was THIN; wave3 added flasks/handhelds/reservoirs |
| Running Belts | 14 | 11 | unset | 43% | 43% | 100% | Running belts | FlipBelt/Naked/Nathan/UD | Hydration Finder | **ADEQUATE** | Was THIN; wave3 added Amphipod/Fitletic/Zipster/Kiprun |
| Running Socks | 14 | 13 | U14 | 7% | 7% | 100% | Running socks | Feetures vs Darn Tough | none | **ADEQUATE** | Was THIN; wave3 Bombas/Swiftwick/Hilly/Drymax/Sockwell/Wrightsock |
| Accessories | 12 | 8 | unset | 0% | 0% | 100% | — (use gear hub + related Bests) | — | none | **THIN** | Was MAJOR GAPS (2); Buff/anti-chafe/gaiters/armband added — still thin vs apparel |
| Treadmills | 3* | 2* | unset | 0% | 100%* | 100% | treadmills-for-home | Sole vs Horizon | none | **MAJOR GAPS / fitness-adjacent** | Prefer Fitness vertical; not core Running shop |

\*Treadmill running-sport slice is thin; additional treadmill SKUs may live under fitness-only sport tags.

---

## Brand gaps (by category)

| Category | Present (high level) | Missing / research queue |
| --- | --- | --- |
| Shoes | Nike, ASICS, Brooks, HOKA, Saucony, NB, Adidas, On, Altra, Topo, Salomon, Mizuno, PUMA, Inov-8 | Current-gen carbon refresh audit; more Altra/Topo trail; **genderFit data** |
| Watches | Garmin, COROS, Polar, Suunto, Apple, Samsung, Amazfit | Huawei runner SKUs; Instinct line depth |
| HRM | Garmin, Polar, Wahoo, COROS, Suunto, Scosche | Gen checks Tickr X, Verity Sense, HRM-Fit |
| Packs | Salomon, Osprey, UD, Nathan, CamelBak, Compressport, NNormal, RaidLight, USWE, … | Women-specific vest breadth; NNormal gen confirm |
| Hydration bottles | HydraPak, Salomon, Nathan, CamelBak, Osprey, Amphipod, UD | Soft Flask size matrix; Contour sizes |
| Belts | FlipBelt, SPIbelt, Naked, Nathan, UD, UltrAspire, Compressport, Salomon, Amphipod, Fitletic, Kiprun | FlipBelt Elite / SPIbelt large-pocket confirm |
| Clothing | Nike, Patagonia, Tracksmith, Janji, lululemon, Brooks, On, … | Bandit, Saysky, Satisfy (research) |
| Socks | Feetures, Darn Tough, Balega, Injinji, CEP, Smartwool, Stance + wave3 set | Injinji Ultra Run; CEP depth |
| Headphones | Shokz, Bose, Apple, Jabra, Beats, Sony, … | OpenFit current gens |
| Sunglasses | Oakley, Julbo, Smith, goodr, 100%, ROKA, … | Speedcraft / Roka Chicago gens |
| Lights | Petzl, BD, BioLite, Fenix, Silva, Ledlenser, NITECORE | NEO / NU series confirm |
| Safety | Nathan, Proviz, Knog, Road ID, She’s Birdie, … | Proviz depth |
| Fuel | Maurten, SIS, GU, Precision, Tailwind, Näak, … | PF30 / Maurten 160 completeness |
| Recovery | Therabody, Hyperice, TriggerPoint, BLACKROLL, OOFOS, HOKA, CEP, … | Normatec naming; Compex |
| Accessories | BUFF, Body Glide, 2Toms, SNB, Compressport, Dirty Girl, OR, Amphipod | Still thin vs market “small kit” universe |

---

## Product quality themes

| Check | Finding |
| --- | --- |
| Identity / family / brand | Strong on shoes/watches/packs; accessory/fuel waves use clear IDs |
| Current status | Prefer `lifecycleStatus: current`; shoes include previous-gen intentionally |
| Men/Women/Unisex | **Clothing + packs** have `genderFit`. **Shoes (84) lack `genderFit`** — P0 data QA. Belts/hydration/headphones largely unset (often OK as unisex hardware) |
| Specs | Category-appropriate; nutrition/recovery claim-safe |
| Media | Shoes/watches/HRM authentic-featured; secondary categories mostly fallback → draft |
| Evidence | Catalog mfr/editorial evidence IDs on waves |
| Offers | Near-100% product coverage on NL seeds for gear waves; **region skew** (see below) |
| Relationships | Related/alternative IDs present on waves; keep expanding peer links |

### Review coverage

- All **featureable** running products have reviews (0 featureable-without-review).
- Draft media-gated catalogs (clothing, fuel, sunglasses, most recovery/accessories) have **0–low review %** — queue **expert-research** reviews when media promotes them to published/featureable.
- Do not invent first-hand testing language.

### Region / offers

| Region | Running offer presence (approx) |
| --- | --- |
| NL | Primary seed density |
| DE / UK | Present in global offer pool; thinner on newer running waves |
| US | Sparse |
| FR / BE / ZA | **Not meaningfully populated** in offer `region` field |

**Rule followed:** Products may exist without a region offer. Do not delete products for missing FR/BE/ZA retail data — queue regional offer backfill.

---

## Hub & category UX work completed

1. **`/running` SHOP BY** — grouped hierarchy: Shoes · Training Tech · Hydration & Carry · Apparel · Accessories · Fuel & Recovery (not one crammed row).
2. **Packs href** fixed to `/running/packs`.
3. **`/running/gear`** — visual category discovery with counts + finder CTAs.
4. **Deep category configs** registered for shoes, watches, HRM, hydration, packs, belts, clothing, socks, nutrition, recovery, headphones, sunglasses, lights, safety, accessories — same premium scaffolding pattern as shoes (hero, filters, education, Best/Finder CTAs where relevant).
5. **Nav** `GEAR_MENU_FEATURED_SLUGS` includes belts, lights, safety, nutrition, recovery, accessories.
6. **Search synonyms** expanded for hydration vest, belt, jacket, gels, foam roller, headlamp, sunglasses, soft flasks, chest strap.
7. **Search product limit** raised 24 → 100 for products filter.

---

## Finder evaluation

| Finder | Verdict |
| --- | --- |
| Running Shoe Finder | **Keep / flagship** |
| Running Hydration Finder | **Keep** (vest/belt/handheld) |
| Fitness Watch Finder | **Keep** for watches (+ HRM adjacency) |
| Clothing Finder | **Do not create yet** — Best guides + genderFit filters suffice |
| Nutrition Finder | **Do not create yet** — fuel Best + guides; medical-claim risk |
| Headphones Finder | **Evaluate later** — open-ear vs in-ear guide may be enough |

---

## Guide depth / SEO

- SiteQualityAgent (`npm run site:audit -- --mode=launch`): **READY WITH ISSUES**
  - HIGH CONTENT-001: guide depth upgrades for flagship intents
  - MEDIUM CONTENT-001: review audience upgrades
- Educational guides exist for hydration vest vs belt, gels, open-ear headphones, recovery evidence, etc. Continue depth QA — **no new thin 3-section guides**.

---

## Internal link graph (target)

```
/running → categories (SHOP BY + /running/gear)
  → /running/{category} → Product → Review
                       → /best/... → /compare/...
                       → /guides/...
                       → /tools/{finder}
```

Secondary categories now share shoes-like page config so they are not bare grids.

---

## Search smoke (synonym expansions)

| Query | Expansion OK? |
| --- | --- |
| running watch | → gps watch / sports watch |
| women's running jacket | → jackets / running clothing |
| hydration vest | → packs / ADV Skin |
| running belt | → FlipBelt / SPIbelt |
| heart rate strap | → HRM / chest strap |
| running headphones | → Shokz / bone conduction |
| trail headlamp | → running lights / Petzl |
| running sunglasses | → Oakley / Julbo |
| energy gel | → nutrition / Maurten / GU |
| foam roller | → recovery / BLACKROLL |

Runtime ranking still depends on product index text + media feature gate for cards.

---

## Gap-fill completed this pass

| Wave | IDs / notes |
| --- | --- |
| Accessories wave2 | 10 SKUs — Buff variants, Compressport arm sleeves, anti-chafe, reflective armband, gaiters, phone armband |
| Hydration/socks/belts wave3 | 18 SKUs — 8 hydration flasks/handhelds/reservoirs, 6 socks brands, 4 belts |
| Queued (research) | Shoe `genderFit`; FR/BE/ZA offers; authentic media for draft categories; Bandit/Saysky; Normatec; Huawei watches |
| Queued (manual-review) | Ambiguous Soft Flask OEM vs Salomon Soft Flask naming; treadmill ownership (running vs fitness) |
| Queued (expert-research reviews) | All media-gated categories when promoted to published |

---

## Status rubric used

| Status | Meaning |
| --- | --- |
| **COMPLETE** | Credible browsing + brand diversity + decision surfaces + healthy featured set |
| **ADEQUATE** | Enough inventory for decisions; may be media-gated or mid depth |
| **THIN** | Browseable but not market-credible yet |
| **MAJOR GAPS** | Not credible for that intent (or intentionally owned elsewhere) |

---

## Remaining P0 to match Shoes bar everywhere

1. **Authentic product media** for clothing, nutrition, sunglasses, accessories, most recovery — until then Featured grids stay empty by design.
2. **expert-research Reviews** when those products publish.
3. **`genderFit` on running shoes** (and confirm Men/Women SKU strategy vs unisex entities).
4. **Regional offers** FR / BE / ZA (+ thicken UK/US/DE on new waves).
5. **Guide depth** CONTENT-001 from SiteQualityAgent.
6. **Accessories** still THIN — expand only with clear runner intent (not junk drawer).
7. **Treadmills** — treat as Fitness vertical unless Running hub explicitly wants cardio machines.

---

## Definition of done checklist (vertical)

- [x] Taxonomy discovered from content (not a hardcoded expected list only)
- [x] Catalog vs Featured vs Best distinguished
- [x] Ingestion limits audited; inappropriate search cap fixed
- [x] Category health statuses assigned
- [x] Brand gaps reported
- [x] Hubs updated (`/running` groups + `/running/gear`)
- [x] Category page configs extended beyond shoes
- [x] High-confidence gap-fill onboarded (accessories + hydration/socks/belts)
- [x] Research / manual-review / review queues documented
- [x] SiteQualityAgent run
- [x] HTTP smoke 200 on hub + gear + major categories (full visual browser QA still recommended)
- [ ] Media authenticity pass for draft catalogs (blocked on assets)

---

*Report generated for Kitletics Running vertical completeness program. Prior category reports under `reports/running-*-catalog.md` remain the per-wave detail.*
