# Tool routing

All published tools render through **`/tools/[slug]`** (and `/tools/[slug]/results` when applicable).

Specialized UIs are branches inside those dynamic routes — not separate App Router folders:

| Tool | Branch in `[slug]/page.tsx` |
| --- | --- |
| Finders (running shoe, padel, etc.) | `getFinderDefinition` → `FinderFlow` |
| Running Pace Calculator | `PaceCalculatorApp` |
| Race Time Predictor | `RacePredictorApp` + calculator shell |
| Shoe Rotation Planner | `RotationFlow` (+ rotation results on `/results`) |
| Home Gym Builder / HYROX / strength calcs | Dedicated client components |

Do not reintroduce `src/app/tools/<tool-slug>/page.tsx` for these — it shadows the dynamic route and recreates the LEGACY_DEDICATED split.
