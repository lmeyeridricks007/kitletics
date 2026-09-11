# Fix 84 — Test performance / worker timeout stability

**Date:** 2026-09-11  
**Status:** Implemented  
**Gate:** `npm test` (default Vitest config) → **3/3 PASS**, **0 timeouts**  
**Evidence:** `docs/prelaunch/data/rc-84/`

---

## 1. Problem

Under default workers, six catalog/sitemap/eligibility cases timed out at **120s**.

The same cases passed with developer overrides:

```bash
vitest run --maxWorkers=1 --testTimeout=300000
```

That pointed to **resource contention / repeated expensive initialization**, not functional failure.

**Do not** raise the global timeout to 300s.

---

## 2. Profile — the six timeout-prone cases

| # | File | Case | Expensive work |
|---|------|------|----------------|
| 1 | `tests/alternatives-indexability-unification.test.ts` | sitemap Alternatives ⇔ `assessAlternativesIndexability` | Cold sitemap + Alternatives quality signals for every product |
| 2 | `tests/sitemap-lastmod.test.ts` | SEED_DATES mass-stamp integrity | Full sitemap entry walk |
| 3 | `tests/seo-indexation.test.ts` | sitemap brands ⊂ indexable hubs | Full sitemap + brand eligibility |
| 4 | `tests/product-quality-assessor-consistency.test.ts` | domain quality matches eligibility for all Running products | Full Running catalog eligibility loop |
| 5 | `tests/gear-hub.test.ts` | assembles cross-sport hub | Gear hub assembly over published catalog |
| 6 | `tests/comparison.test.ts` | sitemap Comparison URL integrity | Sitemap path set + comparison page data |

**Measured cold sitemap** (after Fix 82 Alternatives signals): ~**55–60s** setup in the integration project (see `setup` in acceptance logs). Warm hits are near-instant via module cache.

Under **N parallel workers**, each worker cold-built sitemap / signals independently → CPU thrash → 120s timeouts. Serial (`maxWorkers=1`) avoided that, which matched the override symptom.

Secondary hotspot found while remediating:

- `tests/launch-eligibility.test.ts` — Best-guides policy test called `simulateDay1LaunchCounts()` (full-catalog eligibility tally) redundantly; under parallel load it exceeded a 60s trial timeout.

---

## 3. Expensive shared work (root causes)

Repeated per worker / per isolated file:

1. **Full sitemap construction** (`src/app/sitemap.ts`) — launch eligibility for sports, categories, products, **alternatives**, brands, editorial, tools
2. **Alternatives quality signals** (`computeAlternativesQualitySignals`) — graph + decision-copy work for sitemap gate (Fix 82)
3. **Module isolation** (Vitest default `isolate: true`) — reset caches between files, so even `maxWorkers=1` rebuilt sitemap per file
4. **Day-1 simulation** — full-catalog `getLaunchEligibility` tallies
5. **Catalog / hub assembly** — category shells, gear hub, brand hubs

No shared temp files / ports were the primary issue; **CPU + duplicate immutable graph builds** were.

---

## 4. Remediation

### 4.1 Faster Alternatives signals (immutable, cached)

`src/lib/product/compute-alternatives-quality-signals.ts`:

- Early-exit when graph gate fails or ranked peers / reason groups are insufficient
- Defer `buildAlternativeDecisionCopy` until after diversity ranking (≤8 cards)
- Process-local caches for relationships + signals
- `clearAlternativesQualitySignalsCacheForTests()` for isolation when needed

### 4.2 Sitemap fixture (test-safe)

`tests/helpers/sitemap-fixture.ts` — cache entries / paths / path-set **once per worker**.  
`tests/helpers/warm-sitemap-setup.ts` — warm once for the integration project.

### 4.3 Unit vs catalog-integration projects

`vitest.config.ts` — Vitest **projects**:

| Project | Workers | Isolation | Timeout | Role |
|---------|---------|-----------|---------|------|
| `unit` | default | default | **120s** (not 300s) | Fast / semantic policy tests |
| `catalog-integration` | `maxWorkers: 1`, `fileParallelism: false` | `isolate: false` | 120s / hook 180s | Full catalog / sitemap / hub assemblies |

`sequence.groupOrder`: unit `0`, catalog-integration `1` (required when `maxWorkers` differ; also avoids unit∥integration CPU thrash during cold sitemap warm).

**Catalog-integration includes:**

- alternatives-indexability, sitemap-lastmod, seo-indexation
- product-quality-assessor-consistency, gear-hub, comparison
- launch-eligibility, editorial-readiness, catalog

### 4.4 Policy vs inventory separation

- Best-guides **semantic** test no longer calls full `simulateDay1LaunchCounts()` (tautological with the same eligibility filter).
- Day-1 inventory tally remains in its own test; `simulateDay1LaunchCounts` is **process-cached**.

### 4.5 What we did *not* do

- No global `testTimeout: 300_000`
- No requirement for `--maxWorkers=1` on `npm test`
- No shared mutable temp dirs / ports between workers

---

## 5. Acceptance — `npm test` × 3

Standard script: `"test": "vitest run"` (no CLI overrides).

| Run | Exit | Files | Tests | Duration | Timeouts |
|-----|------|-------|-------|----------|----------|
| 1 | **0** | 61 passed | 625 passed | 404.47s | **0** |
| 2 | **0** | 61 passed | 625 passed | 331.41s | **0** |
| 3 | **0** | 61 passed | 625 passed | 314.31s | **0** |

**Result: 3/3 PASS, 0 timeouts.**

Logs: `docs/prelaunch/data/rc-84/npm-test-run-{1,2,3}.log`, `npm-test-x3.log`.

---

## 6. Files touched

| Path | Change |
|------|--------|
| `vitest.config.ts` | Unit + catalog-integration projects, groupOrder, isolate/cache settings |
| `tests/helpers/sitemap-fixture.ts` | Immutable sitemap cache |
| `tests/helpers/warm-sitemap-setup.ts` | Integration setup warm |
| `tests/alternatives-indexability-unification.test.ts` | Use fixture |
| `tests/sitemap-lastmod.test.ts` | Use fixture; drop inflated per-test timeouts |
| `tests/seo-indexation.test.ts` | Use fixture |
| `tests/comparison.test.ts` | Use fixture |
| `tests/product-quality-assessor-consistency.test.ts` | Drop inflated timeout |
| `tests/gear-hub.test.ts` | Drop inflated timeout |
| `tests/launch-eligibility.test.ts` | Remove redundant Day-1 call from policy test |
| `src/lib/product/compute-alternatives-quality-signals.ts` | Early-exit + caches |
| `src/domain/launch/simulate-day1.ts` | Process cache |

---

## 7. Definition of done

- [x] Six timeout-prone cases identified and profiled
- [x] Expensive shared work found and cached where immutable
- [x] Unit vs integration separation explicit
- [x] No global 300s timeout
- [x] `npm test` 3/3 PASS, 0 timeouts, no developer CLI overrides
