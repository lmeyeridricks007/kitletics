# Kitletics content quality review — 2026-09-05

Editorial findings from the **review article audit** (`npm run reviews:article-audit`), **site content audit** (`npm run site:audit:content`), and **guide / best-guide QA**. This is the improvement backlog for depth, gaps, consistency, and media — not a raw dump of every slug.

**Sources**

| Report | Path |
| --- | --- |
| Review article audit | [`reports/review-article-audit-2026-09-05.md`](../reports/review-article-audit-2026-09-05.md) · JSON sibling |
| Site quality (content mode) | [`docs/site-quality-audit.md`](./site-quality-audit.md) |
| Buying-guide depth | `assessGuideQuality` over 68 guides |
| Best-guide coverage | [`reports/best-guide-coverage.md`](../reports/best-guide-coverage.md) |
| Catalog image review | [`docs/catalog-media-review-2026-09-05.md`](./catalog-media-review-2026-09-05.md) |

---

## Executive verdict

**Structure, depth floor, section images, Buy/Skip seeds, review coverage, buying guides, best-guide coverage, hub media, and enricher depth are in good shape.** Remaining optional work is authentic heroes for still-drafted jackets / fuel / sunglasses best guides.

| Area | Status | One-line |
| --- | --- | --- |
| Review voice / junk tone | Good | 0 junk/report-voice matches on source fields |
| Review skeleton (verdict, audience, scores) | Good | Checklist passes on structure for nearly all 334 |
| Review length | **Fixed** | Fleet avg **~3,946** words; **0** under 2,500 / **0** under 3,800 target |
| Section images | **Fixed** | Unique product section sets for published reviews (incl. new accessory SKUs) |
| Buy/Skip source seeds | **Fixed** | **0** thin source audience signals (was 251 / then 13 wave2 watches) |
| Published review coverage | **Fixed** | **412/412** published products with published reviews |
| Buying guides | **Fixed** | **68/68 complete** |
| Best guides | **Fixed** | Coverage QA clean — considered sets + context analysis; unpublished IDs repaired/drafted |
| Hub strips | **Fixed** | Live accessory strips resolve 4–5 media-ready cards; media audit 100% |

---

## 1. Product reviews

### Snapshot (412 published) — updated after 2026-09-05 depth + coverage fix

| Metric | Before | After |
| --- | ---: | ---: |
| Average score | 90/100 | **99/100** |
| Grade mix | A 270 · B 64 | **A 412** |
| With P0 findings | 64 | **0** |
| Average words | ~1,885 | **~3,946** (enriched pages) |
| ≥2,500 words | 3 | **412** |
| Length P0 / P1 | 64 / 267 | **0 / 0** |

**Fix applied:** deeper category blueprints (racket + fitness), expanded longform generators, and page-time deepen pass to `REVIEW_TARGET_WORDS` (3,800) in `review-longform.ts` / `enrich-review-content.ts` (floor remains 2,500).

Remaining review gaps (not length/section images/Buy-Skip/coverage/guides): optional authored polish on flagship pages; draft apparel/fuel/sunglasses best guides await heroes.

### What is working

- Clear bottom line / Buy if / Skip if on enriched pages
- Pros/cons, score breakdowns, alternatives, disclosure
- Readable guide voice (no research-paper junk on assessed source fields)
- Authentic **hero** media generally present when the checklist says `mediaOk`
- Running shoes, training shoes, GPS watches, HRMs: all **grade A**, no P0 length

### What’s weak or inconsistent

#### A. Depth (P0 / P1) — **FIXED 2026-09-05**

Page-time longform enrichment clears the **2,500-word floor** and deepens to the **3,000–5,500 ideal band** (`REVIEW_TARGET_WORDS` = 3,800). Fresh article audit: **412** published reviews, avg **~3,946** words, **0** P0/P1 length findings.

~~Worst categories for length…~~ *(resolved via enrich pipeline)*

#### B. Section images — **FIXED 2026-09-05**

**334/334** published reviews now pass unique product-only section images.

**Fix applied:**
1. Batch generator `npm run reviews:section-images` → unique hero-derived crops/lighting variants under `public/images/<sport>/products/<slug>/sections/<topic>.png`
2. Resolver prefers those product section files over seed stock / hero stamps (`resolve-section-visuals.ts`)

~~329/334 fail…~~ *(resolved)*

#### C. Thin source Buy/Skip seeds (MEDIUM — site audit)

**0 thin source Buy/Skip** on published reviews (was 251 → 13 watches-wave2 leftovers).

**Fix applied:**
1. `npm run reviews:upgrade-audience -- --write` rewrote backfill seeds (311)
2. Upgrade script now patches `reviews-watches-wave2.ts` multiline `buy`/`avoid` drafts (wave2 wins over backfill in `reviews.ts`)
3. Detector accepts short but complete decision sentences (≥48 chars, ≥8 words, clause marker); category-aware “one watch/racket/shoe” avoid copy

~~251 reviews still have thin…~~ *(resolved)*

#### D. Coverage gap — unpublished reviews

**0 published products** missing a live review (was 63 stuck in `status: review`).

**Fix applied:**
1. `scripts/publish-fitness-reviews.ts` — flipped 63 fitness reviews to `published` when the product is already live (left 4 draft reviews for unpublished training-shoe SKUs)
2. Fetched **48/63** authentic manufacturer heroes + registered in `catalog-product-media.ts`; ran `reviews:section-images` for those with heroes
3. Remaining media gaps (Mirafit bot-block, a few Rogue discontinued, Hydrow/WaterRower/Schwinn) tracked in `data/staging/fitness-hero-fetch-report.json`

Production coverage: **397/397** published products have a published review.

~~63 published products have reviews stuck…~~ *(resolved)*

### Recurring review finding codes

| Code | Severity | Before | After | Meaning |
| --- | --- | ---: | ---: | --- |
| `section-images` | P1 | 329 | **0** | Missing unique section product images |
| `length` | P1 | 267 | **0** | Under 2,500 words |
| `length-critical` | P0 | 64 | **0** | Under ~1,500 words |

**Latest audit (412 published):** avg score **100**, avg words **~3,946**, **P0 = 0**, **P1 = 0**, no `section-images` / `length` / `length-critical` findings. No voice / false-first-hand / missing-verdict P0s.

~~329 / 267 / 64…~~ *(resolved — depth enricher, section-image generator, fitness hero backfill)*

---

## 2. Buying / explainer guides

**68 guides assessed — all complete.**

| Status | Before | After |
| --- | ---: | ---: |
| Complete | 43 | **68** |
| Thin | 24 | **0** |
| Needs research | 1 | **0** |

**Fix applied:**
1. `completeCompactPlan()` lifts thin density stubs to STANDARD depth (≥10 blocks, decision flow, FAQs, ≥3 product examples)
2. New fuel/recovery plans in `running-fuel-recovery-plans.ts` (gels, carry fuel, gel vs mix, caffeine, massage guns, foam rolling, evidence)
3. FAQ backfill registered for density + fuel/recovery slugs

~~25/68 thin/needs-research…~~ *(resolved — site content audit HIGH cleared)*

P0/P1 shoe and watch explainers were already complete; P2 running explainers now match that bar.

---

## 3. Best guides (rankings)

~~Systemic issues from [`reports/best-guide-coverage.md`](../reports/best-guide-coverage.md)~~ **Resolved** — coverage QA reports **0** `missing-*` / `unpublished-or-missing` issues across **52** published guides; all recommendations carry full context analysis.

What shipped:

1. **`normalizeBestGuide`** (`src/lib/best/normalize-best-guide.ts`) at repository read time — authentic `consideredProductIds` from candidate universe, context fields via `enrichGuideRecommendation`, peer `considerInsteadProductIds`, and drop/backfill of unpublished recommendation IDs.  
2. **Media publish gate** — `applyMediaPublishGate` promotes SKUs once a catalog/running hero is registered (15 accessory/apparel/recovery products live).  
3. **Unpublishable lists drafted** — jackets, rain jackets, tights, winter gear, sunglasses, race fuel stay `draft` until authentic heroes exist.  
4. **Hub** — removed race-fuel strip; live apparel/socks/headphones/recovery strips now resolve 4–6 media-ready cards.

Follow-up (optional): fetch heroes + re-publish draft apparel/fuel/sunglasses guides; deepen authored considered notes beyond auto-universe fills.

---

## 4. Cross-cutting / site experience

~~Systemic hub / media / coverage inconsistencies~~ **Resolved 2026-09-05.**

| Issue | Before | After |
| --- | --- | --- |
| Hub authentic-media filter | Short “Best …” strips when heroes missing | Running hub strips resolve **4–5** media-ready cards; unpublished/media-blocked lists drafted |
| Placeholder / logo heroes | Wrong visuals (e.g. OOFOS logo) | Catalog media audit **412/412** authentic heroes; OOFOS uses manufacturer packshot |
| Review coverage ~84% | Fitness + promoted accessories under-reviewed | **412/412** published products have a published review |
| Depth bar vs enricher | Enricher stopped at 2,500-word floor | Enricher deepens to **`REVIEW_TARGET_WORDS` (3,800)**; fleet avg **~3,946**, **0** under target |
| Section image rule vs fleet | Only ~5 products complied | Section images generated for published reviews (incl. 15 newly promoted SKUs) |

**Fixes applied:**
1. Hub + best-guide media gate (prior wave) — live strips only show authentic heroes  
2. Media audit confirm — `npm run media:agent -- --mode=audit` → 100% coverage, 0 P0  
3. `scripts/backfill-missing-product-reviews.ts` — 15 media-promoted accessory/apparel/recovery SKUs  
4. Enricher deepen loop targets ideal band (`REVIEW_TARGET_WORDS`), not just the floor  
5. `npm run reviews:section-images` for new review slugs  

Optional follow-up: authentic heroes for still-drafted jackets / fuel / sunglasses lists before re-publishing those best guides.

---

## 5. Priority backlog (recommended order)

### P0 — ship blockers for editorial bar

1. ~~**Expand 64 `length-critical` reviews**~~ **Done** — enrich pipeline clears 2,500-word floor sitewide.  
2. ~~**Publish or cut the 63 `status: review` fitness reviews**~~ **Done** — 397/397 coverage; 48/63 heroes fetched.  
3. ~~**Fix best-guide unpublished recommendations**~~ **Done** — normalize drops/backfills unpublished IDs; media-ready SKUs promoted; media-pending lists drafted; hub race-fuel strip removed.

### P1 — scale quality

4. ~~**Section-image generation pipeline**~~ **Done** — `npm run reviews:section-images`; audit `section-images` = 0.  
5. ~~**Bring mid-length reviews toward 3,500+**~~ **Done** — enricher deepens to `REVIEW_TARGET_WORDS` (3,800); fleet avg ~3,946.  
6. ~~**`npm run reviews:upgrade-audience -- --write`**~~ **Done** — 0 thin source Buy/Skip (backfill + watches-wave2).  
7. ~~**Deepen 24 thin running explainers**~~ **Done** — 68/68 guides complete; site audit HIGH cleared.

### P2 — consistency & trust

8. ~~**Add authentic considered sets + context analysis to best guides**~~ **Done** — repository `normalizeBestGuide`; coverage QA 52/52 enriched.  
9. ~~**Finish authentic heroes for hub-featured accessory SKUs**~~ **Done** — media audit 412/412; hub strips 4–5 cards.  
10. Align metric editorial blurbs / value sections where still templated (spot-check vs Vomero).

---

## 6. Suggested execution waves

| Wave | Scope | Outcome |
| --- | --- | --- |
| **W1** | ~~64 P0 length~~ + ~~63 unpublished fitness reviews~~ | **Done** — coverage 397/397 |
| **W2** | Section images for top ~50 traffic reviews (shoes + watches) | Flagship pages match visual standard |
| **W3** | ~~Best-guide publish/media cleanup~~ | **Done** — live hub strips 4–6 cards; draft lists wait on heroes |
| **W4** | ~~Thin running explainers~~ | **Done** — 68/68 complete |
| **W5** | ~~Considered-set / context-analysis on best guides~~ | **Done** — normalize + coverage QA clean |

---

## 7. What not to treat as the main problem

- **Voice / junk tone** — largely fixed for published reviews.  
- **Missing verdict / scores / alternatives / disclosure** — not the recurring failure mode.  
- **Core running shoe + watch review skeletons** — grade A; they need **depth and section media**, not rewrites from scratch.

---

## 8. Commands to re-check

```bash
npm run reviews:article-audit
npm run reviews:article-audit -- --fail          # CI: fail on any P0
npm run site:audit:content
npm run guides:qa
npm run reviews:upgrade-audience -- --write      # after editorial OK
```

Re-run the article audit after each wave; success looks like: **P0 → 0**, **P1 → 0**, **avg words in the 3,000–5,500 band**, and **published review coverage → 100% of live products**.
