# Media ingest standard

Production-served files live under `public/images/`. Next/Image resizes at request time, but **extreme masters still hurt git, deploys, and cold optimizer work**. Do not dump manufacturer 4000px PNG cutouts into `public/`.

This is **not** a library-wide recompress. Existing 1–3 MB review-section PNGs stay until a dedicated pass. New downloads and any file **>5 MB** must go through `writeWebMaster`.

## Web-master limits

| Role | Longest edge | Notes |
|---|---:|---|
| Hero | **2000 px** | Covers 2× a ~1000 px PDP / card cell |
| Gallery / secondary | **1600 px** | Thumbs and main gallery are smaller than the hero |
| Review section | **1600 px** | Unique product section images under `products/<slug>/sections/` |
| Absolute error cap | **4000 px** | Do not copy into `public/` as-is |

## File size

| Level | Threshold | Action |
|---|---|---|
| OK | ≤ 1 MB after ingest | Write |
| **WARN** | > 1 MB | Flag; still write a web master (resize/JPEG) |
| **ERROR** | **> 5 MB** | Do not place the source bytes in `public/` — run `writeWebMaster` first |

## Format

- **JPEG** (quality **88**, mozjpeg) for product photography — packshots, lifestyle, gallery angles, **opaque review-section photos**.
- Flatten cut-outs onto **#ffffff** when the page sits on white / `surface-muted` (PDP gallery). Transparency is not required there.
- **PNG** only when the layout genuinely needs alpha (logos, wordmarks, diagrams with transparency). Opaque PNGs are a warning; oversized opaque section PNGs are warned for JPEG conversion (do **not** mass-convert the existing tree blindly).
- **WebP/AVIF** are delivery formats via `next/image` (`next.config.ts`). Do not require them as source masters.
- Never invent product photography. Provenance (`sourceUrl`, `licence`, `attribution`) stays on the registry row.

## Public-tree hygiene (Fix 86)

**Do not** write these under `public/images/`:

| Pattern | Where it belongs |
|---|---|
| `**/qa/**`, `qa-*` screenshots | `data/qa/<area>/screenshots/` |
| `*.bak`, `*.old`, `*.tmp`, `*.orig` | delete or `data/media-orphans/` |
| `*WRONG-*` wrong-brand backups | delete after correct hero is registered |
| Flat `products/<slug>-<topic>.png` when `products/<slug>/sections/<topic>.*` exists | `data/media-orphans/` (runtime uses `sections/`) |

Onboarding uses `assessPublicMediaPath` / `assessMediaIngest({ path })` — **ERROR** on forbidden paths.

## Originals

Manufacturer / retailer CDN `sourceUrl` is the canonical original.

If a local original must be kept, store it under `data/media-originals/` (gitignored binaries, tracked `manifest.json`). Never under `public/`.

## Code

| Piece | Role |
|---|---|
| `src/lib/media/ingest-policy.json` | Numeric thresholds + forbidden path fragments |
| `src/lib/media/ingest-policy.ts` | `assessMediaIngest`, `assessPublicMediaPath` |
| `scripts/lib/media-ingest.mjs` | `writeWebMaster` for fetch scripts |

Onboarding flags WARN/ERROR from declared width/height/path; it does **not** reject licensed photos. Fetch scripts must call `writeWebMaster` before writing to `public/`, and must not target QA/backup paths.
