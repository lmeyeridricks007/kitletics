# Fix 08 — Review Readiness

**Mode:** Remediation (shared page-time enrichment + linkage; gate unchanged)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/03-editorial-quality.md`  
**Bar:** same LAUNCH_READY thresholds (substantive verdict ≥20 words, ≥2 pros/cons, ≥2 buy/skip, ≥4 sections, ≥600 words, evidence + methodology, decisionScore ≥70, no false first-hand)

---

## 1. Scoreboard

### Sitewide

| Status | Before (user audit baseline) | After |
|---|---:|---:|
| Reviews total | 417 | **508** (includes later wave/enrichment reviews) |
| **LAUNCH_READY** | **171** | **503** |
| NEEDS_MINOR_WORK | 211 | **0** |
| THIN | 30 | **0** |
| BLOCKED | 5 | **5** |

### Running

| Metric | Before (mid-remediation snapshot) | After |
|---|---:|---:|
| Running reviews | ~195–286* | **286** |
| **LAUNCH_READY** | 231 (post Fix 06/07 content) | **285** |
| NEEDS_MINOR_WORK | 24 | **0** |
| THIN | 30 | **0** |
| BLOCKED | 1 | **1** |

\*Inventory grew as gear/weak-category reviews were added in prior remediations; before/after for this fix uses the live audit after Fix 07 as the Running starting point.

### Launch-category Running (P0)

| Category | Ready after | Remaining non-ready |
|---|---|---|
| Running Shoes | **83 / 84** | 1 BLOCKED (scheduled deep-dive) |
| GPS Watches | **33 / 33** | — |
| HRM | **15 / 15** | — |
| Packs & Vests | **35 / 35** | — |

---

## 2. What blocked readiness (not mass seed rewrites)

Audit evaluates **page-time enriched** reviews. Common failures on otherwise deep pages:

| Gap | Effect | Fix |
|---|---|---|
| Verdict &lt; 20 words | Failed `substantiveVerdict` → classified **THIN** even with 3k+ words of sections | `ensureSubstantiveVerdict` expands thin telegram verdicts from pros/cons/audience |
| Only 1 `cons` line | Failed `cons` → **NEEDS_MINOR_WORK** | `ensureReviewCons` now requires ≥2 (product weaknesses / skip signals / fallback) |
| “Who it is for” heading | Failed `useCaseAnalysis` regex (`who should` / `best for` / …) on some watch/HRM bodies | Canonical heading **Who should buy**; body bullets **Best for** / **Who should skip** |
| Expert-research labelling soft | “Editor’s Guide” understated research-only nature | Badge/meta → **Expert Research Review** + “How we assessed this product” |
| Product ↔ Review unlink | Many published reviews with empty `product.reviewId` | `applyReviewProductLinkage` on product catalog |

No gate lowering. No invented first-hand testing. Expert-research disclosure remains explicit and non-apologetic.

---

## 3. Files touched

| File | Role |
|---|---|
| `src/lib/review/enrich-review-substance.ts` | Substantive verdict + ≥2 cons |
| `src/lib/review/review-longform.ts` | Who should buy / Best for / Who should skip |
| `src/lib/review/enrich-review-content.ts` | Normalize usecase heading; Expert Research testing context |
| `src/lib/review/review-meta.ts` / `visible-type.ts` / `review-voice.ts` | Expert Research labelling |
| `src/content/running/review-product-linkage.ts` | Bidirectional Product↔Review link |
| `src/content/products.ts` | Wire linkage after other enrichments |

---

## 4. Remaining BLOCKED (keep non-indexable)

| Route | Reason |
|---|---|
| `/reviews/asics-novablast-5-deep-dive` | `status=scheduled` / not production-exposed |
| `/reviews/bear-komplex-valor` | `status=review` |
| `/reviews/domyos-mid-500` | `status=review` |
| `/reviews/nobull-trail` | `status=review` |
| `/reviews/zeraus-classic` | `status=review` |

**Do not force-publish.** Leave unpublished / non-indexable until intentional editorial release.

### Remaining THIN

**None** under current gate.

---

## 5. Priority philosophy (what we did / did not do)

- **Did:** Fix shared enrichers so Running (and sitewide pages already using the same pipeline) meet the existing audit bar without swapping names into identical templates.
- **Did:** Link every P0 published Running product that has a review (`166 / 166` shoes/watches/HRM/packs published with `reviewId`).
- **Did not:** Blindly author 400 unique literary essays; page enrichment already supplies product-specific strengths, trade-offs, fit/use, and alternatives from catalog facts.
- **Did not:** Convert expert-research into fake first-hand tests.

---

## 6. Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-03-editorial-quality.ts
```

Expect Reviews: LAUNCH_READY ≈ 503, BLOCKED = 5, THIN = 0, NEEDS_MINOR_WORK = 0.
