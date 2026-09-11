import { describe, expect, it } from "vitest";
import { products } from "@/content/products";
import { brands } from "@/content/brands";
import { getProducts } from "@/repositories";

function duplicates(ids: string[]): string[] {
  const counts = new Map<string, number>();
  for (const id of ids) counts.set(id, (counts.get(id) ?? 0) + 1);
  return [...counts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id, n]) => `${id}×${n}`);
}

describe("catalog unique IDs (data integrity)", () => {
  it("defines each product id exactly once", () => {
    expect(duplicates(products.map((p) => p.id))).toEqual([]);
  });

  it("defines each brand id exactly once", () => {
    expect(duplicates(brands.map((b) => b.id))).toEqual([]);
  });

  it("exposes each product id once via getProducts()", () => {
    const ids = getProducts({ isDev: true }).map((p) => p.id);
    expect(duplicates(ids)).toEqual([]);
    expect(ids.filter((id) => id === "prod-eleiko-sport-bumper")).toHaveLength(
      1,
    );
    expect(ids.filter((id) => id === "prod-mirafit-bumper-set")).toHaveLength(1);
  });
});
