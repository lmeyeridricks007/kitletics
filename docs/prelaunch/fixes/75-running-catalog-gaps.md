# Fix 75 — Complete final Running catalog gaps

**Date:** 2026-09-10  
**Target:** Running `CATALOG_GAP` = **0**, or explicit `MEDIA_GATED` with product + evidence reason.  
**Do not publish.** No AI-generated branded product images. Trail 10 media gate not bypassed. Best rankings not padded.

---

## 1. Result

| Metric | Before | After |
|---|---|---|
| Running `CATALOG_GAP` | 3 (`amazfit`, `samsung`, `decathlon`) | **0** |
| Amazfit hub | HOLD_INSUFFICIENT_DEPTH (2 GPS) | **READY** (4 GPS, 4 families) |
| Samsung hub | HOLD_INSUFFICIENT_DEPTH (1 GPS) | **READY** (3 GPS, 1 family, 3 strength signals) |
| Decathlon hub | HOLD_INSUFFICIENT_DEPTH (1 belt) | **READY** (3 products, 2 categories) |
| `prod-kiprun-trail-10` | MEDIA_GATED | **MEDIA_GATED** (unchanged) |

Live `classifyBrandHubHold` (`isDev: false`): amazfit **READY** · samsung **READY** · decathlon **READY**.

---

## 2. Market discovery (2026, no whitelist)

Manufacturer / retailer pages, not a fixed SKU list.

### Amazfit (Running GPS)

**Onboarded**

| Product | Job | Why current |
|---|---|---|
| **Balance 3** | Hybrid training + maps | Current Balance aisle. 1.5" sapphire AMOLED, dual-band 6-system GNSS, 64GB contour maps, HybridCharge, HYROX modes, 10 ATM. Titanium Black **55 g** without strap (stainless 62 g variant). Typical **21 days**; Accuracy GPS **41 h**. US **$369.99**. |
| **Cheetah 2 Pro** | Dedicated runner | Grade 5 titanium, **45.6 g** without strap, 1.32" 3000-nit AMOLED, dual-band GNSS, 32GB maps, Zepp Coach 5K–marathon, gait / running power / lactate threshold, **5 ATM**. Typical **20 days**; Accurate GPS **31 h**. US **$449.99**. |

**Kept** (already catalogued): T-Rex 3 Pro (rugged), Active 2 (entry).

**Excluded**

- Bip — lifestyle / not Running GPS discovery
- T-Rex 3 non-Pro — overlap with T-Rex 3 Pro
- T-Rex Ultra 2, Balance Ultra — not the current distinct job vs 3 Pro / Balance 3
- Balance 2 — superseded by Balance 3; do not ingest both
- Duplicate regional SKUs

### Samsung (Running GPS)

Evaluated GPS, running metrics, battery, training, navigation, ecosystem, wearability. Not every Galaxy Watch.

**Onboarded**

| Product | Job | Why current |
|---|---|---|
| **Galaxy Watch Ultra2** | Adventure Wear OS ultra | July 2026 Unpacked. 47 mm, **61.5 g**, 1.52" Super AMOLED to **5000 nits**, Snapdragon Wear Elite, **800 mAh**, IP69K + **10 ATM**, L1+L5, 64GB, Running Coach. US **$699.99**. Dedicated **GPS hours unpublished** → `batteryGps: null`. |
| **Galaxy Watch9** (40 mm primary) | Compact daily Wear OS | **31.5 g**, 1.3", **390 mAh**, up to **40 h AOD off / 30 h AOD on**, dual GPS, NFC. Variant: 44 mm **34 g** / 445 mAh. US BT **$379.99**. `batteryGps: null`. |

**Kept:** Galaxy Watch Ultra 2025 (still sold).

**Excluded**

- Watch8 — discontinued 2026-07-22
- Watch FE — lifestyle/budget, not Running GPS discovery
- Classic / LTE as separate products (regional SKU duplicates)

### Decathlon / Kiprun (Running carry)

**Onboarded**

| Product | Job | Why current |
|---|---|---|
| **Kiprun 900 Race 5L** | 5L flask race vest | Current race vest. **190 g**, 5L, 10 pockets, 2×500 ml sleeves (**flasks not included**), 3 chest clips, 2XS–XL. ~€40 class. |
| **Kiprun Proteam 10** | 10L flask race vest | Current 10L aisle (replaces Trail 10 *job*). **170 g (M)**, 14 pockets, 2–3×500 ml sleeves (**flasks not included**), quiver compatible, **no bladder**. Decathlon IE **€110**. |

**Kept:** Kiprun Running Belt (published).

**Excluded**

- Kiprun footwear / Core / Endurance dump
- Flask accessories as standalone unless needed
- 15L unless needed for the 10L job
- Lifestyle Decathlon SKUs
- Duplicate regional SKUs
- **Trail 10 as published** — older naming; not on current NL search; **no licensed hero**

---

## 3. Media

Authentic manufacturer / Decathlon packshots only. Product-only. No AI branded images.

| Product | Hero | Licence | Gate |
|---|---|---|---|
| Balance 3 | `public/images/watches/products/amazfit-balance-3-hero.jpg` (1600²) | Amazfit Shopify | published |
| Cheetah 2 Pro | `…/amazfit-cheetah-2-pro-hero.jpg` (1600²) | Amazfit Shopify (clean packshot, not construction composite) | published |
| Galaxy Watch Ultra2 | `…/samsung-galaxy-watch-ultra-2-hero.jpg` (720²) | Samsung p6pim | published |
| Galaxy Watch9 | `…/samsung-galaxy-watch-9-hero.jpg` (720²) | Samsung p6pim | published |
| 900 Race 5L | `public/images/packs/products/kiprun-900-race-5-hero.jpg` (2500²) | Decathlon CDN | published |
| Proteam 10 | `…/kiprun-proteam-10-hero.jpg` (2500²) | Decathlon CDN | published |
| **Trail 10** | **none registered** | — | **MEDIA_GATED** |

**MEDIA_GATED (explicit):** `prod-kiprun-trail-10`  
**Reason:** no licensed authentic hero for that SKU. `MEDIA_PENDING_DRAFT_IDS` still includes it. `applyMediaPublishGate` keeps it `draft` until a registered hero exists. Current vest aisle is 900 Race 5L + Proteam 10. Do not ungate with placeholders or AI.

Section images generated from those heroes (`npm run reviews:section-images`): unique product-only Sharp variants; no hero stamp across sections.

---

## 4. Onboarded products (production standard)

| ID | Slug | Family | Review |
|---|---|---|---|
| `prod-amazfit-balance-3` | `amazfit-balance-3` | `fam-amazfit-balance` | Expert Research |
| `prod-amazfit-cheetah-2-pro` | `amazfit-cheetah-2-pro` | `fam-amazfit-cheetah` | Expert Research |
| `prod-samsung-galaxy-watch-ultra-2` | `samsung-galaxy-watch-ultra-2` | `fam-galaxy-watch` | Expert Research |
| `prod-samsung-galaxy-watch-9` | `samsung-galaxy-watch-9` | `fam-galaxy-watch` | Expert Research |
| `prod-kiprun-900-race-5` | `kiprun-900-race-5` | `fam-kiprun-900-race` | Expert Research |
| `prod-kiprun-proteam-10` | `kiprun-proteam-10` | `fam-kiprun-proteam` | Expert Research |

Identity, generation, specs (unpublished GPS hours stay `null`), description, Best For / Not Ideal via reviews, pros/trade-offs, evidence (`ev-catalog-mfr`, `ev-catalog-editorial`), variants noted in copy (Balance stainless vs titanium; Watch9 44 mm), NL seed offers, relationships. **No demo records. No first-hand claims.**

---

## 5. Reviews created

| Review slug | Type |
|---|---|
| `amazfit-balance-3` | Expert Research |
| `amazfit-cheetah-2-pro` | Expert Research |
| `samsung-galaxy-watch-ultra-2` | Expert Research |
| `samsung-galaxy-watch-9` | Expert Research |
| `kiprun-900-race-5` | Expert Research |
| `kiprun-proteam-10` | Expert Research |

Unique copy vs Active 2 / T-Rex 3 Pro / Ultra 2025 / Trail 10. Unique Alternatives intros in `alternatives-p57-uniqueness.ts`. Unique brand-hub editorial in `brand-hub-p56-editorial.ts`.

---

## 6. Relationships

Competitor / generation edges (Fix 75 block in `src/content/running/relationships.ts`):

- Balance 3 ↔ Vivoactive 6, Forerunner 570
- Cheetah 2 Pro ↔ Pace 4, Forerunner 570, Balance 3
- Ultra2 → Ultra 2025 (previous-generation); Ultra2 ↔ Apple Watch Ultra 3, Fenix 8
- Watch9 ↔ Forerunner 165, Vivoactive 6
- 900 Race 5L ↔ ADV Skin 5, Spry 5
- Proteam 10 ↔ Circuit, Spry 5, 900 Race 5L

Plus product `relatedProductIds` / `alternativeProductIds`, watch + hydration recs, and alternative relationship rows with switch/stay language.

---

## 7. Editorial integration

| Surface | Action |
|---|---|
| **Best Guides** | **No ranking inserts.** New SKUs do not automatically enter Best lists. |
| Guides / Finder | Finder includes published GPS / pack SKUs by catalog; no new Best recs. |
| Alternatives | Unique intros; recs + alt edges. Not padded into Best. |
| Brand hubs | Unique Amazfit / Samsung / Decathlon hub copy. **READY.** |
| Comparisons | No new comparison pages forced; peers exist via relationships. |

---

## 8. Brand readiness before / after

| Brand | Before (published) | After (published) | Hold |
|---|---|---|---|
| Amazfit | 2 GPS (T-Rex 3 Pro, Active 2) | 4 GPS + 4 families + strengths | **READY** |
| Samsung | 1 GPS (Ultra 2025) | 3 GPS (Ultra 2025, Ultra2, Watch9) | **READY** |
| Decathlon | 1 belt | Belt + 900 Race 5L + Proteam 10 (2 categories) | **READY** |

Trail 10 remains **draft** and does **not** count toward the hub gate.

---

## 9. Offers

NL seed (`source: "seed"`), not invented street scrapes:

| Product | Seed EUR | Retailer / URL |
|---|---:|---|
| Balance 3 | 369 | Amazfit Balance 3 PDP |
| Cheetah 2 Pro | 449 | Amazfit Cheetah 2 Pro PDP |
| Ultra2 | 699 | Samsung |
| Watch9 | 379 | Samsung |
| 900 Race 5L | 40 | `ret-decathlon` / Kiprun PDP |
| Proteam 10 | 110 | Decathlon IE Proteam 10 |

---

## 10. Verification

- `npx tsc --noEmit` — pass
- `tests/content-unique-ids.test.ts` (+ uniqueness / alt-hold tests) — pass
- `classifyBrandHubHold` amazfit / samsung / decathlon — **READY**
- Trail 10 `isDev: true` → `draft`; production brand count excludes it
- Section images generated from authentic heroes; failed: 0

---

## 11. What we did not do

- Did not onboard Bip / Watch FE / Watch8 / Kiprun shoes / Trail 10 as published
- Did not invent Samsung GPS hours
- Did not generate AI branded product photos
- Did not insert new products into Best rankings
- Did not publish the site
