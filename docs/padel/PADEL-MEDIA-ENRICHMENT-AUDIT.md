# Padel soft-goods media enrichment audit

**Date:** 2026-09-13  
**Scope:** Balls · Bags · Grips · Accessories (soft goods only)  
**Do not confuse with:** market discovery (already COMPLETE) or public catalog completeness.

## 1. Canonical data path (discrepancy resolved)

| Layer | Truth |
| --- | --- |
| Market research evidence | `docs/padel/data/PADEL-EQUIPMENT-MARKET-INVENTORY.csv` (405 rows; CURRENT discovered = 360) |
| Materialization | `scripts/tmp/generate-padel-equipment-market-wave.mjs` → `src/content/padel/soft-goods/market-wave.ts` |
| Hand seeds | `soft-goods/{balls,bags,grips,accessories}.ts` |
| Canonical registry | `toSoftProduct` → `padelSoftGoodsProducts` → **`padelAllProducts`** → `src/content/products.ts` |
| Media gate | `applyMediaPublishGate` + `padelSoftGoodsMediaPendingIds` — no authentic hero ⇒ **draft** |
| Hero registry | `PADEL_SECONDARY_PRODUCT_MEDIA` + `getCatalogProductHeroMedia` |
| Public category | `resolvePublished` + `canFeatureProduct` (published + authentic hero only) |
| Soft-goods scorecard (admin) | `docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json` |
| Stale scorecards (fixed) | `PADEL-CATALOG-SCORECARD.json` / `PADEL-FINAL-CATALOG-SCORECARD.json` were still showing **11/13/10/9** — regenerated from live `padelAllProducts` |

**Where the expanded products live:** they are already real `Product` entities in `padelAllProducts` (mostly via `market-wave.ts`), not CSV-only. The 11/13/10/9 figures were **stale pre-wave scorecards**, not a second catalog.

## 2. Count reconciliation

Source: `docs/padel/data/PADEL-PRODUCT-COUNT-RECONCILIATION.csv`

| Category | Market discovered | Canonical Products | ProductFamilies | Variants-as-Products | Publication ready | Public featured | Draft (media pending) |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Balls | 62 | 62 | 62 (1:1) | 0 | 48 | 48 | 14 |
| Bags | 125 | 124 | 124 (1:1) | 0 | 78 | 78 | 46 |
| Grips | 86 | 85 | 85 (1:1) | 0 | 48 | 48 | 37 |
| Accessories | 87 | 84 | 84 (1:1) | 0 | 44 | 44 | 40 |
| **TOTAL** | **360** | **355** | **355** | **0** | **218** | **218** | **137** |

### Why 360 ≠ 355

- Soft goods use **1 Product = 1 commercial identity** (no separate ProductFamily graph yet; `familyId` unused).
- Pack sizes / colorways are **not** separate Products (collapsed at inventory disposition or modeled as offers).
- A few CURRENT inventory titles **collapse onto the same Product id** (alternate retailer naming) — see multi-row collapse comments in the reconciliation CSV.
- A few seed/orphan Products remain in the registry (previous naming / lifecycle) while market CURRENT rows map onto siblings.

Unexplained count loss: **none**.

## 3. Media coverage status

Source: `docs/padel/data/PADEL-MEDIA-COVERAGE.csv` · Admin: `/admin/catalog/padel-equipment/media`  
Triage: `scripts/tmp/triage-padel-soft-media.mjs` · `data/staging/padel-soft-media-triage.json`

| Category | Verified | Candidate | Missing | Blocked | Coverage % (verified/canonical) |
| --- | ---: | ---: | ---: | ---: | ---: |
| Balls | 51 | 0 | 9 | 2 | 82% |
| Bags | 83 | 0 | 41 | 0 | 67% |
| Grips | 50 | 0 | 35 | 0 | 59% |
| Accessories | 46 | 0 | 38 | 0 | 55% |
| **TOTAL** | **230** | **0** | **123** | **2** | **65%** |

**MEDIA_COVERAGE = INCOMPLETE** (candidates cleared; missing remain).

### Triage pass (2026-09-13)

1. **106 MEDIA_CANDIDATE** — decisive approve/reject (no open candidate queue left).
   - **Approved after visual identity check:** Alacrán Wide wristband, Bullpadel Hack/Vertex/XPLO bags, Kuikma PL 900 Elite, Drop Shot Tournament Tech balls, Hesacore Pink/W, TuboPlus R3PLAY, Varlion Summum Pro W/S balls + Summum Pro bag, Yonex Super Grap.
   - **Rejected:** logos/collection OG/blog covers, shared-hero byte collisions, PadeLMQ wrong-SKU search hits.
   - **Revoked after visual gate:** wrong-product downloads (e.g. Nox racket for bag-10, HEAD Extreme Motion for Tour Team Elite bag, Adidas Speed RX for ShockOut protector, Bullpadel MDN for Babolat kids backpack, Slazenger apparel for Challenge No.1 balls, Oxdog racket for No1 accessory).
2. **Former 29 MISSING** — manufacturer PDP pulls closed Varlion Summum Pro W/S + Summum Pro bag + Yonex Super Grap; TuboPlus R3PLAY verified. Remaining TuboPlus variants, ShockOut Dual Pro/Perforated, Tourna Tac XL, 4ON TotalDry/Premium Comfort still blocked by shared-hero / no distinct PDP packshot.
3. **2 MEDIA_BLOCKED** — discontinued lifecycle seeds (unchanged).
4. Specs / commerce / editorial — still out of this media pass.

## 4. Identity / modeling notes this pass

| Finding | Action |
| --- | --- |
| Stale 11/13/10/9 scorecards | Regenerated from live catalog |
| Inventory ↔ Product linkage | Stamped `kitletics_product_id` on matched inventory rows |
| Shared-hero collisions (e.g. Next vs Next Pro, Pro Series bag vs backpack) | Kept MISSING / not registered — identity protected |
| Logo/collection OG images (Nox, Sane, RS) | Rejected in triage — MEDIA_MISSING with REJECTED note |
| Lifecycle discontinued seeds | MEDIA_BLOCKED (2) |
| Wrong-product auto-downloads | Visual gate revoked registry + files |

Variants collapsed / pack modeling: already enforced at discovery dispositions; no new pack-as-product inflation this pass.

## 5. Manual canaries (spot-check)

Verified visually/path-checked sample heroes under `public/images/padel/{balls,bags,grips,accessories}/` for:

- Balls: Kuikma PB Club, Black Crown One/Pro, Nox Nerbo/Pro Titanium, Osaka Pro Tour, Volt Premium, Sane Core, 4ON Pro T1, Drop Shot Tournament Tech, Varlion Summum Pro W/S
- Bags: HEAD Coello Tour / Tour 25L BP, Nox Luxury Master/Open, Oxdog Cube/Hyper, Lok Maxx/Aventure, Osaka Sports bag/BP, Bullpadel Hack/Vertex/XPLO, Kuikma PL 900 Elite, Varlion Summum Pro
- Grips: Hesacore Pink/W, Yonex Super Grap (Dual Pro/Tac XL/4ON TotalDry still MISSING — shared-hero)
- Accessories: Bounce FilterTech, Adidas pouch/shoe bag, Vibora protector, 4ON TotalGrip Paste, HEAD X3 Pump, Alacrán Wide, TuboPlus R3PLAY

Candidate queue is empty after triage — remaining gaps are **MEDIA_MISSING** only.

## 6. Remaining blockers (exact)

1. **0 MEDIA_CANDIDATE** — candidate queue cleared (approve / reject / revoke complete).
2. **123 MEDIA_MISSING** — no safe distinct registered hero (includes rejected logos/shared-hero/wrong-search hits plus hard families: remaining TuboPlus SKUs, Varlion Ambassador, ShockOut Dual Pro/Perforated, Tourna Tac XL, 4ON TotalDry/Premium Comfort, Softee/Ball Rescuer pressurizers, etc.).
3. **2 MEDIA_BLOCKED** — non-current lifecycle seeds.
4. **Commerce / specs / editorial** — out of scope for this media pass.
5. **MEDIA_COVERAGE incomplete** — do not claim public soft-goods catalog complete.

## 7. Next actions (ordered)

1. Manufacturer CDN / official PDP packshots only for remaining MISSING (avoid PadeLMQ suggest when title tokens collide).
2. Spec/evidence enrichment pass (separate).
3. Commerce offer acquisition (separate).
4. Editorial / Best Guides expansion against the larger catalog.
5. Final rendered forensic audit.

## Artifacts

- `docs/padel/data/PADEL-PRODUCT-COUNT-RECONCILIATION.csv`
- `docs/padel/data/PADEL-MEDIA-COVERAGE.csv`
- `docs/padel/data/PADEL-MEDIA-BLOCKED.csv`
- `docs/padel/data/PADEL-EQUIPMENT-CATALOG-SCORECARD.json`
- `docs/padel/data/PADEL-CATALOG-SCORECARD.json` (soft totals refreshed)
- `docs/padel/data/PADEL-FINAL-CATALOG-SCORECARD.json` (soft totals refreshed)
- Admin: `/admin/catalog/padel-equipment` · `/admin/catalog/padel-equipment/media`
