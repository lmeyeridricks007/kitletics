# Fix 18 — Image delivery & page-weight remediation

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** HIGH  
**Lab:** `http://127.0.0.1:3010` (production `next start`)  
**Machine data:** [`../data/18-image-lab.json`](../data/18-image-lab.json)

## Objective

Cut multi-megabyte image transfer on Running hubs, brand pages, and PDPs **without redesigning pages or removing useful imagery**. Prefer Next/Image delivery sizes over destructive master recompression.

---

## 1. Trace — root cause (MEASURED)

Desktop Playwright resource timing (1440×900, `networkidle`) **before** this fix:

| Route | Total | Images | Pattern |
|---|---:|---:|---|
| `/running` | ~3.5 MB (audit 07) / ~0.5–4 MB mid-fix | mostly heroes | Mixed next/image + raw |
| `/running/shoes` | **~7.1 MB** | **~6.8 MB** | Guide cover + product heroes as **raw `<img>`** (e.g. `guide-running-shoes.jpg` 2.7 MB, `ghost-18-hero.png` 2.7 MB) |
| `/brands/nike` | **~10.7 MB** | **~10.4 MB** | **0** `/_next/image` — brand hub cards/hero/guides all raw full masters |
| `/products/nike-vomero-18` | **~6.8 MB** | **~6.6 MB** | Compare/alt rails loaded full heroes (e.g. `glycerin-22-hero.png` **5.3 MB**) |

Catalog grid (`CatalogProductCard`) already used `next/image`, but chrome around it (shoes guide cover, how-you-run, best strip, brand hub, PDP rails, sport starter kit) still requested **intrinsic full-resolution files**.

---

## 2. Fixes applied

### Delivery presets

`src/lib/media/image-delivery.ts` — shared `IMAGE_SIZES` + `IMAGE_QUALITY` for:

| Preset | Typical request |
|---|---|
| product card | ~280px / q70 |
| brand card | ~168px / q70 |
| gallery thumb | 72px / q65 |
| alt / compare thumb | 40–48px / q65 |
| PDP hero | ≤560px / q75 |
| guide cover | ≤420px / q70 |

### Components switched to `next/image` (+ lazy except true LCP)

- `ProductCard`, `CatalogProductCard` (quality/sizes tightened)
- `BrandHubPage` (hero, product tiles, families, categories, guides)
- `ProductMediaGallery` (main priority; thumbs lazy + small `sizes`)
- `ProductDetailPage` compare rail + alternatives
- `ProductReviewSection` alternative cards
- Running shoes chrome: `ShoesGuidesAndComparisons`, `ShoesHowYouRun`, `ShoesBestAndFinder`, `ShoesBrandStrip`, `ShoesCategoryHero` (priority **only** front hero shoe)
- Sport hub: `SportStarterKit`, `SportBrands`

### Next config

- Expanded `imageSizes` (48–384) for thumb/card widths
- `minimumCacheTTL` 30d for optimized outputs
- Formats unchanged: AVIF + WebP

### >500KB sources (112 heroes with `hero` in name)

**Delivery optimization is the primary fix** — do not blindly recompress masters. Multi-MB PNGs (Ghost 18, Glycerin 22, etc.) remain on disk for quality; cards now request ~5–40 KB optimized variants. Optional future wave: lossless recompress of extreme outliers (>2 MB) used as primary heroes.

### Budgets & regression tests

- `tests/image-delivery.test.ts` — presets, critical files must not use raw `<img src={`, budget config, >500KB hero count guardrail
- `scripts/tmp/prelaunch-18-image-lab.mjs` — Playwright transfer lab + budget check (`ENFORCE=1` to fail CI)

Suggested budgets (enforced in lab when `ENFORCE=1`):

| Route class | Total | Images |
|---|---:|---:|
| Homepage | &lt;1.5 MB | &lt;900 KB |
| Category / brand / PDP | &lt;2.5 MB | &lt;2.0 MB |

---

## 3. BEFORE → AFTER (MEASURED)

Same harness: desktop 1440×900, production lab, image + document transfer.

| Route | Before (audit 07 / pre-fix lab) | After (fix 18) | Images after | Budget |
|---|---:|---:|---:|---|
| `/` | 405 KB | **1.21 MB** | **0.13 MB** | OK |
| `/running` | **3.5 MB** | **1.45 MB** | **0.25 MB** | OK |
| `/running/shoes` | **7.1 MB** | **1.28 MB** | **0.09 MB** | OK |
| `/brands/nike` | **10.7 MB** | **1.07 MB** | **0.03 MB** | OK |
| `/products/nike-vomero-18` | **6.8 MB** | **1.09 MB** | **0.01 MB** | OK |

**Dramatic reductions:** shoes **−82%**, Nike brand **−90%**, Vomero PDP **−84%**, Running hub **−59%**.

Homepage total rose vs the thin 405 KB audit snapshot (more next/image AVIF variants counted), but stays **under 1.5 MB** with images only **0.13 MB**.

Raw product hero downloads on these routes: **~0** (Nike may still load a tiny SVG logo outside the optimizer — negligible).

---

## 4. LCP / priority policy

| Surface | Priority |
|---|---|
| Shoes category hero (front shoe only) | `priority` |
| Brand hub logo + featured product | `priority` |
| PDP gallery main | `priority` |
| Catalog first 2 cards | `priority` |
| Below-fold grids, rails, thumbs, guides, starter kit | `loading="lazy"` |

---

## 5. Verification

```bash
npx vitest run tests/image-delivery.test.ts
npm run build && npx next start -p 3010
BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-18-image-lab.mjs
# optional CI gate:
ENFORCE=1 BASE_URL=http://127.0.0.1:3010 node scripts/tmp/prelaunch-18-image-lab.mjs
```

---

## 6. Residual

| Item | Notes |
|---|---|
| Multi-MB source masters on disk | Kept; delivery-sized via `/_next/image` |
| Other hubs (gear, discipline, search cards) | Still some raw `<img>` — out of Day-1 Running critical path |
| Finder JS weight | Unrelated (~888 kB First Load) — not this fix |
| Publish | **Do not publish** |

---

## Definition of done

- [x] Trace representative routes  
- [x] Product cards not downloading hero-resolution masters  
- [x] Next/Image sizes / quality / priority / lazy corrected on critical surfaces  
- [x] Below-fold lazy; above-fold LCP limited  
- [x] >500KB sources audited (delivery preferred)  
- [x] Brand / shoes / PDP remesured with large wins  
- [x] Route budgets + regression tests  
- [x] Report written  
- [ ] Publish — **No**
