# Fix 54 — Complete the held Review estate

**Mode:** Remediation (editorial READY for every published Review)  
**Date:** 2026-09-10  
**Evidence:** `docs/prelaunch/data/54-held-reviews.original.csv` · `docs/prelaunch/data/54-recount.json` · Fix 50 category-peer uniqueness  
**Vertical policy:** unchanged (`src/content/launch/vertical-strategy.ts`)

Editorial READY ≠ indexability. Padel / Tennis / Fitness / HYROX Reviews are finished and still hidden where the vertical is not launched.

---

## 1. Result

| Metric | Before (Fix 53 / V2) | After Fix 54 |
|---|---:|---:|
| Published Reviews | 585 | **585** |
| Editorial **READY** | 202 | **585** |
| INDEXABLE | 169 | **367** (Running vertical only) |
| HELD (not Day-1) | 416 | **218** (vertical hold only) |
| Quality DUPLICATIVE | 383 | **0** |
| Cluster NEEDS_DIFF | 390 | **0** |
| THIN | 0 | **0** |
| BLOCKED_EVIDENCE | 0 | **0** |
| Uniqueness holds | 383 | **0** (empty set) |

INDEXABLE rose because **Running** uniqueness holds were lifted after the copy actually split. Non-Running Reviews stay HIDDEN_404 via vertical policy — not by uniqueness holds.

**No first-hand fabrication.** Synthesis is catalog specs + strengths/weaknesses + Expert Research disclosure.

---

## 2. Exact held list (before)

Source: `docs/prelaunch/data/54-held-reviews.original.csv` (frozen before rewrite).

416 non-INDEXABLE Reviews grouped:

| Group | Count | Meaning |
|---|---:|---|
| **DUPLICATIVE** | **383** | Uniqueness hold — copy failed category-peer Jaccard |
| **NEEDS_DIFF** | **0** | (those 383 also clustered NEEDS_DIFF; hold label wins) |
| **NEEDS_RESEARCH** | **0** | |
| **VERTICAL_HOLD_ONLY** | **33** | Already READY, hidden by sport launch policy |
| **OTHER** | **0** | |

### DUPLICATIVE by vertical (383)

| Vertical | Count |
|---|---:|
| Running | 181 |
| Fitness | 70 |
| Padel | 55 |
| HYROX | 53 |
| Tennis | 21 |
| Recovery | 3 |

Largest category clusters: running shoes 63, training shoes 42, running clothing 41, padel shoes 23, padel rackets 21, tennis rackets 19.

### VERTICAL_HOLD_ONLY (33)

Already READY before this fix: Fitness 19, Padel 9, HYROX 4, Tennis 1.

---

## 3. What changed

1. Spec-driven unique Expert Research for the 383 uniqueness-held Reviews (`synthesizeUniqueExpertResearch`, SKU-prefixed spec tokens so name-scrub Jaccard can split peers).
2. Compact peer-delta stamps on remaining close pairs (fitness plates/racks/bikes/accessories, then HEAD Extreme Motion vs Pro).
3. Overlay: `src/content/reviews-p54-held-finalized.json` (390 Reviews) wired first in `src/content/reviews.ts`.
4. `CONTENT_UNIQUENESS_REVIEW_HOLDS` emptied.
5. `BLOCKED_EVIDENCE_REVIEW_SLUGS` remains empty — every held product had enough catalog signal (short description and/or specs/strengths).

Vertical launch strategy was **not** edited. Fitness / HYROX / Padel / Tennis / Racket stay Day-1 hidden.

---

## 4. After — READY vs INDEXABLE by vertical

| Vertical | READY | INDEXABLE | Still hidden |
|---|---:|---:|---:|
| Running | 312 | 312 | 0 |
| Fitness | 118 | 0* | 81 |
| HYROX | 65 | 0* | 51 |
| Padel | 64 | 0 | 64 |
| Tennis | 22 | 0 | 22 |
| Recovery | 4 | 4 (Running-tagged) | 0 |
| Cycling | 0 | — | no Reviews in estate |
| Racket (umbrella) | 0 | — | covered by Padel/Tennis |

\* Some HYROX/Fitness SKUs are dual-tagged with Running and therefore resolve to the Running vertical — those can be INDEXABLE. Deep Fitness/HYROX-only Reviews remain hidden.

Held after = **218** = `vertical_hold` only.

---

## 5. Non-ready Reviews remaining

**Published estate (585): none.** READY 585, THIN 0, DUPLICATIVE 0, NEEDS_DIFF 0, BLOCKED_EVIDENCE 0.

### Unpublished fixture (not in the 585)

| Slug | Why not READY |
|---|---|
| `asics-novablast-5-deep-dive` | Scheduled publishing-resolver fixture (`scheduledMeta`). Not production-exposed. Intentionally not a launch Review. |

No other unpublished Review fixtures were in the Day-1 published set.

---

## 6. Category completion

| Category | Action |
|---|---|
| Running (remaining) | 181 uniqueness-held rewritten; now READY + INDEXABLE |
| Fitness | Finished; remains vertical-hidden except dual-tagged Running |
| HYROX | Finished; remains vertical-hidden except dual-tagged Running |
| Padel | Finished; remains vertical-hidden |
| Tennis | Finished; remains vertical-hidden |
| Racket | No separate umbrella Reviews; Padel/Tennis done |
| Cycling | No existing Review pages in catalog |
| Recovery | 3 uniqueness-held rewritten; Running-tagged Recovery INDEXABLE |

---

## 7. Follow-ups (not uniqueness/READY gates)

- **Section images:** newly READY pages still omit unique `public/images/<sport>/products/<slug>/sections/<topic>.png` files rather than stamping the hero. Generate-from-hero is a later media pass.
- **Voice:** overlays are spec-dense Expert Research (same family as Fix 53), not Vomero-length shop talk. A later voice pass must keep unique facts in the first tokens of sentences.
- **INDEXABLE count:** sitemap/Day-1 URL count grows with the newly unique Running Reviews. That is intended; do not re-hold them to shrink the sitemap.

---

## 8. Files

| Path | Role |
|---|---|
| `src/content/reviews-p54-held-finalized.json` | Unique overlays (390) |
| `src/content/reviews.ts` | P54 listed first |
| `src/content/launch/content-uniqueness-holds.ts` | Empty hold set |
| `src/content/launch/blocked-evidence-reviews.ts` | Empty BLOCKED_EVIDENCE set |
| `src/domain/review-agent/unique-expert-research.ts` | SKU token cloud; thin-catalog allow |
| `scripts/tmp/prelaunch-54-held-estate.ts` | Estate rewrite |
| `docs/prelaunch/data/54-held-reviews.original.csv` | Exact before grouping |
| `docs/prelaunch/data/54-recount.json` | After acceptance counts |
