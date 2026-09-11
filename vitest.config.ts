import { defineConfig } from "vitest/config";
import path from "node:path";

const alias = {
  "@": path.resolve(__dirname, "./src"),
};

/**
 * Fix 84 — split unit vs catalog-integration so parallel workers do not each
 * cold-build the full sitemap / Alternatives quality graph (~CPU thrash → 120s timeouts).
 *
 * Unit suite: normal workers, 60s timeout.
 * Catalog-integration: maxWorkers=1, fileParallelism=false, 120s timeout.
 * Standard `npm test` runs both — no developer CLI overrides required.
 */
export default defineConfig({
  resolve: { alias },
  test: {
    environment: "node",
    projects: [
      {
        resolve: { alias },
        test: {
          name: "unit",
          environment: "node",
          include: ["src/**/*.test.ts", "tests/**/*.test.ts"],
          exclude: [
            "tests/alternatives-indexability-unification.test.ts",
            "tests/sitemap-lastmod.test.ts",
            "tests/seo-indexation.test.ts",
            "tests/product-quality-assessor-consistency.test.ts",
            "tests/gear-hub.test.ts",
            "tests/comparison.test.ts",
            "tests/launch-eligibility.test.ts",
            "tests/editorial-readiness.test.ts",
            "tests/catalog.test.ts",
          ],
          // Contended catalog assemblies can approach ~60s under load; keep 120s
          // (previous default). Do NOT raise to 300s globally.
          testTimeout: 120_000,
          // Run before catalog-integration (different maxWorkers requires unique groupOrder).
          sequence: { groupOrder: 0 },
        },
      },
      {
        resolve: { alias },
        test: {
          name: "catalog-integration",
          environment: "node",
          include: [
            "tests/alternatives-indexability-unification.test.ts",
            "tests/sitemap-lastmod.test.ts",
            "tests/seo-indexation.test.ts",
            "tests/product-quality-assessor-consistency.test.ts",
            "tests/gear-hub.test.ts",
            "tests/comparison.test.ts",
            "tests/launch-eligibility.test.ts",
            "tests/editorial-readiness.test.ts",
            "tests/catalog.test.ts",
          ],
          setupFiles: ["./tests/helpers/warm-sitemap-setup.ts"],
          // One worker + no isolation: share immutable sitemap / signals caches
          // across these files (Vitest default isolate resets the module graph).
          maxWorkers: 1,
          fileParallelism: false,
          isolate: false,
          testTimeout: 120_000,
          hookTimeout: 180_000,
          // After unit suite finishes — avoids CPU thrash during cold sitemap warm.
          sequence: { groupOrder: 1 },
        },
      },
    ],
  },
});
