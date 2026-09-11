# Running Commerce QA

Generated: 2026-08-30

## Offers

- Active seed Offers: **62+** (flagship UK/US Ghost 18 + Novablast 6 US added this pass)
- Freshness band: recent (seed `lastChecked` within display window)
- Active affiliate programs: **0** (pending credentials — correct)

## Coverage (approximate after QA)

- NL: strongest (~40 products with Offers)
- UK / US: improved for flagships (Novablast 6, Ghost 18)
- DE: limited
- BE / FR / ZA: little or none

## Security / independence

- `/go/[offerId]` host allowlist + unpublished Product block
- Commerce independence regression tests pass
- Non-affiliate Offers remain visible

## Remaining

- Expand Offers for launch-core winners across DE/BE/FR/ZA
- Activate affiliate programs only with real env credentials
