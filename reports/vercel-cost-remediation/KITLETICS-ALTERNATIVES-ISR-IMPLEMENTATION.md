# Kitletics alternatives ISR implementation

**Date:** 2026-09-21  
**Status:** implemented and verified locally. No push. No deploy.  
**Scope:** `src/app/products/[slug]/alternatives/page.tsx` only (plus a route-contract unit test).  
**Not modified:** `/products/[slug]`, `/api/products/[slug]/commerce/[region]`, `/go/[offerId]`, other route families.

---

## What changed

The alternatives page is now the same **on-demand ISR** contract as the PDP:

| Contract | Before | After |
|---|---|---|
| Rendering | `force-dynamic` SSR every request | ISR `revalidate = 86400` |
| `dynamicParams` | implicit | `true` |
| `generateStaticParams` | `getProducts()` ≈ 918 slugs | `return []` |
| Region | omitted → `DEFAULT_REGION` (NL) | explicit `region: DEFAULT_REGION` |
| Cookies / `getRequestRegion` | none | none (unchanged) |
| Regional commerce island | none | none (out of scope) |

Build output (this run):

```text
├ ● /products/[slug]                                     9.72 kB         125 kB
├ ● /products/[slug]/alternatives                        11.8 kB         123 kB
├ ● /research/[slug]
```

`/products/[slug]/alternatives` is `●` with **zero child paths**. Previously this route listed `[+915 more paths]` (918 generated). Static generation this build: **1136/1136** pages from *other* routes; alternatives contributed **0**.

---

## Dedup of `generateMetadata` + Page

Both previously called `getAlternativesPageData(slug, { isDev: false })` independently.

What we did (narrow, no data-layer rewrite):

1. Wrapped that call in React `cache()` (`getCachedAlternativesPageData`) so metadata and the page share one construction **per request**, matching the PDP slug cache.
2. Left `src/lib/product/get-alternatives-page-data.ts` alone. It already has a module-level `Map` keyed by `slug::dev/prod::region`.

What we left:

- `generateMetadata` still does a cheap `getProductBySlug(slug, { isDev: false })` for Fix 82 launch eligibility / robots. That is **not** the alternatives model. Using `data.product` (`toPublicProduct`) made `isIndexableEligibility` disagree; the catalog entity is required for the existing robots policy.

---

## Dynamic-API sweep (canonical alternatives request path)

| API | `alternatives/page.tsx` | `get-alternatives-page-data.ts` | `components/alternatives/*` | Root layout |
|---|---|---|---|---|
| `force-dynamic` | removed | n/a | n/a | no |
| `cookies()` | no | no | no | no (commented prohibition) |
| `headers()` | no | no | no | no |
| `draftMode()` | no | no | no | no |
| `connection()` | no | no | no | no |
| `unstable_noStore` | no | no | no | no |
| `cache: "no-store"` | no | no | no | no |
| `revalidate = 0` | no | no | no | no |
| `getRequestRegion()` | no | no | no | no |
| `searchParams` | no | n/a | client sort/filter only | n/a |

Root `RegionPreferenceProvider` is client-only and does not dynamize RSC.

---

## Preserved product behavior

Verified on `asics-novablast-6` (has alternatives) via `next start` **after** this production build:

| Surface | Result |
|---|---|
| Canonical | `https://kitletics.com/products/asics-novablast-6/alternatives` |
| Title | `Best Alternatives to ASICS Novablast 6 · Kitletics` |
| Robots | `index, follow` |
| H1 | `Best Alternatives to ASICS Novablast 6` |
| Relationships | `previous-generation`, `more-cushioned`, Novablast 5, Clifton present |
| Decision copy | “Who should switch”, “What you give up” present |
| NL prices | `From €…` on source + alts |
| Affiliate path | `View prices` → `/products/{slug}#offers` (9 links). No `/go/` on this page historically; hops stay on the PDP. |
| JSON-LD | **0** `application/ld+json` blocks. This route never emitted `JsonLdScript`. Unchanged. |

Invalid slug `this-product-does-not-exist-kitletics`: **404**.

Product with no alternatives (`nike-aeroswift-singlet-men`, first catalog hit with `alternatives.length === 0`): **200**, title `Alternatives to Nike AeroSwift Singlet (Men)` (non-indexable metadata shape), canonical set, source “View prices” only.

Thin page (`hydrapak-tube-kit`, 1 alternative): **200**.

`isDev: false` is unchanged on both metadata and page construction.

---

## Tests

`tests/alternatives-isr.test.ts` — route contract (no `force-dynamic`, empty params, `DEFAULT_REGION`, no cookies/headers/draftMode/no-store) plus NL Novablast document and unknown-slug `undefined`.

Existing `tests/alternatives-page.test.ts` unchanged and still passing.

---

## Local validation

`npm run validate:local`

- Lint: **PASS** (0 errors, 42 pre-existing `scripts/tmp` warnings)
- Types: **PASS** (`tsc --noEmit`)
- Tests: **PASS** (99 files / 990 tests)
- Production build: **PASS** (Next.js 15.5.24)

`npm run audit:vercel-cost`

```text
FAIL 22 · WARN 1 · INFO 1
```

`src/app/products/[slug]/alternatives/page.tsx` is **absent** from the FAIL list (was `force-dynamic-public` only). Remaining FAILs are other families (reviews, best, brands, listings, tools, search, images).

---

## Runtime cache (`next start --port 3013`, post-build)

`GET /products/asics-novablast-6/alternatives`

| Request | Status | `x-nextjs-cache` | `Cache-Control` | Body SHA-256 |
|---|---|---|---|---|
| First | 200 | **MISS** | `s-maxage=86400, stale-while-revalidate=31449600` | `a359ef2f…645cd69` |
| Second | 200 | **HIT** | same | identical |

---

## Vercel cost impact (this family only)

| Metric | Direction |
|---|---|
| Build CPU | **LOWER** — stopped enumerating ~918 alternatives at `next build` |
| Fluid CPU | **LOWER** — Googlebot/user HTML is Incremental Cache after first generate, not `force-dynamic` Node |
| Origin Transfer | **NEUTRAL** |
| ISR | **HIGHER** — on-demand Incremental Cache keys per alternatives URL (`revalidate=86400`). Required for the Fluid cut; not unbounded query keys |
| Images | **NEUTRAL** |
| Observability | **NEUTRAL** |

ISR Reads go up only as URLs are actually requested, same pattern as PDP. Do not SSG the catalog to “avoid” that.

DEPLOYMENT REQUIRED: YES (production still has the old force-dynamic alternatives route until a future deploy)  
SAFE TO DEPLOY: YES (local lint / types / tests / production build passed)  
**Not deployed. Not pushed.**

---

ALTERNATIVES ISR VERIFICATION

force-dynamic removed: YES  
server cookies present: NO  
revalidate 86400: YES  
dynamicParams true: YES  
build-time product params: 0  
first request cache: MISS  
second request cache: HIT  
canonical unchanged: PASS  
metadata unchanged: PASS  
JSON-LD unchanged: PASS  
affiliate behavior: PASS  
invalid slug: PASS  

Lint: PASS  
Types: PASS  
Tests: PASS  
Production build: PASS  

Vercel cost audit:  
FAIL: 22  
WARN: 1  
INFO: 1  

ALTERNATIVES FAILS REMAINING: 0  

SAFE TO CONTINUE TO REVIEWS: YES
