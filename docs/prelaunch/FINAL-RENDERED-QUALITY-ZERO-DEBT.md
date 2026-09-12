# Kitletics — Final rendered-quality zero-debt audit

**Document ID:** `FINAL-RENDERED-QUALITY-ZERO-DEBT`  
**Clock:** 2026-09-12  
**Lab:** clean `npm run build` + `next start` on `http://127.0.0.1:3020`  
**Queue entering this cleanup:** 46 OPEN rows (16 BLOCKER, 30 HIGH) from [`FINAL-RENDERED-QUALITY-REMEDIATION-AUDIT.md`](FINAL-RENDERED-QUALITY-REMEDIATION-AUDIT.md)

Do not treat READY / field-populated / Jaccard / HTTP 200 as proof of public quality. This document is proven from **rendered HTML**.

---

VERDICT:

**GO**

BLOCKER rendered-quality defects = **0**. HIGH rendered-quality defects = **0**.

The uniqueness-era skip family (`I'd pause if not…` / `Look elsewhere if not…`), the four wrong-sport brand-hub fillers, and public camelCase catalog keys are gone from indexable HTML. A shopper can read the Novablast, OOFOS, Houdini, alternatives, and padel/TYR brand canaries as ordinary buying copy.

This was a bounded cleanup on the 46-row queue. It was not another site-wide rewrite.

---

## Required zeros (proven on rendered HTML)

| Condition | Required | This cleanup | Met? |
| --- | ---: | ---: | --- |
| HTTP 200 on every sitemap URL | 1162 / 1162 | **1162 / 1162** | YES |
| Visible token leakage | 0 | **0** | YES |
| `skuslug` / `skuid` | 0 | **0** | YES |
| `"concatenated … token"` | 0 | **0** | YES |
| MACHINE_LIKE decision blocks | 0 | **0** | YES |
| BROKEN decision blocks | 0 | **0** | YES |
| `"I'd pause if not"` | 0 | **0** | YES |
| `"Look elsewhere if not"` | 0 | **0** | YES |
| WRONG_SPORT known fillers | 0 | **0** (`guide-running-shoes.jpg` absent from `/brands/adidas-padel`, `/brands/bullpadel`, `/brands/nox`, `/brands/tyr`) | YES |
| WRONG_PRODUCT hero (page product ≠ file) | 0 | **0** proven hero mismatches | YES |
| WRONG_BRAND | 0 | **0** | YES |
| WRONG_CONTENT_TYPE known fillers | 0 | **0** | YES |
| Raw public catalog keys (`heelStack`, `cushionLevel`, `rideCharacter`, `plateMaterial`, …) | 0 | **0** | YES |

Naive filename classification of **every** `<img>` on mixed hubs still produces thousands of WRONG_CONTENT_TYPE / WRONG_PRODUCT hits (related product cards, site chrome). Those are **not** remaining public defects. Same method as the V1 remediation audit: known fillers + decision-block classifiers + visible-text detectors only.

---

## Metric table

| Metric | Original | Remediation V1 | Final |
| --- | ---: | ---: | ---: |
| Token leak | 829 | 0 | **0** |
| Machine-like | 226 | residual uniqueness-era skip family (41 HTML URLs) | **0** |
| Broken decision | unknown / original | 12 | **0** |
| Proven wrong-sport | 142 original image-issue URLs | 4 | **0** |
| Remaining BLOCKER | 9649 original issue rows | 16 | **0** |
| Remaining HIGH | 600 original issue rows | 30 | **0** |

Original = live production forensic ([`FINAL-RENDERED-CONTENT-MEDIA-FORENSIC-AUDIT.md`](FINAL-RENDERED-CONTENT-MEDIA-FORENSIC-AUDIT.md)).  
Remediation V1 = [`FINAL-RENDERED-QUALITY-REMEDIATION-AUDIT.md`](FINAL-RENDERED-QUALITY-REMEDIATION-AUDIT.md) (`GO WITH MINOR ISSUES`).  
Final = this cleanup.

Headline:

- Token leak: **829 → 0 → 0**
- Machine-like: **226 → residual legacy family → 0**
- Broken decision: **unknown/original → 12 → 0**
- Proven wrong-sport: **142 → 4 → 0**
- Remaining BLOCKER: **9649 → 16 → 0**
- Remaining HIGH: **600 → 30 → 0**

Remaining OPEN rows: [`data/FINAL-RENDERED-QUALITY-ZERO-DEBT.csv`](data/FINAL-RENDERED-QUALITY-ZERO-DEBT.csv) — header only.

---

## 1. Broken decision sentences — root source

Not 41 page-level patches. One generator family concatenated a catalog weakness into a skip template.

| Layer | Location |
| --- | --- |
| Source field | Product `weaknesses[0]` / review `whoShouldAvoid` / Best Guide `whyItFits` / product `verdict` patches. Typical seed: `"not a stability shoe"`. |
| Generator | Uniqueness-era templates: `I'd pause if ${weakness} shows up often in your week.` and `Look elsewhere if ${pause}.` Lived in `synthesize.ts`, `enrich-review-*.ts`, `review-longform.ts`, NMW / gear-core / weak-cats `buildReview()`, Best Guide P1/P2 `whyItFits`. |
| Transformation | Weakness already started with `"not a"` → public English collapsed: `I'd pause if not a stability shoe shows up often in your week.` |
| Consumer | PDP `getProductReviewSummary` (raw `review.summary` / `product.verdict`), review enricher, Best Guide `whyItFits`, decision-copy `salvageDecisionLine`. |

**Fix:** `src/lib/review/rewrite-uniqueness-era-skip.ts`

- `skipSentenceFromLimitation()` is the only skip-line builder for new copy.
- `rewriteUniquenessEraSkipProse()` / `sanitizePublicReview()` rewrite leftover records at merge, enrich, PDP, and Best Guide render.
- `salvageDecisionLine()` also converts leftover `"Not a …"` fragments so Not Ideal For cannot become `Those looking for not a running shoe`.

Spoken replacements follow the product, not a stamp:

- Novablast: “Skip it if you need a stability shoe for most of your training.”
- OOFOS: “Skip it if you're looking for a shoe designed for running.”
- Houdini: “Choose another jacket if you need full waterproof protection.” / “You need a fully waterproof storm shell.”

---

## 2. Four wrong-sport brand hub images

**Defect:** `/brands/adidas-padel`, `/brands/bullpadel`, `/brands/nox`, `/brands/tyr` rendered `/images/home/guide-running-shoes.jpg`.

**Root:** `guideSlugsForCategories()` treated any category id containing `"shoe"` as running shoes, so padel/training hubs attached `how-to-choose-running-shoes`. `TOPIC_ALLOWED_SUBJECTS.training_shoes` also allowed running-shoe photos.

**Fix (resolver, not four JSX exceptions):**

- Running-shoe guides attach only to `cat-running-shoes`.
- Padel hubs resolve padel imagery (`topicHint: padel_rackets`).
- TYR / training hubs resolve fitness / training imagery (`topicSport(training_shoes) = "fitness"`). Running-shoe photography is incompatible.

Rendered proof: those four hubs do not include `guide-running-shoes.jpg`. Padel hubs show padel product photography. TYR shows `/images/training/products/tyr-cxt-1-hero.jpg`.

Regression: `tests/rendered-quality-zero-debt.test.ts` asserts padel and TYR hubs cannot resolve a running-shoe fallback, and that `isSemanticallyCompatible(guide-running-shoes.jpg, training_shoes)` is false.

---

## 3. Raw catalog field names

**Defect:** Novablast alternatives intro printed `heelStack`.

**Root:** `specBit()` in `src/lib/product/alternative-decision-copy.ts` interpolated the schema key.

**Fix:** canonical formatter `src/lib/specs/public-label.ts` (`formatPublicSpecKey`, `formatPublicSpecCue`, `formatPublicSpecDisplayLabel`). Wired into alternatives copy, PDP/review/best/comparison spec tables, and product cards.

Public copy that named keys in prose (`cushionLevel`, `rideCharacter`, `plateMaterial`) was rewritten in buying-guide / FAQ / comparison / Best Guide methodology strings. Rendered alternatives now say `heel stack 41.5`.

---

## 4. Uniqueness-era template family — classification

Searched source + generated data for the full family, not only the two audit phrases.

| Pattern | Class | Disposition |
| --- | --- | --- |
| `I'd pause if not…` / `Look elsewhere if not…` / `shows up often in your week` | PUBLIC_BAD | Rewritten at source + sanitizer. **0** in rendered HTML. |
| `already decided the lane` / `headline trait` / `whatever X optimizes for` | PUBLIC_BAD | Already 0 after V1. Regression tests keep them banned. |
| `I'd pause if weight/price…` (editor voice) | INTERNAL_LEGITIMATE | Allowed. Voice skill uses this. Not the broken `if not a` family. |
| `I'd pause if ${weakness} shows up…` in `scripts/tmp/prelaunch-16/17/39` | DEAD_LEGACY | Generators now call `skipSentenceFromLimitation()`. |
| `tests/rendered-quality-zero-debt.test.ts` / `decision-copy.test.ts` banned strings | TEST_FIXTURE | Kept. |
| `intendedJob` / `skuSlug` as TypeScript keys | INTERNAL_LEGITIMATE | Not rendered. |

No PUBLIC_BAD occurrence remains in rendered HTML.

---

## 5. Legacy generator paths

Public skip construction now goes through `skipSentenceFromLimitation()`. Live synthesizers, review enrichers, longform, NMW/gear/weak-cats `buildReview()`, and Best Guide enrichers no longer emit `I'd pause if ${weakness} shows up`. Dead `scripts/tmp/prelaunch-16/17/39` generators were updated so a re-run cannot reintroduce the family.

---

## 6. Regression tests

`tests/rendered-quality-zero-debt.test.ts` (plus `tests/decision-copy.test.ts`):

- Novablast 6 PDP + review
- OOFOS / Houdini PDPs
- Novablast alternatives (no `heelStack`)
- adidas-padel / bullpadel / nox (no running-shoe fallback; padel-compatible card images)
- TYR (no running-shoe fallback; training/fitness-compatible)
- Alternatives / public spec labels
- Banned: `I'd pause if not`, `Look elsewhere if not`, `already decided the lane`, `headline trait`, `skuslug`, `concatenated`, `heelStack`

---

## 7. CI

Clean `rm -rf .next` then:

| Command | Result |
| --- | --- |
| `npm run lint` | Pass (pre-existing unused-var warning in `scripts/tmp/forensic-rendered-quality-scan.ts`) |
| `npm run typecheck` | Pass |
| `npm test` | **791 passed / 7 failed** (798 tests). Failures are the **same NL pricing set** as V1: `commerce-freshness` (2), `product-page` From-price (3), `catalog` regional NL price, `search-discovery` price facet. Not created by this cleanup. |
| `npm run build` | Pass (clean `.next`, then subsequent rebuilds after copy polish) |

---

## 8. Full rendered proof

1. Production `next start -p 3020` against the clean build (not Turbopack).
2. Canonical sitemap inventory **1162** URLs.
3. HTML crawl of every sitemap URL (visible text = HTML minus script/style).
   - First production crawl after skip/image/spec-label work: **1162 crawled**, **0** token / machine-like / broken / known-filler.
   - 121 brand/compare GETs aborted at 30s under load; **121/121 retry HTTP 200**.
   - Required-zero recrawl after rebuild: **1162/1162 HTTP 200**, **0** token, **0** `I'd pause if not`, **0** `Look elsewhere if not`, **0** known-filler WRONG_SPORT.
   - Two leftover camelCase keys (`cushionLevel` in one comparison explanation + one cushioning FAQ) were rewritten, rebuilt, and recrawled **200 / raw=false**.

Artifacts:

- [`data/ZERO-DEBT-HTML-CRAWL-SUMMARY.json`](data/ZERO-DEBT-HTML-CRAWL-SUMMARY.json)
- [`data/FINAL-RENDERED-QUALITY-ZERO-DEBT.csv`](data/FINAL-RENDERED-QUALITY-ZERO-DEBT.csv) — **0 OPEN rows**
- Full per-URL crawl from the TS crawler: `data/ZERO-DEBT-HTML-CRAWL.csv` (when present) / `data/REMEDIATION-HTML-CRAWL.csv`

---

## 9. Manual canary review (shopper read)

Read as a shopper on production HTML, not detector output.

| URL | Shopper read |
| --- | --- |
| `/products/asics-novablast-6` | Skip If is ordinary English: need added stability / not a race-day racer / skip it if you need a stability shoe for most of your training. No generator grammar. |
| `/reviews/asics-novablast-6` | Same decision, readable. |
| `/products/asics-novablast-6/alternatives` | Spec cue is `drop 8, heel stack 41.5, weight 253` — consumer labels. |
| `/brands/adidas-padel` | Padel product photography. No running-shoe filler. |
| `/brands/bullpadel` | Padel rackets. No running-shoe filler. |
| `/brands/nox` | Padel rackets. No running-shoe filler. |
| `/brands/tyr` | TYR training shoe photography. No running-shoe filler. |
| `/products/oofos-ooriginal` | Skip: you need a running shoe / looking for a shoe designed for running. |
| `/products/patagonia-houdini-men` | Skip: you need a fully waterproof storm shell. |

**Would this look professionally written and curated if I had never seen the implementation?** Yes. The bounded uniqueness-era residue that made V1 “GO WITH MINOR ISSUES” is gone. Some recovery/apparel PDPs still carry extra skip lines from multiple sources; they are grammatical consumer English, not the broken `if not a` family, and they were not in the 46-row BLOCKER/HIGH queue.

---

## What was not expanded

- No new review section images.
- No unrelated editorial rewrite of Buy If / Best For that already classified GOOD.
- NL pricing test failures left as the pre-existing baseline (7 failures, unchanged set).
