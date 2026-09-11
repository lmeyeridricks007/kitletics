# Gear Setup & Kit Completion — Editorial 45

**Document ID:** `09-GEAR-SETUP-COMPLETION`  
**Generated:** 2026-09-09  
**Scope:** Every Gear Setup / Kit page in the estate  
**Data:** [`data/45-gear-setup-completion.json`](data/45-gear-setup-completion.json) · baseline [`data/45-gear-setup-audit.json`](data/45-gear-setup-audit.json)

## Executive status

| Metric | Before | After |
|---|---:|---:|
| Setups in estate | 16 | 16 |
| `canPublishGearSetup` pass | **6** | **16** |
| Concrete scenario | ~5 thin | **16** |
| System explanation on core items | thin / missing | **16** |
| Kit compatibility notes | ~1 | **16** |
| Indexable page data | mixed | **16** |
| READY (editorial) | — | **16** |
| NOT_READY | — | **0** |

**Targets:** real scenarios · component system roles · compatibility · honest budget — **met for the existing estate.**

## Verdict criteria

A setup is **READY** only when:

1. Concrete **scenario** (≥40 chars) — not a generic affiliate collection blurb  
2. ≥2 scenario-specific **whyReasons**  
3. Core items have **why needed / role in kit / trade-offs** (+ omit, cheaper path, or upgrade)  
4. Kit-level **compatibilityNotes**  
5. Checklist ≥3  
6. `canPublishGearSetup` passes and page is indexable  

**Budget:** `budgetRange` surfaces only when known offer totals sit near the declared band; `budgetTiers` only when evidence supports (many kits correctly show **none**).

## Baseline problems

1. Fitness / HYROX / tennis / padel kits were product lists with **no rationale** → publish gate failed.  
2. Only marathon race-day had a full why/checklist scaffold.  
3. No structured **system explanation** (why / role / trade-offs / omit / cheaper / upgrade).  
4. Compatibility (flasks↔vest, strap↔watch, bar↔rack, string↔racket) was absent.  
5. Budget bands were declared without validating against live offers.

## What changed

### 1. Domain model

`GearSetup` / `GearSetupItem` (`src/domain/editorial/types.ts`):

- `scenario`, `compatibilityNotes`, `budgetTiers`  
- Per item: `whyNeeded`, `systemRole`, `tradeOffs`, `canOmit`, `cheaperAlternative`, `upgradePath`, `compatibilityNotes`

### 2. Editorial enrichment (all 16)

`src/content/gear-setups-p45.ts` → applied in `editorial.ts` via `applyGearSetupP45Enrichment`.

Distinct scenarios include:

| Setup | Scenario focus |
|---|---|
| Beginner running | Start consistently without race-plate overspend |
| First marathon | 16–20 week build — daily miles first |
| Half marathon | Daily + tempo option for half blocks |
| Marathon race day | Race-morning system (shoes/watch/apparel/socks/belt) |
| Trail starter | Unsupported trail days — vest + flasks + shoes |
| Padel / tennis starters | Court starter systems (racket + shoes + consumables) |
| Beginner / budget / apartment / garage home gym | Space- and noise-distinct strength paths |
| Calisthenics home | Bar / rings / parallettes progression |
| First HYROX / race day / home conditioning / home training | Distinct race vs station-practice paths |

### 3. Page UX

- Hero **Scenario** callout  
- Item rows: system explanation (why / role / trade-offs / omit / cheaper / upgrade / compatibility)  
- Summary: kit **Compatibility** + **Value paths** when tiers qualify  

### 4. Publish gate

`canPublishGearSetup` now requires scenario, whyReasons, and system explanation coverage on core items.

### 5. Budget honesty

`getGearSetupPageData` sets `showBudgetRange` only when known core total ≈ declared band; filters `budgetTiers` when approx ceilings lack offer support. Example: `first-hyrox-setup` keeps scenario/system copy but **hides** budget range when live totals diverge.

## READY setups (16 / 16)

| Sport | Slug | Verdict |
|---|---|---|
| Running | `beginner-running-setup` | **READY** |
| Running | `first-marathon-kit` | **READY** |
| Running | `half-marathon-kit` | **READY** |
| Running | `marathon-race-day-kit` | **READY** |
| Running | `trail-running-starter-kit` | **READY** |
| Padel | `padel-starter-kit` | **READY** |
| Tennis | `tennis-starter-kit` | **READY** |
| Fitness | `beginner-home-gym` | **READY** |
| Fitness | `budget-home-gym` | **READY** |
| Fitness | `apartment-fitness-setup` | **READY** |
| Fitness | `garage-strength-gym` | **READY** |
| Calisthenics | `calisthenics-home-setup` | **READY** |
| HYROX | `first-hyrox-setup` | **READY** |
| HYROX | `hyrox-race-day-kit` | **READY** |
| HYROX | `hyrox-home-conditioning` | **READY** |
| HYROX | `hyrox-home-training` | **READY** |

## NOT_READY

None in the current estate.

## Estate gaps (not invented)

| Requested example | Status |
|---|---|
| Cold-weather running kit | **Absent** — needs apparel/layer catalog depth before a real kit; do not invent an affiliate shell |

## Verification

```bash
npx vitest run tests/gear-setup-page.test.ts
npx tsx --tsconfig tsconfig.json scripts/tmp/prelaunch-45-gear-setup-completion.ts
```

Tests: **7 / 7 passed.** Assessor: **16 READY · 0 NOT_READY.**

## Definition of done (45)

- [x] Every existing setup has a real scenario  
- [x] Components explain why / role / trade-offs / omit / cheaper / upgrade  
- [x] Compatibility documented at kit (+ item where relevant)  
- [x] Budget tiers / ranges only when offers support them  
- [x] Report with READY / NOT_READY from actual content  

## Residual

1. Optional: add a **cold-weather running kit** only after clothing layer products + decision content justify it.  
2. Vertical / Day-1 indexation for non-Running sports may still hold pages even when editorial READY.  
3. Prefer migrating thin seed kits to carry enrichment inline over time (P45 overlay remains the source of system copy today).
