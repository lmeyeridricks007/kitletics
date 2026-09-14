# Padel Editorial Completion Audit

**Date:** 2026-09-13  
**Status:** EDITORIAL DECISION GRAPH EXPANDED — **not** Padel GO  
**Scope:** Rebuild recommendations against the expanded catalog. Previous winners were not preserved merely because content existed.

## Before → after

| Surface | Before | After | Δ |
| --- | ---: | ---: | ---: |
| Reviews (estate / selective) | 22 | 26 | 4 |
| Best Guides | 19 | 39 | 20 |
| Buying Guides | 21 | 26 | 5 |
| Comparisons | 17 | 21 | 4 |
| Alternatives (edges) | 143 | 169 | 26 |
| Gear Setups | 1 | 7 | 6 |

## Catalog context

| Category | Products in catalog (approx) | Best Guides |
| --- | ---: | ---: |
| Rackets | 62 | 12 |
| Shoes | 41 | 7 |
| Balls | 62 | 5 |
| Bags | 124 | 7 |
| Grips | 85 | 6 |
| Accessories | 84 | 2 |
| **Total padel catalog rows audited** | **458** | **39** |

## Reviews

- Estate reviews remain **selective** (high-decision only).
- Methodology: `expert-research` / EXPERT_RESEARCH disclosure — **no fake first-hand testing**.
- Added soft-decision reviews for high-intent products (e.g. HEAD Pro S+, AT10 Team bag, Pascal Box, Bullpadel HaC) where Best Guide / comparison demand is high.
- Do **not** interpret missing reviews on long-tail SKUs as a defect — catalog inclusion ≠ review obligation.

## Best Guides

Expanded intent cluster rebuilt against full soft-goods markets:

- **Rackets:** category + level + style + handling + value (+ women only where last/genderFit is a real fork)
- **Shoes:** category + stability + comfort + lightweight + value (+ men/women where genderFit last differs)
- **Balls:** Best Balls + competition / training / fast / value (full ~62 market funnel)
- **Bags:** Best Bags + backpacks / large / compact / shoe compartment / tournament / commuting (~125 market)
- **Grips:** Best Overgrips + sweaty / tacky / dry-feel / value multipacks + **ergonomic systems** (Hesacore kept out of overgrip awards)
- **Accessories:** ball pressurizers + racket protectors (**no** Best Wristbands)

Every Best Guide records considered → shortlisted → recommended via `consideredProducts` + `recommendations`. No arbitrary top-four architecture.

## Buying Guides

Authority cluster now includes previously missing topics:

- Fast vs Standard Padel Balls
- Padel Bag vs Backpack
- Ball Pressurizers
- Racket Protection
- Racket Customization

Plus existing racket/shoe/ball/bag/grip/beginner checklist guides.

## Comparisons

High-value pairs only (same category / similar intent / family forks). Soft comps include HEAD Pro S+ vs Pro+, Wilson Premier forks, Wilson vs HaC, AT10 Team vs RH Pro, Pascal vs X3, backpack vs paletero, RH Pro vs XXL, Kuikma Speed vs Pro S, frame protector pair.

No fake universal winners — choose-A / choose-B required.

## Alternatives

Racket catalog alternatives plus **26+ soft-goods edges** (faster/control/value/training balls; commute/tournament/cheaper bags; tack/absorption/bulk/ergonomic grips; pressurizer ↔ buy-more-cans; protector siblings).

## Gear Setups

Full-kit configurations (not affiliate stuffing):

1. Essentials / starter
2. Beginner
3. Regular club player
4. Competitive player
5. Tournament day
6. Commuter
7. Budget starter

Each uses racket + shoes + balls + grips + bag where the job needs them; accessories only when the kit job justifies them.

## Relationship coverage

| Band | Definition | Products |
| --- | --- | ---: |
| zero | No editorial edges | 294 |
| thin | 1 relationship kind | 71 |
| moderate | 2–3 kinds | 59 |
| strong | ≥4 kinds | 34 |

### Products with zero editorial relationships

Long-tail catalog rows without review / best / guide / comparison / alternative / setup / accessory edges. Expected for market-wave inventory that is catalogued but not yet decision-critical.

Sample (first 40):

- `prod-asics-game-ff-padel`
- `prod-asics-solution-swift-ff2-padel`
- `prod-bullpadel-hybrid-fly`
- `prod-nox-ml10-hexa`
- `prod-babolat-movea-2`
- `prod-joma-spin-men`
- `prod-wilson-rush-pro-5-padel`
- `prod-siux-diablo-pro`
- `prod-starvie-absolute-padel`
- `prod-kuikma-ps-560-women`
- `prod-oxdog-hyper-court`
- `prod-asics-solution-swift-padel-w`
- `prod-adidas-solecourt-boost-padel`
- `prod-head-revolt-court`
- `prod-wilson-bela-pro-padel`
- `prod-joma-spin-lady`
- `prod-bullpadel-hack-hybrid`
- `prod-nox-at10-pro-shoe`
- `prod-babolat-jet-premura-2-men`
- `prod-tecnifibre-t-fight-padel`
- `prod-varlion-bourne-padel-shoe`
- `prod-lok-padel-one`
- `prod-4on-totalgrip`
- `prod-adidas-adidas-protector`
- `prod-adidas-adidas-wristband`
- `prod-alacran-alacran-basket`
- `prod-alacran-wide-ancha`
- `prod-babolat-babolat-protector`
- `prod-babolat-babolat-wristband`
- `prod-ball-rescuer-ball-rescuer`
- `prod-ball-rescuer-premium`
- `prod-black-crown-vibranium-transparent`
- `prod-black-crown-black-crown-wristband`
- `prod-bounce-bounce-padel-x4`
- `prod-bullpadel-bpmu252-bpmu253`
- `prod-bullpadel-pascal-box-switch-3b`
- `prod-bullpadel-custom-weight-grip`
- `prod-bullpadel-bullpadel-headband`
- `prod-bullpadel-metalshield`
- `prod-bullpadel-custom-weight-protector`


… +254 more in `PADEL-EDITORIAL-COVERAGE.csv` (coverageBand=zero).


### Products with strong relationship coverage

Sample (first 40):

- `prod-nox-at10-18k-2026` — Nox AT10 Genius 18K Alum 2026 (alternative, best-guide, comparison, review)
- `prod-babolat-technical-viper` — Babolat Technical Viper 3.0 (alternative, best-guide, buying-guide, comparison, review)
- `prod-head-coello-pro` — HEAD Coello Pro 2026 (alternative, best-guide, comparison, review)
- `prod-adidas-courtstabil` — Adidas Courtquick Padel (alternative, best-guide, buying-guide, gear-setup, review)
- `prod-head-padel-pro-s` — HEAD Padel Pro S+ (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup, review)
- `prod-wilson-overgrip` — Wilson Pro Padel Overgrip 3-Pack (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup, review)
- `prod-nox-ml10-pro-cup` — Nox ML10 Pro Cup (alternative, best-guide, buying-guide, comparison, review)
- `prod-bullpadel-vertex-05` — Bullpadel Vertex 05 2026 (alternative, best-guide, buying-guide, comparison, gear-setup, review)
- `prod-bullpadel-hack-04` — Bullpadel Hack 04 2026 (alternative, best-guide, buying-guide, comparison, review)
- `prod-nox-at10-12k-2026` — Nox AT10 Genius 12K Alum XTREM 2026 (alternative, best-guide, buying-guide, comparison, gear-setup, review)
- `prod-asics-gel-resolution-padel` — ASICS Gel-Resolution Padel (alternative, best-guide, buying-guide, gear-setup, review)
- `prod-babolat-jet-premura` — Babolat Jet Premura (alternative, best-guide, buying-guide, review)
- `prod-joma-t-slam` — Joma T.Slam (alternative, best-guide, buying-guide, review)
- `prod-kuikma-ps-990` — Kuikma PS 990 (alternative, best-guide, gear-setup, review)
- `prod-bullpadel-vertex-05-hybrid` — Bullpadel Vertex 05 Hybrid 2026 (alternative, best-guide, buying-guide, comparison, review)
- `prod-bullpadel-indiga-ctr` — Bullpadel Indiga CTR 26 (alternative, best-guide, buying-guide, comparison, gear-setup, review)
- `prod-adidas-metalbone-3-5-2026` — Adidas Metalbone 3.5 2026 (alternative, best-guide, buying-guide, comparison, review)
- `prod-kuikma-pr-comfort-soft` — Kuikma PR Comfort Soft (alternative, best-guide, buying-guide, gear-setup, review)
- `prod-head-padel-pro-plus` — HEAD Padel Pro+ (alternative, best-guide, buying-guide, comparison, compatible-accessory)
- `prod-kuikma-pb-speed` — Kuikma Padel Speed (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-kuikma-pb-control` — Kuikma PB Control (alternative, best-guide, buying-guide, compatible-accessory)
- `prod-wilson-padel-premier-speed` — Wilson Premier Padel Speed (alternative, best-guide, buying-guide, comparison, compatible-accessory)
- `prod-nox-at10-team-bag` — Nox AT10 Team Paletero (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup, review)
- `prod-babolat-rh-pro-padel` — Babolat RH Pro Padel (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-tecnifibre-tour-endurance-backpack` — Tecnifibre Tour Endurance Padel Backpack (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-nox-at10-xxl-bag` — Nox AT10 XXL Padel Bag (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-bullpadel-gb1200` — Bullpadel HaC Overgrip 3-Pack (alternative, best-guide, buying-guide, comparison, compatible-accessory, review)
- `prod-kuikma-overgrip` — Kuikma Padel Overgrip Pro (alternative, best-guide, compatible-accessory, gear-setup)
- `prod-hesacore-padel` — Hesacore Padel Grip (alternative, best-guide, buying-guide, compatible-accessory, review)
- `prod-bullpadel-frame-protector` — Bullpadel Frame Protector 3-Pack (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-nox-frame-protector` — Nox Transparent Frame Protector (alternative, best-guide, buying-guide, comparison, compatible-accessory)
- `prod-bullpadel-pascal-box` — Bullpadel Pascal Box 3B (alternative, best-guide, buying-guide, comparison, compatible-accessory, review)
- `prod-head-x3-pressurizer` — HEAD X3 Ball Pressurizer (alternative, best-guide, buying-guide, comparison, compatible-accessory, gear-setup)
- `prod-bullpadel-custom-weight` — Bullpadel Protector Custom Weight (alternative, best-guide, buying-guide, compatible-accessory)



## Artifacts

- `docs/padel/data/PADEL-EDITORIAL-COVERAGE.csv` — per-product relationship counts + coverage band
- `docs/padel/data/PADEL-RECOMMENDATION-GRAPH.csv` — Product → Review / Best / Guide / Comparison / Alternative / Setup / accessory edges

## Explicit non-claims

- **Not** Padel GO / INDEXABLE vertical enablement
- Catalog inclusion ≠ media ≠ commerce ≠ editorial ≠ indexation
- No affiliate-biased rankings; commission does not decide awards
- No fake first-hand testing in EXPERT_RESEARCH reviews

## Next (outside this pass)

- Generate missing review section images for any newly published soft reviews that have heroes
- Continue selective reviews only where Best Guide / comparison demand is high
- Media / commerce gates remain separate from this editorial graph rebuild
