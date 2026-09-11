# Fix 17 — Complete Running Best / recommendation guides

**Date:** 2026-09-06  
**Status:** Implemented (pre-launch — **do not publish**)  
**Audits:** [`../03-editorial-quality.md`](../03-editorial-quality.md) · [`../data/03-editorial-quality.json`](../data/03-editorial-quality.json)  
**Enrichment:** `src/content/running/best-guides-p1-launch-ready.ts` (generator: `scripts/tmp/prelaunch-17-generate-best-enrichment.ts`)  
**Prior wave:** Fix 07 P0 (`best-guides-p0-launch-ready.ts`)

## Objective

Bring every commercially / search-relevant **Running** Best Guide to full Best Guide standard and **LAUNCH_READY** — without lowering gates. Affiliate commission never changes rank.

---

## BEFORE → AFTER

### Global Best Guides

| Status | Before (fix 07) | After (fix 17) |
|---|---:|---:|
| **LAUNCH_READY** | **9** | **44** |
| NEEDS_MINOR_WORK | 33 | **3** (non-Running) |
| THIN | 16 | **11** (non-Running) |
| BLOCKED | 0 | 0 |

### Running Best Guides (44)

| Status | Before | After |
|---|---:|---:|
| **LAUNCH_READY** | **9** | **44** |
| NEEDS_MINOR_WORK | 30 | **0** |
| THIN | 5 | **0** |

### Indexation (Day-1 eligibility)

| Rule | Result |
|---|---|
| LAUNCH_READY Running Best → **INDEXABLE** | **44 / 44** |
| NEEDS_MINOR_WORK → hold (PUBLIC_NOINDEX) | n/a (none Running) |
| THIN → hidden (HIDDEN_404) | n/a (none Running) |

Simulator: Best Guides **INDEXABLE = 44** (was **9**). Non-Running Best remain NMW/THIN and stay held/hidden.

---

## 1. Classification (pre-fix Running)

### Already LAUNCH_READY (P0 — fix 07) — 9

`running-shoes`, `running-shoes-beginners`, `daily-trainers`, `running-shoes-long-runs`, `marathon-shoes`, `stability-running-shoes`, `running-watches`, `running-hydration-vests`, `heart-rate-monitors-running`

### NEEDS_MINOR_WORK — 30 → fixed

**Shoes:** trail, tempo, carbon-plated, max-cushion, race, wide-feet, heavy-runners  

**Watches:** beginners, budget, marathon, trail, ultra, music, small-wrists  

**HRM:** chest-straps, intervals  

**Gear:** packs, headphones, socks, headlamps, sunglasses, safety-visibility, recovery-gear, race-fuel  

**Clothing:** hot-weather, winter gear, jackets, rain jackets, shorts, tights  

### THIN (doorway risk) — 5 → differentiated + completed

| Guide | Differentiation (not a vest clone) |
|---|---|
| `running-belts` | Waist carry / bounce / flask-at-waist vs vest volume |
| `handheld-running-bottles` | In-hand form factor vs belt/vest |
| `hydration-vests-trail` | Trail bounce, poles, technical access |
| `hydration-vests-ultra` | Ultra volume / all-day comfort / mandatory kit |
| `hydration-marathon-training` | Road marathon-block carry (belt/handheld/light vest) |

---

## 2. Full Best Guide standard — what was applied

Each upgraded guide now carries:

| Requirement | Implementation |
|---|---|
| Hero / intro depth (≥100 words) | Context-specific intro + whatMatters |
| Quick picks / decision shortcuts | `decisionShortcuts` + `quickTake` |
| What we looked for | `whatWeLookFor` factor cards (category criteria) |
| Context methodology | Guide-specific `selectionMethodology` / summary |
| Comparison table | `comparisonProductIds` (≥2) |
| Detailed recommendations | Per-pick `whyItFits`, `whyItWon`, strengths |
| Trade-offs | `tradeoffs` / compromises on picks |
| Who for / who avoid | `bestForProfiles`, `whoShouldAvoid`, `notIdealFor` |
| Choose-instead | `chooseInsteadWhen` → peer products |
| How we narrowed the field | `consideredProductIds` + `shortlistedProductIds` (funnel: evaluated → shortlisted → recommended) |
| Evidence | `evidenceIds` (incl. `ev-catalog-editorial`) — **required for INDEXABLE** |
| Related finder / comps / guides / FAQ | Existing page assembly + comparison-link enricher retained |

**Gates unchanged.** Editorial + `assessBestGuideLaunchQuality` still require high contextual depth, methodology, criteria, avoid/best-for, comparison or choose-instead, intro ≥100, and **evidenceIds** for INDEXABLE.

---

## 3. Context-specific criteria (examples)

| Guide | Decision lens |
|---|---|
| Trail shoes | Grip, protection, trail fit, stack, durability |
| Tempo shoes | Workout response, session durability, pace range, trainable plate |
| Carbon-plated | Carbon stiffness, race weight, distance, race-pace stability, legality |
| Race shoes | Efficiency across distances — **≠** marathon comfort guide |
| Max cushion | Soft stack, easy manners, late-run protection, pace limits |
| Watches (sub) | Beginner simplicity / budget / marathon battery+pacing / trail maps / ultra multi-day / music / small wrists |
| Belts / handhelds / trail–ultra vests | Form-factor and distance — not duplicate product lists |
| Nutrition | Format, carbs/serving, caffeine options, gut practicality — **no medical claims** |

---

## 4. Duplicate intent

- **Race vs marathon vs carbon:** methodology explicitly separates race-day geometry, marathon-block comfort, and carbon-plate lane (nylon tempo → tempo guide).
- **Hydration cluster:** five guides now own distinct form-factors / distances (belt, handheld, trail vest, ultra vest, marathon road training) instead of thin card shelves.
- Best↔educational Guide “cannibalization” pairs (e.g. Best shoes ↔ how-to-choose) remain **complementary** (recommendation vs education), not doorway Best↔Best clones.

No Best Guides consolidated by deletion; thin doorway variants were **deepened and differentiated**.

---

## 5. Evidence & affiliate neutrality

- Guide + pick `evidenceIds` attached (`ev-catalog-editorial` and existing IDs).
- Methodology copy states affiliate commission does **not** influence considered / shortlisted / recommended / rank.
- No first-hand testing invented.

---

## 6. Code changes

| File | Role |
|---|---|
| `src/content/running/best-guides-p1-launch-ready.ts` | 35 Running guide patches (non-P0) |
| `src/content/best-guides.ts` | Wire `applyBestGuideP1LaunchReadyEnrichment` after P0 |
| `scripts/tmp/prelaunch-17-generate-best-enrichment.ts` | Regenerator |
| `src/lib/review/enrich-review-substance.ts` | Defensive `scoreBreakdown ?? []` (unblocks audit after fix 16 reviews) |
| `src/content/running/nmw-completion-launch-ready.ts` | Add default `scoreBreakdown` on NMW reviews |

---

## 7. Residual (out of scope)

| Item | Notes |
|---|---|
| Non-Running Best (14) | Still NMW/THIN — fitness / padel / tennis / HYROX |
| Soft-gated product PDPs | Clothing / nutrition / sunglasses / accessories products may remain PUBLIC_NOINDEX; their **Best hubs are INDEXABLE** when LR (per §9). Follow-up may soft-gate Best if product hold should also hold hubs. |
| Publish | **Do not publish** |

---

## 8. Verification

```bash
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-03-editorial-quality.ts
```

Confirm:

- Running Best: **44 LAUNCH_READY / 0 NMW / 0 THIN**
- Global Best: **44 LR** (remaining gaps non-Running)
- Day-1: Running Best eligibility **INDEXABLE = 44**

---

## Definition of done

- [x] All Running Best classified  
- [x] Commercially relevant Running Best → LAUNCH_READY  
- [x] Full decision depth on recommendations  
- [x] Context-specific criteria (not generic review prose)  
- [x] Considered / shortlisted / recommended populated  
- [x] Hydration doorway THIN differentiated  
- [x] Evidence attached; affiliate-neutral  
- [x] LR → INDEXABLE; no Running NMW/THIN left  
- [x] Editorial audit re-run  
- [x] Report written  
- [ ] Publish — **No**
