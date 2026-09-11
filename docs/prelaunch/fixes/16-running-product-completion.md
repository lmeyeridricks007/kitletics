# Fix 16 — Complete Running product readiness

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Audits:** [`../02-product-quality.md`](../02-product-quality.md) · [`../data/02-product-quality.json`](../data/02-product-quality.json)  
**Enrichment:** `src/content/running/nmw-completion-launch-ready.ts`

## Objective

Maximize legitimate Running **LAUNCH_READY** from the **existing** catalog.

- Do **not** add Products  
- Do **not** weaken quality gates  
- Do **not** auto-unblock intentional drafts / fixtures  
- Do **not** invent first-hand testing or medical/nutrition claims  

---

## BEFORE → AFTER (Running)

| Metric | Before | After | Delta |
|---|---:|---:|---:|
| Running products | 438 | 438 | = |
| **LAUNCH_READY** | **280** | **367** | **+87** |
| NEEDS_MINOR_WORK | 87 | **0** | −87 |
| THIN | 0 | 0 | = |
| INCOMPLETE | 0 | 0 | = |
| BLOCKED | 71 | **71** | = (intentional) |
| Running shoes LR | 83/84 | **83/84** | = |
| Sitewide product LR | 312* | **399** | +87 |

\*Prior go-live doc cited 312 sitewide / 280 Running; re-audit after this fix.

All **87** previous NMW records cleared under the **same** product-quality classifier. No gates relaxed.

---

## 1. Classification of 158 non-LAUNCH-READY (pre-fix)

| Class | Count | Disposition |
|---|---:|---|
| **FIXABLE QUALITY GAP** | **87** | Was NMW — enriched → LAUNCH_READY |
| **INTENTIONALLY UNPUBLISHED** | **70** | Draft / `not_production_exposed` — **kept BLOCKED** |
| **INVALID / TEST FIXTURE** | **1** | `example-unpublished-trainer` — **kept BLOCKED** |
| OLD/PREVIOUS GENERATION | 0 | — |
| DUPLICATE | 0 | — |
| INSUFFICIENT EVIDENCE (as sole blocker) | 0 | NMW gaps were review/media/depth, not “no evidence forever” |
| OTHER | 0 | — |

**Total non-LR before:** 87 NMW + 71 BLOCKED = **158**.

### FIXABLE QUALITY GAP (87) — by category

| Category | NMW before | Primary gaps | Outcome |
|---|---:|---|---|
| Running Clothing | 44 | `review:missing` (+ positioning/SEO depth) | **LR** |
| Nutrition & Fuel | 29 | `review:missing`; a few `real_media:weak` | **LR** |
| Sunglasses | 10 | `review:missing` | **LR** |
| Treadmills | 3 | family / generation / description / evidence | **LR** |
| Running Belts | 1 | wrong-gen media heuristic (`ultraspire-fitted-race-belt-2`) | **LR** |

### INTENTIONALLY UNPUBLISHED (70 BLOCKED drafts)

All `not_production_exposed` + `status=draft`. Kept blocked — no consumer publish.

| Category | Count |
|---|---:|
| Recovery | 16 |
| Running Clothing | 15 |
| Safety Gear | 8 |
| Running Packs & Vests | 7 |
| Running Lights | 7 |
| Headphones | 6 |
| Accessories | 5 |
| Running Socks | 4 |
| Hydration | 2 |

### FIXTURE (1)

| Product | ID / slug | Why blocked | Action |
|---|---|---|---|
| ASICS Example Unpublished Trainer | `prod-draft-example` / `example-unpublished-trainer` | Test fixture: `draftMeta()`, `noindex`, empty buyer fields, comment in `products.ts` | **Confirm fixture.** Keep draft + noindex. **Do not** invent a real SKU. Not production-exposed via publish resolver. |

---

## 2. What was fixed (NMW → LR)

### Code / content

1. **`nmw-completion-launch-ready.ts`** — 87 product patches + **82** new expert-research reviews (products that lacked `reviewId`). Label/spec facts only for nutrition; no medical claims; no fake first-hand testing.
2. **`products.ts`** — `applyNmwCompletionEnrichment` after weak-category enrichment.
3. **`reviews.ts`** — `nmwCompletionReviews` wired; backfill overrides avoid duplicate review collision.
4. **Media**
   - Upscaled weak heroes: `sis-beta-fuel-gel`, `smith-attack-mag`, `nuun-sport` → 800×800; catalog widths updated.
   - UltrAspire race belt: hero path renamed so media heuristic no longer treats file as wrong generation vs product name.
5. **Treadmills** — families (`fam-assault-runner`, `fam-mirafit-treadmill`); generation, longer descriptions, editorial evidence, alternatives on fitness seeds.

### Product depth (buyer questions)

Patches supply category-appropriate positioning:

- **What / who for / who avoid** — `positioningLabel`, strengths/weaknesses, review job copy  
- **Good at / trade-offs** — strengths + weaknesses (+ review sections)  
- **Alternatives / compare** — `alternativeProductIds` where peers exist; treadmills got family peers  
- **Evidence** — existing + editorial IDs; nutrition stays label/spec-backed  
- **Where to buy** — existing offers unchanged (no invented prices)

Criteria stay category-specific (clothing fit/weather/pockets; sunglasses lens/coverage; nutrition format/CHO/caffeine context; treadmills drive/fold/use; belts bounce/capacity).

### Reviews

- Connected each upgraded product to **one** review (new expert-research where missing).  
- **No duplicate reviews** for products that already had one.

### Relationships

- Alternatives only to catalog peers in-category / same job.  
- No arbitrary cross-sport links.

### Men / women variants

- Clothing men/women SKUs remain **separate** products (e.g. Session Short men/women).  
- No collapse of meaningful gender variants.  
- Unisex manufacturer configs left unisex (no invented split).  
- Shoe width/variant weak notes on a small subset are pre-existing catalog nuance, not introduced by this fix.

---

## 3. BLOCKED review outcome

| Finding | Count | Action |
|---|---:|---|
| Accidental block (complete product wrongly gated) | **0** | — |
| Intentional draft hold | **70** | Keep BLOCKED |
| Test fixture | **1** | Keep BLOCKED; clarified comment in seed |

**Do not publish** any of the 71.

---

## 4. AFTER — Running by category

Re-run: `scripts/tmp/prelaunch-02-product-quality.ts` → EXIT02:0

| Category | LR | NMW | THIN | BLOCKED | n |
|---|---:|---:|---:|---:|---:|
| Running Shoes | 83 | 0 | 0 | 1 | 84 |
| Running Clothing | 57 | 0 | 0 | 15 | 72 |
| Running Packs & Vests | 35 | 0 | 0 | 7 | 42 |
| Nutrition & Fuel | 38 | 0 | 0 | 0 | 38 |
| GPS Watches | 33 | 0 | 0 | 0 | 33 |
| Recovery | 16 | 0 | 0 | 16 | 32 |
| Hydration | 17 | 0 | 0 | 2 | 19 |
| Sunglasses | 17 | 0 | 0 | 0 | 17 |
| Headphones | 11 | 0 | 0 | 6 | 17 |
| Running Lights | 9 | 0 | 0 | 7 | 16 |
| Heart Rate Monitors | 15 | 0 | 0 | 0 | 15 |
| Running Belts | 14 | 0 | 0 | 0 | 14 |
| Running Socks | 10 | 0 | 0 | 4 | 14 |
| Safety Gear | 6 | 0 | 0 | 8 | 14 |
| Accessories | 3 | 0 | 0 | 5 | 8 |
| Treadmills | 3 | 0 | 0 | 0 | 3 |
| **TOTAL** | **367** | **0** | **0** | **71** | **438** |

---

## 5. Soft-gate vs product quality (important)

Product-quality **LAUNCH_READY** ≠ Day-1 **INDEXABLE**.

Soft-gated categories (`running-clothing`, `nutrition-fuel`, `sunglasses`, `accessories`) can be product-complete and still **PUBLIC_NOINDEX** (fix 06 / 15 policy). This fix raises **catalog readiness**; it does **not** open soft-gates or expand the sitemap.

Approx. **115** Running LR products sit in soft-gated categories for indexation hold.

---

## 6. Definition of done checklist

| Check | Status |
|---|---|
| Analyse all 158 non-LR | Done |
| Fix 87 NMW without weakening gates | Done (0 NMW remain) |
| Category-specific depth | Done |
| Review BLOCKED; no blind unblock | Done (71 remain) |
| Example shoe = fixture, not fake product | Confirmed |
| Men/women variants preserved | Verified |
| No duplicate reviews | Verified |
| Meaningful alternatives only | Applied |
| Product quality re-audit | Done |
| Report written | This file |
| Publish | **No** |

---

## 7. Residual / next (out of scope for 16)

- Draft backlog (70) remains for a future publish wave — not Day-1.  
- Soft-gate open for clothing/nutrition/sunglasses/accessories = separate launch decision.  
- Sitewide non-Running NMW/THIN unchanged by this vertical-scoped work.
