# Vercel cost guardrails

Engineering standard for Kitletics, SoftwareGlimpse, HikingWithLee, ExpatCopilot (`lifeos-expatlife-web`), FluentCopilot, and any other personal Vercel project on the `leemeyeridricks-3740s-projects` team.

**Goal:** lowest sensible Vercel bill without harming SEO, Core Web Vitals, UX, reliability, or maintainability.

These rules are testable. Prefer `npm run audit:vercel-cost` (Kitletics) or the same script pointed at `--root` of another repo.

Related audit: `reports/vercel-cost-audit/`.

---

## 1. Static vs dynamic rendering

1. Public catalog, review, guide, trek, and software-profile pages **must** be `STATIC` or `ISR`. They must not export `dynamic = "force-dynamic"` unless an ADR in the repo explains why request-time freshness is required.
2. `cookies()`, `headers()`, `draftMode()`, `connection()`, and `unstable_noStore()` must not appear in public App Router pages, layouts, or `generateMetadata`. Dedicated `/preview`, `/admin`, `/app` (authenticated), and `/go` routes are exempt.
3. Awaiting `searchParams` on a sitemap’d index page is forbidden. Filter state belongs in a client island (`useSearchParams`) after a static shell.
4. `generateStaticParams` plus `force-dynamic` is forbidden. If the page is dynamic, do not pay catalog-load cost at build for params that will be ignored.
5. `dynamicParams` on closed catalog `[slug]` routes should be `false` once `generateStaticParams` is complete, so unknown crawler URLs 404 at the edge instead of invoking Fluid compute.

**Test:** `audit:vercel-cost` rules `force-dynamic-public`, `draft-mode-public`, `cookies-public-rsc`.

---

## 2. Server Functions / CPU

1. Public HTML must not load the full in-memory catalog, search index, or review JSON on every request. Use build-time data, `unstable_cache` / `"use cache"`, or per-slug modules.
2. `generateMetadata` must not re-run the same expensive model builder as the page. Share one `React.cache`’d result, or make the page static so it only runs at build.
3. Server Actions that scan the full catalog (`search`, finder, compare-build) must be rate-limited and must not be the HTML rendering path for Googlebot.
4. `maxDuration` defaults stay at the platform default. Do not raise function timeout to “make a slow page work” — that is a Fluid CPU multiplier.
5. Do not enable extra Fluid memory (`functionDefaultMemoryType` beyond `standard`) without measuring RSS. Kitletics already OOM’d **builds** (turbo machine); that is not a reason to raise **runtime** memory.

---

## 3. Caching / ISR

1. Public catalog data must not use `cache: "no-store"` without an ADR explaining why request-time freshness is required.
2. Time-based `revalidate` on public content **must be ≥ 86400** (24h) unless the page shows data that actually changes more often than daily (prices may use a small client island or a tagged cache).
3. Unbounded query strings (`/search?q=*`, compare builders) must **not** use ISR. ISR of arbitrary `q` values creates an unbounded Incremental Cache keyspace (ISR Reads).
4. Prefer `revalidateTag` / `revalidatePath` on content publish over short TTLs.
5. After a production deploy, assume Incremental Cache and Image Optimization cache are cold. Do not deploy production on every agent commit.

**Test:** rules `no-store-public`, `short-revalidate`, `revalidate-zero`.

---

## 4. Images

1. Do not disable `next/image` globally.
2. `images.remotePatterns` must list explicit hosts (Blob, known CDNs). `hostname: "**"` is forbidden.
3. Qualities must be an allow-list of values actually requested (Kitletics: 65 / 70 / 75). Do not add unused qualities.
4. Do not put the same source width in both `deviceSizes` and `imageSizes`.
5. Target **≤ 8 practical variants per source** (2–4 widths × 1 quality × AVIF+WebP). Theoretical max (`deviceSizes + imageSizes`) × qualities × formats should stay **≤ 24** unless measured otherwise.
6. `minimumCacheTTL` for catalog media must be **≥ 7 days** (prefer 30).
7. Product-card, PDP-hero, and thumb slots must use shared `sizes` + `quality` presets (`src/lib/media/image-delivery.ts` in Kitletics). Ad-hoc `quality={90}` / `sizes="100vw"` on cards is forbidden.
8. Stable source URLs. Query-string cache-busters on image `src` are forbidden in production.
9. When the original already lives on Vercel Blob / a CDN, prefer the Blob public hostname as `src` so optimizer origin fetch does not proxy through the app. Do not Edge-middleware-rewrite every `/images/*` request.

**Test:** rules `image-remote-wildcard`, `image-variant-explosion`, `image-short-cache-ttl`, `middleware-images`.

---

## 5. Middleware / Edge

1. Middleware **must** have a `matcher`.
2. Matcher **must** exclude `_next/static`, `_next/image`, `favicon.ico`, and common static extensions (`js`, `css`, `png`, `jpe?g`, `gif`, `webp`, `avif`, `ico`, `woff2?`, `map`).
3. Matcher must **not** include `/images/:path*` merely to proxy Blob. Use `next.config` `rewrites` or absolute Blob URLs.
4. Do not add middleware to a project that does not need it. SoftwareGlimpse has no middleware today — do not add a catch-all “just in case”.
5. Host canonicalization (www ↔ apex) is allowed on HTML only.

**Test:** rules `middleware-images`, `middleware-unscoped`, `middleware-matcher-broad`.

---

## 6. APIs

1. Affiliate hop routes (`/go/*`) stay dynamic with `Cache-Control: no-store`. They must remain `robots.txt` disallowed.
2. Public JSON/CSV downloads (`research.csv`, sitemap XML) must set `s-maxage` ≥ 3600 and should be `noindex` if they are research artefacts.
3. Search suggest APIs must require a minimum query length and should send `s-maxage`.
4. Do not add Vercel Cron that rebuilds the catalog HTML tree. Content refresh is a build or `revalidateTag`, not a periodic SSR storm.

---

## 7. Blob / data transfer

1. Binary media **must not** ship in the Vercel deployment when it exceeds ~50MB. Use Blob / `.vercelignore` (Kitletics already excludes `public/images/**`).
2. Bytes that already live on `*.public.blob.vercel-storage.com` should be linked directly. Proxying Blob through the deployment (`rewrites` / middleware) bills **Fast Origin Transfer** and **Blob Data Transfer**.
3. Do not hydrate full database/explorer datasets into the RSC payload when a paginated fetch or client JSON would do.
4. Fast Data Transfer is included on Pro at current volumes. Do not “optimize FDT” by disabling compression or image formats that help LCP.

---

## 8. Analytics / observability

1. Vercel Web Analytics may stay **on production** for sites that have no other first-party analytics. Disable it on **preview** deployments.
2. Speed Insights must use `sampleRate` ≤ 0.1 on catalog sites, or be off when GA4/Ahrefs already cover CWV.
3. Speed Insights Plus (paid events) must not be enabled unless a named investigation needs it. Turn it off after the investigation.
4. Observability Plus traces/logs stay at the Pro default. Do not raise log drain volume. Do not `console.log` per request in hot paths.
5. FluentCopilot must not add `@vercel/analytics` or Speed Insights until it has real production traffic and a reason.

---

## 9. Previews / builds

1. Every project **must** have an ignored build step (`ignoreCommand`) that skips deploys when the diff is only `docs/` markdown, `reports/`, `.cursor/`, audit outputs, or other files that cannot affect the production app.
2. Kitletics: `vercel.json` → `"ignoreCommand": "node scripts/vercel-ignored-build.mjs"`. **Exit 0 = skip, exit 1 = build** (do not invert). The script compares `VERCEL_GIT_PREVIOUS_SHA` (fallback `HEAD~1`) and **does not** blanket-exclude `docs/` — JSON/CSV under `docs/padel/data` and `docs/quality/data` are read at runtime.
3. Local validation before every push: `npm run validate:local` (lint, typecheck, test, `next build`). Vercel is not the compiler.
4. Preview deployments are for pull requests, not for every push to `main`. `main` → production only.
5. Do not push to `main` from an agent loop “to see if Vercel builds”. Failed production builds still consume Build CPU.
6. Batch related application changes into one deploy. Do not auto-push or auto-deploy.
7. Elastic “turbo” / “enhanced” build machines are a **symptom**. Shrink the static generation surface instead of permanently buying faster build VMs.
8. Dashboard `commandForIgnoringBuildStep` is overridden by `vercel.json` `ignoreCommand`. Leave the dashboard field empty on Kitletics so the repo script is the single source of truth.

**Test:** rule `missing-ignore-command`. Cursor rules: `.cursor/rules/vercel-cost.mdc`, `.cursor/rules/deployment-workflow.mdc`.

---

## 10. Bots

1. Do not block Googlebot, Bingbot, or other legitimate search crawlers required for SEO.
2. `robots.txt` must `Disallow` `/go/`, `/api/`, `/admin/`, `/preview/`, `/search`, and public CSV dumps.
3. Faceted/search URLs that are `noindex` should also be `Disallow`’d so they are not crawled.
4. WAF custom rules may challenge scrapers and unknown bots on `/_next/image`, `/search`, and Server Actions. Do not challenge Googlebot.
5. `dynamicParams = false` is the preferred 404 for invented catalog slugs.

---

## 11. Logging

1. No per-request `console.log` in middleware, `layout.tsx`, or product/review page components.
2. Structured logs for affiliate clicks belong on a sampled beacon, not an uncached SSR.

---

## Definition of done (before merging a route change)

- [ ] Public route is STATIC or ISR unless listed as an exception (`/go`, `/admin`, authenticated `/app`, search POST).
- [ ] No new `draftMode()` / `cookies()` / `headers()` on sitemap’d pages.
- [ ] Image `sizes` + `quality` come from the shared preset.
- [ ] Middleware matcher still excludes static + images.
- [ ] `npm run validate:local` passed (lint, typecheck, test, production `next build`).
- [ ] `npm run audit:vercel-cost` introduces no new FAIL (Kitletics) or the FAIL is an approved exception listed in `reports/vercel-cost-audit/issues.csv`.
