# Kitletics — Final Go / No-Go Probe

**Document ID:** `FINAL-GO-NOGO`  
**Mode:** Fresh **READ-ONLY** release probe  
**Clock:** `2026-09-09T18:16:00.000Z` (approx.)  
**Lab:** `next build` + `next start` @ `http://127.0.0.1:3010`  
**Absolute rule:** No product/code/content fixes during this probe  

**Artifacts**

- CI logs: `docs/prelaunch/data/rc-final/logs/go-{lint,typecheck,test,build}.log`
- Sitemap probe: [`data/rc-final/sitemap-http-probe.json`](data/rc-final/sitemap-http-probe.json)
- Domain eligibility: [`data/rc-final/go-nogo-domain.json`](data/rc-final/go-nogo-domain.json)
- P0 lab: [`data/rc-final/go-nogo-p0-lab.json`](data/rc-final/go-nogo-p0-lab.json)

---

# STATUS: **NO-GO**

Product / sitemap / Day-1 / performance / trust surfaces clear the launch bar.  
**CI does not** — `npm test` exits **1**. Per gate rules, GO is not allowed until CI is green.

---

## Blockers

| ID | Evidence |
|---|---|
| **CI tests FAIL** | `npm test` **EXIT 1** — 576 pass / **1 fail**: `tests/review-page.test.ts` expects reviews hub `items.length === getReviews().length` (**585**), but Fix 33 correctly filters the hub to INDEXABLE-only (**43**). Stale assertion vs intentional uniqueness-hold UX. |

**Path to GO:** Update that one test to assert INDEXABLE/promotable count (do not re-expand the hub to held scaffolds). No product defect observed in this failure.

---

## High

*None.* Prior RC Highs (sitemap 404s, Best CI ceiling, compare/daily-trainers transfer, uniqueness leakage) are clear in this probe.

---

## Medium

| ID | Notes |
|---|---|
| Lint warnings | **73** warnings, **0** errors — does not fail `npm run lint` |
| Trust URL alias | `/editorial-standards` file not present; `/editorial-policy` **is** present and live |
| Finder hub indexable | `/tools/running-shoe-finder` has empty robots (indexable tool page); **`/results` is `noindex,follow`** as required |

---

## CI

| Command | Exit | Notes |
|---|---:|---|
| `npm run lint` | **0** | 0 errors / 73 warnings |
| `npm run typecheck` | **0** | clean |
| `npm test` | **1** | **BLOCKER** — see above |
| `npm run build` | **0** | First Load JS shared **103 kB**; Finder **130 kB**; `/tools/[slug]` **167 kB**; Middleware **34.2 kB** |

---

## Sitemap health

| Check | Result |
|---|---|
| Sitemap URL count (`sitemap()`) | **660** |
| HTTP probe | **660 × 200** |
| 404 | **0** |
| 5xx | **0** |
| `noindex` on 200 | **0** |
| Redirects | **0** |
| Draft / future products in sitemap | **0** |

Clean re-probe after stable `next start` (earlier contaminated run during server restart discarded).

---

## Day-1 URLs

| Check | Result |
|---|---|
| INDEXABLE entity paths missing from sitemap | **0** |
| Sitemap review/best/product rows not INDEXABLE | **0** |
| Unexplained indexable orphans | **0** |

---

## Running Products

| Metric | Count |
|---:|
| Running products | **367** |
| Domain `LAUNCH_READY` | **362** |
| INDEXABLE | **251** |
| INDEXABLE ∩ ¬LAUNCH_READY | **0** |

Launch vertical: **Running `enabled` / INDEXABLE**. Held verticals remain gated (e.g. fitness `selective` → PUBLIC_NOINDEX; padel/tennis `disabled` → PUBLIC_NOINDEX; others HIDDEN/noindex as configured).

---

## Reviews

| Metric | Result |
|---|---|
| INDEXABLE | **43** |
| INDEXABLE with DUPLICATIVE / uniqueness NEEDS_DIFF | **0** |
| Hub surfaces INDEXABLE only (Fix 33) | Confirmed (drives the failing stale test) |

---

## Best

| Metric | Result |
|---|---|
| INDEXABLE | **44** |
| INDEXABLE ∩ ¬LAUNCH_READY | **0** |

---

## Guides

Buying guides remain under launch eligibility; no indexable orphan drift vs sitemap in this probe. P0 long guide `/guides/how-to-choose-running-shoes` → HTTP 200, transfer **1.3 MB**, axe SC **0**.

---

## Comparisons

Prior Fix 29 missing-peer 404s cleared: full sitemap probe includes comparisons with **0** non-200. Empty `/compare` builder within budget (**1.7 MB**).

---

## Performance

| Route | Transfer | Budget ≤2.5 MB | axe serious/critical |
|---|---:|---|---:|
| `/` | 1.21 MB | pass | **0** |
| `/running` | 1.45 MB | pass | **0** |
| `/running/shoes` | 1.27 MB | pass | **0** |
| `/running/shoes/daily-trainers` | **1.20 MB** | **pass** | **0** |
| PDP `nike-vomero-18` | 1.14 MB | pass | **0** |
| Best `running-shoes` | 1.43 MB | pass | **0** |
| Guide | 1.30 MB | pass | **0** |
| `/compare` | **1.70 MB** | **pass** | **0** |
| Finder | 1.00 MB | pass | **0** |
| Brand Nike | 1.07 MB | pass | **0** |

Shared First Load JS: **~103 kB** (lean).  

Gates: Compare ≤2.5 MB ✓ · Daily Trainers ≤2.5 MB ✓ · P0 axe serious/critical **0** ✓

---

## SEO

| Check | Result |
|---|---|
| Sitemap URLs indexable (no noindex meta) | **660/660** |
| Search `/search`, `/search?q=…` | **noindex,follow** |
| Filtered listing `?gender=men` | **noindex,follow** |
| Finder **results** | **noindex,follow** |
| Finder tool shell | indexable (intentional) |
| Running-only launch indexation | **Confirmed** |

---

## Trust

| Check | Result |
|---|---|
| Commission influences rankings | **No** (`ranking.ts`: commission intentionally absent / NEVER used) |
| Trust routes | `/methodology`, `/how-we-review`, `/affiliate-disclosure`, `/editorial-policy`, `/scoring-methodology` present |
| False first-hand on P0 HTML | **0** |
| Fake `AggregateRating` in P0 HTML | **0** (mentions are prohibitions / audit guards only) |
| How-we-review disclosure | States **zero** first-hand reviews currently |

---

## Gate scorecard (for GO allowance)

| Required for GO | Status |
|---|---|
| CI all green | **FAIL** |
| Sitemap 0 broken | **PASS** |
| No systemic thin/duplicate leakage | **PASS** |
| P0 journeys functional | **PASS** |
| Performance High issues cleared | **PASS** |

---

## Recommendation

**NO-GO** until the single stale reviews-hub test is aligned with INDEXABLE-only hub policy.  

After that CI fix (and a green `npm test`), this probe supports **GO** — no other Blocker or High findings remain in this pass.

**DO NOT PUBLISH.**
