# Sitewide Editorial Intent & Cannibalization — Editorial 46

**Document ID:** `10-EDITORIAL-INTENT-MAP`  
**Generated:** 2026-09-09  
**Scope:** Complete editorial corpus after Fixes 37–45  
**Data:** [`data/editorial-intent-map.csv`](data/editorial-intent-map.csv) · [`data/46-editorial-intent-audit.json`](data/46-editorial-intent-audit.json) · consolidations [`../../src/content/editorial-intent-consolidations-p46.ts`](../../src/content/editorial-intent-consolidations-p46.ts)

## Executive status

| Metric | Value |
|---|---:|
| URLs mapped | **1,760** |
| Indexable (eligibility) | **710** |
| Collision signals detected | **148** |
| Hard consolidations (merge/redirect) | **0** |
| Intent holds (new) | **0** (soft-gate accessories already held) |
| Role-KEEP pairs (documented) | **All complementary collisions** |

**Policy:** Prefer **role clarity + internal links** over deleting URLs when two pages serve different decisions. Consolidate only when two **weak** URLs share one intent.

## Role model (locked)

| Type | Primary job |
|---|---|
| **Product** | Understand / buy **one** Product |
| **Review** | Assess **one** Product |
| **Best** | Shortlist products for a **specific context** |
| **Guide** | **Learn** (framework / explainer) |
| **Comparison** | **A vs B** (+ choose neither) |
| **Alternatives** | **Replace** Product X |
| **Category** | **Browse** / filter the catalog |
| **Listing** | Browse a **type / use-case facet** |
| **Setup** | Assemble a **scenario kit system** |
| **Finder** | **Personalized** recommendation |

## Corpus map (by type)

| Type | Count | Notes |
|---|---:|---|
| Product | 623 | Buy/understand |
| Review | 585 | Many already uniqueness/evidence held → Product keeps buy intent |
| Best | 58 | Context shortlists |
| Guide | 68 | Learn (vertical holds may noindex non-Running) |
| Comparison | 94 | A vs B |
| Alternatives | 248 | Replace-X (index subset) |
| Category | 47 | Browse (accessories soft-gated) |
| Listing | 5 | Shoe-type / profile browse |
| Setup | 16 | Scenario kits |
| Finder | 16 | Interactive shortlists |

Full per-URL intent fields are in the CSV:

`path, type, primary_intent, secondary_intent, target_decision, related_product_or_category, action, …`

## Collision findings

### 1. Review ↔ Product

**Expected pair.** When both index: Review assesses; Product sells/specs.  
When Review is held (uniqueness / evidence): Product remains the indexable understand/buy page — **correct**, not a consolidation debt.

### 2. Guide ↔ Best

Title-overlap pairs (e.g. `stability-shoes-explained` ↔ `stability-running-shoes`, `handheld-bottles-for-running` ↔ `handheld-running-bottles`) are **complementary**:

- Guide = framework / trade-offs  
- Best = ranked shortlist  

**Action:** KEEP + wire learn→shortlist CTAs (`guides-p46-intent-roles.ts`).

### 3. Best ↔ Best

| Pair | Rec overlap | Disposition |
|---|---:|---|
| running-watches-beginners ↔ budget | 0.67 | KEEP — simplicity vs price (P39) |
| running-watches-* ↔ small-wrists | 0.67 | KEEP — case-size constraint (P39) |
| HRM running ↔ chest straps | 0.67 | KEEP — umbrella vs form-factor |
| race-shoes ↔ carbon-plated | 0.56 | KEEP — race roles vs plate taxonomy (P39) |
| hydration-vests ↔ trail / ultra | 0.29–0.50 | KEEP — road vs trail vs ultra (P39) |
| jackets ↔ rain jackets | 0.13 | KEEP |

No Best pair exceeded a “two weak duplicates” threshold after P39 shortlist splits. **No merge/redirect.**

### 4. Best ↔ Category

High string overlap (e.g. `/best/running-shoes` ↔ `/running/shoes`) is **not** a doorway when Best is a ranked role map and Category is the filterable grid.

**Action:** KEEP + P46 anti-mirror copy (“not the category catalog”) + browse CTA + sibling Best links (`best-guides-p46-intent-roles.ts`).

### 5. Listing ↔ Best

Daily / race / stability / trail / heavy listings vs matching Best pages: **KEEP**. Listing browses the facet; Best ranks. Linked via `bestGuideSlug`.

### 6. Comparison ↔ Alternatives

**117** graph pairings where an Alternatives page root participates in a Comparison.  
**Action:** KEEP — different decisions (A vs B vs replace-X). Copy must stay role-correct (already enforced in Fixes 41–42).

## Consolidations applied

| Action | Count | Detail |
|---|---:|---|
| **keep** (role-clarified) | Primary outcome | Category-mirror Bests, Guide↔Best, Best↔Best residuals, Comparison↔Alternatives, Listing↔Best |
| **hold** | Soft-gated accessories (+ empty padel shells) | Already gated; thin catalog |
| **redirect** | 0 | No weak twin required a 308 |
| **canonical** | 0 | Differentiation preferred over collapsing Best siblings |
| **merge** | 0 | No two weak learn/shortlist URLs collapsed |

Internal links updated:

- Broad Best intros → explicit “not the category catalog” + sibling Best IDs  
- Overlapping Guides → learnFocus + Best shortlist CTA in `quickAnswer` / `relatedBestGuideIds`

## What we refused to delete

Deleting `/best/running-shoes` in favour of `/running/shoes` (or vice versa) would destroy either shortlist or browse intent.  
Deleting `/best/hydration-vests-trail` into `/best/running-hydration-vests` would bury trail-specific ranking.  
Collapsing beginners/budget watches would blur distinct constraints despite shared entry GPS SKUs.

## Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-46-editorial-intent-audit.ts
```

Spot-check: Best Running Shoes intro contains category anti-mirror language; Handheld Bottles guide points to Best Handheld Bottles.

## Definition of done (46)

- [x] Intent mapped for every editorial URL (CSV)  
- [x] Collisions detected across Review/Product, Guide/Best, Best/Best, Best/Category, Comparison/Alternatives, Listing/Best  
- [x] Correct roles maintained  
- [x] Consolidate only when necessary — none required merge/redirect; holds limited to soft-gates  
- [x] Internal links updated for clarified pairs  
- [x] Report + CSV published  

## Residual watchlist

1. **Entry GPS pool** (beginners / budget / small-wrists) — keep ranking copy job-specific as catalog deepens.  
2. **Race ↔ carbon** — expected supershoe overlap; keep Trainer/Speed off carbon shortlist.  
3. **Cold-weather kit** still absent from Setups estate (Fix 45) — do not invent an affiliate shell.  
4. Vertical Day-1 gates may still noindex editorial-READY Guide/Best pages outside Running.
