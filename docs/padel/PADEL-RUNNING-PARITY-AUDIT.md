# Padel ↔ Running Shoes Forensic Parity Audit

**Date:** 2026-09-14  
**Mode:** READ-ONLY — no remediation in this pass  
**Benchmark:** Running Shoes (implementation + live kitletics.com)  
**Core question:** If a Padel page sat next to the equivalent Running Shoes page, would it look and feel like the same mature Kitletics platform?

**Artifacts**

| File | Role |
|---|---|
| [`RUNNING-PADEL-BENCHMARK-MATRIX.md`](./RUNNING-PADEL-BENCHMARK-MATRIX.md) | What Running actually does + Padel mapping |
| [`data/PADEL-PARITY-SCORECARD.json`](./data/PADEL-PARITY-SCORECARD.json) | Family verdicts + counts |
| [`data/PADEL-RUNNING-PARITY-PAGES.csv`](./data/PADEL-RUNNING-PARITY-PAGES.csv) | Dimension scores by page family |
| [`data/PADEL-PRODUCT-MEDIA-GAPS.csv`](./data/PADEL-PRODUCT-MEDIA-GAPS.csv) | Every padel product media row |
| [`data/PADEL-PDP-CONTENT-QUALITY.csv`](./data/PADEL-PDP-CONTENT-QUALITY.csv) | PDP description classifications |
| [`data/PADEL-EDITORIAL-MEDIA-GAPS.csv`](./data/PADEL-EDITORIAL-MEDIA-GAPS.csv) | Review/guide media density |
| [`data/PADEL-GUIDE-QUALITY.csv`](./data/PADEL-GUIDE-QUALITY.csv) | Best + buying guide quality |
| [`data/PADEL-REVIEW-QUALITY.csv`](./data/PADEL-REVIEW-QUALITY.csv) | Review depth + section media |

**Screenshot note:** Full desktop/mobile screenshot pairs could not be captured in this agent environment (`patchright` unresolved). Evidence instead uses code reverse-engineering, quantitative inventory scripts, and live HTTP probes (including Blob `/images` rewrites).

---

## 1. Executive verdict (by page family)

| Family | Verdict |
|---|---|
| Hub | **MAJOR_PARITY_GAPS** |
| Category — rackets | **MAJOR_PARITY_GAPS** |
| Category — soft goods | **SYSTEMIC_PARITY_FAILURE** |
| PDP — rackets | **MAJOR_PARITY_GAPS** |
| PDP — soft goods | **SYSTEMIC_PARITY_FAILURE** |
| Reviews | **MAJOR_PARITY_GAPS** |
| Best guides | **MAJOR_PARITY_GAPS** |
| Buying guides | **SYSTEMIC_PARITY_FAILURE** (visual/editorial storytelling) |
| Comparisons | **MAJOR_PARITY_GAPS** |
| Alternatives | **MAJOR_PARITY_GAPS** |
| Brands | **MAJOR_PARITY_GAPS** |
| Finder | **FUNCTIONALLY_READY_BUT_THIN** |
| Racket database | **PARITY_READY** (padel-specific strength) |

No overall GO/NO-GO. The backlog is real: Padel shares Running’s routes, but soft-goods media + category/guide visual systems are not Running-mature.

---

## 2. Running benchmark (what “good” actually is)

### 2.1 PDP media pattern

- Mechanism: primary hero + optional `PRODUCT_GALLERY_MEDIA` extras.
- **Reality:** 85 published running shoes → gallery **median 1**, **avg ~1.4**. Only **11/85** have extras.
- Vomero 18 PDP is **hero-only**. Richness for Running is **not** “many PDP gallery angles.”

### 2.2 PDP content pattern

- Shared `ProductDetailPage`: hero + gallery, quick facts, overview, performance/score factors, use-cases, compare rail, alternatives, specs, offers, review summary, guides/tools, FAQ.
- Shoe-specific config + strong shortDescription/verdict/strengths culture on flagship SKUs.

### 2.3 Review media pattern

- Template: `/reviews/nike-vomero-18`.
- Unique section files under `public/images/running/products/<slug>/sections/<topic>.*` (~15 topics).
- Resolver: `resolveReviewSectionVisuals` — one unique product `src` per section; never stamp hero everywhere.

### 2.4 Review content pattern

- Expert buying-guide voice; Buy if / Skip if; gauges with product-specific notes; assessment; long-form sections; comparisons; offers; methodology disclosure once.

### 2.5 Guide media / content pattern

- Best: pick cards with product heroes + methodology + considered set.
- Buying: `LongFormGuidePage` with distinct hero imagery and teaching sections (anatomy/factors/rails) — not a wall of text with one reused stock court shot.

### 2.6 Category pattern

- **Dedicated** `RunningShoesCategoryPage`: collage hero, type nav, best+finder, “how you run” editorial, then catalog, guides, brands.
- This is the largest **template** gap vs Padel.

---

## 3. Padel current state (evidence)

### 3.1 Exact hero coverage (all padel products in inventory)

From `PADEL-PRODUCT-MEDIA-GAPS.csv` / scorecard:

| Family | Total | Exact hero file | Missing / unusable |
|---|---:|---:|---:|
| Rackets | 62 | 57 | 5 |
| Shoes | 41 | 7 | 34 |
| Balls | 62 | 44 | 18 |
| Bags | 124 | 65 | 59 |
| Grips | 85 | 29 | 56 |
| Accessories | 84 | 21 | 63 |
| **All** | **458** | **~223** | **~235** |

Provenance on missing soft goods is heavily **PLACEHOLDER**. Racket heroes are mostly MANUFACTURER / AUTHORIZED_RETAILER / UNKNOWN-but-file-present.

**Operational finding:** Even when local files exist, production previously 404’d padel product heroes because Blob upload lagged (`public/images/**` is gitignored). That is why browsing felt “images missing” after a code-only launch.

### 3.2 Gallery coverage

| Metric | Running shoes | Padel all |
|---|---:|---:|
| Gallery avg | 1.4 | 0.83 |
| Gallery median | 1 | 1 |
| Zero usable hero | ~0 among published shoes | **235** products |

**Interpretation:** Matching Running on gallery count is mostly already true for rackets that have a hero. Soft goods fail before “second angle” matters.

### 3.3 PDP description quality

Classifier in audit script (heuristic, not final editorial judgment) on assembled buyer-facing fields:

- Padel published sample skews **GOOD** for rackets with PDP copy stores.
- Soft goods frequently **UNHELPFUL** / thin decision support even when fields exist.
- Running sample also showed many THIN rows under the same short-field heuristic — meaning **field-length heuristics alone are insufficient**; manual read still required. Flagship Running PDPs still feel richer in the dedicated shell + score narrative.

Manual read themes (samples):

- Racket PDPs: shape/balance/weight language present; still often research-voice residue.
- Soft PDPs: manufacturer listing tone; missing capacity/compartment/material depth → **DATA PROBLEM** as often as prose problem.
- Gauge notes (pre-fix): “Manufacturer sheet.” repeated — methodology leakage into UI (user-visible failure Running does not show).

### 3.4 Review media coverage

| Metric | Running sample (25) | Padel (26) |
|---|---:|---:|
| Avg section files on disk | 15 | 16.5 |
| Reviews with 0 section files | 0 | **5** |
| Flagship examples | Vomero full set | Vertex/Hack/Indiga/AT10 often 18–24 files |

So the story is **not** “Padel has no review images in the repo.” It is:

1. Coverage is uneven (5 empty).  
2. Soft-goods reviews lag.  
3. Section variants can still look like “same racket, different crop” vs Running’s clearer section storytelling.  
4. Live experience previously degraded when product/section Blob paths 404’d.

### 3.5 Best / buying guide media

- Padel Best guides: **39** (large estate).
- Padel buying guides: **26**.
- On-disk unique padel guide heroes: **~3** files (`choose-racket`, `choose-shoes`, `grips`); hub map **reuses** choose-racket for shape guides.
- Running buying guides map to richer distinct imagery.
- Result: Padel guides read as **text-first**; Running guides read as **taught with visuals**.

### 3.6 Category / hub

- Hub structure matches Running declarative stack.
- Category: Padel uses generic `CategoryPage`; Running shoes use a purpose-built experiential page. This is a first-order “feels immature” driver even when catalog counts are fine.

---

## 4. PDP section parity (implementation-level)

| Section | Running | Padel | Parity | Quality note |
|---|---|---|---|---|
| Hero identity | Yes | Yes | Match | Soft goods often no hero |
| Gallery | 1–6 (usually 1) | Usually 0–1 | Soft fail | Don’t invent multi-angle mandate |
| Verdict / summary | Yes | Yes (rackets stronger) | Partial | Soft thin |
| Key specs | Yes | Yes | Match | Soft specs incomplete |
| Best for / not ideal | Yes | Yes when editorial present | Partial | |
| Buy if / skip if | Yes | Rackets via padel editorial | Partial | |
| Performance / scores | Yes | Decision attrs / score factors | Partial | Gauge notes were junk |
| Alternatives | Yes | Yes | Match | Needs imagery |
| Offers | Yes | Yes when commerce present | Partial | |
| Review summary | Yes | Yes when review exists | Partial | Estate smaller |
| Guides / tools | Yes | Yes | Match | |

---

## 5. Gaps backlog (remediation-oriented, still no fixes here)

### Products needing images (priority)

1. **Padel shoes** — 34/41 missing usable hero.  
2. **Accessories** — 63/84 missing.  
3. **Grips** — 56/85 missing.  
4. **Bags** — 59/124 missing.  
5. **Balls** — 18/62 missing.  
6. **Rackets** — 5 residual missing.

### Products needing additional images

- Only where Running peers in the same commercial tier have gallery extras **or** review/section storytelling requires distinct crops.
- Do **not** mass-generate second angles solely to beat a fake “gallery≥3” gate.

### Products needing rewritten descriptions

- Soft goods with UNHELPFUL/GENERIC classes + missing specs (capacity, compartments, material, court use).
- Any public UI still emitting methodology labels under scores.

### Reviews needing media

- **5** padel reviews with zero section files (see `PADEL-REVIEW-QUALITY.csv`).
- Soft-goods reviews without section dirs.
- Visual QA pass on whether section variants look “same hero stamped.”

### Reviews needing rewrite

- Gauge notes / methodology voice.
- Any review failing Vomero Buy-if/Skip-if depth or peer naming.

### Guides needing media

- Nearly all buying guides need distinct heroes + inline diagrams/product examples.
- Best guides for soft categories need product heroes that exist.

### Guides needing rewrite

- Best guides with thin recommendation rationales.
- Buying guides that teach vocabulary without decision trade-offs.

### Temporary noindex candidates

- Soft category shells where majority of listable cards lack authentic heroes.
- PDPs that are public but media-blocked.
- Best/buying URLs that are indexable yet visually empty vs Running peers.

---

## 6. Root causes

| Layer | Cause |
|---|---|
| **Data** | Soft-goods specs incomplete → prose cannot be specific without inventing facts |
| **Media** | Incomplete secondary registries; Blob upload not part of launch checklist; gitignore hides absences from Git review |
| **Content generation** | Racket builders strong; soft editorial + gauge notes weaker; uniqueness metrics gamed |
| **Templates** | No `RunningShoesCategoryPage` analog; buying guide visual system underused |
| **Quality gates** | Prior audits optimized for file-exists / not-wrong / chars / tokens / READY — not Running visual parity |

---

## 7. Audit the auditor (why prior Padel audits passed)

Prior zero-debt / launch audits proved:

- image **file path resolves locally**
- hero not obviously wrong brand
- enough characters / not machine-regex
- indexable disposition
- token leakage zero

They did **not** prove:

- Blob-served production imagery
- Running category experiential parity
- Soft-goods hero completeness
- Guide visual teaching density
- Gauge notes as buyer advice
- Manual side-by-side “same platform?” judgment

### Replacement gates (proposed for next phase — not implemented here)

1. **Blob HTTP 200** for every public product primary via `/images/...` rewrite.  
2. Soft category **hero coverage threshold** or forced noindex.  
3. Primary category must use **Running-equivalent shell** checklist.  
4. Flagship reviews: **resolved unique section image count ≥ Running template**.  
5. Buying guides: distinct hero + ≥N inline visuals with semantic purpose.  
6. Ban public score notes matching methodology denylist.  
7. Mandatory **manual Running-pair visual QA** before READY.

---

## 8. Publication readiness reassessment

| Surface | Reassessment |
|---|---|
| `/padel` hub | `FUNCTIONALLY_READY_BUT_THIN` |
| `/padel/rackets` | `FUNCTIONALLY_READY_BUT_THIN` (shell gap) |
| `/padel/shoes|bags|grips|accessories` | `MEDIA_BLOCKED` / `NOINDEX_REQUIRED` until hero coverage fixed |
| Racket PDPs with heroes | `FUNCTIONALLY_READY_BUT_THIN` |
| Soft PDPs without heroes | `MEDIA_BLOCKED` |
| Flagship racket reviews with section sets | `FUNCTIONALLY_READY_BUT_THIN` (voice/visual QA) |
| Reviews with 0 sections | `MEDIA_BLOCKED` |
| Buying guides | `CONTENT_BLOCKED` on visual storytelling |
| Best guides | Mixed; soft picks `MEDIA_BLOCKED` |
| Database | `RUNNING_PARITY_READY` as a surface |

“INDEXABLE” from launch eligibility is **not** a Running-parity certificate.

---

## 9. Manual sample plan status

Quantitative inventory covered all padel products for media and all padel reviews/guides for section/file metrics.

Representative live pairs probed:

- `/running` ↔ `/padel`
- `/running/shoes` ↔ `/padel/rackets` (+ bags)
- `/products/nike-vomero-18` ↔ `/products/bullpadel-vertex-05-2026`
- `/reviews/nike-vomero-18` ↔ `/reviews/bullpadel-indiga-ctr-2026`
- `/best/running-shoes` ↔ `/best/padel-rackets`
- `/guides/how-to-choose-running-shoes` ↔ `/guides/how-to-choose-a-padel-racket`

Full screenshot matrix deferred until browser tooling is available; HTTP evidence shows section PNGs for padel flagships **are** reachable on Blob after upload.

---

## 10. Bottom line

Padel is **architecturally on the Running platform**, but **not at Running maturity**.

- Soft-goods media is a **systemic** failure.  
- Category/guide **visual systems** are a **systemic** failure vs Running shoes.  
- Racket PDP/review/hub are **major gaps** (shell, voice, consistency, ops Blob), not a greenfield missing stack.  
- Database/finder show Padel can exceed Running in specific tools — that does not offset soft-goods emptiness.

**Next step (out of scope for this pass):** turn this backlog into a remediation program ordered by soft-goods heroes → category shell → guide visuals → review/voice QA — with gates that measure Running parity, not file existence alone.
