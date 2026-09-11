# Fix 77 — Media ingest hygiene & extreme master remediation

**Date:** 2026-09-10  
**Debt:** `MEDIA-INGEST` (MEDIUM) — On Ultra Vest Pro 8–15 MB PNG gallery + Glycerin 22 hero 5.2 MB  
**Do not publish.** Did **not** recompress the 1 MB+ review-section library.

**Evidence:** [`../data/rc-77/`](../data/rc-77/) · policy [`../../media-ingest.md`](../../media-ingest.md)  
**Lab:** `next start` @ `http://127.0.0.1:3010`

---

## 1. Inventory (before)

`public/images`: **9435** image files.

| Bucket | Count | Notes |
|---|---:|---|
| **>5 MB** | **5** | This pass |
| **>3 MB** | 13 | 5 of them also >5 MB |
| **>1 MB** | 2822 | **2720** are review-section PNGs |

### >5 MB (every record)

| Product | Usage | Format | Dimensions | Size | Alpha | Provenance | Original retained |
|---|---|---|---|---:|---|---|---|
| On Ultra Vest Pro | Gallery rear | PNG | 4000×4000 | 14.68 MB | yes (cut-out) | On Contentful CDN (`sourceUrl` on gallery row) | CDN + `data/media-originals/` (gitignored binaries) |
| On Ultra Vest Pro | Gallery detail | PNG | 4000×4000 | 12.18 MB | yes | same | same |
| On Ultra Vest Pro | Gallery side | PNG | 4000×4000 | 8.35 MB | yes | same | same |
| On Ultra Vest Pro | **Unregistered leftover** `*-hero.png` | PNG | 4000×4000 | 8.35 MB | yes | Duplicate of side-1 (same sha256). Registered hero was already `*-hero.jpg` (122 KB) | Archived; **removed from `public/`** |
| Brooks Glycerin 22 | Hero | PNG | 3000×2000 | 5.20 MB | **no** | RunRepeat lab packshot (`sourceUrl` on `RUNNING_PRODUCT_MEDIA`) | CDN + archive |

Full CSV of >1 MB: [`../data/rc-77/masters-over-1mb.csv`](../data/rc-77/masters-over-1mb.csv).

### Remaining >3 MB (not converted)

Left on purpose (not ERROR / not Day-1 gallery): Ghost 16 hero 3.0 MB, Amazfit T-Rex 3 Pro hero 3.9 MB, Coros Apex 2 Pro gallery ~3.3 MB ×2, one review-surface JPEG 3.5 MB, three `/running/qa/` screenshots.

---

## 2. Ingest policy

Standard: [`docs/media-ingest.md`](../../media-ingest.md). Thresholds in `src/lib/media/ingest-policy.json`.

| Rule | Value |
|---|---|
| Hero longest edge | **2000 px** |
| Gallery longest edge | **1600 px** |
| WARN | **>1 MB** or over the role edge |
| ERROR | **>5 MB** or **>4000 px** — do not copy source bytes into `public/` |
| JPEG quality | **88** (mozjpeg) — same as existing fitness ingest |
| PNG | Only when the layout needs alpha (logos). Catalog packshots flatten onto **#ffffff** |
| AVIF/WebP | Delivery via `next/image`, not required as source masters |

Transparency on the vest cut-outs was **not required**: PDP gallery / hero sit on white / `surface-muted`. Flattening matches the already-published 122 KB vest hero JPEG. Glycerin was an opaque photo → JPEG.

---

## 3–5. Extreme files converted

| Public path after | Web master | Was |
|---|---|---|
| `…/on-ultra-vest-pro/gallery/side-1.jpg` | 1600² JPEG **122 KB** | 8.35 MB PNG |
| `…/gallery/detail-2.jpg` | 1600² JPEG **172 KB** | 12.18 MB PNG |
| `…/gallery/rear-3.jpg` | 1600² JPEG **262 KB** | 14.68 MB PNG |
| `…/glycerin-22-hero.jpg` | 2000×1333 JPEG **216 KB** | 5.20 MB PNG |
| leftover `on-ultra-vest-pro-hero.png` | removed | 8.35 MB unused duplicate |

Registry `src`, `width`, `height` updated. `sourceUrl` / licence / attribution **unchanged**.

Visual check (read files): vest mesh, On mark, flasks, and Glycerin mesh / “GLYCERIN” / DNA Loft stamp remain sharp. No black bars.

After: **`>5 MB` in `public/images` = 0**. `>1 MB` = **2817** (review-section PNGs + a handful of 1–4 MB catalog files).

---

## 6. Automated ingest guard

| Layer | Behaviour |
|---|---|
| `assessMediaIngest` | WARN / ERROR from bytes + dimensions. **Does not reject** licensed photos |
| Product onboarding | ERROR → `needs-review` + `mediaFlagged` + review reason; status is **not** `rejected` |
| `writeWebMaster` | Fetch scripts write a JPEG web master (resize / flatten) instead of raw CDN buffers |
| Hooked scripts | `fetch-running-product-media.ts`, `batch-fetch-running-media.mjs`, `fetch-training-shoes-media.mjs`, `fetch-media-gaps.mjs`, hydration / watch / P1 / gallery fetch |
| `media:agent` | Prints ERROR masters (>5 MB); **`--fail` still only P0 identity gaps** |
| CI test | `tests/media-ingest.test.ts` — **0** `public/images` files (except `/qa/`) over 5 MB |

---

## 7. Performance (no transfer regression)

Playwright 1440×900 `networkidle`, same budgets as Fix 18 / tests (`ENFORCE=1`):

| Route | Total | Images | Budget |
|---|---:|---:|---|
| `/` | 1.15 MB | 0.13 MB | OK (≤1.5 / 0.90) |
| `/running/shoes` | 1.24 MB | 0.07 MB | OK |
| `/brands/nike` | 1.09 MB | 0.03 MB | OK |
| `/products/nike-vomero-18` | 1.05 MB | 0.01 MB | OK |
| `/products/brooks-glycerin-22` | 1.11 MB | 0.01 MB | OK |
| `/products/on-ultra-vest-pro` | 1.07 MB | 0.01 MB | OK |

All **0** broken image responses. rc-60 home was ~1.21 MB / 0.13 MB images — **no regression**. Delivery is still next/image; masters are now small enough that a missed `sizes` would not dump 15 MB PNGs.

---

## 8. CI

| Command | Exit |
|---|---:|
| `npm run lint` | **0** (unused-var warnings from this pass cleaned) |
| `npm run typecheck` | **0** |
| `npm test` | **0** — 59 files / **604** tests |
| `npm run build` | **0** |

---

## Status

`MEDIA-INGEST` → **CLOSED** (`>5 MB` production masters = 0).

`MEDIA-MASTERS-1MB` remains **LOW / intentional**: 2817 files >1 MB, almost all generated review-section PNGs. Next/Image still serves them. Do not batch-recompress that set in this programme.
