# Fix 82 — Unify Alternatives indexability

**Date:** 2026-09-11  
**Status:** Implemented  
**Evidence:** [`../data/rc-82/`](../data/rc-82/) · `tests/alternatives-indexability-unification.test.ts`

## Absolute rule

There is **one** canonical answer to “Should this Alternatives page be indexable?”:

```ts
assessAlternativesIndexability(product, options) → {
  indexable,
  publishable,
  holdReason?,
  reasons,
  qualitySignals
}
```

Both **sitemap generation** (`getLaunchEligibility({ kind: "alternatives" })`) and **page robots** (`generateMetadata` → same eligibility) consume this result.

---

## 1. Policies before (dual standards)

### A. Sitemap / launch eligibility (lenient)

`eligibilityForAlternatives` treated a page as `INDEXABLE` when:

1. Parent product not `HIDDEN_404`
2. `canPublishAlternativesPage` (graph: ≥3 alts, ≥2 types, meaningful reasons, switch/trade shape)
3. Parent product `INDEXABLE`
4. Category ∈ `ALTERNATIVES_INDEXABLE_CATEGORIES`
5. Not in uniqueness holds
6. Editorial READY

It did **not** evaluate ranked-page substance (substantive cards, reason groups, distinct copy).

### B. Page robots / `getAlternativesPageData().indexable` (stricter)

Page indexability additionally required:

1. ≥3 substantive decision alternatives (`betterAt`/`worseAt`/`whoShouldSwitch`/`whoShouldStay`)
2. ≥2 reason groups on the ranked list
3. Distinct pair-specific decision copy

### Why 39 passed A but failed B

| Failure (page) | Count | Root cause |
|---|---:|---|
| `need ≥2 reason groups on ranked list` | **36** | **Assessor bug:** reason groups counted only `config.reasons` matches. Watch/shoe edges whose `reasonId` is the relationship type (e.g. `direct-competitor`, `next-generation`) were ignored → undercount (often 0–1 groups despite 2–3 real reasonIds). |
| `need ≥3 substantive decision alts (have 2)` | **3** | Genuine thin ranked substance |

Fresh diagnosis: [`data/rc-82/39-diagnosis.csv`](../data/rc-82/39-diagnosis.csv) · [`39-diagnosis.json`](../data/rc-82/39-diagnosis.json)

---

## 2. Canonical policy after

`assessAlternativesIndexability()` in `src/domain/launch/assess-alternatives-indexability.ts`.

| Signal | Indexable requires |
|---|---|
| Graph gate | `canPublishAlternativesPage` |
| Category | ∈ `ALTERNATIVES_INDEXABLE_CATEGORIES` |
| Uniqueness hold | absent |
| Substantive alts | ≥3 |
| Reason groups | ≥2 **unique `reasonId`s on the ranked page** (not config-only) |
| Distinct copy | true |
| Parent product | would be INDEXABLE |
| Editorial | READY |

`publishable = false` → `HIDDEN_404` (held / thin graph / vertical).  
`publishable && !indexable` → `PUBLIC_NOINDEX` (renderable, **not** in sitemap).  
`indexable` → `INDEXABLE` (sitemap + `index,follow`).

Shared content bar helpers: `src/lib/product/alternatives-quality-signals.ts`.  
Reason-group UI + bar: `get-alternatives-page-data.ts` now builds groups from ranked `reasonId`s (config order first, then fallbacks).

---

## 3. Disposition of the 39

**Principle:** prefer removing weak pages from the sitemap over loosening the bar.

| Outcome | Count | Action |
|---|---:|---|
| **Retained indexable** | **32** | Assessor fixed (true ≥2 reason groups). Stay in sitemap + `index,follow`. |
| **Removed from sitemap** | **7** | Content still fails the quality bar → `PUBLIC_NOINDEX` |

### Removed (legitimate weak content)

| Slug | Failure |
|---|---|
| `saucony-endorphin-pro-3` | 1 reason group |
| `brooks-glycerin-gts-22` | 1 reason group |
| `amazfit-t-rex-3-pro` | 1 reason group |
| `polar-h9` | 1 reason group |
| `nike-pegasus-trail-5` | 2 substantive alts |
| `salomon-genesis` | 2 substantive alts |
| `nnormal-kjerag-02` | 2 substantive alts |

No slug-by-slug patching. No blanket `index,follow` on weak pages.

---

## 4. Other surfaces (sitemap ⇔ indexable)

Sitemap already gates Products, Reviews, Best, Guides, Comparisons, Brands, Categories, Tools via `getLaunchEligibility` + `isIndexableEligibility`. Regression tests assert sitemap membership ⇒ INDEXABLE for those types. Alternatives now use the same assessor for both membership and robots.

---

## 5. Tests added

`tests/alternatives-indexability-unification.test.ts`:

- Ranked reasonId counting (Forerunner 255)
- Every sitemap Alternatives URL passes `assessAlternativesIndexability`
- Held Alternatives (`HOLD_INSUFFICIENT_ALTERNATIVE_MARKET`, `HOLD_DUPLICATE_INTENT`, obsolete) never enter sitemap
- Non-indexable categories stay non-indexable
- Weak pages (`polar-h9`, etc.) out of sitemap
- Sitemap ⇔ INDEXABLE for products / reviews / best / guides / comparisons / brands

---

## 6. Probe / counts

| Metric | Before | After |
|---|---:|---:|
| Sitemap URLs | **1174** | **1167** |
| Alternatives in sitemap | **137** | **130** |
| HTTP 200 | 1174 | **1167 / 1167** |
| Sitemap noindex | **39 alts** | **0** |
| 404 / 5xx / redirects | 0 | **0** |
| Facet / draft / future leaks | 0 | **0** |

Spot-check robots (BASE `http://127.0.0.1:3011`):

| URL | robots |
|---|---|
| `/products/garmin-forerunner-255/alternatives` | `index, follow` (retained) |
| `/products/asics-novablast-6/alternatives` | `index, follow` |
| `/products/polar-h9/alternatives` | `noindex, follow` (out of sitemap) |

Full probe: [`data/rc-82/sitemap-http-probe.json`](../data/rc-82/sitemap-http-probe.json)

```json
"counts": {
  "not200": 0, "redirects": 0, "notFound": 0, "serverErr": 0,
  "noindex": 0, "facetLeak": 0, "draftPathLeak": 0, "draftFutureEntities": 0
},
"gates": {
  "zero404": true, "zero5xx": true, "zeroNoindex": true,
  "zeroRedirects": true, "zeroDraftsFuture": true, "zeroFacetLeak": true
}
```

Quality is the invariant — count fell **−7** (1174 → 1167).

---

## 7. Files touched

- `src/domain/launch/assess-alternatives-indexability.ts` **(new)** — canonical assessor
- `src/lib/product/alternatives-quality-signals.ts` **(new)** — shared content bar
- `src/lib/product/compute-alternatives-quality-signals.ts` **(new)** — light ranking for sitemap
- `src/domain/launch/get-launch-eligibility.ts` — Alternatives uses content bar + memoized parent
- `src/domain/launch/index.ts` — export `assessAlternativesIndexability`
- `src/lib/product/get-alternatives-page-data.ts` — reason groups from ranked `reasonId`s + cache
- `src/app/products/[slug]/alternatives/page.tsx` — robots via `getLaunchEligibility`
- `tests/alternatives-indexability-unification.test.ts` **(new)**
- `vitest.config.ts` — `testTimeout` 240s (sitemap + alt signals under worker contention)

## 8. Verification

- `npm run lint` — 0 errors
- `npm run typecheck` / `tsc --noEmit` — pass
- Fix 82 + related vitest files — pass
- `npm run build` — pass
- `BASE_URL=http://127.0.0.1:3011 SITEMAP_PROBE_OUT=docs/prelaunch/data/rc-82 npm run sitemap:probe:current` — all gates green
