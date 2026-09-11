# Kitletics — Final Release Candidate Review

**Document ID:** `FINAL-RELEASE-CANDIDATE`  
**Mode:** Complete fresh **READ-ONLY** launch review  
**Audit clock:** `2026-09-06T23:00:00.000Z`  
**Lab:** production-equivalent `next build` + `next start` @ `http://127.0.0.1:3010`  
**Absolute rule:** No code/content/threshold/test/build-config changes during this review  

**Companion:** [`FINAL-RELEASE-CANDIDATE-EXECUTIVE.md`](FINAL-RELEASE-CANDIDATE-EXECUTIVE.md)

---

# FINAL STATUS

# **NO-GO**

## Blockers (2)

| ID | Evidence |
|---|---|
| **CI tests FAIL** | `npm test` **EXIT 1** — 553 pass / **1 fail**: Best INDEXABLE **44** vs assertion ≤**12** |
| **Sitemap 404s** | **4 / 664** INDEXABLE sitemap comparisons return **HTTP 404** (missing peer product) |

These meet the §35 blocker definition (CI failure + sitemap 404 problem). **Not ready to go live.**

---

## 1. Clean release build (exact exits)

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **0** | 0 errors, 72 warnings |
| `npm run typecheck` | **0** | clean |
| `npm test` | **1** | **LAUNCH BLOCKER** |
| `npm run build` | **0** | no ignoreBuildErrors / --no-lint |

Build First Load JS shared: **103 kB**. Finder: **130 kB**. `/tools/[slug]`: **166 kB**. Middleware: **34.2 kB**.

Logs: `docs/prelaunch/data/rc-final/logs/{lint,typecheck,test,build}.log`

---

## 2–3. URL universe & eligibility reconciliation

| Metric | Count |
|---|---:|
| Sitemap URLs (`sitemap()`) | **664** |
| Day-1 INDEXABLE (export mirror) | **664** (0 drift) |
| Held / non-Day-1 tracked | **1154** |
| Entity eligibility INDEXABLE (sim) | **548** |
| Sitemap HTTP probe | **660 × 200** · **4 × 404** |

**Artifacts**

- [`data/FINAL-DAY1-URLS.csv`](data/FINAL-DAY1-URLS.csv)
- [`data/FINAL-HELD-URLS.csv`](data/FINAL-HELD-URLS.csv)
- [`data/FINAL-URL-RECONCILIATION.csv`](data/FINAL-URL-RECONCILIATION.csv) — includes HTTP_status from probe
- [`data/rc-final/universe-summary.json`](data/rc-final/universe-summary.json)
- [`data/rc-final/sitemap-http-probe.json`](data/rc-final/sitemap-http-probe.json)

### Broken sitemap URLs (must be explainable — currently bugs)

| URL | HTTP | Eligibility | Cause |
|---|---:|---|---|
| `/compare/lululemon-hotty-hot-vs-janji-pace-short` | 404 | INDEXABLE | Missing peer product |
| `/compare/theragun-prime-vs-renpho-r3` | 404 | INDEXABLE | Missing peer product |
| `/compare/triggerpoint-grid-vs-grid-x` | 404 | INDEXABLE | Missing peer product |
| `/compare/oofos-ooriginal-vs-hoka-ora-recovery-slide` | 404 | INDEXABLE | Missing peer product |

### Day-1 by page type

Home 1 · Static 19 · Sport 1 · Disciplines 6 · Category 11 · Subcategory 5 · Product **251** · Alternatives 74 · Brand **103** · Review **43** · Best **44** · Comparison **55** · Guide **34** · Setup 5 · Finder 8 · Calculator 2 · Tool 1 · Author 1

---

## 4–6. Running launch + products + shoes

### Running coverage (eligibility / quality)

| Surface | TOTAL | QUALITY READY | DAY-1 INDEXABLE | HELD |
|---|---:|---:|---:|---:|
| Products | 367 | 362 | 251 | 116 |
| Reviews | 367 | 43\* | 43 | 324 |
| Best | 44 | 44 | 44 | 0 |
| Guides | 41 | 41 | 34 | 7 |
| Comparisons | 69 | 69 | 55 | 14 |
| Brands | 105 | 67 | 67 | 38 |
| Categories | 16 | 12 | 12 | 4 soft-gate |
| Subcategories | 5 | 5 | 5 | 0 |
| Finders | 8 | 8 | 8 | 0 |
| Calculators | 2 | 2 | 2 | 0 |
| Gear Setups | 5 | 5 | 5 | 0 |

\*Domain assessor INDEXABLE reviews = 43 after uniqueness holds.

**Running matrix:** [`data/FINAL-RUNNING-MATRIX.csv`](data/FINAL-RUNNING-MATRIX.csv)  
11 READY · 1 READY_WITH_MINOR_ISSUES (shoes) · 4 HOLD (soft-gated clothing/sunglasses/accessories/nutrition)

### Product quality (audit 02, fresh)

| Class | Sitewide | Running | Shoes |
|---|---:|---:|---:|
| LAUNCH_READY | 399 | 367 | **83** |
| NEEDS_MINOR_WORK | 146 | 0 | 0 |
| THIN | 78 | 0 | 0 |
| BLOCKED | 94 | 71 | **1** (draft example) |

Media authentic **100%** on published shoes; offers present on shoe set.

**Non–launch-ready shoes (product audit):** draft `ASICS Example Unpublished Trainer` only in `shoesNotLaunchReady`.  
**Note:** eligibility export also flagged `new-balance-fuelcell-rebel-v4` under domain assessor while forensic 02 classifies it LAUNCH_READY — assessor reconciliation residual (not auto-fixed).

---

## 7–8. Reviews & uniqueness

| Metric | Value |
|---|---|
| Editorial first-hand blockers | **0** |
| Visible first-hand reviews | **0** |
| Uniqueness DUPLICATIVE reviews | **521** |
| NEEDS_DIFF reviews | **18** |
| Day-1 review holds | **539** |
| INDEXABLE reviews | **43** |
| Fake AggregateRating | **false** |

**LAUNCH_READY vs INDEXABLE:** Uniqueness overlay forces DUPLICATIVE → PUBLIC_NOINDEX even when length/structure gates pass. Intentional. Three non-Running “LR-ish” reviews remain HIDDEN via vertical hold (padel/tennis) in export diagnostics.

**Day-1 indexable uniqueness:** No mass DUPLICATIVE pages in the INDEXABLE set (holds working). Residual HIGH note: scale of held scaffolds is large — publish more unique reviews before expanding index.

Comparisons uniqueness: GENUINELY_UNIQUE 72 · TEMPLATE_OK 23 · NEEDS_DIFF **7** (held from uniqueness policy).

---

## 9–12. Best / Guides / Comparisons / Alternatives

| Class | Published | Quality | INDEXABLE |
|---|---:|---|---:|
| Best | 58 | LR 44 · NMW 3 · THIN 11 | **44** (all LR) |
| Guides | 68 | COMPLETE **68** | **34** |
| Comparisons | 102 | meaningful **102** (editorial) | **55** |
| Alternatives | — | gate via relationships | **74** |

**CRITICAL Best ceiling:** INDEXABLE Best = **44**, all LAUNCH_READY. CI still encodes ≤12 editorial ceiling → **policy conflict / blocker via CI**, not via thin Best leakage.

**Indexable Best not LR:** **[]** (none).

**COMPLETE Running Guides not indexable:** 7 held — vertical/quality disposition in held CSV (legitimate holds; list in `FINAL-HELD-URLS.csv` type=Guide).

**Alternatives:** 74 INDEXABLE; architecture orphans for alternatives = **0** this run.

---

## 13–14. Architecture & Running journeys

Fresh link graph (`05-link-graph.json`):

| Metric | Value |
|---|---|
| Indexable orphans | **0** |
| Homepage outbound | 73 |
| Running hub outbound | 120 |
| Reviews hub outbound | 616 |

Running Shoes / Watches / HRM journeys: matrix READY (shoes READY_WITH_MINOR_ISSUES). Soft-gated categories intentionally incomplete BUY/browse indexation.

---

## 15–16. SEO / lastmod

| Check | Result |
|---|---|
| Indexable filters | **0** (NOINDEX + canonical) |
| Search indexation | **NOINDEX** |
| Draft in sitemap | **0** |
| Localhost canonical | **no** |
| Sitemap 404 | **4 — FAIL** |
| lastmod unique dates | **3** (643× 2026-09-04) — mass seed pattern |
| Future lastmod | **0** |

---

## 17. Held verticals

Fitness / HYROX / Padel / Tennis deep content: HIDDEN/NOINDEX per vertical strategy. Tools may remain available; commercial Day-1 narrative remains Running-led. Soft-gated Running categories HOLD in matrix.

---

## 18. Brand hubs

Sitemap brands **103** INDEXABLE. Spot HTML `/brands/nike` **200**. Lab transfer incomplete (server drop); prior remediation showed brand hub image weight largely fixed vs ~10.7 MB baseline — HTML payload ~274 KB this run.

---

## 19–22. Media & performance

| Route | Approx transfer | vs budget / baseline |
|---|---:|---|
| `/` | ~403 KB | ≤1.5 MB **PASS** (was ~29 MB) |
| `/running` | ~527 KB | OK |
| `/running/shoes` | ~373 KB | ≤2.5 MB **PASS** (was ~7–47 MB) |
| `/running/watches` | ~299 KB | **PASS** |
| PDP Vomero | ~271 KB | ≤2.5 MB **PASS** (was ~6.8 MB) |
| Review Vomero | ~314 KB | OK |
| Best running-shoes | ~293 KB | OK |
| Guide choose shoes | ~319 KB | OK |
| Finder | ~281 KB | OK (FLJS 130 kB) |
| Search | ~248 KB | OK |
| `/compare` | **~9.2 MB** | **FAIL budget** (~9.0 MB images) |
| daily-trainers | **~6.5 MB** | **FAIL budget** |

Shared JS lean (**103 kB**). No catalog mega-chunk regression observed in build table.

Axe serious/critical on measured successful routes: **0**.

---

## 23–25. A11y / responsive / functional

- Responsive 390/768 checks ran in route lab; overflow not flagged on measured successes.  
- Functional probes **failed this run** when `next start` died mid-lab (`functionalFail: 8` with ECONNREFUSED) — **environment instability**, not confirmed product defects.  
- When server healthy: Search/filter/sort/compare/finder/PDP spot HTTP **200**; Men/Women filter sample NOINDEX.

---

## 26–28. Offers / commercial / trust

- Products with zero offers (published set): **0** (audit 06).  
- Regions with offers: **4** (NL primary).  
- Known-invalid display: not elevated as blocker in 06.  
- **Commission ranking:** `src/domain/commerce/ranking.ts` — commission **intentionally absent**; no executable commission→Kitletics Score/Best/Finder path found.  
- Trust routes complete; wording matches 0 first-hand + Expert Research + affiliate disclosure.

---

## 29. Security basics

No public secrets found in this pass. Preview routes protect drafts (404 when unauth). Not a penetration test.

---

## 30–31. Visual / Google-like crawl

Full screenshot pack not re-exported this clock (server load). Architecture HTML crawl: orphans **0**; hubs strongly linked. Sitemap-only vs HTML: prior SEO sample orphan inflation under load — authoritative architecture result **0** orphans.

---

## 32. Day-1 quality matrix (summary)

| Page type | Existing\* | LR/Complete | Indexable | Issues |
|---|---:|---:|---:|---|
| Products | 623 pub | 399 LR sitewide | 251 | soft-gates / vertical holds |
| Reviews | 585 pub | 43 idx after holds | 43 | 539 uniqueness holds |
| Best | 58 | 44 LR | 44 | CI ceiling conflict |
| Guides | 68 | 68 COMPLETE | 34 | 7 held |
| Comparisons | 102 | 102 meaningful\* | 55 | **4 sitemap 404** |
| Brands | 191 | — | 103 | — |
| Tools | 25 | — | 12 | — |

\*editorial assessor

---

## 33. Running category matrix

See [`FINAL-RUNNING-MATRIX.csv`](data/FINAL-RUNNING-MATRIX.csv). Flagship shoes **READY_WITH_MINOR_ISSUES**; watches/HRM **READY**; four soft-gated **HOLD**.

---

## 34. Before / after (only after fresh measures)

| Area | Baseline / prior residual | This RC |
|---|---|---|
| Shared JS | ~7.8 MB mega-chunk | **103 kB** |
| `/running/shoes` transfer | ~7–47 MB | **~0.37 MB** |
| PDP Vomero | ~6.8–7.6 MB | **~0.27 MB** |
| Home | ~29 MB | **~0.40 MB** |
| Indexable reviews | hundreds thin/duplicative risk | **43** uniqueness-gated |
| Sitemap | larger / leaky historically | **664** eligibility-gated |
| CI | previously green in readiness docs | **RED** (Best ≤12 test) |
| Sitemap health | assumed OK | **4×404** proven |

---

## 35–36. Verdict rationale

**NO-GO** because:

1. Tests do not PASS (blocker).  
2. Sitemap contains 404 URLs (blocker).  

Remaining High (non-blocking alone once P0 cleared): compare/daily-trainer image weight; Best ceiling policy/CI mismatch; uniqueness scale of held reviews.

**Not GO WITH MINOR ISSUES** — blockers present.

---

## 37. Output files

| File | Status |
|---|---|
| `docs/prelaunch/FINAL-RELEASE-CANDIDATE.md` | this document |
| `docs/prelaunch/FINAL-RELEASE-CANDIDATE-EXECUTIVE.md` | executive |
| `docs/prelaunch/data/FINAL-DAY1-URLS.csv` | written |
| `docs/prelaunch/data/FINAL-HELD-URLS.csv` | written |
| `docs/prelaunch/data/FINAL-ISSUES.csv` | written |
| `docs/prelaunch/data/FINAL-RUNNING-MATRIX.csv` | written |
| `docs/prelaunch/data/FINAL-URL-RECONCILIATION.csv` | written |

Evidence pack: `docs/prelaunch/data/rc-final/`

---

**Do not publish. Do not treat this as authorization to go live.**
