# Padel final residual closure

VERTEX_GRAMMAR: FIXED

COMMERCE_ROOT_CAUSE: Seed commerce clock `SEED_DATES.verified` (2026-09-22) aged past the 72h From-price window; `applySeedVerifiedClock` → `shouldDisplayNumericPrice` correctly returned no displayable NL offers → `lowestPrice` undefined. Production freshness logic was correct.

ROOT_CAUSE_CLASS: STALE_TEST_OR_FIXTURE

FILES_CHANGED:
- `src/lib/review/rewrite-uniqueness-era-skip.ts` — strip trailing “should look elsewhere” when composing Skip-if from Players-who seeds
- `tests/decision-copy.test.ts` — regression for Vertex Hybrid mash
- `src/content/config.ts` — bump `SEED_DATES.verified` to `2026-09-26T06:00:00.000Z`

TARGETED_TESTS: PASS — 12 files / 140 tests

FULL_CI: DEFERRED_TO_GITHUB_ACTIONS

## Job 1 detail

Source weakness was a **complete sentence**:
`Players who prefer the lower balance of the Vertex Hybrid should look elsewhere`

`skipSentenceFromLimitation` turned it into
`Skip it if you prefer … Hybrid should look elsewhere` (two endings merged).

Composition now drops the look-elsewhere tail before wrapping.

## Job 2 detail

| | |
| --- | --- |
| ROOT_CAUSE_FILE | `src/content/config.ts` |
| ROOT_CAUSE_FUNCTION | `SEED_DATES.verified` (consumed by `applySeedVerifiedClock` in `repositories/commerce.ts`) |
| WHY_LOWEST_PRICE_BECAME_UNDEFINED | Seed lastChecked lifted to 2026-09-22; wall clock ≥96h later → band `aging`/`stale` → excluded from From-price |
| WHETHER_TEST_OR_APPLICATION_IS_WRONG | Fixture clock stale; application freshness rules correct |

STOP.
