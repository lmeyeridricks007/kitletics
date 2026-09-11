# Running Editorial Strategy (Prompt 16)

Kitletics Running editorial content is a **decision layer**, not a sports blog.

## Hierarchy

```text
SPORT → CATEGORY → USE CASE → DECISION → PRODUCT
```

## Content types

| Type | Route | Purpose |
|------|-------|---------|
| Best Guide | `/best/[slug]` | Curated awards / shortlists |
| Buying / technical guide | `/guides/[slug]` | How to decide / explain concepts |
| Gear Setup | `/setups/[slug]` | Complete kit templates |
| Comparison | `/compare/[slug]` | Specific product pairs |
| Product / Alternatives / Review | product routes | Catalog truth |
| Finder / Planner / Calculators | `/tools/...` | Interactive decisions |

**Do not create:** motivation essays, generic fitness listicles, or “10 benefits of running”.

## Canonical intent

See `src/content/running/intent-map.ts` and `npm run content:intents`.

Examples:

| Intent | Canonical |
|--------|-----------|
| best running shoes | `/best/running-shoes` |
| how to choose running shoes | `/guides/how-to-choose-running-shoes` |
| shoe finder | `/tools/running-shoe-finder` |
| shoe rotation (explain) | `/guides/running-shoe-rotation` |
| shoe rotation (tool) | `/tools/shoe-rotation-planner` |
| novablast 6 | `/products/asics-novablast-6` |

If intent already belongs to an existing page type — improve that page.

## Best Guide methodology

- Awards use controlled `awardType` taxonomy
- One product per award unless clearly justified
- Best Overall ≠ highest Kitletics Score automatically
- Every recommendation uses `productId` (+ `recommendationId` / `evidenceIds` where available)
- Specs and prices render from Product / Offer — never hardcoded in prose
- No “we tested” language without `personal-test` Evidence
- Affiliate commission does not determine rankings

Award candidate helper (internal):

```ts
getGuideAwardCandidates({ guideId, awardType, products, recommendations, contextIds })
```

Does **not** auto-publish.

## Buying Guide methodology

- Answer-first (`quickAnswer`)
- Decision frameworks and taxonomy education
- Related Product IDs for modules — not duplicated specs
- Link Finders / Best Guides / Setups purposefully

## Technical content rules

Good: drop, cushioning, stability, plates, road vs trail, multi-band GPS, vest vs belt.  
Avoid medical prescriptions and unsupported safety claims.

## Evidence & testing badges

- Research guides: “Evidence-led” / assessment language
- “Tested” / first-hand only with matching Evidence type

## Publication

- Uses draft / review / scheduled / published / archived
- Production future content → real 404
- Sitemap only published eligible pages

## Freshness

- `publishedAt`, `updatedAt`, `lastVerifiedAt`, `nextReviewAt` where supported
- Do not fake freshness by year-stuffing titles unless useful (e.g. Best Running Shoes 2026)

## AI generation constraints

Workflow:

```text
decision intent → content type → structured catalog → draft → validate → review → publish
```

Not:

```text
keyword → 2,000-word Markdown article
```

Agents must receive Product / Recommendation / Evidence / relationship summaries and must not invent Product facts.

## Priority

| Priority | Examples |
|----------|----------|
| P0 | Best Running Shoes, How to Choose, Finder, Shoes category, Running hub |
| P1 | Daily / Long / Marathon / Stability / Trail / Watches / Rotation / Setups |
| P2 | Belts, headphones, socks, headlamps, technical deep-dives |
| P3 | Long-tail — only when catalog/evidence support quality |

## Tooling

```bash
npm run content:validate
npm run content:inventory
npm run content:intents
```

## Related editorial

`getRelatedEditorial()` — explicit relationships outrank automatic similarity; diversify Product / Tool / Comparison / Guide.
