# Kitletics performance standards

Owned by **SiteQualityAgent**. Targets — not guarantees.

## Budgets (targets)

| Metric | Target |
| --- | --- |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |

Keep JS and image payload lean on Product, Review, Best, Finder, and Homepage.

## Image rules

- Only the true LCP candidate uses `priority` / preload
- Do not priority-load grids of product cards
- Prefer modern formats; set dimensions; responsive `sizes`
- Authentic product media only — no dummy placeholders on commercial pages

## JS / client

- Prefer Server Components
- Search/filters must not ship the full catalog to the client
- Third-party (analytics/affiliate) must not block first paint

## Fonts

- `next/font` with swap
- Limit weights

## Cache

- Static generation / revalidation for public pages
- Never globally cache personalized Compare/Finder state

## Representative routes to measure

`/`, sport hub, category, product, review, best guide, long-form guide, compare builder, finder, tool, search

## Lab baseline

```bash
npm run build && npm run start
# other terminal:
npm run site:perf-baseline
```

Writes measured mobile Lighthouse results to `data/staging/site-quality/perf-baseline.json` (clears PERF-002). Lab INP is often unavailable — use CrUX/field for INP.

Store measured baselines under `data/staging/site-quality/perf-baseline.json` when Lighthouse (or equivalent) is run.
