/**
 * Machine + human Review backlog for lifecycle maintenance.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import type { ReviewPriority, ReviewCoverageStatus } from "@/domain/review-agent/types";

export interface ReviewBacklogItem {
  productId: string;
  productSlug: string;
  productName: string;
  brandId: string;
  categoryId: string;
  priority: ReviewPriority;
  status: ReviewCoverageStatus | "media-blocked" | "research-task" | "type-transition";
  reason: string;
  requiredAction: string;
  reviewId?: string;
}

export function writeReviewBacklog(
  items: ReviewBacklogItem[],
  opts?: { dir?: string },
): { jsonPath: string; mdPath: string } {
  const dir = opts?.dir ?? join(process.cwd(), "reports");
  mkdirSync(dir, { recursive: true });
  const jsonPath = join(dir, "review-backlog.json");
  const mdPath = join(dir, "review-backlog.md");

  const sorted = [...items].sort((a, b) => {
    const order: Record<ReviewPriority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };
    return order[a.priority] - order[b.priority] || a.productSlug.localeCompare(b.productSlug);
  });

  writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        count: sorted.length,
        items: sorted,
      },
      null,
      2,
    ),
    "utf8",
  );

  const lines = [
    `# Review backlog`,
    ``,
    `Generated: ${new Date().toISOString()}`,
    `Items: ${sorted.length}`,
    ``,
    `| Priority | Product | Category | Status | Reason | Action |`,
    `| --- | --- | --- | --- | --- | --- |`,
    ...sorted.map(
      (i) =>
        `| ${i.priority} | ${i.productSlug} | ${i.categoryId.replace(/^cat-/, "")} | ${i.status} | ${i.reason.replace(/\|/g, "/")} | ${i.requiredAction.replace(/\|/g, "/")} |`,
    ),
    ``,
  ];
  writeFileSync(mdPath, lines.join("\n"), "utf8");
  return { jsonPath, mdPath };
}
