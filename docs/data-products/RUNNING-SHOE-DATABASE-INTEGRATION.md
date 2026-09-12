# Running Shoe Database — Ecosystem integration

Generated: 2026-09-11  
Path: `/running/shoes/database`  
Discovery helpers: `src/lib/running-shoe-database/discovery.ts`

## Goal

Discoverable from Running surfaces without sitewide spam. Explorer UX unchanged.

## Inbound discovery surfaces

| Surface | Label | How linked |
|---------|-------|------------|
| `/running` contextual subnav | Shoe Database | `contextual-nav` Running config |
| `/running/shoes*` contextual subnav | Shoe Database | Shoes domain config |
| Shoes primary mega-menu (Decide) | Shoe Database | `primary-menu-panels` |
| `/running` hub quick action + footer | Shoe Database | `sport-hub/config` |
| `/running/shoes` category hero + education | Shoe Database | `catalog/running-shoes` secondary CTA + “Market specs” factor |
| Running-shoe **Best Guides** | Shoe Database | `buyingHelpLinks` (+ ensure-merge for use-case overrides) |
| Key **Buying Guides** (allowlist + shoe category) | Shoe Database | One contextual CTA block — not pasted into every guide body |
| Running Shoe Finder results | Shoe Database | Sidebar discovery card |
| Compare (running-shoes category) | Shoe Database | Help cards |
| Sitemap | — | Included once at clean path |

**Not linked sitewide** (watches, fitness, racket, homepage chrome, etc.).

### Editorial policy

- One contextual blurb max per page (`SHOE_DATABASE_EDITORIAL_BLURB`)
- Best guides: link in buying-help list, not a repeated promo paragraph
- Buying guides: only allowlisted shoe explainers / shoe category

## Database → site

Result cards link to:

- Product (title, image, Product)
- Review (when present)
- Alternatives (when present)
- Compare (tray + deep link)
- Finder

Market Insights / Data Explorer segments deep-link to **filtered** database URLs.

## SEO

| Check | Status |
|-------|--------|
| Canonical | Always `https://kitletics.com/running/shoes/database` |
| Filtered query state | `noindex,follow` via `hasNonCanonicalQueryState` |
| Breadcrumbs | Home → Running → Shoes → Database |
| Sitemap | Clean path only (no facet URLs) |
| Orphan risk | Mitigated by hub, nav, category, guides, finder, compare |

## Inbound reference count (repo)

Re-run:

```bash
npx tsx --tsconfig tsconfig.json scripts/running-shoe-database-inbound-links.ts
rg -n '/running/shoes/database|SHOE_DATABASE_HREF|SHOE_DATABASE_DISCOVERY' src
```

Approximate **src** wiring (post-integration):

- Direct path literals + discovery constants across nav, hub, category, best, finder, compare, sitemap
- Plus runtime expansion: every running-shoe Best Guide page inherits the buying-help link

Exact greps vary with constants vs literals; treat **surfaces above** as the product inventory, not raw match count.

### Runtime page expansion (2026-09-11)

| Class | Count | Notes |
|-------|------:|-------|
| Running-shoe Best Guides inheriting buying-help link | **13** | All `cat-running-shoes` best guides |
| Buying guides with contextual database CTA | **12** | Allowlist + shoe-category guides |
| `site:audit:links --dry-run` | **READY** | BLOCKER/HIGH/MEDIUM/LOW **0** · routes **1170** |
