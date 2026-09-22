# Kitletics PDP ISR design

**Date:** 2026-09-21  
**Scope:** runtime analysis of `src/app/products/[slug]/page.tsx` only. No code was changed.  
**Worked example:** `GET /products/asics-novablast-6` (ASICS Novablast 6, `prod-novablast-6`, published running-shoe SKU).

This page is a public sitemap URL. Today it is **request-time Fluid SSR** for every hit, including Googlebot. The root layout and site header already avoid `cookies()`. The dynamism is isolated to this page module.

---

## Request trace (`asics-novablast-6`)

```text
REQUEST   GET https://kitletics.com/products/asics-novablast-6
          Cookie: kitletics_region=UK   (or absent)
            │
            ▼
MIDDLEWARE  src/middleware.ts
            www → apex 308 if needed
            else NextResponse.next()
            (no region logic; /images Blob rewrite does not apply)
            │
            ▼
ROUTE       App Router
            src/app/products/[slug]/page.tsx
            params.slug = "asics-novablast-6"
            │
            ├─ generateMetadata (separate RSC pass)
            │    getProductBySlug("asics-novablast-6")
            │    getLaunchEligibility({ kind: "product" })
            │    productMetadata(product) + withLaunchRobots
            │    ⚠ does not call getRequestRegion / getProductPageData
            │
            ▼
RENDERING   export const dynamic = "force-dynamic"
MODE        Next 15: fully dynamic page
            no Incremental Cache
            every request = Fluid Active CPU + provisioned memory
            │
            ▼
REGION      await getRequestRegion()
            cookies() → kitletics_region
            resolveUserRegion({ explicit: undefined, cookie })
            → "UK" if cookie is a valid RegionCode
            → "NL" if cookie missing / invalid (DEFAULT_REGION)
            never IP / Accept-Language
            │
            ▼
DATA LOAD   Module init (once per Node isolate, paid on cold start
            of this Fluid invocation):
              entire `src/content/products` graph
              brands, families, offers + pricing overlay
              reviews, guides, tools, FAQs
              recommendations, evidence, relationships
              padel generated PDP editorial stores
            Then per request:
              getProductBySlug (page)        — linear find on ~1113 products
              getLaunchEligibility
              enforceLaunchEligibility       — 404 if not publicly renderable
              getProductPageData(slug, { region })
                getProductBySlug again
                getProductGraph(product.id, { region })
                regional offers, alternatives, review, specs, decision copy
            │
            ▼
PRODUCT     ProductPageData for Novablast 6
MODEL       product / brand / specs / gallery / buy-if / review
            offers = NL|UK|… slice for `region`
            lowestPrice = getLowestOfferPrice(id, region)
            offersOtherRegions = remaining markets
            │
            ▼
METADATA    <title> from product.seoTitle / fullName template
            description from seoDescription / verdict / shortDescription
            canonical https://kitletics.com/products/asics-novablast-6
            robots from launch eligibility
            ⚠ not region-aware today
            │
            ▼
STRUCTURED  <JsonLdScript> in ProductDetailPage
DATA          BreadcrumbList
              Product + Offer[]  ← regional, 72h-fresh offers only
              Review             ← editorial, not regional
              FAQPage            ← editorial, not regional
            │
            ▼
HTML        ProductDetailPage
            H1 = product.name ("Novablast 6")
            intro = shortDescription
            score, specs, review, alternatives = catalog/editorial
            hero “From {price}”, sticky buy, #offers panel = region
            affiliate CTAs = /go/{offerId}?placement=product-offers
```

Googlebot typically has **no** `kitletics_region` cookie, so production crawls already see **NL** commerce. Cookie-bearing humans are the only cohort that currently get a different HTML/JSON-LD offer set.

---

## Answers

### 1. Where is `force-dynamic` configured?

In the page module itself:

```19:20:src/app/products/[slug]/page.tsx
/** Request-time / heavy catalog pages — skip SSG to keep builds healthy. */
export const dynamic = "force-dynamic";
```

There is no `revalidate` export. The comment is the original reason: avoid SSG of the full catalog at build. It does **not** opt the page into ISR; it opts it out of the Incremental Cache entirely.

### 2. Where does `cookies()` enter the request path?

Only through region resolution on the **page** (not metadata, not root layout):

```49:53:src/app/products/[slug]/page.tsx
  const region = await getRequestRegion();
  const data = getProductPageData(slug, {
    region,
    isDev: process.env.NODE_ENV !== "production",
  });
```

```9:16:src/lib/region/server.ts
export async function getRequestRegion(
  explicit?: string | null,
): Promise<RegionCode> {
  const jar = await cookies();
  return resolveUserRegion({
    explicit,
    cookie: jar.get(REGION_COOKIE)?.value ?? null,
  });
}
```

`REGION_COOKIE` is `kitletics_region` (`src/lib/region/resolve.ts`).

The PDP does not pass an explicit region. Root `src/app/layout.tsx` deliberately does not call `cookies()` / `headers()`. `SiteHeader` uses a hardcoded NL default and lets `RegionSelector` (client) read the cookie in `useEffect`. Changing region writes the cookie and **reloads the page**, which is why the server cookie read currently matters.

### 3. What exactly does `getRequestRegion()` return?

A `RegionCode`: `"NL" | "DE" | "FR" | "BE" | "UK" | "US" | "ZA"`.

Precedence (`resolveUserRegion`):

1. Explicit argument (unused on this page).
2. Cookie `kitletics_region` if it is a valid code.
3. Else `DEFAULT_REGION` = `"NL"`.

It never infers country from IP or `Accept-Language`. Invalid cookies fall through to NL.

For the example:

| Visitor | Cookie | Return |
|---|---|---|
| Googlebot / first-time NL shopper | none | `"NL"` |
| Shopper who selected United Kingdom | `kitletics_region=UK` | `"UK"` |
| Garbage cookie | `kitletics_region=XX` | `"NL"` |

### 4. Which parts of the resulting page differ by region?

Only **commerce surfaces** that consume `data.region`, `data.offers`, `data.lowestPrice`, `data.offersOtherRegions`, and `data.regionLabel`:

- Hero / sticky “From {price} {currency}”
- “View prices (N)” count
- Empty-state copy: “No verified retailer offers currently available in your region”
- `#offers` / Where-to-buy panel (retailer rows, availability badges, `/go/{offerId}` hrefs)
- “Showing offers for {Netherlands|United Kingdom|…}”
- Cross-region offer disclosure (`offersOtherRegions`)
- Alternative / compare-rail **From-prices** (`getLowestOfferPrice(alt.id, data.region)` inside `ProductDetailPage`)
- `Product` JSON-LD `offers[]` (price, currency, availability, retailer URL)

Editorial identity, specs, review body, H1, title, and canonical do not branch on region.

The header region chip is also cookie-aware, but that is **client hydration** with `initialRegion = "NL"`, not this page’s RSC.

### 5. Does region affect each field?

| Surface | Affected by region today? |
|---|---|
| Title (`generateMetadata`) | **No** |
| H1 (`product.name`, e.g. “Novablast 6”) | **No** |
| Product description (`shortDescription` / verdict) | **No** |
| Review / editorial content | **No** (review JSON-LD and PDP review block are catalog copy) |
| Specifications | **No** |
| Canonical | **No** — always `https://kitletics.com/products/asics-novablast-6` |
| Metadata (OG/Twitter/robots) | **No** (robots come from launch eligibility, not region) |
| JSON-LD Product `name` / `description` / `url` | **No** |
| JSON-LD Product `offers` | **Yes** — only the request region’s fresh offers |
| JSON-LD Review / FAQ / breadcrumbs | **No** |
| Retailer list | **Yes** |
| Price | **Yes** (`lowestPrice` + per-offer prices) |
| Currency | **Yes** (NL/DE/FR/BE EUR, UK GBP, US USD, ZA ZAR) |
| Availability | **Yes** (regional offer rows; schema only if in-stock/low-stock/preorder and ≤72h) |
| Affiliate link | **Yes** — `/go/{regionalOfferId}`; `/go` stays dynamic and attaches tags at click time |

NL is already the **primary commerce region** (`src/lib/region/commerce-readiness.ts`). DE/UK are partial; US/FR limited; BE/ZA none.

### 6. What catalog/data files are loaded to render ONE PDP?

There is no per-SKU module. Importing the page pulls the **in-memory content graph**.

**Always initialized with the Node isolate** (via `@/repositories` → content barrels):

| Area | Principal files |
|---|---|
| Products | `src/content/products.ts` plus running waves (`shoes-wave2.ts` holds Novablast 6), padel/racket/fitness barrels, spec-fill, audience variants, launch-ready enrichers |
| Brands / families | `src/content/brands.ts`, `src/content/families.ts` |
| Commerce | `src/content/offers.ts`, `offers-nl-backfill.ts`, `offers-pricing-refresh.ts`, `offers-affiliate-urls.ts`, `offers-url-validation.ts`, `affiliate-programs.ts`, `retailers.ts` |
| Editorial | `src/content/reviews.ts`, `faqs.ts`, `authors.ts`, `src/content/editorial` (best/buying/comparisons/setups), `src/content/tools.ts` |
| Graph | `src/content/recommendations.ts` (+ vertical rec files), `src/content/evidence.ts`, `src/content/running/relationships.ts` |
| Padel extras (imported by `getProductPageData` even for a running SKU) | `src/content/padel/rackets`, `src/content/padel/pdp-editorial/store.generated.ts` |
| Specs / media | `src/content/specs/definitions.ts`, `src/content/running/media.ts` |

**Then filtered in memory for this SKU:** product row, brand ASICS, category running-shoes, Novablast family, NL/UK/… offers, review `asics-novablast-6`, recs/evidence/alternatives, FAQs, related guides/tools.

`SiteHeader` (layout) additionally scans sports, categories, featured-category product counts, guides, reviews, and tools. Layout itself is not `force-dynamic`; the page is.

### 7. Does rendering one PDP load the entire product catalog?

**Yes, at module-init.** `getProductBySlug` is `items.find(i => i.slug === slug)` over the published product array (~1113 rows after gates). It does not read a single-SKU file from disk.

So one Novablast 6 request:

1. Loads / evaluates the full catalog TypeScript graph into the Fluid isolate (cold start).
2. Looks up one slug (and several related IDs) with linear scans.
3. Discards the rest for the HTML payload, but still paid the RSS and init cost.

`generateStaticParams` also maps **every** published product slug at **build**, even though `force-dynamic` means those params are not used to emit static HTML.

### 8. Does `generateMetadata` repeat expensive product-data work?

It does **not** call `getProductPageData`. That is better than the review/best routes.

It **does** repeat:

- Catalog module init (shared with the page in the same isolate).
- `getProductBySlug(slug)` — page then calls it again; `getProductPageData` calls it a third time.
- `getLaunchEligibility` — page calls it again.

It does **not** repeat offer ranking, review enrichment, padel editorial, decision-copy, gallery, or JSON-LD.

Guardrail (`docs/VERCEL-COST-GUARDRAILS.md` §2.2): metadata must not rebuild the same expensive model. This PDP is already split. Remaining waste is duplicate slug lookups, not a second full page model. `React.cache` around `getProductBySlug` / a future `getProductPageData` would collapse the lookups; ISR would make the duplication cheap because it would run on revalidate, not on every crawler hit.

### 9. What does `generateStaticParams` currently do?

```25:27:src/app/products/[slug]/page.tsx
export async function generateStaticParams() {
  return getProducts().map((p) => ({ slug: p.slug }));
}
```

`getProducts()` = published + not `noindex`. At production build this walks the full catalog and returns ~thousands of `{ slug }` objects (Novablast 6 included). Combined with `force-dynamic`, Next still pays that catalog load at build **without** producing static HTML for those slugs.

### 10. Is `generateStaticParams` useful given that the route is `force-dynamic`?

**No.** It is negative value:

- Does not cache HTML (page is force-dynamic).
- Adds Build CPU (catalog walk + param serialization).
- Violates the in-repo rule: `generateStaticParams` + `force-dynamic` is forbidden.

For the ISR target (cache on first request, do **not** prebuild every SKU), `generateStaticParams` should return **`[]`** or be removed. A tiny allowlist of hero SKUs is optional, not required.

### 11. What does `dynamicParams` currently do?

**Unset.** Next default is `dynamicParams = true`.

Unknown URLs such as `/products/not-a-real-shoe` still invoke the Node page, run catalog lookup, then `notFound()`. That is Fluid CPU for crawler junk.

After an ISR pilot:

- Keep `dynamicParams = true` if new SKUs must be generated on first request without a full rebuild (matches “do not prebuild every product”).
- Only set `dynamicParams = false` if `generateStaticParams` is a **closed** published-slug list and unknown slugs should 404 at the edge. That is the opposite of on-demand ISR.

For this design: **true** + empty params + ISR.

### 12. Which parts could safely be cached?

Safe to put in **one canonical ISR HTML** (default region NL), TTL ≥ 86400:

- Title, H1, short description, verdict, buy/skip, score
- Specs, gallery, breadcrumbs
- Review / FAQ / evidence / related guides / tools
- Family, alternatives **identity** (names, slugs, reasons)
- Canonical, OG, robots
- JSON-LD Breadcrumb / Review / FAQ
- JSON-LD Product identity; **NL** offers as the canonical Offer set (matches Googlebot today)
- Layout / header chrome (already NL-default)

Also safe to cache the **server product model** behind `unstable_cache` / `"use cache"` keyed by `slug` (not by cookie), even before full ISR, if a transitional split is needed.

Do **not** ISR-key on `kitletics_region` or `?region=`. That creates an unbounded Incremental Cache keyspace (ISR Reads) for seven regions × every slug, and it teaches Google mixed Offer schema on one URL.

### 13. Which parts genuinely need to be region/user-specific?

Only shopping UX after the user has chosen a region:

- Displayed From-price and currency
- Retailer rows and availability for that market
- Which `/go/{offerId}` buttons are shown
- “Showing offers for {region}” copy
- Alternative-card prices
- Region selector selected state (already client)

Affiliate **tag attachment** must stay on `/go/[offerId]` (`force-dynamic`, `Cache-Control: no-store`). Cached HTML should keep linking to `/go/{offerId}`; it must not bake tracking query params into the page.

Consent / analytics cookies stay client-side (layout already does this).

---

## Proposed architecture (no implementation)

Goal: canonical PDP uses **ISR without prebuilding every product**. Region commerce is isolated from SEO HTML.

```text
FIRST REQUEST / REVALIDATION  (no cookie in the cache key)
  getProductPageData(slug, { region: "NL" })
  generate canonical HTML + JSON-LD (NL offers)
  store Incremental Cache for /products/asics-novablast-6
  TTL revalidate = 86400 (or revalidateTag on catalog publish)

SUBSEQUENT REQUESTS  (Googlebot, humans, any cookie)
  serve cached HTML
  NO full Node product render

CLIENT ISLAND  (after paint)
  read kitletics_region
  if region === NL → keep server HTML commerce
  if region !== NL → GET /api/…/product-offers?slug=asics-novablast-6&region=UK
  replace hero price + #offers + alt prices
  do not rewrite JSON-LD or <title>
```

### Page contract (pilot)

On `src/app/products/[slug]/page.tsx` only:

| Today | Pilot |
|---|---|
| `dynamic = "force-dynamic"` | **remove** |
| no `revalidate` | `export const revalidate = 86400` |
| `generateStaticParams` → all slugs | **return `[]`** (on-demand ISR) |
| `dynamicParams` default true | **keep true** |
| `await getRequestRegion()` | **delete**; pass `DEFAULT_REGION` (`"NL"`) into `getProductPageData` |
| `cookies()` on this route | **gone** |

Do not SSG the estate. First crawl of Novablast 6 generates and caches that one path. A new SKU works the same on first hit. Build CPU no longer walks every slug for this route.

### Cache key

One key: pathname `/products/[slug]`.  
No cookie vary. No `?region=`.

### Commerce island

Extract the already-localized bits:

- Hero / sticky From-price
- `#offers` `OfferPanel`
- Alternative-card prices

Server HTML is the NL fallback (primary market + Googlebot). The island hydrates from `kitletics_region`. `RegionSelector` must **not** rely on a full reload to get new RSC HTML (reload would just replay the NL ISR document). Updating the island from the cookie is enough; reload can be removed later.

Keep `/go/[offerId]` dynamic. Island buttons stay `/go/{id}?placement=product-offers`.

Optional: a small GET handler that returns `{ lowestPrice, offers[] }` for one slug + region, with `s-maxage` ≥ 3600, `noindex`. Do not ISR arbitrary query strings on the HTML route.

### Metadata

Leave `generateMetadata` on `getProductBySlug` + `productMetadata`. It is already region-free. Optionally wrap slug lookup in `React.cache` so metadata and page share one find.

Do not add `cookies()` to metadata.

### JSON-LD

Keep **NL** `Offer` nodes in the cached document. That is what Googlebot already stores. Do not emit cookie-varying schema. Do not strip offers (rich-result regression). The island must not mutate JSON-LD.

### What not to do in the pilot

- Do not `generateStaticParams` for all SKUs “to make ISR faster.” That is the turbo-build failure mode.
- Do not `dynamicParams = false` until params are a closed allowlist **and** on-demand generation is explicitly abandoned.
- Do not put `getRequestRegion()` behind `unstable_cache` — the cookie would still dynamize the page.
- Do not change `/reviews/[slug]`, `/best/[slug]`, or `/products/[slug]/alternatives` in the same PR; copy the pattern after the PDP pilot proves cache hits.
- Do not geo-infer region.

### Verification (when implemented)

1. `curl -sI https://kitletics.com/products/asics-novablast-6` — no `force-dynamic` path; HTML stable without cookie.
2. Same URL with `Cookie: kitletics_region=UK` — **identical** cached HTML (title, H1, JSON-LD). Island may then swap prices in the browser.
3. `generateMetadata` title still `ASICS Novablast 6: …` either way.
4. Unknown slug still 404 after one Node miss (on-demand), not a static hole.
5. Production `next build` no longer lists thousands of PDP paths as SSG from this route.
6. `npm run audit:vercel-cost` — this file drops `force-dynamic-public` / `cookies-public-rsc` for the PDP.

### Cost effect (expected, not measured here)

| Metric | Direction | Why |
|---|---|---|
| Fluid Active CPU | Lower | Googlebot HTML is cache, not Node catalog render |
| Fluid memory | Lower | isolate not entered on cache hit |
| ISR Reads / Writes | Higher (small) | one key per slug per day, not per request |
| Build CPU | Lower | stop `generateStaticParams` catalog walk on this route |
| Origin Transfer | Lower | fewer origin HTML payloads |

---

## Risks

**SEO.** Canonical URL, H1, title, review, and specs already ignore region. Googlebot already sees NL offers. Caching that document is a **behavior-preserving** change for crawlers, not a new localization scheme. Residual risk: if the island hides NL prices before hydrate, or if JSON-LD is stripped, rich results suffer. Mitigation: NL offers stay in server HTML + schema.

**Region UX.** UK/US users currently get **server-rendered** local prices after reload. After ISR they get NL HTML first, then an island. Possible one-frame NL price flash; BE/ZA already see empty local offers. Mitigation: island fetch on hydrate; keep NL as honest default (primary coverage). Do not invent BE/ZA prices.

**Correctness.** Seed offer freshness is still the 72h window (`SEED_DATES.verified` / `shouldDisplayNumericPrice`). ISR TTL of 24h can serve a From-price that became aging mid-day. Acceptable if the island/API uses the same display gate, or if offers are revalidated with `revalidateTag("offers")` on pricing refresh. Do not drop TTL below 86400 on the HTML route to chase prices.

---

SAFE TO IMPLEMENT PDP ISR PILOT: YES  
SEO RISK: LOW  
REGION RISK: MEDIUM
