# Fix 22 — Offer & affiliate link reliability

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Priority:** HIGH (commercial)  
**Reference:** [`../06-media-offers-trust.md`](../06-media-offers-trust.md)  
**Machine data:** [`../../staging/22-offer-url-validation.json`](../../staging/22-offer-url-validation.json) (path: `data/staging/22-offer-url-validation.json`)

## Objective

Investigate the audit claim **21/40 “broken” Offer URLs**, stop false alarms from bot-blocking, and ship a validation + display policy so commercial CTAs never surface **known-invalid** links — without hiding retailers that only block automated checkers.

---

## 1. Recheck — what “21 broken” actually were (MEASURED)

Audit 06 used **HEAD-first**, then treated **any status ≥400 or thrown error** as broken. That misclassified healthy retailers.

### Reprobe (browser UA, HEAD + GET)

| Host | HEAD | GET | Real meaning |
|---|---:|---|---|
| `asics.com` | 200/403 | **403 Access Denied** | **Bot / WAF block** |
| `decathlon.nl` | 403 | **403 Cloudflare** | **Bot / WAF block** |
| `amazon.nl` / `.de` | **405** | **202** soft | Amazon rejects HEAD / soft anti-bot |
| `amazon.co.uk` | 405 | 202 | Same |
| `brooksrunning.com` | 200 | **200** HTML | **Alive** |
| `garmin.com` | 200 | **200** HTML | **Alive** |
| `all4running.nl` | 200 | **200** HTML | **Alive** |

### Original audit sample of 40 — reclassified via new engine

| Naive audit “broken” (≥400 / error) | **21** |
|---|---:|
| Reclass **LIKELY_VALID** (Amazon method/soft-block) | **24** of mapped sample* |
| Reclass **LIKELY_VALID** (bot_blocked) | **1** |
| Reclass **VALID** | **13** |
| Reclass **UNKNOWN** (transient fetch fail) | **2** |
| Reclass **INVALID** | **0** |

\*Sample overlap with validation overlay; Amazon HEAD 405 dominated the “broken” bucket.

**Conclusion:** Do **not** treat bot blocking or Amazon HEAD 405 as dead offers. No definitive 404/410 appeared in the audit sample.

---

## 2. Validation engine

| Module | Role |
|---|---|
| `src/domain/commerce/offer-url-validation.ts` | States, failure reasons, classifier, display gate |
| `scripts/tmp/prelaunch-22-validate-offers.ts` | HEAD→GET network checker + overlay writer |
| `src/content/offers-url-validation.ts` | Persisted results (`lastCheckedAt` ≡ `checkedAt`, HTTP status, redirect, state, reason) |
| `src/repositories/commerce.ts` | Merges overlay onto Offers; filters **INVALID** from CTA queries; `/go` rejects INVALID |

### States

| State | Meaning | Shown in CTAs? |
|---|---|---|
| **VALID** | 2xx/3xx confirmed | Yes |
| **LIKELY_VALID** | Bot WAF / Amazon soft / HEAD 405 | **Yes** |
| **UNKNOWN** | Timeout / ambiguous network | **Yes** (do not hide) |
| **INVALID** | Bad URL, non-http, 404/410, hard DNS miss | **No** |

Stored per offer: `urlValidationState`, `urlValidationCheckedAt`, `urlValidationHttpStatus`, `urlValidationRedirectUrl`, `urlValidationFailureReason`.

### Live validation run (n=60 active offers)

| State | Count |
|---|---:|
| VALID | 18 |
| LIKELY_VALID | 37 |
| UNKNOWN | 5 |
| INVALID | **0** |

Reasons: Amazon method/soft **33**, bot_blocked **4**, transient network **5**.

Re-run:

```bash
npm run offers:validate-urls -- --limit=80
# or --all
```

---

## 3. Display policy

- `getOffersForProduct` / `getActiveOffers` / `getOffersByRegion` → exclude **INVALID** only.
- Bot-blocked / Amazon soft → remain listed (LIKELY_VALID).
- `/go/[offerId]` returns `offer_url_invalid` for INVALID (no redirect).
- No fake local availability: unchanged regional honesty (`commerce-readiness.ts`).

---

## 4. `/go` affiliate redirect (verified)

Existing controls confirmed + tightened comments:

| Check | Status |
|---|---|
| Rejects `?url=` / `?redirect=` | **Yes** (400) |
| Resolves only by Offer ID | **Yes** |
| Host allowlist (`hostAllowed`) | **Yes** |
| http(s) only | **Yes** |
| Affiliate tag only when program **active** + env credential | **Yes** (`resolveCommercialUrl`) |
| 302 + `X-Robots-Tag: noindex` | **Yes** |
| Analytics `recordOfferClick` | **Yes** |
| Unpublished product blocked | **Yes** |
| INVALID offer blocked | **Yes** (new) |

Tests: `tests/offer-url-validation.test.ts` + existing `tests/commerce.test.ts` redirect suite — **pass**.

---

## 5. Regions (preserved)

| Region | Posture | Notes |
|---|---|---|
| NL | primary (~100% displayable) | Unchanged |
| DE | partial (~40%) | Unchanged |
| UK | partial (~41%) | Unchanged |
| US | limited (~0%) | Unchanged |
| FR / BE / ZA | none | Unchanged |

No invented FR/BE/ZA inventory. Empty states still use `NO_REGIONAL_OFFERS_MESSAGE`.

---

## 6. CTA / residual commercial quality

- **Link reliability:** audit “21 broken” was a **false commercial alarm** under naive HEAD rules.
- **Shallow URLs:** many seed Offers still point at **retailer homepages** (e.g. `amazon.nl/`, `garmin.com/`) rather than product deep links. That is a **depth / conversion** issue, not a dead-link issue — out of scope for “broken URL” classification, tracked as follow-up.
- Prices still gated by freshness (`shouldDisplayNumericPrice`) — separate from URL validation.

---

## 7. Files

| Path | Change |
|---|---|
| `src/domain/commerce/offer-url-validation.ts` | Classifier + display gate |
| `src/domain/commerce/types.ts` / `schemas.ts` | Optional validation fields |
| `src/content/offers-url-validation.ts` | Overlay (60 checked) |
| `src/repositories/commerce.ts` | Merge + filter + `/go` gate |
| `src/app/go/[offerId]/route.ts` | Docs for open-redirect / INVALID |
| `scripts/tmp/prelaunch-22-validate-offers.ts` | Checker CLI |
| `tests/offer-url-validation.test.ts` | Classifier + `/go` posture |

---

## 8. Verdict

**Safe to keep commercial CTAs on.** The 21/40 “broken” sample was dominated by **bot blocks and Amazon HEAD behavior**, not dead offers. Infrastructure now stores validation outcomes and **hides only INVALID**. Regional honesty unchanged. Next commercial improvement: deepen Offer URLs to product pages (not homepages) and expand `--all` validation coverage on a schedule.
