# Running Headphones Catalog Report

Generated: 2026-09-04

## Summary

| Metric | Count |
| --- | ---: |
| Total headphones SKUs | **17** |
| Published | **3** |
| Draft (media-gated) | **14** |
| Brands | **9** |
| Inventory-backed subcategories | **4** |
| Best guide picks | **10** |
| Comparisons | **3** |
| Recommendations | **29** |
| Product families | **6** |

Category-specific Product architecture (`cat-headphones`) — not a generic Accessories dump. Review criteria emphasize sound, secure fit, stability, battery, weather, and **situational awareness**.

## Taxonomy

| Subcategory | Depth | Notes |
| --- | ---: | --- |
| Open-Ear | 9 | Dual-tagged with bone / ear-hook / TWS where relevant |
| Bone Conduction | 3 | OpenRun family + Suunto Wing |
| True Wireless | 11 | Sport TWS + open TWS styles |
| Ear-Hook | 7 | Powerbeats, OpenFit, AeroFit, FreeClip, etc. |

## Specs

weight, battery, caseBattery, charging, waterRating, openEar, boneConduction, anc, transparency, microphone, secureFit, controls, multipoint, codec, safetyAwareness; type enum includes `ear-hook`.

## Use cases

situational-awareness, gym/indoor, daily, long runs, trail, rain — plus existing road training tags.

## Catalog

| Product | Brand | Status | Lanes |
| --- | --- | --- | --- |
| OpenRun Pro 2 | Shokz | published | bone + open |
| Ultra Open Earbuds | Bose | published | open + ear-hook |
| AirPods Pro 2 | Apple | published | TWS / ANC |
| OpenRun | Shokz | draft | bone + open |
| OpenFit 2 | Shokz | draft | open + ear-hook |
| OpenDots One | Shokz | draft | open + TWS + hook |
| LinkBuds Open | Sony | draft | open + TWS |
| LinkBuds Fit | Sony | draft | TWS |
| Elite 8 Active Gen 2 | Jabra | draft | TWS secure |
| Elite 10 Gen 2 | Jabra | draft | TWS ANC |
| Powerbeats Pro 2 | Beats | draft | ear-hook + TWS |
| Fit Pro | Beats | draft | TWS |
| AeroFit 2 | soundcore | draft | open + ear-hook |
| Sport X20 | soundcore | draft | TWS + hook |
| FreeClip 2 | HUAWEI | draft | open + hook + TWS |
| Wing | Suunto | draft | bone + open |
| AirPods 4 | Apple | draft | TWS |

## Best / comparison

- **Best Running Headphones** — enriched (10 picks across open/bone/ear-hook/TWS)
- Comparisons: OpenRun Pro 2 vs Ultra Open; OpenRun Pro 2 vs AirPods Pro 2; Elite 8 Active vs Powerbeats Pro 2
- Buying guide: `guide-headphones-types` (existing)

## Editorial note

Outdoor picks prioritize awareness wording — no headphone is “safe by design” on traffic routes.

## Acceptance

- [x] Category-specific specs + recommendation factors
- [x] Full subtype coverage (open-ear, bone, TWS, ear-hook)
- [x] Multi-brand catalog (not Shokz-only)
- [x] Best + comparisons + alternatives graph
- [ ] Published depth — blocked on authentic heroes for wave2
- [x] Report at `reports/running-headphones-catalog.md`
