# Fix 15 — Day-1 index eligibility recalibration

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — do not publish)  
**Machine data:** [`../data/15-day1-url-reconciliation.csv`](../data/15-day1-url-reconciliation.csv), [`../data/15-day1-recalibration-summary.json`](../data/15-day1-recalibration-summary.json), [`../data/15-exclusion-audit.json`](../data/15-exclusion-audit.json)

## Objective

Every **high-quality Running** page that deserves indexation should be INDEXABLE.  
Weak / duplicate / filter / soft-gated / held-vertical pages stay out.  
**No URL-count target.** Sitemap size is an output.

---

## BEFORE → AFTER

| Metric | Before (fix 14) | After (fix 15) | Notes |
|---|---:|---:|---|
| **Total sitemap URLs** | **850** | **867** | Audit 04 `sitemap.entryCount` — output, not a target |
| **Eligibility INDEXABLE entities** | **735** | **752** | `simulateDay1LaunchCounts()` |
| Products INDEXABLE | 248 | **248** | Soft-gated LR products still held (legitimate) |
| Reviews INDEXABLE | 225 | **285** | Aligned to page-time enrichment (editorial LR) |
| Best INDEXABLE | 18 | **9** | Seed assessment + evidence required |
| Guides INDEXABLE | 41 | **34** | Soft-gated nutrition/clothing guides held |
| Comparisons INDEXABLE | 55–69 | **55** | Soft-gated clothing comps held |
| Alternatives INDEXABLE | 74 | **74** | Gate unchanged (`canPublishAlternativesPage`) |
| Brands INDEXABLE | 103 | **103** | Substantive hubs only |
| Tools / Finders INDEXABLE | 25 | **11** (8 Finder + 2 Calc + 1 Tool) | Held-vertical finders removed |
| Sport hub INDEXABLE | 1 | **1** | Running only |
| Categories (sitemap classifier) | 17 | **17** | Classifier; soft-gated shells stay out of sitemap |
| Architecture orphans | 15 | **0** | Confirmed audit 05 re-crawl |
| Running product LR → INDEXABLE (core) | 248 | **248** | Shoes/watches/HRM/packs/etc. |
| Soft-gated Running product LR → PUBLIC_NOINDEX | 110 | **110** | Clothing / nutrition / sunglasses / accessories |

### Sitemap vs eligibility gap (~115 URLs)

Sitemap includes surfaces **not** counted as launch “entities” in the simulator:

| Sitemap-only / extra class | Approx. |
|---|---:|
| Static hubs + trust | 19 |
| Sport disciplines under Running | 6 |
| Categories / use-case listings | ~15 |
| Alternatives pages | 74 |
| Home | 1 |

Plus page-type classifier differences (audit 04 “Sport” ≈ hub + disciplines + some path shells).

**Sport 20 vs 1:** Not an eligibility bug. Eligibility counts **1** sport hub (`/running`). Sitemap + SEO classifier also count **disciplines** (`/running/road`, `trail`, `track`, …) and related shells as “Sport.” Documented; disciplines remain intentional Running landings.

---

## What changed (code)

1. **Reviews** — `assessReviewLaunchQuality` now evaluates **page-time enriched** reviews (`enrichReviewForPage`), matching prelaunch-03. Running editorial LAUNCH_READY → INDEXABLE (**285**).
2. **Best** — Quality assessed on **seed** guides (`getBestGuideSeedBySlug`), not normalize/enrich inflation; **evidenceIds required** for LAUNCH_READY → **9** INDEXABLE (matches editorial audit).
3. **Tools** — `eligibilityForTool` applies `verticalHidesDeepEntities` from `tool.sportIds`. Held padel/tennis/fitness finders → HIDDEN_404 / out of sitemap.
4. **Comparisons** — All products in soft-gated categories → PUBLIC_NOINDEX (clothing comps out).
5. **Guides** — Soft-gated `categoryId` (e.g. nutrition-fuel) → PUBLIC_NOINDEX.
6. **Chrome** — Homepage Explore/Finder default to Running; held sports “Soon” / no deep links; footer + mobile drawer stop promoting Fitness/HYROX hubs; Running hub surfaces Road/Trail/Track + shop groups.
7. **Orphans** — Heavier-runners listing linked from shoes hub; track/road/trail linked from Running hub; soft-gated comps/guides/finders deindexed rather than fake-linked.

---

## LAUNCH_READY but excluded (by class)

### Products (Running)

| Disposition | Count | Legitimate? | Reason |
|---|---:|---|---|
| PUBLIC_NOINDEX | **110** | **Yes** | Soft-gated categories: `running-clothing`, `nutrition-fuel`, `sunglasses`, `accessories` — category launch-hold, **not** an arbitrary URL ceiling |
| INDEXABLE | 248 | Yes | Core Running catalog |

No high-quality Running product is excluded solely for sitemap-size rationing.

### Reviews

| Disposition | Count | Notes |
|---|---:|---|
| INDEXABLE | **285** | All Running reviews that pass editorial LR after enrichment |
| HIDDEN_404 | ~218 | Held verticals (fitness/racket/…) |
| PUBLIC_NOINDEX | **0** | — |

### Best

| Disposition | Count | Notes |
|---|---:|---|
| INDEXABLE | **9** | Editorial LAUNCH_READY only |
| PUBLIC_NOINDEX | 30 | NEEDS_MINOR_WORK held (no approvals) |
| HIDDEN_404 | 19 | THIN / vertical hold |

### Guides

| Disposition | Count | Notes |
|---|---:|---|
| INDEXABLE | 34 | COMPLETE + Running + not soft-gated |
| PUBLIC_NOINDEX | 7 | Soft-gated category (nutrition etc.) |
| HIDDEN_404 | 27 | Held verticals |

### Comparisons

| Disposition | Count | Notes |
|---|---:|---|
| INDEXABLE | 55 | Meaningful Running comps |
| PUBLIC_NOINDEX | 14 | Soft-gated clothing comps (+ residual holds) |
| HIDDEN_404 | 33 | Held verticals |

### Tools

| Disposition | Count | Notes |
|---|---:|---|
| INDEXABLE | 12 | Running (+ cross-sport empty `sportIds` compare hub) |
| HIDDEN_404 | 13 | Held vertical finders/calculators |

---

## Soft-gate policy (acceptance)

Soft-gated Running categories remain **PUBLIC_NOINDEX** by design (weak / future catalog shells). That is **quality + topical readiness**, not a Day-1 URL cap. Core Running (shoes, watches, HRMs, hydration, packs, etc.) LAUNCH_READY products stay INDEXABLE.

---

## Orphans (target: 0 unexplained)

| URL | Action |
|---|---|
| Held finders (fitness/tennis/…) | Removed from Day-1 indexation |
| Clothing comparisons | Soft-gated → PUBLIC_NOINDEX |
| Nutrition guides | Soft-gated → PUBLIC_NOINDEX |
| `/running/track` (+ surfaces) | Linked from Running hub shop groups + footer |
| `/running/shoes/heavy-runners` | Chip on Running Shoes hub (`ShoesHowYouRun`) → `/running/shoes/heavy-runners` |

**Audit 05 (final):** orphans **15 → 0**.

---

## Acceptance checklist

- [x] Zero high-quality Running pages excluded **only** for arbitrary launch-size restriction
- [x] Zero weak/future/filter/held-vertical pages added to grow URL count
- [x] Best INDEXABLE = editorial LAUNCH_READY (9)
- [x] Held finders out of sitemap
- [x] Chrome does not promote HIDDEN held hubs as live
- [x] Reconciliation CSV accounts for every sitemap URL
- [x] SEO (04) re-run — sitemap **867**; filter indexable **0**
- [x] Architecture (05) re-run — orphans **0**

---

## Do not publish

This remains pre-launch remediation. Re-run audits 04/05 after build; update FINAL-GO-LIVE-READINESS when those complete.
