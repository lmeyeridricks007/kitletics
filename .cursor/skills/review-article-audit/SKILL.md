---
name: review-article-audit
description: >-
  Audit Kitletics product review articles against industry best practices
  (verdict, audience, length, readable guide voice, scores, alternatives,
  disclosure, media, first-hand honesty). Use when the user asks to review
  review quality, run a review article audit, check editorial standards, or
  produce findings for review pages.
---

# Review Article Audit Agent

## Goal

Assess **published** review pages (enriched page content via `getReviewPageData`) against product-review best practices and write a local findings doc.

## Quick start

```bash
# Full published set → reports/
npm run reviews:article-audit

# One review
npm run reviews:article-audit -- --slug=nike-vomero-18

# Sample + fail CI if any P0
npm run reviews:article-audit -- --limit=30 --fail
```

Reports:

- `reports/review-article-audit-YYYY-MM-DD.md` — human findings
- `reports/review-article-audit-YYYY-MM-DD.json` — machine-readable

## Workflow

1. Run the audit with the scope the user asked for (all / slug / limit).
2. Open the **markdown** report — start with **Priority findings (P0)** and **Top recurring issues**.
3. Fix in this order:
   - **P0 voice / first-hand / media / verdict / disclosure / publish-gate**
   - **P1 length, structure, alternatives, pros/cons, scores**
   - **P2 polish** (second-person, value section, slight over-length)
4. Re-run the audit for the touched slugs until P0s are cleared.

## What “good” means

| Practice | Pass |
| --- | --- |
| Verdict up front | `bottomLine` or `verdict` |
| Audience | `whoShouldBuy` + `whoShouldAvoid` |
| Honest trade-offs | specific pros (≥2) + cons (≥1) |
| Transparent scores | ≥3 criteria |
| Long-form depth | **3,000–5,500** words on enriched page |
| Scannable structure | ≥6 substantive sections |
| Guide voice | no research-paper jargon on **decision copy** (lead/sections/pros-cons) — methodology disclosure may say “Expert Research” |
| First-hand honesty | no “we tested” on decision copy without personal-test evidence |
| Alternatives | alternatives or comparison peers |
| Disclosure | testingContext or editorialDisclosure |
| Media | authentic product hero + **unique product section images** per major section (generate from hero; see `review-section-images.mdc`) |

**Severity contract (Fix 85):** article `P0` ≡ site:audit `BLOCKER` on enriched decision copy. Source-seed residue is `LOW` hygiene — not a user-facing P0 when enriched output is clean. See `src/lib/review/quality-contract.ts`.

## Key files

| Path | Role |
| --- | --- |
| `src/lib/review/assess-review-article-quality.ts` | Rubric + scoring |
| `scripts/review-article-audit.ts` | CLI + report writer |
| `src/lib/review/enrich-review-content.ts` | Page-time longform voice |
| `src/lib/review/review-longform.ts` | Section generators |
| `src/lib/review/can-publish.ts` | Publication gate |

## Definition of done

- Markdown + JSON reports exist under `reports/`
- User can see grade, word count, and actionable P0/P1 fixes per slug
- Optional: `--fail` exits non-zero when any review has P0 findings
