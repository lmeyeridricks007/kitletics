# Fix 24 — Visual design & UX consistency QA

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** HIGH (launch surface consistency)  
**Mode:** Screenshot QA against approved Kitletics visual language — **no redesign**  
**Lab:** `http://127.0.0.1:3010` (production `next start` after rebuild)

## Objective

Screenshot-based visual QA across major templates (desktop + mobile). Keep the approved athletic/editorial commerce language. Fix only clear discrepancies that break consistency, overflow, navigation, or audience UX.

---

## 1. Screenshot inventory

Base path: [`../data/visual-qa-24/`](../data/visual-qa-24/)

| Route | Desktop | Mobile | Full (where captured) |
|---|---|---|---|
| Homepage `/` | `desktop/home.png` | `mobile/home.png` | `*-full.png` |
| Running Hub `/running` | `desktop/running-hub.png` | `mobile/running-hub.png` | yes |
| Running Shoes `/running/shoes` | `desktop/running-shoes.png` | `mobile/running-shoes.png` | — |
| Watches `/running/watches` | `desktop/running-watches.png` | `mobile/running-watches.png` | — |
| Clothing `/running/clothing` | `desktop/running-clothing.png` | `mobile/running-clothing.png` | — |
| Product `/products/nike-vomero-18` | `desktop/product.png` | `mobile/product.png` | yes |
| Review `/reviews/nike-vomero-18` | `desktop/review.png` | `mobile/review.png` | yes |
| Best `/best/running-shoes` | `desktop/best.png` | `mobile/best.png` | yes |
| Guide | `desktop/guide.png` | `mobile/guide.png` | — |
| Guides Hub `/guides` | `desktop/guides-hub.png` | `mobile/guides-hub.png` | yes |
| Comparison | `desktop/comparison.png` | `mobile/comparison.png` | — |
| Compare builder `/compare` | `desktop/compare-builder.png` | `mobile/compare-builder.png` | — |
| Alternatives | `desktop/alternatives.png` | `mobile/alternatives.png` | — |
| Brand `/brands/nike` | `desktop/brand.png` | `mobile/brand.png` | — |
| Finder | `desktop/finder.png` | `mobile/finder.png` | — |
| Finder results | `desktop/finder-results.png` | `mobile/finder-results.png` | — |
| Calculator | `desktop/calculator.png` | `mobile/calculator.png` | — |
| Search | `desktop/search.png` | `mobile/search.png` | — |
| Tools hub | `desktop/tools.png` | `mobile/tools.png` | — |
| Gear setup | `desktop/setup.png` | `mobile/setup.png` | — |
| Running contextual bar | `nav/running-contextual-bar.png` | — | — |

Machine summary: [`../data/visual-qa-24/summary.json`](../data/visual-qa-24/summary.json)  
Diagnostics: [`../data/visual-qa-24/diagnostics.json`](../data/visual-qa-24/diagnostics.json)  
Capture script: `scripts/tmp/prelaunch-24-visual-qa.mjs`

---

## 2. Approved design — pass / fail

| Criterion | Result |
|---|---|
| Near-black global header | **Pass** |
| Electric/lime accent (fills / badges) | **Pass** |
| Strong editorial display type | **Pass** |
| White editorial content planes | **Pass** |
| Real product / athletic imagery | **Pass** |
| Thin borders, restrained radius, minimal shadow | **Pass** |
| Premium athletic/editorial commerce feel | **Pass** |
| Generic SaaS / admin tables as primary UI | **Pass** (not present) |
| Fake AggregateRating / popularity | **Pass** (none) |
| Tiny product heroes as primary PDP visual | **Pass** |
| Guides Hub title-only list rows | **Pass** — premium cards + imagery (`mainImages: 39`) |
| Best as product grid | **Pass** — editorial blocks (`editorialBlocks: true`, `productGridCards: 0`) |

---

## 3. Issues found → fixed (capture → fix → recapture)

### A. Running desktop contextual nav buried decision links

**Discrepancy:** Primary row showed category chips (Watches, Heart Rate, …). Best / Reviews / Guides / Compare / Finders / Tools / Gear Sets sat in **More**.

**Fix:** Reordered `RUNNING_CONTEXTUAL_NAV` so desktop visible row is:

`Overview · Shoes / Gear · Best · Reviews · Guides · Compare · Finders · Tools · Gear Sets`

Category deep-links (Watches, HR, Hydration, Packs, Clothing, All Gear) remain in **More** / mobile scroll.

**Evidence:** `nav/running-contextual-bar.png` · `tests/contextual-nav.test.ts`

### B. Horizontal document overflow (broken logos / product thumbs)

**Discrepancy:** `/running/watches` scrollWidth **1849**; comparison page **1920**; mobile shoes hero **428**. Root cause: unconstrained `<img>` / Next `width={420}` expanding flex/absolute parents.

**Fix:**

| File | Change |
|---|---|
| `BrandMark.tsx` | `overflow-hidden` + `size-full object-contain` (no `h-auto w-auto`) |
| `CategoryPage.tsx` / `BrandsHubPage.tsx` | `min-w-0 overflow-hidden` on brand tiles |
| `ShoesCategoryHero.tsx` | Hero shoes use `fill` inside `%`-width frames + collage `overflow-hidden` |
| `ComparisonPage.tsx` | Alt thumbs `width/height={48}` + `max-w-12`; specs table wrapper `max-w-full` |

**Recapture:** watches / comparison / shoes mobile document `scrollWidth === clientWidth`.

### C. Compare builder defaulted to Accessories

**Discrepancy:** `/compare` H1 **“Compare Accessories”** — alphabetical first ready category.

**Fix:** Prefer `running-shoes` (then `gps-watches`) in `getCompareCategoryOptions` sort.

**Recapture:** H1 **“Compare Running Shoes”**.

### D. Gear setup QA path 404

**Discrepancy:** Probe used `/setups/beginner-road-running`.

**Fix:** Capture uses `/setups/beginner-running-setup` (**200**).

### E. Sitemap Author typing (blocked rebuild for QA)

**Discrepancy:** `Author` has no `updatedAt` / `publishedAt` — production rebuild failed during Fix 24 verification.

**Fix:** Author sitemap `lastmod` uses seed dates only.

---

## 4. Contextual nav (requirement)

Running desktop submenu now exposes (when content flags allow):

| Required | Shipped |
|---|---|
| Overview | Yes |
| Shoes/Gear | Yes — label **Shoes / Gear** |
| Best | Yes |
| Reviews | Yes |
| Guides | Yes |
| Compare | Yes (`category=running-shoes`) |
| Finders | Yes |
| Tools | Yes |
| Gear Sets | Yes |

---

## 5. Men / Women

| Surface | Result |
|---|---|
| Running shoes | Men’s / Women’s chips + audience cards visible |
| Clothing | Men’s / Women’s facet counts visible |
| PDP | Gender / sizing signals present |
| SEO | Filter/query only — **no duplicate gender index pages created** |

---

## 6. Guides Hub

Premium hub intact: section eyebrows, imagery, card layouts — not title-only rows.

---

## 7. Best guides

Editorial recommendation layout confirmed (why / best-for / choose-instead language). Not a product card grid.

---

## 8. Product page signals (Nike Vomero 18)

| Required | Present |
|---|---|
| Positioning / at-a-glance | Yes |
| Best for | Yes |
| Not ideal | Yes |
| Pros / trade-offs | Yes (Pros panel + Cons / Trade-offs) |
| Kitletics Review | Yes |
| Specs | Yes |
| Alternatives | Yes |
| Comparisons | Yes |
| Offers / where to buy | Yes |
| Related guides | **Yes via Featured in / Best guide links** (dedicated “Related guides” list when `relatedGuides[]` is populated) |

---

## 9. Mobile notes

| Area | Result |
|---|---|
| Document overflow (post-fix) | Cleared on watches / comparison / shoes hero |
| Intentional `overflow-x-auto` strips (brands, alt tables) | Still scroll internally — **do not expand** `document.scrollWidth` |
| Sticky chrome / filters / finder | Usable; no blocking sticky collisions observed |
| Product gallery | Contained |

False-positive “overflowX” flags in `summary.json` for mobile running-hub / alternatives come from measuring children inside horizontal scroll regions; `scrollWidth === clientWidth` confirms no page-level bleed.

---

## 10. Remaining / accepted

| Item | Disposition |
|---|---|
| Finder results empty state (`No results yet` without answers) | Expected — not a visual regression |
| Tools / home H1 textContent joins adjacent block lines (`Build` + `the`) | Visual line break intentional; not a missing-space glyph bug |
| Category deep-links in More | Intentional after decision-surface reorder |
| Full axe / CWV pass | Out of scope for Fix 24 (covered in 07 / 11) |

---

## 11. Definition of done

- [x] Desktop + mobile captures for all listed templates  
- [x] Approved visual language verified (no redesign)  
- [x] Running contextual decision nav fixed + tested  
- [x] Men/Women visible where relevant without SEO page duplication  
- [x] Guides Hub premium layout intact  
- [x] Best editorial (not grid)  
- [x] Product decision surfaces present  
- [x] Overflow fix loop: capture → fix → rebuild → recapture  
- [x] This report written  

**Do not publish. Do not commit unless asked.**
