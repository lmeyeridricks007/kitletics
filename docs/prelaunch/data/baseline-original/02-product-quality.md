# Kitletics Pre-Launch Audit 02 — Product Quality & Depth

**Mode:** READ-ONLY forensic
**Generated:** 2026-09-06T14:00:52.101Z
**Audit clock:** 2026-09-06T12:00:00.000Z
**Machine-readable:** [`data/02-product-quality.json`](./data/02-product-quality.json)

> No fixes, generation, or backfill. Measurement of Product records and assembled Product Detail page signals only.

---

## Classification rules (exact)

### LAUNCH_READY

- productionExposed (published + publishedAt <= now + not noindex)
- identity + brand present
- description not missing
- real authentic media present
- specifications not missing
- Best For and Not Ideal For not missing
- Pros and Trade-offs not missing
- evidence not missing
- full or summary Review OR (Kitletics analysis + positioning)
- decisionScore >= 80
- no blocking missing/broken dims except allowed minors (family, guides, comparisons, offers, seo)
- at most 3 minor weak gaps

### NEEDS_MINOR_WORK

- productionExposed
- decisionScore >= 50
- media not missing
- identity present
- majorMissingCount === 0
- OR near-ready with <=2 blocking weak/missing dims and decisionScore >= 60

### THIN

- Basics present (identity + some media) but decisionScore typically 30–69
- OR many weak areas while page still partially answers questions
- Lacks depth in review/analysis/relationships even if specs/media exist

### INCOMPLETE

- majorMissingCount >= 2 OR missing real media OR missing description
- OR specifications missing with pros missing
- OR decisionScore low with incomplete core dims

### BLOCKED

- not productionExposed (draft/review/scheduled/archived or future publishedAt)
- OR noindex
- OR archived
- OR brand missing/broken
- OR broken review link

### decisionQuestions

- What is this?
- Who is it for?
- Who should avoid it?
- What does it do well?
- What are its weaknesses?
- How does it differ?
- What are alternatives?
- Can I compare it?
- Can I buy it?
- What evidence supports the assessment?

### decisionScore

10 points per answered decision question (max 100). Not a composite quality score for hiding gaps — used only for classification thresholds.

---

## Totals

| Scope | Count |
|---|---:|
| Products evaluated | 717 |
| Running-tagged | 438 |
| Running shoes | 84 |
| Page assembled via getProductPageData | 717 |

| Classification | All | Running | Shoes |
|---|---:|---:|---:|
| LAUNCH_READY | 312 | 280 | 83 |
| NEEDS_MINOR_WORK | 233 | 87 | 0 |
| THIN | 78 | 0 | 0 |
| INCOMPLETE | 0 | 0 | 0 |
| BLOCKED | 94 | 71 | 1 |

---

## 4. Running summary by category

| Category | Products | Launch Ready | Minor Work | Thin | Incomplete | Blocked | Ready % |
|---|---:|---:|---:|---:|---:|---:|---:|
| Running Shoes | 84 | 83 | 0 | 0 | 0 | 1 | 98.8 |
| GPS Watches | 33 | 33 | 0 | 0 | 0 | 0 | 100 |
| Heart Rate Monitors | 15 | 15 | 0 | 0 | 0 | 0 | 100 |
| Running Clothing | 72 | 13 | 44 | 0 | 0 | 15 | 18.1 |
| Running Socks | 14 | 10 | 0 | 0 | 0 | 4 | 71.4 |
| Hydration | 19 | 17 | 0 | 0 | 0 | 2 | 89.5 |
| Running Packs & Vests | 42 | 35 | 0 | 0 | 0 | 7 | 83.3 |
| Headphones | 17 | 11 | 0 | 0 | 0 | 6 | 64.7 |
| Sunglasses | 17 | 7 | 10 | 0 | 0 | 0 | 41.2 |
| Running Lights | 16 | 9 | 0 | 0 | 0 | 7 | 56.3 |
| Treadmills | 3 | 0 | 3 | 0 | 0 | 0 | 0 |
| Safety Gear | 14 | 6 | 0 | 0 | 0 | 8 | 42.9 |
| Running Belts | 14 | 13 | 1 | 0 | 0 | 0 | 92.9 |
| Recovery | 32 | 16 | 0 | 0 | 0 | 16 | 50 |
| Accessories | 8 | 3 | 0 | 0 | 0 | 5 | 37.5 |
| Nutrition & Fuel | 38 | 9 | 29 | 0 | 0 | 0 | 23.7 |

---

## 5. Running shoes — every product not LAUNCH_READY

Count: **1** / 84

| Product | Brand | Status | Missing/Weak Areas | Review Status | Media | Offers | Variant Issue | Evidence Issue | SEO Issue |
|---|---|---|---|---|---|---|---|---|---|
| ASICS Example Unpublished Trainer | ASICS | BLOCKED | family:missing; generation:weak; description:weak; positioning:missing; real_media:missing; specifications:weak; variant_data:weak; use_cases:missing; best_for:missing; not_ideal_for:missing; pros:missing; tradeoffs:missing; kitletics_analysis:missing; review:missing; evidence:missing; alternatives:missing; comparisons:missing; related_guides:missing; offers:missing; seo_metadata:broken; structured_data:weak | no_review | missing | no | missing_width:men; missing_width:women | no_evidence | missing_seoTitle; missing_seoDescription; noindex |

---

## 6. Representative page depth

### 5 strongest

- **ASICS Novablast 6** (`/products/asics-novablast-6`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=338 · review=full_review · media=real_correct · evidence=has_editorial · alts=6 · comps=4 · guides=14 · featuredSpecs=7 · positioning:weak, seo_metadata:weak
- **Ultimate Direction Fastpack 20** (`/products/ultimate-direction-fastpack-20`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=314 · review=full_review · media=real_correct · evidence=has_editorial · alts=6 · comps=3 · guides=2 · featuredSpecs=0 · few weak areas
- **FlipBelt Classic** (`/products/flipbelt-classic`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=300 · review=full_review · media=real_correct · evidence=has_editorial · alts=2 · comps=1 · guides=8 · featuredSpecs=0 · family:weak, description:weak
- **Patagonia Houdini Jacket (Men)** (`/products/patagonia-houdini-men`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=300 · review=full_review · media=real_correct · evidence=has_editorial · alts=2 · comps=1 · guides=5 · featuredSpecs=0 · few weak areas
- **Maurten Gel 100** (`/products/maurten-gel-100`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=296 · review=full_review · media=real_correct · evidence=has_editorial · alts=0 · comps=2 · guides=5 · featuredSpecs=0 · few weak areas

### 5 median

- **Osprey Dyna 6** (`/products/osprey-dyna-6`) — LAUNCH_READY, decisionScore=100
  - Why: class=LAUNCH_READY · decisionScore=100 · depthScore=242 · review=review_unlinked_from_product_field · media=real_correct · evidence=has_editorial · alts=0 · comps=1 · guides=0 · featuredSpecs=0 · positioning:weak, tradeoffs:weak, review:weak, related_guides:missing
- **ASICS GEL-Cumulus 27** (`/products/asics-gel-cumulus-27`) — LAUNCH_READY, decisionScore=90
  - Why: class=LAUNCH_READY · decisionScore=90 · depthScore=239 · review=review_unlinked_from_product_field · media=real_correct · evidence=has_editorial · alts=1 · comps=0 · guides=3 · featuredSpecs=7 · positioning:weak, kitletics_analysis:weak, review:weak, comparisons:missing
- **Suunto Run** (`/products/suunto-run`) — LAUNCH_READY, decisionScore=90
  - Why: class=LAUNCH_READY · decisionScore=90 · depthScore=239 · review=review_unlinked_from_product_field · media=real_correct · evidence=has_editorial · alts=1 · comps=0 · guides=3 · featuredSpecs=7 · positioning:weak, review:weak, comparisons:missing, seo_metadata:weak
- **Smartwool Run Targeted Cushion Crew** (`/products/smartwool-run-targeted-cushion`) — LAUNCH_READY, decisionScore=90
  - Why: class=LAUNCH_READY · decisionScore=90 · depthScore=234 · review=review_unlinked_from_product_field · media=real_correct · evidence=has_editorial · alts=0 · comps=0 · guides=1 · featuredSpecs=0 · positioning:weak, review:weak, comparisons:missing, seo_metadata:weak
- **Shokz OpenRun** (`/products/shokz-openrun`) — LAUNCH_READY, decisionScore=90
  - Why: class=LAUNCH_READY · decisionScore=90 · depthScore=232 · review=review_unlinked_from_product_field · media=real_correct · evidence=has_editorial · alts=0 · comps=0 · guides=1 · featuredSpecs=0 · positioning:weak, review:weak, comparisons:missing, seo_metadata:weak

### 5 weakest

- **ASICS Example Unpublished Trainer** (`/products/example-unpublished-trainer`) — BLOCKED, decisionScore=10
  - Why: class=BLOCKED · decisionScore=10 · depthScore=-36 · review=no_review · media=missing · evidence=none · alts=0 · comps=0 · guides=0 · featuredSpecs=0 · family:missing, generation:weak, description:weak, positioning:missing
- **Outdoor Research Ferrosi Thru Gaiters** (`/products/outdoor-research-ferrosi-gaiters`) — BLOCKED, decisionScore=80
  - Why: class=BLOCKED · decisionScore=80 · depthScore=60 · review=no_review · media=placeholder · evidence=has_editorial · alts=0 · comps=0 · guides=0 · featuredSpecs=0 · family:weak, positioning:weak, real_media:weak, kitletics_analysis:weak
- **HUAWEI FreeClip 2** (`/products/huawei-freeclip`) — BLOCKED, decisionScore=80
  - Why: class=BLOCKED · decisionScore=80 · depthScore=62 · review=no_review · media=placeholder · evidence=has_editorial · alts=0 · comps=0 · guides=0 · featuredSpecs=0 · family:weak, positioning:weak, real_media:weak, kitletics_analysis:weak
- **Sockwell Compression Light Cushion** (`/products/sockwell-compression-light-cushion`) — BLOCKED, decisionScore=80
  - Why: class=BLOCKED · decisionScore=80 · depthScore=66 · review=no_review · media=placeholder · evidence=has_editorial · alts=0 · comps=0 · guides=0 · featuredSpecs=0 · positioning:weak, real_media:weak, kitletics_analysis:weak, review:missing
- **Nathan QuickDraw Plus Handheld** (`/products/nathan-quickdraw-plus-handheld`) — BLOCKED, decisionScore=80
  - Why: class=BLOCKED · decisionScore=80 · depthScore=66 · review=no_review · media=placeholder · evidence=has_editorial · alts=0 · comps=0 · guides=0 · featuredSpecs=0 · positioning:weak, real_media:weak, kitletics_analysis:weak, review:missing

---

## 7. Template vs unique value

Normalized identical copy groups (≥3 products, product/brand/generation stripped): **37**

Generic AI-style phrase hits: **0**

### Top repeated copy groups

- **strengths** ×15: `strong value`
  - Garmin Forerunner 255: “Strong value”
  - ASICS GT-1000 13: “Strong value”
  - Goodr OGs: “Strong value”
- **strengths** ×9: `durable outsole`
  - Brooks Cascadia 18: “Durable outsole”
  - New Balance Fresh Foam X Hierro v9: “Durable outsole”
  - ASICS Gel-Dedicate 8 Padel: “Durable outsole”
- **strengths** ×5: `beginner friendly`
  - Brooks Ghost 16: “Beginner-friendly”
  - Brooks Ghost 18: “Beginner-friendly”
  - LOK Padel One: “Beginner friendly”
- **strengths** ×5: `stable platform`
  - Bullpadel Ionic Woman: “Stable platform”
  - Nox AT10 Pro: “Stable platform”
  - ASICS Gel-Challenger 15: “Stable platform”
- **strengths** ×4: `wide toe box`
  - Topo Athletic Terraventure 5: “Wide toe box”
  - Altra Paradigm 7: “Wide toe box”
  - Altra Experience Flow: “Wide toe box”
- **strengths** ×4: `women s last`
  - Bullpadel Ionic Woman: “Women’s last”
  - Joma Slam Lady: “Women’s last”
  - Siux Comodo Woman: “Women’s last”
- **strengths** ×4: `accessible price`
  - LOK Padel One: “Accessible price”
  - Prince T22: “Accessible price”
  - Domyos Mid 500: “Accessible price”
- **strengths** ×4: `accessible power`
  - Babolat Pure Drive 2025: “Accessible power”
  - Head Extreme Pro Pickleball: “Accessible power”
  - Dunlop Sonic Core Revelation Pro: “Accessible power”
- **strengths** ×4: `light weight`
  - Babolat Jet Tere: “Light weight”
  - Wilson Kaos Rapide 3.0: “Light weight”
  - Babolat Jet Mach 3: “Light weight”
- **strengths** ×3: `wide options`
  - ASICS GEL-Nimbus 27: “Wide options”
  - New Balance FuelCell Rebel v4: “Wide options”
  - New Balance FuelCell Rebel v5: “Wide options”
- **strengths** ×3: `widely available`
  - Nike Pegasus 41: “Widely available”
  - Nike Pegasus 42: “Widely available”
  - Bowflex SelectTech 552: “Widely available”
- **strengths** ×3: `excellent width range`
  - Brooks Ghost 16: “Excellent width range”
  - Brooks Ghost 18: “Excellent width range”
  - New Balance Fresh Foam X 1080 v14: “Excellent width range”
- **strengths** ×3: `light for the stack`
  - HOKA Clifton 9: “Light for the stack”
  - ASICS Novablast 6: “Light for the stack”
  - HOKA Clifton 10: “Light for the stack”
- **strengths** ×3: `approachable price`
  - Garmin Forerunner 165: “Approachable price”
  - ASICS Gel-Dedicate 8 Padel: “Approachable price”
  - Babolat Jet Tere: “Approachable price”
- **strengths** ×3: `lateral support`
  - Adidas Courtquick Padel: “Lateral support”
  - Siux Diablo Pro: “Lateral support”
  - Bullpadel Hack Hybrid: “Lateral support”

### Generic phrase examples


---

## 8. Spec completeness

### Running shoes (requested keys)

| Spec | Present | Total | % |
|---|---:|---:|---:|
| weight | 83 | 84 | 98.8 |
| heelStack | 83 | 84 | 98.8 |
| forefootStack | 83 | 84 | 98.8 |
| drop | 83 | 84 | 98.8 |
| cushionLevel | 83 | 84 | 98.8 |
| stability | 83 | 84 | 98.8 |
| plate | 83 | 84 | 98.8 |
| plateMaterial | 83 | 84 | 98.8 |
| terrain | 83 | 84 | 98.8 |
| widthOptions | 77 | 84 | 91.7 |
| widths | 0 | 84 | 0 |
| outsole | 76 | 84 | 90.5 |
| midsole | 76 | 84 | 90.5 |
| upper | 76 | 84 | 90.5 |
| weight_plus_reference_size | 83 | 84 | 98.8 |
| variants | 84 | 84 | 100 |
| use_cases | 83 | 84 | 98.8 |
| widths_product_or_variant | 77 | 84 | 91.7 |

### Important specs by category (required + featured)

#### Running Shoes (n=84)

| Key | Present | % |
|---|---:|---:|
| drop | 83 | 98.8 |
| cushionLevel | 83 | 98.8 |
| stability | 83 | 98.8 |
| terrain | 83 | 98.8 |
| plateMaterial | 83 | 98.8 |
| weight | 83 | 98.8 |
| heelStack | 83 | 98.8 |
| plate | 83 | 98.8 |

#### GPS Watches (n=33)

| Key | Present | % |
|---|---:|---:|
| displayType | 33 | 100 |
| multiBandGps | 33 | 100 |
| heartRate | 33 | 100 |
| weight | 21 | 63.6 |
| batteryGps | 21 | 63.6 |
| batterySmartwatch | 21 | 63.6 |
| maps | 33 | 100 |

#### Heart Rate Monitors (n=15)

| Key | Present | % |
|---|---:|---:|
| type | 15 | 100 |
| connectivity | 15 | 100 |

#### Running Clothing (n=72)

| Key | Present | % |
|---|---:|---:|
| fit | 68 | 94.4 |

#### Running Socks (n=14)

| Key | Present | % |
|---|---:|---:|
| height | 14 | 100 |

#### Hydration (n=19)

| Key | Present | % |
|---|---:|---:|
| type | 19 | 100 |

#### Running Packs & Vests (n=42)

| Key | Present | % |
|---|---:|---:|
| raceSuitability | 42 | 100 |

#### Headphones (n=17)

| Key | Present | % |
|---|---:|---:|
| type | 17 | 100 |

#### Sunglasses (n=17)

| Key | Present | % |
|---|---:|---:|
| lensType | 17 | 100 |

#### Running Lights (n=16)

| Key | Present | % |
|---|---:|---:|
| lumens | 16 | 100 |

#### Safety Gear (n=14)

| Key | Present | % |
|---|---:|---:|
| type | 14 | 100 |

#### Running Belts (n=14)

| Key | Present | % |
|---|---:|---:|
| phoneCompatible | 14 | 100 |

#### Recovery (n=32)

| Key | Present | % |
|---|---:|---:|
| type | 32 | 100 |

#### Accessories (n=8)

| Key | Present | % |
|---|---:|---:|
| type | 8 | 100 |

---

## 9. Variant quality

### Running shoes

| Metric | Count |
|---|---:|
| Products | 84 |
| With men | 80 |
| With women | 80 |
| With unisex | 4 |

Issue counts:

- `missing_width`: 14

_ProductVariant schema has no media fields — variant-specific media mismatch cannot be stored; only product-level media evaluated._

---

## 10. Media quality

| Class | All | Running | Shoes |
|---|---:|---:|---:|
| real_correct | 620 | 363 | 83 |
| missing | 1 | 1 | 1 |
| placeholder | 92 | 70 | 0 |
| suspected_wrong_generation | 1 | 1 | 0 |
| low_quality | 3 | 3 | 0 |

---

## 11. Evidence

| Metric | All | Running | Shoes |
|---|---:|---:|---:|
| With evidence | 692 | 437 | 83 |
| Without evidence | 25 | 1 | 1 |
| Manufacturer-only | 89 | 5 | 0 |
| Independent / mixed / personal | 0 | 0 | 0 |
| Personal test | 0 | — | — |
| Strengths without evidence | 24 | — | — |

_Evidence quality judged only by typed Evidence records linked via product.evidenceIds. Source reputation not externally verified._

---

## 12. Review relationship

| Status | All | Running | Shoes |
|---|---:|---:|---:|
| full_review | 151 | 151 | 30 |
| review_unlinked_from_product_field | 355 | 133 | 52 |
| summary_only | 1 | 1 | 1 |
| no_review | 210 | 153 | 1 |

Reviews whose productId has no Product record: **0**

---

## 13. Alternatives / relationships

### Running

| Gap | Count |
|---|---:|
| No alternatives | 7 |
| No competitors | 308 |
| No family | 68 |
| No comparisons | 323 |
| No relationships at all | 254 |

### Running shoes

| Gap | Count |
|---|---:|
| No alternatives | 27 |
| No competitors | 29 |
| No family | 25 |
| No comparisons | 68 |

---

## 14. Public language audit

Total pattern hits: **45**

| Pattern | Hits |
|---|---:|
| internal IDs | 35 |
| confidence | 10 |

### Sample hits (first 40)

- [internal IDs] On Ultra Vest Pro · strengths[1] · product_record: “Premium On fit/finish for brand-loyal trail runners”
- [internal IDs] HydraPak Shape-Shift 1.5L · strengths[1] · product_record: “Brand-agnostic fit for many race/adventure vests”
- [internal IDs] Ultimate Direction Body Bottle 500 · shortDescription · product_record: “e Direction front sleeves when you want brand-matched spares for Race Vest and Adventure Vest setups.”
- [internal IDs] Nathan SoftFlask 18oz · shortDescription · product_record: “n SoftFlask for vest and belt sleeves — brand-matched spare for VaporAir / Pinnacle runners who prefer Nathan flasks ove”
- [internal IDs] Nathan SoftFlask 18oz · verdict · product_record: “n softflask for vest and belt sleeves — brand-matched spare for vap matches most of your week. It earns a look for Natha”
- [internal IDs] Salomon Soft Reservoir 1.5L · verdict · product_record: “ most of your week. It earns a look for Brand-matched bladder for Salomon vest sleeve geometry. Look elsewhere if Cleani”
- [internal IDs] Salomon Soft Reservoir 1.5L · strengths[0] · product_record: “Brand-matched bladder for Salomon vest sleeve geometry”
- [internal IDs] LEKI Trail Running Quiver · shortDescription · product_record: “ck stow/deploy on climbs and descends — brand-agnostic add-on when your vest’s built-in pole loops are slow or overloade”
- [internal IDs] Ultimate Direction Utility Bag · verdict · product_record: “umping vest size. Skip it if you need a brand-agnostic stash pouch.”
- [confidence] Beats Fit Pro · verdict · product_record: “ip it if you need Powerbeats Pro 2 hook confidence or longer battery.”
- [confidence] Beats Fit Pro · weaknesses[0] · product_record: “Shorter battery and less hook confidence than Powerbeats Pro 2”
- [internal IDs] OOFOS OOcandoo · weaknesses[1] · product_record: “Fit runs brand-specific — try before racing in them”
- [internal IDs] CEP The Run Calf Sleeves · shortDescription · product_record: “y prevention. (Distinct from gear-wave1 prod-cep-calf-sleeves 3.0.)”
- [internal IDs] Compressport R2 Calf Sleeves · weaknesses[0] · product_record: “Compression feel is brand-specific vs CEP”
- [internal IDs] Wilson Bela Pro Padel · shortDescription · product_record: “el shoe for competitive players wanting brand-matched court footwear.”
- [internal IDs] Nox AT10 Pro · shortDescription · product_record: “formance padel shoe for players wanting brand-matched footwear with a stable court base.”
- [internal IDs] Tecnifibre Wall Shooter · shortDescription · product_record: “re padel court shoe for players wanting brand-matched footwear with durable court rubber.”
- [internal IDs] Polar H10 · review.sections[4].body · review: “ is where the H10 earns its keep versus brand-locked straps.  Dual Bluetooth means you can feed a watch and a phone/trai”
- [confidence] ASICS Novablast 6 · review.sections[2].body · review: “from Novablast 5. That targets wet-road confidence for daily asphalt and treadmill use — not aggressive trail lugs. Tech”
- [confidence] Beats Fit Pro · review.summary · review: “pause if you need Powerbeats Pro 2 hook confidence or longer battery shows up often in your week.”
- [confidence] Beats Fit Pro · review.verdict · review: “where if you need Powerbeats Pro 2 hook confidence or longer battery.”
- [confidence] Beats Fit Pro · review.bottomLine · review: “pause if you need Powerbeats Pro 2 hook confidence or longer battery shows up often in your week.”
- [confidence] Beats Fit Pro · review.sections[0].body · review: “pause if you need Powerbeats Pro 2 hook confidence or longer battery would show up often in your week.  Bottom line: Ear”
- [confidence] Beats Fit Pro · review.sections[3].body · review: “o weigh:  • Shorter battery / less hook confidence than Powerbeats Pro 2 • IPX4 splash only • Aging vs newest Powerbeats”
- [confidence] Beats Fit Pro · review.sections[4].body · review: “to avoid you need Powerbeats Pro 2 hook confidence or longer battery — forcing the Beats Fit Pro into that job usually d”
- [confidence] Beats Fit Pro · review.sections[5].body · review: “ccepting you need Powerbeats Pro 2 hook confidence or longer battery — fine when that is not your weekly mix.  Check liv”
- [internal IDs] Ultimate Direction Body Bottle 500 · review.summary · review: “e Direction front sleeves when you want brand-matched spares for Rac I'd shortlist it when you want Matches UD Race Vest”
- [internal IDs] Ultimate Direction Body Bottle 500 · review.bottomLine · review: “e Direction front sleeves when you want brand-matched spares for Rac I'd shortlist it when you want Matches UD Race Vest”
- [internal IDs] Ultimate Direction Body Bottle 500 · review.sections[0].body · review: “e Direction front sleeves when you want brand-matched spares for Rac  Body Bottle 500 is built for a specific job — use ”
- [internal IDs] Nathan SoftFlask 18oz · review.summary · review: “n SoftFlask for vest and belt sleeves — brand-matched spare for VaporAir / Pinnacle runners who prefer Nathan flasks ove”
- [internal IDs] Nathan SoftFlask 18oz · review.bottomLine · review: “n SoftFlask for vest and belt sleeves — brand-matched spare for VaporAir / Pinnacle runners who prefer Nathan flasks ove”
- [internal IDs] Nathan SoftFlask 18oz · review.sections[0].body · review: “n SoftFlask for vest and belt sleeves — brand-matched spare for VaporAir / Pinnacle runners who prefer Nathan flasks ove”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.summary · review: “ft Flask I'd shortlist it when you want Brand-matched bladder for Salomon vest sleeve geometry. I'd pause if Cleaning ov”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.verdict · review: “ for every session. It earns a look for Brand-matched bladder for Salomon vest sleeve geometry. Look elsewhere if Cleani”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.bottomLine · review: “ft Flask I'd shortlist it when you want Brand-matched bladder for Salomon vest sleeve geometry. I'd pause if Cleaning ov”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.sections[0].body · review: “filter.  I'd shortlist it when you want Brand-matched bladder for Salomon vest sleeve geometry.  I'd pause if Cleaning o”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.sections[2].body · review: “What it does well • Brand-matched bladder for Salomon vest sleeve geometry • 1.5L covers most long t”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.sections[4].body · review: “Best when • You want Brand-matched bladder for Salomon vest sleeve geometry as a weekly priority — th”
- [internal IDs] Salomon Soft Reservoir 1.5L · review.sections[5].body · review: “You are mainly paying for Brand-matched bladder for Salomon vest sleeve geometry. You are also accepting C”
- [internal IDs] On Ultra Vest Pro · review.verdict · review: “tain races or premium On fit/finish for brand-loyal trail runners. Look elsewhere if overkill for road longs and short t”

_Hits include legitimate uses (e.g. 'confidence' in evidence prose). Reviewer should inspect samples. Internal ID pattern may match intentional URL slugs containing prod- prefixes — verify context._

---

## 15. Indexation evidence (no decision)

This audit does **not** decide Day-1 indexation. Evidence for an external reviewer:

| Evidence | Count |
|---|---:|
| All products LAUNCH_READY | 312 |
| All products production-exposed & LAUNCH_READY | 312 |
| All products production-exposed & not LAUNCH_READY | 311 |
| Running LAUNCH_READY | 280 |
| Running production-exposed & LAUNCH_READY | 280 |
| Running production-exposed & not LAUNCH_READY | 87 |
| Running shoes LAUNCH_READY | 83 |
| Running shoes NEEDS_MINOR_WORK | 0 |
| Running shoes THIN | 0 |
| Running shoes INCOMPLETE | 0 |
| Running shoes BLOCKED | 1 |

Questions left to the external reviewer:

1. Should all Product pages be indexed on Day 1?
2. Should only a subset be indexed?
3. Which subset? (see JSON `indexationEvidence.shoeLaunchReadyIds` and per-product `classification` / `productionExposed`)

---

## End of baseline

No fixes recommended here. Measurement only.
