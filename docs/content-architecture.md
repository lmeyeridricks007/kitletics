# Kitletics Content Architecture

Kitletics is a **structured sports equipment discovery platform**. The Product entity is the centre of the content graph. Editorial content references products by ID — it never duplicates specifications.

## Entity model

```
SPORT → DISCIPLINE → ACTIVITY / USE CASE
                  ↘
                    PRODUCT CATEGORY → SUBCATEGORY
                                    ↘
                                      PRODUCT → VARIANT
                                             → SPEC VALUES
                                             → OFFERS (regional)
                                             → EVIDENCE
                                             → RECOMMENDATIONS
```

Products power: Reviews, Best Guides, Comparisons, Alternatives, Finders, Setups, Search.

Domain modules live under `src/domain/`:

| Module | Entities |
|--------|----------|
| `sports/` | Sport, Discipline, Activity, ProductCategory, ProductSubcategory, UseCase |
| `products/` | Brand, ProductFamily, Product, ProductVariant, SpecificationDefinition |
| `recommendations/` | Recommendation, Evidence, AlternativeRelationship |
| `commerce/` | Retailer, Offer |
| `editorial/` | Review, BestGuide, Comparison, BuyingGuide, GearSetup, FAQ |
| `tools/` | Tool |
| `shared/` | PublishFields, SeoFields, MediaAsset, Region |

## Content graph

Repositories in `src/repositories/graph.ts`:

- `getProductGraph(id)` → review, comparisons, alternatives, best guides, buying guides, recommendations, evidence, offers
- `getCategoryGraph(id)` → products, best guides, tools, brands, use cases
- `getSportGraph(id)` → disciplines, categories, products, guides, tools, setups

## Route conventions

| Pattern | Example |
|---------|---------|
| Sport hub | `/running` |
| Discipline | `/running/road` |
| Category (sport-scoped) | `/running/shoes` |
| Product (sport-independent) | `/products/asics-novablast-5` |
| Alternatives | `/products/asics-novablast-5/alternatives` |
| Review | `/reviews/asics-novablast-5` |
| Best guide | `/best/running-shoes` |
| Comparison | `/compare/asics-novablast-5-vs-asics-gel-nimbus-27` |
| Buying guide | `/guides/running-shoe-drop` |
| Setup | `/setups/first-marathon-kit` |
| Tool | `/tools/running-shoe-finder` |
| Brand | `/brands/asics` |

Products stay at `/products/[slug]` because one product can belong to multiple sports (e.g. Running + HYROX).

## Specification system

`SpecificationDefinition` is category-scoped. Types: `string | number | boolean | enum | multi-enum | measurement | range`.

Product values are a `Record<string, SpecValue>` keyed by definition `key`. Running shoes have a full schema; GPS watches, HRMs, vests, headphones and clothing have starter schemas.

Adding **Padel Rackets** requires:

1. Sport/discipline (already in taxonomy) or category data
2. Spec definitions for that category
3. Products referencing those keys

No changes to the Product TypeScript shape.

## Publishing behavior

Central resolver: `src/lib/publishing/resolver.ts`.

| Environment | Visible |
|-------------|---------|
| Development | draft, review, scheduled, published (not archived) |
| Production | `status === "published"` **and** `publishedAt <= now` |

Scheduled content never auto-promotes. It returns `undefined` from repositories → pages call `notFound()` (404). It is excluded from search, related graphs, sitemap and public listings because those all go through repositories.

## Regional offers

Products are universal. Offers are regional (`NL | DE | FR | BE | UK | US | ZA`). Use `getOffersForProduct(productId, region)`. Prices never live on Product.

## Repository rule (Scenario H)

**UI pages must not import `@/content/*` directly.** Always use `@/repositories`.

## How to add a sport

1. Add a `Sport` row in `src/content/taxonomy/sports.ts`
2. Add disciplines in `disciplines.ts`
3. Attach categories via `sportIds`
4. Set `available: true` when ready for a deep hub
5. Run `npm run content:validate`

## How to add a category

1. Add to `src/content/taxonomy/categories.ts` with `pathSegment` for sport URLs
2. Optionally add subcategories
3. Add `SpecificationDefinition`s in `src/content/specs/definitions.ts`
4. Validate

## How to add a product

1. Ensure brand + family + category exist
2. Add product in `src/content/products.ts` with IDs for sports, disciplines, subcategories, use cases
3. Add offers in `offers.ts` (per region)
4. Optionally wire review, recommendations, alternatives, best-guide refs
5. Run `npm run content:validate`

## How to add a specification schema

1. Append definitions with the target `categoryId`
2. Use appropriate `type` / `unit` / `enumValues`
3. Set `comparisonPriority`, `finderRelevant`, `filterable`
4. Products may leave unknown values as `null`

## How to add editorial content

1. Create entity in the matching `src/content/*.ts` file
2. Reference Product IDs — never paste specs into the article
3. Use `publishedMeta()`, `draftMeta()`, or `scheduledMeta()`
4. Validate

## Validation

```bash
npm run content:validate
```

Checks Zod schemas, duplicate IDs/slugs, broken references, family consistency, publish dates.

## Discovery routes (Prompt 3)

| Route | Role |
| --- | --- |
| `/gear` | Global category hub (`?sport=` filter) |
| `/brands` | Brand A–Z hub (`?sport=` filter) |
| `/tools` | All tools; `?type=finder` filters finders |
| `/finders` | Curated finder landing (not a duplicate of `/tools`) |
| `/compare` | Comparison entry + starter selector (`?category=`) |
| `/search` | Full results (`?q=` + `?type=` filters) |

Navigation and mega menus read from `src/lib/navigation/config.ts` + repositories — not hardcoded sport lists in leaf components.

Search: `src/lib/search/engine.ts` + synonym map; publication-gated via the resolver.

## Sport hubs

Two presentation stacks — pick one per sport (never both):

| Stack | Path | Sports |
| --- | --- | --- |
| Declarative | `lib/sport-hub` + `components/sport-hub` | running, padel |
| Assemble | `lib/hubs` + `components/hub` | fitness |

Routing decision lives in `lib/sport-hubs.ts` and `app/[sport]/page.tsx`.

Do **not** re-add Running to `lib/hubs` — the old assemble config was a dead parallel path.

## Category catalog (Prompt 5)

Canonical sport-scoped category URLs use `ProductCategory.pathSegment`:

| Category | Canonical URL |
| --- | --- |
| Running Shoes | `/running/shoes` |
| GPS Watches | `/running/watches` |
| Heart Rate Monitors | `/running/heart-rate-monitors` |
| Hydration | `/running/hydration` |
| Packs & Vests | `/running/packs` |
| … | `/running/{pathSegment}` |

Do **not** use `/gear/running-shoes` as the category catalog (that remains a global gear path if present).

### Filter URL state

Shareable query params (examples):

```text
/running/shoes?type=daily-trainers&cushion=high&brand=asics,hoka
```

### Canonical / SEO policy

- Indexable canonical: `/running/{pathSegment}` (clean category URL)
- Arbitrary filter combinations: `rel=canonical` → clean category URL, `noindex,follow`
- Dedicated editorial use-case pages (e.g. `/best/running-shoes-heavy-runners`) are the indexable alternative to filter URLs

Catalog query: `src/lib/catalog/` (`getCatalogProducts`, facets, sort). Running Shoes deep config: `src/lib/catalog/running-shoes.ts`.

## Best / Buying guides (Prompt 8)

- Assembler: `getBestGuidePageData` / `getBuyingGuidePageData` in `src/lib/best/`
- Award taxonomy: `src/lib/best/awards.ts` (guide-specific, not on Product)
- Category config: comparison keys + selection criteria per category
- Flagship: `/best/running-shoes` — quick picks, comparison table, detailed recs, methodology
- Hub: `/best` organised by sport
- Buying guides remain at `/guides/[slug]` (education, not rankings)
- `isGuideStale()` for QA — does not auto-unpublish

## Review system (Prompt 7)

- Assembler: `getReviewPageData(slug)` in `src/lib/review/`
- Category review config: `src/lib/review/category-config.ts` (Running Shoes, GPS Watches)
- Authors: `/authors/[slug]` via `Author` entity (`src/content/authors.ts`)
- Review types: `first-hand-test` | `expert-research` | `hybrid` — never blur personal testing
- Flagship: `/reviews/asics-novablast-5` as **expert-research** (no fabricated wear-test)
- Score display prefers `Product.recommendationScore` to avoid dual contradictory scores
- Offers reuse Product Detail `OfferPanel` + regional sorting
- Evidence required on every Review; first-hand/hybrid require `personal-test` Evidence

## Product detail (Prompt 6)

- Assembler: `getProductPageData(slug)` in `src/lib/product/`
- Category display config: `src/lib/product/category-config.ts` (Running Shoes, GPS Watches)
- UI: `src/components/product/*`
- Score only shown when `recommendationScore` exists **and** structured Recommendation rows exist
- Specs driven by `SpecificationDefinition` + category groups — GPS watches never show shoe geometry
- Offers sorted: in-stock first, then lowest price; regional via `DEFAULT_REGION` (NL)
- Evidence: never claim personal testing without `Evidence.type = personal-test`

## SEO

- Metadata generators: `src/lib/seo/metadata.ts`
- JSON-LD: `src/lib/seo/jsonld.tsx` (Product, Review, ItemList, BreadcrumbList, FAQPage, Article, WebApplication)
- Sitemap: `src/app/sitemap.ts` (published entities only)

Never fabricate ratings or review counts in structured data.

## Deliberately deferred

- Full Running catalog population
- Interactive finder/calculator logic
- Scraping / live affiliate feeds
- Database / CMS migration (repos isolate storage)
- Automatic geo region detection
- Personal wear-testing claims (evidence must opt in)
