# Review Coverage Report

Generated: 2026-09-05T10:04:08.307Z
Agent backfill: `npm run reviews:backfill`
Dry run: true

## Summary

| Metric | Count |
| --- | ---: |
| Total Products scanned | 716 |
| Published Products (approx) | 412 |
| Review-eligible (excl. fixtures/not-required) | 416 |
| Curated Reviews preserved | 19 |
| New Reviews synthesized | 397 |
| → status=published | 393 |
| → status=review (needs editorial / media) | 4 |
| Blocked / deferred entries | 4 |
| Skip not-required | 0 |
| Skip fixtures | 300 |

**Estimated ready published Reviews after merge:** 412

**Coverage (ready / eligible):** 99%

> Ready = published Review that can render on Product Detail. Products with `status=review` drafts are counted as needs-editorial / media-blocked — **not** fake 100% coverage.

## By review type (emitted + curated published)

| Type | Count |
| --- | ---: |
| expert-research | 416 |
| first-hand-test | 0 |
| hybrid | 0 |

No first-hand labels invented. Invalid first-hand audit: none found in catalog.

## Priority coverage

| Priority | Products | Ready published | Gap |
| --- | ---: | ---: | ---: |
| P0 | 386 | 383 | 3 |
| P1 | 0 | 0 | 0 |
| P2 | 23 | 22 | 1 |
| P3 | 7 | 7 | 0 |

## Category table

| Category | Products | Reviews | Ready | Blocked/Needs-review |
| --- | ---: | ---: | ---: | ---: |
| running-shoes | 83 | 83 | 83 | 0 |
| training-shoes | 48 | 48 | 44 | 4 |
| gps-watches | 33 | 33 | 33 | 0 |
| padel-rackets | 27 | 27 | 27 | 0 |
| padel-shoes | 23 | 23 | 23 | 0 |
| tennis-rackets | 20 | 20 | 20 | 0 |
| packs-vests | 19 | 19 | 19 | 0 |
| hrm | 15 | 15 | 15 | 0 |
| tennis-shoes | 14 | 14 | 14 | 0 |
| running-belts | 9 | 9 | 9 | 0 |
| adjustable-dumbbells | 8 | 8 | 8 | 0 |
| power-racks | 8 | 8 | 8 | 0 |
| weight-benches | 7 | 7 | 7 | 0 |
| hydration | 7 | 7 | 7 | 0 |
| headphones | 6 | 6 | 6 | 0 |
| air-bikes | 6 | 6 | 6 | 0 |
| treadmills | 6 | 6 | 6 | 0 |
| running-socks | 6 | 6 | 6 | 0 |
| lifting-accessories | 6 | 6 | 6 | 0 |
| rowing-machines | 6 | 6 | 6 | 0 |
| barbells | 6 | 6 | 6 | 0 |
| pull-up-bars | 6 | 6 | 6 | 0 |
| weight-plates | 5 | 5 | 5 | 0 |
| ski-ergs | 5 | 5 | 5 | 0 |
| kettlebells | 5 | 5 | 5 | 0 |
| recovery-gear | 5 | 5 | 5 | 0 |
| functional-fitness | 5 | 5 | 5 | 0 |
| running-clothing | 4 | 4 | 4 | 0 |
| running-lights | 3 | 3 | 3 | 0 |
| parallettes | 3 | 3 | 3 | 0 |
| weighted-vests | 3 | 3 | 3 | 0 |
| gymnastic-rings | 2 | 2 | 2 | 0 |
| gym-flooring | 2 | 2 | 2 | 0 |
| gym-storage | 2 | 2 | 2 | 0 |
| padel-balls | 1 | 1 | 1 | 0 |
| safety | 1 | 1 | 1 | 0 |
| padel-grips | 1 | 1 | 1 | 0 |

## Sport coverage

| Sport | Products | Ready |
| --- | ---: | ---: |
| running | 194 | 194 |
| training | 170 | 166 |
| hyrox | 66 | 64 |
| padel | 64 | 64 |
| tennis | 56 | 56 |
| cycling | 36 | 36 |
| swimming | 15 | 15 |
| calisthenics | 14 | 14 |
| recovery | 5 | 5 |

## P0/P1 gaps (not yet published-ready)

- **bear-komplex-valor** [P0] — repair: Thin Review repaired
- **nobull-trail** [P0] — repair: Thin Review repaired
- **zeraus-classic** [P0] — repair: Thin Review repaired

## Blockers / research backlog (sample)

- **bear-komplex-valor**: Authentic product media missing — Review staged as needs-review (status=review)
- **nobull-trail**: Authentic product media missing — Review staged as needs-review (status=review)
- **zeraus-classic**: Authentic product media missing — Review staged as needs-review (status=review)
- **domyos-mid-500**: Authentic product media missing — Review staged as needs-review (status=review)



## Notes

- Reviews are **Expert Research** only unless personal-test Evidence exists (none upgraded).
- Public internal terminology scrubbed at evidence presentation layer; Prompt sources rewritten in content.
- Authentic media required for `published`; missing media → `status=review` (needs Media pipeline).
- Do not treat Review JSON existence alone as success — see Ready column.

## Acceptance

Customer-facing buying assessment is available for published-ready Products via Product Detail Review + `/reviews/[slug]` when publication gate passes.
