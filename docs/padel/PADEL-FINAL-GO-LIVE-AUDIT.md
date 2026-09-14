# Padel final go-live audit

**Document ID:** `PADEL-FINAL-GO-LIVE`  
**Clock:** 2026-09-14  
**Lab:** clean `.next` → lint → typecheck → test → build → `next start` on `http://127.0.0.1:3011`  
**Method:** repository eligibility inventory + full rendered production HTML crawl (`scripts/tmp/padel-prelaunch-audit.ts`, `AUDIT_MODE=final`, 781 URLs, concurrency 4) + manual canaries  
**Rule:** READY / field-populated / word count / HTTP 200 / image existence are **not** proof of quality. Only rendered HTML + semantic checks count.

**Audit-only unblockers (not content remediations):** `CatalogProductMediaSource.retrievedAt`, soft-goods offer helper typing, admin `<Link />`, two `prefer-const` / unused-const lint fixes. These existed only to obtain a production build. They do not fix media, copy, or tests.

Artifacts:

| File | Role |
| --- | --- |
| [`data/PADEL-FINAL-URL-INVENTORY.csv`](data/PADEL-FINAL-URL-INVENTORY.csv) | Full Padel URL universe + disposition |
| [`data/PADEL-FINAL-URL-CRAWL.csv`](data/PADEL-FINAL-URL-CRAWL.csv) | Per-URL crawl evidence |
| [`data/PADEL-FINAL-ISSUES.csv`](data/PADEL-FINAL-ISSUES.csv) | Issues + validation |
| [`data/PADEL-FINAL-CATALOG-COVERAGE.csv`](data/PADEL-FINAL-CATALOG-COVERAGE.csv) | Per-category coverage |
| [`data/PADEL-FINAL-SCORECARD.json`](data/PADEL-FINAL-SCORECARD.json) | Verdict + required zeros |

---

## VERDICT: **NO-GO**

Required zeros are not met. A serious Padel shopper would not treat the soft-goods catalog as professionally researched: hundreds of public PDPs show another product’s hero (HEAD Pro S balls, Wilson overgrip, Nox paletero, Bullpadel protector), Padel shoe copy still prints `genderFit`, and one indexable review is titled for the wrong shoe.

Rackets, hub, Best racket guides, Finder, and database are closer to launch quality. That does not make the vertical launch-ready.

---

## 1. Clean production build / CI

| Step | Result | Notes |
| --- | --- | --- |
| `rm -rf .next` | OK | |
| `npm run lint` | **PASS** (0 errors / 7 warnings) after admin Link unblocker; **FAIL** on first pass (17 errors) | |
| `npm run typecheck` | **PASS** after media `retrievedAt` + offers helper; **FAIL** on first pass (216 errors) | |
| `npm test` | **FAIL** | 3 failed / 915 passed / 918 |
| `npm run build` | **PASS** after type + lint unblockers; **FAIL** on first pass | |
| `next start :3011` | **PASS** | Crawl base |

Failing tests (stale vs current UX, plus SEO):

1. `tests/padel-hub.test.ts` — contextual rail no longer includes Finder / Guides / Database in the primary visible set (moved to overflow).
2. `tests/padel-remediation-regression.test.ts` — hub now **links** `/padel/accessories`; test still expects held/unlinked.
3. `tests/seo-indexation.test.ts` — sitemap still contains known duplicate orphan shells.

Section 27: **do not classify GO with known failing tests.**

---

## 2. Full URL inventory

Universe: **1085** Padel paths.

| Disposition | Count | Robots expectation |
| --- | ---: | --- |
| INDEXABLE | **530** | `index,follow` · in sitemap |
| PUBLIC_NOINDEX | **251** | `noindex,follow` · not in sitemap |
| HIDDEN_404 | **304** | not public |

By page type (all dispositions):

| Type | Count | Indexable |
| --- | ---: | ---: |
| product | 458 | 316 |
| alternatives | 458 | 83 |
| brand | 42 | 24 |
| best-guide | 39 | 26 |
| buying-guide | 26 | 21 |
| review | 26 | 26 |
| comparison | 21 | 21 |
| category | 7 | 6 (`/padel/clothing` held) |
| research | 4 | 3 (prices withheld) |
| sport-hub / database / finder / setup | 1 each | all indexable |

**Inventory gap:** `/padel/collections` renders **200** and is not in this inventory script. Treat as extra public surface, not as a counted INDEXABLE row.

`/padel` hub is **INDEXABLE**. `/padel/accessories` is **INDEXABLE**. `/padel/clothing` is held (**404** on crawl).

---

## 3. Crawl everything

Crawled **781** INDEXABLE + PUBLIC_NOINDEX + canary URLs.

| HTTP | Count |
| --- | ---: |
| 200 | 775 |
| ERR abort (timeout) | 4 — all **retry 200** (`/brands/bullpadel`, Jet Premura PDPs/alts) |
| 404 | 1 — `/padel/clothing` (held, expected) |

Indexable crawled: 530. Confirmed broken indexable URLs after retry: **0**.

Canaries (`/padel`, rackets, shoes, database, Finder, Best balls/bags, representative PDPs/reviews) returned 200 with titles and substantial visible text.

---

## 4. Token forensics

Automated visible token leak (`prod-`, `skuslug`, `skuid`, `maps to`, `weightMin` / `widthOptions` as tokens, debug labels): **0**.

Manual canary “confidence” hits are **false positives** (“High lateral **confidence** for aggressive cutting”).

Pickleball string on every chrome page is the **sports mega-nav link** `/pickleball`, not Padel product imagery.

---

## 5. Machine copy

Automated MACHINE_LIKE + BROKEN decision copy on crawled HTML: **0**.

Does not prove every Buy If/Skip If is excellent — only that the detectors did not fire on BLOCKER/HIGH classes.

---

## 6. Fake claims

Fake first-hand testing: **0**.  
Fake ratings / popularity / aggregateRating: **0**.

---

## 7–8. Media forensics + cross-sport

**AUTHENTIC file existence ≠ correct product.**

| Class | Automated | Validated |
| --- | ---: | --- |
| WRONG_PRODUCT hero | 188 | **CONFIRMED** — PDPs reuse four placeholder files |
| WRONG_BRAND hero | 143 | **CONFIRMED** — overlapping with the same placeholders |
| WRONG_SPORT | 7 | **CONFIRMED** — `/images/home/guide-running-shoes.jpg` on Padel **alternatives** pages |
| Tennis / pickleball **product** placements | 0 | Pickleball is nav chrome only |

Placeholder files stamped across the wrong SKUs:

- `/images/padel/products/head-padel-pro-s-hero.jpg` (e.g. 4ON Pro T1 balls)
- `/images/padel/products/wilson-padel-overgrip-hero.jpg`
- `/images/padel/products/nox-at10-team-paletero-hero.jpg` (Adidas bags)
- `/images/padel/products/bullpadel-frame-protector-3-pack-hero.jpg` (pouches, sprays, wristbands)

Racket PDPs sampled (Vertex 04, Genius 18K) used padel paths and matching identity. Soft-goods are the failure.

---

## 9. Product quality (public PDPs)

Indexable products: **316 / 458**. Hidden 142 stay 404.

Failures that block launch:

- Soft-goods **wrong hero** (majority of 188 product mismatches).
- Shoe copy **`genderFit`** camelCase in rendered Best/PDP text.
- Offers: **93 / 316** indexable products have an NL From-price. Honest no-offer is allowed; most of the catalog still has no verified price.

Identity canary: `/reviews/adidas-courtstabil-padel` title is **Adidas Courtquick Padel Review**.

---

## 10. Commerce

NL sample from scorecard (EUR, specialist/Amazon seeds) looks region-consistent on the named rackets/balls/grips.

Not launch-clean:

- Coverage **93 From-prices / 316 indexable**.
- Soft-goods PDPs that show the wrong product image cannot be trusted for pack/generation/affiliate URL QA by screenshot.
- Balls / grip multipacks / accessory bundles are exactly the families using placeholder heroes.

Automated crawl did not flag currency/region mismatches on the NL canary set.

---

## 11. Recommendation independence

**Code-level pass (not a ranking dump of live commissions):**

- Padel Best methodology copy: “Affiliate commission does not influence considered, shortlisted, recommended, rank, or award decisions.”
- Finder UI: “Affiliate commission never ranks results.”
- `padel-result-roles.ts`: roles use control/power/comfort/value attributes and price as a **value penalty**, never a commission field.
- No `commission` / payout import in Finder scoring.

This is independence of **inputs**, not a proof that every Best shortlist was re-judged after catalog expansion. Soft-goods Best guides exist and are indexable; they sit on top of a catalog with wrong heroes.

---

## 12. Best Guides

39 guides: **26 INDEXABLE**, 11 PUBLIC_NOINDEX, 2 HIDDEN.

Indexable Best pages crawled 200 with 9.8k–26k visible characters. Roles are named (beginner/control/power/value/sweaty hands/pressurizers, etc.) — not a single fixed four.

Remaining risk: shoe Best pages leak `genderFit`; bag/ball/grip winners sit on PDPs with wrong photos.

---

## 13. Reviews

26/26 indexable, long-form (~22k–31k chars). Methodology framing is Expert Research, not fake lab tests (detector 0).

**BLOCKER:** Courtstabil slug vs Courtquick title.

---

## 14. Comparisons

21/21 indexable. Not a full combinatorial grid (458×458). One inventory comparison 404’d in a pre-crawl smoke (`bullpadel-vertex-04-vs-nox-at10-genius-18k-2026`) — that slug is **not** in the 21 published set; do not treat missing combos as indexable spam.

---

## 15. Alternatives

458 alternative URLs: **83 INDEXABLE**, 233 noindex, 142 hidden. Thin/unready pairs are gated. Indexable alts still render **running-shoe guide art** on 7 pages.

---

## 16. Guides (depth)

26 buying guides: **21 INDEXABLE**, 5 PUBLIC_NOINDEX.

| Class | Evidence |
| --- | --- |
| COMPLETE (indexable) | 21 crawled, ~13.6k–16.6k chars, 200, indexable |
| THIN + correctly noindex | 5 new intents (`fast-vs-standard` balls, bag vs backpack, pressurizers, customization, frame protectors) ~4.2k–4.8k chars |
| THIN indexable | **0** in this crawl |

THIN indexable = failure: **not observed**.

---

## 17–18. Indexability + sitemap

- `/padel` indexable and in sitemap expectation.
- Core categories indexable except clothing held.
- Inventory INDEXABLE count **equals** `in_sitemap_expected` (530).
- Quality PDPs: 316 indexable — **but many fail media semantics**, so “indexable” ≠ “should be advertised.”
- Held/thin alternatives and extra Best intents are noindex or 404 as designed.

SEO test still fails on **duplicate orphan shells in sitemap** (sport-wide, not Padel-only). That is a HIGH/CI defect for launch hygiene.

Four crawl aborts were timeouts, not sitemap 404s.

---

## 19. Internal links

Not a full orphan graph. Known issues:

- Accessories **are** linked from the hub (tests expected the opposite).
- Clothing remains unlinked and 404.
- Cross-sport: running guide image on Padel alternatives; pickleball only in global nav.

---

## 20. Structured data

Crawl recorded JSON-LD types per URL (see crawl CSV). Fake aggregateRating detector: **0**.

Raw public schema **`genderFit`** in visible shoe copy is a HIGH required-zero miss (not JSON-LD only).

---

## 21. Performance (representative, not Lighthouse CI)

Warm production hits: hub/categories ~1s; Best rackets ~6s first hit; brand hub `/brands/nox` ~24s cold. Database ~1.7s.

No giant unoptimized asset audit across 316 heroes. Soft-goods reuse small placeholders (payload is not the defect — **identity** is).

---

## 22. Accessibility

No automated axe/Lighthouse critical sweep on all 781 URLs in this pass. **Cannot claim 0 serious/critical a11y.** Treat as **unmet required zero** (unknown ≠ zero).

Manual: Finder is a stepped form with labels; category filters exist. Not a WCAG sign-off.

---

## 23. Mobile

No dedicated mobile-width screenshot pass in this lab. Desktop production HTML only. **Not signed off.**

---

## 24. Manual editorial canaries

Inspected rendered HTML (not regex-only) for hub, six categories, database, Finder, Best rackets/balls/bags, Vertex / Genius 18K / Pro S / Wilson overgrip PDPs, choose-racket guide, shapes research, starter kit, Nox brand.

Shopper test: **No** for the vertical. Racket decision surfaces can look curated; bags/balls/grips/accessories look like a shared stock photo with the wrong SKU name.

Courtstabil/Courtquick review title fails the trust test on its own.

Quota (10 rackets / 15 bags / …) was not a full visual brand check of every SKU — the crawl already proved systematic hero reuse, which is stronger than a 10-page sample.

---

## 25. Category completeness

| Category | Canonical | Public | Indexable | Heroes on public | Spec est. | Defects |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| RACKETS | 62 | 58 | 58 | 58 | 62 | Relatively clean media |
| SHOES | 41 | 28 | 28 | 28 | 41 | `genderFit`; Courtstabil/Courtquick |
| BALLS | 62 | 51 | 51 | 51 | 62 | HEAD Pro S hero reused |
| BAGS | 124 | 83 | 83 | 83 | 124 | Nox paletero hero reused |
| GRIPS | 85 | 50 | 50 | 50 | 85 | Wilson overgrip hero reused |
| ACCESSORIES | 84 | 46 | 46 | 46 | 84 | Bullpadel protector hero reused |

Sport-wide NL From-price: **93 / 316** indexable.

Editorial: reviews 26/26 indexable; Best 26/39; buying 21/26; comparisons 21/21; alternatives 83 indexable.

Clothing: 0 products, category 404.

---

## 26. Required zeros

| Condition | Required | Validated | Met? |
| --- | ---: | ---: | --- |
| BLOCKER | 0 | **340 confirmed** (4 HTTP timeouts = FP) | NO |
| HIGH | 0 | **45** (`genderFit` family) | NO |
| Visible token leakage | 0 | 0 | YES |
| Raw schema leakage | 0 | **45** `genderFit` | NO |
| Machine decision copy | 0 | 0 | YES |
| Broken copy | 0 | 0 | YES |
| Wrong-sport media | 0 | **7** running-shoe guide art | NO |
| Wrong-product hero | 0 | **188** | NO |
| Wrong-brand hero | 0 | **143** | NO |
| Fake testing | 0 | 0 | YES |
| Fake ratings | 0 | 0 | YES |
| Broken indexable URL | 0 | 0 after retry | YES |
| Sitemap invalid URL | 0 | SEO test still flags orphan shells | NO |
| Serious/critical a11y | 0 | **Not audited at required depth** | NO |
| Tests 100% | PASS | **3 failing** | NO |

---

## 27. CI

**FAIL** — tests not 100%. Lint/typecheck/build pass only after audit unblockers.

---

## 28. Output

All five requested artifacts are in `docs/padel/` and `docs/padel/data/`.

**Final verdict: NO-GO.**

Do not ship the Padel vertical until soft-goods heroes are product-correct, `genderFit` is gone from public HTML, the Courtstabil review title matches the product, tests are green, and a11y/mobile canaries are actually run.
