# Running Heart Rate Monitor Catalog Report

Generated: 2026-09-04T14:47:23.302Z

## Summary

| Metric | Count |
| --- | ---: |
| Published HRMs | **15** |
| Brands | **6** |
| Product families | **7** |
| Subcategories | **4** |
| Published reviews | **15 / 15** |
| Authentic heroes | **15 / 15** |
| Products with ≥1 offer | **15 / 15** |
| Best guides | **4** |
| Comparisons | **6** |
| Contextual recommendations | **74** |
| ProductRelationships | **19** |

## Brands

- **COROS** — 1
- **Garmin** — 4
- **Polar** — 3
- **Scosche** — 2
- **Suunto** — 1
- **Wahoo** — 4

## Product families

- **Heart Rate Monitor** — Heart Rate Monitor
- **HRM** — HRM 200, HRM 600, HRM-Fit, HRM-Pro Plus
- **H Series** — H10, H9
- **Verity Sense** — Verity Sense
- **Rhythm** — Rhythm+ 2.0, Rhythm24
- **Smart Heart Rate Belt** — Smart Heart Rate Belt
- **TICKR / TRACKR** — TICKR, TICKR FIT, TICKR X, TRACKR Heart Rate

## Subcategories (inventory-backed)

- **Chest Straps** (`chest-straps`) — 10 products
- **Arm-Band HR Monitors** (`armband-hr-monitors`) — 5 products
- **Optical HR Monitors** (`optical-hr-monitors`) — 5 products
- **Running Dynamics / Advanced Sensor Straps** (`running-dynamics-straps`) — 3 products

## Models onboarded

| Product | Brand | Family | Lifecycle | Subcategory | Media | Offers | Review | Score |
| --- | --- | --- | --- | --- | --- | ---: | --- | ---: |
| COROS Heart Rate Monitor | COROS | Heart Rate Monitor | current | Arm-Band HR Monitors, Optical HR Monitors | yes | 1 | yes | 81 |
| Garmin HRM 200 | Garmin | HRM | current | Chest Straps | yes | 1 | yes | 82 |
| Garmin HRM 600 | Garmin | HRM | current | Chest Straps, Running Dynamics / Advanced Sensor Straps | yes | 1 | yes | 88 |
| Garmin HRM-Fit | Garmin | HRM | current | Chest Straps | yes | 1 | yes | 80 |
| Garmin HRM-Pro Plus | Garmin | HRM | previous-generation | Chest Straps, Running Dynamics / Advanced Sensor Straps | yes | 2 | yes | 87 |
| Polar H10 | Polar | H Series | current | Chest Straps | yes | 1 | yes | 90 |
| Polar H9 | Polar | H Series | current | Chest Straps | yes | 1 | yes | 84 |
| Polar Verity Sense | Polar | Verity Sense | current | Arm-Band HR Monitors, Optical HR Monitors | yes | 1 | yes | 84 |
| Scosche Rhythm+ 2.0 | Scosche | Rhythm | current | Arm-Band HR Monitors, Optical HR Monitors | yes | 1 | yes | 78 |
| Scosche Rhythm24 | Scosche | Rhythm | current | Arm-Band HR Monitors, Optical HR Monitors | yes | 1 | yes | 76 |
| Suunto Smart Heart Rate Belt | Suunto | Smart Heart Rate Belt | current | Chest Straps | yes | 1 | yes | 81 |
| Wahoo TICKR | Wahoo | TICKR / TRACKR | previous-generation | Chest Straps | yes | 1 | yes | 74 |
| Wahoo TICKR FIT | Wahoo | TICKR / TRACKR | current | Arm-Band HR Monitors, Optical HR Monitors | yes | 1 | yes | 79 |
| Wahoo TICKR X | Wahoo | TICKR / TRACKR | previous-generation | Chest Straps, Running Dynamics / Advanced Sensor Straps | yes | 1 | yes | 76 |
| Wahoo TRACKR Heart Rate | Wahoo | TICKR / TRACKR | current | Chest Straps | yes | 1 | yes | 86 |

## Best guides

- `heart-rate-monitors-running` — Best Heart Rate Monitors for Running 2026
- `heart-rate-monitors-chest-straps` — Best Chest Strap Heart Rate Monitors 2026
- `heart-rate-monitors-intervals` — Best HR Monitors for Interval Training 2026
- `heart-rate-monitors-hyrox` — Best HR Monitors for HYROX 2026

## Comparisons

- `garmin-hrm-pro-plus-vs-polar-h10` — Garmin HRM-Pro Plus vs Polar H10
- `garmin-hrm-600-vs-polar-h10` — Garmin HRM 600 vs Polar H10
- `polar-h10-vs-polar-h9` — Polar H10 vs Polar H9
- `wahoo-trackr-vs-polar-h10` — Wahoo TRACKR vs Polar H10
- `coros-hrm-vs-polar-verity-sense` — COROS Heart Rate Monitor vs Polar Verity Sense
- `garmin-hrm-600-vs-hrm-pro-plus` — Garmin HRM 600 vs HRM-Pro Plus

## Recommendation factors (HRM-specific)

accuracy · connection stability · comfort · battery · device compatibility · running dynamics · standalone capability · ease of maintenance · versatility · value

## Review coverage

- Expert-research only (no invented first-hand testing).
- 15/15 published HRMs have published reviews (including Rhythm+ 2.0).

## Offer / media coverage

- Offers: 15/15
- Authentic heroes: 15/15
- Scosche Rhythm+ 2.0 media registered: `public/images/hrm/products/scosche-rhythm-plus-2-hero.jpg` (Target Scene7 / retailer-authorized) + `CATALOG_PRODUCT_MEDIA` entry

## Major market products missing / deferred

- Polar OH1+ (superseded by Verity Sense for most buyers)
- Coospo / no-name budget ECG straps (below Kitletics brand bar)
- Fourth Frontier X2 (specialty / medical-adjacent — monitor later)
- Garmin HRM-Dual (older line largely superseded by HRM 200 / Pro Plus / 600)
- Magene and similar value ECG clones (region-dependent)

## Acceptance checklist

- [x] Chest strap, armband, optical, dynamics lanes represented
- [x] Entry / mid / premium / previous-gen coverage
- [x] Expert-research reviews
- [x] Best guides with catalog differentiation (overall, chest, intervals, HYROX)
- [x] Comparisons + ProductRelationships
- [x] HRM-specific recommendation factors
- [x] Genuine imagery for published models
- [x] Offers seeded

## Follow-ups

1. ~~Register Scosche Rhythm+ 2.0 media and re-publish~~ **Done** — hero + registry + published product `prod-scosche-rhythm-plus-2`
2. ~~Deepen review section copy for H10 / HRM 600 / Verity Sense (+ write Rhythm+ 2.0 review)~~ **Done** — `src/content/running/reviews/hrm-flagship.ts` overrides thin backfill; unique section images under `public/images/running/products/<slug>/sections/`
3. ~~Pricing refresh for new HRM offers~~ **Done** — `npm run pricing:agent -- --mode=full|refresh` → NL displayable **389/389 (100%)**