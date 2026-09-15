# Backlink & digital PR system

Internal growth workspace at `/admin/growth/backlinks`.

Not publicly indexable: `robots.ts` disallows `/admin/`, middleware sets `X-Robots-Tag: noindex, nofollow`, production returns 404 unless `ADMIN_GROWTH_SECRET` is set. Public GA4 / Ahrefs / Vercel Analytics scripts do not load on `/admin`.

## Architecture

| Layer | Location |
| --- | --- |
| Domain model | `src/domain/growth/backlinks/` |
| Persistence | JSON file `data/growth/backlinks/workspace.json` (gitignored). Seed is code: `seed.ts`. |
| Admin UI | `src/app/admin/growth/backlinks/` |
| Gate | `src/lib/admin/growth-gate.ts` + `src/middleware.ts` |
| Public assets | Resolved live from the catalog in `assets.ts` |

There is no separate database. This matches other Kitletics internal ledgers (site-quality, review staging). Production is read-only unless `GROWTH_BACKLINKS_WRITES=1`. Locally, writes are on by default so review/outreach/import mutations persist.

## Screens

Overview · Weekly · Prospects · Opportunities · Assets · Communities · Competitors · Journalists · Digital PR · Outreach · Earned Links · Research Ideas · Imports · Settings

CSV exports: `/admin/growth/backlinks/export/{priority,prospects,campaigns,earned}.csv`

## Opportunity model

`BacklinkOpportunity` in `types.ts`. Vendor DR/DA/traffic are stored as `importedAuthority` + `metricSource` (`ahrefs` / `semrush` / `moz` / `majestic`). Editorial `authorityScore` is a 0–100 judgment, not DA.

Contacts default to `CONTACT_UNKNOWN`. Placeholder emails (`@example.com`) are rejected.

Every candidate stays `CANDIDATE` until a human APPROVE / REJECT / DEFER. Outreach drafts are never auto-sent.

## Workflow

1. Review the ranked queue (Overview / Opportunities).
2. Open a candidate: why this site, why this asset, why this angle, evidence, risk.
3. APPROVE only if SAFE or an accepted REVIEW case.
4. Copy the draft. Send from a real inbox. Mark `contacted`.
5. Follow up once in 5–7 days (max two follow-ups). Stop on decline / earned.
6. When a URL is live, record it on Earned Links **and** append `data/staging/site-quality/known-backlinks.json`.

Weekly discovery (does not send mail):

```bash
npm run growth:weekly -- --competitor=… --requests=… --pages=… --gsc=…
```

See `WEEKLY-BACKLINK-WORKFLOW.md`. Latest digest: `WEEKLY-BACKLINK-REPORT.md`. Admin: `/admin/growth/backlinks/weekly`. Seed prospects are never recycled as NEW.

Growth Outreach Agent (GrokBot): `GROKBOT-GROWTH-OUTREACH-AGENT.md`. Forum drafts: `npm run growth:outreach -- --threads=file.json`. Never auto-posts.

## Ethics (hard no)

Automated comments, directory spam, fake journalist identities, PBNs, hidden links, paid-link automation, reciprocal farms, guest-post marketplaces.

See `OUTREACH-GUIDELINES.md` and `PROSPECT-SCORING.md`.
