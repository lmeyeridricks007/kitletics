# All Guides Completion — Editorial 40

**Document ID:** `04-ALL-GUIDES-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** All **68** Buying Guides (educational / how-to / explainer / comparison / setup — not Best Guides)  
**Data:** `docs/prelaunch/editorial/data/40-guides-completion.json`

## Executive status

| Metric | Result |
|---|---|
| Guides assessed | **68** |
| Assessor `complete` | **68** |
| Question maps | **68 / 68** |
| Missing Best CTA | **0** |
| Methodology notes on long-form | **67 / 68** |
| Medical / evidence caution notes | **18** (fuel, HR, recovery cluster) |
| Launch `COMPLETE` (index gate) | **41** |
| Launch `BLOCKED` (vertical hold) | **27** (fitness / padel / racket / HYROX policy — editorial still finished) |

**Targets:** COMPLETE · UNIQUE · EVIDENCE-SAFE · INTENT-DIFFERENTIATED — **met for editorial estate.**  
Day-1 indexation remains vertical-gated where policy holds apply.

## Baseline problem

Structural audit already showed **68 COMPLETE**. Deeper review found:

1. **Template cannibalization** — HYROX and racket `makePlan` generators shared ~90% body text (subject-swapped shells).
2. **Shared density fallbacks** — `completeCompactPlan` injected identical why/callout/next-step paragraphs across ~25 running guides.
3. **Identical look-for intros** — `enrichExplainerBlocksWithVisuals` stamped one sentence on **67** guides.
4. **Question maps** only for ~6 shoe explainers.
5. **Decision journey gaps** — dozens of guides lacked related Best / Finder paths.

## What changed

### 1. Question maps (all 68)

- `src/lib/guides/guide-question-maps-all.ts` — primary / secondary / decision / misconception / next-step coverage for every slug  
- `src/lib/guides/guide-question-maps.ts` — merges generated maps with hand-authored core shoe maps  
- Sensitive fuel/recovery topics mark evidence-limit misconceptions as `partial` where appropriate  

### 2. Uniqueness (substantive)

| Cluster | Before (approx max Jaccard) | After |
|---|---:|---:|
| HYROX (11) | ~0.91 | **0.42** |
| Racket (4) | ~0.93 | **0.23** |
| Running density / fuel / apparel sample | shared exact paras ×25 | topic-keyed fallbacks; max pair **0.64** |
| Look-for intros | 1 shared across 67 | **10** family/slug variants |

**Files:**

- `src/lib/guides/explainers/hyrox-plans.ts` — per-guide `unique` authored blocks  
- `src/lib/guides/explainers/racket-unique-copy.ts` + `racket-plans.ts` — padel racket / shoes / grips / tennis fully differentiated  
- `src/lib/guides/complete-compact-plan.ts` — topic-family why / callout / next-step copy  
- `src/lib/guides/enrich-explainer-visuals.ts` — slug-aware look-for intros  

Intent differentiation examples:

- **Padel shoes** = court grip / lateral lockdown (not frame shapes)  
- **Grips** = diameter / tack consumables (not racket choosing)  
- **Tennis** = head size / swingweight / strings (explicitly not padel geometry)  
- **HYROX shoes vs equipment standards vs RowErg/SkiErg** = distinct jobs and failure modes  

### 3. Evidence safety

- Fuel / caffeine / hydration-for-training / recovery / foam / massage / HR guides retain **medicalNote** and cautious methodology language  
- Recovery evidence guide keeps “what evidence shows / doesn’t” framing — not clinical claims  
- No invented first-hand tests; product examples remain catalog illustrations  
- Affiliate neutrality unchanged — Best/Finder links are decision paths, not ranking drivers  

### 4. Product connections

- Catalog product examples remain role illustrations inside explainers  
- Guides are **not** converted into Best shortlists  
- Related Best links added only as “next step after the framework”  

### 5. Decision journey

`src/content/guides-p40-journey.ts`:

- `applyGuideP40JourneyEnrichment` → `relatedBestGuideIds` (+ tools when empty)  
- `enrichLongFormDecisionLinks` → `/best/...` decisionLinks when missing  
- Wired in `src/content/editorial.ts` and `getLongFormGuideConfig`  

**Result:** **0** guides without Best CTA coverage.

### 6. Visuals

- Existing diagrams/matrices/look-for panels retained where they encode factors  
- Look-for intros now match the guide job (no decorative filler added)  
- No new stock imagery for its own sake  

### 7. Guide-type standards (coverage)

| Type | How met |
|---|---|
| BUYING | Factors, trade-offs, decision steps, product examples |
| EXPLAINER | Definition, mechanism, why it matters, misconceptions, implications |
| TECHNICAL | Terminology + real-world impact via factor cards / glossary where present |
| COMPARISON | Difference tables, when-each-wins branches |
| HOW-TO | Decision steps with failure modes |
| SETUP | Checklists / space / kit frameworks with rehearsal emphasis |

## Cannibalization / intent

Nested topics remain (e.g. watch battery vs maps vs beginner-vs-advanced) with **distinct primary questions** and differentiated long-form copy.  
HYROX and racket doorway-style template twins were the critical failures — now split.

Residual shared sentences are **family-level check intros** (e.g. all home-gym guides share a footprint look-for line) — intentional, not full-article clones.

## Definition of done

- [x] Question map per Guide  
- [x] User-value / type-standard enrichment where template thinness was found  
- [x] Uniqueness pass (HYROX / racket / density / look-fors)  
- [x] Evidence caution on biomechanics-adjacent / nutrition / recovery / HR  
- [x] Real product examples without affiliate-list conversion  
- [x] Best / Finder / Compare journey links where useful  
- [x] Visuals audited (meaningful only)  
- [x] 68 COMPLETE · UNIQUE · EVIDENCE-SAFE · INTENT-DIFFERENTIATED (editorial)  

## Files touched (primary)

| Path | Role |
|---|---|
| `src/lib/guides/guide-question-maps.ts` | Map registry |
| `src/lib/guides/guide-question-maps-all.ts` | Full 68 maps |
| `src/content/guides-p40-journey.ts` | Best/tool journey |
| `src/content/editorial.ts` | Wire journey |
| `src/lib/guides/long-form-config.ts` | Decision-link enrich at resolve |
| `src/lib/guides/complete-compact-plan.ts` | Topic-unique fallbacks |
| `src/lib/guides/enrich-explainer-visuals.ts` | Unique look-for intros |
| `src/lib/guides/explainers/hyrox-plans.ts` | Unique HYROX copy |
| `src/lib/guides/explainers/racket-plans.ts` | Unique racket wiring |
| `src/lib/guides/explainers/racket-unique-copy.ts` | Authored racket differentiation |
| `docs/prelaunch/editorial/data/40-guides-completion.json` | Machine inventory |
| `docs/prelaunch/editorial/04-ALL-GUIDES-COMPLETION.md` | This report |

## Residual watchlist

1. Density-cluster max pair **0.64** — acceptable after topic fallbacks; further hand-authored density plans can deepen outliers later.  
2. Family look-for intros still shared within a category (by design).  
3. **27 BLOCKED** guides remain launch-gated by vertical policy — editorial complete ≠ Day-1 index.  
