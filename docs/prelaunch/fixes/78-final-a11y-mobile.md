# Fix 78 — Final mobile & accessibility polish

**Date:** 2026-09-10  
**Do not publish.**  
**Lab:** `next start` @ `http://127.0.0.1:3010`  
**Evidence:** [`../data/rc-78/probe.json`](../data/rc-78/probe.json) · [`../data/rc-78/shots/`](../data/rc-78/shots/)  
**Capture:** `scripts/tmp/prelaunch-78-a11y-mobile.mjs`

Keyboard QA remains **47/47 PASS** (Fix 68). Axe **serious/critical = 0** (unchanged).

---

## Scoreboard

| Check | Before | After |
|---|---|---|
| Axe violations (header, search) | 0 | **0** |
| Axe incomplete **rules** (header / search) | 2 / 2 | **1 / 0** |
| Novablast 390 `scrollWidth − innerWidth` | **210 px** | **0** |
| Vomero / Glycerin 390 overflow | 0 | **0** |
| Cookie / “N” chip on production | None in DOM | **None** (`nChips: []`) |
| Regression overflow 390 / 768 / 1440 × Product, Review, Best, Guide, Finder | — | **15 / 15 leak=0** |

---

## 1. Axe incomplete

The rc-60 baseline stored **counts**, not nodes. `incomplete: 2` on every surface was **two rules**, not two search-field pixels.

Dumped nodes (1280×800, wcag2a/aa + 2.1):

### Rule A — `aria-valid-attr-value` (was real / dynamic state)

**Node:** Desktop **More** button  
`aria-expanded="false" aria-controls="_R_…_" aria-haspopup="true"`

**Axe:** “Unable to determine if aria-controls referenced ID exists on the page while using aria-haspopup.”

**Cause:** The menu panel was only mounted while open, so the `useId()` target did not exist when closed. Same pattern on contextual-nav More. Not a contrast bug; not hidden header search.

**Fix:** Keep the panel in the DOM (`hidden={!open}`) and set `aria-controls` **only while open**. `aria-expanded` + `aria-haspopup` still describe the closed state.

**After:** search incomplete **0**. Header no longer reports this rule.

### Rule B — `color-contrast` (tool limitation)

**Search (before):** Region selector `▾` (`aria-hidden`, `messageKey: nonBmp`). Decorative non-text; axe cannot score BMP contrast. Replaced with Lucide `ChevronDown`. Search color-contrast incomplete **gone**.

**Home (remaining, 1 rule):** Hero H1 / lead / outline CTA over a **photograph + `bg-gradient-to-r` overlay**. Axe `messageKey: bgGradient` — it cannot composite the background, so `contrastRatio: 0`. Large white type on a near-black veil is visually AA; flattening the hero would be a redesign. **Not a violation.** Document as tool limitation.

| Surface | Incomplete rules after | Classification |
|---|---|---|
| `/search?q=vomero` | **0** | — |
| `/` (header + home hero) | **1** (`color-contrast` / `bgGradient`) | Tool limitation |

No remaining incomplete on header **search** chrome.

---

## 2. Novablast 390 carousel

**Before:** `document.documentElement.scrollWidth = 600` (leak **210 px**). Compare `<ul>` was **584×** wide (`4 × 140px + gap-2`) at a 390 viewport.

**Root cause (not transform, not image sizing):** CSS grid / block min-width: `auto` on the compare wrapper. `shrink-0` cards expanded the column; `max-w-full` on the scroller was 100% of that inflated parent, so `overflow-x-auto` never clipped. Jump-nav and alternatives rails were already contained (`clientW` 390 / 358).

Peek of the next card was **accidental document overflow**, not a designed peek.

**Fix (shared):** `HorizontalPeekRail` — `min-w-0` + `w-full` + `overflow-x-clip` on the wrapper; snap-x / snap-start; 32px right fade on small screens only.

**After (Novablast compare):** `clientW` **358**, `scrollW` **584**, page `scrollWidth` **390**. Two cards + a faded third-card peek inside the scroller.

Screenshot: [`pdp-asics-novablast-6-390-compare.png`](../data/rc-78/shots/pdp-asics-novablast-6-390-compare.png).

---

## 3. Shared component (not Novablast-only)

`src/components/ui/HorizontalPeekRail.tsx` is used by:

- PDP **Compare with** (`ProductDetailPage`)
- PDP **Alternatives to consider** (`ProductReviewSection`)

Gallery thumbs also got `min-w-0 max-w-full` (same overflow class of bug, not a special case).

Probed PDPs at 390:

| PDP | Overflow before | After |
|---|---|---|
| `/products/asics-novablast-6` | leak 210 | **0** |
| `/products/nike-vomero-18` | 0 (fewer compare tiles) | **0** |
| `/products/brooks-glycerin-22` | 0 | **0** |

Vomero/Glycerin did not leak because fewer 140px tiles fit inside ~358px. The same rail would leak on any PDP with four compare peers. The shared wrapper closes that class of bug.

---

## 4. Cookie / “N” chip

**Production `next start`:** no CMP, no Cookiebot/OneTrust/CookieYes in source. `AnalyticsScripts` only loads GA4 when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set (consent defaults denied). Probe `nChips: []` on every PDP. Fixed overlays are header, closed mobile drawer, and sticky section nav — none is an “N”.

Fix 71’s chip matches the **Next.js route indicator** (dev overlay), not Kitletics layout. It does not ship in `next start`.

**Config:** `devIndicators.position: "bottom-right"` so local `next dev` QA does not sit on the usual bottom-left cookie/CTA corner. Production unaffected.

Does not obscure CTAs, trap keyboard, cover cookie controls (there are none), or create overflow.

---

## 5. Regression

`scrollWidth > innerWidth + 2` = fail.

| | Product | Review | Best | Guide | Finder |
|---|---|---|---|---|---|
| **390** | 0 | 0 | 0 | 0 | 0 |
| **768** | 0 | 0 | 0 | 0 | 0 |
| **1440** | 0 | 0 | 0 | 0 | 0 |

Routes: `/products/asics-novablast-6`, `/reviews/asics-novablast-6`, `/best/running-shoes`, `/guides/how-to-choose-running-shoes`, `/tools/running-shoe-finder`.

Viewport shots under [`../data/rc-78/shots/`](../data/rc-78/shots/). No layout regressions in first-screen captures.

---

## 6. Debt

| ID | Status |
|---|---|
| `A11Y-AXE-INCOMPLETE` | **CLOSED** — search 0; remaining home `bgGradient` incomplete is axe limitation, not a P0 |
| `UX-NOVABLAST-OVERFLOW` | **CLOSED** |
| `UX-COOKIE-CHIP` | **CLOSED** — not in production; Next indicator parked bottom-right in dev |

---

## Definition of done

- [x] Incomplete nodes inspected and classified
- [x] Real ARIA incomplete fixed; gradient incomplete documented
- [x] Novablast 390 leak fixed via shared rail (peek deliberate)
- [x] Other PDPs on the same carousel
- [x] Cookie/N chip confirmed third-party/dev-only
- [x] 390 / 768 / 1440 × Product, Review, Best, Guide, Finder
- [x] This report
