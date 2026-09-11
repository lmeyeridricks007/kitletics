# Kitletics — FUTURE_ROADMAP

Work that is **not Day-1 debt**. Items become owed only when a vertical, region, media, or ML calibration programme opens.

Canonical inventory: `docs/prelaunch/data/FINAL-REMAINING-DEBT-V2.csv` (`FUT-*` rows).

---

## FUT-FINDER-SCORING — Running Shoe Finder weight calibration

| Field | Value |
|-------|-------|
| ID | `FUT-FINDER-SCORING` |
| Surface | `/tools/running-shoe-finder` |
| Config | `src/domain/finders/configs/running-shoe-finder.ts` |
| Type | Future ML / expert-labeled recommendation calibration |
| Day-1 status | **Not required for correctness** |

### What exists today

Finder `baseWeights` and hard/soft eligibility are documented in the config header (primaryUse, terrain, cushioning, budget, width, stability, experience, lifecycle, value). Scoring is deterministic and covered by finder unit tests. Launch recommendations are editorial-weight heuristics, not a trained ranker.

### What this roadmap item is

When we have a set of **expert-labeled recommendation scenarios** (input answers → expected shortlist / exclusions), tune or validate weights against those labels. That may include:

- Gold-set scenarios per primary use / terrain / width
- Offline eval harness comparing ranked outputs to labels
- Optional later: learned re-ranker — only if labeled data justifies it

### What it is not

- A production bug or missing eligibility gate
- Ambiguous in-code `TODO` debt (removed from `running-shoe-finder.ts` in Fix 88)

Do not reopen as P0/P1 launch debt without a labeled-scenario programme.

---

## Other FUT-* (summary)

See CSV / `FINAL-ZERO-DEBT-REVIEW-V2.md` § FUTURE_ROADMAP for vertical enablement, NMW/THIN on held SKUs, brand hub depth, gallery extras, offer overlays, regional ingest, WEAK graph replacement, NNormal line gaps, and media ungating.
