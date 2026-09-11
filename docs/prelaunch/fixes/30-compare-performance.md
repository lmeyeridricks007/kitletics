# Fix 30 — Compare page performance

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Lab data:** [`../data/rc-final/30-compare-perf.json`](../data/rc-final/30-compare-perf.json)

## Objective

Bring `/compare` (empty builder) under the **≤2.5 MB** initial-transfer budget (prefer **&lt;1 MB** with no products selected) without removing compare UX.

---

## 1. Image request trace (before)

Desktop Playwright (`networkidle`, 1440×900) — RC `perf-extra.json`:

| Metric | Before |
|---:|---:|
| Total | **~9.2 MB** (9 248 KB) |
| Images | **~9.0 MB** (8 970 KB) |
| JS | ~168 KB |

### What loaded on empty `/compare`

Default category = **running-shoes** → Featured comparisons for that category:

| Fact | Value |
|---|---|
| Featured comps (before cap) | 12 |
| Unique product hero files | **16** |
| Sum of on-disk masters | **~9.18 MB** |
| Largest | `ghost-16-hero.png` 3.0 MB, `ghost-18-hero.png` 2.7 MB, `alphafly-3-hero.png` 1.0 MB |

Delivery pattern:

- `FeaturedComparisons` + `ProductSearchSelector` used **raw `<img src={hero}>`**
- Rendered cell ~**64–72px**; intrinsic = full hero (often multi‑MB PNG)
- Eager for all featured thumbs (first paint / networkidle)
- **0** `/_next/image` requests on the builder empty state

Search dropdown could also request full heroes for up to 10 result rows when focused.

---

## 2. Root cause

| Check | Finding |
|---|---|
| Eagerly loads all comparison Product imagery | **Yes** — featured grid for current category |
| Loads hidden Product selector results | On focus (before fix); not the main 9 MB |
| Loads full hero images | **Yes** — masters, not card/thumb variants |
| Preloads catalog imagery | Index embeds `thumbnailSrc` URLs; **transfer** came from rendered `<img>` |
| Offscreen suggestions | Featured grid below fold still fetched at networkidle |
| Duplicate images | Some heroes repeated across comps; unique set still ~9 MB |
| Wrong Next/Image `sizes` | **No next/image at all** on featured/search |

Same class of bug as Fix 18 (brand hub / shoes chrome): small UI cells requesting full masters.

---

## 3–6. Fixes

### Empty / featured (initial page)

- `FeaturedComparisons` → `next/image` + `IMAGE_SIZES.compareFeaturedThumb` (~64–72px) + `IMAGE_QUALITY.thumb`
- Cap **8** featured comps per category (was 12 for shoes)
- Lazy-load all but the first card pair
- Search does **not** load result media until the user **types** (empty focus = hint only)

### Selected products

- Sidebar already used `next/image`; tightened `sizes`/`quality`
- `CompareResults` selected cards → `IMAGE_SIZES.compareSelectedCard` (~220px desktop / 45vw mobile) + card quality

### Product search

- Result + selected thumbs via `next/image` (`compareSearchThumb` / `altThumb`)
- Lazy; only after query non-empty

### Editorial `/compare/[slug]`

- Alternatives list raw `<img>` → `next/image` + `altThumb`

### Presets / guardrails

- `src/lib/media/image-delivery.ts` — `compareFeaturedThumb`, `compareSelectedCard`, `compareSearchThumb`
- `tests/image-delivery.test.ts` — critical files include compare components; budget for `/compare` ≤2.5 MB

---

## 7. Re-measure (after)

Lab: `BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-30-compare-lab.mjs`

| Scenario | Total | Images | JS | FCP | TTFB | CLS | Budget ≤2.5 MB |
|---|---:|---:|---:|---:|---:|---:|---|
| **Before** `/compare` | **9 248 KB** | **8 970 KB** | 168 KB | — | — | — | FAIL |
| **After** empty desktop | **1 741 KB** | **7 KB** | 558 KB | 504 ms | 233 ms | 0 | **PASS** |
| After selected (NB6 vs Nimbus) | **1 854 KB** | **9 KB** | — | — | — | — | **PASS** |
| After empty mobile (390×844) | **1 740 KB** | **6 KB** | — | — | — | — | **PASS** |

| Delivery | Empty after |
|---|---|
| `/_next/image` requests | 12 |
| Raw product image files | **0** |

### Prefer &lt;1 MB (empty)

Not met (~1.7 MB). Remaining weight is **JS + RSC/HTML** (full compare product index in the client payload), **not** product imagery (~7 KB). Images alone are well under 1 MB. Slimming the serialized index is a follow-up, not required for the 2.5 MB launch budget.

---

## 8. Files touched

| File | Change |
|---|---|
| `src/components/compare/FeaturedComparisons.tsx` | next/image + cap + lazy |
| `src/components/compare/ProductSearchSelector.tsx` | next/image; thumbs only after type |
| `src/components/compare/CompareResults.tsx` | tighter selected card sizes |
| `src/components/compare/CompareSelectionSidebar.tsx` | thumb quality/sizes |
| `src/components/compare/ComparisonPage.tsx` | alternatives next/image |
| `src/lib/media/image-delivery.ts` | compare size presets |
| `tests/image-delivery.test.ts` | critical files + `/compare` budget |
| `scripts/tmp/prelaunch-30-compare-lab.mjs` | measure script |

---

## 9. Definition of done

- [x] Initial `/compare` transfer ≤2.5 MB  
- [x] Empty-state product media no longer full heroes  
- [x] Search uses small lazy thumbs only when needed  
- [x] Selected/compare cards use card-sized delivery  
- [x] Mobile does not pull desktop masters  
- [x] UX retained (featured comps + search + results)  
