# Running Launch Readiness

Generated: 2026-08-30

## RUNNING LAUNCH STATUS: **READY WITH MINOR ISSUES**

### Executive summary

Running operates as a complete Kitletics vertical for discovery → Finder → compare → Best Guides → Product → Offers → tools. Automated gates pass (tsc, 230 tests, content validate 0 errors, catalog publishability for all Running categories except future Nutrition, production build). Remaining material gap is **licensed product photography**; commercial Offer depth outside NL; and thin Review coverage. No blockers.

### Automated gates

| Gate | Result |
| --- | --- |
| TypeScript | pass |
| Vitest | 230 pass |
| content:validate | 0 errors |
| catalog:qa | shoes/watches/HRM/lights/… ready; nutrition future |
| build | pass |
| `npm run qa:running` | orchestrates the above + report generation |

### Catalog

- Total Running Products (published): **122**
- By category: see `running-catalog-qa.md`
- Current / previous-gen: healthy mix; discontinued not masquerading as current Best winners
- Required field completeness (launch-core shoes): **100%** publishability gate
- Products fixed this pass: lights + 3 shoes missing drop
- Duplicates removed: none found requiring merge

### Media

- Products with hero: **122/122** (SVG category fallbacks)
- Dummy Unsplash / fake branded photos: **none**
- Honest “product image unavailable” labeling: yes
- Official photos: **not yet licensed** (HIGH)

### Recommendation / Finder

- 12 launch scenario tests: pass
- Hard constraints (wide / trail): covered
- Affiliate independence: pass
- Missing-data inflation: existing Finder confidence logic retained

### Editorial

- Best Guides / Buying Guides / Comparisons / Setups: targets met
- Reviews: 2 published; scheduled deep-dive correctly 404 in production
- Stale “2024 Best …” titles: not present as live current guides

### Relationships

- Approved edges: ~164
- High-value shoes covered; accessory orphans remain (LOW)

### Commerce

- Offer coverage: NL strong; UK/US improved for flagships; other regions thin
- Redirect security: pass
- Active affiliates: 0

### SEO / security

- Custom 404: yes
- Sitemap excludes drafts/scheduled/`/go`
- robots disallow `/go/`
- Product JSON-LD: no Kitletics Score as aggregateRating; no stale Offer schema; no SVG fallback as image
- Scheduled content leak tests: pass

### UX / a11y / performance

- No Lighthouse run in this pass (report as remaining LOW/MEDIUM tooling)
- Design system not redesigned; ProductImageFallback clarified

### Engineering

- TypeScript / tests / build: pass
- Launch manifest: `src/content/running/launch-manifest.ts`
- QA command: `npm run qa:running`

---

### Remaining issue table

| Severity | Area | Issue | Why unresolved | Required action |
| -------- | ---- | ----- | -------------- | --------------- |
| HIGH | Media | No licensed manufacturer product photos | Licensing / brand approval | Source official assets; keep SVG until then |
| MEDIUM | Commerce | Thin Offers outside NL | No live feeds / credentials | Expand Offers; enroll affiliates |
| MEDIUM | Editorial | Thin Review coverage | Prefer evidence over filler | Expert Research reviews for flagships |
| LOW | Legal | Terms/Privacy interim | Counsel review | Replace before paid acquisition |
| LOW | Graph | Accessory relationship orphans | Prioritized core categories | Expand graph |
| LOW | Perf | No Lighthouse/E2E journey capture this pass | Time / tooling | Run Playwright + CWV on staging |

### Manual / external actions

- Affiliate network approval + env tags
- Product image licensing
- Legal counsel for Terms/Privacy
- Live Offer feeds (Amazon PA-API / Awin feeds)

### Recommended next actions

1. License official photography for launch-core shoes + watches  
2. Expand regional Offers for Best Guide winners  
3. Publish Expert Research reviews for Novablast 6, Ghost 18, Forerunner 970, Vaporfly 4  
4. Counsel-reviewed legal pages before marketing spend  

---

**RUNNING LAUNCH STATUS: READY WITH MINOR ISSUES**

**Blockers:** none

**Why not READY:** unresolved HIGH media gap (honest fallbacks exist; real product photos still required for premium launch presentation).
