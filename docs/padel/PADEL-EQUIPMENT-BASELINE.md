# Padel equipment baseline (balls / bags / grips / accessories)

**Date:** 2026-09-13  
**Scope:** Existing catalog records only — no expansion, no rewrites.  
**Live merge:** `src/content/padel/index.ts` → `padelAllProducts`  
**Primary sources:** `src/content/padel/soft-goods/{balls,bags,grips,accessories}.ts` (+ patches on three seed IDs)  
**Cross-checks:** `data/staging/padel-secondary-inventory.json`, `docs/padel/data/PADEL-URL-INVENTORY.csv`, `src/domain/catalog/publishability.ts`, media gate in `src/content/running/products/media-publish-gate.ts`

This baseline classifies **every** existing soft-goods SKU before any expansion pass. Shoes and clothing are out of scope here (clothing = 0 products, soft-gated).

---

## Classification vocabulary

| Class | Meaning (exactly one per product) |
| --- | --- |
| **CURRENT_VALID** | Published, authentic unique hero, useful shortDescription, identifiable current SKU |
| **CURRENT_INCOMPLETE** | Clear current SKU, material gaps beyond media alone (unused in this pass) |
| **DUPLICATE** | Same commercial SKU twice (none found — seed IDs are patched, not duplicated) |
| **WRONG_CATEGORY** | Belongs in another category (none) |
| **STALE** | Historical / likely retired naming without a verified current PDP |
| **DISCONTINUED** | Explicit discontinued lifecycle (none — all `lifecycleStatus: current`) |
| **INSUFFICIENT_EVIDENCE** | Homepage / collection / search URL; identity or critical specs unverified |
| **BAD_MEDIA** | Identity usable enough to keep, but publish blocked by SVG / missing authentic packshot |
| **BLOCKED_OTHER** | Non-media gate at product level (none; soft-gate is category-level for accessories) |

**Ready** in summary tables = `status: published` with authentic unique hero (same bar as secondary audit READY).  
**Indexable** = disposition from `docs/padel/data/PADEL-URL-INVENTORY.csv` (`INDEXABLE` only).

---

## 1. Summary table

| Category | Total | Ready (published + authentic hero) | Indexable PDPs | Soft-gated category? | Launch-core floor |
| --- | ---: | ---: | ---: | --- | ---: |
| Balls (`cat-padel-balls`) | 11 | 2 | 2 | No | 8–12 published |
| Bags (`cat-padel-bags`) | 13 | 3 | 2 | No | 12–20 published |
| Grips (`cat-padel-grips`) | 10 | 2 | 1 | No | 8–15 published |
| Accessories (`cat-padel-accessories`) | 9 | 0 | 0 | **Yes** (`padel-accessories`) | 8+ published **or stay gated** |
| **Total** | **43** | **7** | **5** | | |

**Indexable PDPs (5):** `head-padel-pro-s-balls`, `kuikma-pb-speed`, `nox-at10-team-paletero`, `tecnifibre-tour-endurance-padel-backpack`, `wilson-padel-overgrip-pack`.

**Published but PUBLIC_NOINDEX (2):** `babolat-rh-pro-padel`, `bullpadel-hac-overgrip` — decision-score gaps (`missing:alternatives|canCompare|canBuy`).

**Classification rollup (43):**

| Class | n |
| --- | ---: |
| CURRENT_VALID | 7 |
| BAD_MEDIA | 9 |
| INSUFFICIENT_EVIDENCE | 26 |
| STALE | 1 |
| CURRENT_INCOMPLETE / DUPLICATE / WRONG_CATEGORY / DISCONTINUED / BLOCKED_OTHER | 0 |

---

## 2. Source map (where records live)

| Layer | Role |
| --- | --- |
| `src/content/padel/soft-goods/balls.ts` | 11 ball drafts (1 `existing` patch) |
| `src/content/padel/soft-goods/bags.ts` | 13 bag drafts (1 `existing` patch) |
| `src/content/padel/soft-goods/grips.ts` | 10 grip drafts (1 `existing` patch) |
| `src/content/padel/soft-goods/accessories.ts` | 9 accessory drafts (all new inserts) |
| `src/content/padel/soft-goods/build.ts` | Product/patch builders; category SVG placeholders |
| `src/content/padel/soft-goods/product-media.ts` | Secondary authentic heroes (subset) |
| `src/content/padel/soft-goods/index.ts` | Merge + `applyMediaPublishGate` on **all** soft-goods IDs |
| `src/content/padel/seed.ts` | Categories + seed SKUs `prod-head-padel-pro-s`, `prod-wilson-overgrip`, `prod-nox-bag-10` + homepage NL offers |
| `src/content/padel/wave26.ts` | Sport-only patches for the three seed soft SKUs (no extra soft products) |
| `src/content/padel/wave25.ts` / `wave27.ts` / `wave28-shoes.ts` | **No** balls/bags/grips/accessories products |
| `src/content/catalog-product-media.ts` | Heroes for `prod-head-padel-pro-s`, `prod-wilson-overgrip` (+ secondary merge) |
| `PUBLISH_REQUIREMENTS` | Spec keys: balls `use|pressurization|packSize`; bags `form`; grips `gripType`; accessories `type` |

**Seed → soft-goods patches (`existing: true`):** not duplicates — same IDs enriched in soft-goods drafts.

| Seed ID | Soft draft | Notes |
| --- | --- | --- |
| `prod-head-padel-pro-s` | Pro S+ rename + specs | Authentic hero in CATALOG_PRODUCT_MEDIA |
| `prod-wilson-overgrip` | Pro Padel Overgrip | Authentic hero in CATALOG_PRODUCT_MEDIA |
| `prod-nox-bag-10` | Thermo Bag 10 | Explicit seed `status: draft`; still SVG |

---

## 3. Per-category inventory

### 3.1 Balls (11) — `src/content/padel/soft-goods/balls.ts`

Brands: Head, Kuikma, Wilson, Bullpadel, Adidas Padel, Babolat (6).

| Classification | id | slug | name | brand | lifecycle | status | Authentic media | NL offer | Useful copy | Indexable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_VALID | `prod-head-padel-pro-s` | `head-padel-pro-s-balls` | Padel Pro S+ | Head | current | published | yes `/images/padel/products/head-padel-pro-s-hero.jpg` | shallow homepage `offer-balls-nl` → decathlon.nl/ | short+verdict | INDEXABLE |
| CURRENT_VALID | `prod-kuikma-pb-speed` | `kuikma-pb-speed` | Padel Speed | Kuikma | current | published | yes `/images/padel/products/kuikma-pb-speed-hero.jpg` | none | short+verdict | INDEXABLE |
| BAD_MEDIA | `prod-head-padel-pro-plus` | `head-padel-pro-plus` | Padel Pro+ | Head | current | draft | no (balls.svg) | none | short+verdict | HIDDEN_404 |
| BAD_MEDIA | `prod-head-padel-team` | `head-padel-team` | Padel Team | Head | current | draft | no | none | short+verdict | HIDDEN_404 |
| BAD_MEDIA | `prod-head-padel-one` | `head-padel-one` | Padel One | Head | current | draft | no | none | short+verdict | HIDDEN_404 |
| BAD_MEDIA | `prod-kuikma-pb-control` | `kuikma-pb-control` | PB Control | Kuikma | current | draft | no | none | short+verdict | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-kuikma-pb-club` | `kuikma-pb-club` | PB Club | Kuikma | current | draft | no | none | short+verdict; **search URL** | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-wilson-padel-premier` | `wilson-padel-premier` | Padel Premier | Wilson | current | draft | no | none | short+verdict; speed UNKNOWN | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-bullpadel-premium-gold` | `bullpadel-premium-gold` | Premium Gold | Bullpadel | current | draft | no | none | short only; brand homepage | HIDDEN_404 |
| STALE | `prod-adidas-aditour-padel` | `adidas-aditour-padel-balls` | Aditour | Adidas Padel | current† | draft | no | none | short only; “historically sold” | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-babolat-court-padel-balls` | `babolat-court-padel-balls` | Court Padel | Babolat | current | draft | no | none | short only; brand homepage | HIDDEN_404 |

† Lifecycle field says `current`; classification **STALE** reflects evidence quality, not the enum.

**Publish blockers (drafts):** media publish gate (no registered hero) → forced `draft`. Soft `canPublishProduct` still passes because SVG placeholders satisfy `requireHeroImage`.

**Market gaps vs floor:** need ~6–10 more **published** current cans (Dunlop / tournament cans called out in catalog plan; Wilson/Bullpadel/Adidas/Babolat need real PDPs + packshots).

---

### 3.2 Bags (13) — `src/content/padel/soft-goods/bags.ts`

Brands: Nox, Babolat, Bullpadel, Tecnifibre Padel, Adidas Padel, Head, Wilson, Kuikma, Siux (9).

| Classification | id | slug | name | brand | lifecycle | status | Authentic media | NL offer | Useful copy | Indexable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_VALID | `prod-nox-at10-team-bag` | `nox-at10-team-paletero` | AT10 Team Paletero | Nox | current | published | yes `nox-at10-team-paletero-hero.jpg` | none | short+verdict | INDEXABLE |
| CURRENT_VALID | `prod-babolat-rh-pro-padel` | `babolat-rh-pro-padel` | RH Pro Padel | Babolat | current | published | yes `babolat-rh-pro-padel-hero.jpg` | none | short+verdict | PUBLIC_NOINDEX |
| CURRENT_VALID | `prod-tecnifibre-tour-endurance-backpack` | `tecnifibre-tour-endurance-padel-backpack` | Tour Endurance Backpack | Tecnifibre | current | published | yes `tecnifibre-wall-shooter-hero.jpg`‡ | none | short+verdict | INDEXABLE |
| BAD_MEDIA | `prod-bullpadel-vertex-backpack` | `bullpadel-vertex-geo-backpack` | Vertex Geo Backpack | Bullpadel | current | draft | no (bag.svg) | none | short+verdict; retailer specs | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-nox-bag-10` | `nox-thermo-bag-10` | Thermo Bag 10 | Nox | current | draft | no | shallow `offer-bag-nl` → amazon.nl/ | short only; collection URL | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-babolat-court-backpack` | `babolat-court-backpack` | Court Backpack | Babolat | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-adidas-protour-padel` | `adidas-protour-padel-bag` | Protour 3.4 | Adidas Padel | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-tour-team-padel` | `head-tour-team-padel-bag` | Tour Team Padel | Head | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-elite-backpack` | `head-elite-padel-backpack` | Elite Backpack | Head | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-wilson-super-tour-padel` | `wilson-super-tour-padel-bag` | Super Tour Padel | Wilson | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-kuikma-paletero` | `kuikma-padel-paletero` | Kuikma Paletero | Kuikma | current | draft | no | none | short; search URL | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-nox-pro-series-bag` | `nox-pro-series-padel-bag` | Pro Series Bag | Nox | current | draft | no | none | short; collection URL | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-siux-paletero` | `siux-padel-paletero` | Siux Paletero | Siux | current | draft | no | none | short only | HIDDEN_404 |

‡ Packshot is the authentic Tecnifibre backpack recovered from a shoe mis-assignment; filename still says `wall-shooter`. Racket capacity remains UNKNOWN.

**Market gaps:** need more published thermos / backpacks / duffels with capacity + thermo/shoe specs; StarVie / Adidas Protour / HEAD Tour Team families are shell rows only.

---

### 3.3 Grips (10) — `src/content/padel/soft-goods/grips.ts`

Brands: Wilson, Bullpadel, Nox, Head, Babolat, Kuikma, Hesacore, Adidas Padel (8). Soft brand add: `brand-hesacore` in `soft-goods/brands.ts`.

| Classification | id | slug | name | brand | lifecycle | status | Authentic media | NL offer | Useful copy | Indexable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| CURRENT_VALID | `prod-wilson-overgrip` | `wilson-padel-overgrip-pack` | Pro Padel Overgrip | Wilson | current | published | yes `wilson-padel-overgrip-hero.jpg` | shallow `offer-grips-nl` → amazon.nl/ | short+verdict | INDEXABLE |
| CURRENT_VALID | `prod-bullpadel-gb1200` | `bullpadel-hac-overgrip` | HaC | Bullpadel | current | published | yes `bullpadel-hac-overgrip-hero.jpg` | none | short+verdict | PUBLIC_NOINDEX |
| BAD_MEDIA | `prod-hesacore-padel` | `hesacore-padel-grip` | Hesacore | Hesacore | current | draft | no (grips.svg) | none | short+verdict; cushion type | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-nox-pro-overgrip` | `nox-pro-overgrip` | Pro Overgrip | Nox | current | draft | no | none | short; collection URL | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-xtreme-soft` | `head-xtreme-soft-overgrip` | Xtreme Soft | Head | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-babolat-pro-response` | `babolat-pro-response-overgrip` | Pro Response | Babolat | current | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-kuikma-overgrip` | `kuikma-padel-overgrip` | Kuikma Overgrip | Kuikma | current | draft | no | none | short; search URL | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-hydrosorb` | `head-hydrosorb-replacement-grip` | Hydrosorb | Head | current | draft | no | none | short; replacement type | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-babolat-syntec-pro` | `babolat-syntec-pro-replacement-grip` | Syntec Pro | Babolat | current | draft | no | none | short; replacement type | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-adidas-padel-overgrip` | `adidas-padel-overgrip` | Adidas Padel Overgrip | Adidas Padel | current | draft | no | none | short only | HIDDEN_404 |

**Identity note (not DUPLICATE):** ID `prod-bullpadel-gb1200` / packshot HaC Comfort — name corrected to HaC; keep single row.

**Market gaps:** more published overgrips + at least one published replacement grip; Hesacore needs hero before awards.

---

### 3.4 Accessories (9) — `src/content/padel/soft-goods/accessories.ts`

Brands: Bullpadel, Nox, Head, Wilson (4). Types: protector×2, pressurizer×2, wristband×4, other×1 (Smartsorb).

| Classification | id | slug | name | brand | type | status | Authentic media | NL offer | Useful copy | Indexable |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| BAD_MEDIA | `prod-bullpadel-frame-protector` | `bullpadel-frame-protector-3-pack` | Frame Protector | Bullpadel | protector | draft | no (accessory.svg) | none | short; specialist PDP | HIDDEN_404 |
| BAD_MEDIA | `prod-nox-frame-protector` | `nox-transparent-frame-protector` | Transparent Protector | Nox | protector | draft | no | none | short; specialist PDP | HIDDEN_404 |
| BAD_MEDIA | `prod-head-smartsorb` | `head-smartsorb` | Smartsorb | Head | other | draft | no | none | short; Total Padel PDP | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-bullpadel-pascal-box` | `bullpadel-pascal-box-3b` | Pascal Box 3B | Bullpadel | pressurizer | draft | no | none | short; brand homepage | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-x3-pressurizer` | `head-x3-ball-pressurizer` | X3 Pressurizer | Head | pressurizer | draft | no | none | short; brand homepage | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-head-wristband` | `head-padel-wristband` | HEAD Wristband | Head | wristband | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-wilson-wristband` | `wilson-padel-wristband` | Wilson Wristband | Wilson | wristband | draft | no | none | short only | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-nox-wristband` | `nox-padel-wristband` | Nox Wristband | Nox | wristband | draft | no | none | short; collection | HIDDEN_404 |
| INSUFFICIENT_EVIDENCE | `prod-bullpadel-wristband` | `bullpadel-padel-wristband` | Bullpadel Wristband | Bullpadel | wristband | draft | no | none | short only | HIDDEN_404 |

All lifecycle `current`. Category remains soft-gated until ≥8 published typed SKUs with authentic heroes.

---

## 4. Media / commerce / copy gaps

### Media

| Registry | Soft-goods coverage |
| --- | --- |
| `CATALOG_PRODUCT_MEDIA` | `prod-head-padel-pro-s`, `prod-wilson-overgrip` |
| `PADEL_SECONDARY_PRODUCT_MEDIA` | `prod-kuikma-pb-speed`, `prod-nox-at10-team-bag`, `prod-babolat-rh-pro-padel`, `prod-bullpadel-gb1200`, `prod-tecnifibre-tour-endurance-backpack` (+ shoe Vertex-W out of scope) |
| Placeholder SVGs | All other soft-goods heroes |

**36 / 43** soft-goods rows lack authentic unique packshots.

Orphan on disk (not wired as current hero registry for these IDs): `public/images/padel/products/bullpadel-gb1200-overgrip-hero.jpg` (HaC path is the live one).

### Commerce

| Fact | Detail |
| --- | --- |
| Soft-goods `offerIds` | Only seed trio: balls / grips / bag NL offers |
| Offer URLs | All three are **retailer homepages** (Decathlon NL / Amazon NL), not product listings |
| Validation | `LIKELY_VALID` with shallow/homepage identity notes — not listing-proven |
| New soft SKUs | `offerIds: []` — no NL (or any) commerce rows |
| Homepage INVALID sweep | Secondary audit: 126 homepage offers marked INVALID across secondary catalog; soft-goods seed offers remain shallow |

**Top commerce blocker:** almost no real product-page Offers; the three NL offers do not prove SKU identity.

### Copy

| Gap | Count (approx.) |
| --- | --- |
| Missing `verdict` | Most draft bags / grips / accessories (~28) |
| Thin identity copy acknowledging homepage/search | Wilson Premier, Bullpadel Premium Gold, Aditour, most bag shells, wristbands |
| Strong short+verdict among CURRENT_VALID | 7/7 |

### Publishability gate nuance

`canPublishProduct()` returns **ok** for drafts with SVG heroes (placeholder counts as image). Production exposure is controlled by **`applyMediaPublishGate`** + soft-goods pending set (all soft IDs) → draft until registered authentic hero.

---

## 5. Soft-gate / route status

| Route | Category slug | Soft-gated? | Observed behaviour |
| --- | --- | --- | --- |
| `/padel/accessories` | `padel-accessories` | **Yes** (`SOFT_GATED_CATEGORY_SLUGS`) | **404** (prelaunch crawl / inventory) |
| `/padel/clothing` | `padel-clothing` | **Yes** | **404**; **0 products** |
| `/padel/balls` | `padel-balls` | No | 200 category page |
| `/padel/bags` | `padel-bags` | No | 200 |
| `/padel/grips` | `padel-grips` | No | 200 |

Code: `src/lib/navigation/category-href.ts` (`SOFT_GATED_CATEGORY_SLUGS`).

Category indexability in `PADEL-URL-INVENTORY.csv` also carries `padel_vertical_not_indexable` on sport hubs while vertical launch is held — separate from soft-gate 404s.

Draft soft PDPs → `HIDDEN_404` / `not_production_exposed:draft`. Brand hub `/brands/hesacore` → `HIDDEN_404` (`brand_hub_no_products`) while Hesacore product is draft.

---

## 6. Existing editorial estate

### Best guides

| Guide | Path / id | Category | Notes |
| --- | --- | --- | --- |
| Best Padel Overgrips | `/best/padel-overgrips` · `best-padel-overgrips` | grips | Awards Wilson + Bullpadel HaC only; Hesacore/Nox rejected |
| Best Padel Bags | `/best/padel-bags` · `best-padel-bags` | bags | Awards AT10 Team, RH Pro, Tour Endurance |
| Best Padel Balls | — | — | **Missing** |
| Best Padel Accessories | — | — | **Missing** (correct while gated) |

Source: `src/content/padel/best-guides/accessories.ts` via `best-guides/index.ts`.

### Buying guides

| id | Topic |
| --- | --- |
| `guide-how-long-padel-balls-last` | Ball longevity |
| `guide-choose-padel-balls` | Choosing balls |
| `guide-choose-padel-bag` | Choosing bags |
| `guide-padel-grips` | Grips & overgrips explained |
| `guide-padel-grip-vs-overgrip` | Replacement vs overgrip |
| `guide-how-often-replace-padel-overgrip` | Replacement cadence |

Source: `src/content/padel/buying-guides/index.ts`. No accessory-specific buying guide.

### Reviews

| Review | Product | Disposition |
| --- | --- | --- |
| `review-wilson-overgrip` → `/reviews/wilson-padel-overgrip-pack` | `prod-wilson-overgrip` | INDEXABLE |
| `review-hesacore-padel` → `/reviews/hesacore-padel-grip` | `prod-hesacore-padel` | HIDDEN (`vertical_hold` / draft product) |

Source: `src/content/padel/reviews/accessories.ts`. No ball / bag / protector / pressurizer reviews.

### Sport hub

`src/lib/sport-hub/config.ts` surfaces balls / bags / grips category cards; accessories stay out of live nav while soft-gated.

---

## 7. Recommended keep / fix / drop (for expansion pass)

**Do not invent products in this pass.** Recommendations only.

### KEEP (CURRENT_VALID — polish only)

| ID | Action |
| --- | --- |
| `prod-head-padel-pro-s` | Keep; replace shallow Decathlon homepage offer with listing URL |
| `prod-kuikma-pb-speed` | Keep; add NL/DE listing offer |
| `prod-nox-at10-team-bag` | Keep; add offer |
| `prod-babolat-rh-pro-padel` | Keep; close alternatives/canBuy so PDP can leave PUBLIC_NOINDEX |
| `prod-tecnifibre-tour-endurance-backpack` | Keep; pin manufacturer PDP + racket capacity; optionally rename media file |
| `prod-wilson-overgrip` | Keep; replace Amazon homepage offer with listing |
| `prod-bullpadel-gb1200` | Keep HaC identity; close decision-score gaps |

### FIX (high leverage before new SKUs)

| Priority | IDs | Fix |
| --- | --- | --- |
| P0 media | HEAD Pro+, Team, One; Kuikma PB Control; Vertex Geo backpack; Hesacore; Bullpadel/Nox protectors; Smartsorb | Unique authentic packshot + register in media map |
| P0 source | Same set | Capture model-specific manufacturer or NL/EU PDP URLs |
| P0 commerce | All CURRENT_VALID + fixed drafts | Real product listing Offers (NL first) |
| P1 copy | Draft bags/grips/accessories missing verdicts | Add verdict only after PDP+media exist |
| P1 decision graph | RH Pro, HaC | alternatives / canCompare / canBuy |

### HOLD / VERIFY (INSUFFICIENT_EVIDENCE — do not publish as-is)

Shell rows with brand/collection/search URLs only: Wilson Premier, Bullpadel Premium Gold, Babolat Court balls, most bag shells (Court backpack, Protour, Tour Team, Elite, Super Tour, Kuikma paletero, Nox Pro Series, Siux), thin grip shells (Nox Pro, Xtreme Soft, Pro Response, Kuikma, Hydrosorb, Syntec Pro, Adidas overgrip), pressurizers + wristbands, Thermo Bag 10.

**Expansion rule:** promote only when a **current** EU PDP + unique packshot exist. Otherwise leave draft or drop in a later cleanup.

### DROP / DEMOTE candidates (after verification — not deleted here)

| ID | Why |
| --- | --- |
| `prod-adidas-aditour-padel` | STALE — historical Aditour naming; no verified current can |
| `prod-nox-bag-10` | Unverifiable “Thermo Bag 10” vs live AT10 Team; collection-only |
| Generic wristband quartet | Low commercial differentiation until model-level PDPs exist; category stays gated |

### Market gaps (commercially meaningful — research next, do not invent now)

From `PADEL-CATALOG-PLAN.md` and this inventory:

- **Balls:** Dunlop / other tournament cans; publish HEAD Pro+/Team/One + Kuikma Control; verify Wilson/Bullpadel/Babolat current cans  
- **Bags:** more 6–12 racket thermos; StarVie / Adidas / HEAD with real specs  
- **Grips:** published replacement grips; additional absorbent/tack overgrips with packshots  
- **Accessories:** only after protectors + pressurizers publish with heroes — then consider ungating  
- **Clothing:** stay gated at 0  

**Credibility floors unmet:** balls 2/8–12 ready, bags 3/12–20, grips 2/8–15, accessories 0/8 (correctly gated).

---

## 8. Brands covered (soft-goods only)

Adidas Padel, Babolat, Bullpadel, Head, Hesacore, Kuikma, Nox, Siux, Tecnifibre Padel, Wilson — **10 brands**.

Not present as soft-goods SKUs (despite racket/shoe presence): StarVie, Varlion, Oxdog, Lok, ASICS, Joma, Dunlop, Drop Shot, etc.

---

## 9. Definition of done for expansion (out of scope here)

An expansion pass may add products only after:

1. This baseline is accepted  
2. Each new SKU has manufacturer/specialist PDP + authentic unique packshot  
3. Required specs filled without inventing UNKNOWN as facts  
4. Prefer NL listing Offer or honest “no verified local price”  
5. Accessories/clothing stay gated until floors are honest  

---

*Generated from live catalog merge + URL inventory; no catalog mutations.*
