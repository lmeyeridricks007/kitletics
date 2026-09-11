# Fix 06 — Running Weak Category Enrichment

**Mode:** Remediation (evidence-backed enrichment; no new products; no fake first-hand testing)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/02-product-quality.md`, `docs/prelaunch/05-architecture-internal-links.md`  
**Quality bar:** unchanged (gate not lowered)

---

## 1. Objective

Turn existing catalog records in weak Running categories into useful Product decision pages — quality over readiness percentage. Categories that remain thin stay out of the launch index set.

---

## 2. Before / after by category

Baseline from pre-fix audit (`02-product-quality.md` totals). After = re-run of the same audit script.

| Category | Products | Ready before | Ready after | Publishable ready after | Remaining blocked / thin | **Recommend** |
|---|---:|---:|---:|---:|---|---|
| **Hydration** | 19 | **0** (0%) | **17** (89.5%) | **17 / 17 (100%)** | 2 drafts | **PUBLIC** |
| **Running Belts** | 14 | **0** (0%) | **13** (92.9%) | **13 / 14 (93%)** | 1 media-weak | **PUBLIC** |
| **Running Lights** | 16 | **0** (0%) | **9** (56.3%) | **9 / 9 (100%)** | 7 drafts | **PUBLIC** |
| **Safety Gear** | 14 | **0** (0%) | **6** (42.9%) | **6 / 6 (100%)** | 8 drafts | **PUBLIC** |
| **Recovery** | 32 | **2** (6.3%) | **16** (50%) | **16 / 16 (100%)** | 16 drafts | **PUBLIC** |
| **Sunglasses** | 17 | **0** (0%) | **7** (41.2%) | **7 / 17 (41%)** | 10 review gaps | **HOLD** |
| **Running Clothing** | 72* | **4** (5.9% of 68) | **13** (18.1%) | **13 / 57 (23%)** | 44 minor + 15 drafts | **HOLD** |
| **Nutrition & Fuel** | 38 | **0** (0%) | **9** (23.7%) | **9 / 38 (24%)** | 29 label-only | **HOLD** |
| **Accessories** | 8* | **0** (0% of 12) | **3** (37.5%) | **3 / 3 (100%)** | 5 drafts; category hollow | **HOLD** |

\*Product counts shifted after Buff reclass into Clothing (Accessories 12→8, Clothing 68→72).

**Running overall:** LAUNCH_READY **193 → 280** (same gate).

---

## 3. Root causes (shared)

| Root cause | Categories hit | Fix applied |
|---|---|---|
| `review:missing` (blocking) | All weak cats | Selective `expert-research` reviews + `reviewId` links |
| `positioning:weak` / thin verdict | All | Product patches (`verdict`, `positioning`) |
| `seo_metadata:weak` | All | `seoTitle` / `seoDescription` patches |
| `variant_data:missing` (blocking) | Hydration, Belts | Unisex carry variants in `audience-variants.ts` |
| Broken / missing families | Hydration, Belts, Buff | Families in `hydration-families.ts`, `clothing-families.ts` |
| Generic **Accessories** shell | Buff neckwear | Reclass → `cat-running-clothing` / `sub-running-caps` |
| Draft + placeholder media | Lights, Safety, Recovery, Clothing | Left **BLOCKED** (no force-publish) |
| Clothing volume without depth | Clothing | Selective reviews only (12 priority SKUs + existing links) — **not** 68 shallow pages |
| Nutrition evidence boundary | Nutrition | Conservative label-fact reviews for priority gels/mixes only |

---

## 4. Fixes applied

| Area | Change |
|---|---|
| Enrichment + reviews | `src/content/running/weak-cats-launch-ready.ts` — ~94 product patches, ~66 new expert-research reviews + existing review links |
| Wiring | `products.ts` → `applyWeakCatLaunchReadyEnrichment`; `reviews.ts` → `weakCatLaunchReviews` |
| Variants | Hydration + belts get unisex carry variants (`audience-variants.ts`) |
| Families | Soft flask / body bottle / Kiprun belt + Buff neckwear families |
| Accessories reclass | Buff Original / CoolNet / Merino / Polar → clothing (+ `genderFit: unisex`, `fam-buff-neckwear`) |
| Soft-gate (HOLD cats) | `SOFT_GATED_CATEGORY_SLUGS`: `accessories`, `nutrition-fuel`, `running-clothing`, `sunglasses` |
| Launch manifest | Those four → `status: "future"` |
| Category noindex | Soft-gated categories get `noindex,follow` in `[sport]/[segment]` metadata |
| Sitemap | Soft-gated categories excluded from sitemap |

Reviews are **`expert-research`** with explicit non-testing disclosure. Nutrition copy limited to label/spec facts — no health/medical claims. Recovery copy stays comfort/routine language — no injury-prevention claims.

---

## 5. Category detail

### Hydration — PUBLIC

- **Ready:** all 17 published flasks/bottles/reservoirs/handhelds.
- **Blocked drafts:** `hydrapak-shape-shift-15`, `nathan-quickdraw-plus-handheld` (placeholder media).
- Publishable coverage **100%**.

### Running Belts — PUBLIC

- **Ready:** 13 / 14.
- **Remaining:** `ultraspire-fitted-race-belt-2` — `real_media:weak` (suspected wrong generation); reviews/positioning OK. Do not force LAUNCH_READY without media fix.

### Running Lights — PUBLIC

- **Ready:** all 9 published headlamps.
- **Blocked:** 7 drafts pending authentic media.

### Safety Gear — PUBLIC

- **Ready:** all 6 published reflective/LED pieces.
- **Blocked:** 8 drafts.

### Recovery — PUBLIC

- **Ready:** all 16 published tools (guns, rollers, Normatec, OOFOS, CEP sleeves).
- **Blocked:** 16 drafts.
- Evidence boundary preserved (comfort/routine framing).

### Sunglasses — HOLD

- Selective deep pages for **7** high-intent frames (Oakley Radar/Sutro/Kato/Flak, Smith Shift MAG, Julbo Ultimate, 100% S3).
- **10** remain `review:missing` by design — not mass-reviewed.
- Soft-gated from category index / sitemap until broader depth exists. Individual ready PDPs stay published.

### Running Clothing — HOLD

- Priority set only: Janji / Brooks / Rabbit shorts, Method tights, Houdini / Bonatti shells, Miler / Aeroswift tops, Capilene midweight, Ciele GOCap — **13** LAUNCH_READY.
- **44** published SKUs still minor (mostly missing reviews); **15** drafts; Buff neckwear reclassed but not force-reviewed.
- Soft-gated: category shell too thin vs product count.

### Nutrition & Fuel — HOLD

- Conservative enrichment: **9** Maurten / Precision / Neversecond / Styrkr priority gels & drink mixes.
- **29** remain label-catalog only (`review:missing`) — intentional.
- Soft-gated until a larger evidence-backed set exists.

### Accessories — HOLD

- After Buff reclass, published set is **anti-chafe only** (Body Glide, Squirrel’s Nut Butter, 2Toms) — all 3 LAUNCH_READY.
- Draft armbands/gaiters/sleeves stay blocked.
- Category is a hollow catch-all → soft-gated / `future`. Prefer future reclass of drafts into Clothing / Safety / Trail when published.

---

## 6. Category-level publication (gate-based)

| Recommend | Categories | Rationale |
|---|---|---|
| **PUBLIC** (keep in launch index) | Hydration, Belts, Lights, Safety, Recovery | Publishable LAUNCH_READY ≥93% (belts) or 100%; drafts stay blocked |
| **HOLD** (soft-gate / future / noindex category shell) | Clothing, Sunglasses, Nutrition, Accessories | Ready % still weak vs gate; enrichment was intentionally selective; quality > % |

Individual enriched product/review URLs remain public where production-exposed. Soft-gate applies to **category** listing discovery (nav/sitemap/noindex), not wholesale product deletion.

---

## 7. Explicit non-goals

- No new Products added
- Gate thresholds not lowered
- No mass clothing reviews (68 shallow pages)
- No unsupported nutrition/recovery medical claims
- Draft / placeholder-media SKUs not force-published

---

## 8. Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-02-product-quality.ts
```

Re-check Running category table in `docs/prelaunch/02-product-quality.md` §4.
