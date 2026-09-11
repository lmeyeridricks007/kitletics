# Kitletics — Zero Known Debt Review V2

**Document ID:** `FINAL-ZERO-DEBT-REVIEW-V2`  
**Mode:** READ-ONLY (no product, content, threshold, or publish changes)  
**Audit clock:** `2026-09-10T19:09Z–20:14Z`  
**Lab:** clean `next build` (exit 0) + `next start` @ `http://127.0.0.1:3010`  
**Question:** what remains imperfect after Fixes 73–80, measured fresh — not copied from V1.

**Live inventory:** [`data/rc-81/inventory.json`](data/rc-81/inventory.json)  
**Findings register:** [`data/FINAL-REMAINING-DEBT-V2.csv`](data/FINAL-REMAINING-DEBT-V2.csv)

Do not publish.

---

KNOWN LAUNCH DEBT:
0 blockers
2 high
0 medium
11 low

INTENTIONAL HOLDS:
21

FUTURE ROADMAP:
12

---

## How to read this

- **KNOWN LAUNCH DEBT** is incomplete, weak, stale, or unlabeled work a Day-1 user or CI can still hit.
- **INTENTIONAL_HOLD** is not debt when policy explains the hold and Day-1 does not promise that surface.
- **FUTURE_ROADMAP** becomes owed only when a vertical, region, or media programme opens.
- `site:audit` full mode reported two editorial HIGHs. Canonical launch assessors on the same clock do **not** agree (reviews 591/591 READY; enriched junk voice **0**). Those agent findings are classified below, not copied as HIGH.

---

## Scorecard (live `{ isDev: false }`)

Sitemap **1174** URLs (Fix 60 was 1106; the 1155 snapshot was pre–Fix 75). Lastmod present **42** / omitted **1132** (Fix 32 omit-when-unreliable).

| Surface | TOTAL | READY | INDEXABLE | Notes |
|---|---:|---:|---:|---|
| Products | 631 | 513 LAUNCH_READY | 375 | Running published **375/375 LAUNCH_READY** |
| Reviews | 591 | 591 | 373 | workState READY; uniqueness holds **0** |
| Best | 59 | 59 | 45 | 0 THIN indexable; intent holds **0** |
| Guides | 69 | 69 | 42 | assessor `complete` 69/69 |
| Comparisons | 94 | 94 | 65 | MEANINGFUL 94; 0 broken in published set |
| Alternatives | 487 pages w/ graph | 465 | 137 | 21 market + 1 duplicate-intent + **0 unexplained** |
| Brands | 190 | 73 | 73 | 87 insufficient depth · 30 no products |
| Categories | 47 | 14 editorial configs | 15 | 28 vertical · 4 soft-gated shells |
| Tools | 25 | 25 available | 12 | 13 vertical / hub-only |

Draft/unpublished SKUs (dev catalog): **89 draft + 4 review** — media gate, not in the 631 published set.

---

## Engineering (this clock)

| Check | Result |
|---|---|
| `npm run typecheck` | **exit 0** |
| `npm run lint` | **exit 0** (0 errors; 2 unused-var warnings in `scripts/tmp/**` only) |
| `npx eslint src/lib/decision-graph/semantic-quality.ts` | **exit 0** — V1 `ENG-LINT-HOOK` is **gone** |
| `npm test` | **609 tests**. Six sitemap/eligibility cases **timeout at 120s** under default workers; **61/61 pass** serially with `--maxWorkers=1 --testTimeout=300000` |
| `npm run build` | **exit 0** (2327/2327 static pages). Some `/brands/garmin`, `/404`, sitemap routes retried after 60s; build still succeeded |
| `npm run media:ci` | **exit 1** — `ReferenceError: getPrimaryProductMedia is not defined` in `scripts/lib/catalog-media-audit.ts` |
| `site:audit --mode=full --dry-run` | BLOCKER 0 · HIGH 2 (editorial detectors) · routes 1176 |
| `site:audit:links --dry-run` | **READY** · BLOCKER/HIGH/MEDIUM/LOW **0** |

---

## 1. Products

| Class | n | Where |
|---|---:|---|
| **LAUNCH_READY** | **513** | 375 Running INDEXABLE + 138 quality-ready on held verticals |
| **NMW** | **116** | Held padel / pickleball / badminton / fitness / tennis — **0 Running** |
| **THIN** | **2** | `head-padel-pro-s-balls`, `wilson-padel-overgrip-pack` (padel) |
| **BLOCKED** | **0** | Published catalog |

**Running quality debt: 0.** Authentic primary **631 / 631**.

**Not debt (held vertical quality):** 116 NMW + 2 THIN sit behind `verticalLaunchStrategy`. Deep PDPs are not in the sitemap. **FUTURE_ROADMAP.**

---

## 2. Reviews

| Bucket | INDEXABLE | All published |
|---|---|---|
| READY | 373 | **591 / 591** |
| DUPLICATIVE | **0** | 0 |
| NEEDS_DIFF (assessor / editorial workState) | **0** | 0 |
| `isReportOrJunkVoice` on **enriched** page | **0** | 0 |
| Unsupported first-hand / BLOCKED_EVIDENCE | **0** | empty slug set |

Held **218** = vertical only.

**Source-seed residue (LOW):** `site:audit` CONTENT-002 flagged **3** source fields (`buff-merino-lightweight`, `buff-polar`, `new-balance-fuelcell-rebel-v4`). Enriched page copy is clean. Not a rewrite queue.

**Truncated token-Jaccard (LOW monitor):** INDEXABLE pair `osprey-duro-6` ~ `osprey-dyna-6` at **0.752**. Assessor remains LAUNCH_READY.

**Article-auditor P0 (LOW, not launch HIGH):** `assessReviewArticle` on flagship Vomero / Novablast / Glycerin / FR970 / Clifton 10 scores **85–88** with one P0 finding each. Launch gate still READY. `site:audit` sampled the first 15 catalog reviews (`isDev: true`) and reported 15/15 P0 — detector disagreement, not 15 broken Day-1 reviews.

---

## 3. Best

READY **59 / 59**. INDEXABLE **45**. THIN indexable **0**. Intent holds **0**. **14 HELD** = fitness / padel / tennis / HYROX. **INTENTIONAL_HOLD.**

---

## 4. Guides

READY / `complete` **69 / 69**. INDEXABLE **42**. Incomplete **0**. **27 HELD** = non-Running. **INTENTIONAL_HOLD.**

---

## 5. Comparisons

MEANINGFUL **94 / 94**. INDEXABLE **65**. INDEXABLE broken peers **0**. **8** `COMPARISON_BROKEN_PEER_SLUGS` remain draft/media-gated — **not** in published 94, **not** in sitemap. **29 HELD** = non-Running. **INTENTIONAL_HOLD.**

---

## 6. Alternatives

| Class | n | Indexable? |
|---|---:|---|
| READY (`canPublish` + editorial) | 465 | 137 INDEXABLE (eligibility) |
| HOLD_INSUFFICIENT_ALTERNATIVE_MARKET | 21 | no |
| HOLD_DUPLICATE_INTENT | 1 | `nike-dri-fit-miler-women` |
| THIN_UNEXPLAINED | **0** | closed vs V1’s 4 |

**V1 MEDIUM `ALT-UNEXPLAINED` is closed.** Ciele / beanie / treadmill SKUs now have an explicit hold class or sit outside `ALTERNATIVES_INDEXABLE_CATEGORIES`.

**HIGH — sitemap vs robots:** eligibility puts **137** alternatives in the sitemap. `getAlternativesPageData().indexable` (stricter: ≥3 substantive alts, ≥2 reason groups, distinct copy) is **false** on **39** of those URLs. Live HTML emits `noindex, follow` while remaining self-canonical. HTTP **200**. See §10.

---

## 7. Brands

**190** records · **73 READY / INDEXABLE** · **87 HOLD_INSUFFICIENT_DEPTH** · **30 HOLD_NO_PRODUCTS**. Uniqueness holds **0**. Unexplained **0**.

Fix 75 hubs (amazfit, samsung, decathlon) remain READY.

---

## 8. Categories

Indexable **15**. Editorial configs **14/14**. FUTURE vertical **28**. Soft-gated shells **4** (`/padel/bags`, `/padel/accessories`, `/padel/clothing`, `/squash/rackets`). Day-1 category copy debt **0**.

---

## 9. SEO / sitemap HTTP (fresh probe)

**1174 / 1174 HTTP 200.** `redirect: manual`. 0 redirects, 0 404, 0 5xx, 0 timeouts, 0 non-HTML, 0 facet/query URLs, 0 `/draft|/preview` paths, 0 draft/future INDEXABLE entities.

Every **200** HTML URL **self-canonicalizes** to `https://kitletics.com` + the sitemap path (lab host is localhost; canonical host is production).

| Type | n |
|---|---:|
| Product | 375 |
| Review | 373 |
| Alternatives | 137 |
| Brand | 73 |
| Comparison | 66 |
| Best | 45 |
| Guide | 42 |
| Category | 28 |
| other | 24 |
| Tool | 11 |
| **total** | **1174** |

**other (24):** `/`, listing hubs (`/brands`, `/best`, `/reviews`, `/guides`, `/tools`, `/setups`), 11 trust/legal pages, `/authors/kitletics-editorial`, 5 setups.

**Increment vs Fix 60 (1106 → 1174 = +68):** all **INDEXABLE**. HTTP **200**. Reasons: Fix 62 Buff + Rebel v4; Fix 69 NNormal + hub; Fix 75 Amazfit / Samsung / Kiprun + hubs; Fix 65 alternatives expansion. Evidence: [`data/rc-81/sitemap-http-probe.json`](data/rc-81/sitemap-http-probe.json) `delta.rows`.

**HIGH:** **39** sitemap alternatives send `<meta name="robots" content="noindex, follow"/>`. Sitemap must not list noindex URLs. Fix: either drop them from `sitemap.ts` (align with page `indexable`) or lift page robots to `index, follow` if the stricter alt bar is wrong. List: [`data/rc-81/alt-index-mismatch.json`](data/rc-81/alt-index-mismatch.json).

`/search?q=vomero` is **noindex** and **not** in the sitemap — correct.

---

## 10. Accessibility / keyboard / performance (fresh lab)

| Check | Result |
|---|---|
| Axe serious/critical (12 P0 routes) | **0** / 0 violations |
| Keyboard | **47 / 47 PASS** |
| Novablast / Vomero / Glycerin 390 overflow | **leak=0** |
| Regression 390/768/1440 × Product, Review, Best, Guide, Finder | **leak=0** |
| Cookie / “N” chip | not re-opened; production `next start` has no CMP |

Transfer vs **2.5 MB** budget (document + subresources, 1440):

| Route | MB | Budget |
|---|---:|---|
| `/` | 1.15 | pass |
| `/running` | 1.44 | pass |
| `/running/shoes` | 1.25 | pass |
| `/running/shoes/daily-trainers` | 1.18 | pass |
| PDP Vomero 18 | 1.11 | pass |
| Review Vomero 18 | 1.19 | pass |
| `/best/running-shoes` | 1.48 | pass |
| `/guides/how-to-choose-running-shoes` | 1.34 | pass |
| `/brands/nike` | 1.09 | pass |
| `/compare` | 1.67 | pass |
| Finder | 0.96 | pass |
| `/search?q=vomero` | 1.69 | pass (noindex) |

Axe **incomplete** (not violations): home `color-contrast` (hero `bgGradient` — same tool limitation as Fix 78); some hubs also `link-in-text-block` / `aria-prohibited-attr`. Search incomplete **0**.

---

## 11. Relationship quality (fresh graph audit)

**0 INVALID** on all six scored types.

| Type | WEAK | INVALID |
|---|---:|---|
| Product → Alternative | 149 (INDEXABLE Running **12**) | 0 |
| Product → Comparison | 10 | 0 |
| Product → Best | 5 | 0 |
| Product → Guide | 32 | 0 |
| Review → Alternative | 275 | 0 |
| Best → Comparison | 7 | 0 |

INDEXABLE Running alt WEAK **12** (was 13): Speed 4→Deviate Nitro 3; Rebel v4→Mach 6; Endorphin Pro 3→Adios Pro 4; Tickr→H9; Tickr X→H10; Epix Pro Gen 2→Apex 4; Näak bar→Clif Bloks; PowerBar→Clif Bloks; Nuun→SaltStick; VaporAir 2→UD Adventure; Zephyr→UD Adventure; Zephyr→ADV Skin 12.

**INTENTIONAL_HOLD** — no unused STRONG same-job peer. **FUTURE_ROADMAP** to replace only when one exists.

---

## 12. Media

| Check | Result | Class |
|---|---|---|
| Authentic primary (published) | **631 / 631** | — |
| `media:ci` | **crash** (`getPrimaryProductMedia` not imported) | **HIGH** |
| Gallery extras | **23** INDEXABLE products, **352** hero-only | **LOW** |
| Files &gt;5 MB | **0** | Fix 77 holds |
| Files &gt;1 MB | **2817** | **LOW** (almost all review-section PNGs; serve via `next/image`) |
| Leftover | `glycerin-22-hero.WRONG-caldera.png.bak` (3.2 MB) | **LOW** clutter |
| `images.qualities` | allow-listed 65/70/75 | Fix 76 **CLOSED** |

Largest remaining masters include Amazfit T-Rex 3 Pro hero (3.9 MB) and QA shots under `public/images/running/qa/`.

---

## 13. Commerce

| Region | Offer rows | Policy |
|---|---:|---|
| NL | 746 | primary |
| DE | 274 | partial — **INTENTIONAL_HOLD** |
| UK | 278 | partial |
| US | 3 | limited |
| BE / FR / ZA | 0 | none |

Overlay **433** (Fix 79): VALID **48** · LIKELY_VALID **375** · UNKNOWN **10** · INVALID **0**. Unvalidated rows **868** = held-vertical. Do not hide UNKNOWN.

---

## 14. Classification summary

### BLOCKER (0)

No INDEXABLE 404/5xx, no fake aggregate ratings, no unsupported first-hand on INDEXABLE reviews, no THIN Day-1 Best/Review.

### HIGH (2)

| ID | Finding |
|---|---|
| SEO-SITEMAP-NOINDEX | 39 `/products/*/alternatives` URLs are in the sitemap and self-canonical but emit `noindex, follow` |
| MEDIA-CI-CRASH | `npm run media:ci` throws `getPrimaryProductMedia is not defined` — identity CI cannot fail-closed |

### MEDIUM (0)

V1 `ALT-UNEXPLAINED`, `IMG-QUALITIES`, `MEDIA-INGEST` are **closed** on this clock.

### LOW (11)

Gallery remainder; &gt;1 MB masters under delivery policy; next/img disables; `console.debug`; finder TODO; Duro/Dyna Jaccard monitor; vitest 120s sitemap timeouts under workers; wrong-brand `.bak` leftover; 3 source-seed junk matches; article-auditor vs launch-gate disagreement; QA screenshots in the image tree.

### INTENTIONAL_HOLD (21 groups)

Vertical deep URLs (products, reviews, Best, guides, comparisons, tools); alt category noindex; 21 market + 1 duplicate-intent alts; small / empty brand hubs; category vertical + 4 shells; lastmod omit; regional commerce honesty; draft broken comparisons; remaining WEAK graph; media-gated product drafts.

### FUTURE_ROADMAP (12)

Enable fitness/padel/tennis/hyrox; finish 116 NMW + 2 THIN on those SKUs; brand hubs when catalog ≥3 authentic SKUs; gallery extras beyond 23; remaining ~868 offer URL overlay; BE/FR/ZA/US ingest; finder scoring vs labeled recs; remaining WEAK replacement only when a STRONG peer exists; NNormal Cadí/Brut; Compressport/OOFOS/Trail 10 ungating with licensed heroes.

---

## 15. What is *not* remaining debt

- Running product / review / Best / guide / comparison **READY** for the INDEXABLE set.
- 0 INDEXABLE duplicative / NEEDS_DIFF / unsupported evidence (canonical assessors).
- 0 INVALID decision-graph edges.
- 0 fake aggregate ratings.
- 1174/1174 sitemap HTTP 200; 0 3xx in sitemap.
- Keyboard 47/47 and axe P0 as measured this clock.
- Fix 75 catalog gaps (amazfit / samsung / decathlon) stay closed.
- Fix 78 Novablast 390 overflow stays **0**.
- `ENG-LINT-HOOK` closed (`semantic-quality.ts` lint clean).

---

## Evidence clock

| Source | Clock |
|---|---|
| Live eligibility / uniqueness / commerce | 2026-09-10T19:18Z · `rc-81/inventory.json` |
| Graph | 2026-09-10T19:11Z · `rc-81/graph-audit.json` |
| lint / typecheck / tests / build | 19:09–19:49Z · `rc-81/logs/` |
| `site:audit` full dry-run | 19:19Z · `rc-81/site-quality-audit.json` |
| `site:audit:links` | 19:31Z · READY 0 open (log only; full report restored to `docs/site-quality-audit.*`) |
| Sitemap HTTP | 20:11Z · `rc-81/sitemap-http-probe.json` · **1174/1174 200** |
| P0 transfer + axe | 20:12Z · `rc-81/p0-lab.json` |
| Keyboard | 20:13Z · 47/47 |
| 390/768/1440 overflow | 20:14Z · leak=0 |

Do not publish from this document.
