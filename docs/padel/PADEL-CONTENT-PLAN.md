# Padel content plan

**Depends on:** [PADEL-ARCHITECTURE.md](./PADEL-ARCHITECTURE.md), [PADEL-CATALOG-PLAN.md](./PADEL-CATALOG-PLAN.md)

**This phase does not mass-generate editorial.** Catalog, evidence, and media come first. Existing padel reviews/guides are **not** the Vomero 18 bar.

Template: `.cursor/rules/review-page-standard.mdc` and `.cursor/skills/review-writer/SKILL.md`.  
Quality: `docs/quality/RENDERED-QUALITY-GATE.md`.

---

## 1. Estate map (canonical URLs only)

| Job | Pattern | Padel now | First-class target (when catalog is honest) |
| --- | --- | --- | --- |
| Hub | `/padel` | Exists | Same; shop groups like Running when categories are real |
| Category | `/padel/{segment}` | Thin | Decision sections, not product dumps |
| PDP | `/products/[slug]` | Seed | Specs + provenance, offers, alts |
| Reviews | `/reviews/[slug]` | 64 generated | Handwritten/expert-research at template bar; coverage on flagships only at first |
| Best | `/best/[slug]` | 1 | Category + intent guides (beginner, control, power, value, shoes) |
| Buying guides | `/guides/[slug]` | 3 (1 real) | Deep racket + shoes + grips; later balls/bags |
| Compare | `/compare/[slug]` | 7 | Current-gen pairs; previous gen labeled |
| Alternatives | `/products/[slug]/alternatives` | Thin | Padel relationship types |
| Finder | `/tools/padel-racket-finder` | Live def | Aligned questions; shoe finder later |
| Setups | `/setups/[slug]` | 1 | Starter / intermediate / competitive kits |
| Brands | `/brands/[slug]` | Split entities | Sport-filtered |
| Research | `/padel/rackets/database` | None | Only after provenance-backed specs |
| Technical education | guides + explainers | Thin overlays | Authored explainers, unique copy, internal links |

No `/padel/blog`, no duplicate `/padel/reviews`.

---

## 2. What to retire or quarantine

| Asset | Action |
| --- | --- |
| `reviews-backfill.ts` padel/tennis-court rows | Do not treat as handwritten. Quarantine from INDEXABLE until rewritten to review-page-standard |
| P53/P54 uniqueness overlays | Never a padel factory |
| Editorial rebuild JSON | Containment only; rewrite flagships properly |
| Best Guide Siux “round” vs teardrop spec | Fix or unpublish award until true |
| Comparisons featuring Vertex 04 as a current peer | Relabel previous-gen or replace with Vertex 05 vs current rivals |
| Hub “Deals” → `/padel/rackets` | Remove or point at real offers after URLs exist |
| Explainer `buildExplainerFromPlan` as the only shoe/grips guide body | Replace with authored depth before indexation |

Sanitizer `rewrite-uniqueness-era-skip.ts` may remain as a safety net. It is not a content strategy.

---

## 3. Reviews

Write **few**, well. Running did not win by publishing 600 uniqueness reviews.

**Wave A (after authentic heroes + specs):** 8–12 racket flagships with distinct jobs (e.g. Vertex 05, AT10 12K, AT10 18K, Metalbone current, Technical Viper, Coello, a beginner Kuikma/Indiga/X-One, a control ML10/Gravity).  
**Wave B:** 6–10 padel shoes (Resolution padel, Barricade padel or current Adidas padel, Joma Slam, a Nox/Bullpadel shoe) — court-shoe sections, not running foam essays.

Each review:

- Expert buying-guide voice; name peers, cores, shapes, weights
- Buy if / Skip if ≥2–3 sentences
- Unique section images from **that** product hero or omit
- Brand/product `LinkifiedText`
- Amazon/specialist CTAs only when Offer URLs are real
- `reviewType: expert-research` unless personal-test Evidence exists — never fake on-court testing
- Score breakdown keys from a **new** `getReviewPageCategoryConfig` for `cat-padel-rackets` / `cat-padel-shoes`

Do not attach a review to every SKU to “complete coverage.”

---

## 4. Best Guides

Intent differentiation (Running’s lesson: no clone “best vests”).

| Slug (proposed) | Job | Must not |
| --- | --- | --- |
| `padel-rackets` | Category shortlist, current gen | Mix discontinued as awards |
| `padel-rackets-beginners` | Forgiveness, weight, round/teardrop | Recommend diamond flagships |
| `padel-rackets-control` | Control / defensive | Duplicate category guide |
| `padel-rackets-power` | Attack / smash | |
| `padel-rackets-value` | Street price + previous gen **labeled** | Hide lifecycle |
| `padel-shoes` | Court shoes for padel | Rank tennis crossovers without evidence |

Each guide: methodology, use-case picks, evidence, Finder CTA, compare links. Awards must resolve to published current Products with authentic media.

---

## 5. Buying guides / technical education

Upgrade in place:

1. **How to Choose a Padel Racket** — already the strongest; keep, fix any generated uniqueness, align examples to current SKUs, no K-count ladder.
2. **How to Choose Padel Shoes** — rewrite to court outsole, lateral stability, padel vs tennis, clay vs turf; not a one-paragraph stub.
3. **Grips & Overgrips Explained** — diameter, tack, replacement vs overgrip, Hesacore-type comfort (no medical claims).

Later (when SKUs exist): balls (speed/pressure), bags (thermo, compartments).

Explainers (`racket-unique-copy.ts`) may **supplement** unique paragraphs; they must not be the only body.

---

## 6. Comparisons

Replace seed pairs with **current, shopper-real** matches:

- Vertex 05 vs Hack 04 (already closer)
- AT10 12K vs Metalbone current
- AT10 18K vs Vertex 05 (control-leaning hybrid vs diamond)
- Beginner: Kuikma vs Head Coello / Nox X-line
- Shoes: Resolution padel vs Barricade padel / Joma Slam

Each comparison: criteria with notes, use-case winners, no universal winner theatre, previous-gen clearly labeled.

---

## 7. Alternatives, Finder, tools, setups

- Rebuild alternatives with padel types (more forgiving, lighter, cheaper, previous generation).
- Finder copy and hub fields aligned; competitive vs elite mapping documented.
- No second Finder URL; optional `padel-shoe-finder` as a **new tool slug** when ready.
- Setups: starter kit (verify SKUs), later “club intermediate” and “competitive pair” only with real product IDs.

No pace-calculator analog is required. A racket “compare shape” widget is the Finder, not a new tool family.

---

## 8. Research / statistics

Plan a **Padel Racket Database** only after:

- Manufacturer-backed shape/weight/balance/core on the cohort
- No SVG-cycled heroes in the dataset
- Citation + CSV + methodology like Running Shoe Database
- Dual tennis tags excluded unless evidenced

Do not ship a statistics page from seed enums.

---

## 9. Brands and hub editorial

Brand hubs: origin, positioning, current families, not running-watch fillers (already a remediating BLOCKER on adidas-padel / bullpadel / nox).

Internal linking: brand names → `/brands/{slug}`, products → `/products/{slug}`.

---

## 10. Publication of content

Editorial `READY` ≠ INDEXABLE. Padel content stays draft/review or vertical-hidden until:

- Catalog SKU is published with authentic media and specs
- Rendered-quality BLOCKER = 0
- No uniqueness-era skip family
- Offers honest (or no price/CTA)

Authors: reuse Kitletics editorial author; do not invent padel testers.

---

## 11. Explicit: do not generate yet

No batch `reviews:agent` over the padel catalog. No uniqueness rewrite. No prelaunch uniqueness holds as a substitute for rewriting.

When writing starts, do it SKU-by-SKU against the review skill and generate missing **section** images from the authentic hero only.
