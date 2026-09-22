# Image cost audit

Sep 1–17 Image Optimization: **Transformations $2.64** effective ($1.23 billed), **cache writes $1.50**, **cache reads $0.25**.

Kitletics is **65% of transformation $** ($1.70) in ~6 days. HikingWithLee $0.46, SoftwareGlimpse $0.30, ExpatCopilot $0.17.

**Do not disable `next/image` globally.** Cut variant cardinality, origin hops, and wildcard remotes.

---

## Kitletics (priority)

### Inventory

| Item | Evidence |
|---|---|
| Local files under `public/images` | **10,886** files, **7.4 GB** (8,875 png / 1,810 jpg / 170 svg / 31 webp) |
| Review section PNGs | **8,730** |
| Product image dirs | **743** |
| Deploy | `.vercelignore` excludes `public/images/**` |
| Production store | Vercel Blob `kitletics-media` **7.21 GB / 9.8k files / 6 days** |
| `next/image` importers | **69** files; **0** `unoptimized`; **0** custom loaders |
| Delivery presets | `src/lib/media/image-delivery.ts` — card 70 / hero 75 / thumb 65 |

### `next.config.ts`

```
formats: avif, webp
qualities: 65, 70, 75          // IMAGE_QUALITY_ALLOWLIST — good
deviceSizes: [640, 750, 828, 1080, 1200, 1920]   // 6
imageSizes: [48, 64, 72, 96, 128, 160, 200, 256, 320, 384]  // 10
minimumCacheTTL: 60 * 60 * 24 * 30   // 30d — good
remotePatterns: hostname "**" PLUS Blob hosts   // FAIL
rewrites: /images/:path* → MEDIA_BLOB_BASE_URL
```

Middleware **re-includes** `/images/:path*` so every origin fetch of a source image hits Edge.

**Path today:** browser `/_next/image?url=/images/…&w=&q=` (matcher skips optimizer) → optimizer fetches `/images/…` → **middleware rewrite to Blob** → transform → 30d cache.

### Variant math

Theoretical max: `(6+10) widths × 3 qualities × 2 formats` = **96 / source**.

Practical (presets + `sizes`): **~4–8 / source** (2–4 widths × 1 quality × avif/webp).

| Scenario | Unique optimized objects |
|---|---|
| Typical fill of 10,886 sources × 7 | **~76k** |
| Review page first crawl (~16 section images × 7) | **~110 / URL** |
| 373 indexable reviews first pass | **~41k** transforms from reviews alone |
| 16 Sep invoice snapshot | **54,178** Kitletics transformations in one charge row |

16 Sep snapshot ÷ ~6 live days of the period is **not** 54k/day every day (period transform $ is $1.70, not $2.71 × 6). Treat 54k as **cache-fill / crawler-spike**, HIGH as a volume that *can* happen after a deploy or first index.

Billed transformation $ is already discounted by Pro included units (effective $1.70 vs billed $0.34 on Kitletics). **The risk is the second index + every production deploy resetting writes.**

### Recommended Kitletics image policy

1. Remove `/images/:path*` from `src/middleware.ts` `matcher`. Keep `next.config` rewrite **or** (better) set `src` to the Blob public hostname so optimizer origin is Blob, not the app.
2. Replace `hostname: "**"` with Blob + known retailer CDNs only.
3. Drop unused `imageSizes` (keep 48, 72, 96, 160, 256, 384 if thumbs/cards need them; drop 64/128/200/320 if unused).
4. Keep qualities allow-list at 3 values. Never add 90/100.
5. Do not cache-bust image URLs.
6. Optional P2: pre-encode WebP/AVIF at 256/560/1080 into Blob and `unoptimized` for cards — largest transform cut, more pipeline work.

**Likely transformation reduction:** 30–50% from fewer widths + no wildcard + fewer deploys; 70%+ if cards bypass the optimizer with pre-sized Blob assets. MEDIUM on $.

**Risk:** Low for (1)(2)(3). Medium for unoptimized cards (LCP if pre-encode is sloppy).

---

## SoftwareGlimpse

Official store `softwareglimpse-blob` (**6.71 GB / 5.9k files / 28d**). Local tree is ~6.8 GB / 5,894 files **not in git**, proxied via `rewrites()` to Blob. Many guide/taxonomy images are **`unoptimized`** (full PNG over origin). Compare/best use the optimizer (`formats` avif+webp, many `deviceSizes`).

Transforms $0.30 MTD — not the bill. **Origin transfer $3.34 is the image-adjacent cost.**

**Change:** `<img>` / `next/image` `src` = Blob public URL. Keep `unoptimized` for huge diagrams **or** pre-encode WebP into Blob.

---

## HikingWithLee

882 files, 396 MB. AVIF+WebP. `deviceSizes` + `imageSizes` include **640 in both lists**. WP remotes already `unoptimized` in `public-image.tsx`. Transforms $0.46 + origin $0.55.

**Change:** dedupe 640; consider dropping AVIF if WebP-only is enough (one less format).

---

## ExpatCopilot

2,431 files, 1.5 GB. Many heroes already `unoptimized`. Remote **Clearbit / Google favicons / Cloudinary** still go through the optimizer → cache writes $0.38.

**Change:** do not optimize 16–32px third-party favicons.

---

## FluentCopilot

No `images` config (platform defaults). 9 `next/image` sites, 303 MB `public/`. No traffic. Defaults will bill transforms when users arrive — set an allow-list **before** launch traffic, not after.

---

## What not to do

- Do not set `images.unoptimized = true` on Kitletics.
- Do not stamp the same hero `src` across review sections (editorial rule, not a Vercel line item).
- Do not put 7 GB of PNG back into the Vercel deployment.
