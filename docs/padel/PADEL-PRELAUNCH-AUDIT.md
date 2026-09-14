# Padel prelaunch audit

**Document ID:** `PADEL-PRELAUNCH`  
**Clock:** 2026-09-13  
**Lab:** clean `.next` → `npm run lint` → `typecheck` → `test` → `build` → `next start` on `http://127.0.0.1:3011`  
**Method:** repository eligibility inventory + rendered production HTML crawl (`scripts/tmp/padel-prelaunch-audit.ts`) + manual canary review  
**Rule:** READY / field-populated / word count are **not** proof of quality. Only rendered HTML + manual canaries count.

Artifacts:

| File | Role |
| --- | --- |
| [`data/PADEL-URL-INVENTORY.csv`](data/PADEL-URL-INVENTORY.csv) | Full padel URL universe + disposition |
| [`data/PADEL-HTML-CRAWL.csv`](data/PADEL-HTML-CRAWL.csv) | Per-URL crawl evidence |
| [`data/PADEL-PRELAUNCH-ISSUES.csv`](data/PADEL-PRELAUNCH-ISSUES.csv) | Issues (validated) |
| [`data/PADEL-CATALOG-SCORECARD.json`](data/PADEL-CATALOG-SCORECARD.json) | Catalog / editorial / NL commerce |
| [`data/PADEL-PRELAUNCH-SUMMARY.json`](data/PADEL-PRELAUNCH-SUMMARY.json) | Machine summary |

First pass is **audit only**. No product/editorial content remediation in this pass.  
(Build was unblocked only by renaming comparison helper `useCase` → `pickForUseCase` so Next lint could compile — not a content fix.)

---

## VERDICT: **NO-GO**

Required-zero conditions are **not** all zero after validation.

A shopper who has never seen the implementation would still encounter running imagery inside padel guides, catalog `prod-*` / `weightMin` leakage, machine “maps to prod-…” cards, public `SKU` wording, and a noindex hub with indexable deep pages.

---

## Build pipeline

| Step | Result | Notes |
| --- | --- | --- |
| `rm -rf .next` | OK | |
| `npm run lint` | **FAIL** | 35× `react-hooks` false positives on `useCase(` helper (pre-rename); growth unused-var warnings |
| `npm run typecheck` | **PASS** (after padel contextual-nav primaryKey typing fix) | |
| `npm test` | **FAIL** | 7 failed / 862 passed — held-vertical expectations still assert padel disabled (`launch-eligibility`, `racket` search); plus unrelated commerce failures |
| `npm run build` | **PASS** (after `pickForUseCase` rename) | |
| `next start :3011` | **PASS** | Crawl base used for HTML forensics |

Test failures that reflect the new selective padel enablement (search/eligibility still expect “held”) are **debt**, not proof the vertical is clean.

---

## Required zeros (validated)

| Condition | Required | Validated | Met? |
| --- | ---: | ---: | --- |
| BLOCKER rendered defects | 0 | **93** confirmed OPEN blockers | NO |
| HIGH rendered defects | 0 | **≥5** (+ manual HIGH) | NO |
| Token leakage | 0 | **12** crawl + public `SKU` on Vertex PDP | NO |
| Machine-like copy | 0 | **20** buying guides (“maps to prod-…”) | NO |
| Broken decision copy | 0 | **4** (Siux Electra / Diablo alts + Wilson Blade) | NO |
| Wrong-sport images | 0 | **53** placements / **22** URLs (running FlipBelt + running concept art; tennis filler on one review) | NO |
| Wrong-product images | 0 | **4** (Nox 12K hero on Alum XTREM PDP/review; Wilson overgrip under `/images/fitness/`) | NO |
| Wrong-brand images | 0 | **0** | YES |
| Raw public schema keys | 0 | **`widthOptions`**, **`weightMin`** (database + research title) | NO |
| Fake testing | 0 | **0** | YES |
| Fake ratings | 0 | **0** (23 detector hits were FPs on “not a popularity rank”) | YES |
| Broken indexable URLs | 0 | Brand crawl aborts = **FP timeouts** (200 on retry). Soft-gated `/padel/accessories` + `/clothing` = **404** | Partial |

---

## Inventory

Universe: **399** padel paths.

| Disposition | Count |
| --- | ---: |
| INDEXABLE | **225** |
| PUBLIC_NOINDEX | **48** |
| HIDDEN_404 | **126** |

By page type (all dispositions):

| Type | Count |
| --- | ---: |
| product | 146 |
| alternatives | 146 |
| review | 22 |
| buying-guide | 21 |
| brand | 19 |
| best-guide | 18 |
| comparison | 12 |
| category | 7 |
| research | 4 |
| sport-hub / database / finder / setup | 1 each |

**Sitemap intersection:** 225 inventory rows marked `in_sitemap_expected=yes`.  
**Not in sitemap:** `/padel` hub, category shelves, database, research (hub is `noindex`).

Crawl covered **273** public/indexable + canary URLs. Status mix: 260×200, 11× brand timeouts (later 200), 2×404 soft-gated categories.

---

## Catalog scorecard (summary)

From [`PADEL-CATALOG-SCORECARD.json`](data/PADEL-CATALOG-SCORECARD.json):

| Category | Ready pub. | Indexable | Hero | Notes |
| --- | ---: | ---: | ---: | --- |
| Rackets | 58 | 43 | 58 | Core vertical |
| Shoes | 28 | 28 | 28 | Several heroes under `/images/fitness/` |
| Balls | 2 | 2 | 2 | Thin |
| Bags | 3 | 2 | 3 | Thin |
| Grips | 2 | 1 | 2 | Thin |
| Accessories | 0 | 0 | 0 | Soft-gated / 404 |
| Clothing | 0 | 0 | 0 | Soft-gated / 404 |

Brands: **19** padel-related entities, **11** indexable.  
Editorial: reviews 17 indexable / 22; Best 18/18; guides 21/21; comps 12/12; alternatives 68 indexable.  
Research: shapes/weight/market published; **prices withheld**.

NL commerce: **53** products with From-price of **76** indexable; samples EUR (e.g. Vertex NL €319, Genius 18K €219.95). Empty regions stay empty on Metalbone review canary (`from` false).

---

## Content forensics (rendered)

### Confirmed blockers

1. **Machine guide cards** — nearly all padel buying guides render  
   `Why it illustrates the category: … maps to prod-… as a catalog role`  
   That is internal catalog language on a public buying guide.

2. **Running imagery on padel guides** — FlipBelt running accessory hero and/or running “drop/plate” concept illustrations on padel shape/material/shoe guides.

3. **Token / schema leakage**
   - `prod-*` IDs in guide cards
   - public word **SKU** on Vertex PDP / Siux Electra briefs
   - raw **`weightMin`** in database chrome and research `<title>`
   - raw **`widthOptions`** on Best Padel Shoes

4. **Broken / truncated decision fragments** — Siux Electra/Diablo alternatives (“distinct SKU from….”); Wilson Blade “(manufacturer claim) Forgiveness 6.8…”

5. **Wrong product heroes** — Nox AT10 Genius 12K Alum XTREM pages use `nox-at10-12k-2026-hero.png`; Wilson padel overgrip uses fitness overgrip asset.

6. **Tennis filler** — `/images/home/guide-tennis.jpg` on Nox 12K Alum XTREM review.

### False positives (closed in CSV)

- 11 brand `HTTP aborted` under crawl timeout → **200 OK** on retry  
- 23 `FAKE_RATINGS` → anti-claim “not a popularity rank”

### Fake testing

No confirmed first-hand / lab-testing claims on expert-research canaries.

---

## Image forensics

| Check | Result |
| --- | --- |
| Hub hero authenticity | Real padel court + racket + balls (`/images/padel/hero.jpg`, ~1.9MB PNG) |
| Semantic correctness | **Fail** on guides (running paths) and some shoe/overgrip cards (`/images/fitness/`) |
| Wrong sport | Running FlipBelt + running concept art; tennis guide art on one review |
| Wrong product | Nox Alum XTREM ↔ 12K hero; overgrip fitness path |
| Wrong brand | None proven on primary heroes |

Reminder: authentic file ≠ correct placement. Fitness-folder court shoes on `/padel` may be the right SKU photo in the wrong sport folder — still a semantic/path defect for padel UX.

---

## Editorial usefulness (shopper lens)

| Surface | Canary take |
| --- | --- |
| Hub `/padel` | Composition is premium and useful, but **noindex** + fitness media paths undercut trust |
| Rackets / shoes categories | Usable catalogs; EUR From-prices present under NL |
| Bullpadel / Nox / Adidas PDPs | Decision-dense, priced in EUR; Vertex still says “SKU” |
| Reviews (Vertex / Genius 18K / Metalbone) | Long expert-research reviews; Metalbone missing From-price in canary region |
| Best guides | Strong role maps; shoes guide pulls fitness-path heroes |
| Comparisons | Clear same-brand / cross-brand decision pages |
| Alternatives | Useful; some Siux briefs broken |
| Finder | Clean adaptive flow; live |
| Database | Useful filters but **`weightMin`** leaks; feels slightly admin-ish in chrome |
| Brand hub (Bullpadel) | Solid after retry |
| Buying guide (choose racket) | Good structure **spoiled** by FlipBelt + prod-map cards |
| Research shapes | Honest cohort stats; research titles need human labels |

**Canary question:** “Would this look professionally researched if I’d never seen the code?”  
**Answer:** Hub / flagship PDPs / Best rackets / comparisons — mostly yes. Buying-guide estate and database chrome — **no**, not yet.

---

## Commerce (NL)

| Check | Result |
| --- | --- |
| Region chrome | NL / EUR in header |
| From-price on flagship PDPs | Present (Vertex, Genius 18K); Metalbone review empty in canary |
| Currency | EUR / € — no USD leakage observed on canaries |
| Finder pricing | Budget step present; results not fully exercised in this pass |
| Database pricing | From-price signals present in rendered table chrome |
| Offer freshness | Scorecard samples use NL offer IDs; full freshness matrix not re-proven here |

---

## SEO

| Check | Result |
| --- | --- |
| Hub robots | **`noindex, nofollow`** on `/padel` |
| Deep pages | Default indexable (no robots meta) on PDP / Best / category / database canaries |
| Canonical | Present and self-consistent on canaries |
| Sitemap | Padel deep URLs present; **hub/categories/database/research absent** |
| Structured data | Product/review pages emit JSON-LD; research flagged missing expected JSON-LD |
| Orphans / future | Soft-gated accessories/clothing **404**; 126 HIDDEN_404 entities correctly held |
| Duplicate risk | Hub noindex while deep indexable is an IA smell, not a duplicate-title proof |

---

## Performance / accessibility (spot)

| Signal | Observation |
| --- | --- |
| Hub HTML | ~338 KB |
| Review / Best / Database HTML | ~530–540 KB |
| Hero weight | **~1.97 MB** padel hero (PNG bytes behind `.jpg`) — LCP risk |
| Empty/missing `alt` | 12 / 54 `<img>` on hub (includes decorative risk) |
| Mobile / keyboard | Not instrumented with Lighthouse in this pass; no blocking keyboard trap observed in spot checks |

---

## Manual canary matrix

| Canary | HTTP | Shopper verdict |
| --- | --- | --- |
| `/padel` | 200 | Strong layout; noindex + fitness media |
| `/padel/rackets` | 200 | Professional catalog |
| `/padel/shoes` | 200 | OK; fitness-path heroes |
| Vertex / Genius 18K / Metalbone PDPs | 200 | Strong; SKU wording / pricing gaps |
| 3 reviews | 200 | Strong expert-research |
| 3 Best Guides | 200 | Strong; shoes media path issue |
| 3 comparisons | 200 | Strong |
| 3 alternatives | 200 | Mostly strong; Siux brief defects |
| Finder | 200 | Clean |
| Database | 200 | Useful but schema-leaky |
| `/brands/bullpadel` | 200 | OK |
| Choose-racket guide | 200 | **Not ship-ready** (running image + prod maps) |
| Research shapes | 200 | OK cohort page |

---

## Top remediation themes (next pass — do not fix here)

1. Strip guide “maps to prod-* / illustrates the category” cards; replace with shopper reasons  
2. Replace running FlipBelt / running concept art on every padel guide  
3. Ban public `SKU` / `weightMin` / `widthOptions` / raw `prod-` IDs  
4. Fix Nox Alum XTREM hero mapping; move padel shoe/overgrip media out of `/images/fitness/` or stop promoting those paths on padel surfaces  
5. Decide hub indexability: either index `/padel` when selective deep kinds are live, or keep hub noindex **and** stop treating it as the primary discovery URL in sitemap strategy  
6. Update tests that still assert padel is held  
7. Compress hub hero; fill alts  

---

## Final verdict

# **NO-GO**

Required zeros fail on machine copy, token/schema leakage, wrong-sport/wrong-product images, and broken decision fragments. Do not treat the vertical as production-clean until a remediation pass drives confirmed BLOCKER/HIGH rendered defects to zero.
