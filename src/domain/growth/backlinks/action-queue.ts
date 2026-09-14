import type { BacklinkOpportunity, BacklinkWorkspace, ContactMethod } from "./types";
import { isForumOpportunityType } from "./type-aliases";
import { isVagueContactInstruction, kitleticsPublicUrl } from "./public-url";
import { SOURCE_PLATFORM_GUIDES, type SourcePlatformGuide } from "./source-platforms";
import { KITLETICS_EXPERT_PROFILE } from "./expert-profile";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FORM_METHODS = new Set<ContactMethod>([
  "CONTACT_FORM",
  "EDITORIAL_FORM",
  "SUBMISSION_FORM",
  "SOURCE_REQUEST",
  "TIP_FORM",
  "PODCAST_GUEST_FORM",
]);

const LOCKED_OUTREACH = new Set([
  "contacted",
  "follow_up_due",
  "responded",
  "interested",
  "declined",
  "link_earned",
  "mention_earned",
  "no_response",
]);

export function isHomepageUrl(url: string | undefined): boolean {
  if (!url || !/^https?:\/\//i.test(url)) return true;
  try {
    const u = new URL(url);
    return u.pathname === "/" || u.pathname === "";
  } catch {
    return true;
  }
}

export function resolvedAssetUrl(o: BacklinkOpportunity): string {
  return o.publicAssetUrl || kitleticsPublicUrl(o.targetUrl);
}

function hasPlaceholders(text: string | undefined): boolean {
  return Boolean(text && /\[name\]|\[article\]|Hi \[|Beste \[|I saw \[/i.test(text));
}

function wordCount(text: string | undefined): number {
  return text?.trim().split(/\s+/).filter(Boolean).length ?? 0;
}

export function isKitleticsPublicUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return (
      u.hostname.replace(/^www\./, "") === "kitletics.com" &&
      u.pathname !== "/" &&
      u.pathname !== ""
    );
  } catch {
    return false;
  }
}

function blockedFromSend(o: BacklinkOpportunity): boolean {
  if (o.status === "REJECTED") return true;
  if (o.actionStatus === "NOT_ACTIONABLE") return true;
  if (o.editorialFit === "not_editorial") return true;
  if (o.contactMethod === "CONTACT_NOT_EDITORIAL") return true;
  if (/DO NOT SEND/i.test(o.notes ?? "")) return true;
  if (o.outreachStatus === "declined" || o.outreachStatus === "link_earned") {
    return true;
  }
  return false;
}

/** READY_TO_CONTACT: a human can send immediately. Forums go to the community queue. */
export function isReadyToContact(o: BacklinkOpportunity): boolean {
  if (blockedFromSend(o)) return false;
  if (isForumOpportunityType(o.opportunityType)) return false;
  const method = o.contactMethod;
  if (!method || method === "UNKNOWN") return false;
  if (isHomepageUrl(o.url)) return false;
  if (!isKitleticsPublicUrl(resolvedAssetUrl(o))) return false;
  if (!o.outreachSubject?.trim() || !o.outreachMessage?.trim() || !o.followUpMessage?.trim()) {
    return false;
  }
  if (!o.suggestedPlacement?.trim()) return false;
  if (isVagueContactInstruction(o.nextAction) || isVagueContactInstruction(o.outreachMessage)) {
    return false;
  }
  if (hasPlaceholders(o.outreachMessage) || hasPlaceholders(o.outreachSubject)) return false;
  const words = wordCount(o.outreachMessage);
  if (words < 60 || words > 160) return false;
  if (!o.contactUrl || !/^https?:\/\//i.test(o.contactUrl)) return false;
  if (method === "PUBLIC_EMAIL" || method === "NEWSLETTER_REPLY") {
    return Boolean(o.contactEmail && EMAIL_RE.test(o.contactEmail));
  }
  if (method === "AUTHOR_CONTACT_PAGE") {
    return Boolean(o.contactEmail && EMAIL_RE.test(o.contactEmail));
  }
  if (method === "LINKEDIN_PROFILE" || method === "PUBLIC_SOCIAL_DM") {
    return /^https?:\/\//i.test(o.contactUrl);
  }
  if (FORM_METHODS.has(method)) {
    return /^https?:\/\//i.test(o.applicationUrl || o.contactUrl);
  }
  return false;
}

export function isApplyNow(o: BacklinkOpportunity): boolean {
  if (blockedFromSend(o)) return false;
  if (isForumOpportunityType(o.opportunityType)) return false;
  const applyUrl = o.applicationUrl || (FORM_METHODS.has(o.contactMethod ?? "UNKNOWN") ? o.contactUrl : undefined);
  if (!applyUrl || !/^https?:\/\//i.test(applyUrl) || isHomepageUrl(applyUrl)) return false;
  if (!isKitleticsPublicUrl(resolvedAssetUrl(o))) return false;
  if (!o.outreachMessage?.trim() || hasPlaceholders(o.outreachMessage)) return false;
  if (isVagueContactInstruction(o.nextAction)) return false;
  return Boolean(o.applicationType || FORM_METHODS.has(o.contactMethod ?? "UNKNOWN"));
}

export function isForumReady(o: BacklinkOpportunity): boolean {
  if (o.status === "REJECTED") return false;
  if (!isForumOpportunityType(o.opportunityType) && !o.forumThread) return false;
  const thread = o.forumThread;
  if (!thread?.url || isHomepageUrl(thread.url)) return false;
  if (!thread.thread?.trim()) return false;
  const reply = o.suggestedResponse || thread.suggestedResponse;
  if (!reply?.trim() || hasPlaceholders(reply)) return false;
  if (isVagueContactInstruction(reply)) return false;
  if (thread.forumUrgency === "SKIP") return false;
  return true;
}

export function nextActionLine(o: BacklinkOpportunity): string {
  if (o.contactMethod === "CONTACT_NOT_EDITORIAL") {
    return `CONTACT_NOT_EDITORIAL — do not send. Customer-service route: ${o.contactUrl ?? o.url}`;
  }
  if (isForumOpportunityType(o.opportunityType) && o.url) {
    return `Reply here: ${o.url}`;
  }
  if (o.contactEmail && EMAIL_RE.test(o.contactEmail)) {
    return `Email ${o.contactEmail}`;
  }
  if (o.applicationUrl && /^https?:\/\//i.test(o.applicationUrl)) {
    return `Submit here: ${o.applicationUrl}`;
  }
  if (o.contactUrl && /^https?:\/\//i.test(o.contactUrl) && o.contactMethod && o.contactMethod !== "UNKNOWN") {
    if (o.contactMethod === "LINKEDIN_PROFILE") return `Contact here: ${o.contactUrl}`;
    if (FORM_METHODS.has(o.contactMethod)) return `Submit here: ${o.contactUrl}`;
    return `Contact here: ${o.contactUrl}`;
  }
  return "NEEDS CONTACT RESEARCH — no public outbound route stored.";
}

export function contactHref(o: BacklinkOpportunity): string {
  if (
    (o.contactMethod === "PUBLIC_EMAIL" || o.contactMethod === "NEWSLETTER_REPLY") &&
    o.contactEmail &&
    EMAIL_RE.test(o.contactEmail)
  ) {
    const subject = encodeURIComponent(o.outreachSubject ?? "");
    return `mailto:${o.contactEmail}?subject=${subject}`;
  }
  if (isForumOpportunityType(o.opportunityType)) return o.url;
  if (o.applicationUrl && /^https?:\/\//i.test(o.applicationUrl) && FORM_METHODS.has(o.contactMethod ?? "UNKNOWN") && !o.contactEmail) {
    return o.applicationUrl;
  }
  return o.contactUrl || o.applicationUrl || o.url;
}

export function isDutchPriority(o: { language?: string; country?: string; market?: string }): boolean {
  return o.language === "nl" || o.country === "NL" || o.market === "NL";
}

function bandRank(band: string | undefined): number {
  if (band === "MUST_PURSUE") return 0;
  if (band === "HIGH") return 1;
  if (band === "MEDIUM") return 2;
  return 3;
}

export function compareActionable(a: BacklinkOpportunity, b: BacklinkOpportunity): number {
  const d = Number(isDutchPriority(a)) - Number(isDutchPriority(b));
  if (d !== 0) return d > 0 ? -1 : 1;
  const p = bandRank(a.priority) - bandRank(b.priority);
  if (p !== 0) return p;
  return b.overallScore - a.overallScore;
}

export function onePerDomain(rows: BacklinkOpportunity[]): BacklinkOpportunity[] {
  const seen = new Set<string>();
  const out: BacklinkOpportunity[] = [];
  for (const o of rows) {
    const host = o.domain.replace(/^www\./, "").toLowerCase();
    if (seen.has(host)) continue;
    seen.add(host);
    out.push(o);
  }
  return out;
}

export interface ApplyNowCard {
  id: string;
  platform: string;
  what: string;
  whyQualifies: string;
  applyUrl: string;
  requirements: string;
  suggestedProfile: string;
  suggestedSubmission: string;
  deadline: string;
  cost: string;
  opportunityId?: string;
}

function applyCardFromOpp(o: BacklinkOpportunity): ApplyNowCard {
  return {
    id: `apply-${o.id}`,
    platform: o.siteName,
    what: o.applicationType || o.contactMethod || "SUBMISSION_FORM",
    whyQualifies: o.whyThisAsset || o.whyTheyMightLink,
    applyUrl: o.applicationUrl || o.contactUrl || "",
    requirements: o.applicationRequirements || "Follow the form fields. Do not invent credentials.",
    suggestedProfile: KITLETICS_EXPERT_PROFILE.chars160,
    suggestedSubmission: o.outreachMessage || "",
    deadline: o.applicationDeadline || "UNKNOWN — none published",
    cost: o.applicationCost || "UNKNOWN — none listed on the page",
    opportunityId: o.id,
  };
}

function applyCardFromPlatform(p: SourcePlatformGuide): ApplyNowCard {
  return {
    id: `apply-platform-${p.platform.toLowerCase().replace(/\s+/g, "-")}`,
    platform: p.platform,
    what: "SOURCE_REQUEST registration",
    whyQualifies:
      "Kitletics publishes live running-shoe specs (stack, drop, weight) and buying tools. Use the factual founder profile — do not claim lab testing.",
    applyUrl: p.registrationUrl,
    requirements: `${p.howToRegister} Approval: ${p.approvalNeeded}`,
    suggestedProfile: KITLETICS_EXPERT_PROFILE.words50,
    suggestedSubmission: `Categories to monitor: ${p.categoriesToMonitor.join(", ")}. ${p.howRequestsArrive}`,
    deadline: "Rolling — respond to individual requests as they arrive",
    cost: p.cost,
  };
}

export interface ActionQueueSnapshot {
  readyToContact: BacklinkOpportunity[];
  doTheseToday: BacklinkOpportunity[];
  applyNow: ApplyNowCard[];
  respondToday: BacklinkOpportunity[];
  respondThisWeek: BacklinkOpportunity[];
  monitor: BacklinkOpportunity[];
  skip: BacklinkOpportunity[];
  needsContactResearch: BacklinkOpportunity[];
  notActionable: BacklinkOpportunity[];
  forumResponsesReady: BacklinkOpportunity[];
  namedContacts: number;
  directRoutes: number;
  contactUnknown: number;
}

export function isLockedOutreach(o: BacklinkOpportunity): boolean {
  return LOCKED_OUTREACH.has(o.outreachStatus);
}

export function buildActionQueue(ws: BacklinkWorkspace): ActionQueueSnapshot {
  const opps = ws.opportunities;
  const ready = opps.filter(isReadyToContact).sort(compareActionable);
  const applyOpps = opps.filter(isApplyNow).sort(compareActionable);
  const forums = opps.filter((o) => o.forumThread || isForumOpportunityType(o.opportunityType));
  const forumReady = forums.filter(isForumReady);
  const respondToday = forumReady.filter((o) => o.forumThread?.forumUrgency === "RESPOND_TODAY");
  const respondThisWeek = forumReady.filter(
    (o) => o.forumThread?.forumUrgency === "RESPOND_THIS_WEEK",
  );
  const monitor = forumReady.filter(
    (o) => !o.forumThread?.forumUrgency || o.forumThread.forumUrgency === "MONITOR",
  );
  const skip = forums.filter((o) => o.forumThread?.forumUrgency === "SKIP");
  const notActionable = opps.filter(
    (o) =>
      o.actionStatus === "NOT_ACTIONABLE" ||
      o.contactMethod === "CONTACT_NOT_EDITORIAL" ||
      o.editorialFit === "not_editorial" ||
      /DO NOT SEND/i.test(o.notes ?? ""),
  );
  const needs = opps.filter((o) => {
    if (isReadyToContact(o) || isApplyNow(o) || isForumReady(o)) return false;
    if (notActionable.includes(o)) return false;
    return true;
  });
  const namedContacts = new Set(
    opps
      .map((o) => o.contactName?.trim())
      .filter((n): n is string => Boolean(n) && n !== "UNKNOWN"),
  ).size;
  const directRoutes = opps.filter(
    (o) =>
      o.contactMethod &&
      o.contactMethod !== "UNKNOWN" &&
      o.contactUrl &&
      /^https?:\/\//i.test(o.contactUrl) &&
      !isVagueContactInstruction(o.nextAction),
  ).length;
  const contactUnknown = opps.filter(
    (o) =>
      !o.contactMethod ||
      o.contactMethod === "UNKNOWN" ||
      o.actionStatus === "CONTACT_RESEARCH",
  ).length;

  return {
    readyToContact: ready,
    doTheseToday: onePerDomain(ready).slice(0, 12),
    applyNow: [
      ...SOURCE_PLATFORM_GUIDES.map(applyCardFromPlatform),
      ...applyOpps.map(applyCardFromOpp),
    ],
    respondToday,
    respondThisWeek,
    monitor,
    skip,
    needsContactResearch: needs,
    notActionable,
    forumResponsesReady: forumReady,
    namedContacts,
    directRoutes,
    contactUnknown,
  };
}
