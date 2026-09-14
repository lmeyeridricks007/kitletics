import type { RiskBand } from "./types";

const AVOID_HOST =
  /\b(casino|betting|poker|crypto|coin|forex|loan-now|payday|escort|porn|xxx|viagra|cbd-gummies|guestpost|guest-post|write-for-us|sponsored-posts-for-sale|link-exchange|pbn)\b/i;

const REVIEW_HOST =
  /\b(write for us|submit guest post|cheap backlinks|buy backlinks|seo marketplace|sitewide footer)\b/i;

export function assessLinkRisk(input: {
  domain: string;
  url?: string;
  pageTitle?: string;
  notes?: string;
  opportunityType?: string;
}): { band: RiskBand; reasons: string[] } {
  const blob = [input.domain, input.url, input.pageTitle, input.notes]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const reasons: string[] = [];

  if (AVOID_HOST.test(blob)) {
    reasons.push("Matches casino / adult / crypto / guest-post-farm / PBN-like language.");
    return { band: "AVOID", reasons };
  }
  if (input.opportunityType === "GUEST_CONTRIBUTION" && /marketplace|paid post/.test(blob)) {
    reasons.push("Paid guest-post marketplace — not an editorial target.");
    return { band: "AVOID", reasons };
  }
  if (REVIEW_HOST.test(blob) || /sponsored|paid placement|sitewide/.test(blob)) {
    reasons.push("Possible paid, sitewide, or marketplace placement — review before outreach.");
    return { band: "REVIEW", reasons };
  }
  reasons.push("No spam/PBN/marketplace pattern detected from available text.");
  return { band: "SAFE", reasons };
}

const FAKE_EMAIL =
  /^(hello|info|editor|contact|admin)@example\./i;

export function isFabricatedEmail(email: string | undefined): boolean {
  if (!email) return false;
  return FAKE_EMAIL.test(email.trim()) || /@kitletics-fake\./i.test(email);
}

export function validateContactEmail(
  email: string | undefined,
): { ok: true; email: string } | { ok: false; reason: string } {
  if (!email || !email.trim()) {
    return { ok: false, reason: "CONTACT_UNKNOWN" };
  }
  const value = email.trim();
  if (isFabricatedEmail(value)) {
    return { ok: false, reason: "fabricated_placeholder" };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return { ok: false, reason: "malformed" };
  }
  return { ok: true, email: value };
}
