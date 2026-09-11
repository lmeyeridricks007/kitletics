# Category / Subcategory Decision Content — Editorial 44

**Document ID:** `08-CATEGORY-CONTENT-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** Sport hubs · Product categories · Subcategory / use-case listings  
**Data:** [`data/44-category-content-completion.json`](data/44-category-content-completion.json) · baseline [`data/44-category-audit.json`](data/44-category-audit.json)

## Executive status

| Surface | Count | READY | NOT_READY |
|---|---:|---:|---:|
| Product categories (sitewide) | 47 | **13** | **34** |
| Use-case / shoe-type listings | 5 | **5** | 0 |
| Sport hubs (decision-bearing) | — | **Running** | Fitness, padel, tennis, etc. |
| Soft-gated shells | 5 | — | accessories + empty padel/squash |

**Targets:** discovery decision content (not browse-grid-only) · no SEO filler essays · distinct subcategory guidance · soft-gated Running categories editorially ready before ungating — **met for clothing / sunglasses / nutrition; accessories still held.**

## Verdict criteria (actual content)

A product category is **READY** only when all hold:

1. Catalog depth ≥ **8** published products  
2. Complete **decision** block (what it is, product types, what matters, specs, trade-offs, use-case shifts, beginner start, Best and/or Finder link)  
3. ≥ **3** education factors  
4. Finder wired (or decision Finder link)  
5. Best guide link present (assembled or decision)  
6. **Not** soft-gated  

Listings are **READY** when education is type-specific (body + ≥4 factors + beginner start + trade-offs + Best + ≥2 related guides).

## Soft-gated Running categories (RC holds)

| Category | Products | Editorial after 44 | Soft gate | Verdict |
|---|---:|---|---|---|
| Clothing | 57 | Decision + Apparel Finder + terminology + 3 Best + 3 Guides | **Removed** | **READY** |
| Sunglasses | 17 | Decision + Accessories Finder + terminology + Best | **Removed** | **READY** |
| Nutrition & Fuel | 38 | Decision + Fuel Finder + evidence honesty + Best + 4 Guides | **Removed** | **READY** |
| Accessories | 3 | Decision honest (chafe-only shelf) + Finder | **Still held** | **NOT_READY** |

Gate change followed content readiness — accessories kept soft-gated because the catalog is three anti-chafe SKUs, not a full accessories taxonomy.

## What changed

### 1. Decision model + Running enrichment

- `ProductCategoryPageConfig.decision` in `src/lib/catalog/types.ts`  
- Compact blocks in `src/lib/catalog/running-decisions.ts` (merged via `withRunningDecisionEnrichment`)  
- Rendered on category pages: `CategoryDecisionSection`  

Answers on each READY category page (scannable cards, not 800-word intros):

- What is this category?  
- Product types  
- What matters / specs / trade-offs / use-case shifts  
- Beginner start  
- Links to Best · Finder · Guides · comparison note  

### 2. Soft-gated configs deepened

`src/lib/catalog/running-category-configs.ts`

- Clothing → Apparel Finder, sports-bras featured, terminology  
- Nutrition → Fuel Finder, carbs/caffeine/electrolyte terms  
- Sunglasses → Accessories Finder, lens terminology  
- Accessories → honest chafe-focused hero + Finder (still gated)  

### 3. Subcategory / use-case differentiation

`src/lib/use-case-listing/config.ts` + `UseCaseEducationStrip`

Daily trainers · race · stability · trail · heavy-runners each have **distinct** selection bodies, beginner starts, and trade-offs (not shared “great shoe” boilerplate).

### 4. Soft gate + launch manifest

- `SOFT_GATED_CATEGORY_SLUGS`: removed `running-clothing`, `sunglasses`, `nutrition-fuel`; kept `accessories` (+ empty padel shells)  
- `runningLaunchManifest`: clothing / sunglasses / nutrition → `launch-supporting`  

## READY product categories

| Category | Products | Notes |
|---|---:|---|
| Running shoes | 83 | Gold-standard decision + Shoe Finder |
| GPS watches | 33 | Battery/maps decision + Watch Finder |
| Heart rate monitors | 15 | Strap vs optical + HRM Finder |
| Hydration | 17 | Vest/belt/handheld + Hydration Finder |
| Packs / vests | 35 | Flask geometry + Hydration Finder |
| Belts | 14 | Belt vs vest |
| Clothing | 57 | Ungated after editorial |
| Socks | 10 | Apparel Finder |
| Nutrition & fuel | 38 | Ungated after editorial |
| Recovery | 16 | Evidence-limit framing |
| Headphones | 11 | Awareness-first |
| Sunglasses | 17 | Ungated after editorial |
| Lights | 9 | Beam pattern vs lumens |

## NOT_READY (selected)

### Running

| Category | Why |
|---|---|
| **Accessories** | Thin catalog (3 chafe SKUs) + soft gate — decision copy present but shelf not launch-ready |
| **Safety gear** | Decision present; only 6 products (&lt;8 depth gate) |
| **Treadmills** | Products exist; **no** category decision config |

### Other sports (pattern)

Padel rackets/shoes, tennis rackets/shoes, fitness training shoes, dumbbells, racks, etc. — **browse/grid only** (`no_category_config`). Sport hubs may exist; product-category decision scaffolding does not. Honest **NOT_READY** until configs + decision blocks ship (vertical gates may still apply independently).

Empty soft shells: padel bags / clothing / accessories, squash rackets — **NOT_READY**.

## Use-case listings

| Listing | Verdict |
|---|---|
| Daily trainers | **READY** |
| Race | **READY** |
| Stability | **READY** |
| Trail | **READY** |
| Heavy runners | **READY** |

## Sport hubs

| Sport | Verdict | Note |
|---|---|---|
| Running | **READY** | Hub + 13 READY product categories |
| Fitness / padel / tennis / others | **NOT_READY** | Category pages lack decision configs |

## Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-44-category-completion.ts
```

Assembled soft-ungated sample (post-change): clothing Best 6 / Guides 3 / Finder on; nutrition Guides 4 / Fuel Finder on; sunglasses Best 1 / Finder on; accessories still soft-gated.

## Definition of done (44)

- [x] Indexable-ready categories answer the discovery questions without SEO filler  
- [x] Daily / stability / trail / race guidance is genuinely distinct  
- [x] Soft-gated clothing / sunglasses / nutrition editorially ready **then** ungated  
- [x] Accessories **not** ungated on thin catalog  
- [x] READY / NOT_READY from actual content in this report + JSON  

## Residual

1. Accessories: expand catalog beyond anti-chafe (or re-home SKUs) before ungating.  
2. Safety gear: either deepen catalog or accept NOT_READY.  
3. Treadmills + all non-Running product categories: add `ProductCategoryPageConfig` + decision blocks when those verticals leave browse-only.  
4. Sunglasses: Best + decision strong; dedicated buying Guides still thin (0 assembled) — optional follow-up, not blocking READY under current criteria.
