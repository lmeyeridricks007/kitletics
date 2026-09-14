# Padel reviews audit

**As of:** 2026-09-13  
**Method:** live TypeScript reviews (`src/content/padel/reviews/*` merged through `src/content/reviews.ts`), `canPublishReview`, page-time enrichment (`enrichReviewForPage`), authentic hero files, and section images under `public/images/padel/products/<slug>/sections/`. Inventory: `scripts/tmp/padel-reviews-audit.ts`.

This is the **Wave A / Wave B estate**, not a review on every catalog SKU. Padel remains **vertical-disabled** (`verticalLaunchStrategy.sports.padel.mode = "disabled"`). Editorial `READY` is not INDEXABLE.

Kitletics has **not** physically tested these products. No first-hand testing was manufactured.

---

## Headline

| Metric | Count |
| --- | ---: |
| **Total live padel reviews** | **22** |
| **READY** | **21** |
| **BLOCKED** | **1** |
| First-hand (`first-hand-test`) | **0** |
| Expert-research | **22** |
| Hybrid | **0** |
| Missing evidence | **0** |
| Missing images | **1** |
| Thin reviews | **1** |

Estate seed: **22** handwritten expert-research reviews (12 rackets, 8 court shoes, 2 grips).  
Uniqueness-era padel rows quarantined from winning: **52** (`isLegacyPadelBackfillReview`).

The only BLOCKED / missing-image / thin row is **Hesacore Padel Grip** (product still draft, no authentic hero). Wilson Pro Padel Overgrip is READY.

---

## Allowed review types

| Requested type | Catalog `reviewType` | Used |
| --- | --- | --- |
| `FIRST_HAND_TEST` | `first-hand-test` | None — no personal-test Evidence |
| `EXPERT_RESEARCH` | `expert-research` | All 22 estate reviews |
| `HYBRID` | `hybrid` | None |

Testing context is `EXPERT_RESEARCH_METHODOLOGY`. Copy does not claim on-court hours, smash-speed tests, durability diaries, user ratings, or popularity ranks.

---

## Architecture (post-remediation)

Padel pages **do not inherit running-shoe Ride / Kayano longform**. Court outlines win first.

| Layer | Source |
| --- | --- |
| Racket / shoe / grip outlines | `src/lib/review/padel-review-outline.ts` |
| Court longform | `src/lib/review/padel-longform.ts` |
| Page category configs | `src/lib/review/category-config.ts` (`padelRacketReviewPageConfig`, `padelShoeReviewPageConfig`) |
| Agent criteria | `src/domain/review-agent/category-config.ts` |
| Section images | `src/lib/review/resolve-section-visuals.ts` — padel categories map to family `racket` / sport folder `padel` **before** `/shoe/` |
| Estate reviews | `src/content/padel/reviews/` wired as `handwritten` in `src/content/reviews.ts` |
| Publish gate | `canPublishReview` — no `SKU`, no machine templates, readable Buy if / Skip if |
| Public copy sanitizer | `src/lib/review/padel-review-copy.ts` |

`cat-padel-shoes` must never resolve as running. That bug would stamp running section images and foam essays onto court shoes.

---

## Racket review structure

Wave A racket pages use `PADEL_RACKET_BLUEPRINT`:

Verdict · Who it is for · Who should avoid it · Construction · Shape and balance · Power · Control · Sweet spot / forgiveness · Maneuverability · Comfort · Spin · Defensive play · Net play · Smashes / attacking play · Serve / return · Strengths · Weaknesses · Best For · Not Ideal For · Alternatives · Comparisons · Specifications · Value · Methodology · Sources

Buy if / Skip if live on `whoShouldBuy` / `whoShouldAvoid` (≥3 consumer decision lines). Alternatives and comparisons are also linked as product IDs / comparison IDs on the review object.

Scores are decision aids from published shape, balance, weight, face, and core — **not** a hitting lab.

---

## Shoe reviews

Wave B uses court jobs only: traction, lateral stability, court feel, cushioning, support, fit, durability, comfort.

Not evaluated as running shoes (no drop / heel-stack / Kayano vs neutral essays).

---

## Estate roster

### Wave A — current rackets (12) — all READY, expert-research

| Review | Product | Job |
| --- | --- | --- |
| `/reviews/bullpadel-vertex-05-2026` | Vertex 05 | Current Tello diamond |
| `/reviews/bullpadel-hack-04-2026` | Hack 04 | Current Di Nenno attack diamond |
| `/reviews/bullpadel-vertex-05-hybrid-2026` | Vertex 05 Hybrid | Hybrid sibling, not a paint job |
| `/reviews/bullpadel-indiga-ctr-2026` | Indiga CTR | Beginner / forgiveness round |
| `/reviews/nox-at10-genius-18k-2026` | AT10 Genius 18K | Tapia teardrop control-leaning |
| `/reviews/nox-at10-genius-12k-alum-xtrem-2026` | AT10 Genius 12K | Teardrop Genius — **not** Attack 12K |
| `/reviews/nox-ml10-pro-cup` | ML10 Pro Cup | Classic control cup |
| `/reviews/adidas-metalbone-3-5-2026` | Metalbone **3.5** | Current Metalbone — **not** 3.3 |
| `/reviews/head-coello-pro-2026` | Coello Pro | Coello attack diamond |
| `/reviews/head-gravity-pro` | Gravity Pro | Control / round-leaning HEAD |
| `/reviews/babolat-technical-viper-3-0` | Technical Viper 3.0 | Technical-striker power diamond |
| `/reviews/kuikma-pr-comfort-soft` | PR Comfort Soft | Value comfort round |

### Wave B — high-interest court shoes (8) — all READY, expert-research

| Review | Product |
| --- | --- |
| `/reviews/asics-gel-resolution-padel` | Gel-Resolution Padel |
| `/reviews/adidas-crazyquick-boost-padel` | Crazyquick Boost Padel |
| `/reviews/adidas-courtstabil-padel` | Courtquick (catalog id still `prod-adidas-courtstabil`) |
| `/reviews/joma-t-slam` | Joma T.Slam |
| `/reviews/babolat-jet-premura` | Jet Premura |
| `/reviews/nox-at10-lux` | AT10 Lux |
| `/reviews/head-sprint-pro-4-padel` | Sprint Pro 4.0 Padel |
| `/reviews/kuikma-ps-990` | Kuikma PS 990 |

### Accessories (2)

| Review | Status | Why |
| --- | --- | --- |
| `/reviews/wilson-padel-overgrip-pack` | **READY** | Authentic packshot, published product, expert-research |
| `/reviews/hesacore-padel-grip` | **BLOCKED** | Product draft, no authentic hero, no section images |

---

## BLOCKED

| Review | Blockers |
| --- | --- |
| Hesacore Padel Grip | `missing-hero`, `missing-section-images`, `product-not-published`, thin (~2490 words) |

Do **not** generate a Hesacore packshot. Wait for an authentic product file.

---

## Intentionally not reviewed

Reviews were **not** manufactured for every SKU.

### Photo-blocked racket drafts (no review)

From [PADEL-RACKET-CATALOG-AUDIT.md](./PADEL-RACKET-CATALOG-AUDIT.md):

- `prod-nox-at10-attack-12k-2026`
- `prod-kuikma-pr-soft-500`
- `prod-drop-shot-canyon-pro`
- `prod-black-crown-special-one-soft`

### Previous generation (not Wave A)

Vertex 04, Hack 03, Metalbone 3.3, Titania Kepler, Basalto Osiris — shopper context only, labelled previous-gen. Comparison `cmp-at10-12k-vs-metalbone` still points at Metalbone **3.3**; it is **not** attached to the 3.5 review as if they were the same model.

### Other published padel products

Club/value siblings, women’s lasts, balls, bags, clothing, and tennis–padel crossover shoes (including HEAD Revolt Pro court) stay catalog-only until there is a distinct review job and authentic media.

---

## Quarantine

| Slice | Count |
| --- | ---: |
| Uniqueness-era padel rows in `reviews-backfill.ts` | 52 |
| Live leftover after filter (HEAD Revolt Pro court) | 0 — now quarantined |

`isLegacyPadelBackfillReview` removes those rows from winning. Do **not** retag all of `reviewsBackfill` as `generated_research` — that would drop running/fitness backfill precedence. Only padel rows are filtered.

P53 / P54 / unique-rewrite / editorial-rebuild padel overlays are also filtered via the same helper.

---

## Evidence and media

- Rackets: `ev-{productId}-mfr` + `ev-{productId}-editorial` from racket drafts.
- Shoes: `ev-{productId}-editorial` plus catalog manufacturer/editorial evidence.
- Grips: `ev-{productId}-mfr` + `ev-{productId}-editorial`.
- **Missing evidence: 0** on live padel reviews.
- Section images generated from authentic heroes (`npm run reviews:section-images`) for the 21 READY slugs. Unique `src` per section; no hero stamp; no other-brand stock.
- Hesacore skipped: no authentic hero.

---

## Quality bans (checked)

| Ban | Estate stance |
| --- | --- |
| Generator grammar / uniqueness stamps | Quarantined; publish gate rejects `SKU` / machine templates |
| Fake first-hand testing | None; all expert-research |
| Fake durability hour counts | Ownership notes only; no claimed session diaries |
| Fake popularity / user ratings | Not used |
| Artificial uniqueness stamps | Filtered from public copy |

Voice: professional gear analysis. Buy if / Skip if are full decision sentences (`You want` / `I'd shortlist` / `I'd skip`).

---

## Publication

| Gate | State |
| --- | --- |
| Editorial READY (21) | May ship when the vertical opens |
| INDEXABLE | **No** — padel vertical disabled |
| Production deep URLs | `HIDDEN_404` until enablement |
| Mass coverage | **No** — flagships and high-interest shoes only |

---

## Next (not this estate)

1. Authentic Hesacore packshot → then finish that accessory review.
2. Current-gen comparison rewrite for AT10 12K vs Metalbone **3.5** (replace 3.3 pairing).
3. Optional Wave C: one more beginner racket or women’s last **only** with authentic hero and a distinct job.
4. Do not write reviews for photo-blocked drafts.

---

## Inventory command

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/padel-reviews-audit.ts
```
