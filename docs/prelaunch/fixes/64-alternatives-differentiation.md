# Fix 64 — Alternatives differentiation (non-INDEXABLE NEEDS_DIFF)

**Date:** 2026-09-10  
**Status:** Implemented (content complete — category index policy unchanged)  
**V3 residual:** [`../FINAL-EDITORIAL-READINESS-V3.md`](../FINAL-EDITORIAL-READINESS-V3.md) — 30 READY-but-non-INDEXABLE Alternatives `NEEDS_DIFF`  
**Assessor (unchanged):** Fix 59 / V3 forensic — Jaccard after name-scrub on `intro + whyAlternative + betterAt + worseAt + whoShouldSwitch + whoShouldStay`, `classifyUniqueness` (`DUPLICATIVE` ≥ 0.90 / `NEEDS_DIFF` ≥ 0.72)  
**Scripts:** `scripts/tmp/prelaunch-64-alt-uniqueness.ts`, `scripts/tmp/prelaunch-64-probe.ts`  
**Dump:** [`../data/64-alt-dump.json`](../data/64-alt-dump.json)

Content readiness and indexation stay separate. These URLs stay **non-INDEXABLE**. `ALTERNATIVES_INDEXABLE_CATEGORIES` was not expanded.

---

## Result

| Check | Before (V3) | After |
|---|---|---|
| Alternatives `NEEDS_DIFF` (estate READY/INDEXABLE cluster) | **30** | **0** |
| Alternatives `DUPLICATIVE` | 0 | **0** |
| INDEXABLE Alternatives `NEEDS_DIFF` / `DUPLICATIVE` | 0 / 0 | **0 / 0** |
| Highest Jaccard among the 30 | ≥0.72 (all 30) | **0.638** (`smith-attack-mag` ↔ `julbo-ultimate`) |
| Last pair over the line (mid-fix) | `ledlenser-neo9r` ↔ `biolite-headlamp-800-pro` **0.721**; `clif-bar-original` ↔ `naak-ultra-energy-bar` **0.721** | **0.542 / 0.600** |
| All 30 editorial READY / `canPublish` gate | 30 READY | **30 / 30** (`gateOk`) |
| Disposition | `PUBLIC_NOINDEX` | **`PUBLIC_NOINDEX`** |
| Indexable | `no` (`alternatives_category_noindex`) | **`no` (unchanged)** |

Cluster size in the live uniqueness pass: **249** READY-or-INDEXABLE Alternatives pages (`TEMPLATE_SIMILAR_ACCEPTABLE` 231, `GENUINELY_UNIQUE` 18). V3 counted **248** READY; index policy is unchanged.

---

## 1. Exact 30

Hold for every row: `PUBLIC_NOINDEX` · `alternatives_category_noindex` · `alternatives_ok_render` · vertical **running**.  
V3 uniqueness class: **NEEDS_DIFF**. After: **TEMPLATE_SIMILAR_ACCEPTABLE**.  
Similarity reason (V3): same four-frame Alternatives generator (`why / better / worse / switch / stay`) plus shared peer-strength dumps. After name-scrub, category cousins collapsed onto one “leave X for Y’s job” skeleton. Fix is **decision-job copy per source**, not synonym swaps.

Relationship **types / badges** were not rewritten. Labels stay whatever the graph already inferred (Lighter, Better Value, Previous Generation, Trail Alternative, More Race-Focused, Similar). No page was forced through a fixed “Best cheaper / Best lighter / Best stable / Best premium / Best different use” set.

### Packs (`cat-packs-vests`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [Salomon ADV Skin 5](/products/salomon-adv-skin-5/alternatives) | Duro LT (Lighter); ADV Skin 12 (Similar); NNormal (Lighter); VaporAir 4 (Similar); Spry 5 (Lighter); Ultrun (Similar); Dyna LT (Similar); UD Race Vest 6 (Similar) | `osprey-duro-lt` | 0.494 |
| [Nathan VaporAir 4.0 8L](/products/nathan-vaporair-4/alternatives) | UD 6 (Lighter); ADV Skin 5 (Better Value); Pace 8 (Similar); VaporAir 2 (Previous Generation); Alpha 6 (Similar); Distance 8 (Similar) | `uswe-pace-8` | 0.497 |
| [Osprey Duro LT](/products/osprey-duro-lt/alternatives) | UD 6 (Better Value); ADV Skin 5 (Similar); Duro 6 (Similar); Ultrun (Similar); Dyna LT (Similar); NNormal (Similar) | `compressport-ultrun-s-pack` | 0.592 |
| [USWE Pace 8L](/products/uswe-pace-8/alternatives) | ADV Skin 5 (Lighter); Distance 8 (Similar); UD 6 (Lighter); VaporAir 4 (Lighter) | `nathan-vaporair-4` | 0.497 |
| [Compressport Ultrun S Pack](/products/compressport-ultrun-s-pack/alternatives) | Duro LT (Lighter); ADV Skin 5 (Similar); UD 6 (Similar); NNormal (Similar) | `osprey-duro-lt` | 0.592 |
| [NNormal Race Vest](/products/nnormal-race-vest/alternatives) | Duro LT (Better Value); ADV Skin 5 (More Race-Focused); UD 6 (More Race-Focused); Ultrun (More Race-Focused) | `compressport-ultrun-s-pack` | 0.558 |

### Hydration (`cat-hydration`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [HydraPak SoftFlask Speed 500](/products/hydrapak-softflask-speed-500/alternatives) | SoftFlask 250 (Lighter); Salomon Speed 500 (Similar); Skyflask Speed 500 (More Beginner-Friendly); Tube Kit (Lighter); UD Body Bottle 500 (Similar); Salomon 500 (Similar); Nathan 18 oz (Similar); SoftFlask 500 (Similar) | `salomon-soft-flask-500` | 0.595 |
| [Salomon Soft Flask 500 ml](/products/salomon-soft-flask-500/alternatives) | SoftFlask 250 (Lighter); SoftFlask 500 (Similar); Speed 500 (More Race-Focused); ExoShot 2 (Similar); Salomon Speed 500 (More Race-Focused); UD Body Bottle 500 (More Race-Focused); Nathan 18 oz (More Race-Focused) | `hydrapak-softflask-speed-500` | 0.595 |

### Sunglasses (`cat-sunglasses`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [Oakley Radar EV Path](/products/oakley-radar-ev-path/alternatives) | Encoder (Similar); Rail (Better Value); Flak 2.0 XL (Lighter); Shift MAG (Similar); Goodr OGs (Better Value); Phantom Air (Lighter); Aerolite (Similar) | `tifosi-rail` | 0.507 |
| [Oakley Sutro Lite](/products/oakley-sutro-lite/alternatives) | Kato (Similar); Cutline (Better Value); Encoder (Trail Alternative); 100% S3 (Better Value); Aerolite (Trail Alternative); Goodr OGs (Better Value) | `oakley-encoder` | 0.543 |
| [Oakley Encoder](/products/oakley-encoder/alternatives) | Aerolite (Similar); Cutline (Better Value); Radar EV Path (More Race-Focused); S3 (Better Value); Sutro Lite (More Race-Focused); Goodr OGs (Better Value); Kato (More Race-Focused) | `oakley-sutro-lite` | 0.543 |
| [Smith Attack MAG](/products/smith-attack-mag/alternatives) | Ultimate (Similar); Shift MAG (More Race-Focused); Rush (Similar); Aerolite (Similar) | `julbo-ultimate` | 0.638 |
| [Julbo Ultimate](/products/julbo-ultimate/alternatives) | Attack MAG (Similar); Shift MAG (More Race-Focused); Rush (Similar); Aerolite (Similar) | `smith-attack-mag` | 0.638 |
| [Tifosi Rail](/products/tifosi-rail/alternatives) | Radar EV Path (Similar); Flak XL (Lighter); Shift MAG (Similar); Phantom Air (Lighter); Goodr OGs (Similar); Vogel (Lighter); Circle G (Lighter) | `oakley-radar-ev-path` | 0.507 |
| [Tifosi Vogel](/products/tifosi-vogel/alternatives) | Goodr OGs (Similar); Circle G (Lighter); Rail (More Race-Focused) | `goodr-circle-gs` | 0.553 |
| [Goodr Circle Gs](/products/goodr-circle-gs/alternatives) | Goodr OGs (Similar); Rail (More Race-Focused); Vogel (Similar) | `tifosi-vogel` | 0.553 |

### Lights (`cat-running-lights`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [Ledlenser NEO9R](/products/ledlenser-neo9r/alternatives) | Distance 1500 (Similar); NAO RL (Lighter); Swift RL (Lighter); 800 Pro (Lighter); NU43 (Lighter) | `petzl-swift-rl` | 0.542 |
| [BioLite HeadLamp 800 Pro](/products/biolite-headlamp-800-pro/alternatives) | NAO RL (Similar); Swift RL (Lighter); Distance 1500 (Similar); NU43 (Lighter); NEO9R (Similar) | `ledlenser-neo9r` | 0.534 |
| [Petzl Swift RL](/products/petzl-swift-rl/alternatives) | NAO RL (Similar); 800 Pro (Better Value); Trail Runner Free 2 (Lighter); NEO9R (Similar); NU43 (Better Value); Spot 400-R (Better Value) | `ledlenser-neo9r` | 0.542 |

### Nutrition (`cat-nutrition`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [SiS Beta Fuel gel](/products/sis-beta-fuel-gel/alternatives) | C30 gel (Similar); GO Isotonic (Better Value); Gel 160 (Similar); PF30 (Similar); Gel 100 CAF (Similar); 226ERS (Similar); STYRKR GEL30 (Similar) | `precision-pf30-gel` | 0.551 |
| [Precision PF30 gel](/products/precision-pf30-gel/alternatives) | Gel 100 (Similar); GO (Better Value); Gel 160 (Similar); C30 (Similar); Beta Fuel (Similar); 226ERS (Similar); STYRKR (Similar); Enervit (Similar) | `neversecond-c30-gel` | 0.556 |
| [Neversecond C30 gel](/products/neversecond-c30-gel/alternatives) | Beta Fuel (Similar); Roctane (Trail Alternative); Gel 160 (Similar); Gel 100 (Similar); PF30 (Similar); Gel 100 CAF (Similar); STYRKR (Similar); Enervit (Similar) | `precision-pf30-gel` | 0.556 |
| [CLIF Bar Original](/products/clif-bar-original/alternatives) | Näak (Similar); Bloks (More Race-Focused); Veloforte (Similar); Energize (More Race-Focused); Awesome Sauce (Similar) | `naak-ultra-energy-bar` | 0.600 |
| [Näak Ultra Energy Bar](/products/naak-ultra-energy-bar/alternatives) | Veloforte (Similar); Bloks (Better Value); Energize (More Race-Focused); Awesome Sauce (Similar); Clif (Better Value) | `clif-bar-original` | 0.600 |
| [PowerBar Energize](/products/powerbar-energize/alternatives) | Clif (Better Value); Bloks (Trail Alternative); Näak (Trail Alternative); Veloforte (Trail Alternative); Awesome Sauce (Trail Alternative) | `naak-ultra-energy-bar` | 0.587 |
| [Precision PF30 Drink Mix](/products/precision-pf30-drink-mix/alternatives) | Mix 320 (Similar); Tailwind (Better Value); Mix 160 (Similar); C30 drink (Similar); Beta Fuel drink (Similar) | `neversecond-c30-sports-drink` | 0.554 |
| [Neversecond C30 Sports Drink](/products/neversecond-c30-sports-drink/alternatives) | Mix 160 (Similar); Tailwind (Better Value); Beta Fuel drink (Similar); PF30 mix (Similar) | `precision-pf30-drink-mix` | 0.554 |

### Clothing (`cat-running-clothing`)

| Source | Alternatives (type / badge) | Nearest similar alt page | Jaccard after |
|---|---|---|---:|
| [Nike Dri-FIT Miler Tee (Men)](/products/nike-dri-fit-miler-men/alternatives) | Janji (Similar); Capilene (Trail Alternative); Miler women (More Beginner-Friendly); Tracksmith (Similar); Own the Run (Similar) | `janji-run-tee-men` | 0.630 |
| [Janji Run Tee (Men)](/products/janji-run-tee-men/alternatives) | Miler (Similar); Capilene (Trail Alternative); Miler women (Similar); Tracksmith (Similar); Own the Run (Similar) | `nike-dri-fit-miler-men` | 0.630 |
| [Patagonia Capilene Cool Daily (Men)](/products/patagonia-capilene-cool-daily-men/alternatives) | Own the Run (Better Value); Miler (Similar); Janji (Similar); Miler women (Similar); Tracksmith (Similar); Capilene Thermal (Similar) | `nike-dri-fit-miler-men` | 0.622 |

---

## 2–4. Decision maps (catalog-backed only)

Every page answers **why someone would want an alternative to this specific product**. Switch dimensions are category-real (capacity, bounce, valve, lens system, lumens/IP, carb math, chew format, reflectivity/odor). Unpublished numbers are omitted.

Each card (via `buildAccessoryAlternativeCopy`) states: why consider it · what it improves · what you give up · who should switch · who should keep the original. `canPublishAlternativesPage` still requires switch + trade-off verbs on ≥2 alts — copy uses Switch / Choose / Move to and Keep / Give up.

### Packs

| Source | Why look for an alternative | Stay when |
|---|---|---|
| ADV Skin 5 | 5L / 230g Sensifit, twin 500s, poles, **no bladder**. 5L fills; reservoir days; flasks-only is enough; 8L rear stash. | Bounce-controlled 5L race kit still covers the week. |
| VaporAir 4 | 8L / 241g flask vest, more rear than ADV 5, not bladder-first. NDM bounce; cheaper 6L; 8L running empty. | 8L + front flasks is why v2 was too small. |
| Duro LT | Men’s **1.5L / 160g** flask-only, no poles, no whistle. Mandatory 5–6L; women’s Dyna last; compression last. | 6–15L would be empty dead weight. |
| Pace 8 | **8L / 290g NDM** + optional bladder. Cannot try USWE; alpine poles without NDM; unused 8L. | Technical-trail bounce + 8L is the trigger. |
| Ultrun S | **5L / 180g compression** second-skin. Unforgiving sizing; need pocket structure; 1.5L is enough. | Apparel-like bounce and you will size the last. |
| NNormal | **5L / 170g** stripped premium. Osprey money at similar volume; Sensifit pockets; 6L kit. | Refusing adventure bulk is worth the spend. |

### Hydration flasks

| Source | Why look for an alternative | Stay when |
|---|---|---|
| SoftFlask Speed 500 | **42g high-flow** 500 ml vest flask, no carry system. 250 ml belt; handheld Skyflask; UD/Nathan geometry; slower Salomon valve. | High-flow 500 ml in a standard sleeve is the drink. |
| Salomon Soft Flask 500 | **38g standard valve**. Speed sipping; Nathan 18 oz; UD last; ExoShot handheld. | A basic vest-pocket spare is the refill. |

### Sunglasses

| Source | Why look for an alternative | Stay when |
|---|---|---|
| Radar EV Path | Interchangeable Prizm wrap + Unobtainium, not a frameless shield. Rail money; Flak XL last; MAG speed; no-wrap daily. | Prizm swaps + sport grip is the glare job. |
| Sutro Lite | Open-rim Prizm shield, **fixed lens**, large last, road glare. Kato FOV; spare lenses; Encoder; trail photochromic. | Sunny marathon coverage on a medium-large face. |
| Encoder | Frameless Prizm race shield, **no interchange**. Path swaps; Sutro airflow; S3/Cutline price; Aerolite trail weight. | Fixed shield FOV is the race-day tool. |
| Attack MAG | Trail MAG wrap, optional ChromaPop. Julbo auto-tint; Shift MAG road last; lighter Julbo wrap. | Foggy technical trail + MAG spares. |
| Ultimate | Reactiv **7–82% VLT**, no MAG. Attack MAG spares; Shift MAG road; tighter Rush wrap. | Mixed-light ultras make spare lenses the problem. |
| Rail | Value interchangeable wrap. Prizm/Unobtainium; Phantom Air weight; Vogel/Circle G daily. | Coverage at value price is the only reason you opened the page. |
| Vogel | ~24g daily sport, not a wrap. Rail wrap kit; Goodr OGs; polarized round. | Race shields would sit in the car. |
| Circle G | ~19g polarized round, low coverage. OGs sport shape; Rail wrap; Vogel daily. | Style-first easy miles beat marathon wrap. |

### Lights

| Source | Why look for an alternative | Stay when |
|---|---|---|
| NEO9R | **1200 lm / 199g** split near/far, optional chest belt, IP54, magnetic charge, **not reactive**. 199g on the skull; auto-dim; sealed hot-swap; SlimFit. | Craft a descent beam and dump pack mass off the head. |
| 800 Pro | **800 lm / 150g** SlimFit, timed burst, micro-USB, IPX4. 1200–1500 lm throw; reactive; storm seal. | No-bounce band + rear-red on dark roads. |
| Swift RL | **1200 lm / 92g REACTIVE**, USB-C, IPX4, premium. NAO throw; cheaper flood; NEO9R chest-belt craft. | Reactive 1200 lm at 92g is why it is on your head. |

### Nutrition

| Source | Why look for an alternative | Stay when |
|---|---|---|
| Beta Fuel gel | **40g** dual-source, thick, shop-common, not high-sodium. Thinner 22g; 30g modular ± sodium; hydrogel 40g; late caffeine. | Fewer 40g SiS packets hit marathon carbs. |
| PF30 gel | Mild **30g**, sodium on PH not the gel. 40g packets; cheap isotonic; sodium-in-gel; hydrogel. | 30g modular without flavour fatigue. |
| C30 gel | **30g + ~200mg sodium**, C30-system, narrower shops. 40g retail; Roctane caffeine; PF+PH split; hydrogel. | Gel+drink units that already include sodium. |
| Clif Original | **68g / ~250 kcal / 45g / soy** grocery brick. Cannot chew at pace; soy; specialty ultra; split chews; pouch. | Gas-station 250 kcal chew is the point. |
| Näak Ultra | Specialty **~28g / 7g protein / 180mg Na**, flavour-dependent calories. Petrol-station 45g; Bloks; Energize tables; pouch. | Ultra-positioned chew and you will hunt shops. |
| Energize | European table **~39g / 190mg Na**, dry without fluid. Grocery Clif; trail food; split chews; pouch. | Familiar endurance bar on long training. |
| PF30 mix | **30g** powder matched to PF gel; sodium on PH. Mix 320 ~80g; Tailwind all-in-one; Mix 160 40g; C30 200mg/scoop; Beta Fuel drink. | Bottle+gel in 30g units. |
| C30 drink | **30g + 200mg Na / scoop**, scale 1–3. Maurten bottles; Tailwind simplicity; SiS retail; PF+PH split. | Scalable 30g+sodium plus C30 gels. |

### Tees

| Source | Why look for an alternative | Stay when |
|---|---|---|
| Miler men | Reflective Dri-FIT daily, wide sizes, can cling wet. Janji colorway; Capilene odor/travel; Own the Run price; Tracksmith hand; women’s last. | Widely sized dusk-reflective heat tee is the default. |
| Janji men | Hot-weather daily, **no reflectivity**, more color story. Miler dusk hits; Capilene odor/hike; Tracksmith; Own the Run price. | Personality daily miles; night-road reflectivity is not weekly. |
| Capilene Cool Daily | Odor-managed run/hike/travel, **not reflective**. Cheaper reflectivity; dusk Miler; run-only colorway; luxury hand; Thermal when cold. | Multi-day odor across run and warm travel. |

---

## 5. What we did not do

- Did **not** paraphrase one template across packs / sunglasses / gels.
- Did **not** apply a shared spec-fingerprint stem to all accessory categories (that raised estate `NEEDS_DIFF` in a discarded pass).
- Did **not** add packs, sunglasses, nutrition, clothing, lights, or hydration to `ALTERNATIVES_INDEXABLE_CATEGORIES`.
- Did **not** invent unpublished specs (Encoder weight, heel-like pack numbers, etc.).
- Did **not** force every card through the same “Best cheaper / lighter / stable / premium / different use” labels.

---

## 6. Implementation

| File | Role |
|---|---|
| `src/content/alternatives-p64-uniqueness.ts` | Per-source intro (job + leave / stay) and per-source card voice (`why`, `betterHint`, `worseHint`, `switchTo`, `stay`). |
| `src/lib/product/alternatives-p64-decision-copy.ts` | `buildAccessoryAlternativeCopy` — **only** if `source.slug` is in the P64 map. |
| `src/lib/product/alternative-decision-copy.ts` | Intro overlay: P64 then P57. Cards: accessory copy first, else original hash frames. |

Synced graph reasons (`decision-graph-alt-sync.ts`) read the same builder, so `canPublishAlternativesPage` sees Switch/Choose/Move to + Keep / Give up.

---

## 7. Uniqueness re-run

```text
readyPagesInCluster: 249
NEEDS_DIFF: 0
DUPLICATIVE: 0
v3NeedsAfter: 0
all 30: TEMPLATE_SIMILAR_ACCEPTABLE, indexable: false, PUBLIC_NOINDEX
```

Highest remaining among the 30: **0.638** (Attack MAG ↔ Ultimate — shared MAG/Reactiv trail-wrap aisle, different auto-tint vs MAG-spare jobs). Under the 0.72 line.

---

## 8. Publication

Unchanged. These categories remain outside the indexable Alternatives set. A completed page may stay `PUBLIC_NOINDEX`. Thin 157 Alternatives pages were not padded.

---

## Definition of done

- [x] Exact 30 exported (source, alternatives, category, vertical, hold, similarity reason, nearest peer)
- [x] Each page answers why *this* product would be replaced
- [x] Switch reasons are real category dimensions
- [x] Cards: why / improves / give up / switch / keep
- [x] Decision logic differs; not template paraphrasing
- [x] Alternative-type labels only where the graph already had them
- [x] Alternatives `NEEDS_DIFF` = 0 (estate cluster)
- [x] Indexability unchanged (`PUBLIC_NOINDEX`)
- [x] Report at `docs/prelaunch/fixes/64-alternatives-differentiation.md`
