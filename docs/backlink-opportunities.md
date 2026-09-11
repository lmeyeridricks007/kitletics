# Kitletics backlink opportunities

Owned by **SiteQualityAgent**. **No fabricated domain authority or outreach claims.**

## Current known state

- No live backlink graph is integrated in-repo (expected — Ahrefs/Moz APIs are out of scope).
- Manual ledger: [`data/staging/site-quality/known-backlinks.json`](../data/staging/site-quality/known-backlinks.json)
  - `links[]` may be empty until a link is verified on the source page.
  - **Never** store DA/DR, spam score, or invented outreach counts in that file.
- Do not invent “Contacted N sites” or domain-authority claims in marketing copy.

## Linkable assets (on-site)

Prioritize pages worth citing:

| Asset | Path / slug | Why link-worthy | Priority |
| --- | --- | --- | --- |
| Running Shoe Finder | `/tools/running-shoe-finder` | Interactive decision tool | High |
| Fitness Watch Finder | `/tools/fitness-watch-finder` | Category decision utility | High |
| Pace Calculator | `/tools/running-pace-calculator` | Utility + embed potential | High |
| Race Time Predictor | `/tools/race-time-predictor` | Race-planning utility | High |
| Shoe Rotation Planner | `/tools/shoe-rotation-planner` | Distinctive training utility | High |
| Compare Products | `/compare`, `/tools/compare-products` | Structured gear comparison | Medium |
| Home Gym Builder | `/tools/home-gym-builder` | Fitness planning utility | Medium |
| HYROX tools | `/tools/hyrox-*` | Niche race kit + time tools | Medium |
| Padel / Tennis racket finders | `/tools/*-racket-finder` | Court sport decision tools | Medium |
| Best Guides | `/best/*` | Editorial shortlists with trade-offs | High |
| Methodology / How we review | `/methodology`, `/how-we-review` | Trust + citation for process | Medium |
| Product database + comparisons | `/products`, `/compare` | Structured gear data | Medium |

## Hub → tool internal links (implemented)

Descriptive anchors from hubs and guides into tools (supports BACKLINK-001):

| From | Into tools |
| --- | --- |
| `/running` hub footer + quick actions | Shoe Finder, Pace Calculator, Race Predictor, Rotation Planner, Watch Finder |
| `/padel` hub footer + quick actions | Padel Racket Finder |
| `/fitness` hub (featured tools) | Home Gym Builder, HYROX + strength finders/calculators |
| Best / buying guides | `relatedToolSlugs` → rendered tool CTAs (shoe finder, rotation, watch finder, pace/race tools) |
| Home Finder panel | Sport-aware CTAs into finders / gym builder |
| Compare / product pages | Category finder handoffs where configured |

## Gaps

- Publish original data only when Kitletics can support claims (price tracking, generation analysis)
- Avoid thin programmatic query pages as “linkbait”
- Continue expanding `relatedToolSlugs` on new Best Guides as they ship
- **`/studies/[slug]` data-study pages not shipped yet** — template + computable catalog angles documented in Fix 26

## Prospect categories (manual research)

Running publications, sports publications, running clubs, coaches, race organizers, fitness sites, gear sites, sports-data resources, universities (rare / relevant only), local NL running resources.

Outreach is **manual** — SiteQualityAgent only identifies angles and asset gaps. Ledger: [`data/staging/site-quality/outreach-pipeline.json`](../data/staging/site-quality/outreach-pipeline.json).

Full foundation (inventory, PR ideas, study template, 60-day assets): [`docs/prelaunch/fixes/26-digital-pr-foundation.md`](prelaunch/fixes/26-digital-pr-foundation.md).

## Priority backlog

1. Keep Finder + Calculators complete, fast, and well-linked from Guides/Best/Sport hubs
2. Keep methodology pages accurate and citeable
3. Expand decision-complete Best Guides for commercial categories
4. Ship first `/studies` catalog snapshot (weight / drop / stack / plate) before pitching “Kitletics data”
5. Document any real earned links in `data/staging/site-quality/known-backlinks.json` (date, source, target URL)
