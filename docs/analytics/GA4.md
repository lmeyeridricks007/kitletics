# Kitletics GA4 analytics

Production measurement ID is configured via environment only — never hardcoded in application source.

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-82Z9YHTT93
```

## Architecture

```text
layout (server)
  ├─ getServerAnalyticsConfig()     # ID + VERCEL_ENV=production gate
  ├─ AnalyticsScripts               # consent stub (beforeInteractive) + gtag.js
  └─ AnalyticsProvider (client)
       ├─ configureGa(send_page_view: false)
       ├─ ConsentBanner             # first-party; EU default deny
       ├─ PageViewTracker           # App Router page_view + view_* events
       ├─ /go click capture         # retailer_click (beacon)
       └─ domain sinks              # finder / compare / commerce → track()
```

Public API lives under `src/lib/analytics/`. UI must call `track()` / domain sinks — not raw `gtag()`.

| Module | Role |
|--------|------|
| `config.ts` | Measurement ID + production gate |
| `consent.ts` | Cookie `kit_analytics_consent` + Consent Mode payloads |
| `gtag.ts` | Browser-only gtag bridge |
| `events.ts` | Typed `track()` / `trackPageView()` |
| `page-context.ts` | Path → `page_type` + slugs |
| `sanitize.ts` | Strip PII / affiliate URLs / secrets |
| `map-domain.ts` | Existing finder/compare/commerce sinks → GA events |
| `placements.ts` | Offer placement → GA placement |

## Ahrefs Web Analytics

Optional cookieless companion to GA4.

```bash
NEXT_PUBLIC_AHREFS_ANALYTICS_KEY=rEbRuhuknkWGdlpy/pnmBA
```

Loaded via `AnalyticsScripts` (`analytics.ahrefs.com/analytics.js`, `afterInteractive`) only when the key is set **and** `VERCEL_ENV=production` (or `NEXT_PUBLIC_GA_FORCE=1`). Independent of GA4 consent cookies.

After deploy: Ahrefs → Project Settings → Web Analytics → **Verify installation**.

## Environment variable

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID (`G-…`) |
| `NEXT_PUBLIC_AHREFS_ANALYTICS_KEY` | Ahrefs Web Analytics `data-key` |
| `NEXT_PUBLIC_GA_FORCE=1` | Local-only override to enable without `VERCEL_ENV=production` |

Absent ID → analytics no-ops. Invalid ID shapes are rejected.

## Vercel configuration

1. Project **kitletics** → Settings → Environment Variables.
2. Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` = `G-82Z9YHTT93` for **Production** only (recommended).
3. Redeploy production after changing the variable (`NEXT_PUBLIC_*` is build-time).
4. Preview/Development should omit the ID (or leave it — code still requires `VERCEL_ENV=production`).

`VERCEL_ENV` is set automatically by Vercel. Do not put affiliate secrets in `NEXT_PUBLIC_*`.

## Consent behaviour

**Gap:** Kitletics previously had no CMP / cookie banner. Region cookies and affiliate clicks are **not** analytics consent.

**Implemented:** minimal first-party banner + Google Consent Mode v2 defaults:

| Signal | Default | After Accept | After Reject |
|--------|---------|--------------|--------------|
| `analytics_storage` | denied | granted | denied |
| `ad_storage` | denied | denied | denied |
| `ad_user_data` | denied | denied | denied |
| `ad_personalization` | denied | denied | denied |

Cookie: `kit_analytics_consent=granted|denied` (180 days, `SameSite=Lax`).

- Tag may load in production with defaults denied (Consent Mode).
- Custom events and page_views emit only when analytics consent is **granted**.
- No second competing banner was introduced (none existed).

## Page types

Controlled taxonomy (`page_type`):

`home`, `sport_hub`, `discipline_hub`, `category`, `product`, `review`, `best_guide`, `guide`, `comparison`, `alternatives`, `brand`, `finder`, `tool`, `search`, `other`

Optional context (when derivable from the path): `sport`, `discipline`, `category`, `brand`, `product_slug`, `content_slug`.

## Event taxonomy

See [event-matrix.md](./event-matrix.md).

Decision-journey events (typed API):

`view_product`, `view_review`, `view_best_guide`, `view_guide`, `view_comparison`, `finder_start`, `finder_answer`, `finder_complete`, `finder_product_click`, `compare_add`, `compare_remove`, `compare_complete`, `search`, `filter_use`, `offer_view`, `retailer_click`, `email_signup`, `price_alert_signup`

Plus affiliate-safe GA4 ecommerce: `view_item`, `view_item_list`, `select_item`.

## Affiliate / retailer tracking

Central capture: document click listener on `a[href^="/go/"]` in `AnalyticsProvider`.

Emits `retailer_click` with beacon transport **before** navigation (non-blocking). Parameters: `offer_id`, `placement`, `page_type`, plus page context. Product/retailer/region continue to be recorded server-side via `recordOfferClick` on `/go/[offerId]` (domain sink; not gtag on the server).

**Never sent:** full affiliate destination URLs, tags, emails, names, IPs.

## GA4 recommended ecommerce mapping

| Kitletics meaning | GA4 event | Notes |
|-------------------|-----------|-------|
| View product page | `view_item` (+ `view_product`) | Not a purchase |
| Click product in finder list | `select_item` | List name `finder_results` |
| Affiliate/retailer outbound | `retailer_click` | **Never** `purchase` |
| Offer impression (if wired) | `offer_view` | Optional `view_item_list` later |

Kitletics is **not** merchant of record — do not emit `purchase`, `add_to_cart`, or `begin_checkout` for affiliate clicks.

## How to add future events

1. Add the name to `ANALYTICS_EVENTS` in `types.ts` if it is a public API event.
2. Call `track("event_name", params)` from a single orchestration point (prefer domain sinks).
3. Extend `sanitize.ts` allowlist if new parameter keys are required.
4. Document the row in `event-matrix.md`.
5. Add a unit test for payload sanitization / mapping.

## Prohibited PII

Do not send: email, names, phone, IP, exact addresses, free-form search text that may contain personal data, passwords/tokens, affiliate secrets, full tracking URLs.

Search events send `has_query` + `query_length` only.

## Debugging

- Chrome DevTools → Network → filter `google-analytics` / `collect`
- GA4 **Admin → DebugView** with [Google Analytics Debugger](https://chrome.google.com/webstore) or `gtag('config', id, { debug_mode: true })` temporarily
- Confirm consent cookie `kit_analytics_consent=granted`
- Confirm production: `VERCEL_ENV=production` and measurement ID present

## GA4 Realtime verification

1. Deploy production with the env var set.
2. Open an incognito window → https://kitletics.com → **Accept analytics**.
3. GA4 → Reports → Realtime → confirm page views and `page_type`.
4. Click a Where-to-buy / Amazon CTA → confirm `retailer_click`.

## GA4 DebugView verification

1. Enable debug mode (extension or temporary `debug_mode`).
2. GA4 → Admin → DebugView.
3. Navigate product → review → trigger finder answers → compare add → `/go` click.
4. Confirm parameters are sanitized (no URLs/emails).

## Search Console linking

Search Console is already configured. Sitemap: https://kitletics.com/sitemap.xml (1,167 URLs). Analytics does **not** modify sitemap, robots, canonicals, or indexability.

To link GA4 ↔ Search Console: GA4 Admin → Product links → Search Console → link the `kitletics.com` property.
