# Kitletics Finder Engine

Explainable, configuration-driven product finders. First implementation: **Running Shoe Finder**.

## Architecture

```
FinderDefinition (config)
  → normalize responses → FinderNormalizedProfile
  → hard eligibility
  → weighted factor scores (+ user priority multipliers)
  → coverage gate
  → ranked results + explanations
```

Generic API:

```ts
runFinder({ definition, responses, products, recommendations, lowestByProduct, region })
```

Domain code lives under `src/domain/finders/`. React only renders questions and results.

## Question model

Reusable types: `single-select`, `multi-select`, `boolean`, `optional-number`, etc.

Conditional questions use `showWhen` (e.g. race distance only when primary use is racing).

## Response normalization

Display strings → canonical profile IDs (`terrain`, `primaryUses`, UseCase mapping, budget band, etc.).

Exact body weight stays **session-only** and is **excluded from share URLs**.

## Eligibility phase

Hard exclusions only (unpublished, wrong category, upcoming/discontinued, trail-only vs road-only, required width when known incompatible).

Preference mismatches (cushioning, soft stability) are **scores**, not exclusions.

## Scoring phase

- Relative `baseWeights` → drop inactive factors → apply `priorityMultipliers` → **normalize to sum 1**.
- Missing optional answers do **not** penalize products; remaining weights are redistributed.
- Unknown product data → neutral/reduced confidence score — **not automatic 0**.
- Reuses structured `Recommendation` use-case scores for primary use / distance.
- **Never** ranks by overall `Product.recommendationScore`.
- **Affiliate commission is never an input** (see `AFFILIATE_NEUTRALITY` in scoring module).

## Match vs Kitletics Score

| Metric | Meaning |
|--------|---------|
| Kitletics Match | Compatibility with **this user’s** Finder answers |
| Kitletics Score | General product evaluation on the product page |

## Explanations

Strengths / compromises derived from high / low factor scores. Rank gap insights compare factor deltas between #1 and #2.

## Share state

`/tools/running-shoe-finder/results?s=BASE64URL_JSON`

- Versioned (`v`) + finder slug (`f`)
- Validated on decode
- Weight excluded
- Results pages: `noindex,follow`
- Not encryption — do not put secrets in `s`

## Privacy

- No account / email gate
- No analytics of exact body weight
- Weight omitted from share links

## Creating another Finder (e.g. Padel Racket)

1. Add `FinderDefinition` under `src/domain/finders/configs/`
2. Register in `repository.ts`
3. Add Tool seed (`available: true`)
4. Dedicated route or generic finder page binding
5. Map questions → eligibility + scoring factors for that category’s specs
6. Reuse `runFinder`, UI question components, results shell

**What changes:** questions, weights, eligibility rules, category ID, budget bands.  
**What reuses:** engine pipeline, share encoding, match bands, analytics stubs, explanation helpers.

## Running Shoe Finder

Route: `/tools/running-shoe-finder`  
Results: `/tools/running-shoe-finder/results?s=…`  
Config: `configs/running-shoe-finder.ts`  
Version: `v1`

### Weight rationale (summary)

Primary use 25, terrain 20, cushioning 12, budget/width 10, stability 8, experience/lifecycle/value 5 — documented in config file.

### TODO

Validate/tune scoring against expert-labeled recommendation scenarios.
