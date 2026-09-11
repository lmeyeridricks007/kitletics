# Fix 86 — Public media tree hygiene

**Date:** 2026-09-11  
**Status:** Implemented  
**Gate:** `>5 MB` in `public/images` = **0**; P0 delivery budgets unchanged (not a mass recompress)  
**Evidence:** `docs/prelaunch/data/rc-86/` · `tests/media-ingest.test.ts` (9/9)

---

## 1. Classify >1 MB assets (before hygiene)

Inspected **9460** files under `public/images/`.

| Bucket | Count |
|--------|------:|
| **>5 MB** | **0** |
| **>1 MB** | **2807** |

### >1 MB by kind

| Kind | Count | Notes |
|------|------:|-------|
| Review section (`…/sections/*.png`) | **2713** | Generated product section variants |
| Product hero | 41 | Incl. Amazfit T-Rex 3 Pro ~3.9 MB PNG |
| Product other | 21 | Non-hero product tree files |
| Gallery | 16 | Watch/HRM gallery PNGs |
| Editorial / reviews / guides | ~14 | Lifestyle / guide stills |
| QA screenshot | 2 | Lab hub shots (removed this fix) |
| Other | 11 | Misc |

### >1 MB by extension

| Ext | Count |
|-----|------:|
| `.png` | 2781 |
| `.jpg` | 26 |

Full classification: `docs/prelaunch/data/rc-86/over-1mb-classified.json`, `over-1mb-by-kind.csv`.

**Conclusion:** This is **not** a mass recompression task. Almost all >1 MB files are review-section PNGs served via `next/image`. P0 delivery budgets already PASS.

---

## 2. Public-tree clutter found

| Clutter | Location | Action |
|---------|----------|--------|
| Brand hub QA PNGs | `public/images/brands/qa/` | Relocated → `data/qa/brands/screenshots/` |
| Gear hub QA | `public/images/gear/qa/` | → `data/qa/gear/screenshots/` |
| Product/review QA | `public/images/product/qa/` | → `data/qa/product/screenshots/` |
| Search QA | `public/images/search/qa/` | → `data/qa/search/screenshots/` |
| Padel lab shots | `public/images/padel/qa-padel-*.png` | → `data/qa/padel/screenshots/` |
| `*.bak` / `WRONG-*` | (none remaining after Fix 83) | Still forbidden by ingest |
| Flat Vomero section dupes | `nike-vomero-18-<topic>.png` beside live `…/sections/<topic>.png` | → `data/media-orphans/running/products/` |

No runtime references to the QA paths in `src/` / `scripts/` (only the Fix 86 inventory itself).

---

## 3. Removed / relocated (safe)

| Set | Files | ≈ bytes | Destination |
|-----|------:|--------:|-------------|
| QA screenshots (brands/gear/product/search/padel) | **18** | ~7.3 MB | `data/qa/**/screenshots/` |
| Flat Vomero section orphans (canonical `sections/` exists) | **15** | ~27.5 MB | `data/media-orphans/running/products/` |
| **Total relocated out of `public/`** | **33** | **~35 MB** (`du` Δ **38024 KB**) | |

Preserved as evidence — **not deleted**. READMEs: `data/qa/README.md`, `data/media-orphans/README.md`.

### After

| Metric | Before | After |
|--------|-------:|------:|
| `public/images` files | 9460 | **9427** |
| >5 MB | 0 | **0** |
| >1 MB | 2807 | **2790** |
| `**/qa/**` under public/images | present | **0** |
| `*.bak` under public | 0 | **0** |

---

## 4. Review-section PNGs (no mass convert)

Sampled 30 large PNGs (sections + heroes) for alpha / mode:

- **28 opaque RGB** (JPEG candidates for a *future* dedicated pass)
- **2 with alpha** (PNG appropriate)

**Policy this fix:** do **not** mass-convert. Reasons:

1. P0 delivery budgets already pass (`next/image` serves them).
2. Blind JPEG conversion risks registry/`src` mismatches and visual regression across thousands of section paths.
3. Ingest now **warns** on oversized opaque `role: "section"` PNGs for *new* writes.

Intentional retainers include:

- ~2713 review-section PNGs >1 MB  
- Large photographic heroes (e.g. Amazfit T-Rex 3 Pro 3.9 MB) until a per-asset `writeWebMaster` pass  
- Gallery PNGs for watches/HRM when still registered  

Sample assessment: `docs/prelaunch/data/rc-86/png-sample-assessment.json`.

---

## 5. Ingest rules strengthened

| Piece | Change |
|-------|--------|
| `ingest-policy.json` | `sectionMaxEdgePx`, `forbiddenPathSubstrings`, `forbiddenBasenamePatterns` |
| `assessPublicMediaPath` | ERROR on `/qa/`, `*.bak`/`*.old`/`*.tmp`, `WRONG-`, flat `slug-topic` beside sections convention |
| `assessMediaIngest` | Path checks; warn oversized opaque section PNGs |
| `writeWebMaster` | Throws if dest path contains forbidden fragments |
| `docs/media-ingest.md` | Hygiene table + section role |
| `tests/media-ingest.test.ts` | Path ERROR cases + **no QA/backup clutter** walk of `public/images` |

---

## 6. Dead-asset analysis

Method (`docs/prelaunch/data/rc-86/dead-assets.json`):

1. Index all `public/images/**` files  
2. Collect string `/images/…` refs from `src/` + `scripts/`  
3. Treat `products/<slug>/sections/*` and `*-hero.*` as live when `<slug>` exists in content (runtime convention via `resolve-section-visuals`)  
4. Remainder = **unreferenced candidates** — do **not** delete on filename alone  

| Result | Count | Notes |
|--------|------:|-------|
| Files inspected | 9460 | |
| Convention-kept (heroes/sections) | ~8398 | |
| Unreferenced candidates (pre-move) | **142** (~46 MB) | Included QA + flat Vomero orphans |
| Relocated this fix | 33 | Confirmed zero runtime refs + superseded |
| **Retained candidates** | remainder | e.g. some accessory heroes / logos — need registry confirmation before any delete |

**Not deleted this fix:** accessory heroes, brand SVGs, dual-path product files without a proven `sections/` replacement.

---

## 7. Bytes removed from public tree

| Measure | Value |
|---------|------:|
| `du -sk public/images` delta | **−38024 KB (~37.1 MB)** |
| Relocated evidence still in repo | under `data/qa/` + `data/media-orphans/` (~100 MB combined with prior running QA) |

Repository still holds the bytes as non-public evidence; **production public tree** is leaner and free of QA/backup clutter.

---

## 8. Definition of done

- [x] >1 MB assets classified by kind  
- [x] Public clutter identified and relocated (not mass-deleted)  
- [x] Review-section PNGs assessed; no blind mass convert  
- [x] Ingest flags backups / QA / wrong-brand / flat orphans / oversized opaque sections  
- [x] Dead-asset analysis documented without unsafe deletes  
- [x] Report + CI test coverage  

---

## 9. Follow-ups (optional, out of scope)

- Dedicated **per-slug** JPEG conversion for opaque section PNGs with registry/`src` updates  
- Confirm remaining unreferenced accessory heroes against `catalog-product-media` before orphaning  
- Optional Amazfit / Ghost large PNG heroes through `writeWebMaster` individually  
