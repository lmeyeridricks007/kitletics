# Kitletics Growth Outreach Agent (GrokBot)

Internal agent that finds **useful** opportunities for Kitletics to earn backlinks, mentions, citations, resource-page links, journalist coverage, and genuine community visibility.

It writes into the existing growth CRM at `/admin/growth/backlinks`. It is **not** a second outreach database.

**Hard rule:** the agent never posts, never sends email, never creates accounts, and never buys links. A human must approve every outbound action.

Canonical code: `src/domain/growth/backlinks/outreach-agent.ts`  
Skill: `.cursor/skills/growth-outreach/SKILL.md`  
Agent brief: `agents/growth-outreach/README.md`

---

## Architecture

```
Human search / CSV imports / source-request exports
        │
        ▼
Outreach agent (evaluate + draft + score)
        │
        ▼
Backlink workspace  data/growth/backlinks/workspace.json
        │
        ├── prospects
        ├── opportunities  (forum + editorial rows)
        ├── communities    (rules registry)
        ├── communityHistory
        ├── campaigns
        ├── journalists / sourceRequests
        ├── researchIdeas / earnedLinks
        └── weeklyRuns
        │
        ▼
/admin/growth/backlinks  +  npm run growth:weekly  +  npm run growth:outreach
```

| Layer | Location |
| --- | --- |
| Types / CRM | `src/domain/growth/backlinks/types.ts` |
| Editorial scoring (seed) | `scoreOpportunity()` — weights unchanged |
| Outreach scoring (agent) | `scoreOutreachOpportunity()` |
| Community registry | `communities.ts` |
| Forum drafts | `forum-response.ts` |
| Digital PR packets | `digital-pr.ts` |
| Orchestrator | `outreach-agent.ts` |
| Weekly digest | `weekly.ts` |
| CLI | `scripts/growth-outreach-agent.ts` |
| Admin | `/admin/growth/backlinks` (Communities, Weekly, Opportunities, Digital PR) |

There is no public API, no Reddit bot, and no mailer.

---

## Tools needed

Humans run these. The agent does not scrape gated SEO tools or log into communities.

| Need | How |
| --- | --- |
| Competitor link gaps | Ahrefs / Semrush **CSV export** → weekly `--competitor=` |
| Journalist requests | HARO / Qwoted / Featured / SourceBottle / Source of Sources **manual or CSV** → Imports / `--requests=` |
| Resource pages | Human Google/Bing queries from `weekly-queries.ts` (we do not scrape Google) |
| Forum / Reddit threads | Human finds the thread, saves JSON, `npm run growth:outreach -- --threads=` |
| Catalog facts | Live Kitletics asset registry (`assets.ts`) + proven research ideas |
| Outcomes | Humans mark contacted / mention_earned / link_earned in admin |

Do **not**: scrape Ahrefs, auto-comment on Reddit, create sock accounts, or invent DA/DR.

---

## Data inputs

1. **Asset registry** — `getLinkableAssets()` / `LINKABLE-ASSETS.md`. Prefer:
   - `/running/shoes/database`
   - `/tools/running-shoe-finder`
   - `/running/shoes`
   - Best Running Shoes / Best Daily Trainers
   - How to Choose Running Shoes
   - strong comparisons and reviews
   - running-watch guides
   - future research reports (**planned — no public URL to pitch**)
   Never default to `/`.
2. **Community registry** — locators + `RULES_UNKNOWN` until a human opens `rulesUrl`.
3. **Existing CRM** — prospects, outreach history, earned links, journalists.
4. **Imports** — Ahrefs/Semrush CSV, journalist-request CSV, manual pages CSV, optional GSC CSV.
5. **Research board** — proven findings only (`findingProven`). Unpublished Market 2026 numbers stay off-limits.
6. **Forum JSON** — `{ threadUrl, question, subreddit?, threadAgeHours?, commentCount?, upvotes?, existingAnswers?, accountTrustOk? }`.

Unknown emails, journalist names, traffic, authority metrics, and community rules stay **UNKNOWN**.

---

## Workflow

For every opportunity the agent must answer:

| Question | Field |
| --- | --- |
| WHO should we approach? | `siteName` / `contactName` or UNKNOWN |
| WHY are they relevant? | `whyThisSite` |
| WHAT Kitletics asset fits? | `targetAssetId` / `targetUrl` (never `/` as a default) |
| WHAT angle? | `pitchAngle` / `whyThisAngle` |
| SHOULD we include a link? | `linkRecommendation` |
| WHAT helpful pitch/response? | `suggestedResponse` or outreach draft |
| HOW valuable? | `overallScore` + `scoreReasons` + band |
| WHAT is the next action? | `nextAction` — always a **human** action |

### Forum path

1. Human (or weekly query list) finds a thread.
2. `evaluateForumThread` → intent, asset, link decision, unique draft, outreach score, engage gate.
3. `ingestForumThreads` writes a `CANDIDATE` opportunity on `campaign-forum-answers`.
4. Human opens `/admin/growth/backlinks/opportunities/[id]`, checks rules, edits the draft, posts **manually** if it still helps.
5. Human marks outreach status. The agent never posts.

### Editorial / journalist path

1. Import competitor CSV, source-request CSV, or a research idea.
2. Weekly workflow scores with **editorial** weights for those rows.
3. Journalist requests also get `evaluateJournalistRequest` (campaign `campaign-journalist-requests`).
4. Human APPROVE → copy draft → send from a real inbox or submit on HARO/Qwoted. No mass email.

---

## Forum rules

Stored per community:

`community`, `url`, `rulesUrl`, `selfPromotionPolicy`, `linkPolicy`, `accountAgeRequirements`, `karmaRequirements`, `commercialDisclosureRules`, `notes`, `rulesStatus`.

Seed rows are locators only. Karma thresholds, allow-lists, and “yes you may link” are **UNKNOWN** until a human records them after opening `rulesUrl`.

If rules are unclear: `RULES_UNKNOWN` + next action is manual review. **LINK_RECOMMENDED is impossible** while status is `RULES_UNKNOWN`.

Reddit rows also store `subreddit`, `thread`, `threadAgeHours`, `upvotes`, `commentCount`, `questionIntent`, `existingAnswers`, `selfPromoRisk`, `linkPolicy`, `suggestedResponse`, `recommendedAsset`.

Do not assume r/running, r/RunningShoeGeeks, r/AdvancedRunning, r/Marathon_Training, r/triathlon, r/trailrunning, r/hyrox, or r/Fitness allow promotional links.

Facebook / closed groups: only if a human is already a permitted member. No scraping, no sock accounts.

---

## Forum response policy

**NEVER auto-post.** Suggested text is for human review.

The draft must:

1. Answer the question directly.
2. Stay useful if the link is stripped.
3. Mention a real trade-off.
4. Not pretend Kitletics personally tested a product unless that is true (default: it is not).
5. Avoid marketing language, fake enthusiasm, and canned clones.
6. Include a Kitletics URL only when the resource materially helps **and** the link decision allows it.

Banned shapes: “Check out Kitletics for the best running shoes!”

---

## Link-inclusion decision

`LINK_RECOMMENDED` | `LINK_OPTIONAL` | `NO_LINK`

`LINK_RECOMMENDED` only when **all** are true:

- the page directly answers the question
- it adds data or comparison detail
- the user would benefit
- community rules are **KNOWN** and allow a resource link (`RESOURCE_OK`, `DISCLOSURE_REQUIRED`, or `ALLOWED`)
- account trust/history is sufficient
- the thread is not spam-sensitive

`NO_LINK` when the answer is complete without a URL, promo would feel forced, rules forbid it, the account is too new, the thread is sensitive, or self-promo is `FORBIDDEN`.

Low-trust accounts: answer in text only.

---

## Scoring

### Editorial CRM (seed prospects — unchanged)

relevance 30 · authority 20 · asset fit 20 · likelihood 15 · editorial 10 · relationship 5.

Authority is editorial judgment, **not** DA/DR.

### Outreach agent / forum rows

relevance 25 · asset fit 20 · likelihood 15 · authority 15 · helpfulness 15 · relationship 10.

**Spam risk is a penalty** (`overall = weighted − round(spamRisk × 0.4)`), not a positive weight.

Also stored (gates / queue, not extra weights): `helpfulnessScore`, `linkNecessityScore`, `spamRiskScore`, `communityFitScore`, `responseUrgencyScore`.

Bands (same as CRM): **90+ MUST PURSUE · 75–89 HIGH · 60–74 MEDIUM · &lt;60 LOW**.

Every score is explained in `scoreReasons`.

### Engagement gate (forums)

Recommend human engagement only when:

- helpfulness ≥ 70
- community fit ≥ 70
- spam risk ≤ 40

Failing the gate still stores the draft as history (`Do not engage`). It does not auto-delete.

---

## Human approval gates

| Action | Allowed autonomously? |
| --- | --- |
| Draft a forum reply | Yes (CRM only) |
| Post to Reddit / forums | **No** |
| APPROVE opportunity | **No** — human |
| Send email | **No** |
| Submit HARO/Qwoted | **No** — human on the platform |
| Mark rules KNOWN | **No** — human after reading rules |
| Change score weights from learning rates | **No** — suggestion only, n≥10 |
| Buy links / PBN / directories / fake identity | **Never** |

Outbound engagement requires a person.

---

## Response generation

`forum-response.ts` hashes `threadUrl + question` so two threads do not get the same canned paragraph. Named models in the question (e.g. Novablast vs Ghost) are used in the answer.

Journalist drafts use `draftOutreach` plus proven catalog coverage. If a statistic is not in a proven research idea, the draft says **UNKNOWN** / “do not invent statistics”.

---

## Backlink discovery

Same as the weekly workflow:

- competitor CSV (RunRepeat, Doctors of Running, Running Shoes Guru, Road Trail Run, Believe in the Run)
- resource-page / club / newsletter queries (human-run)
- unlinked mention type `UNLINKED_MENTION` when a human imports a mention without a link
- broken-link type `BROKEN_LINK_REPLACEMENT`

Dedup: same URL, or same domain + type + asset, or in-motion outreach on the same domain + asset. Seed rows are not listed as NEW.

---

## Journalist monitoring

Platforms: HARO, Qwoted, Featured, SourceBottle, Source of Sources.

Per request store: deadline, journalist (or UNKNOWN), publication (or UNKNOWN), topic, requirements, recommended angle, supporting data (proven only), suggested response, asset.

Weekly digest lists **JOURNALIST DEADLINES** in the next 7 days (`new` / `drafting` only).

---

## Digital PR

Packets come only from `digitalPrPacketFromIdea` when `findingProven` is true.

Each packet: finding, sample size (or UNKNOWN), coverage, methodology, caveat, target publications (as already on the idea — not invented names), target journalist IDs (usually empty), source asset.

Examples the catalog *may* compute: lightest daily trainers, From-price by brand, stack/drop distributions, plated vs not. If the board cannot compute it, there is no pitch.

---

## CRM integration

Opportunity types added to the **same** `OPPORTUNITY_TYPES` list:

`FORUM_THREAD`, `REDDIT_THREAD`, `Q_AND_A_THREAD`, `COMMUNITY_DISCUSSION`, `UNLINKED_MENTION`.

Brief aliases: `JOURNALIST_REQUEST` → `JOURNALIST_SOURCE_REQUEST`, `ROUNDUP` → `ROUNDUP_INCLUSION`, `BROKEN_LINK` → `BROKEN_LINK_REPLACEMENT`, `SPORTS_SCIENCE` → `UNIVERSITY_RESEARCH`.

New optional opportunity fields: helpfulness / link necessity / spam / community fit / urgency scores, `linkRecommendation`, community id/rules, `forumThread`, `suggestedResponse`, `nextAction`.

Workspace: `communities[]`, `communityHistory[]`.

Campaigns (seed):

1. Running Shoe Database (`campaign-database`) — active  
2. Running Shoe Finder (`campaign-finder`) — active  
3. Running Shoe Market 2026 (`campaign-market-2026`) — **planned**  
4. Forum Helpful Answers (`campaign-forum-answers`) — active  
5. Journalist Source Requests (`campaign-journalist-requests`) — active  

Existing workspace files pick up 4–5 via `ensureCampaigns()` on read.

---

## Weekly run logic

```bash
npm run growth:weekly -- --competitor=… --requests=… --pages=… --gsc=…
npm run growth:outreach -- --threads=threads.json
```

Digest sections:

- NEW MUST PURSUE  
- NEW HIGH  
- FORUMS TO RESPOND TO  
- JOURNALIST DEADLINES  
- FOLLOW-UPS DUE  
- EARNED LINKS  
- EARNED MENTIONS  
- LOST LINKS  

Learning loop (n≥10 contacted before a rate is published): response/earned by asset, angle, type, community, link recommendation. Suggestions are **not** auto-applied. Do not overfit one lucky link.

Memory: skip threads already in opportunities; skip people/sites with open outreach on the same asset; keep `communityHistory`.

---

## Failure / risk handling

| Failure | Handling |
| --- | --- |
| Missing contact | `CONTACT_UNKNOWN` — do not invent an inbox |
| Missing journalist name | `UNKNOWN` |
| Unproven statistic | omit / UNKNOWN; do not fabricate |
| Unclear community rules | `RULES_UNKNOWN`; no `LINK_RECOMMENDED` |
| Homepage is the only URL | skip — do not pitch `/` |
| Planned research asset | park; no public URL |
| Duplicate thread | skip ingest |
| High spam / weak fit | store as do-not-engage |
| Production writes | off unless `GROWTH_BACKLINKS_WRITES=1` |
| Agent crash mid-ingest | workspace save is per successful `persistForumThreadIngest`; dry-run writes nothing |

Risk ethics (also `OUTREACH-GUIDELINES.md`): no auto-comments, no mass email, no fake identities, no paid-link automation, no PBNs, no directory spam, no link drops without context.

---

## How to run a forum pass

1. Use the `forum_thread` queries in `weekly-queries.ts` (or browse communities you already participate in).
2. Save permitted, publicly visible threads to JSON. Do not scrape logged-in Facebook.
3. `npm run growth:outreach -- --threads=./tmp/threads.json --dry-run` to read drafts.
4. Ingest without `--dry-run` (local writes on by default).
5. Review in `/admin/growth/backlinks/communities` and the opportunity page.
6. Post only as yourself, following the live rules. Record the outcome.

Admin is not publicly indexable.
