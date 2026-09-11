# Fix 69 — Brand depth opportunity audit

**Date:** 2026-09-10  
**Mode:** Opportunity audit (do **not** pad 122 hubs)  
**Evidence:** `docs/prelaunch/data/rc-69/brand-audit.json`  
**Gates unchanged:** `canPublishBrandHub` (≥3 published products + category/family/strength signals) · `vertical-strategy.ts` (Running enabled; fitness/padel/tennis held)

This is **not** a site-go flip. Thin catalogs stay held. One launch-relevant Running catalog gap was completed with current manufacturer SKUs and authentic packshots.

---

## 1. Result

| Metric | Before | After |
|---|---:|---:|
| Brand records | 191 | **190** |
| Editorial **READY** / INDEXABLE | 69 | **70** |
| HELD | 122 | **120** |
| HOLD_INSUFFICIENT_DEPTH | 91 | **90** |
| HOLD_NO_PRODUCTS | 31 | **30** |
| Unexplained holds | — | **0** |

**Promoted:** `nnormal` (vest-only → Kjerag 02 + Tomir 02 + Race Vest).  
**Removed:** `strength-shop` (fitness brand record, zero products, unused).

---

## 2. What we did **not** do

- Did not generate hub copy or extra SKUs for all 122 holds.
- Did not un-draft media-gated products to inflate counts.
- Did not onboard historical NNormal (Kjerag 01 / Tomir 1.0) or Cadí / Kjerag Brut / Kboix to dump the store.
- Did not dump Decathlon Kiprun footwear or Amazfit/Samsung full GPS lines just to hit ≥3.
- Did not onboard padel / racket / fitness to chase Brand READY.

---

## 3. Catalog gap that **did** qualify

### `nnormal` — **CATALOG_GAP_FIXED**

Kitletics had **one** published product: Race Vest. NNormal is a current trail-shoe brand (Kjerag / Tomir / Cadí franchises). That is incomplete ingestion, not a one-SKU accessory house.

**Onboarded (current, manufacturer-sourced, authentic heroes):**

| Product | Job | Specs used (manufacturer, not averaged) |
|---|---|---|
| `nnormal-kjerag-02` | Technical race-trail | 20/26 mm, 6 mm drop, 3.5 mm lugs, 230 g UK 8.5 (family table). PDP lists 214 g at UK 7.5 — different size. |
| `nnormal-tomir-02` | Long technical trail | 25/33 mm, 8 mm drop, 5 mm Traction Lug, 264 g UK 8.5 (current PDP). Manufacturer comparison page listed 288 g at UK 8.5 — **conflict, PDP preferred**. |

Heroes: `cloud.nnormal.com` packshots → `public/images/running/products/nnormal-{kjerag,tomir}-02-hero.jpg`.

**Hub now explains:** Kjerag vs Tomir vs Race Vest; Cadí/Brut called out as current at the manufacturer and **not** in catalog. Reviews (vest), comparisons (competitor edges vs Peregrine / Sense Ride / Speedgoat / Cascadia), Guide rail (`how-to-choose-running-shoes`).

Live `{ isDev: false }`: **READY · INDEXABLE** · 3 products · 2 categories · `canPublishProduct` ok · authentic media · both shoes **LAUNCH_READY**.

**Still not ingested (on purpose):** Cadí, Kjerag Brut, apparel, Kboix.

---

## 4. Remaining real catalog gaps (open — **not** padded)

These are **CATALOG_GAP**, not `LEGITIMATELY_SMALL`. Completing them needs authentic media + evidence-first research, not a third token SKU.

| Slug | Live | Why it is a gap | Why not this round |
|---|---:|---|---|
| `amazfit` | 2 GPS | Current lineup is larger (T-Rex / Active / Balance / Cheetah, etc.) | Garmin / COROS / Polar / Suunto / Apple already READY. Adding one watch to hit the hub gate would be padding. |
| `samsung` | 1 GPS | Galaxy Watch sports line is larger than Ultra-only | Same — one running-relevant flagship is the Day-1 GPS SKU, not a hub. |
| `decathlon` | 1 belt | Kiprun is a real running line. `prod-kiprun-trail-10` is **authored but media-gated**. Kiprun shoes uningested. | Do not dump the hypermarket. Vest already exists; needs a licensed hero, not a new fake SKU. Footwear is a separate onboard. |

Compressport / TriggerPoint / OOFOS / lululemon have **extra authored SKUs that are media-gated**. That is a **media gate**, not missing ingestion. Ungating without authentic heroes is forbidden. They stay held.

---

## 5. HOLD_INSUFFICIENT_DEPTH (90) — class per slug

### LEGITIMATELY_SMALL (54) — Running accessory / fuel / recovery / wearables-adjacent 1–2 hero SKUs

Comparison-site scope: the current relevant catalog **on Kitletics** is the hero SKU(s) in that category, not every sock/gel/light in the manufacturer store.

`scosche` · `flipbelt` · `spibelt` · `uswe` · `compressport` · `naked` · `rabbit` · `odlo` · `ciele` · `smartwool` · `darn-tough` · `bose` · `goodr` · `silva` · `feetures` · `balega` · `injinji` · `swiftwick` · `drymax` · `wrightsock` · `fitletic` · `triggerpoint` · `oofos` · `body-glide` · `beats` · `soundcore` · `smith` · `rudy-project` · `tifosi` · `100-percent` · `roka` · `ledlenser` · `biolite` · `nitecore` · `proviz` · `tailwind` · `skratch-labs` · `clif-bar` · `honey-stinger` · `spring-energy` · `neversecond` · `high5` · `nuun` · `saltstick` · `powerbar` · `enervit` · `226ers` · `huma` · `naak` · `styrkr` · `veloforte` · `brazyn` · `squirrels-nut-butter` · `2toms`

### CATALOG_GAP (open) (3)

`amazfit` · `samsung` · `decathlon` — see §4.

### FUTURE_VERTICAL (33)

**Padel (10):** `siux` · `starvie` · `kuikma` · `drop-shot` · `varlion` · `oxdog` · `royal-padel` · `black-crown` · `tecnifibre-padel` · `lok`

**Racket / pickleball / strings (8):** `dunlop` · `prince` · `selkirk` · `joola` · `victor` · `luxilon` · `solinco` · `k-swiss`

**Fitness (15):** `nuobell` · `bowflex` · `atx` · `hydrow` · `sole-fitness` · `horizon-fitness` · `woodway` · `waterrower` · `schwinn` · `xebex` · `lululemon` · `xero-shoes` · `vivobarefoot` · `salming` · `do-win`

`xero-shoes` / `vivobarefoot` / `lululemon` / `do-win` / `salming` are ingested as **training / gym** shoes, not a Day-1 running-shoe catalog. Do not reclassify as Running CATALOG_GAP.

---

## 6. HOLD_NO_PRODUCTS (30) — class per slug

Zero **published** products. Do **not** create Products merely to fill hubs.

### NO_CURRENT_RELEVANT_PRODUCTS (26) — Running drafts, media-gated

Authentic-hero gate (`applyMediaPublishGate`). SKUs exist in content; they are `draft` until a licensed hero is registered. Ungating would be a media task, not brand padding.

`raidlight` · `the-north-face` · `stance` · `saxx` · `leki` · `bombas` · `hilly` · `sockwell` · `nite-ize` · `jabra` · `sony` · `huawei` · `fenix` · `knog` · `night-runner` · `shes-birdie` · `road-id` · `renpho` · `opove` · `rad-roller` · `rumbleroller` · `the-stick` · `2xu` · `timtam` · `dirty-girl` · `outdoor-research`

### FUTURE_VERTICAL (4)

| Slug | Source | Draft / review SKU | Notes |
|---|---|---|---|
| `li-ning` | racket | Aeronaut 9000 C | Held racket vertical |
| `bear-komplex` | fitness | Valor | Fitness held |
| `domyos` | fitness | Mid 500 | Fitness held |
| `zeraus` | fitness | Classic | Fitness held |

### STALE_ENTITY (1, cleaned)

**`strength-shop`** — brand-only record in `src/content/fitness/wave24.ts`, **raw product count 0**, no FKs in products/reviews/offers. Removed. Not a planned future brand.

No other held brand was an unused empty name.

---

## 7. Every original held brand → class

| Class | Count | Outcome |
|---|---:|---|
| **CATALOG_GAP_FIXED** | 1 | `nnormal` now READY |
| **CATALOG_GAP** (open) | 3 | `amazfit`, `samsung`, `decathlon` — still HOLD_INSUFFICIENT_DEPTH |
| **LEGITIMATELY_SMALL** | 54 | HOLD_INSUFFICIENT_DEPTH |
| **FUTURE_VERTICAL** | 37 | 33 insufficient + 4 no-products |
| **NO_CURRENT_RELEVANT_PRODUCTS** | 26 | HOLD_NO_PRODUCTS (media-gated) |
| **STALE_ENTITY** | 1 | `strength-shop` deleted |
| **Unexplained** | **0** | |

91 + 31 = 122 original holds = 1 fixed + 1 deleted + 3 open gaps + 54 small + 37 future + 26 media-gated.

---

## 8. Brand content (only where depth is real)

`nnormal` hub config (`brand-hub-p56-editorial.ts`): families, how lines differ, generation context, known-for, Guide map. Vest review remains the review rail; shoes are long-tail INDEXABLE without first-hand Reviews (onboarding policy). Competitor relationships wired; unique Alternatives intros added (`alternatives-p57-uniqueness.ts`).

No hub padding for the 120 still held.

---

## 9. Definition of done

- [x] All 91 insufficient + 31 no-product brands inspected (catalog, families, reviews, Best, comparisons, guides)
- [x] CATALOG_GAP vs LEGITIMATELY_SMALL vs FUTURE_VERTICAL distinguished
- [x] Launch-relevant Running gap completed: NNormal Kjerag 02 + Tomir 02 (current, authentic media, full product records)
- [x] Brand hub explains families / line split / reviews / comparisons / guides once depth is real
- [x] HOLD_NO_PRODUCTS classified; stale `strength-shop` removed; no products invented for empty brands
- [x] 0 unexplained holds
- [x] `canPublishBrandHub` and vertical strategy unchanged

**Do not treat Brand READY as a site-go authorization.**
