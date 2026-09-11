# Fix 29 — Sitemap comparison 404 repair

**Date:** 2026-09-09  
**Status:** Implemented (pre-launch — **do not publish**)  
**RC reference:** [`../FINAL-RELEASE-CANDIDATE.md`](../FINAL-RELEASE-CANDIDATE.md)  
**Probe:** [`../data/rc-final/sitemap-http-probe.json`](../data/rc-final/sitemap-http-probe.json)

## Objective

Eliminate the 4 INDEXABLE sitemap Comparison URLs that returned HTTP 404 because a peer Product did not resolve in production, and prevent recurrence via eligibility + regression tests.

---

## 1. Investigation (each pair)

| Comparison slug | Product A | Product B | Root cause | Meaningful? | Fix |
|---|---|---|---|---|---|
| `lululemon-hotty-hot-vs-janji-pace-short` | `prod-lululemon-hotty-hot-women` (**draft**) | `prod-janji-pace-short-women` (published, soft-gated clothing) | Half-comparison: draft peer → `getComparisonPageData` undefined → 404 | Editorial record exists; clothing soft-gate would noindex even if both published | **C** |
| `theragun-prime-vs-renpho-r3` | `prod-theragun-prime` (published, slug `therabody-theragun-prime`) | `prod-renpho-r3` (**draft**) | Draft peer | Yes when both published | **C** |
| `triggerpoint-grid-vs-grid-x` | `prod-triggerpoint-grid` (**draft**, slug `triggerpoint-grid-foam-roller`) | `prod-triggerpoint-grid-x` (published) | Draft peer (not a rename bug — IDs correct) | Yes when both published | **C** |
| `oofos-ooriginal-vs-hoka-ora-recovery-slide` | `prod-oofos-ooriginal` (published) | `prod-hoka-ora-recovery-slide` (**draft**) | Draft peer | Yes when both published | **C** |

### Ruled out

- **A (repair Product reference):** IDs already point at the real catalog rows.
- **B (slug update):** Slug mismatches (`therabody-…`, `…-foam-roller`) are product URL aliases only; comparison `productIds` are correct.
- **D (replace pair):** Evidence does not support a different published peer pair; drafts are intentional holds, not stale wrong products.
- **Fake Products:** Not created.

### Why INDEXABLE + 404 coexisted

1. `getComparisonPageData` correctly returns `undefined` when any `productId` fails `getProductById` (production filters drafts).
2. `eligibilityForComparison` filtered unresolved products out of the list, then still assessed the Comparison body as `MEANINGFUL` → **INDEXABLE**.
3. Sitemap includes INDEXABLE Comparisons → crawlers hit 404.

---

## 2. Fix applied (option C + guard)

### Eligibility guard

`src/domain/launch/get-launch-eligibility.ts` — `eligibilityForComparison`:

If `< 2` productIds **or** any product fails production resolve →

- `disposition: HIDDEN_404`
- `quality: BLOCKED`
- `reason: missing_comparison_product`

Effects:

| Surface | Behavior |
|---|---|
| Sitemap | Excluded (`isIndexableEligibility` false) |
| Indexation | Hidden / not INDEXABLE |
| Search promotion | `shouldPromotePublicly` false |
| Homepage featured comps | Blocked via `shouldPromotePublicly` |
| Sport hub | Blocks only `missing_comparison_product` (held-vertical mockup hubs may still list resolvable comps) |
| Route | `enforceLaunchEligibility` → 404 (matches page data) |

Editorial Comparison rows remain in content for when peers publish — no fake catalog rows.

### Sitemap size

| Metric | Before (RC) | After |
|---:|---:|---:|
| Sitemap URLs | 664 | **660** |
| Comparison INDEXABLE | 55 (incl. 4 broken) | **51** |
| Broken comps in sitemap | 4 | **0** |

---

## 3. Sitemap rule (enforced)

A Comparison enters the sitemap only when:

1. Both Products resolve in production  
2. Comparison route can assemble (`getComparisonPageData` truthy)  
3. Meaningful (or otherwise INDEXABLE per quality)  
4. Canonical slug is the editorial slug  
5. `getLaunchEligibility` → `INDEXABLE`

Broken peers fail (1)+(2)+(5) via the new guard.

---

## 4. Tests added / changed

**`tests/comparison.test.ts`**

- Broken-peer page data remains undefined (the 4 RC slugs)
- Every INDEXABLE comparison: all product refs resolve + page data exists
- Broken-peer comps excluded from sitemap + `missing_comparison_product`
- All sitemap `/compare/*` URLs assemble page data (200-ready)
- Reverse-order canonical redirect still works for healthy pairs

**`tests/launch-eligibility.test.ts`**

- Any comparison with unresolved peer → `HIDDEN_404`, not indexable, not promotable, reason `missing_comparison_product`

---

## 5. Full sitemap re-probe

```text
BASE_URL=http://127.0.0.1:3010
n=660
byStatus: { "200": 660 }
non200Count: 0
noindex200Count: 0
redirectCount: 0
ok: true
```

Evidence: `docs/prelaunch/data/rc-final/sitemap-http-probe.json` · log `docs/prelaunch/data/rc-final/logs/29-probe.log`

Required outcomes met:

- **0 × 404**
- **0 × noindex** on sitemap URLs
- **0** accidental redirects

### CI

| Gate | Result |
|---|---|
| Focused unit (comparison + eligibility + padel hub) | 40/40 pass |
| `npm test` | **562/562** pass (exit 0) |
| `npm run build` | exit 0 (pre-probe rebuild) |

---

## 6. Files touched

| File | Change |
|---|---|
| `src/domain/launch/get-launch-eligibility.ts` | `missing_comparison_product` → HIDDEN_404 |
| `src/lib/home/get-homepage-data.ts` | Promote only INDEXABLE comps |
| `src/lib/sport-hub/get-sport-hub-data.ts` | Hub blocks broken-peer comps |
| `tests/comparison.test.ts` | Regression coverage |
| `tests/launch-eligibility.test.ts` | Eligibility guard coverage |
| `docs/prelaunch/fixes/29-sitemap-comparison-404s.md` | This report |

---

## 7. Residual / follow-ups (out of scope)

- Draft peers (`renpho-r3`, `triggerpoint-grid`, `hoka-ora-recovery-slide`, `lululemon-hotty-hot-women`) can be published later; eligibility will re-evaluate automatically (clothing pair still soft-gates to PUBLIC_NOINDEX).
- Do not publish until remaining RC gates are green.
