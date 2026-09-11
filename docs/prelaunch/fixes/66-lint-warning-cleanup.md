# Fix 66 — Zero-warning lint cleanup

**Date:** 2026-09-10  
**Status:** Implemented  
**V3 residual:** `npm run lint` exit 0, **0 errors**, **112 warnings** (live inventory at start of this fix: **121** warnings / 66 files)  
**Target:** 0 errors, 0 warnings without hiding legitimate issues

---

## Result

| Command | Before (this session) | After |
|---|---|---|
| `npm run lint` | 0 errors, **121 warnings** | **0 errors, 0 warnings** |
| `npm run typecheck` | — | **exit 0** |
| `npm test` | — | **56 files / 585 tests passed** |
| `npm run build` | — | **exit 0** (Next.js 15.5.24) |

No `eslint-disable` comments were added. No `void` dummy references. The unused-vars **rule stays on** (`warn`); only `_`-prefixed names are ignored so required signatures can use `_param`.

---

## 1. Inventory (before)

Live `eslint -f json` at session start: **0 errors, 121 warnings, 66 files**.

| Rule | Count | Notes |
|---|---:|---|
| `@typescript-eslint/no-unused-vars` | **118** | Unused imports, locals, dead helpers; `_`-prefixed names also warned because Next’s typescript preset has no ignore pattern |
| `react-hooks/exhaustive-deps` | **2** | Home gym share restore; Search filters `baseOpts` identity |
| unused `eslint-disable` | **1** | `scripts/lib/logo-hero-detect.ts` — `no-require-imports` already off for `scripts/**` |

Largest unused-vars clusters:

| Area | Warnings | What they were |
|---|---:|---|
| `src/domain/review-agent/unique-expert-research.ts` | 17 | Dead section builders (`buildOverview` … `buildValue`) + `researchDisclaimer` |
| Prelaunch / QA scripts | ~70 | Unused imports and leftover audit locals |
| Production `src/` | ~25 | Unused imports (`Link`, `Image`, types), leftover maps/criteria |
| Deprecated `padSectionBodyToFloor` | 3 | Required unused params on a kept public no-op |

`_` prefix did **not** silence vars until this fix (`_seed`, `_topic`, `_product`, `_drop`, `_slug` all warned).

---

## 2. Safe dead-code removal (no behavior change)

Removed symbols that had **no live call sites**:

### Review synthesis leftovers

`uniqueTopicBody` is the live section path. Deleted unused builders and helpers that only they called:

- `researchDisclaimer`, `buildOverview`, `buildSpecs`, `buildFit`, `buildCushioning`, `buildRide`, `buildStability`, `buildUpper`, `buildGrip`, `buildDurability`, `buildTech`, `buildPerformance`, `buildStrengths`, `buildTradeoffs`, `buildUsecase`, `buildValue`
- Cascade: `roleDialect`, `specSentence`, `specFingerprint`, `competitorParagraphs`, `numericPeerSplits`, `isShoeProduct`

Live exports (`synthesizeUniqueExpertResearch`, `isUniqueExpertResearchEligible`) and verdict/pros/cons/audience builders are unchanged.

### Production leftovers

- Unused imports: Finder `Link` / `stepIsComplete`, alternatives `Image`, Compare `Link`, Comparison `AddToCompareButton`, discovery `Link`, sport-hub `SportHubPageData`, catalog `isLaunchListable`, brand-hub `ProductCategory`, setups `BuyingGuide`/`BestGuide`, commerce `shouldDisplayNumericPrice` (still used from `@/domain/commerce/ranking`), comparison re-export import of `findIndexItemsBySlugs` (re-export kept)
- Unused constants: `ROLE_CATEGORY`, `EXISTING_REVIEW_LINKS`, unused Best Guide criteria copies in `best-guides.ts` (`watchCriteria` / `hrmCriteria` / `vestCriteria` — shoe criteria still used)
- Unused locals in site-quality `fix-and-report.ts` (`issue` import, `hit`)
- `friendlyNote` dropped unused `key`; compact-plan `calloutBody` / `nextStepParas` dropped unused slug args (callers updated)

### Scripts / prelaunch tooling

Scripts were **not** ignored. Each unused name was checked: unused imports/locals/empty loops removed; reports still write the same files. Empty `catch (e)` → `catch`. Deleted unused helpers (`dirFor`, `esc`, `mdTable`, `runningSport`, …) only when they had no callers.

---

## 3. Required unused parameters (`_param`)

`eslint.config.mjs` now sets `@typescript-eslint/no-unused-vars` to **warn** with:

- `argsIgnorePattern` / `varsIgnorePattern` / `caughtErrorsIgnorePattern`: `^_`
- `ignoreRestSiblings: true`

This **does not disable the rule**. It enables the project convention the brief asked for.

Kept `_` bindings (cannot drop without leaking fields or breaking the public signature):

| Location | Why it stays |
|---|---|
| `padSectionBodyToFloor(body, _topic, _product, _review)` | Deprecated public no-op; signature preserved |
| `issue()` `idSuffix: _drop` | Must omit `idSuffix` from rest spread into `SiteIssue` |
| explainer visual `diagram: _drop` | Must omit `diagram` from rest when replacing a shoe diagram |
| gear-setup P45 `itemPatches: _` | Must omit `itemPatches` before spreading the rest of the patch |

Own functions with unused args were **narrowed** instead of prefixing (`calloutBody`, `nextStepParas`, `testingContextCopy`).

---

## 4. Hook warnings (fixed, not suppressed)

**Home gym builder** (`HomeGymBuilderClient.tsx`): share/local-room restore must run **once on mount**. `applyShared` is stored on a ref and the effect still has `[]`, so catalog/offer identity changes do not re-apply `?build=`. Same restore behavior as before.

**Search filters** (`SearchFilters.tsx`): `baseOpts` is now `useMemo`’d from filter/brand/features/price so the existing `body` memo deps stay stable. Href construction is unchanged.

---

## 5. No cosmetic suppression

- Removed the unused `eslint-disable-next-line @typescript-eslint/no-require-imports` in `logo-hero-detect.ts` (scripts already have that rule off).
- No new file-level or global unused-vars `off`.
- No `void x` keep-alives.

---

## 6. Verification

```text
npm run lint       → 0 errors, 0 warnings
npm run typecheck  → exit 0
npm test           → 56 files, 585 passed
npm run build      → exit 0
```

---

## Remaining warnings

**None.** If a future required unused binding cannot be named `_…` (for example a third-party callback whose name is fixed), document that case rather than disabling the rule.
