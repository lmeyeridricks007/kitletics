# Running Editorial Indexation Recalibration — Editorial 49

**Document ID:** `13-RUNNING-INDEXATION-RECALIBRATION`  
**Generated:** 2026-09-09  
**Scope:** Recalculate Running indexability from EDITORIAL_READY — no bulk URL enablement  
**Data:** [`data/49-running-indexation-before.json`](data/49-running-indexation-before.json) · [`data/49-running-indexation-after.json`](data/49-running-indexation-after.json) · [`data/49-running-indexation-delta.json`](data/49-running-indexation-delta.json) · [`data/49-sitemap-eligibility.json`](data/49-sitemap-eligibility.json)  
**Scripts:** `scripts/tmp/prelaunch-49-running-indexation.ts` · uniqueness regen `scripts/tmp/prelaunch-25-content-uniqueness.ts`

## Default rule (applied)

```text
Running
+ EDITORIAL_READY
+ production published
+ unique intent
+ canonical / unique-path estate
+ internally linked (Fix 47 graph)
→ INDEXABLE
```

**Readiness ≠ launch enablement** for other verticals — fitness / padel / tennis / etc. may be READY and stay `HIDDEN_404` / noindex per `verticalLaunchStrategy`.

## What changed (no bulk enable)

| Action | Mechanism |
|---|---|
| Fresh uniqueness assessment | Re-ran Fix 25 auditor → regenerated `CONTENT_UNIQUENESS_REVIEW_HOLDS` |
| Cleared only passes | Hold set **472 → 383** (−89). Newly UNIQUE/ACCEPTABLE Running reviews became READY → INDEXABLE |
| Alternatives holds | Fresh pair-diff on 15 held pages → **all cleared** (substantive unique reasons; `canPublishAlternativesPage` already ok) |
| Vertical strategy | **Unchanged** — Running `enabled`; others selective/disabled |
| Soft-gates | **Unchanged** — accessories / padel soft-gates remain |
| Count ceilings | **None** (Fix 28 / 48) |

Sitemap continues to build only from `isIndexableEligibility` (`src/app/sitemap.ts`) — rebuilt counts below.

## Before / after by type (Running)

| Type | Running total | READY before | INDEXABLE before | READY after | INDEXABLE after | Δ INDEXABLE |
|---|---:|---:|---:|---:|---:|---:|
| **Review** | 367 | 96 | 96 | **169** | **169** | **+73** |
| **Best** | 44 | 44 | 44 | 44 | 44 | 0 |
| **Guide** | 41 | 35 | 35 | 35 | 35 | 0 |
| **Comparison** | 65 | 65 | 65 | 65 | 65 | 0 |
| **Alternatives** | 131* | 77 | 77 | **92** | **92** | **+15** |

\*Running products in `ALTERNATIVES_INDEXABLE_CATEGORIES` only.

### Invariants (after)

| Check | Result |
|---|---|
| Running READY ⊆ INDEXABLE gap | **0** for every type |
| Non-Running INDEXABLE | **0** (vertical hold intact) |
| Absolute Best/Review URL quotas | **None** |

## Surface notes

### Reviews
- Every newly READY unique Running Review is INDEXABLE.
- DUPLICATIVE / high-risk holds removed **only** where Fix 25 re-classification passed.
- Remaining holds (383 sitewide) stay out of READY/INDEXABLE until rewritten uniquely.

### Best
- All **44** READY Running Best Guides remain INDEXABLE.
- No arbitrary ceiling.

### Guides
- All **35** READY Running Guides with unique intent remain INDEXABLE.
- **6** Running guides not READY (depth/decision incomplete or soft-gated category) stay held — not force-enabled.

### Comparisons
- All **65** READY meaningful Running comparisons remain INDEXABLE.

### Alternatives
- **+15** substantive Running Alternatives pages unlocked after fresh uniqueness clearance.
- Still gated by parent product INDEXABLE + category allowlist + decision-shape publish check.

## Other verticals

| Metric (after) | Non-Running READY | Non-Running INDEXABLE |
|---|---:|---:|
| Review | 33 | **0** |
| Best | 14 | **0** |
| Guide | 27 | **0** |
| Comparison | 29 | **0** |

## Sitemap (from eligibility)

`simulateDay1LaunchCounts` + live `sitemap()` snapshot ([`49-sitemap-eligibility.json`](data/49-sitemap-eligibility.json)):

| Kind | INDEXABLE | Notes |
|---|---:|---|
| product | **359** | Running-enabled vertical + quality |
| review | **169** | +73 vs pre-recalibration |
| best-guide | **44** | All Running READY Best |
| buying-guide | **35** | All Running READY Guides |
| comparison | **65** | All Running READY comps |
| alternatives (audit) | **92** | Paths under `/products/…/alternatives` |

**Sitemap entries:** **883** total (prefix mix: `reviews` 170, `best` 45, `guides` 36, `compare` 66, `products` 451, `running` 26, …).

## Definition of done

- [x] Running + READY → INDEXABLE (0 READY-not-indexable gap)  
- [x] Uniqueness holds regenerated (not hand-emptied)  
- [x] Alternatives holds cleared only after fresh assessment  
- [x] Other verticals remain non-indexable  
- [x] No count ceilings  
- [x] Sitemap driven by eligibility  
- [x] Before/after report  

## Follow-ups

- Continue unique rewrites for remaining held Running reviews (~198 still uniqueness-held among 367).  
- Soft-gated Running accessories catalog stays noindex until category content policy lifts soft-gate.
