import type { MediaAsset } from "@/domain/shared/types";
import { LOGO_HERO_SRC_DENYLIST } from "@/content/logo-hero-src-denylist";

const LOGO_SRC_RE =
  /(?:^|\/)(?:brands\/|fallbacks\/)|[-_/]logo(?:[-_.]|$)|wordmark|brand[-_]?mark|logo[-_]?placeholder/i;

const LOGO_PROSE_RE =
  /\b(?:brand\s+logo|wordmark|logo\s+only|logo\s+placeholder|not a product photograph|kitletics illustration|illustration placeholder)\b/i;

/**
 * True when media is a brand logo / wordmark / icon — not product photography.
 * Safe for client + server (metadata + src denylist only; no filesystem).
 */
export function isLogoOrWordmarkMedia(
  media: MediaAsset | undefined | null,
): boolean {
  if (!media?.src) return false;
  if (media.type === "logo" || media.type === "icon") return true;
  if (LOGO_HERO_SRC_DENYLIST.has(media.src)) return true;
  if (LOGO_SRC_RE.test(media.src)) return true;

  const prose = [media.alt, media.attribution, media.source, media.credit]
    .filter(Boolean)
    .join(" ");
  if (prose && LOGO_PROSE_RE.test(prose)) return true;

  // Declared UI logo canvases (e.g. 200×48 wordmarks)
  if (media.width && media.height) {
    const area = media.width * media.height;
    const ratio =
      media.width > media.height
        ? media.width / media.height
        : media.height / media.width;
    if (area <= 48_000 && ratio >= 3) return true;
  }

  return false;
}
