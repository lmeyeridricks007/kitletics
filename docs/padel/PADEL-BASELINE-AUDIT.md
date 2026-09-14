# Padel baseline audit

**As of:** 2026-09-13  
**Method:** live TypeScript catalog (`src/content/padel/*` merged through `src/content/products.ts` and repositories), launch policy, routing, Finder, publication, and the post-remediation quality architecture. Inventory dump: `scripts/tmp/padel-baseline-inventory.ts`.

This document records **what exists**. It is not a launch recommendation. Padel is **not** a complete first-class Kitletics vertical yet.

**Running remains the production-quality benchmark.** Padel must not be “opened” by flipping `contentStatus` or vertical mode while uniqueness-era reviews, SVG-cycled heroes, generic Amazon homepages, and thin category shells remain.

---

## Verdict

Padel already has the **routing skeleton** of a Kitletics sport (`/padel`, category path segments, Finder tool, Best Guide, buying guides, comparisons, brand hub entries). It does **not** have Running’s catalog depth, evidence discipline, media authenticity, commerce honesty, editorial bar, research surfaces, or publication gates.

**Production policy today:** `verticalLaunchStrategy.sports.padel.mode = "disabled"`. Deep padel entities are `HIDDEN_404` in production (sitemap, search, related content, brand hubs) even when `Sport.contentStatus === "live"` and seed rows are `status: "published"`. That hold is correct until this onboarding is real.

Do **not** treat `PADEL_LAUNCH_READINESS.md` (2026-08-30, “GO WITH CONDITIONS”, 27 rackets) as current quality proof. That report predates rendered-quality remediation and counted placeholders, homepage Offers, and generated reviews as ready.

---

## 0. Quality architecture to use (and not revive)

Kitletics already paid for uniqueness-era and semantic-image failures. Padel onboarding must use the **current** stack:

| Layer | Source of truth | Role |
| --- | --- | --- |
| Publication | `PublishStatus` + `isPubliclyVisible` | draft / review / scheduled / published / archived |
| Vertical | `src/content/launch/vertical-strategy.ts` | enabled / selective / disabled |
| Launch eligibility | `src/domain/launch/get-launch-eligibility.ts` | INDEXABLE / PUBLIC_NOINDEX / HIDDEN_404 |
| Rendered quality | `docs/quality/RENDERED-QUALITY-GATE.md` | what the user actually receives |
| Media authenticity | `npm run media:ci` + `CATALOG_PRODUCT_MEDIA` | licensed product photography vs placeholders |
| Image semantics | Gate 4 + visual semantic report | sport / product / topic correctness |
| Review merge | `src/content/review-source-precedence.ts` | handwritten > genuine rewrite > editorial rebuild > generated research > uniqueness overlay |
| Review voice | `.cursor/rules/review-page-standard.mdc` | Vomero 18 bar; no uniqueness skip templates |
| Onboarding | `npm run product:onboard` / `src/domain/onboarding` | research → staging → review → publish |

**Do not revive**

- Uniqueness-token generators (`skuStamp`, concatenated spec fingerprints, Jaccard-as-quality)
- `reviews-backfill.ts` / P53–P54 uniqueness overlays as a padel content factory
- `scripts/tmp/prelaunch-25-content-uniqueness.ts` as a publish gate
- Wave25/26 SVG cycling (`racket-1.svg`…`racket-5.svg`) as “hero complete”
- Generic Amazon/Decathlon homepage Offers
- Fabricated `recommendationScore` / power-control enums from carbon K-count
- Cross-sport filler images (the padel racket on running-watch pages was a documented BLOCKER)

Uniqueness is now **analysis-only** (Gate 6). SKUs and spec dumps score zero. A padel review is unique because the **buying argument** is product-specific.

---

## 1. Existing Padel data (files)

| File | What it is |
| --- | --- |
| `src/content/padel/seed.ts` | Categories, original 8 brands, 10 products, Offers, 1 Best Guide, 3 buying guides, 4 comparisons, 1 setup, Finder tool (seed `available: false`) |
| `src/content/padel/seed-recommendations.ts` | Seed racket recommendations + `ev-padel-seed-editorial` |
| `src/content/padel/wave25.ts` | Extra rackets + Kuikma / Drop Shot / Varlion brands; **cycled SVG placeholders**; Amazon NL/DE/UK homepage triplets |
| `src/content/padel/wave26.ts` | 2026 flagships, families, patches (Vertex 04 / Hack 03 → previous-generation), alts, relationships, 3 more comparisons |
| `src/content/padel/wave27.ts` | Court-shoe expansion + genderFit overlays |
| `src/content/padel/wave28-shoes.ts` | Further shoes; several **draft** identities (e.g. Siux Diablo Pro shoe — “racket line, no verified shoe SKU”) |
| `src/content/padel/index.ts` | Merge + Finder forced `available: true` |
| `src/content/racket/seed.ts` | Shared racket use cases (`uc-padel-*`) |
| `src/content/specs/definitions.ts` | `padelRacketSpecs` + minimal shoe/bag/ball/grip keys |
| `src/domain/onboarding/research-config.ts` | `padelRacketsResearchConfig` (fixture-level, incomplete vs intended taxonomy) |
| `src/domain/finders/configs/racket-finders.ts` | Padel Racket Finder definition |
| `src/lib/sport-hub/config.ts` | `padelSportHubConfig` |

QA scripts exist (`npm run padel:catalog-qa`, `racket:qa`, `racket:finder-qa`, …) but they measure **field presence**, not rendered quality.

---

## 2. Existing padel products

Measured: products with `sportIds` including `sport-padel`.

| Slice | Count | Notes |
| --- | ---: | --- |
| Any `sport-padel` tag | 98 | Inflated by tennis/padel dual tags |
| Dedicated padel categories | 70 | rackets + padel shoes + 3 soft-goods |
| Dual `sport-tennis` + `sport-padel` | 67 | Mostly court shoes; do not treat as padel catalog without evidence |
| Published | 88 | Production still HIDDEN_404 via vertical |
| Draft | 10 | Bag + several wave28 shoes |
| Previous generation | 2 | Vertex 04, Hack 03 |
| Discontinued / upcoming | 0 | Lifecycle tracking is thin |

### By dedicated padel category

| Category | Published | Draft | Lifecycle | Commercially meaningful? |
| --- | ---: | ---: | --- | --- |
| Padel Rackets (`cat-padel-rackets`) | 27 | 0 | 25 current / 2 previous | **Thin brand ranges** (often 1–2 SKUs per brand) |
| Padel Shoes (`cat-padel-shoes`) | 34 | 6 | all current | Count looks better than quality; many fallback SVGs |
| Padel Balls | 1 | 0 | current | Example SKU only |
| Padel Grips | 1 | 0 | current | Example SKU only |
| Padel Bags | 0 | 1 | current | Held as draft (SVG packshot) |
| Padel Accessories | 0 | 0 | — | Empty; **soft-gated** |
| Padel Clothing | 0 | 0 | — | Empty; **soft-gated** |

`cat-tennis-shoes` contributes 28 additional products tagged padel. That is a tennis catalog with a padel sport tag, not a padel shoe range.

**Complete-catalog gap:** Running shoes launch-core target is ≥40 models **with families, widths, evidence, authentic heroes**. Padel rackets are 27 SKUs across ~16 brands — closer to a flagship sampler than a current European range (missing beginner/value lines, women’s frames, full 2026 families such as Vertex HYB / Neuron / Adipower / Gravity / Air Viper, etc.).

Identity risk already found: `prod-siux-diablo-pro` (shoe, draft) vs `prod-siux-diablo` (racket Diablo Pro). Onboarding must not confuse racket lines with footwear.

---

## 3. Existing padel brands

Padel-specific Brand entities (from seed + wave25 + wave26):

| Brand | Slug | Role in current catalog |
| --- | --- | --- |
| Nox | `nox` | Rackets + shoes + draft bag |
| Bullpadel | `bullpadel` | Rackets + shoes |
| Adidas Padel | `adidas-padel` | Vertical entity distinct from `brand-adidas` |
| Head | `head` | Rackets + balls + shoes |
| Wilson | `wilson` | Rackets + grips + shoes |
| Siux | `siux` | Rackets + draft shoes |
| Babolat | `babolat` | Rackets + shoes |
| StarVie | `starvie` | Rackets + draft shoe |
| Kuikma | `kuikma` | Value Decathlon line |
| Drop Shot | `drop-shot` | 1 racket |
| Varlion | `varlion` | 1 racket + 1 shoe |
| Oxdog | `oxdog` | 1 racket + 1 shoe |
| Royal Padel | `royal-padel` | 1 racket |
| Black Crown | `black-crown` | 1 racket |
| Tecnifibre Padel | `tecnifibre-padel` | Vertical entity |
| Lok | `lok` | 1 racket + 1 shoe |
| Joma | `joma` | Shoes only |

**Split-brand problem (do not paper over):** `brand-adidas` vs `brand-adidas-padel`; `brand-asics` vs `brand-asics-racket`. Running uses a **single** Brand entity (ASICS, Adidas). Padel currently splits tennis/padel verticals. Brand hubs, logos, and related products will fragment unless this is decided before catalog expansion.

Prompt-list brands **not** onboarded as padel racket houses: Dunlop, Prince, Mizuno. They appear only via tennis shoes (and must not be inferred as padel-racket brands).

Hub featured brands (`padelSportHubConfig.brandIds`) are the original eight only — Oxdog, Kuikma, Joma, Varlion, etc. are live in catalog but not on the hub strip.

---

## 4. Existing categories

Defined in `padelCategories` and merged in `src/content/taxonomy/categories.ts`:

| Name | `pathSegment` | Canonical URL | Soft-gated? |
| --- | --- | --- | --- |
| Padel Rackets | `rackets` | `/padel/rackets` | no |
| Padel Shoes | `shoes` | `/padel/shoes` | no |
| Padel Bags | `bags` | `/padel/bags` | no (1 draft product — production empty) |
| Padel Balls | `balls` | `/padel/balls` | no |
| Grips & Overgrips | `grips` | `/padel/grips` | no |
| Accessories | `accessories` | `/padel/accessories` | **yes** (`SOFT_GATED_CATEGORY_SLUGS`) |
| Clothing | `clothing` | `/padel/clothing` | **yes** |

No padel subcategories exist (`src/content/taxonomy/subcategories.ts` has none for `cat-padel-*`). Running shoes have daily / max-cushion / tempo / race / trail / … — padel has no equivalent shape/level lanes as taxonomy, only Finder questions and use cases.

Hub comment: accessories/clothing are “soft-gated until products exist.” Correct. Do not invent extra SEO categories (protectors, pressurizers, wristbands as top-level `/padel/*` shells). Those belong as accessory **types** if/when SKUs exist.

---

## 5. Existing images

| Pattern | Count / issue |
| --- | --- |
| Seed PNG rackets `racket-1.png`…`racket-4.png` | Shared across models (Wilson Bela and Head Coello both use `racket-4.png`) |
| Wave25/26 SVG cycle `racket-1.svg`…`racket-5.svg` | 21 racket SKUs share 5 drawings — **one image, many products** |
| Padel shoes authentic JPG | Wave27 cluster under `/images/padel/products/*-hero.jpg` |
| Wave28 fallback | Many shoes still `/images/catalog/fallbacks/shoe.svg` even when `CATALOG_PRODUCT_MEDIA` has a registered path |
| Balls / grips / bag | Category SVGs (`balls.svg`, `grips.svg`, `bag.svg`) |
| Tennis placeholders | Tennis rackets reuse **padel** SVG heroes (`"Kitletics padel placeholder reused for tennis"`) — semantic mismatch waiting to leak if tennis is enabled |
| Hub / guides | `/images/padel/hero.jpg`, `guides/choose-racket.jpg`, `choose-shoes.jpg`, `grips.jpg` |
| Review section images | No `public/images/padel/products/<slug>/sections/` estate matching the review-section-images rule |

`CATALOG_PRODUCT_MEDIA` registers 89 padel-tagged product IDs. Registration ≠ authentic on-disk hero, and ≠ unique per SKU. Gate 4: UNKNOWN must never be upgraded to CORRECT. A labeled placeholder is allowed; **stamping the same SVG on Vertex 05 and AT10 12K is not**.

---

## 6. Existing reviews

64 published Review objects attach to padel-tagged product IDs (includes dual tennis shoes).

Candidate sources for those products:

| Source kind | Candidates | Meaning |
| --- | ---: | --- |
| `handwritten` | 64 | Mostly `reviews-backfill.ts` — **catalog-generated**, not Vomero-18 editorial |
| `editorial_rebuild` | 64 | Auto-generated rebuild JSON |
| `generated_research` | 61 | Unique-research rewrite overlay |
| `uniqueness_overlay` | 58 | P53/P54 uniqueness-era |

Winning merge still prefers handwritten/rebuild over overlays, then sanitizes uniqueness-era skip templates (`rewrite-uniqueness-era-skip.ts`). That is a **containment** system, not a padel editorial program.

Backfill copy is the exact failure mode already remediating on Running: “I'd pause if … shows up often in your week”, spec dumps as “Key specs”, job-stamp overviews. **Do not publish these as the padel review estate.** Do not generate a new uniqueness overlay to “complete coverage.”

Review page category config (`src/lib/review/category-config.ts`) has **no** `cat-padel-rackets` / `cat-padel-shoes` page template. Review-agent criteria exist (`control`, `power`, `maneuverability`, …) but the public review page falls through to an empty generic config (no glance specs, no shoe-equivalent section map).

No first-hand padel testing evidence. Review types in backfill are expert-research shaped, not personal-test.

---

## 7. Existing generated / seeded editorial

| Surface | Count | Quality note |
| --- | ---: | --- |
| Best Guides | 1 (`/best/padel-rackets`) | Awards include previous-gen Vertex 04 era leftovers in related compares; Siux Diablo award text says **round** while product spec is **teardrop** |
| Buying guides | 3 | Racket guide is the only substantial one; shoes/grips are one-section thin |
| Explainer overlay | `src/lib/guides/explainers/racket-plans.ts` | Rebuilds thin guides from a plan + `RACKET_UNIQUE` copy |
| Comparisons | 7 | Several still feature Vertex 04 / seed pairings; not a decision graph |
| Gear setups | 1 (`/setups/padel-starter-kit`) | Head Coello + Adidas CourtStabil + Head balls + Wilson overgrips |
| Alternatives rows | 20 | Running-centric relationship types (`more-cushioned`, `trail-capable`, …) |
| Product relationships | 18 | Wave26 only; families incomplete |
| Recommendations | 41 rows / 27 products | Racket-centric; shoes largely unscored |
| Evidence | ~5–6 padel evidence IDs | Almost all `editorial-research`, medium confidence, **no `sourceUrl` on seed** |
| Tools | 1 Finder (live flag) | No shoe finder, no calculators, no database |

Buying-guide image map and hub CTAs exist. That is presentation, not content completeness.

---

## 8. Existing routes (canonical — do not duplicate)

App Router is sport-agnostic. Padel uses the same families as Running:

| Route | Owner | Padel today |
| --- | --- | --- |
| `/padel` | `src/app/[sport]/page.tsx` | Declarative Sport Hub (`padelSportHubConfig`) |
| `/racket` | same + `RacketSportsFamilyHub` | Family chooser; `/racket/padel` 301s to `/padel` |
| `/padel/{pathSegment}` | `src/app/[sport]/[segment]/page.tsx` | `rackets`, `shoes`, `bags`, `balls`, `grips`; empty/soft-gated accessories & clothing |
| `/padel/{discipline}` | same | **No padel-owned disciplines**; `disc-racket-padel` lives under `sport-racket` |
| `/products/[slug]` | product PDP | Gated by launch eligibility |
| `/reviews/[slug]` | reviews | 64 attached; quality not launch-ready |
| `/best/[slug]` | best guides | `padel-rackets` only |
| `/guides/[slug]` | buying guides | 3 slugs |
| `/compare` and `/compare/[slug]` | compare | 7 padel comparisons + builder `?category=padel-rackets` |
| `/products/[slug]/alternatives` | alternatives | Graph thin |
| `/tools/padel-racket-finder` | Finder | Registered, `available: true` |
| `/brands/[slug]` | brand hubs | Split adidas/asics entities |
| `/setups/[slug]` | setups | starter kit |
| `/running/shoes/database` | research | **No padel analog** |

Do **not** create `/padel/reviews`, `/padel/best`, or a second Finder URL family. Contextual nav already points at `/reviews?sport=padel`, `/best?sport=padel`, `/guides?sport=padel`.

---

## 9. Existing Racket Sports hub

- Sport `sport-racket` (`slug: racket`) is an **umbrella**, `contentStatus: "live"`, parent of padel / tennis / pickleball / badminton / squash.
- Vertical mode: **disabled** (same as padel/tennis).
- UI: `RacketSportsFamilyHub` — choose sport, then leave. Not a competing product catalog.
- Canonical child hubs: `/padel`, `/tennis`, … via `resolveChildSportRedirect`.
- Primary nav: “Racket Sports” → `/racket`, `activePrefixes` include `/padel`.
- Contextual nav: Overview / Padel / Tennis / Best / Reviews / Guides / Compare / Tools / Brands.

Padel is **not** a landing card on `/racket` with a handful of products by accident — the hub is correctly a family switcher. The incompleteness is the **child vertical**, not the family page.

---

## 10. Existing navigation

| Surface | Padel |
| --- | --- |
| `PRIMARY_NAV` | Racket Sports group, not a top-level “Padel” item |
| `SPORT_NAV_GROUPS.popular` | includes `padel` |
| Gear mega-menu future areas | `/racket` (not coming-soon) |
| Sport Hub shop chips | Rackets, Shoes, Bags, Balls, Grips; “Deals” currently points at `/padel/rackets` |
| Soft-gated | accessories, clothing hidden from listings |
| Finder footer | `/tools/padel-racket-finder` |

Production chrome can still *link* to `/padel` while deep entities 404. Hub vs product leak must stay consistent when enabling the vertical (either the hub is PUBLIC_NOINDEX until ready, or the whole vertical is enabled with quality gates). Do not show 27 SVG rackets as a shoppable catalog in production.

---

## 11. Existing Finder architecture

Finders are **one engine** (`src/domain/finders/engine.ts`) with sport-specific definitions.

Padel Racket Finder (`padel-racket-finder` / `finder-padel-rackets`):

- Questions: experience (beginner / intermediate / advanced / **competitive**), current equipment, change goals, play style (control / balanced / power / figuring-out), priorities (control, power, forgiveness, maneuverability, comfort, spin, value), weight, balance, feel, EUR budget bands.
- Scoring weights: primaryUse 22, budget 14, priorities 28, lifecycle 4, value 10, specs 22.
- Eligibility: unpublished / upcoming / discontinued excluded; affiliate never a signal (`evaluateEligibility`).
- Publish gate `canPublishFinder`: ≥8 candidates, ≥3 brands, recommendations — **numeric**, not quality.
- Hub preview fields (level / style / shape / budget) **do not match** Finder question keys/bands (e.g. hub `150-250` vs Finder `100-180` / `180-280`).

**Missing vs player model requested**

- No DEFENSIVE / AGGRESSIVE / ALL_ROUND as first-class style (only control/balanced/power).
- No LEFT_SIDE / RIGHT_SIDE / BOTH.
- No arm/elbow or shoulder **comfort preference** (and there must be no medical claims if added).
- No padel **shoe** finder.
- Competitive maps to Finder `primaryUse=competitive` but `ExperienceLevel` on Product is `elite`, not competitive — mapping is inconsistent.

---

## 12. Existing Running implementation (benchmark)

Running is the only `verticalLaunchStrategy` **enabled** sport.

| Dimension | Running (target / actual pattern) | Padel today |
| --- | --- | --- |
| Categories | 14 populated, launch-core mins in `runningLaunchManifest` | 7 defined, 2 empty, 3 example-only |
| Catalog principle | Full current ranges, families, lifecycle | Flagship sampler |
| ProductVariant | Derived men/women (shoes, apparel, vests) | **0 rows** |
| Evidence | Manufacturer URLs, specs with provenance | Editorial-research blobs |
| Reviews | Vomero 18 standard + section images | Backfill/rebuild |
| Best guides | Many intent-differentiated guides | 1 |
| Tools | Shoe + watch + HRM + hydration + clothing + fuel + recovery + accessories finders; pace / race / rotation | 1 racket finder |
| Research | `/running/shoes/database` + CSV + citations | none |
| Spec policy | Full shoe geometry; UNKNOWN allowed | Rackets “full-looking” enums; shoes minimal |
| Publish requirements | `PUBLISH_REQUIREMENTS` for running cats | **No padel entries** |
| Media gate | `applyMediaPublishGate` + authentic heroes | Placeholders labeled but reused |
| Scores | Explainable factors + `/scoring-methodology` | Integer `recommendationScore` on almost every SKU |

Padel must copy **this operating system**, not Running’s shoe fields.

---

## 13. Existing commerce model

`Offer` is region-scoped (`NL` primary), retailer + optional variant, canonical URL, optional affiliate URL resolved at `/go`, availability, `source` (`api` / `affiliate-feed` / `merchant-feed` / `manual` / `seed`), evidence, URL validation states.

**Padel Offers today:** 282 rows (NL 106, DE 88, UK 88). **282 / 282 are retailer homepages** (`amazon.nl/`, `amazon.de/`, `amazon.co.uk/`, `decathlon.nl/`). Prices are seed numbers, not verified listings.

That fails commerce honesty and the pricing agent’s purpose. Do not rank Best Guides or Finder value on these prices. NL specialist retailers (Justpadel, Padel2Gether, Holland Padel, Decathlon/Kuikma, Amazon NL) are the right *research* channels — they are not currently modeled as Offer destinations with product URLs.

Affiliate neutrality: Finder and recommendations must not use commission. Keep that.

---

## 14. Existing recommendation model

`Recommendation` is **use-case scoped** (product + sport + optional `useCaseId`), 0–100, weighted `factors` with explanations, `evidenceIds`.

Padel use cases (`src/content/racket/seed.ts`):

- `uc-padel-beginner`
- `uc-padel-control`
- `uc-padel-power`
- `uc-padel-balanced`

No defensive / aggressive / all-round / left-side / right-side / arm-comfort contexts.

`AlternativeRelationshipType` and several `ProductRelationshipType` values are **running-shaped** (`more-cushioned`, `trail-capable`, `faster`). Padel needs category-appropriate types (more-forgiving, more-head-light, softer-core, cheaper, previous-generation) without inventing fake similarity percentages.

`Product.recommendationScore` / `valueScore` are widely populated (80–95). Those integers are **not** evidence-based Kitletics Scores. Treat them as seed placeholders to strip or replace.

---

## 15. ProductFamily / Product / ProductVariant

| Entity | Padel state |
| --- | --- |
| **Product** | First-class; `lifecycleStatus`, specs map, `sportIds`, `categoryId`, `offerIds`, `evidenceIds` |
| **ProductFamily** | 5 racket families (AT10, Vertex, Hack, Metalbone, Viper) + some P56 shoe families; most SKUs have **no** family |
| **ProductVariant** | Schema supports audience, size, width, variant offers, `mediaSrc`. Runtime variants are generated only for Running categories. **Padel: 0 variants.** Gender is a **separate Product** (Crazyquick men vs women) or a `genderFit` spec |
| **Offer.variantId** | Unused for padel |

Running’s honesty rule: men’s reference weight vs unverified women’s weight. Padel shoes currently store gender as product-level enum without size runs or verified weights (`weight` 0/40 shoes).

---

## 16. Publication states — map requested labels to existing model

Do **not** add a parallel `DRAFT | RESEARCHING | READY | SCHEDULED | PUBLISHED | BLOCKED` enum on Product.

| Requested label | Existing layer |
| --- | --- |
| DRAFT | `PublishStatus = "draft"` (and staging `candidate`) |
| RESEARCHING | Onboarding session `researching` + ResearchFinding |
| READY | Editorial `workState: READY` **and/or** launch quality `LAUNCH_READY` — still not indexable until vertical + eligibility |
| SCHEDULED | `PublishStatus = "scheduled"` + `scheduledFor` — production never leaks even if date passed |
| PUBLISHED | `status: "published"` + `publishedAt <= now` |
| BLOCKED | Launch quality `BLOCKED` / onboarding `blocked` / uniqueness holds / missing media → `HIDDEN_404` or stay draft |

Production leak rules already exist: unpublished → not in `getProducts()`; vertical disabled → `HIDDEN_404`; scheduled never publishes itself; 404 via `notFound()` when eligibility says hidden.

Padel sport hub being `contentStatus: "live"` while vertical is disabled is the main **chrome vs 404** inconsistency to resolve at enablement time.

---

## 17. Player / racket / shoe taxonomy vs current specs

**Rackets — present:** shape, balance (includes non-canonical `head-heavy`), weightMin/Max, thicknessMm, core, face (free string), sweetSpot, powerPositioning, controlPositioning. Coverage 27/27 on those keys.

**Rackets — absent:** surface texture, feel, frame material as controlled enum, spin potential, forgiveness, maneuverability, comfort, stability as evidence fields (Finder infers some from shape/weight). `powerPositioning` / `controlPositioning` look like fabricated ranks.

**Shoes — present:** outsole (often `"padel court rubber"`), cushioning, support, genderFit.

**Shoes — absent:** traction pattern, court feel, durability, weight, upper, width, padel-specific vs tennis crossover vs clay vs all-court (must not infer).

**Balls / bags / grips:** spec definitions exist; seed products have **empty** `specifications: {}`.

---

## 18. What “complete first-class vertical” is missing (gap list)

1. Evidence-backed current catalog per major EU/NL brand (not 1–2 flagships).
2. Authentic unique heroes; section images only when reviews are actually written.
3. Real Offer URLs and NL specialist retailers.
4. ProductFamily completeness + lifecycle (CURRENT / PREVIOUS_GENERATION / DISCONTINUED / UNKNOWN).
5. ProductVariant strategy for shoes/clothing (or explicit “separate SKU products”).
6. Player model (style, side, comfort preferences) without medical claims.
7. Racket/shoe/accessory spec schemas with UNKNOWN allowed.
8. Finder/hub field alignment; optional shoe finder only after shoe catalog is honest.
9. Editorial estate at Vomero-18 / Running Best Guide bar — **after** catalog, not instead of it.
10. Research/database only when specs are provenance-backed (Running Shoe Database analog).
11. `PUBLISH_REQUIREMENTS` + research-config for every padel category we claim.
12. Vertical enablement last, behind rendered-quality + media:ci + reviews:ci.

---

## 19. Explicit non-goals for this phase

- Mass-generating reviews, uniqueness overlays, or “coverage” Best Guides.
- Enabling `verticalLaunchStrategy` padel mode.
- Inventing `/padel/left-side` SEO disciplines.
- Treating tennis shoes as padel shoes because `sportIds` includes both.
- Ranking products by affiliate or by seed `recommendationScore`.
