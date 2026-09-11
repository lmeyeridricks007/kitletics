# Kitletics SEO architecture

Owned by **SiteQualityAgent**. SEO follows user value: Products, Reviews, Guides, Best, Compare, Tools.

## Indexation policy

**Indexable (when published):** Live Sport/Discipline/Category hubs, Products, Reviews, Best Guides, Buying Guides, Brand Hubs, Comparisons, Setups, Tools, trust pages (About, Methodology, How we review, Affiliate disclosure).

**Noindex / disallow:** `/search`, Finder **results** query states, dynamic Compare tray state, `/go/` affiliate redirects, `/api/`, `/admin/`, `/preview/`, drafts, scheduled/future content, **coming-soon sport hubs** (excluded from sitemap until `contentStatus: live`).

## Canonicals

- Self-canonical via `lib/seo/metadata.ts` builders using `siteConfig.url`
- Root layout should set `metadataBase`
- Comparison reverse-order slugs resolve to editorial canonical when present
- Filter/query states must not invent indexable duplicates
- Default OG image: `/og/default.png`; Twitter `summary_large_image`

## Sitemap

- `src/app/sitemap.ts` — publication-gated entities only; **live sports only**
- `lastmod` = entity `updatedAt` or stable content date — **never** rebuild `Date.now()` churn on static hubs
- No search, no personalized routes, no future content, no coming-soon sport URLs

## robots.txt

- Allow `/`
- Disallow `/go/`, `/api/`, `/admin/`, `/preview/`
- Sitemap: `${siteConfig.url}/sitemap.xml`

## Structured data

Builders in `src/lib/seo/jsonld.tsx`:

- Organization / WebSite on homepage (no SearchAction while `/search` is noindex)
- BreadcrumbList
- Product (real offers only)
- Review (Kitletics Review only — **not** Kitletics Score as AggregateRating)
- Article / FAQPage / CollectionPage / ItemList / WebApplication where real

**Never fabricate** AggregateRating, fake reviews, or availability.

## Go-live registration

See [go-live-seo.md](./go-live-seo.md) for Search Console / Bing / env verification and ops checklist.

## Future content

Scheduled content must 404 in production and stay out of sitemap, search, nav, JSON endpoints, and structured data.

## AI crawlers

- `public/llms.txt` summarizes primary hubs
- Default: allow Googlebot; do not invent aggressive blocks without a product decision
