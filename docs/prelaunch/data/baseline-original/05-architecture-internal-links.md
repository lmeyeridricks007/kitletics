# Kitletics Pre-Launch Audit 05 — Site Architecture, Internal Links & Topical Coverage

**Mode:** READ-ONLY forensic (no architecture/link auto-fixes)
**Generated:** 2026-09-06T15:14:46.912Z
**Runtime base:** `http://127.0.0.1:3010`
**Canonical host (config):** `https://kitletics.com`
**Machine-readable:** [`data/05-link-graph.json`](./data/05-link-graph.json)

> Link graph built from live production HTML (sitemap URL universe + hubs). Catalog used for topical coverage and product-relationship edges.

---

## 1. Link graph

| Metric | Count |
|---|---:|
| Pages fetched | 1665 |
| Graph nodes (incl. discovered) | 4781 |
| Directed edge instances (with anchors) | 184945 |
| Unique directed edges | 65442 |
| Sitemap URLs | 1664 |
| Indexable (sitemap ∩ 200 + not noindex) | 1654 |
| Sitewide chrome targets (≥50% of pages link) | 27 |

### Nodes by page type (all discovered)

| Page type | Nodes |
|---|---:|
| Hub | 2103 |
| Product | 643 |
| Review | 503 |
| Alternatives | 430 |
| Filters | 269 |
| Category | 194 |
| Brand | 165 |
| Comparison | 102 |
| Search | 101 |
| Finder | 70 |
| Guide | 68 |
| Best | 60 |
| Setup | 16 |
| Sport | 14 |
| Subcategory | 14 |
| Calculator | 9 |
| Legal | 7 |
| Gear | 7 |
| Tool | 4 |
| Home | 1 |
| Author | 1 |

### Indexable by page type

| Page type | URLs |
|---|---:|
| Product | 623 |
| Review | 503 |
| Brand | 101 |
| Comparison | 94 |
| Alternatives | 85 |
| Guide | 68 |
| Best | 58 |
| Category | 52 |
| Setup | 16 |
| Finder | 16 |
| Sport | 9 |
| Hub | 7 |
| Legal | 7 |
| Calculator | 5 |
| Subcategory | 4 |
| Tool | 3 |
| Home | 1 |
| Gear | 1 |
| Author | 1 |

---

## 2. Running cluster

| Signal | Value |
|---|---:|
| Running categories | 16 |
| Running products | 370 |
| Running reviews | 288 |
| Best guides (running-tagged) | 48 |
| Educational guides | 47 |
| Comparisons | 70 |
| Tools | 19 |
| Indexable nodes in cluster | 942 |
| Undirected connected components | 1 |
| Largest component | 942 |
| Cluster orphans | 2 |
| Cluster inbound=1 | 79 |
| Coherent (basic edge patterns) | true |

### Conceptual relationship edge counts (Running contextual)

| Expected relation | Contextual edge count |
|---|---:|
| sportToCategory | 26 |
| categoryToProduct | 729 |
| productToReview | 1152 |
| reviewToProduct | 26518 |
| productToComparison | 348 |
| comparisonToProduct | 672 |
| productToAlternatives | 361 |
| alternativesToProduct | 1460 |
| guideToProduct | 381 |
| guideToBest | 185 |
| guideToFinder | 64 |
| bestToProduct | 1860 |
| bestToReview | 523 |
| bestToComparison | 257 |

---

## 3. Orphans (indexable, 0 inbound)

**Definition:** sitemap/indexable URL with zero inbound internal links from any crawled page.

| Metric | Count |
|---|---:|
| Orphan indexable URLs | 5 |

### By page type

| Page type | Count |
|---|---:|
| Category | 2 |
| Product | 2 |
| Subcategory | 1 |

<details><summary>Orphan URL list (5)</summary>

- `/running/track`
- `/fitness/cross-training`
- `/running/shoes/heavy-runners`
- `/products/nike-court-lite-4`
- `/products/adidas-gamecourt-2`

</details>

---

## 4. Weakly connected

| Bucket | Count |
|---|---:|
| 0 inbound | 5 |
| 1 inbound | 116 |
| Low contextual inbound (≤1 main-content inbound, total inbound > 0) | 120 |

### Sample inbound=1

- `/running/treadmill`
- `/running/ultra`
- `/fitness/gym`
- `/fitness/strength`
- `/fitness/home-gym`
- `/fitness/conditioning`
- `/fitness/recovery`
- `/squash`
- `/running/shoes/trail`
- `/products/roka-phantom-air`
- `/products/enervit-c2-1-carbo-gel`
- `/products/nike-swoosh-medium-support`
- `/products/oxdog-hyper-court`
- `/products/asics-gel-resolution-padel-women`
- `/products/asics-solution-swift-ff-padel-women`
- `/products/wilson-bela-pro-padel`
- `/products/joma-spin-lady`
- `/products/babolat-jet-premura-2`
- `/products/tecnifibre-wall-shooter`
- `/products/varlion-bourne-padel`
- `/products/lok-padel-one`
- `/products/tecnifibre-black-code-1-28`
- `/products/luxilon-alu-power`
- `/products/tecnifibre-x-one-biphase`
- `/products/solinco-hyper-g`
- `/products/babolat-jet-tere`
- `/products/nike-court-air-zoom-vapor-cage-4`
- `/products/babolat-propulse-fury-3`
- `/products/head-sprint-pro-3-5`
- `/products/new-balance-996-v5`
- `/products/yonex-power-cushion-eclipsion-5`
- `/products/yonex-power-cushion-sonicage-3`
- `/products/prince-t22`
- `/products/asics-novablast-5/alternatives`
- `/products/asics-gel-nimbus-27/alternatives`
- `/products/brooks-ghost-16/alternatives`
- `/products/saucony-endorphin-speed-4/alternatives`
- `/products/adidas-adizero-boston-12/alternatives`
- `/products/coros-pace-3/alternatives`
- `/products/asics-gel-kayano-32/alternatives`
- … +76 more (see JSON)

### Sample low contextual inbound

- `/running/treadmill` — inbound=1, contextual=1
- `/running/ultra` — inbound=1, contextual=1
- `/fitness/gym` — inbound=1, contextual=1
- `/fitness/strength` — inbound=1, contextual=1
- `/fitness/home-gym` — inbound=1, contextual=1
- `/fitness/conditioning` — inbound=1, contextual=1
- `/fitness/recovery` — inbound=1, contextual=1
- `/calisthenics` — inbound=2, contextual=1
- `/racket` — inbound=1654, contextual=1
- `/squash` — inbound=1, contextual=1
- `/running/shoes/race` — inbound=2, contextual=1
- `/running/shoes/stability` — inbound=2, contextual=1
- `/running/shoes/trail` — inbound=1, contextual=1
- `/products/roka-phantom-air` — inbound=1, contextual=1
- `/products/enervit-c2-1-carbo-gel` — inbound=1, contextual=1
- `/products/nike-swoosh-medium-support` — inbound=1, contextual=1
- `/products/oxdog-hyper-court` — inbound=1, contextual=1
- `/products/asics-gel-resolution-padel-women` — inbound=1, contextual=1
- `/products/asics-solution-swift-ff-padel-women` — inbound=1, contextual=1
- `/products/wilson-bela-pro-padel` — inbound=1, contextual=1
- `/products/joma-spin-lady` — inbound=1, contextual=1
- `/products/babolat-jet-premura-2` — inbound=1, contextual=1
- `/products/tecnifibre-wall-shooter` — inbound=1, contextual=1
- `/products/varlion-bourne-padel` — inbound=1, contextual=1
- `/products/lok-padel-one` — inbound=1, contextual=1
- `/products/tecnifibre-black-code-1-28` — inbound=1, contextual=1
- `/products/luxilon-alu-power` — inbound=1, contextual=1
- `/products/tecnifibre-x-one-biphase` — inbound=1, contextual=1
- `/products/solinco-hyper-g` — inbound=1, contextual=1
- `/products/babolat-jet-tere` — inbound=1, contextual=1

---

## 5. Hub strength

| Hub | Status | Outbound unique | Outbound indexable | Running outbound | Inbound |
|---|---:|---:|---:|---:|---:|
| Homepage (`/`) | 200 | 73 | 69 | 32 | 1654 |
| Running Hub (`/running`) | 200 | 109 | 93 | 76 | 1654 |
| Running Gear Hub (`/gear`) | 200 | 55 | 45 | 21 | 1641 |
| Reviews Hub (`/reviews`) | 200 | 531 | 525 | 295 | 1627 |
| Best Hub (`/best`) | 200 | 83 | 80 | 55 | 1627 |
| Guides Hub (`/guides`) | 200 | 54 | 45 | 30 | 1654 |
| Compare Hub (`/compare`) | 200 | 25 | 22 | 7 | 1654 |
| Brands Hub (`/brands`) | 200 | 138 | 123 | 7 | 1654 |
| Tools Hub (`/tools`) | 200 | 44 | 33 | 14 | 1654 |
| Running Shoes (`/running/shoes`) | 200 | 90 | 61 | 58 | 1654 |
| GPS Watches (`/running/watches`) | 200 | 99 | 71 | 72 | 85 |
| Heart Rate Monitors (`/running/heart-rate-monitors`) | 200 | 70 | 49 | 45 | 47 |
| Running Clothing (`/running/clothing`) | 0 | 0 | 0 | 0 | 87 |
| Running Socks (`/running/socks`) | 200 | 56 | 33 | 28 | 14 |
| Hydration (`/running/hydration`) | 200 | 68 | 48 | 42 | 37 |
| Running Packs & Vests (`/running/packs`) | 200 | 98 | 68 | 68 | 72 |
| Headphones (`/running/headphones`) | 200 | 57 | 36 | 32 | 14 |
| Sunglasses (`/running/sunglasses`) | 0 | 0 | 0 | 0 | 19 |
| Running Lights (`/running/lights`) | 200 | 55 | 34 | 30 | 14 |
| Treadmills (`/running/treadmills`) | — | 0 | 0 | 0 | 0 |
| Safety Gear (`/running/safety`) | 200 | 48 | 28 | 26 | 8 |
| Running Belts (`/running/belts`) | 200 | 67 | 43 | 37 | 19 |
| Recovery (`/running/recovery`) | 200 | 73 | 47 | 47 | 24 |
| Accessories (`/running/accessories`) | 0 | 0 | 0 | 0 | 6 |
| Nutrition & Fuel (`/running/nutrition`) | 0 | 0 | 0 | 0 | 49 |

### Outbound mix (selected hubs)

**Homepage** — {"Legal":6,"Hub":7,"Sport":9,"Category":3,"Gear":1,"Finder":3,"Best":6,"Product":30,"Guide":3,"Comparison":3,"Calculator":2}
**Running Hub** — {"Legal":6,"Hub":12,"Home":1,"Sport":6,"Category":10,"Finder":8,"Best":8,"Product":39,"Guide":3,"Comparison":4,"Setup":1,"Brand":8,"Calculator":2,"Tool":1}
**Running Gear Hub** — {"Legal":6,"Hub":6,"Home":1,"Sport":9,"Category":7,"Finder":4,"Calculator":2,"Gear":6,"Product":4,"Best":2,"Brand":8}
**Reviews Hub** — {"Legal":6,"Hub":8,"Home":1,"Sport":6,"Category":2,"Review":503,"Gear":1,"Finder":2,"Calculator":2}
**Best Hub** — {"Legal":6,"Hub":5,"Home":1,"Sport":6,"Category":2,"Best":58,"Gear":1,"Finder":2,"Calculator":2}
**Guides Hub** — {"Legal":6,"Hub":11,"Home":1,"Sport":6,"Category":2,"Guide":23,"Gear":1,"Finder":2,"Calculator":2}

---

## 6. Crawl depth (from Homepage)

### Overall (indexable)

| Depth | URLs |
|---|---:|
| 0 | 1 |
| 1 | 69 |
| 2 | 962 |
| 3 | 571 |
| 4 | 46 |
| unreachable | 5 |

### By page type

| Page type | 0 | 1 | 2 | 3 | 4 | 5+ | unreachable |
|---|---:|---:|---:|---:|---:|---:|---:|
| Alternatives | 0 | 0 | 12 | 42 | 31 | 0 | 0 |
| Author | 0 | 0 | 1 | 0 | 0 | 0 | 0 |
| Best | 0 | 6 | 52 | 0 | 0 | 0 | 0 |
| Brand | 0 | 0 | 101 | 0 | 0 | 0 | 0 |
| Calculator | 0 | 2 | 3 | 0 | 0 | 0 | 0 |
| Category | 0 | 3 | 33 | 5 | 9 | 0 | 2 |
| Comparison | 0 | 3 | 48 | 43 | 0 | 0 | 0 |
| Finder | 0 | 3 | 13 | 0 | 0 | 0 | 0 |
| Gear | 0 | 1 | 0 | 0 | 0 | 0 | 0 |
| Guide | 0 | 3 | 44 | 18 | 3 | 0 | 0 |
| Home | 1 | 0 | 0 | 0 | 0 | 0 | 0 |
| Hub | 0 | 6 | 1 | 0 | 0 | 0 | 0 |
| Legal | 0 | 6 | 1 | 0 | 0 | 0 | 0 |
| Product | 0 | 30 | 133 | 455 | 3 | 0 | 2 |
| Review | 0 | 0 | 503 | 0 | 0 | 0 | 0 |
| Setup | 0 | 0 | 8 | 8 | 0 | 0 | 0 |
| Sport | 0 | 6 | 3 | 0 | 0 | 0 | 0 |
| Subcategory | 0 | 0 | 3 | 0 | 0 | 0 | 1 |
| Tool | 0 | 0 | 3 | 0 | 0 | 0 | 0 |

---

## 7. Anchor text

| Class | Count | Share |
|---|---:|---:|
| generic | 5156 | 2.8% |
| exactish | 167982 | 90.8% |
| descriptive | 10296 | 5.6% |
| empty | 1511 | 0.8% |

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

- “race” × 6021
- “running” × 5481
- “kitletics” × 4935
- “run” × 4331
- “trail” × 3720
- “brands” × 3447
- “hyrox” × 3344
- “fitness” × 3311
- “racket sports” × 3284
- “affiliate disclosure” × 2807
- “reviews” × 2240
- “methodology” × 2131
- “best” × 1790
- “garmin” × 1726
- “tools” × 1719
- “shoes” × 1684
- “how we score →” × 1682
- “outdoors” × 1655
- “team sports” × 1655
- “about” × 1654

_No keyword-stuffing recommendations — counts only._

---

## 8. Topical coverage map (Running)

| Category | Path | Products | Reviews | Best | Guides | Comparisons | Finders | Listing status |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Running Shoes | `/running/shoes` | 83 | 83 | 13 | 12 | 12 | 8 | 200 |
| GPS Watches | `/running/watches` | 33 | 33 | 8 | 6 | 10 | 1 | 200 |
| Heart Rate Monitors | `/running/heart-rate-monitors` | 15 | 15 | 4 | 2 | 6 | 1 | 200 |
| Running Clothing | `/running/clothing` | 57 | 13 | 6 | 3 | 7 | 1 | 0 |
| Running Socks | `/running/socks` | 10 | 10 | 1 | 1 | 1 | 1 | 200 |
| Hydration | `/running/hydration` | 17 | 17 | 2 | 4 | 1 | 1 | 200 |
| Running Packs & Vests | `/running/packs` | 35 | 35 | 5 | 2 | 11 | 1 | 200 |
| Headphones | `/running/headphones` | 11 | 11 | 1 | 1 | 2 | 1 | 200 |
| Sunglasses | `/running/sunglasses` | 17 | 7 | 1 | 0 | 2 | 1 | 0 |
| Running Lights | `/running/lights` | 9 | 9 | 1 | 1 | 3 | 1 | 200 |
| Treadmills | `/running/treadmills` | 6 | 6 | 1 | 1 | 1 | 1 | — |
| Safety Gear | `/running/safety` | 6 | 6 | 1 | 0 | 1 | 1 | 200 |
| Running Belts | `/running/belts` | 14 | 14 | 2 | 1 | 2 | 1 | 200 |
| Recovery | `/running/recovery` | 16 | 16 | 1 | 5 | 5 | 1 | 200 |
| Accessories | `/running/accessories` | 3 | 3 | 0 | 0 | 0 | 1 | 0 |
| Nutrition & Fuel | `/running/nutrition` | 38 | 10 | 1 | 4 | 6 | 1 | 0 |

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
| Total relationships (non-deprecated) | 1735 |
| Alternative-typed | 1645 |
| Family / generation | 43 |
| Direct competitor | 1438 |
| Comparison-candidate typed | 15 |
| Published products | 623 |
| Products with alternatives | 412 |
| Products without alternatives | 211 |
| Products in editorial comparisons | 149 |
| `/alternatives` pages in sitemap | 85 |
| Running products with alternatives | 361 |
| Running products without alternatives | 9 |

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
| `/` | Home | 1654 | 1654 | 73 |
| `/brands` | Hub | 1654 | 142 | 138 |
| `/compare` | Hub | 1654 | 41 | 25 |
| `/guides` | Hub | 1654 | 110 | 54 |
| `/tools` | Hub | 1654 | 59 | 44 |
| `/about` | Legal | 1654 | 5 | 25 |
| `/contact` | Legal | 1654 | 5 | 25 |
| `/running` | Sport | 1654 | 543 | 109 |
| `/running/shoes` | Category | 1654 | 143 | 90 |
| `/fitness` | Sport | 1654 | 183 | 185 |
| `/fitness/hyrox` | Category | 1654 | 61 | 56 |
| `/racket` | Sport | 1654 | 1 | 38 |
| `/gear` | Gear | 1641 | 38 | 55 |
| `/methodology` | Legal | 1632 | 1343 | 25 |
| `/affiliate-disclosure` | Legal | 1632 | 1180 | 25 |
| `/privacy` | Legal | 1632 | 5 | 25 |
| `/terms` | Legal | 1632 | 5 | 25 |
| `/tools/running-shoe-finder` | Finder | 1632 | 132 | 26 |
| `/tools/running-pace-calculator` | Calculator | 1632 | 90 | 30 |
| `/tools/fitness-watch-finder` | Finder | 1630 | 57 | 26 |
| `/tools/race-time-predictor` | Calculator | 1630 | 5 | 29 |
| `/best` | Hub | 1627 | 54 | 83 |
| `/reviews` | Hub | 1627 | 504 | 531 |
| `/how-we-review` | Legal | 1006 | 1006 | 26 |
| `/authors/kitletics-editorial` | Author | 544 | 544 | 529 |

### Lowest inbound (raw, indexable)

| Path | Type | Inbound | Contextual | Outbound |
|---|---|---:|---:|---:|
| `/running/track` | Category | 0 | 0 | 48 |
| `/fitness/cross-training` | Category | 0 | 0 | 34 |
| `/running/shoes/heavy-runners` | Subcategory | 0 | 0 | 43 |
| `/products/nike-court-lite-4` | Product | 0 | 0 | 29 |
| `/products/adidas-gamecourt-2` | Product | 0 | 0 | 29 |
| `/running/treadmill` | Category | 1 | 1 | 57 |
| `/running/ultra` | Category | 1 | 1 | 132 |
| `/fitness/gym` | Category | 1 | 1 | 85 |
| `/fitness/strength` | Category | 1 | 1 | 86 |
| `/fitness/home-gym` | Category | 1 | 1 | 110 |
| `/fitness/conditioning` | Category | 1 | 1 | 71 |
| `/fitness/recovery` | Category | 1 | 1 | 38 |
| `/squash` | Sport | 1 | 1 | 34 |
| `/running/shoes/trail` | Subcategory | 1 | 1 | 42 |
| `/products/roka-phantom-air` | Product | 1 | 1 | 33 |
| `/products/enervit-c2-1-carbo-gel` | Product | 1 | 1 | 32 |
| `/products/nike-swoosh-medium-support` | Product | 1 | 1 | 28 |
| `/products/oxdog-hyper-court` | Product | 1 | 1 | 29 |
| `/products/asics-gel-resolution-padel-women` | Product | 1 | 1 | 29 |
| `/products/asics-solution-swift-ff-padel-women` | Product | 1 | 1 | 29 |
| `/products/wilson-bela-pro-padel` | Product | 1 | 1 | 29 |
| `/products/joma-spin-lady` | Product | 1 | 1 | 29 |
| `/products/babolat-jet-premura-2` | Product | 1 | 1 | 29 |
| `/products/tecnifibre-wall-shooter` | Product | 1 | 1 | 29 |
| `/products/varlion-bourne-padel` | Product | 1 | 1 | 29 |

---

## 13. Launch cluster evidence (factual — no launch decision)

| Evidence | Value |
|---|---:|
| Running cluster size (indexable nodes) | 942 |
| Largest connected component | 942 |
| Connected components | 1 |
| Orphans (all indexable) | 5 |
| Orphans (running) | 2 |
| Weak pages inbound=1 (all) | 116 |
| Weak pages inbound=1 (running) | 79 |
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
