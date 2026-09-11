# HYROX Vertical

Canonical hub: `/fitness/hyrox` (301 from `/hyrox`).

Kitletics is **not** an official HYROX partner. The name is used descriptively for gear decisions.

## Architecture

| Piece | Location |
| --- | --- |
| CompetitionFormat | `src/domain/competition/types.ts` |
| Season 26/27 seed | `src/content/hyrox/competition.ts` |
| Race calculator | `src/domain/hyrox/race-calculator.ts` |
| Race kit builder | `src/domain/hyrox/race-kit.ts` |
| Hub UI | `src/components/hyrox/HyroxHubPage.tsx` |
| Editorial extras | `src/content/hyrox/editorial.ts` |

## Cross-sport Products

Same `Product` entities may carry Running + Fitness + HYROX sport/use-case links. No `HyroxProduct` type.

## Tools

- `/tools/hyrox-shoe-finder`
- `/tools/hyrox-race-kit-builder`
- `/tools/hyrox-race-time-calculator`
- `/tools/home-gym-builder?goal=hyrox`

## Competition rules

Loads/distances live only in `CompetitionFormat` with evidence IDs. Calculators must not hardcode station order.

## SEO

- Index: hub, tool landings, Best/guides/setups
- Noindex: finder results, kit results, planner scenarios (`?build=` on home gym already noindex)

## Freshness

`lastVerifiedAt` / `effectiveFrom` / `effectiveTo` on CompetitionFormat — Prompt 20 should monitor season changes.
