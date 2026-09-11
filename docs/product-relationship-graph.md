# Product Relationship Graph

Kitletics decision graph for connecting Products without combinatorial SEO.

## Principles

- High-value relationships only — never every category pair
- Orchestrates `ProductRelationship`, `ProductFamily`, `Comparison`, `Recommendation`, `AlternativeRelationship` (legacy view)
- Structural vs dynamic: generation/competitor edges are structural; “currently cheaper” is derived from Offers, not persisted forever
- No consumer-facing graph jargon (edges, confidence 0.83, etc.)

## Relationship types

See `src/domain/relationships/types.ts`.

Groups:

| Group | Examples |
|---|---|
| ALTERNATIVE | similar, cheaper-alternative, more-cushioned, faster, trail-alternative |
| STRUCTURAL | previous-generation, next-generation |
| DECISION | direct-competitor, comparison-candidate |
| COMPLEMENTARY | rotation-complement, complements, compatible-with |

## Directionality & inverses

`RELATIONSHIP_INVERSE` maps:

- cheaper-alternative ↔ premium-alternative
- previous-generation ↔ next-generation
- similar ↔ similar
- direct-competitor ↔ direct-competitor
- complements / compatible-with / rotation-complement ↔ self

Do not auto-create cheaper both ways.

## Similarity engine

Deterministic structured similarity (`computeProductSimilarity`) with category configs:

- Running shoes: terrain, cushion, stability, plate, drop/weight bands, training types + Recommendation profile
- GPS watches: maps, multiband, battery, display, weight
- Packs / HRM: capacity / connectivity oriented

Public labels only: Very similar / Similar / Different emphasis / Different role.

## Candidate generation

`npm run catalog:relationships` writes novel candidates to `data/staging/relationships/candidates.json`.

Does **not** overwrite approved `productRelationships`.

Safe automatic relationships: adjacent ProductFamily generations when ordering is validated.

## Alternatives

- Graph-first via `getAlternativesFromGraph`
- Product page shows curated reasons (3–6)
- Standalone `/products/[slug]/alternatives` indexes only when `canPublishAlternativesPage` passes (≥3 alts, ≥2 types, meaningful reasons)

## Comparisons

Tier 1 curated/hybrid Comparisons live in `src/content/running/comparisons.ts`.

Priority factors (internal): direct competitor, same family, shared use cases, similarity, catalog priority, meaningful spec diffs.

No affiliate influence. No forced winners.

## Generation changes

`src/content/generation-changes.ts` — verified field deltas only. No automatic “worth upgrading: yes”.

## Rotation complements

Hints for Shoe Rotation Planner — do not override optimizer coverage math.

## Finder diversity

After pure match ranking, soft penalty for near-identical family/generation when scores are within a small gap. Top result stays.

## Compare Builder

Empty-query product picker prioritizes direct competitors, comparison candidates and generation links for the already-selected product.

## Catalog priority

Internal only: flagship / major / standard / long-tail (`catalog-priority.ts`).

## Validation & QA

```bash
npm run catalog:relationships
npm run catalog:qa
npm run content:validate
```

QA reports relationship counts, orphans, contradictions, alternatives eligibility, comparison breakdown.

## Future sports

Relationship types are category-configurable. Shoe-specific labels (more-cushioned) are not required for padel/bikes/etc.

## Decision methodology

| Question | Source |
|---|---|
| Similar? | Similarity engine + approved `similar` / competitor edges |
| Direct competitor? | Same category + shared use cases + high similarity → approved `direct-competitor` |
| Previous/next gen? | ProductFamily `productIds` order + lifecycle |
| More cushioned? | Controlled cushionLevel enum distance + evidence |
| Currently cheaper? | Live Offers (dynamic) — not permanent edge |
| Rotation complement? | Coverage gain intent + approved `rotation-complement` |
| Publish comparison? | HIGH priority + completeness + meaningful diffs |
| Buy instead? | Alternatives page groups from approved graph |
