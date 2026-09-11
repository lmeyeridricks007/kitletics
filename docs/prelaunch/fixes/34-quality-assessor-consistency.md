# Fix 34 — Product quality assessor consistency

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Disagreements:** [`../data/rc-final/34-assessor-disagreements.json`](../data/rc-final/34-assessor-disagreements.json)  
**Regression:** `tests/product-quality-assessor-consistency.test.ts`

## Objective

Eliminate divergent definitions of product `LAUNCH_READY` between the forensic Product audit (02) and the domain launch assessor — without special-casing `new-balance-fuelcell-rebel-v4`.

---

## 1. Trace — both assessors

### A. Forensic Product audit (`scripts/tmp/prelaunch-02-product-quality.ts`)

| Aspect | Before Fix 34 |
|---|---|
| **Inputs** | Raw + filled products, page assembly via `getProductPageData`, graph alts/comps, offers, evidence, reviews |
| **Assembly** | Full dimensional scorecard (identity, media, specs, variants, SEO, …) |
| **Decision flags** | Page-aware: `bestFor`/`notIdeal` from PDP, `whatIsThis` if `descLen >= 20` |
| **readyCore** | Dimensional (description may be **weak**), does **not** require `canPublishProduct.ok` |
| **LAUNCH_READY** | Local fork: `decisionScore >= 80` + no blocking missing dims + ≤3 minor gaps |
| **Publication** | Uses `isPubliclyVisible`; soft-gated categories **not** considered |

### B. Domain launch assessor (`src/domain/launch/assess-product-quality.ts`)

| Aspect | Rules (canonical) |
|---|---|
| **Inputs** | Product entity + repositories (reviews, offers, relationships, comparisons) — **no** full PDP assembly |
| **Decision flags** | Catalog-centric: `whatIsThis` if `shortDescription >= 40` **or** verdict |
| **readyCore** | Authentic media + desc ≥ 40 + strengths ≥ 2 + weaknesses ≥ 1 + evidence/review + `canPublishProduct.ok` + score ≥ 70 |
| **LAUNCH_READY** | `readyCore && decisionScore >= 80` |
| **Publication** | Production-exposed gate; soft-gated annotated informationally |

### C. Launch eligibility (`getLaunchEligibility` → product)

Consumes domain quality, then maps to disposition (`INDEXABLE` / `PUBLIC_NOINDEX` / `HIDDEN_404`). Soft-gated category is a **disposition overlay** (see §3).

---

## 2. Root difference (Rebel v4)

| Signal | Forensic 02 (snapshot) | Domain |
|---|---|---|
| `shortDescription` | `"Lightweight uptempo daily trainer."` (**34** chars) | same |
| `whatIsThis` | **true** (≥ 20 chars) | **false** (≥ 40 chars / verdict) |
| `decisionScore` | 100 | 90 |
| Class | **LAUNCH_READY** | **NEEDS_MINOR_WORK** (`missing:whatIsThis`) |
| Disposition | (audit only) | **PUBLIC_NOINDEX** |

Not a different product assembly, cache, or Rebel-specific rule — a **forked decision-flag threshold** plus forensic omitting `canPublishProduct` from readyCore (relevant for Buff clothing disagreements).

### All Running disagreements vs pre-Fix-34 forensic snapshot

| Slug | Forensic → Domain | Root |
|---|---|---|
| `new-balance-fuelcell-rebel-v4` | LR → NMW | `whatIsThis` 20 vs 40 char threshold |
| `buff-original` | LR → NMW | `publish:missing required spec: fit` (+ soft-gated clothing) |
| `buff-coolnet-uv` | LR → NMW | same |
| `buff-merino-lightweight` | LR → NMW | same |
| `buff-polar` | LR → NMW | same |

**5 / 367** Running products disagreed with the old forensic classifier. **362** already agreed as `LAUNCH_READY`.

---

## 3. Source of truth

**Canonical quality class:** `assessProductLaunchQuality` in `src/domain/launch/assess-product-quality.ts`.

| Layer | Role |
|---|---|
| Domain assessor | **Only** definition of `LAUNCH_READY` / NMW / THIN / INCOMPLETE / BLOCKED for products |
| Forensic 02 | Dimensional **diagnostics** + `forensicDecisionFlags` for analysis; **classification delegates** to domain |
| Eligibility | Maps quality → disposition; **overlays** may change disposition without inventing a second quality class |

### Documented overlay

**Soft-gated categories** (`running-clothing`, accessories, nutrition, sunglasses, empty cats):

- Before: eligibility short-circuited to `quality: NEEDS_MINOR_WORK` without calling the assessor.
- After: assessor quality is preserved; if disposition would be `INDEXABLE`, it is forced to `PUBLIC_NOINDEX` with reason `soft_gated_category`.

---

## 4. Regression

Live check (Running products, n=367):

| Check | Result |
|---|---|
| Domain quality vs eligibility quality | **0** mismatches |
| Historical forensic snapshot vs domain | **5** (documented above; expected until 02 JSON is regenerated) |
| Vitest | `tests/product-quality-assessor-consistency.test.ts` |

---

## 5. Fix summary

1. Documented + exported decision-flag helpers from domain assessor (`PRODUCT_WHAT_IS_THIS_MIN_CHARS = 40`, `buildProductDecisionFlags`, …).
2. Forensic 02 classification now calls `assessProductLaunchQuality` (keeps dimensional audit + legacy flags as diagnostics only).
3. Soft-gated eligibility overlay no longer redefines quality.
4. Added consistency regression tests (Rebel v4, Buff soft-gate, all Running domain↔eligibility).

**Not done (by design):** mass content rewrite of Rebel v4 / Buff specs. Those remain correctly `NEEDS_MINOR_WORK` under the canonical assessor until enriched post-launch.

---

## 6. Definition of done

- [x] Both assessors traced  
- [x] Root difference identified (not Rebel special-case)  
- [x] Single domain SoT + documented overlays  
- [x] All Running disagreements reported (5 historical)  
- [x] Systemic fix landed  
- [x] Domain ↔ eligibility agree for Running  

**Day-1 posture:** Product `LAUNCH_READY` has one runtime definition. Forensic audit no longer forks it.
