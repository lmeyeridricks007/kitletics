# Padel Data & Research Audit

**Date:** 2026-09-13  
**Scope:** Public Padel Racket Database (`/padel/rackets/database`) + research story infrastructure (`/research/*`)  
**Dataset citation version:** `2026.09` · `updatedOn`: **null** (no intentional stamp yet)

---

## 1. Executive summary

Kitletics now ships a **Padel Racket Database** mirroring the Running Shoe Database philosophy: a derived, catalog-backed data product with filters, market insights, research CSV, and gated research stories.

| Metric | Value |
|--------|------:|
| Eligible rackets | **58** |
| Brands | **14** |
| With published shape | **53** (91.4%) |
| With weightMin | **47** (81.0%) |
| With verified price | **10** (17.2%) |
| Research: shapes | **PUBLISH** |
| Research: weight | **PUBLISH** |
| Research: prices | **WITHHOLD** (10 &lt; 25) |
| Research: market-2026 | **PUBLISH** (shapes + weight ready; prices optional withheld) |

**Vertical hold:** Padel launch mode is `disabled`. Deep PDPs remain `HIDDEN_404`. Database eligibility deliberately does **not** use `isLaunchListable` (that would yield 0 rows). Cohort = category `cat-padel-rackets` + sport `sport-padel` + `canFeatureProduct` (published + authentic media + not discontinued). Documented as *catalog-eligible with authentic media; vertical still held for deep URLs.*

**Indexation:** Database + research pages use `robots: noindex,follow` while the vertical is disabled. Filtered query states also noindex via `hasNonCanonicalQueryState`. **Not added to sitemap** while noindex.

---

## 2. Dataset size & brand assortment

**Total eligible models:** 58  
**Brand count:** 14

| Brand | Models |
|-------|-------:|
| Bullpadel | 15 |
| Adidas Padel | 10 |
| Head | 9 |
| Nox | 5 |
| Babolat | 4 |
| Siux | 3 |
| StarVie | 3 |
| Kuikma | 2 |
| Wilson | 2 |
| Lok | 1 |
| Oxdog | 1 |
| Royal Padel | 1 |
| Tecnifibre Padel | 1 |
| Varlion | 1 |

These counts are **Kitletics catalog-eligible models only**. They are **not** industry-wide market-share claims.

---

## 3. Field coverage (% of eligible cohort)

| Field | Known | Coverage |
|-------|------:|---------:|
| shape | 53 | 91.4% |
| balance | 49 | 84.5% |
| weightMin | 47 | 81.0% |
| weightMax | 47 | 81.0% |
| core | 56 | 96.6% |
| feel | 16 | 27.6% |
| faceMaterial | 55 | 94.8% |
| surfaceTexture | 34 | 58.6% |
| playerLevel | 58 | 100% |
| playStyle / use-cases | 58 | 100% |
| price (verified offer) | 10 | 17.2% |
| powerScore | 58 | 100% |
| controlScore | 58 | 100% |
| reviewSlug | 12 | 20.7% |

### Weight policy

- Filters/sorts/statistics use **`weightMin` only**.
- If `weightMax` exists and differs, UI shows a **range** (e.g. `360–375 g`).
- **No invented midpoints.** Unknown stays unknown.

### Shape distribution (n=53)

| Shape | Count |
|-------|------:|
| diamond | 21 |
| round | 13 |
| teardrop | 12 |
| hybrid | 5 |
| other | 2 |

### Balance distribution (n=49)

| Balance | Count |
|---------|------:|
| high | 22 |
| medium | 16 |
| low | 7 |
| mid-high | 2 |
| medium-high | 1 |
| mid-low | 1 |

### WeightMin buckets (n=47)

| Bucket | Count |
|--------|------:|
| Under 350 g | 7 |
| 350–365 g | 37 |
| 365–375 g | 3 |
| 375 g+ | 0 |

### Face material (n=55)

| Material | Count |
|----------|------:|
| carbon | 35 |
| carbon-hybrid | 11 |
| fiberglass | 8 |
| hybrid | 1 |

### Verified offer price buckets (n=10)

| Bucket | Count |
|--------|------:|
| Under €100 | 0 |
| €100–180 | 2 |
| €180–280 | 7 |
| €280+ | 1 |

---

## 4. Filters exposed vs soft-gated

Facet soft-gate rule (page data): expose only when known count ≥ 5 **and** coverage ≥ 15% of eligible catalog.

| Filter | Status | Notes |
|--------|--------|-------|
| brand | **Exposed** | Full brand list |
| shape | **Exposed** | 91.4% |
| balance | **Exposed** | 84.5% |
| weight buckets | **Exposed** | Uses weightMin |
| play style (use-case slugs) | **Exposed** | Curated padel-* slugs |
| face material | **Exposed** | 94.8% |
| core | **Exposed** | 96.6% |
| feel | **Soft-gated** | 27.6% &lt; 40% feel threshold — not exposed until denser |
| surface (texture) | **Exposed** | 58.6% |
| player level | **Exposed** | 100% |
| power / control / comfort / maneuverability buckets | **Exposed** | Only match when score exists |
| price buckets | **Exposed** (UX) | Thin coverage (10); charts/insights for price **withheld** until n≥25 |

Soft-gated facets currently: **feel** (and any facet failing absolute ≥5 and coverage ≥15%, or feel ≥40%).

---

## 5. Statistics computed

From `computePadelRacketMarketInsights`:

- Shape distribution (+ insight card when n≥8)
- Balance distribution (+ card)
- WeightMin bucket distribution (+ card)
- Face material distribution (+ card)
- Brand assortment sizes (+ card for brands with ≥3 models)
- Price distribution (**card withheld** until n≥25; currently 10)

Unit of analysis: **one product model**. Missing values omitted — never treated as zero. Affiliate commission never used.

---

## 6. Research story readiness

Thresholds (tunable in `src/lib/padel-research/stories.ts`):

| Story | Gate | Current | Status |
|-------|------|---------|--------|
| `padel-racket-shapes` | shape known ≥40 **and** ≥3 shape classes | 53 / 5 classes | **PUBLISH** |
| `padel-racket-weight` | weightMin known ≥35 | 47 | **PUBLISH** |
| `padel-racket-prices` | priced ≥25 | 10 | **WITHHOLD** |
| `padel-racket-market-2026` | shapes + weight stories ready; prices optional | deps ready | **PUBLISH** (no price section) |

When not ready, `/research/{slug}` shows methodology, sample size, data date (`null`), limitations, and a clear **“Not yet published — coverage insufficient”** banner. No fabricated findings.

### Identified stories (not shipped as findings yet)

| Candidate | Why deferred |
|-----------|--------------|
| Carbon vs fiberglass pricing | Needs priced ≥25 **and** material×price cross-tab stability |
| How shape changes beginner → advanced | Needs enough models per `playerLevel` × shape cell |
| Brand range width | Assortment table is on the database; dedicated research page optional |
| “How much does a padel racket cost in 2026?” | Same gate as `padel-racket-prices` (10 &lt; 25) |

---

## 7. Methodology & limitations

1. Rows derive from the same Kitletics product catalog — not a parallel spreadsheet.
2. Eligibility = `cat-padel-rackets` + `sport-padel` + `canFeatureProduct` (not launch-listable while vertical held).
3. Specs shown only when present; weight midpoints never invented.
4. Decision scores (power/control/comfort/maneuverability) are editorial attributes with provenance — not lab measurements.
5. Statistics describe **this cohort only** — not global padel market share.
6. Citation `updatedOn` remains null until an intentional stamp (mirror shoe dataset-meta).
7. Recommended sort = recommendationScore — **never** affiliate commission.

---

## 8. Affiliate neutrality

- Inclusion: catalog + media gates only.
- Sort: recommended / price / weightMin / power / control — no commission signals.
- Prices: lowest verified regional offer when present; labelled as offers, not MSRP.
- Disclosure: dataset about section + site affiliate disclosure.

---

## 9. Vertical hold note

| Concern | Behaviour |
|---------|-----------|
| Padel vertical mode | `disabled` |
| Deep product URLs | `HIDDEN_404` via launch eligibility |
| Database eligibility | `canFeatureProduct` path (not `isLaunchListable`) |
| Database robots | `noindex,follow` while disabled |
| Sitemap | **No** `/padel/rackets/database` entry while noindex |
| Soft discovery | Footer tools link on padel hub (preview/linkability) |

---

## 10. File inventory

### Lib — `src/lib/padel-racket-database/`

- `constants.ts`, `types.ts`, `eligibility.ts`, `build-records.ts`
- `params.ts`, `query.ts`, `get-page-data.ts`
- `analytics.ts`, `discovery.ts`, `index.ts`
- `quality/index.ts`
- `statistics/{helpers,insights,methodology,types,index}.ts`
- `citation/{dataset-meta,about-dataset,research-export,index}.ts`
- `charts/{build-explorer-data,types,index}.ts`

### Lib — `src/lib/padel-research/`

- `stories.ts`, `assess-story-readiness.ts`, `get-research-page-data.ts`, `index.ts`

### Components

- `src/components/padel-racket-database/{PadelRacketDatabasePage,Explorer,Card,DatasetAboutSection,MarketInsightCards}.tsx`
- `src/components/padel-research/PadelResearchPage.tsx`

### Routes

- `src/app/padel/rackets/database/page.tsx`
- `src/app/padel/rackets/database/research.csv/route.ts`
- `src/app/research/[slug]/page.tsx`

### Wiring

- `src/lib/analytics/types.ts` — `racket_database` page type + events
- `src/lib/analytics/page-context.ts` — path classification + view event
- `src/lib/sport-hub/config.ts` — padel footer tools → Racket Database

### Tests & docs

- `tests/padel-racket-database.test.ts`
- `docs/padel/PADEL-DATA-RESEARCH-AUDIT.md` (this file)

---

## 11. Verification

```bash
npx vitest run tests/padel-racket-database.test.ts
# 6 passed
```

Coverage numbers above were regenerated via a one-shot `tsx` script against live eligible records on 2026-09-13.
