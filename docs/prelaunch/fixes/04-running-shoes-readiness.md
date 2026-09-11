# Fix 04 — Running Shoes to Launch-Ready

**Mode:** Remediation (evidence-backed catalog enrichment)  
**Date:** 2026-09-06  
**Evidence basis:** `docs/prelaunch/02-product-quality.md`, `docs/prelaunch/data/02-product-quality.json`  
**Quality bar:** unchanged (no threshold lowering)

---

## 1. Before status (Running Shoes)

| Classification | Count |
|---|---:|
| LAUNCH_READY | **56** |
| NEEDS_MINOR_WORK | **24** |
| THIN | **3** |
| INCOMPLETE | **0** |
| BLOCKED | **1** |
| **Total** | **84** |

Non-ready set (28): 27 publishable gaps + `prod-draft-example` (blocked draft).

Common failure modes on the 27:

- Missing `familyId` / weak positioning (no verdict)
- Unlinked reviews (`review_unlinked_from_product_field`)
- Offers present in `NEW_PRICING_OFFERS` but audit only saw seed `offers.ts` → `canBuy` false
- No / insufficient graph competitor edges → `canCompare` / `howDiffers` false → `decisionScore` ~70
- Missing SEO metadata, weak kitletics analysis
- Spec gaps (weight/stack ~73%; outsole/midsole/upper ~58%)

---

## 2. After status (Running Shoes)

| Classification | Count |
|---|---:|
| LAUNCH_READY | **83** |
| NEEDS_MINOR_WORK | **0** |
| THIN | **0** |
| INCOMPLETE | **0** |
| BLOCKED | **1** |
| **Total** | **84** |

**Delta:** +27 LAUNCH_READY (all previously NEEDS_MINOR_WORK / THIN publishable shoes).

### Spec coverage (shoes)

| Spec | Before (approx.) | After |
|---|---:|---:|
| weight (+ reference size) | ~72.6% | **98.8%** (83/84) |
| heel / forefoot stack | ~72.6% | **98.8%** |
| outsole / midsole / upper | ~58% | **90.5%** (76/84) |

(The single non-present shoe across these metrics is the blocked draft example.)

---

## 3. What we changed

| Area | Change |
|---|---|
| Enrichment | `src/content/running/shoes-launch-ready-enrichment.ts` — verdict, positioning, SEO, reviewId, offerIds, generation/family, strengths/weaknesses where thin |
| Wiring | Applied via `products.ts` → `applyRunningShoesLaunchReadyEnrichment` |
| Families | New / updated families in `running/families.ts` + Boston 13 on `fam-adizero-boston` |
| Relationships | Direct-competitor edges for all 27 (meaningful peers only) in `running/relationships.ts` |
| Specs | Weight/stack/materials in `specs/product-spec-fill.ts` (men’s US 9 typical published values; unknown left null) |
| Guides | Related product IDs on choose-shoes, cushioning, stability, plates, daily-trainer, road-vs-trail buying guides |
| Audit fairness | Prelaunch `02` script now uses `getOffers()` (seed + pricing refresh), matching production commerce |

---

## 4. Remaining non-ready products

### BLOCKED (kept)

| Product | ID | Reasons |
|---|---|---|
| Example Unpublished Trainer | `prod-draft-example` | `not_production_exposed`, `noindex` — intentional draft fixture; content/publication state does **not** warrant unblocking |

Exact weak/missing dims (fixture only): family, positioning, real media, use cases, best-for / not-ideal, pros/tradeoffs, analysis, review, evidence, alternatives, comparisons, guides, offers, broken SEO (`noindex`).

**No other Running Shoe remains non-LAUNCH_READY.**

---

## 5. Explicit non-goals / honesty notes

- Did **not** fabricate Offers for `prod-endorphin-pro-3` (no verified offer in seed or pricing refresh). It still reaches LAUNCH_READY via verdict + graph alternatives / compare path (`decisionScore` ≥ 80 without inventing commerce).
- Did **not** lower LAUNCH_READY thresholds or reclassify drafts as published.
- Spec fills are manufacturer/lab-typical men’s US 9 values where catalog lacked numbers; women’s weights remain unset unless verified (audience-variants rules).
- Comparisons pages remain sparse for some SKUs (`comparisons:missing` is non-blocking when graph competitors ≥ 2).

---

## 6. Re-audit command

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-02-product-quality.ts
```

Outputs refreshed: `docs/prelaunch/02-product-quality.md`, `docs/prelaunch/data/02-product-quality.json`.
