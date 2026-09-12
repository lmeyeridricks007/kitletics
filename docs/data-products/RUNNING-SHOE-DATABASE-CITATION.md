# Running Shoe Database — Citation, freshness & research export

Generated: 2026-09-11  
Page: `/running/shoes/database`  
Code: `src/lib/running-shoe-database/citation/`

## Purpose

Make the Running Shoe Database understandable and citable for journalists, publishers and researchers — without changing the core explorer UX.

## Freshness policy

**Do not** show “Dataset updated [date]” from:

- `Date.now()` / build / deploy time  
- Identical `SEED_DATES.updated` stamps on every product (current state: all 85 eligible shoes share one seed `updatedAt`)  
- `lastVerifiedAt` offer verification churn  

**Do** show “Dataset updated …” only when `RUNNING_SHOE_DATASET_META.updatedOn` is set intentionally in `dataset-meta.ts` after a real cohort refresh.

Current meta:

- `version`: `2026.09` (citation label)  
- `updatedOn`: `null` → freshness line **omitted** on the page  

Bump `version` / set `updatedOn` (YYYY-MM-DD) only when the eligible cohort or research extract materially changes.

## Citation

Suggested form (engine-generated):

```text
Kitletics Running Shoe Database (version 2026.09), Kitletics, https://kitletics.com/running/shoes/database
```

When `updatedOn` is set, the citation includes that date. Wording states this is **not** peer-reviewed academic data.

## Contact / corrections

Uses existing public trust contact: `hello@kitletics.com` (`/contact`).

Prefixed mailto subjects:

- Data questions  
- Product data corrections (asks for product URL)  
- Press / research enquiries  

No private personal contact addresses.

## Research CSV decision

**Yes — limited research extract only.**  
**No — full proprietary enriched catalog dump.**

| Include | Exclude |
|---------|---------|
| brand, model | recommendation / value scores |
| release year | affiliate URLs / offer URLs |
| weight, drop, heel/forefoot stack | evidence internals |
| primary use, surface | operational / publish metadata |
| launch_price column (blank until canonical MSRP exists) | live regional offer prices |

Endpoint: `/running/shoes/database/research.csv`  
Builder: `buildRunningShoeResearchExportRows` / `serializeRunningShoeResearchCsv`  
`X-Robots-Tag: noindex` on the CSV response.

Commercial rationale: journalists get a safe factual table they can cite; Kitletics retains proprietary ranking, affiliate and enrichment layers that power the product.
