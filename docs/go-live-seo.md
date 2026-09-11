# Kitletics go-live SEO checklist

Owned with **SiteQualityAgent**. Crawl foundations live in code; Search Console registration is an ops step after deploy.

## In-repo (engineering)

| Item | Status / location |
| --- | --- |
| Sitemap | `src/app/sitemap.ts` → `https://kitletics.com/sitemap.xml` — published entities only; **no coming-soon sports** |
| robots.txt | `src/app/robots.ts` — allow `/`; disallow `/go/`, `/api/`, `/admin/`, `/preview/`; sitemap URL set |
| Canonicals + metadataBase | `src/app/layout.tsx`, `src/lib/seo/metadata.ts` |
| Default OG + Twitter | `/og/default.png` + `opengraph-image.tsx`; `summary_large_image` |
| Organization / WebSite JSON-LD | Homepage via `organizationJsonLd` / `webSiteJsonLd` (no SearchAction while `/search` is noindex) |
| Coming-soon sports | Excluded from sitemap; `sportMetadata` sets `noindex` |
| Security headers | `next.config.ts` — HSTS, nosniff, Referrer-Policy, X-Frame-Options, Permissions-Policy |
| GSC / Bing verification | Env-gated: `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, `NEXT_PUBLIC_BING_SITE_VERIFICATION` |
| GA4 (optional) | `NEXT_PUBLIC_GA_MEASUREMENT_ID` — Consent Mode defaults denied |
| llms.txt | `public/llms.txt` — allow Googlebot; no aggressive AI blocks |
| Manifest / icons | `src/app/manifest.ts`, `icon.tsx`, `apple-icon.tsx` |

See also: [seo-architecture.md](./seo-architecture.md), [performance-standards.md](./performance-standards.md).

## Ops (after HTTPS is live on kitletics.com)

1. Confirm DNS + HTTPS for `kitletics.com` (and `www` redirect if used).
2. **Google Search Console**
   - Add domain or URL-prefix property.
   - Verify via DNS TXT **or** set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` in hosting env and redeploy.
   - Submit sitemap: `https://kitletics.com/sitemap.xml`
3. **Bing Webmaster Tools** (optional) — set `NEXT_PUBLIC_BING_SITE_VERIFICATION` if using meta verification.
4. Optionally set `NEXT_PUBLIC_GA_MEASUREMENT_ID` for GA4 (wire a CMP before enabling analytics_storage for EEA).
5. After sitemap processes, request indexing for `/`, `/running`, `/best`, key product/review hubs.
6. Week 1: monitor Coverage, Experience (CWV), and Security issues in GSC.
7. Re-run: `npm run site:audit:launch`

## Do not

- Invent hreflang without real locale URLs
- Fabricate AggregateRating or review counts
- Claim domain authority / rankings in marketing copy
- Index `/search`, `/go/`, drafts, or coming-soon sport hubs

## Performance note

Lab homepage LCP has been high in local baselines — measure on production CDN after go-live and treat as a separate PERF track. Do not invent field CWV numbers.
