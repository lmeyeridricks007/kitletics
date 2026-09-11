# Fix 85 — Review quality assessor reconciliation

**Date:** 2026-09-11  
**Status:** Implemented  
**Gate:** Flagship LAUNCH_READY reviews carry **0 genuine article P0**; `site:audit` CONTENT sample **0/15 P0**  
**Evidence:** `docs/prelaunch/data/rc-85/` · `tests/review-assessor-reconciliation.test.ts`

---

## 1. Contradiction (before)

| System | Flagship result |
|--------|-----------------|
| Canonical launch + editorial readiness | **591/591 READY**, 0 NEEDS_DIFF, 0 enriched junk voice, 0 unsupported first-hand |
| `assessReviewArticle` | Scores **85–88**, **one P0 `voice` each** |
| `site:audit` CONTENT | Sampled 15 reviews → **15/15 P0** (CONTENT-ARTICLE-P0 as HIGH); CONTENT-002 HIGH on **source** junk |

Two different “truths”: launch said ship-ready; article/site:audit said release-critical.

**Did not** lower thresholds to clear findings.

---

## 2. What each system evaluates

| System | Entry | Surface | Severity vocab | Gates INDEXABLE? |
|--------|-------|---------|----------------|------------------|
| **Launch quality** | `assessReviewLaunchQuality` | Enriched via `enrichReviewForPage` | `LAUNCH_READY` / `NEEDS_MINOR_WORK` / `THIN` / `DUPLICATIVE` / `BLOCKED` | Yes |
| **Editorial readiness** | `assessReviewEditorialReadiness` | Launch + enriched lead (junk on **lead only**) | `READY` / `NEEDS_*` / `BROKEN` | Yes (must be READY) |
| **Uniqueness** | Hold set + offline `classifyUniqueness` | Peer similarity / scaffold | `GENUINELY_UNIQUE` … `DUPLICATIVE` | Only via hold → `DUPLICATIVE` |
| **Evidence / first-hand** | Launch + readiness + `canPublishReview` | Enriched text + evidence IDs | `BLOCKED` / publish codes | Yes when fake/missing |
| **Article auditor** | `assessReviewArticle` | `ReviewPageData` (enriched) | `P0`/`P1`/`P2`/`info` | No (advisory → now aligned) |
| **site:audit CONTENT** | `auditContentQuality` | Was: source + loose sample; **now:** enriched INDEXABLE sample + source LOW diagnostic | `BLOCKER`/`HIGH`/`MEDIUM`/`LOW`/`INFO` | No |

### Root cause of the false P0

1. Enriched `testingContext` uses `FRIENDLY_TESTING_CONTEXT`, which **intentionally** says “Expert Research Review… / We have not personally tested…”.
2. `assessReviewArticle` ran `FORMAL_VOICE` + `isReportOrJunkVoice` on **full text including disclosure**.
3. `FRIENDLY_TESTING_CONTEXT` itself matches `REPORT_OR_JUNK_VOICE` → every honest disclosure page got **P0 `voice`**.
4. Decision copy on flagships was already clean (`enrichedDecisionJunk: false`).
5. CONTENT-002 scored **source** seeds as HIGH even when enriched pages were clean.
6. CONTENT-ARTICLE-P0 amplified the false voice P0 across a 15-row sample (`isDev: true`).

Probe (pre-fix):

```text
friendly_matches_junk: true
nike-vomero-18: launch=LAUNCH_READY ready=true p0=[voice]
  enrichedJunkDecision=false enrichedJunkFull=true testingCtxExpert=true
```

---

## 3. Same review set (after fix)

Matrix: `docs/prelaunch/data/rc-85/assessor-matrix.json`

### Flagships

| Slug | Launch | Editorial | Disposition | Article score | P0 | Source junk | Enriched decision junk |
|------|--------|-----------|-------------|---------------|----|-------------|------------------------|
| nike-vomero-18 | LAUNCH_READY | READY | INDEXABLE | **100** (A) | — | false | false |
| asics-novablast-6 | LAUNCH_READY | READY | INDEXABLE | **99** (A) | — | false | false |
| brooks-glycerin-22 | LAUNCH_READY | READY | INDEXABLE | **99** (A) | — | false | false |
| garmin-forerunner-970 | LAUNCH_READY | READY | INDEXABLE | **99** (A) | — | false | false |
| hoka-clifton-10 | LAUNCH_READY | READY | INDEXABLE | **99** (A) | — | false | false |

Remaining findings are **P2 only** (ideal length band / second-person) → release **MEDIUM**, not BLOCKER.

### Samples

| Cohort | n | Article P0 |
|--------|---|------------|
| 10 random INDEXABLE | 10 | **0** |
| 10 random held | 10 | (not required clean; sampled for contrast) |
| Historical weak source seeds (`buff-merino-lightweight`, `buff-polar`, `new-balance-fuelcell-rebel-v4`) | 3 | Evaluated on **enriched** surface in matrix |

---

## 4. P0 semantics (corrected)

A **P0 / BLOCKER** means something **genuinely release-critical on user-visible enriched decision copy**:

| Code | Still P0? | Notes |
|------|-----------|--------|
| `verdict` | Yes | Missing bottom line |
| `audience` | Yes | Missing buy/skip |
| `length-critical` | Yes | <1500 words |
| `disclosure` | Yes | Missing method/affiliate disclosure |
| `voice` | Yes **on decision copy only** | Lead/sections/pros-cons junk — **not** disclosure templates |
| `first-hand-claim` | Yes **on decision copy** | “We tested…” without personal-test evidence |
| `media` | Yes | No authentic hero |
| `publish-gate` | Yes | `canPublishReview` fail on published |

**Not P0:** style preferences (second-person), ideal length band, source-seed residue when enriched output is clean.

---

## 5. Source vs enriched page

| Check | Before | After |
|-------|--------|-------|
| Article voice | Full text incl. disclosure | **Decision copy only** (`reviewDecisionCopyText`) |
| CONTENT-002 | HIGH on source junk | **INFO/BLOCKER on enriched decision junk**; source moved to **CONTENT-002-SOURCE = LOW** |
| CONTENT-ARTICLE-P0 | HIGH on first 15 catalog (`isDev: true`) | **BLOCKER only if real P0**; samples **INDEXABLE** enriched (`isDev: false`); now **0/15 INFO** |
| CONTENT-001 | MEDIUM thin source Buy/Skip | **LOW** (seed hygiene; enricher upgrades many) |

---

## 6. One quality contract

Defined in `src/lib/review/quality-contract.ts`:

| Severity | Article | Meaning |
|----------|---------|---------|
| **BLOCKER** | P0 | Release-critical on enriched decision copy |
| **HIGH** | P1 | Serious polish / depth (may still be INDEXABLE) |
| **MEDIUM** | P2 | Ideal-band polish |
| **LOW** | — | Source-seed hygiene / monitors |
| **INFO** | info | Baseline / resolved |

Launch labels (`LAUNCH_READY` / `READY` / `BLOCKED`) stay domain-native but **must not contradict** article P0 on the same surface: a LAUNCH_READY flagship must not carry a genuine article P0.

---

## 7. Remediation shipped

| File | Change |
|------|--------|
| `src/lib/review/quality-contract.ts` | Shared severities + `reviewDecisionCopyText` |
| `src/lib/review/assess-review-article-quality.ts` | Voice + first-hand on decision copy; disclosure excluded |
| `src/domain/site-quality/audits/content.ts` | Enriched INDEXABLE sample; source = LOW; P0 → BLOCKER semantics |
| `src/lib/review/review-voice.ts` | Note: friendly disclosure matches junk regex by design |
| `tests/review-assessor-reconciliation.test.ts` | Excellent / generic / first-hand / junk / evidence / seed vs enriched |
| `.cursor/skills/review-article-audit/SKILL.md` | Contract note |

---

## 8. Regression tests

`tests/review-assessor-reconciliation.test.ts` covers:

- Excellent Review (Vomero) — READY, no P0
- Generic / missing audience — P0
- Unsupported first-hand — P0
- Junk on decision copy — P0; junk only in disclosure — not P0
- Insufficient evidence — P1 (honest copy)
- Duplicative classifier thresholds
- Source-seed residue ≠ CONTENT-002 BLOCKER
- Five flagships INDEXABLE with 0 article P0

**Result:** 11/11 pass.

---

## 9. site:audit CONTENT slice (after)

`docs/prelaunch/data/rc-85/content-audit-slice.json`:

| ID | Severity | Evidence |
|----|----------|----------|
| CONTENT-001 | INFO | 0 thin source Buy/Skip |
| CONTENT-002 | INFO | **0/15** enriched decision junk |
| CONTENT-002-SOURCE | **LOW** | 3 source-field residue (hygiene) |
| CONTENT-ARTICLE-P0 | INFO | **0/15** article P0 |
| CONTENT-003 | INFO | Review coverage 94% |

---

## 10. Target check

- [x] No flagship LAUNCH_READY Review carries a genuine article P0
- [x] Disagreement documented: prior P0 was disclosure false-positive; source HIGH was wrong surface
- [x] Thresholds not lowered — surface corrected
- [x] One severity contract across systems

---

## 11. Explicit remaining (non-contradictory)

- P2 ideal-length / second-person on some long flagships — **MEDIUM polish**, not release blockers
- CONTENT-002-SOURCE LOW (3 seeds) — clean when convenient; not user-facing P0
- Offline uniqueness monitors (e.g. Duro/Dyna Jaccard) remain LOW monitors when assessor stays LAUNCH_READY
