# Kitletics Pre-Launch Audit 06 — Media, Offers, Evidence & Trust

**Mode:** READ-ONLY forensic (no image replacement, no offer fetch/refresh, no content edits)
**Generated:** 2026-09-06T21:19:24.433Z
**Audit clock:** 2026-09-06T12:00:00.000Z
**Machine-readable:** [`data/06-media-offers-trust.json`](./data/06-media-offers-trust.json)

---

## Blockers

No BLOCKER for fake AggregateRating in production JSON-LD builders (Review uses `Rating` / `reviewRating` only; Product omits AggregateRating).

---

## 1. Media inventory

| Metric | Count |
|---|---:|
| Published products | 623 |
| Authentic primary | 623 |
| With gallery extras (>1 image / non-hero usage) | 23 |
| Lifestyle / on-foot usage | 1 |
| Missing primary | 0 |
| Placeholder primary | 0 |
| Unknown / none provenance | 0 |
| Shared-hash duplicate groups | 0 |
| Media-audit coverage % | 100 |
| Identity mismatches (site audit) | 0 |

### Catalog media audit gaps

_None._

### Provenance / licence distribution (primary)

| Bucket | Count |
|---|---:|
| retailer-authorized | 389 |
| manufacturer-marketing | 234 |

---

## 2. Running shoes — media issues

| Metric | Value |
|---|---:|
| Running shoe products | 83 |
| Shoes audit coverage % | 100 |
| Shoes identity mismatches | 0 |
| Issue rows (deduped) | 0 |

_No media issues listed for running shoes under audit rules._

---

## 3. Image technical quality

| Metric | Value |
|---|---:|
| Authentic primaries measured | 623 |
| Missing width/height on MediaAsset | 0 |
| Missing alt on primary | 0 |
| next/image `priority=` usages (components) | 13 |
| next/image `sizes=` usages (components) | 110 |

### Formats

- jpeg: 507
- png: 99
- webp: 16
- gif: 1

### File size buckets

- lt50kb: 147
- 50-200kb: 306
- 200-500kb: 68
- gt500kb: 102

### Dimension / file issues (sample)

- `sis-go-isotonic-gel` — narrow-width:349 (`/images/running/accessories/sis-go-isotonic-gel-hero.jpg`)
- `sis-beta-fuel-drink` — narrow-width:342 (`/images/running/accessories/sis-beta-fuel-drink-hero.jpg`)
- `high5-zero` — narrow-width:100 (`/images/running/accessories/high5-zero-hero.png`)
- `injinji-run-midweight` — narrow-width:265 (`/images/running/accessories/injinji-run-midweight-hero.png`)
- `asics-solution-swift-ff-padel-women` — narrow-width:320 (`/images/padel/products/asics-solution-swift-ff-padel-women-hero.jpg`)
- `concept2-skierg-with-stand` — narrow-width:375 (`/images/fitness/products/concept2-skierg-with-stand-hero.jpg`)
- `nike-free-metcon-6` — narrow-width:320 (`/images/training/products/nike-free-metcon-6-hero.png`)
- `salming-race-9` — narrow-width:350 (`/images/training/products/salming-race-9-hero.jpg`)
- `salming-rebel` — narrow-width:240 (`/images/training/products/salming-rebel-hero.jpg`)

---

## 4. Product image provenance

Reported from stored `licence` / `sourceUrl` / `attribution` only — **ownership not inferred**.

| Licence | Count |
|---|---:|
| retailer-authorized | 389 |
| manufacturer-marketing | 234 |

Duplicate shared-byte hero groups: **0** (sample in JSON).

---

## 5. Offers

| Metric | Count |
|---|---:|
| Active offers | 1293 |
| Products | 623 |
| Products with ≥1 offer | 623 |
| Products with zero offers | 0 |
| Avg offers / product | 2.08 |
| Avg offers / product (with offers) | 2.08 |
| Stale (by audit clock) | 0 |
| Variant-linked offers | 0 |
| URL sample checked | 40 |
| URL sample broken/error | 21 |

### Freshness

- fresh: 0
- recent: 1293
- aging: 0
- stale: 0

### By region (offer rows)

| Region | Offers |
|---|---:|
| DE | 274 |
| NL | 738 |
| UK | 278 |
| US | 3 |

### By retailer (top)

| Retailer | Offers |
|---|---:|
| Amazon.nl | 677 |
| Amazon.co.uk | 278 |
| Amazon.de | 274 |
| Garmin Official | 17 |
| Decathlon | 11 |
| ASICS Official | 10 |
| HOKA Official | 8 |
| Brooks Official | 7 |
| All4running | 6 |
| Amazon.com | 3 |
| Runner's World Shop | 2 |

### Zero-offer products (sample)


---

## 6. Regions (displayability)

| Region | Configured (has offers) | Products w/ region offers | Displayable | Coverage % | Displayable % |
|---|---|---:|---:|---:|---:|
| NL | true | 623 | 623 | 100 | 100 |
| DE | true | 623 | 252 | 100 | 40 |
| FR | false | 623 | 0 | 100 | 0 |
| BE | false | 623 | 0 | 100 | 0 |
| UK | true | 623 | 256 | 100 | 41 |
| US | true | 623 | 3 | 100 | 0 |
| ZA | false | 623 | 0 | 100 | 0 |

---

## 7. Affiliate link quality

| Check | Result |
|---|---|
| `/go` redirect route | true |
| Affiliate disclosure page | true |
| Disclosure component | true |
| Offers with `affiliateUrl` field | 0 |
| Offers with direct URL only | 1293 |

Most offers store canonical retailer URLs; /go resolver attaches affiliate tags at click time when programs/env are configured. affiliateUrl field is optional.

---

## 8. Commercial independence

**Conclusion:** Suspicious commission/score mixing patterns detected — see findings.

| Signal | Value |
|---|---|
| Suspicious commission→score mixes | 3 |
| Featureability mentions commission | false |

### Findings (sample)

- **SUSPICIOUS_MIX** `src/domain/site-quality/audits/links-trust-perf.ts` — 141:    if (/commission|payout|cpcBid/i.test(src) && /score\s*\+|boost/i.test(src)) {
- **SUSPICIOUS_MIX** `src/domain/site-quality/audits/links-trust-perf.ts` — 144:          evidence: "Commerce ranking appears to mix commission into scores",
- **SUSPICIOUS_MIX** `src/domain/site-quality/audits/links-trust-perf.ts` — 146:          recommendedFix: "Remove commission from ranking inputs",
- **NEUTRAL_CONFIG** `src/domain/commerce/ranking.ts` — DEFAULT_OFFER_RANKING keys inspected — commission intentionally absent in type comments
- **EXPLICIT_NEUTRALITY** `src/domain/finders/scoring.ts` — Finder scoring documents affiliate neutrality

_Neutral “commission never…” documentation mentions are counted separately in JSON._

---

## 9. Evidence

| Corpus | Total | With evidenceIds | Without | Coverage % |
|---|---:|---:|---:|---:|
| Catalog Evidence records | 28 | — | — | — |
| Products | 623 | 600 | 23 | 96.3 |
| Reviews | 585 | 585 | 0 | 100 |
| Best guides | 58 | 45 | 13 | 77.6 |
| Buying guides | 68 | 0 | 68 | 0 |

### Evidence records by type

- editorial-research: 16
- manufacturer: 10
- independent-review: 1
- user-feedback: 1

---

## 10. Trust pages

| Page | Exists | Stub heuristic | Path |
|---|---|---|---|
| about | true | false | /about |
| howWeReview | true | false | /how-we-review |
| methodology | true | false | /methodology |
| affiliateDisclosure | true | false | /affiliate-disclosure |
| contact | true | true | /contact |
| privacy | true | false | /privacy |
| terms | true | false | /terms |
| authorsIndex | true | false | /authors |
| editorialPolicy | true | false | /editorial-policy |
| evidencePolicy | true | false | /evidence-policy |
| scoringMethodology | true | false | /scoring-methodology |

### Notes

- No dedicated /editorial-policy route found — editorial stance may live in about/methodology/how-we-review.
- No dedicated /evidence-policy route found — Evidence types listed on /methodology.
- No dedicated /scoring-methodology route found — scoring described on /methodology and /how-we-review.

---

## 11. Authorship

- **Kitletics Editorial** (`kitletics-editorial`) — genericEditorial=true, bioChars=375, photo=false

| Metric | Count |
|---|---:|
| Reviews missing authorId | 585 |
| Unknown authorIds on reviews | 1 |
- Reviews by `undefined`: 585

---

## 12. First-hand disclosure

| Metric | Count |
|---|---:|
| Declared first-hand-test | 0 |
| Declared hybrid | 0 |
| Declared expert-research | 585 |
| Visible first-hand/hybrid (with personal-test evidence gate) | 0 |
| Declared first-hand/hybrid downgraded (no personal-test evidence) | 0 |

_No reviews declared first-hand/hybrid or carrying personal-test evidence._

---

## 13. User ratings

- AggregateRating / reviewCount mentions in `src`: **10** (includes audit detectors).
- Production `reviewJsonLd`: uses `reviewRating` (Rating), not AggregateRating.
- Production `productJsonLd`: omits AggregateRating.
- **BLOCKER flag:** false

---

## 14. Public trust language

| Phrase | Hits |
|---|---:|
| expert tested | 0 |
| independently tested | 0 |
| thousands of runners | 0 |
| most popular | 0 |
| #1 rated | 0 |
| lab tested by us | 0 |
| we tested every | 0 |
| scientifically proven | 0 |

### Exact locations (sample)

_No matches for configured unsupported phrases._

---

## 15. Summary (raw coverage & issues)

| Item | Value |
|---|---:|
| Media authentic coverage % | 100 |
| Media gaps | 0 |
| Running shoe media issues | 0 |
| Duplicate hero groups | 0 |
| Products with zero offers | 0 |
| Stale offers | 0 |
| Regions with offer rows | 4 |
| Product evidence coverage % | 96.3 |
| Review evidence coverage % | 100 |
| Authors defined | 1 |
| Visible first-hand reviews | 0 |
| Fake rating BLOCKER | false |
| Trust phrase hits | 0 |
| Commercial suspicious mixes | 3 |

Missing dedicated trust routes: none

---

## Notes

- No fixes applied.
- Offer URL sampling is partial; failures may be bot-blocking rather than true 404s.
- “Most popular” / similar phrases may be legitimate comparative copy — listed for review, not auto-classified as false.
