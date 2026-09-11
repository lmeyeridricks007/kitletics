# Fix 68 — Keyboard & interaction accessibility QA

**Date:** 2026-09-10  
**Status:** Implemented  
**V3 residual:** automated axe **0** serious/critical; **manual keyboard QA had not been performed**.  
**Target:** Tab / Shift+Tab / Enter / Space / Escape / arrows on all P0 surfaces; fix real failures; skip link if missing.

Evidence: [`docs/prelaunch/data/rc-68/keyboard-qa.json`](../data/rc-68/keyboard-qa.json)

Playwright (keyboard-only, `http://localhost:3010`): **47 / 47 PASS**.

---

## Result

| Gate | After |
|---|---|
| Keyboard QA (P0) | **47 / 47 PASS** |
| Skip to content | Present, first Tab, visible on focus, lands on `#main-content` |
| Modal/drawer trap + Escape + restore | Search, mobile menu, catalog filters, compare customize |
| Finder completed keyboard-only | Yes — questions, Back, Next, results, Compare, product links |

---

## 1. Routes tested

| Viewport | Routes |
|---|---|
| Desktop 1440×900 | `/`, `/products/nike-vomero-18`, `/best/running-shoes`, `/guides/how-to-choose-running-shoes`, `/compare`, `/tools/running-shoe-finder` (+ results) |
| Mobile 390×844 | `/running/shoes` (header menu, search overlay, filters) |

Also exercised from those pages: search overlay, Running mega, compare builder, Finder summary → results.

P0 set matches Fix 60 lab: home, running catalog, PDP, Best, guide, compare, Finder. Review `/reviews/nike-vomero-18` shares header/PDP patterns (gallery, compare, table region, offers).

---

## 2. Components tested

| Area | Components |
|---|---|
| Skip | `SkipLink`, `layout` `#main-content` |
| Header | Logo, `DesktopNav` (primary + mega + More), `HeaderSearchField`, `SearchDialog`, `MobileDrawer`, `ContextualNav` (catalog chips on `/running/shoes`) |
| Filters | `CatalogInteractive` drawer, facet checkboxes, Men/Women `ShopByFitChips`, sort `<select>` |
| PDP | `AudienceVariantSelector`, `ProductMediaGallery`, offers, `AddToCompareButton`, alternatives links |
| Best / guide | `ScrollableTableRegion` / comparison tables, in-page `#` jumps, Finder CTAs, product links |
| Compare | `ProductSearchSelector` combobox, Remove, Customize dialog |
| Finder | `FinderQuestionCard` radios/checkboxes, Back, Next question, See my matches, results Compare + product links |
| Other dialogs wired | `SearchFilters`, `GearHubMobileFilters`, `ToolsRecommendationCard` |

---

## 3. Issues found (real)

| Issue | Severity | Fix |
|---|---|---|
| No skip link; `<main>` had no id | **Fail** — substantial global nav | Added `SkipLink` + `#main-content` |
| Search / filter / compare / tools dialogs: no focus trap and/or no restore | **Fail** | `useModalFocus` |
| Mobile drawer trapped Tab but did not restore to “Open menu” | **Fail** | Same hook |
| Catalog / search / gear / tools drawers: Escape missing or incomplete | **Fail** | Hook + overlay close |
| Desktop mega opened on **focus** — Tab walked every mega link before Search | **Fail** (keyboard swamp) | Open on hover / **ArrowDown**; Tab stays on top-level items |
| Finder / PDP fit radios: every option in Tab order; no arrow keys | **Fail** vs radiogroup pattern | Roving tabindex + arrows |
| PDP gallery listened to **window** ArrowLeft/Right | **Fail** — stole arrows site-wide | Scoped to gallery `onKeyDown` |
| Wide tables not keyboard-scrollable | **Risk** | `ScrollableTableRegion` (`role="region"` `tabIndex={0}`) |

---

## 4. Fixes

### Skip link

- `src/components/layout/SkipLink.tsx`
- First control in the root layout; `href="#main-content"`
- `.skip-link` is off-canvas until `:focus` / `:focus-visible` (outline + slide into view, `z-index: 100`)
- `<main id="main-content" tabIndex={-1}>` so the skip target can take focus

### Modal / drawer contract

`src/lib/a11y/use-modal-focus.ts`:

- Move focus into the dialog
- Trap Tab / Shift+Tab
- Escape closes
- Restore focus to the trigger on close

Applied to: `SearchDialog`, `MobileDrawer`, `CatalogInteractive`, `SearchFilters`, `CompareExperience` (options + customize), `GearHubMobileFilters`, `ToolsRecommendationCard`.

### Desktop nav

- Mega / More no longer open on `onFocus`
- **ArrowDown** opens; **Escape** closes; **Tab** leaving the wrapper closes (`onBlur`)
- Closed panels are not in the Tab order

### Radiogroups

Finder questions + PDP fit selector: `tabIndex={0|-1}`, ArrowRight/Down/Left/Up move selection.

### Gallery

Arrow keys only when focus is inside the gallery (thumbs / prev / next).

### Tables

P0 overflow tables wrapped in `ScrollableTableRegion` (Best, compare results/editorial comparison, review comparison, alternatives).

### Tests

`tests/a11y-smoke.test.ts` asserts the skip link and `#main-content`.

---

## 5. Keyboard QA (after fixes)

Script: `scripts/tmp/prelaunch-68-keyboard-qa.mjs`  
Lab: `BASE_URL=http://localhost:3010` (see exceptions).

| Check | Result |
|---|---|
| Skip first Tab, visible, Enter → `#main-content` | PASS |
| Logo, Running, More, inline search | PASS |
| ⌘/Ctrl+K overlay: trap, Escape, restore to search field | PASS |
| ArrowDown opens Running mega; Escape closes | PASS |
| Mobile Open menu: trap, Escape restore | PASS |
| Mobile search overlay: trap, Escape restore | PASS |
| Filters drawer: Space toggle, Escape restore | PASS |
| Men/Women + sort | PASS |
| PDP fit arrows, compare, alternatives | PASS |
| Best table region + jump links + Finder CTA | PASS |
| Guide Finder CTA / in-page links | PASS |
| Compare search, remove, customize trap + restore | PASS |
| Finder full flow → results, product links, Compare | PASS |

---

## 6. Remaining exceptions

These are **not** keyboard traps. They are documented limits.

1. **Vomero 18 gallery** — one product image, so no Previous/Next/thumb controls. Multi-image PDPs expose those buttons; arrows work when the gallery is focused.
2. **PDP `<details>` accordion** — only renders when there are *other-region* offers and no local offers. Vomero in this lab had no that empty-state accordion. Native `<details>`/`<summary>` is keyboard-operable when present.
3. **Catalog Men/Women** — `ShopByFitChips` are **links** (URL `?gender=`), not a radiogroup. Tab / Enter is the correct pattern; arrows are not required.
4. **Desktop search overlay** — opened with Control/⌘+K (and mobile “Open search overlay”). The desktop header’s primary search is the inline field (`#header-search-input`).
5. **Mega menus** — not in Tab order until opened (ArrowDown or hover). Intentional so Search is reachable without walking every mega link.
6. **Horizontal chip rails** (contextual sport nav, some hub strips) — extra Tab stops, not a trap. They are lists of links, not data tables; they were not given `tabIndex={0}` scroll regions.
7. **Lab bind** — `127.0.0.1:3010` was still owned by an older Next process (pre-skip-link). QA used `http://localhost:3010` (IPv6 / the current turbopack server). Re-run against whichever process has this branch.
8. **Axe** — not re-crawled here; V3 already measured 0 serious/critical. This fix is the keyboard residual.

---

## 7. Definition of done

- [x] Keyboard-only path on P0 header, filters, PDP, Best/guide, compare, Finder
- [x] Focus visible on skip, nav, dialogs, table region
- [x] No traps found on tested dialogs
- [x] Escape closes; focus returns to trigger (button-opened dialogs)
- [x] Skip link added (nav is substantial)
- [x] Wide tables keyboard-reachable
- [x] Real failures fixed; exceptions listed above
