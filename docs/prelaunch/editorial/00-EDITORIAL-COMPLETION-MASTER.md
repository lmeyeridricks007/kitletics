# Editorial Completion Master — Queue 36

**Document ID:** `00-EDITORIAL-COMPLETION-MASTER`  
**Policy change:** Kitletics will **not** launch with hundreds of scaffold / duplicative Reviews or unfinished editorial.  
**Objective:** Make the **complete existing editorial estate** genuinely ready — before launch.  
**Mode:** Inventory + work-state queue only (**no content fixes in this pass**).  
**Generated:** 2026-09-09  

**References**

- [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)
- [`../03-editorial-quality.md`](../03-editorial-quality.md)
- [`../fixes/25-content-uniqueness.md`](../fixes/25-content-uniqueness.md)

**Machine data**

- [`data/editorial-work-queue.json`](data/editorial-work-queue.json) — full inventory (1,615 rows)
- [`data/editorial-work-queue.csv`](data/editorial-work-queue.csv) — spreadsheet import
- Generator: `scripts/tmp/prelaunch-36-editorial-work-queue.ts`

---

## Policy (locked)

1. **Complete existing estate** — do not add products/topics unless required to repair a broken relationship.  
2. **Editorial readiness ≠ indexation** — a Tennis Review can become `READY` while Tennis stays publication-gated.  
3. **Page length is not the primary signal** — uniqueness, evidence, relationships, and decision value drive work states.  
4. **Do not auto-publish** — this queue does not flip eligibility or sitemap.

---

## Work states

| State | Meaning |
|---|---|
| `READY` | Editorially sound for the estate (may still be noindex / vertical-held) |
| `NEEDS_UNIQUE_REWRITE` | DUPLICATIVE / scaffold clone — must be rewritten uniquely |
| `NEEDS_INTENT_DIFFERENTIATION` | High overlap; needs sharper product-specific intent |
| `NEEDS_RELATIONSHIP_FIX` | Alternatives / graph / peer links insufficient or broken |
| `NEEDS_EVIDENCE` | Missing or thin evidence / methodology support |
| `NEEDS_RESEARCH` | Thin / incomplete decision content (not primarily a clone) |
| `BROKEN` | Missing products / orphan relationships that break the page |
| `BLOCKED_INTENTIONALLY` | Archived or intentionally out of editorial scope |

Primary state = highest severity when multiple apply.

---

## Priority bands

| Band | Scope |
|---|---|
| **P0** | All Running Reviews, Best, Guides/Explainers, Comparisons, Alternatives, Gear Setups, Brand hubs (Running-weighted), Category decision content |
| **P1** | Fitness / HYROX + Padel / Tennis / Racket editorial already in repo |
| **P2** | Other future-vertical editorial already present |

---

## Estate totals (live inventory)

| Metric | Count |
|---:|
| **Total editorial items** | **1,615** |
| READY | **369** |
| Not READY | **1,246** |
| P0 | **1,087** (302 READY / **785** remaining) |
| P1 | **522** |
| P2 | **6** |

### Exact remediation counts (primary work state)

| Work state | Count |
|---|---:|
| `NEEDS_UNIQUE_REWRITE` | **539** |
| `NEEDS_RELATIONSHIP_FIX` | **520** |
| `NEEDS_RESEARCH` | **166** |
| `NEEDS_EVIDENCE` | **14** |
| `NEEDS_INTENT_DIFFERENTIATION` | **7** |
| `BROKEN` | **0** |
| `BLOCKED_INTENTIONALLY` | **0** |
| `READY` | **369** |

---

## Inventory by type

| Type | Count | Notes |
|---|---:|---|
| Review | **590** | 585 published + drafts/scheduled in estate |
| Alternatives page | **605** | Products with graph/field alternatives |
| Brand hub | **160** | Brands with ≥1 published product |
| Comparison | **102** | Editorial comparison pages |
| Explainer | **67** | Long-form `layout: explainer` guides |
| Best guide (category) | **53** | |
| Category decision | **16** | Running deep category configs (+ gaps) |
| Gear setup | **16** | |
| Best guide (use-case) | **5** | |
| Long-form guide (framework) | **1** | Non-explainer long-form |

Buying-guide corpus = explainers + long-form (**68**), matching audit 03.

---

## Type × work state (all priorities)

| Type | READY | UNIQUE_REWRITE | INTENT_DIFF | RELATIONSHIP | EVIDENCE | RESEARCH |
|---|---:|---:|---:|---:|---:|---:|
| Review | 46 | **539** | 0 | 0 | 0 | 5 |
| Alternatives | 85 | 0 | 0 | **520** | 0 | 0 |
| Brand hub | 1 | 0 | 0 | 0 | 0 | **159** |
| Comparison | 95 | 0 | **7** | 0 | 0 | 0 |
| Explainer | 67 | 0 | 0 | 0 | 0 | 0 |
| Best (category) | 39 | 0 | 0 | 0 | 13 | 1 |
| Best (use-case) | 5 | 0 | 0 | 0 | 0 | 0 |
| Category decision | 15 | 0 | 0 | 0 | 0 | 1 |
| Gear setup | 16 | 0 | 0 | 0 | 0 | 0 |
| Long-form guide | 0 | 0 | 0 | 0 | 1 | 0 |

---

## P0 — Running (completion critical path)

| Type | READY | Remaining | Dominant gap |
|---|---:|---:|---|
| Review | 43 | **325** | **324** unique rewrites (+1 research) |
| Alternatives | 81 | **354** | Relationship graph / eligibility |
| Brand hub | 1 | **104** | Shallow brand copy |
| Comparison | 73 | **0** | — (Running comps meaningful) |
| Explainer | 40 | **0** | — |
| Best category | 39 | **0** | — |
| Best use-case | 5 | **0** | — |
| Category decision | 15 | **1** | Missing config gap |
| Gear setup | 5 | **0** | — |
| Long-form | 0 | **1** | Evidence |

**P0 remaining work: 785 items** (of which **324** are Running Review unique rewrites).

### Running Reviews (detail)

| Class | Count |
|---:|
| Running reviews in estate | **368** |
| `READY` | **43** |
| `NEEDS_UNIQUE_REWRITE` | **324** |
| `NEEDS_RESEARCH` | **1** |

Aligns with Fix 25 / uniqueness holds: mass scaffold Reviews cannot ship as “done.”

---

## P1 — Fitness / HYROX / Padel / Tennis

Dominant gaps:

- **215** Reviews → `NEEDS_UNIQUE_REWRITE`
- **166** Alternatives → `NEEDS_RELATIONSHIP_FIX`
- **12** Best guides → `NEEDS_EVIDENCE`
- **7** Comparisons → `NEEDS_INTENT_DIFFERENTIATION`
- Brand hubs mostly `NEEDS_RESEARCH`

Complete these even while verticals remain **publication-gated**.

---

## P2 — Other present verticals

6 items (calisthenics / pickleball / badminton edges) — finish last; still in estate.

---

## Field dictionary (every queue row)

| Field | Description |
|---|---|
| `route` | Canonical site path |
| `type` | Editorial surface type |
| `sport` | Primary sport bucket (`running` / `fitness` / `padel` / `tennis` / …) |
| `status` | Publication status of the entity |
| `qualityClassification` | Domain / guide / comparison quality label |
| `uniquenessClassification` | From Fix 25 clusters + holds (`DUPLICATIVE`, `NEEDS_DIFFERENTIATION`, …) |
| `productRelationships` | Linked product slugs / missing ids |
| `evidenceCoverage` | none / thin / moderate / strong |
| `internalLinks` | Methodology / finder / best / compare signals |
| `indexability` | Launch disposition (`INDEXABLE` / `PUBLIC_NOINDEX` / `HIDDEN_404`) — **separate from READY** |
| `reasonHeld` | Eligibility reason codes when not indexable |
| `workState` | Primary remediation class |
| `priority` | P0 / P1 / P2 |

---

## How uniqueness & quality were applied

| Source | Use |
|---|---|
| `assessReviewLaunchQuality` | Structural quality + hold → `DUPLICATIVE` |
| `content-uniqueness-holds` + Fix 25 clusters | Uniqueness class |
| `assessBestGuideLaunchQuality` | Best READY vs evidence/research gaps |
| `assessGuideQuality` | Explainer / long-form complete vs research |
| `assessComparisonLaunchQuality` | `MEANINGFUL` → READY; Fix 25 needs-diff → intent |
| `canPublishAlternativesPage` | Relationship readiness |
| Brand `description` length | Brand hub depth (not word-count vanity for Reviews) |
| `CATEGORY_PAGE_CONFIGS` | Category decision scaffolding |

---

## Recommended execution order (still no auto-publish)

1. **P0 Running Review unique rewrites (324)** — largest trust risk.  
2. **P0 Alternatives relationship fixes (354)** — decision graph integrity.  
3. **P0 Brand hub depth (104)** — Running-weighted brands.  
4. **P0 remaining** (category gap, long-form evidence).  
5. **P1** Fitness / racket Reviews + alts + Best evidence.  
6. **P2** remainder.

Re-run `scripts/tmp/prelaunch-36-editorial-work-queue.ts` after each major batch to refresh counts.

---

## Definition of “estate complete”

Every row in `editorial-work-queue.json` has `workState === READY`  
**or** an explicit `BLOCKED_INTENTIONALLY` with human sign-off.

Indexation / vertical gates may still hide non-Running surfaces at go-live.

---

## Out of scope for this document

- Writing or rewriting copy  
- Changing eligibility / sitemap / holds  
- Adding new products or new editorial topics  

**Next:** execute P0 unique Review rewrites against this queue.
