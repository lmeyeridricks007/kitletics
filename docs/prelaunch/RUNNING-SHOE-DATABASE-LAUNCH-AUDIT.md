# Running Shoe Database — Production Launch Audit

**URL:** https://kitletics.com/running/shoes/database  
**Audit date:** 2026-09-11  
**Mode:** READ ONLY — no production or application code was modified during this audit.  
**Methods:** Live HTTP probes (curl), production sitemap/robots, local eligible-cohort computation against current workspace catalog, static review of uncommitted `/running/shoes/database` implementation, prior quality-guard report (`docs/data-products/RUNNING-SHOE-DATABASE-QUALITY.md`), plus a follow-up [code readiness review](e2d81785-dd68-48b6-9e9d-95c97a88b307) of the workspace implementation (read-only).

---

## Verdict

# NO-GO

The audited production URL does not serve the Running Shoe Database. It returns **HTTP 404**, is **not in the live sitemap**, and the feature implementation is **not present on the deployed git tree** (workspace route/components/lib are untracked `??`). Functional, performance, and live SEO checks against the public page therefore fail at the first gate.

Local workspace code is substantially further along (eligibility, stats quality gate, citation/about, analytics taxonomy, chart a11y patterns). That does **not** change the production verdict for this URL.

---

## Executive summary

| Area | Production status | Notes |
|------|-------------------|--------|
| Functional | Fail | Page does not load |
| Data | N/A on prod / Strong locally | Local cohort: 85 eligible; 0 drafts in DB; historical trends gated off |
| SEO | Fail | 404; not in live sitemap; catch-all match |
| Performance | Not measurable on prod | 404 — no LCP/CLS/bytes for the product page |
| Accessibility | Not measurable on prod | Drawer/charts designed in local code only |
| Analytics | Not measurable on prod | Wiring exists locally; view/filter duplicate risk noted |
| Linkability | Fail on prod | Journalist hitting the URL gets a 404 |

---

## Severity legend

- **BLOCKER** — Must fix before any claim that this URL is live/launch-ready  
- **HIGH** — Launch risk if/when the page ships  
- **MEDIUM** — Should fix soon after ship or before press push  
- **LOW** — Polish  
- **FUTURE** — Intentional deferral / roadmap  

---

## Findings

### BLOCKER

| ID | Finding | Evidence |
|----|---------|----------|
| B1 | **Production URL returns HTTP 404** | `curl -sI https://kitletics.com/running/shoes/database` → `HTTP/2 404`; `x-matched-path: /[sport]/[segment]/[listing]` (catch-all), not a dedicated database route. HTML title is the site default; body includes 404. |
| B2 | **Feature not deployed / not in git on `main` tracking** | `git ls-files` for `src/app/running/shoes/database/**`, `src/lib/running-shoe-database/**`, `src/components/running-shoe-database/**` → **0 tracked files**. Workspace shows `??` for those trees. Live site cannot serve what is not shipped. |
| B3 | **Live sitemap omits the database URL** | Production `sitemap.xml` lists `/running/shoes` and subcategory listings; **no** `/running/shoes/database`. Local uncommitted `src/app/sitemap.ts` *would* add it after deploy. |
| B4 | **All functional checklist items fail on production** | Database load, filters, sort, URL state, back/forward, clear, zero results, product/review/compare/alternatives/insight/share, mobile drawer — none can be exercised on the live URL while it 404s. |

### HIGH

| ID | Finding | Evidence |
|----|---------|----------|
| H1 | **Partial-deploy risk: discovery links already exist in local tracked diffs** | Workspace modifications wire “Shoe Database” into nav / sport hub / catalog / finder / best / compare (`src/lib/navigation/*`, `sport-hub/config.ts`, `catalog/running-shoes.ts`, etc.) pointing at `/running/shoes/database`. Shipping those **without** the untracked route would create sitewide broken links. Production `/running/shoes` currently shows **no** database hrefs (curl) — good for now; keep route + discovery atomic. |
| H2 | **Cannot certify performance vs Kitletics standards on this URL** | Lab baselines (`scripts/site-perf-baseline.ts`) do not include the database route. Production page does not exist to measure at 390 / 768 / 1440. No LCP/CLS/INP/transfer evidence for the audited URL. |
| H3 | **Analytics: `shoe_database_view` re-fires on every filter URL change** | `PageViewTracker` keys on `pathname + search` and emits `page_view` + `viewEventForPageType` → `shoe_database_view`. Filter pushes also emit `shoe_database_filter` / `shoe_database_sort`. Expect **view inflation** under normal filter use (not a pure duplicate of the same event in one tick, but overlapping journey signals). |
| H4 | **“Data Explorer Lazy” is not code-split** | `RunningShoeDataExplorerLazy.tsx` re-exports the full client explorer — **no** `next/dynamic`. Charts/explorer JS likely hydrate with the page client graph once shipped. |

### MEDIUM

| ID | Finding | Evidence |
|----|---------|----------|
| M1 | **Dataset freshness stamp intentionally null** | `RUNNING_SHOE_DATASET_META.updatedOn === null`. About/citation omit “Dataset updated …”. Honest for seed dates, but a cold journalist asking “How current is it?” gets version `2026.09` without a calendar refresh date. |
| M2 | **Two SUSPECT geometry records in local cohort** | Quality report: `saucony-xodus-ultra-3`, `topo-athletic-terraventure-5` (`drop_stack_soft_mismatch`). Stats exclude those flagged metrics; still visible as product rows. Human review before press claims. |
| M3 | **Release-year coverage too thin for historical market claims** | `assessHistoricalPublicInsightsReadiness` → `evidenceReady: false` (release year present on **2 / 85**). Correctly withheld — ensure UI never implies year trends on ship. |
| M4 | **No direct retailer `/go/` CTAs on database cards** | Cards link to product / review / alternatives / compare tray. Downstream `retailer_click` only after product (or other) pages. Journey is indirect; OK editorially, incomplete vs a “retailer downstream from database” expectation. |
| M5 | **Structured data `ItemList` capped at 50** | Page JSON-LD lists first 50 of 85 models. Acceptable for CollectionPage, but incomplete inventory markup. |
| M6 | **Mobile Filters control: weak dialog wiring details** | Drawer uses `role="dialog"`, `aria-modal`, `useModalFocus`, labelled title. Trigger has `aria-haspopup="dialog"` but no `aria-expanded` observed in source review. |
| M7 | **Browser automation lab unavailable in this environment** | patchright unresolved — interactive a11y/keyboard pass not executed against a running build. Relies on static review + HTTP evidence. |
| M8 | **Filter URL updates use `router.push`, not `replace`** | Every facet/sort change adds a history entry (`RunningShoeDatabaseExplorer` / chart deep-links). Back/forward works, but stacks grow deep during normal exploration. Prefer `replace` for filter churn; keep `push` only where intentional. |
| M9 | **About copy “held excluded” is stronger than the eligibility gate** | `isLaunchListable` only excludes `HIDDEN_404`; `PUBLIC_NOINDEX` / minor-work-held products can still enter the cohort. Align copy with code or tighten the gate before press claims. |

### LOW

| ID | Finding | Evidence |
|----|---------|----------|
| L1 | **Twitter/OG image not specialized** | Metadata sets OG title/description/url; no dedicated OG image for the database in `generateMetadata`. |
| L2 | **Filter button icon marked `aria-hidden` with visible “Filters” text** | Fine for SR; ensure badge count remains in accessible name (`Filters (n)` does). |
| L3 | **Compare tray may emit both shoe-database and compare-tray analytics** | `shoe_database_compare_add` plus tray source `"shoe-database"` — verify in GA4 DebugView for double-counting when tray also tracks adds. |
| L4 | **Direct “Compare” text link may lack `compare_add` tracking** | Tray checkbox path tracks; plain compare href may not. |
| L5 | **Social share hrefs can snapshot once on mount** | Copy-link uses live `window.location.href`; some share buttons may lag filter state. |
| L6 | **`research.csv` not listed in `robots.ts` Disallow** | Route sends `X-Robots-Tag: noindex`; robots.txt only blocks `/go/`, `/api/`, `/admin/`, `/preview/`. |

### FUTURE

| ID | Finding | Evidence |
|----|---------|----------|
| F1 | **Launch/MSRP time series** | Documented absence of canonical launch price; offer prices ≠ launch. Correct deferral. |
| F2 | **Evidence-backed historical year charts** | Gate exists; unlock only after release-year coverage thresholds. |
| F3 | **Add database route to `site:perf-baseline` route list** | After deploy, include `/running/shoes/database` in CWV lab set. |
| F4 | **Stamp `updatedOn` on intentional dataset refresh** | Ops process already documented in `dataset-meta.ts`. |

---

## Checklist results

### Functional (production URL)

| Check | Result |
|-------|--------|
| Database loads | **FAIL** — 404 |
| Dynamic count | **FAIL** — N/A |
| Filters / combined filters | **FAIL** — N/A |
| Sorting | **FAIL** — N/A |
| URL state | **FAIL** — N/A |
| Browser back/forward | **FAIL** — N/A |
| Clear filters | **FAIL** — N/A |
| Zero results | **FAIL** — N/A |
| Product / review / compare / alternatives | **FAIL** — N/A |
| Insight links | **FAIL** — N/A |
| Share / citation | **FAIL** — N/A |
| Mobile filter drawer | **FAIL** — N/A |

**Local implementation note (not production):** Explorer uses `router.push` + `useSearchParams` sync (back/forward), clear-all → `DEFAULT_DATABASE_FILTERS`, empty state copy “No shoes match…”, cards link product/review/alternatives + compare tray, insights deep-link via `databaseHref`, share/citation/about sections present, mobile drawer with focus trap helper.

### Data (local workspace cohort — proxy until prod ships)

| Check | Result |
|-------|--------|
| Canonically eligible only | **PASS** — `isRunningShoeDatabaseEligible` = category + sport + authentic media + `isLaunchListable` |
| No drafts / held in DB | **PASS** — category has 85 published + 1 draft; **0** non-published in eligible records |
| Missing-as-zero | **PASS** — averages omit nulls; quality gate strips SUSPECT/INVALID metrics |
| Gender variants | **PASS (design)** — one product model per record; About copy documents no double-count |
| Statistics reproducible | **PASS (local)** — `computeRunningShoeMarketInsights` / quality report deterministic on catalog |
| Sample sizes | **PASS (local)** — e.g. lightest daily trainers sample 49 / pop 49; coverage published on cards |
| Brand average thresholds | **PASS (local)** — `MIN_BRAND_SAMPLE_FOR_RANKING = 3`; **0** ranked brands under threshold |
| Affiliate commission ranking | **PASS (design)** — best-value uses `valueScore` + offer ceiling; methodology denies commission |
| Historical claims evidence-backed | **PASS (gate)** — `evidenceReady: false`; trends must stay withheld |

Local snapshot: **85** eligible · quality **VALID 83 / SUSPECT 2 / INVALID 0** · avg weight **263.9 g** · avg drop **7.2 mm** · avg heel **36.1 mm**.

### SEO (production)

| Check | Result |
|-------|--------|
| HTTP 200 | **FAIL** — 404 |
| Indexable | **FAIL** — 404 / not a real landing |
| Self canonical | **FAIL** — N/A on 404 |
| Metadata / OG | **FAIL** — N/A (default 404 document) |
| Breadcrumbs / structured data | **FAIL** — N/A |
| Sitemap | **FAIL** — URL absent |
| Robots | **PASS (site-level)** — `Allow: /`; no accidental disallow of `/running/` |
| Internal links (live) | **PASS for now** — no live inbound to the 404 observed on `/running/shoes` |
| Filter index explosion | **N/A on prod**; local design: query → `noindex,follow` + clean canonical |

### Performance (390 / 768 / 1440)

| Check | Result |
|-------|--------|
| LCP / CLS / interaction | **NOT RUN** — production 404; no local production-like server measured in this audit |
| Transferred bytes / JS / images / hydration | **NOT RUN** |
| Regression vs Kitletics standards | **CANNOT CERTIFY** |

Treat as launch gate after first successful deploy + Lighthouse (or `site:perf-baseline` extension) at mobile + desktop widths.

### Accessibility

| Check | Result |
|-------|--------|
| Live keyboard / SR / contrast | **NOT RUN** on production (404) |
| Local design review | Drawer dialog semantics + focus helper; chart patterns (striped/dotted/dashed) + text labels; filter `aria-pressed`; share `role="group"` |
| Residual risks | H4 hydration weight; M6 `aria-expanded`; full axe/manual pass still required post-deploy |

### Analytics

| Event / journey | Production | Local wiring |
|-----------------|------------|--------------|
| `shoe_database_view` | Not observable | Via `PageViewTracker` + `viewEventForPageType` |
| filter / sort | Not observable | `trackDatabaseFilterChange` on push |
| result / review / alternatives / compare | Not observable | Card handlers |
| insight view/click | Not observable | Insight cards |
| share / citation / CSV download | Not observable | Share / citation / download components |
| retailer downstream | Indirect | Global `/go/` → `retailer_click`; no DB card `/go/` |
| Duplicate risk | — | **H3** view+filter on query changes |

### Linkability (journalist cold open)

| Question | Production answer | Local intended answer |
|----------|-------------------|------------------------|
| What is this dataset? | **Cannot** — 404 | About section + CollectionPage |
| How many shoes? | **Cannot** | Live count in hero + About (`85` locally) |
| Where does data come from? | **Cannot** | Specs from catalog; eligibility criteria documented |
| How current? | **Cannot** | Version label; `updatedOn` null (honest gap) |
| How are metrics calculated? | **Cannot** | Methodology section on page |
| Can I cite it? | **Cannot** | Citation copy + canonical URL |
| Report a correction? | **Cannot** | `mailto:` corrections / press / data-questions |

---

## What must be true for GO

1. Commit + deploy the database route, lib, and components **together with** discovery/nav/sitemap changes (atomic).  
2. Production `GET /running/shoes/database` → **200**, self-canonical, indexable when query-empty.  
3. URL present in live sitemap; filtered URLs remain `noindex,follow`.  
4. Re-run this audit’s functional / a11y / perf / GA4 DebugView passes on production.  
5. Confirm historical UI still shows no year-trend claims while `evidenceReady === false`.  
6. Fix or accept **H3** (`shoe_database_view` on every query change) before trusting launch analytics.  
7. Optionally resolve SUSPECT stack/drop pairs before press outreach.

---

## Workspace code readiness (post-audit addendum)

Read-only follow-up: [code readiness review](e2d81785-dd68-48b6-9e9d-95c97a88b307).

**Local implementation:** no additional ship BLOCKER beyond production undeployed state. Confirmed strong: eligibility + media gate, missing≠zero averages, brand `n≥3`, affiliate-free value ranking, query `noindex` + clean canonical, citation/about honesty (`updatedOn: null`), chart non-color patterns, mobile drawer focus trap.

**Ship-before-trust (local):** H3 view inflation, H4 false “Lazy” explorer, M8 history `push` spam, M9 held-copy vs gate.

This addendum does **not** change the production **NO-GO**.

---

## Recommended re-audit triggers

- First production deploy of `/running/shoes/database`  
- Press / data-product announcement  
- After `updatedOn` stamp or major catalog refresh  
- After any change to eligibility, statistics quality gate, or GA4 taxonomy  

---

## Final classification

| Decision | Status |
|----------|--------|
| **GO** | No |
| **GO WITH MINOR ISSUES** | No |
| **NO-GO** | **Yes** — production URL is not live (404) and the feature is not shipped |

*Local code quality does not override production readiness for the URL under audit.*
