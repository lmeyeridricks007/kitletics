# Fix 11 — Accessibility & Responsive QA

**Mode:** Remediation (contrast, overflow, controls, landmarks; brand lime preserved for fills)  
**Date:** 2026-09-06  
**Reference:** `docs/prelaunch/07-performance-technical.md`  
**Evidence:** `docs/prelaunch/data/11-a11y-responsive.json` + refreshed `data/staging/site-quality/a11y-baseline.json`

---

## 1. Scoreboard

| Check | Before | After |
|---|---|---|
| Homepage overflow @ 390px | **Yes** (`docOverflowX`) | **No** on all P0 routes |
| Systemic lime-on-white text contrast | Serious on most routes | Remapped |
| P0 axe serious/critical (11 routes @ 390px) | 1–2 per route | **0 / 0** |
| site:a11y-baseline (header/search/filters/compare/finder) | 6 serious/critical | **0** |

P0 routes cleared: `/`, `/running`, `/running/shoes`, PDP, review, best, guide, brand, compare, finder, search.

---

## 2. Lime / brand contrast

**Keep lime (`#c8f542`) for:** `bg-accent`, borders, focus rings, fills on dark panels, badges with `text-accent-foreground`.

**Do not use lime as body/small text on white.**

| Change | Detail |
|---|---|
| `text-accent` on light | Maps to `--accent-ink` (`#3f5208`) |
| `text-accent` on dark chrome | Restored to lime via dark parent selectors (`bg-background-dark`, `#14181c`, `#12161c`, etc.) |
| `--link` | Darkened to `#1f57d6` for AA on white |
| `--muted` / `--subtle` | Slightly darkened for small-text AA |
| Soft white on dark | `text-white/40|45|50` remapped to ~0.68–0.72 opacity |

---

## 3. Mobile overflow

| Fix | Where |
|---|---|
| Explore-by-sport grid (was 20% columns overflowing labels) | `ExploreBySport.tsx` |
| Product carousel clipped; arrows inset | `BestProductsSection.tsx` |
| Finder tabs horizontal scroll + tablist | `FinderPanel.tsx` |
| Hero headline `break-words` + softer clamp | `HomeHero.tsx` |
| `overflow-x: clip` on html/body + home wrapper | `globals.css`, `page.tsx` |
| Best/Compare tables `overscroll-x-contain` + captions | Best + Compare tables |

**Result:** no `docOverflowX` on P0 at 390px.

---

## 4. Controls (keyboard / focus / labels / selected)

| Control | Fix |
|---|---|
| Mobile drawer | `inert` when closed (stops aria-hidden-focus) |
| Compare “show only differences” switch | `aria-label` |
| Spec toggle switch | `aria-label` |
| Finder home tabs | `role="tablist"` / `aria-selected` |
| Men/Women fit chips | Already `role="group"` / `aria-current`; selected = lime fill + dark foreground |
| Audience radios on PDP | Already `radiogroup` / `aria-checked` |
| Filter drawer | Already labelled dialog |

---

## 5. Headings / landmarks

- Layout already exposes `main` / `nav` / `header` / `footer`.
- Search keeps single `h1` then `h2` group labels.
- Trust prose links underlined (`.prose-kitletics a`) to avoid link-in-text-block.

---

## 6. Images / tables

- Decorative hero / social marks use empty or `aria-hidden` alts.
- Product cards retain product alt text.
- Wide Best/Compare tables scroll horizontally inside a contained wrapper (usable on mobile).

---

## 7. Re-run axe

```text
P0 @ 390px: overflowRoutes=[], routesWithSeriousCritical=0
site:a11y-baseline: header/search/filters/compare/finder = 0 violations
```

Machine-readable: `docs/prelaunch/data/11-a11y-responsive.json`.

---

## 8. Definition of done

- [x] Lime not used as unreadable text on white
- [x] Accessible dark text / links where needed; brand fills kept
- [x] Homepage (and P0) overflow fixed at ~390px
- [x] Controls labelled / focus-safe for nav, fit, compare, finder
- [x] Landmarks/headings intact; tables mobile-scrollable
- [x] No serious/critical on P0 launch routes in re-measure
- [x] Report filed

---

## Follow-ups

- Extend dark-parent lime restore list if new dark hex panels appear
- Optional keyboard QA pass on mega-menu hover panels (mouse-primary today)
