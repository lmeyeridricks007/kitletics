import { NextResponse } from "next/server";
import { getProductById } from "@/repositories/products";
import { resolveOfferDestination } from "@/repositories/commerce";
import {
  parsePlacement,
  recordOfferClick,
  trackCommercialEvent,
} from "@/domain/commerce/analytics";

export const dynamic = "force-dynamic";

const NOINDEX = {
  "X-Robots-Tag": "noindex, nofollow",
  "Cache-Control": "no-store, max-age=0",
};

/**
 * Controlled outbound commercial redirect.
 * - Never accepts arbitrary ?url= / ?redirect= (open-redirect hardening)
 * - Only redirects to resolved Offer destinations (allowlisted retailer hosts)
 * - Skips Offers marked INVALID by URL validation overlay
 * - Attaches affiliate params only when program is active + env credentials exist
 * - Temporary redirect (302) — destinations change
 * - Records analytics click; X-Robots-Tag noindex
 * - Falls back to retailer URL if affiliate resolution fails host checks
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ offerId: string }> },
) {
  const { offerId } = await context.params;
  const url = new URL(request.url);

  // Reject open-redirect attempts — ignore any user-supplied destination
  if (url.searchParams.has("url") || url.searchParams.has("redirect")) {
    return NextResponse.json(
      { error: "invalid_request" },
      { status: 400, headers: NOINDEX },
    );
  }

  const placement = parsePlacement(url.searchParams.get("placement"));
  const pageType = url.searchParams.get("pageType") ?? undefined;

  const result = resolveOfferDestination(offerId);
  if (!result.ok) {
    trackCommercialEvent("affiliate_redirect_failed", {
      offerId,
      placement,
      pageType,
    });
    return NextResponse.json(
      { error: result.reason },
      { status: 404, headers: NOINDEX },
    );
  }

  // Unpublished / scheduled products must not leak via Offer redirects in production
  const product = getProductById(result.offer.productId, { isDev: false });
  if (!product) {
    return NextResponse.json(
      { error: "product_not_public" },
      { status: 404, headers: NOINDEX },
    );
  }

  const { resolved, offer, retailer } = result;

  // Block dangerous protocols / non-http(s)
  try {
    const dest = new URL(resolved.destinationUrl);
    if (dest.protocol !== "https:" && dest.protocol !== "http:") {
      return NextResponse.json(
        { error: "invalid_protocol" },
        { status: 400, headers: NOINDEX },
      );
    }
  } catch {
    return NextResponse.json(
      { error: "invalid_destination" },
      { status: 400, headers: NOINDEX },
    );
  }

  recordOfferClick({
    offerId: offer.id,
    productId: offer.productId,
    retailerId: retailer.id,
    region: offer.region,
    pageType,
    placement,
    isAffiliate: resolved.isAffiliate,
  });

  return NextResponse.redirect(resolved.destinationUrl, {
    status: 302,
    headers: NOINDEX,
  });
}
