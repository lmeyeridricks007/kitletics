# Padel review scaffold closure

Implementation pass after `PADEL-RUNNING-PARITY-FINAL-SIGNOFF.md`.
**Does not declare** `PADEL_REVIEW_PARITY` or `OVERALL_RUNNING_PADEL_PARITY` PASS.

Frozen (untouched except regression-safe review paths): PDPs, guides, Best, education diagram assets, commerce, catalog, Finder, nav, mobile, galleries.

## Root causes fixed

### 1. Shared non-structural section scaffolding

**Source:** `PADEL_EDUCATION_BY_TOPIC` captions in `src/lib/review/resolve-section-visuals.ts`.

Figcaptions were rendered into the page and scraped as section prose:

| Removed caption |
| --- |
| `Generic continuum — match the mould to the job you play most weeks.` |
| `Shape changes where the usable face sits — not a brand rendering.` |
| `Sweet-spot height is a teaching idea — verify published notes on the product sheet.` |
| `Control and power trade along the same mould continuum.` |
| `Overgrips sit on top of a base wrap — replace when tack dies.` |

Education SVGs remain (alt only). Review bodies already started with product-specific analysis; captions were the interchangeable openers.

Also removed shoe support scaffold: `Midfoot lockdown has to match this last.` in `padel-longform.ts`.

### 2. Buy-if grammar composition

**Sources:**

- `enrichReviewSummary` wrapped strengths with `I'd shortlist it if you want ${strengths}` when strengths were already `Players who want…`
- `composeBuyIfSentence` / `composeSkipIfSentence` were exported but **undefined**
- `isDisplayReady(buyIf)` accepted person-phrases as Buy-if

**Fix:** implement composers that emit complete `You want…` / `Skip it if…` sentences; reject person-phrases for buyIf/skipIf; salvage via composers. Prefer simple You-form over `I'd shortlist…` wrappers.

### 3. Category-inappropriate durability copy

Running-shoe stems (`Soft dailies…`, `foam, upper and outsole…`) were applied whenever `/shoe/` matched — including `cat-padel-shoes`.

**Fix:** split running vs court shoe semantics in `metric-editorials.ts`. Padel shoes get court durability language; grips/balls/bags get category-specific lines; never shoe foam/upper stems on non-shoes.

### 4. Deterministic fonts (CLEAN_CI)

Removed `next/font/google` (`DM_Sans` / `Outfit`) from `src/app/layout.tsx`. No local font files in repo → CSS stack prefers DM Sans / Outfit when installed, else system UI sans (`.font-kitletics` in `globals.css`). Build no longer depends on Google Fonts network fetch.

### 5. ASICS Gel-Resolution Padel gallery

Cheap check: hero exists in `catalog-product-media`; **no** gallery folder / `PRODUCT_GALLERY_MEDIA` entries. Left alone (no binding to fix).

## BEFORE → AFTER

| Metric | Before (final sign-off) | After |
| --- | --- | --- |
| Systematic generic opener groups (named stems) | 5 groups (12/12/9/13/11 products) | **0** |
| `I'd shortlist it if you want players who…` | Vertex, Kuikma, Indiga | **0** |
| Person-phrase in Buy-if | present | **0** (You-form) |
| Soft dailies / foam-upper on padel categories | yes (court shoes + bleed) | **0** |
| Vertex Power body start | caption + product sentence | product sentence only |
| Vertex words (enriched) | ~3086 rendered HTML | ~1631 analysis text* |
| Kuikma words | ~2653 rendered | ~1252* |
| KNOWN_REVIEW_TEMPLATE_GLUE | FAIL | **0** |
| KNOWN_DECISION_GRAMMAR_DEFECTS | 3 | **0** |
| CATEGORY_INAPPROPRIATE_REVIEW_COPY | >0 | **0** |

\*Enriched body+decision word counts (not full chrome HTML). Shorter is expected after caption deletion; density up.

Remaining cross-product scrubbed triples are court-shoe durability lines that share the same published outsole class after name scrub — product-anchored, not concept lectures.

## Artifacts

- `docs/padel/data/PADEL-REVIEW-FINAL-SIMILARITY.csv`
- `docs/padel/data/PADEL-REVIEW-FINAL-GRAMMAR.csv`

## Manual sample (enriched)

| Review | Section starts product-specific? | Buy/Skip natural? |
| --- | --- | --- |
| Vertex | Yes (diamond / 12K / Multieva) | `You want the current Tello Vertex…` |
| Kuikma | Yes (round / Soft EVA) | `You want a ~350 g round…` |
| Indiga | Yes (Polyglass / SoftEva) | You-form buy + skip |
| Hack | Yes (Tricarbon 18K) | You-form |
| Joma | Yes (court shoe) | No Soft dailies |
| Wilson overgrip / HEAD Pro S / NOX bag | No shoe foam language | OK |

## CI (one sequential run + lint/build unblock)

Sequential command (once): `rm -rf .next` → `npm run lint` → `npm run typecheck` → `npm test` → `npm run build`

| Step | First-pass exit | Notes |
| --- | --- | --- |
| lint | 1 | `prefer-const` on `composeBuyIfSentence` / `composeSkipIfSentence` (`let t` → fixed to `const t`) |
| typecheck | 0 | |
| test | 1 | 22 failures / 1015 passed — all commerce/From-price (`lowestPrice` undefined / EUR). Not review-scaffold paths. Targeted `tests/decision-copy.test.ts`: **15/15 pass**. |
| build | 1 | Same `prefer-const` errors blocked Next lint phase |

After prefer-const + unused-var cleanup in `transform.ts` / `metric-editorials.ts` (no second full test suite):

| Step | Exit |
| --- | --- |
| lint | **0** (0 errors, 28 pre-existing warnings) |
| build | **0** (compiled; no Google Fonts network fetch) |

Font: already on CSS `.font-kitletics` (no `next/font/google`). No font files committed.
