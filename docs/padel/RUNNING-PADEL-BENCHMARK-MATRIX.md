# Running ↔ Padel Benchmark Matrix

**As of:** 2026-09-14  
**Mode:** READ-ONLY forensic reverse-engineering  
**Benchmark:** Running Shoes as implemented in this repo and on kitletics.com  
**Rule:** Do not invent a new standard — document what Running actually does.

---

## 1. Shared platform spine

| Concern | Running | Padel |
|---|---|---|
| Hub route | `src/app/[sport]/page.tsx` → declarative hub | Same |
| Hub data | `getSportHubData` + `runningSportHubConfig` | Same + `padelSportHubConfig` |
| Hub UI | `SportHubPage` | Same (`PadelChooseLinks` vs `RunningFitLinks`) |
| PDP route | `/products/[slug]` → `getProductPageData` → `ProductDetailPage` | Same |
| Review route | `/reviews/[slug]` → `getReviewPageData` → `ReviewDetailPage` | Same |
| Best | `/best/[slug]` → `BestGuideDetailPage` | Same |
| Buying guide | `/guides/[slug]` → `LongFormGuidePage` | Same |
| Compare | `/compare/[slug]` → `ComparisonPage` | Same |
| Alternatives | `/products/[slug]/alternatives` | Same |
| Brand | `/brands/[slug]` → `BrandHubPage` | Same + `padelBrandHubConfigs` |
| Finder | `/tools/running-shoe-finder` | `/tools/padel-racket-finder` |
| Database | `/running/shoes/database` | `/padel/rackets/database` |
| Media hosting | gitignored `public/images/**` → Vercel Blob via `MEDIA_BLOB_BASE_URL` | Same (padel product upload historically lagged) |

**Finding:** Padel is not a separate CMS. Most parity gaps are **content/media depth + category shell richness**, not missing routes.

---

## 2. Page-type matrix

### 2.1 Hub

| Dimension | Running (`/running`) | Padel (`/padel`) | Parity |
|---|---|---|---|
| Component/template | `SportHubPage` | `SportHubPage` | Match |
| Data source | `getSportHubData` + `runningSportHubConfig` | `getSportHubData` + `padelSportHubConfig` | Match |
| Media model | Urban running hero + product primary media on cards | Court hero `/images/padel/hero.jpg` + product primaries | Partial |
| Content model | Config-driven titles/CTAs; best guide strip; more-best sections | Same pattern | Match |
| Sections | Hero, fit links, category nav, featured+finder, more bests, trust, guides+comps, reviews, starter kit, brands, footer | Same + `PadelChooseLinks` | Match structure |
| Image placements | Product heroes in best strips; guide thumbs via `buyingGuideImageMap` | Same, but fewer unique guide map entries | **Gap** |
| Product cards | Rank badge, primary image, score, From-price | Same | Match when media present |
| Commerce | Regional From-price / offer count | Same | Match |
| Internal links | Shoes, finder, best, guides, compare, brands | Rackets/shoes/bags…, finder, database, research | Match+extras |
| SEO/JSON-LD | `sportMetadata` + breadcrumb / itemList on strip | Same | Match |

**Verdict:** `MAJOR_PARITY_GAPS` (structure matches; visual storytelling + soft-category readiness thinner).

---

### 2.2 Category

| Dimension | Running (`/running/shoes`) | Padel categories | Parity |
|---|---|---|---|
| Component/template | **Dedicated** `RunningShoesCategoryPage` | Generic `CategoryPage` via `assembleCategoryPage` | **Gap** |
| Data source | `getRunningShoesCategoryPage` | `assembleCategoryPage` + `padel-*-CategoryConfig` | Partial |
| Media model | Collage hero (up to 3 product heroes), how-you-run editorial images | Compact text hero + catalog cards only | **Gap** |
| Content model | Type nav, best+finder, how-you-run, brand strip, guides/comps | Decision section optional; no collage / type storytelling shell | **Gap** |
| Sections | `ShoesCategoryHero` → type nav → best+finder → how-you-run → catalog → guides → brands | Compact hero → chips? → catalog → best/guides/comps/tools/brands | **Gap** |
| Filters | Rich shoe facets | Racket/soft facets via catalog query | Partial |
| Commerce | Cards + best strip prices | Cards | Match when offers exist |
| SEO | Collection + itemList + FAQ JSON-LD | Same via `CategoryPage` | Match |

**Padel paths audited:** `/padel/rackets|shoes|balls|bags|grips|accessories`  
**Verdict:** Rackets `MAJOR_PARITY_GAPS`; soft categories `SYSTEMIC_PARITY_FAILURE` (media + shell).

---

### 2.3 PDP

| Dimension | Running shoe PDP | Padel PDP | Parity |
|---|---|---|---|
| Template | `ProductDetailPage` | Same | Match |
| Data | `getProductPageData` + `runningShoesProductPageConfig` | Same + `padelRacketsProductPageConfig` / soft editorial stores | Partial |
| Media model | `buildGalleryImages` = primary + authentic extras | Same | Match mechanism |
| **Actual gallery size** | **Median 1**, avg ~1.4; only ~11/85 shoes have extras | Rackets mostly 1 hero; soft goods often **0 usable** | Soft-goods **fail** |
| Content | Verdict, best/not ideal, buy/skip, score factors, specs, alts, offers, review summary | Racket PDP copy + decision attrs; soft goods thinner | Soft-goods **fail** |
| Commerce | Offer panel + sticky From-price | Same | Match |
| Alternatives | Max 3 on PDP + dedicated page | Same | Match |

**Critical calibration:** Running does **not** ship multi-angle galleries as the default. Demanding “gallery of N” for Padel would invent a standard Running itself does not meet. The real Padel PDP failure is **missing authentic heroes** (especially shoes/bags/grips/accessories), not “only one image.”

**Verdict:** Racket PDPs `MAJOR_PARITY_GAPS`; soft PDPs `SYSTEMIC_PARITY_FAILURE`.

---

### 2.4 Review

| Dimension | Running (Vomero template) | Padel | Parity |
|---|---|---|---|
| Template | `ReviewDetailPage` | Same | Match |
| Section media path | `public/images/running/products/<slug>/sections/<topic>.*` | `public/images/padel/products/<slug>/sections/<topic>.*` | Match model |
| Resolver | `resolveReviewSectionVisuals` | Same | Match |
| Flagship coverage | Vomero-class full topic set (~15 files) | Flagship rackets often ~18–24 files; **5/26** padel reviews have **0** section files | Partial |
| Gauge notes | Product-specific editorials | Until this week’s local fix: methodology labels (“Manufacturer sheet”) | **Content gap** |
| Commerce | Amazon/offers CTAs | Offers when present | Partial |

**Live note:** Review URLs use product-year slugs (e.g. `/reviews/bullpadel-indiga-ctr-2026`). Section PNGs for those slugs return HTTP 200 on Blob after padel product upload.

**Verdict:** `MAJOR_PARITY_GAPS` (not “no section files” for all — but inconsistent coverage + weaker gauge/editorial voice vs Vomero bar). Prior scorecard over-labelled this as systemic solely on perception; quantitative section files for flagships are present.

---

### 2.5 Best Guide

| Dimension | Running | Padel | Parity |
|---|---|---|---|
| Template | `BestGuideDetailPage` | Same | Match |
| Media | Guide hero + pick product primaries | Often shared `/images/padel/hero.jpg`; picks need product heroes | **Gap** when heroes missing |
| Content | Methodology, shortlist, considered, why-not | Large estate (39 padel best guides) with uneven depth | Partial |
| Visual storytelling | Product cards per pick | Same mechanism; soft-goods picks often blank/broken | Soft-goods fail |

**Verdict:** `MAJOR_PARITY_GAPS`.

---

### 2.6 Buying Guide

| Dimension | Running | Padel | Parity |
|---|---|---|---|
| Template | `LongFormGuidePage` + long-form config | Same | Match |
| Guide heroes | Distinct mapped images (e.g. `/images/home/guide-running-shoes.jpg`) | Only ~3 files under `public/images/padel/guides/`; map reuses choose-racket | **Gap** |
| Inline visuals | Anatomy/factor product rails | Thin / reused | **Gap** |
| Prose depth | Teaching-oriented long-form | 26 padel guides; many GOOD on word heuristics but visually text-heavy | Visual **fail** |

**Verdict:** `SYSTEMIC_PARITY_FAILURE` on **visual storytelling** (content length alone is not Running parity).

---

### 2.7 Comparison / Alternatives / Brand / Finder / Database

| Page | Running | Padel | Verdict |
|---|---|---|---|
| Comparison | Side-by-side primaries + specs + offers | Same; depends on product media | `MAJOR_PARITY_GAPS` |
| Alternatives | Hero + reason list + table + finder CTA | Same configs for padel categories | `MAJOR_PARITY_GAPS` |
| Brand hub | Editorial + category grids | Padel brand configs exist; grids need heroes | `MAJOR_PARITY_GAPS` |
| Finder | Running shoe finder | Racket finder only (no shoe finder) | `FUNCTIONALLY_READY_BUT_THIN` |
| Database | Shoe database | Racket database (padel-only strength) | `PARITY_READY` (as a surface) |

---

## 3. Running media model (actual)

1. Heroes registered in `running/product-media.ts` / catalog media.  
2. Optional gallery extras in `product-gallery-media.ts` (**rare**).  
3. Review richness comes from **per-section product variants**, not PDP galleries.  
4. Production serves via Blob rewrite — local files not in Git.

## 4. Padel media model (actual)

1. `PADEL_RACKET_PRODUCT_MEDIA` + `PADEL_SECONDARY_PRODUCT_MEDIA` via `getCatalogProductHeroMedia`.  
2. Soft-goods heroes incomplete (large PLACEHOLDER / missing share).  
3. Review section dirs exist for many racket flagships; soft reviews lag.  
4. Blob upload of `padel/products` lagged launch (caused live broken cards) — operational gap, not template gap.

---

## 5. What “Running parity” means (definition of done for later remediation)

Parity is **not**:

- multi-image PDP galleries everywhere (Running median = 1),
- character count alone,
- “hero file exists,”
- indexable/READY flags.

Parity **is**:

1. Dedicated category experiential shell for primary category (Running shoes bar).  
2. Authentic usable hero on every **public** product card/PDP.  
3. Review section imagery throughout flagship reviews (Vomero bar).  
4. Buying/Best guides with distinct editorial visuals + product examples.  
5. Buyer-specific copy (not methodology labels / thin soft-goods blurbs).  
6. Soft categories not published looking “live” with empty imagery.
