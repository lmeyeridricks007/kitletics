# Kitletics — Final rendered-quality remediation audit

**Document ID:** `FINAL-RENDERED-QUALITY-REMEDIATION-AUDIT`  
**Clock:** 2026-09-12  
**Lab:** clean `npm run build` + `next start` on `http://127.0.0.1:3020`  
**Method:** every indexable sitemap URL fetched as production HTML. Fixes are proven from **rendered output**, not from prior CSV statuses or source-only diffs.

Do not treat READY / field-populated / Jaccard / HTTP 200 as proof of public quality.

---

VERDICT:

**GO WITH MINOR ISSUES**

The uniqueness-stamp disaster is gone from public HTML. A shopper no longer sees `skuslug…`, concatenated-token methodology, or a padel racket on “How to Choose a Running Watch”.

It is **not GO**: required zeros for BROKEN decision copy and WRONG_SPORT are not met. A residual uniqueness-era skip line (`I'd pause if not a …` / `Look elsewhere if not a …`) still renders on a bounded set of PDPs and reviews, and four padel/fitness brand hubs still attach a running-shoe photograph.

It is **not NO-GO**: that residue is not the previous systemic identifier leak (829 URLs) or machine Buy-If factory (226 URLs).

---

## Required zeros (proven on this crawl)

| Condition | Required | This crawl | Met? |
| --- | ---: | ---: | --- |
| Visible token leakage URLs | 0 | **0** / 1162 | YES |
| `"concatenated … token"` | 0 | **0** | YES |
| `skuslug` / `skuid` | 0 | **0** | YES |
| MACHINE_LIKE decision blocks | 0 | **0** | YES |
| BROKEN decision blocks | 0 | **12** PDPs | NO |
| Homepage Running Watch → padel file | 0 | **0** (`guide-how-to-choose.jpg` absent from `/`) | YES |
| Running Watch → skyline hero | 0 | **0** (`urban-dusk.jpg` absent from homepage, `/best/running-watches`, `/guides/how-to-choose-running-watch`) | YES |
| WRONG_SPORT (known fillers, proven HTML) | 0 | **4** brand hubs (`adidas-padel`, `bullpadel`, `nox`, `tyr`) still include `/images/home/guide-running-shoes.jpg` | NO |
| WRONG_PRODUCT (page hero ≠ product) | 0 | **0** proven hero mismatches after excluding related-card noise | YES |
| WRONG_BRAND | 0 | **0** | YES |
| WRONG_CONTENT_TYPE (known filler on wrong topic) | 0 | **4** (same four hubs) | NO |

Naive filename classification of **every** `<img>` on mixed hubs produces thousands of WRONG_CONTENT_TYPE / WRONG_PRODUCT hits (related product cards, site chrome). Those are **not** remaining public defects. The table above uses HTML-proven fillers and decision-block classifiers only.

---

## Old vs new

| Metric | BEFORE (live production forensic) | AFTER (this production-like crawl) |
| --- | ---: | ---: |
| Sitemap / indexable URLs | 1167 | **1162** (HTTP 200 on all 1162) |
| URLs with ≥1 content-quality problem (token / machine / wrong image) | 952 | **44** remaining (see CSV) |
| Token-leak URLs | 829 | **0** |
| HTML machine-copy URLs (forensic `has_machine`) | 226 | **41** (all `I'd pause if not a` / `look elsewhere if not a` remnants — **not** `already decided the lane` / `headline trait`) |
| MACHINE_LIKE decision blocks | 452 Buy If lines in overlay scan | **0** |
| Image-issue URLs (forensic) | 142 | **4** proven cross-sport filler hubs |
| Homepage watch card = padel `guide-how-to-choose.jpg` | 114 sitemap reuses of that file; homepage featured card wrong | **0** on homepage; watch guide uses `/images/watches/guides/…` |
| NYC skyline `urban-dusk.jpg` on watch guides | 92 URLs including Best watches | **0** on homepage / Best watches / How to choose a running watch |

BEFORE source: [`FINAL-RENDERED-CONTENT-MEDIA-FORENSIC-AUDIT.md`](FINAL-RENDERED-CONTENT-MEDIA-FORENSIC-AUDIT.md).

---

## How this audit was run

1. **Clean CI**
   - `npm run lint` — pass (1 unused-var warning in `scripts/tmp/`)
   - `npm run typecheck` — pass
   - `npm test` — **782 passed / 7 failed**. The 7 failures are the known NL pricing set (`commerce-freshness`, `product-page` From-price, `catalog` regional price, `search-discovery` price facet). Not newly caused by this audit.
   - `npm run build` — pass (after `rm -rf .next`; a first `next start` on a Turbopack-polluted `.next` 500’d most routes and was discarded)
2. **Serve** `npx next start -p 3020` against that clean build.
3. **Canonical sitemap**
   - `GET /sitemap.xml` → **1162** `<loc>` entries, not a sitemap index.
   - `src/app/sitemap.ts` inventory: **1162** (same count).
4. **Crawl every indexable URL** (`scripts/tmp/rendered-quality-remediation-html-crawl.ts`)
   - 1162 / 1162 fetched
   - **0** HTTP non-200 on the clean server
   - Visible text = HTML minus script/style, decoded
   - Token / machine / decision / known-filler detectors applied to that text and `<img>` / `og:image` / `/_next/image?url=` paths

Crawl artifacts:

- [`data/REMEDIATION-HTML-CRAWL.csv`](data/REMEDIATION-HTML-CRAWL.csv) — one row per URL  
- [`data/REMEDIATION-HTML-CRAWL-SUMMARY.json`](data/REMEDIATION-HTML-CRAWL-SUMMARY.json)  
- [`data/FINAL-RENDERED-QUALITY-REMEDIATION-REMAINING.csv`](data/FINAL-RENDERED-QUALITY-REMEDIATION-REMAINING.csv) — **remaining OPEN issues only**

A first crawl against the polluted `.next` (1033× HTTP 500) was **thrown out**. It is not used below.

---

## Token leakage — proven gone

On all 1162 rendered bodies:

- `skuslug` / `skuid` / `skuslugasics…` — **0**
- `concatenated … token` — **0**
- spec stamps (`255gweightasics…`, `41mmheelstack…`) — **0**
- `[object Object]` / bare `undefined` / `NaN` — **0**

Spot-check of `/reviews/asics-novablast-6` HTML: none of those strings exist. The old Novablast methodology dump is not in the served page.

This is the opposite of the forensic state (333/373 reviews leaking stamps).

---

## Decision copy

| Class | Indexable pages (this crawl) |
| --- | ---: |
| MACHINE_LIKE (`already decided the lane`, `headline trait`, `whatever X optimizes for`, …) | **0** |
| BROKEN (`Look elsewhere if not a …`, `I'd pause if not a …` inside a decision window) | **12** product pages |

The 12 BROKEN PDPs still print skip lines such as:

- Novablast 6: `I'd pause if not a stability shoe shows up often in your week.`
- OOFOS: `Look elsewhere if Not a running shoe.`
- Houdini: `Look elsewhere if Not a fully waterproof storm shell.`

Those are uniqueness-era templates. They are **not** the 226-URL “already decided the lane” factory. They **are** still unprofessional on those 12 PDPs (and the same phrase appears in ~29 review/best/brand HTML bodies as HIGH).

Verdict-card **Buy if / Skip if** on Novablast 6 *is* readable consumer copy:

> Buy if: You're looking for a soft, energetic daily trainer. You want enough cushioning for long runs without a heavy ride.  
> Skip if: You need added stability or guidance. You're primarily looking for the lightest race-day option.

The broken sentence sits in the **summary / bottom line**, not in those bullets.

---

## Images

### Homepage / Running Watch (forensic P0)

Rendered homepage HTML (`/`):

- **Does not** include `/images/home/guide-how-to-choose.jpg`
- **Does not** include `/images/brands/heroes/urban-dusk.jpg`
- Watch-related files are actual watch packshots (`garmin-forerunner-970-hero.jpg`, `coros-pace-pro-hero.png`, …)

`/guides/how-to-choose-running-watch` hero is `/images/watches/guides/concepts/gps-watch-wrist-run.jpg` plus GPS running photography — not a padel racket, not a skyline.

`/best/running-watches` uses `/images/running/best-hub/best-gps-watches-running.jpg` and watch product heroes.

### Remaining WRONG_SPORT (proven)

These four indexable brand hubs still embed `/images/home/guide-running-shoes.jpg` in production HTML:

| Path | Hub topic |
| --- | --- |
| `/brands/adidas-padel` | Padel |
| `/brands/bullpadel` | Padel |
| `/brands/nox` | Padel |
| `/brands/tyr` | Fitness / HYROX |

That is the same association bug the rendered-quality gate flagged. `media:ci` can still call the file authentic; the **subject is wrong for the page**.

Classifier noise **not counted as remaining**:

- Related product thumbnails on a brand/PDP (other models)
- `/images/home/hero-gear-composite.png` in site chrome on gel/fuel reviews
- Blackroll packshots on foam-rolling / recovery guides (right product; sport-tag mismatch)

---

## Manual quality review (every required template)

Reviewed from **served production HTML** (h1, visible text, image paths). Headless pixel screenshots were not available in this environment (`patchright` unresolved; Playwright is listed in `package.json` but not present under `node_modules`). Image claims below are from HTML `src` plus the files those paths name.

| Template | URL | Shopper read |
| --- | --- | --- |
| Homepage | `/` | Professional hub. Finder, sports, watch cards use watch photos. No token dump. |
| Running | `/running` | Professional sport hub. Categories, best strips, brand logos. |
| Running Shoes | `/running/shoes` | Catalog + best strip. Novablast 6 as best overall. Readable. |
| Running Watches | `/running/watches` | GPS watch catalog. Not a skyline, not a racket. |
| PDP | `/products/asics-novablast-6` | Specs and Best for are fine. **Broken pause sentence still in overview.** “No verified retailer offers in your region” is a pricing issue (known NL), not token leak. |
| Review | `/reviews/asics-novablast-6` | See Novablast section below. |
| Best | `/best/daily-trainers`, `/best/running-watches` | Editor-style ranking copy. No stamps. Watch best-of uses watch photography. |
| Guide | `/guides/how-to-choose-running-watch` | Long-form GPS guide. Watch photography. Professional. |
| Comparison | `/compare/asics-novablast-6-vs-brooks-ghost-18` | Clear contrast: energetic vs approachable. No stamps. |
| Alternatives | `/products/asics-novablast-6/alternatives` | Useful peer grouping. **Still prints `heelStack 41.5` in the intro** (internal catalog field). |
| Brand | `/brands/asics` | Family map, standouts. Readable. |
| Finder | `/tools/running-shoe-finder` | Clean wizard. No garbage copy. |
| Database | `/running/shoes/database` | Spec explorer, 85 shoes. Data-product voice, not token stamps. |

### Novablast 6 — would a shopper call this professionally written?

**Mostly, with one sentence that still fails that test.**

The uniqueness fingerprints that used to own this URL are gone. The page now reads as a research-based buying guide: FF BLAST MAX, trampoline pod, 8 mm drop, 253 g, daily trainer vs race-day, Buy if / Skip if bullets a human could say in a shop.

The summary still contains:

> I'd pause if not a stability shoe shows up often in your week.

That is not how a professional editor writes. It is a leftover uniqueness-era skip template. Until that line is rewritten, a careful shopper would notice one broken sentence in an otherwise usable review — not a wall of `skuslug` garbage.

Review type on the page is honest: Expert Research Review, not a first-hand wear test.

---

## Remaining issues

Complete remaining OPEN list (proven HTML only):

[`data/FINAL-RENDERED-QUALITY-REMEDIATION-REMAINING.csv`](data/FINAL-RENDERED-QUALITY-REMEDIATION-REMAINING.csv)

**46 rows · 16 BLOCKER · 30 HIGH · 46 URLs**

| Band | What remains |
| --- | --- |
| BLOCKER | 12 PDPs with BROKEN skip lines; 4 padel/fitness brand hubs with a running-shoe guide photo |
| HIGH | 29 pages still containing `I'd pause if not a` / `look elsewhere if not a` in body HTML (including Novablast 6 review); 1 alternatives intro with `heelStack` |

There is **no remaining visible token-leak class**.

---

## What would make this GO

1. Rewrite the 12 BROKEN skip lines (and the ~29 HIGH siblings) into normal English. Example: “Skip it if you need a stability shoe most days.”
2. Stop attaching `/images/home/guide-running-shoes.jpg` to padel/fitness brand hubs.
3. Stop printing catalog keys (`heelStack`) on alternatives intros.

Until (1) and (2) are gone from **rendered HTML**, the required-zero table cannot all read 0.

---

## CI snapshot (this clock)

| Command | Result |
| --- | --- |
| `npm run lint` | pass |
| `npm run typecheck` | pass |
| `npm test` | 782 pass / **7 fail** (known NL pricing; ignored) |
| `npm run build` | pass (clean `.next`) |
| Production crawl | **1162 / 1162 HTTP 200** |

A release still **cannot** claim READY from `media:ci` authenticity or review word-count. This crawl is the evidence.

---

## Appendix — crawl contract

- Base: `http://127.0.0.1:3020` (production `next start`, not `next dev`)
- Indexable source: `sitemap()` ∪ served `/sitemap.xml` (both 1162)
- No reuse of `FULL-RENDERED-QUALITY-ISSUES.csv` OPEN/FIXED flags
- Naive image-classifier dump (6363 IMAGE_SEMANTIC rows from related cards / chrome) is **not** the remaining queue; it is in `REMEDIATION-REMAINING-ISSUES.csv` if someone needs to inspect detector noise
