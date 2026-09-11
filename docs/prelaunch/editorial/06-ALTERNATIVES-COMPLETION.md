# Alternatives Completion — Editorial 42

**Document ID:** `06-ALTERNATIVES-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** All Product Alternatives pages — decision quality, weak-edge pruning, uniqueness, indexability  
**Data:** `docs/prelaunch/editorial/data/42-alternatives-completion.json` · baseline audit `42-alternatives-audit.json`

## Executive status

| Metric | Before | After |
|---|---|---|
| Pages with ≥1 alternative | ~623 built / thin | **407** with ranked alts |
| Sync template reason hits | **1416** | **0** |
| Decision-complete (better / worse / switch / stay) | ~0 | **407 rendered**; **43** indexable set **100%** |
| Indexable (page + launch aligned) | 74 (RC Day-1) | **43** substantive |
| Uniqueness `NEEDS_DIFFERENTIATION` (indexable) | 67 estate / high | **0** |
| Uniqueness `DUPLICATIVE` (indexable) | 4 | **0** |

**Targets for the indexable Alternatives estate:** 0 NEEDS_DIFF · 0 DUPLICATIVE · decision structure on every card — **met.**

Thin or uniqueness-held pages still **render** with decision copy; they stay `noindex` until relationships / differentiation support promotion.

## Baseline problems

1. **List-only pages** — cards showed peer hangtags + thin relationship bullets; almost no “what you give up” or “who should stay”.
2. **Sync template spam** — `decision-graph-alt-sync` stamped *“same-category alternative when you want a peer…”* on **1416** reasons → cross-page collapse.
3. **Arbitrary edges** — some sync edges crossed categories or lacked buying signals.
4. **One shoe-centric hero sentence** on every page (“cushioning, stability, speed…”).
5. **Category configs** only for shoes / GPS / padel — HRM, tennis, clothing, hydration, fitness fell to a generic similar/value table.

## What changed

### 1. Pair-specific decision copy

`src/lib/product/alternative-decision-copy.ts`

Each alternative now gets:

- **Why it is an alternative**
- **What it does better**
- **What you give up**
- **Who should switch**
- **Who should stay**
- Pair-aware summary + page intro (role + reason groups)

Frames vary by pair hash; copy pulls strengths, weaknesses, short descriptions, use cases, optional specs/verdicts.

### 2. UI

`AlternativeRecommendationList` and `AlternativesHero` surface the decision blocks (not just “why choose” + use-case chips).

### 3. Sync graph repair + weak-edge pruning

`src/content/running/decision-graph-alt-sync.ts`

- Same-category only  
- Typed edges when specs/use-cases support (`inferAlternativeRelationshipType`)  
- Pair-specific multi-bullet reasons (no template peer sentence)  
- Skip peers with no buying signal  

`get-alternatives-page-data.ts` drops remaining weak / cross-category edges at page build.

### 4. Category-specific reason groups

`alternatives-config.ts` — shoes, GPS, padel, HRM, tennis, clothing, hydration/packs, fitness equipment (+ default with premium/lighter).

### 5. Indexability gate

Only index when:

1. Graph eligibility (`≥3` alts, `≥2` types, meaningful reasons + switch/trade shape)  
2. Category in `ALTERNATIVES_INDEXABLE_CATEGORIES` (shoes, watches, HRM, padel/tennis rackets & shoes, rowers/air bikes, training shoes)  
3. `≥3` substantive decision cards + `≥2` reason groups  
4. Distinct within-page decision copy  
5. Not on uniqueness hold list  

Launch eligibility + page `robots` aligned.

### 6. Uniqueness holds

`src/content/alternatives-uniqueness-holds.ts` — 15 near-duplicate peer pages kept **public noindex** until further hand differentiation (still decision-complete when rendered).

## Verification

```bash
npx vitest run tests/alternatives-page.test.ts
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-42-alternatives-verify.ts
```

Indexable pool after holds: **43** · all `TEMPLATE_SIMILAR_ACCEPTABLE` or better · **0** NEEDS_DIFF · **0** DUPLICATIVE.

## Definition of done

- [x] Category-appropriate seek reasons (price / fit / stability / weight / battery / capacity / etc. via typed groups)  
- [x] Each alt explains why / better / worse / switch / stay  
- [x] Grouped reason tabs where evidence supports  
- [x] Weak / arbitrary edges pruned  
- [x] Sync template duplication removed  
- [x] Only substantive pages indexable  
- [x] Full relationship-backed estate rendered with decision copy where peers exist  
- [x] Report + machine data written  

## Follow-ups

- Hand-differentiate uniqueness-hold slugs, then remove from hold set  
- Expand indexable categories (clothing / hydration / nutrition) only after peer copy is less interchangeable  
- Optional: curated non-running sync for padel/fitness `alternativeProductIds`
