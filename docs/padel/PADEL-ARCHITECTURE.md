# Padel architecture

**Depends on:** [PADEL-BASELINE-AUDIT.md](./PADEL-BASELINE-AUDIT.md)  
**Principle:** Padel is a **plugin** on the existing Kitletics operating system. No duplicate route families, no uniqueness-era generators, no parallel publication enum.

Running is the quality benchmark for **how a vertical is built**. Padel must not copy running-shoe fields.

---

## 1. Vertical position

```
Racket Sports (sport-racket, umbrella hub /racket)
 ├── Padel        (sport-padel)     ← this program
 ├── Tennis
 ├── Pickleball
 ├── Badminton
 └── Squash
```

- Canonical sport hub: `/padel`
- Family hub: `/racket` (chooser only)
- `/racket/padel` already 301s to `/padel` — keep that
- Do not make `/gear/padel-rackets` indexable; `getCategoryHref` already sport-scopes live categories

**Enablement:** padel is **`selective`** as of 2026-09-13 (`verticalLaunchStrategy`). Hub + deep kinds may publish when quality eligibility passes. Tennis / pickleball / badminton / squash stay disabled. Soft goods stay soft-gated. See [PADEL-UX-AUDIT.md](./PADEL-UX-AUDIT.md).

---

## 2. Information architecture

### 2.1 Sport → category (URL)

Canonical category URLs (already exist):

| Category | Path | `categoryId` |
| --- | --- | --- |
| Padel Rackets | `/padel/rackets` | `cat-padel-rackets` |
| Padel Shoes | `/padel/shoes` | `cat-padel-shoes` |
| Padel Balls | `/padel/balls` | `cat-padel-balls` |
| Padel Bags | `/padel/bags` | `cat-padel-bags` |
| Grips & Overgrips | `/padel/grips` | `cat-padel-grips` |
| Padel Accessories | `/padel/accessories` | `cat-padel-accessories` |
| Padel Clothing | `/padel/clothing` | `cat-padel-clothing` |

Accessories remain **one** category. Protectors, wristbands, sweatbands, ball pressurizers, training aids are `ProductSubcategory` or a `type` spec — **not** new `/padel/protectors` shells.

Clothing and accessories stay **soft-gated** until a commercially meaningful published catalog exists.

### 2.2 Discipline / use case (not extra URL trees)

Running’s `/running/road` disciplines are real training modes with product tagging.

Padel does **not** get SEO disciplines for left-side / right-side / aggressive. Those are **player attributes**.

Padel-owned disciplines (optional, only if products actually tag them and pages have unique jobs):

| Discipline | Slug | When it exists |
| --- | --- | --- |
| Club / recreational | `club` | Only if we have a real club-play content job distinct from the hub |
| Competitive match | `competitive` | Only if we have a distinct competitive kit job |

Default: **no new discipline URLs**. Player needs live on UseCase + Finder + Recommendation contexts.

UseCase expansion (IDs stay kebab-case, sport-scoped):

| Use case | Maps from player model |
| --- | --- |
| existing `uc-padel-beginner` | Beginner |
| `uc-padel-intermediate` (add) | Intermediate |
| `uc-padel-advanced` (add) | Advanced |
| `uc-padel-competitive` (add) | Competitive |
| existing `uc-padel-control` | CONTROL |
| existing `uc-padel-balanced` | BALANCED / ALL_ROUND |
| existing `uc-padel-power` | POWER / AGGRESSIVE |
| `uc-padel-defensive` (add) | DEFENSIVE |
| `uc-padel-left-side` (add, optional) | LEFT_SIDE — only with evidence that product lines differ |
| `uc-padel-right-side` (add, optional) | RIGHT_SIDE |

If side-specific SKUs are not a real market fact, **do not** create those use cases. UNKNOWN / omit is valid.

Physical considerations (arm/elbow, shoulder, lighter vs heavier racket) are Finder **preferences** and spec filters (`comfort`, weight band). Copy must say preference / comfort — **never** injury treatment or medical claims.

### 2.3 Product → variant → offer

```
Sport
  → Discipline? (optional)
  → UseCase (player job)
  → ProductCategory
  → ProductFamily (Vertex, AT10, Metalbone, …)
      → Product (Vertex 05 2026)
          → ProductVariant (men/women size run; colorway when commercially distinct)
              → Offer (NL / DE / UK / … retailer URL)
```

**Rackets:** usually unisex Product; variants only if manufacturer publishes distinct weights/colorways with offers. Do not invent sizes.

**Shoes / clothing:** prefer Running’s variant model (one Product, audience variants) **or** keep separate men/women Products when they are distinct marketed SKUs. Do not mix both for the same model. Decide per brand from manufacturer evidence.

**Offers:** `Offer.url` is the canonical product page. Homepage URLs are invalid. `variantId` when the listing is size/gender specific.

---

## 3. Canonical page estate (existing routers only)

| Job | URL | Notes |
| --- | --- | --- |
| Sport hub | `/padel` | `padelSportHubConfig` |
| Category | `/padel/rackets` etc. | `[sport]/[segment]` |
| PDP | `/products/[slug]` | |
| Review | `/reviews/[slug]` | Vomero 18 bar when written |
| Best | `/best/padel-rackets`, later `/best/padel-shoes`, … | Intent-differentiated slugs like Running |
| Buying guides | `/guides/how-to-choose-a-padel-racket` | |
| Compare | `/compare/[slug]`, builder `/compare?category=padel-rackets` | |
| Alternatives | `/products/[slug]/alternatives` | |
| Finder | `/tools/padel-racket-finder` | Later `/tools/padel-shoe-finder` if catalog supports it |
| Brands | `/brands/[slug]` | Resolve adidas/asics entity strategy first |
| Setups | `/setups/padel-starter-kit` | Expand only with real kits |
| Research (later) | `/padel/rackets/database` | Mirror `/running/shoes/database` **only** when specs have provenance |
| Technical education | buying guides + explainers, not a third blog tree | |

Listing filters: `/reviews?sport=padel`, `/best?sport=padel`, `/guides?sport=padel`, `/brands?sport=padel`.

---

## 4. Domain model extensions (additive)

### 4.1 Racket `SpecificationDefinition`

Controlled enums. `unknown` is valid. Do not invent numbers.

| Key | Type | Values |
| --- | --- | --- |
| `shape` | enum | `round`, `teardrop`, `diamond`, `hybrid`, `other`, `unknown` |
| `balance` | enum | `low`, `medium`, `high`, `unknown` — **drop** `head-heavy` as a synonym of `high` via normalization, do not keep both as peers |
| `weightMin` / `weightMax` | measurement g | manufacturer range; no midpoint invention |
| `thicknessMm` | measurement | usually 38; UNKNOWN if unverified |
| `faceMaterial` | enum | `fiberglass`, `carbon`, `carbon-hybrid`, `hybrid`, `other`, `unknown` |
| `faceCarbonWeave` | string optional | manufacturer label (`3K`, `12K`, `18K`, `24K`) — **not a quality rank** |
| `frameMaterial` | string / enum | manufacturer; UNKNOWN ok |
| `core` | enum | `soft-EVA`, `medium-EVA`, `hard-EVA`, `multi-density`, `brand-foam`, `other`, `unknown` |
| `manufacturerCoreName` | string | MultiEva, etc. — marketing label, not normalized class |
| `surfaceTexture` | enum | `smooth`, `rough`, `3d-textured`, `other`, `unknown` |
| `sweetSpot` | enum | `large`, `medium`, `compact`, `unknown` |
| `feel` | enum | `soft`, `medium`, `firm`, `unknown` |

**Do not store** `powerPositioning` / `controlPositioning` as fake spec ranks. Power, control, maneuverability, forgiveness, comfort, stability, spin potential belong on **Recommendation factors** and/or review score breakdown — only when evidence supports them.

### 4.2 Shoe specs

Not running geometry. No required drop/stack.

| Key | Notes |
| --- | --- |
| `courtOutsole` | padel / herringbone / omni / other / unknown |
| `tractionPattern` | manufacturer pattern name if verified |
| `lateralStability` | qualitative enum + evidence |
| `cushioning` | keep; do not copy running `cushionLevel` blindly |
| `courtFeel` | optional |
| `durability` | qualitative; UNKNOWN ok |
| `weight` | verified only |
| `upper` | |
| `fit` / `width` | verified only |
| `surfaceCompatibility` | `padel-specific`, `tennis-padel-crossover`, `clay-oriented`, `all-court`, `unknown` — **never infer** |

### 4.3 Other categories

**Balls:** `speed`, `pressurization` (pressurized / pressureless / unknown), `durability`, `use` (`competition` / `training` / `unknown`), `packSize`.

**Bags:** `capacity`, `racketCompartments`, `shoeCompartment` boolean, `thermalProtection` boolean, `form` (`backpack` / `duffel` / `racket-bag` / `other`), `dimensions` if verified.

**Grips:** `gripType` (`overgrip` / `replacement` / `cushion`), `thickness`, `tack`, `absorption`, `packQuantity`.

**Accessories:** `type` required (`protector`, `wristband`, `sweatband`, `pressurizer`, `training`, `other`). No generic spec dump.

**Clothing:** follow running clothing honesty (fit, genderFit) only when SKUs are real models, not every colorway.

### 4.4 Evidence

Every important spec retains provenance via `Evidence` + `product.evidenceIds` (and onboarding `ResearchFinding` while staging):

- `source`, `sourceUrl`, `verifiedAt` (retrievedAt), `type` (`manufacturer` preferred for specs), `confidence`

Prefer manufacturer > official docs > specialist retailer > credible review. Never average conflicting sources. UNKNOWN is valid.

Extend `padelRacketsResearchConfig` to the full spec lists; add configs for shoes, balls, bags, grips.

Add `PUBLISH_REQUIREMENTS` for padel rackets (shape, balance, weight range, hero, evidence) and shoes (outsole or surfaceCompatibility, hero). Offers never required to publish a PDP; they **are** required to feature in Finder value / Best Guide price claims.

### 4.5 Scores

Kitletics Score and Finder Match Scores follow `/scoring-methodology`:

- Use-case specific
- Explainable factors
- Not crowd stars
- Not fabricated from K-count or weight

Strip or freeze seed `recommendationScore` until an evidence-backed scoring pass exists. Finder may score from **verified** specs + use-case recs, with coverage penalties when specs are unknown (`minCoverageForTopRecommendation` already exists).

---

## 5. Player model in Finder

Keep the shared Finder engine. Evolve `padelRacketFinderDefinition`:

1. Experience: Beginner / Intermediate / Advanced / Competitive (map Product `elite` → competitive for matching, or add `competitive` to `ExperienceLevel` only if used across sports — prefer mapping, don’t fork the enum without need).
2. Play style: CONTROL / BALANCED / POWER / DEFENSIVE / AGGRESSIVE / ALL_ROUND / still-figuring-out. Collapse to existing use cases where they coincide (POWER ≈ AGGRESSIVE unless evidence distinguishes).
3. Position: LEFT / RIGHT / BOTH — optional question, `required: false`; ignore in scoring until products carry evidence.
4. Needs: existing priorities + smash performance / defensive handling as priority options if catalog can discriminate.
5. Comfort: lighter vs heavier; softer vs firmer; optional “prefer arm-friendly / lower-vibration feel” — comfort language only.
6. Budget: keep EUR bands; **align hub preview fields** with Finder band IDs.

Align `padelSportHubConfig.finderFields` with the live Finder. The hub is a shortcut into `/tools/padel-racket-finder`, not a second scorer.

Shoe finder: only after shoe specs and authentic media exist. Same engine, new definition.

---

## 6. Publication and leak control

Layers (do not collapse):

1. **Onboarding / staging** — researching, blocked, ready, approved  
2. **PublishStatus** — draft → review → scheduled → published  
3. **Launch eligibility** — quality + vertical + technical  
4. **Rendered quality + media:ci** — cannot be READY with BLOCKER findings  

Production:

- `status !== published` → omitted from public repositories  
- `scheduled` never auto-flips  
- vertical `disabled` → `HIDDEN_404` for products, reviews, best, guides, comparisons, setups, tools, alternatives  
- Brands/authors/static may remain visible per current `verticalHidesDeepEntities` exceptions — **revisit** so padel brand hubs do not leak held products  
- Soft-gated empty categories stay out of nav  
- Genuine 404 via `notFound()` when eligibility is HIDDEN_404  

Sitemap / search / API / related content already consume eligibility. Padel must not add a bypass.

---

## 7. Media

- One authentic hero per Product when published for indexation.
- Placeholders allowed only if **labeled** and **not reused across SKUs**.
- Review section images: `public/images/padel/products/<slug>/sections/<topic>.png` **only when writing a real review** (rackets: overview, specs, construction/play, strengths, tradeoffs, usecase, value, …). Omit rather than duplicate hero or wrong brand.
- Tennis must stop reusing padel SVG heroes (separate tennis media program).

Resolver: existing `resolve-section-visuals.ts` sport folder for racket → `padel` (already noted in review-section-images rule).

---

## 8. Commerce

- NL first, then DE / BE / FR / UK. Do not prioritize empty US.
- Seed homepage Offers: **invalidate** (`urlValidationState: INVALID` or delete) before any public CTA.
- Add NL specialist retailers when affiliate/manual URLs are verified (do not invent programs).
- Pricing agent (`npm run pricing:audit`) after URLs exist.
- Affiliate disclosure near every CTA. Never invent street prices in prose.

---

## 9. Relationships and alternatives

Add padel-appropriate `ProductRelationshipType` values (or reuse generic: cheaper, premium, lighter, beginner-friendly, previous-generation, next-generation, direct-competitor). Do not use `trail-capable` / `more-cushioned` on rackets.

Best Guides must not mix discontinued / previous-generation into current awards without an explicit “value / previous gen” badge and rationale.

Families must list generations newest → oldest.

---

## 10. Research / statistics / education

When (and only when) racket specs are manufacturer-backed at Running Shoe Database honesty:

- `/padel/rackets/database` — derived view, ISR, citation, CSV
- Unit of analysis = Product model, not gender variants
- No uniqueness tokens, no invented averages from conflicting sources

Until then: no fake “Padel stats” pages.

Technical education = buying guides (shape, weight, balance, core, face, shoes, grips) at Running guide depth — authored, evidence-linked, `LinkifiedText` for brands/products.

---

## 11. Brand entity strategy

Decide before expansion:

**Recommended:** one Brand per manufacturer (`adidas`, `asics`, `head`, `wilson`, `babolat`, `tecnifibre`) with sport-scoped catalog filters — matching Running.

**If vertical entities stay** (`adidas-padel`): brand hub must not show running shoes; padel hub must not show Ultraboost. Related products filtered by sport. Logos shared. Document the exception.

Never create `brand-nike-padel` without a real Nike padel line.

---

## 12. Quality gates before any public padel URL is INDEXABLE

1. `isPubliclyVisible`  
2. Vertical enabled (or selective kinds explicitly listed)  
3. `PUBLISH_REQUIREMENTS` + evidence for featured SKUs  
4. Unique authentic hero (`media:ci`)  
5. Offer URLs not homepages if CTAs shown  
6. Rendered-quality BLOCKER = 0 on those URLs  
7. Review/Best Guide voice: no uniqueness-era skip family, no machine Buy If  
8. Image semantics: product photo matches product  

`npm run padel:catalog-qa` is necessary but **not sufficient**.
