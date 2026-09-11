#!/usr/bin/env tsx
/**
 * Product onboarding CLI
 *
 * npm run product:onboard -- --brand=ASICS --model="Novablast 7" --category=running-shoes
 * npm run product:discover -- --brand=ASICS --sport=running
 * npm run catalog:discover -- --sport=running --category=running-shoes
 * npm run product:review
 * npm run product:publish -- --session=onb-xxxx
 * npm run product:refresh -- --productId=prod-novablast-6
 */
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { productFamilies } from "@/content/families";
import {
  approveSession,
  discoverBrandCatalog,
  discoverMarketGaps,
  onboardExplicitProduct,
  publishApprovedSession,
  refreshProduct,
} from "@/domain/onboarding/orchestrator";
import {
  createFixtureResearchProvider,
  FIXTURE_ASICS_LINEUP,
  FIXTURE_NOVABLAST_7,
} from "@/domain/onboarding/fixtures";
import {
  listSessions,
  loadSession,
  queueSummary,
  renderSessionReportMarkdown,
  ensureStagingDirs,
} from "@/domain/onboarding/staging";

function arg(name: string): string | undefined {
  const prefix = `--${name}=`;
  const hit = process.argv.find((a) => a.startsWith(prefix));
  if (hit) return hit.slice(prefix.length);
  const idx = process.argv.indexOf(`--${name}`);
  if (idx >= 0) return process.argv[idx + 1];
  return undefined;
}

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

const command = process.argv[2] ?? "help";
const catalog = {
  products,
  brands,
  families: productFamilies,
};

ensureStagingDirs();

async function main() {
  switch (command) {
    case "onboard":
    case "product:onboard": {
      const brand = arg("brand");
      const model = arg("model");
      if (!brand || !model) {
        console.error("Required: --brand=... --model=...");
        process.exit(1);
      }
      const session = await onboardExplicitProduct(
        {
          brand,
          model,
          category: arg("category") ?? "running-shoes",
          sport: arg("sport") ?? "running",
          dryRun: flag("dry-run"),
          publish: flag("publish"),
          provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
        },
        catalog,
      );
      console.log(renderSessionReportMarkdown(session));
      console.log(`Session: ${session.id} → status ${session.status}`);
      console.log(
        "Note: default provider is fixture (no live web). Swap ResearchProvider for production research.",
      );
      break;
    }
    case "discover":
    case "product:discover": {
      const brand = arg("brand");
      if (!brand) {
        console.error("Required: --brand=...");
        process.exit(1);
      }
      const session = discoverBrandCatalog(
        {
          brand,
          sport: arg("sport") ?? "running",
          category: arg("category"),
          dryRun: flag("dry-run"),
          limit: arg("limit") ? Number(arg("limit")) : 20,
          knownLineup: FIXTURE_ASICS_LINEUP,
        },
        catalog,
      );
      console.log(renderSessionReportMarkdown(session));
      break;
    }
    case "catalog:discover": {
      const session = discoverMarketGaps(FIXTURE_ASICS_LINEUP, catalog, {
        category: arg("category") ?? "running-shoes",
        dryRun: flag("dry-run"),
        limit: arg("limit") ? Number(arg("limit")) : 20,
      });
      console.log(renderSessionReportMarkdown(session));
      break;
    }
    case "refresh":
    case "product:refresh": {
      const productId = arg("productId");
      if (!productId) {
        console.error("Required: --productId=...");
        process.exit(1);
      }
      const session = await refreshProduct(
        {
          productId,
          dryRun: flag("dry-run"),
          provider: createFixtureResearchProvider(FIXTURE_NOVABLAST_7),
        },
        catalog,
      );
      console.log(renderSessionReportMarkdown(session));
      break;
    }
    case "review":
    case "product:review": {
      const summary = queueSummary();
      console.log("=== Onboarding queue ===");
      for (const [status, count] of Object.entries(summary)) {
        console.log(`${status.padEnd(16)} ${count}`);
      }
      const sessions = listSessions();
      for (const s of sessions.slice(0, 20)) {
        console.log(
          `- ${s.id} [${s.status}] ${s.requestedBrand ?? ""} ${s.requestedModel ?? s.candidateProduct?.fullName ?? ""}`,
        );
      }
      break;
    }
    case "approve": {
      const id = arg("session");
      if (!id) {
        console.error("Required: --session=...");
        process.exit(1);
      }
      const session = loadSession(id);
      if (!session) {
        console.error("Session not found");
        process.exit(1);
      }
      const approved = approveSession(session);
      console.log(`Approved ${approved.id}`);
      break;
    }
    case "publish":
    case "product:publish": {
      const id = arg("session");
      if (!id) {
        console.error("Required: --session=...");
        process.exit(1);
      }
      let session = loadSession(id);
      if (!session) {
        console.error("Session not found");
        process.exit(1);
      }
      if (session.status !== "approved") {
        if (flag("approve-first")) {
          session = approveSession(session);
        } else {
          console.error("Session not approved. Pass --approve-first or run approve.");
          process.exit(1);
        }
      }
      const published = publishApprovedSession(session);
      console.log(renderSessionReportMarkdown(published));
      break;
    }
    default:
      console.log(`Usage:
  npx tsx scripts/product-onboard.ts onboard --brand=ASICS --model="Novablast 7"
  npx tsx scripts/product-onboard.ts discover --brand=ASICS
  npx tsx scripts/product-onboard.ts catalog:discover --category=running-shoes
  npx tsx scripts/product-onboard.ts refresh --productId=prod-novablast-6
  npx tsx scripts/product-onboard.ts review
  npx tsx scripts/product-onboard.ts approve --session=onb-...
  npx tsx scripts/product-onboard.ts publish --session=onb-... --approve-first

Flags: --dry-run  --limit=N  --category=...  --sport=...
`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
