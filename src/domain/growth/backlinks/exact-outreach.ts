import type { BacklinkOpportunity } from "./types";
import { firstName, kitleticsPublicUrl } from "./public-url";
import { KITLETICS_EXPERT_PROFILE } from "./expert-profile";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function trimBody(text: string): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= 140) return text.trim();
  return `${words.slice(0, 140).join(" ").replace(/[,;:]$/, "")}.`;
}

function assetLines(assetUrl: string, nl: boolean): { intro: string; followNoun: string } {
  if (/\/tools\//i.test(assetUrl) || /finder/i.test(assetUrl)) {
    return nl
      ? {
          intro:
            "Kitletics heeft een hardloopschoen-finder, gevoed door actuele stack, heeldrop en gewicht:",
          followNoun: "schoenfinder",
        }
      : {
          intro:
            "We maintain a running-shoe finder at Kitletics, backed by published stack, heel-to-toe drop and weight:",
          followNoun: "finder",
        };
  }
  if (/\/guides\//i.test(assetUrl)) {
    return nl
      ? {
          intro: "Kitletics heeft een bijpassende koopgids die dezelfde specs uitlegt:",
          followNoun: "gids",
        }
      : {
          intro: "We publish a matching buying guide at Kitletics that covers the same specs:",
          followNoun: "guide",
        };
  }
  return nl
    ? {
        intro:
          "Kitletics houdt een doorzoekbare catalogus van huidige hardloopschoenen bij (stack, heeldrop, gewicht en regionale From-prijzen):",
        followNoun: "schoendatabase",
      }
    : {
        intro:
          "We maintain a searchable catalog of current running shoes at Kitletics — published stack, heel-to-toe drop, weight and related specs:",
        followNoun: "running-shoe catalog",
      };
}

export function suggestedPlacementFor(o: BacklinkOpportunity): string {
  const blob = `${o.topic} ${o.subtopic ?? ""} ${o.opportunityType}`.toLowerCase();
  if (o.language === "nl") {
    if (/drop|heeldrop|heel-to-toe/.test(blob)) {
      return "Bronlink direct onder de uitleg van heeldrop / offset, naast de millimetervoorbeelden.";
    }
    if (/stack|stapel/.test(blob)) {
      return "Verder lezen onder de stack-height-uitleg, als lookup voor actuele modellen.";
    }
    if (/kies|beginner|advies|finder/.test(blob)) {
      return "Handige vervolgstap onder het kopje over schoenen kiezen — geen extra Top-10.";
    }
    return "Bronvermelding naast de actuele schoenspecs in het artikel.";
  }
  if (/drop|heel-to-toe|offset/.test(blob)) {
    return "Resource link after the section explaining heel-to-toe drop, next to the millimetre examples.";
  }
  if (/stack/.test(blob)) {
    return "Further reading underneath the stack-height explanation, as a lookup for current models.";
  }
  if (/beginner|choose|select|finder|rotation/.test(blob)) {
    return "Useful tool underneath the beginner shoe-selection section — not another Top 10.";
  }
  if (/trail/.test(blob)) {
    return "Source citation next to current trail-shoe spec examples / methodology block.";
  }
  return "Source citation next to current shoe-spec examples.";
}

export function exactOutreach(o: BacklinkOpportunity): {
  subject: string;
  message: string;
  followUp: string;
  publicAssetUrl: string;
  placement: string;
} {
  const assetUrl = kitleticsPublicUrl(o.publicAssetUrl || o.targetUrl);
  const hi = firstName(o.contactName);
  const page = o.url;
  const placement = o.suggestedPlacement || suggestedPlacementFor(o);
  const nl = o.language === "nl";

  if (!assetUrl) {
    return {
      subject: nl ? "Geen publieke Kitletics-URL — niet versturen" : "No public Kitletics URL — do not send",
      message: "",
      followUp: "",
      publicAssetUrl: "",
      placement,
    };
  }

  if (nl) {
    const greet = hi ? `Beste ${hi},` : "Beste redactie,";
    const pitch = assetLines(assetUrl, true);
    const subject = o.topic.match(/drop|heeldrop/i)
      ? "Een actuele drop/stack/gewicht-tabel bij jullie heeldrop-uitleg"
      : o.topic.match(/kies|advies/i)
        ? "Een schoenfinder als vervolgstap na ‘kies de juiste schoen’"
        : `Een actuele Kitletics-pagina bij ${o.topic}`;
    const message = trimBody(
      `${greet}

Ik kwam jullie stuk tegen over ${o.topic.toLowerCase()}:
${page}

${pitch.intro}
${assetUrl}

Dat lijkt me een nuttige vervolgstap voor lezers die na jullie uitleg een actueel model willen checken. Natuurlijke plek: ${placement.toLowerCase()}

Als het past bij een volgende update, gebruik of citeer het gerust. Methodologie en dekking stuur ik mee als dat helpt. Geen account nodig.

${KITLETICS_EXPERT_PROFILE.name}
Kitletics`,
    );
    const followUp = `${greet}

Ik til dit nog even naar boven, voor het geval de ${pitch.followNoun} nuttig is bij een volgende update van ${page}:

${assetUrl}

Geen probleem als het geen match is.

${KITLETICS_EXPERT_PROFILE.name}`;
    return { subject, message, followUp, publicAssetUrl: assetUrl, placement };
  }

  const greet = hi ? `Hi ${hi},` : "Hello,";
  const pitch = assetLines(assetUrl, false);
  const subject = /stack/.test(o.topic)
    ? "A current running-shoe drop table for your stack-height guide"
    : /drop|offset/.test(o.topic)
      ? "A current drop/stack/weight lookup for your drop explainer"
      : /choose|select|beginner/.test(o.topic)
        ? "A running-shoe finder to sit under your how-to-choose section"
        : `A current Kitletics page for ${o.topic}`;

  const message = trimBody(
    `${greet}

I came across your piece on ${o.topic.toLowerCase()}:
${page}

${pitch.intro}

${assetUrl}

It looks like a useful companion for readers who want the next lookup after your explanation. Natural slot: ${placement}

If it's useful when the guide is next updated, feel free to use or cite it. Happy to send coverage and methodology.

${KITLETICS_EXPERT_PROFILE.name}
Kitletics`,
  );

  const followUp = `${greet}

Just resurfacing this in case the ${pitch.followNoun} is useful the next time you update this page:

${page}

${assetUrl}

No worries if it isn't a fit.

${KITLETICS_EXPERT_PROFILE.name}`;

  return { subject, message, followUp, publicAssetUrl: assetUrl, placement };
}

export function outreachWordCount(message: string): number {
  return wordCount(message);
}
