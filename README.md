# Kitletics

**The place to find the right gear for how you train, compete and play.**

Structured sports equipment discovery, recommendation, comparison and buying platform.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind CSS v4
- Zod content validation
- Static-first, repository-backed content engine

## Commands

```bash
npm install
npm run dev
npm run content:validate
npm run build
```

## Architecture

See [docs/content-architecture.md](./docs/content-architecture.md).

```
src/
  domain/         # Typed entities + Zod schemas
  content/        # Seed data (not imported by UI)
  repositories/   # Publication-gated query layer
  lib/publishing/ # Central publish resolver
  lib/seo/        # Metadata + JSON-LD
  app/            # Routes
```

## Status

- Prompt 1: design system, nav, homepage foundation
- Prompt 2: content engine, taxonomy, repos, routing, validation, SEO
