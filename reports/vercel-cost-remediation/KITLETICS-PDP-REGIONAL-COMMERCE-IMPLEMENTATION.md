# Kitletics PDP regional commerce — Phase B implementation

**Date:** 2026-09-21  
**Status:** implemented locally. No push. No deploy.  
**Design:** `KITLETICS-PDP-REGIONAL-COMMERCE-DESIGN.md`  
**Primary SKU:** `/products/asics-novablast-6`

The canonical PDP remains on-demand ISR (`revalidate = 86400`, empty `generateStaticParams`, `DEFAULT_REGION` NL, no `cookies()`, no `force-dynamic`). Non-NL visitors hydrate a client island that fetches `GET /api/products/[slug]/commerce/[region]`. NL visitors use the ISR commerce DTO and make **no** API request.

---

## What shipped

| Area | Path |
|---|---|
| DTO | `src/lib/product/product-commerce.ts` |
| Commerce-only read | `src/lib/product/get-product-commerce.ts` |
| ISR → island mapper | `src/lib/product/product-commerce-from-page.ts` |
| Island helpers | `src/lib/product/commerce-island.ts` |
| API | `src/app/api/products/[slug]/commerce/[region]/route.ts` |
| Cookie helpers | `src/lib/region/cookie.ts` |
| Region context | `src/components/region/RegionPreferenceProvider.tsx` |
| Island | `src/components/product/ProductCommerceIsland.tsx` |
| Hero prices | `src/components/product/ProductHeroCommerce.tsx` |
| Offer panel | `src/components/product/CommerceOfferPanel.tsx` |
| Tests | `tests/pdp-regional-commerce.test.ts` |

`src/app/products/[slug]/page.tsx` is unchanged from Phase A (still ISR + `DEFAULT_REGION`).  
`src/app/go/[offerId]/route.ts` is **unmodified**.

---

## Architecture (verified)

PDP page source still has:

- `export const revalidate = 86400`
- `export const dynamicParams = true`
- `generateStaticParams() { return [] }`
- no `force-dynamic`, `cookies()`, `getRequestRegion()`, `revalidate = 0`

Commerce data function and route:

- import `@/repositories/products` and `@/repositories/commerce` **by file**
- do **not** import `getProductPageData`, `getProductGraph`, `@/repositories` barrel, editorial, recommendations, or review-summary
- region from **path only**
- invalid region → 400 `private, no-store`
- published + `shouldRenderPublicly(getLaunchEligibility(...))` → else 404
- empty offers → 200, `lowestPrice: null`

Production build:

```text
├ ● /api/products/[slug]/commerce/[region]                 182 B         103 kB
├ ● /products/[slug]                                     9.72 kB         125 kB
├ ● /products/[slug]/alternatives                        11.8 kB         123 kB
├   └ [+915 more paths]
```

Canonical PDP: **● with zero child paths** (on-demand ISR).  
Commerce API: **● with zero child paths** (on-demand, `revalidate = 3600`). Not full catalog × 7 SSG.

---

## Runtime evidence (`next start`)

`/products/asics-novablast-6`

| Request | Result |
|---|---|
| First | 200, `x-nextjs-cache: MISS`, `s-maxage=86400` |
| Second | 200, `HIT`, identical body |
| Cookie `kitletics_region=UK` | 200, `HIT`, **byte-identical NL HTML** |
| Canonical / title | unchanged |
| JSON-LD | Product + EUR Offers; no GBP Offer schema |
| Invalid slug | 404, no redirect |

`GET /api/products/asics-novablast-6/commerce/UK`

| Request | Result |
|---|---|
| First | 200, `MISS`, `public, s-maxage=3600, stale-while-revalidate=82800`, `X-Robots-Tag: noindex, nofollow` |
| Second | 200, `HIT` |
| Body | `GBP`, `offer-nb6-uk`, `/go/offer-nb6-uk?placement=product-offers` |
| Affiliate URLs | none |

US: `USD`, `offer-nb6-us`.  
ZA: 200, `offers: []`, `lowestPrice: null`, other-region listings present.  
`.../commerce/ZZ`: **400**, `private, no-store, max-age=0`.  
Unknown slug: **404** `{ error: "not_found" }`.

---

## Client behavior

`RegionPreferenceProvider` (layout, client) hydrates `kitletics_region` without the server layout reading cookies. `RegionSelector` calls `setRegion()`; **`window.location.reload()` is gone**.

`ProductCommerceIsland`:

- `NL` → `initialCommerce`, no fetch
- non-NL → AbortController fetch; generation counter ignores stale responses
- loading: “Updating regional prices…” on commerce surfaces only
- error: requested region kept, NL rows not shown, Retry
- empty 200: existing no-regional-offers copy (not an error)

JSON-LD is rendered **before** the island in `ProductDetailPage` and is not updated on region change.

Peer From-prices overlay `peerPrices` for `alternativeProductIds ∪ relatedProductIds`. Editorial comparison-rail peers outside those arrays keep the ISR NL fallback.

---

## Cost import graph

| Question | Answer |
|---|---|
| Imports getProductPageData | **NO** |
| Imports getProductGraph | **NO** |
| Imports `@/repositories` barrel | **NO** |
| Imports editorial/recommendations graph | **NO** (launch eligibility is used for 404 parity only) |
| Loads product catalog module | **YES** — `getProductBySlug` → `content/products` (includes pre-existing review-linkage side effect). Same family as `/go`. |
| Loads offer/retailer modules | **YES** |
| NL visitor requires API | **NO** |
| Non-NL response cacheable | **YES** |

`npm run audit:vercel-cost` → **FAIL 23 · WARN 1 · INFO 1**, all on **other** public routes + middleware images + `hostname: "**"`. `products/[slug]/page.tsx` and the commerce API are **not** in `force-dynamic-public` or `cookies-public-rsc`.

---

## Validation

```text
Lint: PASS (0 errors, 42 pre-existing scripts/tmp warnings)
Types: PASS
Tests: PASS (98 files / 987 tests)
Production build: PASS
```

---

# REGIONAL COMMERCE IMPLEMENTATION VERIFICATION

Canonical PDP

* remains ISR: YES
* revalidate 86400: YES
* force-dynamic absent: YES
* server cookies absent: YES
* zero PDP build params: YES

Commerce API

* endpoint: GET /api/products/[slug]/commerce/[region]
* validates region: YES
* validates product/publication: YES
* invalid region no-store: YES
* successful response cacheable: YES
* cache TTL: s-maxage=3600, stale-while-revalidate=82800
* imports getProductPageData: NO
* imports full graph: NO
* imports repository barrel: NO
* exposes raw affiliate URLs: NO

Client

* NL makes zero API requests: YES
* UK switching works: YES
* US switching works: YES
* return to NL requires no API: YES
* full page reload removed: YES
* loading state correct: YES
* error state correct: YES
* stale request race protected: YES

Commerce

* NL: PASS
* UK: PASS
* US: PASS
* empty-offer region: PASS
* regional /go IDs: PASS
* peer prices: PASS

SEO

* canonical unchanged: PASS
* metadata unchanged: PASS
* JSON-LD remains canonical NL: PASS

Validation

* lint: PASS
* types: PASS
* tests: PASS
* production build: PASS
* Vercel cost audit: FAIL

Cost architecture

* repeated PDP Fluid rendering eliminated: YES
* non-NL API bounded to valid regions: YES
* non-NL API cached: YES
* full page graph avoided by commerce API: YES
* new high-cost runtime path introduced: NO

Known limitations:
- Editorial comparison-rail peers that are not on `alternativeProductIds` / `relatedProductIds` keep the ISR NL From-price until a later phase.
- `getProductBySlug` still initializes the product catalog module (and its existing review-linkage import). That is not `getProductPageData`.
- `npm run audit:vercel-cost` still FAILs 23 pre-existing public routes (reviews, best, brands, listings, finders, search, alternatives) plus middleware images and `hostname: "**"`. This Phase B route is not among them.
- First paint is always NL HTML; a UK cookie hydrates, then the island fetches. Googlebot continues to see NL.

Blocking issues:
NONE

SAFE FOR ONE CONTROLLED PRODUCTION DEPLOYMENT:

YES
