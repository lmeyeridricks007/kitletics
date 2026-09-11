# Fix 73 — Restore clean CI after decision-graph work

**Date:** 2026-09-10  
**Mode:** CI regression (naming + leftover catalog/test timeouts)  
**Evidence:** `docs/prelaunch/data/rc-73/logs/{lint,typecheck,test,build}.log`

No `eslint-disable`. No `react-hooks/rules-of-hooks` special-case. Lint rules unchanged.

---

## 1. Root cause

Fix 70 added a **plain** helper in `src/lib/decision-graph/semantic-quality.ts`:

```ts
function useCaseOverlap(a: Product, b: Product): number
```

`react-hooks/rules-of-hooks` treats any `use[A-Z]…` function as a Hook. Calling it from `scoreAlternativePair` (not a component) made `npm run lint` **exit 1**.

That is a false-positive naming problem. The helper only counts shared `useCaseIds`. Runtime was never broken. A red lint/CI state is still unacceptable.

Zero Known Debt review: **HIGH** `ENG-LINT-HOOK`.

---

## 2. Rename

Chosen name: **`scoreUseCaseOverlap`**

Matches the file’s `scoreAlternativePair` / `scoreComparisonPair` vocabulary. Cannot be parsed as a React hook.

| Location | Change |
|---|---|
| Definition | `useCaseOverlap` → `scoreUseCaseOverlap` |
| Call (shoe role ≥2) | `scoreUseCaseOverlap(source, target) >= 2` |
| Call (generic overlap) | `const uc = scoreUseCaseOverlap(source, target)` |

No other references (not exported; tests import `scoreAlternativePair` only).

---

## 3. Similar helper audit

Searched `src/` and `scripts/` for `function use[A-Z]` / `export function use[A-Z]`.

| Symbol | Kind | Action |
|---|---|---|
| `useCaseOverlap` | Plain domain helper | **Renamed** (this fix) |
| `useCaseNames` (`scripts/tmp/prelaunch-01-catalog-inventory.ts`) | Plain helper (`useCase` + Names) | Already **`formatUseCaseNames`** (same pattern; kept) |
| `useModalFocus` | Real hook (`use-modal-focus.ts`) | Unchanged |
| `useCompareTray` / `useCompareTrayOptional` | Real context hooks | Unchanged |
| `useRunningGenderPref` / `useResolvedContext` / `useNavigationPrimaryKey` | Real hooks (`ContextualNav.tsx`) | Unchanged |
| `useCaseSchema` / `useCases` | Data constants, not functions | Unchanged |

No other non-React `use[A-Z]` functions in `src/domain` or `src/lib`.

---

## 4. Lint warnings (`scripts/tmp/**`)

Zero Debt listed 6 unused-var warnings. Cleaned:

| File | Unused | Fix |
|---|---|---|
| `prelaunch-70-graph-audit.ts` | `getProductById` import | Removed from import |
| `prelaunch-zero-debt-review.ts` | `canPublishAlternativesPage`, `uniquenessByClass`, `altUnexplained` | Removed unused import / var / counter |
| `prelaunch-68-keyboard-qa.mjs` | `offer`, `productLink` locators | Dropped unused assignments; `record()` locators unchanged |

---

## 5. Extra CI blockers found while running the required suite

Not the hook bug; they still failed `npm test` until fixed.

### NNormal shoes without NL offers

Fix 69 published `nnormal-kjerag-02` and `nnormal-tomir-02` without Offer rows. `tests/commerce-freshness.test.ts` requires every published running shoe to have an NL offer.

**Added** (manufacturer EUR list from official EU store, not invented):

| Product | EUR | Source |
|---|---:|---|
| Kjerag 02 | 190 | nnormal.com DE store |
| Tomir 02 | 170 | nnormal.com DE store |

`ret-nnormal-direct` retailer + seeds in `offers-nl-backfill.ts`. Product URLs are official PDPs.

### Vitest timeouts

Catalog/sitemap tests call `sitemap()` (~1155 URLs) or loop all Running products. Default **30s** (already raised from 5s in an earlier fix) timed out under parallel workers.

| Change | Why |
|---|---|
| `vitest.config.ts` `testTimeout` **30s → 120s** | Same class as the prior 5s→30s comment; assertions unchanged |
| `product-quality-assessor-consistency` loop | **180s** on that `it` only (126s observed under full suite) |

---

## 6. CI

Logs: `docs/prelaunch/data/rc-73/logs/`

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **0** | 0 errors · 0 warnings (empty eslint output) |
| `npm run typecheck` | **0** | `tsc --noEmit` |
| `npm test` | **0** | **57** files · **589** tests · 288 s |
| `npm run build` | **0** | Next.js 15.5.24 · compiled 76s |

Build logged a few first-attempt “took more than 60 seconds” retries on `/_error`, `/sitemap.xml`, icons; generation completed. Exit 0.

---

## 7. Definition of done

- [x] `useCaseOverlap` renamed; no remaining `useCaseOverlap` in `src/`
- [x] Similar `use[A-Z]` helpers audited; legitimate hooks left alone
- [x] No eslint-disable / rule weakening
- [x] Lint 0 / typecheck 0 / test 0 / build 0
- [x] Production lint: 0 errors, 0 warnings
