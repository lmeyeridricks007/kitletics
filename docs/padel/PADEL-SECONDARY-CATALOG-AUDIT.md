# Padel secondary catalog audit

**Date:** 2026-09-13  
**Inventory source:** live `products` (`data/staging/padel-secondary-inventory.json`, `data/staging/padel-secondary-audit-counts.json`)  
**Padel vertical launch:** still disabled. This audit is catalog completeness, not a go-live.

This is the remaining equipment catalog (shoes, balls, bags, grips, accessories, clothing). It is **not** a published launch-core yet. Missing authentic packshots, homepage-only sources, and unverified SKUs are BLOCKED or UNKNOWN. They are not treated as complete.

Running shoes were not copied into padel. Tennis court shoes in `cat-tennis-shoes` no longer carry `sport-padel`.

---

## Headline

| Count | What it is |
| ---: | --- |
| 16 | Brands in this secondary catalog (Hesacore added for cushion grips) |
| 84 | Products across the six secondary categories |
| 0 | ProductVariants (men/women remain separate Products when the manufacturer sells distinct SKUs) |
| 35 | Published with a visually reviewed authentic unique hero |
| 49 | Draft (wrong image, missing packshot, or unverified identity) |
| 0 | Tennis or running products still leaking `sport-padel` |
| 5 | Tennis/padel **crossover** shoes (dual `sportIds` with evidence) |
| 36 | Padel-only shoes |
| 126 / 126 | Secondary-category homepage offers marked `INVALID` |
| 0 | `FIRST_HAND_TEST` ratings |
| 0 | Clothing products (category stays soft-gated) |

Launch-core floors from `PADEL-CATALOG-PLAN.md` are **credibility floors**, not SEO targets. This pass has the **shape** of several floors as catalog rows. It does **not** yet have those floors as published READY SKUs.

| Category | Floor | Catalog rows | Published + authentic unique hero | Floor met? |
| --- | ---: | ---: | ---: | --- |
| Shoes | 40+ padel-evidenced | 41 | 28 | **No** — catalog rows clear 40; published READY does not |
| Balls | 8–12 current cans | 11 | 2 | **No** — rows exist; most BLOCKED on imagery/source |
| Bags | 12–20 thermo/backpack/duffel | 13 | 3 | **No** |
| Grips | 8–15 lines | 10 | 2 | **No** |
| Accessories | 8+ typed SKUs **or stay gated** | 9 typed drafts | 0 | **Stay gated** |
| Clothing | 15+ model-level **or stay gated** | 0 | 0 | **Stay gated** |

Approximate **READY** (published + authentic unique packshot of that model + required specs + evidence row): shoes **28**, balls **2**, bags **3**, grips **2**, accessories **0**, clothing **0**.

---

## Status vocabulary

| Status | Meaning |
| --- | --- |
| **READY** | Authentic unique packshot of that model (visual review), required specs present, evidence row. Not a claim that every optional spec is filled. Weight/width omitted unless a manufacturer figure is verified. |
| **BLOCKED** | Catalog row exists, but we will not publish a hero. Typical cause: search-page og:image of a **different** product (racket, bag, t-shirt), manufacturer 403, or no packshot at all. |
| **UNKNOWN** | Something material is unverified: SKU identity, generation, source is a homepage/range/search page, or the packshot does not unambiguously match the Kitletics name. |

---

## Gates shipped in this pass

- Spec definitions for shoes (`surfaceCompatibility`, `courtOutsole`, …), balls, bags, grips, accessories `type`.
- `PUBLISH_REQUIREMENTS` for shoes / balls / bags / grips / accessories.
- Research configs for shoes / balls / bags / grips.
- Homepage offers on padel secondary product IDs are `INVALID`.
- `SOFT_GATED_CATEGORY_SLUGS` still contains `padel-accessories` and `padel-clothing`.

---

## 1. Sport leakage

**Tennis catalog:** 28 `cat-tennis-shoes` SKUs (wave26 tennis shoes + wave28 tennis shoes) no longer include `sport-padel`. Nike Vapor, Barricade 13, Gel-Challenger 15, Rush Pro 5.0 (tennis), clay Resolution 9, K-Swiss, Yonex, Mizuno, Prince T22, etc. stay tennis.

**Running shoes:** none in `cat-padel-shoes`. None of `cat-running-shoes` / `cat-training-shoes` carry `sport-padel`.

**Crossovers kept on purpose** (padel category, dual sport IDs):

| ID | Why |
| --- | --- |
| `prod-asics-gel-challenger-court` | Court shoe listed for padel and tennis hard court |
| `prod-head-revolt-pro-court` | Dual-use Revolt Pro court platform |
| `prod-asics-gel-dedicate-8-padel` | Packshot is Gel-Dedicate 8 court shoe (tennis naming on the upper) used as a padel listing |
| `prod-asics-game-ff-padel` | Game FF court platform sold into padel |
| `prod-wilson-rush-pro-5-padel` | Rush Pro Speedplate court shoe; tennis DNA, padel catalog SKU |

Padel-named SKUs (Courtquick Padel, Crazyquick, Gel-Resolution Padel, Jet Premura, Joma T.Slam / Spin, Nox AT10 Lux / HEXA, Kuikma PS 990, …) are **padel-only**.

---

## 2. Shoes

### Counts

| | n |
| ---: | --- |
| Products | 41 |
| Brands | 15 |
| Published + authentic unique hero | 28 |
| Draft | 13 |
| Evidence rows | 41 (editorial; not wear tests) |
| Required spec `surfaceCompatibility` | 41 |

Separate men/women Products when the manufacturer sells distinct SKUs (Courtquick W, Crazyquick W, Resolution Padel W, Slam Lady, Spin Lady, Sensa Women, Vertex-W). No size-run variants.

### Identity corrections (visual review)

| Product | Was | Now |
| --- | --- | --- |
| `prod-adidas-courtstabil` | CourtStabil name | **Courtquick Padel** (wave27 rename kept) |
| `prod-bullpadel-hybrid-fly` | Hybrid Fly | **Fastgear** (packshot tongue says FASTGEAR). Slug stays `bullpadel-hybrid-fly` so `/reviews/bullpadel-hybrid-fly` does not 404 |
| `prod-head-padel-pro-s` | Padel Pro S | Ball, not a shoe — see balls. Packshot is **Pro S+** |
| `prod-bullpadel-vertex-w` | — | **New** women’s Vertex-W. Packshot recovered from the mis-assigned Varlion Bourne file (Vibram + VERTEX-W) |

### BLOCKED shoes (wrong or missing hero)

Registered catalog media was **removed** where the file was not that shoe:

| ID | On-disk file showed |
| --- | --- |
| `prod-bullpadel-hack-hybrid` | Bullpadel Cloud **racket** |
| `prod-nox-at10-pro-shoe` | Nox AT10 Pro Cup Soft **racket** |
| `prod-tecnifibre-t-fight-padel` | Tecnifibre **backpack** (rehomed as a bag) |
| `prod-varlion-bourne-padel-shoe` | Bullpadel **Vertex-W** shoe |
| `prod-oxdog-hyper-court` | Joma Hyper Pro HRD **racket** |
| `prod-lok-padel-one` | LOK Generation One **t-shirt** |
| `prod-siux-comodo-woman` | Siux **t-shirt** |
| `prod-wilson-bela-pro-padel` | Wilson Bela Pro **racket** |

Identity holds (no verified shoe SKU/packshot): Siux Diablo Pro shoe (`prod-siux-diablo-pro` — Diablo Pro is a racket line), StarVie Absolute, Kuikma PS 560 Women, Adidas Solecourt Boost Padel, HEAD Revolt Court.

### READY published shoes (28)

Adidas Courtquick / Courtquick W / Crazyquick M+W; ASICS Gel-Resolution Padel M+W, Challenger Court, Dedicate 8, Game FF, Solution Swift FF2 + W; Babolat Jet Premura / Jet Premura 2 / Movea 2 / Sensa W; Joma T.Slam, Slam Lady, Spin Men / Lady; Head Revolt Pro Court, Sprint Pro 4.0 Padel; Bullpadel Fastgear, Ionic Woman, Vertex-W; Nox AT10 Lux, ML10 HEXA; Wilson Rush Pro 5 Padel; Kuikma PS 990.

Outsole class is taken from the packshot where visible (Michelin padel geometry, herringbone, omni). Weight and last width stay UNKNOWN.

---

## 3. Balls

| | n |
| ---: | --- |
| Products | 11 |
| Brands | 6 |
| Published + authentic unique can | 2 |
| Draft | 9 |

HEAD’s 2026 range is modeled as **Pro+**, **Pro S+**, **Team**, **One**. The existing seed ID `prod-head-padel-pro-s` is the **Pro S+** can (Valencia Premier Padel P1 women’s ball, extra-durability pack). There is no authentic photo of the retired Pro S can, so we did not invent a previous-generation SKU.

| ID | Status | Notes |
| --- | --- | --- |
| `prod-head-padel-pro-s` | **READY** | Packshot is HEAD Padel Pro S+ 3-can |
| `prod-kuikma-pb-speed` | **READY** | Decathlon can + ball: “Kuikma Padel Speed”, FIP mark |
| `prod-head-padel-pro-plus` | BLOCKED | Manufacturer range URL; no unique can photo yet |
| `prod-head-padel-team` | BLOCKED | Same |
| `prod-head-padel-one` | BLOCKED | Same |
| `prod-kuikma-pb-control` | UNKNOWN/BLOCKED | FIP + heat/altitude copy from Decathlon PDP; no unique packshot in this pass |
| `prod-kuikma-pb-club` | UNKNOWN | Search URL only |
| `prod-wilson-padel-premier` | UNKNOWN | Wilson padel range URL, not a can PDP |
| `prod-bullpadel-premium-gold` | UNKNOWN | Brand homepage |
| `prod-adidas-aditour-padel` | UNKNOWN | Brand homepage |
| `prod-babolat-court-padel-balls` | UNKNOWN | Brand homepage |

Dunlop omitted: no current EU padel can with a manufacturer product URL we could verify in this pass.

---

## 4. Bags

| | n |
| ---: | --- |
| Products | 13 |
| Brands | 9 |
| Published + authentic unique packshot | 3 |
| Draft | 10 |

| ID | Status | Notes |
| --- | --- | --- |
| `prod-nox-at10-team-bag` | **READY** | noxsport.com PDP; 42 L, 3+2 thermo, shoe vent, 600×300×270 mm |
| `prod-babolat-rh-pro-padel` | **READY** | babolat.com RH Pro; 62 L, 4 rackets, insulated pocket |
| `prod-tecnifibre-tour-endurance-backpack` | **READY** | Unique Tecnifibre backpack packshot recovered from the Wall Shooter **shoe** mix-up. Racket count UNKNOWN |
| `prod-nox-bag-10` | BLOCKED | Seed Thermo Bag 10; SVG only; collection URL |
| `prod-bullpadel-vertex-backpack` | BLOCKED | Tennispro 403 on fetch; specs from retailer copy kept as UNKNOWN until a packshot exists |
| Others (Adidas Protour, HEAD Tour Team / Elite, Wilson Super Tour, Kuikma paletero, Nox Pro Series, Siux, Babolat Court backpack) | UNKNOWN | Brand/collection/search URLs |

---

## 5. Grips

| | n |
| ---: | --- |
| Products | 10 |
| Brands | 8 |
| Published + authentic unique packshot | 2 |
| Draft | 8 |

| ID | Status | Notes |
| --- | --- | --- |
| `prod-wilson-overgrip` | **READY** | Wilson Padel Pro Overgrip 3-pack (padel-length Pro wrap) |
| `prod-bullpadel-gb1200` | **READY** | Packshot is **HaC Comfort** 3-pack, not a GB1200 blister. Name corrected; ID kept |
| Replacement grips (HEAD Hydrosorb, Babolat Syntec Pro) | UNKNOWN | Distinct from overgrips; no PDP packshot |
| `prod-hesacore-padel` | UNKNOWN | Cushion type; hesacore.com; no medical claims |
| Nox Pro, HEAD Xtreme Soft, Babolat Pro Response, Kuikma, Adidas | UNKNOWN | Collection/brand URLs |

---

## 6. Accessories

| | n |
| ---: | --- |
| Typed products | 9 |
| Published | 0 |

Types present: `protector` (Bullpadel, Nox), `pressurizer` (Pascal Box 3B, HEAD X3), `wristband` (HEAD, Wilson, Nox, Bullpadel), `other` (HEAD Smartsorb dampener).

No junk category URLs (`/padel/protectors`, etc.). Fetch of protector packshots 403’d. **Category stays soft-gated** until 8 published typed SKUs with authentic unique heroes exist.

---

## 7. Clothing

Zero products. Soft-gated. We did not create thin apparel SKUs for SEO. A Siux t-shirt packshot that landed on the Comodo Woman **shoe** was unregistered, not turned into a clothing PDP.

---

## 8. Images + sources

| Registry | Entries |
| --- | ---: |
| `PADEL_SECONDARY_PRODUCT_MEDIA` | 6 (Vertex-W, Tecnifibre backpack, Kuikma Speed, Nox AT10 Team, Babolat RH Pro, Bullpadel HaC) |
| Wrong CATALOG shoe entries removed | 8 |

Rules applied (same as rackets):

- One unique packshot per published product; no hero stamp; no AI branded products.
- Search-page og:images that showed a racket, bag, or t-shirt were unregistered.
- Manufacturer PDPs preferred (noxsport.com, babolat.com, Decathlon CDN). Specialist listings used only after visual match (Zona de Padel HaC blister).

---

## 9. Brand / category / readiness rollup

| Category | Products | Brands | Published | Draft | Authentic unique hero | Evidence rows | Soft-gated? |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Padel shoes | 41 | 15 | 28 | 13 | 28 | 41 | No |
| Padel balls | 11 | 6 | 2 | 9 | 2 | 11 | No |
| Padel bags | 13 | 9 | 3 | 10 | 3 | 13 | No |
| Grips / overgrips | 10 | 8 | 2 | 8 | 2 | 10 | No |
| Accessories | 9 | 4 | 0 | 9 | 0 | 9 | **Yes** |
| Clothing | 0 | 0 | 0 | 0 | 0 | 0 | **Yes** |
| **Total** | **84** | **16 unique** | **35** | **49** | **35** | **84** | |

Unique brands across the secondary catalog: Adidas Padel, ASICS, Babolat, Bullpadel, Head, Hesacore, Joma, Kuikma, Lok, Nox, Oxdog, Siux, StarVie, Tecnifibre Padel, Varlion, Wilson.

---

## 10. What is not done

- 40 **published** padel-evidenced shoes with authentic unique heroes.
- 8–12 **published** current ball cans.
- 12–20 **published** bags.
- 8–15 **published** grip lines.
- Accessory/clothing floors — correctly left gated rather than fake-published.
- Real product-page Offers (NL first). Homepage URLs are invalid, not live prices.
- Shoe ProductVariant size runs — documented as separate men/women Products instead.
- Padel vertical `verticalLaunchStrategy` remains **disabled**.
