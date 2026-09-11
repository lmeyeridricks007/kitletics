import { ImageResponse } from "next/og";
import { siteConfig } from "@/content/config";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Default Open Graph image for pages without a custom ogImage. */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 72,
          background: "#0f1218",
          color: "#ffffff",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, letterSpacing: -1 }}>
          {siteConfig.name}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 32,
            color: "#c4c9d4",
            maxWidth: 900,
            lineHeight: 1.35,
          }}
        >
          {siteConfig.tagline}
        </div>
      </div>
    ),
    { ...size },
  );
}
