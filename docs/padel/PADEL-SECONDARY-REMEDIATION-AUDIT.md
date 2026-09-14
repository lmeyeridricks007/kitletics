# Padel secondary remediation audit

**As of:** 2026-09-14  
**Scope:** Remaining launch blockers after media remediation (schema leaks, review identity, tests, SEO shells, inventory, a11y, mobile).  
**Final GO:** **NOT declared** — requires a full rendered re-audit after this pass.

Evidence: `docs/padel/data/PADEL-A11Y-MOBILE.json`

---

## BEFORE → AFTER

| Metric | BEFORE (final go-live) | AFTER |
|--------|------------------------|-------|
| Public `genderFit` **visible** text | **45** | **0** |
| `genderFit` in HTML source (RSC/spec JSON) | yes | **4** pages still carry key in hydration payload (not visible); facets use public key `fit` |
| Other raw schema keys in Best public copy | risk | **0** |
| Review identity mismatches | **1** | **0** (Courtquick unified) |
| SEO orphan shells (false “accessories held”) | fail | Accessories **VALID_INDEXABLE**; clothing held; other shells absent |
| `/padel/collections` inventory gap | untracked 200 | **VALID_PUBLIC_SURFACE** in sitemap |
| a11y serious | not audited | **0** |
| a11y critical | not audited | **0** |
| Mobile horizontal overflow blockers | not signed off | **0** |
| Test failures | 3 known + commerce floors | **0** (925/925) |

---

## 1. genderFit / raw schema keys

**Cause:** Best shoe guides printed `genderFit` in copy; facet/config used the schema key in UI payload.

**Fix:**
- Rewrote Best guide copy to fit / men’s last / women’s last
- Spec label **Fit**; public facet key **`fit`** (maps → `genderFit` internally)
- Collections contrast improved (was only serious axe hit)

**Visible text:** 0 across representative crawl.  
**Residual:** 4 pages still include `genderFit` inside product `specifications` JSON in HTML source (PDP/Best/review/compare hydration). Not user-visible. Full source-zero would require public DTO scrubbing of product specs.

---

## 2. Courtstabil / Courtquick identity

**Canonical truth:** Adidas **Courtquick** Padel (legacy id `prod-adidas-courtstabil`).

| Surface | Value |
|---------|-------|
| Product slug | `adidas-courtquick-padel` |
| Review slug / title | `adidas-courtquick-padel` / Adidas Courtquick Padel Review |
| Hero | Courtquick packshot restored + specialist PDP source |
| Redirects | old `…-courtstabil-padel` → Courtquick (301) |

---

## 3. Hub nav

Overflow UX intentional: soft goods on primary rail; Finder / Guides / Database discoverable in overflow. Tests updated accordingly.

---

## 4. Accessories + SEO shells

| Path | Classification |
|------|----------------|
| `/padel/accessories` | VALID_INDEXABLE |
| `/padel/clothing` | HELD / soft-gated |
| `/hyrox/shoes`, `/racket/padel`, `/tools/compare-products`, `/search`, `/tennis`, `/hyrox` | correctly absent |

---

## 5. `/padel/collections`

**VALID_PUBLIC_SURFACE** — sitemap index + collection detail URLs; hub already linked.

---

## 6. a11y / mobile

Crawl: 18 representative URLs @ desktop + 390px mobile (`scripts/tmp/padel-a11y-mobile.mjs`).

| Gate | Required | Result |
|------|----------|--------|
| axe serious | 0 | **0** |
| axe critical | 0 | **0** |
| mobile overflow pages | 0 | **0** |
| visible genderFit | 0 | **0** |

Keyboard: Tab reaches focusable chrome on sampled pages.

---

## 7. CI gate

| Step | Result |
|------|--------|
| `rm -rf .next` | OK |
| `npm run lint` | **PASS** (0 errors; 9 warnings in `scripts/tmp/*`) |
| `npm run typecheck` | **PASS** |
| `npm test` | **PASS** 925/925 |
| `npm run build` | **PASS** |

Lint warnings: unused vars in temporary padel audit scripts only.

Commerce test floors updated to match MEDIA_VERIFIED published set (quality > inflated URL counts).

---

## BLOCKER / HIGH

Secondary blockers from the final go-live audit addressed for this scope:

- genderFit visible leaks  
- Courtquick identity  
- hub / accessories / SEO tests  
- collections inventory  
- a11y serious/critical  
- mobile overflow  
- CI green  

**Still not final GO:** full production HTML re-audit of the whole Padel URL universe (media zeros + secondary zeros together) has not been re-run as one sealed pass.

**Padel GO: not declared.**
