import type { NextConfig } from "next";
import { IMAGE_QUALITY_ALLOWLIST } from "./src/lib/media/image-delivery";

const securityHeaders = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  // Next.js "N" route indicator is a third-party overlay (dev only). Keep it
  // off the cookie/CTA corner so visual QA is not blocked; production is unaffected.
  devIndicators: {
    position: "bottom-right",
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 15.5+ warns (Next 16 requires) an explicit allow-list. Values are the
    // qualities actually requested: thumb 65, card 70, hero/default 75.
    qualities: [...IMAGE_QUALITY_ALLOWLIST],
    // Prefer mid sizes for cards; avoid serving 1920w into 280px cells.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [48, 64, 72, 96, 128, 160, 200, 256, 320, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "*.blob.vercel-storage.com",
      },
    ],
  },
  async rewrites() {
    const blobBase = process.env.MEDIA_BLOB_BASE_URL?.replace(/\/$/, "");
    if (!blobBase) return [];
    // Proxy /images/* → Vercel Blob (middleware does the same at the edge).
    return [
      {
        source: "/images/:path*",
        destination: `${blobBase}/images/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/racket/padel",
        destination: "/padel",
        permanent: false,
      },
      {
        source: "/training",
        destination: "/fitness",
        permanent: true,
      },
      {
        source: "/training/:path*",
        destination: "/fitness/:path*",
        permanent: true,
      },
      {
        source: "/hyrox",
        destination: "/fitness/hyrox",
        permanent: true,
      },
      // Do not blanket-redirect /hyrox/* — category shells redirect to
      // their canonical sport path via getCategoryHref in the app router.
      {
        source: "/authors/kitletics-editors",
        destination: "/authors/kitletics-editorial",
        permanent: true,
      },
      {
        source: "/products/adidas-courtstabil-padel",
        destination: "/products/adidas-courtquick-padel",
        permanent: true,
      },
      {
        source: "/products/adidas-courtstabil-padel/alternatives",
        destination: "/products/adidas-courtquick-padel/alternatives",
        permanent: true,
      },
      {
        source: "/reviews/adidas-courtstabil-padel",
        destination: "/reviews/adidas-courtquick-padel",
        permanent: true,
      },
      {
        source: "/finders",
        destination: "/tools?type=finder",
        permanent: false,
      },
      {
        source: "/finders/:path*",
        destination: "/tools?type=finder",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
