import type { Tool } from "@/domain/tools/types";

/** Canonical public href for a Tool entity. */
export function getToolHref(tool: Pick<Tool, "slug" | "href">): string {
  if (tool.href) return tool.href;
  return `/tools/${tool.slug}`;
}

export function sortToolsByHubPriority(tools: Tool[]): Tool[] {
  return [...tools].sort((a, b) => {
    const fa = a.featured ? 1 : 0;
    const fb = b.featured ? 1 : 0;
    if (fa !== fb) return fb - fa;
    const pa = a.priority ?? 0;
    const pb = b.priority ?? 0;
    if (pa !== pb) return pb - pa;
    return a.name.localeCompare(b.name);
  });
}
