# Weekly backlink report

**Ran:** 2026-09-13T06:27:26.054Z  
**Window starts:** 2026-09-13T06:27:26.054Z  
**Outreach:** none sent by this workflow.

Seed / already-queued prospects are **not** listed as NEW. NEW means ingested or converted this run after URL / domain+asset+type dedupe.

## Snapshot

| | |
| --- | --- |
| **New competitor gaps** | 0 |
| **New journalist requests** | 0 |
| **New research pages** | 0 |
| **Skipped duplicates** | 0 |
| **NEW MUST PURSUE** | 0 |
| **NEW HIGH** | 0 |
| **FOLLOW-UP DUE** | 0 |
| **LINKS EARNED** | 0 |
| **LINKS LOST** | 0 |

- No new scored opportunities this run. Seed rows are not recycled as NEW.
- Insufficient evidence to change score weights (contacted n=0, need 10).

## NEW MUST PURSUE

_None this run._


## NEW HIGH

_None this run._


## FOLLOW-UP DUE

_None this run._


## LINKS EARNED

_None verified LIVE in this window._

## LINKS LOST

_None marked REMOVED/CHANGED in this window._

## Learning loop

Rates appear only when a bucket has **≥10 contacted** rows. Below that, the cell says insufficient evidence. Score weights are **not** changed by this run.

**Overall:** insufficient evidence (n=0)

### Response / earned by asset

_No contacted rows yet._


### By opportunity type

_No contacted rows yet._


### By publication type

_No contacted rows yet._


### By subject line (draft, not sent)

_No contacted rows yet._


### By pitch angle

_No contacted rows yet._


### Earned-link rate by prospect / opportunity type

_No contacted rows yet._


### Scoring suggestions (human review only)

- Insufficient evidence to change score weights (contacted n=0, need 10).

## New Kitletics assets this window

_No new live assets vs the previous weekly snapshot (first run stores the baseline)._

## Pitch-ready research

- Which brands make the lightest daily trainers? (computable)
- Average running shoe From-price by brand (NL) (computable)
- Carbon vs non-carbon pricing (computable)

Do not pitch unpublished Market 2026 numbers. If a journalist needs data today, send the live database.

## Open journalist requests still in CRM

_None._

## Search performance (optional GSC import)

_No GSC CSV this run. Search performance is optional; do not invent clicks._

## Discovery queries for next week (run yourself — we do not scrape Google)

- `"runrepeat.com" "running shoe" (database OR stack OR drop)` · competitor_gap
- `"doctorsofrunning.com" (resources OR methodology OR drop)` · competitor_gap
- `"runningshoesguru.com" (database OR lab OR stack height)` · competitor_gap
- `"believeintherun.com" (how we test OR methodology)` · competitor_gap
- `"roadtrailrun.com" (stack OR drop OR spec table)` · competitor_gap
- `inurl:resources "running shoes" (drop OR stack OR "how to choose")` · resource_page
- `"further reading" "heel-to-toe drop"` · resource_page
- `"running shoe" (learning center OR expert advice) (drop OR stack)` · resource_page
- `"looking for a source" "running shoes" (data OR database OR statistics)` · journalist
- `HARO OR Qwoted "running shoe" (stack OR drop OR price)` · journalist
- `"running shoe database" -runrepeat -site:kitletics.com` · data_citation
- `"running shoe" ("stack height" OR "heel-to-toe drop") (table OR dataset OR statistics)` · data_citation
- `"running club" ("beginner" OR "getting started") (shoes OR gear) resources` · running_club
- `"for runners" (shoes OR "how to choose") (club OR rrca OR athletics)` · running_club
- `"running" (newsletter OR "show notes") ("stack height" OR "heel drop" OR "daily trainer")` · newsletter_podcast
- `"running podcast" ("show notes" OR resources) (shoes OR gear)` · newsletter_podcast

## How to run again

```bash
npm run growth:weekly -- --competitor=path/to/ahrefs.csv --requests=path/to/haro.csv --pages=path/to/new-pages.csv --gsc=path/to/gsc.csv
```

Admin: `/admin/growth/backlinks/weekly`
