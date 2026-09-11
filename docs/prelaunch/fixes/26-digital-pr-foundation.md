# Fix 26 — SEO Authority & Digital PR Foundation

**Mode:** Off-site authority foundation (planning + inventory only)  
**Date:** 2026-09-06  
**Hard rules:** Do **not** buy links · Do **not** automate spam outreach · Do **not** invent experts or studies · Do **not** contact anyone from this remediation  
**Evidence:** `docs/prelaunch/data/26-digital-pr-coverage.json` · catalog snapshot via `scripts/tmp/prelaunch-26-*.ts`  
**Related:** `docs/backlink-opportunities.md` · `data/staging/site-quality/known-backlinks.json` · `data/staging/site-quality/outreach-pipeline.json`

---

## 0. Verdict

Kitletics already owns **linkable utilities** (finders, calculators, compare) and **citeable technical explainers**, plus a **structured running-shoe catalog** with near-complete spec coverage (83 published/visible shoes × weight / drop / stack / plate / cushion / terrain / stability / genderFit).

What is missing for off-site authority is not “more on-page SEO” — it is:

1. A **reusable data-study page type** (`/studies/[slug]`) that publishes catalog-derived snapshots with methodology + limitations  
2. A **manual outreach ledger** (now stubbed) tied to verified backlinks  
3. Discipline to pitch **only** claims the catalog can support (cross-sectional snapshots, not fabricated longitudinal “market trends”)

Known earned links today: **0** (`known-backlinks.json` → `links: []`). That is honest Day-1 state, not a failure of this report.

---

## 1. Linkable asset inventory

Prioritize pages others can **cite, embed, or bookmark** — not thin PDPs or name-swapped reviews (Fix 25 held those from index).

### 1.1 Finders (decision tools)

| Asset | Path | Link potential | Day-1 note |
|---|---|---|---|
| Running Shoe Finder | `/tools/running-shoe-finder` | **Highest** — classic utility citation | INDEXABLE core |
| Fitness Watch Finder | `/tools/fitness-watch-finder` | High | Running + training |
| Running HRM Finder | `/tools/running-hrm-finder` | Medium–high | Soft-gated category caution in commerce copy |
| Hydration / fuel / recovery / accessories finders | `/tools/running-*-finder` | Medium | Useful; category soft-gates reduce pitch priority |
| Apparel finder | `/tools/running-clothing-finder` | Medium | Soft-gated |
| HYROX / training / home-gym / racket finders | `/tools/*` | Lower for Day-1 PR | Verticals soft-held / not primary launch story |

### 1.2 Calculators & planners

| Asset | Path | Link potential |
|---|---|---|
| Running Pace Calculator | `/tools/running-pace-calculator` | **Highest** — evergreen coach/club cite |
| Race Time Predictor | `/tools/race-time-predictor` | **Highest** — race-week utility |
| Shoe Rotation Planner | `/tools/shoe-rotation-planner` | **High** — distinctive vs generic pace tools |
| 1RM / plate calculators | `/tools/one-rep-max-calculator`, `/tools/plate-calculator` | Medium (fitness) |
| HYROX race time calculator | `/tools/hyrox-race-time-calculator` | Niche medium |

### 1.3 Comparison & structured datasets

| Asset | Path | Link potential |
|---|---|---|
| Compare builder | `/compare`, `/tools/compare-products` | Medium–high (interactive) |
| Pair comparisons | `/compare/[slug]` | Medium when unique analysis (Fix 25 NEEDS_DIFF held) |
| Product catalog | `/products/[slug]`, category hubs | Medium as **data source**, weak as link bait alone |
| Best guides | `/best/[slug]` | High when decision-complete (44 INDEXABLE) |

### 1.4 Running guides & technical explainers (citeable)

Strongest **editorial** link targets (published buying guides; indexable subset ~34 of 68):

| Slug | Why citeable |
|---|---|
| `/guides/running-shoe-drop` | Canonical explainer + pairs with catalog drop stats |
| `/guides/running-shoe-cushioning` | Same for cushion taxonomy |
| `/guides/carbon-vs-nylon-plates` | Plate material story (catalog: carbon 10 / nylon 3 / composite 2 / none 68) |
| `/guides/stability-shoes-explained` | Stability taxonomy (neutral 62 / stability 12 / mild-stability 9) |
| `/guides/what-is-a-daily-trainer` | Role definition for Best/finder handoffs |
| `/guides/running-shoe-rotation` | Pairs with Rotation Planner |
| `/guides/road-vs-trail-running-shoes` | Terrain split |
| `/guides/how-to-choose-running-shoes` | Hub explainer |
| `/guides/multi-band-gps-running-watches` | Watch tech + 33/33 multi-band field coverage |
| `/guides/optical-wrist-hr-vs-chest-strap` | HRM decision framework |
| `/guides/beginner-vs-advanced-running-watch` | Feature ladder |

Fitness / padel / HYROX explainers exist but are **secondary** for first-60-day Running-led PR.

### 1.5 Decision frameworks & trust (authority, not “virality”)

| Asset | Path | Role |
|---|---|---|
| Methodology hub | `/methodology` | Process citation |
| How we review | `/how-we-review` | Review-type honesty |
| Evidence policy | `/evidence-policy` | Anti-fake-study credibility |
| Scoring methodology | `/scoring-methodology` | Score interpretation |
| Editorial policy | `/editorial-policy` | Corrections / non-claims |
| Affiliate disclosure | `/affiliate-disclosure` | Required near commercial pitches |

### 1.6 Gear statistics / product data analysis

**Not a public route yet.** Spec distributions are **computable today** from the catalog (see §4) but need a `/studies/[slug]` template (§5) before pitching “Kitletics data.”

---

## 2. Link gap — target categories

Prospect **categories** for manual research (no domains invented as “we contacted”):

| Category | Why | Typical asset fit |
|---|---|---|
| Running publications | Editors cite tools + data explainers | Calculators, studies, drop/cushion guides |
| Sports publications | Broader lifestyle sports desks | Finder + Best shortlists |
| Running clubs | Coaches share utilities with members | Pace / race predictor / rotation |
| Coaches (online + local) | Program resources pages | Pace, race predictor, shoe finder |
| Race organizers | Athlete resource pages (NL + EU) | Race predictor, kit checklists |
| Fitness sites | Adjacent training audiences | Rotation, watch finder (careful: no fake HYROX authority) |
| Gear sites / retailers’ editorial | Spec explainers & comparisons | Guides, compare, studies |
| Sports-data / analytics blogs | Methodology + datasets | `/studies` snapshots + CSV-style tables |
| Universities / research (where relevant) | Rare; only if citing public catalog methods | Methodology + evidence policy — **never** fake papers |
| Local NL running resources | Primary commerce region (NL offers **738**) | Dutch-language clubs, city run blogs, event pages |

**Qualification filters (always):** topical overlap · real audience · no PBN/link schemes · no paid placement · can cite without inventing Kitletics metrics (no DA/DR theater).

---

## 3. Digital PR ideas (catalog-led, non-fabricated)

Ideas are **angles**, not published conclusions. Only ship after computing + disclosing scope (§4–5).

| Idea | Credible from catalog? | Caution |
|---|---|---|
| Running shoe **weight distribution** (catalog snapshot) | **Yes** — 83/83 weights | Label as Kitletics catalog, not “the market” |
| **Drop** distribution | **Yes** — 83/83 | Median **8 mm** in snapshot; do not overclaim industry-wide |
| **Heel / forefoot stack** bands | **Yes** — 83/83 | Manufacturer stack definitions vary — state in limitations |
| **Plated share** + plate material mix | **Yes** — plate + plateMaterial 83/83 | “In our published shoe set” not “race-shoe market 2026” |
| **Cushion-level mix** | **Yes** | Taxonomy is Kitletics labels |
| **Stability / terrain mix** | **Yes** | Same |
| **Width-option availability** | **Partial** — widthOptions ~77/83; wide-hint subset ~34 | Count options listed, don’t invent fit outcomes |
| Men vs women **model availability** | **Weak as drama** — genderFit `men,women` **79**, unisex **4**; variants men/women **79/79** | Do **not** invent a gender gap story; honest note is near-parity dual listing |
| **Race-shoe market analysis** | **Partial** — plated/carbon subset only | Small n (carbon **10**); exploratory only |
| GPS watch **feature presence** | **Partial** — 33 watches; display/touch/multi-band/maps/music **33/33**; weight **21**; battery **0** | No battery claims until field filled |
| **Price trends** over time | **No** (today) | Offers are point-in-time (NL/UK/DE/US). Publish **price bands snapshot** only, dated |
| NL offer **price bands** for shoes | **Yes as snapshot** — NL shoe offers n≈92, med≈€150 (seed/verification window) | Disclose offer freshness / regional gaps (US n=3) |

---

## 4. Original data — what can be calculated now

Coverage evidence: `docs/prelaunch/data/26-digital-pr-coverage.json`.

### 4.1 Ready (compute → chart → study page)

| Metric | n | Snapshot (2026-09-06 catalog) |
|---|---:|---|
| Weight (g) | 83 | min **170** · p25 **240** · med **275** · p75 **292** · max **315** |
| Drop (mm) | 83 | min **0** · p25 **6** · med **8** · p75 **8** · max **12** |
| Heel stack (mm) | 83 | min **23** · p25 **34** · med **37** · p75 **39** · max **45.5** |
| Plate material | 83 | none **68** · carbon **10** · nylon **3** · composite **2** |
| Cushion level | 83 | high **39** · maximum **19** · medium **15** · moderate **9** · low **1** |
| Stability | 83 | neutral **62** · stability **12** · mild-stability **9** |
| Terrain (raw labels) | 83 | road-dominant; trail subset present |
| genderFit | 83 | men,women **79** · unisex **4** |
| Audience variants | — | men **79** · women **79** · unisex **4** |
| GPS watches core flags | 33 | multiBand/maps/music/display/touch **complete**; battery **missing** |

### 4.2 Ready with caveats

- **NL/UK/DE price bands** from offers (1293 priced; NL 738) — cross-section only  
- **Width options** presence counts — not clinical width performance  

### 4.3 Blocked until data work

| Story | Blocker |
|---|---|
| Multi-year weight/drop/price **trends** | No historical catalog snapshots / offer time series |
| Battery-life watch rankings | `battery` coverage **0/33** |
| Biological men-vs-women performance claims | Out of scope; not in catalog |
| “Market share” / sell-through | No retail volume data |
| First-hand lab studies | Evidence policy: **zero** first-hand reviews |

**Rule:** every public number must recompute from repository products/offers on a stated `asOf` date.

---

## 5. Linkable landing page template — `/studies/[slug]`

Design a reusable **editorial data-study** page (not implemented in this fix; implement before first PR push).

### 5.1 Route & content model

```text
/studies                     → index of published studies
/studies/[slug]              → one study
```

Suggested front-matter / CMS fields:

| Field | Purpose |
|---|---|
| `title`, `dek`, `publishedAt`, `updatedAt`, `asOf` | Dating honesty |
| `datasetScope` | e.g. “83 published visible running shoes in Kitletics catalog” |
| `inclusionCriteria` | publish + visibility + category gates |
| `methodology` | How fields are read (spec keys, units, plate true/false) |
| `findings[]` | Short claims **tied to charts/tables** only |
| `charts[]` | Chart type + series from computed JSON |
| `citationStats[]` | Embeddable one-liners + machine values |
| `limitations[]` | Required — catalog ≠ whole market |
| `sources[]` | Internal product IDs / offer query description — not fake papers |
| `relatedGuides[]`, `relatedTools[]` | Internal links |
| `downloadableSummary` | Optional JSON/CSV of aggregates (not raw PII) |

### 5.2 Required page sections (in order)

1. **Title + one-sentence finding** (no hype)  
2. **Dataset scope** — n, category, publish filters, `asOf`  
3. **Methodology** — field definitions, units, how plated/cushion labels work  
4. **Charts + tables** — distributions first; no decorative stock  
5. **Findings** — bullets that restate the charts; no extrapolation  
6. **Citation strip** — 3–5 copy-paste stats with permalink anchors (`#stat-median-drop`)  
7. **Limitations** — selection bias, manufacturer stack variance, no longitudinal claim  
8. **Sources / evidence** — link `/evidence-policy`, `/methodology`; list computation script or repo query description  
9. **Related** — Finder / Best / explainer guides  
10. **Affiliate disclosure** if any product CTAs appear (prefer none on study pages)

### 5.3 Citation-friendly embed pattern

```html
<blockquote cite="https://kitletics.com/studies/running-shoe-spec-snapshot-2026">
  In the Kitletics published running-shoe catalog (n=83, as of YYYY-MM-DD),
  median listed weight was 275 g and median drop was 8 mm.
</blockquote>
<p>Source: <a href="…">Kitletics Running Shoe Spec Snapshot</a></p>
```

Provide a **Copy citation** control; never invent third-party endorsements.

### 5.4 Visual / SEO notes

- One composition: chart + finding, not a dashboard of unrelated widgets  
- `Article` / `Dataset` schema only with real dates and authors (**Kitletics Editorial** desk — no fake PhDs)  
- Canonical study URL; no query-string variants  
- Index only when methodology + limitations + n ≥ clear threshold (recommend **n ≥ 30** for distribution studies)

### 5.5 First study candidate (when built)

**Working title:** *Kitletics Running Shoe Spec Snapshot*  
**Slug:** `running-shoe-spec-snapshot-2026`  
**Computable now:** weight, drop, heel stack, plate material, cushion, stability, terrain mix.

---

## 6. Outreach system (manual)

Ledger: `data/staging/site-quality/outreach-pipeline.json` (empty `rows[]`).  
Verified links: `data/staging/site-quality/known-backlinks.json`.

### 6.1 Workflow

```text
prospect → qualification → contact → pitch → follow-up → result
                                                         ↓ (if linked)
                                              link + anchor + targetUrl
                                              → append known-backlinks.json
```

| Stage | Owner action | Stop if |
|---|---|---|
| **Prospect** | Add org + category + URL | — |
| **Qualification** | Audience overlap, citation habits, NL relevance, no schemes | `qualified: false` |
| **Contact** | Find legitimate email/form; personalize | No public contact / do-not-contact |
| **Pitch** | One asset, one sentence of value for *them*, soft ask | Mass-identical templates |
| **Follow-up** | Max 1–2 polite nudges, spaced | Harassment / list-bombing |
| **Result** | Record outcome honestly | Invented “wins” |
| **Link / anchor / targetUrl** | Verify on live page before ledger | Unverified screenshots alone |

### 6.2 Pitch principles

- Lead with **reader utility** (pace tool for club members) or **clear dataset** (spec snapshot), not “link to us for SEO”  
- Offer **embed/citation** copy  
- Disclose affiliate relationship if the page monetizes  
- Never claim unpublished first-hand tests or university partnerships  

### 6.3 Explicitly forbidden

- Buying links / PBNs / link exchanges  
- Automated blast sequences / scraped email spam  
- Fake expert bylines or fabricated studies  
- Storing invented DA/DR or “contacted 500 sites” vanity metrics  

---

## 7. Launch assets — first 60 days (recommend 5)

| # | Asset | Why first | Proof / next step |
|---|---|---|---|
| 1 | **Running Pace Calculator** + **Race Time Predictor** | Highest natural cite rate for clubs/coaches | Ensure shareable URLs + short “how clubs use this” blurb on-page |
| 2 | **Running Shoe Finder** | Flagship decision utility | Keep Finder perf (Fix 19); deep-link from Best/guides |
| 3 | **Shoe Rotation Planner** | Differentiated vs generic calculators | Pair outreach with `/guides/running-shoe-rotation` |
| 4 | **Explainer cluster** — drop · cushioning · carbon vs nylon | Editors cite definitions | Add “In our catalog (n=83)…” callout **only after** study page or inline computed aside |
| 5 | **First `/studies` page** — Running Shoe Spec Snapshot | Original data PR without fake research | Implement template §5; compute from §4; then manual pitch to gear/data writers |

**Defer for 60 days:** fitness/racket finders as PR heroes; longitudinal price “trends”; gender-gap narratives; watch battery stories.

**Trust bundle (always available, not “viral”):** `/methodology` + `/evidence-policy` — attach when a journalist asks “how do you know?”

---

## 8. Deliverables created

| Artifact | Path |
|---|---|
| This report | `docs/prelaunch/fixes/26-digital-pr-foundation.md` |
| Coverage snapshot | `docs/prelaunch/data/26-digital-pr-coverage.json` |
| Outreach ledger (empty) | `data/staging/site-quality/outreach-pipeline.json` |
| Existing backlink ledger | `data/staging/site-quality/known-backlinks.json` (unchanged, still empty) |

### Not done (by design)

- No outreach sent  
- No `/studies` route implemented yet  
- No purchased or automated links  
- No fabricated conclusions published as facts  

---

## 9. Suggested follow-on (engineering / editorial)

1. Implement `/studies` + first snapshot page from §5 / §7#5  
2. Wire study aggregates to a small `src/lib/studies/` compute module (deterministic from repositories)  
3. Add “Cite this” blocks on Pace Calculator + Shoe Finder  
4. After first verified link, populate both ledgers  
5. Revisit watch battery + offer history before any “trends” PR  

---

## 10. Definition of done (this remediation)

- [x] Linkable asset inventory  
- [x] Backlink target categories  
- [x] Data-led PR ideas with honesty gates  
- [x] Computability matrix from verified catalog  
- [x] Study page template designed  
- [x] Manual outreach workflow + empty ledger  
- [x] 3–5 launch assets recommended  
- [x] Report filed under `docs/prelaunch/fixes/26-digital-pr-foundation.md`
