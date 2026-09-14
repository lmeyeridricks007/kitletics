# Padel Commerce Audit

**Date:** 2026-09-13  
**Scope:** Regional commerce coverage for the Padel catalog via the **canonical** Offer / Retailer / `getLowestOfferPrice` engine  
**Principle:** No padel-specific pricing forks, no fabricated affiliate relationships, no FX-invented regional prices

---

## 1. Executive summary

| Metric (published padel products) | Before fix | After |
| --- | ---: | ---: |
| Published padel products | 93 | **93** |
| Offer rows | 150 | **150** |
| Displayable offer rows | ~24 | **141** |
| NL From-price (`getLowestOfferPrice`) | **13** | **53** |
| DE From-price | ~4 | **44** |
| UK From-price | ~4 | **44** |
| BE / FR / US / ZA From-price | 0 | **0** (honest empty) |

**Root cause of thin From-prices:** padel seeds used Amazon/Decathlon **homepages**. A padel-only pre-mark set `urlValidationState: INVALID`. Affiliate shortlinks upgraded `url` to `amzn.to` in materialize, but the stale INVALID flag remained — so 126 offers with real listing URLs stayed non-displayable.

**Fix (canonical, all verticals):** `enforceProductListingUrls()` in `src/repositories/commerce.ts` runs **after** affiliate URL upgrade + validation overlay. Homepage URLs stay INVALID; upgraded listing URLs clear homepage-only INVALID. Removed padel-specific `invalidateHomepageOffers`.

---

## 2. Canonical engine (unchanged contract)

| Concern | Canonical field / API |
| --- | --- |
| Retailer | `Offer.retailerId` → `Retailer` |
| Region | `Offer.region` (`NL` `BE` `DE` `FR` `UK` `US` `ZA`) |
| Currency | `Offer.currency` |
| Current price | `Offer.price` |
| List / was price | `Offer.originalPrice` |
| Sale | Derived via `deriveDiscountPercent()` — no boolean |
| Availability | `Offer.availability` |
| Affiliate URL | `Offer.affiliateUrl` optional; prefer `/go/[offerId]` |
| Freshness | `getOfferFreshness(lastChecked)` — fresh ≤24h, recent ≤72h |
| Retrieved / checked | `Offer.lastChecked` (no separate `retrievedAt`) |

**Display path (all surfaces):** `getLowestOfferPrice` → `pickLowestDisplayableOffer` → `shouldDisplayNumericPrice`.

Used by: PDP, cards/catalog, Finder, Padel Racket Database, Search, Best Guides, Compare, Alternatives, Reviews.

**Freshness clock:** seed/manual offers lift `lastChecked` to `SEED_DATES.verified` (`2026-09-13T12:00:00.000Z`). Live API/feed offers keep their own clock.

---

## 3. Regions

| Region | Commerce posture | Padel From-price products | Notes |
| --- | --- | ---: | --- |
| **NL** | `primary` | **53** | Priority market; Amazon NL + Decathlon + specialists ready |
| **DE** | `partial` | **44** | Amazon.de rows displayable after listing-URL fix |
| **UK** | `partial` | **44** | Amazon.co.uk rows displayable after listing-URL fix |
| **FR** | `limited` | **0** | `ret-amazon-fr` + pending program seeded; **no listing Offers yet** |
| **US** | `limited` | **0** | `ret-amazon-us` exists; no padel US listing Offers yet |
| **BE** | `none` | **0** | Decathlon/specialists ship to BE; no BE Offer rows yet |
| **ZA** | `none` | **0** | `ret-takealot` pending; no ZA Offers |

**Do not** invent BE/FR/ZA/US prices by converting NL EUR. Empty region → “No verified local price” / no displayable From-price.

---

## 4. Retailers

### Already in engine (used by padel offers today)

| Retailer | Regions | Affiliate program status |
| --- | --- | --- |
| Amazon.nl / .de / .co.uk | NL / DE / UK | `pending` (env tags only) |
| Decathlon | NL, DE, FR, BE | `pending` Awin |
| Amazon.com | US | `pending` |

### Newly researched & seeded (no fabricated active tags)

| Retailer id | Role | Regions | Affiliate |
| --- | --- | --- | --- |
| `ret-amazon-fr` | Marketplace | FR | `aff-amazon-fr` **pending** |
| `ret-justpadel` | NL specialist | NL, BE, DE | `aff-justpadel-awin` **pending** |
| `ret-padel2gether` | NL specialist | NL, BE | pending passthrough |
| `ret-holland-padel` | NL specialist | NL, BE | pending |
| `ret-padeldirect` | NL specialist | NL, BE, DE | pending |
| `ret-padelnu` | NL specialist | NL | pending |
| `ret-takealot` | ZA marketplace | ZA | pending (`Retailer.status: pending`) |

**Not claimed as active affiliates.** Offers may use clean product URLs; `/go` only attaches tags when program status + env credentials allow.

---

## 5. Offers inventory

| Region | Offer rows | Displayable |
| --- | ---: | ---: |
| NL | 62 | **53** |
| DE | 44 | **44** |
| UK | 44 | **44** |
| BE/FR/US/ZA | 0 | 0 |

Remaining **9** homepage INVALID rows are primarily Decathlon homepage seeds — correctly blocked until product PDPs replace them.

**Shared builder for future seeds:** `src/content/padel/offer-regions.ts` (`buildPadelRegionalOffers`) — only emits regions with real listing URLs; rejects Amazon/Decathlon homepages.

---

## 6. Price consistency

| Surface | Resolver |
| --- | --- |
| PDP | `getLowestOfferPrice` |
| Cards / catalog | same |
| Finder | `lowestByProduct` from `getLowestOfferPrice` |
| Padel Database | `getLowestOfferPrice` in `build-records.ts` |
| Search | `getLowestOfferPrice` |
| Best Guides | `getLowestOfferPrice` |

Verified by `tests/padel-commerce.test.ts` (Database vs resolver parity + Finder determinism).

---

## 7. No commission bias

| Layer | Guarantee |
| --- | --- |
| `DEFAULT_OFFER_RANKING` | No commission weight |
| Finder scoring | Budget/value from regional price + editorial scores; `AFFILIATE_NEUTRALITY` |
| Best Guides | Editorial awards; prices display-only |
| Compare winners | Spec/editorial criteria |
| Search rank | No commission |

Commission cannot influence ranking, Finder results, Best Guide winners, primary recommendations, or comparison winners.

---

## 8. Gaps & next actions (honest)

1. **Replace Decathlon homepage URLs** with real NL (and later BE/FR) product PDPs → unlock ~9 more displayable rows.  
2. **Specialist listing Offers** (Justpadel, Padel2Gether, …) — research product URLs; use `buildPadelRegionalOffers`; keep programs pending until credentials.  
3. **US / FR Amazon listing Offers** — add only with storefront-correct URLs + local currency prices (pricing agent / Creators API preferred).  
4. **Zero-offer published SKUs** (~40 without affiliate map) — discover via `npm run pricing:agent -- --mode=refresh` with real listing URLs; never homepage placeholders.  
5. **BE / ZA** — leave posture `none` until verified Offers exist; update `REGION_COMMERCE_COVERAGE` only then.

---

## 9. Files touched

| Path | Change |
| --- | --- |
| `src/repositories/commerce.ts` | `enforceProductListingUrls`; Amazon.fr in region map; finalize after affiliate upgrade |
| `src/content/padel/index.ts` | Removed padel-only homepage invalidate |
| `src/content/retailers.ts` | Amazon.fr + NL specialists + Takealot |
| `src/content/affiliate-programs.ts` | Pending programs + storefronts |
| `src/content/padel/offer-regions.ts` | Shared listing-only regional Offer builder |
| `src/content/config.ts` | Bumped `SEED_DATES.verified` |
| `src/lib/region/commerce-readiness.ts` | FR → `limited` (retailer ready; listings sparse) |
| `tests/padel-commerce.test.ts` | Coverage + neutrality + resolver consistency |
| `docs/padel/PADEL-COMMERCE-AUDIT.md` | This audit |

---

## 10. Verification

```bash
npx vitest run tests/padel-commerce.test.ts
# Also: tests/commerce-pricing.test.ts, tests/commerce-freshness.test.ts
```

Live cohort check (2026-09-13): NL From-price **53/93** published padel products; DE/UK **44** each; BE/FR/US/ZA **0**.
