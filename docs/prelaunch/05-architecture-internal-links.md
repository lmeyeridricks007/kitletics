# Kitletics Pre-Launch Audit 05 — Site Architecture, Internal Links & Topical Coverage

**Mode:** READ-ONLY forensic (no architecture/link auto-fixes)
**Generated:** 2026-09-06T21:34:11.299Z
**Runtime base:** `http://127.0.0.1:3010`
**Canonical host (config):** `https://kitletics.com`
**Machine-readable:** [`data/05-link-graph.json`](./data/05-link-graph.json)

> Link graph built from live production HTML (sitemap URL universe + hubs). Catalog used for topical coverage and product-relationship edges.

---

## 1. Link graph

| Metric | Count |
|---|---:|
| Pages fetched | 665 |
| Graph nodes (incl. discovered) | 3370 |
| Directed edge instances (with anchors) | 58079 |
| Unique directed edges | 29543 |
| Sitemap URLs | 664 |
| Indexable (sitemap ∩ 200 + not noindex) | 659 |
| Sitewide chrome targets (≥50% of pages link) | 29 |

### Nodes by page type (all discovered)

| Page type | Nodes |
|---|---:|
| Hub | 1093 |
| Review | 585 |
| Product | 506 |
| Filters | 263 |
| Alternatives | 251 |
| Category | 138 |
| Brand | 126 |
| Search | 97 |
| Comparison | 72 |
| Finder | 64 |
| Best | 51 |
| Guide | 48 |
| Subcategory | 19 |
| Setup | 16 |
| Sport | 14 |
| Calculator | 8 |
| Legal | 7 |
| Gear | 7 |
| Tool | 3 |
| Home | 1 |
| Author | 1 |

### Indexable by page type

| Page type | URLs |
|---|---:|
| Product | 251 |
| Brand | 102 |
| Alternatives | 74 |
| Comparison | 51 |
| Best | 44 |
| Review | 43 |
| Guide | 34 |
| Category | 17 |
| Finder | 8 |
| Hub | 7 |
| Legal | 7 |
| Sport | 5 |
| Subcategory | 5 |
| Setup | 5 |
| Calculator | 2 |
| Home | 1 |
| Gear | 1 |
| Author | 1 |
| Tool | 1 |

---

## 2. Running cluster

| Signal | Value |
|---|---:|
| Running categories | 16 |
| Running products | 370 |
| Running reviews | 370 |
| Best guides (running-tagged) | 48 |
| Educational guides | 47 |
| Comparisons | 70 |
| Tools | 19 |
| Indexable nodes in cluster | 532 |
| Undirected connected components | 1 |
| Largest component | 532 |
| Cluster orphans | 0 |
| Cluster inbound=1 | 73 |
| Coherent (basic edge patterns) | true |

### Conceptual relationship edge counts (Running contextual)

| Expected relation | Contextual edge count |
|---|---:|
| sportToCategory | 44 |
| categoryToProduct | 729 |
| productToReview | 1004 |
| reviewToProduct | 3972 |
| productToComparison | 272 |
| comparisonToProduct | 525 |
| productToAlternatives | 249 |
| alternativesToProduct | 1329 |
| guideToProduct | 309 |
| guideToBest | 165 |
| guideToFinder | 48 |
| bestToProduct | 2003 |
| bestToReview | 555 |
| bestToComparison | 251 |

---

## 3. Orphans (indexable, 0 inbound)

**Definition:** sitemap/indexable URL with zero inbound internal links from any crawled page.

| Metric | Count |
|---|---:|
| Orphan indexable URLs | 0 |

### By page type

| Page type | Count |
|---|---:|

<details><summary>Orphan URL list (0)</summary>


</details>

---

## 4. Weakly connected

| Bucket | Count |
|---|---:|
| 0 inbound | 0 |
| 1 inbound | 131 |
| Low contextual inbound (≤1 main-content inbound, total inbound > 0) | 135 |

### Sample inbound=1

- `/running/track`
- `/running/ultra`
- `/running/shoes/trail`
- `/running/shoes/heavy-runners`
- `/products/brooks-glycerin-21`
- `/products/new-balance-fresh-foam-x-1080-v13`
- `/products/kiprun-running-belt`
- `/products/asics-novablast-5/alternatives`
- `/products/asics-gel-nimbus-27/alternatives`
- `/products/brooks-ghost-16/alternatives`
- `/products/saucony-endorphin-speed-4/alternatives`
- `/products/adidas-adizero-boston-12/alternatives`
- `/products/garmin-forerunner-965/alternatives`
- `/products/coros-pace-3/alternatives`
- `/products/asics-gel-kayano-32/alternatives`
- `/products/asics-gel-cumulus-27/alternatives`
- `/products/asics-metaspeed-sky-paris/alternatives`
- `/products/asics-gt-2000-14/alternatives`
- `/products/nike-alphafly-3/alternatives`
- `/products/brooks-adrenaline-gts-25/alternatives`
- `/products/hoka-clifton-10/alternatives`
- `/products/hoka-bondi-9/alternatives`
- `/products/saucony-endorphin-pro-4/alternatives`
- `/products/saucony-ride-18/alternatives`
- `/products/saucony-peregrine-15/alternatives`
- `/products/new-balance-fresh-foam-x-1080-v14/alternatives`
- `/products/garmin-hrm-600/alternatives`
- `/products/polar-h10/alternatives`
- `/products/polar-verity-sense/alternatives`
- `/products/coros-heart-rate-monitor/alternatives`
- `/products/garmin-fenix-8/alternatives`
- `/products/garmin-enduro-3/alternatives`
- `/products/garmin-instinct-3/alternatives`
- `/products/garmin-vivoactive-6/alternatives`
- `/products/garmin-forerunner-265s/alternatives`
- `/products/garmin-epix-pro-gen-2/alternatives`
- `/products/coros-apex-4/alternatives`
- `/products/coros-pace-4/alternatives`
- `/products/coros-vertix-2s/alternatives`
- `/products/suunto-vertical-2/alternatives`
- … +91 more (see JSON)

### Sample low contextual inbound

- `/running/track` — inbound=1, contextual=1
- `/running/ultra` — inbound=1, contextual=1
- `/running/shoes/race` — inbound=2, contextual=1
- `/running/shoes/stability` — inbound=2, contextual=1
- `/running/shoes/trail` — inbound=1, contextual=1
- `/running/shoes/heavy-runners` — inbound=1, contextual=1
- `/products/brooks-glycerin-21` — inbound=1, contextual=1
- `/products/new-balance-fresh-foam-x-1080-v13` — inbound=1, contextual=1
- `/products/kiprun-running-belt` — inbound=1, contextual=1
- `/products/asics-novablast-5/alternatives` — inbound=1, contextual=1
- `/products/asics-gel-nimbus-27/alternatives` — inbound=1, contextual=1
- `/products/brooks-ghost-16/alternatives` — inbound=1, contextual=1
- `/products/saucony-endorphin-speed-4/alternatives` — inbound=1, contextual=1
- `/products/adidas-adizero-boston-12/alternatives` — inbound=1, contextual=1
- `/products/garmin-forerunner-965/alternatives` — inbound=1, contextual=1
- `/products/coros-pace-3/alternatives` — inbound=1, contextual=1
- `/products/asics-gel-kayano-32/alternatives` — inbound=1, contextual=1
- `/products/asics-gel-cumulus-27/alternatives` — inbound=1, contextual=1
- `/products/asics-metaspeed-sky-paris/alternatives` — inbound=1, contextual=1
- `/products/asics-gt-2000-14/alternatives` — inbound=1, contextual=1
- `/products/nike-alphafly-3/alternatives` — inbound=1, contextual=1
- `/products/brooks-adrenaline-gts-25/alternatives` — inbound=1, contextual=1
- `/products/hoka-clifton-10/alternatives` — inbound=1, contextual=1
- `/products/hoka-bondi-9/alternatives` — inbound=1, contextual=1
- `/products/saucony-endorphin-pro-4/alternatives` — inbound=1, contextual=1
- `/products/saucony-ride-18/alternatives` — inbound=1, contextual=1
- `/products/saucony-peregrine-15/alternatives` — inbound=1, contextual=1
- `/products/new-balance-fresh-foam-x-1080-v14/alternatives` — inbound=1, contextual=1
- `/products/garmin-hrm-600/alternatives` — inbound=1, contextual=1
- `/products/polar-h10/alternatives` — inbound=1, contextual=1

---

## 5. Hub strength

| Hub | Status | Outbound unique | Outbound indexable | Running outbound | Inbound |
|---|---:|---:|---:|---:|---:|
| Homepage (`/`) | 200 | 73 | 47 | 32 | 659 |
| Running Hub (`/running`) | 200 | 120 | 95 | 88 | 659 |
| Running Gear Hub (`/gear`) | 200 | 59 | 39 | 21 | 659 |
| Reviews Hub (`/reviews`) | 200 | 616 | 67 | 377 | 636 |
| Best Hub (`/best`) | 200 | 72 | 68 | 51 | 636 |
| Guides Hub (`/guides`) | 200 | 57 | 44 | 30 | 659 |
| Compare Hub (`/compare`) | 200 | 40 | 36 | 19 | 659 |
| Brands Hub (`/brands`) | 200 | 141 | 126 | 7 | 659 |
| Tools Hub (`/tools`) | 200 | 47 | 28 | 14 | 659 |
| Running Shoes (`/running/shoes`) | 200 | 91 | 59 | 60 | 659 |
| GPS Watches (`/running/watches`) | 200 | 97 | 68 | 71 | 85 |
| Heart Rate Monitors (`/running/heart-rate-monitors`) | 200 | 68 | 46 | 44 | 47 |
| Running Clothing (`/running/clothing`) | 0 | 0 | 0 | 0 | 14 |
| Running Socks (`/running/socks`) | 200 | 55 | 30 | 28 | 15 |
| Hydration (`/running/hydration`) | 200 | 67 | 45 | 42 | 37 |
| Running Packs & Vests (`/running/packs`) | 200 | 97 | 65 | 68 | 72 |
| Headphones (`/running/headphones`) | 200 | 56 | 33 | 32 | 15 |
| Sunglasses (`/running/sunglasses`) | 0 | 0 | 0 | 0 | 1 |
| Running Lights (`/running/lights`) | 200 | 54 | 31 | 30 | 15 |
| Treadmills (`/running/treadmills`) | — | 0 | 0 | 0 | 0 |
| Safety Gear (`/running/safety`) | 200 | 47 | 25 | 26 | 9 |
| Running Belts (`/running/belts`) | 200 | 66 | 40 | 37 | 20 |
| Recovery (`/running/recovery`) | 200 | 72 | 44 | 47 | 24 |
| Accessories (`/running/accessories`) | 0 | 0 | 0 | 0 | 4 |
| Nutrition & Fuel (`/running/nutrition`) | 0 | 0 | 0 | 0 | 1 |

### Outbound mix (selected hubs)

**Homepage** — {"Legal":7,"Hub":7,"Sport":9,"Gear":1,"Finder":3,"Category":2,"Best":6,"Product":30,"Guide":3,"Comparison":3,"Calculator":2}
**Running Hub** — {"Legal":6,"Hub":12,"Home":1,"Gear":1,"Finder":8,"Best":8,"Category":20,"Sport":6,"Product":39,"Guide":3,"Comparison":4,"Setup":1,"Brand":8,"Calculator":2,"Tool":1}
**Running Gear Hub** — {"Legal":7,"Hub":6,"Home":1,"Sport":12,"Finder":4,"Calculator":2,"Category":7,"Gear":6,"Product":4,"Best":2,"Brand":8}
**Reviews Hub** — {"Legal":7,"Hub":8,"Home":1,"Sport":9,"Gear":1,"Review":585,"Finder":2,"Calculator":2,"Category":1}
**Best Hub** — {"Legal":7,"Hub":5,"Home":1,"Sport":9,"Gear":1,"Best":44,"Finder":2,"Calculator":2,"Category":1}
**Guides Hub** — {"Legal":7,"Hub":11,"Home":1,"Sport":9,"Gear":1,"Guide":23,"Finder":2,"Calculator":2,"Category":1}

---

## 6. Crawl depth (from Homepage)

### Overall (indexable)

| Depth | URLs |
|---|---:|
| 0 | 1 |
| 1 | 47 |
| 2 | 361 |
| 3 | 222 |
| 4 | 27 |
| 5+ | 1 |

### By page type

| Page type | 0 | 1 | 2 | 3 | 4 | 5+ | unreachable |
|---|---:|---:|---:|---:|---:|---:|---:|
| Alternatives | 0 | 0 | 10 | 40 | 24 | 0 | 0 |
| Author | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| Best | 0 | 3 | 41 | 0 | 0 | 0 | 0 |
| Brand | 0 | 0 | 102 | 0 | 0 | 0 | 0 |
| Calculator | 0 | 2 | 0 | 0 | 0 | 0 | 0 |
| Category | 0 | 2 | 15 | 0 | 0 | 0 | 0 |
| Comparison | 0 | 3 | 24 | 24 | 0 | 0 | 0 |
| Finder | 0 | 2 | 6 | 0 | 0 | 0 | 0 |
| Gear | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| Guide | 0 | 1 | 24 | 9 | 0 | 0 | 0 |
| Home | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Hub | 0 | 6 | 0 | 1 | 0 | 0 | 0 |
| Legal | 0 | 7 | 0 | 0 | 0 | 0 | 0 |
| Product | 0 | 15 | 88 | 147 | 0 | 1 | 0 |
| Review | 0 | 0 | 43 | 0 | 0 | 0 | 0 |
| Setup | 0 | 0 | 1 | 1 | 3 | 0 | 0 |
| Sport | 0 | 5 | 0 | 0 | 0 | 0 | 0 |
| Subcategory | 0 | 0 | 5 | 0 | 0 | 0 | 0 |
| Tool | 0 | 0 | 1 | 0 | 0 | 0 | 0 |

---

## 7. Anchor text

| Class | Count | Share |
|---|---:|---:|
| generic | 2051 | 3.5% |
| exactish | 48515 | 83.5% |
| descriptive | 6316 | 10.9% |
| empty | 1197 | 2.1% |

### Generic examples

- "Compare" → /compare (from /)
- "More" → /gear (from /)
- "Compare" → /compare (from /)
- "Compare" → /compare (from /gear)
- "Home" → / (from /gear)
- "Compare" → /compare (from /gear)
- "Compare" → /compare (from /brands)
- "Home" → / (from /brands)
- "Compare" → /compare (from /brands)
- "Compare" → /compare (from /best)
- "Home" → / (from /best)
- "Compare" → /compare (from /best)

### Repetitive exact-ish anchors (≥8 uses)

- “running” × 2364
- “kitletics” × 1954
- “brands” × 1420
- “tools” × 1357
- “affiliate disclosure” × 991
- “garmin” × 942
- “compare →” × 795
- “reviews” × 719
- “best” × 715
- “how we review” × 691
- “all gear” × 683
- “methodology” × 679
- “racket sports” × 662
- “fitness” × 661
- “shoes” × 660
- “outdoors” × 660
- “team sports” × 660
- “about” × 659
- “journal” × 659
- “help” × 659

_No keyword-stuffing recommendations — counts only._

---

## 8. Topical coverage map (Running)

| Category | Path | Products | Reviews | Best | Guides | Comparisons | Finders | Listing status |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Running Shoes | `/running/shoes` | 83 | 83 | 13 | 12 | 12 | 8 | 200 |
| GPS Watches | `/running/watches` | 33 | 33 | 8 | 6 | 10 | 1 | 200 |
| Heart Rate Monitors | `/running/heart-rate-monitors` | 15 | 15 | 4 | 2 | 6 | 1 | 200 |
| Running Clothing | `/running/clothing` | 57 | 57 | 6 | 3 | 7 | 1 | 0 |
| Running Socks | `/running/socks` | 10 | 10 | 1 | 1 | 1 | 1 | 200 |
| Hydration | `/running/hydration` | 17 | 17 | 3 | 4 | 1 | 1 | 200 |
| Running Packs & Vests | `/running/packs` | 35 | 35 | 5 | 2 | 11 | 1 | 200 |
| Headphones | `/running/headphones` | 11 | 11 | 1 | 1 | 2 | 1 | 200 |
| Sunglasses | `/running/sunglasses` | 17 | 17 | 1 | 0 | 2 | 1 | 0 |
| Running Lights | `/running/lights` | 9 | 9 | 1 | 1 | 3 | 1 | 200 |
| Treadmills | `/running/treadmills` | 6 | 6 | 1 | 1 | 1 | 1 | — |
| Safety Gear | `/running/safety` | 6 | 6 | 1 | 0 | 1 | 1 | 200 |
| Running Belts | `/running/belts` | 14 | 14 | 3 | 1 | 2 | 1 | 200 |
| Recovery | `/running/recovery` | 16 | 16 | 1 | 5 | 5 | 1 | 200 |
| Accessories | `/running/accessories` | 3 | 3 | 0 | 0 | 0 | 1 | 0 |
| Nutrition & Fuel | `/running/nutrition` | 38 | 38 | 1 | 4 | 6 | 1 | 0 |

---

## 9. Decision journey gaps (Running categories)

| Category | LEARN | BROWSE | SHORTLIST | COMPARE | ASSESS | PERSONALIZE | BUY | Missing |
|---|---|---|---|---|---|---|---|---|
| Running Shoes | Y | Y | Y | Y | Y | Y | Y | — |
| GPS Watches | Y | Y | Y | Y | Y | Y | Y | — |
| Heart Rate Monitors | Y | Y | Y | Y | Y | Y | Y | — |
| Running Clothing | Y | N | Y | Y | Y | Y | Y | BROWSE |
| Running Socks | Y | Y | Y | Y | Y | Y | Y | — |
| Hydration | Y | Y | Y | Y | Y | Y | Y | — |
| Running Packs & Vests | Y | Y | Y | Y | Y | Y | Y | — |
| Headphones | Y | Y | Y | Y | Y | Y | Y | — |
| Sunglasses | Y | N | Y | Y | Y | Y | Y | BROWSE |
| Running Lights | Y | Y | Y | Y | Y | Y | Y | — |
| Treadmills | Y | N | Y | Y | Y | Y | Y | BROWSE |
| Safety Gear | Y | Y | Y | Y | Y | Y | Y | — |
| Running Belts | Y | Y | Y | Y | Y | Y | Y | — |
| Recovery | Y | Y | Y | Y | Y | Y | Y | — |
| Accessories | N | N | N | N | Y | Y | Y | LEARN, BROWSE, SHORTLIST, COMPARE |
| Nutrition & Fuel | Y | N | Y | Y | Y | Y | Y | BROWSE |

---

## 10. Content cannibalization

### Near-duplicate title clusters (multi-type or ≥3 URLs)

_No multi-type title clusters detected in crawled titles._

### Best ↔ Guide slug overlaps

- `/best/running-shoes` ↔ `/guides/how-to-choose-running-shoes` (overlapping slug/intent)
- `/best/running-shoes` ↔ `/guides/road-vs-trail-running-shoes` (overlapping slug/intent)
- `/best/race-shoes` ↔ `/guides/hyrox-race-shoes-vs-training-shoes` (overlapping slug/intent)
- `/best/trail-running-shoes` ↔ `/guides/road-vs-trail-running-shoes` (overlapping slug/intent)
- `/best/running-watches` ↔ `/guides/multi-band-gps-running-watches` (overlapping slug/intent)
- `/best/running-watches` ↔ `/guides/maps-navigation-running-watches` (overlapping slug/intent)
- `/best/running-headphones` ↔ `/guides/open-ear-vs-in-ear-running-headphones` (overlapping slug/intent)
- `/best/running-socks` ↔ `/guides/how-to-choose-running-socks` (overlapping slug/intent)
- `/best/running-jackets` ↔ `/guides/running-jackets-explained` (overlapping slug/intent)
- `/best/adjustable-dumbbells` ↔ `/guides/how-to-choose-adjustable-dumbbells` (overlapping slug/intent)
- `/best/training-shoes` ↔ `/guides/how-to-choose-training-shoes` (overlapping slug/intent)
- `/best/training-shoes` ↔ `/guides/hyrox-race-shoes-vs-training-shoes` (overlapping slug/intent)
- `/best/hyrox-shoes` ↔ `/guides/how-to-choose-hyrox-shoes` (overlapping slug/intent)

---

## 11. Product relationship graph

| Metric | Count |
|---|---:|
| Total relationships (non-deprecated) | 1775 |
| Alternative-typed | 1685 |
| Family / generation | 43 |
| Direct competitor | 1478 |
| Comparison-candidate typed | 15 |
| Published products | 623 |
| Products with alternatives | 416 |
| Products without alternatives | 207 |
| Products in editorial comparisons | 149 |
| `/alternatives` pages in sitemap | 74 |
| Running products with alternatives | 365 |
| Running products without alternatives | 5 |

### Sample products without alternatives

- `/products/amphipod-vizlet-led` (cat-safety)
- `/products/nathan-lightbender-rx` (cat-safety)
- `/products/nike-swoosh-medium-support` (cat-running-clothing)
- `/products/head-padel-pro-s-balls` (cat-padel-balls)
- `/products/wilson-padel-overgrip-pack` (cat-padel-grips)
- `/products/head-revolt-pro-court` (cat-padel-shoes)
- `/products/adidas-crazyquick-boost-padel` (cat-padel-shoes)
- `/products/adidas-courtquick-padel-women` (cat-padel-shoes)
- `/products/adidas-crazyquick-boost-padel-women` (cat-padel-shoes)
- `/products/asics-gel-dedicate-8-padel` (cat-padel-shoes)
- `/products/asics-game-ff-padel` (cat-padel-shoes)
- `/products/asics-solution-swift-ff2-padel` (cat-padel-shoes)
- `/products/bullpadel-hybrid-fly` (cat-padel-shoes)
- `/products/bullpadel-ionic-woman` (cat-padel-shoes)
- `/products/nox-at10-lux` (cat-padel-shoes)
- `/products/nox-ml10-hexa` (cat-padel-shoes)
- `/products/babolat-movea-2` (cat-padel-shoes)
- `/products/babolat-sensa-women` (cat-padel-shoes)
- `/products/joma-slam-lady` (cat-padel-shoes)
- `/products/joma-spin-men` (cat-padel-shoes)
- `/products/head-sprint-pro-4-padel` (cat-padel-shoes)
- `/products/wilson-rush-pro-5-padel` (cat-padel-shoes)
- `/products/kuikma-ps-990` (cat-padel-shoes)
- `/products/oxdog-hyper-court` (cat-padel-shoes)
- `/products/asics-gel-resolution-padel-women` (cat-padel-shoes)

---

## 12. Link concentration

### Highest inbound (raw)

| Path | Type | Inbound | Contextual | Outbound |
|---|---|---:|---:|---:|
| `/` | Home | 659 | 659 | 73 |
| `/gear` | Gear | 659 | 11 | 59 |
| `/brands` | Hub | 659 | 115 | 141 |
| `/compare` | Hub | 659 | 13 | 40 |
| `/guides` | Hub | 659 | 62 | 57 |
| `/tools` | Hub | 659 | 34 | 47 |
| `/about` | Legal | 659 | 4 | 29 |
| `/contact` | Legal | 659 | 5 | 28 |
| `/running` | Sport | 659 | 406 | 120 |
| `/running/shoes` | Category | 659 | 143 | 91 |
| `/tools/running-shoe-finder` | Finder | 641 | 120 | 29 |
| `/tools/running-pace-calculator` | Calculator | 641 | 89 | 33 |
| `/methodology` | Legal | 640 | 458 | 28 |
| `/affiliate-disclosure` | Legal | 640 | 350 | 28 |
| `/privacy` | Legal | 640 | 4 | 28 |
| `/terms` | Legal | 640 | 4 | 28 |
| `/tools/fitness-watch-finder` | Finder | 639 | 57 | 29 |
| `/tools/race-time-predictor` | Calculator | 639 | 5 | 32 |
| `/best` | Hub | 636 | 39 | 72 |
| `/reviews` | Hub | 636 | 43 | 616 |
| `/how-we-review` | Legal | 636 | 302 | 29 |
| `/editorial-policy` | Sport | 636 | 8 | 29 |
| `/evidence-policy` | Sport | 636 | 8 | 28 |
| `/scoring-methodology` | Sport | 636 | 8 | 28 |
| `/authors` | Sport | 636 | 8 | 29 |

### Lowest inbound (raw, indexable)

| Path | Type | Inbound | Contextual | Outbound |
|---|---|---:|---:|---:|
| `/running/track` | Category | 1 | 1 | 48 |
| `/running/ultra` | Category | 1 | 1 | 132 |
| `/running/shoes/trail` | Subcategory | 1 | 1 | 42 |
| `/running/shoes/heavy-runners` | Subcategory | 1 | 1 | 43 |
| `/products/brooks-glycerin-21` | Product | 1 | 1 | 35 |
| `/products/new-balance-fresh-foam-x-1080-v13` | Product | 1 | 1 | 35 |
| `/products/kiprun-running-belt` | Product | 1 | 1 | 39 |
| `/products/asics-novablast-5/alternatives` | Alternatives | 1 | 1 | 48 |
| `/products/asics-gel-nimbus-27/alternatives` | Alternatives | 1 | 1 | 47 |
| `/products/brooks-ghost-16/alternatives` | Alternatives | 1 | 1 | 41 |
| `/products/saucony-endorphin-speed-4/alternatives` | Alternatives | 1 | 1 | 40 |
| `/products/adidas-adizero-boston-12/alternatives` | Alternatives | 1 | 1 | 39 |
| `/products/garmin-forerunner-965/alternatives` | Alternatives | 1 | 1 | 42 |
| `/products/coros-pace-3/alternatives` | Alternatives | 1 | 1 | 43 |
| `/products/asics-gel-kayano-32/alternatives` | Alternatives | 1 | 1 | 45 |
| `/products/asics-gel-cumulus-27/alternatives` | Alternatives | 1 | 1 | 42 |
| `/products/asics-metaspeed-sky-paris/alternatives` | Alternatives | 1 | 1 | 40 |
| `/products/asics-gt-2000-14/alternatives` | Alternatives | 1 | 1 | 42 |
| `/products/nike-alphafly-3/alternatives` | Alternatives | 1 | 1 | 41 |
| `/products/brooks-adrenaline-gts-25/alternatives` | Alternatives | 1 | 1 | 49 |
| `/products/hoka-clifton-10/alternatives` | Alternatives | 1 | 1 | 49 |
| `/products/hoka-bondi-9/alternatives` | Alternatives | 1 | 1 | 48 |
| `/products/saucony-endorphin-pro-4/alternatives` | Alternatives | 1 | 1 | 44 |
| `/products/saucony-ride-18/alternatives` | Alternatives | 1 | 1 | 46 |
| `/products/saucony-peregrine-15/alternatives` | Alternatives | 1 | 1 | 43 |

---

## 13. Launch cluster evidence (factual — no launch decision)

| Evidence | Value |
|---|---:|
| Running cluster size (indexable nodes) | 532 |
| Largest connected component | 532 |
| Connected components | 1 |
| Orphans (all indexable) | 0 |
| Orphans (running) | 0 |
| Weak pages inbound=1 (all) | 131 |
| Weak pages inbound=1 (running) | 73 |
| Running category coverage rows | 16 |

### Decision-journey completeness by category

- **Running Shoes**: missing none (all stages present by heuristic)
- **GPS Watches**: missing none (all stages present by heuristic)
- **Heart Rate Monitors**: missing none (all stages present by heuristic)
- **Running Clothing**: missing BROWSE
- **Running Socks**: missing none (all stages present by heuristic)
- **Hydration**: missing none (all stages present by heuristic)
- **Running Packs & Vests**: missing none (all stages present by heuristic)
- **Headphones**: missing none (all stages present by heuristic)
- **Sunglasses**: missing BROWSE
- **Running Lights**: missing none (all stages present by heuristic)
- **Treadmills**: missing BROWSE
- **Safety Gear**: missing none (all stages present by heuristic)
- **Running Belts**: missing none (all stages present by heuristic)
- **Recovery**: missing none (all stages present by heuristic)
- **Accessories**: missing LEARN, BROWSE, SHORTLIST, COMPARE
- **Nutrition & Fuel**: missing BROWSE

---

## Notes

- Orphans may include pages only linked from non-sitemap chrome we did not attribute, or linked solely via client-side navigation not present in HTML.
- PERSONALIZE stage treats Running finders as shared across categories when category-specific finder is absent.
- BUY stage confirms product pages exist; offer/CTA depth is covered in prior audits.
- No fixes applied.
