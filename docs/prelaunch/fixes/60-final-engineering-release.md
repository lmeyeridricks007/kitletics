# Fix 60 — Final engineering release pass

**Mode:** Production release checks (CI + HTTP + perf + a11y + functional + runtime)  
**Date:** 2026-09-10  
**Lab:** `next build` + `next start` @ `http://127.0.0.1:3010` (PID `18712`, Next.js 15.5.24)  
**Evidence:** [`../data/rc-60/`](../data/rc-60/)

**Engineering verdict: GO**

All required gates exited 0. Historical `/compare` (~9.2 MB) and daily-trainers (~6.5 MB) transfer risks re-measured **inside** the 2.5 MB budget. No remaining engineering blocker from this pass.

---

## 1. CI

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **0** | 0 errors · 112 warnings (`@typescript-eslint/no-unused-vars` in scripts/src — not blocking) |
| `npm run typecheck` | **0** | `tsc --noEmit` |
| `npm test` | **0** | **56** files · **585** tests · 161.68 s |
| `npm run build` | **0** | Next.js 15.5.24 production build |

Logs: `docs/prelaunch/data/rc-60/logs/{lint,typecheck,test,build}.log`

### CI remediations required to get green

First run this clock was **not** green. Two Fix 58 leftovers blocked lint/typecheck (no tests skipped, no global ESLint disable, no `ts-ignore`):

| Failure | Cause | Fix |
|---|---|---|
| `typecheck` EXIT 2 | `BestGuide.faqIds` missing on Fix 58 Best Anti-Chafe | `faqIds: []` on `best-running-anti-chafe` |
| `lint` EXIT 1 | `react-hooks/rules-of-hooks` on `useCaseDump` (plain helper, not a hook) | Rename → `getUseCaseDump` (same class as Fix 52 `useCaseHint`) |

After those two edits: lint 0 / typecheck 0 / test 0 / build 0.

---

## 2. Full sitemap HTTP probe

**Script:** `scripts/tmp/prelaunch-60-sitemap-probe.ts`  
**Data:** [`../data/rc-60/sitemap-http-probe.json`](../data/rc-60/sitemap-http-probe.json)

Every current `sitemap()` URL, `redirect: "manual"`, HTML `robots` meta + `x-robots-tag`, plus a draft/future eligibility scan.

| Check | Result |
|---|---|
| Sitemap URLs | **1106** |
| HTTP 200 | **1106 / 1106** |
| 404 | **0** |
| 5xx / fetch 0 | **0** |
| Accidental redirects (3xx) | **0** |
| `noindex` (header or meta) | **0** |
| Facet query strings in sitemap | **0** |
| `/draft` `/preview` path leak | **0** |
| INDEXABLE draft / future `publishedAt` | **0** |

Gates: `zero404` · `zero5xx` · `zeroNoindex` · `zeroRedirects` · `zeroDraftsFuture` · `zeroFacetLeak` — **all true**.

---

## 3. Performance

**Script:** `scripts/tmp/prelaunch-60-p0-lab.mjs`  
**Data:** [`../data/rc-60/p0-lab.json`](../data/rc-60/p0-lab.json)  
**Budget:** **≤ 2.5 MB** Playwright transfer (networkidle, 1440×900)

| Route | Path | Total | Images | Budget |
|---|---|---:|---:|---|
| Home | `/` | 1.21 MB | 0.13 MB | pass |
| Running | `/running` | 1.45 MB | 0.25 MB | pass |
| Shoes | `/running/shoes` | 1.27 MB | 0.07 MB | pass |
| **Daily trainers** | `/running/shoes/daily-trainers` | **1.20 MB** | 0.10 MB | **pass** |
| PDP | `/products/nike-vomero-18` | 1.18 MB | 0.06 MB | pass |
| Review | `/reviews/nike-vomero-18` | 1.21 MB | 0.06 MB | pass |
| Best | `/best/running-shoes` | 1.43 MB | 0.08 MB | pass |
| Guide | `/guides/how-to-choose-running-shoes` | 1.31 MB | 0.08 MB | pass |
| **Compare** | `/compare` | **1.68 MB** | 0.01 MB | **pass** |
| Finder | `/tools/running-shoe-finder` | 1.00 MB | 0.02 MB | pass |
| Brand Nike | `/brands/nike` | 1.12 MB | 0.03 MB | pass |

### Historical unresolved risks — re-measured

| Route | Historical risk | This clock | vs 2.5 MB |
|---|---|---|---|
| `/compare` | ~9.2 MB | **1.68 MB** (1,765,190 B) | **inside budget** |
| `/running/shoes/daily-trainers` | ~6.5 MB | **1.20 MB** (1,256,569 B) | **inside budget** |

No further image-weight fix required this pass. Prior Fix 18 / 30 / 31 image-delivery work is holding.

---

## 4. A11y

**P0 (same lab as perf):** axe-core wcag2a/aa on all 11 routes above — **0 serious / 0 critical / 0 total violations**.

**Baseline (`npm run site:a11y-baseline`):** [`../data/rc-60/a11y-baseline.json`](../data/rc-60/a11y-baseline.json)

| Surface | Path | Violations |
|---|---|---:|
| Header / primary nav | `/` | **0** |
| Search | `/search?q=vomero` | **0** |
| Search filters | `/search?q=running+shoes` | **0** |
| Compare builder | `/compare` | **0** |
| Running shoe finder | `/tools/running-shoe-finder` | **0** |

**0 serious/critical on P0.** Keyboard QA remains a manual residual (baseline notes).

---

## 5. Functional

**Script:** `scripts/tmp/prelaunch-60-functional.mjs`  
**Data:** [`../data/rc-60/functional.json`](../data/rc-60/functional.json)

Operated against the production server (Playwright, 1440×900). **11 / 11 pass.**

| Surface | What was operated | Result |
|---|---|---|
| Search | Header `#header-search-input` → `vomero` → `/search?q=` results | pass |
| Filters | `/running/shoes` enabled facet checkbox → URL / Clear all | pass |
| Sort | Visible catalog sort `<select>` → alternate option sticks | pass |
| Men / Women | Fit chips → `gender=men` then `gender=women` | pass |
| Variant selector | PDP Fit/sizing radiogroup → Women → `fit=women` | pass |
| Compare | Builder sidebar: add Vomero + Ghost → `products=` comparison | pass |
| Finder | Running shoe finder: answer radios → See my matches | pass |
| Calculator | `/tools/running-pace-calculator` renders; duration input works | pass |
| Offers | PDP Amazon / Check price / `#offers` | pass |
| Nav | Header `/running` → running hub `h1` | pass |
| Breadcrumbs | PDP `nav[aria-label=Breadcrumb]` → parent link navigates | pass |

---

## 6. Runtime

**Script:** `scripts/tmp/prelaunch-35-runtime-smoke.mjs`  
**Data:** [`../data/rc-60/runtime-smoke.json`](../data/rc-60/runtime-smoke.json)

**Verdict: `STABLE_UNDER_MODERATE_LOAD`**

Process stayed alive. **0** ECONNREFUSED / timeout / 5xx across all four profiles.

| Profile | Conc. | Success | p95 | RSS max | Alive | Errors |
|---|---:|---:|---:|---:|---|---|
| warm-sequential | 1 | **100%** | 7.9 s | 982 MB | yes | none |
| moderate-crawler | 4 | **100%** | 12.3 s | 889 MB | yes | none |
| busy-crawler | 8 | **100%** | 21.5 s | 810 MB | yes | none |
| stress-local | 16 | **100%** | 27.0 s | 1117 MB | yes | none |

Baseline RSS 334 MB → post 764 MB. Local `next start` is one Node process; Vercel is isolated invocations. This clock did **not** reproduce the historical swarm death.

---

## 7. Engineering GO / NO-GO

| Gate | Required | This clock |
|---|---|---|
| CI all exit 0 | yes | **PASS** |
| 0 sitemap 404 | yes | **PASS** (0/1106) |
| 0 sitemap 5xx | yes | **PASS** |
| 0 sitemap noindex | yes | **PASS** |
| 0 accidental redirects | yes | **PASS** |
| 0 drafts/future in sitemap | yes | **PASS** |
| P0 transfer ≤ 2.5 MB | yes | **PASS** (max 1.68 MB on `/compare`) |
| `/compare` + daily-trainers re-measured | yes | **PASS** (1.68 / 1.20 MB) |
| Axe 0 serious/critical on P0 | yes | **PASS** |
| Functional operate list | yes | **PASS** (11/11) |
| Moderate concurrency smoke | yes | **PASS** (`STABLE_UNDER_MODERATE_LOAD`) |

**ENGINEERING GO.** This is not a substitute for the editorial RC (Fix 59 V3 READY is a separate document). Residual lint warnings are unused locals, not release blockers.

### Evidence index

| Artifact | Path |
|---|---|
| CI logs | `docs/prelaunch/data/rc-60/logs/{lint,typecheck,test,build,server}.log` |
| Sitemap probe | `docs/prelaunch/data/rc-60/sitemap-http-probe.json` |
| P0 transfer + axe | `docs/prelaunch/data/rc-60/p0-lab.json` |
| A11y baseline | `docs/prelaunch/data/rc-60/a11y-baseline.json` |
| Functional | `docs/prelaunch/data/rc-60/functional.json` |
| Runtime smoke | `docs/prelaunch/data/rc-60/runtime-smoke.json` |
