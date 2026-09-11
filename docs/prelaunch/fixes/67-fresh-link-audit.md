# Fix 67 — Fresh sitewide internal link audit + remediation

**Date:** 2026-09-10  
**Status:** Implemented  
**V3 residual:** editorial orphans **0**, but `site:audit:links` was **not** re-run after uniqueness/indexation changes (V2 log reused).  
**Target:** BLOCKER **0**, HIGH **0** on a **fresh** production-equivalent links audit (or documented intentional exceptions)

---

## Result

| Gate | After |
|---|---|
| `npm run site:audit:links` | **READY** — BLOCKER **0** · HIGH **0** · MEDIUM **0** |
| Inventory routes | **1152** (sitemap-derived **1150** unique paths) |
| INDEXABLE editorial orphans | **0** reviews · **0** Best · **0** guides · **0** comparisons |
| INDEXABLE reviews missing from sitemap | **0** |

Evidence:

- [`docs/prelaunch/data/rc-67/logs/site-audit-links.log`](../data/rc-67/logs/site-audit-links.log)
- [`docs/prelaunch/data/rc-67/site-quality-audit.md`](../data/rc-67/site-quality-audit.md)
- Diagnostic (eligibility graph, not the old auditor): [`docs/prelaunch/data/rc-67/logs/diagnostic.log`](../data/rc-67/logs/diagnostic.log)

**Do not use** [`docs/prelaunch/data/rc-v2/logs/site-audit-links.log`](../data/rc-v2/logs/site-audit-links.log) as current truth.

---

## 1. Why V2 / V3 were stale

V2 `site:audit:links` was **READY WITH ISSUES, 40 HIGH**. Pattern: “Review missing from sitemap.” Those were uniqueness-held reviews (`HIDDEN_404`), not broken Day-1 URLs.

V3 correctly reported **editorial orphans = 0** from the assembler graph, then noted the links auditor had **not** been re-run after Running uniqueness holds cleared.

The old `auditInternalLinks()` was also **wrong for production**:

- `getReviews()` without `{ isDev: false }`
- Flagged the **first 50 reviews not in the sitemap** as HIGH, regardless of launch disposition
- A live re-run of that logic still yields **50/50 `HIDDEN_404`** (false positives)

The auditor is rewritten to production eligibility. Held reviews are **not** sitemap orphans.

---

## 2. Fresh inventory (current code)

Production `{ isDev: false }`:

| Surface | INDEXABLE |
|---|---:|
| Reviews | 367 |
| Best | 45 |
| Buying guides | 42 |
| Comparisons | 65 |
| Sitemap paths | 1150 |

INDEXABLE reviews missing from sitemap: **0**.

---

## 3. Real HIGHs found (then fixed)

These were **not** the V2 uniqueness-hold citations. They were chrome and assemblers promoting held verticals.

### Primary nav / mega-menu → 404 or held deep

| Source | Problem |
|---|---|
| PRIMARY_NAV **Outdoors** → `/watersports` | Sport `coming-soon` → **HIDDEN_404** |
| PRIMARY_NAV **Team Sports** → `/indoor` | Same |
| Shoes mega | Training shoes `/fitness/training-shoes`, Padel shoes `/padel/shoes` (held-vertical deep) |
| Racket mega | `/padel/rackets`, `/best/padel-rackets`, `/tools/padel-racket-finder`, `/guides/how-to-choose-a-padel-racket` |
| Fitness mega | `/fitness/hyrox`, `/fitness/training-shoes`, Home Gym Builder, Power Rack Finder |
| More / mobile | Coming-soon sports as `/${slug}` 404s; **HYROX** as `/hyrox` (production **301** to `/fitness/hyrox`) |

### Homepage

- Finder CTA hardcoded to **Padel Racket Finder** (`HIDDEN_404`)
- Best strips included padel rackets, training shoes, adjustable dumbbells (held Best)
- Featured / latest guides preferred padel and home-gym guides (held)

### Brand hubs

Naive “first 4 published reviews for the brand” promoted **94** `HIDDEN_404` review cards (Puma Fuse, Inov-8 F-Lite, Nox, Bullpadel, …). Assembler now filters with `shouldPromotePublicly`. Spot-check after fix: Puma/Inov-8 keep INDEXABLE running reviews only; Nox/Bullpadel/Rogue promote **0** held review cards.

### Sport hubs reachable from chrome

- `/racket` finder CTAs to padel/tennis finders
- Fitness hub hero / primary actions pointed at held tools (`home-gym-builder`, HYROX finders, …)

---

## 4. Fixes (no footer/sitewide link stuffing)

### Auditor

`src/domain/site-quality/audits/links-trust-perf.ts` — `auditInternalLinks()` now:

- Uses `{ isDev: false }`
- Does **not** flag `HIDDEN_404` / `PUBLIC_NOINDEX` reviews as sitemap orphans
- **HIGH:** INDEXABLE entity missing from sitemap; primary/mega hrefs whose path is `HIDDEN_404`, `NO_ENTITY`, or held-vertical **deep** (`DEEP_*`); homepage curated hrefs to held URLs; brand-hub review cards to held reviews; INDEXABLE editorial orphans
- **Allows** `PUBLIC_NOINDEX` live sport hubs (`/fitness`, `/racket`, `/padel`, …)
- Query listings (`/guides?sport=padel`) classify on the listing path (`/guides`), which is INDEXABLE

### Chrome (Day-1)

- Removed **Outdoors** and **Team Sports** from `PRIMARY_NAV` (and their mega panels)
- Shoes mega: Running only
- Racket mega: live sport **hubs** + listing learn links; no held Best/finder/guide/category deep links
- Fitness mega: `/fitness` hub + listing `/best?sport=fitness`, `/guides?sport=fitness`, `/tools?sport=fitness`; **no** injected fitness category column
- More + mobile: `isPublicNavSport` — `contentStatus === "live"` and **not** `hyrox`
- Dropped `hyrox` from Popular sport group (redirect, not a hub)

### Assemblers

- Homepage: Running Shoe Finder; Running-only Best strips (shoes, watches, trail, headphones); featured/latest guides gated with `shouldPromotePublicly`
- Brand hubs: reviews, comparisons, Best, guides, featured product cards gated; family PDP hrefs skip `HIDDEN_404` products
- Guides hub: buying guides, Best, tools, reviews gated
- Fitness assemble hub: products/tools/Best/guides/comparisons/setups `isLaunchListable`; hero CTAs are listing URLs; finder block omitted when no public tool
- Declarative sport hubs (`getSportHubData`): Best/finder/guides/comparisons/quick actions/starter kits gated (Padel hub no longer CTAs held finders)
- Tools hub (`/tools`) and Gear hub (`/gear`): only INDEXABLE tools and listable product shop cards

**Did not** flip padel/fitness to INDEXABLE to “fix” links. **Did not** add footer or sitewide links to change graph metrics.

---

## 5. Running journeys

Validated in the production graph (INDEXABLE / sitemap):

Running hub → categories (`/running/shoes`, …) → products → reviews → Best → comparisons → alternatives (via comparison/product graph) → guides → tools (`/tools/running-shoe-finder` and sport tool listings).

Chrome Running / Shoes mega still points at those INDEXABLE URLs (`/best/running-shoes`, `/tools/running-shoe-finder`, `/guides/how-to-choose-running-shoes`, use-case Best lists).

---

## 6. Held content (intentional)

A page can exist in the catalog and still be vertical-held.

| Exception | Disposition | Why it is not a HIGH |
|---|---|---|
| `/fitness`, `/racket`, `/padel`, `/tennis`, pickleball, badminton, squash | `PUBLIC_NOINDEX` live hubs | Deliberate Day-1 hub shells; chrome may link the **hub**, not deep catalog |
| Fitness / padel **deep** tools, Best, products, reviews | `HIDDEN_404` | Removed from primary nav, homepage, and public assemblers |
| Coming-soon sports (`/watersports`, `/indoor`, `/cycling`, …) | `HIDDEN_404` | Omitted from chrome |
| `/hyrox` | alias **301** → `/fitness/hyrox` | Not used as a nav href |

Deep fitness/padel category listings may still **200** as sport-segment pages. They are **not** in primary navigation.

---

## 7. Orphans

Day-1: **0 indexable editorial orphans** (reviews / Best / guides / comparisons) on the inbound graph used by Fix 59 / this auditor (product↔review, Best recs, comparison peers, guide entities).

No footer or sitewide links were added to clear orphans.

---

## 8. Tests

- `npx tsc --noEmit` — exit 0
- `npx vitest run` — **56 files / 585 tests passed**
- Padel hub test now asserts Day-1: no held Best/finder/editorial CTAs
- Homepage expects Running / GPS watches / Trail / Running gear strips and `/tools/running-shoe-finder`
- Fitness hub hero CTA is `/gear?sport=fitness`
