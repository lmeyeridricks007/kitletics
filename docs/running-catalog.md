# Running Catalog (Prompt 14)

This document describes the 2026 Running product catalog: categories, brands, lifecycle, specifications, media, offers, recommendations, and QA.

## Categories populated

| Category | Path | Notes |
|---|---|---|
| Running Shoes | `/running/shoes` | Deepest category — daily, max cushion, tempo, race, carbon, stability, trail, zero-drop |
| GPS Watches | `/running/watches` | Garmin / COROS / Polar / Suunto / Apple |
| Heart Rate Monitors | `/running/heart-rate-monitors` | Chest + arm optical |
| Hydration | `/running/hydration` | Handhelds + soft flasks; vests live primarily under Packs (shared Product IDs) |
| Running Packs & Vests | `/running/packs` | Race/hydration vests (shared), backpacks, fastpacking, quivers, pouches |
| Running Belts | `/running/belts` | Phone / race / hydration belts (shared entities, multi-subcategory) |
| Running Clothing | `/running/clothing` | Shorts, tops, jackets (model-level, not every SKU) |
| Running Socks | `/running/socks` | Performance socks |
| Headphones | `/running/headphones` | Open-ear, bone conduction, TWS, ear-hook |
| Sunglasses | `/running/sunglasses` | Performance wrap, shield, photochromic, value |
| Running Lights | `/running/lights` | Headlamps, waist/hybrid, high-output |
| Safety Gear | `/running/safety` | Clip lights, reflective, visibility vests, personal alarms |
| Recovery | `/running/recovery` | Foam rollers, massage guns/balls, compression boots, recovery sandals, compression garments, mobility tools |
| Accessories | `/running/accessories` | Buffs, anti-chafe, sleeves |
| Nutrition & Fuel | `/running/nutrition` | Gels, chews, bars, sports drinks, electrolyte & carb mixes, tablets, race fuel |

### Hydration IA

```text
Running Hydration
├── Handheld Bottles
├── Soft Flasks
├── Reservoirs / Bladders
└── (Vests → Packs & Vests; same Product entities — no duplicate SKUs)
```

### Packs, Vests & Carry IA

```text
Running Packs & Vests
├── Hydration Vests     ← shared with Hydration decision guides
├── Race Vests          ← dual-tag on same Product IDs
├── Running Backpacks
├── Fastpacking Packs
├── Pole Quivers
└── Accessory Pouches

Running Belts
├── Phone / Essentials Belts
├── Race Belts
└── Hydration Belts
```

Best guides: hydration vests / trail / ultra + **Best Running Packs** (backpacks/fastpacks only). Do not clone “Best Running Vests” or “Best Ultra Vests”.

### Headphones / Sunglasses / Lights / Safety IA

```text
Running Headphones
├── Open-Ear
├── Bone Conduction
├── True Wireless
└── Ear-Hook

Running Sunglasses
├── Performance Wrap
├── Shield / Race
├── Photochromic
└── Everyday / Value

Running Lights
├── Headlamps
├── Waist / Hybrid
└── High-Output

Safety / Visibility
├── Clip Lights
├── Wearable Lights
├── Reflective Gear
├── Visibility Vests
└── Personal Alarms (legal only — no weapons)
```

Reports: `reports/running-headphones-catalog.md`, `running-sunglasses-catalog.md`, `running-headlamps-catalog.md`, `running-safety-catalog.md`.

### Clothing IA

```text
Running Clothing
├── Shorts
├── Tights
├── Tops
├── Jackets
├── Vests / Base layers / Caps / Gloves (taxonomy ready)
```

## Brands

Core + Prompt 14 brands live in `src/content/brands.ts` and `src/content/running/brands.ts`.

Official presentation (single Brand entity):

- **HOKA** (not “Hoka”)
- **ASICS** (not “Asics”)
- **COROS**

## Source strategy

Evidence priority:

1. Manufacturer product pages / tech sheets  
2. Manufacturer documentation  
3. Major reputable retailers (secondary)  
4. Independent professional reviews  
5. Lab / independent testing  

Do **not** treat low-quality SEO affiliate pages as primary fact sources.

Store provenance via `Evidence` (`verifiedAt`, optional `sourceUrl`). Important numeric claims should link Evidence on the Product.

## Product lifecycle

Every Product has `lifecycleStatus`:

| Status | Meaning |
|---|---|
| `upcoming` | Announced / not yet recommendable in standard tools |
| `current` | Current generation meaningfully sold |
| `previous-generation` | Prior gen still useful for value / comparisons |
| `discontinued` | No longer sold; keep for history / upgrade paths |

Do not infer status from editorial publish dates alone.

When a model is replaced: set previous to `previous-generation`, add successor — **do not delete**.

## Specification conventions

- Prefer manufacturer values; never average conflicting sources.
- Weight: store manufacturer reference with unit `g`; leave `null` when unverified.
- Stack/drop: store independently; flag arithmetic inconsistency in QA — do not silently “fix”.
- Plate: `none` \| `nylon` \| `carbon` \| `composite` — do not mark carbon for nylon rods.
- Race legality: only when verified Evidence exists.
- Width options: official widths only — not subjective “runs wide”.

### Controlled classifications (shoes)

| Field | Allowed values |
|---|---|
| `cushionLevel` | minimal, low, medium, high, maximum |
| `cushionFeel` | firm, balanced, soft, plush |
| `stability` | neutral, mild-stability, stability, maximum-stability |
| `rideCharacter` | smooth, rockered, responsive, protective |
| `terrain` | road, track, trail, treadmill, mixed |

Editorial prose may use richer language; enums stay controlled.

## Classification methodology

- **maximum cushion**: Bondi / Nimbus-class stack and plush intent  
- **high**: Novablast / Glycerin-class soft daily  
- **medium**: Pegasus-class versatile daily  
- **stability**: dedicated guidance (Kayano, Adrenaline GTS, Structure)  
- Do not score from marketing slogans (“most responsive ever” ≠ 100)

## Image policy

1. Official manufacturer images when usage is valid  
2. Retailer assets when licensing allows  
3. Kitletics-owned test photos  
4. **Intentional branded SVG fallbacks** in `/public/images/catalog/fallbacks/`  

Fallbacks must never imply a real product photograph (`attribution` states placeholder).

Use `categoryFallbackImage(categoryId, productId, alt)` from `src/content/running/media.ts`.

## Offer policy

- Offers are separate from Product MSRP/content.  
- Populate only when retailer URL is real.  
- `affiliateUrl` only when affiliate routing is configured — never fabricate.  
- Always set `lastChecked`.  
- Availability: `in-stock` \| `out-of-stock` \| `preorder` \| `unknown` — never assume in-stock from URL alone.  
- Missing price ≠ €0.

## Recommendation scoring

- Context-specific `Recommendation` records with weighted factors.  
- Missing context is OK — Finder/Rotation already handle unknown.  
- Do not cluster all scores in 85–95.  
- Affiliate commission never influences scores.  
- No fake personal-test Evidence.

## Catalog QA

```bash
npm run catalog:qa
npm run content:validate
```

`canPublishProduct` (`src/domain/catalog/publishability.ts`) applies **category-specific** minimums (e.g. watches do not require `drop`).

Completeness tiers (internal): `complete` \| `usable` \| `partial` \| `insufficient`.

## How to add a new Product

1. Research manufacturer page → confirm lifecycle.  
2. Check brand / family / slug uniqueness (`brand-model`).  
3. Add Product under `src/content/running/products/` (or extend an existing wave file).  
4. Specs: only verified values; else `null`.  
5. Attach Evidence + intentional hero media (or fallback).  
6. Optional: Recommendation contexts, alternatives, Offers.  
7. Update `ProductFamily.productIds` if needed.  
8. Run `npm run content:validate` and `npm run catalog:qa`.  

Staging candidates may live in `data/staging/` — never publish incomplete staging records.

## Gender / variants

Prefer one Product + Variants for size/color/width SKUs. Separate Products only when men’s/women’s construction or stack/weight differ meaningfully.

## Nutrition boundary

Nutrition & Fuel (`cat-nutrition`) is populated as sports-product decision content: factual label fields (carbs, caffeine mg, sodium, serving size, form, allergens only when source-provided). No medical treatment advice, deficiency diagnosis, or unsupported health claims. Recommendations stay on format, carbohydrate delivery, caffeine preference, carry, texture, race practicality, and value.

Reports: `reports/running-fuel-catalog.md`.

## Research backlog

See `data/staging/research-backlog.md`.
