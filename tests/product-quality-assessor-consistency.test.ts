import { describe, expect, it } from "vitest";
import {
  assessProductLaunchQuality,
  getLaunchEligibility,
  PRODUCT_WHAT_IS_THIS_MIN_CHARS,
} from "@/domain/launch";
import { getProductBySlug, getProducts } from "@/repositories/products";
import { isSoftGatedCategory } from "@/lib/navigation/category-href";
import { getCategoryById } from "@/repositories/sports";

const PROD = { isDev: false as const };

describe("product quality assessor consistency (Fix 34)", () => {
  it("uses domain assessor as SoT for Rebel v4 after genuine catalog enrichment", () => {
    const product = getProductBySlug("new-balance-fuelcell-rebel-v4", PROD);
    expect(product).toBeTruthy();
    const assessed = assessProductLaunchQuality(product!, PROD);
    expect(assessed.quality).toBe("LAUNCH_READY");
    expect(assessed.decisionFlags.whatIsThis).toBe(true);
    expect(
      (product!.shortDescription ?? "").trim().length,
    ).toBeGreaterThanOrEqual(PRODUCT_WHAT_IS_THIS_MIN_CHARS);
    expect(assessed.decisionFlags.howDiffers).toBe(true);
    expect(assessed.decisionFlags.canCompare).toBe(true);

    const elig = getLaunchEligibility(
      { kind: "product", entity: product! },
      PROD,
    );
    expect(elig.quality).toBe(assessed.quality);
    expect(elig.disposition).toBe("INDEXABLE");
  });

  it("soft-gated overlay changes disposition only, not quality class inventively", () => {
    expect(isSoftGatedCategory("padel-accessories")).toBe(true);
    expect(isSoftGatedCategory("padel-clothing")).toBe(true);

    const product = getProductBySlug("body-glide-original", PROD);
    expect(product).toBeTruthy();
    const category = getCategoryById(product!.categoryId, PROD);
    expect(category && isSoftGatedCategory(category)).toBe(false);

    const assessed = assessProductLaunchQuality(product!, PROD);
    const elig = getLaunchEligibility(
      { kind: "product", entity: product! },
      PROD,
    );

    expect(elig.quality).toBe(assessed.quality);
    expect(elig.reasons.some((r) => r.code === "soft_gated_category")).toBe(
      false,
    );
  });

  it("domain quality matches eligibility quality for all Running products", () => {
    const running = getProducts(PROD).filter((p) =>
      p.sportIds.includes("sport-running"),
    );
    const mismatches: string[] = [];
    for (const product of running) {
      const assessed = assessProductLaunchQuality(product, PROD);
      const elig = getLaunchEligibility(
        { kind: "product", entity: product },
        PROD,
      );
      if (elig.disposition === "HIDDEN_404" && assessed.quality === "BLOCKED") {
        continue;
      }
      if (elig.quality !== assessed.quality) {
        mismatches.push(
          `${product.slug}: assessor=${assessed.quality} elig=${elig.quality}`,
        );
      }
    }
    expect(mismatches).toEqual([]);
  });
});
