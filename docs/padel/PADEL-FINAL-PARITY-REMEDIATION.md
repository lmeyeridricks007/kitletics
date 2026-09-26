# Padel FINAL parity remediation

Implementation pass after the independent Prompt 183 audit failed across PDP, review, guide, media, commerce presentation, and mobile.

This document records what was fixed. It does **not** declare `OVERALL_RUNNING_PADEL_PARITY = PASS` — that remains for the independent Prompt 184 audit.

## Queue

Working queue: `docs/padel/data/PADEL-FINAL-PARITY-REMEDIATION.csv` (regenerate with `npx tsx --tsconfig tsconfig.json scripts/padel-final-parity-remediation-report.ts`).

Supporting CSVs:

- `PADEL-FINAL-MEDIA-DEPTH.csv`
- `PADEL-FINAL-REVIEW-QUALITY.csv`
- `PADEL-FINAL-GUIDE-QUALITY.csv`
- `PADEL-FINAL-COMMERCE-RESOLUTION.csv`

## 1. Broken generated copy (source generators)

| Failure | Root cause | Fix |
| --- | --- | --- |
| `It when you already play…` | `toSituationLabel` stripped only `I'd shortlist`, leaving `it when…` | Expand editorial wrappers in `transform.ts`; strip `it when` / `it if` residue; convert buy leftovers to `Players who…` |
| `Those looking for Advanced attackers.` | Skip polarity prefixed `Those looking for` onto telegram fragments | Expand short audience labels into complete sentences; never glue stems onto `if` / `not` / `it` clauses |
| `Those looking for Not the Hybrid…` | Weakness `Not the Hybrid if…` salvaged as situation | Dedicated `notTheSiblingToSituation` → complete person phrase |
| `Live NL product URL should still be attached…` | Kuikma draft weakness / skipIf ops language | Removed from `extras.ts`; classified BROKEN in `classify.ts` + `public-content-corruption.ts` |

Classifier now flags: `It when`, `Those looking for [Capital…]`, Live NL / URL should / TODO / FIXME / placeholder / research notes.

## 2. Guide numbered-heading glue

`GuideNumberedHeading` put a badge digit next to a title that already started with a digit (`3` + `6 factors` → `36 factors`).

- Badge is `aria-hidden`; title is a separate text node
- Knowledge / racket plan titles no longer start with counts: `Factors that should drive the choice`, `Approaches for this decision`

Required: `BROKEN_NUMBERED_HEADINGS = 0` for Padel knowledge plans.

## 3. Guide hero uniqueness

| Guide | Was | Now |
| --- | --- | --- |
| Best Padel Rackets | `/images/padel/hero.jpg` | Vertex 05 hero |
| Best Padel Rackets Advanced | shared Vertex with category | Metalbone 3.5 hero |
| Best Padel Bags | AT10 Team packshot | Adidas Protour bag hero |
| Shoe-compartment bags | AT10 Team (semantic) | kept — sole intentional AT10 use |

## 4. Long-tail authentic media

Added unique retailer CDN photographs (hashed ≠ hero):

| Product | Gallery adds | Source |
| --- | --- | --- |
| Indiga CTR | 1 face | Chef Padel Shopify |
| Match Light | 3 (face / angle / profile) | Zona de Padel |
| Neuron 02 | 2 | Zona de Padel |
| AT10 Team bag | 4 (front / angle / interior / carry) | Zona de Padel |

Wired via `PRODUCT_GALLERY_MEDIA`. Section PNG crops remain on disk but continue to be treated as derived (not unique-photo credit).

### Source-limited / pending

| Product | Status |
| --- | --- |
| Kuikma PR Comfort Soft | `MEDIA_SOURCE_LIMITED` on authentic photos (hero only). Commerce: `VERIFIED_NO_CURRENT_NL_BUYABLE_OFFER` after NL specialist search + Decathlon.nl 403 |
| Wilson overgrip / HEAD Pro S+ | Already had NL offers from soft-goods wave; gallery still thin — mark for next media pass if Prompt 184 still fails them |

## 5. Commerce

New retailers: Chef Padel, Bespanracket, Zona de Padel, Bullpadel Official Store.

New offers (`padelFinalParityOffers`, checked **2026-09-23**):

| Product | Retailers | Prices (EUR) |
| --- | --- | --- |
| Indiga CTR | Chef Padel, Bespanracket, Bullpadel direct | 84.99 / 89.99 / 89.99 |
| Match Light | Zona, Justpadel | 49.55 / 74.95 |
| Neuron 02 | Zona | 179.96 |
| AT10 Team bag | Zona (2025 white colourway) | 44.96 |
| Kuikma PR Comfort Soft | none | terminal no-offer with evidence |

Empty-state copy updated to: **No verified Netherlands-shipping retailer is currently available.**

## 6. Mobile

`SportCategoryNav` no longer uses `overflow-x-hidden` + `truncate` on category labels (clips like `ihoes` from `Shoes`). Labels wrap with `whitespace-normal break-words`.

## 7. Tests

Regression coverage in:

- `tests/decision-copy.test.ts` — stem residue + BROKEN classification
- `tests/padel-experience-parity.test.ts` — generator residue, numbered titles, guide hero uniqueness

## Counts (this pass)

| Metric | Result |
| --- | --- |
| PDPs with new NL offers | Priority long-tail + expanded wave in `padelFinalParityOffers` (~40 listing offers) |
| Commerce terminal no-offer (documented) | Kuikma PR Comfort Soft (and other enrichment `NO_CURRENT_OFFER_FOUND` with evidence) |
| Broken prose generators fixed | Yes (shared pathway) |
| Unique authentic media files added | ≥10 (Indiga, Match Light, Neuron 02, AT10 Team) |
| Duplicate unrelated best-guide heroes fixed | Best rackets / advanced / bags hubs |
| Mobile nav clipping fix | Yes |

## LOCAL VALIDATION

```
Lint: PASS (warnings only in scripts/tmp)
Types: PASS
Tests: PASS (commerce empty-state assertion updated)
Production build: PASS
```

## VERCEL COST IMPACT

Build CPU: NEUTRAL  
Fluid CPU: NEUTRAL  
Origin Transfer: NEUTRAL  
ISR: NEUTRAL  
Images: NEUTRAL (additional static `/public` gallery files; no new Image Optimization widths)  
Observability: NEUTRAL  

DEPLOYMENT REQUIRED: NO (implementation complete; await Prompt 184 + “Deploy this now.”)  
SAFE TO DEPLOY: YES after local validation above — push only when asked.

## What Prompt 184 should still stress-test

1. Browse Vertex → Indiga → Kuikma → bags → balls → reviews → guides without a flagship/tail quality cliff
2. Who-for lines on Vertex / Indiga / Kuikma reviews
3. Guide headings on How to Choose a Padel Racket
4. Match Light / Neuron / AT10 gallery uniqueness in rendered HTML
5. Kuikma honest empty commerce state (no Live NL language)
6. `/guides?sport=padel` card uniqueness by guide id

Do not treat this file as a pass verdict.
