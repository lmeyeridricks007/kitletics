# Padel ↔ Running Parity — Final Audit

**Date:** 2026-09-14  
**Verdict: GO**  
**Benchmark:** Running Shoes (mature Kitletics product)  
**Supersedes:** zero-debt launch audits (`PADEL-ZERO-DEBT-*`) and the earlier forensic `PADEL-RUNNING-PARITY-AUDIT.md`

**Core question (not technical validity alone):**  
Is each indexable Padel page as complete, visually rich, useful, trustworthy, and professionally curated as the equivalent mature Running experience?

---

## Artifacts

| File | Role |
|---|---|
| [`data/PADEL-RUNNING-PARITY-FINAL-SCORECARD.json`](./data/PADEL-RUNNING-PARITY-FINAL-SCORECARD.json) | GO criteria + family/media tallies |
| [`data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv`](./data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv) | Blockers / majors / residual minors |
| [`data/PADEL-RUNNING-PARITY-FINAL-PRODUCT-MEDIA.csv`](./data/PADEL-RUNNING-PARITY-FINAL-PRODUCT-MEDIA.csv) | Per-SKU media + indexability |
| [`data/PADEL-RUNNING-PARITY-FINAL-EDITORIAL-MEDIA.csv`](./data/PADEL-RUNNING-PARITY-FINAL-EDITORIAL-MEDIA.csv) | Reviews / Best / buying / comparisons (+ Running samples) |
| [`data/PADEL-RUNNING-PARITY-FINAL-CONTENT.csv`](./data/PADEL-RUNNING-PARITY-FINAL-CONTENT.csv) | Content class (decision/specificity — not word count) |
| [`screenshots/running-parity-final/`](./screenshots/running-parity-final/) | Desktop + mobile Playwright captures + `manifest.json` |
| `scripts/tmp/padel-running-parity-final-audit.ts` | Reproducible inventory scorer |

---

## Executive verdict

**GO** — the indexable Padel graph belongs to the same mature Kitletics product as Running.

| GO criterion | Result |
|---|---|
| Technical required zeros pass | **Pass** — 0 indexable missing/placeholder heroes; 0 THIN/GENERIC/REPETITIVE/BROKEN content classes on indexable set |
| No systemic Running-parity failure by page family | **Pass** — all audited families `PARITY_READY` |
| No indexable PDP missing required product imagery/content | **Pass** — 243/243 indexable PDPs exact hero + useful gallery bar (Running-calibrated) |
| Reviews/guides proper visual storytelling | **Pass** — 26/26 reviews, 26/26 Best, 21/21 buying parity-ready; 0 hero-only / 0 no-visuals |
| Manual side-by-side says same mature product | **Pass** — hubs, categories, PDPs, reviews, Best, buying guides (desktop + mobile) |

Residual **minors** only (empty racket category collage slot; Best image density slightly below Running; Running Shoes category template still slightly richer). **215** long-tail SKUs stay `MEDIA_BLOCKED` / non-indexable by design — not a public-graph failure.

---

## Method (supersedes zero-debt)

1. **Inventory** with `isDev: true` so drafts and media-blocked SKUs appear in family media tables; **GO gates** apply only to indexable/published surfaces.
2. **Content class** from decision usefulness + specificity signals (buy/skip, peers, trade-offs, product-specific claims) — **not** character/word-count proxies.
3. **Gallery bar** calibrated to Running shoes: published median gallery ≈ **1** (hero-only is OK when the hero is authentic).
4. **Screenshots** via Playwright against local `http://127.0.0.1:3015` — desktop 1440×900 and mobile 390×844 for representative Running ↔ Padel pairs plus all Padel category surfaces.
5. **Manual inspection** of **all** indexable Padel reviews (26), Best guides (26), buying guides (21), plus large PDP/category samples and side-by-sides.

---

## Running calibration (what “good” is)

| Signal | Running reality |
|---|---|
| Published shoes | 85 / 85 exact hero |
| Gallery extras | Only **11/85** — median **1** |
| Flagship PDP | Vomero 18 is effectively hero-led; richness is editorial + score UX, not multi-angle galleries |
| Review section media | ~**15** unique section files (sample avg) |
| Best media density | Sample avg meaningful images **~6.85** |
| Category template | Dedicated `RunningShoesCategoryPage` (type rail + finder widget + Best shelf) |

Padel is judged against this bar — not against inventing a higher gallery count than Running itself ships.

---

## Full product media coverage

| Family | Canonical | Exact hero | Useful gallery | Media blocked | Published | Indexable | Idx missing hero | Idx placeholder | Idx thin copy |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Rackets | 62 | 57 | 57 | 5 | 57 | 57 | 0 | 0 | 0 |
| Shoes | 41 | 27 | 27 | 14 | 27 | 27 | 0 | 0 | 0 |
| Balls | 62 | 44 | 44 | 18 | 44 | 44 | 0 | 0 | 0 |
| Bags | 124 | 65 | 65 | 59 | 65 | 65 | 0 | 0 | 0 |
| Grips | 85 | 29 | 29 | 56 | 29 | 29 | 0 | 0 | 0 |
| Accessories | 84 | 21 | 21 | 63 | 21 | 21 | 0 | 0 | 0 |
| **Total** | **458** | **243** | **243** | **215** | **243** | **243** | **0** | **0** | **0** |

**Product gates (indexable):** no missing exact hero, no placeholder/fallback hero, no inadequate/generic/schema prose, no broken gallery relative to Running-calibrated expectations.

Family verdicts: all **PARITY_READY**.

---

## Editorial media coverage (vs Running)

| Surface | Indexable | Parity ready | Avg meaningful images | Hero-only | No visuals | Running sample avg | Verdict |
|---|---:|---:|---:|---:|---:|---:|---|
| Reviews | 26 | 26 | **14.73** | 0 | 0 | 15.0 | PARITY_READY |
| Best | 26 | 26 | **4.19** | 0 | 0 | 6.85 | PARITY_READY (minor density gap) |
| Buying guides | 21 | 21 | **9.0** | 0 | 0 | — | PARITY_READY |
| Comparisons | 21 | 21 | **2.0** | — | — | — | PARITY_READY |

Alternatives / compare / brands / finder / database inspected via screenshots — same design system, media-gated where required.

---

## Content quality (not length)

Indexable entities in `PADEL-RUNNING-PARITY-FINAL-CONTENT.csv` (**316** rows: 243 products + 26 reviews + 26 Best + 21 buying):

| Class | Count |
|---|---:|
| EXCELLENT | 201 |
| GOOD | 115 |
| THIN | 0 |
| GENERIC | 0 |
| REPETITIVE | 0 |
| BROKEN | 0 |

Editorial split: reviews 25 EXCELLENT / 1 GOOD; Best 26 EXCELLENT; buying 19 EXCELLENT / 2 GOOD.

---

## Dimension scores (indexable page families)

Legend: **P** = PARITY_READY · **M** = residual minor (not systemic)

| Family | Tech | Media complete | Media semantics | Media quality | Specificity | Depth | Decision | Visual story | Internal links | Commerce | Mobile |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Hub | P | P | P | P | P | P | P | P | P | P | P |
| Category rackets | P | M* | P | P | P | P | P | M* | P | P | P |
| Category shoes | P | P | P | P | P | P | M† | P | P | P | P |
| Category soft goods | P | P | P | P | P | P | P | P | P | P | P |
| PDP rackets | P | P | P | P | P | P | P | P | P | P | P |
| PDP shoes | P | P | P | P | P | P | P | P | P | P | P |
| PDP soft goods | P | P | P | P | P | P | P | P | P | P | P |
| Reviews | P | P | P | P | P | P | P | P | P | P | P |
| Best | P | M‡ | P | P | P | P | P | P | P | P | P |
| Buying guides | P | P | P | P | P | P | P | P | P | P | P |
| Comparisons | P | P | P | P | P | P | P | P | P | P | P |

\* Empty secondary collage slot on `/padel/rackets` desktop.  
† Running Shoes category still has denser interactive finder/type rail.  
‡ Best meaningful-image average below Running sample; still visually curated with product winners.

---

## Visual audit (screenshots)

Folder: `docs/padel/screenshots/running-parity-final/` (52 captures + retries; see `manifest.json`).

### Side-by-side findings

| Pair | Finding |
|---|---|
| Hub `/padel` vs `/running` | Same dark hero system, trust shield, quick-action cards, sport-specific discovery lanes. Padel reads as the same product. |
| Category shoes | Both product-collage heroes + catalog. Running adds type-icon rail + embedded finder — residual richness, not a different brand. |
| Category rackets | Finder + Best CTAs, shape filters, authentic product grid. Minor empty collage slot. |
| PDP shoe vs Vomero | Shared PDP chrome, score, From-price, authentic heroes. Padel often leads with outsole (court-grip semantics) — appropriate, not placeholder. |
| Review racket/shoe vs Vomero | Same expert-research template, methodology honesty, score panel, Amazon CTA, deep section nav, product imagery. |
| Best rackets vs daily trainers | Same Decision Guide hero, considered/shortlist metadata, trust bar, shortlist badges. |
| Buying choose-racket vs choose-running-shoes | Same long-form layout, short version, product examples, finder CTA, TOC depth — **not** word-count walls. |
| Mobile hubs/reviews/Best | Hierarchy holds; cards stack cleanly; CTAs remain usable. |

### Manual inspection coverage

**All indexable reviews (26):**  
`adidas-courtquick-padel`, `adidas-crazyquick-boost-padel`, `adidas-metalbone-3-5-2026`, `asics-gel-resolution-padel`, `babolat-jet-premura`, `babolat-technical-viper-3-0`, `bullpadel-hac-overgrip`, `bullpadel-hack-04-2026`, `bullpadel-indiga-ctr-2026`, `bullpadel-pascal-box-3b`, `bullpadel-vertex-05-2026`, `bullpadel-vertex-05-hybrid-2026`, `head-coello-pro-2026`, `head-gravity-pro`, `head-padel-pro-s`, `head-sprint-pro-4-padel`, `hesacore-padel-grip`, `joma-t-slam`, `kuikma-pr-comfort-soft`, `kuikma-ps-990`, `nox-at10-genius-12k-alum-xtrem-2026`, `nox-at10-genius-18k-2026`, `nox-at10-lux`, `nox-at10-team-bag`, `nox-ml10-pro-cup`, `wilson-padel-overgrip-pack`.

**All indexable Best (26):**  
`padel-rackets` (+ beginner/intermediate/advanced/women/control/power/all-round/comfort/lightweight/maneuverability/value), `padel-shoes` (+ men/women/comfort/lightweight/stability/value), `padel-balls`, `padel-bags`, `padel-overgrips` (+ sweaty-hands/tacky), `padel-ergonomic-grip-systems`, `padel-ball-pressurizers`.

**All indexable buying guides (21):**  
`how-to-choose-a-padel-racket`, `how-to-choose-padel-shoes`, `how-to-choose-padel-balls`, `how-to-choose-a-padel-bag`, shape/balance/weight/cores/materials/sweet-spot explainers, grip/overgrip guides, shoe outsoles, padel-vs-tennis shoes, ball longevity, overgrip replacement cadence, beginner gear + checklist, carbon-vs-fiberglass, soft-vs-hard, round-vs-teardrop-vs-diamond.

Large samples of each product category PDP/catalog were reviewed via screenshots + inventory CSVs.

---

## Required gates checklist

### Product
- [x] No indexable PDP missing exact hero  
- [x] No placeholder/fallback hero on indexable PDPs  
- [x] Descriptions specific (EXCELLENT/GOOD only)  
- [x] Specs explained in category configs / editorial — not bare schema dump in body  
- [x] Gallery meets Running-calibrated usefulness  
- [x] No internal schema prose as buyer copy  

### Review
- [x] Product imagery + inline section storytelling (~15 images avg)  
- [x] Product-specific analysis + decision context  
- [x] Alternatives / comparisons present in template  
- [x] Methodology honesty (expert-research disclosure)  

### Guide / Best
- [x] Visual hierarchy + relevant imagery + product examples  
- [x] Decision depth (not word-count-only)  
- [x] Diagrams/tables where the guide family provides them  
- [x] Best: correct imagery, considered pool, winners, trade-offs, buyer context  

---

## Issues summary

| Severity | Count | Notes |
|---|---:|---|
| Blocker | 0 | — |
| Major | 0 | — |
| Minor | 3 | Collage slot; Best density vs Running; category interactive depth |
| Observation | 1 | 215 media-blocked long-tail (non-indexable) |

Full rows: [`data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv`](./data/PADEL-RUNNING-PARITY-FINAL-ISSUES.csv).

---

## Final call

**GO for the indexable Padel vertical.**

Padel no longer merely “passes technical checks.” Side-by-side with Running, the hubs, categories, PDPs, reviews, Best guides, and buying guides read as the same curated Kitletics experience — with honest residual polish left on category interactivity and Best media density, and with unpublished media-blocked inventory correctly kept out of the public graph.
