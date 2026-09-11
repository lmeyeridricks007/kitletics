# Kitletics Pre-Launch Audit 03 — Editorial Content Quality

**Mode:** READ-ONLY forensic
**Generated:** 2026-09-06T21:18:30.893Z
**Audit clock:** 2026-09-06T12:00:00.000Z
**Machine-readable:** [`data/03-editorial-quality.json`](./data/03-editorial-quality.json)

> No content generated, enriched to disk, or publication-status changes. Page-time review enrichment assessed in-memory only.

---

## Classification rules

### Reviews

**LAUNCH_READY**
- productionExposed
- substantive verdict (≥20 words)
- ≥2 pros, ≥2 cons, ≥2 Best For, ≥2 Skip If
- ≥4 sections, ≥600 words
- evidence + methodology present
- decisionScore ≥ 70
- no false first-hand claims

**NEEDS_MINOR_WORK**
- productionExposed
- verdict + some audience signals
- ≥3 sections, ≥350 words
- decisionScore ≥ 50

**THIN**
- Below NEEDS_MINOR_WORK thresholds while still a review record

**DUPLICATIVE**
- Near-identical normalized body to another review

**BLOCKED**
- not productionExposed / archived / noindex
- OR orphan product
- OR first-hand claim without personal-test Evidence (CRITICAL BLOCKER)

### Best Guides

**LAUNCH_READY**
- productionExposed
- high contextual reasoning on majority of picks
- methodology + criteria
- who suits / who avoids on picks
- comparison table OR choose-instead
- intro depth ≥100 words
- evidenceIds preferred but not required when methodology present

**THIN**
- Essentially title + intro + product cards (+FAQ) without real decision analysis

**NEEDS_MINOR_WORK**
- Has structure (methodology/criteria + picks) but missing choose-instead / avoid / best-for profiles / intro depth / evidence
- OR medium contextual depth with trade-offs + choose-instead

**BLOCKED**
- not productionExposed

### Guides

- Source: `assessGuideQuality() + Guide Depth Standard (guide-depth.ts)`
- COMPLETE / THIN / NEEDS_RESEARCH / STALE / BLOCKED mapped from assessGuideQuality + production exposure

---

## 1. Inventory

| Type | Count |
|---|---:|
| Reviews | 590 |
| Best Guides (all) | 58 |
| Best Guides — category | 53 |
| Best Guides — use-case | 5 |
| Buying / long-form Guides | 68 |
| Explainers (long-form layout) | 67 |
| Comparisons (editorial) | 102 |
| Gear Setups | 16 |
| Tools (records) | 28 |
| Finder definitions | 16 |
| Calculator tool records | 5 |
| Alternatives pages eligible | 85 |
| Authors | 1 |

### Reviews by status

| Status | Count |
|---|---:|
| published | 585 |
| scheduled | 1 |
| review | 4 |

### Reviews by sport (product tagging)

| Sport | Count |
|---|---:|
| Running | 368 |
| Fitness & Training | 186 |
| Cycling | 82 |
| HYROX | 67 |
| Padel | 64 |
| Tennis | 56 |
| Recovery | 16 |
| Swimming | 15 |
| Calisthenics | 14 |

### Best Guides by status

| Status | Count |
|---|---:|
| published | 58 |

### Buying Guides by status

| Status | Count |
|---|---:|
| published | 68 |

---

## 2–3. Reviews

| Review type | Count |
|---|---:|
| total | 590 |
| first-hand-test | 0 |
| expert-research | 590 |
| hybrid | 0 |
| unknown | 0 |

| Classification | Count |
|---|---:|
| LAUNCH_READY | 585 |
| NEEDS_MINOR_WORK | 0 |
| THIN | 0 |
| DUPLICATIVE | 0 |
| BLOCKED | 5 |

### Dimension pass rates

| Dimension | Pass | % |
|---|---:|---:|
| substantiveVerdict | 590 | 100 |
| pros | 589 | 99.8 |
| cons | 590 | 100 |
| bestFor | 590 | 100 |
| skipIf | 590 | 100 |
| specAnalysis | 590 | 100 |
| useCaseAnalysis | 590 | 100 |
| fit | 590 | 100 |
| performance | 590 | 100 |
| alternatives | 590 | 100 |
| comparisonContext | 102 | 17.3 |
| evidence | 590 | 100 |
| author | 590 | 100 |
| methodology | 590 | 100 |
| productSourceDisclosure | 590 | 100 |

### Every non-LAUNCH_READY Review

Count: **5**

| Route | Classification | Type | Exposed | Reasons |
|---|---|---|---|---|
| /reviews/asics-novablast-5-deep-dive | BLOCKED | expert-research | no | not_production_exposed; status=scheduled |
| /reviews/bear-komplex-valor | BLOCKED | expert-research | no | not_production_exposed; status=review |
| /reviews/domyos-mid-500 | BLOCKED | expert-research | no | not_production_exposed; status=review |
| /reviews/nobull-trail | BLOCKED | expert-research | no | not_production_exposed; status=review |
| /reviews/zeraus-classic | BLOCKED | expert-research | no | not_production_exposed; status=review |

---

## 4. First-hand claim audit (CRITICAL)

Blockers (claim language without `personal-test` Evidence): **0**

_None detected under configured patterns._

---

## 5–6. Best Guides

| Status | Count |
|---|---:|
| LAUNCH_READY | 44 |
| NEEDS_MINOR_WORK | 3 |
| THIN | 11 |
| BLOCKED | 0 |

### Per Best Guide

| Route | Intent | Considered | Shortlisted | Recs | Depth | Trade-offs | Avoid | Choose-instead | Comparison | Methodology | Evidence | Status |
|---|---|---:|---:|---:|---|---:|---:|---:|---|---|---|---|
| /best/adjustable-benches | category | 0 | 0 | 3 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/adjustable-dumbbells | category | 0 | 0 | 5 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/air-bikes | category | 0 | 0 | 4 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/carbon-plated-running-shoes | category | 13 | 11 | 7 | high | 7 | 7 | 7 | yes | yes | yes | LAUNCH_READY |
| /best/daily-trainers | category | 15 | 9 | 9 | high | 9 | 9 | 9 | yes | yes | yes | LAUNCH_READY |
| /best/handheld-running-bottles | category | 12 | 7 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/heart-rate-monitors-chest-straps | category | 12 | 8 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/heart-rate-monitors-hyrox | category | 0 | 0 | 4 | low | 0 | 0 | 4 | yes | yes | yes | NEEDS_MINOR_WORK |
| /best/heart-rate-monitors-intervals | category | 12 | 8 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/heart-rate-monitors-running | category | 5 | 5 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/home-gym-equipment | category | 0 | 0 | 5 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/hydration-marathon-training | category | 12 | 8 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/hydration-vests-trail | category | 12 | 7 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/hydration-vests-ultra | category | 12 | 8 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/hyrox-shoes | category | 0 | 0 | 9 | low | 0 | 0 | 0 | yes | yes | no | NEEDS_MINOR_WORK |
| /best/marathon-shoes | use-case | 8 | 8 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/max-cushion-running-shoes | category | 14 | 12 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/padel-rackets | category | 0 | 0 | 7 | low | 0 | 0 | 0 | yes | yes | no | NEEDS_MINOR_WORK |
| /best/power-racks | category | 0 | 0 | 5 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/pull-up-bars | category | 0 | 0 | 5 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/race-shoes | category | 13 | 11 | 7 | high | 7 | 7 | 7 | yes | yes | yes | LAUNCH_READY |
| /best/rowing-machines | category | 0 | 0 | 4 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/running-belts | category | 12 | 9 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-clothing-hot-weather | category | 12 | 9 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-gear-winter | category | 12 | 10 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-headlamps | category | 15 | 13 | 9 | high | 9 | 9 | 9 | yes | yes | yes | LAUNCH_READY |
| /best/running-headphones | category | 17 | 15 | 12 | high | 12 | 12 | 12 | yes | yes | yes | LAUNCH_READY |
| /best/running-hydration-vests | category | 5 | 5 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-jackets | category | 12 | 6 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-packs | category | 15 | 12 | 9 | high | 9 | 9 | 9 | yes | yes | yes | LAUNCH_READY |
| /best/running-race-fuel | category | 17 | 14 | 11 | high | 11 | 11 | 11 | yes | yes | yes | LAUNCH_READY |
| /best/running-rain-jackets | category | 12 | 5 | 4 | high | 4 | 4 | 4 | yes | yes | yes | LAUNCH_READY |
| /best/running-recovery-gear | category | 16 | 13 | 10 | high | 10 | 10 | 10 | yes | yes | yes | LAUNCH_READY |
| /best/running-safety-visibility | category | 14 | 12 | 9 | high | 9 | 9 | 9 | yes | yes | yes | LAUNCH_READY |
| /best/running-shoes | category | 9 | 9 | 9 | high | 9 | 9 | 9 | yes | yes | yes | LAUNCH_READY |
| /best/running-shoes-beginners | use-case | 8 | 8 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/running-shoes-heavy-runners | use-case | 12 | 10 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-shoes-long-runs | category | 23 | 12 | 7 | high | 7 | 7 | 7 | yes | yes | yes | LAUNCH_READY |
| /best/running-shoes-wide-feet | use-case | 14 | 12 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/running-shorts | category | 12 | 10 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-socks | category | 14 | 11 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/running-sunglasses | category | 16 | 14 | 10 | high | 10 | 10 | 10 | yes | yes | yes | LAUNCH_READY |
| /best/running-tights | category | 12 | 7 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches | category | 6 | 6 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-beginners | category | 12 | 9 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-budget | category | 12 | 9 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-marathon | category | 12 | 9 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-music | category | 12 | 10 | 6 | high | 6 | 6 | 6 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-small-wrists | category | 12 | 8 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-trail | category | 12 | 8 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/running-watches-ultra | category | 12 | 6 | 5 | high | 5 | 5 | 5 | yes | yes | yes | LAUNCH_READY |
| /best/stability-running-shoes | category | 7 | 7 | 7 | high | 7 | 7 | 7 | yes | yes | yes | LAUNCH_READY |
| /best/tempo-running-shoes | use-case | 14 | 11 | 8 | high | 8 | 8 | 8 | yes | yes | yes | LAUNCH_READY |
| /best/tennis-rackets | category | 0 | 0 | 6 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/trail-running-shoes | category | 13 | 9 | 7 | high | 7 | 7 | 7 | yes | yes | yes | LAUNCH_READY |
| /best/training-shoes | category | 0 | 0 | 9 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/treadmills-for-home | category | 0 | 0 | 4 | low | 0 | 0 | 0 | yes | yes | no | THIN |
| /best/weight-plates | category | 0 | 0 | 4 | low | 0 | 0 | 0 | yes | yes | no | THIN |

### Thin Best Guides (card-shelf / low analysis)

Count: **11**

- /best/tennis-rackets — title_intro_cards_faq_pattern
- /best/adjustable-dumbbells — title_intro_cards_faq_pattern
- /best/power-racks — title_intro_cards_faq_pattern
- /best/training-shoes — contextualDepth=low; introWords=24
- /best/rowing-machines — title_intro_cards_faq_pattern
- /best/pull-up-bars — title_intro_cards_faq_pattern
- /best/home-gym-equipment — title_intro_cards_faq_pattern
- /best/adjustable-benches — title_intro_cards_faq_pattern
- /best/air-bikes — title_intro_cards_faq_pattern
- /best/treadmills-for-home — title_intro_cards_faq_pattern
- /best/weight-plates — title_intro_cards_faq_pattern

---

## 7–8. Guides (Guide Depth Standard)

| Status | Count |
|---|---:|
| COMPLETE | 68 |
| THIN | 0 |
| NEEDS_RESEARCH | 0 |
| STALE | 0 |
| BLOCKED | 0 |

| Route | Type | Depth tier | Sections | Decision | Visuals | Products | Finder | Best | Compare | FAQ | Related | Status |
|---|---|---|---:|---|---|---:|---|---|---|---|---|---|
| /guides/adjustable-vs-fixed-dumbbells | explainer | standard | 1 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/beginner-running-gear-stack | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/beginner-vs-advanced-running-watch | explainer | standard | 2 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/bumper-plates-vs-iron-plates | explainer | standard | 2 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/caffeine-in-running-fuel-explained | explainer | standard | 4 | high | yes | 6 | no | yes | yes | yes | yes | COMPLETE |
| /guides/carbon-vs-nylon-plates | explainer | deep | 4 | high | yes | 8 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/first-marathon-gear-checklist | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/foam-rolling-for-runners | explainer | standard | 5 | high | yes | 7 | no | yes | yes | yes | yes | COMPLETE |
| /guides/gel-vs-drink-mix-vs-chews | explainer | standard | 4 | high | yes | 9 | no | yes | yes | yes | yes | COMPLETE |
| /guides/handheld-bottles-for-running | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/hot-weather-running-apparel | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/how-much-space-do-you-need-for-a-home-gym | explainer | standard | 2 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-build-a-home-gym | explainer | standard | 3 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-build-a-hyrox-home-gym | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-carry-fuel-on-long-runs | explainer | standard | 4 | high | yes | 8 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-a-home-treadmill | explainer | standard | 2 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-hyrox-training-sled | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-hyrox-watch | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-padel-racket | explainer | deep | 13 | high | yes | 4 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-a-power-rack | explainer | standard | 3 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-rowing-machine | explainer | standard | 2 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-tennis-racket | explainer | standard | 6 | high | yes | 5 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-a-weight-bench | explainer | standard | 2 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-choose-adjustable-dumbbells | explainer | standard | 2 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/how-to-choose-heart-rate-monitor | explainer | standard | 4 | high | yes | 3 | no | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-hyrox-shoes | explainer | standard | 3 | high | yes | 4 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-padel-shoes | explainer | standard | 1 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-running-belt | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-running-headlamp | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-running-hydration-vest | explainer | standard | 3 | high | yes | 9 | no | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-running-shoes | buying-guide | deep | 10 | high | yes | 10 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-running-socks | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/how-to-choose-running-watch | explainer | deep | 4 | high | yes | 5 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/how-to-choose-training-shoes | explainer | standard | 1 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/hydration-for-marathon-training | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/hydration-vest-vs-running-belt | explainer | standard | 2 | high | yes | 3 | no | yes | yes | yes | yes | COMPLETE |
| /guides/hyrox-equipment-standards | explainer | standard | 2 | high | yes | 8 | yes | yes | yes | yes | no | COMPLETE |
| /guides/hyrox-heart-rate-monitor | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/hyrox-home-training-setup | explainer | standard | 2 | high | yes | 4 | yes | yes | yes | yes | no | COMPLETE |
| /guides/hyrox-race-day-gear-checklist | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/hyrox-race-shoes-vs-training-shoes | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/maps-navigation-running-watches | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/massage-guns-explained | explainer | standard | 6 | high | yes | 8 | no | yes | yes | yes | yes | COMPLETE |
| /guides/multi-band-gps-running-watches | explainer | standard | 3 | high | yes | 3 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/open-ear-vs-in-ear-running-headphones | explainer | standard | 2 | high | yes | 8 | no | yes | yes | yes | yes | COMPLETE |
| /guides/optical-wrist-hr-vs-chest-strap | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/padel-grips-overgrips-explained | explainer | standard | 1 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/power-rack-sizing-and-hole-spacing | explainer | standard | 1 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/pull-up-bar-mounting-guide | explainer | standard | 1 | high | yes | 3 | yes | no | yes | yes | no | COMPLETE |
| /guides/recovery-sandals-for-runners | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/recovery-tools-what-evidence-shows | explainer | standard | 5 | high | yes | 7 | no | yes | yes | yes | yes | COMPLETE |
| /guides/road-vs-trail-running-shoes | explainer | standard | 3 | high | yes | 12 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/rowerg-vs-skierg-for-hyrox-training | explainer | standard | 2 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/running-gels-explained | explainer | standard | 4 | high | yes | 10 | no | yes | yes | yes | yes | COMPLETE |
| /guides/running-jackets-explained | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/running-shoe-cushioning | explainer | deep | 4 | high | yes | 8 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/running-shoe-drop | explainer | deep | 4 | high | yes | 4 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/running-shoe-rotation | explainer | deep | 4 | high | yes | 4 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/running-shoe-terminology | explainer | standard | 4 | high | yes | 4 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/running-watch-battery-life-explained | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/shoe-jobs-by-session-type | explainer | standard | 3 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/soft-flasks-vs-bladders-explained | explainer | standard | 2 | high | yes | 3 | no | yes | yes | yes | no | COMPLETE |
| /guides/stability-shoes-explained | explainer | deep | 8 | high | yes | 11 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/trail-race-kit-essentials | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/what-gear-do-you-need-for-hyrox | explainer | standard | 3 | high | yes | 3 | yes | yes | yes | yes | no | COMPLETE |
| /guides/what-is-a-daily-trainer | explainer | standard | 4 | high | yes | 9 | yes | yes | yes | yes | yes | COMPLETE |
| /guides/when-to-use-a-massage-gun | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |
| /guides/winter-layering-for-runners | explainer | standard | 3 | high | yes | 3 | no | no | yes | yes | no | COMPLETE |

---

## 9. Duplicate intent / cannibalization

### Intent-map collisions

_None._


### Detected route groups (sample)

- **best_vs_guide**: /best/running-shoes · /guides/how-to-choose-running-shoes — slug overlap: running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/running-shoes · /guides/road-vs-trail-running-shoes — slug overlap: running-shoes ↔ road-vs-trail-running-shoes
- **best_vs_guide**: /best/daily-trainers · /guides/what-is-a-daily-trainer — slug overlap: daily-trainers ↔ what-is-a-daily-trainer
- **best_vs_guide**: /best/running-shoes-long-runs · /guides/how-to-choose-running-shoes — slug overlap: running-shoes-long-runs ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/max-cushion-running-shoes · /guides/how-to-choose-running-shoes — slug overlap: max-cushion-running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/tempo-running-shoes · /guides/how-to-choose-running-shoes — slug overlap: tempo-running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/race-shoes · /guides/hyrox-race-shoes-vs-training-shoes — slug overlap: race-shoes ↔ hyrox-race-shoes-vs-training-shoes
- **best_vs_guide**: /best/carbon-plated-running-shoes · /guides/how-to-choose-running-shoes — slug overlap: carbon-plated-running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/stability-running-shoes · /guides/how-to-choose-running-shoes — slug overlap: stability-running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/trail-running-shoes · /guides/how-to-choose-running-shoes — slug overlap: trail-running-shoes ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/trail-running-shoes · /guides/road-vs-trail-running-shoes — slug overlap: trail-running-shoes ↔ road-vs-trail-running-shoes
- **best_vs_guide**: /best/running-shoes-heavy-runners · /guides/how-to-choose-running-shoes — slug overlap: running-shoes-heavy-runners ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/running-shoes-beginners · /guides/how-to-choose-running-shoes — slug overlap: running-shoes-beginners ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/running-shoes-wide-feet · /guides/how-to-choose-running-shoes — slug overlap: running-shoes-wide-feet ↔ how-to-choose-running-shoes
- **best_vs_guide**: /best/running-watches · /guides/how-to-choose-running-watch — slug overlap: running-watches ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches · /guides/multi-band-gps-running-watches — slug overlap: running-watches ↔ multi-band-gps-running-watches
- **best_vs_guide**: /best/running-watches · /guides/maps-navigation-running-watches — slug overlap: running-watches ↔ maps-navigation-running-watches
- **best_vs_guide**: /best/running-watches-beginners · /guides/how-to-choose-running-watch — slug overlap: running-watches-beginners ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-marathon · /guides/how-to-choose-running-watch — slug overlap: running-watches-marathon ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-trail · /guides/how-to-choose-running-watch — slug overlap: running-watches-trail ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-ultra · /guides/how-to-choose-running-watch — slug overlap: running-watches-ultra ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-budget · /guides/how-to-choose-running-watch — slug overlap: running-watches-budget ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-music · /guides/how-to-choose-running-watch — slug overlap: running-watches-music ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/running-watches-small-wrists · /guides/how-to-choose-running-watch — slug overlap: running-watches-small-wrists ↔ how-to-choose-running-watch
- **best_vs_guide**: /best/heart-rate-monitors-running · /guides/how-to-choose-heart-rate-monitor — slug overlap: heart-rate-monitors-running ↔ how-to-choose-heart-rate-monitor
_Total cannibalization group signals: 110_


### Men/Women near-duplicates

_None._


---

## 10. Content similarity (template repetition)

### reviewSummaries

_No ≥3-product identical normalized groups._

### reviewPros

- ×21: `high cushioning for the sessions it was built for`
  - /reviews/adidas-adizero-adios-pro-4: “high cushioning for the sessions it was built for”
  - /reviews/adidas-adizero-evo-sl: “high cushioning for the sessions it was built for”
- ×14: `head light shape balance suited to its intended play style`
  - /reviews/dunlop-cx-200: “head-light shape/balance suited to its intended play style”
  - /reviews/head-radical-mp-2023: “head-light shape/balance suited to its intended play style”
- ×13: `medium cushioning for the sessions it was built for`
  - /reviews/altra-lone-peak-8: “medium cushioning for the sessions it was built for”
  - /reviews/asics-gt-2000-14: “medium cushioning for the sessions it was built for”
- ×12: `diamond shape balance suited to its intended play style`
  - /reviews/adidas-metalbone-2026: “diamond shape/balance suited to its intended play style”
  - /reviews/adidas-metalbone-hrd-2026: “diamond shape/balance suited to its intended play style”
- ×9: `moderate cushioning for the sessions it was built for`
  - /reviews/adidas-adizero-boston-13: “moderate cushioning for the sessions it was built for”
  - /reviews/adidas-terrex-agravic-3: “moderate cushioning for the sessions it was built for”

### bestIntros

_No ≥3-product identical normalized groups._

### guideSections

_No ≥3-product identical normalized groups._

---

## 11. Comparisons

| Metric | Count |
|---|---:|
| Editorial comparisons | 102 |
| Published | 102 |
| Production-exposed | 102 |
| Meaningful | 102 |
| Thin | 0 |
| Reverse-duplicate groups | 0 |
| Theoretical shoe pairs (published shoes) | 3403 |
| Editorial shoe comparisons | 12 |

**Combinatorial indexable pages?** **NO**

generateStaticParams uses getComparisons() editorial seeds only. Dynamic /compare? or pair URLs via getDynamicComparisonData are explicitly noindex; editorial pairs redirect to canonical slug.

---

## 12. Tools / Finders / Calculators

| Name | Route | Type | Functional | Landing indexable | Results indexable | Requires JS | Explanatory landing |
|---|---|---|---|---|---|---|---|
| Running Shoe Finder | /tools/running-shoe-finder | finder | yes | yes | no | yes | no |
| Fitness Watch Finder | /tools/fitness-watch-finder | finder | yes | yes | no | yes | no |
| Running Pace Calculator | /tools/running-pace-calculator | calculator | yes | yes | no | yes | no |
| Race Time Predictor | /tools/race-time-predictor | calculator | yes | yes | no | yes | no |
| Shoe Rotation Planner | /tools/shoe-rotation-planner | planner | yes | yes | no | yes | yes |
| Running Hydration Finder | /tools/running-hydration-finder | finder | yes | yes | no | yes | yes |
| Running Heart Rate Monitor Finder | /tools/running-hrm-finder | finder | yes | yes | no | yes | no |
| Running Apparel Finder | /tools/running-clothing-finder | finder | yes | yes | no | yes | no |
| Running Fuel Finder | /tools/running-fuel-finder | finder | yes | yes | no | yes | no |
| Running Recovery Finder | /tools/running-recovery-finder | finder | yes | yes | no | yes | yes |
| Running Accessories Finder | /tools/running-accessories-finder | finder | yes | yes | no | yes | no |
| Compare Products | /compare | comparison | yes | yes | no | yes | no |
| Home Gym Builder | /tools/home-gym-builder | builder | yes | yes | no | yes | yes |
| HYROX Shoe Finder | /tools/hyrox-shoe-finder | finder | yes | yes | no | yes | no |
| Training Shoe Finder | /tools/training-shoe-finder | finder | yes | yes | no | yes | yes |
| Adjustable Dumbbell Finder | /tools/adjustable-dumbbell-finder | finder | yes | yes | no | yes | no |
| Power Rack Finder | /tools/power-rack-finder | finder | yes | yes | no | yes | no |
| Pull-Up Bar Finder | /tools/pull-up-bar-finder | finder | yes | yes | no | yes | no |
| One-Rep Max Calculator | /tools/one-rep-max-calculator | calculator | yes | yes | no | yes | no |
| Plate Calculator | /tools/plate-calculator | calculator | yes | yes | no | yes | no |
| Treadmill Finder | /tools/treadmill-finder | finder | yes | yes | no | yes | yes |
| HYROX Race Kit Builder | /tools/hyrox-race-kit-builder | builder | yes | yes | no | yes | yes |
| HYROX Race Time Calculator | /tools/hyrox-race-time-calculator | calculator | yes | yes | no | yes | yes |
| Padel Racket Finder | /tools/padel-racket-finder | finder | yes | yes | no | yes | yes |
| Tennis Racket Finder | /tools/tennis-racket-finder | finder | yes | yes | no | yes | yes |
| Pickleball Paddle Finder | /tools/pickleball-paddle-finder | finder | no | no | no | yes | no |
| Badminton Racket Finder | /tools/badminton-racket-finder | finder | no | no | no | yes | no |
| Squash Racket Finder | /tools/squash-racket-finder | finder | no | no | no | yes | no |

Finder definitions registered: **16** (running-shoe-finder, training-shoe-finder, hyrox-shoe-finder, adjustable-dumbbell-finder, power-rack-finder, treadmill-finder, pull-up-bar-finder, fitness-watch-finder, running-hydration-finder, running-hrm-finder, running-clothing-finder, running-fuel-finder, running-recovery-finder, running-accessories-finder, padel-racket-finder, tennis-racket-finder)

---

## 13. Authors / trust

| Author | Route | Reviews | Bio | Disclosure |
|---|---|---:|---|---|
| Kitletics Editorial | /authors/kitletics-editorial | 590 | yes | yes |

| Trust coverage | % |
|---|---:|
| Reviews with author | 100 |
| Reviews with methodology/testingContext | 99.8 |
| Reviews with disclosure language | 99.8 |

Site pages: /methodology, /how-we-review, /affiliate-disclosure

---

## 14. Strongest content

### Reviews

- /reviews/nathan-vaporair-4 — decisionScore=100, words=4105, sections=10, type=expert-research
- /reviews/spring-energy-awesome-sauce — decisionScore=100, words=4091, sections=10, type=expert-research
- /reviews/biolite-headlamp-800-pro — decisionScore=100, words=4090, sections=10, type=expert-research
- /reviews/salomon-adv-skin-5 — decisionScore=100, words=4085, sections=10, type=expert-research
- /reviews/janji-multi-short-men — decisionScore=100, words=4085, sections=10, type=expert-research
- /reviews/tracksmith-session-short-men — decisionScore=100, words=4077, sections=10, type=expert-research
- /reviews/oakley-radar-ev-path — decisionScore=100, words=4076, sections=10, type=expert-research
- /reviews/maurten-gel-100-caf-100 — decisionScore=100, words=4074, sections=10, type=expert-research
- /reviews/gu-roctane-gel — decisionScore=100, words=4074, sections=10, type=expert-research
- /reviews/neversecond-c30-sports-drink — decisionScore=100, words=4073, sections=10, type=expert-research

### Best Guides

- /best/running-shoes — depth=high, score=100, recs=9, chooseInstead=9
- /best/daily-trainers — depth=high, score=100, recs=9, chooseInstead=9
- /best/running-shoes-long-runs — depth=high, score=100, recs=7, chooseInstead=7
- /best/max-cushion-running-shoes — depth=high, score=100, recs=8, chooseInstead=8
- /best/tempo-running-shoes — depth=high, score=100, recs=8, chooseInstead=8
- /best/race-shoes — depth=high, score=100, recs=7, chooseInstead=7
- /best/carbon-plated-running-shoes — depth=high, score=100, recs=7, chooseInstead=7
- /best/marathon-shoes — depth=high, score=100, recs=8, chooseInstead=8
- /best/stability-running-shoes — depth=high, score=100, recs=7, chooseInstead=7
- /best/trail-running-shoes — depth=high, score=100, recs=7, chooseInstead=7

### Guides

- /guides/stability-shoes-explained — score=100, depth=deep, decision=high, blocks=27
- /guides/how-to-choose-running-watch — score=95, depth=deep, decision=high, blocks=17
- /guides/road-vs-trail-running-shoes — score=94, depth=standard, decision=high, blocks=17
- /guides/carbon-vs-nylon-plates — score=93, depth=deep, decision=high, blocks=17
- /guides/what-is-a-daily-trainer — score=93, depth=standard, decision=high, blocks=18
- /guides/running-shoe-terminology — score=93, depth=standard, decision=high, blocks=19
- /guides/running-shoe-cushioning — score=92, depth=deep, decision=high, blocks=17
- /guides/running-shoe-drop — score=91, depth=deep, decision=high, blocks=17
- /guides/running-shoe-rotation — score=89, depth=deep, decision=high, blocks=17
- /guides/how-to-choose-a-padel-racket — score=89, depth=deep, decision=high, blocks=14

### Tools

- /tools/adjustable-dumbbell-finder — functional=true, landing=false, resultsIndexable=false
- /compare — functional=true, landing=false, resultsIndexable=false
- /tools/fitness-watch-finder — functional=true, landing=false, resultsIndexable=false
- /tools/home-gym-builder — functional=true, landing=true, resultsIndexable=false
- /tools/hyrox-race-kit-builder — functional=true, landing=true, resultsIndexable=false
- /tools/hyrox-race-time-calculator — functional=true, landing=true, resultsIndexable=false
- /tools/hyrox-shoe-finder — functional=true, landing=false, resultsIndexable=false
- /tools/one-rep-max-calculator — functional=true, landing=false, resultsIndexable=false
- /tools/padel-racket-finder — functional=true, landing=true, resultsIndexable=false
- /tools/plate-calculator — functional=true, landing=false, resultsIndexable=false

---

## 15. Weakest content

### Reviews

- /reviews/asics-novablast-5-deep-dive — BLOCKED: not_production_exposed; status=scheduled
- /reviews/bear-komplex-valor — BLOCKED: not_production_exposed; status=review
- /reviews/domyos-mid-500 — BLOCKED: not_production_exposed; status=review
- /reviews/nobull-trail — BLOCKED: not_production_exposed; status=review
- /reviews/zeraus-classic — BLOCKED: not_production_exposed; status=review
- /reviews/saucony-peregrine-15 — LAUNCH_READY: decisionScore=100; words=3946
- /reviews/polar-h10 — LAUNCH_READY: decisionScore=100; words=3993
- /reviews/garmin-hrm-600 — LAUNCH_READY: decisionScore=100; words=3890
- /reviews/polar-verity-sense — LAUNCH_READY: decisionScore=100; words=3998
- /reviews/scosche-rhythm-plus-2 — LAUNCH_READY: decisionScore=100; words=4035

### Best Guides

- /best/padel-rackets — NEEDS_MINOR_WORK: low_contextual_reasoning; missing_choose_instead; missing_who_should_avoid_on_picks; no_evidence_ids
- /best/tennis-rackets — THIN: title_intro_cards_faq_pattern
- /best/adjustable-dumbbells — THIN: title_intro_cards_faq_pattern
- /best/power-racks — THIN: title_intro_cards_faq_pattern
- /best/training-shoes — THIN: contextualDepth=low; introWords=24
- /best/hyrox-shoes — NEEDS_MINOR_WORK: low_contextual_reasoning; missing_choose_instead; missing_who_should_avoid_on_picks; no_evidence_ids
- /best/rowing-machines — THIN: title_intro_cards_faq_pattern
- /best/pull-up-bars — THIN: title_intro_cards_faq_pattern
- /best/home-gym-equipment — THIN: title_intro_cards_faq_pattern
- /best/adjustable-benches — THIN: title_intro_cards_faq_pattern

### Guides

- /guides/bumper-plates-vs-iron-plates — COMPLETE: score=61
- /guides/winter-layering-for-runners — COMPLETE: score=63
- /guides/first-marathon-gear-checklist — COMPLETE: score=63
- /guides/trail-race-kit-essentials — COMPLETE: score=63
- /guides/handheld-bottles-for-running — COMPLETE: score=64
- /guides/hydration-for-marathon-training — COMPLETE: score=64
- /guides/running-jackets-explained — COMPLETE: score=64
- /guides/hot-weather-running-apparel — COMPLETE: score=64
- /guides/when-to-use-a-massage-gun — COMPLETE: score=64
- /guides/recovery-sandals-for-runners — COMPLETE: score=64

### Tools

- /tools/running-shoe-finder — available=true, functional=true, exposed=true
- /tools/fitness-watch-finder — available=true, functional=true, exposed=true
- /tools/running-pace-calculator — available=true, functional=true, exposed=true
- /tools/race-time-predictor — available=true, functional=true, exposed=true
- /tools/running-hrm-finder — available=true, functional=true, exposed=true
- /tools/running-clothing-finder — available=true, functional=true, exposed=true
- /tools/running-fuel-finder — available=true, functional=true, exposed=true
- /tools/running-accessories-finder — available=true, functional=true, exposed=true
- /compare — available=true, functional=true, exposed=true
- /tools/hyrox-shoe-finder — available=true, functional=true, exposed=true

---

## 16. Publication data

### reviews

| Field | Count |
|---|---:|
| published | 585 |
| scheduled | 1 |
| review | 4 |
| future | 1 |
| blocked | 0 |
| productionExposed | 585 |
| total | 590 |

### bestGuides

| Field | Count |
|---|---:|
| published | 58 |
| future | 0 |
| blocked | 0 |
| productionExposed | 58 |
| total | 58 |

### buyingGuides

| Field | Count |
|---|---:|
| published | 68 |
| future | 0 |
| blocked | 0 |
| productionExposed | 68 |
| total | 68 |

### comparisons

| Field | Count |
|---|---:|
| published | 102 |
| future | 0 |
| blocked | 0 |
| productionExposed | 102 |
| total | 102 |

### gearSetups

| Field | Count |
|---|---:|
| published | 16 |
| future | 0 |
| blocked | 0 |
| productionExposed | 16 |
| total | 16 |

### tools

| Field | Count |
|---|---:|
| published | 25 |
| archived | 3 |
| future | 0 |
| blocked | 3 |
| productionExposed | 25 |
| total | 28 |

---

## 17. Day-1 evidence (no scheduling decision)

This audit does **not** choose the Day-1 editorial set. Evidence:

| Evidence | Count |
|---|---:|
| Reviews LAUNCH_READY + exposed | 585 |
| Reviews BLOCKED for false first-hand | 0 |
| Best Guides LAUNCH_READY + exposed | 44 |
| Best Guides THIN | 11 |
| Guides COMPLETE + exposed | 68 |
| Guides THIN | 0 |
| Comparisons meaningful + exposed | 102 |
| Tools functional + exposed | 25 |

Questions for the external reviewer:

1. Which routes form the Day-1 editorial set?
2. What should be scheduled later?
3. What should remain noindex / draft until quality gates pass?

Candidate LAUNCH_READY / COMPLETE route lists are in JSON `day1Evidence.*Routes`.

---

## Gear setups inventory

| Route | Status | Exposed | Items |
|---|---|---|---:|
| /setups/first-marathon-kit | published | yes | 5 |
| /setups/marathon-race-day-kit | published | yes | 7 |
| /setups/beginner-running-setup | published | yes | 4 |
| /setups/half-marathon-kit | published | yes | 3 |
| /setups/trail-running-starter-kit | published | yes | 5 |
| /setups/padel-starter-kit | published | yes | 4 |
| /setups/tennis-starter-kit | published | yes | 3 |
| /setups/beginner-home-gym | published | yes | 4 |
| /setups/garage-strength-gym | published | yes | 5 |
| /setups/apartment-fitness-setup | published | yes | 4 |
| /setups/hyrox-home-conditioning | published | yes | 5 |
| /setups/calisthenics-home-setup | published | yes | 4 |
| /setups/hyrox-race-day-kit | published | yes | 3 |
| /setups/first-hyrox-setup | published | yes | 3 |
| /setups/budget-home-gym | published | yes | 4 |
| /setups/hyrox-home-training | published | yes | 4 |

## End of baseline

Measurement only. No editorial decisions applied.
