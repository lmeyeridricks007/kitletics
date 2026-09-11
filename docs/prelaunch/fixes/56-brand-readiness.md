# Fix 56 — Brand hub completion

**Mode:** Remediation (READY hubs vs explicit HOLD)  
**Date:** 2026-09-10  
**Evidence:** `docs/prelaunch/data/56-brand-audit.json` · uniqueness via `scripts/tmp/prelaunch-43-brand-hub-verify.ts`  
**Gates unchanged:** `canPublishBrandHub` (≥3 published products + category/family/strength signals)

Editorial READY for Brand hubs = depth-qualified + not uniqueness-held = **INDEXABLE**. Thin catalogs are not padded.

Vertical launch strategy was **not** edited.

---

## 1. Result

| Metric | Before | After |
|---|---:|---:|
| Brand records | 191 | **191** |
| Editorial **READY** / INDEXABLE | 56 | **69** |
| HELD | 135 | **122** |
| Uniqueness holds (renderable, noindex) | 13 | **0** |
| HOLD_INSUFFICIENT_DEPTH (1–2 products) | — | **91** (explicit) |
| HOLD_NO_PRODUCTS | — | **31** (explicit) |
| HOLD_DEPTH_GATE (3+ but fail signals) | — | **0** |
| Indexable uniqueness NEEDS_DIFF / DUPLICATIVE | 0 | **0** |
| Boilerplate overview blurbs | 0 | **0** |
| Indexable pages built | 56/56 | **69/69** |

**Every indexable Brand hub is READY.** No accidentally thin hubs shipped.

---

## 2. Audit of the 135 held (before)

Live `{ isDev: false }` catalog:

| Class | Count | Meaning |
|---|---:|---|
| **UNIQUENESS_HOLD** | **13** | Depth-qualified (3–6 products, reviews, strengths). Copy collapsed after name-scrub. **Promotable.** |
| **HOLD_INSUFFICIENT_DEPTH** | **91** | 1 product (57) or 2 products (34). **Not padded.** |
| **HOLD_NO_PRODUCTS** | **31** | Brand record, zero published products. **Not padded.** |
| PROMOTE_CANDIDATE (3+ failing depth gate but rich graph) | 0 | — |

No 3+ product brand was “accidentally” failing the depth gate. The only READY gap was uniqueness.

---

## 3. Promoted 13 (enough data — unique hubs)

Each already had published products, strengths, and reviews. Added **product families**, **how lines differ**, **generation context**, **known-for**, Guide/Best/comparison rails (from live graph).

| Slug | Products | Cats | Reviews | Best | Comparisons | Job split |
|---|---:|---:|---:|---:|---:|---|
| `puma` | 4 | 2 | 4 | 3 | 1 | NITRO road (Deviate / Magnify) vs Fuse gym |
| `mizuno` | 3 | 2 | 2 | 1 | 0 | Wave Rider daily vs Rebellion Pro race vs Exceed tennis |
| `inov-8` | 6 | 2 | 6 | 2 | 1 | Trailfly ultra vs F-Lite gym vs Fastlift heels |
| `joma` | 4 | 1 | 3 | 0 | 0 | Slam last vs Spin last (padel shoes) |
| `asics-racket` | 5 | 1 | 5 | 0 | 0 | Resolution vs Solution Speed vs Challenger/Dedicate |
| `powerblock` | 3 | 1 | 3 | 1 | 1 | Pro Series pin 50/100 vs Elite EXP expander |
| `gornation` | 3 | 3 | 3 | 1 | 0 | Wall skill bar + parallettes/rings — no station/vest |
| `gravity-fitness` | 4 | 4 | 4 | 1 | 1 | Free-standing station + vest load vs wall-only kits |
| `reebok` | 5 | 1 | 5 | 2 | 4 | Nano (X4/X3/Court) vs Lifter heels |
| `nobull` | 3 | 1 | 3 | 2 | 1 | Trainer / Trainer+ vs Outwork — no lifting-heel family |
| `tyr` | 3 | 1 | 3 | 1 | 3 | CXT swim-to-gym (CXT-1 / CXT-2 / Trainer) |
| `pullup-and-dip` | 3 | 2 | 3 | 1 | 1 | Doorway vs wall mount, then parallettes |
| `under-armour` | 4 | 1 | 4 | 1 | 1 | TriBase Reign / Project Rock vs Lifter vs Commit |

`BRAND_HUB_UNIQUENESS_HOLD_SLUGS` is **empty**. Indexable uniqueness: **42 GENUINELY_UNIQUE · 27 TEMPLATE_SIMILAR_ACCEPTABLE · 0 NEEDS_DIFF · 0 DUPLICATIVE**.

Calisthenics trio (GORNATION / Gravity / PULLUP & DIP) and training-shoe cluster (Reebok / NOBULL / TYR / UA) were split on **mount, load, and last job** — not brand-name swaps.

---

## 4. Small brands — not padded

**HOLD_INSUFFICIENT_DEPTH (91)** — 1–2 published products. Decision: keep **HIDDEN_404**. A single-SKU page is a Product/Review, not a Brand hub.

1 product (57): samsung, flipbelt, spibelt, uswe, nnormal, naked, decathlon, rabbit, ciele, darn-tough, bose, silva, feetures, injinji, swiftwick, drymax, wrightsock, fitletic, body-glide, beats, rudy-project, 100-percent, roka, ledlenser, biolite, nitecore, proviz, tailwind, honey-stinger, spring-energy, nuun, powerbar, enervit, 226ers, huma, brazyn, squirrels-nut-butter, 2toms, siux, drop-shot, royal-padel, black-crown, dunlop, hydrow, sole-fitness, horizon-fitness, woodway, waterrower, schwinn, lululemon, xero-shoes, vivobarefoot, do-win, selkirk, victor, luxilon, solinco.

2 products (34): amazfit, scosche, compressport, odlo, smartwool, goodr, balega, triggerpoint, oofos, soundcore, smith, tifosi, skratch-labs, clif-bar, neversecond, high5, saltstick, naak, styrkr, veloforte, starvie, kuikma, k-swiss, nuobell, bowflex, atx, xebex, salming, varlion, oxdog, tecnifibre-padel, lok, prince, joola.

**HOLD_NO_PRODUCTS (31)** — brand record only (media-gated drafts or unused names): 2xu, bear-komplex, bombas, dirty-girl, domyos, fenix, hilly, huawei, jabra, knog, leki, li-ning, night-runner, nite-ize, opove, outdoor-research, rad-roller, raidlight, renpho, road-id, rumbleroller, saxx, shes-birdie, sockwell, sony, stance, strength-shop, the-north-face, the-stick, timtam, zeraus.

Runtime class: `classifyBrandHubHold()` · eligibility reasons `brand_hub_insufficient_depth` / `brand_hub_no_products`.

---

## 5. What changed

1. **Families** — `src/content/brand-hub-p56-families.ts` (catalog product IDs only).
2. **Unique editorial** — `src/content/brand-hub-p56-editorial.ts` (positioning, family diffs, generations, Guide slugs).
3. **Overrides** — `howLinesDiffer` / `generationContext` on `BrandHubConfig`.
4. **Guide maps** — training shoes, padel/tennis racket, home gym.
5. **Uniqueness holds emptied.**
6. **Explicit HOLD classifier** — `src/lib/brand-hub/classify-hold.ts`.

**Not done:** lowering `canPublishBrandHub`; inventing copy for 1–2 SKU brands; un-drafting media-pending products; changing `vertical-strategy.ts`.

---

## 6. Definition of done

- [x] 135 held audited (products, families, reviews, comparisons, Best, Guides, evidence)
- [x] Substantive hubs where catalog depth exists (13)
- [x] 1–2 product brands classified HOLD_INSUFFICIENT_DEPTH — no SEO padding
- [x] Zero-product brands classified HOLD_NO_PRODUCTS
- [x] Every indexable Brand = READY (69/69 pages)
- [x] No uniqueness holds remaining
- [x] Report + `docs/prelaunch/data/56-brand-audit.json`

**Do not treat Brand READY as a site-go authorization.** Vertical indexation for Fitness / Padel / Tennis products is unchanged.
