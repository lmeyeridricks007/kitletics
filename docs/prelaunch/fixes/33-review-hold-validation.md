# Fix 33 — Review uniqueness hold validation

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Audit:** [`../data/rc-final/33-review-hold-audit.json`](../data/rc-final/33-review-hold-audit.json)  
**Queue:** [`../data/rc-final/33-review-enrichment-queue.md`](../data/rc-final/33-review-enrichment-queue.md)

## Objective

Confirm duplicate / held reviews **cannot leak** into Day-1 indexation or public editorial surfaces.  
**Not** a mass rewrite of held reviews before launch.

---

## RC baseline (Fix 25 / uniqueness gate)

| Class | Count (RC narrative) |
|---|---|
| INDEXABLE reviews | **43** |
| DUPLICATIVE | **521** (hold set grew to **539** in live measure) |
| NEEDS_DIFF / uniqueness risk | **18** (held via uniqueness overlay → assessed DUPLICATIVE) |

The uniqueness gate remains the primary indexation control. This fix closes **promotion / UX leaks** around held scaffolds.

---

## 1. Verification — every DUPLICATIVE review

Post-fix audit (`scripts/tmp/prelaunch-33-review-hold-audit.ts`):

| Check | Result |
|---|---|
| In sitemap | **0** |
| INDEXABLE disposition | **0** |
| `shouldPromotePublicly` | **0** |
| Still `PUBLIC_NOINDEX` | **0** (all DUPLICATIVE → **HIDDEN_404**) |
| Reviews hub lists held | **0** |
| Best “View review” → held | **0** |
| Search promotes held review hits | **0** |
| PDP `fullReviewHref` → held | **0** |

**Leak count: 0**

### Disposition policy change

| Quality | Before | After |
|---|---|---|
| DUPLICATIVE / THIN | `PUBLIC_NOINDEX` (soft-landing) | **`HIDDEN_404`** |
| NEEDS_MINOR_WORK (unapproved) | `PUBLIC_NOINDEX` | unchanged |
| LAUNCH_READY (+ approved NMW) | `INDEXABLE` | unchanged |

Rationale: scaffold / near-duplicate review pages offer little public value; prefer **hide** over a noindex page that still looks like a full editorial review.

Measured totals after change:

| Metric | Value |
|---|---|
| Published reviews | 585 |
| INDEXABLE | **43** |
| HIDDEN_404 | **542** |
| Of which DUPLICATIVE quality | **539** |

Sitemap already filtered with `isIndexableEligibility` — unchanged and still correct.

---

## 2. Public UX (held routes)

- DUPLICATIVE/THIN routes are **404** for public traffic (preview still available via launch preview).
- No remaining Day-1 `PUBLIC_NOINDEX` DUPLICATIVE soft-landings that imply a finished editorial review.

---

## 3. Product page

`getProductReviewSummary` now checks launch eligibility:

| Case | PDP labeling | Full-review CTAs |
|---|---|---|
| INDEXABLE review | **Kitletics Review** | Link to `/reviews/{slug}` |
| Held / non-promotable | **Product analysis** | **Omitted** |

Surfaces updated: hero strip, section heading, summary card, performance / verdict / evidence CTAs.

---

## 4. Reviews hub

`getReviewsIndexData` filters to `shouldPromotePublicly` only → hub lists **approved unique** reviews (INDEXABLE), not held scaffolds.

Sport hub `assemble.ts` `recentlyUpdated` / review lists use the same gate.

---

## 5. Search

`searchKitletics` already gated reviews with `shouldPromotePublicly` (INDEXABLE only). Re-validated: **0** held review hits in sample queries.

---

## 6. Best / setups / alternatives / guides

New helper: `promotableReviewSlug()` in `src/domain/launch`.

Applied so “View review” / “Read review” only appears when the review is INDEXABLE:

- Best guide recommendations
- Gear setups
- Alternatives pages
- Long-form guide product rails

Held products still appear in Best as product picks; they are **not** framed as linking to an independent published review.

---

## 7. Post-launch enrichment queue

**Do not rewrite now** unless a Day-1 leak appears (none found).

Prioritized queue (Running + Best + comparison + demand score):

- Markdown: [`../data/rc-final/33-review-enrichment-queue.md`](../data/rc-final/33-review-enrichment-queue.md)
- Full JSON: [`../data/rc-final/33-review-enrichment-queue.json`](../data/rc-final/33-review-enrichment-queue.json)

Scoring: running (+40), Best inclusion (+30), comparison (+15), `recommendationScore/10`, quality bump.

Top drivers today skew to **running packs/vests + headlamps** that sit in Best + comparison graphs while remaining DUPLICATIVE — high commercial/editorial value for post-launch differentiation passes.

---

## Code touchpoints

| Area | Change |
|---|---|
| `eligibilityForReview` | THIN/DUPLICATIVE → `HIDDEN_404` |
| `promotableReviewSlug` | shared CTA gate |
| `getProductReviewSummary` + PDP UI | Product analysis vs full review |
| `getReviewsIndexData` | INDEXABLE-only hub |
| `hubs/assemble` | INDEXABLE-only review rails |
| Best / setups / alternatives / guides | gated `reviewSlug` |
| `tests/content-uniqueness.test.ts` | expects `HIDDEN_404` |

---

## Definition of done

- [x] DUPLICATIVE not in sitemap  
- [x] DUPLICATIVE not INDEXABLE / not promoted  
- [x] Prefer HIDDEN for scaffold value (implemented)  
- [x] PDP does not “Read full review” into held scaffolds  
- [x] Reviews hub = indexable unique only  
- [x] Search does not prioritize held reviews  
- [x] Post-launch enrichment queue written  
- [x] No mass rewrite before launch  

**Day-1 posture:** uniqueness hold is intact; duplicate content cannot leak into indexation or “full review” promotion surfaces.
