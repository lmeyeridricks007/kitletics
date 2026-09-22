# Project → metric → route → code → root cause → optimization

Source: `npx vercel usage --group-by project` for **2026-09-01 to 2026-09-17**, team `leemeyeridricks-3740s-projects`. Plan: **Pro**. Region: `iad1`. Fluid Compute **on** for every project (`resourceConfig.fluid: true`, elastic concurrency). No team contract.

Domains: `kitletics.com`, `www.softwareglimpse.com`, `www.hikingwithlee.com`, `fluentcopilot.com`, `expatcopilot.com`.

No Vercel Cron definitions are deployed on any project.

---

## Account totals (Sep 1–17)

| Metric | Effective $ | Billed $ |
|---|---|---|
| Build CPU Minutes | 21.39 | 21.39 |
| Fluid Active CPU | 16.13 | 13.03 |
| Pro | 9.68 | 9.68 |
| Observability Events | 6.21 | 5.82 |
| Fast Origin Transfer | 6.00 | 5.50 |
| ISR Reads | 2.67 | 2.45 |
| Image Optimization Transformation | 2.64 | 1.23 |
| Fluid Provisioned Memory | 2.44 | 1.95 |
| Blob Data Transfer | 2.20 | 1.67 |
| Image Optimization Cache Writes | 1.50 | 1.15 |
| Edge Requests – Additional CPU | 0.53 | 0.48 |
| Function Invocations | 0.44 | 0.38 |
| Image Optimization Cache Reads | 0.25 | 0.22 |
| Blob Storage Size | 0.18 | 0.17 |
| ISR Writes | 0.16 | 0.15 |
| Web Analytics Events | 0.07 | 0.06 |
| Blob Advanced + Simple ops | 0.07 | 0.07 |
| Fast Data Transfer | 0 | 0 (included) |
| Edge Requests | 0 | 0 (included) |
| Speed Insights Plus | 0 | 0 (Aug had $0.65 events on ExpatCopilot) |
| **Total** | **72.54** | **65.40** |

---

## softwareglimpse — $32.00 effective / $29.82 billed

Production: `https://www.softwareglimpse.com`. Next 16.3. Build machine: **turbo** (`long-build-duration`). Speed Insights configured (no data). Web Analytics on. SSO protection on preview. **No middleware.ts. No vercel.json.**

Sep production deploys: **7** (6 READY, 1 ERROR). Avg build **647s**, max **1218s**.

| Metric | $ | Route / feature | Code | Root cause | Optimization |
|---|---|---|---|---|---|
| Fluid Active CPU | 10.77 | `/software/[slug]/`, tabs, `/guides/[slug]/` | `src/app/(site)/software/[slug]/page.tsx` `draftMode()` in metadata **and** page; same on `[tab]` and guides | Next 15+ dynamic API → every crawler hit is Fluid SSR of `buildSoftwareReviewModel` (twice) | Remove `draftMode()`; `/api/preview` + `/preview/...` only |
| Build CPU | 8.93 | ~13k static pages | `next.config.ts` `staticPageGenerationTimeout: 180`; compare reverse slugs; 9 software tabs | Full SSG on every `main` push; no ignoreCommand | ignoreCommand; stop prerendering reverse compares and noindex tabs |
| Observability Events | 4.12 | Same dynamic HTML + `<Analytics />` | `src/components/site/consent-script.tsx` | One event stream per Fluid invocation × crawlers | Fix rendering first; sample analytics; preview observability off |
| Fast Origin Transfer | 3.34 | Dynamic HTML + Blob media proxy | `next.config.ts` rewrites to `BLOB_PUBLIC_HOST`; many `unoptimized` guide images | AfterFiles rewrite still transits Vercel | Point `src` at Blob public URL |
| ISR Reads | 2.34 | Incremental Cache of the estate + `/search?q=` | `src/app/(site)/search/page.tsx` `revalidate = 3600`; sitemap `revalidate = 86400` | 13k pages × crawlers after deploys; unbounded search keys | Don’t ISR search; emit sitemap at build; fewer deploys |
| Fluid Memory | 1.44 | Same SSR | `buildSoftwareReviewModel` + search index in process | Large working set per invocation | Static pages; don’t SSR the model |
| Edge extra CPU | 0.43 | `trailingSlash` + ~382 legacy redirects | `next.config.ts`, `config/legacy-redirects.json` | 308/301 on slash and legacy | Keep; don’t add middleware |
| Image transforms | 0.30 | Compare/best `next/image` | `next.config.ts` avif+webp | Small vs Kitletics | Standardize widths |
| Function invocations | 0.17 | `/go`, suggest API, remaining dynamic | `src/app/go/...`, `src/app/api/search/suggest/route.ts` | Real | Keep `/go` dynamic |

---

## kitletics — $14.38 effective / $10.35 billed (6 live days)

Production: `https://kitletics.com`. Next 15.5.24. Build machine: **turbo** (`oom-failure`). Web Analytics + Speed Insights **on**. Blob store `kitletics-media` **7.21 GB / 9.8k files / 6 days**. `.vercelignore` excludes `public/images/**`. **No vercel.json.**

Sep deploys: **19** (16 production, 3 preview). Avg build **266s**, max **740s**.

| Metric | $ | Route / feature | Code | Root cause | Optimization |
|---|---|---|---|---|---|
| Build CPU | 5.80 | `next build` of 75MB `src/content` | `package.json` `build`; `generateStaticParams` still walks products/reviews on `force-dynamic` routes | Agent/main deploys; turbo after OOM | ignoreCommand; drop unused `generateStaticParams`; do not SSG all PDPs |
| Fluid Active CPU | 4.53 | PDPs, reviews, best, brands, listings, finders, search | `export const dynamic = "force-dynamic"` + `getRequestRegion()` → `cookies()` in `src/lib/region/server.ts` | Every Googlebot HTML hit is Node | ISR + default region NL (homepage already hardcodes NL) |
| Image transforms | 1.70 | `/_next/image` for catalog + 8.7k review section PNGs | `next.config.ts` 6+10 widths, qualities 65/70/75, avif+webp, `hostname: "**"` | First-crawl fill × many sources | Shared sizes already exist; drop unused widths; no wildcard remotes; stable URLs |
| Fluid Memory | 0.82 | Same dynamic routes | `src/repositories/products.ts` module-init catalog | 75MB graph in the function | ISR so this runs on revalidate, not every request |
| Image cache writes | 0.62 | Optimizer cache | Same | Cold cache after deploys | Fewer deploys; 30d TTL already set (`60*60*24*30`) |
| Observability | 0.44 | Every HTML + SI | `src/app/layout.tsx` `<Analytics />` `<SpeedInsights />` | Unsampled | `sampleRate` on SI |
| Origin transfer | 0.28 | Dynamic HTML + optimizer origin fetch | Middleware rewrite `/images` → Blob | Extra hop | Config rewrite or absolute Blob URL; matcher without `/images` |
| Function invocations | 0.09 | Dynamic routes + `/go` | `src/app/go/[offerId]/route.ts` | Follows Fluid | ISR cuts this |

Unattributed **Blob Data Transfer $2.20** and **Blob size $0.18** are this store.

---

## lifeos-expatlife-web — $6.38 / $6.30

App: `expatos/apps/expatlife-web` (GitHub `lifeos`). Next 13.5.7. Speed Insights **hasData**. Web Analytics on. Crons enabled but **definitions: []**.

Sep deploys: **8** production (4 ERROR, 4 READY). Avg build 278s. August builds averaged **950s**.

| Metric | $ | Route / feature | Code | Root cause | Optimization |
|---|---|---|---|---|---|
| Build CPU | 4.51 | 386 pages + country matrix | No `vercel.json` / ignoreCommand (`VERCEL.md`) | Failed + successful rebuilds | ignoreCommand; fix typecheck locally |
| Observability | 0.47 | Always-on Vercel Analytics | `app/AppClientShell.tsx` (outside cookie consent) | Every page view | Gate on consent; PostHog/GA already exist |
| Image cache writes | 0.38 | Logos/favicons + some heroes | `next.config.js` remote Clearbit/Google/Cloudinary | Third-party favicon optimization | `unoptimized` for 16px favicons |
| Fluid CPU | 0.37 | Origin hub + hourly ISR | `CONTENT_REVALIDATE = 3600` in `lib/content-revalidate.ts` (**381** files); `force-dynamic` + `headers()` on `netherlands/moving-to-netherlands-from` | 1h TTL on static guides | `86400` or `false`; keep hub filters client-side |
| Image transforms | 0.17 | Same | 2,431 files / 1.5 GB `public/images` | Modest | Keep local heroes unoptimized (already common) |

August **Speed Insights Plus Events $0.65** — paid SI SKU. Sep billed $0; confirm the Plus add-on stays off.

---

## hikingwithlee — $6.02 / $5.81

Production: `https://www.hikingwithlee.com`. Next 16.3. Build machine: **enhanced** (`short-build-duration`). Web Analytics on. Speed Insights configured, no data.

Sep deploys: **12** production (8 READY, 4 ERROR). Avg 173s. Commit noise: seven “vercel fix” messages.

| Metric | $ | Route / feature | Code | Root cause | Optimization |
|---|---|---|---|---|---|
| Build CPU | 2.16 | 98 pages + 308 MDX | `vercel.json` redirects only; no ignoreCommand | Rebuilds + errors | ignoreCommand |
| Observability | 1.18 | Web Analytics + invocation logs | `components/consent/cookie-consent.tsx` | High vs traffic | Dashboard: drop Observability Plus extras; keep GA |
| Origin transfer | 0.55 | Optimizer fetches 396 MB originals | `components/ui/public-image.tsx` | Local `next/image` | Fewer widths |
| Fluid CPU | 0.46 | Middleware on all HTML + 8 `searchParams` tool pages | `middleware.ts` matcher catch-all | Edge + a few dynamic tools | Narrow matcher; client `searchParams` |
| Image transforms | 0.46 | 882 files, avif+webp, 640 in both size lists | `next.config.ts` | Duplicate 640 | Deduplicate sizes |
| ISR reads | 0.26 | Amazon price fetch `revalidate: 86400` | `lib/affiliate/indicative-price.ts` | Fine | Keep |

---

## fluentcopilot — $0.00

`https://fluentcopilot.com`. Next 15. Last production activity June 2026. No middleware. No Vercel Analytics. Entire `/app` + `/admin` trees `force-dynamic` (correct for an authenticated app). **Do not add Speed Insights.** Backend is Azure Functions, not Vercel.

---

## architecture-intelligence-prototype — ~$0

Idle. Speed Insights + Web Analytics configured with **hasData: false**. Disable both in the dashboard. Local cousin: `Nexitect`.

---

## Pattern: 80/20

1. **SoftwareGlimpse dynamic-by-`draftMode()` crawl surface** — Fluid + origin + observability.  
2. **Production builds on every commit** — all four live sites.  
3. **Kitletics `force-dynamic` + image optimizer × Blob** — small MTD, largest *slope*.
