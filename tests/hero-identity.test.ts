import { describe, expect, it } from "vitest";
import {
  ocrConflictsWithProduct,
  productIdentityNeedles,
  productGeneration,
  isIdentityOcrCategorySlug,
} from "../scripts/lib/hero-identity";
import type { Product } from "@/domain/products/types";

function stubProduct(partial: Partial<Product> & Pick<Product, "id" | "slug" | "fullName" | "brandId">): Product {
  return {
    status: "published",
    categoryId: "cat-running-shoes",
    sportIds: ["sport-running"],
    ...partial,
  } as Product;
}

describe("hero identity OCR matching", () => {
  it("marks watches and dumbbells as OCR-eligible categories", () => {
    expect(isIdentityOcrCategorySlug("running-shoes")).toBe(true);
    expect(isIdentityOcrCategorySlug("gps-watches")).toBe(true);
    expect(isIdentityOcrCategorySlug("adjustable-dumbbells")).toBe(true);
    expect(isIdentityOcrCategorySlug("running-clothing")).toBe(false);
  });

  const cumulus = stubProduct({
    id: "prod-cumulus-27",
    slug: "asics-gel-cumulus-27",
    fullName: "ASICS GEL-Cumulus 27",
    brandId: "brand-asics",
  });
  const kayano = stubProduct({
    id: "prod-kayano-32",
    slug: "asics-gel-kayano-32",
    fullName: "ASICS GEL-Kayano 32",
    brandId: "brand-asics",
  });
  const catalog = [cumulus, kayano];

  it("builds compact identity needles", () => {
    const needles = productIdentityNeedles(cumulus);
    expect(needles.some((n) => n.includes("CUMULUS27"))).toBe(true);
  });

  it("flags GT-4000 OCR (incl. 8T misread) on Cumulus", () => {
    const hit = ocrConflictsWithProduct(cumulus, "8T-4000", catalog);
    expect(hit.conflict).toBe(true);
    expect(hit.detail).toMatch(/gt-4000/i);
  });

  it("flags Kayano OCR on Cumulus", () => {
    const hit = ocrConflictsWithProduct(cumulus, "GEL-KAYANO 32\nPureGEL", catalog);
    expect(hit.conflict).toBe(true);
    expect(hit.detail).toMatch(/kayano/i);
  });

  it("accepts foam tech text without model conflict", () => {
    const hit = ocrConflictsWithProduct(cumulus, "PureGEL\nFFBlast+", catalog);
    expect(hit.conflict).toBe(false);
  });

  it("accepts matching Cumulus OCR", () => {
    const hit = ocrConflictsWithProduct(cumulus, "GEL-CUMULUS 27", catalog);
    expect(hit.conflict).toBe(false);
  });

  it("flags Glycerin OCR on Adrenaline", () => {
    const adrenaline = stubProduct({
      id: "prod-adrenaline-gts-25",
      slug: "brooks-adrenaline-gts-25",
      fullName: "Brooks Adrenaline GTS 25",
      brandId: "brand-brooks",
    });
    const glycerin = stubProduct({
      id: "prod-glycerin-22",
      slug: "brooks-glycerin-22",
      fullName: "Brooks Glycerin 22",
      brandId: "brand-brooks",
    });
    const hit = ocrConflictsWithProduct(adrenaline, "GLYCERIN\nBROOKS", [
      adrenaline,
      glycerin,
    ]);
    expect(hit.conflict).toBe(true);
  });

  it("flags generation mismatch TRIUMPH 24 vs 22", () => {
    const triumph = stubProduct({
      id: "prod-triumph-22",
      slug: "saucony-triumph-22",
      fullName: "Saucony Triumph 22",
      brandId: "brand-saucony",
    });
    const hit = ocrConflictsWithProduct(triumph, "TRIUMPH 24", [triumph]);
    expect(hit.conflict).toBe(true);
    expect(hit.detail).toMatch(/24/);
  });

  it("accepts SelectTech 1090 when OCR truncates to 10 but full 1090 is present", () => {
    const selecttech = stubProduct({
      id: "prod-bowflex-1090",
      slug: "bowflex-selecttech-1090",
      fullName: "Bowflex SelectTech 1090",
      brandId: "brand-bowflex",
    });
    const hit = ocrConflictsWithProduct(
      selecttech,
      "SelectTech10F\n80\nSelectTech1090",
      [selecttech],
    );
    expect(hit.conflict).toBe(false);
  });

  it("accepts SoftFlask 250 when OCR could read 25 from capacity print", () => {
    const flask = stubProduct({
      id: "prod-hydrapak-softflask-250",
      slug: "hydrapak-softflask-250",
      fullName: "HydraPak SoftFlask 250",
      brandId: "brand-hydrapak",
    });
    const hit = ocrConflictsWithProduct(
      flask,
      "SOFTFLASK\n250 ml / 8.5 fl oz",
      [flask],
    );
    expect(hit.conflict).toBe(false);
  });

  it("accepts Enduro 3 when OCR glues weather 32° onto the name", () => {
    const enduro = stubProduct({
      id: "prod-enduro-3",
      slug: "garmin-enduro-3",
      fullName: "Garmin Enduro 3",
      brandId: "brand-garmin",
    });
    const hit = ocrConflictsWithProduct(enduro, "ENDURO\n*32", [enduro]);
    expect(hit.conflict).toBe(false);
  });

  it("builds watch and dumbbell OCR needles", () => {
    const watch = stubProduct({
      id: "prod-forerunner-970",
      slug: "garmin-forerunner-970",
      fullName: "Garmin Forerunner 970",
      brandId: "brand-garmin",
      categoryId: "cat-gps-watches",
    });
    const db = stubProduct({
      id: "prod-bowflex-selecttech-1090",
      slug: "bowflex-selecttech-1090",
      fullName: "Bowflex SelectTech 1090",
      brandId: "brand-bowflex",
      categoryId: "cat-adjustable-dumbbells",
    });
    expect(productIdentityNeedles(watch).some((n) => n.includes("FR970"))).toBe(
      true,
    );
    expect(
      productIdentityNeedles(db).some((n) => n.includes("SELECTTECH1090")),
    ).toBe(true);
  });

  it("ignores tennis string gauge OCR as generation (16/1.28)", () => {
    const blackCode = stubProduct({
      id: "prod-tecnifibre-black-code",
      slug: "tecnifibre-black-code-1-28",
      fullName: "Tecnifibre Black Code 1.28",
      brandId: "brand-tecnifibre",
      categoryId: "cat-tennis-strings",
    });
    expect(productGeneration(blackCode)).toBeNull();
    const hit = ocrConflictsWithProduct(
      blackCode,
      "Tecnifibre\nTHERMOCORE\nBLACK CODE\n16/1.28\nENGINEERED, DESIGNED AND MADE IN FRANCE",
      [blackCode],
    );
    expect(hit.conflict).toBe(false);
  });

  it("flags Caldera OCR on Glycerin", () => {
    const glycerin = stubProduct({
      id: "prod-glycerin-22",
      slug: "brooks-glycerin-22",
      fullName: "Brooks Glycerin 22",
      brandId: "brand-brooks",
    });
    const hit = ocrConflictsWithProduct(glycerin, "BROOKS\nCALDERA", [glycerin]);
    expect(hit.conflict).toBe(true);
  });
});
