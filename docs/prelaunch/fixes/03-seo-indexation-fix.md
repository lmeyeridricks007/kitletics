# Fix 03 — SEO & Indexation Hygiene

**Mode:** Remediation (no new editorial content)  
**Date:** 2026-09-06  
**Evidence basis:** `docs/prelaunch/04-seo-indexation.md`, `05-architecture-internal-links.md`, `00-PRE-LAUNCH-MASTER.md`

---

## 1. Failures before (audit)

| Metric | Before |
|---|---:|
| Sitemap URLs | **1,651** |
| Brand URLs in sitemap | **191** |
| Indexable brands (link graph) | **~101** |
| Brand sitemap → 404 risk | **~90** thin brands |
| Sort-only indexable residual | `/running/shoes?sort=price-asc` **INDEXABLE** |
| Missing canonicals (sample) | **15** (home, trust pages, setups, hyrox shells) |
| Indexable orphans | **26** (mostly `/hyrox/*`, `/racket/*`, `/fitness/*` shells) |
| Unique sitemap lastmod values | **1** (shared seed timestamps) |
| Coming-soon sports | Soft **200 + noindex** shells |
| Production build SEO workarounds | N/A for this fix (CI cleaned in Fix 02) |

---

## 2. Root causes

1. **Sort excluded from `hasFilters`** — category/listing metadata treated only non-`sort` params as noindex triggers.
2. **Sitemap listed all `getBrands()`** while Brand Hub gated on `canPublishBrandHub` → sitemap/static params → **404**.
3. **Sitemap emitted every live-sport × category shell** even when `getCategoryHref` canonicalized elsewhere (`/hyrox/shoes` vs `/running/shoes`).
4. **Racket parent disciplines** (`/racket/padel`) duplicated live child hubs (`/padel`).
5. **Missing `alternates.canonical`** on home, trust pages, setups index, some discipline metadata.
6. **Coming-soon sports** rendered soft 200 shells instead of production 404.
7. **`/tools?type=finder`** shared indexable title/canonical with `/tools` without robots noindex.
8. **`/hyrox/:path*`** next.config blanket redirect collapsed category shells into the hub (removed; app-level canonical redirects now handle shells).

---

## 3. Fixes applied

### Filter / sort / facet explosion
- New `src/lib/seo/query-state.ts` — **any** non-empty query (incl. `sort`, `page`, facets) → `noindex, follow` + clean canonical.
- Wired into category, use-case listing, tools, brands, reviews, best, setups.

### Brand sitemap / publication
- New `src/lib/seo/brand-indexability.ts` — same gate as live Brand Hub.
- Sitemap + `generateStaticParams` + brands hub listing only emit indexable brands (~103).

### Canonical shells / orphans
- New `src/lib/seo/category-canonical.ts` — non-canonical sport shells redirect via `getCategoryHref`; racket child disciplines → child sport hubs; HYROX exception keeps `/fitness/hyrox` canonical.
- Empty category “coming soon” shells → **404**.
- Sitemap only emits canonical category paths; skips `/hyrox` alias sport; skips `/tools/compare-products` (alias of `/compare`).

### Coming-soon sports
- Non-live sport hubs → **`notFound()`** (genuine 404); static params only live sports (excluding `/hyrox` alias).

### Meta / canonicals
- Home, trust pages (`trustMetadata(path)`), setups index/detail, discipline segments — production absolute canonicals (`https://kitletics.com…`).
- No localhost.

### lastmod
- Still uses entity `updatedAt` / `SEED_DATES.updated` where that is the real seed timestamp.
- **Did not fabricate** newer dates; identical seed timestamps remain a content-seed property, not a sitemap bug.

### Structured data
- No AggregateRating fabrication found; no deterministic schema builder errors required code changes beyond indexation gates.

### Tests
- `tests/seo-indexation.test.ts` — sort/query policy, brand sitemap subset, orphan shell exclusions.

---

## 4. Before / after

| Metric | Before | After |
|---|---:|---:|
| Sitemap URLs | 1,651 | **1,528** |
| Brand sitemap URLs | 191 | **103** |
| Broken brand sitemap URLs (gate mismatch) | ~90 | **0** |
| `/hyrox/shoes` etc. in sitemap | yes | **no** |
| `/racket/padel` etc. in sitemap | yes | **no** |
| `/tools/compare-products` in sitemap | yes | **no** |
| Coming-soon in sitemap | no | no |
| Coming-soon HTTP | 200 noindex | **404** |
| Sort-only indexable | yes | **no** (`noindex,follow`) |
| Home / trust / setups canonical | missing | **present** |
| `/fitness/hyrox` in sitemap | missing/unstable | **yes** (canonical hub) |
| `/hyrox` in sitemap | yes (alias) | **no** (301 → `/fitness/hyrox`) |

---

## 5. Files changed (primary)

| Path | Change |
|---|---|
| `src/lib/seo/query-state.ts` | Query noindex policy |
| `src/lib/seo/brand-indexability.ts` | Brand hub gate for sitemap |
| `src/lib/seo/category-canonical.ts` | Canonical shell + child redirects |
| `src/app/sitemap.ts` | Rebuild eligibility |
| `src/app/[sport]/[segment]/page.tsx` | Sort/filters, redirects, 404 empty |
| `src/app/[sport]/[segment]/[listing]/page.tsx` | Sort/filters noindex |
| `src/app/[sport]/page.tsx` | Coming-soon 404; canonical nav links |
| `src/app/brands/[slug]/page.tsx` | Static params + metadata gate |
| `src/lib/brands/get-brands-hub-data.ts` | List only indexable brands |
| `src/app/page.tsx` + trust pages + setups | Canonicals |
| `src/app/tools/page.tsx` / `brands/page.tsx` / `reviews/page.tsx` / `best/page.tsx` / `guides/page.tsx` | Query robots |
| `next.config.ts` | Remove blanket `/hyrox/:path*` → hub |
| `tests/seo-indexation.test.ts` | Regression coverage |

---

## 6. Acceptance checklist

- [x] No known indexable sort-only state
- [x] No broken Brand sitemap URL (gate aligned with live hub)
- [x] No localhost canonicals
- [x] No draft/future sport hub exposure (404 + sitemap exclude)
- [x] Search remains noindex; finder results remain noindex; tools type filter noindex
- [x] No new content generated

---

## 7. Residual notes (not invented away)

- Some seed entities still share identical `updatedAt` → few unique lastmod values until real editorial updates land.
- Remaining weakly linked but **real** pages (e.g. `/running/shoes/heavy-runners`) stay in sitemap when they are intentional landings — orphans were not papered over with fake nav links.
- Product/review LAUNCH_READY quality gaps from audits 02/03 are content quality, not sitemap hygiene.
