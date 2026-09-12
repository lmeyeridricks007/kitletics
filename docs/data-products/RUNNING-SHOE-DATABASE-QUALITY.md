# Running Shoe Database — Quality & Freshness Guard

Generated: 2026-09-11

## Scope

Quality / freshness classification for the **public Running Shoe Database** cohort (`/running/shoes/database`).

- Eligible shoes only (same gate as the public page).
- Optional fields are **not** required merely to inflate completeness.
- Suspicious or impossible values are **flagged**, never silently corrected.
- **INVALID** and **SUSPECT** metric values are excluded from market statistics and Data Explorer charts.
- **PARTIAL** records may contribute only metrics whose field status is `valid`.

## Population

| Cohort | Count |
|--------|------:|
| Eligible shoes assessed | **85** |

## Classification

| Status | Count | Share |
|--------|------:|------:|
| VALID | 83 | 97.6% |
| PARTIAL | 0 | 0.0% |
| SUSPECT | 2 | 2.4% |
| INVALID | 0 | 0.0% |

### Status rules (summary)

- **INVALID** — any field with an impossible / inconsistent value (e.g. negative drop, unit-confused weight, heel−forefoot vs drop mismatch).
- **SUSPECT** — no invalid fields, but at least one outlier or soft inconsistency requiring human review.
- **PARTIAL** — identity OK, no suspect/invalid flags, but missing one or more geometry fields required for a complete VALID row (weight, drop, heel/forefoot stack, plate) or identity image/brand/model gap.
- **VALID** — identity + geometry present and sane; optional fields (primary use, gender, price, release, surface) may be absent.

## Coverage by field

| Field | Present | Valid | Absent | Suspect | Invalid | Present % | Valid % |
|-------|--------:|------:|-------:|--------:|--------:|----------:|--------:|
| brand | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| model | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| primaryImage | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| primaryUse | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| gender | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| weight | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| drop | 85 | 83 | 0 | 2 | 0 | 100.0% | 97.6% |
| heelStack | 85 | 83 | 0 | 2 | 0 | 100.0% | 97.6% |
| forefootStack | 85 | 83 | 0 | 2 | 0 | 100.0% | 97.6% |
| price | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |
| releaseYear | 2 | 2 | 83 | 0 | 0 | 2.4% | 2.4% |
| surface | 74 | 74 | 11 | 0 | 0 | 87.1% | 87.1% |
| plate | 85 | 85 | 0 | 0 | 0 | 100.0% | 100.0% |

## Valid metric samples (statistics-safe)

Counts of eligible shoes whose field value may enter market insights / charts.

| Metric | Valid samples |
|--------|--------------:|
| weight | 85 |
| drop | 83 |
| heelStack | 83 |
| forefootStack | 83 |
| price | 85 |
| plate | 85 |

## Suspect records

| Slug | Brand | Codes |
|------|-------|-------|
| `saucony-xodus-ultra-3` | saucony | drop_stack_soft_mismatch |
| `topo-athletic-terraventure-5` | topo-athletic | drop_stack_soft_mismatch |

## Invalid records

_None._

## Statistics affected

These public calculations omit SUSPECT/INVALID field values:

- marketInsights.averageWeightByBrand
- marketInsights.averageOfferPriceByBrand
- marketInsights.lightestDailyTrainers
- marketInsights.highestStackShoes
- marketInsights.lowestDropTrainers
- marketInsights.bestValueUnderPrice (price + valueScore path)
- marketInsights.platedVsNonPlated
- marketInsights.summary averages (weight/drop/stack/price)
- dataExplorer.weightDistribution
- dataExplorer.dropDistribution
- dataExplorer.stackDistribution
- dataExplorer.priceDistribution
- dataExplorer.brandAverage charts
- pageInsights.avgWeightG / avgDropMm / avgHeelStackMm

## Sanity rules (defensible bounds)

| Check | Invalid | Suspect |
|-------|---------|---------|
| Weight (g) | ≤0, <100, >550, or likely oz-as-g (<50) | 100–129 or 451–550 edge |
| Drop (mm) | <0 or >16 | >14 |
| Heel stack (mm) | ≤0 or outside 12–55 | outside 18–48 |
| Forefoot stack (mm) | ≤0 or outside 8–50 | outside 12–42 |
| Geometry | forefoot > heel with drop ≥0, or \|heel−forefoot−drop\| > 2.5 | soft mismatch Δ > 1.25 |
| Offer price | ≤0 or >800 | <35, >350, unusual currency, possible cents |
| Release year | non-int or outside 1995–(current+1) | <2018 |

## Machine-readable output

CI artifact: `docs/data-products/data/running-shoe-database-quality.json`

Run: `npm run shoe-database:qa`
