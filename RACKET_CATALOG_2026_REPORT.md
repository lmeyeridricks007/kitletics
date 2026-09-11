# Racket Catalog 2026 Report

Generated: 2026-08-30T23:54:09.452Z

## Before / after

| Metric | Padel before≈ | Padel after | Tennis before≈ | Tennis after |
| --- | ---: | ---: | ---: | ---: |
| Rackets | 17 | 27 | 11 | 20 |
| Brands | — | 16 | — | 7 |
| Finder eligible | — | 25 | — | 15 |
| Rec ready | — | 27 | — | 17 |
| Offers NL | — | 27 | — | 20 |

## Launch classification

| Vertical | Decision |
| --- | --- |
| PADEL | **GO WITH CONDITIONS** |
| TENNIS | **GO WITH CONDITIONS** |

## Brands represented (rackets)

### Padel
- Adidas
- Babolat
- Black Crown
- Bullpadel
- Drop Shot
- Head
- Kuikma
- Lok
- Nox
- Oxdog
- Royal Padel
- Siux
- StarVie
- Tecnifibre
- Varlion
- Wilson

### Tennis
- Babolat
- Dunlop
- Head
- Prince
- Tecnifibre
- Wilson
- Yonex

## Orchestration log

```
# Racket Launch QA (Prompt 26)

Generated: 2026-08-30T23:53:57.818Z

- npx tsc --noEmit: pass
- npx vitest run tests/racket.test.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/padel-catalog-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/tennis-catalog-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/racket-finder-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/racket-media-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/racket-relationship-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/racket-commerce-qa.ts: pass
- npx tsx --tsconfig tsconfig.json scripts/racket-content-qa.ts: pass
```
