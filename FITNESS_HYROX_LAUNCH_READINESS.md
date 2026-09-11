# Fitness & HYROX Launch Readiness

**Prompt 24** — catalog population, editorial gap-fill, tools, QA.

Generated: 2026-08-31

## Executive Summary

Fitness + HYROX moved from framework/prototype depth to **decision-ready** coverage for P0 categories: racks, benches, bars, plates, adjustable dumbbells, training shoes, treadmills, rowers, air bikes, and ski ergs (≥5 each after Wave 24). Flagship tools (Home Gym Builder, Power Rack Finder, Treadmill Finder, HYROX Shoe Finder / Race Kit / Race Calculator) are wired. Unit tests and launch QA report **P0 = 0**.

Primary remaining condition: **licensed manufacturer product photography** is not yet attached — published products intentionally use Kitletics branded “image unavailable” SVG fallbacks (not fake product photos).

## Launch Decision

```text
GO WITH CONDITIONS
```

### Why not pure GO

1. Product hero imagery is branded fallback SVGs, not licensed manufacturer photos (explicitly disclosed in asset attribution).
2. Affiliate retailer feeds remain generic Amazon deep-links / placeholders in places — prices are indicative, not live feed-synced.
3. Secondary calisthenics categories (rings, parallettes, vests) remain intentionally thin.

### Why not NO-GO

- P0 blockers: **0**
- Production typecheck + Fitness/HYROX/planner unit tests: **pass**
- No dummy/lorem published products
- No scheduled-content leak found in QA path
- Affiliate commission does not enter Finder/Best ranking logic
- Decision paths exist for every P0 category (Best and/or Finder and/or Guide)

## Before vs After (Prompt 24)

| Metric | Before | After |
| --- | ---: | ---: |
| Fitness seed products | 89 | **104** (+15 Wave 24) |
| P0 thin categories (&lt;5) | 5 (plates, TM, rower, air bike, ski) | **0** |
| Spec defs (fitness) | 27 / 6 cats | **+20** (benches, plates, treadmills, air bikes, ski) |
| Comparison category configs (fitness) | 0 | **6** |
| Finders | no treadmill | **+ treadmill-finder** |
| HYROX recommendations | ~10 | **13+** |
| Best guides (fitness/hyrox) | 7 | **11** |
| Buying guides | ~16 | **22+** |
| Editorial comparisons | 4 fitness | **+3** high-value |
| Planner overlay products | 66 | **80+** |
| Offers on fitness SKUs | high | **95/95** |
| Launch QA P0 / P1 (thin P0 cats) | n/a | **0 / 0** |

## P0 Issues

None open.

## P1 Issues (accepted / conditioned)

| Issue | Status |
| --- | --- |
| Licensed product photography | Open — fallbacks honest; backlog for manufacturer assets |
| Live affiliate feed sync | Open — offers exist but not feed-authoritative |
| Thin calisthenics SKUs (rings 2, parallettes 3, vests 3) | Accepted P2 — decision guides exist for pull-up bars |
| Clothing/socks HYROX contexts | Deferred — gear-first priority |

## Catalog Coverage

### P0 categories (post Wave 24)

| Category | Count | Decision path |
| --- | ---: | --- |
| Training Shoes | 12 | Finder + Best HYROX/Training |
| Adjustable Dumbbells | 8 | Finder + Best |
| Power Racks | 8 | Finder + Best + Compare config |
| Weight Benches | 7 | Best + Guide + Compare config |
| Weight Plates | 7 | Best + technical guide |
| Barbells | 6 | Best home gym path |
| Treadmills | 6 | **Treadmill Finder** + Best |
| Rowing Machines | 6 | Best + Guide + Compare |
| Air Bikes | 6 | Best + Compare |
| Ski Ergs | 5 | HYROX guides + home setups |

## Brands

Added/expanded: ATX, Sole, Horizon, Woodway, WaterRower, Schwinn, Hydrow, Xebex, Strength Shop (plus prior Rogue/REP/Concept2/Mirafit/Eleiko/etc.).

## Specifications

Bench, plate, treadmill, air-bike, ski-erg `SpecificationDefinition`s added. Facets should only expose filters with adequate coverage (existing filter gating).

## Media

- **Policy:** Kitletics branded SVG fallbacks with attribution “product image unavailable (not a product photograph)”.
- **Not used:** Unsplash fakes, dummy JPEGs, AI renders as product photos.
- **Backlog:** manufacturer/authorized retailer assets per P0 SKU.

## Evidence

Wave 24 editorial-research evidence IDs attached; competition rules remain rulebook-backed (Prompt 23). No fake personal-test claims.

## Recommendations

Expanded home-gym, apartment, HYROX conditioning, plate and bench contexts. Scores not clustered at 95+.

## Relationships / Comparisons

High-value comparisons added:

- Echo Bike vs AssaultBike Elite
- Sole F80 vs Horizon T202
- Concept2 RowErg vs Hydrow Wave

Compare Builder configs for racks, DBs, training shoes, rowers, treadmills, benches.

## Best Guides / Buying Guides / Setups

New Best: adjustable benches, air bikes, treadmills for home, weight plates.  
New Guides: choose rack/bench/ADB/treadmill/rower, space planning, bumper vs iron.  
New Setups: `budget-home-gym`, `hyrox-home-training`.

## Finders

| Tool | Status |
| --- | --- |
| Home Gym Builder | Live + `?goal=hyrox` |
| Power Rack Finder | Live |
| Treadmill Finder | **Live (Prompt 24)** |
| HYROX Shoe Finder | Live |
| Adjustable Dumbbell Finder | Live |
| Pull-Up Bar Finder | Live |

## Home Gym Builder

Planner dimensions for Wave 24 cardio/benches/plates. Soft preference for planner-ready SKUs unchanged (geometry confidence ≠ product score).

## HYROX

Hub, CompetitionFormat Season 26/27, Shoe Finder, Race Kit, Race Calculator, home training setup — validated via `tests/hyrox.test.ts` + `npm run hyrox:qa`.

## Search

Synonyms for rack/rower/airbike/skierg/pull-up/dumbbell/treadmill/hyrox. Intent boosts for HYROX shoes → Finder.

## Commerce

Regional NL/DE/UK offer triplets for Wave 24 products. US/ZA coverage still uneven (condition).

## SEO

Evergreen Best URLs; no year/city explosion. Finder/builder results remain noindex via existing tool patterns.

## Internal Links

Fitness hub actions include Power Rack + Treadmill finders; HYROX hub and Running cross-link remain.

## Responsive / Accessibility / Performance

Not newly Lighthouse-scored in this pass — no catastrophic payload change (server-prepared finders). Flagship journeys unchanged architecturally.

## Publishing

Central resolver unchanged. No draft leak in launch QA.

## Tests

```bash
npx vitest run tests/hyrox.test.ts tests/fitness.test.ts tests/room-planner.test.ts
npm run fitness:launch-qa
```

## Remaining Research Queue

1. License manufacturer images for P0 SKUs  
2. Live offer feeds / accurate heavy-shipping notes  
3. Expand calisthenics rings/parallettes when commercially prioritized  
4. Product-level evidence URLs replacing shared stubs for top 20 SKUs  
5. ZA/US retailer depth for large equipment  

## Commands

```bash
npm run fitness:catalog-qa
npm run fitness:launch-qa
npm run hyrox:qa
npm run home-gym:qa
```

Reports: `reports/fitness-launch-qa.md`, `reports/hyrox-readiness.md`, `reports/fitness-catalog-qa.md`
