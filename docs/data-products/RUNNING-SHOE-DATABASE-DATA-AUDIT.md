# Running Shoe Database — Data Audit

Generated: 2026-09-11

## Scope

Audit of canonical `cat-running-shoes` products for the public flagship page `/running/shoes/database`.

**Rules:** no invented specs; coverage measured only on values present in catalog.

## Population

| Cohort | Count |
|--------|------:|
| All products in category | 85 |
| `status === published` | 85 |
| Publicly renderable (launch) | 85 |
| **Database-eligible** (catalog-listable: published + authentic media + `isLaunchListable`) | **85** |
| INDEXABLE (SEO) | 85 |

### Publication status breakdown (all category products)

| Status | Count |
|--------|------:|
| published | 85 |

### Launch disposition breakdown (all category products)

| Disposition | Count |
|-------------|------:|
| INDEXABLE | 85 |

## Field coverage (database-eligible cohort)

Denominator **n = 85** (same gate as `/running/shoes` catalog listing).

| Field | Source | Present | Coverage | Public-ready | Notes |
|-------|--------|--------:|---------:|:------------:|-------|
| brand | Product.brandId → Brand | 85 | 100.0% | yes | Always required on products |
| model (name) | Product.name / fullName | 85 | 100.0% | yes | Always present |
| family | Product.familyId → ProductFamily | 61 | 71.8% | partial | Useful when present; omit when missing |
| generation | Product.generation | 85 | 100.0% | partial | String generation label when known |
| gender / variant | ProductVariant.audience + genderFit spec | 85 | 100.0% | yes | Prefer variants; fall back to genderFit multi-enum |
| use case | Product.useCaseIds | 85 | 100.0% | yes | Mapped via UseCase taxonomy |
| shoe type (subcategory) | Product.subcategoryIds | 85 | 100.0% | yes | Daily trainer, race, trail, stability, etc. |
| weight | specifications.weight | 85 | 100.0% | yes | Weight (measurement, g) |
| heelStack | specifications.heelStack | 85 | 100.0% | yes | Heel Stack (measurement, mm) |
| forefootStack | specifications.forefootStack | 85 | 100.0% | yes | Forefoot Stack (measurement, mm) |
| drop | specifications.drop | 85 | 100.0% | yes | Drop (measurement, mm) |
| cushionLevel | specifications.cushionLevel | 85 | 100.0% | yes | Cushion Level (enum) |
| cushionFeel | specifications.cushionFeel | 84 | 98.8% | yes | Cushion Feel (enum) |
| stability | specifications.stability | 85 | 100.0% | yes | Stability (enum) |
| rideCharacter | specifications.rideCharacter | 74 | 87.1% | yes | Ride Character (enum) |
| energyReturn | specifications.energyReturn | 75 | 88.2% | yes | Energy Return (enum) |
| flexibility | specifications.flexibility | 74 | 87.1% | yes | Flexibility (enum) |
| upper | specifications.upper | 79 | 92.9% | yes | Upper (string) |
| midsole | specifications.midsole | 79 | 92.9% | yes | Midsole (string) |
| outsole | specifications.outsole | 79 | 92.9% | yes | Outsole (string) |
| plate | specifications.plate | 85 | 100.0% | yes | Plate (boolean) |
| plateMaterial | specifications.plateMaterial | 85 | 100.0% | yes | Plate Material (enum) |
| terrain | specifications.terrain | 85 | 100.0% | yes | Terrain (multi-enum) |
| widthOptions | specifications.widthOptions | 79 | 92.9% | yes | Width Options (multi-enum) |
| archSupport | specifications.archSupport | 74 | 87.1% | yes | Arch Support (enum) |
| grip | specifications.grip | 74 | 87.1% | yes | Grip (enum) |
| durability | specifications.durability | 74 | 87.1% | yes | Durability (enum) |
| breathability | specifications.breathability | 74 | 87.1% | yes | Breathability (enum) |
| raceLegal | specifications.raceLegal | 76 | 89.4% | yes | Race Legal (boolean) |
| recommendedPaceRange | specifications.recommendedPaceRange | 0 | 0.0% | no | Recommended Pace Range (range, min/km) |
| recommendedDistance | specifications.recommendedDistance | 78 | 91.8% | yes | Recommended Distance (multi-enum) |
| recommendedRunnerWeightRange | specifications.recommendedRunnerWeightRange | 0 | 0.0% | no | Recommended Runner Weight Range (range, kg) |
| trainingTypes | specifications.trainingTypes | 84 | 98.8% | yes | Training Types (multi-enum) |
| surface | specifications.surface | 74 | 87.1% | yes | Surface (multi-enum) |
| weatherSuitability | specifications.weatherSuitability | 74 | 87.1% | yes | Weather Suitability (multi-enum) |
| genderFit | specifications.genderFit | 85 | 100.0% | yes | Fit / Sizing (multi-enum) |
| release date/year | Product.releaseDate | 2 | 2.4% | no | ISO date when known — do not invent year |
| launch / MSRP price | (no dedicated field) | 0 | 0.0% | no | No canonical launchPrice field — do not invent |
| current offers / price | Offer via getLowestOfferPrice (NL default) | 85 | 100.0% | partial | Regional; may be missing for some SKUs |
| any active offer rows | getOffersForProduct(productId, region) | 85 | 100.0% | partial | Offer rows may exist without valid price; use getLowestOfferPrice for display |
| product imagery (authentic) | getPrimaryProductMedia / canFeatureProduct | 85 | 100.0% | yes | Required for listable eligibility |
| Kitletics recommendationScore | Product.recommendationScore | 85 | 100.0% | partial | Expose only when present |
| valueScore | Product.valueScore | 84 | 98.8% | partial | Expose only when present |
| review | Product.reviewId / Review by productId | 83 | 97.6% | partial | Link when published review exists |
| comparison membership | Comparison.productIds | 16 | 18.8% | partial | Flag/link when product appears in a comparison |
| alternatives / relationships | ProductRelationship + legacy arrays | 85 | 100.0% | partial | Not required on every row |

## Derived market signals (eligible only)

- Carbon-plated (`plate === true` && `plateMaterial === "carbon"`): **10** (11.8%)
- With heel + forefoot stack + drop: **85**

## Public-ready field policy

### Expose as primary filters / columns (high coverage + buyer-critical)

- **brand** — 100.0% — Always required on products
- **model (name)** — 100.0% — Always present
- **gender / variant** — 100.0% — Prefer variants; fall back to genderFit multi-enum
- **use case** — 100.0% — Mapped via UseCase taxonomy
- **shoe type (subcategory)** — 100.0% — Daily trainer, race, trail, stability, etc.
- **weight** — 100.0% — Weight (measurement, g)
- **heelStack** — 100.0% — Heel Stack (measurement, mm)
- **forefootStack** — 100.0% — Forefoot Stack (measurement, mm)
- **drop** — 100.0% — Drop (measurement, mm)
- **cushionLevel** — 100.0% — Cushion Level (enum)
- **cushionFeel** — 98.8% — Cushion Feel (enum)
- **stability** — 100.0% — Stability (enum)
- **rideCharacter** — 87.1% — Ride Character (enum)
- **energyReturn** — 88.2% — Energy Return (enum)
- **flexibility** — 87.1% — Flexibility (enum)
- **upper** — 92.9% — Upper (string)
- **midsole** — 92.9% — Midsole (string)
- **outsole** — 92.9% — Outsole (string)
- **plate** — 100.0% — Plate (boolean)
- **plateMaterial** — 100.0% — Plate Material (enum)
- **terrain** — 100.0% — Terrain (multi-enum)
- **widthOptions** — 92.9% — Width Options (multi-enum)
- **archSupport** — 87.1% — Arch Support (enum)
- **grip** — 87.1% — Grip (enum)
- **durability** — 87.1% — Durability (enum)
- **breathability** — 87.1% — Breathability (enum)
- **raceLegal** — 89.4% — Race Legal (boolean)
- **recommendedDistance** — 91.8% — Recommended Distance (multi-enum)
- **trainingTypes** — 98.8% — Training Types (multi-enum)
- **surface** — 87.1% — Surface (multi-enum)
- **weatherSuitability** — 87.1% — Weather Suitability (multi-enum)
- **genderFit** — 100.0% — Fit / Sizing (multi-enum)
- **product imagery (authentic)** — 100.0% — Required for listable eligibility

### Expose optionally (show when present; never invent)

- **family** — 71.8% — Useful when present; omit when missing
- **generation** — 100.0% — String generation label when known
- **current offers / price** — 100.0% — Regional; may be missing for some SKUs
- **any active offer rows** — 100.0% — Offer rows may exist without valid price; use getLowestOfferPrice for display
- **Kitletics recommendationScore** — 100.0% — Expose only when present
- **valueScore** — 98.8% — Expose only when present
- **review** — 97.6% — Link when published review exists
- **comparison membership** — 18.8% — Flag/link when product appears in a comparison
- **alternatives / relationships** — 100.0% — Not required on every row

### Do not expose as authoritative public facts yet

- **recommendedPaceRange** — 0.0% — Recommended Pace Range (range, min/km)
- **recommendedRunnerWeightRange** — 0.0% — Recommended Runner Weight Range (range, kg)
- **release date/year** — 2.4% — ISO date when known — do not invent year
- **launch / MSRP price** — 0.0% — No canonical launchPrice field — do not invent

## Architecture implications

1. Build `RunningShoeDatabaseRecord` as a **derived view** over Product + Brand + Family + Variant + Offer + media — not a duplicate catalog.
2. Eligibility = `canFeatureProduct` + `isLaunchListable(getLaunchEligibility(...))` (same as catalog).
3. SEO indexation of individual product URLs remains gated by `isIndexableEligibility`; the database hub page is a separate static hub.
4. Missing specs must render as empty / “—” — never inferred from peers or marketing copy.
5. Compact client payload: only discovery fields (ids, slug, brand, image src, numeric/enum specs present, price, audiences, scores when present).

## Missing-data findings

- No canonical **launch / MSRP** price field exists.
- Spec coverage varies; geometry trio (weight / stack / drop) and plate fields are the strongest for a data explorer.
- Reviews, comparisons, and alternatives are partial overlays — use as links/badges, not required columns.
