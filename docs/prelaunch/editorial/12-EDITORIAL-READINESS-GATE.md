# Unified Editorial Readiness Gate — Editorial 48

**Document ID:** `12-EDITORIAL-READINESS-GATE`  
**Generated:** 2026-09-09  
**Scope:** One authoritative editorial READY layer over quality, uniqueness, evidence, intent, relationships, and references  
**Code:** [`src/domain/editorial-readiness/`](../../src/domain/editorial-readiness/) · wired in [`get-launch-eligibility.ts`](../../src/domain/launch/get-launch-eligibility.ts)  
**Data:** [`data/48-editorial-readiness.json`](data/48-editorial-readiness.json) · tests `tests/editorial-readiness.test.ts`  
**Audit:** `scripts/tmp/prelaunch-48-editorial-readiness.ts`

## Policy (locked)

1. **Editorial READY ≠ INDEXABLE.** Vertical holds, soft-gates, and publication status still control crawlers.
2. **INDEXABLE ⊆ READY** for Review, Best, Guide, Comparison (and Alternatives when indexed).
3. **No absolute URL quotas.** Indexation is quality + launch vertical — not “max 12 Best” / “max 43 Reviews” / “max N Guides”.
4. **Do not ungate soft-gated or vertical-held surfaces** just because they are editorially READY.

## READY requires all six dimensions

| Dimension | Meaning |
|---|---|
| **Quality** | Surface meets its structural / depth bar |
| **Uniqueness** | Not on a uniqueness hold / not DUPLICATIVE |
| **Evidence safety** | Evidence present; no fake first-hand claims |
| **Intent uniqueness** | Not intent-held; product/pair-specific (not junk lead voice) |
| **Relationships** | Valid decision relationships (alts/comps/shortlist/decision paths) |
| **References** | No broken product / peer references |

## Per-surface READY bar

### Review

READY only if:

- **Substantive** — `assessReviewLaunchQuality` = `LAUNCH_READY`
- **Unique** — not `DUPLICATIVE` / not uniqueness-held
- **Evidence-safe** — evidence ids present; no first-hand claims without personal-test evidence
- **No fake first-hand**
- **Product-specific** — resolved product; body names the product; lead not report/junk voice
- **Relationships** — review alts/comps or approved alternatives graph
- **References** — product exists and is not archived

### Best

READY only if:

- **Contextual decision depth** — `LAUNCH_READY` from best-guide assessor
- **Valid considered / shortlist / recommendation model** — recommendations resolve; shortlist/considered annotations or fit rationales on picks
- **Unique intent** — not on `EDITORIAL_INTENT_HOLD_PATHS`
- **Evidence-safe** — `evidenceIds` present

### Guide

READY only if:

- **Guide Depth Standard COMPLETE** — `assessGuideQuality.status === "complete"`
- **Unique** — not intent-held
- **Evidence-safe** — no fake first-hand in guide prose
- **Decision complete** — `decisionCompleteness !== "low"`
- **References** — related product ids resolve

### Comparison

READY only if:

- **Both products valid** — published and resolved
- **Pair-specific** — meaningful summary/criteria; names the pair
- **Unique** — not intent-held; not on broken-peer hold list
- **Meaningful** — `isMeaningfulComparison`

### Alternatives

READY only if:

- `canPublishAlternativesPage` (meaningful relationships + product-specific reasoning)
- Not on alternatives uniqueness hold
- Source product published

## Wiring

```text
getLaunchEligibility
  → vertical / publication / soft-gate (unchanged precedence)
  → per-type quality assessor
  → if disposition would be INDEXABLE:
        assessEditorialReadiness(…)
        if !ready → PUBLIC_NOINDEX + editorial_gap reasons
        if ready  → keep INDEXABLE + editorial_ready
```

Existing assessors remain the quality engines; Fix 48 **unifies their outcomes** and blocks indexation when any required dimension fails.

## Absolute count ceilings

| Legacy claim | Status |
|---|---|
| max 12 Best | **Removed** in Fix 28 (`tests/launch-eligibility.test.ts` semantic policy) |
| max ~43 Reviews | **Never a code quota** — was a Day-1 inventory snapshot |
| max N Guides | **None** |

Fix 48 tests assert Best INDEXABLE **> 12** (ceiling gone) and that inventory is quality-driven.

## Snapshot (2026-09-09)

| Kind | Total | Editorial READY | INDEXABLE | INDEXABLE ⊈ READY |
|---|---:|---:|---:|---:|
| Review | 585 | 113 | 96 | **0** |
| Best | 58 | 58 | 44 | **0** |
| Guide | 68 | 62 | 35 | **0** |
| Comparison | 94 | 94 | 65 | **0** |

Invariant: **`indexableSubsetOfReady = true`**.

READY > INDEXABLE is expected (vertical / soft-gate holds).

## Tests

`tests/editorial-readiness.test.ts`:

- every indexable Review READY  
- every indexable Best READY  
- every indexable Guide READY  
- every indexable Comparison READY  
- no absolute URL quotas  

## Definition of done

- [x] Single `editorial-readiness` module  
- [x] Six dimensions for READY  
- [x] INDEXABLE requires READY (wired)  
- [x] No count ceilings reintroduced  
- [x] Semantic tests green  
- [x] Report + JSON inventory  

## Follow-ups

- Keep lifting estate pages into READY via Fixes 37–47 work queues; do not invent quotas.  
- Stale RC prose that still mentions “CI ≤12 Best” should cite Fix 28 + this gate when the RC doc is next refreshed.
