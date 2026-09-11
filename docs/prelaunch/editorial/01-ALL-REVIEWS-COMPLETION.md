# All Reviews Completion — Editorial 37

**Document ID:** `01-ALL-REVIEWS-COMPLETION`  
**Generated:** 2026-09-09T18:56:19.330Z  
**Policy:** Every Review must be product-specific Expert Research (unless real personal-test Evidence exists). No template paraphrase. Insufficient evidence → `NEEDS_RESEARCH`, remain held.

## Executive status

| Metric | Count |
|---|---:|
| Live reviews assessed | **590** |
| Unique Expert Research rewrites generated | **544** |
| `READY` | **116** |
| `NEEDS_DIFF` | **404** |
| `DUPLICATIVE` | **107** |
| `NEEDS_RESEARCH` | **3** |
| `BLOCKED` | **0** |
| Day-1 uniqueness holds (index gate) | **472** |

### Uniqueness auditor (enriched Fix 25 re-run)

| Class | Reviews |
|---|---:|
| GENUINELY_UNIQUE | 38 |
| TEMPLATE_SIMILAR_ACCEPTABLE | 36 |
| NEEDS_DIFFERENTIATION | 404 |
| DUPLICATIVE | 107 |

**Baseline (pre-37):** 521 DUPLICATIVE · 18 NEEDS_DIFF · ~43 unique/indexable.

**What changed:** Scaffold `reviews-backfill` clones were replaced with product-question-map Expert Research rewrites (`src/content/reviews-unique-rewrite.json`), enrichment no longer re-injects shared longform scaffolds into those rewrites, and duplicate slug merges were fixed.

**What remains:** Peer similarity after entity-scrub is still high inside thin catalog clusters (especially sunglasses + training shoes), driven by shared category structure and similar strengths/weaknesses — **not** the old “built for a specific job” scaffold. Those stay held until product-specific evidence deepens or further editorial differentiation.

## Target vs actual

| Target | Actual |
|---|---|
| 0 DUPLICATIVE | **107 remaining** |
| 0 NEEDS_DIFF | **404 remaining** |
| Insufficient-evidence cases held as NEEDS_RESEARCH | **3** |

## By category

| Category | Total | READY | NEEDS_RESEARCH | DUPLICATIVE | NEEDS_DIFF | BLOCKED |
|---|---:|---:|---:|---:|---:|---:|
| `cat-running-shoes` | 84 | 17 | 0 | 6 | 61 | 0 |
| `cat-running-clothing` | 57 | 0 | 0 | 18 | 39 | 0 |
| `cat-training-shoes` | 48 | 4 | 0 | 3 | 41 | 0 |
| `cat-nutrition` | 38 | 14 | 0 | 15 | 9 | 0 |
| `cat-packs-vests` | 35 | 2 | 0 | 13 | 20 | 0 |
| `cat-gps-watches` | 33 | 21 | 0 | 0 | 12 | 0 |
| `cat-padel-rackets` | 27 | 0 | 1 | 2 | 24 | 0 |
| `cat-padel-shoes` | 23 | 0 | 0 | 0 | 23 | 0 |
| `cat-tennis-rackets` | 20 | 1 | 0 | 0 | 19 | 0 |
| `cat-sunglasses` | 17 | 1 | 0 | 8 | 8 | 0 |
| `cat-hydration` | 17 | 4 | 0 | 0 | 13 | 0 |
| `cat-recovery-gear` | 16 | 3 | 0 | 6 | 7 | 0 |
| `cat-hrm` | 15 | 7 | 0 | 0 | 8 | 0 |
| `cat-tennis-shoes` | 14 | 1 | 0 | 1 | 12 | 0 |
| `cat-running-belts` | 14 | 5 | 0 | 2 | 7 | 0 |
| `cat-headphones` | 11 | 6 | 0 | 3 | 2 | 0 |
| `cat-running-socks` | 10 | 4 | 0 | 0 | 6 | 0 |
| `cat-running-lights` | 9 | 5 | 0 | 2 | 2 | 0 |
| `cat-adjustable-dumbbells` | 8 | 0 | 0 | 0 | 8 | 0 |
| `cat-power-racks` | 8 | 4 | 0 | 0 | 4 | 0 |
| `cat-weight-benches` | 7 | 1 | 0 | 0 | 6 | 0 |
| `cat-safety` | 6 | 5 | 0 | 0 | 1 | 0 |
| `cat-air-bikes` | 6 | 0 | 0 | 0 | 6 | 0 |
| `cat-treadmills` | 6 | 0 | 0 | 0 | 6 | 0 |
| `cat-lifting-accessories` | 6 | 0 | 0 | 0 | 6 | 0 |
| `cat-rowing-machines` | 6 | 1 | 0 | 0 | 5 | 0 |
| `cat-barbells` | 6 | 0 | 0 | 0 | 6 | 0 |
| `cat-pull-up-bars` | 6 | 1 | 0 | 0 | 5 | 0 |
| `cat-weight-plates` | 5 | 1 | 0 | 0 | 4 | 0 |
| `cat-ski-ergs` | 5 | 0 | 0 | 0 | 5 | 0 |
| `cat-kettlebells` | 5 | 0 | 0 | 0 | 5 | 0 |
| `cat-functional-fitness` | 5 | 0 | 0 | 0 | 5 | 0 |
| `cat-accessories` | 3 | 3 | 0 | 0 | 0 | 0 |
| `cat-parallettes` | 3 | 1 | 0 | 0 | 2 | 0 |
| `cat-weighted-vests` | 3 | 0 | 0 | 0 | 3 | 0 |
| `cat-gymnastic-rings` | 2 | 2 | 0 | 0 | 0 | 0 |
| `cat-gym-flooring` | 2 | 0 | 0 | 0 | 2 | 0 |
| `cat-gym-storage` | 2 | 2 | 0 | 0 | 0 | 0 |
| `cat-padel-balls` | 1 | 0 | 1 | 0 | 0 | 0 |
| `cat-padel-grips` | 1 | 0 | 1 | 0 | 0 | 0 |

## Rewrite pipeline artifacts

| Artifact | Path |
|---|---|
| Unique synthesizer | `src/domain/review-agent/unique-expert-research.ts` |
| Question map | `src/domain/review-agent/product-question-map.ts` |
| Batch rewrite | `scripts/tmp/prelaunch-37-unique-rewrite.ts` |
| Rewritten corpus | `src/content/reviews-unique-rewrite.json` |
| Rewrite report | `docs/prelaunch/editorial/data/37-unique-rewrite-report.json` |
| Enrichment guard | `src/lib/review/enrich-review-content.ts` (skip scaffolds for Kitletics Expert Research bodies) |

## Explicit NEEDS_RESEARCH (insufficient evidence — do not fake READY)

- `head-padel-pro-s-balls` — not_eligible_question_map
- `wilson-bela-pro-v2-2026` — not_eligible_question_map
- `wilson-padel-overgrip-pack` — not_eligible_question_map

## Every remaining non-READY review

- **NEEDS_DIFF** · `bowflex-selecttech-1090` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bowflex-selecttech-552` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nuobell-50` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nuobell-80` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `powerblock-elite-exp-90` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `powerblock-pro-series-100` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `powerblock-pro-series-50` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-quickdraw-adjustable-dumbbells` · cat-adjustable-dumbbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `assaultbike-classic` · cat-air-bikes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `assaultbike-elite` · cat-air-bikes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `concept2-bikeerg` · cat-air-bikes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-air-bike` · cat-air-bikes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-echo-bike` · cat-air-bikes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `schwinn-airdyne-ad8` · cat-air-bikes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `eleiko-performance-weightlifting-bar` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `eleiko-xf-bar` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-olympic-barbell` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-colorado-bar` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-ohio-bar` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-ohio-power-bar` · cat-barbells · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-battle-rope` · cat-functional-fitness · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-slam-ball` · cat-functional-fitness · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-dog-sled` · cat-functional-fitness · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-sandbag` · cat-functional-fitness · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-wall-ball` · cat-functional-fitness · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `apple-watch-ultra-2` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `coros-apex-2-pro` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `coros-pace-pro` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `garmin-forerunner-165` · cat-gps-watches · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `garmin-forerunner-255` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `garmin-forerunner-265` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `garmin-forerunner-55` · cat-gps-watches · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `garmin-forerunner-570` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `garmin-forerunner-965` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `polar-pacer-pro` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `suunto-race` · cat-gps-watches · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `suunto-race-s` · cat-gps-watches · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `mirafit-gym-mats` · cat-gym-flooring · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-flogging-horse-stall-mat-note` · cat-gym-flooring · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `apple-airpods-4` · cat-headphones · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `apple-airpods-pro-2` · cat-headphones · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `shokz-opendots-one` · cat-headphones · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `shokz-openrun-pro-2` · cat-headphones · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `soundcore-aerofit-2` · cat-headphones · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `coros-heart-rate-monitor` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `garmin-hrm-pro-plus` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `polar-h9` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `suunto-smart-heart-rate-belt` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wahoo-tickr` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wahoo-tickr-fit` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wahoo-tickr-x` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wahoo-trackr` · cat-hrm · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `camelbak-quick-grip-chill` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hydrapak-contour-2l` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hydrapak-skyflask-speed-500` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hydrapak-softflask-500` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hydrapak-softflask-speed-500` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hydrapak-tube-kit` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-exoshot-2` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-softflask-18oz` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-speeddraw-plus-insulated-18oz` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `osprey-hydraulics-lt-15` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-soft-flask-500` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-soft-reservoir-15` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ultimate-direction-body-bottle-500` · cat-hydration · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `eleiko-kettlebell` · cat-kettlebells · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-cast-iron-kettlebell` · cat-kettlebells · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-fitness-kettlebell` · cat-kettlebells · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-echo-kettlebell` · cat-kettlebells · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-kettlebell` · cat-kettlebells · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `blackroll-ball` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `blackroll-duoball` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `blackroll-med` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `blackroll-standard` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `eleiko-sport-collars` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-wrist-wraps` · cat-lifting-accessories · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `226ers-high-energy-gel` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `clif-bloks-energy-chews` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `enervit-c2-1-carbo-gel` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `gu-roctane-gel` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `huma-gel-original` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `maurten-drink-mix-160` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `maurten-drink-mix-320` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `maurten-gel-100` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `maurten-gel-100-caf-100` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `naak-ultra-energy-drink-mix` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `neversecond-c30-gel` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `neversecond-c30-sports-drink` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `nuun-sport` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `powerbar-energize` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `precision-pf30-drink-mix` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `precision-ph1500` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `saltstick-caps` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `sis-beta-fuel-gel` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `sis-go-isotonic-gel` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `skratch-sport-energy-chews` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `spring-energy-awesome-sauce` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `styrkr-gel30` · cat-nutrition · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `tailwind-endurance-fuel` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `veloforte-energy-chews` · cat-nutrition · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `black-diamond-distance-15` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `black-diamond-distance-22` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `black-diamond-distance-8` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `camelbak-apex-pro` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `camelbak-circuit-run-vest` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `camelbak-zephyr` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `camelbak-zephyr-pro` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `compressport-ultrun-s-pack` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `nathan-pinnacle-12` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-vaporair-2` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-vaporair-4` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nnormal-race-vest` · cat-packs-vests · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `on-ultra-vest-pro` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `osprey-duro-15` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `osprey-duro-6` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `osprey-duro-lt` · cat-packs-vests · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `osprey-dyna-6` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `osprey-dyna-lt` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `osprey-talon-velocity-30` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `osprey-tempest-velocity-20` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `salomon-adv-skin-12` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-adv-skin-5` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `salomon-custom-quiver` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `salomon-xa-15` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ultimate-direction-adventure-vest` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `ultimate-direction-fastpack-20` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ultimate-direction-fastpack-30` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `ultimate-direction-fastpack-her-20` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ultimate-direction-race-vest-6` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `ultimate-direction-utility-bag` · cat-packs-vests · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ultraspire-alpha-6` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ultraspire-spry-5` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `uswe-pace-8` · cat-packs-vests · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_RESEARCH** · `head-padel-pro-s-balls` · cat-padel-balls · padel · insufficient_catalog_signal_for_safe_unique_rewrite · uniqueness=UNCLASSIFIED_OK · held=false
- **NEEDS_RESEARCH** · `wilson-padel-overgrip-pack` · cat-padel-grips · padel · insufficient_catalog_signal_for_safe_unique_rewrite · uniqueness=UNCLASSIFIED_OK · held=false
- **NEEDS_DIFF** · `adidas-metalbone-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-metalbone-hrd-2026` · cat-padel-rackets · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `babolat-counter-viper-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-technical-viper-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `black-crown-special-one-soft` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bullpadel-hack-03` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bullpadel-hack-04-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bullpadel-vertex-04` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bullpadel-vertex-05-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `drop-shot-canyon-pro-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `head-coello-pro-2026` · cat-padel-rackets · padel · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `head-extreme-motion-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `head-extreme-pro-padel-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `kuikma-pr-soft-500` · cat-padel-rackets · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `lok-maxx-flow` · cat-padel-rackets · padel · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `nox-at10-genius-12k-alum-xtrem-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nox-at10-genius-18k-2026` · cat-padel-rackets · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nox-ml10-pro-cup-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `oxdog-sense-pro` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `royal-padel-m27-poly-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `siux-diablo-revolution-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `starvie-basalto-osiris-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `starvie-titania-kepler-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `tecnifibre-wall-breaker-365` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `varlion-lw-carbon-difusor-2026` · cat-padel-rackets · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_RESEARCH** · `wilson-bela-pro-v2-2026` · cat-padel-rackets · padel · insufficient_catalog_signal_for_safe_unique_rewrite · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `wilson-blade-pro-v2-padel-2026` · cat-padel-rackets · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-courtquick-padel-women` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-courtstabil-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-crazyquick-boost-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-crazyquick-boost-padel-women` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-game-ff-padel` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gel-challenger-court` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gel-dedicate-8-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `asics-gel-resolution-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `asics-solution-swift-ff2-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `babolat-jet-premura` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-movea-2` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-sensa-women` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `bullpadel-hybrid-fly` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `bullpadel-ionic-woman` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `head-revolt-pro-court` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `head-sprint-pro-4-padel` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `joma-slam-lady` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `joma-spin-men` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `joma-t-slam` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `kuikma-ps-990` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nox-at10-lux` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nox-ml10-hexa` · cat-padel-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `wilson-rush-pro-5-padel` · cat-padel-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `gravity-fitness-parallettes` · cat-parallettes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `pullup-and-dip-parallettes` · cat-parallettes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-m3-power-rack` · cat-power-racks · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-m4-cage` · cat-power-racks · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-pr-4000` · cat-power-racks · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-pr-5000` · cat-power-racks · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `gornation-premium-pull-up-bar` · cat-pull-up-bars · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-wall-pull-up-bar` · cat-pull-up-bars · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `pullup-and-dip-doorway-bar` · cat-pull-up-bars · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `pullup-and-dip-wall-bar` · cat-pull-up-bars · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-monster-lite-pull-up-bar` · cat-pull-up-bars · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `blackroll-pro` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brazyn-morph` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `cep-calf-sleeves-3` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `cep-the-run-calf-sleeves` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `hyperice-hypervolt-2` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `hyperice-hypervolt-go-2` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hyperice-vyper-3` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `oofos-oolala` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `oofos-ooriginal` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `therabody-theragun-mini-2` · cat-recovery-gear · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `therabody-theragun-pro` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `triggerpoint-grid-travel` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `triggerpoint-grid-x` · cat-recovery-gear · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `concept2-rowerg` · cat-rowing-machines · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `concept2-rowerg-dynamic` · cat-rowing-machines · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `mirafit-folding-rower` · cat-rowing-machines · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `mirafit-magnetic-rower` · cat-rowing-machines · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `waterrower-a1` · cat-rowing-machines · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `compressport-free-belt-pro` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `fitletic-fully-loaded` · cat-running-belts · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `flipbelt-classic` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `naked-running-band` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nathan-mirage-pak` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `nathan-zipster-lite` · cat-running-belts · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `salomon-pulse-belt` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `spibelt-original` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ultraspire-fitted-race-belt-2` · cat-running-belts · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-own-the-run-short-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-own-the-run-tee-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-core-split-short` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `brooks-canopy-jacket-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `brooks-chaser-5-women` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `brooks-method-tight-women` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `brooks-notch-thermal-beanie` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brooks-notch-thermal-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brooks-sherpa-7-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `buff-coolnet-uv` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `buff-merino-lightweight` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `buff-original` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `buff-polar` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ciele-gocap-athletics` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `craft-active-extreme-x-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `craft-adv-essence-light-wind-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `craft-adv-essence-light-wind-vest-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `craft-adv-essence-short` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `craft-adv-essence-tight-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `craft-adv-lumen-glove` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `janji-multi-short-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `janji-pace-short-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `janji-rainrunner-men` · cat-running-clothing · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `janji-run-tee-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `nb-rc-essential-short-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `nike-aerobill-cap` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-aeroswift-singlet-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-dri-fit-miler-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-dri-fit-miler-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-dri-fit-stride-short` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-fast-tight-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `nike-impossibly-light-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `nike-swoosh-medium-support` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `nike-therma-fit-glove` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `odlo-active-warm-eco-bottom-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `odlo-active-warm-eco-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `on-performance-short-men` · cat-running-clothing · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `on-performance-tight-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `on-weather-jacket-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `patagonia-capilene-cool-daily-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `patagonia-capilene-midweight-zip-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `patagonia-capilene-thermal-crew-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `patagonia-endless-run-tight-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `patagonia-houdini-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `patagonia-nano-puff-vest-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `patagonia-strider-pro-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `patagonia-trailfarer-short-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rabbit-fuel-n-fly-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-bonatti-wp-men` · cat-running-clothing · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `salomon-bonatti-wp-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `smartwool-thermal-merino-glove` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `tracksmith-brighton-ls-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `tracksmith-session-short-men` · cat-running-clothing · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `tracksmith-session-short-women` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `tracksmith-turnover-tight-women` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `tracksmith-twilight-half-men` · cat-running-clothing · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `tracksmith-van-cortlandt-tee-men` · cat-running-clothing · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `black-diamond-spot-400-r` · cat-running-lights · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `ledlenser-neo9r` · cat-running-lights · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `petzl-actik-core` · cat-running-lights · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `petzl-swift-rl` · cat-running-lights · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-adizero-adios-pro-4` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-adizero-boston-12` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-adizero-boston-13` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-adizero-evo-sl` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-terrex-agravic-3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-ultraboost-5` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `altra-escalante-4` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `altra-experience-flow` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `altra-lone-peak-8` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `altra-paradigm-7` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `altra-torin-8` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `asics-gel-cumulus-27` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `asics-gel-nimbus-27` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `asics-gel-trabuco-13` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gt-1000-13` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gt-2000-14` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-metaspeed-sky-paris` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-novablast-4` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-novablast-6` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `brooks-cascadia-18` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `brooks-ghost-16` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brooks-glycerin-21` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brooks-glycerin-gts-22` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `brooks-hyperion-max-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-arahi-7` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-bondi-8` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-clifton-9` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-clifton-pro` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `hoka-gaviota-5` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-mach-6` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `inov8-trailfly-ultra-g-300-max` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mizuno-wave-rebellion-pro-3` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `mizuno-wave-rider-28` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `new-balance-fresh-foam-x-1080-v13` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `new-balance-fresh-foam-x-1080-v14` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `new-balance-fresh-foam-x-hierro-v9` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `new-balance-fuelcell-rebel-v5` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `new-balance-fuelcell-supercomp-elite-v4` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `new-balance-fuelcell-supercomp-trainer-v3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-invincible-3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-pegasus-41` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-pegasus-trail-5` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-react-infinity-run-4` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-structure-26` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nike-structure-plus` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `on-cloudmonster-2` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `on-cloudmonster-hyper` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `on-cloudsurfer-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `on-cloudsurfer-next` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `puma-deviate-nitro-3` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `puma-magnify-nitro-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-aero-glide-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-genesis` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-pulsar-trail-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salomon-sense-ride-5` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `salomon-ultra-glide-2` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `saucony-endorphin-pro-3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `saucony-endorphin-pro-4` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `saucony-endorphin-speed-4` · cat-running-shoes · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `saucony-guide-18` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `saucony-peregrine-15` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `saucony-ride-18` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `saucony-triumph-22` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `saucony-xodus-ultra-3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `topo-athletic-phantom-3` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `topo-athletic-specter-2` · cat-running-shoes · running · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `topo-athletic-terraventure-5` · cat-running-shoes · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `balega-blister-resist` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `balega-hidden-comfort` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `darn-tough-run-1-4` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `drymax-run-lite-mesh` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `feetures-elite-light-cushion` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wrightsock-coolmesh-ii` · cat-running-socks · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `proviz-reflect360-running-vest` · cat-safety · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `concept2-skierg` · cat-ski-ergs · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `concept2-skierg-floor-stand` · cat-ski-ergs · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `concept2-skierg-with-stand` · cat-ski-ergs · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `skierg2-wall-mount` · cat-ski-ergs · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `xebex-ski-erg` · cat-ski-ergs · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `100-percent-s3` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `goodr-circle-gs` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `goodr-ogs` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `julbo-aerolite` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `julbo-ultimate` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `oakley-encoder` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `oakley-flak-2-0-xl` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `oakley-kato` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `oakley-radar-ev-path` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `oakley-sutro-lite` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `roka-phantom-air` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `rudy-project-cutline` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **DUPLICATIVE** · `smith-attack-mag` · cat-sunglasses · running · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `smith-shift-mag` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `tifosi-rail` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `tifosi-vogel` · cat-sunglasses · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-pure-aero-2023` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-pure-aero-2026` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-pure-drive-2025` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-pure-drive-gen11` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `dunlop-cx-200` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `head-radical-mp-2023` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `head-speed-mp-2024` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `prince-textreme-tour-100p` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `tecnifibre-tf40-305` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `tecnifibre-tfight-300s-2025` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wilson-blade-100-v9` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wilson-blade-98-v8` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `wilson-blade-98-v9` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `wilson-clash-100-v2` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `wilson-clash-100-v3` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `yonex-ezone-100-2025` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `yonex-ezone-98-2024` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `yonex-vcore-100-2023` · cat-tennis-rackets · tennis · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `yonex-vcore-98-2026` · cat-tennis-rackets · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `adidas-barricade-13` · cat-tennis-shoes · padel · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `adidas-courtjam-control-3` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-solematch-control-2` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gel-challenger-15` · cat-tennis-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `asics-gel-dedicate-8` · cat-tennis-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `asics-gel-resolution-9` · cat-tennis-shoes · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `asics-gel-resolution-9-clay` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-solution-speed-ff-3` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `babolat-jet-mach-3` · cat-tennis-shoes · padel · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `k-swiss-hypercourt-express-2` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `k-swiss-ultrashot-3` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `wilson-rush-pro-4-0` · cat-tennis-shoes · tennis · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `wilson-rush-pro-ace` · cat-tennis-shoes · padel · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-adipower-weightlifting-2` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-adipower-weightlifting-3` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-dropset-2` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-dropset-3` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `adidas-powerlift-5` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-rapidmove-adv` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `adidas-the-total` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `asics-gel-quantum-360-8` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `do-win-classic` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `hoka-transport` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `inov8-f-lite-235-v3` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `inov8-f-lite-260` · cat-training-shoes · fitness · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `inov8-fastlift-360` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `inov8-fastlift-400` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `inov8-fastlift-power-g-380` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `lululemon-strongfeel` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nb-minimus-tr` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-free-metcon-6` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nike-metcon-8` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nike-metcon-9` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nike-romaleos-4` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nike-romaleos-5` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nike-savaleos` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `nobull-outwork` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nobull-trainer` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `nobull-trainer-plus` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `puma-fuse-3` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `puma-fuse-fasted` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `reebok-legacy-lifter-iii` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `reebok-lifter-pr-iii` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `reebok-nano-court` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `reebok-nano-x3` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `reebok-nano-x4` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salming-race-9` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `salming-rebel` · cat-training-shoes · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **DUPLICATIVE** · `tyr-cxt-1` · cat-training-shoes · fitness · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `tyr-cxt-2` · cat-training-shoes · fitness · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **DUPLICATIVE** · `tyr-cxt1-trainer` · cat-training-shoes · fitness · uniqueness_auditor_duplicative · uniqueness=DUPLICATIVE · held=true
- **NEEDS_DIFF** · `ua-charged-commit-4` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ua-project-rock-bsr-4` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ua-reign-lifter` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `ua-tribase-reign-6` · cat-training-shoes · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `vivobarefoot-primus-lite-iii` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `xero-prio` · cat-training-shoes · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `assaultrunner-elite` · cat-treadmills · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `assaultrunner-pro` · cat-treadmills · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `horizon-t202-treadmill` · cat-treadmills · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-folding-treadmill` · cat-treadmills · running · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `sole-f80-treadmill` · cat-treadmills · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `woodway-curve-trainer` · cat-treadmills · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `atx-fid-bench` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-ab-5000-zero-gap` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-ab-5200` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rep-fb-5000-flat-bench` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-adjustable-bench-3-0` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-flat-utility-bench` · cat-weight-benches · other · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `atx-cast-iron-plate-set` · cat-weight-plates · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `eleiko-sport-bumper-set` · cat-weight-plates · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `rep-black-bumper-plate-set` · cat-weight-plates · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `rogue-echo-bumper-plate-set` · cat-weight-plates · other · uniqueness_auditor_needs_differentiation · uniqueness=NEEDS_DIFFERENTIATION · held=true
- **NEEDS_DIFF** · `gravity-fitness-weighted-vest` · cat-weighted-vests · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `mirafit-weighted-vest` · cat-weighted-vests · fitness · content_uniqueness_hold · uniqueness=HELD · held=true
- **NEEDS_DIFF** · `rogue-plate-carrier-vest` · cat-weighted-vests · fitness · content_uniqueness_hold · uniqueness=HELD · held=true

## Next actions (still no auto-publish)

1. Deepen evidence for sunglasses + training-shoe clusters (independent sources beyond `ev-catalog-*`).
2. Re-run `prelaunch-37-unique-rewrite.ts --fresh` after evidence upgrades.
3. Re-run `prelaunch-25-content-uniqueness.ts` and only then drop holds.
4. Keep editorial READY separate from Day-1 indexation.

---

*Expert Research language only. No false first-hand claims.*
