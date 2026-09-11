---
name: site-quality-audit
description: >-
  Run Kitletics SiteQualityAgent audits for SEO, technical SEO, content depth,
  performance readiness, accessibility, schema, internal links, media, trust,
  affiliate neutrality, and backlink opportunities. Use when the user asks for
  a site audit, launch readiness, SEO audit, CWV, crawl/indexation, or growth
  quality check. Prefer npm run site:audit.
---

# SiteQualityAgent

Not an SEO copywriting bot — the Kitletics **site quality owner**.

## Run

```bash
npm run site:audit
npm run site:audit -- --mode=full --fix
npm run site:audit -- --mode=launch
```

Canonical report: `docs/site-quality-audit.md`

## After a run

1. Read BLOCKER/HIGH first
2. Apply `--mode=full --fix` for safe auto-fixes
3. Re-run
4. Leave editorial/backlink/manual items in Remaining Manual Work

## Do not

- Fabricate backlinks or SEO scores as authority metrics
- Keyword-stuff titles/H2s
- Auto-fix editorial strategy or ambiguous canonicals
