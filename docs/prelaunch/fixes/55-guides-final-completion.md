# Fix 55 — Finish all remaining Guides

**Mode:** Remediation (editorial READY for every published Buying Guide)  
**Date:** 2026-09-10  
**Evidence:** `scripts/tmp/prelaunch-55-guides.ts` (`getBuyingGuides` + `assessBuyingGuideEditorialReadiness`, `{ isDev: false }`)  
**Gates unchanged:** `src/lib/guides/assess-guide-quality.ts`, `src/lib/guides/guide-depth.ts`

Editorial READY ≠ indexability. Vertical launch policy is unchanged.

---

## 1. Result

| Metric | Before | After |
|---|---:|---:|
| Buying Guides (published) | 68 | **68** |
| Editorial **READY** | 62 | **68** |
| Not READY | 6 | **0** |
| Intentionally BLOCKED | — | **0** |

**68/68 READY.** No Guide was left blocked for evidence or intent.

---

## 2. Exact 6 (before)

Live assess: all six were quality `complete`, decision `high`, workState **`BROKEN`**.

Failure class for every slug: **broken relationships / references** — `relatedProductIds` that `getProductById(id, { isDev: false })` cannot resolve.

Not uniqueness, evidence, intent collision, research depth, or decision completeness.

| Slug | Class | Why the IDs failed |
|---|---|---|
| `massage-guns-explained` | broken relationships | Invented / unpublished SKUs: `prod-renpho-r3`, `prod-opove-m3-pro`, `prod-timtam-power-massager` (catalog ID is `prod-timtam-power-massager-v3.7`; R3 is media-gated draft) |
| `foam-rolling-for-runners` | broken relationships | Media-gated or unpublished: `prod-triggerpoint-grid`, `prod-rumbleroller-original`, `prod-triggerpoint-mb1`, `prod-the-stick` |
| `recovery-tools-what-evidence-shows` | broken relationships | Same grid/stick drafts: `prod-triggerpoint-grid`, `prod-the-stick` |
| `soft-flasks-vs-bladders-explained` | broken relationships | Wrong vest ID: `prod-salomon-adv-skin-12` (real catalog ID is `prod-adv-skin-12`) |
| `running-jackets-explained` | broken relationships | Shared `prod-brooks-cascadia-jacket` — media-pending **draft** |
| `winter-layering-for-runners` | broken relationships | Same Cascadia draft as jackets (intent overlap on the only linked product) |

Root cause: media publish gate keeps SKUs without registered heroes as draft; some IDs never existed; jackets and winter both pointed at the same unpublished shell.

---

## 3. Classification (all 6)

| Failure class | Count |
|---|---:|
| uniqueness | 0 |
| evidence | 0 |
| intent collision (as READY fail) | 0 |
| research depth | 0 |
| **broken relationships** | **6** |
| decision completeness | 0 |
| other | 0 |

Jackets vs winter had a **cannibalization risk** (same single product, same weather-shell job). That was a content-role problem, not a uniqueness-hold. Both URLs were kept and differentiated (see §5).

---

## 4. What was fixed (substantive)

Quality thresholds were **not** lowered. Each of the six already met Guide Depth Standard on copy (primary / secondary / misconceptions / decision completeness). The READY miss was unresolved catalog links.

### 4.1 Published product examples only

Replaced unresolved IDs with **published** catalog products (registered heroes, so the media gate does not draft them):

| Guide | Role of examples | Published IDs |
|---|---|---|
| Massage guns | Hardware classes: travel mini, mid-size, flagship | Mini, Hypervolt Go 2, Prime, Pro, Hypervolt 2 |
| Foam rolling | Density / packability / balls | GRID X, BLACKROLL Standard, Brazyn Morph, BLACKROLL Ball, BLACKROLL Pro |
| Recovery evidence | Claim-policy across tool types | Mini, GRID X, Normatec Go / 3, OOFOS, CEP sleeves, BLACKROLL Standard |
| Flasks vs bladders | Flask vs vest vs bladder | HydraPak Speed 500, ADV Skin 12, CamelBak Crux 1.5 |
| Jackets | Jacket-type taxonomy | Houdini (packable wind), Canopy (training DWR), On Weather (wetter shell) |
| Winter layering | Stack, not shell taxonomy | Capilene thermal crew, Nano-Puff vest, Notch beanie |

Did **not** un-draft media-pending products to make old links resolve.

### 4.2 Guide Depth Standard (kept / tightened)

Each of the six:

- Answers the primary question (what this product type is for)
- Answers secondary / decision questions (when to choose which class)
- Addresses misconceptions (recovery claims; “waterproof for every run”; flasks vs bladders as universal winners)
- Connects to real Product decisions via live `relatedProductIds`
- Includes evidence / claim-policy where recovery is in scope
- Has next-step links: sibling Guides, Best, Finder

Copy / link work:

- Recovery trio: explicit job split + `relatedGuideIds` (hardware vs floor tools vs claim policy)
- Foam rolling: dedicated “What to do next” section
- Flasks: links to vest, vest-vs-belt, belt, handheld
- Jackets / winter: Best CTAs, cross-links, P46 learn-vs-Best notes so they are not ranking twins

### 4.3 Latent broken vest ID

`prod-salomon-adv-skin-12` also lived in compact-plan fillers and fuel/carry long-form examples. Replaced with `prod-adv-skin-12` so future thin plans cannot re-break relationships.

---

## 5. Cannibalization

| Pair | Decision |
|---|---|
| Massage guns explained vs When to use a massage gun | **Keep both** — hardware filter vs session timing |
| Massage vs foam rolling vs evidence | **Keep all three** — size/power vs density/shape vs claim policy |
| Flasks vs bladders vs vest vs belt | **Keep** — fluid system vs carry-system vs vest buying vs belt buying |
| **Jackets explained vs winter layering** | **Differentiate strongly, do not consolidate** |

Jackets vs winter previously shared one draft jacket. Split:

- **Jackets** = wind vs DWR vs wetter shell (packable / training / rain)
- **Winter** = base / mid / extremities; shell type is a pointer to Jackets

P46 notes and Best targets differ (`/best/running-jackets` vs `/best/running-gear-winter`).

No two mediocre variants were left standing.

---

## 6. After — former six

All six: `READY`, quality `complete`, decision `high`, zero missing products.

| Slug | Related Guides | Best / Finder |
|---|---|---|
| `massage-guns-explained` | when-to-use, foam, evidence | Best recovery + recovery finder |
| `foam-rolling-for-runners` | massage, evidence, when-to-use | Best recovery + recovery finder |
| `recovery-tools-what-evidence-shows` | massage, foam, when-to-use, sandals | Best recovery + recovery finder |
| `soft-flasks-vs-bladders-explained` | vest, vest-vs-belt, belt, handheld | Best hydration vests + hydration finder |
| `running-jackets-explained` | winter, hot-weather | Best jackets + clothing finder |
| `winter-layering-for-runners` | jackets, hot-weather | Best winter gear + clothing finder |

---

## 7. Files touched

| File | Change |
|---|---|
| `src/content/running/buying-guides.ts` | Recovery trio: published product IDs, related guides, foam next-step |
| `src/lib/guides/explainers/running-density-plans.ts` | Flasks vest ID; jackets vs winter product split + Best/decision links |
| `src/content/running/buying-guides-density.ts` | `relatedGuideIds` for flasks / jackets / winter / massage timing |
| `src/content/guides-p46-intent-roles.ts` | Jackets vs winter learn-vs-Best roles |
| `src/lib/guides/complete-compact-plan.ts` | Filler vest ID → `prod-adv-skin-12` |
| `src/lib/guides/explainers/running-fuel-recovery-plans.ts` | Carry-plan vest examples → `prod-adv-skin-12` |
| `src/lib/guides/guide-question-maps-all.ts` | Recovery misconception coverage marked answered (maps only; not a quality gate) |

**Not edited:** `assess-guide-quality.ts`, `guide-depth.ts`, `vertical-strategy.ts`.

---

## 8. Out of scope / leftover

- Media-pending drafts (`prod-brooks-cascadia-jacket`, classic GRID, The Stick, Renpho R3, etc.) remain draft until authentic heroes exist. Guides no longer depend on them.
- Some Best / comparison / recommendation files still mention those draft IDs. That is not the Guide READY gate.
- Indexability still follows launch eligibility (complete + vertical). READY Guides in unlaunched sports stay hidden.

---

## 9. Definition of done

- [x] Exact 6 identified and classified
- [x] Substantive depth (not threshold changes)
- [x] Cannibalization: differentiate or consolidate — jackets/winter split; recovery trio split
- [x] **68/68 READY**
- [x] Zero intentionally blocked

**Do not treat editorial READY as a publish-the-site authorization.** Vertical and indexation policy are separate.
