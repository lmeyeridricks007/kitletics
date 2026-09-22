# Kitletics final runtime cost remediation

**Date:** 2026-09-21  
**Status:** implemented and verified locally. **No push. No deploy.**  
**Starting audit (after Alternatives ISR):** FAIL 22 · WARN 1 · INFO 1  
**Ending audit:** FAIL 0 · WARN 0 · INFO 1  

Do not modify (already complete, used as reference only):

- `/products/[slug]`
- `/products/[slug]/alternatives`
- `/api/products/[slug]/commerce/[region]`
- `/go/[offerId]`

Reviews ISR was already landed in this workstream and is included in the verification scorecard, not re-architected here.

---

## 1. Executive summary

Public indexable catalog/editorial HTML is now **on-demand ISR** (`revalidate = 86400`, empty `generateStaticParams` for large estates, `dynamicParams = true`). Canonical RSC renders **DEFAULT_REGION / NL** and does not read cookies, `getRequestRegion()`, `headers()`, `draftMode()`, `connection()`, `unstable_noStore`, `cache: "no-store"`, or `revalidate = 0`.

Regional prices, currency, retailers, availability, and offers hydrate from **narrow cacheable APIs** plus client islands. Facets, sort, pagination, finder share state, calculator inputs, and search `q` are **client URL state** and do not create Incremental Cache keys per query.

Production `next build` now generates **342** static shells. It no longer enumerates products (~918), alternatives (~918), reviews (~565), best guides (97), brands, or the sport/category/listing taxonomy.

`npm run audit:vercel-cost` is **FAIL 0**. The remaining INFO is Web Analytics, which stays enabled in production.

---

## 2. Files changed

Architecture files in this remaining pass (plus the already-complete PDP / alternatives / reviews surfaces):

**App routes**

- `src/app/best/[slug]/page.tsx`
- `src/app/brands/[slug]/page.tsx`
- `src/app/[sport]/[segment]/page.tsx`
- `src/app/[sport]/[segment]/[listing]/page.tsx`
- `src/app/gear/page.tsx`
- `src/app/search/page.tsx`
- `src/app/tools/[slug]/page.tsx`
- `src/app/tools/finder/[slug]/page.tsx`
- `src/app/tools/[slug]/render-finder.tsx`
- `src/app/tools/[slug]/results/page.tsx` (documented exception only)
- `src/app/tools/page.tsx`
- `src/app/robots.ts`
- `src/app/layout.tsx`
- `src/middleware.ts`
- `next.config.ts`

**Commerce APIs**

- `src/app/api/best/[slug]/commerce/[region]/route.ts`
- `src/app/api/brands/[slug]/commerce/[region]/route.ts`
- `src/app/api/catalog/[sport]/[segment]/commerce/[region]/route.ts`
- `src/app/api/catalog/[sport]/[segment]/[listing]/commerce/[region]/route.ts`
- `src/app/api/gear/commerce/[region]/route.ts`
- `src/app/api/search/route.ts`

**Shared commerce / catalog**

- `src/lib/commerce/catalog-price-dto.ts` (client-safe parse/types)
- `src/lib/commerce/catalog-price-map.ts` (server builders)
- `src/lib/commerce/catalog-commerce-http.ts`
- `src/lib/commerce/get-scoped-catalog-prices.ts`
- `src/components/commerce/CatalogPriceIsland.tsx`
- `src/lib/catalog/client-filter.ts`
- `src/lib/catalog/query.ts` (`filterTokens`, public spec keys/values)
- `src/lib/specs/public-payload.ts`
- `src/components/catalog/CatalogInteractive.tsx`
- `src/components/catalog/CatalogProductCard.tsx`
- `src/components/best/*` (From-price overlay)
- `src/components/brand-hub/BrandHubPage.tsx`
- `src/components/gear-hub/GearHubBody.tsx`
- `src/components/gear-hub/GearHubSidebar.tsx`
- `src/components/finder/FinderFlow.tsx`
- `src/components/search/SearchResultsClient.tsx`
- `src/components/use-case-listing/ProductUseCaseListingPage.tsx`

**Audit / tests**

- `scripts/audit-vercel-cost.ts` (`/tools/[slug]/results` intentional dynamic)
- `tests/runtime-isr-remediation.test.ts`

---

## 3. Routes changed

| Route | Architecture |
|---|---|
| `/reviews/[slug]` | A — ISR NL + reuse PDP commerce API (already complete) |
| `/best/[slug]` | A — ISR NL + `GET /api/best/[slug]/commerce/[region]` |
| `/brands/[slug]` | A — ISR NL + `GET /api/brands/[slug]/commerce/[region]` |
| `/[sport]/[segment]` | D + A — ISR NL shell, client facets, category price map |
| `/[sport]/[segment]/[listing]` | D + A — same overlay, listing commerce API |
| `/gear` | D + A — ISR NL hub, client filters, gear price map |
| `/tools/[slug]` | B + D — ISR calculator landing; inputs client-side |
| `/tools/finder/[slug]` (`/tools/<finder>` rewrite) | B + D — ISR NL landing; `s`/`edit`/budget client-side |
| `/search` | E — ISR empty shell + `/api/search`; never ISR `q` |
| `/tools/[slug]/results` | E — remains `force-dynamic` + region (documented) |
| `/go/[offerId]` | F — unchanged request-time 302 |
| Image Edge matcher | E — `/images` removed from middleware |
| `next.config` remotePatterns | E — explicit hosts, no `**` |
| Speed Insights | sampleRate 0.1 |
| `robots.ts` | Disallow `/search` added |

---

## 4. Before / after rendering architecture

```text
BEFORE (FAIL 22)
Googlebot → force-dynamic RSC
          → cookies() / getRequestRegion()
          → generateStaticParams enumerates catalog
          → regional offers inside HTML + JSON-LD
          → Fluid CPU per request

AFTER
Googlebot → on-demand ISR HTML (NL, revalidate 86400)
          → no cookies in canonical RSC
          → empty generateStaticParams for large estates
          → JSON-LD stays canonical NL
User (UK/US) → same HTML
          → CatalogPriceIsland / ProductCommerceIsland
          → GET /api/.../commerce/{region}  (s-maxage=3600)
          → client overlay of prices / CTAs
```

NL visitors reuse the ISR payload’s initial commerce map and **do not** fetch the regional API.

---

## 5. ISR routes

All of the following are `revalidate = 86400`, no `force-dynamic`, no server cookies:

| Route | `generateStaticParams` | Notes |
|---|---|---|
| `/products/[slug]` | `[]` | already complete |
| `/products/[slug]/alternatives` | `[]` | already complete |
| `/reviews/[slug]` | `[]` | already complete |
| `/best/[slug]` | `[]` | |
| `/brands/[slug]` | `[]` | |
| `/[sport]/[segment]` | `[]` | |
| `/[sport]/[segment]/[listing]` | `[]` | |
| `/gear` | n/a (static) | filters are client state |
| `/search` | n/a (static shell) | `q` is client-only |
| `/tools` | n/a (static) | |
| `/tools/[slug]` | `[]` | calculators |
| `/tools/finder/[slug]` | 16 finder slugs | small finite SEO set |

Commerce APIs use `revalidate = 3600` + `Cache-Control: public, s-maxage=3600, stale-while-revalidate=82800` and empty `generateStaticParams`.

Local production HTML for PDP / alternatives / review / best / brand / category / listing / gear / calculator / finder / search returned:

```text
x-nextjs-prerender: 1
Cache-Control: s-maxage=86400, stale-while-revalidate=31449600
```

Second PDP request: `x-nextjs-cache: HIT`.

---

## 6. Intentional dynamic routes

| Route | Why | Audit |
|---|---|---|
| `/go/[offerId]` | Affiliate 302 must not be cached; `no-store`; robots Disallow `/go/` | exempt (`/app/go/`) |
| `/tools/[slug]/results` | noindex share-state `s` + regional match ranking | `isIntentionalDynamicPublic` |
| `/api/search` | unbounded `q`; HTTP CDN cache only; not Next ISR | API files are not public HTML |
| `/admin/*` | authenticated | excluded |
| `/preview/*` | draft | excluded |
| `/indexnow-key.txt` | key file | excluded |
| Invalid commerce region | 400 + `no-store` | correct |

Public indexable catalog/editorial HTML is **not** exempted.

---

## 7. Regional commerce architecture

Compact DTO (`CatalogPriceMapResponse`):

```ts
{
  region, regionLabel, currency,
  products: {
    [slug]: { lowestPrice, offerCount, bestOfferId?, bestGoUrl? }
  }
}
```

| Surface | Endpoint | Builder |
|---|---|---|
| PDP / review (one SKU) | `/api/products/[slug]/commerce/[region]` | existing `getProductCommerce` |
| Best guide | `/api/best/[slug]/commerce/[region]` | recommendation product ids only — **does not** call `getBestGuidePageData` |
| Brand hub | `/api/brands/[slug]/commerce/[region]` | brand product ids — **does not** rebuild `BrandHubPage` |
| Category | `/api/catalog/[sport]/[segment]/commerce/[region]` | category slice |
| Listing | `/api/catalog/.../[listing]/commerce/[region]` | same universe as category |
| Gear hub | `/api/gear/commerce/[region]` | shop-card categories + configured pick guides — **does not** call `getGearHubData` |

Client: `CatalogPriceIsland` (lists) / `ProductCommerceIsland` (PDP/review). NL uses `initialMap` and skips fetch (`shouldFetchRegionalCommerce`).

Smoke (production `next start`):

| Call | Result |
|---|---|
| PDP commerce NL | 200, EUR, 4 offers |
| PDP commerce UK | 200, GBP, lowestPrice set |
| PDP commerce US | 200, USD 150 |
| PDP commerce ZA | 200, `lowestPrice: null`, 0 offers |
| Invalid region XX | 400 `no-store` |
| Best UK | 9 products, GBP |
| Brand NL | 19 products |
| Category US `/running/shoes` | 85 products, USD |
| Gear ZA | 725 product rows (one request, not N PDP calls) |

JSON-LD Offers remain canonical NL. They are **not** rewritten client-side.

---

## 8. Client filtering architecture

Canonical category / listing / gear HTML is the **unfiltered recommended order**.

`CatalogInteractive` reads `useSearchParams` and filters with `filterTokens` + the regional price overlay:

- brand / type / use-case / spec chips
- `maxPrice` / price-asc / price-desc use **regional** amounts when the island has a map
- default sort remains editorial/recommended
- pagination is client-side (`CATALOG_PAGE_SIZE = 24`)

Non-empty catalog query strings get `X-Robots-Tag: noindex, follow` from middleware without dynamizing RSC. Clean URLs stay indexable.

`/running/shoes?usecase=marathon` still 307s to `/running/shoes/race?distance=marathon`. Facet HTML (`?brand=asics`) is noindex + same ISR shell.

`filterTokens` stores **public** spec keys and public-safe enum values so Padel schema-zero payloads do not serialize `genderFit` / `cushionLevel` / `customization_weight` / `frame_tape`. Client matching accepts both URL enum tokens and public row keys.

---

## 9. Search architecture

```text
GET /search            → ISR empty shell (noindex,follow; robots Disallow /search)
GET /search?q=novablast → SAME HTML shell (middleware noindex)
                        → client fetch /api/search?q=novablast&region=UK
GET /api/search         → force-dynamic, HTTP CDN cache, no Next ISR of q
                        → min length 2, max 80
                        → q="" (too short): s-maxage=60
                        → q set: s-maxage=120
```

`/search?q=novablast` and `/search` produced **identical 76 500-byte shells** locally. Query execution is not stored as Incremental Cache keys.

Region is passed from the client (`RegionPreferenceProvider`), not from RSC cookies.

---

## 10. Image changes

**Wildcard removed.** `hostname: "**"` is gone.

Inventory method (not guessed):

1. Catalog `product.images[].src` — local `/images/...` (Blob rewrite in `next.config`).
2. TS/TSX `src: "https://..."` used by `next/image` — onboarding fixtures at `www.asics.com`.
3. Gallery / catalog `sourceUrl` provenance — CDN hosts that appear in production content files.
4. Blob delivery — `*.public.blob.vercel-storage.com` and `*.blob.vercel-storage.com`.

Allowlist kept: Blob wildcards plus `www.asics.com`, `images.asics.com`, `cdn.shopify.com`, `images.ctfassets.net`, `img.runningwarehouse.com`, `res.garmin.com`, `cdn.runrepeat.com`, `cdn11.bigcommerce.com`, `staticcn.coros.com`, `nb.scene7.com`, `images.samsung.com`, `media.eleiko.com`, `images.prismic.io`, `cdn.sportsshoes.com`, `static.nike.com`, `assets.tracksmith.com`, `media.babolat.com`, `contents.mediadecathlon.com`.

AVIF / WebP, quality allow-list (65 / 70 / 75), and `minimumCacheTTL` 30 days are unchanged. `next/image` is **not** disabled.

`deviceSizes` / `imageSizes` were inspected against `IMAGE_SIZES` presets. No aggressive width cuts.

Local `/images/running/category/use-daily.jpg` returned `200 image/jpeg`.

---

## 11. Middleware changes

Removed `/images/:path*` from the matcher. Image files are excluded by the static-extension matcher. Blob delivery stays on the `next.config` rewrite.

Preserved:

- www → apex 308
- IndexNow key rewrite
- `/admin` basic auth + noindex
- Finder rewrite `/tools/<finder>` → `/tools/finder/<slug>`
- `/running/shoes` entry redirects
- Facet/query `X-Robots-Tag: noindex, follow` for catalog, `/gear`, `/search`, `/tools/*`

---

## 12. robots changes

```text
User-Agent: *
Allow: /
Disallow: /go/
Disallow: /api/
Disallow: /admin/
Disallow: /preview/
Disallow: /search
```

Googlebot / Bingbot are not blocked. Product, review, best, brand, sport/category, and editorial URLs remain allowed. robots.txt is not used as a substitute for ISR.

---

## 13. Speed Insights changes

Installed package: `@vercel/speed-insights@2.0.0`.  
`SpeedInsightsProps` includes `sampleRate?: number`.

Root layout:

```tsx
<SpeedInsights sampleRate={0.1} />
```

Web Analytics (`<Analytics />`) remains enabled in production.

---

## 14. generateStaticParams reductions

| Family | Before (approx) | After |
|---|---|---|
| `/products/[slug]` | full catalog (~918) discarded by force-dynamic | `[]` |
| `/products/[slug]/alternatives` | ~918 | `[]` |
| `/reviews/[slug]` | all reviews (~565) | `[]` |
| `/best/[slug]` | ~97 | `[]` |
| `/brands/[slug]` | all renderable brands | `[]` |
| `/[sport]/[segment]` | full taxonomy | `[]` |
| `/[sport]/[segment]/[listing]` | 5 | `[]` |
| `/tools/[slug]` | unused region + force-dynamic | `[]` |
| Commerce APIs | n/a | `[]` |

**Still generated (small/finite, beneficial):**

| Family | Count at this build |
|---|---|
| `/[sport]` live hubs | 9 |
| `/tools/finder/[slug]` | 16 |
| `/gear/[slug]` category hubs | 45 |
| `/guides/[slug]` | 92 |
| `/compare/[slug]` | 108 |
| `/setups/[slug]` | 23 |
| `/padel/collections/[slug]` | 7 |
| `/research/[slug]` | 4 |
| `/authors/[slug]` | 1 |

Largest remaining build-time families are **compare (108)** and **guides (92)** — finite editorial sets, not the product catalog.

This production build generated **342** static pages.

---

## 15. Duplicate-work reductions

- Brand metadata and page share `cache()`d `getBrandBySlug` / `getBrandHubPageData(NL)` — hub is no longer rebuilt per request region.
- Best / review / category / listing pages `cache()` slug → page data.
- Commerce APIs never call `getBestGuidePageData`, `getBrandHubPageData`, `getGearHubData`, or `assembleCategoryPage`.
- Client `CatalogPriceIsland` imports `catalog-price-dto` only. Server builders stay in `catalog-price-map.ts` so webpack does not pull `node:fs` via launch/review into the client bundle (this failed the first production compile and was split).

---

## 16. Dynamic API sweep

Classification of remaining public occurrences after this pass:

| FILE | ROUTE | WHY PRESENT | INDEXABLE? | INTENTIONALLY DYNAMIC? | ACTION |
|---|---|---|---|---|---|
| `src/app/go/[offerId]/route.ts` | `/go/[offerId]` | affiliate 302 + analytics | no (robots) | yes (F) | keep |
| `src/app/tools/[slug]/results/page.tsx` | `/tools/[slug]/results` | share `s` + `getRequestRegion()` for priced matches | no | yes (E) | keep; documented |
| `src/app/api/search/route.ts` | `/api/search` | unbounded `q` | no | yes (E) | keep; HTTP cache |
| `src/app/best/page.tsx` | `/best` | `await searchParams` sport/domain filters | yes (index) | no | **DEFERRED** |
| `src/app/brands/page.tsx` | `/brands` | `await searchParams` q/sport/domain | yes | no | **DEFERRED** |
| `src/app/reviews/page.tsx` | `/reviews` | `await searchParams` filters | yes | no | **DEFERRED** |
| `src/app/guides/page.tsx` | `/guides` | `await searchParams` | yes | no | **DEFERRED** |
| `src/app/compare/page.tsx` | `/compare` | `await searchParams` | yes | no | **DEFERRED** |
| `src/app/setups/page.tsx` | `/setups` | `await searchParams` | yes | no | **DEFERRED** |
| `src/app/[sport]/page.tsx` | `/running` etc. | `await searchParams` gender on declarative hubs | yes | no | **DEFERRED** |
| `src/app/running/gear/page.tsx` | `/running/gear` | gender `searchParams` | yes | no | **DEFERRED** |
| `src/app/padel/rackets/database/page.tsx` | database | explorer query | mixed | explorer UX | **DEFERRED** |
| `src/app/running/shoes/database/page.tsx` | database | explorer query | mixed | explorer UX | **DEFERRED** |
| `src/app/admin/**` | admin | auth | no | yes (F) | keep |
| `src/app/preview/**` | preview | draft | no | yes (F) | keep |
| `src/lib/region/server.ts` | helper | `cookies()` for results only | n/a | n/a | not imported by canonical RSC |

No remaining `force-dynamic` / `cookies()` / `getRequestRegion()` on the FAIL HTML families from the remaining-runtime plan.

---

## 17. Production build route table

`next build` Next.js 15.5.24 — **342** static pages. Compiled successfully after the catalog-price DTO split.

Relevant lines:

```text
● /[sport]/[segment]                 (no children — on-demand ISR)
● /[sport]/[segment]/[listing]       (no children)
● /best/[slug]                       (no children; was ~97)
● /brands/[slug]                     (no children)
● /products/[slug]                   (no children)
● /products/[slug]/alternatives      (no children)
● /reviews/[slug]                    (no children)
● /tools/[slug]                      (no children)
○ /gear                              revalidate 1d
○ /search                            revalidate 1d
○ /tools                             revalidate 1d
● /tools/finder/[slug]               16 paths, revalidate 1d
ƒ /tools/[slug]/results              dynamic
ƒ /go/[offerId]                      dynamic
ƒ /api/search                        dynamic
● /api/*/commerce/[region]           on-demand, no children
ƒ /best  /brands  /reviews  /guides  /compare  /setups   (index searchParams — deferred)
```

---

## 18. Tests

| Suite | Result |
|---|---|
| `npx vitest run` (full) | **101 files, 1016 tests passed** (984.58s) |
| `tests/runtime-isr-remediation.test.ts` | 18 passed after DTO split |
| `tests/padel-schema-zero-remediation.test.ts` | 5 passed |
| `tests/catalog.test.ts` | passed |
| `npm run lint` | 0 errors (42 warnings, all `scripts/tmp`) |
| `npm run typecheck` | passed |
| `npm run build` | passed (342 pages) |
| `npm run audit:vercel-cost` | FAIL 0 · WARN 0 · INFO 1 |

ISR contract tests cover: empty `generateStaticParams`, no `force-dynamic` / cookies / `getRequestRegion` on converted pages, batched commerce JSON for NL/UK/US/ZA, editorial rank order, client price-sort overlay, robots Disallow `/search`, middleware `/images` removal, hostname allowlist, Speed Insights `sampleRate`, catalog island DTO import boundary.

---

## 19. Cost-audit result

```text
FAIL 0 · WARN 0 · INFO 1
```

INFO: `web-analytics-enabled` on `src/app/layout.tsx` — keep on production.

Exception in the detector: `src/app/tools/[slug]/results/` is intentional Architecture E. Reason: noindex share-state results are region-dependent and must not be ISR’d.

---

## 20. Known limitations

- Gear commerce map can be large (~725 SKUs). It is **one** cacheable request, not N PDP commerce calls. First fill is slower than a best-guide map.
- Discipline hubs under `/[sport]/[segment]` that render `ProductCard` still use canonical NL `getLowestOfferPrice` (not the island). Low traffic vs category grids.
- Search still scores up to 5000 hits inside the API for facet dominance. Correctness was not traded for a greener audit.
- `/search?q=*` HTML is the empty ISR shell; results depend on JS + `/api/search`.
- Image `sourceUrl` hosts such as `www.hydrapak.com` are provenance, not current `next/image` `src`. They are not in `remotePatterns`. If a remote `src` is later pointed there, add the host explicitly.
- First on-demand ISR miss still compiles the page (expected Incremental Cache fill).

---

## 21. Deferred improvements

| Item | Why deferred |
|---|---|
| `/best`, `/brands`, `/reviews`, `/guides`, `/compare`, `/setups` indexes | `await searchParams` dynamizes hubs; not in the FAIL-22 HTML families; client-filter those indexes next |
| `/[sport]` gender query | declarative hubs still `await searchParams` for gender; move to client |
| `/running/gear` | same gender pattern |
| Padel / running **database** explorers | query-driven tools; not the remaining FAIL list |
| Search hit cap below 5000 | keep correctness; optional later bound after measuring |
| Point `next/image` `src` at Blob public hostname | would drop Origin Transfer further; rewrite remains correct |
| Alternatives regional From-price overlay | Architecture B on purpose; NL prices in ISR HTML |
| Shrink `deviceSizes`/`imageSizes` further | would cut quality; not done |

---

## 22. Expected Vercel cost impact

Mechanism: public HTML that was Node-per-request now serves Incremental Cache (`s-maxage=86400`). Regional commerce is a small JSON API. Images no longer hit Edge middleware. Optimizer cannot transform arbitrary HTTPS URLs.

Residual Fluid: `/go`, search API, finder results, admin/preview, ISR misses, commerce API misses.

Confidence: **HIGH** on mechanism (local prerender headers + FAIL 0). **MEDIUM** on dollars until one production week is measured.

---

## FIXED / INTENTIONAL DYNAMIC / DEFERRED / BLOCKED

**FIXED**

- Reviews, best, brands, sport/category, listings, gear, calculator landings, finder landings, search shell
- Compact batched commerce APIs
- Client catalog filtering and regional price sort/`maxPrice`
- Image middleware matcher
- Image remote wildcard
- Speed Insights sampling
- robots Disallow `/search`
- Empty `generateStaticParams` for large catalog estates
- Cost-audit exception for finder results

**INTENTIONAL DYNAMIC**

- `/go/[offerId]`
- `/tools/[slug]/results`
- `/api/search` (query execution)
- `/admin/*`, `/preview/*`

**DEFERRED**

- Index hubs and sport-hub gender `searchParams` (section 21)
- Database explorers
- Search 5000-hit bound
- Blob public hostname as `next/image` src

**BLOCKED**

- None. Local validation passed. Deployment waits for an explicit **Deploy this now.**

---

# FINAL VERCEL REMEDIATION VERIFICATION

PDP ISR: PASS  
Alternatives ISR: PASS  
Reviews ISR: PASS  
Best ISR: PASS  
Brands ISR: PASS  
Sport/category ISR: PASS  
Listings ISR: PASS  
Gear ISR: PASS  
Calculator/finder landings: PASS  

Search controlled: PASS  
Search arbitrary-q ISR eliminated: PASS  

Image middleware removed: PASS  
Image wildcard removed: PASS  

Public canonical RSC cookies eliminated: PASS  
Public force-dynamic routes eliminated where inappropriate: PASS  

Large unnecessary generateStaticParams removed: PASS  

/go preserved dynamic: PASS  
Intentional dynamic routes documented: PASS  

NL commerce: PASS  
UK commerce: PASS  
US commerce: PASS  

SEO: PASS  
Canonicals: PASS  
Metadata: PASS  
JSON-LD: PASS  
Robots: PASS  
Affiliate behavior: PASS  
Images: PASS  

Lint: PASS  
Types: PASS  
Tests: PASS  
Production build: PASS  

VERCEL COST AUDIT:  
FAIL: 0  
WARN: 0  
INFO: 1  

EXPECTED IMPACT:  

Build CPU: LOWER  
Fluid CPU: LOWER  
Fluid Memory: LOWER  
Origin Transfer: LOWER  
Image Transformations: LOWER  
Edge Requests: LOWER  
ISR Reads: HIGHER  

ISR Reads rise because formerly `force-dynamic` HTML is now Incremental Cache. That is the intended trade: cache reads instead of Fluid HTML. First-miss fills and commerce API reads are bounded (`86400` / `3600`).

SAFE FOR ONE CONTROLLED PRODUCTION DEPLOYMENT: YES  

Not pushed. Not deployed. Awaiting **Deploy this now.**
