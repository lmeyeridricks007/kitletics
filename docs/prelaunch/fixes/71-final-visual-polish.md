# Fix 71 — Final content-density & visual polish

**Date:** 2026-09-10  
**Mode:** Screenshot QA against the approved Kitletics layout — **no redesign**  
**Lab:** `http://127.0.0.1:3012` (current source, desktop 1440×900 + **390×844**)  
**Evidence:** [`../data/visual-qa-71/`](../data/visual-qa-71/)  
**Capture:** `scripts/tmp/prelaunch-71-visual-polish.mjs` · recapture `scripts/tmp/prelaunch-71-recapture.mjs`

Richer editorial (585 reviews, long Best recs, explainer guides) must still look like the approved athletic/editorial commerce language. This pass checked **multiple examples** of each template, not one exemplar.

---

## 1. Inventory

| Template | Examples captured |
|---|---|
| Running Hub | `/running`, `/running/gear` |
| Category | shoes, watches, clothing, packs |
| Product | Vomero 18, Novablast 6, Forerunner 970, ADV Skin 12 |
| Review | Vomero 18, Novablast 6, FR 970, Polar H10, Peregrine 15 |
| Best | running-shoes, trail, watches, hydration vests |
| Guide | choose shoes, cushioning, choose watch, choose vest |
| Comparison | NB6 vs Ghost, Fenix 8 vs FR 970, Kayano vs Adrenaline |
| Alternatives | Vomero, Novablast 6, FR 970 |
| Brand | Nike, Garmin, NNormal |
| Finder | running-shoe-finder, running-hrm-finder (`running-watch-finder` is **404** — no such tool) |

Before/after for changed screens: [`before/`](../data/visual-qa-71/before/) · [`after/`](../data/visual-qa-71/after/).

---

## 2. What still looks like Kitletics

| Check | Result |
|---|---|
| Near-black header + lime accent | Pass |
| Editorial display type, white content planes | Pass |
| Real product photography | Pass |
| Best as editorial recs, not a product grid | **Pass** — detailed pick blocks + decision rail intact |
| Guides with diagrams / factor cards / product rails | Pass on long-form + explainer configs |
| Finder / alternatives / comparison heroes | Pass |
| Fake ratings / generic SaaS tables as primary UI | Not present |

---

## 3. Issues found → fixed

### A. PDP cloned the full review (oversized sections)

**Discrepancy:** After the 585-review rewrite, PDPs painted **every** review section body. Novablast PDP **24 170 px** desktop / **72 578 px** at 390px. Duplicate “Who should buy” lists sat on top of Pros / Best-for cards and again in “Should you buy it?”.

**Fix (same design system):**

- Excerpt at most **4** performance sections (~280 chars) when a full review exists (`get-product-review-summary.ts`).
- Remove the duplicate who-should-buy column; keep the four signal cards + buy/skip block + “Read full review”.

**After:** Novablast PDP **12 102** desktop / **22 552** mobile. Vomero PDP **8 632** / **14 459**.

### B. Duplicate Amazon CTAs on Reviews

**Discrepancy:** Hero had **inline Amazon + score-panel Amazon**, plus mid-article, verdict, and a second “Open Amazon listing” under Offers (6–9 Amazon hits).

**Fix:** Hero image keeps “View product details”. Buy CTA stays on the score panel, mid-article strip, and verdict. Footer duplicate removed.

**After:** Vomero **4** Amazon controls (was 6). Novablast **7** (was 9; remaining are score + mid + verdict + offer row).

Evidence: `before/rev-vomero-desktop.png` vs `after/rev-vomero-desktop.png`.

### C. Best hero image buried on 390px

**Discrepancy:** Desktop Best has a large hero photo. At 390px the long intro sat above the image, so the first screen was a text wall.

**Fix:** Show the hero photograph **immediately under the H1** on small screens (`lg:hidden`); keep the two-column desktop crop.

Evidence: `before/best-shoes-mobile.png` vs `after/best-shoes-mobile.png`.

### D. Review sections stamped the same 4/3 template

**Discrepancy:** Every body section was sticky 4/3 product-on-gray, alternating left/right. Jump-nav listed every heading (15+ chips).

**Fix:** Same tokens, content-aware layout:

- First section: intro (16/10 image, no sticky split).
- Specs/tech: compact 16/10 crop.
- Other sections: split, sticky only for the first few.
- Tighter vertical rhythm (`space-y-10` vs `16/20`).
- Jump-nav caps body headings at **8** plus structural items.

### E. Fallback guides were one `<p>` per section

**Fix:** `SimpleGuideFallback` splits `\n\n` into paragraphs. Explainer guides already use diagrams / factor cards / product examples — not decorative filler.

### F. 390px horizontal overflow

**Discrepancy:** Document `scrollWidth` leaked from brand-logo rails, category tiles, alternatives spec tables (`min-w-[48rem]`), PDP alt/compare carousels, NNormal local nav.

**Fix:** `max-w-full min-w-0` on `ScrollableTableRegion`; `overflow-x-hidden` on sport hub, category-nav wrap, brand hub, brand local nav; contained carousels with `overscroll-x-contain`.

**After:** `/running` and `/brands/nnormal` **overflow=false** at 390px. Alternatives comparison table contained. Novablast PDP still reports a residual carousel leak at 390px (contained in-region; compare rail also clipped).

---

## 4. Height / density (before → after where changed)

| Surface | Desktop before | After | 390px before | After |
|---|---:|---:|---:|---:|
| PDP Novablast 6 | 24 170 | **12 102** | 72 578 | **22 552** |
| PDP Vomero 18 | 11 602 | **8 632** | 24 992 | **14 459** |
| Review Vomero | 14 971 | 14 887 | 31 817 | 30 755 |
| Review Novablast | 40 008 | 39 452 | 87 117 | 86 080 |
| Best running shoes | 15 515 | 15 515 | 30 980 | 30 908 |
| Guide choose shoes | 7 708 | — | 15 163 | — |

Long reviews stay long (**~5.5k word band + unique section images**). We did **not** collapse the article into a grid or drop section photography. Density work on reviews is chrome (CTA, nav, spacing, layout variation), not deleting editorial.

---

## 5. Remaining (accepted / not redesigned)

| Item | Why it stays |
|---|---|
| Long review / Best pages | Editorial depth is the product. Best keeps pick analysis, not a SKU grid. |
| Guide cushion/watch ~16–17k desktop | Explainer blocks already break copy with diagrams, factor cards, product examples. |
| Category watches/clothing/packs ~11k | Catalog grids, not copy walls. |
| Cookie/consent “N” chip | Third-party overlay, not Kitletics layout. |
| `running-watch-finder` 404 | No such tool; HRM finder is the wearable finder. |
| Novablast 390px overflow residual | Horizontal compare/alt rail inside overflow-x-auto; page is usable. |
| Jump-nav still horizontal | Intended; capped and scrollable, not a second TOC redesign. |

---

## 6. Tests

`tests/review-page.test.ts`, `product-page.test.ts`, `best-guide.test.ts`, `alternatives-page.test.ts` — **77 passed**.

---

## 7. Definition of done

- [x] Multiple examples of Hub, Category, Product, Review, Best, Guide, Comparison, Alternatives, Brand, Finder
- [x] 390px pass
- [x] No redesign; Best still editorial recs
- [x] Reviews still editorial, less stamped
- [x] Before/after screenshots for changed screens
- [x] Report at this path
