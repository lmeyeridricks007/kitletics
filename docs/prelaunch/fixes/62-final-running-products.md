# Fix 62 — Last five Running products

**Date:** 2026-09-10  
**Status:** Implemented (pre-launch — **do not publish**)  
**V3 context:** [`../FINAL-RELEASE-CANDIDATE-V3.md`](../FINAL-RELEASE-CANDIDATE-V3.md)  
**Assessor:** `src/domain/launch/assess-product-quality.ts` (unchanged gates)  
**Regression:** `tests/product-quality-assessor-consistency.test.ts`

## Objective

Make every legitimate published Running Product **LAUNCH_READY** before launch. Do **not** flip quality status. Do **not** force indexation.

Exact list:

| Path | ID |
|---|---|
| `/products/buff-coolnet-uv` | `prod-buff-coolnet-uv` |
| `/products/buff-merino-lightweight` | `prod-buff-merino-lightweight` |
| `/products/buff-original` | `prod-buff-original` |
| `/products/buff-polar` | `prod-buff-polar` |
| `/products/new-balance-fuelcell-rebel-v4` | `prod-rebel-4` |

---

## 1. Gap table (re-assessed from scratch)

Canonical domain flags + `canPublishProduct`. Disposition is eligibility, not a quality class.

### Four Buffs (clothing / tubular neckwear — not shoes)

| Dimension | CoolNet UV+ | Lightweight Merino | Original EcoStretch | Polar |
|---|---|---|---|---|
| identity | pass | pass | pass | pass |
| description | pass (≥40) | pass | pass | pass |
| positioning | thin / generic “running apparel” NMW template | same | same | same |
| real media | pass (authentic hero) | pass | pass | pass |
| specs | **FAIL `fit`** (publish gate) | same | same | same |
| variants | unisex (correct) | unisex | unisex | unisex |
| Best For / Not Ideal | thin NMW / uniqueness-token reviews | same | same | P53 token review |
| Pros / Trade-offs | present but not differentiated | same | Original alts were **Tracksmith/Janji shorts** | Polar alts were **Tracksmith shorts** |
| evidence | pass | pass | pass | pass |
| analysis | NMW template verdicts (“Buy the X when [description]..”) | same | same | same |
| review | unique-rewrite / P54 `skuslug` junk | same | P54 `skuslug` | P53 `skuslug` |
| alternatives | intra-family (OK) | pass | **FAIL — shorts, not Buffs** | shorts + merino |
| comparisons | none (not fabricated) | same | same | same |
| offers | pass (1) | pass | pass | pass |
| decision score | 100 | 100 | 100 | 100 |
| **quality / disposition** | **NMW / PUBLIC_NOINDEX** | NMW / PUBLIC_NOINDEX | NMW / PUBLIC_NOINDEX | NMW / PUBLIC_NOINDEX |
| **actual blocker** | `publish:missing required spec: fit` | same | `fit` + wrong alts | `fit` + wrong alts |

Clothing publishability requires spec `fit` ∈ `relaxed | regular | fitted | compression`. Stretch tubular → **`fitted`**. Score 100 was already true; quality stayed NMW solely because `canPublishProduct` failed.

### Rebel v4 (previous-generation FuelCell uptempo)

Fix 34 already showed this was **not** a slug special-case. Remaining domain misses:

| Dimension | Before |
|---|---|
| identity | pass (FuelCell Rebel v4, gen 4, `fam-rebel`) |
| description | **FAIL** `shortDescription` 34 chars (`< 40`) → `whatIsThis` false |
| positioning | no `verdict` → `howDiffers` false |
| real media | pass (`rebel-4-hero.jpg`) |
| specs | drop/cushion/stability/terrain/plate present; midsole/upper/ride thin vs v5 |
| variants | men + women (audience variants) |
| Best For / Not Ideal | P53 uniqueness-token review; treated like a soft daily in older backfill |
| Pros / Trade-offs | two strengths, one weakness — thin but flag-pass |
| evidence | pass |
| analysis | no verdict; ride/cushion story wrong in token reviews |
| review | P53 `skuslug` overlay |
| alternatives | Speed 4 + Pegasus 41 → inferred **more-cushioned**, not `direct-competitor` |
| comparisons | none |
| Best appearances | none — previous-gen; **not** stuffed into Best tempo (v5 stays) |
| offers | pass |
| decision score | **70** (`whatIsThis`, `howDiffers`, `canCompare` false) |
| **quality / disposition** | **NMW / PUBLIC_NOINDEX** |

---

## 2. What we changed (genuine, not a status flip)

### Buff family — category-specific, differentiated

Manufacturer-backed fields only. **No medical or “prevents sunburn” claims.** CoolNet UPF 50 is a **fabric rating** (AS/NZS 4399).

| Product | Job | Weight | Length | Season | Care | UV |
|---|---|---|---|---|---|---|
| CoolNet UV+ | Hot / bright | ~37 g | ~53 × 22.5 cm | spring–summer | 40°C | **UPF 50 fabric** |
| Original EcoStretch | Year-round default | ~40 g | ~53 cm | all-season | 40°C | no UPF 50 in catalog |
| Lightweight Merino | Cool / odor | ~48 g, 125 g/m² | ~57 cm | autumn–winter–spring | **hand wash** | no UPF 50 |
| Polar | Winter wind | ~66 g | ~76 cm | winter | 40°C | n/a |

All four: `fit: fitted`, unisex, `type: neck-gaiter`, intra-family alternatives. Tracksmith/Janji shorts removed from Original and Polar.

**When another Buff is better**

- CoolNet → Original if you only want one mixed-weather tube; merino/Polar if cold.
- Original → CoolNet for rated UPF 50 heat; Polar for freeze; merino for wool odor.
- Merino → CoolNet on hot climbs; Polar when fleece/wind is the week; Original if you will not hand-wash.
- Polar → Original/CoolNet when the day is mild; merino if you wanted wool without fleece bulk.

Reviews replaced P54/P53 uniqueness-token pages (`src/content/reviews-p62-final-running.ts`). Section images generated from each authentic hero (`npm run reviews:section-images`).

### Rebel v4 — actual domain gap

- `shortDescription` ≥ 40 chars; **verdict** naming leftover v4 vs v5, Mach 6, Speed 4, Pegasus 41.
- Specs filled to the v5 bar (FuelCell, engineered mesh, blown rubber, 6 mm, medium/balanced, men+women). Weight/stack remain spec-fill **199 g / 30/24** (men’s US 9).
- `direct-competitor` vs Mach 6 (same unplated uptempo job). Generation edges v4 ↔ v5. Speed 4 / Pegasus 41 stay as typed alts (plated workout / more-cushioned daily) — not fake Best slots.
- Review rewritten as an **uptempo trainer**, not a max-cushion daily.

Assessor rules were **not** special-cased. The Fix 34 test now expects genuine `LAUNCH_READY` + eligibility `INDEXABLE`.

---

## 3. Relationships (estate-supported only)

| Product | Review | Alternatives | Comparisons | Best | Guides |
|---|---|---|---|---|---|
| CoolNet | overlay LR | Original, Merino (+ Polar competitor edge) | none added | none | Hot-weather running apparel (neck tube) |
| Merino | overlay LR | Polar, CoolNet, Original | none | none | none (cool-weather is the Buff ladder, not a Best shoe list) |
| Original | overlay LR | CoolNet, Merino, Polar | none | none | none (default tube, not a Best clothing pick) |
| Polar | overlay LR | Merino, Original | none | none | Winter layering (neck/face vs beanie) |
| Rebel v4 | overlay LR | Mach 6, Speed 4, Pegasus 41 | none | **none** (previous-gen; tempo Best keeps **v5**) | family / v5 generation edges |

No fabricated comparison pages. No previous-gen Rebel stuffed into Best current picks.

---

## 4. Before → after (all five)

| Product | Quality before | Disposition before | Quality after | Disposition after |
|---|---|---|---|---|
| `buff-coolnet-uv` | NEEDS_MINOR_WORK | PUBLIC_NOINDEX | **LAUNCH_READY** | **INDEXABLE** (normal Running eligibility) |
| `buff-merino-lightweight` | NEEDS_MINOR_WORK | PUBLIC_NOINDEX | **LAUNCH_READY** | **INDEXABLE** |
| `buff-original` | NEEDS_MINOR_WORK | PUBLIC_NOINDEX | **LAUNCH_READY** | **INDEXABLE** |
| `buff-polar` | NEEDS_MINOR_WORK | PUBLIC_NOINDEX | **LAUNCH_READY** | **INDEXABLE** |
| `new-balance-fuelcell-rebel-v4` | NEEDS_MINOR_WORK (score 70) | PUBLIC_NOINDEX | **LAUNCH_READY** (score 100) | **INDEXABLE** |

Indexation was **not** forced via `minor-work-approvals` or `noindex` flags. Eligibility maps `LAUNCH_READY` → INDEXABLE for published Running products.

---

## 5. Running estate

| | Before (V3) | After Fix 62 |
|---|---:|---:|
| Running published | 367 | 367 |
| **LAUNCH_READY** | 362 | **367** |
| **NEEDS_MINOR_WORK** | **5** | **0** |
| THIN / INCOMPLETE (published) | 0 | 0 |
| Drafts (raw catalog) | 71 | **71**, all **BLOCKED** |

Intentional draft/test Products remain unpublished and BLOCKED. No new SKUs. Gates unchanged.

---

## 6. Files

- `src/content/running/products/accessories-wave2.ts` — CoolNet / Merino / Polar specs + copy
- `src/content/running/products/gear-wave1.ts` — Original EcoStretch
- `src/content/products.ts` + `src/content/running/shoes-launch-ready-enrichment.ts` — Rebel v4
- `src/content/running/nmw-completion-launch-ready.ts` — Buff patches/seeds; shorts removed
- `src/content/running/relationships.ts` — Buff competitors; Rebel ↔ v5; Rebel ↔ Mach 6
- `src/content/reviews-p62-final-running.ts` + `src/content/reviews.ts` — overlays win over P54/P53 `skuslug`
- `src/lib/guides/explainers/running-density-plans.ts` — Polar on winter layering; CoolNet on heat
- `tests/product-quality-assessor-consistency.test.ts` — Rebel now LR without a slug exception in the assessor
- Section images under `public/images/running/products/<slug>/sections/`
