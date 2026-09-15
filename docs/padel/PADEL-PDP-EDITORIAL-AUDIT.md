# Padel PDP editorial audit

**Date:** 2026-09-14  
**Scope:** All current padel catalog products (rackets, shoes, balls, bags, grips, accessories)  
**Principle:** Useful shopping decision content from published specs and curated seeds — never fake first-hand testing.

## Architecture

| Layer | Role |
| --- | --- |
| Racket copy | Existing `PadelRacketPdpCopy` on racket drafts |
| Soft/shoe copy | `src/content/padel/pdp-editorial/store.generated.ts` |
| Racket meta | `racket-meta.generated.ts` (READY/LIGHT/…) |
| Tiers | `tiers.ts` — A/B/C by decision complexity |
| Apply | `applyPadelPdpEditorialToProducts` upgrades thin shortDescription/verdict |
| PDP UI | Soft “How to think about this …” section when soft copy exists |
| Coverage | `docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv` |

## Depth vs state (do not conflate)

| Depth | Meaning |
| --- | --- |
| deep | Tier A decision complexity (rackets, shoes, premium bags, pressurizers, grip systems) |
| substantive | Tier B (balls, standard bags, specialized grips, protectors) |
| light | Tier C concise accessories |
| blocked | Non-current / not publication-worthy lifecycle |

| Editorial state | Meaning |
| --- | --- |
| EDITORIAL_READY | Forensic-quality, evidence-backed, natural decision copy |
| EDITORIAL_LIGHT | Useful spec-derived shopping copy; not yet forensic-signed |
| NEEDS_RESEARCH | Thin identity/specs — do not pretend depth |
| NOT_PUBLICATION_WORTHY | Discontinued / blocked |

## Coverage by category

| Category | Total | deep | substantive | light | blocked | READY | LIGHT | NEEDS_RESEARCH | NOT_PUBLICATION_WORTHY | indexable | non-indexable |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rackets | 62 | 62 | 0 | 0 | 0 | 57 | 3 | 2 | 0 | 57 | 5 |
| shoes | 41 | 41 | 0 | 0 | 0 | 5 | 36 | 0 | 0 | 27 | 14 |
| balls | 62 | 0 | 60 | 0 | 2 | 10 | 50 | 0 | 2 | 44 | 18 |
| bags | 124 | 56 | 68 | 0 | 0 | 15 | 109 | 0 | 0 | 65 | 59 |
| grips | 85 | 15 | 70 | 0 | 0 | 10 | 75 | 0 | 0 | 31 | 54 |
| accessories | 84 | 27 | 29 | 28 | 0 | 10 | 74 | 0 | 0 | 20 | 64 |

Soft PDP patches applicable: 394 (LIGHT/READY).

## Indexability honesty

Editorial copy alone does **not** force indexation. Launch eligibility still requires identity, media, and technical quality. `indexableCandidate` means content+decision depth is sufficient to *consider* indexing once media/publish gates pass.

## Generator bans enforced

No consumer prose may contain: maps to, catalog role, headline trait, SKU, prod-, internal score, confidence, “manufacturer claim:”.

No fake testing phrases (“we tested”, “after 20 hours”, “on court we found”).

## Forensic sample

Manual read queue (must sound like someone understands the product before READY):

- 10 rackets (existing manufacturer-grounded copy → READY when hero present)
- 5 shoes
- 10 balls
- 15 bags
- 10 grips
- 10 accessories

Overrides land in `overrides.json` and win over generated store on re-run.

## Next

1. Forensic overrides for soft-goods samples → promote EDITORIAL_READY
2. Replace remaining market-wave generator blurbs at source
3. Wire internal links (guides/comparisons) where missing
4. Re-run launch eligibility after media+editorial

## Artifacts

- `docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv`
- `src/content/padel/pdp-editorial/`
