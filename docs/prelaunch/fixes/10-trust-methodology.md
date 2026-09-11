# Fix 10 — Trust & Editorial Transparency

**Mode:** Remediation (trust routes, authorship honesty, schema typing; no invented expertise)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/06-media-offers-trust.md`  
**Evidence:** re-run `prelaunch-06` after route + schema changes

---

## 1. Scoreboard

| Finding | Before | After |
|---|---|---|
| Fake AggregateRating blocker | **false** (kept) | **false** (kept) |
| Visible first-hand reviews | **0** | **0** (honest) |
| Missing trust routes | authorsIndex, editorialPolicy, evidencePolicy, scoringMethodology | **[]** |
| `/how-we-review` stub heuristic | true | **false** (expanded + typed) |
| Authors defined | 1 generic desk | 1 transparent **Kitletics Editorial** desk |
| Trust phrase hits (unsupported claims) | 0 | **0** |

---

## 2. Routes created / completed

| Route | Role |
|---|---|
| `/editorial-policy` | Research, product selection, updates, corrections, non-claims |
| `/evidence-policy` | Evidence hierarchy; unknown stays unknown; zero first-hand today |
| `/scoring-methodology` | Kitletics Score, use-case ranking, affiliate neutrality (no proprietary weight dump) |
| `/authors` | Authors index — desk attribution only; no invented experts |
| `/authors/kitletics-editorial` | Role, methodology, coverage, review type |

### Reused (not duplicated into conflicting essays)

| Route | Role after fix |
|---|---|
| `/methodology` | Hub overview + links to dedicated policies |
| `/how-we-review` | Review-type definitions (First-Hand / Expert Research / Hybrid) |
| `/affiliate-disclosure` | Commission mechanics + ranking independence |
| `/about` | Product mission + pointer to policies |

Cross-nav: `TrustRelatedNav` on trust pages.

Footer + sitemap include the new routes. Sport `RESERVED` set updated so paths are not captured as sport hubs.

---

## 3. Editorial policy (content)

Covers: how content is researched; how products are selected; how updates and corrections work; what Kitletics does **not** claim (no invented wear tests, no medical diagnosis, no AggregateRating fabrication, no commission-as-quality).

---

## 4. Evidence policy (content)

Hierarchy: manufacturer specs → retailer/offer data → independent sources → first-hand **only when evidence exists**. States explicitly that Kitletics currently publishes **zero** first-hand reviews. Unknown fields remain null/omitted.

---

## 5. Scoring methodology (content)

Explains Kitletics Score vs use-case recommendation scores; why the same product ranks differently by job; affiliate neutrality. Does not publish full proprietary weight tables.

---

## 6. Review methodology

| Type | Meaning on Kitletics |
|---|---|
| First-Hand | Requires personal-test evidence — **none published** |
| Expert Research | Default — specs + peers + independent synthesis |
| Hybrid | Requires same personal-test gate — unused without evidence |

Labels updated in `review-meta.ts` to say so. Visible-type gate unchanged (`visible-type.ts`).

---

## 7–8. Authors & author page

- Single repository author: **Kitletics Editorial** (editorial desk).
- Bio / disclosure state desk attribution clearly; no fake credentials or photos inventing a person.
- Author page sections: Role, Methodology, Coverage areas, Review type.
- Reviews without `reviewerId` resolve at page time to this desk; `getReviewsByAuthor` attributes unassigned reviews to the desk for listing.
- AuthorCard eyebrow: “By” (not “Reviewed by”).

---

## 9. Affiliate disclosure

Existing page retained and expanded with link to scoring methodology. Compact `AffiliateDisclosure` near commerce CTAs unchanged in purpose: commission disclosed; rankings independent.

---

## 10. Schema

| Change | Detail |
|---|---|
| `reviewJsonLd` | Kitletics Editorial → `@type: Organization` (not Person) |
| `articleJsonLd` | Same desk detection → Organization |
| Author profile JSON-LD | Organization for desk; Person only for real named authors |
| AggregateRating | Still omitted on Product / still `Rating` on Review — **kept good** |

---

## 11. Verification

`prelaunch-06` after changes:

```json
{
  "fakeRatingBlocker": false,
  "visibleFirstHandReviews": 0,
  "missingTrustRoutes": [],
  "trustPhraseHits": 0,
  "authorsCount": 1
}
```

---

## 12. Definition of done

- [x] Dedicated editorial / evidence / scoring / authors routes
- [x] Existing methodology / how-we-review / affiliate reused without contradiction
- [x] Zero first-hand stated honestly
- [x] No invented experts
- [x] Correct Organization vs Person schema for desk byline
- [x] AggregateRating discipline preserved
- [x] Report filed

---

## Follow-ups (optional)

- Named individual authors only when real people join the repository
- First-hand reviews only with personal-test Evidence + testing context
- Reduce “reviews missing authorId” at seed level by writing `reviewerId` into content (page-time default already covers UX/schema)
