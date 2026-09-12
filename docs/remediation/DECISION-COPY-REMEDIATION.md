# Decision copy remediation

This workstream makes consumer decision copy the easiest part of Kitletics to scan.
A visitor should understand **yes, this is probably for me** or **no, this is probably not** within seconds.

It does **not** generate section images. It does **not** declare the overall site fixed.

## Canonical model

The site had too many overlapping fields that were independently generated and then rendered as duplicates. Stored source of truth is unchanged. We did not add four new independently authored fields.

Page-time `resolveCanonicalDecisionCopy` produces **one model, two registers**:

| Register | Fields | Voice | Example |
| --- | --- | --- | --- |
| Situation glance | Best For, Not Ideal For, Who it's for / not | Buyer/use situations | Daily training with a soft, energetic ride. |
| Decision | Buy If, Skip If | Second person | You're looking for a soft, energetic daily trainer. |
| Traits | Pros, Cons | Product traits | Soft energetic daily ride with rocker geometry. |

Best For is derived from Buy If. They must not be the same string.

## Surfaces

- Review — glance / Who it's for = situation; verdict Buy if / Skip if = You-form
- PDP — hero Best for is a situation, not use-case taxonomy; review module Best for ≠ Buy if
- Best guides, comparisons, alternatives, catalog cards, finder role labels

Buying-guide explainer chips stay educational labels, not product Buy If blocks.

## Classifier

Deterministic classes: `MACHINE_LIKE`, `WORDY`, `GENERIC`, `REPETITIVE`, `CONFUSING`, `BROKEN`, `GOOD`.

Indexable product/review decision copy must not contain `MACHINE_LIKE` or `BROKEN`. Publication and launch assessment block those classes after resolve.

## Estate scan

Full published estate. Not a sample.

| Metric | Count |
| --- | ---: |
| Decision lines scanned | 26988 |
| MACHINE_LIKE before | 560 |
| BROKEN before | 12 |
| WORDY before | 1806 |
| GOOD after | 24084 |
| MACHINE_LIKE after (all) | 0 |
| BROKEN after (all) | 0 |
| MACHINE_LIKE after (indexable) | 0 |
| BROKEN after (indexable) | 0 |

Published products: 631. Published reviews: 591. Best guides: 59. Comparisons: 94.

CSV: `docs/remediation/data/DECISION-COPY-REMEDIATION.csv`

## Code

- `src/lib/decision-copy/` — types, classifier, transforms, resolver
- `src/lib/review/audience-signals.ts` — keep GOOD/WORDY consumer lines; rebuild only MACHINE / BROKEN / CONFUSING
- `src/lib/review/enrich-review-substance.ts` — apply canonical Buy/Skip when salvage has ≥2 lines
- Publication gates in `can-publish.ts` and `assess-review-quality.ts`

Re-run: `npx tsx --tsconfig tsconfig.json scripts/decision-copy-remediation.ts`
