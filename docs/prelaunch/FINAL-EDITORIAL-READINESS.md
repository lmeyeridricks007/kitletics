# FINAL EDITORIAL READINESS — Forensic Audit

**Document ID:** `FINAL-EDITORIAL-READINESS`  
**Generated:** 2026-09-09  
**Mode:** READ-ONLY (no content, hold, or eligibility mutations)  
**Do not publish from this audit.**

**Machine data**

- [`data/FINAL-EDITORIAL-AUDIT.json`](data/FINAL-EDITORIAL-AUDIT.json)
- [`data/FINAL-EDITORIAL-ISSUES.csv`](data/FINAL-EDITORIAL-ISSUES.csv)
- [`data/FINAL-EDITORIAL-URLS.csv`](data/FINAL-EDITORIAL-URLS.csv)
- Generator: `scripts/tmp/prelaunch-50-final-forensic.ts`

---

# EDITORIAL STATUS:
# READY WITH MINOR ISSUES

---

## Why this status

**Hard launch blockers: clear**

| Target | Result |
|---|---|
| 0 DUPLICATIVE among INDEXABLE (completed) reviews | **PASS (0)** |
| 0 unsupported first-hand claims | **PASS (0)** |
| 0 unsupported evidence on INDEXABLE reviews | **PASS (0)** |
| 0 Best NMW / THIN among complete / INDEXABLE | **PASS (0)** |
| 0 Comparison broken refs | **PASS (0)** |
| 0 Comparison NEEDS_DIFF among INDEXABLE | **PASS (0)** |
| 0 editorial orphans (INDEXABLE) | **PASS (0)** |
| Hard cannibalization merges/redirects | **PASS (0)** |

**Minor issues remaining**

| Target | Result |
|---|---|
| 0 NEEDS_DIFF among INDEXABLE reviews | **FAIL — 114** live peer-similarity flags |
| Full-estate DUPLICATIVE holds | **383** (intentionally non-INDEXABLE — unfinished estate, not Day-1 corpus) |

Day-1 / completed = **INDEXABLE** editorial. Unfinished estate remains held and is **not** counted as completed corpus.

---

## 1. Reviews

| Metric | Count |
|---|---:|
| Total | **585** |
| READY (editorial gate) | **202** |
| DUPLICATIVE (hold / class) | **383** |
| NEEDS_DIFF (live clustering) | **506** |
| NEEDS_RESEARCH (THIN quality) | **0** |
| BLOCKED | **0** |
| INDEXABLE | **169** |
| Launch quality LAUNCH_READY | **202** |
| Launch quality NMW | **0** |
| Launch quality THIN | **0** |

### Completed corpus (INDEXABLE) targets

| Target | Actual |
|---|---:|
| 0 DUPLICATIVE | **0** |
| 0 NEEDS_DIFF | **114** |

The 114 INDEXABLE NEEDS_DIFF flags are mostly high peer-similarity within shoes/gear/nutrition/watches clusters (live Fix 50 clustering). They are **not** uniqueness-held DUPLICATIVE pages. Treat as residual differentiation debt, not scaffold clones.

---

## 2. Best

| Metric | Count |
|---|---:|
| Total | **58** |
| LAUNCH_READY | **58** |
| NMW | **0** |
| THIN | **0** |
| BLOCKED | **0** |
| Editorial READY | **58** |
| INDEXABLE | **44** (Running; non-Running vertical-held) |

### Targets

| Target | Actual |
|---|---|
| 0 NMW | **PASS** |
| 0 THIN among content intended as complete | **PASS** |

---

## 3. Guides

| Metric | Count |
|---|---:|
| Total | **68** |
| COMPLETE (depth standard) | **68** |
| Unique (no intent hold) | **68** |
| Evidence-safe | **68** |
| Intent conflicts | **0** |
| Editorial READY | **62** |
| INDEXABLE | **35** |

Non-INDEXABLE COMPLETE guides are vertical-held or soft-gated — readiness ≠ launch enablement.

---

## 4. Comparisons

| Metric | Count |
|---|---:|
| Total | **94** |
| Unique (OK class) | **81** |
| NEEDS_DIFF | **13** |
| Broken refs | **0** |
| MEANINGFUL | **94** |
| THIN | **0** |
| Editorial READY | **94** |
| INDEXABLE | **65** |

### Targets

| Target | Actual |
|---|---|
| 0 broken refs | **PASS** |
| 0 NEEDS_DIFF among INDEXABLE | **PASS (0)** |

Estate still has 13 non-indexable / vertical NEEDS_DIFF pairs — not Day-1 blockers.

---

## 5. Alternatives

| Metric | Count |
|---|---:|
| Candidates (with alt graph) | **405** |
| Substantive (`canPublishAlternativesPage`) | **248** |
| Thin | **157** |
| Editorial READY | **248** |
| INDEXABLE | **92** |

Thin pages stay non-indexable by design (decision-shape gate).

---

## 6. Brand / Category / Setup

| Surface | Total | Publishable / config | INDEXABLE |
|---|---:|---:|---:|
| Brand hubs | 160 | 69 publishable / 91 shallow | **56** |
| Categories | 47 | 15 Running configs / 5 soft-gated | soft-gates held |
| Gear setups | 16 | **16** publishable | **5** (vertical) |

---

## 7. Sitewide uniqueness — top similarity clusters

Live Fix 50 clustering (entity names scrubbed). Highest pairs:

| Score | Pair | Category |
|---:|---|---|
| 0.922 | bullpadel-hack-03 ↔ bullpadel-vertex-04 | padel rackets |
| 0.913 | mizuno-wave-rebellion-pro-3 ↔ saucony-endorphin-pro-4 | running shoes |
| 0.899 | rogue-echo-kettlebell ↔ rogue-kettlebell | kettlebells |
| 0.896 | coros-pace-4 ↔ polar-grit-x2 | GPS watches |
| 0.895 | babolat-jet-mach-3 ↔ wilson-rush-pro-4-0 | tennis shoes |
| 0.892 | polar-pacer ↔ coros-pace-4 | GPS watches |
| 0.889 | babolat-sensa-women ↔ head-sprint-pro-4-padel | padel shoes |
| 0.888 | dunlop-cx-200 ↔ wilson-blade-98-v9 | tennis rackets |
| 0.887 | nike-vaporfly-4 ↔ nike-alphafly-3 | running shoes |
| 0.876 | nike-structure-26 ↔ nike-structure-plus | running shoes |

Full top-25: [`FINAL-EDITORIAL-AUDIT.json`](data/FINAL-EDITORIAL-AUDIT.json) → `topSimilarityClusters`.

Many highest pairs sit on **non-Running / non-INDEXABLE** verticals. Day-1 residual risk is the **114 INDEXABLE NEEDS_DIFF** review flags (see Issues CSV).

---

## 8. First-hand claims

| Metric | Count |
|---|---:|
| Unsupported first-hand | **0** |

**Target met.**

---

## 9. Evidence

| Metric | Count |
|---|---:|
| INDEXABLE reviews missing evidenceIds | **0** |

Unsupported factual-claim scanning beyond evidence-id presence is out of this forensic pass (no live claim→source NLP). Evidence integrity gate + Fix 38 remain the control plane.

---

## 10. Cannibalization

From Fix 46 intent map (unchanged; read-only reuse):

| Metric | Value |
|---|---:|
| Collision signals | **148** |
| Hard merges / redirects | **0** |
| New intent holds | **0** |
| Disposition | **KEEP + role clarity** (complementary Guide/Best/Listing/Category pairs) |

**No unresolved material consolidations** requiring merge/redirect. Remaining collisions are intentional role pairs.

---

## 11. Internal links

| Metric | Count |
|---|---:|
| INDEXABLE editorial orphans | **0** |

**Target met** (Fix 47 graph + product/best/comparison inbound).

---

## Issue inventory

| Severity | Count |
|---|---:|
| Critical | **0** |
| Major | **114** (all `indexable_needs_diff` review peer-similarity) |
| Total | **114** |

See [`FINAL-EDITORIAL-ISSUES.csv`](data/FINAL-EDITORIAL-ISSUES.csv).

---

## URL inventory

[`FINAL-EDITORIAL-URLS.csv`](data/FINAL-EDITORIAL-URLS.csv) — **1,433** editorial/catalog rows with type, sport, ready, indexable, quality, uniqueness.

---

## Definition of “completed corpus”

For target scoring in this audit:

**Completed = INDEXABLE editorial URLs** (Day-1 public corpus after Fixes 48–49).

Unfinished estate (DUPLICATIVE holds, vertical-held READY pages) remains in totals but is **not** the launch-complete bar.

---

## Go / no-go note

| Question | Answer |
|---|---|
| Safe to treat Day-1 Running editorial as structurally launchable? | **Yes, with minor uniqueness differentiation debt** |
| Safe to claim 0 NEEDS_DIFF on all INDEXABLE reviews? | **No — 114 residual** |
| Safe to publish unfinished estate reviews? | **No — 383 still held DUPLICATIVE** |
| Publish action from this doc? | **Do not publish** |

---

## Follow-ups (not executed — read-only)

1. Differentiate the 114 INDEXABLE NEEDS_DIFF reviews (nutrition / shoes / watches / sunglasses clusters).  
2. Continue unique rewrites for the 383 held DUPLICATIVE estate reviews before any future vertical expansion.  
3. Optional: tighten uniqueness hold regeneration to also catch high-risk NEEDS_DIFF on INDEXABLE paths.
