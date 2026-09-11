import { describe, expect, it } from "vitest";
import {
  classifyOfferUrlObservations,
  classifyOfferUrlStructure,
  isOfferUrlDisplayable,
} from "@/domain/commerce/offer-url-validation";
import { resolveOfferDestination } from "@/repositories/commerce";
import {
  assessOfferDestinationIdentity,
  isShallowRetailerUrl,
} from "@/domain/commerce/offer-destination-identity";

describe("offer URL validation classifier", () => {
  it("marks unparseable URLs INVALID", () => {
    const r = classifyOfferUrlStructure("not a url");
    expect(r?.state).toBe("INVALID");
    expect(r?.failureReason).toBe("invalid_url");
  });

  it("marks javascript: INVALID", () => {
    const r = classifyOfferUrlStructure("javascript:alert(1)");
    expect(r?.state).toBe("INVALID");
    expect(r?.failureReason).toBe("non_http_protocol");
  });

  it("does not treat ASICS Access Denied as INVALID", () => {
    const r = classifyOfferUrlObservations("https://www.asics.com/nl/nl-nl/", [
      { method: "HEAD", status: 403 },
      {
        method: "GET",
        status: 403,
        bodyHint: "<title>Access Denied</title>",
      },
    ]);
    expect(r.state).toBe("LIKELY_VALID");
    expect(r.failureReason).toBe("bot_blocked");
    expect(isOfferUrlDisplayable(r.state)).toBe(true);
  });

  it("does not treat Amazon HEAD 405 as INVALID", () => {
    const r = classifyOfferUrlObservations("https://www.amazon.nl/dp/B0TEST", [
      { method: "HEAD", status: 405 },
      { method: "GET", status: 202, bodyHint: "short" },
    ]);
    expect(r.state).toBe("LIKELY_VALID");
    expect(isOfferUrlDisplayable(r.state)).toBe(true);
  });

  it("marks definitive 404 INVALID and not displayable", () => {
    const r = classifyOfferUrlObservations(
      "https://www.example.com/gone",
      [{ method: "GET", status: 404 }],
    );
    expect(r.state).toBe("INVALID");
    expect(r.failureReason).toBe("http_404");
    expect(isOfferUrlDisplayable(r.state)).toBe(false);
  });

  it("marks 200 GET as VALID", () => {
    const r = classifyOfferUrlObservations("https://www.garmin.com/", [
      { method: "GET", status: 200, finalUrl: "https://www.garmin.com/nl-NL/" },
    ]);
    expect(r.state).toBe("VALID");
    expect(isOfferUrlDisplayable(r.state)).toBe(true);
  });

  it("treats timeout as UNKNOWN (still displayable)", () => {
    const r = classifyOfferUrlObservations("https://www.slow.example/", [
      { method: "HEAD", error: "TimeoutError: The operation was aborted" },
      { method: "GET", error: "TimeoutError: The operation was aborted" },
    ]);
    expect(r.state).toBe("UNKNOWN");
    expect(isOfferUrlDisplayable(r.state)).toBe(true);
  });

  it("treats geo-blocked 451 as LIKELY_VALID not INVALID", () => {
    const r = classifyOfferUrlObservations("https://www.retailer.example/p/x", [
      { method: "GET", status: 451, bodyHint: "Unavailable For Legal Reasons" },
    ]);
    expect(r.state).toBe("LIKELY_VALID");
    expect(r.failureReason).toBe("geo_block");
    expect(isOfferUrlDisplayable(r.state)).toBe(true);
  });
});

describe("offer destination identity", () => {
  it("treats Amazon locale homepages as shallow", () => {
    expect(isShallowRetailerUrl("https://www.amazon.nl/")).toBe(true);
    expect(isShallowRetailerUrl("https://www.asics.com/nl/nl-nl/")).toBe(true);
    expect(isShallowRetailerUrl("https://www.amazon.nl/dp/B0TEST1234")).toBe(
      false,
    );
  });

  it("matches product tokens in a PDP title", () => {
    const r = assessOfferDestinationIdentity({
      url: "https://www.asics.com/nl/nl-nl/novablast-6/p/123",
      productName: "Novablast 6",
      brandName: "ASICS",
      httpStatus: 200,
      bodyHint: "<title>ASICS Novablast 6 | ASICS NL</title>",
    });
    expect(r.status).toBe("match");
  });

  it("does not auto-INVALID a title mismatch", () => {
    const r = assessOfferDestinationIdentity({
      url: "https://www.asics.com/nl/nl-nl/gel-nimbus-27/p/999",
      productName: "Novablast 6",
      brandName: "ASICS",
      httpStatus: 200,
      bodyHint: "<title>GEL-NIMBUS 27 | ASICS</title>",
    });
    expect(r.status).toBe("mismatch");
  });
});

describe("/go open-redirect posture", () => {
  it("resolver never accepts arbitrary destinations — only offer ids", () => {
    const missing = resolveOfferDestination("offer-not-real");
    expect(missing.ok).toBe(false);
  });

  it("resolved destinations stay on retailer allowlist hosts", async () => {
    const { getOffersForProduct } = await import("@/repositories/commerce");
    const { hostAllowed } = await import("@/domain/commerce/affiliates");
    const offers = getOffersForProduct("prod-novablast-6", "NL");
    expect(offers.length).toBeGreaterThan(0);
    for (const o of offers.slice(0, 5)) {
      const result = resolveOfferDestination(o.id);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(hostAllowed(result.resolved.destinationUrl, result.retailer)).toBe(
          true,
        );
        expect(["http:", "https:"]).toContain(
          new URL(result.resolved.destinationUrl).protocol,
        );
      }
    }
  });

  it("pending network programs do not invent tracking params (stored amzn.to is OK)", () => {
    const samples = [
      "offer-pegasus41-nl",
      "offer-nb6-de",
      "offer-nb5-uk",
      "offer-nb4-nl",
      "offer-fr965-nl",
      "offer-vf4-nl-a4r",
    ];
    for (const id of samples) {
      const dest = resolveOfferDestination(id);
      expect(dest.ok).toBe(true);
      if (!dest.ok) continue;
      // Must not invent Associates/Awin/Impact params when programs are pending
      expect(dest.resolved.destinationUrl).not.toMatch(/[?&]tag=/);
      expect(dest.resolved.destinationUrl).not.toContain("awin1.com");
      expect(dest.resolved.destinationUrl).not.toContain("impact.com");
      const destHost = new URL(dest.resolved.destinationUrl).hostname;
      if (dest.offer.affiliateUrl) {
        // Sheet-backed amzn.to short links are intentional affiliate destinations
        expect(dest.resolved.isAffiliate).toBe(true);
        expect(dest.resolved.destinationUrl).toBe(dest.offer.affiliateUrl);
        expect(destHost).toBe("amzn.to");
      } else {
        expect(dest.resolved.isAffiliate).toBe(false);
        expect(destHost).toBe(new URL(dest.offer.url).hostname);
      }
    }
  });
});
