import { FORUM_OPPORTUNITY_TYPES, OPPORTUNITY_TYPES, type OpportunityType } from "./types";

/** Names from the outreach-agent brief → existing CRM types. */
export const OPPORTUNITY_TYPE_ALIASES: Record<string, OpportunityType> = {
  JOURNALIST_REQUEST: "JOURNALIST_SOURCE_REQUEST",
  ROUNDUP: "ROUNDUP_INCLUSION",
  BROKEN_LINK: "BROKEN_LINK_REPLACEMENT",
  SPORTS_SCIENCE: "UNIVERSITY_RESEARCH",
};

function normalizeTypeKey(raw: string): string {
  return raw.trim().replace(/[\s-]+/g, "_").toUpperCase();
}

export function isForumOpportunityType(type: OpportunityType): boolean {
  return (FORUM_OPPORTUNITY_TYPES as readonly string[]).includes(type);
}

export function resolveOpportunityType(
  raw: string | undefined,
  fallback: OpportunityType = "RESOURCE_PAGE",
): OpportunityType {
  const key = normalizeTypeKey(raw ?? "");
  if ((OPPORTUNITY_TYPES as readonly string[]).includes(key)) {
    return key as OpportunityType;
  }
  if (OPPORTUNITY_TYPE_ALIASES[key]) return OPPORTUNITY_TYPE_ALIASES[key];
  const blob = key.toLowerCase().replace(/_/g, " ");
  if (/reddit/.test(blob)) return "REDDIT_THREAD";
  if (/forum/.test(blob)) return "FORUM_THREAD";
  if (/q.?and.?a|stack.?overflow|stackexchange/.test(blob)) return "Q_AND_A_THREAD";
  if (/unlinked/.test(blob)) return "UNLINKED_MENTION";
  if (/community.?discussion/.test(blob)) return "COMMUNITY_DISCUSSION";
  if (/club/.test(blob)) return "RUNNING_CLUB";
  if (/newsletter/.test(blob)) return "NEWSLETTER";
  if (/podcast/.test(blob)) return "PODCAST";
  if (/journalist|haro|qwoted/.test(blob)) return "JOURNALIST_SOURCE_REQUEST";
  if (/data|database|stack|drop/.test(blob)) return "DATA_CITATION";
  if (/resource/.test(blob)) return "RESOURCE_PAGE";
  return fallback;
}
