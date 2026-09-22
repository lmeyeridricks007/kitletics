import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/go/", "/api/", "/admin/", "/preview/", "/search"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
