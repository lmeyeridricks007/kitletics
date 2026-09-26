# Padel review media delivery fix (Prompt 193)

Targeted production bug fix for broken review images. Delivery only — not an editorial/media-quality audit.

## Hack broken image — root cause

**HACK_BROKEN_IMAGE_ROOT_CAUSE:**
`ASSET_NOT_DEPLOYED` / `STALE_MEDIA_REFERENCE`

Trace for `/reviews/bullpadel-hack-04-2026` → “How we assessed” / “How we wrote this review”:

| Step | Value |
|------|--------|
| SOURCE_RECORD | `PRODUCT_GALLERY_MEDIA["prod-bullpadel-hack-04"]` usageType `other` |
| SOURCE_ASSET | Catalog `src`: `/images/padel/products/bullpadel-hack-04/gallery/bullpadel-hack-04-throat.webp` with authenticated `sourceUrl` on `cdn.shopify.com` |
| RESOLVED_SRC (before fix) | Local gallery path passed straight into `assessmentVisual` → `ReviewAssessment` `<Image>` |
| RENDER_COMPONENT | `ReviewAssessment` (`next/image`) |
| EXPECTED_FILE_OR_REMOTE_URL | Local under `public/images/...` **or** Shopify `sourceUrl` |

Why the browser showed alt text only:

1. `/public/images/**` is gitignored (~7GB); production serves `/images/*` via Vercel Blob rewrite.
2. Hero / section PNGs exist on Blob; **gallery packs were never uploaded** → production HEAD `404`.
3. `getProductGalleryMedia` kept the local path as `src` and ignored the working `sourceUrl`.
4. `assessmentVisual` preferred gallery `usageType: "other"` over hero → broken `<img>`.

Same class also affected:

- Other padel review sections using gallery packs
- Education SVGs under `/images/padel/education/*` (also gitignored / missing from Blob)

## Fix

1. **`resolveDeliverableMediaSrc`** — for undeployed `/images/.../gallery/` paths, prefer HTTPS `sourceUrl` only when the host is next/image-allowlisted (`DELIVERABLE_REMOTE_HOSTS` ↔ `next.config.ts` `remotePatterns`).
2. **`assignPadelPhotographicStory` / `assessmentVisual`** — remap via deliverable helper; skip assets that cannot render.
3. **Education diagrams** — copy tracked SVGs to `/public/media/padel/education/*` and point resolver there (not gitignored).
4. **Fail-safe UI** — `ReviewAssessment` and `ReviewEditorialSections` only render when `isRenderableReviewMediaSrc(src)`; otherwise no media block (never a broken `<img>`).
5. **Dead remotes** — Kuikma Decathlon SA CDN URLs 404 and are not allowlisted → gallery omitted rather than remapped to HTTP 404.

## Integrity (data layer, concurrency ≤ 2)

| Metric | Value |
|--------|------:|
| PUBLIC_PADEL_REVIEWS | 26 |
| UNIQUE_RESOLVED_MEDIA | 72 |
| VALID_LOCAL | 29 |
| VALID_REMOTE | 43 |
| MISSING_LOCAL | 0 |
| BROKEN_REMOTE | 0 |
| BAD_PATH | 0 |
| CASE_MISMATCH | 0 |
| OTHER_BROKEN | 0 |
| **BROKEN_RENDERABLE_MEDIA_REMAINING** | **0** |

Hack assessment after fix:

`https://cdn.shopify.com/s/files/1/0531/2013/9427/files/Bullpadel-Hack-04_2025_Padel_Racket_PadelUSA_store_6.webp`

## Status

```
HACK_BROKEN_IMAGE_ROOT_CAUSE:
ASSET_NOT_DEPLOYED — gallery packs under /images/.../gallery/ are gitignored and absent from Vercel Blob; resolver emitted those local paths instead of authenticated sourceUrl (Shopify). Education SVGs under /images/padel/education/ had the same Blob gap.

HACK_IMAGE:
FIXED

PUBLIC_PADEL_REVIEWS:
26

UNIQUE_RESOLVED_MEDIA:
72

VALID_LOCAL:
29

VALID_REMOTE:
43

MISSING_LOCAL:
0

BROKEN_REMOTE:
0

BAD_PATH:
0

CASE_MISMATCH:
0

OTHER_BROKEN:
0

BROKEN_RENDERABLE_MEDIA_REMAINING:
0

TARGETED_TESTS:
PASS — tests/review-media-delivery.test.ts (8 tests)

FULL_CI:
DEFERRED_TO_GITHUB_ACTIONS
```

## Files touched

- `src/lib/media/deliverable-media-src.ts` (new)
- `src/lib/review/review-media-delivery.ts` (new)
- `src/lib/review/resolve-section-visuals.ts`
- `src/components/review/ReviewAssessment.tsx`
- `src/components/review/ReviewEditorialSections.tsx`
- `src/content/product-gallery-media.ts` (comment / contract)
- `src/lib/padel/parity-gates.ts`
- `next.config.ts` (remotePatterns for retailer CDNs used as gallery fallbacks)
- `public/media/padel/education/*.svg` (tracked copies)
- `tests/review-media-delivery.test.ts`

## Estate expansion (all padel / racket pages)

Shared remap now runs in `resolveRunningProductImages` (all catalog products via repositories) and `buildGalleryImages` / `ProductMediaGallery` fail-safe.

| Surface | Count | Broken renderable |
|---------|------:|------------------:|
| Padel products (all cats) | 243 | 0 |
| Padel rackets | 57 | 0 |
| Public padel reviews | 26 | 0 |
| Review + PDP unique candidates (HEAD ≤2) | 323 | 0 |

Kuikma gallery (dead `en.decathlon.com.sa`) is omitted. Adidas Match Light remaps via `allforpadel.com` (allow-listed).

```
PADEL_PRODUCTS_SCAN:
243 products / 57 rackets — PRODUCT_IMAGE_BROKEN_REMAINING 0

PDP_GALLERY_BROKEN:
0

BROKEN_RENDERABLE_MEDIA_REMAINING:
0
```
