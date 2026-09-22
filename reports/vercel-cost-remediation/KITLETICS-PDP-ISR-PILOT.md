# Kitletics PDP ISR pilot — Phase A verification

**Date:** 2026-09-21  
**Scope:** Verify `src/app/products/[slug]/page.tsx` only. No further implementation. No push. No deploy.  
**Design:** `reports/vercel-cost-remediation/KITLETICS-PDP-ISR-DESIGN.md`  
**Primary test URL:** `/products/asics-novablast-6`  
**Evidence:** source import graph, compiled `page.js`, `next build` route table, `.next/prerender-manifest.json`, local `next start` HTML.

Phase A converts the canonical product page from request-time Fluid SSR to **on-demand ISR** with **NL / `DEFAULT_REGION`** baked into the server HTML. Regional client commerce is **not** in this pass.

---

## 1. Route is no longer force-dynamic

### Effective page config

```ts
// src/app/products/[slug]/page.tsx
export const revalidate = 86400;
export const dynamicParams = true;
export function generateStaticParams() { return []; }
// export const dynamic  — not set (force-dynamic removed)
```

Compiled production bundle (`.next/server/app/products/[slug]/page.js`):

```text
dynamicParams:()=>aI, generateStaticParams:()=>aJ, revalidate:()=>aH
let aH=86400, aI=!0; function aJ(){return[]}
```

`force-dynamic` is absent from the compiled module.

### Dynamic-API search (page + imported server path)

Searched `page.tsx` and the server functions/components it uses to render:

`getPdpProduct` → `getProductBySlug`  
`getLaunchEligibility` / `enforceLaunchEligibility` / `withLaunchRobots` / `isLaunchPreviewContext`  
`productMetadata`  
`getProductPageData` → repositories / graph / commerce ranking / breadcrumbs / FAQs  
`ProductDetailPage` → JSON-LD, OfferPanel, review summary, spec blocks, galleries  
root `layout.tsx` (shared shell)

| API | Where found | Affects PDP rendering mode? |
|---|---|---|
| `export const dynamic = "force-dynamic"` | **Removed** from this page. Still on `/products/[slug]/alternatives` and other public routes (out of scope). | **No** for canonical PDP |
| `force-dynamic` string | Not on PDP page or its import graph | **No** |
| `cookies()` | Only in `src/lib/region/server.ts` (`getRequestRegion`). PDP does not import that module. | **No** |
| `headers()` | No `next/headers` import anywhere on the PDP path. Entire `src/` has a single `next/headers` import: `lib/region/server.ts`. | **No** |
| `draftMode()` | None in `src/` | **No** |
| `connection()` | None in `src/` | **No** |
| `unstable_noStore` / `noStore()` | None in `src/` | **No** |
| `cache: "no-store"` | None in `src/` | **No** |
| `revalidate = 0` | Not on PDP | **No** |
| `getRequestRegion()` | Not called by ProductPage / generateMetadata / getProductPageData | **No** |
| `await params` | Page + metadata | Standard App Router; does not force dynamic |
| `process.env.NODE_ENV` / `VERCEL_ENV` / `KITLETICS_LAUNCH_PREVIEW` | `isLaunchPreviewContext()` gates a client debug overlay | **Does not dynamize** (runtime still `x-nextjs-cache: HIT`) |
| `cache()` from React | Dedupes slug lookup between metadata and page | **No** (does not dynamize) |

`getProductPageData` still performs its own `getProductBySlug` internally. That is a duplicate in-memory find, not a dynamic API.

**CAN THIS PDP NOW USE ISR?**

**YES**

Nothing on the canonical PDP server path calls a Next.js dynamic API that would force request-time rendering.

---

## 2. ISR configuration

| Export | Actual | Expected |
|---|---|---|
| `dynamic` | **unset** (not `force-dynamic`) | not force-dynamic |
| `revalidate` | **86400** | 86400 |
| `dynamicParams` | **true** | true |
| `generateStaticParams` | **`return []`** | `[]` / on-demand ISR |

Production build route table:

```text
├ ● /products/[slug]                                     9.69 kB         121 kB
├ ● /products/[slug]/alternatives                        11.8 kB         123 kB
├   ├ /products/asics-novablast-5/alternatives
├   ├ /products/asics-novablast-4/alternatives
├   ├ /products/asics-gel-nimbus-27/alternatives
├   └ [+915 more paths]
```

Canonical `/products/[slug]` is **● with zero child paths**. Next’s legend: `● (SSG) prerendered as static HTML (uses generateStaticParams)`. Combined with empty params + `dynamicParams: true` + `revalidate = 86400`, that is **on-demand ISR**, not full-catalog SSG.

`.next/prerender-manifest.json`:

- `/products/[slug]` is a **dynamicRoute**
- `fallback: null` (blocking on-demand generate; no placeholder HTML)
- **zero** static keys under `/products/<slug>` for the canonical PDP
- `/products/asics-novablast-6` is **not** in the prerendered static route map

The 918 directories under `.next/server/app/products/<slug>/` are **empty shells from the untouched alternatives route**, not PDP HTML. There is no `asics-novablast-6.html` for the canonical page.

**PDP slugs generated during build:** **0**  
**Expected:** 0

We are **not** generating the product catalog for this route during `next build`.

---

## 3. Region cookie has left the server render path

### Code path (canonical)

```text
ProductPage
  → await params.slug
  → getPdpProduct(slug)                    // getProductBySlug, React.cache
  → notFound() if missing
  → getLaunchEligibility({ kind: "product", entity })
  → enforceLaunchEligibility(elig)
  → getProductPageData(slug, {
        region: DEFAULT_REGION,            // "NL"
        isDev: process.env.NODE_ENV !== "production"
     })
  → ProductDetailPage({ data })
```

`DEFAULT_REGION` is defined in `src/domain/shared/types.ts`:

```ts
export const DEFAULT_REGION: RegionCode = "NL";
```

`getProductPageData` uses `options?.region ?? DEFAULT_REGION`, then `getProductGraph(..., { region })` and `getLowestOfferPrice(product.id, region)`. With the page passing `DEFAULT_REGION`, that is **NL**.

Root layout still does **not** call `cookies()` / `headers()`. `SiteHeader` uses `HEADER_DEFAULT_REGION = "NL"` and lets `RegionSelector` hydrate the **label** from the cookie on the client.

**Server request cookie dependency:** **NO**  
**Expected:** NO

---

## 4. SEO has not changed (`/products/asics-novablast-6`)

`productMetadata()` is region-free. Googlebot previously received NL via missing `kitletics_region` → `getRequestRegion()` → `DEFAULT_REGION`. The ISR document is the same NL payload.

Live production HTML (`next start`, first generate then cache HIT):

| Check | Before (Googlebot / no cookie) | After (ISR document) | Result |
|---|---|---|---|
| title | `ASICS Novablast 6: Specs, Performance & Best Uses · Kitletics` (`seoTitle` unset → fullName template + layout `%s · Kitletics`) | identical | **PASS** |
| meta description | product `shortDescription` (no `seoDescription` / `verdict` on the product) | identical FF BLAST MAX / TURBO SQUARED copy | **PASS** |
| canonical | `https://kitletics.com/products/asics-novablast-6` | identical | **PASS** |
| robots | INDEXABLE → `withLaunchRobots` does not set `robots`; Next omits the tag (default indexable) | no `<meta name="robots">`; not noindex | **PASS** |
| OpenGraph | og:title / og:description / og:url / og:type website, default OG image | identical | **PASS** |
| H1 | product `name` → `Novablast 6` | identical | **PASS** |
| product name | `ASICS Novablast 6` / `Novablast 6` | present in title, JSON-LD, body | **PASS** |
| product description | shortDescription in meta + body | present | **PASS** |
| editorial / review | review-novablast-6 sections, Buy if / Skip if | FF BLAST MAX, ASICSGRIP, Buy if, Skip if, Ghost 18 | **PASS** |
| specifications | weight 253, heel 41.5, drop 8, etc. | 253 and 41.5 present | **PASS** |
| breadcrumbs | Home → Running → Running Shoes → ASICS Novablast 6 | same in JSON-LD + visible crumbs | **PASS** |
| internal links | brand + alternatives + review | `/brands/asics`, Ghost 18 / Clifton 10 / Ride 18 product URLs, `/reviews/asics-novablast-6` | **PASS** |

No SEO regression vs the pre-ISR NL Googlebot document.

---

## 5. JSON-LD

Rendered `@type` values on the ISR document: **BreadcrumbList, Product, Review**.

FAQPage is omitted because `review-novablast-6.faqIds` is `[]`. `getProductPageData` only loads FAQs from the review’s `faqIds`, then `faqPageJsonLd([])` returns `null`. Three comparison FAQ rows in `src/content/faqs.ts` have `productId: "prod-novablast-6"` but were **never wired** into this review. That is pre-ISR content wiring, not an ISR removal of Offer/FAQ schema.

| Check | Result | Notes |
|---|---|---|
| Product identity | **PASS** | `name: ASICS Novablast 6`, `sku: prod-novablast-6`, canonical product URL |
| NL offers | **PASS** | 4 Offers; NL retailers (Runnersworld NL, All4Running, Amazon affiliate, ASICS NL) |
| Price | **PASS** | 149 / 154 / 159 / 160 (matches NL seed offers; lowest 149) |
| Currency | **PASS** | `priceCurrency: EUR` on every Offer |
| Availability | **PASS** | `https://schema.org/InStock` on every Offer |
| Review schema | **PASS** | `@type: Review`, name `ASICS Novablast 6 Review`, `itemReviewed` the product, `reviewRating` present |
| FAQ schema | **PASS** | Not emitted; page model has no FAQs. Same as before ISR. Not used as a way to drop Offers. |
| Breadcrumb schema | **PASS** | Home → Running → Running Shoes → ASICS Novablast 6 |

Offer schema was **not** removed.

---

## 6. NL commerce

Visible + schema commerce on `/products/asics-novablast-6`:

- From-price: **€ 149** (lowest NL offer `offer-nb6-nl-rws`)
- Currency: **EUR** / `€` only in commerce UI (no `£`, no `GBP`, no `USD`)
- Retailer offers: ASICS Direct, All4Running, Amazon NL, Runnersworld Shop NL
- Offer count: **4** NL offers
- Availability: in-stock (schema InStock; UI “in stock”)
- Affiliate hops:  
  `/go/offer-nb6-nl-asics?placement=product-offers`  
  `/go/offer-nb6-nl-a4r?placement=product-offers`  
  `/go/offer-nb6-nl-amz?placement=product-offers`  
  `/go/offer-nb6-nl-rws?placement=product-offers`
- Alternative-product From-prices also **EUR** (e.g. €150 / €140 / €130 on compare cards)

Offer panel copy: “Showing offers for **Netherlands**.”

**NL COMMERCE: PASS**

---

## 7. Non-NL behavior (Phase B not implemented)

`RegionSelector` still writes `kitletics_region` and **reloads**.

Measured against production `next start`:

```text
User selects UK
  → cookie kitletics_region=UK
  → page reloads
  → x-nextjs-cache: HIT
  → byte-identical NL HTML
  → £ / GBP / offer-nb6-uk absent
  → UK commerce is NOT applied

User selects US
  → cookie kitletics_region=US
  → page reloads
  → x-nextjs-cache: HIT
  → byte-identical NL HTML
  → USD / offer-nb6-us absent
  → US commerce is NOT applied
```

`?region=UK` also returned the **same cached NL document** (`x-nextjs-cache: HIT`). The page does not read `searchParams`.

The selector may show a UK/US **label** after client hydrate (it reads `document.cookie`), while From-prices, offers, `/go` targets, and JSON-LD stay NL.

**Classification: EXPECTED TEMPORARY LIMITATION**

This is **not** a reason to restore `cookies()` on the server page.

---

## 8. Invalid slug

`/products/this-product-definitely-does-not-exist`

| Check | Result |
|---|---|
| Status | **404** |
| Valid PDP rendered | No (no Product JSON-LD, no Novablast body) |
| Redirect | No `Location` header |
| Application error | No |
| Second request | 404, `x-nextjs-cache: HIT` |

**INVALID SLUG: PASS**

An uncached unknown slug **does** require one server/ISR execution: `dynamicParams: true` + empty `generateStaticParams` means Next runs the page, `getProductBySlug` misses, `notFound()` fires. The 404 is then stored with `Cache-Control: s-maxage=86400`. That is expected on-demand ISR, not a leak of another product.

---

## 9. Build behavior

`npm run validate:deploy` (lint && typecheck && test && `next build`)

```text
Lint:           PASS (0 errors, 42 pre-existing warnings in scripts/tmp)
Typecheck:      PASS
Tests:          PASS (97 files / 967 tests)
Content/Data:   N/A for this script (content:validate is not a compile gate)
Production Build: PASS (exit 0)
```

Relevant Next output:

```text
├ ● /products/[slug]                                     9.69 kB         121 kB
├ ● /products/[slug]/alternatives                        11.8 kB         123 kB
├   ├ /products/asics-novablast-5/alternatives
├   └ [+915 more paths]
```

Legend from the same build:

```text
○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

Runtime on `next start`:

```text
FIRST  /products/asics-novablast-6  → 200  x-nextjs-cache: MISS  Cache-Control: s-maxage=86400, stale-while-revalidate=31449600
SECOND /products/asics-novablast-6  → 200  x-nextjs-cache: HIT   same body
```

**PDP rendering classification:** **ISR / on-demand static** (● with 0 build paths; first request generates; subsequent requests Incremental Cache for 86400s). **Not** `ƒ` dynamic. **Not** full-catalog SSG.

---

## 10. Build CPU improvement

**BEFORE** (git `HEAD` `page.tsx`):

```ts
export const dynamic = "force-dynamic";
export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}
```

| | |
|---|---|
| generateStaticParams catalog walk | **YES** |
| Number of returned PDP params | **918** (build listed 3 named + 915 more) |

That walk ran **while the route was also `force-dynamic`**, so Build CPU paid to enumerate/pre-render PDPs that were still request-time on Vercel.

**AFTER**

| | |
|---|---|
| generateStaticParams catalog walk | **NO** |
| Number of returned PDP params | **0** |

**Expected after:** 0

This **should reduce Kitletics Build CPU** for this route. It does **not** remove the still-untouched alternatives `generateStaticParams` (918 paths) or other SSG families. Net build improvement is real for PDP, not a whole-app SSG elimination.

---

## 11. Request-time compute

Confirmed against local production:

**BEFORE**

```text
REQUEST
  → Fluid Function
  → cookies()
  → getRequestRegion()
  → initialize/load content graph
  → getProductPageData()
  → render
  → response
```

**AFTER — first uncached request**

```text
REQUEST
  → ISR generation (x-nextjs-cache: MISS)
  → DEFAULT_REGION (NL)
  → getProductPageData()
  → render
  → cache (s-maxage=86400)
```

Module init still loads the in-memory catalog on that first generate (same graph as before; not a new data architecture).

**AFTER — subsequent request**

```text
REQUEST
  → cached document (x-nextjs-cache: HIT)
  → response
```

**This is now accurate.** Vary is RSC/prefetch/Accept-Encoding only — **not Cookie**.

---

## 12. New-problem check

| Risk | Found? |
|---|---|
| ISR cache key per region | **No.** UK/US cookies return byte-identical HIT of the NL document. `Vary` does not include `Cookie`. |
| Query-string regional PDPs | **No.** `?region=UK` HIT the same canonical HTML. Page does not read `searchParams`. |
| Cookie-based cache variants | **No.** |
| Seven copies of every PDP | **No.** One pathname → one ISR document. |
| Shorter-than-24-hour HTML revalidation | **No.** `revalidate = 86400`; runtime `s-maxage=86400`. |
| Full catalog SSG for this PDP | **No.** 0 PDP params. Alternatives still SSG 918 (pre-existing, out of scope). |
| New force-dynamic API | **No.** |
| no-store fetches | **No.** |
| New middleware dependency | **No.** Existing matcher still sees `/products/*` only for host/admin/IndexNow/images; no region rewrite. |
| Full product catalog serialized to the browser | **No new path.** Header sends sports/categories/counts, not all products. `ProductPageData` is one product + related entities. |
| Client-side full product catalog download | **No.** Search uses `searchKitleticsAction` on query, not a catalog dump. |

Non-blocking observations (not new architecture bugs):

- First ISR generate still initializes the in-memory content graph.
- Unknown-slug 404s are cached for 86400s (standard on-demand ISR).
- `getProductPageData` still does an extra slug lookup.
- `isLaunchPreviewContext()` still reads env vars (does not dynamize).

---

## 13. Cost impact assessment

| Meter | Assessment | Why |
|---|---|---|
| Fluid Active CPU | **MAJOR REDUCTION** | Repeat crawls/users hit Incremental Cache instead of a Fluid render that called `cookies()` + assembled the product graph. |
| Fluid Provisioned Memory | **MODERATE REDUCTION** | Function config unchanged, but PDP HIT traffic no longer holds a Node isolate for HTML. First generate still needs memory. |
| Build CPU | **MODERATE REDUCTION** | This route no longer walks `getProducts()` or lists 918 PDP children. Alternatives and other SSG routes still enumerate at build. |
| ISR Reads | **EXPECTED INCREASE** | One cache key per visited PDP pathname; Googlebot and users read Incremental Cache. Required for the pilot. |
| ISR Writes | **EXPECTED INCREASE** | First visit per slug + 24h revalidation writes. Far cheaper than per-request Fluid. 404s also write once. |
| Origin Transfer | **MODERATE REDUCTION** | Cached HTML served from Incremental Cache instead of origin SSR on every hit. Images / Blob unchanged. |

No new `force-dynamic`, no extra Image Optimization variants, no new Analytics/Speed Insights, no extra production deploy from this verification.

---

## 14. Failures

None that block Phase B regional commerce.

Documented limitation only: non-NL cookies do not change the ISR HTML (expected until a client commerce island exists). **Do not reintroduce `cookies()` on the server page.**

---

# PDP ISR PILOT VERIFICATION

Local validation: PASS

Rendering

* force-dynamic removed: YES
* ISR enabled: YES
* revalidate = 86400: YES
* server cookie dependency removed: YES
* full PDP generateStaticParams removed: YES
* dynamicParams supports on-demand products: YES

SEO

* metadata: PASS
* canonical: PASS
* robots: PASS
* editorial content: PASS
* JSON-LD: PASS

Commerce

* NL/default commerce: PASS
* /go links preserved: PASS
* non-NL limitation understood: YES

Correctness

* valid product: PASS
* invalid slug: PASS
* production build: PASS

Cost architecture

* repeated Fluid rendering eliminated: YES
* full catalog PDP build enumeration eliminated: YES
* region cache fragmentation avoided: YES
* new expensive runtime path introduced: NO

Expected cost impact:
PDP HTML moves from per-request Fluid SSR to on-demand ISR (24h). Fluid Active CPU should drop sharply on this route; Build CPU drops by removing the 918-slug generateStaticParams walk; ISR Reads/Writes increase by design (one cache key per pathname, not per region). Origin Transfer should fall for repeat PDP hits. Alternatives and other force-dynamic public routes are unchanged.

Blocking issues:
NONE

SAFE TO PROCEED TO REGIONAL COMMERCE DESIGN:

YES
