# Padel final remediation audit

**As of:** 2026-09-13  
**Plan:** [`PADEL-REMEDIATION-PLAN.md`](./PADEL-REMEDIATION-PLAN.md)  
**Before:** [`PADEL-PRELAUNCH-AUDIT.md`](./PADEL-PRELAUNCH-AUDIT.md) · [`data/PADEL-PRELAUNCH-SUMMARY.json`](./data/PADEL-PRELAUNCH-SUMMARY.json)  
**After evidence:** [`data/PADEL-FINAL-REMEDIATION-SUMMARY.json`](./data/PADEL-FINAL-REMEDIATION-SUMMARY.json) · [`data/PADEL-FINAL-REMEDIATION-ISSUES.csv`](./data/PADEL-FINAL-REMEDIATION-ISSUES.csv) · [`data/PADEL-FINAL-URL-CRAWL.csv`](./data/PADEL-FINAL-URL-CRAWL.csv)

---

## Verdict

**GO**

Confirmed rendered BLOCKER = **0** · HIGH = **0** · `required_zero_pass` = **true**  
Full production crawl of **277** public/indexable Padel URLs at `http://127.0.0.1:3011` after clean build.

---

## BEFORE → AFTER

| Metric | Before (prelaunch) | After (final crawl) |
| --- | ---: | ---: |
| BLOCKER | 96 | **0** |
| HIGH | 10 | **0** |
| token leaks | 13 | **0** |
| machine-like copy | 20 | **0** |
| broken decisions | 4 | **0** |
| wrong-sport images | 54 | **0** |
| wrong-product images | 4 | **0** |
| wrong-brand images | 0 | **0** |
| raw schema keys | 3 (+ manual) | **0** |
| fake testing | 0 | **0** |
| fake ratings (confirmed) | 0* | **0** |
| broken indexable URLs | 0 | **0** |
| `/padel` hub | PUBLIC_NOINDEX | **INDEXABLE** |
| `/padel/rackets/database` | PUBLIC_NOINDEX | **INDEXABLE** |
| Indexable inventory | 225 | **239** |
| Sitemap expected | 225 | **239** |
| CI (lint / typecheck / test / build) | mixed / failing expectations | **PASS** |

\*Prelaunch closed 23 FAKE_RATINGS hits as false positives (“not a popularity rank”); detector now excludes those anti-claims.

Soft-gated `/padel/accessories` + `/padel/clothing` remain **404 / held** and unlinked from hub discovery — intentional, not defects.

---

## Root-cause families fixed

| Family | Fix |
| --- | --- |
| **GUIDE_INTERNAL_ID_COPY** | Rewrote `PADEL_KNOWLEDGE_UNIQUE` example whys; UI label → “Why this example works”; padel visual family empty (no FlipBelt / running diagrams) |
| **RAW_SCHEMA_LABEL** | Extended `formatPublicSpecDisplayLabel`; database/research chrome; padel review `padelSpecLines` uses public labels |
| **PUBLIC_SKU_WORDING** | Replaced public `SKU` with model/variant language in padel editorial |
| **BROKEN_DECISION_FRAGMENT** | Stopped dumping `evidenceKind` into PDP score blurbs; tightened corruption detector (no `teardrop`→`drop` false stamp); Wilson Blade reasonings rewritten as full sentences |
| **WRONG_SPORT_MEDIA** | Padel guide visual family; section visuals drop tennis/running fillers; semantic gate rejects running/tennis/fitness heroes on padel |
| **WRONG_PRODUCT_MEDIA** | Nox Alum XTREM → alum-xtrem hero; Wilson overgrip + court shoes under `/images/padel/` |
| **WRONG_MEDIA_NAMESPACE** | Re-registered padel shoe/overgrip paths under `/images/padel/products/` |
| **SEO_INDEXABILITY** | Selective padel: hub, live categories, database, published research indexable; prices research withheld; accessories/clothing held |
| **PERFORMANCE** | Hub hero re-encoded as real JPEG (~272KB) |
| **TEST_EXPECTATION** | Launch/racket tests expect live padel; tennis etc. still held; remediation regression suite added |
| **PREEXISTING_COMMERCE** | Classified and reconciled (FR coverage test, GPS-watch coverage scope, offer URL listing paths, Novablast RWS listing URL) |

---

## CI

| Gate | Result |
| --- | --- |
| `npm run lint` | PASS (warnings only in tmp scripts) |
| `npm run typecheck` | PASS |
| `npm test` | **910 / 910 PASS** |
| `npm run build` | PASS |
| `next start` + full Padel crawl | PASS · issues = 0 |

---

## Manual canaries (rendered)

Hub `/padel`, rackets, shoes, database — indexable, padel media, human labels.  
PDPs: Vertex, Genius 18K, Alum XTREM, Metalbone — no SKU / no `prod-*` / correct heroes.  
Guides: no “maps to prod-” / FlipBelt.  
Research: human weight titles; Article JSON-LD on published stories.  
Prices research remains intentionally noindex.

---

## Non-goals preserved

No catalog/editorial expansion · no padel-specific commerce forks · tennis/pickleball/badminton/squash remain held · no thin accessories/clothing pages invented.
