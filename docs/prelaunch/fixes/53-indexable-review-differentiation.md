# Fix 53 — INDEXABLE review differentiation completion

**Mode:** Remediation (review copy + uniqueness overlays)  
**Date:** 2026-09-10  
**Evidence basis:** [`FINAL-RELEASE-CANDIDATE-V2.md`](../FINAL-RELEASE-CANDIDATE-V2.md) · [`FINAL-EDITORIAL-READINESS.md`](../FINAL-EDITORIAL-READINESS.md)  
**Acceptance check:** Fix 50 category-peer uniqueness (`scripts/tmp/prelaunch-50-final-forensic.ts`) — **not** the weaker V2 all-peer recluster.

---

## 1. Result

| Metric | Before | After |
|---|---:|---:|
| INDEXABLE NEEDS_DIFF | **114** | **0** |
| INDEXABLE DUPLICATIVE | **0** (V2 forensic) / 24 cascade during rewrite | **0** |
| Rewritten (P53 overlay) | — | **138** |
| Held DUPLICATIVE (protected) | **383** | **383** (unchanged) |
| Remaining uniqueness blockers | 114 INDEXABLE NEEDS_DIFF | **0** |

Fix 50 forensic (fresh process after overlay):

- INDEXABLE reviews: **169**
- `indexableDuplicative`: **0**
- `indexableNeedsDiff`: **0**
- Estate-wide DUPLICATIVE **383** and NEEDS_DIFF **390** are **held** unfinished pages — protected, not Day-1.

**No mass-noindex.** Indexation was not shrunk to hide the 114. Overlay lives in `src/content/reviews-p53-differentiation.json` (wired first in `src/content/reviews.ts`).

---

## 2. Exact 114 (before)

Source: `docs/prelaunch/data/FINAL-EDITORIAL-ISSUES.csv` (`indexable_needs_diff`).

Machine export of the live failing set (final): `docs/prelaunch/data/53-indexable-needs-diff.csv` (empty after acceptance — 0 remaining).

Original 114 routes (Day-1 INDEXABLE NEEDS_DIFF):

| Cluster | Routes |
|---|---|
| Sunglasses | `/reviews/100-percent-s3`, `oakley-kato`, `roka-phantom-air`, `rudy-project-cutline`, `smith-attack-mag` |
| Nutrition | `226ers-high-energy-gel`, `clif-bar-original`, `gu-energy-gel`, `high5-zero`, `honey-stinger-organic-energy-gel`, `maurten-drink-mix-160`, `maurten-drink-mix-320`, `maurten-gel-100`, `maurten-gel-100-caf-100`, `maurten-gel-160`, `naak-ultra-energy-bar`, `naak-ultra-energy-drink-mix`, `neversecond-c30-sports-drink`, `precision-pf30-drink-mix`, `precision-pf30-gel`, `saltstick-fastchews`, `sis-beta-fuel-drink`, `sis-beta-fuel-gel`, `sis-go-isotonic-gel`, `skratch-sport-hydration-mix`, `veloforte-energy-bar` |
| Shoes | `brooks-cascadia-18`, `brooks-glycerin-gts-22`, `new-balance-fresh-foam-x-860-v14`, `new-balance-fuelcell-rebel-v4`, `on-cloudmonster-hyper`, `saucony-endorphin-speed-4`, `asics-novablast-5`, `nike-pegasus-42`, `brooks-adrenaline-gts-25` |
| Clothing | `brooks-canopy-jacket-men`, `brooks-chaser-5-women`, `brooks-method-tight-women`, `buff-polar`, `craft-adv-essence-light-wind-men`, `craft-adv-essence-light-wind-vest-men`, `craft-adv-essence-tight-men`, `nb-rc-essential-short-men`, `nike-impossibly-light-men`, `nike-therma-fit-glove`, `odlo-active-warm-eco-bottom-men`, `patagonia-capilene-thermal-crew-men`, `patagonia-houdini-men`, `patagonia-nano-puff-vest-men`, `patagonia-strider-pro-men`, `tracksmith-twilight-half-men` |
| Belts / hydration | `flipbelt-classic`, `kiprun-running-belt`, `nathan-peak-hydration-waist-pack`, `ultimate-direction-race-belt`, `camelbak-crux-15`, `hydrapak-softflask-250`, `hydrapak-softflask-speed-500`, `nathan-speeddraw-plus-insulated-18oz` |
| Lights | `amphipod-vizlet-led`, `amphipod-xinglet`, `amphipod-xinglet-optic-beam`, `nathan-lightbender-rx`, `black-diamond-spot-400-r`, `ledlenser-neo9r`, `nitecore-nu43`, `silva-trail-runner-free-2` |
| Headphones | `apple-airpods-4`, `apple-airpods-pro-2`, `beats-fit-pro`, `shokz-opendots-one`, `shokz-openfit-2`, `shokz-openrun`, `shokz-openrun-pro-2`, `soundcore-aerofit-2`, `suunto-wing` |
| GPS | `polar-vantage-v3`, `garmin-forerunner-970`, `coros-pace-3`, `garmin-enduro-3`, `garmin-instinct-3` |
| Packs | `black-diamond-distance-15`, `compressport-ultrun-s-pack`, `nathan-pinnacle-12`, `nathan-vaporair-2`, `nathan-vaporair-4`, `nathan-zippered-stash`, `osprey-duro-6`, `osprey-dyna-6`, `osprey-talon-velocity-20`, `salomon-adv-skin-5`, `salomon-custom-quiver`, `salomon-xa-15`, `ultimate-direction-fastpack-20`, `ultimate-direction-fastpack-her-20`, `ultimate-direction-utility-bag`, `uswe-pace-8` |
| Recovery / socks / HRM / fitness | `cep-run-compression-sock-3`, `swiftwick-aspire-four`, `blackroll-pro`, `brazyn-morph`, `cep-the-run-calf-sleeves`, `hyperice-normatec-3`, `hyperice-normatec-go`, `hyperice-vyper-3`, `therabody-theragun-prime`, `therabody-theragun-pro`, `triggerpoint-grid-travel`, `triggerpoint-grid-x`, `garmin-hrm-200`, `scosche-rhythm24`, `polar-verity-sense`, `scosche-rhythm-plus-2`, `assaultrunner-pro` |

Each row’s original nearest peer and score are in `FINAL-EDITORIAL-ISSUES.csv` (`Peer similarity X vs <peer>`). Typical failure: **category-peer Jaccard ≥ 0.72** after name-scrub (e.g. High5 ZERO vs Maurten Gel 100 Caf at 0.790 — tablet vs gel drowned in shared Expert Research glue).

---

## 3. Why paraphrase failed

Fix 37 unique Expert Research still clustered because:

1. **Name-scrub** — swapping product names does nothing.
2. **Shared gear/watch glue** leaked into nutrition, lights, audio, clothing (`carbon race stack`, GNSS watch recap, “training sock” last language).
3. **Contrast language** (“not a gel / not a tablet”) **added the peer’s tokens** to both pages and *raised* Jaccard.
4. **Category-peer clustering includes held unique-rewrites** — INDEXABLE pages must split from held siblings in the same category, not only from other Day-1 pages.

A rewrite is only valid if **spec/job facts** (carbs, caffeine, lumens, capacity, inseam, hood, drop, foam) dominate the token/3-gram set.

---

## 4. Product differentiation map (how rewrites were driven)

For every rewritten SKU, synthesis now builds:

| Map field | Source |
|---|---|
| Role | `inferIntendedJob` (nutrition format+carbs/caffeine, carry capacity, audio open-ear vs ANC, garment type, lumens, shoe role) |
| Category position | `categoryId` + subcategory + use-case tags |
| Differentiators | `buildDifferentiators` + full spec dump (`value+key` compact tokens) |
| Strengths / weaknesses | Catalog lists, used as-is |
| Closest competitors | Linked alts + numeric splits (`40g carbs vs 80g`, `250ml vs 500ml`) |
| Best / poor use | Audience + listed limits |
| Generation / variant | `generation`, family, variant specs (Rhythm24 memory vs Rhythm+ live-stream; 5" Chaser vs Method 7/8) |

Pages are **not** adjective swaps. Nutrition talks sachet vs tablet vs mix; flasks talk millilitres; vests vs hooded jackets; 10 mm ZoomX/ReactX vs 5 mm CMEVA.

---

## 5. What was rewritten vs preserved

- **Rewritten where generic:** verdict, Buy if / Skip if, performance/fit/value/alts, shared Expert Research frames.
- **Preserved:** held DUPLICATIVE estate (383). Not “fixed” into Day-1.
- **Extra 24 overlays:** flagship shoes/watches (Vomero, Bondi, Clifton, Ghost, Vaporfly, FR265s, etc.) were **not** in the original 114. Differentiating the 114 moved their nearest peer onto other flagships (cascade DUPLICATIVE). Those 24 were overlaid too so Day-1 stayed **0 DUP**. Unique-research overlays replace gold-standard longform on those SKUs until a later editorial pass restores voice without re-clustering.

Eight close pairs needed a **pair-specific spec brief** (no peer-token leakage) after the bulk synthesizer:

Spot 400-R ↔ Silva Free 2 · Canopy ↔ Craft wind vest · Rhythm24 ↔ Rhythm+ 2.0 · Vomero 18 ↔ Bondi 9

---

## 6. Hard validation

| Check | Result |
|---|---|
| Fix 50 category-peer (`classifyUniqueness`, max of token+3-gram Jaccard, names scrubbed) | INDEXABLE **0 DUP / 0 NEEDS_DIFF** |
| V2 all-peer recluster | **Not used** as acceptance |
| Mass PUBLIC_NOINDEX of the 114 | **Not done** |

---

## 7. Remaining blockers

| Item | Status |
|---|---|
| INDEXABLE NEEDS_DIFF | **None** |
| INDEXABLE DUPLICATIVE | **None** |
| Held DUPLICATIVE | 383 — still held by design |
| Follow-up (not a uniqueness GO-gate) | Eight pair-brief pages and 24 flagship overlays should get a later **voice** pass that keeps unique specs in the first tokens of sentences so category-peer Jaccard stays &lt; 0.72 |

---

## 8. Files

| Path | Role |
|---|---|
| `src/content/reviews-p53-differentiation.json` | 138 unique Expert Research overlays |
| `src/content/reviews-p53-differentiation.ts` | Typed export |
| `src/content/reviews.ts` | P53 overlay **wins** over unique-rewrite / flagships |
| `src/domain/review-agent/unique-expert-research.ts` | Spec stamps, job dialects, no shoe-glue on gear |
| `src/domain/review-agent/product-question-map.ts` | Nutrition/carry/audio/light decision specs |
| `scripts/tmp/prelaunch-53-indexable-diff.ts` | Export + rewrite + in-memory Fix 50 cluster |
| `docs/prelaunch/data/53-indexable-diff-result.json` | Run artifact |
