# Padel Compare & Alternatives audit

**As of:** 2026-09-13  
**Quality:** `isMeaningfulComparison` + `computeAlternativesQualitySignals`  
**Inventory:** `scripts/tmp/padel-comparisons-audit.ts` → `data/staging/padel-comparisons-quality.json`

Padel remains **vertical-disabled**. Editorial MEANINGFUL / content-indexable ≠ production INDEXABLE (deep URLs stay `HIDDEN_404` until enablement).

Kitletics has **not** physically tested these products. Dimension winners are declared only where catalog geometry, manufacturer jobs, and normalized fields support them. When evidence is thin, the criterion is present **without** a `winnerProductId`.

---

## Headline

| Metric | Count |
| --- | ---: |
| **Comparisons shipped** | **12** |
| **`isMeaningfulComparison`** | **12 / 12** |
| **Thin permutations** | **0** (not generated) |
| **Retired thin/wrong pairs** | **2** |
| **Flagship alts content-indexable (policy bar)** | **10 / 10 sampled** |
| **Mass permutation matrix** | **Not built** |

---

## Comparison dimensions

`padelRacketComparisonConfig` now covers:

| Dimension | Spec / score key |
| --- | --- |
| Shape | `shape` |
| Balance | `balance` |
| Weight | `weightMin` / `weightMax` |
| Surface | `face` / `faceMaterial` |
| Frame | `frame` |
| Core | `core` / `manufacturerCoreName` |
| Feel | `feel` |
| Power / Control / Comfort / Maneuverability / Forgiveness / Stability / Spin | score factors + criteria |
| Player level / Play style | `playerLevel` / `playStyle` |
| Price / offers | criterion + live offers UI (no invented street prices) |

Score chart factors: power, control, comfort, maneuverability, forgiveness, stability, spin, value.

---

## Decision output (every page)

Each comparison includes:

- **Choose A if… / Choose B if…** via `chooseProductReasons`
- **Biggest difference** as the first `keyDifferences` entry (`key: biggest-difference`)
- **Power / Control / Comfort / Maneuverability** criteria with winners **only when evidence supports** (otherwise notes, no winner)
- Use-case picks (`uc-padel-*`)
- Context-dependent verdict — no fake universal winner

UI already surfaces Choose-if in Quick Verdict + Decision guide; Key Differences section shows the biggest-difference block. Comparison page copy now uses category `productNounSingular` (racket) instead of hard-coded “shoe”.

---

## High-value comparisons (catalog-derived)

| Slug | Job | Why it exists |
| --- | --- | --- |
| `bullpadel-vertex-05-vs-hack-04-2026` | Same-brand usable diamond vs finishing | Search + Best Guide fork |
| `bullpadel-vertex-05-vs-nox-at10-12k-2026` | Nox vs Bullpadel flagships | Genius **teardrop** vs Vertex **diamond** (not two diamonds) |
| `nox-at10-12k-vs-adidas-metalbone-2026` | Nox vs Adidas | Current **Metalbone 3.5** (not 3.3) |
| `nox-at10-genius-18k-2026-vs-babolat-technical-viper-2026` | All-court vs attack | Genius vs Technical Viper |
| `babolat-technical-viper-vs-counter-viper` | Same-family control vs power | Viper family geometry fork |
| `nox-at10-genius-12k-vs-at10-attack-18k-2026` | Same-family Genius vs Attack | Stops Genius≠Attack confusion |
| `bullpadel-vertex-05-vs-vertex-05-hybrid` | Diamond vs hybrid | Same-year silhouette fork |
| `bullpadel-vertex-04-vs-vertex-05` | Previous vs current | Labeled generation comparison |
| `nox-ml10-pro-cup-vs-bullpadel-indiga-ctr` | Control cup vs beginner round | Placement vs first-racket |
| `head-coello-pro-vs-babolat-technical-viper` | Head vs Babolat attack | Replaces wrong Coello/Diablo seed |
| `bullpadel-hack-04-vs-adidas-metalbone-3-5` | Power rivals | Hack vs current Metalbone |
| `babolat-technical-viper-2026-vs-wilson-bela-pro-v2-2026` | Attack feel preference | Upgraded thin seed |

### Retired

| Old id | Reason |
| --- | --- |
| `cmp-nox-bullpadel` | Current AT10 18K vs **previous-gen Vertex 04** as peers |
| `cmp-head-siux` | Misframed Coello as value hybrid / Diablo as beginner round |

---

## Alternatives

### Config
- Reason tabs: more control, more power, easier handling, softer feel, more forgiving, value, similar role, previous gen
- Table columns: shape, weight, balance, core, score, best for, price

### Graph
- Flagship `ProductRelationship` edges with **why similar / what changes / who should switch|stay** reasons
- Metalbone competitor edges point at **3.5**, not 3.3
- Genius vs Attack / Technical vs Counter / Vertex vs Hybrid / Vertex vs Hack explicitly wired
- Catalog `toAlternatives()` no longer uses the generic “Adjacent padel racket…” stub — typed reasons by job

### Flagship sample (content bar)

All 10 sampled major rackets pass `evaluateAlternativesContentIndexable` (≥3 substantive alts, ≥2 reason groups, distinct copy). Production indexation still blocked by vertical hold.

---

## Indexability policy

| Gate | Behaviour |
| --- | --- |
| Vertical `disabled` | Comparisons + alternatives → **HIDDEN_404** in prod |
| Thin comparison | **Not generated** — only `strongPadelComparison()` pages ship |
| Meaningful bar | ≥2 criteria + use-case picks + keyDifferences (or long summary path) |
| Dynamic `?products=` builder | Always **noindex** |
| Alternatives | Category allowlisted; content bar requires substantive switch/stay copy |

When padel is enabled, these 12 comparisons are the indexable set unless a future audit marks one thin.

---

## Files

| Path | Role |
| --- | --- |
| `src/content/padel/comparisons/` | Strong editorial comparisons |
| `src/lib/comparison/category-config.ts` | Padel dimensions + score factors |
| `src/content/padel/wave26.ts` | Relationships + empty legacy comps array |
| `src/lib/product/alternatives-config.ts` | Padel reason tabs |
| `src/content/padel/rackets/build.ts` | Better alt typing + reasons |
| `src/components/compare/ComparisonPage.tsx` | Noun-aware decision copy |

Re-run:

```bash
npx tsx scripts/tmp/padel-comparisons-audit.ts
```

---

## Definition of done

- [x] Racket comparison dimensions expanded  
- [x] Choose A/B + biggest difference + selective dimension winners  
- [x] High-value comps from catalog relationships (no mass matrix)  
- [x] Major-racket alternatives with useful reasons  
- [x] Thin permutations not generated; index policy documented  
- [x] `docs/padel/PADEL-COMPARISON-AUDIT.md`
