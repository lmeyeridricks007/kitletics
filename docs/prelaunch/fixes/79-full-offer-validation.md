# Fix 79 — Full offer reliability validation (Day-1 Running)

**Date:** 2026-09-10  
**Do not publish.**  
**Debt:** `OFFER-OVERLAY-SAMPLE` (was 80 / 1293 overlay rows)  
**Engine:** Fix 22 classifier (bot-block ≠ INVALID) + identity helper  
**Evidence:** [`../data/rc-79/`](../data/rc-79/)  
**CLI:** `npm run offers:validate-urls:day1`

---

## Scoreboard

| Metric | Count |
|---|---:|
| Catalog offers (all statuses) | **1301** (all `active`) |
| INDEXABLE products with `sport-running` | **375** |
| **Active Day-1 Running offers** | **404** |
| **Validated (overlay this pass)** | **404 / 404 (100%)** |
| VALID | **48** |
| LIKELY_VALID | **346** |
| UNKNOWN | **10** |
| INVALID | **0** |
| Disabled / hidden from CTAs | **0** (nothing to hide) |
| Unvalidated Day-1 Running | **0** |
| Overlay rows after merge | **433** (404 Day-1 + 29 held-vertical leftovers from Fix 22) |
| Catalog offers still without overlay | **868** (padel / fitness / other held verticals) |

Region mix of the 404: **NL 387 · DE 5 · UK 9 · US 3**.

A handful of mixed-sport fitness SKUs (AssaultRunner, folding treadmill) tag `sport-running` and therefore inherit the **enabled** Running vertical. Their DE/UK Amazon homepages were in this 404. They are still INDEXABLE under current policy, not a URL-reliability miss.

---

## 1. What was validated

Priority order: INDEXABLE + `sport-running` → **NL**, then **DE/UK**, then US.

Checker: browser UA, HEAD then GET on 4xx/405/error, 10s timeout, concurrency 8. Overlay **merges** — Fix 22 padel/fitness sample rows were not wiped.

Re-run:

```bash
npm run offers:validate-urls:day1
npm run offers:validate-urls:day1 -- --inventory
```

---

## 2. Classification

Same states as Fix 22. Extra reasons (still not auto-INVALID): `geo_block`, `wrong_product`, `product_removed`.

| Observation | State | Shown in CTAs? |
|---|---|---|
| 2xx / followed 3xx | VALID | Yes |
| Amazon HEAD 405 / GET 202 | LIKELY_VALID (`method_not_allowed` / `soft_block`) | Yes |
| WAF 403 / Cloudflare / Access Denied | LIKELY_VALID (`bot_blocked`) | Yes |
| HTTP 451 / geo copy | LIKELY_VALID (`geo_block`) | Yes |
| Timeout / `fetch failed` (not NXDOMAIN) | UNKNOWN | Yes |
| 404 / 410 / bad URL / hard DNS NXDOMAIN | INVALID | **No** |

This run:

| Reason | n | State |
|---|---:|---|
| Amazon method/soft | 327 | LIKELY_VALID |
| bot_blocked | 19 | LIKELY_VALID |
| (none — clean 2xx) | 48 | VALID |
| `fetch failed` (HOKA.com from this lab) | 8 | UNKNOWN |
| timeout (Runnersworld Shop, Ultimate Direction homepage) | 2 | UNKNOWN |

**No 404/410. No INVALID.** Bot-blocked ASICS/Decathlon were **not** marked INVALID.

---

## 3. Product identity

Where the URL is a retailer **homepage or locale index** (most seed Offers), identity cannot be proven. That is conversion depth, not a dead link (Fix 22).

| Identity | n |
|---|---:|
| `shallow_url` (homepage / locale) | **398** |
| `match` (tokens in title/path on a deep URL) | **5** |
| `unverifiable` | **1** |
| `mismatch` | **0** |

Matches (deep URLs, 200 HTML): Amazfit Balance 3, Cheetah 2 Pro, Kiprun 900 Race 5, NNormal Kjerag 02, Tomir 02.

Kiprun Proteam 10: Decathlon.ie PDP URL, bot-blocked HTML → `unverifiable`, LIKELY_VALID.

No variant-specific Offer rows (`variantId` unused in seed). Generation mismatches were not observed on the five deep pages we could read.

---

## 4. INVALID / disable

**0 INVALID.** Existing model: overlay `state: "INVALID"` → `isOfferUrlDisplayable` false → `getOffersForProduct` / `/go` omit the row (`offer_url_invalid`). Seed rows stay in `offers` (evidence). Nothing to deactivate.

UNKNOWN remains listed (Fix 22 policy). Listed below.

### UNKNOWN (still displayed)

| Offer | Host | Why |
|---|---|---|
| `offer-bondi9-nl`, `offer-clifton10-nl`, `offer-speedgoat-nl`, `offer-hoka-*` (5) | `www.hoka.com` | Lab `fetch failed` — not NXDOMAIN |
| `offer-nb6-nl-rws` | `www.runnersworldshop.nl` | Timeout |
| `offer-vaporair-nl` | Ultimate Direction homepage | Timeout |

Do not hide. Re-check from a residential network before treating HOKA as dead.

---

## 5. `/go` affiliate redirect

Programs for Amazon / Awin / Impact are **`pending`** until env credentials exist. Resolver **must not** invent `tag=`, Awin deep links, or Impact click URLs.

| Sample | Offer | Live `/go` | Affiliate params? |
|---|---|---|---|
| Amazon NL | `offer-pegasus41-nl` | **302** `https://www.amazon.nl/` | No |
| Amazon DE | `offer-nb6-de` | resolver passthrough `amazon.de` | No |
| Amazon UK | `offer-nb5-uk` | passthrough `amazon.co.uk` | No |
| Decathlon / Awin | `offer-nb4-nl` | **302** `https://www.decathlon.nl/` | No (`awin1.com` not used) |
| Garmin / Impact | `offer-fr965-nl` | **302** `https://www.garmin.com/` | No |
| All4Running specialist | `offer-vf4-nl-a4r` | **302** `https://www.all4running.nl/` | No |
| ASICS brand-direct | `offer-nb5-nl` | **302** `https://www.asics.com/nl/nl-nl/` | No |

Also confirmed: `?url=` / `?redirect=` → **400**; `X-Robots-Tag: noindex, nofollow`; 302 + `Cache-Control: no-store`. Tracking IDs are not logged or returned.

Tests: `tests/offer-url-validation.test.ts` — **14 passed**.

---

## 6. Residual (not this pass)

| Item | Why it stays |
|---|---|
| Shallow retailer homepages | Depth / conversion. Reliability of the **host** is scored. Deep-linking is a separate ingest job. |
| 868 held-vertical offers without overlay | Padel, fitness, tennis. Not Day-1 INDEXABLE. `FUT-OFFER-VALIDATE`. |
| HOKA UNKNOWN | Lab fetch failure. Still displayable. |

---

## 7. Files

| Path | Change |
|---|---|
| `src/domain/commerce/offer-url-validation.ts` | `geo_block` / `wrong_product` / `product_removed` reasons |
| `src/domain/commerce/offer-destination-identity.ts` | Shallow URL + title token match (no auto-INVALID) |
| `src/content/offers-url-validation.ts` | Merged overlay **433** |
| `scripts/tmp/prelaunch-79-validate-offers.ts` | Day-1 runner + `/go` probe |
| `tests/offer-url-validation.test.ts` | Identity, geo, pending-program passthrough |

---

## Definition of done

- [x] All active Day-1 Running Offer URLs have an overlay row
- [x] VALID / LIKELY_VALID / UNKNOWN / INVALID reported
- [x] Bot-block not treated as INVALID
- [x] Identity scored where HTML/URL allowed; homepages marked shallow
- [x] INVALID disable path unchanged; **0** to disable
- [x] UNKNOWN listed separately
- [x] `/go` Amazon / Awin / Impact / Decathlon / specialist — passthrough, no invented tags
- [x] This report
