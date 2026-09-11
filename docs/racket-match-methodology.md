# Racket Match methodology

Kitletics uses one Finder engine (`runFinder`) for all racket sports.

## Separation of scores

- **Kitletics Score** — general product/category assessment on the Product entity.
- **Kitletics Match** — compatibility with *this* player profile from Finder answers.

Affiliate commission is never an input to Match ranking.

## Shared vs sport-specific

Shared:

- Question concepts (experience, priorities, budget, weight preference, current equipment)
- Eligibility / lifecycle / missing-data behaviour
- Explainability (`why #1 beat #2`, compromises, optional current-equipment deltas)

Sport-specific (category config only):

- Question wording and options
- Factor weights (`padelRacketFinderConfig` / `tennisRacketFinderConfig` via FinderDefinition.scoringProfile)
- Spec keys (padel shape/core vs tennis head size/pattern)
- Recommendation use-case IDs (`uc-padel-*`, `uc-tennis-*`)
- Result terminology (racket vs paddle)

## Missing data

Unknown specs score **neutral / reduced confidence**, never invented defaults (e.g. balance is never assumed to be “medium”).

## Publication gates

`canPublishFinder()` requires candidate count, brand diversity and recommendation coverage before exposing a Finder as available.
