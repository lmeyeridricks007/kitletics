# Kitletics — Zero Known Debt Review

**Document ID:** `FINAL-ZERO-DEBT-REVIEW`  
**Mode:** READ-ONLY (no code, content, threshold, or publish changes)  
**Audit clock:** `2026-09-10T16:00:00.000Z`  
**Question:** what remains imperfect, incomplete, weak, stale, or intentionally held — after Day-1 gates already passed.

**Live inventory:** [`data/rc-zero-debt/inventory.json`](data/rc-zero-debt/inventory.json)  
**Findings register:** [`data/FINAL-REMAINING-DEBT.csv`](data/FINAL-REMAINING-DEBT.csv)

Evidence also draws on Fixes 62–71, V3 forensic, Fix 60 P0 lab, Fix 67 links, Fix 68 keyboard, Fix 69 brands, Fix 70 graph, Fix 71 visual.

---

KNOWN LAUNCH DEBT:
0 blockers
1 high
4 medium
11 low

INTENTIONAL HOLDS:
21

FUTURE ROADMAP:
12

---

## How to read this

- **KNOWN LAUNCH DEBT** is incomplete, weak, or stale work a Day-1 user (or CI) can still hit, or unlabeled process gaps.
- **INTENTIONAL_HOLD** is not debt when the surface is complete for its role, policy explains the hold, and no launch user is promised that capability.
- **FUTURE_ROADMAP** is work that only becomes owed when a vertical, region, or media programme is opened.
- Reviews: live editorial assessor **READY = 585 / 585**. Confirmed uniqueness / evidence debt on INDEXABLE reviews = **0**.

This document does not restate a ship decision.

---

## Scorecard (live `{ isDev: false }`)

Sitemap **1155** URLs. Lastmod present **42** / omitted **1113** (Fix 32 omit-when-unreliable).

| Surface | TOTAL | READY | INDEXABLE | Notes |
|---|---:|---:|---:|---|
| Products | 625 | 508 LAUNCH_READY | 369 | Running published **369/369 LAUNCH_READY** |
| Reviews | 585 | 585 | 367 | workState READY; uniqueness holds **0** |
| Best | 59 | 59 | 45 | 0 THIN indexable; intent holds **0** |
| Guides | 69 | 69 | 42 | assessor `complete` 69/69 |
| Comparisons | 94 | 94 | 65 | MEANINGFUL 94; 0 broken in published set |
| Alternatives | 484 pages w/ graph | 464 | 133 | 15 market + 1 duplicate-intent + **4 unlabeled** |
| Brands | 190 | 70 | 70 | 90 insufficient depth · 30 no products |
| Categories | 47 | 14 editorial configs | 15 | 28 vertical · 4 soft-gated shells |
| Tools | 25 | 25 available | 12 | 13 vertical / hub-only |

Draft/unpublished SKUs (dev catalog): **89 draft + 4 review** — media gate, not in the 625 published set.

---

## 1. Products

| Class | n | Where |
|---|---:|---|
| **LAUNCH_READY** | **508** | 369 Running INDEXABLE + 139 quality-ready on held verticals |
| **NMW** | **115** | Held padel / pickleball / badminton / fitness / tennis — **0 Running** |
| **THIN** | **2** | `head-padel-pro-s-balls`, `wilson-padel-overgrip-pack` (padel) |
| **BLOCKED** | **0** | Published catalog |

**Running quality debt: 0.** Fix 62 finished the five V3 Running NMW Buffs + Rebel v4. They are LAUNCH_READY and INDEXABLE.

**Not debt (held vertical quality):** 115 NMW + 2 THIN sit behind `verticalLaunchStrategy` (fitness selective with empty `indexableKinds`; padel/tennis/hyrox disabled). Deep PDPs are not in the sitemap. Completing them is **FUTURE_ROADMAP**, not a Day-1 promise.

**Open Running catalog gaps (not padded):** **0.** Fix 75 completed Amazfit (Balance 3, Cheetah 2 Pro), Samsung (Ultra2, Watch9) and Decathlon (900 Race 5L, Proteam 10). `prod-kiprun-trail-10` stays **MEDIA_GATED** (no licensed hero). See `docs/prelaunch/fixes/75-running-catalog-gaps.md`.

**Media-gated drafts (93):** authentic-hero gate. Ungating without licensed heroes is forbidden. **INTENTIONAL_HOLD.**

---

## 2. Reviews

| Bucket | INDEXABLE | All published |
|---|---|---|
| READY | 367 | **585 / 585** |
| DUPLICATIVE | **0** | 0 (`CONTENT_UNIQUENESS_REVIEW_HOLDS` empty) |
| NEEDS_DIFF (assessor / editorial workState) | **0** | 0 |
| NEEDS_RESEARCH | **0** | 0 |
| Unsupported first-hand / BLOCKED_EVIDENCE | **0** | empty slug set |
| `isReportOrJunkVoice` | **0** | 0 |

Held **218** = vertical only. Editorial is complete.

**Live token-Jaccard caveat (not counted as debt):** truncated (8k char) token Jaccard on INDEXABLE reviews flagged **2** `NEEDS_DIFFERENTIATION` at **0.752** — `osprey-duro-6` ~ `osprey-dyna-6` (men’s/women’s same vest). V3 full category-peer (token + shingle, full text) kept this pair under 0.72 (closest pack pair then was Nathan VaporAir 2 ~ Duro 6 at 0.684). Assessor remains LAUNCH_READY. **LOW monitor**, not a rewrite queue.

**Actual editorial debt = 0.**

---

## 3. Best

| Bucket | n |
|---|---:|
| READY | **59 / 59** |
| NMW | 0 |
| THIN (indexable) | **0** |
| Intent conflicts (`EDITORIAL_INTENT_HOLD_PATHS`) | **0** |

**14 HELD** — all LAUNCH_READY copy on fitness / padel / tennis / HYROX Best URLs. **INTENTIONAL_HOLD** (vertical). No Day-1 THIN or duplicate-intent Best.

---

## 4. Guides

| Bucket | n |
|---|---:|
| READY / `complete` | **69 / 69** |
| Incomplete | **0** |
| Evidence issues | **0** |
| Uniqueness / intent holds | **0** |

**27 HELD** = non-Running. Explainer diagrams already present on long-form Running guides (Fix 71). **INTENTIONAL_HOLD** for non-Running; no incomplete Day-1 guide.

---

## 5. Comparisons

| Bucket | n |
|---|---:|
| READY / MEANINGFUL | **94 / 94** |
| NEEDS_DIFF (workState) | **0** |
| Broken (INDEXABLE missing peers) | **0** |
| Weak-pair (published) | **0** |

**8 draft broken-peer slugs** (`COMPARISON_BROKEN_PEER_SLUGS`) — peers are draft / media-gated. **Not** in the published 94, **not** in the sitemap. **INTENTIONAL_HOLD.**

**29 HELD** = non-Running pairs (including fitness lifting-shoe pages). **INTENTIONAL_HOLD.**

Graph still scores **10 WEAK** Product→Comparison (mostly held vertical or previous-gen). Kept on purpose in Fix 70. **INTENTIONAL_HOLD**, not a broken-pair rewrite.

---

## 6. Alternatives

| Class | n | Indexable? |
|---|---:|---|
| READY (`canPublish` + editorial) | 464 | 133 INDEXABLE |
| HOLD_INSUFFICIENT_ALTERNATIVE_MARKET | 15 | no — clothing / fuel / flask / stash clusters with &lt;3 peers |
| HOLD_DUPLICATE_INTENT | 1 | `nike-dri-fit-miler-women` (men’s page is the indexable tee) |
| THIN_UNEXPLAINED | **4** | not in INDEXABLE alt categories |

**Legitimate holds (not debt):** 15 insufficient-market + 1 duplicate-intent. Policy in `classify-alternatives-hold.ts` / Fix 65. **INTENTIONAL_HOLD.**

**Unfinished / unlabeled (debt):** after Fix 70 edge overlay, **4** pages fail `canPublishAlternativesPage` with ≥3 cluster peers and **no** explicit hold class:

- `ciele-gocap-athletics`, `brooks-notch-thermal-beanie` (Running clothing — not in `ALTERNATIVES_INDEXABLE_CATEGORIES`)
- `horizon-t202-treadmill`, `woodway-curve-trainer` (fitness)

Launch users are not promised these URLs. They are still **unexplained thin** vs Fix 65’s “0 unexplained” bar. **MEDIUM.**

Accessory / nutrition / clothing READY pages outside the indexable category set stay noindex. **INTENTIONAL_HOLD**, not unfinished Day-1 alts.

---

## 7. Brands

Live: **190** records · **73 READY / INDEXABLE** · **87 HOLD_INSUFFICIENT_DEPTH** · **30 HOLD_NO_PRODUCTS**. Uniqueness holds **0**. Unexplained **0** (Fix 69 + Fix 75).

| Class | n | Treatment |
|---|---:|---|
| READY | 73 | Day-1 hubs (Fix 75 promoted amazfit, samsung, decathlon) |
| Legitimately small | 54 | 1–2 hero SKUs (fuel, socks, lights, chafe, etc.) |
| CATALOG_GAP (open) | 0 | closed in Fix 75; Trail 10 remains MEDIA_GATED |
| FUTURE_VERTICAL | 37 | 33 insufficient + 4 zero-product racket/fitness names |
| NO_CURRENT_RELEVANT_PRODUCTS (media-gated) | 26 | drafts until licensed hero |
| Stale entity | 0 | `strength-shop` already removed |

---

## 8. Categories

| Class | n |
|---|---:|
| READY (indexable Running + editorial) | 15 URL / **14/14** decision configs |
| FUTURE (vertical catalog) | 28 |
| Empty shell (soft-gated) | 4 — `/padel/bags`, `/padel/accessories`, `/padel/clothing`, `/squash/rackets` |
| Content debt on Day-1 categories | **0** |

Soft-gated shells are explicit empty policy, not missing copy. **INTENTIONAL_HOLD.**

---

## 9. Engineering

| Item | Live | Class |
|---|---|---|
| `npx eslint src/lib/decision-graph/semantic-quality.ts` | **2 errors**, exit **1** | **HIGH** |
| Unused-var warnings | 6, all `scripts/tmp/**` (including this audit) | not production |
| Test skips / `.todo` | **0** | — |
| `TODO` / `FIXME` / `HACK` in `src/` | 1 TODO (finder scoring comment) | **LOW** / FUTURE |
| `console.log` in `src/` | none; `console.debug` in calculator + rotation analytics | **LOW** |
| `@ts-ignore` | 0 in production path | — |
| `eslint-disable` | next/img on SVG/logo marks; a few `exhaustive-deps` | **LOW** |
| Dead code | unused-vars in `src/` cleaned in Fix 66; no knip this clock | not measured |
| P0 transfer budget (Fix 60) | all P0 ≤ 2.5 MB; `/compare` 1.68 MB; daily-trainers 1.20 MB | no exception remaining |
| Next `images.qualities` | `IMAGE_QUALITY` uses **65 / 70**; `next.config.ts` has no `qualities` allow-list | **MEDIUM** (Next 15.5+ warning) |

**HIGH detail:** `useCaseOverlap()` in `src/lib/decision-graph/semantic-quality.ts` (Fix 70) is a plain helper. `react-hooks/rules-of-hooks` treats `use*` as a Hook. **False positive, but CI `npm run lint` fails.** Runtime is unaffected. Rename is the fix; not done in this read-only pass.

---

## 10. SEO

| Check | Result | Class |
|---|---|---|
| Sitemap HTTP (Fix 60, 1106 then) | 1106/1106 200; 0 404/5xx/3xx | no measured break; corpus now **1155** (not re-probed this clock) |
| Redirect chains on sitemap URLs | 0 (Fix 60) | aliases `/hyrox` → `/fitness/hyrox`, `/training` → `/fitness` are **single-hop INTENTIONAL** |
| Orphans | 0 INDEXABLE editorial (Fix 67) | — |
| Weak metadata | Fix 67 links audit BLOCKER/HIGH/MEDIUM **0** | — |
| Schema / fake ratings | 0 `aggregateRating` on INDEXABLE reviews (V3 live) | — |
| Sitemap lastmod | **42** real / **1113** omitted | **INTENTIONAL_HOLD** (Fix 32: omit vs seed) |
| Crawl depth | inventory 1152–1155; noindex sitemap **0** | — |
| Facet / draft leak | 0 (V3 / Fix 60) | — |

Sitemap HTTP was not re-fetched for the extra ~49 URLs since Fix 60 (NNormal SKUs, alt pages, brand hub). Prior probe class was clean. Residual risk is **LOW** (unprobed increment), not a known 404.

---

## 11. Accessibility

| Check | Result | Class |
|---|---|---|
| Axe P0 (Fix 60) | 0 serious/critical; 0 total violations | — |
| Axe incomplete | 2 nodes on header/search baseline | **LOW** (incomplete ≠ fail) |
| Keyboard (Fix 68) | **47 / 47 PASS** | skip link, traps, Finder |
| Focus | skip-link visible lime 2px; restore after drawers | — |
| Forms | Finder + search keyboard-complete | — |
| Mobile 390 | Fix 68 + Fix 71; residual Novablast carousel leak | **LOW** |
| Cookie “N” chip | third-party overlay | **LOW** / not Kitletics chrome |

---

## 12. Relationship quality

Fix 70 after overlay: **0 INVALID** on all six scored types.

| Type | WEAK remaining | Treatment |
|---|---:|---|
| Product → Alternative | 151 (INDEXABLE Running **13**) | previous-gen vs other-franchise current; bar vs chew; drink vs chew |
| Product → Comparison | 10 | mostly held / conservative scorer |
| Product → Best | 5 | marathon cycle trainers; stability routing Ghost/Clifton |
| Product → Guide | 32 | flasks on vest explainers (compatible, not same job) |
| Review → Alternative | 279 | follows product graph |
| Best → Comparison | 7 | one overlapping rec vs a close non-pick |

**INDEXABLE Running alt WEAK (13):** Speed 4→Deviate Nitro 3; Rebel v4→Mach 6; Endorphin Pro 3→Adios Pro 4; Tickr→H9; Tickr X→H10; Epix Pro Gen 2→Apex 4; Näak bar→Clif Bloks; PowerBar→Clif Bloks; Nuun→SaltStick; VaporAir 2→UD Adventure; Zephyr→UD Adventure; Zephyr→ADV Skin 12; plus one more previous-gen pack/watch in the same list.

These were **kept** because no unused STRONG same-job peer existed (or the WEAK is editorial routing). **INTENTIONAL_HOLD**, not invalid graph debt.

---

## 13. Media

| Check | Result | Class |
|---|---|---|
| Authentic primary (published) | **625 / 625** | — |
| Missing authentic on INDEXABLE | **0** | — |
| Gallery extras (`PRODUCT_GALLERY_MEDIA`) | **23** products, **92** extras | Fix 21 remainder — **LOW** / FUTURE to deepen |
| Indexable hero-only | 346 / 369 | not a wrong-brand fill |
| Oversized sources | **2818** files &gt;1 MB; **5** &gt;5 MB | delivery via `next/image` (Fix 18/30/31) |
| Worst masters | On Ultra Vest Pro gallery **8.3–15 MB PNG**; Glycerin 22 hero **5.2 MB** | **MEDIUM** (ingest), not live transfer if Next resizes |
| Wrong variants / placeholders | 0 in historical `media:ci` | — |

Fix 18 policy: do not destructively recompress masters; serve sized variants. Transfer budgets passed. Extreme PNG ingest remains imperfect.

QA screenshots under `public/images/running/qa/` are lab artifacts in the image tree (**LOW** clutter).

---

## 14. Commerce

| Region | Offer rows | Policy | Class |
|---|---:|---|---|
| NL | 738 | primary | — |
| DE | 274 | partial | **INTENTIONAL_HOLD** (disclosed) |
| UK | 278 | partial | **INTENTIONAL_HOLD** |
| US | 3 | limited | **INTENTIONAL_HOLD** |
| BE / FR / ZA | 0 | none | **INTENTIONAL_HOLD** (UX: “No verified retailer offers currently available in your region.”) |

| Validation overlay | n |
|---|---:|
| Overlay records | 80 (checked 2026-09-09) |
| VALID / LIKELY_VALID / UNKNOWN / INVALID | 21 / 54 / 5 / **0** |
| Offers with no overlay | 1213 |

Unvalidated offers still display (Fix 22: do not hide UNKNOWN). Overlay is a **sample**, not full-catalog proof. **LOW** coverage gap. Not stale on a one-day clock. **INVALID = 0.** No UX claim of BE/FR/ZA/US parity.

---

## 15–16. Classification summary

### BLOCKER (0)

None. No INDEXABLE 404, fake rating, unsupported first-hand, or THIN Day-1 Best/Review.

### HIGH (1)

| ID | Finding |
|---|---|
| ENG-LINT-HOOK | `useCaseOverlap` trips `react-hooks/rules-of-hooks` — `npm run lint` **exit 1** on production `src/` |

### MEDIUM (3)

| ID | Finding |
|---|---|
| ALT-UNEXPLAINED | 4 alternatives pages unlabeled after Fix 70 |
| IMG-QUALITIES | Next 15 `quality` 65/70 not in `images.qualities` |
| MEDIA-INGEST | On Ultra Vest Pro 8–15 MB PNG masters |

### LOW (11)

Gallery remainder; offer-validation sample; Novablast 390 overflow; next/img disables; console.debug; finder TODO; Duro/Dyna token-Jaccard monitor; mass &gt;1 MB masters under delivery policy; axe incomplete; cookie chip; unprobed sitemap increment since Fix 60.

### INTENTIONAL_HOLD (21 groups)

Vertical deep URLs (products, reviews, Best, guides, comparisons, tools); alt category noindex; 15 market + 1 duplicate-intent alts; legitimately small brands; media-gated brand SKUs; future-vertical brands; category vertical + 4 shells; lastmod omit; regional commerce honesty; draft broken comparisons; remaining WEAK graph; media-gated product drafts.

### FUTURE_ROADMAP (12)

Enable fitness/padel/tennis/hyrox; finish 115 NMW + 2 THIN on those SKUs; brand hubs when catalog ≥3 authentic SKUs; gallery extras beyond 23; full offer URL overlay; BE/FR/ZA/US offer ingest; finder scoring vs labeled recs; remaining WEAK replacement only when a STRONG peer exists; NNormal Cadí/Brut; Compressport/OOFOS/etc. ungating with licensed heroes; compare empty-state prefer &lt;1 MB (already ≤2.5); section-image generation already required on review write.

---

## 17. What is *not* remaining debt

- Running product / review / Best / guide / comparison **READY** for the INDEXABLE set.
- 0 INDEXABLE duplicative / NEEDS_DIFF / unsupported evidence (canonical assessors).
- 0 INVALID decision-graph edges.
- 0 fake aggregate ratings.
- NL commerce + honest empty-region copy.
- Keyboard P0 and axe P0 as last measured.
- Brand thin catalogs that are honestly one-SKU houses.

---

## Evidence clock

| Source | Clock |
|---|---|
| Live eligibility / quality / uniqueness token scan | 2026-09-10T16:00Z |
| `npm run lint` (true eslint exit) | this review — **fail** on `semantic-quality.ts` |
| Fix 70 graph | 2026-09-10T13:35Z |
| Fix 69 brands | same day |
| Fix 67 links | 2026-09-10T12:32Z |
| Fix 68 keyboard | 2026-09-10T13:00Z |
| Fix 60 sitemap HTTP / P0 / axe | 2026-09-10 morning (1106 URLs) |
| Offer URL overlay | 2026-09-09T22:02Z |

**Not re-run:** full sitemap HTTP on 1155, Lighthouse/CWV, `media:ci`, `site:audit` full mode.

Do not publish from this document.
