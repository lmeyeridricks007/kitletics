# Kitletics PDP regional commerce — Phase B design

**Date:** 2026-09-21  
**Status:** design only. No code changes. No push. No deploy.  
**Depends on:** Phase A passed (`KITLETICS-PDP-ISR-DESIGN.md`, `KITLETICS-PDP-ISR-PILOT.md`).

The canonical PDP stays **one on-demand ISR document** (`revalidate = 86400`, `DEFAULT_REGION = NL`, no `cookies()`, no `force-dynamic`, empty `generateStaticParams`). Phase B adds a **client commerce island** that, for non-NL visitors only, fetches a **small, CDN-cached JSON payload** and patches commerce UI after hydration. Editorial HTML and JSON-LD do not change.

Worked example: `GET /products/asics-novablast-6` with `kitletics_region=UK`.

---

## Hard constraints (do not violate in implementation)

1. Do not reintroduce `cookies()` / `getRequestRegion()` on `src/app/products/[slug]/page.tsx`.
2. Do not set `force-dynamic` on the canonical PDP.
3. Do not call `getProductPageData()` from the commerce endpoint.
4. Do not import `@/repositories` barrel from the endpoint (that re-exports graph + editorial + recommendations).
5. Do not send `ProductPageData` to the browser as the regional payload.
6. Do not mutate title, canonical, robots, or JSON-LD from the island.
7. Do not change `/go/[offerId]` (`force-dynamic`, `Cache-Control: no-store`).
8. Do not SSG `products × 7 regions` at build. Commerce JSON is on-demand, same idea as PDP ISR.
9. Do not add a global state library. Follow the existing `CompareTrayProvider` pattern.

---

## 1. Commerce surfaces on ProductDetailPage

`ProductDetailPage` is a **server component**. Region-aware values today come from `ProductPageData` plus extra `getLowestOfferPrice(..., data.region)` calls at render. `StickyBuyPanel.tsx` exists but is **not mounted** on the PDP; the live “sticky buy CTA” is the **hero aside** (`lg:sticky`).

| Component / UI | Regional data used | Current server/client | Move into commerce island? |
|---|---|---|---|
| Hero From-price (`From {formatPrice}`) | `data.lowestPrice` | Server | **YES** |
| Hero “View prices (N)” CTA | `offers.length`, `#offers` | Server | **YES** (count + enabled state) |
| Hero empty “Regional pricing” card | `lowestPrice` missing / `canBuy` (uses `offers.length`) | Server | **YES** |
| Hero aside (sticky on lg) | same lowestPrice + CTA | Server | **YES** (this is the sticky buy CTA) |
| `StickyBuyPanel` | `lowestPrice`, `hasOffers` | Client file, unused on PDP | **NO** (dead on this page; do not resurrect in this phase) |
| Offer panel heading “Showing offers for {region}” | `data.regionLabel` | Server (`OfferPanel`) | **YES** |
| Retailer rows | `data.offers` → offer + retailer + availability + price + `/go/{id}?placement=product-offers` | Server | **YES** |
| Offer availability / type / Amazon label | offer + retailer | Server | **YES** |
| Empty regional offer state | `offers.length === 0`, `NO_REGIONAL_OFFERS_MESSAGE` | Server | **YES** |
| `offersOtherRegions` details list | `data.offersOtherRegions` | Server; **only rendered when regional offers are empty** | **YES** (needed for BE/ZA honest empty state) |
| Footer “Prices checked {date}” | `offers[0].offer.lastChecked` | Server | **YES** |
| Compare-rail From-prices | `data.lowestPrice` + `getLowestOfferPrice(peer, data.region)` | Server | **YES** (price only) |
| Top-alternatives From-prices | `getLowestOfferPrice(alt.id, data.region)` | Server | **YES** (price only) |
| Review-section alt From-prices | `getProductReviewSummary({ region: data.region })` → `alt.price` | Server | **YES** (price overlay only; keep editorial cards) |
| Product / Review / FAQ / Breadcrumb JSON-LD | `productJsonLd(product, offers.map(...))` uses **NL offers in ISR** | Server | **NO** |
| Specs, gallery, buy-if, review copy, evidence, guides, tools | not regional | Server | **NO** |
| `RegionSelector` (header utility bar) | cookie + `initialRegion` (NL from layout) | Client | **YES** (stop reload; emit shared region). Not a price surface. |
| `AddToCompareButton` | product identity | Client | **NO** |

`canBuy` is derived (`lifecycleStatus` + `offers.length`). Lifecycle stays on the server product; offer count moves with the island.

---

## 2. Minimum regional payload

Derive a DTO from existing types (`Offer`, `Retailer`, `RegionCode`, `OfferRow`, `getLowestOfferPrice` return). Do **not** serialize full `Offer` (no `url`, `affiliateUrl`, `externalIds`, tracking templates).

```ts
import type { RegionCode } from "@/domain/shared/types";
import type { OfferAvailability, RetailerType } from "@/domain/commerce/types";

export type CommercePrice = {
  amount: number;
  currency: string;
  offerId?: string;
};

export type ProductCommerceOfferDto = {
  id: string;
  retailerId: string;
  retailerName: string;
  retailerType?: RetailerType;
  region: RegionCode;
  price: number;
  currency: string;
  availability: OfferAvailability;
  shipping?: string;
  lastChecked: string;
  stale: boolean;
  displayPrice: boolean;
  goUrl: string; // /go/{id}?placement=product-offers
};

export type ProductCommerceResponse = {
  productId: string;
  slug: string;
  region: RegionCode;
  regionLabel: string;
  currency: string;
  coverage: "primary" | "partial" | "limited" | "none";
  lowestPrice: CommercePrice | null;
  offers: ProductCommerceOfferDto[];
  offersOtherRegions: ProductCommerceOfferDto[];
  /** From-prices for alternativeProductIds + relatedProductIds only */
  peerPrices: Record<string, CommercePrice | null>;
  pricesCheckedAt: string | null;
};
```

`goUrl` is built with existing `buildOfferClickHref(id, "product-offers")` (`src/lib/commerce/offer-click-href.ts`). Affiliate tags stay on `/go`.

**Do not send:** `ProductPageData`, review bodies, specs, FAQs, evidence, recommendations, guides, tools, images, full catalog, raw affiliate URLs.

Initial NL commerce for the island is the **same DTO**, built once on the PDP server from `data` (already loaded for ISR). That is a mapping step, not a second graph walk at request time after cache HIT.

---

## 3. Data dependency (critical)

### Forbidden path

```text
getProductPageData(slug, { region: UK })
  → getProductBySlug
  → getProductGraph          // reviews, comparisons, alts, guides, tools, evidence, offers
  → spec groups, decision copy, padel editorial, FAQs, breadcrumbs
```

That is the full content/editorial graph. **Not acceptable** for the commerce endpoint.

### Proposed path

New function, new file (do not hang this off `get-product-page-data.ts`):

`src/lib/product/get-product-commerce.ts`

```text
getProductCommerce(slug, region, { isDev: false })
```

**A. slug → product identity**

```text
src/lib/product/get-product-commerce.ts
  → getProductBySlug(slug, { isDev: false })
       @/repositories/products.ts
       → @/content/products.ts          // catalog array
       → publishing resolver            // published only in production
```

Needed fields: `id`, `slug`, `alternativeProductIds`, `relatedProductIds`, `lifecycleStatus` (optional, for empty vs discontinued — island can keep lifecycle from ISR props).

**B. product ID + region → offers**

```text
getOffersForProduct(product.id, region)
  @/repositories/commerce.ts
  → materializedOffers (offers.ts + pricing overlay + affiliate URL overlay + URL validation)
  → isDisplayableOffer
rankOffersForProduct(offers, retailersById)   // same sort as PDP sortOffers
```

**C. product ID + region → lowest price**

```text
pickLowestDisplayableOffer(offers, now, region)
  @/domain/commerce/ranking.ts
  → shouldDisplayNumericPrice  // fresh ≤24h or recent ≤72h
```

Reuse this rather than `getLowestOfferPrice` if we want to avoid a second `getProductById` inside `getLowestOfferPrice`. Same ranking rules.

**D. alternative / peer IDs + region → prices**

Do **not** call `getAlternativesForProduct` / `getProductGraph`.

Peer IDs = `product.alternativeProductIds ∪ product.relatedProductIds` (already on the Product record). For each id:

```text
getOffersForProduct(peerId, region)
pickLowestDisplayableOffer(...)
```

Compare-rail and review alt cards overlay `peerPrices[productId]` when present. Peers that are only in editorial comparison objects and not on those two arrays keep their ISR (NL) price until a later phase. That is an accepted Phase B limit — no editorial import.

**E. retailer display**

```text
getRetailerById(offer.retailerId)
  @/repositories/commerce.ts
  → src/content/retailers.ts
```

DTO keeps `name` + `retailerType` only.

**Publish / 404 parity**

```text
getProductBySlug(..., { isDev: false }) missing → 404
shouldRenderPublicly(getLaunchEligibility({ kind: "product", entity })) === false → 404
```

Launch eligibility is the same gate the PDP uses. Import `@/domain/launch` + `@/lib/launch/apply-eligibility` **for that check only**. Do not import graph or page data.

### Import rules for the route module

**Allowed:**  
`@/repositories/products` (named file), `@/repositories/commerce` (named file), `@/domain/commerce/ranking`, `@/lib/commerce/offer-click-href`, `@/lib/region/resolve` (`isRegionCode`), `@/domain/shared/types`, `@/lib/product/get-product-commerce`, `@/lib/product/score` (`isOfferStale`), launch eligibility helpers.

**Forbidden:**  
`@/lib/product/get-product-page-data`, `@/repositories/graph`, `@/repositories` barrel, `@/repositories/editorial`, `@/repositories/recommendations`, `@/lib/product/get-product-review-summary`.

### WOULD THE PROPOSED REGIONAL COMMERCE ENDPOINT INITIALIZE THE ENTIRE CURRENT CONTENT GRAPH?

**NO**

It must not call `getProductPageData` / `getProductGraph`, so it does not assemble reviews, FAQs, guides, tools, evidence, recommendations, spec groups, or padel PDP editorial.

**Honest module-init caveat (pre-existing, not a Phase B redesign):**  
`getProductBySlug` loads `@/content/products`, which currently runs `applyReviewProductLinkage` → `@/content/reviews`. The padel product barrel also pulls padel seed modules. `/go/[offerId]` already pays that product-catalog init. Phase B does **not** split the catalog. It **does** avoid the extra page-graph assembly that makes PDP Fluid expensive.

If an implementation PR imports `getProductPageData` “to save time,” reject it.

---

## 4. API shape

**Chosen endpoint**

```text
GET /api/products/[slug]/commerce/[region]
```

Example: `GET /api/products/asics-novablast-6/commerce/UK`

**Why this, not `?region=UK`:**

- Kitletics has **no** public JSON API yet. `robots.ts` already `disallow: ["/api/", "/go/", ...]`.
- `/go/[offerId]` is the existing commerce route style (path param, not query).
- Cache key is the **pathname**. Unknown query values cannot fragment Incremental Cache.
- `[region]` is validated against `isRegionCode` / `REGIONS` (7 values). Invalid segment → **400** + `Cache-Control: private, no-store`.
- Colocating `src/app/products/[slug]/commerce/route.ts` would sit next to the ISR page and is easier to mis-route; `/api/` is already noindex and sitemap-excluded.

**Why not a Server Action:** not CDN-cacheable as a public GET; would become per-user Fluid.

**Handler rules**

| Input | Response |
|---|---|
| region not in `REGIONS` | 400 `{ error: "invalid_region" }`, no-store |
| slug missing / unpublished / not publicly renderable | 404 `{ error: "not_found" }`, `s-maxage` allowed (same as PDP 404 ISR) |
| valid slug + region, including **zero offers** (BE/ZA) | **200** with empty `offers`, `lowestPrice: null` — do not invent rows |
| no cookies, no `getRequestRegion` | region comes **only** from the path |

Headers on 200:

```text
X-Robots-Tag: noindex, nofollow
Cache-Control: public, s-maxage=3600, stale-while-revalidate=82800
```

`export const revalidate = 3600`  
`export const dynamicParams = true`  
`generateStaticParams() { return [] }`  — **do not** enumerate catalog × regions at build  
Do **not** set `force-dynamic`.  
Do **not** read `cookies()` / `headers()`.

Empty-offer regions are successful commerce documents, not 404s.

---

## 5. Cache policy

Offer numeric display uses `FRESHNESS_THRESHOLDS_HOURS`: **fresh 24h**, **recent 72h**, aging 168h (`src/domain/commerce/ranking.ts`). PDP HTML is 86400s because editorial is stable. Commerce should **not** copy that TTL.

**Selected:** `s-maxage=3600` (1 hour), `stale-while-revalidate=82800` (~23h).

Why 1 hour, not 24 hours, not no-store:

- No-store would recreate per-user Fluid for every UK view — Phase A’s failure mode, smaller JSON.
- 24h HTML is too long if `lastChecked` / overlay prices move inside the 72h window.
- 1 hour is well inside the 72h display window, bounds Fluid to roughly `visited slugs × 7 regions × 24 generates/day/POP` in the worst crawl, typically far less.
- SWR keeps a stale JSON document on cache miss so the island does not block on origin every hour.

**Cache key:** `/api/products/{slug}/commerce/{RegionCode}`  
Cardinality: **products with traffic × 7**, not arbitrary strings.

Invalid regions never enter cache (400 no-store).

---

## 6. NL makes no extra request

`ProductCommerceIsland` receives `initialCommerce: ProductCommerceResponse` from the ISR server (NL).

```text
activeRegion === DEFAULT_REGION ("NL")
  → use initialCommerce
  → fetch() must not run

activeRegion !== "NL"
  → GET /api/products/{slug}/commerce/{region}
```

Returning NL from UK via the selector restores `initialCommerce` in memory. No network.

Cookie `kitletics_region=NL` or missing cookie: same. Majority/canonical path stays ISR-only.

---

## 7. Region switching (no full reload)

Today `RegionSelector.select()` writes `kitletics_region` and **`window.location.reload()`**. After Phase A that reload returns cached NL HTML.

**New behavior**

```text
User selects UK
  → write kitletics_region=UK (existing cookie helper)
  → trackCommercialEvent("region_changed")
  → set shared client region = UK
  → island fetch /api/products/{slug}/commerce/UK
  → patch commerce UI
  → NO reload

UK → US
  → cookie US, fetch US, patch UI

US → NL
  → cookie NL, island applies initialCommerce, no fetch
```

**Shared state (smallest):** a client `RegionPreferenceProvider` next to existing `CompareTrayProvider` in `src/app/layout.tsx`.

- Server layout still passes **no cookies**. `initialRegion={DEFAULT_REGION}` (already `HEADER_DEFAULT_REGION` in `SiteHeader`).
- Provider hydrates from `document.cookie` once (same as today’s selector `useEffect`).
- `RegionSelector` calls `setRegion(code)` instead of `reload()`.
- `ProductCommerceIsland` uses `useRegionPreference()`.

Do not introduce Redux/Zustand. Do not lift region onto the RSC tree.

Non-PDP pages keep the same cookie; they still ignore it on the server until those routes get their own islands. Reloading a `force-dynamic` page (reviews, etc.) still works via `getRequestRegion` where it already exists. Out of scope.

---

## 8. Loading UX

Never present **UK label + NL € retailers** as if they matched.

On NL → UK (including first hydrate when cookie is already UK):

1. Commerce surfaces (hero price/CTA, offer panel, peer From-prices, “Prices checked”) enter a **local skeleton / “Updating regional prices…”** state.
2. Editorial, gallery, specs, review copy stay visible.
3. Header region control may show UK immediately **only if** those commerce surfaces are already in loading state.
4. When JSON arrives, swap in GBP / UK rows / `/go/offer-nb6-uk?...`.

Do not unmount the whole PDP. Do not blank JSON-LD.

First paint without JS still shows NL (correct for Googlebot and no-JS).

---

## 9. Error behavior

If the UK (or US/DE/…) request fails (network, 5xx, invalid JSON):

- Keep the **UK** (requested) label — do not pretend NL is UK.
- **Do not** leave NL retailer rows visible under that label.
- Commerce surfaces show: **“Regional prices temporarily unavailable.”** plus a **Retry** control.
- Editorial page remains.
- `initialCommerce` (NL) is retained in memory but **not displayed** while `activeRegion !== NL`.
- Retry repeats `GET /api/products/{slug}/commerce/UK`.
- User can switch back to NL, which restores ISR commerce immediately.

Empty 200 (BE/ZA): not an error. Use existing `NO_REGIONAL_OFFERS_MESSAGE` and optional `offersOtherRegions` details. No invented offers.

---

## 10. JSON-LD stays canonical NL

The ISR document already emits:

- Product + **NL** Offer[] (72h-fresh)
- Review, FAQPage (when wired), BreadcrumbList

Googlebot has no region cookie and already indexed that NL offer set (Phase A verification).

The island **must not** rewrite `<script type="application/ld+json">`, `<title>`, canonical, or robots.

Why:

- One cache key per pathname. Schema must match the crawled HTML.
- Client-only UK Offers in JSON-LD would disagree with the cached document (cloaking-shaped inconsistency).
- Metadata is generated in `generateMetadata` without region and must stay that way.

Visible prices may differ from schema for cookied humans. That is acceptable and already true for any client-priced site whose crawl HTML is default-market.

---

## 11. `/go` stays dynamic

`src/app/go/[offerId]/route.ts` remains `force-dynamic`, `Cache-Control: no-store`, attaches tags at click time, `X-Robots-Tag: noindex`.

Regional DTO references **regional offer IDs** (`offer-nb6-uk`, `offer-nb6-us`, …) via `/go/{id}?placement=product-offers`.

Do not put tagged Amazon URLs in the JSON.

---

## 12. Cost analysis

| Era | What happens |
|---|---|
| Before Phase A | Every PDP hit → Fluid → `cookies()` → full `getProductPageData` graph |
| After Phase A | PDP HIT → Incremental Cache HTML; NL only |
| Phase B | PDP HIT + **non-NL only** → small JSON, cached by slug+region |

| Meter | Rating | Why |
|---|---|---|
| PDP Fluid CPU | **LOW** | Unchanged from Phase A. Island does not re-render RSC. |
| Commerce API Fluid CPU | **LOW** | Cold: one generate per slug×region per `s-maxage`. Warm: CDN/ISR HIT. NL visitors: **zero** API. Must stay off `getProductPageData` or this becomes **HIGH**. |
| Commerce API memory | **LOW** | JSON DTO is tiny. Isolate may still load product catalog + offers modules on cold start (same family as `/go`). Not the full page graph. |
| Cache cardinality | **LOW** | ≤ 7 × visited PDPs. Invalid regions excluded. |
| Origin transfer | **LOW** | Repeat UK views served from cache. Payload is offers + peer prices, not HTML+images+editorial. |

---

## 13. Implementation order

1. Add `ProductCommerceResponse` / offer DTO in `src/lib/product/product-commerce.ts` (types + `toProductCommerceDto` mapper from offers/retailers).
2. Add `getProductCommerce(slug, region)` in `src/lib/product/get-product-commerce.ts` with the import allow-list above. Unit-test Novablast 6 NL/UK/US and a no-offer region.
3. Add mapper from existing `ProductPageData` → `ProductCommerceResponse` for the ISR initial payload (so NL island props match the endpoint).
4. Add `src/app/api/products/[slug]/commerce/[region]/route.ts`: validate region, 404 gate, JSON, cache/robots headers, empty `generateStaticParams`.
5. Add `RegionPreferenceProvider` (cookie read/write + context). Mount beside `CompareTrayProvider`. **Do not** read cookies in the server layout.
6. Change `RegionSelector` to use the provider; **remove `window.location.reload()`**.
7. Add `ProductCommerceIsland` client component: NL short-circuit, fetch non-NL, loading, error/retry.
8. Split presentational bits: hero price/CTA, `OfferPanel` (make a client-capable view that accepts the DTO), peer From-price slots. Keep `ProductDetailPage` as the server shell that renders editorial + island slots.
9. Pass `initialCommerce` + `slug` + peer product ids already on the page. Overlay review alt prices by `productId` only.
10. Leave JSON-LD in the server tree, outside the island.
11. Tests: contract (no `getProductPageData` import on the route), NL no fetch, UK/US payload, BE/ZA empty, region cycle, failure, cache headers.
12. `npm run validate:deploy`
13. `npm run audit:vercel-cost` — confirm PDP still not `force-dynamic` / `cookies-public-rsc`; new route must not be `force-dynamic` or cookie-backed.

Do not implement `/reviews` or alternatives ISR in this phase.

---

## 14. Test plan

**NL (cookie absent or `NL`)**

- No `fetch` to `/api/products/.../commerce/...`
- Hero From **€ 149** on Novablast 6 (or current NL lowest)
- Four NL `/go/offer-nb6-nl-*?placement=product-offers`
- Offer panel “Netherlands”

**UK**

- One GET `/api/products/asics-novablast-6/commerce/UK`
- GBP / £ ; `offer-nb6-uk` ; currency GBP
- Repeat request: `Cache-Control` public s-maxage=3600 (and local `x-nextjs-cache` HIT after first)

**US**

- GET `.../commerce/US`
- USD ; `offer-nb6-us`

**BE or ZA (coverage none / empty offers)**

- 200, `offers: []`, `lowestPrice: null`
- Honest empty copy; no invented prices
- `offersOtherRegions` may list NL/DE/UK/US rows inside the existing details pattern

**Region switching (client)**

- NL → UK: fetch UK, loading on commerce only, then GBP
- UK → US: fetch US
- US → NL: no fetch, restore initial € commerce

**Failure**

- Stub 500/network: UK label + “Regional prices temporarily unavailable” + retry; NL rows not shown as UK

**SEO**

- Cached HTML title, canonical, Product/Offer JSON-LD still NL after island hydrate (assert `application/ld+json` unchanged)

**Payload size / graph**

- Response JSON has no review body, specs, FAQs, guides, tools, evidence
- Route source must not import `get-product-page-data` or `@/repositories/graph`

**Invalid**

- `/api/products/asics-novablast-6/commerce/ZZ` → 400 no-store
- `/api/products/this-product-definitely-does-not-exist/commerce/UK` → 404

**`/go`**

- Unchanged no-store; UK click uses UK offer id

---

## Request flow (target)

```text
GET /products/asics-novablast-6
  → ISR HIT (NL HTML + NL JSON-LD)
  → browser hydrates
  → RegionPreferenceProvider reads kitletics_region

if NL or missing:
  ProductCommerceIsland uses initialCommerce
  no API

if UK:
  commerce surfaces → loading
  GET /api/products/asics-novablast-6/commerce/UK
    → Incremental Cache HIT or 1h generate via getProductCommerce
  → £ / UK retailers / UK /go ids
  editorial + schema untouched
```

---

# REGIONAL COMMERCE DESIGN DECISION

Canonical PDP remains ISR: YES

Server cookies remain removed: YES

Proposed endpoint:
GET /api/products/[slug]/commerce/[region]

Commerce-only data path achieved: YES

Would endpoint initialize full content graph:
NO

NL requires extra API request:
NO

Non-NL response cacheable:
YES

Region values bounded:
YES

Full-page reload removed:
YES

JSON-LD remains canonical NL:
YES

/go remains dynamic:
YES

Expected Fluid CPU impact:
PDP stays Incremental Cache (LOW). Non-NL visitors add a small JSON GET, CDN-cached 1h per slug×region. NL visitors add zero origin commerce compute.

API Fluid CPU risk:
LOW

Client complexity:
MEDIUM

SEO risk:
LOW

Commerce correctness risk:
MEDIUM

Blocking issues:
NONE

SAFE TO IMPLEMENT REGIONAL COMMERCE:

YES
