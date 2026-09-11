# Room Layout Engine

Domain: `src/domain/room-planner/`

## Modules

| File | Role |
| --- | --- |
| `types.ts` | Room, openings, obstacles, PlacedEquipment, fit statuses |
| `units.ts` | Display units ↔ mm |
| `geometry.ts` | Rectangles, rotation, expand |
| `collision.ts` | Physical overlap |
| `clearance.ts` | Planning clearances, door swing exclusions |
| `fit.ts` | Product vs room fit + activity limitations |
| `product-geometry.ts` | Spec + planning dimension map; `canUseInRoomPlanner` |
| `room.ts` | Rectangular room factory + presets |
| `exercises.ts` | Roles, exercise requirements, coverage |
| `layout.ts` | `generateLayout`, `autoArrange`, move validation |
| `share.ts` | Share encode/decode + local gyms |

## Placement

1. Locked / owned items first
2. Perimeter preference for racks, cardio, storage, pull-up
3. Search positions on **50 mm** grid + 4 rotations
4. Reject collisions with equipment, door swings, obstacles, restricted zones
5. Barbells skipped as floor objects when a rack is present (stored on rack)
6. Flooring noted as area coverage, not furniture blocks
7. Missing footprint ⇒ warning, **not auto-placed**

## Open training space

Utilization tracks equipment footprint vs room area. Soft warning when footprint ratio is high. HYROX / functional / calisthenics profiles set `preserveOpenSpace`.

## Fit statuses

`fits` · `fits-with-limitations` · `tight-fit` · `does-not-fit` · `unknown`

Confidence: `high` · `medium` · `low` from dimension completeness.

## Planner readiness

A product is planner-ready when width + depth are known (`canUseInRoomPlanner`).

Height unknown: may place with low-confidence warning; **cannot** pass hard ceiling checks.

## UI

`RoomPlannerCanvas` — SVG top-down plan with drag, rotate, lock, accessible list fallback, clearance toggle.

Respects `prefers-reduced-motion` via CSS elsewhere; planner itself avoids decorative animation.

## Tests

`tests/room-planner.test.ts` — geometry, door swing, ceiling, golden builder scenarios, share round-trip, readiness.
