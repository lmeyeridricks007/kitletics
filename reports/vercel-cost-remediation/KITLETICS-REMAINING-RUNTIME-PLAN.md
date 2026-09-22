# Kitletics remaining runtime cost plan

**Date:** 2026-09-21  
**Status:** classification only. No application code changed. No push. No deploy.  
**Audit:** `npm run audit:vercel-cost` → **FAIL 23 · WARN 1 · INFO 1**  
**Reference architecture (do not copy mechanically):** `/products/[slug]` ISR + regional commerce island

Approved PDP contract (already implemented locally, **do not modify**):

- canonical public SEO/product content = ISR
- `revalidate = 86400`
- no `force-dynamic`
- no server `cookies()` in canonical page rendering
- no build-time pre-generation of the entire product catalog (`generateStaticParams() { return [] }`, `dynamicParams = true`)
- regional commerce isolated from canonical content
- regional commerce endpoint cacheable (`/api/products/[slug]/commerce/[region]`, `s-maxage=3600`)
- `/go` remains dynamic
- full page/product graph avoided by regional commerce API

This plan classifies **every remaining FAIL**. It does **not** prescribe pasting the PDP page into other routes. Each family is mapped to the architecture it actually needs.

Architecture letters used below:

| Letter | Meaning |
|---|---|
| **A** | Proven PDP pattern: ISR canonical HTML (NL / `DEFAULT_REGION`) + isolated regional commerce (client island and/or a **narrow** cacheable API). Reuse the existing product commerce endpoint where the page is SKU-scoped. Do **not** clone `getProductPageData` / `getProductGraph`. |
| **B** | Normal ISR without regional commerce. Region does not belong on the HTML at all (or NL From-price is acceptable until a later commerce overlay). |
| **C** | Static generation (`force-static` / fully static). Only for tiny, never-personalized shells. |
| **D** | Client-side filtering over an ISR/static shell. Query/facet state must not dynamize the canonical URL. |
| **E** | Controlled dynamic/API behavior. Unbounded query keys, share-state results, or image/edge config — not a public SEO HTML document. |
| **F** | Intentionally dynamic and should remain unchanged. |

---

## Audit snapshot (this run)

### FAIL (23)

| Rule | File |
|---|---|
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/[sport]/[segment]/[listing]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/[sport]/[segment]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/best/[slug]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/brands/[slug]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/gear/page.tsx` |
| `force-dynamic-public` only | `src/app/products/[slug]/alternatives/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/reviews/[slug]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/search/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/tools/[slug]/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/tools/[slug]/results/page.tsx` |
| `force-dynamic-public` + `cookies-public-rsc` | `src/app/tools/finder/[slug]/page.tsx` |
| `middleware-images` | `src/middleware.ts` |
| `image-remote-wildcard` | `next.config.ts` |

`/products/[slug]` and `/api/products/[slug]/commerce/[region]` are **absent** from this FAIL list. `/go/[offerId]` is exempt and is **not** a FAIL.

### WARN (1)

- `speed-insights-unsampled` — `src/app/layout.tsx` (`<SpeedInsights />` with no `sampleRate`)

### INFO (1)

- `web-analytics-enabled` — `src/app/layout.tsx` (`<Analytics />`). Keep on production.

---

## Cross-cutting findings (read these first)

### 1. Cookies are almost always commerce personalization

`getRequestRegion()` reads `cookies()` (`kitletics_region`). On every FAIL HTML route except **alternatives**, that is what the audit flags as `cookies-public-rsc`.

Region **does** affect:

- prices
- currency
- retailer availability
- affiliate offer lists / From-prices
- finder **budget band labels** (`withRegionalBudgetOptions`)
- price-sort and `maxPrice` facets

Region **does not** affect (and must not dynamize canonical HTML):

- canonical SEO title/description/path
- editorial copy (reviews, best-guide ranking by `rec.rank`, brand story)
- product identity (which SKU the URL is about)
- default “recommended” listing order
- JSON-LD Product identity (canonical Offers should stay NL, as PDP now does)

**Therefore:** cookies used only to personalize commerce must move off the RSC tree, same *idea* as PDP, not the same page module.

### 2. `searchParams` dynamize otherwise indexable pages

Next 15: `await searchParams` in a Server Component / `generateMetadata` opts the route dynamic.

| Route | Query today | Index policy | Needed |
|---|---|---|---|
| `/[sport]/[segment]` | catalog facets / sort / pagination | any non-empty query → `noindex,follow` + canonical clean path | **D** on clean ISR URL |
| `/[sport]/[segment]/[listing]` | same | same | **D** |
| `/running/shoes` (same route) | same + entry redirects | same | **D** |
| `/gear` | `sport`, `usecase`, `brand`, `maxPrice` | canonical `/gear` is indexable; query is UX state | **D** |
| `/search` | unbounded `q` + type/brand/price/feature | `robots: noindex,follow` on the page; **`robots.ts` still allows `/search`** | **E** — never ISR `q` |
| `/tools/[slug]` | calculator inputs; `build` on home-gym (noindex) | landings are indexable | **D** for inputs |
| `/tools/finder/[slug]` | share `s` / `edit` | landing indexable | **D** for wizard state |
| `/tools/[slug]/results` | share `s` | **noindex** | **E** — do not ISR |

### 3. `generateStaticParams` + `force-dynamic` is wasted Build CPU

Same anti-pattern the PDP used to have (`●` with hundreds of children that still SSR). Still present:

| Route | Params source | Approx children (last local `next build`) |
|---|---|---|
| `/products/[slug]/alternatives` | `getProducts()` | **918** (`●` + `[+915 more paths]`) |
| `/reviews/[slug]` | `getReviews()` | all reviews (~373 indexable in sitemap policy) |
| `/best/[slug]` | `getBestGuides()` | **~97** (3 listed + 94 more) |
| `/brands/[slug]` | `getBrands().filter(canRenderBrandHub)` | all renderable brands |
| `/[sport]/[segment]` | live sports × disciplines + listable categories | full taxonomy |
| `/[sport]/[segment]/[listing]` | `getUseCaseListingConfigs()` | **5** (cheap) |
| `/tools/finder/[slug]` | `FINDER_TOOL_SLUGS` | **16** (cheap) |

PDP already uses empty `generateStaticParams`. Alternatives is the next largest **build** waste. Reviews/best/brands/taxonomy are the next **Fluid** waste because they are sitemap’d.

### 4. Full catalog / data graph per request

| Route | Graph loaded at request | Severity |
|---|---|---|
| Reviews | `getReviewPageData` → `getProductGraph(product.id)` (product-scoped: offers, alts, guides, recs) **plus** full review enrichment / section HTML | High CPU per URL, not full catalog |
| Best | All guide recommendations + regional offers per SKU | Guide-scoped |
| Brands | `getProductsByBrand` (+ related brand IDs), prices per card | Brand-scoped |
| Gear | Sports, shop cards, `getProductsByCategory` / `BySport`, **all brands** for facet counts, `maxPrice` filter | **Hub-wide catalog scan** |
| Search | `searchKitletics(..., { limit: 5000 })` then `getProductById` / price facets | **Full search index** |
| Sport category | `assembleCategoryPage` / `getCatalogProducts` for that category | Category-scoped |
| Listing | `getCatalogProducts` for that use-case slice | Category-scoped |
| Alternatives | Relationships for the SKU + `getAllProductRelationships()` for eligibility | Relationship table, not 1113 PDPs |
| Finder results / rotation results | Finder/rotation universe + regional prices | Tool-scoped |
| `tools/[slug]` (calculators) | Tool metadata only; **`await getRequestRegion()` is unused** | Cookies for nothing |

Regional commerce API already proved the cheaper read: products + commerce repositories only, no `getProductGraph`, no editorial barrel.

### 5. Do not copy the PDP implementation

Reuse **ideas**: ISR shell, NL canonical, empty `generateStaticParams`, region from client, cacheable commerce JSON.

Do **not** reuse: `getProductPageData`, PDP JSON-LD construction, `ProductCommerceIsland` wiring unless the surface is actually a single-SKU offer panel. Listing/hub pages need compact `{ slug, lowestPrice, offerCount }[]` payloads, not PDP DTOs.

**Do not modify:** `/go`, `/products/[slug]`, `/api/products/[slug]/commerce/[region]`.

---

## Region-effect matrix (what actually changes)

| Surface | Canonical SEO | Editorial | Ranking / order | Recommendations | Product identity | Prices | Currency | Retailer availability | Affiliate offers |
|---|---|---|---|---|---|---|---|---|---|
| PDP (done) | no | no | no | no | no | **yes** | **yes** | **yes** | **yes** |
| Reviews | no | no | no | no | no | **yes** | **yes** | **yes** | **yes** |
| Best guides | no | no (`rec.rank` is editorial) | offer *list* yes; pick *order* no | editorial | no | **yes** | **yes** | **yes** | **yes** |
| Brands | no | no | default list by score/role, not region | no | no | **yes** | **yes** | **yes** | **yes** |
| Category / listing | no | no | default `recommended` no; `price-asc/desc` **yes** | no | no | **yes** | **yes** | **yes** | **yes** |
| `/gear` | no | no | `maxPrice` filter **yes**; pick slots editorial then price-gated | pick slot yes if price filter | no | **yes** | **yes** | **yes** | **yes** |
| Alternatives | no | no | comparison reasons editorial | relationship graph | no | **yes** (already NL-only today) | **yes** | **yes** | **yes** |
| Search | n/a (noindex) | n/a | relevance + **price facet** | n/a | n/a | **yes** | **yes** | **yes** | **yes** |
| Finder landing | no | no | n/a | n/a | n/a | budget **labels** | budget **labels** | no on landing | no on landing |
| Finder / rotation **results** | n/a (noindex) | n/a | match scores vs regional budget/price | **yes** | no | **yes** | **yes** | **yes** | **yes** |
| Calculators (`pace`, `1RM`, …) | no | no | n/a | n/a | n/a | **no** | **no** | **no** | **no** |
| `/go` | n/a | n/a | n/a | n/a | n/a | hop | hop | hop | **yes** (must stay request-time) |

---

## Route families

### 1. Reviews — **A** — P0

`/reviews/[slug]` · `src/app/reviews/[slug]/page.tsx`

- `force-dynamic` + `generateStaticParams()` from `getReviews()` + `getRequestRegion()` + `getReviewPageData(slug, { region })`.
- Sitemap’d, indexable when launch-eligible. Highest per-URL HTML (IMAGE-AUDIT: ~373 indexable reviews, ~16 section images).
- Cookies exist **only** to localize offers / From-price / JSON-LD Offer currency.
- Editorial, scores, Buy if / Skip if, section topics do not depend on region.

**Recommended:** ISR `revalidate=86400`, empty `generateStaticParams`, `DEFAULT_REGION` in `getReviewPageData`. Overlay prices via existing `GET /api/products/{productSlug}/commerce/{region}` (review already knows the product). Do not load `getProductGraph` on the commerce path.

**Risk:** medium (offer JSON-LD must stay NL like PDP; client must not rewrite schema). **Priority: P0.**

### 2. Best / buying guides — **A** — P0

`/best/[slug]` · `src/app/best/[slug]/page.tsx`

- Same `force-dynamic` + cookies + `generateStaticParams(getBestGuides())` (~97 children).
- Pick **order** is `guide.recommendations` sorted by editorial `rank`, not region.
- Region only fills `offers` / `lowestPrice` / `regionLabel` on each rec.

**Recommended:** ISR NL guide HTML. Commerce overlay is a **list** of SKU prices (new compact `/api/best/[slug]/commerce/[region]` **or** batched use of the existing product commerce endpoint). Do not re-run `getBestGuidePageData` per region on the server HTML.

**Risk:** medium (many offer CTAs on one page). **Priority: P0.**

### 3. Brands — **A** — P0

`/brands/[slug]` · `src/app/brands/[slug]/page.tsx`

- `force-dynamic` + `getRequestRegion()` + `getBrandHubPageData({ brandSlug, region })`.
- `generateMetadata` already calls `getBrandHubPageData({ brandSlug })` **without** region (NL). The page then rebuilds the hub **with** region — duplicated work.
- Product set / families / editorial / ItemList JSON-LD names+URLs are not regional. Cards carry `price` + `offerCount`.

**Recommended:** ISR NL hub. Compact brand commerce JSON (`slug → lowestPrice/offerCount`), not N+1 PDP fetches from the client, and not a clone of `BrandHubPage` SSR.

**Risk:** medium (Nike/Adidas-sized catalogs). **Priority: P0.**

### 4. Sport / category / listings — **D + A** (canonical **B** until overlay) — P0

`/[sport]/[segment]` and `/[sport]/[segment]/[listing]`

Mixed route:

- Discipline hubs (some mockups call `getDisciplineHubData({ region })` for card prices; Hyrox hub has no region; leftover `DisciplineLayout` calls `getLowestOfferPrice(id)` with **no** region).
- Category pages: `assembleCategoryPage({ searchParams })` — **does not even pass region** today (defaults NL) **except** `/running/shoes`, which passes region into `getRunningShoesCategoryPage`.
- Use-case listings (5 configs: daily / race / stability / trail / heavy): always `getRequestRegion` + `searchParams`.
- `generateMetadata` **and** the page `await searchParams` so any facet URL is dynamic; `hasNonCanonicalQueryState` already noindexes them.

`force-dynamic` + taxonomy `generateStaticParams` still walks every live sport/discipline/category **and then throws the result away**.

**Recommended:**

- Clean URL: ISR NL (`B`), empty or tiny `generateStaticParams`, `revalidate=86400`.
- Facets/sort/pagination: **D** (client over the shell). Do not `await searchParams` on the canonical RSC.
- Card From-prices: **A** overlay (listing commerce DTO, not PDP graph).
- `price-asc` / `price-desc` / `maxPrice` **must** use client regional prices; they must not SSR.

**Risk:** medium (running shoes is the busiest listing; entry redirects exist). **Priority: P0.**

### 5. Alternatives — **B** now, optional **A** later — P0

`/products/[slug]/alternatives` · `src/app/products/[slug]/alternatives/page.tsx`

- **No `cookies()` / `getRequestRegion()`.** Audit only flags `force-dynamic-public`.
- `generateStaticParams` = `getProducts()` → **918 children** on a force-dynamic route (largest leftover Build CPU clone of old PDP).
- Page already uses `getAlternativesPageData(slug, { isDev: false })` → `DEFAULT_REGION`.
- Sitemap’d when launch-eligible.

**Recommended:** same ISR contract as PDP (`revalidate=86400`, `generateStaticParams []`, `dynamicParams=true`, drop `force-dynamic`). Leave NL prices in HTML. Add commerce overlay only if product wants UK/US From-prices on this URL later.

**Risk:** low. **Priority: P0** (cheap win, huge param waste).

### 6. Finders / tools — split **B/D** vs **E** — P1 / P2

| Route | Cookies used for? | searchParams | Indexable? | Architecture |
|---|---|---|---|---|
| `/tools/[slug]` (calculators, home-gym, hyrox, 1RM) | **`await getRequestRegion()` and the value is discarded** | calculator / `build` | Yes (except `?build=`) | **B** landing + **D** client calculator. Delete unused cookies. |
| `/tools/finder/[slug]` (rewritten from `/tools/<finder>`) | `getFinderDefinition(slug, region)` → **budget labels only** | `s` / `edit` share | Yes (canonical `/tools/<slug>`) | **B** ISR NL labels + **D** wizard. Optional client relabel of budget bands. |
| `/tools/[slug]/results` | regional prices + match vs budget | unbounded `s` | **noindex** | **E**. Do **not** ISR `s`. Cacheable results **API** optional. |

Finder product identity does not change with region. Result **ranking** can, because budget bands are regional.

**Risk:** medium on finder landings (rewrite in middleware must keep working). Low on calculators. **Priority: P1 landings, P2 results.**

### 7. Search — **E** — P1

`/search` · `src/app/search/page.tsx`

- `force-dynamic` + cookies + `await searchParams` (`q`, type, brand, min/max price, feature).
- Page metadata is `noindex,follow`. **`src/app/robots.ts` does not Disallow `/search`.**
- `getSearchPageData` scans up to 5000 hits and applies **regional price facets**.

**Recommended:** do **not** ISR arbitrary `q` (unbounded Incremental Cache keys). Prefer a static/ISR empty shell + client fetch to a **cacheable search API** with a short CDN TTL, **or** keep the route dynamic but:

- drop cookies from RSC (pass region from client)
- `robots.ts` Disallow `/search`
- never `generateStaticParams` / never `revalidate` on `q`

**Risk:** low (already noindex). **Priority: P1** (bot Fluid if Google hits `/search?q=`).

### 8. Image middleware — **E** — P1

`src/middleware.ts` matcher includes `/images/:path*` and rewrites to Blob when `MEDIA_BLOB_BASE_URL` is set. `next.config.ts` **already has the same rewrite**.

This is Edge + Origin Transfer + Blob transfer, not HTML Fluid. Optimizer origin fetch (`/_next/image` → `/images/...`) hits middleware.

**Recommended:** remove `/images/:path*` from the matcher; keep config rewrite **or** (better, later) point `next/image` `src` at the Blob public hostname so the app is not the origin. Keep host 308, admin gate, IndexNow, finder rewrite.

**Do not** fold this into PDP work.

**Risk:** low if rewrite remains. **Priority: P1.**

### 9. Image configuration — **E** — P1

`next.config.ts` `images.remotePatterns` includes `{ protocol: "https", hostname: "**" }` **plus** Blob hosts.

**Recommended:** delete `**`. Allow Blob + the finite retailer/CDN host list actually used as `src`. Orthogonal to rendering mode. Cuts Image Optimization Transformations (Kitletics was ~65% of account transform $ in the Sep 1–17 audit).

**Risk:** low–medium (a missed host 404s an image). Inventory hosts before tightening. **Priority: P1.**

### 10. Anything else — WARN / INFO / `/go`

| Item | Architecture | Priority |
|---|---|---|
| `SpeedInsights` unsampled on root layout | Observability sampling (`sampleRate`), not a route | **P2** |
| Web Analytics mounted | **Keep** (INFO) | n/a |
| `/go/[offerId]` | **F** — already `force-dynamic` + `no-store`; robots Disallow `/go/` | do not touch |
| `/admin`, `/preview` | **F** | do not touch |
| PDP + commerce API | already **A** | do not touch |

---

## Master FAIL table

Legend: Y/N for booleans. Rendering mode is what the route does **today**.

| ROUTE / FILE | AUDIT RULE | CURRENT RENDERING MODE | WHY DYNAMIC | force-dynamic? | cookies()? | searchParams? | no-store? | full catalog/data graph? | REGION DEPENDENT? | SEO INDEXABLE? | EXPECTED TRAFFIC | RECOMMENDED ARCHITECTURE | RISK | PRIORITY |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `/[sport]/[segment]/[listing]` `src/app/[sport]/[segment]/[listing]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | Explicit `dynamic = "force-dynamic"` (comment: skip SSG) | Y | N on this rule | Y (`generateMetadata` + page) | N | Category slice via `getUseCaseListingPageData` / catalog query | Prices, `maxPrice`, price sort | Y if query empty; noindex if any query | High (running use-cases) | D + A (ISR NL shell; client facets; price overlay) | Medium | P0 |
| `/[sport]/[segment]/[listing]` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` → `cookies()` | Y | Y | Y | N | Same | Commerce only (not SEO/editorial) | Same | High | A overlay after B/D shell | Medium | P0 |
| `/[sport]/[segment]` `src/app/[sport]/[segment]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | Explicit force-dynamic + taxonomy `generateStaticParams` discarded | Y | N on this rule | Y | N | Category or discipline product list; running shoes extra finder teaser | Prices on running-shoes + mockup hubs; other categories already NL-default | Y clean URL; noindex with query | High (esp. `/running/shoes`, padel categories) | D + A; B for discipline/category HTML | Medium | P0 |
| `/[sport]/[segment]` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` on mockup discipline hubs **and** `/running/shoes` only — still dynamizes the **whole** route | Y | Y | Y | N | Same | Cookies **only** for hub/card prices + running-shoes From-price/budget teaser | Same | High | Remove RSC cookies; A overlay | Medium | P0 |
| `/best/[slug]` `src/app/best/[slug]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + `generateStaticParams(getBestGuides())` | Y | N on this rule | N | N | Guide recs + per-SKU offers (not full catalog) | Offers/prices only; rec **order** editorial | Y (launch-eligible) | High crawler / medium user | A | Medium | P0 |
| `/best/[slug]` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` passed into `getBestGuidePageData` | Y | Y | N | N | Same | Commerce only | Y | High crawler | A (do not re-SSR guide) | Medium | P0 |
| `/brands/[slug]` `src/app/brands/[slug]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + `generateStaticParams(getBrands())` | Y | N on this rule | N | N | Brand product set (can be large) | Card prices / offer counts | Y if `isBrandHubIndexable` | Medium–high crawler | A | Medium | P0 |
| `/brands/[slug]` same file | `cookies-public-rsc` | force-dynamic SSR | dynamic import `getRequestRegion()`; metadata already NL | Y | Y | N | N | Hub built **twice** (metadata NL + page regional) | Commerce only | Same | Medium–high | A; stop double assemble | Medium | P0 |
| `/gear` `src/app/gear/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic | Y | N on this rule | Y (always) | N | **Hub-wide** sports/categories/brands/counts | `maxPrice` + From-prices on picks | Y at `/gear`; query is UX | Medium | D + A | Medium | P1 |
| `/gear` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` + `getGearHubData({ region, filters })` | Y | Y | Y | N | Same | Commerce + price filter; editorial pick *slots* are config | Same | Medium | ISR NL hub; client filters | Medium | P1 |
| `/products/[slug]/alternatives` `src/app/products/[slug]/alternatives/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic **only** (no cookies). `generateStaticParams(getProducts())` ≈ **918** | Y | **N** | N | N | Relationship graph + eligibility table | Prices already NL (`DEFAULT_REGION`) | Y if launch-eligible | High crawler (sitemap per SKU) | **B** (ISR like PDP). Optional A later | Low | P0 |
| `/reviews/[slug]` `src/app/reviews/[slug]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + `generateStaticParams(getReviews())` | Y | N on this rule | N | N | `getProductGraph` + heavy review body | Offers/prices/JSON-LD currency | Y if launch-eligible | **Highest** per-URL (HTML + images) | A (reuse product commerce API) | Medium | P0 |
| `/reviews/[slug]` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` → `getReviewPageData({ region })` | Y | Y | N | N | Same | Commerce only | Y | Highest per-URL | A | Medium | P0 |
| `/search` `src/app/search/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + unbounded `q` | Y | N on this rule | Y | N | Search index up to 5000 hits | Price facets / min-max | Page noindex; **robots still allow crawl** | Medium user; crawler if allowed | **E** (shell + API or stay dynamic). Never ISR `q` | Low | P1 |
| `/search` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` for price matching | Y | Y | Y | N | Same | Cookies only for price facets | noindex | Medium | Client region + API | Low | P1 |
| `/tools/[slug]` `src/app/tools/[slug]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic; finders `notFound()` here (middleware rewrite) | Y | N on this rule | Y (calculators, `build`) | N | Tool/calculator only | **No** (region unused) | Y; `?build=` noindex | Medium SEO landings | **B + D** | Low | P1 |
| `/tools/[slug]` same file | `cookies-public-rsc` | force-dynamic SSR | **`await getRequestRegion()` unused** | Y | Y | Y | N | None for region | Cookies do **nothing** | Same | Medium | Delete cookies(); ISR landing | Low | P1 |
| `/tools/[slug]/results` `src/app/tools/[slug]/results/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + share `s` | Y | N on this rule | Y (`s`) | N | Finder/rotation product universe | Match ranking + prices | **noindex** | Low–medium user | **E** (keep request/API; do not ISR `s`) | Low | P2 |
| `/tools/[slug]/results` same file | `cookies-public-rsc` | force-dynamic SSR | `getRequestRegion()` for priced matches | Y | Y | Y | N | Same | Results **are** region-dependent | noindex | Low–medium | E; region on API or client | Low | P2 |
| `/tools/finder/[slug]` `src/app/tools/finder/[slug]/page.tsx` | `force-dynamic-public` | force-dynamic SSR | force-dynamic + 16 `generateStaticParams` | Y | N on this rule | Y (`s`/`edit`) | N | Finder definition + optional share decode | Budget **labels** only on landing | Y (`/tools/<slug>`) | Medium SEO | **B + D** | Medium (URL rewrite) | P1 |
| `/tools/finder/[slug]` same file | `cookies-public-rsc` | force-dynamic SSR | `getFinderDefinition(slug, region)` | Y | Y | Y | N | Same | Currency labels, not product set | Y | Medium | ISR NL labels; client relabel | Medium | P1 |
| `src/middleware.ts` `/images/:path*` | `middleware-images` | Edge middleware on image origin | Matcher **re-includes** `/images` after skipping `/_next/image` | n/a | n/a | n/a | n/a | n/a | n/a | n/a | **Very high** (optimizer source fetch) | **E** remove matcher; keep rewrite or Blob `src` | Low | P1 |
| `next.config.ts` `hostname: "**"` | `image-remote-wildcard` | Image Optimization allow-all HTTPS | Any remote URL can be transformed | n/a | n/a | n/a | n/a | n/a | n/a | n/a | High transform volume | **E** Blob + known CDNs only | Low–medium | P1 |

WARN / INFO (not FAILs, discovered):

| ROUTE / FILE | AUDIT RULE | CURRENT RENDERING MODE | WHY DYNAMIC | force-dynamic? | cookies()? | searchParams? | no-store? | full catalog/data graph? | REGION DEPENDENT? | SEO INDEXABLE? | EXPECTED TRAFFIC | RECOMMENDED ARCHITECTURE | RISK | PRIORITY |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `src/app/layout.tsx` | `speed-insights-unsampled` WARN | Root layout on every HTML | Unsampled SI on image-heavy reviews | N | N | N | N | N | N | n/a | Every page view | sampleRate ~0.1 or rely on GA CWV | Low | P2 |
| `src/app/layout.tsx` | `web-analytics-enabled` INFO | Root layout | Product analytics | N | N | N | N | N | N | n/a | Every page | Keep on production | None | n/a |
| `/go/[offerId]` (not a FAIL) | exempt | force-dynamic 302 | Affiliate hop must not be cached as HTML | Y | N (offer id in path) | N | **Y** | Offer lookup only | Redirect target | robots Disallow `/go/` | Click traffic | **F** | None | leave |

---

## What each family should **not** do

- Do not `generateStaticParams` the full product/review/brand lists while the route is `force-dynamic`.
- Do not ISR `/search?q=*` or `/tools/*/results?s=*`.
- Do not put `cookies()` / `getRequestRegion()` back on canonical RSC to “fix” UK prices.
- Do not SSG 918 alternatives or 373 reviews to “save Fluid” — that is the turbo Build CPU trap. Follow PDP: **on-demand ISR**, empty params.
- Do not call `getProductGraph` / `getBestGuidePageData` / `getBrandHubPageData` from a regional commerce endpoint.
- Do not change `/go`, the working PDP, or the working commerce API to make the other routes pass the audit.

---

REMAINING FAILURES: 23

P0 ROUTE FAMILIES:
- reviews (`/reviews/[slug]`)
- alternatives (`/products/[slug]/alternatives`) — Build CPU + Fluid; no cookies today
- best / buying guides (`/best/[slug]`)
- sport / category / listings (`/[sport]/[segment]`, `/[sport]/[segment]/[listing]`)
- brands (`/brands/[slug]`)

P1 ROUTE FAMILIES:
- finders / calculator landings (`/tools/finder/[slug]`, `/tools/[slug]`)
- search (`/search`)
- gear hub (`/gear`)
- image middleware (`src/middleware.ts`)
- image configuration (`next.config.ts` `hostname: "**"`)

P2 ROUTE FAMILIES:
- finder / rotation results (`/tools/[slug]/results`)
- Speed Insights sampling (`src/app/layout.tsx` WARN)
- optional later: alternatives regional price overlay; listing price-sort overlay polish

ROUTES THAT SHOULD REMAIN DYNAMIC:
- `/go/[offerId]` (F — affiliate 302, `no-store`)
- `/search` query execution (E — unbounded `q`; page may become a static shell, but `q` itself must not be ISR)
- `/tools/[slug]/results` (E — noindex share-state `s`)
- `/admin/*`, `/preview/*` (F)
- invalid regional commerce region (already 400 `no-store`; do not change)

ROUTES SUITABLE FOR PDP PATTERN:
- `/reviews/[slug]` (A — reuse product commerce API by product slug)
- `/best/[slug]` (A — list-of-SKU commerce DTO, not PDP page clone)
- `/brands/[slug]` (A — brand-scoped price map)
- `/products/[slug]/alternatives` (B first; A later if From-prices must localize)
- `/[sport]/[segment]` and listings (A for card prices only, after D shell)
- `/gear` picks/cards (A overlay after D)
- `/tools/finder/[slug]` landing budget labels (light A/client relabel, not full PDP)

ROUTES REQUIRING DIFFERENT ARCHITECTURE:
- `/search` → E (never ISR arbitrary query keys; Disallow in robots)
- `/tools/[slug]` calculators → B + D (cookies unused; inputs are client state)
- `/tools/[slug]/results` → E
- `/[sport]/[segment]` and `/gear` **filters** → D (not A; A is only prices)
- `/running/shoes` facets → D
- image middleware + `hostname: "**"` → E (edge/origin/image optimizer, not HTML ISR)
- Speed Insights → observability sampling, not a rendering-mode change

ESTIMATED FLUID CPU REDUCTION AFTER ALL P0/P1 FIXES:
55–75% of **remaining** Kitletics Fluid Active CPU after the (not yet deployed) PDP ISR is live.

Reasoning: Sep 1–17 COMPUTE-AUDIT attributed Kitletics Fluid to public `force-dynamic` + `cookies()` on catalog HTML, with a 60–80% reduction estimate for that whole class (~$12–20/month slope; $4.53 Fluid in ~6 days). PDP was the largest single SKU class; it is already ISR locally but **not in production**, so this audit still shows 23 FAILs. The leftover sitemap HTML — reviews (~373), alternatives (up to ~918), best (~97), brands, sport/listings, `/gear`, finder landings — is still Node-per-request and still loads catalog modules (~75MB) on Googlebot. Moving those to on-demand ISR (NL) with commerce off the RSC tree is the same mechanism that made PDP cache `s-maxage=86400`. Residual Fluid after P0/P1: `/go`, search (if still SSR), results pages, ISR misses, commerce API misses, and first-compile of empty-`generateStaticParams` routes. Image matcher/wildcard cuts Edge / Origin / Image Optimization, **not** Fluid HTML — do not count those dollars in this Fluid estimate. Confidence: **HIGH** on mechanism, **MEDIUM** on dollars until PDP+P0 ship and a usage week is measured.

RECOMMENDED IMPLEMENTATION ORDER:
1. Alternatives ISR (B) — drop `force-dynamic`, empty `generateStaticParams`, `revalidate=86400`. No commerce work. Fastest Build CPU win. Do not touch PDP.
2. Reviews ISR + product commerce overlay (A) — highest remaining HTML Fluid; reuse existing commerce API.
3. Best guides ISR + list commerce overlay (A).
4. Brands ISR + compact brand price map (A). Stop double `getBrandHubPageData`.
5. Sport / category / listing ISR shells (B) + client filters (D); then card price overlay (A). Special-case `/running/shoes` redirects in the client/entry, not via RSC cookies.
6. Finder + calculator landings: delete unused `getRequestRegion()` on `/tools/[slug]`; ISR landings; client wizard (B/D).
7. `/gear`: ISR NL hub + client filters (D); optional pick-price overlay.
8. Search: `robots.ts` Disallow `/search`; drop RSC cookies; static/ISR empty shell + API or keep dynamic without ISR-on-`q` (E).
9. Remove `/images/:path*` from middleware matcher (keep `next.config` rewrite or Blob `src`).
10. Replace `hostname: "**"` with Blob + known CDNs after a host inventory.
11. Finder/rotation **results**: leave E; optional cacheable results API later (P2).
12. Sample Speed Insights (P2).

SAFE TO BEGIN REMEDIATION: YES

Constraints for any later implementation pass:

- Do not push.
- Do not deploy until the user says **Deploy this now.**
- Do not modify `/go`, `/products/[slug]`, or `/api/products/[slug]/commerce/[region]`.
- Do not mechanically copy the PDP page module onto reviews, best, brands, or listings.
- Validate locally (`npm run validate:local`, `npm run audit:vercel-cost`) per batched family, not via Vercel.
