# Kitletics deferred Vercel optimizations

**Date:** 2026-09-22  
**Status:** implemented and verified locally. **No push. No deploy.**  
**Starting audit (main rem):** FAIL 0 · WARN 0 · INFO 1  
**Ending audit:** FAIL 0 · WARN 0 · INFO 1  

Do not modify (already complete, used as reference only):

- `/products/[slug]`
- `/products/[slug]/alternatives`
- `/api/products/[slug]/commerce/[region]`
- `/go/[offerId]`
- Reviews / best / brands / category / listing ISR shells from the prior rem

This pass only converts remaining **index hubs**, **sport-hub gender**, and **running gear gender** off RSC `searchParams`, then analyzes explorers, search, Blob `src`, and `generateStaticParams` without regressing FAIL 0.

---

## 1. Executive summary

Canonical index URLs (`/best`, `/brands`, `/reviews`, `/guides`, `/compare`, `/setups`) and `/running/gear` are **ISR** (`revalidate = 86400`). Sport hubs (`/running`, `/padel`, …) stay **SSG** via the existing small `generateStaticParams` list and no longer read `searchParams`.

Filter/search query strings remain bookmarkable. They are read with `useSearchParams` inside `Suspense` and **do not** create Incremental Cache keys. Query HTML on those indexes is `noindex, follow` via middleware `X-Robots-Tag` (not RSC). Canonical metadata always points at the clean path.

Client payloads are compact DTOs (tens to low hundreds of KB), not full editorial bodies. Compare already shipped a lightweight 918-row picker index (~488 KB); that is unchanged in shape and is not full Product models.

Search still uses a 5000-hit **ceiling**. The in-memory catalog is 918 products; scoring walks lightweight `SearchHit` records. Facets use a `Map` cache of `getProductById`. Displayed cards hydrate only the preview slice.

Direct Blob `next/image` `src` is implemented behind `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL`. Content still stores `/images/...`. The next.config rewrite remains for legacy URLs.

---

## 2. Classification of each deferred item

| Item | Decision |
| --- | --- |
| `/best` index | **IMPLEMENTED** |
| `/brands` index | **IMPLEMENTED** |
| `/reviews` index | **IMPLEMENTED** |
| `/guides` index | **IMPLEMENTED** |
| `/compare` index | **IMPLEMENTED** |
| `/setups` index | **IMPLEMENTED** |
| Sport hub gender (`/running?gender=`) | **IMPLEMENTED** |
| `/running/gear` gender | **IMPLEMENTED** |
| Padel racket database | **IMPLEMENTED** (metadata dynamization removed; explorer already ISR + client) |
| Running shoe database | **IMPLEMENTED** (same) |
| Search 5000-hit scan | **KEPT AS-IS WITH JUSTIFICATION** + lookup cache |
| Direct Blob `src` | **IMPLEMENTED** (env-gated; rewrite kept) |
| `generateStaticParams` compare/guides/gear/setups | **KEPT AS-IS WITH JUSTIFICATION** |
| Empty GSP on-demand ISR (PDP, reviews, best, brands, listings) | **KEPT AS-IS WITH JUSTIFICATION** |

---

## 3. Part 1 — Index hubs

### Before

RSC `await searchParams` for sport/domain/q/type filters. Next 15 treats that as request-time dynamic HTML. Query landings could become separate cache variants.

### After

```text
CANONICAL PAGE  →  ISR shell (revalidate = 86400)
                →  compact DTO from get-*-index-shell
                →  indexable, canonical = clean path
QUERY STATE     →  client useSearchParams (Suspense)
                →  filter already-supplied rows
                →  no server RSC dynamization
```

| Route | Before | After |
| --- | --- | --- |
| `/best` | dynamic (`searchParams`) | ISR 86400 |
| `/brands` | dynamic | ISR 86400 |
| `/reviews` | dynamic | ISR 86400 |
| `/guides` | dynamic | ISR 86400 |
| `/compare` | dynamic | ISR 86400 |
| `/setups` | dynamic | ISR 86400 |

`/best?sport=running`, `/brands?q=asics`, `/reviews?sport=running`, `/guides?sport=running` still filter in the browser. Shared URLs keep working.

**SEO preserved**

- `title` / `description` / `alternates.canonical` are the clean path.
- Index hub query URLs send `X-Robots-Tag: noindex, follow` from middleware (`pathname === "/best" | "/brands" | "/reviews" | "/guides" | "/compare" | "/setups"` when `searchParams.size > 0`).
- Structured data on the shell is unchanged (hub JSON-LD where it already existed).
- Previously unique-canonical query landings now share the ISR HTML with the clean URL and canonicalise to it. That is intentional: query is UX state, not a second indexable document.

---

## 4. Part 2 — Sport hub gender

`src/app/[sport]/page.tsx` no longer accepts or awaits `searchParams`. Gender is not in `generateMetadata`. Canonical remains `/{sport}`.

`RunningFitLinks` is a client component using `useSearchParams`, wrapped in `Suspense` on `SportHubPage`. `/running?gender=women` hydrates Men's/Women's/All from the query after the same SSG/ISR shell.

Gender does not alter canonical URL, metadata, or ISR keys.

---

## 5. Part 3 — Running gear gender

`/running/gear` is ISR 86400. The server always calls `getRunningGearHubData()` without gender (All Gear shell). `RunningGearHubClient` reads `?gender=` and rewrites filterable category hrefs via `withRunningGender`.

`/running/gear?gender=women` is noindex via the existing 2-segment query rule in middleware. Canonical metadata stays `/running/gear`.

Payload: **3.6 KB** (category groups + CTAs, not product cards).

---

## 6. Part 4 — Database explorers

### Evidence

| Question | Padel `/padel/rackets/database` | Running `/running/shoes/database` |
| --- | --- | --- |
| Base URL indexable? | Canonical path; padel vertical hold may `noindex` the vertical | Yes (canonical `/running/shoes/database`) |
| Query combinations indexable? | No — middleware noindexes 2+ segment paths with query | Same |
| Dataset size | **59** compact records | **85** compact records |
| JSON if sent to browser | **88.1 KB** (full page data) | **182.4 KB** |
| Client filters | Shape, balance, weight, play style, sort, `q` — already client explorer | Use case, specs, sort, `q` — already client |
| Server computation required for filters? | No — records are pre-derived | No |
| Region? | Baked `DEFAULT_REGION` (NL), same as other ISR catalog | Same |
| Prices? | Optional compact `{ amount, currency }` on the record (NL ISR) | Same |
| Arbitrary ISR query keys? | No — page does not read `searchParams` | No |

### What changed

Only `generateMetadata` stopped awaiting `searchParams`. Both routes already had `revalidate = 3600` and a client explorer over compact records.

### What was not done

No new results API. 59–85 compact rows are smaller than shipping a second HTTP round-trip. Splitting them would be architecture churn without Fluid-CPU savings (the page was already ISR).

**Decision:** OPTIMIZED (remove metadata dynamization). Not “force into a different ISR model.”

---

## 7. Part 5 — Search 5000-hit scan

### Measurements

| Metric | Value |
| --- | --- |
| Catalog products | **918** |
| `searchKitletics("shoes", { limit: 5000 })` hits | **165** (59.7 KB `SearchHit`s) |
| `/api/search` page `q=shoes` | **155** grouped total, **13.2 KB** JSON |
| `q=novablast` | **22** total, **5.2 KB** |

### How it actually works

```text
query
  → in-memory index (products, brands, editorial, tools)
  → score SearchHit (id, title, subtitle, href, score, …)
  → slice(0, limit)   // 5000 is a ceiling, not a forced scan size
  → facet Product lookups via productOf Map (getProductById, cached)
  → hydrate media/prices only for displayed preview cards
     (8 products in overview, 100 when type=products)
```

Scoring never materializes 5000 hydrated Product graphs. The catalog is smaller than 5000, so the ceiling is not reached. Facet correctness still sees every matching product hit’s lightweight Product record (in-memory), which is required for brand/category/feature/price facets.

Prices are resolved only where facet/filter logic needs them (`buildPriceFacetState` / `productMatchesPrice` on cached Product entities), not as a second full-catalog enrichment pass for unused hits.

**Decision:** keep `limit: 5000`. Implemented a `Map` cache around `getProductById` so facet + filter + card mapping do not repeat catalog lookups. Do not lower the ceiling.

---

## 8. Part 6 — Direct Blob image delivery

### Findings

1. `/images/...` is generated from content + `getPrimaryProductMedia`.
2. Blob public origin is deterministic: `{MEDIA_BLOB_BASE_URL}/images/{path}` (same key the rewrite already uses).
3. Content records keep relative `/images/...` — **not** mass-rewritten.
4. Indexed `/images/...` URLs continue to work via `next.config.ts` rewrite.
5. `resolveMediaUrl` is unused by OG/schema callers today; OG still uses site-relative or existing absolute URLs.
6. Structured data is unchanged.
7. Local `public/images` remains the fallback when `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL` is unset (dev).
8. Cache keys for `next/image` change only when the public env is set (src becomes the Blob URL). That is required to skip the app-origin rewrite hop.
9. Legacy `/images/...` must remain; rewrite kept.

### Implementation

`resolveProductImageSource` maps `/images/...` → `{NEXT_PUBLIC_MEDIA_BLOB_BASE_URL}/images/...` when that **public** env is set. It does **not** read server-only `MEDIA_BLOB_BASE_URL` (would SSR Blob URLs and hydrate `/images` URLs).

`getPrimaryProductMedia` applies the resolver after authenticity / padel identity checks, so catalog cards can point `next/image` at Blob. `remotePatterns` already allow `*.public.blob.vercel-storage.com`.

AVIF/WebP, quality presets, widths, TTL, alt, next/image optimizer: unchanged.

**Decision:** IMPLEMENTED, env-gated. Not a content migration.

---

## 9. Part 7 — `generateStaticParams` inventory

| Route | Count | Class | Why |
| --- | --- | --- | --- |
| `/compare/[slug]` | 108 | **KEEP** | Finite curated comparisons; cheap |
| `/guides/[slug]` | 92 | **KEEP** | Finite buying guides; cheap |
| `/gear/[slug]` | 45 | **KEEP** | Categories with products; cheap |
| `/setups/[slug]` | 23 | **KEEP** | Setups + aliases; cheap |
| `/[sport]` | 9 | **KEEP** | Live sports minus hyrox alias |
| `/tools/finder/[slug]` | 16 | **KEEP** | Finder landings |
| `/padel/collections/[slug]` | 7 | **KEEP** | |
| `/research/[slug]` | 4 | **KEEP** | |
| `/authors/[slug]` | 1 | **KEEP** | |
| `/products/[slug]` | `[]` | **EMPTY / ON-DEMAND ISR** | ~918 — prior rem |
| `/products/[slug]/alternatives` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/reviews/[slug]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/best/[slug]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/brands/[slug]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/[sport]/[segment]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/[sport]/[segment]/[listing]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| `/tools/[slug]` | `[]` | **EMPTY / ON-DEMAND ISR** | |
| Commerce APIs `*/commerce/[region]` | `[]` | **EMPTY / ON-DEMAND ISR** | Path region, 3600s |

No GSP list was emptied or expanded. Compare/guides/gear/setups are far smaller than the catalog estates that previously forced turbo. Build generation per page is in-memory content, not network.

**Build-page count:** **342/342** before and after this pass (same as the prior rem). Index hubs are `○` ISR (`revalidate` 1 day). Sport hubs are `●` SSG. No large enumeration added.

---

## 10. Part 8 — Public route sweep

Searched `src/app` for `await searchParams`, `cookies()`, `getRequestRegion()`, `headers()`, `draftMode()`, `connection()`, `force-dynamic`, `unstable_noStore`, `cache: "no-store"`, `revalidate = 0`.

### STATIC/ISR SAFE (after this pass)

Index hubs, sport hubs, `/running/gear`, database explorers, PDP/alternatives/reviews/best/brands/listings/gear/search-shell/calculators/finders from the prior rem. Layout explicitly does **not** call `cookies()`/`headers()`. No `unstable_noStore` / `revalidate = 0` / `cache: "no-store"` on public pages.

### INTENTIONAL DYNAMIC

| Route | Why |
| --- | --- |
| `/go/[offerId]` | Affiliate tag attach; `force-dynamic` |
| `/tools/[slug]/results` | Share-state + `getRequestRegion()`; noindex; Architecture E |
| `/api/search` | Unbounded `q`; HTTP CDN cache only; `force-dynamic` |
| `/admin/*` | Auth + tools |
| `/preview/*` | Draft/preview |
| `/indexnow-key.txt` | Key material |

### NEEDS FIX

None on public indexable HTML.

### NON-PUBLIC

Admin catalog/backlinks `searchParams`, admin `force-dynamic` CSV routes.

Public `await searchParams` remaining: **`/tools/[slug]/results` only**.

---

## 11. Part 9 — Client payload impact

Production `next build` First Load JS (shared 102 kB + route):

| Hub | Route JS | First Load JS | HTML body (local `next start`) |
| --- | ---: | ---: | ---: |
| `/best` | 1.59 kB | 117 kB | 116 KB |
| `/brands` | 6.59 kB | 112 kB | 106 KB |
| `/reviews` | 2.46 kB | 118 kB | 427 KB |
| `/guides` | 5.61 kB | 121 kB | 197 KB |
| `/compare` | 22.1 kB | 137 kB | 732 KB |
| `/setups` | 2.77 kB | 109 kB | 84 KB |
| `/running` | 6.12 kB | 129 kB | 420 KB |
| `/running/gear` | 5.69 kB | 111 kB | 77 KB |
| Padel DB | 10.4 kB | 126 kB | 263 KB |
| Shoes DB | 16.6 kB | 132 kB | 429 KB |

Query URLs returned the **same HTML SHA-256** as the clean URL (`x-nextjs-cache: HIT`). Filter UI hydrates from `useSearchParams`; it is not a second RSC document.

JSON sizes of the ISR/RSC data passed into client islands (compact DTOs):

| Hub | Records | JSON | Fields stripped |
| --- | --- | --- | --- |
| `/best` | 71 cards | **35.5 KB** (was ~3 MB full guides) | methodology, rec bodies |
| `/brands` | 93 | **24.4 KB** | long copy truncated 160 chars |
| `/reviews` | 386 | **310.0 KB** (was ~11 MB) | no `sections`, summary 220 chars |
| `/guides` | all + 6 sports + shoes | **108.4 KB** | no `guideMeta`, no full guide objects |
| `/setups` | 22 | **6.5 KB** | no kit product graphs |
| `/compare` | 918 index + featured | **542.1 KB** (index 488.3 KB) | no specs, offers, affiliate URLs, reviews |
| `/running/gear` | groups only | **3.6 KB** | |
| Padel DB | 59 | **88.1 KB** | compact records (pre-existing) |
| Shoes DB | 85 | **182.4 KB** | compact records (pre-existing) |

No thousands of complete Product objects. Compare index is the existing picker DTO (`id`, names, category, thumbnail, keywords) required for client-side product search on `/compare`.

**Large client payload regression: NO.**

---

## 12. Files in this pass (application)

**Routes**

- `src/app/best/page.tsx`
- `src/app/brands/page.tsx`
- `src/app/reviews/page.tsx`
- `src/app/guides/page.tsx`
- `src/app/compare/page.tsx`
- `src/app/setups/page.tsx`
- `src/app/running/gear/page.tsx`
- `src/app/[sport]/page.tsx`
- `src/app/padel/rackets/database/page.tsx`
- `src/app/running/shoes/database/page.tsx`
- `src/middleware.ts`

**Shells / clients**

- `src/lib/best/get-best-index-shell.ts`
- `src/lib/best/best-index-shared.ts`
- `src/lib/brands/get-brands-index-shell.ts`
- `src/lib/brands/brands-index-shared.ts`
- `src/lib/review/get-reviews-index-shell.ts`
- `src/lib/review/reviews-index-shared.ts`
- `src/lib/guides/get-guides-index-shell.ts`
- `src/lib/guides/guides-index-shared.ts`
- `src/lib/setups/get-setups-index-shell.ts`
- `src/lib/setups/setups-index-shared.ts`
- `src/lib/comparison/get-compare-index-shell.ts`
- `src/lib/comparison/compare-index-shared.ts`
- `src/components/best-hub/BestIndexClient.tsx`
- `src/components/brands-hub/BrandsHubClient.tsx`
- `src/components/reviews-hub/ReviewsIndexClient.tsx`
- `src/components/guides-hub/GuidesIndexClient.tsx`
- `src/components/setups-hub/SetupsIndexClient.tsx`
- `src/components/compare/CompareIndexClient.tsx`
- `src/components/running-gear/RunningGearHubClient.tsx`
- `src/components/cards/IndexHubCards.tsx`
- `src/components/sport-hub/RunningFitLinks.tsx`
- `src/components/sport-hub/SportHubPage.tsx`

**Search / media**

- `src/lib/search/get-search-page-data.ts` (`productOf` cache)
- `src/lib/media/resolve-media-url.ts`
- `src/lib/product/media.ts`

**Tests**

- `tests/deferred-optimizations.test.ts`
- `tests/deferred-optimizations.catalog.test.ts`

---

## 13. Vercel cost impact

| Line | Direction | Notes |
| --- | --- | --- |
| Build CPU | **NEUTRAL** | No new large GSP lists. Seven index shells prerender cheaply. |
| Fluid CPU | **LOWER** | Index + gender query HTML no longer Node-per-request. |
| Origin Transfer | **LOWER** when `NEXT_PUBLIC_MEDIA_BLOB_BASE_URL` is set (optimizer fetches Blob directly). Neutral locally without that env. Rewrite hop remains for legacy `/images`. |
| ISR | **NEUTRAL / slightly higher keys** | New ISR documents are the **clean** index URLs only, not per-query. |
| Images | **NEUTRAL** | next/image + allowlists unchanged. Blob `src` still goes through the optimizer. |
| Observability | **NEUTRAL** | Web Analytics still INFO 1. |

---

## 14. Local validation

```text
LOCAL VALIDATION:
Lint: PASS (0 errors; 42 pre-existing warnings in scripts/tmp)
Types: PASS
Tests: PASS (103 files, 1026 tests; deferred unit 8/8 after client-bundle split)
Production build: PASS (342/342 static pages — unchanged vs prior rem)

VERCEL COST IMPACT
Build CPU: NEUTRAL
Fluid CPU: LOWER
Origin Transfer: LOWER when NEXT_PUBLIC_MEDIA_BLOB_BASE_URL is set; NEUTRAL locally without it
ISR: NEUTRAL (clean-URL keys only; no per-query variants)
Images: NEUTRAL
Observability: NEUTRAL

DEPLOYMENT REQUIRED: YES (this is the remaining hub/gender pass before production)
SAFE TO DEPLOY: YES
```

Production smoke (`next start --port 3015`): every listed clean URL and its query variant returned **200**, **x-nextjs-cache: HIT**, identical body SHA, and the clean-path canonical. Index-hub and 2-segment query URLs sent `X-Robots-Tag: noindex, follow`. `/running?gender=women` is the same `/running` SSG document (canonical `/running`; not noindex).

Do not push until **Deploy this now.**

---

# DEFERRED OPTIMIZATION VERIFICATION

/best index: PASS  
/brands index: PASS  
/reviews index: PASS  
/guides index: PASS  
/compare index: PASS  
/setups index: PASS  

sport gender client-side: PASS  
running gear gender client-side: PASS  

padel database: OPTIMIZED  
running database: OPTIMIZED  

search CPU: VERIFIED ACCEPTABLE  
search correctness preserved: PASS  

direct Blob sources: IMPLEMENTED  
legacy `/images` URLs preserved: PASS  

large client payload regression: NO  
large build enumeration regression: NO  

Public accidental dynamic routes remaining:  
none  

Intentional dynamic routes:  
`/go/[offerId]`  
`/tools/[slug]/results`  
`/api/search`  
`/admin/*`  
`/preview/*`  
`/indexnow-key.txt`  

Lint: PASS  
Types: PASS  
Tests: PASS  
Production build: PASS  

VERCEL COST AUDIT:  
FAIL: 0  
WARN: 0  
INFO: 1  

SAFE FOR PRODUCTION DEPLOYMENT: YES
