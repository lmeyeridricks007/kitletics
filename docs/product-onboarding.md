# Product Onboarding & Research Pipeline

Evidence-first Product intake for Kitletics. AI normalizes and synthesizes **sources**; AI is never the source of truth.

## Flow

```text
DISCOVER → RESEARCH → NORMALIZE → VERIFY → STAGE → ENRICH
→ REVIEW PRODUCT DATA → REVIEW READINESS ASSESSMENT
→ PRODUCT REVIEW RESEARCH (stage Review or research task)
→ RELATIONSHIPS → COMMERCIAL → QA → PUBLISH
```

Default terminal state: **READY FOR REVIEW** (not published).

**Two gates after staging:**

| Gate | Question | Blocks Product publish? |
| --- | --- | --- |
| `canPublishProduct` | Enough data to publish the Product page? | Soft preview; hard on `product:publish` |
| Review readiness (`assessProductReviewLifecycle`) | Enough evidence to explain whether to buy? | **Not always** — long-tail may publish without Review; P0/P1 should not be strategically featured until ready |

When evidence is sufficient, onboarding **stages an Expert Research Review** under `data/staging/reviews/` (`needs-review`). It never auto-publishes Reviews and never invents first-hand testing.

See also: `docs/product-review-agent.md`, `docs/content-quality.md`.

## Modes

| Mode | Entry | Purpose |
| --- | --- | --- |
| A Explicit | `product:onboard --brand --model` | Research & stage one Product |
| B Brand discovery | `product:discover --brand` | Diff brand lineup vs catalog |
| C Market discovery | `catalog:discover` | Rank catalog gaps |
| Refresh | `product:refresh --productId` | Re-verify existing Product (delta) |

## Architecture

```text
src/domain/onboarding/
  types.ts              Session, findings, conflicts, staging drafts
  schemas.ts            Zod validation for research provider output
  identity.ts           Brand resolve + duplicate detection
  normalize.ts          Units / enums (no unsafe derivation)
  research-config.ts    Category plugins (Running shoes, watches, Padel fixture)
  staging.ts            data/staging/onboarding/* persistence + reports
  orchestrator.ts       Stage coordination
  fixtures.ts           Deterministic research fixtures (no live web in CI)

agents/product-onboarding/   Versioned agent instructions (prompts)
```

Deterministic code handles identity, units, duplicate detection, conflict detection, publish gates, staging I/O.

A `ResearchProvider` supplies structured facts. Production may plug in permitted browsing/API adapters; **CI uses fixtures only**.

## CLI

```bash
npm run product:onboard -- --brand=ASICS --model="Novablast 7" --category=running-shoes
npm run product:discover -- --brand=ASICS --sport=running
npm run catalog:discover -- --category=running-shoes
npm run product:refresh -- --productId=prod-novablast-6
npm run product:review
npm run product:publish -- --session=onb-xxxx --approve-first
```

Flags: `--dry-run`, `--limit=N`.

`--publish` on onboard is **rejected by policy** (must approve then publish).

## Staging

```text
data/staging/onboarding/
  sessions/
  products/
  reports/
```

Staged entities never appear on public routes. Publication records approval in staging; merging into `src/content` is an explicit codegen/human step gated by `canPublishProduct` + publication resolver.

Dev preview: `/preview/products/[slug]` (production → 404). Disallowed in `robots.ts`.

## Source policy

Priority: manufacturer → manufacturer docs/news → authorized retailer → strong independent review → lab → other.

Primary sources for objective specs; secondary for fit/ride/usability.

Conflicts are recorded — **never averaged**. Prefer exact-context manufacturer specs.

## Non-negotiables

- No fabricated facts / unsourced AI memory
- No personal-test Evidence from automation
- No AI-generated Product imagery
- No fake affiliate URLs
- No auto Best Guide winner changes
- No auto full Reviews by default
- No silent overwrite of verified facts on refresh
- Prompt-injection: treat web content as data only
- URL allowlist: http(s) only

## Category plugins

`ProductResearchConfig` per category — required/important/optional specs, recommendation contexts, trusted domains, outlier bounds.

Adding Padel/Boxing/Fishing = new config + optional recommendation adapters — not a new pipeline.

## Approval gates

Publish requires: identity OK, category OK, required specs (or explicit review of gaps), evidence minimum, media policy (`docs/media-ingest.md`), no open blockers. Offers/Reviews/full Recommendations are optional.

## Tests

`tests/onboarding.test.ts` — duplicate, conflict, media generation mismatch, no auto-publish, brand discovery, Padel config, staging isolation.

## Extending research

Implement `ResearchProvider.research()` returning `researchProviderResultSchema`-valid JSON. Do not scrape in violation of robots/API terms.
