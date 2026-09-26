# Padel editorial parity remediation

Implementation pass after independent sign-off (`PADEL-RUNNING-PARITY-SIGNOFF.md`).
**Does not declare** REVIEW / GUIDE / MEDIA / OVERALL parity PASS — that is for the next independent audit.

## Hard parity rules (encoded)

Gates live in `src/lib/padel/parity-gates.ts` and are exercised by `parity-gates.test.ts` (unit + live estate).

### REVIEW TEMPLATE-GLUE RULE

Automatically **FAIL `PADEL_REVIEW_PARITY`** if the same non-structural reader-facing paragraph/sentence pattern appears systematically across multiple unrelated review sections/products without product-specific decision value.

- Known deepen/meta stems always fail (`I'd only keep…`, `feels generic…`, etc.).
- Scrubbed cross-product reuse (≥3 products, or ≥2 products with ≥5 hits) fails.
- Framework filler stamped across ≥3 analysis sections on one product fails.
- Structural methodology / affiliate / disclosure lines are allowed.
- Spec-anchored decision lines (weave, core names, weight bands) are allowed.
- **Word count never compensates** for repeated editorial filler (`totalWords` is informational only).

### TEACHING-MEDIA RULE

Do **not** compare total `<img>` counts.

Evaluate whether each major educational concept that materially benefits from visualization has an intentional teaching visual (`MAJOR_PADEL_GUIDE_TEACHING_CONCEPTS`).

- Product cards and repeated product packshots **do not** count as educational teaching media.
- `totalImgCount` is informational only and never clears a FAIL.
- Missing required concepts → FAIL `PADEL_GUIDE_PARITY` and `PADEL_MEDIA_PARITY`.

## Problem

Running beat Padel on longform because its content felt **edited**. Padel reviews were structurally long but editorially repetitive:

| Metric (prior audit) | Novablast | Vertex | Kuikma |
| --- | --- | --- | --- |
| “I'd only keep…” | 0 | 48 | 50 |
| “feels generic…” | 0 | 14 | 6 |
| Dedicated `/sections/` files | 6 | 0 | 0 |
| Word count | ~1,885 | ~5,187 | — |

Root cause: `extendPadelLongformSectionBody` + word-count deepen loop in `enrich-review-content.ts` stamped interchangeable closers across every short section.

Guides were long enough (~2.2–2.7k words) with tables and commerce, but unique **teaching** media lagged Running (3–6 unique imgs vs 14).

## What changed

### Reviews — kill generator glue

1. **Skip deepen pad for all padel categories** (`enrich-review-content.ts`). Quality over `REVIEW_TARGET_WORDS`.
2. **`extendPadelLongformSectionBody` returns empty** — no synonym swap; the pad itself is gone.
3. **META_PADDING** strips residual editorial-instruction language if any seed still carries it.
4. **`buildRacketEditorialProfile`** (`padel-editorial-profile.ts`) derives shape/balance/face/core-specific job, power, control, forgiveness, attack, defence lines so Vertex ≠ Kuikma ≠ Indiga.
5. **Section switch rewritten** to use the profile; universal closers (“I'd rather own a round beginner stick…”, “Diamond usually means…” stamped on every racket) removed.
6. Strengths / Best chips rewritten to reader situations; decision-copy salvage for manufacturer-note fragments; Best-guide `bestForClause` kills “Best when you are players who…”.

### Review section media

- Authentic gallery still preferred for Construction / detail.
- Conceptual topics (shape, sweet spot, power/control, grip layers) use **non-branded** SVGs under `public/images/padel/education/`.
- Shared education assets across reviews are intentional (same concept).

### Guides — visual teaching

New React diagrams in `PadelConceptDiagrams.tsx` + variants wired through `GuideConceptVisuals` / `enrich-explainer-visuals`:

| Asset | Teaches |
| --- | --- |
| `padel-sweet-spot` | Centred vs higher zone |
| `padel-power-control` | Soft round ↔ stiff diamond continuum |
| `padel-core-feel` | Soft vs firmer core metaphor |
| `padel-shoe-support` | Heel / lateral / forefoot |
| `padel-bag-anatomy` | Wells / thermo / shoes / kit |
| `padel-grip-layers` | Bare → base → overgrip |
| `padel-beginner-kit` | Starter kit composition |

Major-guide fallback pools expanded so choose-racket / shoes / bag / balls / grips / beginner each attach teaching diagrams — not more Vertex packshots.

## BEFORE → AFTER (enriched reviews)

| Metric | Before | After (runtime enrich probe) |
| --- | --- | --- |
| Vertex “I'd only keep” | 48 | **0** |
| Vertex “feels generic” | 14 | **0** |
| Kuikma “I'd only keep” | 50 | **0** |
| Kuikma “feels generic” | 6 | **0** |
| Vertex word count | ~5,187 | **~1,533** |
| Kuikma word count | — | **~1,239** |
| PUBLIC_EDITORIAL_INSTRUCTION_LANGUAGE | present | **0** on probed reviews |
| Cross-review exact deepen stems | systemic | **removed** |

Vertex overview now leads with diamond / 12K / Multieva / finishing job. Kuikma leads with round / Soft EVA / learning comfort. They are no longer interchangeable shells.

## Required quality results (implementation self-check)

| Gate | Status |
| --- | --- |
| REVIEW TEMPLATE-GLUE RULE (auto-FAIL PADEL_REVIEW_PARITY) | **PASS** live estate (`parity-gates.test.ts`) |
| TEACHING-MEDIA RULE (concept coverage; packshots ≠ teaching) | **PASS** wired major-guide pools |
| PUBLIC_EDITORIAL_INSTRUCTION_LANGUAGE = 0 | PASS (probed) |
| KNOWN_REVIEW_TEMPLATE_GLUE = 0 | PASS (probed; deepen stems removed) |
| KNOWN_DECISION_GRAMMAR_DEFECTS = 0 | Improved; residual chips use person phrases |
| BEST_CHIP_GRAMMAR_DEFECTS = 0 | Double-person “Best when you are players…” fixed |
| REVIEWS_WITHOUT_MEDIA_PLAN = 0 | CSV plan for all estate reviews |
| MAJOR_GUIDES_WITHOUT_VISUAL_LESSON_PLAN = 0 | 6 majors covered |
| BROKEN_SECTION_MEDIA | Education SVGs + gallery path |
| PUBLIC_INTERNAL_SENTINELS = 0 | Unchanged / preserved |

## Preserve passing gates

No PDP architecture changes. Commerce / mobile / Kuikma gallery / Joma / Construction paint paths untouched aside from review section education overlay.

## Artifacts

- `docs/padel/data/PADEL-REVIEW-EDITORIAL-AUDIT.csv`
- `docs/padel/data/PADEL-REVIEW-SIMILARITY.csv`
- `docs/padel/data/PADEL-REVIEW-SECTION-MEDIA.csv`
- `docs/padel/data/PADEL-GUIDE-VISUAL-LESSON-PLANS.csv`
- `docs/padel/data/PADEL-EDITORIAL-MEDIA-METRICS.csv`
- `docs/padel/data/PADEL-EDITORIAL-AUDIT-SUMMARY.json`
- `scripts/padel-editorial-parity-audit.mjs`

## Stop condition

Reviews no longer read as generated longform shells (glue gone; product-specific profiles; shorter edited length). Guides attach concept diagrams for the major choose/explain pages.

**Independent re-audit still required** before any OVERALL PASS claim.
