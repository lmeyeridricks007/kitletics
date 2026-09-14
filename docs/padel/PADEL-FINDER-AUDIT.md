# Padel Racket Finder audit

**As of:** 2026-09-13  
**Route:** `/tools/padel-racket-finder`  
**Definition:** `src/domain/finders/configs/racket-finders.ts` (`padelRacketFinderDefinition`, **v2**)  
**Engine:** shared Finder (`runFinder`) — same architecture as running / fitness finders

Padel remains **vertical-disabled** for deep INDEXABLE URLs. The tool is live via `padelToolsLive` / tool availability override for preview and QA. Editorial quality ≠ production indexation.

Kitletics has **not** physically tested these products. Matches use catalog specs, decision attributes, and offers — never invented balance/sweet-spot/core data, and **never affiliate commission**.

---

## Headline

| Check | Status |
| --- | --- |
| Adaptive / progressive questions | **Pass** |
| Beginner skips style / position / change-goals | **Pass** |
| Don’t-know options skip hard penalties | **Pass** |
| Flagship results: Best match + role alternatives | **Pass** |
| Explainability (why + trade-offs + specs) | **Pass** |
| Review / Compare / Alternatives CTAs | **Pass** |
| Shareable `?s=` state; results **noindex** | **Pass** |
| Analytics events wired | **Pass** |
| Affiliate neutrality | **Pass** (documented + deterministic ranking) |
| Golden scenarios (`tests/racket.test.ts`) | **Pass** |

---

## Questions (v2)

| Key | Labels | Adaptive? |
| --- | --- | --- |
| `primaryUse` | Beginner / Intermediate / Advanced | Required |
| `primaryPriority` | Control / Balanced / Power / Comfort / Maneuverability | Required (single) |
| `playingStyle` | Defensive / All-round / Aggressive / Don’t know | Intermediate+ only |
| `courtPosition` | Left / Right / Both / Don’t know | Intermediate+ only (soft bias) |
| `feelPreference` | Soft / Medium / Firm / Don’t know | All levels; don’t-know = no feel penalty |
| `weightPreference` | Light / Medium / Heavy / Don’t know | Required; don’t-know ignored in scoring |
| `armComfortPriority` | Yes / No | Required; Yes → comfort + forgiveness |
| `currentEquipment` + `changeGoals` | Improve on current | Intermediate+; goals only if “yes” |
| `budget` | Regional bands (EUR / GBP / USD) | Required; options from `regionalBudgets` |

**Not asked of beginners:** playing style, court side, current-racket change goals, technical balance/core/shape jargon.

Intent → attributes: defensive→control, all-round→balanced, aggressive→aggressive; balanced priority expands to control+power; comfort/maneuverability add forgiveness; left/right add soft power/control nudges.

---

## Scoring & neutrality

- Weights in `PADEL_SCORING` (`primaryUse`, `priorities`, `specs`, `budget`, `value`, `lifecycle`).
- Specs via `racketSpecsScore` + `getPadelRacketDecisionAttributes` — unknown fields score **neutrally**.
- Soft feel / arm-comfort signals use published core strings when present.
- `AFFILIATE_NEUTRALITY` + golden test: identical inputs → identical ranking; commission is not an input.

---

## Results presentation

Built in `getFinderResultsData` + `selectPadelFinderRoleRows`:

1. **Best match** — top ranked eligible product  
2. **More control** — highest control attribute among remaining solid matches  
3. **More power** — highest power attribute  
4. **More comfort** — comfort / forgiveness  
5. **Better value** — value attribute vs price (not commission)

Each card shows: match %, why it matches, trade-offs, highlight specs (shape / balance / weight / core), from-price + offers, Review / Compare / Alternatives links.

Remaining ranked products appear under **Other good matches**.

---

## Shareability

- Answers encoded as base64url `?s=` via `encodeFinderShareState` (sensitive keys excluded).
- Results at `/tools/padel-racket-finder/results?s=…` with `robots: { index: false }`.
- Edit flow: `/tools/padel-racket-finder?s=…&edit=1` — no combinatorial indexable path matrix.

---

## Analytics

Domain events (`src/domain/finders/analytics.ts`) → GA taxonomy (`map-domain.ts`):

| Domain event | Tracked as |
| --- | --- |
| `finder_started` | `finder_start` |
| `finder_completed` | `finder_complete` |
| `finder_result_viewed` | `finder_result_view` (on results mount) |
| `finder_product_clicked` / product open | `finder_product_click` (+ capture on `/products` links from finder pages) |
| `finder_offer_clicked` | `finder_offer_click`; `/go` also emits `retailer_click` with `finder_result` placement |

---

## Files touched (flagship v2)

| Area | Path |
| --- | --- |
| Definition | `src/domain/finders/configs/racket-finders.ts` |
| Normalization | `src/domain/finders/normalization.ts` |
| Scoring | `src/domain/finders/scoring.ts` |
| Role presentation | `src/lib/finder/padel-result-roles.ts` |
| Results data | `src/lib/finder/get-finder-results-data.ts` |
| UI config | `src/lib/finder/finder-ui-config.ts` |
| Results UI + analytics mount | `src/components/finder/FinderResults.tsx`, `FinderResultsAnalytics.tsx` |
| Tests | `tests/racket.test.ts` |
| Hub copy | `src/lib/tools/tools-hub-config.ts`, `src/content/padel/seed.ts` |

---

## Known limits / follow-ups

- Vertical still disabled for public deep indexation until padel enablement.
- Sport hub `finderFields` may still list older question keys — cosmetic until hub sync.
- `changeGoals` is qualitative (no current-racket product picker yet).
- Role alternatives optimize for distinct jobs; they can diverge from pure rank order by design.
- Scoring calibration remains expert-tuneable as catalog attributes densify.

---

## Definition of done

- [x] Adaptive question set matches brief  
- [x] Best match + More control / power / comfort / better value  
- [x] Every recommendation explains why (+ trade-offs)  
- [x] Affiliate cannot influence ranking  
- [x] Shareable state without indexable URL explosion  
- [x] Analytics events listed above  
- [x] This audit doc  
