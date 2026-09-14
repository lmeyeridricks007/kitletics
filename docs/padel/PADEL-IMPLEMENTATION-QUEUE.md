# Padel implementation queue

**Depends on:** [PADEL-BASELINE-AUDIT.md](./PADEL-BASELINE-AUDIT.md), [PADEL-ARCHITECTURE.md](./PADEL-ARCHITECTURE.md), [PADEL-CATALOG-PLAN.md](./PADEL-CATALOG-PLAN.md), [PADEL-CONTENT-PLAN.md](./PADEL-CONTENT-PLAN.md)

Work top-down. **Do not enable the vertical or mass-generate editorial until the named gates pass.**

Keep `verticalLaunchStrategy` padel = `disabled` through P0–P4.

---

## P0 — Model and gates (no public leak)

1. **Brand entity decision** — single Adidas/ASICS/Head vs `*-padel` vertical entities; document in code comments + brand hub filter.
2. **Spec definitions** — extend `padelRacketSpecs` and shoe/ball/bag/grip keys per architecture; deprecate `powerPositioning` / `controlPositioning` as specs (migrate to recs or drop).
3. **Normalize balance enums** (`head-heavy` → `high`) with a one-off content patch, not silent invention.
4. **`PUBLISH_REQUIREMENTS`** for `cat-padel-rackets` and `cat-padel-shoes`.
5. **Research configs** — complete `padelRacketsResearchConfig`; add shoes/balls/bags/grips.
6. **Use cases** — add intermediate / advanced / competitive / defensive (and side only if evidenced).
7. **Relationship types** — padel-safe alternatives; stop applying trail/cushion types.
8. **Review page category configs** for rackets and shoes (glance keys, sections, score criteria).
9. **Hub Finder fields** aligned with `padelRacketFinderDefinition`.
10. **Invalidate homepage Offers** (all 282) so no CTA can treat them as listings.
11. **Dual-sport tennis shoes** — remove `sport-padel` unless padel evidence exists.
12. **Identity hold** — Siux Diablo racket vs `prod-siux-diablo-pro` shoe draft.

**Exit:** types and gates exist; production still 404s deep padel; no new uniqueness content.

---

## P1 — Catalog research (rackets)

1. Manufacturer collection crawl for P0 brands (Bullpadel, Nox, Adidas, Head, Babolat, Wilson, Siux, StarVie).
2. NL/EU availability check (Decathlon, specialists, Amazon **product** URLs).
3. Stage via `npm run product:onboard` / `catalog:discover` — no wave29 SVG generator.
4. Families + lifecycle for existing 27 SKUs (verify 2026 names: Metalbone 3.3 vs 3.4/3.5, AT10 shape, Siux Diablo shape).
5. Beginner/value lines (Kuikma, Indiga, RX, X-One / X-Hero) — required for a honest Finder.
6. Authentic unique heroes; stay `draft` until `CATALOG_PRODUCT_MEDIA` + file on disk.
7. Real Offers for published SKUs (NL first).

**Exit:** ≥ launch-core path for rackets underway; existing 27 either verified or marked previous/unknown; no reused SVG as indexable hero.

---

## P2 — Catalog (shoes + soft goods)

1. Padel-evidenced shoes to the catalog floor; draft unverified wave28 identities.
2. Balls / bags / grips to supporting floors or keep thin **and** gated from Best/Finder.
3. Accessories/clothing: onboard typed SKUs or keep `SOFT_GATED_CATEGORY_SLUGS`.
4. ProductVariant policy implemented for shoes (audience) **or** documented separate-SKU rule.
5. Evidence rows with `sourceUrl` on every published spec-bearing product.

**Exit:** shoes are not “tennis with a padel tag”; bag is not a lonely SVG draft pretending to be a category.

---

## P3 — Finder, recs, relationships

1. Finder questions for expanded styles; optional position; comfort (non-medical).
2. Recommendations rebuilt from evidence + use cases — strip seed `recommendationScore` theatre.
3. Alternatives graph for flagships.
4. `canPublishFinder` remains a **minimum count** gate; add a quality check (no homepage offers in value scoring; min high-confidence specs).
5. Hub shop chips: drop fake Deals; show accessories/clothing only when ungated.

**Exit:** Finder explainable on current catalog; coverage message when catalog is incomplete.

---

## P4 — Editorial (handwritten, small N)

1. Fix or unpublish Best Padel Rackets awards that contradict specs / previous-gen.
2. Rewrite How to Choose Padel Shoes + grips guides to Running depth.
3. 8–12 racket reviews at Vomero 18 bar + unique section images from authentic heroes.
4. 1–2 current-gen comparison replacements.
5. Starter kit SKUs verified.

**Forbidden:** `reviews-backfill` expansion, uniqueness overlays, batch agent over all padel SKUs.

**Exit:** those URLs pass rendered-quality + review voice locally (preview), still HIDDEN_404 in production.

---

## P5 — Enablement

1. Selective vertical? Prefer **enabled** only when P0–P4 floors hold; or `selective` with explicit `indexableKinds` (sport hub + tools + published PDPs).
2. Reconcile `contentStatus: live` vs 404: no chrome links to empty 404s.
3. Brand hubs must not list held/draft products.
4. Sitemap / search / related include only INDEXABLE.
5. `npm run ci:gates` (rendered quality + media:ci + reviews:ci) on padel URLs.
6. `npm run padel:catalog-qa` + new evidence/media assertions (fail on reused SVG heroes and homepage Offers).
7. Flip `verticalLaunchStrategy` padel (and racket umbrella as needed) in one controlled change.

**Exit:** production padel is a real vertical, not a sampler.

---

## P6 — Research database and extra tools (optional)

1. `/padel/rackets/database` when specs are citable.
2. `padel-shoe-finder` if shoe catalog and specs discriminate.
3. More Best Guides (beginner / control / power / value / shoes) without cannibalizing the category guide.

---

## Worked order (owners)

| Order | Workstream | Primary code |
| --- | --- | --- |
| 1 | Taxonomy / specs / publish reqs | `src/content/specs`, `src/domain/catalog/publishability.ts` |
| 2 | Onboarding research configs | `src/domain/onboarding/research-config.ts` |
| 3 | Commerce hygiene | `src/content/padel/*` offers, retailers |
| 4 | Catalog onboard | `scripts/product-onboard.ts`, content waves **without** SVG cycle |
| 5 | Media | `catalog-product-media.ts`, `public/images/padel/products/<slug>/` |
| 6 | Finder / recs | `racket-finders.ts`, `recommendations` |
| 7 | Editorial | reviews skill, Best Guide files |
| 8 | Vertical flag | `vertical-strategy.ts` |

---

## Anti-patterns (hard)

- Another `wave29.ts` that cycles `racket-1.svg`…`racket-5.svg`
- Generic Amazon homepages as Offers
- Uniqueness-era skip templates
- Fabricated power/control scores from 18K carbon
- Enabling padel to “match Running URL count”
- Medical claims for arm/elbow
- SEO categories for protectors/pressurizers
- Treating `PADEL_LAUNCH_READINESS.md` GO as current

---

## Immediate next concrete task (after these docs)

Implement P0 items 2–6 and 10–11 in code (specs, publish requirements, offer invalidation, dual-sport cleanup) **without** generating reviews. Then start P1 manufacturer research for Bullpadel / Nox / Adidas current collections only.
