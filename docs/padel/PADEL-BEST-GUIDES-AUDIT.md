# Padel Best Guides audit

**As of:** 2026-09-13  
**Method:** handwritten estate in `src/content/padel/best-guides/`, merged through `src/content/best-guides.ts`. Quality: `assessBestGuideLaunchQuality` with `isDev: true`. Inventory helper: `scripts/tmp/padel-best-guides-audit.ts`.

Padel remains **vertical-disabled** (`verticalLaunchStrategy.sports.padel.mode = "disabled"`). Editorial `LAUNCH_READY` is not INDEXABLE. Production deep URLs stay `HIDDEN_404` until enablement.

Kitletics has **not** physically tested these products. Rankings are expert-research role awards from published specs, manufacturer jobs, and authentic heroes. Affiliate commission does not rank considered, shortlisted, recommended, rank, or award.

---

## Headline

| Metric | Count |
| --- | ---: |
| **Guides created** | **18** |
| **LAUNCH_READY** | **18** |
| **NEEDS_MINOR_WORK** | **0** |
| **THIN / BLOCKED** | **0** |
| **Requested pages skipped** | **2** |
| Machine-template copy | **0** |
| Uniqueness-era P2 overlay on padel | **retired** (`sport-padel` skipped in `applyBestGuideP2VerticalLaunchReadyEnrichment`) |

Winner counts are not hardcoded. Each page awards the roles the catalog can actually support.

---

## Created

### Rackets (11)

| Slug | Job | Recommended (roles, not a top-10) |
| --- | --- | --- |
| `padel-rackets` | Category role map | Vertex 05, Indiga CTR, ML10 Pro Cup, Hack 04, Vertex 05 Hybrid, PR Comfort Soft, Metalbone **3.5** |
| `padel-rackets-beginners` | Forgiveness / first contact | Indiga CTR, Comfort Soft, Equation Soft, Match Light |
| `padel-rackets-intermediate` | Hybrid/teardrop step-up | Ionic Light, PR Hybrid Carbon, Air Veron, Coello Team, Vertex Advance |
| `padel-rackets-advanced` | Timing already exists | Vertex 05, AT10 Genius 18K, Gravity Pro, Diablo, Hack 04 Hybrid |
| `padel-rackets-control` | Placement / defence | ML10, Gravity Pro, Equation Soft, Blade Pro, Counter Viper |
| `padel-rackets-power` | Smash / attack diamonds | Hack 04, Metalbone 3.5, Technical Viper, Coello Pro, Attack **18K** |
| `padel-rackets-all-round` | Hybrid/teardrop all-court | Vertex 05 Hybrid, AT10 12K, AT10 18K, Diablo, Speed Pro |
| `padel-rackets-lightweight` | Published ≤~360 g **and** handling | One Ultralight, Vertex 05 W, Ionic Light, Air Veron |
| `padel-rackets-comfort` | Soft core / comfort faces | Comfort Soft, Equation Soft, Indiga, Hack 04 Comfort, Coello Team |
| `padel-rackets-maneuverability` | Light / Motion / Air lines | Ionic Light, Air Viper, Coello Motion, Gravity Motion, Extreme Motion |
| `padel-rackets-women` | Women’s **line**, not “light” | **Vertex 05 W**, **Ionic Light** (`intentionallyNarrow`) |

Every racket rec includes why we picked it, best for, trade-off, who should choose something else, key specs (from catalog), and relevant alternatives.

### Shoes (5)

| Slug | Job | Recommended |
| --- | --- | --- |
| `padel-shoes` | Padel court shoes | Resolution, Courtquick (`prod-adidas-courtstabil`), T.Slam, Crazyquick Boost, Jet Premura, PS 990 |
| `padel-shoes-men` | `genderFit` men | Courtquick, Crazyquick M, T.Slam, Jet Premura, Sprint Pro 4 |
| `padel-shoes-women` | `genderFit` women | Courtquick W, Crazyquick W, Resolution W, Slam Lady, Sensa, Ionic Woman |
| `padel-shoes-stability` | High lateral listing | Resolution, T.Slam, Courtquick, AT10 Lux |
| `padel-shoes-comfort` | Plush / high cushion | Crazyquick Boost, Resolution, AT10 Lux |

### Other (2)

| Slug | Job | Recommended |
| --- | --- | --- |
| `padel-overgrips` | Tack vs absorption | Wilson Pro, Bullpadel HaC (`intentionallyNarrow`) |
| `padel-bags` | Distinct carry jobs | Nox AT10 Team (42 L paletero), Babolat RH Pro (62 L), Tecnifibre Tour Endurance backpack |

---

## Skipped (catalog cannot support a useful page)

| Requested page | Why skipped |
| --- | --- |
| **Best Padel Shoes for Wide Feet** | No `widthOptions` on padel shoes. T.Slam is explicitly noted **narrow**. Fabricating a wide-last shortlist would be dishonest. |
| **Best Padel Balls** | Only two published cans with authentic heroes (HEAD Pro S+, Kuikma Speed), both `speed: fast`. PB Control is **draft**. A ranked “best balls” page would be a two-item fake with no speed/control distinction. |

---

## Wrong-job leftovers retired

The old seed + uniqueness P2 overlay for `padel-rackets` is no longer applied.

| Old award | Why it was wrong | Where it lives now |
| --- | --- | --- |
| Siux Diablo as beginner / maneuverability | Advanced teardrop | Advanced + all-round; **rejected** on beginners |
| AT10 Genius **12K** as premium attack diamond | Teardrop **Genius**, not Attack | All-round firmer Genius |
| Counter Viper as vague “best control” | Real job is counter/transition | Control guide, named as Counter not Technical |
| Coello Pro as best value / beginner | Professional diamond | Power + advanced; Team/Motion are the step-downs |
| Metalbone **HRD** / **3.3** as current | 3.3 is previous-gen; HRD+ is High Memory | Category/power award is **Metalbone 3.5** |
| Attack **12K** | Photo-blocked draft | Power award is **Attack 18K** |
| HEAD Revolt Pro court as a padel shoe | Tennis crossover | Considered, **rejected** as a padel default |

---

## Women’s rackets — selection criteria (not “buy light”)

1. **Manufacturer women’s line or official women/intermediate segment** — Vertex 05 W (Delfi Brea Vertex) and Ionic Light (Next line listed women / intermediate).
2. **Published differences versus the men’s sibling** — Vertex 05 W is Fibrix, 350–360 g, medium balance; men’s Vertex 05 is 12K at 365–375 g.
3. **Level still applies** — Vertex 05 W is still an advanced diamond. A woman beginner still wants Indiga / Comfort Soft (beginner rounds for anyone), not a downsized Vertex.

**Rejected as women’s awards:** One Ultralight (300 g adult Head, not a women’s last), men’s Vertex 05, Comfort Soft, Siux Comodo Woman (no awardable last/hero story).

Two recommendations is **intentional**. The catalog does not support a fake third women’s product.

---

## Methodology (every page)

**CONSIDERED** → published current products that could match the intent (previous-gen and photo-blocked drafts stay labelled).  
**SHORTLISTED** → survived role/data screening with a distinct job.  
**RECOMMENDED** → won that specific use case.

Affiliate availability and commission do **not** influence any of those steps.

Each recommendation shows:

- Why we picked it (`whyItWon` / `whyItFits`)
- Best for
- Trade-off
- Who should choose something else (`whoShouldAvoid` + `chooseInsteadWhen`)
- Key specs (comparison table from Product entities)
- Relevant alternatives

---

## Quality gate

| Guide | Recs | Considered | `assessBestGuideLaunchQuality` |
| --- | ---: | ---: | --- |
| padel-rackets | 7 | 24 | LAUNCH_READY |
| padel-rackets-beginners | 4 | 10 | LAUNCH_READY |
| padel-rackets-intermediate | 5 | 9 | LAUNCH_READY |
| padel-rackets-advanced | 5 | 9 | LAUNCH_READY |
| padel-rackets-control | 5 | 9 | LAUNCH_READY |
| padel-rackets-power | 5 | 9 | LAUNCH_READY |
| padel-rackets-all-round | 5 | 8 | LAUNCH_READY |
| padel-rackets-lightweight | 4 | 7 | LAUNCH_READY |
| padel-rackets-comfort | 5 | 7 | LAUNCH_READY |
| padel-rackets-maneuverability | 5 | 8 | LAUNCH_READY |
| padel-rackets-women | 2 | 6 | LAUNCH_READY (narrow) |
| padel-shoes | 6 | 9 | LAUNCH_READY |
| padel-shoes-men | 5 | 8 | LAUNCH_READY |
| padel-shoes-women | 6 | 10 | LAUNCH_READY |
| padel-shoes-stability | 4 | 7 | LAUNCH_READY |
| padel-shoes-comfort | 3 | 5 | LAUNCH_READY |
| padel-overgrips | 2 | 5 | LAUNCH_READY (narrow) |
| padel-bags | 3 | 5 | LAUNCH_READY |

Guide Depth Standard / Best Guide quality agent: `assessBestGuideLaunchQuality` (intro + methodology + ≥2 criteria + evidenceIds + whyItFits / tradeoffs / bestFor / avoid / chooseInstead). Buying-guide Guide Depth Standard (`assessGuideQuality`) is a separate gate for `/guides/*` and was not used to mass-generate these Best pages.

---

## Wiring

| Layer | Change |
| --- | --- |
| Content | `src/content/padel/best-guides/*` re-exported as `padelBestGuides` |
| P2 uniqueness overlay | Skipped for `sportId === "sport-padel"` so handwritten copy cannot be overwritten |
| Category configs | Shoe, grip, and bag Best Guide table configs added |
| Use-case layout | `guideKind: "use-case"` + `BY_GUIDE_ID` for all intent pages |
| Hub images | Unique product/guide art per slug; power no longer stamps choose-shoes.jpg |
| P46 | Category vs Best differentiation for `padel-rackets` and `padel-shoes` |

Photo-blocked racket drafts and previous-generation frames are **considered**, never awarded.

---

## Publication

| Gate | State |
| --- | --- |
| Editorial LAUNCH_READY (18) | May ship when the vertical opens |
| INDEXABLE | **No** — padel vertical disabled |
| Production deep URLs | `HIDDEN_404` until enablement |
| Arbitrary “best” pages | **Not created** |

---

## Next (not this estate)

1. Do not add Best Padel Balls until a published control/slow can exists with an authentic packshot.
2. Do not add Best Padel Shoes for Wide Feet until a manufacturer publishes `widthOptions` (or an equivalent last story).
3. Hesacore stays out of overgrips until an authentic hero exists.
4. Current-gen comparison rewrite (AT10 12K vs Metalbone **3.5**) remains a comparisons task, not a Best Guide.

---

## Inventory command

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/padel-best-guides-audit.ts
```
