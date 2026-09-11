# Fix 32 — Sitemap lastmod integrity

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Audit:** [`../data/rc-final/sitemap-lastmod.json`](../data/rc-final/sitemap-lastmod.json)

## Objective

Stop mass-identical sitemap `lastmod` values driven by global seed / verification stamps. Prefer **omit** over fabricated freshness.

---

## 1. Trace — what drove lastmod (before)

| Page type | Fields passed to `sitemapLastModified` | Effective date |
|---|---|---|
| Home / static hubs | `SEED_DATES.updated` / `.published` | Global seed |
| Authors | `SEED_DATES.updated` / `.published` | Global seed |
| Use-case listings | sport timestamps **+ `SEED_DATES.updated`** | Global seed |
| Product / alternatives | `updatedAt`, `publishedAt`, **`lastVerifiedAt`** | Mostly **verified** (commerce refresh) |
| Review / Best / Guide / Comparison / Setup / Tool | same trio | Mostly **verified** |
| Brand / sport / category / discipline | same trio | Mostly **verified** |

Helper took **max** of candidates. After Fix 23 + pricing/offer refresh, `lastVerifiedAt ≈ SEED_DATES.verified` won for nearly everything.

### RC snapshot

| Metric | Value |
|---|---|
| Unique lastmod days | **3** |
| Share on **2026-09-04** | **643 / 664** |
| Future lastmod | 0 |

Root cause: **mass-seeded timestamps** (`publishedMeta()` + verification bumps), not genuine per-URL editorial updates. **0** catalog entities currently have a non-seed `updatedAt` / `publishedAt` / `lastVerifiedAt`.

---

## 2. Real lastmod rules (implemented)

| Type | Rule |
|---|---|
| Product / alternatives | `updatedAt`, `publishedAt` only — if genuine (not global seed) |
| Review | editorial `updatedAt` / `publishedAt` (no `reviewedAt` in model) |
| Best / Guide / Comparison / Setup / Tool | editorial `updatedAt` / `publishedAt` |
| Brand / sport / category / discipline | persisted `updatedAt` / `publishedAt` only if non-seed |
| Use-case listing | **omit** (config has no editorial stamp; do not inherit sport seed) |
| Home / static / authors | **omit** (no tracked per-page content date) |

### Explicitly excluded

- Build / deploy / `today()`
- `SEED_DATES.*` (created, updated, published, verified, scheduledFuture)
- `lastVerifiedAt` (offer / verification freshness ≠ page content change)
- Far-future timestamps

### If unknown

**Omit `lastModified`** from the sitemap entry. Do not emit epoch, seed, or “today”.

---

## 3. Code changes

| File | Change |
|---|---|
| `src/lib/seo/sitemap-lastmod.ts` | Filter global seeds; return `undefined` when unreliable; `withSitemapLastModified` helper |
| `src/app/sitemap.ts` | Content fields only; no `SEED_DATES` / `lastVerifiedAt`; omit when unknown |
| `tests/sitemap-lastmod.test.ts` | Seed rejection, omit behavior, no seed-cluster regression |

---

## 4. Audit (after)

Generator production eligibility sitemap:

| Metric | Before (RC) | After |
|---|---:|---:|
| Sitemap URLs | 664 | **660** (post Fix 29) |
| With real lastmod | ~664 (seed/verified) | **0** |
| Without reliable date (omitted) | 0 | **660** |
| Unique lastmod days | 3 | **0** |
| Seed-date cluster | 643× 2026-09-04 | **0** |
| Future lastmod | 0 | **0** |

### By prefix (all omit lastmod today)

products 251 · alternatives 74 · reviews / best / compare / guides / brands / running listings / static — all `withLastmod: 0`.

This is **intentional honesty**: inventing diversity from seed stamps would fake freshness. When editors set real per-entity `updatedAt` / `publishedAt`, lastmod will appear automatically.

---

## 5. Suspicious clusters / follow-up

| Signal | Status |
|---|---|
| Mass-identical verified day | **Removed** from lastmod path |
| Catalog still 100% `publishedMeta()` seeds | Known — content ops should set real dates on material edits |
| `SEED_DATES.verified` still bumps for commerce UI | OK for prices; **not** wired to sitemap |

---

## 6. Tests

```bash
npx vitest run tests/sitemap-lastmod.test.ts
# 10 passed
```

---

## 7. Definition of done

- [x] lastmod sources traced per page type  
- [x] Rules use only meaningful persisted content timestamps  
- [x] No build/deploy/today/global seed/audit date as lastmod  
- [x] Omit when unknown  
- [x] Audit: real vs omitted, distribution, future, clusters  
