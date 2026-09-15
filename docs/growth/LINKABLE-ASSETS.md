# Linkable assets

Registry: `src/domain/growth/backlinks/assets.ts`. URLs are resolved from the live catalog (`getBestGuides`, `getBuyingGuides`, `getComparisons`, `getToolBySlug`, `getReviewBySlug`). Planned research has **empty url**.

## Ranked pages to promote

| Rank | Asset | Live URL | Notes |
| --- | --- | --- | --- |
| 1 | Running Shoe Database | `/running/shoes/database` | Default data cite |
| 2 | Running Shoe Finder | `/tools/running-shoe-finder` | Clubs / beginners |
| 3 | Market / weight / stack / price / carbon studies | *(none)* | Pitch only after a public URL |
| 4 | Best Running Shoes / Daily Trainers / watch guides | `/best/…` if the slug exists | Roundups and shopping desks |
| 5 | How to Choose Running Shoes, drop, cushioning | `/guides/…` | Coaches and clubs |
| 6 | Compare hub + named matchups | `/compare`, `/compare/{slug}` | Brand vs brand |
| 7 | Strong reviews (e.g. Vomero 18) + methodology | `/reviews/…`, `/how-we-review` | Model-specific or process cites |
| 8 | Category / brand hubs | `/running/shoes`, `/brands/asics` | Only when the story is the lineup |

## Matching

`matching.ts` prefers a type-specific asset, then topic boosts (price, drop, stack, weight, finder, roundup, vs). Homepage is excluded.

Do not pitch a commercial Best page when the journalist needs a neutral table — send the database.

## Research board

`research-ideas.ts` attaches a finding **only** when the catalog can compute it. Empty coverage means do not pitch a number.
