# SiteQualityAgent

Internal name: **SiteGrowthAuditAgent**

Kitletics site quality owner — SEO is one slice of crawlability, content, performance, accessibility, trust, commercial independence, and growth readiness.

## Commands

```bash
npm run site:audit
npm run site:audit -- --mode=seo
npm run site:audit -- --mode=performance
npm run site:audit -- --mode=content
npm run site:audit -- --mode=links
npm run site:audit -- --mode=schema
npm run site:audit -- --mode=backlinks
npm run site:audit -- --mode=accessibility
npm run site:audit -- --mode=launch
npm run site:audit -- --mode=full --fix
npm run site:audit -- --mode=fix --dry-run
```

## Canonical report

- `docs/site-quality-audit.md`
- `docs/site-quality-audit.json`

Supporting:

- `docs/seo-architecture.md`
- `docs/performance-standards.md`
- `docs/backlink-opportunities.md`

## Architecture

| Layer | Path |
| --- | --- |
| CLI | `scripts/site-quality-agent.ts` |
| Domain | `src/domain/site-quality/` |
| Discover | sitemap + publication-gated inventory |
| Audits | technical SEO, content (reuses Guide/Review assessors), media, schema, links, trust, backlinks, perf/a11y static, security |
| Auto-fix | deterministic only (`metadataBase`, sitemap lastmod, robots disallow) |

## Rules

- Do **not** fabricate backlinks, DA scores, or AggregateRating.
- Do **not** keyword-stuff or create programmatic SEO spam pages.
- Auto-fix only high-confidence reversible issues.
- Reuse ProductReviewAgent / GuideQuality / freshness — do not fork their logic.
- CI should fail on BLOCKER only (launch mode exits 1 when NOT READY).

## Skill

`.cursor/skills/site-quality-audit/SKILL.md`
