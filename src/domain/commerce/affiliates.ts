import type {
  AffiliateProgram,
  Offer,
  ResolvedCommercialUrl,
  Retailer,
} from "@/domain/commerce/types";

export interface AffiliateProviderInput {
  offer: Offer;
  retailer: Retailer;
  program?: AffiliateProgram;
  /** Tracking ID from env — never log */
  trackingId?: string;
}

export interface AffiliateProvider {
  id: string;
  resolveUrl(input: AffiliateProviderInput): ResolvedCommercialUrl | null;
}

function isSafeHttpUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

/** Pass-through — normal retailer URL, never invents affiliate params */
export const passthroughProvider: AffiliateProvider = {
  id: "passthrough",
  resolveUrl({ offer, retailer }) {
    if (!isSafeHttpUrl(offer.url)) return null;
    return {
      destinationUrl: offer.url,
      isAffiliate: false,
      retailerId: retailer.id,
      offerId: offer.id,
    };
  },
};

/**
 * Amazon Associates — only when tracking ID present for the program region.
 * Does not guess tags.
 */
export const amazonAffiliateProvider: AffiliateProvider = {
  id: "amazon",
  resolveUrl({ offer, retailer, program, trackingId }) {
    if (!program || program.status !== "active" || !trackingId) {
      return passthroughProvider.resolveUrl({ offer, retailer, program });
    }
    if (!isSafeHttpUrl(offer.url)) return null;
    try {
      const u = new URL(offer.url);
      u.searchParams.set("tag", trackingId);
      return {
        destinationUrl: u.toString(),
        isAffiliate: true,
        network: "amazon",
        retailerId: retailer.id,
        offerId: offer.id,
        programId: program.id,
      };
    } catch {
      return passthroughProvider.resolveUrl({ offer, retailer, program });
    }
  },
};

/** Template-based deep link: replace {{url}} and {{id}} */
export const templateAffiliateProvider: AffiliateProvider = {
  id: "template",
  resolveUrl({ offer, retailer, program, trackingId }) {
    if (
      !program ||
      program.status !== "active" ||
      !program.trackingTemplate ||
      !trackingId
    ) {
      return passthroughProvider.resolveUrl({ offer, retailer, program });
    }
    if (!isSafeHttpUrl(offer.url)) return null;
    const encoded = encodeURIComponent(offer.url);
    const dest = program.trackingTemplate
      .replaceAll("{{url}}", encoded)
      .replaceAll("{{id}}", trackingId)
      .replaceAll("{{asin}}", offer.externalIds?.asin ?? "");
    if (!isSafeHttpUrl(dest)) {
      return passthroughProvider.resolveUrl({ offer, retailer, program });
    }
    return {
      destinationUrl: dest,
      isAffiliate: true,
      network: program.networkId,
      retailerId: retailer.id,
      offerId: offer.id,
      programId: program.id,
    };
  },
};

export const awinAffiliateProvider = templateAffiliateProvider;
export const impactAffiliateProvider = templateAffiliateProvider;
export const directAffiliateProvider = templateAffiliateProvider;

export function selectProvider(
  program?: AffiliateProgram,
): AffiliateProvider {
  if (!program || program.status !== "active") return passthroughProvider;
  switch (program.networkId) {
    case "amazon":
      return amazonAffiliateProvider;
    case "awin":
    case "impact":
    case "cj":
    case "rakuten":
    case "tradedoubler":
    case "partnerize":
    case "direct":
      return program.trackingTemplate
        ? templateAffiliateProvider
        : passthroughProvider;
    default:
      return passthroughProvider;
  }
}

/**
 * Central commercial URL resolver.
 * Prefers stored affiliateUrl (e.g. amzn.to short links) when present —
 * those links already carry network tracking and must not wait on env tags.
 * Falls back to retailer URL when affiliate config/credentials missing.
 */
export function resolveCommercialUrl(input: {
  offer: Offer;
  retailer: Retailer;
  program?: AffiliateProgram;
  trackingId?: string;
}): ResolvedCommercialUrl {
  if (input.offer.affiliateUrl && isSafeHttpUrl(input.offer.affiliateUrl)) {
    return {
      destinationUrl: input.offer.affiliateUrl,
      isAffiliate: true,
      network: input.program?.networkId ?? input.retailer.affiliateNetwork,
      retailerId: input.retailer.id,
      offerId: input.offer.id,
      programId: input.program?.id,
    };
  }

  const provider = selectProvider(input.program);
  const resolved = provider.resolveUrl({
    offer: input.offer,
    retailer: input.retailer,
    program: input.program,
    trackingId: input.trackingId,
  });

  if (resolved) return resolved;

  // Last resort — validated retailer URL
  return {
    destinationUrl: input.offer.url,
    isAffiliate: false,
    retailerId: input.retailer.id,
    offerId: input.offer.id,
  };
}

export function hostAllowed(
  destinationUrl: string,
  retailer: Retailer,
): boolean {
  try {
    const host = new URL(destinationUrl).hostname.toLowerCase();
    const allowed = [
      ...(retailer.allowedHosts ?? []),
      new URL(retailer.homepage).hostname,
    ].map((h) => h.toLowerCase());
    return allowed.some(
      (a) => host === a || host.endsWith(`.${a}`),
    );
  } catch {
    return false;
  }
}
