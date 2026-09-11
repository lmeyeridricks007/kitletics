# All Best Guides Completion — Editorial 39

**Document ID:** `03-ALL-BEST-GUIDES-COMPLETION`  
**Generated:** 2026-09-09  
**Assessor:** `src/domain/launch/assess-best-guide-quality.ts`  
**Data:** `docs/prelaunch/editorial/data/39-best-guides-completion.json`

## Executive status

| Metric | Count |
|---|---:|
| Best Guides assessed (`isDev`) | **58** |
| `LAUNCH_READY` | **58** |
| `NEEDS_MINOR_WORK` | **0** |
| `THIN` | **0** |
| `BLOCKED` | **0** |

**Target met:** **58/58 LAUNCH_READY**. No NMW. No THIN. No unsafe BLOCK required.

Baseline before this fix: **44 LAUNCH_READY · 5 NMW · 9 THIN** (14 non-ready).

## What changed

### 1. Vertical enrichment (14 non-ready → LAUNCH_READY)

Module: `src/content/best-guides-p2-vertical-launch-ready.ts`  
Generator: `scripts/tmp/prelaunch-39-generate-best-p2.ts`  
Wired in `src/content/best-guides.ts` after P0/P1, before compare-links + cannibalization.

| Previously | Slugs |
|---|---|
| NMW | `heart-rate-monitors-hyrox`, `home-gym-equipment`, `hyrox-shoes`, `padel-rackets`, `tennis-rackets` |
| THIN | `adjustable-benches`, `adjustable-dumbbells`, `air-bikes`, `power-racks`, `pull-up-bars`, `rowing-machines`, `training-shoes`, `treadmills-for-home`, `weight-plates` |

Per-guide upgrades:

- Intent-specific intro + `whatMattersIntro` (≥100 combined intro words)
- Methodology / selection language (affiliate-neutral)
- `evidenceIds: ["ev-catalog-editorial"]`
- `whatWeLookFor` decision factors
- Quick picks / decision shortcuts
- Considered / shortlisted / comparison product IDs
- Per-recommendation: `whyItFits`, trade-offs, Best For, Not Ideal, choose-instead — **for this guide’s job**, not global score

### 2. Cannibalization differentiation

Module: `src/content/best-guides-p2-cannibalization.ts`

| Pair | Action |
|---|---|
| `running-shoes-long-runs` ↔ `running-shoes-heavy-runners` | **Shortlist split.** Heavy runners rebuilt around load/support/durable roles (Gaviota, Adrenaline GTS, Structure Plus, Clifton Pro, 1080 v14). Shared soft/protective cores (Nimbus/Bondi/Kayano) remain with different ranking reasons. Overlap **1.00 → 0.43**. |
| `race-shoes` ↔ `carbon-plated-running-shoes` | **Intent + shortlist.** Carbon drops SC Trainer → SC Elite v4; race keeps Speed + Trainer hybrids. Copy states carbon = plate taxonomy; race = distance roles. Overlap **0.86 → 0.71** on core supershoes (expected). |
| Watch / vest / HRM / jacket / HYROX↔training pairs | **Intent copy** — explicit “this is not sibling guide X” + different ranking constraints. No doorway consolidation required. |

Nested guides (e.g. HRM running vs chest straps; umbrella watches vs music/marathon) keep overlapping sensors/devices when the catalog is small; ranking text is page-job specific.

**No consolidations removed URLs.** Differentiation preferred over deletion for launch estate completeness.

### 3. Pipeline order

```text
seeds (running + gear + padel + racket + fitness)
  → P0 launch-ready enrichment
  → P1 launch-ready enrichment
  → P2 vertical enrichment (Fix 39)
  → cannibalization differentiation (Fix 39)
  → comparison links
```

## Quality bar checklist (all 58)

| Requirement | Status |
|---|---|
| Clear intent | Pass |
| Meaningful considered / shortlist | Pass (where seeded; P2 fills gaps) |
| Final recommendations (no artificial 4/5/10 count) | Pass |
| Methodology + decision factors | Pass |
| Quick Picks | Pass (enriched guides + prior P0/P1) |
| Contextual comparison products or choose-instead | Pass |
| Detailed rec blocks (Best For / Not Ideal / strengths / trade-offs / choose-instead) | Pass |
| How we narrowed / how to choose signals | Pass via methodology + whatWeLookFor |
| Evidence IDs | Pass (`ev-catalog-editorial` minimum; product-specific where already present) |
| Affiliate neutrality | Pass — commission language excluded from ranking methodology |
| FAQ | Only where already useful; not forced |

## Product selection validation

Recommendations were validated against live catalog product IDs (`getProductById`). Heavy-runner and carbon shortlist changes use published products only. Ranking rationale is use-case contextual (e.g. Metcon can win training and lose HYROX race-leg manners).

## Evidence notes

- Material ranking claims are tied to catalog strengths/weaknesses + editorial methodology IDs.
- No invented first-hand lab tests.
- Offer presence / commission does not drive rank (stated in methodology on enriched guides).

## Critical cannibalization snapshot (post-fix)

| Pair | Rec overlap | Disposition |
|---|---:|---|
| long-runs ↔ heavy-runners | 0.43 | Shortlist split |
| race ↔ carbon-plated | 0.71 | Differentiated + Elite vs Trainer |
| watches beginners ↔ budget | 0.80 | Intent differentiated (small entry GPS pool) |
| hydration vests ↔ trail | 0.75 | Intent differentiated |
| hyrox-shoes ↔ training-shoes | 0.22 | Distinct shortlists |

## Files touched

| Path | Role |
|---|---|
| `src/content/best-guides-p2-vertical-launch-ready.ts` | 14-guide LAUNCH_READY enrichment |
| `src/content/best-guides-p2-cannibalization.ts` | Intent/shortlist anti-doorway fixes |
| `src/content/best-guides.ts` | Wire P2 + cannibalization |
| `scripts/tmp/prelaunch-39-generate-best-p2.ts` | Regenerator for P2 patches |
| `docs/prelaunch/editorial/data/39-best-guides-completion.json` | Machine inventory |
| `docs/prelaunch/editorial/03-ALL-BEST-GUIDES-COMPLETION.md` | This report |

## Residual watchlist (not failures)

1. **Beginners ↔ budget watches** — high shared entry GPS SKUs; keep ranking copy job-specific; consider further exclusive picks when catalog deepens.
2. **Race ↔ carbon** — core supershoe overlap is structurally expected; keep Trainer/Speed off carbon and Elite on carbon.
3. **Day-1 indexation** — editorial LAUNCH_READY ≠ automatic Day-1 index for launch-gated verticals (fitness / padel / racket remain policy-gated as elsewhere).

## Definition of done

- [x] Fix all 14 non-LAUNCH_READY Best Guides  
- [x] Full Best Guide standard applied via assessor gates + enrichment  
- [x] Product selection validated against catalog  
- [x] Contextual reasoning per guide job  
- [x] No artificial recommendation counts  
- [x] Cannibalization reviewed; differentiated or split  
- [x] Evidence IDs present  
- [x] Affiliate-neutral methodology  
- [x] 58/58 LAUNCH_READY; 0 NMW; 0 THIN; 0 BLOCK  
