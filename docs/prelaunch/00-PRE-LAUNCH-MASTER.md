# Kitletics Pre-Launch Master Evidence Pack

**Document ID:** `00-PRE-LAUNCH-MASTER`  
**Mode:** Consolidation of **full re-audit** after remediations 01–13  
**Audit clock (shared):** 2026-09-06  
**Re-audit generated:** 2026-09-06 (UTC afternoon lab run)  
**Purpose:** Self-contained evidence for an **external launch reviewer**.  
**Companion:** [FINAL-GO-LIVE-READINESS.md](./FINAL-GO-LIVE-READINESS.md) — before/after, Day-1 pool, GO status.

**This pack does not publish the site.**

**Supporting reports (regenerated)**

| # | Report | Data |
|---|---|---|
| 01 | [Catalog inventory](./01-catalog-inventory.md) | [JSON](./data/01-catalog-inventory.json) |
| 02 | [Product quality](./02-product-quality.md) | [JSON](./data/02-product-quality.json) |
| 03 | [Editorial quality](./03-editorial-quality.md) | [JSON](./data/03-editorial-quality.json) |
| 04 | [SEO / indexation](./04-seo-indexation.md) | [JSON](./data/04-seo-indexation.json) |
| 05 | [Architecture / links](./05-architecture-internal-links.md) | [JSON](./data/05-link-graph.json) |
| 06 | [Media / offers / trust](./06-media-offers-trust.md) | [JSON](./data/06-media-offers-trust.json) |
| 07 | [Performance / technical](./07-performance-technical.md) | [JSON](./data/14-route-lab.json) |
| 13 | [Launch eligibility](./fixes/13-launch-eligibility.md) | [JSON](./data/14-day1-eligibility.json) |

Original baseline copies: `data/baseline-original/`.

---

## 1. Executive snapshot (re-audit)

| Metric | Value | Source |
|---|---:|---|
| Sitemap entry count | **850** | 04 |
| Sitemap ∩ crawl indexable (05) | **846** | 05 |
| Day-1 launch-eligibility INDEXABLE entities | **735** | 14-day1 |
| Raw product records | **717** | 01, 02 |
| Production-exposed products | **623** | 01 |
| Product LAUNCH_READY (quality audit) | **312** (43.5% of 717) | 02 |
| Product INDEXABLE (eligibility) | **248** | 04 / 14 |
| Running LAUNCH_READY | **280** | 02 |
| Running shoes LAUNCH_READY | **83 / 84** | 02 |
| Reviews LAUNCH_READY | **503** | 03 |
| Reviews INDEXABLE (eligibility) | **225** | 04 / 14 |
| Best published | **58** | 03 |
| Best LAUNCH_READY (editorial audit) | **9** | 03 |
| Best INDEXABLE (eligibility) | **18** | 04 / 14 |
| Guides COMPLETE | **68 / 68** | 03 |
| Guides INDEXABLE | **41** | 04 / 14 |
| Comparisons meaningful | **102 / 102** (0 thin) | 03 |
| Comparisons INDEXABLE | **69** | 04 / 14 |
| Indexable orphans | **15** | 05 |
| Filter sort leakage (`?sort=` INDEXABLE) | **0** (NOINDEX) | 04 |
| Trust missing routes | **[]** | 06 |
| Fake AggregateRating blocker | **false** | 06 |
| Visible first-hand reviews | **0** | 06 |
| Shared First Load JS | **103 kB** | 07 build |
| CI (build/lint/tsc/test) | **all green** | 07 |

---

## 2. Page-type table (sitemap + quality + eligibility)

| Page type | Sitemap (04) | Quality gate | Eligibility INDEXABLE | Notes |
|---|---:|---|---:|---|
| Home | 1 | — | 1 | |
| Sport hubs (+ classified) | 20 | vertical policy | 1 sport INDEXABLE (running) | Fitness/racket hubs noindex / held |
| Category | 17 | soft-gates | 17 | Soft-gated cats excluded |
| Product | 248 | 312 LR quality | 248 | Eligibility ⊂ quality |
| Review | 225 | 503 LR quality | 225 | Vertical + eligibility hold |
| Best | 18 | 9 LR audit | 18 | **Gate mismatch** — see FINAL |
| Guide | 41 | 68 COMPLETE | 41 | Non-running held |
| Comparison | 69 | 102 meaningful | 69 | Non-running held |
| Brand | 103 | hub gate | 103 | |
| Alternatives | 74 | relationship gate | 74 | |
| Finder/Calc/Tool | 16+5+3 | available | 25 tools INDEXABLE | Some orphans (05) |
| Setup | 5 | — | 5 | |
| Author | 1 | desk | 1 | |

---

## 3. Quality scoreboard (same thresholds)

### Products (02 — unchanged classifier)

| Class | All | Running | Shoes |
|---|---:|---:|---:|
| LAUNCH_READY | 312 | 280 | 83 |
| NEEDS_MINOR_WORK | 233 | 87 | 0 |
| THIN | 78 | 0 | 0 |
| BLOCKED | 94 | 71 | 1 |

### Editorial (03 — unchanged classifier)

| Surface | Ready | Other |
|---|---:|---|
| Reviews LAUNCH_READY | 503 | 5 BLOCKED |
| Best LAUNCH_READY | 9 | 33 minor · 16 thin |
| Guides COMPLETE | 68 | 0 thin |
| Comparisons meaningful | 102 | 0 thin |

---

## 4. SEO / architecture highlights

- **Sitemap halved** vs baseline (~1651 → **850**) via launch eligibility.
- **Sort filter leakage fixed:** `/running/shoes?sort=price-asc` → **NOINDEX** + canonical to clean URL.
- **Orphans:** **15** (was 26) — remaining include clothing comparisons, fuel guides, fitness/tennis finders.
- **Chrome still links** some held vertical hubs (`/fitness`, `/padel`, `/racket`) — hubs may 200 with noindex or redirect policy; deep entities HIDDEN.

---

## 5. Media / offers / trust (06)

| Check | Result |
|---|---|
| Authentic primary media | **100%** |
| Media gaps | **0** |
| Products with zero offers | **0** |
| Regions with Offer rows | **4** (NL/DE/UK/US) — BE/FR/ZA empty |
| Evidence coverage (products) | **96.3%** |
| Missing trust routes | **[]** |
| First-hand claim blockers | **0** |

---

## 6. Performance (07)

| Check | Result |
|---|---|
| Shared JS mega-chunk | **Cleared** (103 kB shared) |
| Hub/PDP image weight | **Still HIGH** (3–11 MB transfers) |
| axe serious/critical P0 | **0** |
| CI | **Green** |

---

## 7. Launch eligibility Day-1 pool

See [FINAL-GO-LIVE-READINESS.md](./FINAL-GO-LIVE-READINESS.md) and [`data/14-day1-eligibility.json`](./data/14-day1-eligibility.json).

| Disposition | Entity count |
|---|---:|
| INDEXABLE | **735** |
| PUBLIC_NOINDEX | **213** |
| HIDDEN_404 | **648** |

---

## 8. Open issues for external reviewer

1. **Best gate mismatch:** editorial audit LAUNCH_READY **9** vs eligibility INDEXABLE **18** — eligibility assessor may be looser; tighten before claiming Best quality parity.
2. **Image weight** on running shoes / brand hubs.
3. **Finder First Load ~851 kB**.
4. **Orphan finders** for held verticals still in sitemap.
5. **Regional commerce:** NL primary; do not claim global offers.

---

## 9. Status pointer

**Final launch recommendation lives only in** [FINAL-GO-LIVE-READINESS.md](./FINAL-GO-LIVE-READINESS.md).
