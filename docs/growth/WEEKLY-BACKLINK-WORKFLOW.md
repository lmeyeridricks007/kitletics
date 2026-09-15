# Weekly backlink-opportunity workflow

Repeatable operator loop. Nothing is auto-sent. Score weights do not change unless a human applies evidence from the learning section.

## Command

```bash
npm run growth:weekly
npm run growth:weekly -- --competitor=exports/ahrefs.csv --requests=exports/haro.csv --pages=exports/new-pages.csv --gsc=exports/gsc.csv
```

Admin: `/admin/growth/backlinks/weekly`

Outputs:

- `docs/growth/WEEKLY-BACKLINK-REPORT.md` (latest)
- `docs/growth/weekly/YYYY-MM-DD.md` (archive)
- CRM updates in `data/growth/backlinks/workspace.json` when writes are enabled

## Inputs

| Input | Source | Used for |
| --- | --- | --- |
| Existing CRM | workspace / seed | Dedup, follow-ups, learning |
| Earned links | Earned Links ledger | LINKS EARNED / LOST |
| Outreach history | opportunity outreachStatus | FOLLOW-UP DUE + rates |
| Competitor backlink CSV | Ahrefs / Semrush / Moz / Majestic | NEW competitor gaps |
| Journalist requests | HARO / Qwoted / Featured CSV | NEW journalist opportunities |
| New research pages | Manual CSV (`url,site,type,evidence,…`) | Resource / data / club / newsletter pages |
| New Kitletics assets | live catalog vs last snapshot | Pitch list, not prospects |
| Recent research | research ideas `computable` / `ready_to_pitch` | Pitch-ready findings |
| Search performance | optional GSC CSV | Which live assets have demand |

We do **not** scrape Google. Discovery queries are listed in the report for you to run.

## Every run

1. Ingest CSVs (optional).
2. Convert still-open source requests that have a real publication domain.
3. Score new rows. AVOID stays out of NEW MUST/HIGH.
4. Deduplicate against existing opportunities:
   - same page URL
   - same domain + type + asset
   - same domain + asset with outreach already in motion
5. Seed / already-queued rows are **not** recycled as NEW.
6. List FOLLOW-UP DUE (5–7 day window, max two, stop on decline/earned).
7. List FORUMS TO RESPOND TO (helpful drafts that pass the engagement gate — still never auto-posted).
8. List JOURNALIST DEADLINES in the next 7 days.
9. Diff earned links LIVE vs REMOVED/CHANGED in the window; list EARNED MENTIONS separately.
10. Report learning rates only when a bucket has ≥10 contacted rows.
11. Suggest weight changes only with that evidence. **Do not auto-apply.**

Forum JSON ingest is a separate command (never posts):

```bash
npm run growth:outreach -- --threads=exports/threads.json
```

See `GROKBOT-GROWTH-OUTREACH-AGENT.md`.

## New-pages CSV

```text
url,site,type,topic,evidence,who,contact_route,country,language
https://example.run/drop,Example Run,DATA_CITATION,heel drop,Already defines drop vs stack,,,US,en
```

`type` should be an opportunity type (`RESOURCE_PAGE`, `DATA_CITATION`, `RUNNING_CLUB`, `NEWSLETTER`, `PODCAST`, …) or a short hint (`club`, `newsletter`).

A homepage is not enough. The URL must already show link intent.

## Ethics

Same as `OUTREACH-GUIDELINES.md`: no invented emails, no auto-send, no guest-post farms, no asking for “a backlink”.
