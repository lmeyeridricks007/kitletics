import type {
  BacklinkOpportunity,
  BacklinkProspect,
  BacklinkWorkspace,
  JournalistRecord,
} from "./types";
import { contactFor } from "./contact-research";
import { exactOutreach, suggestedPlacementFor } from "./exact-outreach";
import { nextActionLine, isReadyToContact, isApplyNow } from "./action-queue";
import { kitleticsPublicUrl } from "./public-url";
import { extraDutchOpportunities, extraDutchProspects } from "./extra-dutch";
import { seedForumOpportunities } from "./forum-seed";
import { isForumOpportunityType } from "./type-aliases";

const LOCKED = new Set([
  "contacted",
  "follow_up_due",
  "responded",
  "interested",
  "declined",
  "link_earned",
  "mention_earned",
  "no_response",
]);

function host(domain: string): string {
  return domain.replace(/^www\./, "").toLowerCase();
}

export function hydrateOpportunity(o: BacklinkOpportunity): BacklinkOpportunity {
  const research = contactFor(o.domain, o.id) ?? contactFor(host(o.domain), o.id);
  const next: BacklinkOpportunity = { ...o };

  if (research) {
    next.contactMethod = research.contactMethod;
    next.contactName = research.contactPerson ?? next.contactName;
    next.contactRole = research.contactRole ?? next.contactRole;
    next.contactUrl = research.contactUrl;
    next.contactEmail = research.contactEmail;
    next.contactSourceUrl = research.contactSourceUrl;
    next.contactVerifiedAt = research.verifiedAt;
    next.linkedinUrl = research.linkedinUrl ?? next.linkedinUrl;
    next.xUrl = research.xUrl ?? next.xUrl;
    next.editorialFit = research.editorialFit;
    if (research.applicationUrl) {
      next.applicationUrl = research.applicationUrl;
      next.applicationType = research.applicationType;
      next.applicationRequirements = research.applicationRequirements;
    }
    const extraNotes = research.notes;
    if (extraNotes && !next.notes?.includes(extraNotes.slice(0, 40))) {
      next.notes = [next.notes, extraNotes].filter(Boolean).join(" ");
    }
  }

  if (/DO NOT SEND/i.test(next.notes ?? "")) {
    next.editorialFit = next.editorialFit ?? "unknown";
    next.actionStatus = "NOT_ACTIONABLE";
    next.nextAction = "NOT_ACTIONABLE — do-not-send / watchlist this month.";
    return next;
  }

  if (next.contactMethod === "CONTACT_NOT_EDITORIAL" || next.editorialFit === "not_editorial") {
    next.actionStatus = "NOT_ACTIONABLE";
    next.nextAction = nextActionLine(next);
    return next;
  }

  if (isForumOpportunityType(next.opportunityType) || next.forumThread) {
    next.contactMethod =
      next.opportunityType === "REDDIT_THREAD" ? "REDDIT_THREAD" : next.contactMethod ?? "FORUM_THREAD";
    next.contactUrl = next.forumThread?.url ?? next.url;
    next.publicAssetUrl = kitleticsPublicUrl(next.targetUrl);
    next.nextAction = next.url ? `Reply here: ${next.url}` : "NEEDS CONTACT RESEARCH";
    if (next.forumThread?.forumUrgency === "SKIP") {
      next.actionStatus = "NOT_ACTIONABLE";
    } else if (next.suggestedResponse) {
      next.actionStatus = "MESSAGE_READY";
    } else {
      next.actionStatus = "CONTACT_RESEARCH";
    }
    return next;
  }

  const draft = exactOutreach({
    ...next,
    publicAssetUrl: kitleticsPublicUrl(next.targetUrl),
    suggestedPlacement: next.suggestedPlacement || suggestedPlacementFor(next),
  });
  next.publicAssetUrl = draft.publicAssetUrl;
  next.suggestedPlacement = draft.placement;
  if (!LOCKED.has(next.outreachStatus)) {
    next.outreachSubject = draft.subject;
    next.outreachMessage = draft.message;
    next.followUpMessage = draft.followUp;
  } else if (!next.outreachMessage) {
    next.outreachSubject = draft.subject;
    next.outreachMessage = draft.message;
    next.followUpMessage = draft.followUp;
  }

  next.nextAction = nextActionLine(next);

  if (LOCKED.has(next.outreachStatus)) {
    if (next.outreachStatus === "follow_up_due") next.actionStatus = "FOLLOW_UP_DUE";
    else if (next.outreachStatus === "contacted") next.actionStatus = "CONTACTED";
    else if (next.outreachStatus === "responded" || next.outreachStatus === "interested") {
      next.actionStatus = "RESPONDED";
    } else if (next.outreachStatus === "link_earned" || next.outreachStatus === "mention_earned") {
      next.actionStatus = "LINK_EARNED";
    } else if (next.outreachStatus === "declined") next.actionStatus = "DECLINED";
    return next;
  }

  const ready = isReadyToContact(next);
  const apply = isApplyNow(next);
  if (ready) {
    next.actionStatus = "READY_TO_CONTACT";
    next.outreachStatus = "draft_ready";
  } else if (apply) {
    next.actionStatus = "MESSAGE_READY";
    next.outreachStatus = "draft_ready";
  } else if (next.contactMethod && next.contactMethod !== "UNKNOWN" && next.contactUrl) {
    next.actionStatus = "CONTACT_FOUND";
  } else {
    next.actionStatus = "CONTACT_RESEARCH";
    next.contactMethod = next.contactMethod ?? "UNKNOWN";
  }

  return next;
}

function hydrateProspect(p: BacklinkProspect): BacklinkProspect {
  const research = contactFor(p.domain);
  if (!research) return p;
  return {
    ...p,
    contactName: research.contactPerson ?? p.contactName,
    contactRole: research.contactRole ?? p.contactRole,
    contactEmail: research.contactEmail ?? p.contactEmail,
    contactUrl: research.contactUrl || p.contactUrl,
    contactSource: research.contactSourceUrl,
    linkedinUrl: research.linkedinUrl ?? p.linkedinUrl,
    xUrl: research.xUrl ?? p.xUrl,
    contactStatus:
      research.contactEmail || (research.contactMethod !== "UNKNOWN" && research.contactMethod !== "CONTACT_NOT_EDITORIAL")
        ? research.contactEmail
          ? "CONFIRMED"
          : p.contactStatus
        : "CONTACT_UNKNOWN",
    notes: [p.notes, research.notes].filter(Boolean).join(" · "),
  };
}

function hydrateJournalist(j: JournalistRecord): JournalistRecord {
  if (!j.domain) return j;
  const research = contactFor(j.domain);
  if (!research) return j;
  return {
    ...j,
    name: research.contactPerson ?? j.name,
    role: research.contactRole ?? j.role,
    contactEmail: research.contactEmail ?? j.contactEmail,
    contactMethod: research.contactMethod,
    contactSource: research.contactSourceUrl,
    contactStatus: research.contactEmail ? "CONFIRMED" : j.contactStatus,
  };
}

export function hydrateWorkspace(ws: BacklinkWorkspace): BacklinkWorkspace {
  const urls = new Set(ws.opportunities.map((o) => o.url));
  const extraOpps = [...extraDutchOpportunities(), ...seedForumOpportunities()].filter(
    (o) => !urls.has(o.url),
  );
  const extraProspects = extraDutchProspects().filter(
    (p) => !ws.prospects.some((e) => host(e.domain) === host(p.domain)),
  );
  const opportunities = [...ws.opportunities, ...extraOpps].map(hydrateOpportunity);
  const prospects = [...ws.prospects, ...extraProspects].map(hydrateProspect);
  return {
    ...ws,
    prospects,
    opportunities,
    journalists: ws.journalists.map(hydrateJournalist),
  };
}
