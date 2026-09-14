import type { BacklinkOpportunity, LinkableAsset, OutreachDraft } from "./types";

function hostLabel(domain: string): string {
  return domain.replace(/^www\./, "");
}

/**
 * Draft outreach only — never auto-send. Does not ask for "a backlink".
 */
export function draftOutreach(input: {
  opportunity: BacklinkOpportunity;
  asset: LinkableAsset;
  publicationName?: string;
}): OutreachDraft {
  const { opportunity: o, asset } = input;
  if (o.outreachMessage && o.outreachSubject) {
    return {
      subject: o.outreachSubject,
      opening: o.outreachMessage.split("\n")[0] ?? "",
      whyRelevant: o.whyTheyMightLink,
      assetPitch: o.publicAssetUrl || asset.url,
      evidence: o.evidence,
      cta: o.suggestedPlacement || "",
      body: o.outreachMessage,
      followUp: o.followUpMessage,
    };
  }
  const pub = input.publicationName ?? o.siteName;
  const grounded = Boolean(o.url && /https?:/.test(o.url) && o.topic);
  const opening = grounded
    ? `I'm writing because your coverage of ${o.topic.toLowerCase()} is a close fit for a dataset we maintain — not a cold spray.`
    : `I'm reaching out from Kitletics with a resource that may be useful for ${pub}'s ${o.sport} readers.`;

  const whyRelevant = o.whyTheyMightLink;
  const liveUrl = o.publicAssetUrl || (asset.url && asset.url !== "/" ? asset.url : "");
  const assetPitch =
    asset.status === "planned" || !liveUrl
      ? `We are assembling ${asset.title} from the same catalog we already publish. There is no public report URL to cite yet.`
      : `The live page is ${liveUrl} — ${asset.bestPitchAngles[0] ?? asset.title}.`;

  const evidence = o.evidence;
  const cta =
    asset.status === "planned"
      ? "If this kind of snapshot would be useful when it ships, I'm happy to share methodology now and the URL later."
      : "If it's useful for a future update, the URL is yours to cite — no account, no paywall.";

  const subject = grounded
    ? `${o.topic}: a current Kitletics dataset you can cite`
    : `${asset.title} for ${pub} readers`;

  const body = [
    opening,
    "",
    whyRelevant,
    "",
    assetPitch,
    "",
    evidence,
    "",
    cta,
    "",
    "Lee / Kitletics",
  ].join("\n");

  return { subject, opening, whyRelevant, assetPitch, evidence, cta, body };
}

export function suggestedFollowUpIso(
  from = new Date(),
  days = 6,
): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() + Math.max(5, Math.min(7, days)));
  return d.toISOString();
}

export function shouldBlockFollowUp(input: {
  outreachStatus: string;
  followUpCount?: number;
  maxFollowUps: number;
}): boolean {
  if (input.outreachStatus === "declined") return true;
  if (input.outreachStatus === "link_earned" || input.outreachStatus === "mention_earned") {
    return true;
  }
  return (input.followUpCount ?? 0) >= input.maxFollowUps;
}

export function campaignStateAllowed(from: string, to: string): boolean {
  const order = ["draft", "planned", "active", "paused", "complete"];
  if (from === to) return true;
  if (from === "complete") return to === "paused";
  return order.includes(to);
}

void hostLabel;
