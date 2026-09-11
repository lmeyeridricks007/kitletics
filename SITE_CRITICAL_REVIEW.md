# Kitletics — Actionable Fix List

**Source:** Site critical review (2026-09-01)  
**How to use:** Work top-down. Check items when done. Each item has a concrete outcome.

---

## P0 — Fix now (blocks trust / commerce / data integrity)

### Commerce

- [x] **Refresh all active offer `lastChecked` timestamps** (or re-import live feeds) so NL prices leave `aging` and become displayable again  
  - **Outcome:** Product cards, search, best guides, PDPs show “From €…” instead of “Check prices”  
  - **Verify:** displayable NL **313 / 313** (was **0 / 221**) — `SEED_DATES.verified` bumped to `2026-09-01`  
  - **Also:** CI/gate in `npm run commerce:qa` + `tests/commerce-freshness.test.ts` (fail if displayable NL rate &lt; 95%)

- [x] **Backfill NL offers for running shoes missing them** (was 42 / 61)  
  - Priority SKUs: Superblast 2, Vomero 18, Glycerin 22, Bondi 8, On/Altra lines, etc. via `src/content/offers-nl-backfill.ts`  
  - **Outcome:** **61/61** running shoes have NL offers; hero shoes return displayable From-prices

- [x] **Backfill NL offers for GPS watches missing them** (was ~8 / 15)  
  - Include: Forerunner 265, Polar, Suunto, Apple Watch Ultra 2  
  - **Outcome:** **15/15** GPS watches have NL offers

### Data integrity

- [x] **Deduplicate `prod-eleiko-sport-bumper`**  
  - Kept canonical definition in `src/content/fitness/wave24.ts`; removed duplicate + offers from `seed.ts`  
  - Offers / recommendations / best-guide refs remain on wave24  
  - **Verify:** product ID appears once in `getProducts()`

- [x] **Deduplicate `prod-mirafit-bumper-set`**  
  - Same as above  
  - **Verify:** product ID appears once in `getProducts()`

- [x] **Add automated duplicate-ID check** to `content:validate` or catalog QA  
  - `scripts/validate-content.ts` (counts all occurrences)  
  - Hard gate at start of `npm run catalog:qa`  
  - `tests/content-unique-ids.test.ts` via `npm run content:validate`  
  - **Outcome:** CI fails if any product/brand ID (or slug) is defined twice

---

## P1 — Next sprint (media, branding, navigation, thin surfaces)

### Product media

- [x] **Add authentic heroes for 3 running shoes still on SVG fallback**  
  - `hoka-clifton-pro` · `saucony-endorphin-pro-3` · `inov8-trailfly-ultra-g-300-max`  
  - Registered in `RUNNING_PRODUCT_MEDIA` — **61/61** shoes authentic (`npm run media:qa`)

- [x] **Source authentic media for GPS watches** (15 products)  
  - **Outcome:** **15/15** featureable (Garmin CDN, COROS, Polar, Suunto, Apple/Best Buy)

- [x] **Source authentic media for padel rackets** (27 products)  
  - **Outcome:** **27/27** featureable via `CATALOG_PRODUCT_MEDIA`

- [x] **Source authentic media for tennis rackets** (20 products)  
  - **Outcome:** **20/20** featureable (Tennis Warehouse + retailer CDNs)

- [x] **Source authentic media for training shoes** (12 products)  
  - **Outcome:** **12/12** featureable

- [x] **Source authentic media for top fitness SKUs**  
  - Power racks, adjustable dumbbells, benches, plates — **all featureable** (Rogue / Mirafit / REP / Eleiko / PowerBlock / etc.)

- [x] **Source authentic media for HRMs + packs/vests** (HRM 7, packs/vests 6)  
  - **Outcome:** **7/7** HRM + **6/6** packs featureable

Registry: `src/content/catalog-product-media.ts` (wired through `getRunningProductHeroMedia` / `categoryFallbackImage`). Apply script: `scripts/apply-p1-catalog-media.mjs`.

### Brand logos

- [x] **Add logos for high-SKU brands**  
  - Rogue, Mirafit, REP, Yonex, Eleiko, Concept2 — SVGs in `public/images/brands/*-logo.svg`, wired on brand entities

- [x] **Add logos for running-adjacent brands**  
  - Salomon, On, Altra, Puma, Mizuno, Inov-8, Topo — wired

- [x] **Add logos for electronics brands**  
  - Polar, Suunto, Apple, Wahoo — wired

- [x] **Decide brand-entity strategy for split names**  
  - **Rule:** keep separate entities; label vertical names; share logos; primary hubs use `relatedBrandIds`  
  - Documented in [`docs/brand-entity-strategy.md`](docs/brand-entity-strategy.md)  
  - Display: `ASICS Court`, `Adidas Padel`, `Tecnifibre Padel`

### Reviews & authors

- [x] **Either publish more reviews OR reduce Reviews prominence**  
  - **Option A:** Added **14** Expert Research reviews (12 hero shoes + FR 970 + Pace 3) in `src/content/reviews-wave1.ts`  
  - **Outcome:** **17** published reviews (was 3) — hub no longer sparse

- [x] **Add author slug redirect/alias**  
  - `/authors/kitletics-editors` → `/authors/kitletics-editorial` (permanent redirect in `next.config.ts`)  
  - Alias also resolved in `getAuthorBySlug`  
  - **Outcome:** No easy 404 on guessed slug

### Navigation / IA

- [x] **Pick canonical HYROX URL and stick to it**  
  - Canonical: `/fitness/hyrox` (301 from `/hyrox`)  
  - Mobile drawer + nav use `/fitness/hyrox` only  
  - **Outcome:** No confusing dual entry points

- [x] **Exclude coming-soon sport products from default search** (or hard-label them)  
  - Coming-soon sports + their disciplines excluded from search hits  
  - Products only tagged to coming-soon sports excluded  
  - Empty categories excluded from search  
  - **Outcome:** Search doesn’t imply cycling / swimming / recovery are fully live

- [x] **Hide or soft-gate empty categories**  
  - Removed `padel-accessories`, `padel-clothing`, `nutrition-fuel` from nav / hub shop  
  - Empty category URLs soft-gated (coming-soon shell); excluded from sitemap / SSG  
  - **Outcome:** No empty grids from taxonomy links

- [x] **Clarify `/finders` vs `/tools`**  
  - Primary hub: `/tools`  
  - `/finders` → `/tools?type=finder` (redirect); removed dual Finders+Tools nav  
  - **Outcome:** Users aren’t choosing between two overlapping hubs

- [x] **Decide category URL policy**  
  - **Canonical:** sport-scoped `/{sport}/{pathSegment}` (e.g. `/running/shoes`)  
  - `/gear/[slug]` 308s to sport-scoped when a live sport owns the category  
  - Shared helper: `src/lib/navigation/category-href.ts`  
  - **Outcome:** No duplicate SEO shells without reason

### Tools

- [x] **Ship or unpublish gated finders**  
  - **Shipped:** `fitness-watch-finder` (`available: true` + FinderDefinition + watch feature scoring)  
  - **Unpublished:** `pickleball-paddle-finder`, `badminton-racket-finder`, `squash-racket-finder` (`status: archived` — thin catalogs)  
  - Sitemap only lists `available` tools  
  - **Outcome:** No gated finders dangling in tools index / sitemap

---

## P2 — Polish (editorial depth, specs, architecture debt)

### Editorial metadata

- [x] **Fill `shortDescription` on buying guides** (was 27 / 43 missing)  
  - Overlay: `src/content/buying-guide-metadata-fill.ts` merged in `editorial.ts`  
  - **Outcome:** 43 / 43 guides have `shortDescription`

- [x] **Fill `quickAnswer` on buying guides** (was 26 / 43 missing)  
  - Same fill map  
  - **Outcome:** 43 / 43 guides have `quickAnswer`

- [x] **Add related products to `hyrox-equipment-standards` guide**  
  - Shoes, rower, skierg, echo bike, sled, wall ball, watch, HRM  
  - **Outcome:** Guide no longer has an empty related-product rail

- [x] **Add `recommendationsByUseCase` to 8 thin comparisons**  
  - Running: `cmp-fr970-pacepro`, `cmp-fr970-fr965`, `cmp-hrm-pro-h10`, `cmp-advskin-vaporair`  
  - Padel: `cmp-nox-bullpadel`, `cmp-babolat-wilson`, `cmp-head-siux`, `cmp-nox-babolat`  
  - **Outcome:** No empty use-case recommendation blocks on those comparisons

### Specs

- [x] **Capture running-shoe `weight` for catalog** (today ~7% coverage)  
  - Backfill via `src/content/specs/product-spec-fill.ts` (men’s US 9 typical) — **61/61**

- [x] **Capture `heelStack` / `forefootStack` for running shoes** (today ~8%)  
  - Same fill overlay — **61/61** published shoes

- [x] **Fill power-rack / bench / cardio specs** currently at ~0–30% fill  
  - Racks, benches, rowers, air bikes, treadmills, ski-ergs filled for defined keys

- [x] **Define policy for accessory categories with 0 spec defs**  
  - `src/content/specs/category-spec-policy.ts`: `minimal` defs for court shoes / strings / fitness accessories; `none` for empty padel accessories & clothing  
  - Minimal defs in `minimalAccessorySpecs` (`definitions.ts`)

### Architecture cleanup

- [x] **Unify sport hub implementations**
  - Declarative stack (`lib/sport-hub`) for running/padel; assemble (`lib/hubs`) for fitness only
  - Removed dead `lib/hubs/running.ts`; routing via `lib/sport-hubs.ts`

- [x] **Unify tool routing**
  - Migrated running-shoe-finder, pace calculator, race-time predictor, shoe-rotation-planner onto `/tools/[slug]` (+ results)

- [x] **Search relevance: tighten broad queries**
  - Dominant-category boost + demotion for off-category products; higher overview score thresholds

- [x] **Align search price facet with displayable prices**
  - Slider uses fresh/recent prices only; shows “Prices updating” when offers exist but none are displayable

---

## P3 — Optional / later vertical depth

- [ ] Expand pickleball / badminton / squash editorial (best guides, comparisons) once finders ship  
- [ ] Licensed media wave for remaining fitness + racket accessories  
- [ ] Second author / bylines if review volume grows  
- [ ] Live affiliate feed depth beyond seed offers (per readiness docs)

---

## Suggested work order (2-week view)

| Day | Focus | Items |
|-----|--------|--------|
| 1 | Commerce | Refresh `lastChecked`; verify prices render site-wide |
| 1 | Data | Deduplicate Eleiko + Mirafit bumper products; add ID QA gate |
| 2 | Offers | Backfill NL offers for top running shoes + watches |
| 3–4 | Media | 3 missing shoe heroes + watch hero batch |
| 5 | Brands | Logos for Rogue, Mirafit, REP, On, Salomon, Polar |
| 6 | IA | HYROX canonical; empty cats; search gate for coming-soon sports |
| 7–8 | Media | Padel + tennis racket heroes (top SKUs) |
| 9 | Editorial | Reviews plan (publish more or demote nav); buying-guide metadata |
| 10 | Tools / QA | Finder ship-or-hide; CI for prices + duplicate IDs |

---

## Done definition (global)

A fix is done when:

1. Code/content merged  
2. Relevant QA script passes (`commerce:qa`, `media:qa`, `content:validate`, vertical `*:qa`)  
3. Spot-check on `/search?q=running+shoes`, a shoe PDP, a watch PDP, `/gear`, and one brand hub  
4. This checklist item is checked off  

---

## Related docs

- Full audit narrative: prior content in this file’s history / conversation  
- `FITNESS_HYROX_LAUNCH_READINESS.md`  
- `PADEL_LAUNCH_READINESS.md` / `TENNIS_LAUNCH_READINESS.md` / `RACKET_SPORTS_READINESS.md`  
- `reports/running-launch-readiness.md`
