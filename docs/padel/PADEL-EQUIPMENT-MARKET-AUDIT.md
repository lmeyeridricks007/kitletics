# Padel equipment market audit

**Date:** 2026-09-13  
**Principle:** Catalog models the commercially meaningful market. Editorial curation is separate.  
**Discovery markets:** ES · NL · BE · DE · FR · broader EU (NL is commerce-primary, not discovery-only).

## Metrics (do not conflate)

| Metric | Value | Meaning |
| --- | ---: | --- |
| **Discovery completeness** | **100%** | Brand × category research cells finished (`COMPLETE` / `NOT_APPLICABLE`) |
| **Catalog capture rate** | **100%** | Discovered current products that exist in canonical catalog |
| Market discovered (current) | 360 | Verified/likely CURRENT rows after exclusions |
| Catalog soft-goods total | 355 | All balls+bags+grips+accessories products |
| Unresolved candidates | 0 | Must be 0 for discovery COMPLETE |
| Known current missing | 0 | Must be 0 for catalog COMPLETE |

> Do **not** read catalog capture alone as “market complete.” Capture can be 100% while discovery is still open.

## Before → After (this discovery-finish pass)

Baseline at start of finish pass: **262** researched-scope products (46/104/47/65).

| Category | Before (finish pass) | After catalog | Ready (published+hero) | Market discovered | Catalog capture % |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balls | 46 | 62 | 48 | 62 | 100% |
| Bags | 104 | 124 | 78 | 125 | 100% |
| Grips | 47 | 85 | 48 | 86 | 100% |
| Accessories | 65 | 84 | 44 | 87 | 100% |
| **TOTAL** | **262** | **355** | | **360** | **100%** |

Publication readiness is intentionally lower: media and commerce are separate pipelines. Draft rows stay non-public until authentic heroes exist.

**Media triage (2026-09-13):** candidate queue cleared (0 CANDIDATE). Verified soft-goods heroes **230 / 355** (65%). Remaining **123 MISSING** need distinct manufacturer packshots — logos/shared-hero/wrong-SKU hits rejected rather than published.

## Dimension classifications

- **MARKET_DISCOVERY:** COMPLETE
- **DISCOVERY_COMPLETENESS:** 100%
- **CATALOG_CAPTURE:** 100%
- **CATALOG_COVERAGE:** COMPLETE
- **MEDIA_COVERAGE:** INCOMPLETE
- **COMMERCE_RESEARCH:** COMPLETE
- **COMMERCE_COVERAGE:** INCOMPLETE
- **EDITORIAL_COVERAGE:** INCOMPLETE
- **PUBLICATION_READINESS:** PARTIAL
- **CATEGORY_COMPLETE:** true

**Honesty:** `COMMERCE_RESEARCH = COMPLETE` and `COMMERCE_COVERAGE = INCOMPLETE` are both correct. Products without Kitletics Offers stay in the catalog; the UI shows regional “no verified retailer offers” copy rather than dropping recommendations.

## Completeness by brand (discovery status)

| Brand | Balls | Bags | Grips | Accessories | Overall |
| --- | --- | --- | --- | --- | --- |
| HEAD | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Bullpadel | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Nox | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Adidas | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Babolat | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Wilson | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Kuikma | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Siux | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| StarVie | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Tecnifibre | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Dunlop | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Varlion | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Drop Shot | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Joma | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Oxdog | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Black Crown | COMPLETE | COMPLETE | COMPLETE | COMPLETE | COMPLETE |
| Royal Padel | NOT_APPLICABLE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Lok | NOT_APPLICABLE | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| Sane | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Volt | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Slazenger | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| Prince | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| Tretorn | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| RS | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Osaka | COMPLETE | COMPLETE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Fila | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| Pallap | COMPLETE | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE |
| Softee | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE |
| Pascal Box | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE |
| Ball Rescuer | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE |
| TuboPlus | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE |
| Hesacore | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| ShockOut | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE | COMPLETE |
| Tourna | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | NOT_APPLICABLE | COMPLETE |
| Bounce Tube | NOT_APPLICABLE | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | COMPLETE |
| 4ON | COMPLETE | NOT_APPLICABLE | COMPLETE | COMPLETE | COMPLETE |
| Noene | NOT_APPLICABLE | NOT_APPLICABLE | COMPLETE | NOT_APPLICABLE | COMPLETE |

Full evidence: `docs/padel/PADEL-BRAND-RESEARCH-EVIDENCE.md`

## Completeness by category

| Category | Brands researched | Products discovered | Cataloged | Excluded inventory rows | Unresolved |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balls | 23 | 62 | 62 | 9 | 0 |
| Bags | 23 | 125 | 125 | 12 | 0 |
| Grips | 28 | 86 | 86 | 3 | 0 |
| Accessories | 22 | 87 | 87 | 21 | 0 |

## Artifacts

- `docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv` (includes excluded candidates)
- `docs/padel/data/PADEL-EQUIPMENT-COVERAGE-MATRIX.csv`
- `docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json`
- `docs/padel/PADEL-MISSING-EQUIPMENT.md`
- `docs/padel/PADEL-BRAND-RESEARCH-EVIDENCE.md`
- `docs/padel/PADEL-TIER1-BRAND-CATEGORY-DISCOVERY-2026-09.md`
- `docs/padel/PADEL-TIER2-SPECIALIST-DISCOVERY-2026-09.md`
- Admin: `/admin/catalog/padel-equipment`

## Gate

`MARKET_DISCOVERY = COMPLETE` only when: Tier-1+Tier-2+specialists researched, research queue empty, no unresolved candidates, no incomplete brand ranges, validation pass finds zero new meaningful gaps, and catalog capture is 100% of discovered current set.
