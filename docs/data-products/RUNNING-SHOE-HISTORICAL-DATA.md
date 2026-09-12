# Running Shoe Historical Data — Model, Coverage & Trend Gates

Generated: 2026-09-11  
Cohort: database-eligible `cat-running-shoes` (same gate as `/running/shoes/database`)  
Audit script: `npx tsx --tsconfig tsconfig.json scripts/running-shoe-historical-audit.ts`  
Engine: `src/lib/running-shoe-database/historical/`

## Verdict

**Historical public insights are NOT evidence-ready.**

Do **not** publish a “How running shoes have changed” section, year-trend charts, or claims such as “shoes are X% lighter since 2018” until release-year coverage, per-year samples, brand diversity, and (for price) launch/MSRP fields clear the thresholds below.

Current catalog geometry (weight, stack, drop, plate) is excellent for **today’s market structure** — that is what Data Explorer / Market Insights already use. It is **not** a backfilled history.

---

## Coverage audit (canonical Kitletics data)

Denominator **n = 85** eligible product models.

| Field | Source | Present | Coverage | Reliable for year trends? | Notes |
|-------|--------|--------:|---------:|:--------------------------:|-------|
| release year | `Product.releaseDate` → UTC year | 2 | 2.4% | **no** | Only Novablast 5 (2024) and Novablast 6 (2026) |
| generation | `Product.generation` | 85 | 100% | **no** (as time axis) | Label only; Pegasus “41” ≠ calendar year |
| product family | `Product.familyId` → `ProductFamily` | 61 | 71.8% | partial | 12 multi-member families; **1** with ≥2 verified years |
| launch price / MSRP | *(no field)* | 0 | 0% | **no** | Never use verified offer price as launch proxy |
| weight | `specifications.weight` | 85 | 100% | only with dated obs | Spec is for **this** product model only |
| heel stack | `specifications.heelStack` | 85 | 100% | only with dated obs | Same |
| forefoot stack | `specifications.forefootStack` | 85 | 100% | only with dated obs | Same |
| drop | `specifications.drop` | 85 | 100% | only with dated obs | Same |
| plate status | `specifications.plate` (+ material) | 85 | 100% | only with dated obs | Same |
| primary use | `Product.useCaseIds` | 85 | 100% | only with dated obs | Taxonomy on current SKUs |
| surface | `specifications.surface` | 74 | 87.1% | only with dated obs | Same |

### Additional lineage signals

| Signal | Count | Implication |
|--------|------:|-------------|
| Distinct release years in cohort | 2 | Far below public trend minimum (5) |
| `lifecycleStatus = previous-generation` | 12 | Prior gens may exist as separate SKUs — still need their own years + specs |
| Multi-member families | 12 | Generation labels differ; years usually missing |
| Multi-member families with ≥2 release years | 1 | Novablast only |
| `previous-generation` / `next-generation` relationships among shoes | **0** | No usable lineage graph for chronological walks |

### What we refuse to do

- Invent `releaseYear` from generation numbers or SKU names  
- Treat current offer / “From” price as launch/MSRP  
- Copy Novablast 6 specs onto Novablast 4/5 (or any peer)  
- Publish thin year charts from n=1–2 dated models  
- Claim market-wide change from a single brand/family anecdote  

---

## Historical observation model

Normalized type: `HistoricalShoeObservation`  
(`src/lib/running-shoe-database/historical/types.ts`)

| Dimension | Field | Rule |
|-----------|-------|------|
| Identity | `productId`, `productSlug` | One observation per product model |
| Family | `familyId`, `familySlug`, `familyName` | Optional; omit when unknown |
| Generation | `generationLabel` | String label only — never a year |
| Brand | `brandId`, `brandSlug`, `brandName` | Required from catalog |
| Release | `releaseYear`, `releaseDate` | Only from verified `Product.releaseDate` |
| Launch price | `launchPriceEur` | Only when a canonical launch/MSRP field exists |
| Geometry | `weightG`, `heelStackMm`, `forefootStackMm`, `dropMm` | From **this** product’s specs |
| Plate | `plate`, `plateMaterial` | From **this** product’s specs |
| Use / surface | `primaryUseSlug`, `surface` | From **this** product |

### Provenance (required)

Every populated metric carries `evidence[field]`:

```ts
{
  kind: "catalog-product-field" | "catalog-specification" | "external-pending";
  sourceEntityId: string;   // usually product id
  sourceField: string;      // e.g. "specifications.weight"
  observedAt: string;       // ISO when materialised
  notes?: string;
}
```

Builder: `buildHistoricalObservationsFromCatalog(records)`  
— maps each database record to an observation using **only that record’s fields**.

Future external research rows must use `kind: "external-pending"` (or a later `external-verified` kind) with citation URLs in a dedicated evidence store — still never invent values.

---

## Trend eligibility (public publish gate)

Constants: `src/lib/running-shoe-database/historical/thresholds.ts`

| Gate | Threshold | Purpose |
|------|----------:|---------|
| Distinct release years | ≥ **5** | Real time span |
| Dated observations with metric | ≥ **60** | Market-level n |
| Observations per year | ≥ **12** | Avoid one-shoe years |
| Brands in dated sample | ≥ **5** | Cross-brand market |
| Max brand share per year | ≤ **40%** | Block single-brand stories |
| Release-year coverage of eligible population | ≥ **35%** | Dated subset is not a tiny slice |
| Launch-price trends | require `launchPriceEur` + same gates | Offer price never substitutes |

API:

- `assessTrendMetric(observations, metric, populationSize)`  
- `assessHistoricalPublicInsightsReadiness(observations, …)`  
- `getPublishableHistoricalSeries(readiness, metric)` → **`null` unless eligible**

Metrics reserved for a future public section (when gates pass):

1. Median weight by year  
2. Median heel stack by year  
3. Median drop by year  
4. Median **launch** price by year  
5. Plated-shoe share by year  

Prefer **medians** for weight/stack/drop/price (outlier-resistant). Use share for plated composition.

### Current readiness (live audit)

| Check | Status |
|-------|--------|
| `evidenceReady` | **false** |
| Dated observations | 2 / 85 |
| Distinct years | 2 |
| Launch-price observations | 0 |
| Publishable series | **none** |

Public status copy (engine):

> Historical market trends are not evidence-ready. Kitletics will not publish “how running shoes have changed” charts until release-year coverage, per-year samples, brand diversity, and (for price) launch/MSRP fields meet published thresholds.

---

## Architecture / data gap report (build history later)

### Gap 1 — Release dating (blocking)

**Need:** verified `Product.releaseDate` (or dedicated `releaseYear`) on ≥35% of eligible models, spanning ≥5 calendar years, with ≥12 dated models per year for charted metrics.

**Work:** research pass per SKU (brand site, press, retailer launch notes) → store date + evidence id. Do not guess from generation integers.

### Gap 2 — Launch / MSRP price (blocking for price trends)

**Need:** canonical `launchPrice` (amount + currency + region + as-of date) on Product or a `ProductLaunchCommercial` entity.

**Work:** schema + onboarding field + evidence. **Do not** backfill from live `Offer` rows.

### Gap 3 — Multi-generation lineage

**Need:**

- Populate `ProductRelationship` `previous-generation` / `next-generation` for shoe families  
- Ensure each generation is its **own** Product with its **own** specs  
- Prefer keeping previous gens in catalog (or an archive observation table) rather than overwriting  

**Forbidden:** inferring Ghost 15 stack from Ghost 16.

### Gap 4 — Historical observation store (when catalog churns)

When a current SKU is replaced, today’s specs must not vanish if we still want year charts.

Recommended later entity (not implemented yet):

```text
HistoricalShoeObservationRecord
  - observationId
  - productId (nullable if discontinued-only archive)
  - dimensions… (as model above)
  - evidence[] / evidence map
  - asOfDate
  - ingestMethod: catalog-snapshot | research | manufacturer
```

Catalog-derived observations remain the default for live SKUs; archive rows preserve superseded gens.

### Gap 5 — Editorial publish checklist

Before any public “HOW RUNNING SHOES HAVE CHANGED” UI:

1. `auditRunningShoeHistoricalCoverage().readiness.evidenceReady === true`  
2. At least one metric `trend.eligible === true`  
3. Page exposes year, sample size, coverage, brand representation per point  
4. Methodology states unit of analysis + exclusions  
5. No offer-price series labelled as launch price  

Until then: keep Data Explorer as **current-market** journalism only.

---

## Public output decision

| Output | Ship now? |
|--------|-----------|
| Data Explorer (current market charts) | yes (existing) |
| Market Insights statistics | yes (existing) |
| “How running shoes have changed” charts | **no** |
| This architecture + coverage doc | **yes** |
| Observation + eligibility engine | **yes** (tests assert not ready) |

---

## Tests

`tests/running-shoe-historical.test.ts`

- Live cohort: `evidenceReady === false`  
- Observations never invent launch price from offers  
- Specs are per-product (no cross-generation copy)  
- `getPublishableHistoricalSeries` returns null while not ready  
- Synthetic rich history can pass gates (proves engine, not that catalog is ready)

Re-run coverage:

```bash
npx tsx --tsconfig tsconfig.json scripts/running-shoe-historical-audit.ts
npx vitest run tests/running-shoe-historical.test.ts
```
