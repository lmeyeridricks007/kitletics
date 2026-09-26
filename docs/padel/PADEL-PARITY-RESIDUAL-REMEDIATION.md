# Padel parity residual remediation

Remediation against `docs/padel/PADEL-RUNNING-PARITY-SIGNOFF.md` and `docs/padel/data/PADEL-RUNNING-PARITY-ISSUES.csv`.

**Does not declare** PDP / Review / Guide / Media / Overall parity PASS — independent audit decides that.

Commerce presentation and mobile were left untouched (already PASS).

## What was fixed

### A. Decision-copy composition (systemic)

| Before | After |
| --- | --- |
| `Players who carbon step-up…` / `Players who firm…` / finishing-power glue | Complete situations: `Players who need…` / `Players who prefer…` |
| `I'd shortlist it when: I'd shortlist it when…` in padel longform overview | Overview joins buy/avoid lines as-is (no re-prefix) |
| Classifier missed double stems and verb-less `Players who` | BROKEN patterns extended in `classify.ts` |

**Root files:** `src/lib/decision-copy/transform.ts`, `classify.ts`, `src/lib/review/padel-longform.ts`, soft-decision bag skip lines.

**Gate:** `KNOWN_BROKEN_DECISION_COPY = 0` (`docs/padel/data/PADEL-DECISION-COPY-QUALITY.csv`; scanner `scripts/tmp/scan-decision-copy-quality.ts`).

Novablast firm-ride skip now resolves to a complete person phrase (shared architecture fix; no broad Running rewrite).

### B. Review section visual storytelling

| Before | After |
| --- | --- |
| Prefs only covered construction/shape/power/spin | Broader topic prefs + round-robin leftover authentic gallery onto remaining major sections |
| Kuikma / Joma hero-stamped sections | Kuikma gallery 0→5; Joma gallery 0→2; section images distribute without hero stamp |
| Vertex unique section imgs effectively thin | Vertex / Hack / Indiga / Kuikma reviews: `uniqueSectionImgs=5`, `heroReuse=0` |

Still gallery-authentic only (no AI section art). Plans: `docs/padel/data/PADEL-REVIEW-MEDIA-PLANS.csv` (`REVIEW_MEDIA_PLAN_MISSING=0`).

Reviewed SKUs without authentic multi-angle remain **MEDIA_SOURCE_LIMITED** with evidence URLs in `PADEL-PDP-MEDIA-TAIL.csv` (not unresearched).

### C. PDP media / product identity

| SKU | Before → After |
| --- | --- |
| Frame Protector Uni | X3 pack shot → authentic Uni/TR single pouch; identity mismatch **0** |
| Kuikma PR Comfort Soft | 1 photo → gallery×5 (prior LIMITED overturned) |
| Joma T.Slam | 1 photo → gallery×2 |

Reports: `PADEL-MEDIA-IDENTITY-CHECK.csv`, `PADEL-PDP-MEDIA-TAIL.csv`.

### D. Guide heroes + teaching + copy

| Before | After |
| --- | --- |
| 25 slugs colliding on 4 shared assets (`hero.jpg`, grips, shoes, bag) | **0** unjustified collisions; 39/39 unique best heroes |
| `You are solving for … — not collecting marketing labels.` ×20 | Decision-facing intros per guide |
| Racket guide thin teaching | Wired shapes/balance/weight/decision diagrams |

Reports: `PADEL-GUIDE-HERO-UNIQUENESS.csv`, `PADEL-GUIDE-COPY-SIMILARITY.csv`.

Numbered heading textContent glue mitigated (`GuideNumberedHeading` inserts a space before title).

## Quality gates (remediation)

| Gate | Value |
| --- | --- |
| KNOWN_BROKEN_DECISION_COPY | **0** |
| KNOWN_PRODUCT_MEDIA_IDENTITY_MISMATCH | **0** |
| UNJUSTIFIED_GUIDE_HERO_COLLISIONS | **0** |
| REVIEW_MEDIA_PLAN_MISSING | **0** |
| BROKEN_GUIDE_NUMBER_HEADINGS | addressed in component |
| UNRESEARCHED_ONE_PHOTO_* | **0** (remaining one-photo reviewed SKUs are evidence-backed MEDIA_SOURCE_LIMITED) |

## LOCAL VALIDATION

| Step | Result |
| --- | --- |
| Lint | Pass (0 errors; pre-existing tmp-script warnings) |
| Types | Pass (`tsc --noEmit`) |
| Tests | Pass (101 files / 1023 tests) |
| Production build | Pass |

## VERCEL COST IMPACT

| Line | Impact |
| --- | --- |
| Build CPU | NEUTRAL |
| Fluid CPU | NEUTRAL |
| Origin Transfer | NEUTRAL (static media additions only) |
| ISR | NEUTRAL |
| Images | NEUTRAL→slightly HIGHER potential Image Optimization variants for new gallery files (authentic retailer CDN copies under `/images/padel/…`; no new hostnames) |
| Observability | NEUTRAL |

DEPLOYMENT REQUIRED: NO (until user says deploy)  
SAFE TO DEPLOY: YES (local lint/typecheck/test/build passed; do not push until asked)

## Intentionally unchanged

- Commerce architecture / presentation
- Mobile layout
- PDP chrome / scores / compare / Finder / catalog structure

## Evidence-backed SOURCE_LIMITED (not fabricated)

Several INDEXABLE reviewed shoes/rackets still have hero-only authentic media after research (e.g. Metalbone, Gravity Pro, Jet Premura, AT10 Lux). Documented in `PADEL-PDP-MEDIA-TAIL.csv` with source URLs — blank section columns preferred over hero stamps.

## Outputs

- `docs/padel/PADEL-PARITY-RESIDUAL-REMEDIATION.md` (this file)
- `docs/padel/data/PADEL-DECISION-COPY-QUALITY.csv`
- `docs/padel/data/PADEL-REVIEW-MEDIA-PLANS.csv`
- `docs/padel/data/PADEL-PDP-MEDIA-TAIL.csv`
- `docs/padel/data/PADEL-GUIDE-HERO-UNIQUENESS.csv`
- `docs/padel/data/PADEL-GUIDE-COPY-SIMILARITY.csv`
- `docs/padel/data/PADEL-MEDIA-IDENTITY-CHECK.csv`
