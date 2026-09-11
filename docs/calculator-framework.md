# Kitletics Calculator Framework

Reusable domain and page architecture for deterministic sports calculators.

## Architecture

```
CalculatorDefinition (registry)
  → pure math modules (metres / seconds)
  → shareable URL state
  → React experience components
  → shared shell (methodology, FAQ, related tools)
```

Mathematics never lives in React components or content MDX.

## Registry

```ts
getCalculatorDefinition(slug)
getAllCalculatorDefinitions()
```

Definitions in `src/domain/calculators/definitions.ts`.  
Registry: `src/domain/calculators/registry.ts`.

Each definition includes: version, related tools, presets, FAQs, SEO, methodology.

## Units

Canonical internals:

| Quantity | Unit |
|----------|------|
| Distance | metres |
| Duration | seconds |
| Pace | seconds per metre |

Display helpers: `formatDuration`, `formatPace`, km/mile conversion.

User unit preference (`km` / `mi`) can persist in `localStorage`; URL state overrides when present.

## Share state

Human-readable query strings (not encrypted):

```
/tools/running-pace-calculator?mode=pace&distance=10k&time=3000
/tools/race-time-predictor?from=10k&time=2910&to=half
```

Invalid values are ignored gracefully — pages do not crash.

URL updates use `router.replace` after a valid calculation (not every keystroke as history spam).

## Routing

Dedicated App Router pages for functional tools:

- `/tools/running-pace-calculator`
- `/tools/race-time-predictor`
- `/tools/running-shoe-finder` (Finder — separate domain)

Generic `/tools/[slug]` serves placeholders for unpublished / future tools only.

## Validation

`npm run content:validate` checks:

- Available calculator Tools have a CalculatorDefinition
- Definition toolId / slug match Tool records
- Related tool slugs exist
- Duplicate calculator slugs

## How formulas are implemented

### Pace Calculator

```ts
pace = time / distance
time = distance × pace
distance = time / pace
```

Rounding: nearest second for pace and finish times.

Splits: each checkpoint from `distance × pace` (absolute), then format — avoids cumulative drift.

### Race Time Predictor (Riegel)

```ts
T₂ = T₁ × (D₂ / D₁)^k
```

Default `k = 1.06` centralized as `RIEGEL_EXPONENT`.  
Model id: `race-predictor-riegel-v1`.

This is performance extrapolation — not the same as pace arithmetic.

## Adding another calculator

### Example: Heart Rate Zone Calculator

1. Add pure functions under `src/domain/calculators/hr/`
2. Add `CalculatorDefinition` + register in `registry.ts`
3. Add / update `Tool` seed (`type: "calculator"`, `available: true`)
4. Create `/tools/heart-rate-zone-calculator/page.tsx` using shared shell + a thin client form
5. Unit tests for zone boundaries
6. Search synonyms + Running/Training Hub links if relevant

### Example: HYROX Pace Calculator

1. Reuse duration / pace formatters from `units.ts`
2. Domain module for station + run segment pacing
3. Same registry + Tool + page shell pattern
4. Cross-link Pace Calculator / Race Predictor where useful

**Reuse:** units, duration input, segmented control, methodology/FAQ shell, share helpers, analytics stubs.  
**New:** math module, definition, dedicated experience component, tests.

## Deliberate non-goals (v1)

- No account / calculation history
- No mass programmatic SEO routes (`/marathon-pace/3-hours/...`)
- No AI for deterministic math
- No server API for simple arithmetic
