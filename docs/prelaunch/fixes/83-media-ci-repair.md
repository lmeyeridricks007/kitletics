# Fix 83 — Restore Media CI

**Date:** 2026-09-11  
**Status:** Implemented  
**Gate:** `npm run media:ci` → **exit 0**  
**Evidence:** `data/staging/catalog-media-audit-2026-09-11.{json,md}` · `tests/catalog-media-audit.test.ts`

---

## 1. Root cause

`scripts/lib/catalog-media-audit.ts` called:

- `getPrimaryProductMedia`
- `isAuthenticProductMedia`

…but **lost the import** from `@/lib/product/media`.

The helpers were **not** moved, renamed, or replaced. Production still uses the same canonical resolver in `src/lib/product/media.ts` (`getPrimaryProductMedia` → running registry → catalog registry → authentic `product.images[0]`).

Crash:

```text
ReferenceError: getPrimaryProductMedia is not defined
  at classifyGap (scripts/lib/catalog-media-audit.ts)
```

**Fix:** restore the import. No duplicate helper.

---

## 2. Canonical resolver

| Layer | Path |
|---|---|
| Production + CI | `getPrimaryProductMedia` / `isAuthenticProductMedia` in `src/lib/product/media.ts` |
| Registries | `RUNNING_PRODUCT_MEDIA` → `CATALOG_PRODUCT_MEDIA` via `getRunningProductHeroMedia` |
| Media-gated drafts | `applyMediaPublishGate` keeps SKUs `draft` until a licensed hero is registered |

Audit and PDP/cards/search share the same identity path.

---

## 3. Catalog checked

`media:ci` = `--mode=audit --identity --fail` on **all published** products.

| Metric | Result |
|---|---:|
| Published products | **631** |
| Authentic primary | **631 (100%)** |
| P0 gaps (current, no hero) | **0** |
| Broken files | **0** |
| Identity mismatches | **0** |
| Ingest ERROR masters (>5MB, excl. qa) | **0** |
| **Exit** | **0** |

Drafts / media-gated SKUs (e.g. Kiprun Trail 10 until hero registry) stay `status: "draft"` and are **outside** the published audit set — they do not create false production failures.

---

## 4. Assets cleaned

| Action | Path |
|---|---|
| **Deleted** wrong-brand backups | `public/images/running/products/*.WRONG-*.bak` including `glycerin-22-hero.WRONG-caldera.png.bak`, `triumph-22-hero.WRONG-triumph24.jpg.bak`, `cumulus-27-hero.WRONG-gt4000.jpg.bak`, `adrenaline-gts-25-hero.WRONG-glycerin.png.bak` |
| **Relocated** QA screenshots | `public/images/running/qa/` → `data/qa/running/screenshots/` (+ `data/qa/running/README.md`) |

No build/audit dependency referenced the `.bak` files. QA evidence preserved off the public tree; `listPublicMastersOverError` already skipped `/qa/` dirs.

---

## 5. Tests added

`tests/catalog-media-audit.test.ts`:

| Case | Expected |
|---|---|
| Canonical resolver on Novablast 6 | authentic primary; `classifyGap` null |
| Missing primary | `no-primary` |
| Placeholder `/fallbacks/` / kitletics-owned | `placeholder-only` |
| Broken on-disk path | `broken-file` |
| Illustration / non-photo association | `placeholder-only` |
| Shared-byte heroes (two products) | `shared-hero` via `scanHeroIdentities` |
| Media-gated drafts | remain unpublished; not in production published set |

---

## 6. Verification

| Command | Result |
|---|---|
| `npm run media:ci` | **exit 0** · 631/631 · 0 P0 · 0 identity · 0 broken |
| `npm run lint` | **0 errors** (3 pre-existing warnings in `scripts/tmp/`) |
| `npx tsc --noEmit` | **exit 0** |
| `npm test` | **625 passed** (61 files) |
| `npm run build` | **exit 0** |

---

## 7. Files touched

- `scripts/lib/catalog-media-audit.ts` — restore canonical imports; export `classifyGap`
- `tests/catalog-media-audit.test.ts` **(new)**
- `data/qa/running/README.md` **(new)**
- `data/qa/running/screenshots/` *(moved from `public/images/running/qa/`)*
- deleted `public/images/running/products/*.WRONG-*.bak`
