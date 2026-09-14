# Padel PDP editorial audit

**Date:** 2026-09-13  
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
| shoes | 41 | 41 | 0 | 0 | 0 | 5 | 36 | 0 | 0 | 28 | 13 |
| balls | 62 | 0 | 60 | 0 | 2 | 10 | 50 | 0 | 2 | 51 | 11 |
| bags | 124 | 56 | 68 | 0 | 0 | 15 | 109 | 0 | 0 | 83 | 41 |
| grips | 85 | 15 | 70 | 0 | 0 | 10 | 75 | 0 | 0 | 50 | 35 |
| accessories | 84 | 27 | 29 | 28 | 0 | 10 | 74 | 0 | 0 | 32 | 52 |

**Totals:** 458 products · **107 EDITORIAL_READY** · **347 EDITORIAL_LIGHT** · 2 NEEDS_RESEARCH · 2 NOT_PUBLICATION_WORTHY.

Soft PDP patches applicable: LIGHT+READY products upgrade thin/generator shortDescription and verdict on `padelAllProducts`.

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



## Forensic sample result (2026-09-13)

Manually read and promoted to **EDITORIAL_READY** (soft goods / shoes): **50** products.

Rackets: manufacturer-grounded `PadelRacketPdpCopy` remains the deep PDP source — **57 EDITORIAL_READY** when authentic hero is present (see coverage CSV).

Soft forensic IDs:
- `prod-head-padel-pro-s`
- `prod-head-padel-pro-plus`
- `prod-head-padel-team`
- `prod-wilson-padel-premier`
- `prod-wilson-padel-premier-speed`
- `prod-bullpadel-premium-pro`
- `prod-kuikma-pb-speed`
- `prod-kuikma-pb-control`
- `prod-adidas-speed-rx`
- `prod-babolat-court-padel-balls`
- `prod-bullpadel-vertex-w`
- `prod-adidas-courtstabil`
- `prod-asics-gel-resolution-padel`
- `prod-babolat-jet-premura`
- `prod-joma-t-slam`
- `prod-nox-at10-team-bag`
- `prod-adidas-protour-padel`
- `prod-wilson-super-tour-padel`
- `prod-tecnifibre-tour-endurance-backpack`
- `prod-nox-at10-xxl-bag`
- `prod-babolat-rh-pro-padel`
- `prod-bullpadel-vertex-backpack`
- `prod-babolat-court-backpack`
- `prod-head-elite-backpack`
- `prod-black-crown-spartan`
- `prod-black-crown-thunder`
- `prod-black-crown-plus`
- `prod-bullpadel-bpm26002-hack`
- `prod-bullpadel-bpp26001-vertex`
- `prod-bullpadel-bpp26022-xplo`
- `prod-hesacore-padel`
- `prod-head-xtreme-soft`
- `prod-wilson-overgrip`
- `prod-nox-pro-overgrip`
- `prod-bullpadel-gb1200`
- `prod-kuikma-overgrip`
- `prod-head-hydrosorb`
- `prod-babolat-syntec-pro`
- `prod-adidas-padel-overgrip`
- `prod-adidas-tacky-feeling`
- `prod-bullpadel-pascal-box`
- `prod-head-x3-pressurizer`
- `prod-bullpadel-frame-protector`
- `prod-bullpadel-custom-weight`
- `prod-nox-frame-protector`
- `prod-head-x3-pump`
- `prod-tuboplus-r3play`
- `prod-alacran-wide-ancha`
- `prod-bounce-filtertech-padel`
- `prod-4on-totalgrip-paste`

All forensic IDs present in store.

Rule: generated LIGHT copy stays LIGHT until a human confirms it sounds like someone understands the actual product.

## Next

1. Forensic overrides for soft-goods samples → promote EDITORIAL_READY
2. Replace remaining market-wave generator blurbs at source
3. Wire internal links (guides/comparisons) where missing
4. Re-run launch eligibility after media+editorial

## Artifacts

- `docs/padel/data/PADEL-PDP-EDITORIAL-COVERAGE.csv`
- `src/content/padel/pdp-editorial/`
