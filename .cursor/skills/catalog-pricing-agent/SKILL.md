---
name: catalog-pricing-agent
description: >-
  Audit and refresh Kitletics product Offer prices so From-prices show on PDPs,
  reviews, best guides, comparisons, and catalog cards. Use when prices are
  missing, "No verified local price" appears, or offers look stale.
---

# Catalog Pricing Agent

## Goal

Published products must resolve a **displayable** regional From-price via
`getLowestOfferPrice()` / `shouldDisplayNumericPrice()` (fresh or recent —
within 72 hours of `lastChecked`).

## Quick start

```bash
# Audit NL displayability
npm run pricing:agent -- --mode=audit --write

# Refresh lastChecked + discover missing prices (writes offers-pricing-refresh.ts)
npm run pricing:agent -- --mode=refresh --write

# Refresh then audit
npm run pricing:agent -- --mode=full --write --fail
```

Reports: `data/staging/catalog-pricing-audit-YYYY-MM-DD.{json,md}`  
Overlay: `src/content/offers-pricing-refresh.ts` (merged in `repositories/commerce.ts`)

## Why prices disappear

`shouldDisplayNumericPrice` only allows **fresh** (≤24h) or **recent** (≤72h)
offers. Seed `lastChecked` ages out → UI shows “No verified local price”
even when Offer rows exist.

## Refresh rules

1. Never invent affiliate tracking params — store clean product URLs; `/go` resolves tags.
2. Prefer Amazon Creators API when `.env.local` credentials exist (live USD).
3. Else RunRepeat / JSON-LD heuristics → convert to NL EUR list estimate.
4. Patch every active offer `lastChecked` so existing seed prices become displayable.
5. Create NL offers for published products with zero offers.
6. Bump `SEED_DATES.verified` in `src/content/config.ts` to match.

## Key files

| Path | Role |
| --- | --- |
| `scripts/pricing-agent.ts` | CLI |
| `scripts/lib/pricing-audit.ts` | Coverage / displayability audit |
| `scripts/lib/pricing-fetch.ts` | RunRepeat / JSON-LD / Amazon discovery |
| `src/content/offers-pricing-refresh.ts` | Generated patches + new offers |
| `src/repositories/commerce.ts` | Merges refresh overlay |
| `src/domain/commerce/ranking.ts` | `shouldDisplayNumericPrice` |

## Definition of done

- `npm run pricing:agent -- --mode=full --region=NL --fail` exits 0
- PDP / best-guide / catalog show From-prices for covered products
- `tests/commerce-freshness.test.ts` passes
