# Padel guide parity remediation

**Date:** 2026-09-14  
**Benchmark:** Running Best Guides + Buying / long-form explainers (visual rhythm, not character count)  
**Scope:** Padel Best Guides, Buying / knowledge guides, research/editorial surfaces tied to those templates

Quality bar for this pass: purchase usefulness + visual teaching structure. A long wall of text is not treated as “complete.”

---

## Summary

| Metric | Count |
| --- | ---: |
| Guides audited (Best + Buying from prior parity CSV) | 65 (39 Best + 26 Buying) |
| Best guides content/structure deepened | 4 previously `CONTENT_BLOCKED` + shared Best chrome |
| Buying / knowledge plans with dedicated editorial heroes wired | 13 slug → guide photo map (+ product/shared fallbacks for the rest) |
| Inline teaching diagram variants added | 9 (`padel-*`) |
| Diagram system unlocked for padel family | Yes (was intentionally empty) |
| Commerce help links wired on Best category configs | Rackets, shoes, grips, bags |
| Funnel UX (eligible → considered → shortlisted → recommended) | Wired in Best chrome |
| Parity-ready (structural) | Best rackets/shoes cores + buying visual system |
| Still blocked / needs live visual pass | Soft-goods media gaps; fresh Next render review of all 65 |

---

## 1. What was wrong (vs Running)

1. **Character-count completeness** — prior audit marked guides `THIN` / `CONTENT_BLOCKED` largely from short aggregated word counts, not from missing purchase answers or visuals.
2. **Padel buying guides had no inline teaching visuals** — `FAMILY_FALLBACK_POOL.padel = []` and `attachDiagram` early-returned, so Running shoe concept art could not bleed in, but padel also got nothing.
3. **Heroes** — many buying guides fell through to shared `/images/padel/hero.jpg` or product stamps; only three dedicated guide photos existed (`choose-racket`, `choose-shoes`, `grips`).
4. **Best soft-goods** — overgrips / dry-feel / sweaty / protectors shipped with 2 awards and thin “why” surfaces; funnel language mixed admin “considered / rejected” tone in methodology copy.
5. **Commerce graph** — `buyingHelpLinks: []` on all padel Best category configs (Running shoes already had a rich help rail).

---

## 2. Remediation shipped

### Visual system (Buying / long-form)

- Added brand-neutral SVG teaching diagrams in `src/components/guides/PadelConceptDiagrams.tsx`:
  - `padel-racket-shapes` (round / teardrop / diamond)
  - `padel-racket-balance`
  - `padel-racket-weight`
  - `padel-bag-forms` (paletero vs backpack)
  - `padel-grip-vs-overgrip`
  - `padel-ball-types`
  - `padel-pressurizer`
  - `padel-decision-steps`
  - `padel-shoe-outsole`
- Wired variants into `ExplainerDiagramVariant`, `GuideConceptVisuals`, and `enrich-explainer-visuals` (padel-only pool; still never inherits Running shoe art).
- Unit coverage: padel diagrams attach; shoe concepts stay out (`enrich-explainer-visuals.test.ts`).

### Heroes

- `PADEL_GUIDE_HEROES` maps 13 high-traffic buying/knowledge slugs onto authentic guide photography under `public/images/padel/guides/`.
- Remaining specs still use `resolveHeroFromProductIds` with shared padel hero fallback (product-led, not lifestyle stock).

### Best Guides

- Methodology copy softened to consumer language (eligible / considered / shortlisted / recommended) in `method()`.
- `pick()` now stores full `whyWon` on `rationale` so recommendation cards carry real why-it-won depth.
- Unblocked previously thin soft-goods awards by promoting distinct third roles with media-ready products:
  - Best overgrips → + Nox Pro
  - Sweaty hands → + Kuikma value absorbent
  - Dry-feel → + Kuikma value dry wrap
  - Racket protectors → + Bullpadel uni
- Trust pillar copy: “products evaluated” (not admin “considered” as the public label).
- Funnel UI: **Eligible → Considered → Shortlisted → Recommended** on Best guide “How we narrowed the field”.
- Hero coverage line matches the same four-stage language.

### Internal commerce graph (without link farms)

`buyingHelpLinks` wired for:

| Category | Links |
| --- | --- |
| Rackets | How to choose · Shapes · Finder · Browse |
| Shoes | How to choose · vs tennis · Outsoles · Browse |
| Grips | Grip vs overgrip · Explained · Replace cadence · Browse |
| Bags | How to choose · Gear checklist · Browse |

Buying plans also gain a catalog browse decision link alongside Finder / Best.

---

## 3. Guides audited

### Best (39 padel)

All padel Best intents from the prior parity inventory (rackets use-cases, shoes, balls, overgrips/ergonomic, bags, pressurizers, protectors).

### Buying / knowledge (26)

All `PADEL_KNOWLEDGE_SPECS` explainers (choose racket/shoes/bag/balls, shapes/balance/weight/materials/cores, grips, beginner + checklist, etc.).

### Running benchmarks used

- Best: `/best/daily-trainers` (product cards, funnel, buying help rail pattern)
- Buying: `/guides/how-to-choose-running-shoes` + drop/cushioning concept-diagram rhythm

---

## 4. Counts for the requested report fields

| Field | Result |
| --- | --- |
| **Guides audited** | 65 |
| **Guides rewritten / deepened** | 4 Best soft-goods intents + shared Best chrome + all 26 buying plans now auto-enrich with padel diagrams |
| **Heroes added/fixed** | 13 dedicated slug → guide photo mappings; others keep product/shared hero resolution |
| **Inline media added** | 9 SVG diagram variants; section auto-attach for padel family |
| **Product visuals added** | Soft-goods Best awards expanded to ≥3 imaged recommendations where catalog media exists; Best cards already show product image / award / why / trade-off / specs / offers / review+compare when data exists |
| **Diagrams added** | 9 teaching diagrams (SVG, brand-neutral) |
| **Parity-ready** | Buying visual pipeline + Best category commerce + funnel UX + soft-goods award depth |
| **Still blocked** | See below |

---

## 5. Still blocked / follow-ups

1. **Live visual review of all 65** — local server on :3000 was not serving a fresh Kitletics build during this pass (routes 404). Code + unit tests verify diagram attach; **human/agent must re-render every indexable Best + Buying URL after `next build` / `next dev` and screenshot against Running**.
2. **Soft-goods / accessory heroes** — some considered SKUs still fragile on packshot identity (Tourna, etc.); they stay shortlisted, not forced into awards.
3. **Bags / balls / pressurizer Best** — structure OK; deeper methodology imagery still relies on product heroes rather than dedicated editorial guide photos (only three padel guide JPGs on disk).
4. **Blob upload** — `public/images/**` remains gitignored for production; no new raster assets were added (SVG diagrams ship in code). Existing guide JPGs still need blob deployment if missing in prod.
5. **Long-form unique copy** — many `PADEL_KNOWLEDGE_UNIQUE` sections remain template-adjacent; visuals + examples now teach, but a second editorial pass can still rewrite BASIC paragraphs for voice (EXPERT_RESEARCH, purchase questions).

---

## 6. Definition of done (this pass)

- [x] Character count is not the primary completeness proof
- [x] Padel buying explainers can show teaching diagrams without Running bleed
- [x] Shape / balance / weight / bag / grip / ball / pressurizer / shoe outsole concepts have accurate brand-neutral diagrams
- [x] Best funnel uses eligible → considered → shortlisted → recommended (no “rejected” in UI labels)
- [x] Best category configs link into buying guides / finder / browse without link farming
- [x] Soft-goods CONTENT_BLOCKED awards expanded with distinct third roles
- [ ] Every indexable URL visually reviewed against Running on a fresh local/prod build

---

## 7. Key files touched

- `src/components/guides/PadelConceptDiagrams.tsx` (new)
- `src/components/guides/GuideConceptVisuals.tsx`
- `src/lib/guides/explainer-blocks.ts`
- `src/lib/guides/enrich-explainer-visuals.ts` (+ test)
- `src/lib/guides/explainers/padel-knowledge-plans.ts`
- `src/lib/best/category-config.ts`
- `src/components/best/BestGuideProductsConsidered.tsx`
- `src/components/best/BestGuideHero.tsx`
- `src/components/best/UseCaseRecommendationHero.tsx`
- `src/content/padel/best-guides/build.ts`
- `src/content/padel/best-guides/accessories.ts`
- `src/content/padel/best-guides/accessories-intents.ts`
- `src/content/padel/best-guides/grips-intents.ts`
