# Image semantic remediation

Authentic photography is not the same as a correct image. A licensed padel racket is still wrong on a running-watch guide. A city skyline is still wrong as the primary image for GPS watches.

This workstream does **not** declare the overall site fixed.

## Root causes

1. **Padel as generic how-to-choose.** `/images/home/guide-how-to-choose.jpg` is a padel racket. It was the default fallback in best-guide resolution, search keyword maps (`/choose|how to/`), brand/discipline hubs, finder related cards, and GPS-watch methodology.
2. **Skyline as watch editorial.** `urban-dusk.jpg` was hardcoded on GPS category heroes, alternatives, comparisons, brand-hub watch guides, and uniqueness rematch (`DEDUPE_RESERVES`).
3. **Uniqueness rematch stole the wrong sport.** Hub dedupe assigned leftover padel/skyline files to colliding watch and gear cards.
4. **Card vs article divergence.** Homepage historically had an independent `GUIDE_IMAGES` map. Cards now share `resolveGuideImage` / `resolveSemanticImage` with the article.

## Canonical resolver

`src/lib/media/semantic-image/` understands page type, sport/category, entity slug, related products, and placement.

Priority: dedicated approved article image → related product photography in the same category → sport/category editorial pool → relevant neutral fallback.

**Never** cross-sport filler.

## Forensic baseline (production crawl)

| Class | Before |
| --- | ---: |
| WRONG_SPORT | 85 |
| WRONG_CONTENT_TYPE | 59 |
| DUPLICATE_PLACEHOLDER | 16 |
| WRONG_PRODUCT | 0 |
| WRONG_BRAND | 0 |
| UNKNOWN | 5223 |

## After (resolved public primaries)

Counts are **resolved hero/card/methodology images** for published buying guides, best guides, homepage, and the running sport hub. They are not a full HTML re-crawl of every `<img>` (related rails, logos, product grids).

| Class | After (all scanned) | After (indexable) | Target |
| --- | ---: | ---: | --- |
| WRONG_SPORT | 0 | 0 | 0 |
| WRONG_PRODUCT | 0 | 0 | 0 |
| WRONG_BRAND | 0 | 0 | 0 |
| WRONG_CONTENT_TYPE | 0 | 0 | 0 |
| DUPLICATE_PLACEHOLDER | 0 | 0 | reduce |
| UNKNOWN | 7 | 7 | human review |

UNKNOWN is **not** reclassified as CORRECT.

## High-reuse assets

Reuse is allowed when the file is still on-topic. Removed where it was semantically false.

- `/images/home/guide-running-shoes.jpg` — 20 scanned placements
- `/images/home/guide-home-gym.jpg` — 18 scanned placements
- `/images/clothing/products/patagonia-capilene-cool-daily-men-hero.jpg` — 13 scanned placements
- `/images/packs/products/black-diamond-distance-15-hero.jpg` — 9 scanned placements
- `/images/watches/guides/gps-open-sky-running.jpg` — 8 scanned placements
- `/images/training/guides/concepts/cross-training-shoe-gym.jpg` — 7 scanned placements
- `/images/watches/products/garmin-forerunner-970-hero.jpg` — 5 scanned placements
- `/images/running/best-hub/best-hrm-running.jpg` — 5 scanned placements
- `/images/running/accessories/therabody-theragun-mini-2-hero.jpg` — 4 scanned placements
- `/images/running/products/bondi-9-hero.jpg` — 3 scanned placements
- `/images/hrm/products/polar-h10-hero.png` — 3 scanned placements
- `/images/packs/products/salomon-adv-skin-12-hero.jpg` — 3 scanned placements

### Forensic high-reuse judgement

| File | Forensic URLs | Judgement |
| --- | ---: | --- |
| `running-urban.jpg` | 235 | Legitimate on the mixed **running sport hub** hero. Removed as primary for watches, packs, belts, hydration, and heavy-runner best cards. |
| `guide-how-to-choose.jpg` | 114 | **Padel only.** Removed as generic how-to-choose. |
| `daily-vs-long.jpg` | 98–99 | Shoe-guide reuse is legitimate; still **UNKNOWN** (pixels not independently verified). Not used on sunglasses. |
| `urban-dusk.jpg` | 92 | NYC skyline. Removed as watch/safety/headlamp/alternatives primary. |
| `review-research-assessment.jpg` | 84 | Review methodology still. Stays **UNKNOWN**. Not used as a watch/guide hero. |

## Remaining UNKNOWN (human review)

7 scanned placements have unverified filenames. Sample:

- /guides/how-to-choose-running-socks → `/images/running/accessories/feetures-elite-light-cushion-hero.jpg`
- /guides/first-marathon-gear-checklist → `/images/running/best-hub/best-marathon-running.jpg`
- /guides/recovery-sandals-for-runners → `/images/running/accessories/oofos-ooriginal-hero.jpg`
- /guides/anti-chafe-for-runners → `/images/running/accessories/body-glide-original-hero.png`
- /best/marathon-shoes → `/images/running/best-hub/best-marathon-running.jpg`
- /best/running-shoes-beginners → `/images/running/best-hub/best-beginners-running.jpg`
- /best/running-shoes-wide-feet → `/images/running/best-hub/best-wide-feet-running.jpg`

## Remaining DUPLICATE_PLACEHOLDER

_None in this scan._

## Remaining WRONG

Indexable scanned primaries: **WRONG_SPORT = 0, WRONG_PRODUCT = 0, WRONG_BRAND = 0, WRONG_CONTENT_TYPE = 0.**

## Code

- `src/lib/media/semantic-image/` — types, subject registry, resolver, classifier
- `src/lib/guides/resolve-guide-image.ts` — buying-guide cards/articles
- `src/lib/best/resolve-best-guide-image.ts` — topic-scoped uniqueness
- Hubs, search, finder, alternatives, comparison now call the same resolvers

Re-run: `npx tsx --tsconfig tsconfig.json scripts/image-semantic-remediation.ts`

## Visual QA

Playwright captures at 390 / 768 / 1440 for homepage, running-watch guide, Best running watches, `/running/watches`, sunglasses, safety, headphones, and the running hub. No `guide-how-to-choose.jpg` or `urban-dusk.jpg` leaked on those surfaces. Screenshots: `docs/remediation/data/image-semantic-visual/`.
