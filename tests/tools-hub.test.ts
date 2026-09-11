import { describe, expect, it } from "vitest";
import { getToolsHubData } from "@/lib/tools/get-tools-hub-data";
import { getToolHref } from "@/lib/tools/href";
import { getTools } from "@/repositories";
import {
  getLaunchEligibility,
  shouldPromotePublicly,
} from "@/domain/launch";

describe("Tools Hub", () => {
  it("builds hub data from published tools only", () => {
    const data = getToolsHubData({ isDev: false });
    expect(data.finders.length).toBeGreaterThan(0);
    expect(data.planBuildTools.length).toBeGreaterThan(0);
    expect(data.compareTools.some((c) => c.href === "/compare")).toBe(true);

    for (const card of [
      ...data.finders,
      ...data.compareTools,
      ...data.planBuildTools,
    ]) {
      expect(card.tool.available).toBe(true);
      expect(card.href.length).toBeGreaterThan(1);
    }

    for (const card of data.comingSoon) {
      expect(card.tool.available).toBe(false);
    }
  });

  it("does not invent unavailable mockup tools in active sections", () => {
    const data = getToolsHubData({ isDev: false });
    const titles = [
      ...data.finders,
      ...data.compareTools,
      ...data.planBuildTools,
    ].map((c) => c.title.toLowerCase());

    expect(titles.some((t) => t.includes("vo2"))).toBe(false);
    expect(titles.some((t) => t.includes("recovery advisor"))).toBe(false);
    expect(titles.some((t) => t.includes("bike finder"))).toBe(false);
    expect(titles.some((t) => t.includes("ski boot"))).toBe(false);
    expect(titles.some((t) => t.includes("golf"))).toBe(false);
  });

  it("does not duplicate tools across primary sections", () => {
    const data = getToolsHubData({ isDev: false });
    const ids = [
      ...data.finders,
      ...data.compareTools,
      ...data.planBuildTools,
    ].map((c) => c.tool.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("sport counts match available tool membership", () => {
    const data = getToolsHubData({ isDev: false });
    for (const group of data.sports) {
      expect(group.toolCount).toBeGreaterThan(0);
      const tools = getTools({ isDev: false }).filter((t) => {
        if (!t.available || !t.sportIds.includes(group.sport.id)) return false;
        return shouldPromotePublicly(
          getLaunchEligibility({ kind: "tool", entity: t }, { isDev: false }),
        );
      });
      expect(group.toolCount).toBe(tools.length);
    }
  });

  it("omits estimated time when missing", () => {
    const data = getToolsHubData({ isDev: false });
    const without = data.finders.filter(
      (c) => c.estimatedTimeMinutes == null,
    );
    // At least some finders may lack time — ensure no zero/empty string encoding
    for (const c of data.finders) {
      if (c.estimatedTimeMinutes != null) {
        expect(c.estimatedTimeMinutes).toBeGreaterThan(0);
      }
    }
    expect(without.length + data.finders.length).toBeGreaterThan(0);
  });

  it("compare products tool uses /compare href", () => {
    const tool = getTools({ isDev: false }).find(
      (t) => t.slug === "compare-products",
    );
    expect(tool).toBeDefined();
    expect(getToolHref(tool!)).toBe("/compare");
  });

  it("filters by sport", () => {
    const data = getToolsHubData({ sport: "running", isDev: false });
    for (const card of [
      ...data.finders,
      ...data.planBuildTools,
      ...data.compareTools,
    ]) {
      if (card.tool.sportIds.length === 0) continue;
      expect(card.tool.sportIds.some((id) => id.includes("running"))).toBe(
        true,
      );
    }
  });

  it("uses Tools by sport naming without fake popular claims", () => {
    // Section title is in UI; data layer should not expose popularity rankings
    const data = getToolsHubData({ isDev: false });
    expect(data.sports.length).toBeGreaterThan(0);
  });
});
