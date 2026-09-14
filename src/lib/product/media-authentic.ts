import type { MediaAsset } from "@/domain/shared/types";
import { isLogoOrWordmarkMedia } from "@/lib/product/logo-media";

/** True when media is a real product photograph (not Kitletics illustration / SVG fallback / brand logo). */
export function isAuthenticProductMedia(
  media: MediaAsset | undefined | null,
): boolean {
  if (!media?.src) return false;
  if (media.src.includes("/fallbacks/")) return false;
  if (media.src.endsWith(".svg")) return false;
  if (media.licence === "kitletics-owned") return false;
  if (isLogoOrWordmarkMedia(media)) return false;
  if (
    media.attribution?.toLowerCase().includes("not a product photograph") ||
    media.attribution?.toLowerCase().includes("illustration")
  ) {
    return false;
  }
  return (
    media.src.includes("-hero.") ||
    media.licence === "manufacturer-marketing" ||
    media.licence === "retailer-authorized" ||
    Boolean(media.sourceUrl)
  );
}
