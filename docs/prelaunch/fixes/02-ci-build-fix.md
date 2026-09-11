# Fix 02 — Clean CI / Build Quality

**Mode:** Remediation (code changes applied)  
**Date:** 2026-09-06  
**Evidence basis:** Pre-launch audit `07-performance-technical.md` + local `npm run lint` / `npm run typecheck` / `npm test` / `npm run build`

---

## 1. Failures before

From audit `07-performance-technical.md` (and re-confirmed at start of this fix):

| Command | Exit | Notes |
|---|---|---|
| `npm run lint` | **1** | 9 errors, ~55 warnings |
| `tsc --noEmit` | **2** | ~16 `error TS` lines |
| `npm test` | **1** | Failures in comparison, discovery, freshness, gear-setup-page, launch-readiness, padel-hub, product-page, search-discovery (+ brand-hub timeouts under full suite) |
| `next build` | **workaround only** | Passed only with temporary `typescript.ignoreBuildErrors` / `--no-lint` |

Also present from Fix 01 interim work: `typescript.ignoreBuildErrors: true` in `next.config.ts` (removed here).

---

## 2. Root causes

### Lint

- Parse/noise from staging JSON under `data/**` scanned by ESLint
- `prefer-const` in `scripts/register-media-gaps.ts` and `src/lib/catalog/params.ts`
- `no-require-imports` on CommonJS-style scripts
- Unused-import noise (warnings kept unless they blocked exit 0)

### TypeScript

- `LongFormGuideConfig.eyebrow` union too narrow for Comparison / Decision / Setup guides
- Mistakes fixture shape mismatch in guide visual enricher tests
- Homepage guide filter not narrowing nullable published guides
- Hero-download helper typing for `excludeSrc`
- Catalog params `useCase` reassignment flagged / typed incorrectly

### Tests (classified)

| Suite | Classification | Cause |
|---|---|---|
| `search-discovery` | **Real regression** | Broad category queries still returned weak cross-category product hits → `detectDominantCategoryId` undefined → feature filters ineffective |
| `padel-hub` | **Real content bug** | Starter kit referenced draft `prod-nox-bag-10` → missing price → `total` omitted |
| `comparison` | Stale expectation | Use-case cards now resolve clear winners (no tie) for Novablast 6 vs Nimbus 27 |
| `discovery` | Stale | `racket` sport is `live`; test still expected non-live |
| `launch-readiness` | Stale | Nutrition is `launch-supporting`, not `future` |
| `product-page` | Stale | Novablast 6 now has a published review |
| `gear-setup-page` | Stale fixture | Both sample products now have EUR offers → `unknownCount === 0` |
| `freshness` | Stale fixture | Bullpadel Vertex 05 is already in catalog → monitor classifies as unchanged |
| `brand-hub` | Timeout flake | Hub assembly ~3s/brand; default Vitest 5s timed out under full-suite load |

### Build

- Temporary `ignoreBuildErrors` blocked honest typechecking during `next build`
- Once TS + lint root causes fixed, normal `next build` succeeds

---

## 3. Fixes applied

### Config / tooling

- Removed `typescript.ignoreBuildErrors` from `next.config.ts`
- Added `"typecheck": "tsc --noEmit"` to `package.json`
- `eslint.config.mjs`: ignore `data/**` / `public/**`; relax `no-require-imports` for `scripts/**`
- `vitest.config.ts`: `testTimeout: 30_000` for heavy catalog assemblers

### Production code

- `src/lib/search/engine.ts` — with clear category intent, **drop** non-matching-category products instead of soft-penalizing (restores dominance + feature facets)
- `src/content/padel/seed.ts` — padel starter kit uses only published priced items (4 essentials; draft bag removed from kit)
- `src/lib/guides/long-form-config.ts` — expanded eyebrow union
- `src/lib/home/get-homepage-data.ts` — proper published-guide narrowing
- `src/lib/catalog/params.ts` — `const useCase`
- Scripts: prefer-const / hero-download typing cleanup

### Tests / fixtures

- Comparison: assert winner/tie cards + Nimbus long-run winner (no hard-coded tie)
- Discovery: use `cycling` as non-live sport
- Launch readiness: nutrition `launch-supporting`
- Product page: expect Novablast 6 published review
- Gear setup: unknown-price probe uses missing product id
- Freshness: fixture generation `Vertex 06` (not already-catalogued 05)
- Padel hub: expect 4 starter items + numeric `total`

---

## 4. Files changed (this remediation)

| Path | Role |
|---|---|
| `next.config.ts` | Remove TS ignore bypass |
| `package.json` | Add `typecheck` script |
| `eslint.config.mjs` | Ignore staging assets; script rule tweak |
| `vitest.config.ts` | Raise test timeout |
| `src/lib/search/engine.ts` | Category-intent product filtering |
| `src/content/padel/seed.ts` | Publishable starter kit items |
| `src/lib/guides/long-form-config.ts` | Eyebrow types |
| `src/lib/home/get-homepage-data.ts` | Guide filter narrowing |
| `src/lib/catalog/params.ts` | prefer-const / params |
| `src/lib/guides/enrich-explainer-visuals.test.ts` | Mistakes fixture shape |
| `src/domain/freshness/fixtures.ts` | Padel new-gen fixture |
| `scripts/register-media-gaps.ts` | prefer-const |
| `scripts/lib/hero-download.mjs` | excludeSrc typing |
| `tests/comparison.test.ts` | Expectation update |
| `tests/discovery.test.ts` | Non-live sport |
| `tests/freshness.test.ts` | Generation 06 |
| `tests/gear-setup-page.test.ts` | Unknown-price fixture |
| `tests/launch-readiness.test.ts` | Nutrition status |
| `tests/padel-hub.test.ts` | Kit size + total |
| `tests/product-page.test.ts` | Review present |
| `docs/prelaunch/fixes/02-ci-build-fix.md` | This report |

---

## 5. Test changes summary

- **No skips**, no broad eslint-disable, no `@ts-ignore` abuse
- One **engine** fix (search) and one **content** fix (padel kit) for real bugs
- Remaining failures updated to match intentional catalog/launch state
- Vitest timeout raised so brand-hub integration tests remain assertions, not flakes

---

## 6. Final command results

| Command | Exit status |
|---|---|
| `npm run lint` (`eslint --quiet`) | **0** |
| `npm run typecheck` (`tsc --noEmit`) | **0** |
| `npm test` | **0** (47 files / 502 tests) |
| `npm run build` | **0** (normal Next config; no ignoreBuildErrors / `--no-lint` workaround) |

### Build notes

- Production build completed with typed Next compilation
- Shared First Load JS remains ~103 kB (post Fix 01)
- No temporary config modifications during the verifying build

---

## 7. Definition of done

- [x] Lint exits 0 without required `--no-lint`
- [x] Typecheck exits 0 without ignore flags
- [x] Full test suite exits 0 without skips
- [x] Production build exits 0 on normal `next.config.ts`
- [x] Report written to `docs/prelaunch/fixes/02-ci-build-fix.md`
