# Catalog image review — 2026-09-05

Findings from the **Catalog Media Agent** (`npm run media:agent -- --mode=audit --write --identity`) plus a follow-on scan of drafts, shared hashes, registry health, and review section-image coverage.

**Raw agent output:** [`data/staging/catalog-media-audit-2026-09-05.md`](../data/staging/catalog-media-audit-2026-09-05.md) · JSON sibling  
**Opportunity scan:** [`data/staging/catalog-media-opportunities-2026-09-05.json`](../data/staging/catalog-media-opportunities-2026-09-05.json)

---

## Executive summary

| Metric | Result |
| --- | ---: |
| Published products | 412 |
| Authentic primary hero (agent) | 409 (**99%**) |
| Missing / placeholder-only (agent P0) | **0** |
| Broken files on disk | **0** |
| Identity issues (wrong-product + shared-hero) | **3** (OCR false-positive suspects only; **0 shared-hero**) |
| Registry file orphans | **0** |
| Published reviews missing section-image sets | **0** |
| Draft products still awaiting heroes | **300** |

**Bottom line:** Live catalog heroes are in strong shape (no blank/placeholder P0s; **shared-hero duplicates cleared**). Remaining identity rows are OCR truncation suspects (Bowflex / SoftFlask; Enduro confirmed OK). Large **draft backlog** (clothing, nutrition, sunglasses, etc.) still blocks re-publishing those best guides.

---

## 1. What’s healthy

- **Shoes / watches / HRMs / padel / tennis / most fitness:** 100% authentic primary coverage.
- **No broken registry paths** — every registered `src` exists on disk with a usable file size.
- **Review section images:** all **412** published reviews have a usable `public/images/<sport>/products/<slug>/sections/` set (≥4 files).
- **Hub strips:** published + authentic gate is working; short strips now come from identity/logo problems or still-drafted categories, not wholesale missing heroes.

---

## 2. Issues found (action list)

### A. Shared heroes (duplicate bytes) — **FIXED 2026-09-05**

| Products | Fix |
| --- | --- |
| Nathan Mirage Pak + Streak Reflective Vest | Replaced logo placeholders with distinct manufacturer/authorized packshots (Mirage belt from Nathan Sports CDN; Streak vest from authorized retailer CDN) |
| TYR CXT-1 + CXT-1 Trainer | Kept Black/Gum on `tyr-cxt-1`; fetched Neon/Black Rogue packshot for `tyr-cxt1-trainer`. Removed the copy-bytes path in `scripts/fetch-training-shoes-media.mjs` |

Identity audit after fix: **0 shared-hero rows**. Section images regenerated for all four SKUs.

### B. Wrong-product flags (OCR) — **cleared (false positives)**

Visual confirm + raw OCR: all three heroes are the correct SKU. No re-download.

| Slug | OCR said | Verdict |
| --- | --- | --- |
| `bowflex-selecttech-1090` | `SELECTTECH 10` | **Keep** — base label reads SelectTech **1090**; dial shows 55–80 lb range. OCR also had `SelectTech1090`; matcher was truncating gens to 1–2 digits |
| `garmin-enduro-3` | `ENDURO 32` | **Keep** — face shows ENDURO; OCR glued weather **32°** onto the model name |
| `hydrapak-softflask-250` | `SOFTFLASK 25` | **Keep** — print reads **250 ml / 8.5 fl oz**; truncation false positive |

**Matcher fix:** `ocrGenerationMismatch` in `scripts/lib/hero-identity.ts` now accepts full expected gen when present, treats truncated prefixes (10⊂1090, 25⊂250) as OK when the full token exists, and ignores short-gen + glued UI digits (Enduro 3 + 32°).

### C. Logo / non-product heroes — **gate tightened**

`isAuthenticProductMedia` now rejects brand logos / wordmarks **before** identity scan:

1. **Metadata gate** (`src/lib/product/logo-media.ts`) — `type: logo|icon`, `/brands/` or `-logo` paths, wordmark/logo attribution, extreme UI canvases (e.g. 200×48).
2. **Src denylist** (`src/content/logo-hero-src-denylist.ts`) — audit-confirmed logo stubs; hub cards never promote these.
3. **Audit classifier** (`scripts/lib/logo-hero-detect.ts`) — known CDN stub SHA prefixes (Mirafit), tiny extreme-aspect files, near-duplicate of the product’s own brand logo. Reason: `logo-placeholder`. `--write` merges hits into the denylist.

Nathan Mirage / Streak logos were already replaced with packshots; this prevents the same class of failure from counting as “authentic” again.

---

## 3. Missing images (draft backlog) — **wave complete**

**Before:** 301 drafts / 412 published (0 drafts with registry).  
**After this wave:** **622 published** (all with authentic on-disk heroes) / **91 drafts** still without packshots (~210 net promoted after demoting 8 broken/blank registry rows).

### What we did
1. **Re-registered 171 on-disk heroes** that prior fetch waves downloaded but never wrote into `catalog-product-media.ts` (`scripts/register-draft-disk-heroes.mjs`).
2. **Fetched more** via clothing / accessory / nutrition / niche scripts (`fetch-clothing-draft-remaining.mjs`, accessory + hydration + sunglasses/nutrition passes, `batch-fetch-draft-shoes-niche-media.mjs`).
3. **Unified racket/padel shoe gates** on `hasRegisteredProductHero` so media-ready court shoes publish automatically.
4. **Published media-blocked best guides** once picks were ready: jackets, rain jackets, tights, winter gear, sunglasses, race fuel.

### Remaining drafts (no authentic hero yet)

| Category | Draft SKUs |
| --- | ---: |
| Recovery | 16 |
| Running clothing | 16 |
| Safety | 8 |
| Packs & vests | 7 |
| Running lights | 7 |
| Headphones | 6 |
| Accessories | 5 |
| Squash rackets | 5 |
| Running socks | 4 |
| Padel shoes | 4 |
| Pickleball paddles | 3 |
| Tennis shoes | 3 |
| Hydration | 2 |
| Nutrition & fuel | 2 |
| Other | 3 |

Most leftovers are **discontinued SKUs**, **CDN-blocked brand sites** (Lululemon, some Nike/Sony/Jabra/lights), or **unreachable specialty warehouses**. Keep them draft via media gates until a verified packshot exists — do not substitute wrong-generation photos.

Snapshot: `data/staging/draft-backlog-final-2026-09-06.json`.

---

## 4. Duplicate / near-duplicate opportunities — **resolved**

### 1. TYR CXT-1 vs CXT-1 Trainer — **keep distinct**

Not a merge. Retail colorways of the **same CXT-1 platform** with **unique hero bytes**:

| ID | Packshot | Hash |
| --- | --- | --- |
| `prod-tyr-cxt-1` | Black/Gum | `216dff05…` |
| `prod-tyr-cxt1-trainer` | Neon/Black | `c66e839c…` |

Decision: keep both SKUs (reviews, offers, comparisons already wired). Linked via `familyId: fam-tyr-cxt-1`. Fetch script must never copy CXT-1 bytes onto Trainer (`scripts/fetch-training-shoes-media.mjs` + post-download hash check).

### 2. RunRepeat / CDN re-hosts — **hardened**

Shared helper `scripts/lib/hero-download.mjs`:

- `preferManufacturerRemotes()` — manufacturer / brand CDNs before RunRepeat-style re-hosts
- `assertUniqueHeroBytes()` — reject download if sha256 matches another on-disk `*-hero.*` (Nathan shared-hero class of bug)

Wired into `fetch-training-shoes-media.mjs` and `batch-fetch-fitness-hero-media.mjs`. Audit-time shared-hash scan in `hero-identity.ts` remains the safety net (`media:agent --identity`).

### 3. Section images — **no action**

Generated section variants are unique per topic by construction; no fleet duplicate-section problem.

---

## 5. Opportunities (prioritized)

### P0 — trust / wrong visual (this week)

1. ~~Replace Nathan Mirage + Streak Reflective Vest logos~~ **Done**  
2. ~~Split TYR CXT-1 vs CXT-1 Trainer heroes~~ **Done** (distinct colorways)  
3. ~~Visually QA Bowflex 1090 and SoftFlask 250; Enduro 3 already confirmed OK (OCR false positive).~~ **Done** — all keep; matcher fixed

### P1 — unlock hub / best guides

4. ~~Fetch heroes for **draft clothing** (shorts/jackets/tights already on best lists).~~ **Done for guide unlock** — jackets list now 5/5 media-ready (Nike Impossibly Light added). Remaining clothing drafts (~15) are CDN-blocked / discontinued (Lululemon, TNF Flight Series, Brooks LSD vest, etc.) and stay gated.  
5. ~~Fetch heroes for **nutrition / race fuel** and **sunglasses**.~~ **Done** — sunglasses 0 drafts; nutrition drafts cleared (SaltStick Caps + FastChews re-registered).  
6. ~~Re-publish those best guides once ≥4–6 SKUs are media-ready.~~ **Done** — all target guides `published`:

| Guide | Status | Recs with pub+media |
| --- | --- | ---: |
| running-shorts | published | 5/6 |
| running-jackets | published | 5/5 |
| running-rain-jackets | published | 3/4 |
| running-tights | published | 4/5 |
| running-gear-winter | published | 5/6 |
| running-sunglasses | published | 10/10 |
| running-race-fuel | published | 11/11 |

`normalizeBestGuide` backfills any still-draft picks from published category peers.

### P2 — system hardening

7. ~~Reject logo-only heroes in `isAuthenticProductMedia` (or add a logo classifier).~~ **Done**  
8. ~~Make shared-hash check part of CI for published products (`media:agent --fail` on identity).~~ **Done** — `npm run media:ci` (`--mode=audit --identity --fail`). Shared-hash runs on every audit unless `--no-identity`.  
9. ~~Extend identity OCR beyond shoes where model text is OCR-able (watches, dumbbells).~~ **Done** — default OCR categories: `running-shoes`, `training-shoes`, `gps-watches`, `hrm`, `adjustable-dumbbells`; `--identity` OCRs all filtered products.  
10. ~~Keep `npm run reviews:section-images` in the publish path for newly promoted SKUs.~~ **Done** — wired into review backfill + fitness publish; `npm run reviews:publish-path` after media promotes.

---

## 6. Coverage by category (agent)

Latest published catalog (**with identity**): **623/623 authentic** primary heroes (`npm run media:ci` 2026-09-06). Identity mismatches: **0**. Drafts stay gated until packshots exist.

Previously demoted categories are all clear:

| Category | OK / published | Coverage |
| --- | ---: | ---: |
| Safety Gear | 6 / 6 | 100% (Nathan Streak vest packshot) |
| Hydration | 17 / 17 | 100% (SoftFlask OCR matcher fixed) |
| Adjustable Dumbbells | 8 / 8 | 100% (Bowflex OCR matcher fixed) |
| Running Belts | 14 / 14 | 100% (Nathan Mirage distinct packshot) |
| Training Shoes | 44 / 44 | 100% (TYR CXT-1 / Trainer unique hashes) |
| GPS Watches | 33 / 33 | 100% (Enduro OCR glued-digit guard) |
| Nutrition & Fuel | 38 / 38 | 100% (GU chews + Neversecond C30 distinct) |
| Padel Rackets / Shoes | 27+34 | 100% (Diablo Pro naming + women Swift distinct) |
| Tennis Strings | 6 / 6 | 100% (gauge OCR false-positive fixed) |
| Everything else listed | — | 100% |

Full table: [`data/staging/catalog-media-audit-2026-09-06.md`](../data/staging/catalog-media-audit-2026-09-06.md).

---

## 7. Commands to re-check

```bash
# Full published catalog + OCR / shared-hash identity
npm run media:agent -- --mode=audit --write --identity

# Fail CI when gaps or identity mismatches remain
npm run media:ci

# Vertical deep-dives (OCR on by default for shoes / watches / dumbbells)
npm run media:agent -- --mode=audit --category=gps-watches --write
npm run media:agent -- --mode=audit --category=adjustable-dumbbells --write
npm run media:qa
npm run racket:media-qa

# After media promotes draft→published SKUs
npm run reviews:publish-path
```

**Definition of done for this review wave:** identity mismatches → 0, Nathan logos gone, TYR pair unique, ~~draft clothing/fuel/sunglasses wave started~~ **best guides for jackets/fuel/sunglasses published**; P2 system hardening (#7–#10) complete; **category coverage with identity → 100% (623/623)**.
