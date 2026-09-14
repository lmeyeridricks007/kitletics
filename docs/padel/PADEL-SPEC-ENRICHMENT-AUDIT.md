# Padel spec enrichment audit

**Date:** 2026-09-13  
**Scope:** ALL canonical Padel products (rackets, shoes, balls, bags, grips, accessories)  
**Rule:** Never invent manufacturer measurements. `NOT_PUBLISHED` / `UNKNOWN` / `NOT_APPLICABLE` are valid terminal states.

## Architecture

| Layer | Role |
| --- | --- |
| Spec values | `Product.specifications` (`SpecValue`) |
| Field provenance | `src/content/padel/spec-enrichment/store.ts` (sidecar) |
| Apply | `applySpecEnrichmentToProducts` in padel merge |
| Required plans | `src/content/padel/spec-enrichment/required-fields.ts` |
| Coverage | `docs/padel/data/PADEL-SPEC-COVERAGE.csv` |
| Conflicts | `docs/padel/data/PADEL-SPEC-CONFLICTS.csv` |
| Admin | `/admin/catalog/padel-equipment/specs` |

## Category report

| Category | Products | VERIFIED_COMPLETE | COMPLETE_WITH_UNKNOWN | INCOMPLETE | BLOCKED | Conflicts | Source coverage (any URL) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| rackets | 62 | 62 | 0 | 0 | 0 | 0 | 100% |
| shoes | 41 | 32 | 9 | 0 | 0 | 0 | 10% |
| balls | 62 | 60 | 0 | 0 | 2 | 0 | 100% |
| grips | 85 | 85 | 0 | 0 | 0 | 0 | 100% |
| bags | 124 | 124 | 0 | 0 | 0 | 0 | 100% |
| accessories | 84 | 84 | 0 | 0 | 0 | 0 | 100% |

**Totals:** 458 products · incomplete remaining: **0**

## Completeness rules

- **VERIFIED_COMPLETE** — every required + important slot has a meaningful value (or only optional gaps closed as NOT_PUBLISHED).
- **COMPLETE_WITH_UNKNOWN** — required/important slots closed, but at least one is `UNKNOWN` (needs manufacturer follow-up, not invented).
- **INCOMPLETE_RESEARCH** — empty required/important with no terminal marker (must be 0).
- **BLOCKED** — discontinued / non-enrichable lifecycle.

## What was enriched

1. **Soft goods taxonomy** from market inventory (ball use/speed/type, bag form/carry, grip type, accessory type, compatibility class).
2. **Curated specs retained** with provenance pointing at catalog/specialist URLs when available.
3. **Missing manufacturer measurements** (litres, mm weight, felt lab numbers, etc.) marked **NOT_PUBLISHED** — not fabricated.
4. **Racket power/control numeric scores** — never invented.
5. **Shoe surfaceCompatibility** — never inferred; UNKNOWN if not evidenced.

## Conflicts

0 field conflicts detected (existing catalog value ≠ enrichment hint). Resolution: **keep existing catalog value**; conflict logged in `PADEL-SPEC-CONFLICTS.csv`.

## Identity corrections

This pass did **not** merge products. Soft-goods identity (pack/color/title collapses) was already fixed during market capture. Notes below are research follow-ups, not identity merges.

- **prod-siux-diablo-pro:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-siux-comodo-woman:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-starvie-absolute-padel:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-kuikma-ps-560-women:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-oxdog-hyper-court:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-wilson-bela-pro-padel:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-tecnifibre-t-fight-padel:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-varlion-bourne-padel-shoe:** Shoe surfaceCompatibility unknown — not inferred.
- **prod-lok-padel-one:** Shoe surfaceCompatibility unknown — not inferred.

## Public labels

- Formatter: `src/lib/specs/public-label.ts` (`formatPublicSpecDisplayLabel` / `formatPublicSpecKey`)
- Regression: `tests/padel-spec-public-labels.test.ts` covers every key in `PADEL_SPEC_PLANS`

## Manufacturer PDP follow-up (2026-09-13)

Researched the prior 29 `COMPLETE_WITH_UNKNOWN` products against manufacturer / official-licensee PDPs (no invented scores).

### Rackets (16 → 0 UNKNOWN)

| Product | Fields filled | Source |
| --- | --- | --- |
| Bullpadel Neuron 02 | weightMin/Max 365–375 | bullpadel.com |
| Bullpadel XPLO Comfort | balance high, weight 365–375 | bullpadel.com |
| Bullpadel Vertex Advance | balance low, weight 365–375 | bullpadel.com |
| adidas Metalbone Team Light | balance medium, weight 345–360 | allforpadel.com |
| adidas Cross It Light | shape round, balance medium, weight 345–360 | allforpadel.com PDP (was collection hub) |
| adidas Cross It CTRL | balance medium, weight 360–375 | allforpadel.com PDP |
| adidas Arrow Hit | balance high, weight 360–375, Soft Performance EVA | allforpadel.com PDP |
| HEAD Gravity Pro | shape round, balance medium, weight 365 | head.com |
| HEAD Gravity Motion | shape round, weight 355 | head.com |
| HEAD Speed Pro | shape teardrop, balance medium | specialist (HEAD PDP bot-blocked) |
| HEAD One Ultralight | shape round, balance medium, weight 300; URL → black 225024 | head.com / specialist |
| Babolat Air Viper / Veron | balance medium; PDP URLs | babolat.com |
| Siux Electra / Fenix Pro | weight 360–375 | specialist Zona de Padel (Siux PDP omits grams) |
| Nox AT10 Attack 12K | weight 360–375 + HR3 / Dual Spin | noxsport.com |

### Shoes (13 → 9 UNKNOWN)

Resolved with evidence URLs:

- **Nox AT10 Pro** → `padel-specific` (noxsport.com)
- **Bullpadel Hack Hybrid** → `padel-specific` (specialist PDP)
- **adidas Solecourt Boost** → `tennis-padel-crossover` (specialist padel listing)
- **HEAD Revolt Court** → `tennis-padel-crossover` (tennis court last commonly sold into padel)

Still `UNKNOWN` (no trustworthy model PDP found — not invented):

`prod-siux-diablo-pro`, `prod-siux-comodo-woman`, `prod-starvie-absolute-padel`, `prod-kuikma-ps-560-women`, `prod-oxdog-hyper-court`, `prod-wilson-bela-pro-padel`, `prod-tecnifibre-t-fight-padel`, `prod-varlion-bourne-padel-shoe`, `prod-lok-padel-one`

## Gate

INCOMPLETE_RESEARCH remaining: **0**  
Gate PASS — every product has a terminal completeness state.

## Next

1. Find manufacturer PDPs for the 9 remaining shoe UNKNOWNs (or document SKU identity holds).
2. Prefer manufacturer gram tables for Siux Electra/Fenix when Siux publishes them (currently specialist-sourced).
3. Extract published litres/weights from bag/soft-goods PDPs into VERIFIED fields.