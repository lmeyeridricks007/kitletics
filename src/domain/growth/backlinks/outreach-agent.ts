import { scoreOutreachOpportunity, shouldRecommendEngagement } from "./scoring";
import { pickAssetForOpportunity, pitchForAsset } from "./matching";
import { assessLinkRisk } from "./risk";
import { draftOutreach } from "./outreach";
import { prospectKey } from "./csv";
import { isDuplicateOpportunity, normalizeOpportunityUrl } from "./opportunity-dedupe";
import { findCommunity, unknownCommunityStub } from "./communities";
import { digitalPrPacketFromIdea } from "./digital-pr";
import { resolveOpportunityType } from "./type-aliases";
import {
  decideLinkInclusion,
  detectForumIntent,
  generateForumResponse,
  pickForumAsset,
} from "./forum-response";
import type {
  BacklinkOpportunity,
  BacklinkProspect,
  BacklinkWorkspace,
  CommunityPolicy,
  LinkableAsset,
  OpportunityType,
  OutreachScoreWeights,
  ResearchIdea,
  SourceRequest,
} from "./types";

export interface ForumThreadInput {
  communityId?: string;
  community?: string;
  subreddit?: string;
  threadUrl: string;
  threadTitle?: string;
  question: string;
  threadAgeHours?: number;
  upvotes?: number;
  commentCount?: number;
  existingAnswers?: string;
  accountTrustOk?: boolean;
  threadSpamSensitive?: boolean;
  country?: string;
  language?: string;
}

export interface ForumOpportunityOutput {
  community: string;
  thread: string;
  question: string;
  whyRelevant: string;
  suggestedAnswer: string;
  recommendedAsset: string;
  recommendedAssetUrl: string;
  linkRecommendation: string;
  linkReason: string;
  communityRuleRisk: string;
  urgency: number;
  score: number;
  priority: string;
  nextAction: string;
}

export interface OutreachCardOutput {
  publication: string;
  contact: string;
  relevantArticle: string;
  whyKitleticsFits: string;
  asset: string;
  angle: string;
  suggestedSubject: string;
  suggestedOutreachDraft: string;
  score: number;
  priority: string;
  nextAction: string;
}

export interface OutreachAgentResult {
  opportunity: BacklinkOpportunity;
  community?: CommunityPolicy;
  engage: boolean;
  engageBlockers: string[];
  nextAction: string;
  autoPost: false;
  forum?: ForumOpportunityOutput;
  outreach?: OutreachCardOutput;
}

function clampScore(n: number | undefined, fallback: number): number {
  if (n == null || !Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function stableId(prefix: string, url: string): string {
  const slug = url
    .replace(/^https?:\/\//, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40)
    .toLowerCase();
  let h = 0;
  for (const ch of url) h = (h * 33 + ch.charCodeAt(0)) >>> 0;
  return `${prefix}-${slug}-${h.toString(16)}`;
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(
      /^www\./,
      "",
    );
  } catch {
    return "unknown";
  }
}

function forumType(input: ForumThreadInput, community: CommunityPolicy): OpportunityType {
  if (community.platform === "reddit" || input.subreddit) return "REDDIT_THREAD";
  if (community.platform === "qa") return "Q_AND_A_THREAD";
  if (community.platform === "facebook" || community.platform === "discord") {
    return "COMMUNITY_DISCUSSION";
  }
  return "FORUM_THREAD";
}

function helpfulnessForThread(input: ForumThreadInput, intent: string): number {
  const q = input.question.toLowerCase();
  let n = 55;
  if (
    /what|which|should i|recommend|vs|drop|stack|database|compare|hyrox|marathon/.test(q)
  ) {
    n = 82;
  }
  if (intent === "other" && q.length < 40) n = 48;
  const answers = (input.existingAnswers ?? "").split(/\n/).filter(Boolean).length;
  if (answers >= 12) n -= 15;
  if (/rant|hate mail|ban this/.test(q)) n = 28;
  return clampScore(n, 50);
}

function communityFitFor(community: CommunityPolicy): number {
  if (community.selfPromotionPolicy === "FORBIDDEN") return 35;
  if (community.platform === "facebook") return 45;
  if (/fitness$/i.test(community.community)) return 58;
  if (community.platform === "reddit" || community.platform === "forum") {
    if (/running|shoe|marathon|triathlon|trail|hyrox/i.test(community.community)) return 78;
    return 62;
  }
  return 60;
}

function spamRiskFor(input: ForumThreadInput, community: CommunityPolicy): number {
  let n = 28;
  if (community.selfPromotionPolicy === "FORBIDDEN") n += 40;
  if (community.platform === "facebook") n += 22;
  if (input.threadSpamSensitive) n += 25;
  if (/fitness$/i.test(community.community)) n += 18;
  if ((input.commentCount ?? 0) > 80) n += 8;
  return clampScore(n, 40);
}

function urgencyFor(input: ForumThreadInput): number {
  const hours = input.threadAgeHours;
  if (hours == null) return 50;
  const comments = input.commentCount ?? 0;
  if (hours < 12 && comments < 15) return 90;
  if (hours < 36) return 75;
  if (hours < 72) return 55;
  return 30;
}

function communityProspectId(community: CommunityPolicy): { id: string; domain: string } {
  const domain = domainFromUrl(community.url === "UNKNOWN" ? "https://unknown.test" : community.url);
  return { id: `prospect-${prospectKey(domain)}`, domain };
}

function ensureCommunityProspect(
  ws: BacklinkWorkspace,
  community: CommunityPolicy,
): BacklinkProspect {
  const domain = domainFromUrl(community.url === "UNKNOWN" ? "https://unknown.test" : community.url);
  const id = `prospect-${prospectKey(domain)}`;
  const existing = ws.prospects.find((p) => p.id === id || prospectKey(p.domain) === prospectKey(domain));
  if (existing) return existing;
  const prospect: BacklinkProspect = {
    id,
    name: community.community,
    domain,
    homepageUrl: community.url === "UNKNOWN" ? "" : community.url,
    category: "COMMUNITY",
    country: "US",
    language: "en",
    market: "EN",
    whyRelevant: `Community discussions where a helpful Kitletics resource might fit: ${community.community}`,
    contactStatus: "CONTACT_UNKNOWN",
    contactRole: "unknown",
    notes: community.notes,
  };
  ws.prospects.push(prospect);
  return prospect;
}

export function evaluateForumThread(
  input: ForumThreadInput,
  ctx: {
    workspace: BacklinkWorkspace;
    assets: LinkableAsset[];
    now?: string;
    weights?: OutreachScoreWeights;
  },
): OutreachAgentResult {
  const now = ctx.now ?? new Date().toISOString();
  const communities = ctx.workspace.communities ?? [];
  const found = findCommunity(communities, input);
  const community = found ?? unknownCommunityStub(input);
  const intent = detectForumIntent(input.question);
  const asset = pickForumAsset(ctx.assets, intent);
  const opportunityType = forumType(input, community);
  const accountTrustOk = Boolean(input.accountTrustOk);
  const threadSpamSensitive = Boolean(input.threadSpamSensitive) || community.platform === "facebook";
  const pageDirectlyAnswers = Boolean(
    asset &&
      (intent === "database" ||
        intent === "compare" ||
        intent === "heel_drop" ||
        intent === "model_vs" ||
        intent === "budget" ||
        (asset.assetType === "tool" && intent === "recommend_shoes")),
  );
  const addsData = Boolean(asset?.dataDriven || asset?.assetType === "comparison" || asset?.assetType === "tool");
  const userWouldBenefit = pageDirectlyAnswers || (asset?.consumerFriendly && intent !== "other");
  const link = decideLinkInclusion({
    rulesStatus: community.rulesStatus,
    selfPromotionPolicy: community.selfPromotionPolicy,
    pageDirectlyAnswers,
    addsData,
    userWouldBenefit: Boolean(userWouldBenefit),
    accountTrustOk,
    threadSpamSensitive,
  });
  const suggested = generateForumResponse({
    question: input.question,
    intent,
    threadUrl: input.threadUrl,
    asset,
    linkRecommendation: link.recommendation,
  });
  const helpfulness = helpfulnessForThread(input, intent);
  const communityFit = communityFitFor(community);
  const spamRisk = spamRiskFor(input, community);
  const linkNecessity = pageDirectlyAnswers && addsData ? 78 : 42;
  const responseUrgency = urgencyFor(input);
  const gate = shouldRecommendEngagement({ helpfulness, communityFit, spamRisk });
  const scored = scoreOutreachOpportunity({
    relevance: /running|shoe|watch|hyrox|marathon|drop|stack/i.test(input.question) ? 88 : 62,
    assetFit: asset ? 84 : 40,
    likelihood: link.recommendation === "NO_LINK" ? 38 : 55,
    authority: community.platform === "reddit" || community.platform === "forum" ? 58 : 40,
    helpfulness,
    relationship: 25,
    spamRisk,
    communityFit,
    linkNecessity,
    responseUrgency,
    weights: ctx.weights ?? ctx.workspace.settings.outreachScoreWeights,
  });
  const pitch = asset
    ? pitchForAsset(asset, {
        topic: input.question,
        opportunityType,
        text: input.threadTitle,
      })
    : {
        angle: "Answer the question in the thread. Do not default to the homepage.",
        why: "No matching live asset; still do not use /.",
        anchorContext: "UNKNOWN",
      };
  const risk = assessLinkRisk({
    domain: communityProspectId(community).domain,
    url: input.threadUrl,
    notes: community.notes,
    opportunityType,
  });
  const nextAction = !gate.ok
    ? `Do not engage (${gate.blockers.join("; ")}). Keep the draft in CRM for history.`
    : community.rulesStatus === "RULES_UNKNOWN"
      ? `Human: open ${community.rulesUrl ?? "the community rules"}, then decide whether to post the draft. Never auto-post.`
      : `Human: review the suggested answer, then post manually if it still helps. Never auto-post.`;

  const prospectRef = communityProspectId(community);
  const opportunity: BacklinkOpportunity = {
    id: stableId("opp-forum", input.threadUrl),
    prospectId: prospectRef.id,
    siteName: community.community,
    domain: prospectRef.domain,
    url: normalizeOpportunityUrl(input.threadUrl),
    opportunityType,
    contactRole: "unknown",
    country: input.country ?? "US",
    language: input.language ?? "en",
    market: input.language === "nl" ? "NL" : "EN",
    topic: input.threadTitle || input.question.slice(0, 120),
    sport: /watch|gps/i.test(input.question) ? "running-watches" : "running",
    authorityScore: scored.authority,
    relevanceScore: scored.relevance,
    likelihoodScore: scored.likelihood,
    assetFitScore: scored.assetFit,
    relationshipScore: scored.relationship,
    editorialQualityScore: scored.helpfulness,
    overallScore: scored.overall,
    scoreReasons: scored.reasons,
    targetAssetId: asset?.assetId ?? "",
    targetUrl: asset?.url && asset.url !== "/" ? asset.url : "",
    recommendedAnchorContext: pitch.anchorContext,
    pitchAngle: pitch.angle,
    whyTheyMightLink: pitch.why,
    whyThisSite: `${community.community} has a thread matching Kitletics buying-guide topics.`,
    whyThisAsset: asset
      ? `${asset.title} is a deeper fit than the homepage.`
      : "No live asset matched; do not pitch /.",
    whyThisAngle: pitch.angle,
    evidence: `Question: ${input.question.slice(0, 280)}`,
    risk: risk.band,
    riskReasons: risk.reasons,
    sourceType: "forum_thread",
    sourceUrl: input.threadUrl,
    discoveredAt: now,
    status: "CANDIDATE",
    priority: scored.band,
    notes: community.notes,
    outreachStatus: "draft_ready",
    responseStatus: "none",
    campaignId: "campaign-forum-answers",
    metricSource: "editorial_judgment",
    helpfulnessScore: scored.helpfulness,
    linkNecessityScore: scored.linkNecessity,
    spamRiskScore: scored.spamRisk,
    communityFitScore: scored.communityFit,
    responseUrgencyScore: scored.responseUrgency,
    linkRecommendation: link.recommendation,
    linkRecommendationReason: link.reason,
    communityId: community.id,
    communityRulesStatus: community.rulesStatus,
    suggestedResponse: suggested,
    nextAction,
    forumThread: {
      communityId: community.id,
      community: community.community,
      url: input.threadUrl,
      thread: input.threadTitle,
      subreddit: input.subreddit ?? (community.platform === "reddit" ? community.community : undefined),
      threadAgeHours: input.threadAgeHours,
      upvotes: input.upvotes,
      commentCount: input.commentCount,
      questionIntent: intent,
      existingAnswers: input.existingAnswers,
      selfPromoRisk: scored.spamRisk,
      linkPolicy: community.linkPolicy,
      suggestedResponse: suggested,
      recommendedAssetId: asset?.assetId ?? "",
    },
  };

  return {
    opportunity,
    community,
    engage: gate.ok,
    engageBlockers: gate.blockers,
    nextAction,
    autoPost: false,
    forum: {
      community: community.community,
      thread: input.threadUrl,
      question: input.question,
      whyRelevant: opportunity.whyThisSite,
      suggestedAnswer: suggested,
      recommendedAsset: asset?.title ?? "UNKNOWN",
      recommendedAssetUrl: opportunity.targetUrl || "UNKNOWN",
      linkRecommendation: link.recommendation,
      linkReason: link.reason,
      communityRuleRisk: `${community.rulesStatus} / ${community.selfPromotionPolicy}`,
      urgency: scored.responseUrgency,
      score: scored.overall,
      priority: scored.band,
      nextAction,
    },
  };
}

export function evaluateJournalistRequest(
  request: SourceRequest,
  ctx: {
    assets: LinkableAsset[];
    researchIdeas?: ResearchIdea[];
    now?: string;
    weights?: OutreachScoreWeights;
  },
): OutreachAgentResult {
  const type = resolveOpportunityType("JOURNALIST_REQUEST");
  const asset =
    ctx.assets.find((a) => a.assetId === request.recommendedAssetId && a.url !== "/") ??
    pickAssetForOpportunity(ctx.assets, {
      topic: request.topic,
      opportunityType: type,
      text: `${request.requestTitle} ${request.requirements}`,
    });
  const proven = (ctx.researchIdeas ?? [])
    .map(digitalPrPacketFromIdea)
    .find((p) => p && asset && p.recommendedSourceAssetId === asset.assetId);
  const supporting =
    request.supportingData?.trim() ||
    proven?.finding ||
    "UNKNOWN — do not invent statistics. Cite the live database coverage line only.";
  const pitch = asset
    ? pitchForAsset(asset, { topic: request.topic, opportunityType: type, text: request.requirements })
    : {
        angle: "Offer catalog evidence if it matches the brief; otherwise pass.",
        why: "No matching live asset.",
        anchorContext: "UNKNOWN",
      };
  const nowMs = new Date(ctx.now ?? new Date().toISOString()).getTime();
  const deadlineHours = request.deadline
    ? Math.max(0, (new Date(request.deadline).getTime() - nowMs) / 36e5)
    : undefined;
  const helpfulness = /shoe|stack|drop|price|weight|data|database|running/i.test(
    `${request.topic} ${request.requirements}`,
  )
    ? 84
    : 58;
  const scored = scoreOutreachOpportunity({
    relevance: helpfulness,
    assetFit: asset ? 88 : 30,
    likelihood: request.deadline ? 70 : 55,
    authority: 70,
    helpfulness,
    relationship: 40,
    spamRisk: 10,
    communityFit: 80,
    linkNecessity: asset?.dataDriven ? 80 : 50,
    responseUrgency: deadlineHours == null ? 60 : deadlineHours < 24 ? 95 : deadlineHours < 72 ? 80 : 55,
    weights: ctx.weights,
  });
  const suggested =
    request.suggestedResponse?.trim() ||
    [
      `Happy to help on ${request.topic}.`,
      supporting.startsWith("UNKNOWN")
        ? "I can share methodology and live catalog fields (weight/drop/stack/regional From-prices) rather than unpublished survey numbers."
        : supporting,
      asset?.url && asset.url !== "/"
        ? `Source page: ${asset.url}`
        : "No public URL if the matching research asset is still planned.",
      "I will not invent a statistic that the catalog cannot compute.",
    ].join(" ");
  const contact = request.journalist?.trim() || "UNKNOWN";
  const publication = request.publication?.trim() || "UNKNOWN";
  const nextAction = request.deadline
    ? `Human: draft/submit on ${request.platform} before ${request.deadline}. Do not mass-email.`
    : `Human: review on ${request.platform}. Contact remains ${contact}.`;
  const dummyOpp: BacklinkOpportunity = {
    id: request.id.startsWith("opp-") ? request.id : `opp-req-${request.id}`,
    prospectId: `prospect-request-${request.platform.toLowerCase()}`,
    siteName: publication,
    domain: "UNKNOWN",
    url: request.sourceUrl || `https://unknown.invalid/${request.id}`,
    opportunityType: "JOURNALIST_SOURCE_REQUEST",
    contactName: request.journalist,
    contactRole: "unknown",
    country: "US",
    language: "en",
    market: "EN",
    topic: request.topic,
    sport: "running",
    authorityScore: scored.authority,
    relevanceScore: scored.relevance,
    likelihoodScore: scored.likelihood,
    assetFitScore: scored.assetFit,
    relationshipScore: scored.relationship,
    editorialQualityScore: scored.helpfulness,
    overallScore: scored.overall,
    scoreReasons: scored.reasons,
    targetAssetId: asset?.assetId ?? "",
    targetUrl: asset?.url && asset.url !== "/" ? asset.url : "",
    recommendedAnchorContext: pitch.anchorContext,
    pitchAngle: pitch.angle,
    whyTheyMightLink: pitch.why,
    whyThisSite: `Source request on ${request.platform}: ${request.requestTitle}`,
    whyThisAsset: asset
      ? `${asset.title} can support the brief without inventing numbers.`
      : "Pass unless a live asset matches.",
    whyThisAngle: pitch.angle,
    evidence: request.requirements,
    risk: "SAFE",
    riskReasons: [],
    sourceType: "source_request",
    discoveredAt: ctx.now ?? new Date().toISOString(),
    status: "CANDIDATE",
    priority: scored.band,
    outreachStatus: "draft_ready",
    responseStatus: "none",
    campaignId: "campaign-journalist-requests",
    metricSource: "editorial_judgment",
    suggestedResponse: suggested,
    nextAction,
    helpfulnessScore: scored.helpfulness,
    spamRiskScore: scored.spamRisk,
    communityFitScore: scored.communityFit,
    responseUrgencyScore: scored.responseUrgency,
  };
  const draft = asset
    ? draftOutreach({
        opportunity: dummyOpp,
        asset,
        publicationName: publication === "UNKNOWN" ? undefined : publication,
      })
    : { subject: "UNKNOWN", body: suggested };
  return {
    opportunity: dummyOpp,
    engage: shouldRecommendEngagement({
      helpfulness: scored.helpfulness,
      communityFit: scored.communityFit,
      spamRisk: scored.spamRisk,
    }).ok,
    engageBlockers: [],
    nextAction,
    autoPost: false,
    outreach: {
      publication,
      contact,
      relevantArticle: request.sourceUrl || request.requestTitle,
      whyKitleticsFits: dummyOpp.whyThisAsset,
      asset: asset?.title ?? "UNKNOWN",
      angle: pitch.angle,
      suggestedSubject: draft.subject,
      suggestedOutreachDraft: "body" in draft ? draft.body : suggested,
      score: scored.overall,
      priority: scored.band,
      nextAction,
    },
  };
}

export function ingestForumThreads(
  workspace: BacklinkWorkspace,
  threads: ForumThreadInput[],
  assets: LinkableAsset[],
  now = new Date().toISOString(),
): { workspace: BacklinkWorkspace; created: number; skipped: number; results: OutreachAgentResult[] } {
  const ws: BacklinkWorkspace = {
    ...workspace,
    prospects: [...workspace.prospects],
    opportunities: [...workspace.opportunities],
    communities: [...(workspace.communities ?? [])],
    communityHistory: [...(workspace.communityHistory ?? [])],
  };
  let created = 0;
  let skipped = 0;
  const results: OutreachAgentResult[] = [];
  for (const thread of threads) {
    const evaluated = evaluateForumThread(thread, { workspace: ws, assets, now });
    results.push(evaluated);
    if (
      isDuplicateOpportunity(ws.opportunities, {
        url: thread.threadUrl,
        domain: evaluated.opportunity.domain,
        opportunityType: evaluated.opportunity.opportunityType,
        targetAssetId: evaluated.opportunity.targetAssetId,
      })
    ) {
      skipped += 1;
      continue;
    }
    if (evaluated.community) {
      ensureCommunityProspect(ws, evaluated.community);
      if (!ws.communities?.some((c) => c.id === evaluated.community?.id)) {
        ws.communities = [...(ws.communities ?? []), evaluated.community];
      }
    }
    ws.opportunities.push(evaluated.opportunity);
    ws.communityHistory = [
      ...(ws.communityHistory ?? []),
      {
        id: `hist-${evaluated.opportunity.id}`,
        communityId: evaluated.community?.id ?? "unknown",
        threadUrl: thread.threadUrl,
        opportunityId: evaluated.opportunity.id,
        at: now,
        outcome: "drafted",
        notes: evaluated.engage ? "Queued for human review" : evaluated.engageBlockers.join("; "),
      },
    ];
    created += 1;
  }
  ws.updatedAt = now;
  return { workspace: ws, created, skipped, results };
}

export const AUTO_POST_FORBIDDEN = true;
