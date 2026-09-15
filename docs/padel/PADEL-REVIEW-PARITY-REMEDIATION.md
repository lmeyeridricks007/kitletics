# Padel review ↔ Running parity remediation

**Date:** 2026-09-14  
**Authority:** [`data/PADEL-REVIEW-QUALITY.csv`](./data/PADEL-REVIEW-QUALITY.csv), [`data/PADEL-EDITORIAL-MEDIA-GAPS.csv`](./data/PADEL-EDITORIAL-MEDIA-GAPS.csv)  
**Reference:** Running review experience (`/reviews/nike-vomero-18`) — unique product section images, expert buying depth, honest methodology  
**Counts:** [`data/PADEL-REVIEW-PARITY-REMEDIATION-COUNTS.json`](./data/PADEL-REVIEW-PARITY-REMEDIATION-COUNTS.json)

This pass remediates the **live padel review estate** (26 reviews). It does **not** claim every catalog SKU now has a review.

---

## Executive summary

| Metric | Count |
|---|---:|
| Padel reviews processed | **26** |
| Soft / bag / ball / accessory blueprints rewritten | **3** |
| Heroes fixed (exact product media now resolves) | **5** |
| Reviews that gained new section-image sets | **6** product slugs |
| Comparison stock visuals invented | **0** (matches Running: alternatives as product cards) |
| **Parity-ready** (exact hero + ≥6 unique section images + EXPERT_RESEARCH + buy/skip) | **26** |
| Still blocked | **0** |

Audit backlog going in: **5 MEDIA_BLOCKED** (`NO_SECTION_FILES`) + **4** shoe reviews with stale `heroPresent=false` after PDP media unlock.

---

## 1. What required remediation

From the parity CSVs (padel rows only):

| Review | Prior readiness | Gap |
|---|---|---|
| `review-adidas-courtquick` | MEDIA_BLOCKED | Hero OK, **0** section files |
| `review-hesacore-padel` | MEDIA_BLOCKED | **0** section files |
| `review-bullpadel-hac-overgrip` | MEDIA_BLOCKED | **0** section files |
| `review-nox-at10-team-bag` | MEDIA_BLOCKED | **0** section files |
| `review-bullpadel-pascal-box` | MEDIA_BLOCKED | **0** section files |
| `review-adidas-crazyquick-boost-m` | READY (stale) | Hero missing in audit snapshot |
| `review-joma-t-slam` | READY (stale) | Hero missing in audit snapshot |
| `review-nox-at10-lux` | READY (stale) | Hero missing in audit snapshot |
| `review-head-sprint-pro-4-padel` | READY (stale) | Hero missing in audit snapshot |

Remaining racket/shoe reviews already met RUNNING_PARITY_READY with section estates; they were re-validated, not rewritten for word count.

---

## 2. Review heroes

All 26 now resolve an **exact** product hero via `getPrimaryProductMedia` (same gate as PDPs).

Shoe heroes that were unlocked in the PDP parity pass (`crazyquick`, `joma-t-slam`, `at10-lux`, `sprint-pro-4`, `courtquick`) now feed review heroes as well. No placeholders / brand substitutes.

---

## 3. Inline visual storytelling (Running pattern)

Generated unique product-derived section variants with:

```bash
npm run reviews:section-images -- --slugs=adidas-courtquick-padel,hesacore-padel-grip,bullpadel-hac-overgrip,nox-at10-team-bag,bullpadel-pascal-box-3b,head-padel-pro-s
```

Paths: `public/images/padel/products/<product-slug>/sections/<topic>.png`

| Product slug | Section files after pass |
|---|---:|
| `adidas-courtquick-padel` | 16 |
| `hesacore-padel-grip` | 11 |
| `bullpadel-hac-overgrip` | 11 |
| `nox-at10-team-paletero` | 12 |
| `bullpadel-pascal-box-3b` | 12 |
| `head-padel-pro-s` | 12+ |

Rules followed: one `src` per major section · product-only · no hero stamp across sections · omit buy/skip image slots (same as Vomero — `shouldSkipSectionImage` for “who should…”).

**Not done:** decorative lifestyle stock or fake multi-angle galleries from a single crop beyond the established Sharp topic variants.

---

## 4. Section–media mapping

Resolver: `resolveReviewSectionVisuals` + padel topic map in `padel-review-outline.ts` / `resolve-section-visuals.ts`.

Each attached section image carries:

- **source** — derived from authenticated product hero file under `/images/padel/products/…`
- **alt / caption** — topic captions (traction, thermal, mechanism, etc.)
- **semantic purpose** — topic key (`overview`, `tech`, `performance`, `fit`, …)
- **product identity** — path scoped to product slug

---

## 5. Review depth & category outlines

### Soft goods (was wrong)

Bags/balls/accessories were falling through `ensureCanonicalSections` into the **generic racket** blueprint (“On-court performance”, “Construction & setup”), which created text walls and wrong section jobs.

**Fixed:** category blueprints in `padel-review-outline.ts` + `blueprintForCategory` in `review-longform.ts`:

| Category | Blueprint |
|---|---|
| Bags | Capacity · thermal/shoe · carry · durability · buy/skip · value |
| Balls | Speed/court context · match vs training · freshness · buy/skip · value |
| Accessories | How it works · compatibility/workflow · limits · buy/skip · value |
| Grips | Existing grip blueprint (unchanged structure) |

`soft-decision.ts` rewritten to emit those blueprints with product-specific copy (AT10 Team vs RH Pro/XXL; Pro S+ vs Pro+; Pascal Box vs HEAD X3).

### Honesty

All 26 remain `reviewType: "expert-research"` with `EXPERT_RESEARCH_METHODOLOGY`. No first-hand testing invented. Soft intros explicitly say expert-research, not a lab/match test.

### Comparative context

Alternatives stay catalog-linked product IDs (complete padel catalog peers). No separate “comparison collage” images — Running uses the same alternatives rail pattern.

---

## 6. Media quality gate

Prior gate: long-form + only hero / zero section files → **MEDIA_BLOCKED**.

After this pass: every remediable review has exact hero **and** unique section files meeting the Running-style resolver bar (≥6 major section images; buy/skip intentionally blank like Vomero).

---

## 7. Visual QA

| Check | Result |
|---|---|
| Enriched section image attachment (all 26) | Pass — major sections imaged; unique srcs; no hero stamp |
| Desktop/mobile screenshot pairs | **Not captured** in this agent environment (same constraint as the Running↔Padel parity audit) |
| Text-wall risk | Soft goods no longer inherit empty racket “performance/tech” shells; section images break the scroll |

Recommend a local pass after Blob upload:

```bash
npm run media:blob-upload -- --only=padel/products
# then spot-check /reviews/adidas-courtquick-padel and /reviews/nox-at10-team-bag
```

---

## 8. Report counts

| Field | Value |
|---|---|
| reviews | 26 |
| rewritten | 3 soft-decision reviews (+ blueprint wiring for all soft categories) |
| heroes fixed | 5 |
| inline images added | 6 product section estates (62+ files created in first batch) |
| comparison visuals added | 0 |
| parity-ready | **26** |
| still blocked | **0** |

---

## Files touched

- `src/lib/review/padel-review-outline.ts` — bag/ball/accessory blueprints + soft image topics
- `src/lib/review/review-longform.ts` — `blueprintForCategory` for soft padel cats
- `src/lib/review/resolve-section-visuals.ts` — topic mapping for soft headings
- `src/content/padel/reviews/soft-decision.ts` — category-specific section bodies
- `scripts/generate-review-section-images.ts` — soft topic set
- `public/images/padel/products/*/sections/*.png` — generated (gitignored; upload to Blob)
- `docs/padel/data/PADEL-REVIEW-PARITY-REMEDIATION-COUNTS.json`

---

## Honest limits

- Estate size is still **selective** (26), not one review per catalog SKU.
- Section images are **hero-derived Sharp variants** (Running publish-path standard), not multi-angle manufacturer galleries.
- Full pixel QA on desktop/mobile viewports was not possible here; use Blob upload + browser spot-check before calling production “done.”
