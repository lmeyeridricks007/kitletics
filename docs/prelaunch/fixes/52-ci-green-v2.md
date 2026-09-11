# Fix 52 — Restore clean CI without weakening quality

**Mode:** Remediation (code + tests)  
**Date:** 2026-09-10  
**Evidence basis:** [`FINAL-RELEASE-CANDIDATE-V2.md`](../FINAL-RELEASE-CANDIDATE-V2.md) · `docs/prelaunch/data/rc-v2/logs/{lint,typecheck,test,build}.log`

**Absolute rule observed:** no global ESLint disables, no `ts-ignore`, no skipped tests, no blanket timeout raises, no lowered eligibility / SEO / editorial gates.

---

## 1. Failures before (V2 RC)

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **1** | 8 errors, 95 warnings — `react-hooks/rules-of-hooks` on `useCaseHint` + `prefer-const` |
| `npm run typecheck` | **2** | Invalid `AwardType` values in `best-guides-p2-cannibalization.ts` |
| `npm test` | **1** | 28 failed / 557 passed (12 files) — timeouts + stale Day-1 assertions |
| `npm run build` | **1** | Same hooks lint errors blocked `next build` |

---

## 2. Root cause

### Lint — false-positive hooks

`useCaseHint` in `src/lib/product/alternative-decision-copy.ts` is a **plain string helper**, not a React hook. The `use*` prefix triggered `react-hooks/rules-of-hooks`. Renamed to `getUseCaseHint`. Remaining lint errors were real `prefer-const` in tmp scripts.

### TypeScript — invalid vs legitimate awards

Canonical `AwardType` did not include four values used by P2 cannibalization patches.

| Value | Classification | Resolution |
|---|---|---|
| `editors-choice` | **Invalid alias** | Map → `editors-pick` |
| `best-marathon` | **Invalid** (canonical race award exists) | Map → `best-race` |
| `best-durable` | **Legitimate** heavier-runner durability slot | Extend union + `AWARD_LABELS` |
| `best-fit` | **Legitimate** width/fit slot | Extend union + `AWARD_LABELS` |

No `any` casts.

### Test timeouts — expensive full-catalog work

Sitemap / search / eligibility tests timed out at 30–90s (search-discovery file ~397s). Root causes, not “tests need longer”:

1. **`getSyncedAlternativeRelationships()` rebuilt decision-copy for every catalog pair on every call.** Sitemap alternatives loop called `getAllProductRelationships()` once per product.
2. **`getLaunchEligibility` recomputed** the same entity hundreds of times per sitemap / search / Day-1 simulation.
3. **Search scored after eligibility** and used `getProducts().find` per review (`O(reviews × products)`).
4. **Sitemap rescanned `getProducts()` inside every category loop.**

### Soft-gate / search assertions — policy vs stale tests

Current launch policy (editorial 44 + Running-only Day-1) is:

- Clothing / nutrition / sunglasses: **launch-supporting** (soft-gate removed after decision content).
- Accessories: **future + soft-gated** (thin chafe-only catalog).
- Search must not promote held verticals (HYROX / padel) as launch-active.

Tests still expected pre-44 `future` statuses and HYROX/padel finder promotion. **Buff Original** moved to `cat-running-clothing`, so the soft-gate fixture drifted.

Reviews index already lists **INDEXABLE / promoted** reviews only (`shouldPromotePublicly`) — the test still expected the full published pool (585 vs 169).

Sitemap lastmod test clustered by **calendar day** of `SEED_DATES`, so genuine editorial timestamps on the same day as a seed bump counted as “mass-stamping.”

---

## 3. Classification of the 28 failures

| Suite | Classification | Fix |
|---|---|---|
| `alternative-decision-copy` lint | False-positive hooks | Rename helper |
| `best-guides-p2-cannibalization` TS | Invalid + legitimate awards | Map / extend |
| `sitemap-lastmod` (2 timeouts) | **TIMEOUT / PERF** | Memoize relationships + eligibility + sitemap |
| `sitemap-lastmod` seed cluster | **STALE EXPECTATION** | Assert exact `SEED_DATES` instants, not calendar days |
| `seo-indexation` / `comparison` sitemap | **TIMEOUT / PERF** | Same assembly caches |
| `launch-eligibility` | **TIMEOUT / PERF** | Eligibility memo + cheaper Day-1 sim |
| `search-discovery` / `discovery` | **TIMEOUT / PERF** | Score-first search + eligibility memo |
| `hyrox` search | **STALE EXPECTATION** + **REAL REGRESSION** (tool leak) | Gate tools; tests now forbid held HYROX promotion |
| `racket` search | **STALE EXPECTATION** + **REAL REGRESSION** (category/tool leak) | Do not promote held padel as live |
| `launch-readiness` nutrition/clothing/sunglasses | **STALE EXPECTATION** | Match editorial 44 launch-supporting; accessories still future |
| `product-quality-assessor` buff-original | **FIXTURE DRIFT** | Use `body-glide-original` (`cat-accessories`) |
| `product-quality-assessor` all Running | **TIMEOUT / PERF** | Eligibility memo |
| `review-page` index count | **STALE EXPECTATION** | Index lists promoted reviews only (Day-1) |
| `use-case-listing` smoke | **TIMEOUT / PERF** | Shared eligibility / catalog work cheaper |

---

## 4. Files changed

### Production

- `src/lib/product/alternative-decision-copy.ts` — `useCaseHint` → `getUseCaseHint`
- `src/domain/editorial/types.ts` — add `best-durable`, `best-fit`
- `src/domain/editorial/schemas.ts` — same
- `src/lib/best/awards.ts` — labels for new awards
- `src/content/best-guides-p2-cannibalization.ts` — map invalid awards
- `src/domain/launch/get-launch-eligibility.ts` — per-entity WeakMap memo; alternatives reuse product eligibility
- `src/repositories/relationships.ts` — memoize relationship graph
- `src/content/running/decision-graph-alt-sync.ts` — memoize synced alternative edges
- `src/app/sitemap.ts` — process cache; hoist catalog scans; category counts
- `src/lib/search/engine.ts` — score-first; `getProductById`; Day-1 gates on tools / setups / brands / categories / disciplines

### Lint-only (tmp scripts)

- `scripts/tmp/p49-held-running.ts`
- `scripts/tmp/prelaunch-36-editorial-work-queue.ts`
- `scripts/tmp/prelaunch-50-final-forensic.ts`
- `scripts/tmp/prelaunch-rc-v2-export.ts`

### Tests

- `tests/launch-readiness.test.ts`
- `tests/product-quality-assessor-consistency.test.ts`
- `tests/review-page.test.ts`
- `tests/sitemap-lastmod.test.ts`
- `tests/hyrox.test.ts`
- `tests/racket.test.ts`

---

## 5. Tests changed (what they now assert)

| Test | Now asserts |
|---|---|
| Launch manifest nutrition | `launch-supporting` (policy after editorial 44) |
| Clothing / sunglasses / accessories | Clothing + sunglasses `launch-supporting`; accessories `future` |
| Soft-gated overlay | `body-glide-original` in `cat-accessories` |
| Reviews index | Items are a **promoted subset** of published reviews, still grouped by category |
| Sitemap lastmod | **0** lastmods equal to exact `SEED_DATES` instants; still `< 25%` of URLs have lastmod |
| HYROX search | No `/tools/hyrox*` and no HYROX sport hub while vertical is held |
| Padel search | No `/padel*` hrefs, no padel finder, no padel product titles |

No tests skipped. Default `testTimeout` remains 30s.

---

## 6. Production behavior changed

**Tightened (Day-1 search leak closed):**

- Internal Search now applies `shouldPromotePublicly` to **tools, setups, and brands**.
- Categories and disciplines from **disabled / selective** verticals are not treated as live browse destinations.
- Held HYROX finders and padel categories/tools no longer rank as if launch-active.

**Unchanged policy:**

- Running-only Day-1 indexation.
- Accessories remain soft-gated / future.
- Clothing / nutrition / sunglasses remain launch-supporting (not re-held).
- Reviews index still lists INDEXABLE reviews only (test caught up to existing behavior).
- Eligibility dispositions themselves are unchanged — memoization is referentially keyed by entity object + context.

**Not changed:** editorial uniqueness thresholds, SEO indexation gates, launch eligibility quality classes, Vitest global timeout.

---

## 7. Final command exits

| Command | Exit | Result |
|---|---:|---|
| `npm run lint` | **0** | 0 errors, 94 warnings (warnings pre-existing; not errors) |
| `npm run typecheck` | **0** | `tsc --noEmit` clean |
| `npm test` | **0** | **56 files / 585 tests passed** in ~50s (was 28 failed, search file ~397s) |
| `npm run build` | **0** | Compiled, linted, typed, **2299** static pages generated |

CI is genuinely green. This does **not** by itself flip the V2 candidate to GO — Fix 50 still reports 114 INDEXABLE `NEEDS_DIFF` reviews as a REQUIRED FOR GO editorial gate.
