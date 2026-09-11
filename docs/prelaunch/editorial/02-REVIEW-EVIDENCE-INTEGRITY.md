# Review Evidence & Claim Integrity — Editorial 38

**Document ID:** `02-REVIEW-EVIDENCE-INTEGRITY`  
**Generated:** 2026-09-09T19:03:35.420Z  
**Mode:** AUDIT + FIX  
**Scope:** All live Reviews (590)

## Targets

| Target | Result |
|---|---|
| 0 unsupported first-hand claims | **PASS (0 residual mentions)** |
| Unsupported factual claims removed or sourced | Fixed **3** finding(s) across **1** review(s) |
| Contradictory numeric claims resolved to catalog | See CONTRADICTORY class below |
| Health/safety absolute claims softened | Included in soften pass |

## Claim classification totals

| Class | Count |
|---|---:|
| SUPPORTED | 334 |
| REASONABLE_EDITORIAL_JUDGMENT | 553 |
| NEEDS_SOURCE | 40 |
| UNSUPPORTED | 0 |
| CONTRADICTORY | 4 |

## By claim kind

| Kind | Findings |
|---|---:|
| fit | 544 |
| nutrition | 34 |
| weight | 10 |
| performance | 9 |

## Source hierarchy applied

1. Product `specifications` (manufacturer/catalog structured facts)  
2. Manufacturer evidence entities  
3. Independent / lab evidence  
4. Editorial research evidence  
5. Retailer specs (supporting only)

Low-quality single affiliate SEO sources were **not** used to support material claims.

## First-hand audit

- Patterns scanned: tested / we ran / we wore / our testing / hands-on / miles logged / we found during testing / personally tested / I ran / I wore / our miles / during our runs / we measured / wear-test / after N km  
- Negated methodology disclosures (e.g. “does not claim personal test sessions”) are allowed  
- Expert Research reviews without `personal-test` Evidence had affirmative first-hand phrasing rewritten  
- Fixes applied to unique-rewrite corpus when the review lives there: `src/content/reviews-unique-rewrite.json`

**Residual unsupported first-hand mentions after fix:** 0

_None._

## Health / safety

Stricter standard applied for injury / biomechanics / recovery / nutrition / health language. Absolute diagnosis/treatment phrasing was softened to non-clinical editorial framing. No treatment or diagnosis claims are retained as facts.

## Contradictory numeric claims

When review copy stated weight / drop / stack figures that disagreed with `product.specifications`, copy was aligned to the catalog value (manufacturer/spec hierarchy).

**Contradictory findings (pre/post):** 4  
**Auto-aligned:** 3

### Sample contradictory

- `tailwind-endurance-fuel` · nutrition · sodium claim 300 vs catalog 310 · fixed=false · `300mg sodium`
- `tailwind-endurance-fuel` · nutrition · Claim 300 vs catalog 310 for sodium · fixed=true · `300mg sodium`
- `tailwind-endurance-fuel` · nutrition · Claim 300 vs catalog 310 for sodium · fixed=true · `300mg sodium`
- `tailwind-endurance-fuel` · nutrition · Claim 300 vs catalog 310 for sodium · fixed=true · `300mg sodium`

## NEEDS_SOURCE samples

- `clif-bar-original` · nutrition · Numeric carbs=45 not present on product.specifications · `45g carbs`
- `clif-bloks-energy-chews` · nutrition · Numeric carbs=48 not present on product.specifications · `48g carbs`
- `enervit-c2-1-carbo-gel` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbs`
- `gu-energy-gel` · nutrition · Numeric carbs=22 not present on product.specifications · `22g carbs`
- `gu-roctane-gel` · nutrition · Numeric carbs=22 not present on product.specifications · `22g carbs`
- `honey-stinger-organic-energy-gel` · nutrition · Numeric carbs=24 not present on product.specifications · `24g carbs`
- `huma-gel-original` · nutrition · Numeric carbs=25 not present on product.specifications · `25g carbs`
- `maurten-drink-mix-160` · nutrition · Numeric carbs=40 not present on product.specifications · `40g carbs`
- `maurten-drink-mix-320` · weight · Numeric weight=80 not present on product.specifications · `80g`
- `maurten-drink-mix-320` · nutrition · Numeric carbs=80 not present on product.specifications · `80g carbs`
- `maurten-gel-100` · nutrition · Numeric carbs=25 not present on product.specifications · `25g carbs`
- `maurten-gel-100-caf-100` · nutrition · Numeric carbs=25 not present on product.specifications · `25g carb`
- `maurten-gel-100-caf-100` · nutrition · Numeric caffeine=100 not present on product.specifications · `100mg caffeine`
- `maurten-gel-160` · nutrition · Numeric carbs=40 not present on product.specifications · `40g carbs`
- `neversecond-c30-gel` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carb`
- `neversecond-c30-sports-drink` · weight · Numeric weight=90 not present on product.specifications · `90g`
- `neversecond-c30-sports-drink` · weight · Numeric weight=640 not present on product.specifications · `640g`
- `neversecond-c30-sports-drink` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carb`
- `neversecond-c30-sports-drink` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbs`
- `nuun-sport` · nutrition · Numeric carbs=4 not present on product.specifications · `4g carbs`
- `powerbar-energize` · nutrition · Numeric carbs=45 not present on product.specifications · `45g carbs`
- `precision-pf30-drink-mix` · weight · Numeric weight=80 not present on product.specifications · `80g`
- `precision-pf30-drink-mix` · nutrition · Numeric carbs=80 not present on product.specifications · `80g carbs`
- `precision-pf30-drink-mix` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbs`
- `precision-pf30-gel` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carb`
- `precision-pf30-gel` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbs`
- `sis-beta-fuel-drink` · weight · Numeric weight=80 not present on product.specifications · `80g`
- `sis-beta-fuel-drink` · nutrition · Numeric carbs=80 not present on product.specifications · `80g carbs`
- `sis-beta-fuel-gel` · nutrition · Numeric carbs=40 not present on product.specifications · `40g carbs`
- `sis-go-isotonic-gel` · nutrition · Numeric carbs=22 not present on product.specifications · `22g carbs`
- `skratch-sport-hydration-mix` · nutrition · Numeric carbs=21 not present on product.specifications · `21g carbs`
- `styrkr-gel30` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbs`
- `styrkr-gel30` · nutrition · Numeric carbs=30 not present on product.specifications · `30g carbohydrate`
- `styrkr-mix90` · weight · Numeric weight=90 not present on product.specifications · `90g`
- `styrkr-mix90` · nutrition · Numeric carbs=90 not present on product.specifications · `90g carbs`
- `tailwind-endurance-fuel` · nutrition · Numeric carbs=25 not present on product.specifications · `25g carbs`
- `tecnifibre-tfight-300s-2025` · weight · Numeric weight=300 not present on product.specifications · `300 g`
- `tecnifibre-wall-breaker-365` · weight · Numeric weight=365 not present on product.specifications · `365 g`
- `wilson-bela-pro-v2-2026` · weight · Numeric weight=365 not present on product.specifications · `365 g`
- `wilson-bela-pro-v2-2026` · weight · Numeric weight=375 not present on product.specifications · `375 g`

## NEEDS_SOURCE note

Most `NEEDS_SOURCE` rows are **nutrition carb/sodium/caffeine figures** stated in Expert Research copy where `product.specifications` lacks matching structured fields. Per failure policy we did **not** invent catalog specs to “support” them. Follow-up: add manufacturer nutrition facts to product specifications, then re-run this audit.

## UNSUPPORTED samples (excl. fixed first-hand noise)

_None._

## Reviews modified

- `tailwind-endurance-fuel`

## Machine data

- [`data/38-evidence-integrity.json`](data/38-evidence-integrity.json)

## Notes

- Editorial judgment (value, fit norms, role shortlists) remains allowed when worded as analysis — not as verified lab fact.  
- Catalog-only evidence (`ev-catalog-*`) can support specs/materials; it does **not** support absolute durability or first-hand feel claims.  
- Persistence of fixes: unique-rewrite JSON overwritten when those slugs changed. Curated wave1 / inline reviews that still contain issues are listed in residual / NEEDS_SOURCE for follow-up if they are not in the unique-rewrite corpus.

---

*Expert Research only unless personal-test Evidence exists.*
