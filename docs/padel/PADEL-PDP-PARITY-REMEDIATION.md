# Padel PDP ↔ Running parity remediation

**Date:** 2026-09-14  
**Scope:** Product detail pages only (rackets, shoes, balls, bags, grips, accessories)  
**Authority:** [`PADEL-RUNNING-PARITY-AUDIT.md`](./PADEL-RUNNING-PARITY-AUDIT.md)  
**Reference:** Running Shoes PDP (`ProductDetailPage` + category config) — **no separate lower-quality Padel template**  
**Counts:** [`data/PADEL-PDP-PARITY-REMEDIATION-COUNTS.json`](./data/PADEL-PDP-PARITY-REMEDIATION-COUNTS.json)

**This is not a claim that the entire Padel vertical is complete.** Category shells, buying-guide visuals, review estates, and the remaining soft-goods media backlog are out of scope for this pass.

---

## Executive summary

| Metric | Count |
|---|---:|
| Products processed (canonical padel equipment) | **458** |
| Exact heroes unlocked this pass (identity-verified shoes) | **20** |
| Synthetic galleries added | **0** (matches Running median=1; no crop-duplication) |
| Soft PDP editorial regenerated | **all soft-goods + shoes** |
| Mis-assigned local files revoked (racket/apparel as “shoe”) | **10** |
| Still **MEDIA_BLOCKED** (no verified exact hero) | **215** |
| Published + featureable after gates | **243** |

Shoes moved from **~7 → 27** verified/published heroes. Soft categories still carry systemic media debt (bags/grips/accessories).

---

## 1. Architecture — reuse Running PDP chrome

Shared surface remains `ProductDetailPage` + `getProductPageData` (hero, gallery, specs, verdict, Best for / Not ideal, decision analysis, offers, review summary, comparison, alternatives, related editorial).

### Changes

| Area | Change |
|---|---|
| `category-config.ts` | Added full `ProductPageCategoryConfig` for **shoes, balls, bags, grips, accessories** (rackets already existed). Featured spec groups mirror Running density. |
| `product-detail-config.ts` | Glance / hero-tag / media-aspect keys for every padel equipment category. |
| `get-product-page-data.ts` | Quick facts + hero tags driven from detail config (not “Category: Padel shoes”). Public spec key matching fixed so glance rows resolve. |

**Visual QA (code-level):** Side-by-side data probes after the fix:

| Page | Quick facts | Featured specs |
|---|---:|---:|
| Running `nike-vomero-18` | 3 | 7 |
| Padel shoe `joma-t-slam` | 3 | 7 |
| Padel racket `bullpadel-hack-03` | 3 | 7 |
| Padel bag `babolat-rh-pro-padel` | 3 | 4 |

Full desktop screenshot pairs were not captured in this environment (same constraint as the parity audit). Density parity is validated via shared components + payload counts above.

---

## 2. Exact heroes

### Unlocked (provenance retained)

Wave27 Zona de Padel CDN URLs patched into `CATALOG_PRODUCT_MEDIA` (replacing weak `busca?controller=search` paths that failed identity). Local authentic packshots verified visually for sample SKUs (e.g. Joma T.Slam, ASICS Gel-Dedicate 8 Padel, Adidas Crazyquick Boost).

**20 product IDs** listed in `PADEL-PDP-PARITY-REMEDIATION-COUNTS.json` → `exactHeroProductIds`.

### Revoked (do not publish)

Local files existed under `public/images/padel/products/` but were **wrong category / wrong brand** when inspected:

| Product ID | What the file actually showed |
|---|---|
| `prod-wilson-bela-pro-padel` | Wilson Bela Pro **racket** |
| `prod-siux-diablo-pro` | Siux Diablo Pro **racket** |
| `prod-oxdog-hyper-court` | Joma HyperPro HRD **racket** |
| `prod-bullpadel-hack-hybrid` | Bullpadel Flow **racket** |
| `prod-nox-at10-pro-shoe` | NOX AT10 Pro Cup Soft **racket** |
| `prod-varlion-bourne-padel-shoe` | Bullpadel Vertex-W **shoe** (wrong brand) |
| `prod-lok-padel-one` | LOK apparel tee |
| `prod-siux-comodo-woman` | Siux apparel tee |
| `prod-tecnifibre-t-fight-padel` | Tecnifibre **backpack** |
| `prod-asics-solution-swift-padel-w` | Uncertain model identity vs Solution Swift |

These stay **MEDIA_BLOCKED** / draft until an exact shoe packshot is sourced.

### Still MEDIA_BLOCKED (by family)

| Family | Total | Verified hero | Media-blocked |
|---|---:|---:|---:|
| Rackets | 62 | 57 | 5 |
| Shoes | 41 | 27 | 14 |
| Balls | 62 | 44 | 18 |
| Bags | 124 | 65 | 59 |
| Grips | 85 | 29 | 56 |
| Accessories | 84 | 21 | 63 |
| **All** | **458** | **243** | **215** |

Backlog research queue remains: [`data/PADEL-MEDIA-RESEARCH-QUEUE.csv`](./data/PADEL-MEDIA-RESEARCH-QUEUE.csv) / [`data/PADEL-PRODUCT-MEDIA-GAPS.csv`](./data/PADEL-PRODUCT-MEDIA-GAPS.csv).

**Publication rule unchanged:** no exact verified hero → draft via `applyMediaPublishGate` / not featureable. No placeholders, category fallbacks, same-brand substitutes, or AI branded products used to unlock publish.

---

## 3. Galleries

- **Galleries added:** 0  
- Running reference: published shoe PDP gallery **median = 1**.  
- Policy followed: do **not** manufacture galleries by duplicating/cropping a single hero.

Where multiple authentic angles already exist in catalog registries, `buildGalleryImages` continues to surface them; this pass did not invent extras.

---

## 4. Descriptions / content depth

- Regenerated soft + shoe editorial via `scripts/tmp/enrich-padel-pdp-editorial.ts`.
- Shoe generator upgraded to use court specs (`courtOutsole`, `lateralStability`, `courtFeel`, traction) with honest research language (no fake wear testing).
- Soft editorial store covers all soft-goods SKUs; indexableCandidate still gated separately from media.

### Quality gate note

Word count alone is not “RUNNING_PARITY_READY.” Post-remediation probes (hero overview + soft/racket decision copy + buy/skip) for sample published PDPs land in **GOOD+** territory (≥180 words with decision structure). Many draft/media-blocked SKUs remain **content-light** by design until media unlocks the page.

Racket short blurbs for a subset of SKUs remain terse in seed copy; full racket `PadelRacketPdpCopy` still supplies what-it-is / buy-if on the shared PDP. Further racket prose deepening is a follow-up, not claimed done for every SKU.

---

## 5. Publication eligibility

| State | Count |
|---|---:|
| Published + verified hero + featureable | **243** |
| Draft / remaining hidden (media or authored draft) | **215** |

Gates: `hasVerifiedProductHero` → `applyMediaPublishGate` → `canFeatureProduct`. Soft editorial `NOT_PUBLICATION_WORTHY` / `NEEDS_RESEARCH` remains for thin evidence SKUs even when a page shell exists in preview.

---

## 6. Parity-ready vs blocked (honest)

### Closer to Running PDP maturity (not “vertical complete”)

- Padel **rackets** with verified heroes + racket PDP copy + now-filled featured specs/quick facts.
- Padel **shoes** with the 27 verified heroes + regenerated court-shoe editorial + shoe category config.

### Still blocked / incomplete

- **215** MEDIA_BLOCKED products (especially bags, grips, accessories).
- **5** rackets still without exact heroes.
- **14** shoes still without exact heroes (including intentional wave28 drafts).
- No multi-angle gallery program beyond Running’s hero-first pattern.
- Category listing shells / guide visuals / reviews **not** remediated here.

---

## 7. Deploy note

`public/images/**` is gitignored; production serves Blob. After merge, upload newly relied-upon padel product heroes if not already on Blob:

```bash
npm run media:blob-upload -- --only=padel/products
```

---

## 8. Files touched (primary)

- `src/lib/product/category-config.ts`
- `src/lib/product/product-detail-config.ts`
- `src/lib/product/get-product-page-data.ts`
- `src/content/catalog-product-media.ts` (shoe sourceUrl provenance fixes)
- `src/content/padel/soft-goods/product-media.ts` (attempted registers; wrong-identity entries removed)
- `src/content/padel/pdp-editorial/store.generated.ts` (+ racket meta / coverage artifacts from enrich)
- `scripts/tmp/enrich-padel-pdp-editorial.ts` (shoe depth)
- `scripts/tmp/padel-pdp-parity-remediation-counts.ts`
- `docs/padel/data/PADEL-PDP-PARITY-REMEDIATION-COUNTS.json`

---

## Definition of done for *this* pass

- [x] Reuse Running PDP architecture; soft categories get real spec configs  
- [x] Process all canonical families (not only currently indexable)  
- [x] Exact heroes only; revoke wrong identity  
- [x] No fake galleries  
- [x] Soft/shoe descriptions regenerated with category-specific evidence language  
- [x] Publication gates recalculated  
- [x] Report with counts; **no claim of full Padel vertical completion**
