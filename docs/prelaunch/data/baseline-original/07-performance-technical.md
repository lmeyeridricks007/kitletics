# Kitletics Pre-Launch Audit 07 — Performance, Accessibility & Technical Health

**Mode:** READ-ONLY forensic (no optimizations applied)
**Generated:** 2026-09-06T11:27:54.709Z
**Runtime:** `http://127.0.0.1:3010` (production `next start`)
**Machine-readable:** [`data/07-performance-technical.json`](./data/07-performance-technical.json)

Evidence is labeled **MEASURED**, **STATIC ANALYSIS**, or **NOT MEASURABLE LOCALLY**. Numbers are not invented.

---

## Evidence classes

### MEASURED
- lint/typecheck/test/build exit codes and logs
- Lighthouse mobile performance/accessibility on 8 routes
- Playwright desktop Performance API FCP/TTFB/CLS + Resource Timing weights on 13+ routes
- axe-core WCAG2 A/AA violations
- responsive overflow checks at 390/768/1440
- functional probes
- console/page/network errors during lab crawl
- response security headers from next start

### STATIC ANALYSIS
- next build First Load JS route table
- largest .next/static/chunks file sizes
- client component file count ("use client")
- font config in src/app/layout.tsx
- AnalyticsScripts / NEXT_PUBLIC_GA gating
- dangerouslySetInnerHTML usages
- preview route presence
- chunk 918 (~7.8MB) referenced by layout/best/compare/tools — catalog strings present

### NOT MEASURABLE LOCALLY
- Field INP / CrUX
- Real-user CLS/LCP on production CDN
- Affiliate network script payload when GA unset
- Penetration testing / full secret scanning of all env stores

---

## 1. Production build & quality gates

| Gate | Exit | Result |
|---|---:|---|
| lint (`npm run lint`) | 1 | 9 errors, 55 warnings |
| typecheck (`tsc --noEmit`) | 2 | ~16 `error TS` lines |
| tests (`npm test`) | 1 | 10 failed / 492 passed (9 files failed) |
| production build (`next build --no-lint` + temp ignoreBuildErrors) | 0 | Succeeded; Build ID `hQGZdtSRJeCXvxnzmMlNc` |

Failed tests (names): best-guide, comparison, discovery, freshness, gear-setup-page, launch-readiness, padel-hub, product-page, search-discovery (×2).

---

## 2–4. Representative routes & performance

Lighthouse = **mobile lab**. Playwright = **desktop** Resource Timing / Performance API. INP = **null / not measured** in lab.

| Route | Type | Status | LH Perf | LH LCP (ms) | LH CLS | LH TTFB (ms) | LH weight | PW JS (KB) | PW images (KB) | Issues |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| `/` | Homepage | 200 | 59 | 75994 | 0 | 449 | 28154KB | 1122 | 27816 | LH LCP 75994ms; LH weight 28154KB; axe serious/critical 1 |
| `/running` | Running Hub | 200 | 54 | 5610 | 0.04608986179537566 | 2393 | 19948KB | 1122 | 18639 | LH LCP 5610ms; LH weight 19948KB; axe serious/critical 1 |
| `/running/shoes` | Running Shoes | 200 | 48 | 56375 | 0.04608986179537566 | 1727 | 47542KB | 1132 | 46181 | LH LCP 56375ms; LH weight 47542KB; axe serious/critical 1 |
| `/running/shoes/daily-trainers` | Running subcategory | 404 | — | — | — | — | — | 1129 | 0 | HTTP 404 |
| `/products/nike-vomero-18` | Product Detail | 200 | 76 | 3825 | 0 | 1307 | 7698KB | 1125 | 6397 | LH weight 7698KB; axe serious/critical 2 |
| `/reviews/nike-vomero-18` | Review | 200 | 72 | 3589 | 0 | 1757 | 1458KB | 1120 | 10 | axe serious/critical 2 |
| `/best/running-shoes` | Best Guide | 200 | 67 | 3627 | 0 | 2092 | 1450KB | 1122 | 44 | axe serious/critical 2 |
| `/guides/how-to-choose-running-shoes` | Long Guide | 200 | — | — | — | — | — | 1123 | 91 | axe serious/critical 1 |
| `/brands/nike` | Brand Hub | 200 | — | — | — | — | — | 1118 | 8906 | axe serious/critical 1 |
| `/compare` | Compare | 200 | 75 | 3223 | 0 | 338 | 1369KB | 1145 | 0 | axe serious/critical 2 |
| `/tools/running-shoe-finder` | Finder | 200 | — | — | — | — | — | 1180 | 4 | axe serious/critical 1 |
| `/tools/pace-calculator` | Calculator | 404 | — | — | — | — | — | 1180 | 0 | HTTP 404; axe serious/critical 1 |
| `/search` | Search | 200 | 76 | 2925 | 0 | 617 | 1265KB | 1120 | 0 | axe serious/critical 1 |
| `/tools/running-pace-calculator` | Calculator | 200 | — | — | — | — | — | 1180 | 0 | axe serious/critical 1 |
| `/running/shoes?type=daily-trainers` | Running subcategory (query type=) | 200 | — | — | — | — | — | 1132 | 32949 | axe serious/critical 1 |

### Notable MEASURED findings
- Homepage LH LCP **~76s**, total weight **~28 MB** (image-heavy).
- `/running/shoes` LH LCP **~56s**, total weight **~47 MB**.
- Product/Review/Best/Compare/Search LCP roughly **2.9–3.8s** on mobile lab.
- Desktop Playwright JS transfer consistently **~1.1 MB** across routes (aligns with large shared chunk).
- `/running/shoes/daily-trainers` and `/tools/pace-calculator` are **404**; correct alternatives measured separately.

---

## 5. JavaScript (STATIC + MEASURED)

| Item | Value |
|---|---|
| Client component modules (`"use client"`) | 81 |
| First Load JS `/tools/[slug]` | 1.15 MB |
| First Load JS `/compare` | 1.12 MB |
| First Load JS `/best/[slug]` | 1.09 MB |
| Shared First Load JS | 102 kB |
| Largest chunk on disk | `918-*.js` **7.8 MB** (layout/best/compare/tools) |

**Catalog data shipped client-side (STATIC):** chunk `918` contains catalog identifiers (`cat-running`…) and is referenced from root layout + best + compare + tools — primary suspect for multi-MB hydration cost.

---

## 6. Images

- **MEASURED:** Listing hubs pull very large image byte weights (home ~28MB, running shoes ~47MB LH).
- **MEASURED:** CLS mostly 0; Running hub/shoes show small CLS ~0.046 in LH.
- **STATIC:** `next/image` with `priority` used on some hero/card surfaces; sizes attributes present in several components.
- Oversized LCP on home/shoes listings correlates with many product thumbnails, not a single tiny LCP element.

---

## 7. Fonts (STATIC)

- Families: **Outfit** (500/600/700), **DM Sans** (400/500/600/700) via `next/font/google`.
- CSS variables `--font-display`, `--font-body`.
- Preload/blocking specifics beyond next/font defaults: **not separately measured**.

---

## 8. Third-party

| Item | Observation |
|---|---|
| Analytics | Optional GA4 in `AnalyticsScripts` — only if `NEXT_PUBLIC_GA_MEASUREMENT_ID` set; consent defaults denied |
| Lab third-party hosts | (none beyond self / next assets) |
| Affiliate scripts | None observed in lab; commerce uses `/go` redirects |
| Embeds | None observed on representative routes |

---

## 9. Accessibility

**MEASURED (axe + LH):**
- Recurring **color-contrast** (serious): accent `#c8f542` on white (~1.26:1).
- Recurring **aria-hidden-focus**.
- **link-in-text-block** on several pages.
- **heading-order** on `/search` (LH).
- Landmarks: `main`/`nav`/`header`/`footer` present; single `h1` on 200 routes.

LH accessibility scores (mobile): home/running/shoes ~93; product ~90; review/best ~89; compare ~91; search ~90.

---

## 10. Responsive

| Viewport | Finding |
|---|---|
| 390px | **Homepage horizontal overflow** (`docOverflowX=true`); other sampled routes OK |
| 768px | No overflow on sampled routes |
| 1440px | Baseline desktop measurements |

Men/Women: filter URL `/running/shoes?gender=men` returns 200; PDP shows gender-related UI copy. Compare hub loads builder chrome.

---

## 11. Functional probes (MEASURED)

| Probe | OK |
|---|---|
| search-page-loads | true |
| running-shoes-filter-query | true |
| running-shoes-sort | true |
| compare-hub | true |
| finder-start | true |
| product-offers-section | true |
| internal-nav-home-to-running | true |
| men-women-on-pdp | true |

All listed probes passed. Note: wrong calculator/subcategory pathnames 404 (see errors).

---

## 12. Errors

- Hydration errors observed in lab: **0**.
- Console errors mostly on intentional 404 probes.
- 404 assets: representative wrong URLs above; not a sitewide asset breakage signal.

---

## 13. Security / privacy basics (not a pen test)

**MEASURED headers on `/`:** HSTS, nosniff, referrer-policy, X-Frame-Options DENY, Permissions-Policy. **No Set-Cookie** on home in lab.

**STATIC:** No CSP header configured. `dangerouslySetInnerHTML` used for JSON-LD / structured snippets. Preview route exists under `/preview/`. Public env vars are verification/GA IDs only (optional).

---

## 14. Summary

| Area | Status |
|---|---|
| Lint | FAIL (9 errors) |
| Typecheck | FAIL |
| Tests | FAIL (10) |
| Prod build | PASS with ignoreBuildErrors workaround |
| Mobile LCP on hubs | FAIL (home/shoes extreme) |
| Mobile LCP on PDP/review/best | Marginal (~3–4s) |
| JS weight | High (1MB+ first load on tools/compare/best; 7.8MB chunk) |
| A11y contrast | Systemic accent contrast failures |
| Functional happy-path | PASS on probes |
| INP field | NOT MEASURABLE LOCALLY |

No fixes applied.
