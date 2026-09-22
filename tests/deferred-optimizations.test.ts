import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveProductImageSource } from "@/lib/media/resolve-media-url";

function src(rel: string) {
  return readFileSync(resolve(process.cwd(), rel), "utf8");
}

describe("Deferred index ISR shells", () => {
  const hubs = [
    "src/app/best/page.tsx",
    "src/app/brands/page.tsx",
    "src/app/reviews/page.tsx",
    "src/app/guides/page.tsx",
    "src/app/compare/page.tsx",
    "src/app/setups/page.tsx",
    "src/app/running/gear/page.tsx",
  ] as const;

  it("index hubs are ISR without RSC searchParams", () => {
    for (const file of hubs) {
      const source = src(file);
      expect(source, file).toMatch(/export const revalidate = 86400/);
      expect(source, file).not.toMatch(/searchParams/);
      expect(source, file).not.toMatch(/force-dynamic/);
      expect(source, file).not.toMatch(/getRequestRegion/);
    }
  });

  it("sport hubs no longer await gender searchParams", () => {
    const source = src("src/app/[sport]/page.tsx");
    expect(source).not.toMatch(/searchParams/);
    expect(source).not.toMatch(/genderRaw/);
  });

  it("database explorers do not await searchParams in metadata", () => {
    expect(src("src/app/padel/rackets/database/page.tsx")).not.toMatch(
      /searchParams/,
    );
    expect(src("src/app/running/shoes/database/page.tsx")).not.toMatch(
      /searchParams/,
    );
  });

  it("middleware noindexes query URLs on index hubs", () => {
    const mw = src("src/middleware.ts");
    expect(mw).toMatch(/pathname === "\/best"/);
    expect(mw).toMatch(/pathname === "\/reviews"/);
    expect(mw).toMatch(/pathname === "\/compare"/);
  });

  it("client hubs do not import server index shells", () => {
    const clients = [
      "src/components/reviews-hub/ReviewsIndexClient.tsx",
      "src/components/best-hub/BestIndexClient.tsx",
      "src/components/brands-hub/BrandsHubClient.tsx",
      "src/components/guides-hub/GuidesIndexClient.tsx",
      "src/components/setups-hub/SetupsIndexClient.tsx",
      "src/components/compare/CompareIndexClient.tsx",
      "src/components/running-gear/RunningGearHubClient.tsx",
    ] as const;
    for (const file of clients) {
      const source = src(file);
      expect(source, file).not.toMatch(/get-[\w-]+-index-shell/);
      expect(source, file).not.toMatch(/from ["']@\/lib\/running-gear-hub["']/);
    }
  });
});

describe("Direct Blob image mapping", () => {
  it("leaves relative /images paths unchanged without a Blob base", () => {
    const prev = process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
    delete process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
    delete process.env.MEDIA_BLOB_BASE_URL;
    expect(resolveProductImageSource("/images/running/products/foo-hero.jpg")).toBe(
      "/images/running/products/foo-hero.jpg",
    );
    if (prev) process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL = prev;
  });

  it("maps /images to the public Blob origin when configured", () => {
    const prev = process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
    process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL =
      "https://example.public.blob.vercel-storage.com";
    expect(resolveProductImageSource("/images/running/products/foo-hero.jpg")).toBe(
      "https://example.public.blob.vercel-storage.com/images/running/products/foo-hero.jpg",
    );
    expect(resolveProductImageSource("https://cdn.example/x.jpg")).toBe(
      "https://cdn.example/x.jpg",
    );
    if (prev) process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL = prev;
    else delete process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
  });

  it("does not use server-only MEDIA_BLOB_BASE_URL for src mapping", () => {
    const prevPublic = process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
    const prevServer = process.env.MEDIA_BLOB_BASE_URL;
    delete process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL;
    process.env.MEDIA_BLOB_BASE_URL =
      "https://example.public.blob.vercel-storage.com";
    expect(resolveProductImageSource("/images/running/products/foo-hero.jpg")).toBe(
      "/images/running/products/foo-hero.jpg",
    );
    if (prevPublic) process.env.NEXT_PUBLIC_MEDIA_BLOB_BASE_URL = prevPublic;
    if (prevServer) process.env.MEDIA_BLOB_BASE_URL = prevServer;
    else delete process.env.MEDIA_BLOB_BASE_URL;
  });
});
