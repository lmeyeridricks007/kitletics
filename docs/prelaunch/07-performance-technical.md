# Kitletics Pre-Launch Audit 07 — Performance, Accessibility & Technical Health

**Mode:** READ-ONLY re-audit (post remediations 01–13)  
**Generated:** 2026-09-06T16:30:00.000Z  
**Runtime:** `http://127.0.0.1:3010` (production `next start` after fresh `npm run build`)  
**Machine-readable:** [`data/14-route-lab.json`](./data/14-route-lab.json) · [`data/14-route-lab-summary.json`](./data/14-route-lab-summary.json) · build log `data/reaudit-logs/build.log`

Evidence is labeled **MEASURED**, **STATIC ANALYSIS**, or **NOT MEASURABLE LOCALLY**. Numbers are not invented.

---

## 1. CI / build gates (MEASURED)

| Check | Exit | Notes |
|---|---:|---|
| `npm run build` | **0** | Shared First Load JS **103 kB** (was ~7.8 MB mega-chunk) |
| `npm run lint` | **0** | 0 errors; warnings remain (unused vars) |
| `npm run typecheck` | **0** | Clean |
| `npm test` | **0** | **523 / 523** passed (49 files) after aligning tests to launch eligibility |

Largest JS chunks under `.next/static/chunks/` (MEASURED): framework ~178 kB, polyfills/main under ~170 kB. No multi-megabyte shared catalog chunk remains.

---

## 2. Route lab — desktop transfer & paint (MEASURED)

Playwright Performance API on production lab (`prelaunch-07-route-lab.mjs`). LCP via PerformanceObserver was often `null` in this harness; FCP/TTFB/transfer are reported.

| Route | Status | FCP (ms) | TTFB (ms) | Total | JS | Images | CLS | axe serious/critical |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `/` | 200 | 352 | 162 | 405 KB | 145 KB | 98 KB | 0 | 0 |
| `/running` | 200 | 392 | 175 | **3.5 MB** | 145 KB | 3.1 MB | 0 | 0 |
| `/running/shoes` | 200 | 1160 | 982 | **7.1 MB** | 156 KB | 6.8 MB | 0 | 0 |
| `/products/nike-vomero-18` | 200 | 408 | 312 | **6.8 MB** | 148 KB | 6.6 MB | 0 | 0 |
| `/reviews/nike-vomero-18` | 200 | 1220 | 985 | 322 KB | 144 KB | 6 KB | 0 | 0 |
| `/best/running-shoes` | 200 | 1336 | 1217 | 310 KB | 146 KB | 26 KB | 0 | 0 |
| `/guides/how-to-choose-running-shoes` | 200 | 708 | 495 | 326 KB | 146 KB | 52 KB | 0 | 0 |
| `/brands/nike` | 200 | 3280 | 3094 | **10.7 MB** | 135 KB | 10.4 MB | 0 | 0 |
| `/compare` | 200 | 252 | 171 | 287 KB | 168 KB | 0 | 0 | 0 |
| `/tools/running-shoe-finder` | 200 | 408 | 321 | 992 KB | **866 KB** | 3 KB | 0 | 0 |
| `/search` | 200 | 256 | 175 | 261 KB | 138 KB | 0 | 0 | 0 |

**Lab probes that 404’d (harness path, not necessarily production bugs):**

| Probe | Status | Note |
|---|---:|---|
| `/running/shoes/daily-trainers` | 404 | Use-case listing path — confirm canonical listing URLs |
| `/tools/pace-calculator` | 404 | Correct slug is `/tools/running-pace-calculator` (in sitemap) |

---

## 3. Accessibility & responsive (MEASURED)

| Check | Result |
|---|---|
| axe serious/critical on P0 lab routes | **0** |
| `prelaunch-11-a11y-check` overflow @390 | **0** (`overflow: true` = 0) |
| Responsive overflow samples (lab) | No doc overflow flags in summary |

---

## 4. Static analysis (STATIC)

| Signal | Value |
|---|---|
| First Load JS shared by all | **103 kB** |
| `/tools/[slug]` First Load | **851 kB** (finder/tool island still heavy) |
| Homepage First Load | 117 kB |
| Security headers / preview | Unchanged policy surface (see prior 07 + trust remediations) |

---

## 5. Before → after (performance)

| Metric | Baseline (original 07) | Re-audit |
|---|---|---|
| Shared catalog JS chunk | ~**7.8 MB** BLOCKER | **Gone** — shared First Load **103 kB** |
| Home LCP (LH mobile, prior) | ~76 s (lab anomaly / weight) | FCP **352 ms**; transfer **405 KB** |
| `/running/shoes` weight | Multi-MB + extreme LCP | Still **~7 MB** mostly **images** (HIGH residual) |
| CI build/lint/typecheck/test | Failed / flaky historically | **All green** |

---

## 6. Findings

### HIGH (residual)
1. **Image-bound hubs** — `/running`, `/running/shoes`, `/brands/nike`, PDPs still download multi-MB image sets on first paint. JS architecture fix did not solve image strategy.
2. **Finder bundle** — `/tools/[slug]` First Load **851 kB** / lab JS **866 KB**.

### MEDIUM
3. Lab used a wrong calculator slug (`pace-calculator`) → document correct URLs in QA scripts.
4. `/running/shoes/daily-trainers` 404 in lab — verify use-case listing publish/eligibility.

### NOT MEASURABLE LOCALLY
- Field INP / CrUX, CDN LCP, real-user CLS.

---

## 7. Verdict for this report

**Performance architecture BLOCKER cleared.** Residual **image weight** and **finder bundle** remain High for CWV risk on catalog hubs — not the same class as the prior shared 7.8 MB JS catastrophe.
