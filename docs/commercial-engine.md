# Kitletics Commercial Engine

## Principle

```text
WHAT SHOULD I BUY?     →  Recommendation Engine
WHERE SHOULD I BUY IT? →  Commercial Engine
```

Affiliate commission **never** enters Kitletics Score, Finder Match Score, Best Guide awards, Alternatives, Comparison winners, or Shoe Rotation Planner ranking.

## Domain layout

```text
src/domain/commerce/
  types.ts          Retailer, Offer, AffiliateProgram, …
  schemas.ts        Zod validation
  ranking.ts        rankOffersForProduct (no commissionWeight)
  affiliates.ts     resolveCommercialUrl + providers
  analytics.ts      offer_click etc. (anonymous)

src/repositories/commerce.ts
  Offer retrieval, getBestOffer, resolveOfferDestination, /go href builder
```

Recommendation domains (`finders`, `recommendations`, `shoe-rotation`) must not import affiliate modules.

## Retailer & Offer

- **Product** = universal catalog entity  
- **Offer** = regional commercial entity (`region` + `currency` + `retailerUrl`)
- Regional Amazon storefronts are separate Retailers (NL/DE/UK/US) because domains and affiliate tags differ.
- `retailerUrl` (`offer.url`) is never mutated; affiliate wrapping happens in the resolver.

## Region

Precedence: explicit → cookie (`kitletics_region`) → default `NL`.  
Locale, region, and currency are separate concepts.

## Offer ranking

Weights: availability, price (+ shipping when known), retailer type trust, freshness.  
**Not** commission.

Lowest current price / “From €…” only when Offer is fresh/recent and purchasable.

## Affiliate resolver

`resolveCommercialUrl({ offer, retailer, program, trackingId })`

- Active program + credentials → provider (Amazon tag / template deep link)
- Otherwise → normal retailer URL (trust-preserving fallback)
- Never invent affiliate parameters

## Redirect

`GET /go/[offerId]?placement=…`

- Validates Offer + published Product
- Host allowlist on Retailer
- Records anonymous `offer_click`
- 302 temporary redirect
- `X-Robots-Tag: noindex`
- Rejects `?url=` open-redirect attempts

## Freshness

Configurable bands: fresh (&lt;24h), recent (1–3d), aging (3–7d), stale (&gt;7d).  
Stale prices show “Check latest price” instead of a confident number.

## Disclosure

- `AffiliateDisclosure` near first commercial CTA
- `/affiliate-disclosure` full policy
- `/methodology` states affiliate independence

## QA

```bash
npm run commerce:qa
npm run offers:validate
npm test -- tests/commerce.test.ts
```

## Deals

A `/deals` page is **not** published until Offer coverage and verified discount evidence are strong enough. MSRP−price is not treated as a sale by default.
