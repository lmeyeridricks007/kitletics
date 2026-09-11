# Affiliate setup guide

Credentials never belong in the repository. Store tags and publisher IDs in environment variables / secret management.

## Add a network adapter

1. Ensure `AffiliateNetworkEntity` exists in `src/content/affiliate-programs.ts`.
2. Prefer the existing providers in `src/domain/commerce/affiliates.ts`:
   - `amazonAffiliateProvider` — `tag` query param
   - `templateAffiliateProvider` — `{{url}}`, `{{id}}`, `{{asin}}`
   - `passthroughProvider` — default fallback
3. Wire `selectProvider()` if a new network needs custom behaviour.

## Add a retailer

1. Add `Retailer` to `src/content/retailers.ts` with `allowedHosts`, `regions`, `retailerType`, `homepage`.
2. Add `RetailerStorefront` rows for regional domains/currencies.
3. Do **not** create duplicate “Amazon NL” vs “Amazon.nl” retailers unless storefronts truly differ.

## Add a regional program

```ts
{
  id: "aff-amazon-nl",
  retailerId: "ret-amazon-nl",
  networkId: "amazon",
  regionIds: ["NL"],
  status: "pending", // flip to active only when credentials work
  trackingIdEnvKey: "AMAZON_ASSOCIATES_TAG_NL",
  disclosureRequired: true,
  …
}
```

### Activate checklist

1. Program accepted by network  
2. Set env var (e.g. `AMAZON_ASSOCIATES_TAG_NL`)  
3. Set `status: "active"`  
4. Run `npm run offers:validate`  
5. Hit `/go/[offerId]` in staging and confirm destination + tag  
6. Confirm disclosure still accurate  

## Environment keys (examples)

| Key | Purpose |
|-----|---------|
| `AMAZON_ASSOCIATES_TAG_NL` | Amazon.nl Associates tag |
| `AMAZON_ASSOCIATES_TAG_DE` | Amazon.de |
| `AMAZON_ASSOCIATES_TAG_UK` | Amazon.co.uk |
| `AMAZON_ASSOCIATES_TAG_US` | Amazon.com |
| `AWIN_PUBLISHER_ID` | Awin publisher ID |
| `IMPACT_GARMIN_CAMPAIGN` | Impact campaign / media ID |
| `AMAZON_CREATORS_CREDENTIAL_ID` | Creators API credential ID (`.env.local`) |
| `AMAZON_CREATORS_CREDENTIAL_SECRET` | Creators API secret (shown once) |
| `AMAZON_CREATORS_CREDENTIAL_VERSION` | e.g. `3.1` (NA), `3.2` (EU) |
| `AMAZON_CREATORS_MARKETPLACE` | e.g. `www.amazon.com` |

Never commit values. Never log them.

## Catalog ASIN enrichment (Creators API)

PA-API 5 is deprecated. Use Creators API to fill ASINs / product URLs:

```bash
npm run amazon:enrich -- --limit=5   # smoke test
npm run amazon:enrich                # full catalog → kitletics-products-amazon-urls.xls
npm run amazon:enrich:resume         # skip successful cache hits
```

If SearchItems returns `AssociateNotEligible`, the Associates account does not yet meet Amazon’s API eligibility (often: approved store + recent qualifying sales in that marketplace). Credentials/token can still succeed while catalog calls are blocked.

## Import Amazon affiliate short links (amzn.to)

Fill `affiliateUrl` in `kitletics-products-affiliate-urls.xlsm`, then:

```bash
npm run offers:import-affiliate
```

This regenerates `src/content/offers-affiliate-urls.ts`. At runtime, Amazon offers for those products use the short link as `Offer.affiliateUrl` (and replace homepage-only `Offer.url`). All buy CTAs still go through `/go/[offerId]`, which prefers the stored affiliate URL. Google Ads / non-URL cells are skipped.

## Onboarding workflows

### Retailer

Create Retailer → storefronts → regions → Offer source → optional AffiliateProgram → validate → activate

### Affiliate

Program accepted → env config → AffiliateProgram → test deep link → test `/go` → activate

### Offers

fetch → normalize → match Product → validate → stage → publish → refresh → expire

## Backlog (not claimed as partnerships)

Programs currently `pending` until credentials exist — see `npm run commerce:qa` output. Do not display “Official Partner” unless contractually allowed.
