# Rendered quality gate

**QUALITY = WHAT THE USER RECEIVES.**

Not: field populated, word count met, Jaccard low, image exists, page returns 200.

The previous system declared 591/591 reviews READY, 631/631 authentic primary media, and 0 launch blockers while production contained uniqueness-token garbage, machine-template Buy If copy, and cross-sport filler images. That must not be possible again.

## What the gate inspects

For **every indexable URL** in the production-candidate sitemap (`src/app/sitemap.ts` / `discoverRoutes`):

1. Assemble the same page-data getters the App Router pages call (SSR contract).
2. Extract visible text and image `src`s.
3. Run six gates. **No 15-page sample for blockers.**

CLI: `npm run quality:rendered`  
Dashboard: `docs/quality/RENDERED-QUALITY-DASHBOARD.md`  
Machine-readable: `docs/quality/data/rendered-quality-last-run.json`

A release **cannot be READY** with unresolved **BLOCKER** rendered-quality findings. SiteQualityAgent `launchStatus` consumes this audit (`RENDERED-ESTATE`).

## Architecture

```
sitemap (INDEXABLE only)
        ↓
assembleIndexableUrl  →  same getters as page.tsx
        ↓
visible text + images (not stored-field completeness)
        ↓
Gate 1 token-leak
Gate 2 decision-copy
Gate 3 content-sanity
Gate 4 image semantics     ← second dimension; does NOT replace media:ci
Gate 5 cross-surface        ← collapse one upstream leak to one root cause
Gate 6 uniqueness          ← analysis only; SKUs score 0
        ↓
dashboard by URL / template / entity / component / issue / severity / root cause
```

Visual/pixel checks are **expensive**. They are not run inside every unit test. The release process **requires their report** (`docs/remediation/data/image-semantic-visual/summary.json` or `docs/quality/data/visual-semantic-status.json`). Filename classification is Gate 4; pixels are the visual report.

`media:ci` remains the authenticity gate (licensed product photography vs placeholders). Gate 4 is **semantic correctness** (sport, content type, brand, product/model, article topic). An authentic padel racket on “How to Choose a Running Watch” is still a BLOCKER.

## Gate 1 — Internal / token leak (BLOCKER)

Blocks build/publication when rendered copy contains:

- `skuslug` / `skuid`
- concatenated-token explanations
- spec-token fingerprints (`255gweightasics…`)
- `[object Object]`, `undefined`, `NaN`
- raw JSON serialization
- internal agent/prompt language (`Prompt 12`, `catalog pass`, `skuStamp`, `uniqueTokenList`)

Detector: `inspectPublicContentCorruption` in `src/lib/review/public-content-corruption.ts`.

## Gate 2 — Decision copy

Inspects Best For, Not Ideal For, Buy If, Skip If, Pros, Cons on assembled pages.

| Class | Severity |
| --- | --- |
| MACHINE_LIKE / BROKEN | BLOCKER |
| WORDY / CONFUSING | HIGH |
| GENERIC / REPETITIVE | MEDIUM |

## Gate 3 — Content sanity

Duplicate paragraphs, keyword stuffing, template repetition, machine filler, malformed units, raw IDs.

| Finding | Severity |
| --- | --- |
| `you need not a …` / `[object Object]` | BLOCKER |
| Awkward uniqueness-era skip lines (`I'd pause if not a running shoe`) | HIGH |

## Gate 4 — Image semantics

Two dimensions:

| Dimension | Owner |
| --- | --- |
| MEDIA AUTHENTICITY | `npm run media:ci` |
| MEDIA SEMANTIC CORRECTNESS | this gate |

Known wrong cross-sport fillers **hard-fail**:

- `/images/home/guide-how-to-choose.jpg` (padel racket) on non-padel pages
- `/images/brands/heroes/urban-dusk.jpg` (NYC skyline) as a watch-guide primary
- product card whose file slug is a different model

UNKNOWN is never upgraded to CORRECT.

## Gate 5 — Cross-surface

Review / PDP / brand / alternatives copy from the same source must not multiply silently. One upstream corruption produces **one root-cause issue plus all affected placements**.

## Gate 6 — Uniqueness

Identifier strings, numbers, SKUs, slugs, and spec dumps contribute **zero** to editorial uniqueness.

A review is unique because its **analysis** is product-specific. Natural domain language (`cushion`, `drop`, `foam`) is not penalized.

See `editorialTokens` / `analysisTokens` / `editorialSimilarity` in `src/domain/content-uniqueness/text.ts`.

## Regression fixtures

Permanent fixtures in `src/lib/rendered-quality/fixtures.ts` / `tests/rendered-quality-gate.test.ts`:

- Novablast skuStamp
- concatenated methodology
- machine Buy If
- padel running-watch image
- skyline watch guide
- wrong-product card

## CI

Deterministic gates run against **all indexable URLs**. Visual/pixel checks are expensive: they are not inside unit tests, but **release requires their report**.

| Script | Role |
| --- | --- |
| `npm run quality:rendered` / `quality:ci` | Full estate; **exit 1 on BLOCKER** |
| `npm run ci:gates` | `quality:ci` + `media:ci` + `reviews:ci` |
| `npm run media:ci` | Authenticity (unchanged) |
| `npm run reviews:ci` | Review lifecycle (unchanged) |
| `npm run site:audit` / `--mode=launch` | **Consumes** `docs/quality/data/rendered-quality-last-run.json`; does not re-assemble. Missing report = BLOCKER. READY requires 0 rendered BLOCKERs |

Release suite: `lint` → `typecheck` → `test` → `quality:ci` → `media:ci` → `reviews:ci` → `build`. Then `site:audit --mode=launch` reads the rendered report.

HIGH findings make launch **READY WITH ISSUES**. Unresolved **BLOCKER** rendered-quality findings make it **NOT READY**.

Do not certify launch from stored-field completeness, Jaccard, or a 15-page sample.
