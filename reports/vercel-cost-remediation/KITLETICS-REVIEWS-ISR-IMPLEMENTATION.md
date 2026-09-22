# Kitletics reviews ISR implementation

**Date:** 2026-09-21  
**Status:** implemented and verified locally. No push. No deploy.  
**Scope:** `/reviews/[slug]` and review-specific commerce surfaces.  
**Not modified:** `/products/[slug]`, `/api/products/[slug]/commerce/[region]` data function (reuse only), `/go/[offerId]`, other route families.  
**Shared primitive:** optional `placement` on `CommerceOfferPanel` so review offer hops keep `?placement=review`. PDP still uses baked `goUrl` (`product-offers`).

---

## 1. Before architecture

```text
REQUEST
→ src/app/reviews/[slug]/page.tsx
→ force-dynamic
→ generateStaticParams = getReviews()  (~373 indexable)
→ generateMetadata: getReviewBySlug + getProductById + reviewMetadata
→ Page: getReviewBySlug + getRequestRegion() → cookies()
→ getReviewPageData(slug, { region })
   → enrichReviewForPage
   → getProductGraph(product.id, { region })
   → regional offers / lowestPrice
→ ReviewDetailPage
   → JsonLdScript (Product Offers from request region)
   → ReviewHero / ReviewScorePanel From-price + Amazon
   → editorial sections + mid-article Amazon CTA
   → ReviewVerdictCard Amazon / All prices
   → OfferPanel
```

Every Googlebot/user hit ran Node, loaded the review graph, and varied HTML + Offer JSON-LD by `kitletics_region`.

---

## 2. After architecture

```text
REQUEST (no cookies)
→ on-demand ISR  revalidate=86400  generateStaticParams=[]
→ generateMetadata: cached getReviewBySlug (NL-irrelevant)
→ Page: cached getReviewPageData(slug, { region: DEFAULT_REGION })
→ ReviewDetailPage
   → JsonLdScript FIRST (NL Offers, Review, BreadcrumbList, FAQ if any)
   → ProductCommerceIsland(slug=product.slug, initialCommerce=NL DTO)
      → editorial server HTML
      → client commerce surfaces (From-price, Amazon CTAs, offer panel)
NL visitor: no commerce API request
UK/US visitor: GET /api/products/{productSlug}/commerce/{region}  (existing endpoint)
```

Canonical HTML does not read `cookies()`, `getRequestRegion()`, `headers()`, `draftMode()`, `connection()`, `unstable_noStore`, or `no-store`.

---

## 3. Data classification (from implementation, not assumed)

### A. Canonical / region-independent

Verified in `getReviewPageData` + `ReviewDetailPage` / `reviewMetadata` / `reviewJsonLd`:

- Review title, subtitle, summary, verdict, bottom line
- Score / `displayScore` / gauges / score breakdown
- Pros / cons, Buy if / Skip if (`decisionCopy`)
- Editorial `sections` (fit, ride, durability, …) and section images
- Testing / research modules, fit disclosure
- Specs / glance rows
- Product identity, brand, author, dates
- Canonical URL, metadata title/description, OG
- Breadcrumbs, related guides/comparisons/alternatives (identity, not prices)
- Comparison table (no prices)
- Hero / gallery images
- FAQ copy
- JSON-LD Review (`reviewRating`, author, `datePublished`, `dateModified`, `itemReviewed`)

### B. Regional commerce

- `offers` / `offersOtherRegions`
- `lowestPrice` + currency
- `regionLabel`
- Amazon CTA selection (`pickAmazonOffer` / `isAmazonCommerceOffer`)
- Offer panel / From-price / All prices count
- Product JSON-LD `offers` (price + `priceCurrency`)
- Affiliate hops via `/go/{offerId}`

Region does **not** change which SKU the review is about, editorial ranking, or Review schema identity.

---

## 4. Regional commerce implementation

A review belongs to a product. Mapping:

`review.productId` → `product.slug` → `GET /api/products/[slug]/commerce/[region]`

No new review commerce API.

| Piece | Path |
|---|---|
| ISR → island DTO | `src/lib/review/review-commerce-from-page.ts` |
| Island | existing `ProductCommerceIsland` (product slug) |
| Offer list | existing `CommerceOfferPanel` + `placement="review"` |
| From-price / Amazon / mid-article / verdict CTAs | `src/components/review/ReviewCommerceCtas.tsx` |

Commerce API still does **not** import `getReviewPageData`, `getProductGraph`, editorial, or recommendations.

NL: `shouldFetchRegionalCommerce("NL") === false` → island keeps `initialCommerce`.  
Non-NL: fetch cacheable JSON (`s-maxage=3600`). Empty region (ZA): 200, `offers: []`, `lowestPrice: null`.

Affiliate URLs stay `/go/{id}?placement=…`. No raw `affiliateUrl` in the DTO.

---

## 5. JSON-LD behavior

Server HTML (Novablast 6 runtime):

| `@type` | Notes |
|---|---|
| BreadcrumbList | present |
| Review | `reviewRating` 90/100, Organization author, `datePublished`, `dateModified`, `itemReviewed` Product |
| Product | name ASICS Novablast 6; **4 Offers, all EUR** |
| FAQPage | omitted on this review (no FAQs) |
| AggregateRating | **never emitted** by `productJsonLd` / `reviewJsonLd` — preserved |

Client region changes do **not** rewrite JSON-LD (`JsonLdScript` is **before** `ProductCommerceIsland`). UK cookie HTML still EUR Offers.

---

## 6. Metadata behavior

`generateMetadata` still uses `reviewMetadata(review, product.fullName)` + `withLaunchRobots`. Canonical: `https://kitletics.com/reviews/{slug}`. Does not depend on region. UK cookie HTML title/canonical identical to NL.

---

## 7. Duplicate-work analysis

| Call | generateMetadata | Page |
|---|---|---|
| `getReviewBySlug` | yes | yes |
| `getReviewPageData` / `enrichReviewForPage` / `getProductGraph` | **no** | yes |

`getReviewPageData` was **never** duplicated into metadata. Narrow React `cache()` now shares `getReviewBySlug` and `getReviewPageData` per request. No data-layer rewrite.

---

## 8. Build output

```text
Generating static pages (571/571)

├ ƒ /reviews                                               849 B
├ ● /reviews/[slug]                                      2.55 kB
├ ○ /robots.txt
```

`● /reviews/[slug]` has **zero child paths**. Previously `generateStaticParams` enumerated the review estate. This build generated **571** static pages (other routes), not ~373 reviews.

---

## 9. Runtime MISS/HIT (`next start --port 3014`)

`GET /reviews/asics-novablast-6`

| Request | Status | `x-nextjs-cache` | `Cache-Control` | Body SHA-256 |
|---|---|---|---|---|
| First | 200 | **MISS** | `s-maxage=86400, stale-while-revalidate=31449600` | `716dc82a…04b15f` |
| Second | 200 | **HIT** | same | identical |

Editorial present: H1 `ASICS Novablast 6 Review`, Kitletics Score, Buy if / Skip if, sections (Upper & Fit, Ride & Feel, Outsole, Durability, Value, …).

---

## 10. Region-switch evidence

| Check | Result |
|---|---|
| Cookie `kitletics_region=UK` on review URL | 200 **HIT**, SHA identical to NL |
| Canonical | unchanged |
| Title | unchanged |
| JSON-LD Offer currency | EUR only |
| HTML `/go/` IDs | NL (`offer-nb6-nl-amz`) — expected; island hydrates UK after paint |
| `GET /api/products/asics-novablast-6/commerce/UK` | GBP, `offer-nb6-uk`, `/go/…` |
| US | USD, `offer-nb6-us` |
| ZA | empty offers, `lowestPrice: null` |
| NL API | EUR, 4 offers |
| Region selector | still no `location.reload` (existing PDP provider) |

---

## 11. Tests

`tests/reviews-isr.test.ts` — 8 tests: ISR contract, empty params, no cookies/dynamic APIs, JSON-LD-before-island, commerce API avoids review graph, NL document, unknown slug, product-slug mapping, UK/US/ZA API, launch-eligible public review.

Full suite: **100 files / 998 tests**.

---

## 12. Cost-audit delta

| | Before this change | After |
|---|---|---|
| FAIL | 22 | **20** |
| WARN | 1 | 1 |
| INFO | 1 | 1 |

Removed: `force-dynamic-public` + `cookies-public-rsc` on `src/app/reviews/[slug]/page.tsx`.  
Review FAILs remaining: **0**.

---

## 13. Known limitations

- Prices nav item still follows **NL** `offers.length` at ISR time (canonical). UK-only stock still reachable via `#offers` after hydrate.
- First paint for non-NL is NL From-price, then island swap (same as PDP).
- Mid-article Amazon strip appears only when the **active** region has an Amazon offer.
- `AggregateRating` was not in the previous review schema; not added.
- `CommerceOfferPanel` gained an optional `placement` prop; PDP callers omit it and keep `goUrl`.

---

## Vercel cost impact

| Metric | Direction |
|---|---|
| Build CPU | **LOWER** — 0 review slugs at build |
| Fluid CPU | **LOWER** — ISR HTML for sitemap’d reviews |
| Origin Transfer | **NEUTRAL** |
| ISR | **HIGHER** — on-demand keys, `revalidate=86400` (required) |
| Images | **NEUTRAL** |
| Observability | **NEUTRAL** |

DEPLOYMENT REQUIRED: YES (production still force-dynamic until a future deploy)  
SAFE TO DEPLOY: YES  
**Not deployed. Not pushed.**

---

REVIEWS ISR VERIFICATION

force-dynamic removed: YES  
server cookies removed: YES  
revalidate 86400: YES  
dynamicParams true: YES  
build-time review params: 0  

editorial content ISR: YES  
regional commerce isolated: YES  
existing product commerce API reused: YES  
full review graph used by commerce API: NO  

NL initial API request required: NO  
UK commerce: PASS  
US commerce: PASS  
empty-region commerce: PASS  
region switching without reload: PASS  

canonical unchanged: PASS  
metadata unchanged: PASS  
review JSON-LD preserved: PASS  
JSON-LD remains canonical NL: PASS  
review score preserved: PASS  
editorial sections preserved: PASS  
affiliate behavior preserved: PASS  
invalid slug: PASS  

metadata/page expensive work deduplicated: YES  

first request cache: MISS  
second request cache: HIT  
UK-cookie canonical HTML: HIT  
UK-cookie canonical HTML identical to NL: YES  

Lint: PASS  
Types: PASS  
Tests: PASS  
Production build: PASS  

Vercel cost audit:  
FAIL: 20  
WARN: 1  
INFO: 1  

REVIEW FAILS REMAINING: 0  

SAFE TO CONTINUE TO BEST GUIDES: YES
