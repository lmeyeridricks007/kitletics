import type { ContactMethod, ContactRole } from "./types";

export interface DomainContactRecord {
  domain: string;
  contactMethod: ContactMethod;
  contactPerson?: string;
  contactRole?: ContactRole;
  contactUrl: string;
  contactEmail?: string;
  contactSourceUrl: string;
  verifiedAt: string;
  editorialFit: "editorial" | "not_editorial" | "unknown";
  notes: string;
  linkedinUrl?: string;
  xUrl?: string;
  applicationUrl?: string;
  applicationType?: string;
  applicationRequirements?: string;
}

const VERIFIED = "2026-09-13";

/** Public contact routes verified from official pages on 13 Sep 2026. No guessed inboxes. */
export const CONTACT_BY_DOMAIN: Record<string, DomainContactRecord> = {
  "fellrnr.com": {
    domain: "fellrnr.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Jonathan Savage",
    contactRole: "site_owner",
    contactUrl: "https://fellrnr.com/wiki/Contact_Me",
    contactEmail: "contact@fellrnr.com",
    contactSourceUrl: "https://fellrnr.com/wiki/About_Fellrnr",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "About page publishes the address as “contact fellrnr -dot- c o m”. LinkedIn profile is public: https://www.linkedin.com/in/jonathan-savage-01371810",
    linkedinUrl: "https://www.linkedin.com/in/jonathan-savage-01371810",
  },
  "therunningchannel.com": {
    domain: "therunningchannel.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Mark Dredge",
    contactRole: "running_editor",
    contactUrl: "https://therunningchannel.com/the-team/mark/",
    contactEmail: "mark@therunningchannel.com",
    contactSourceUrl: "https://therunningchannel.com/the-team/mark/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Team page asks for story/gear ideas by email. General desk hello@therunningchannel.com is on the contact page; use Mark for the stack-height piece.",
  },
  "prorun.nl": {
    domain: "prorun.nl",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Klaas Boomsma",
    contactRole: "editor",
    contactUrl: "https://www.prorun.nl/contact/",
    contactEmail: "redactie@prorun.nl",
    contactSourceUrl: "https://www.prorun.nl/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Official contact page: tips for the redactie → redactie@prorun.nl. Do not use leden@, koen@ (ads), or info@ as the editorial route.",
  },
  "runners.nl": {
    domain: "runners.nl",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: undefined,
    contactRole: "editor",
    contactUrl: "https://www.runners.nl/pagina/contact",
    contactEmail: "redactie@runners.nl",
    contactSourceUrl: "https://www.runners.nl/pagina/contact",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "service@runners.nl is klantenservice. Editorial tips: redactie@runners.nl. Tip form: https://www.runners.nl/pagina/tip-de-redactie",
    applicationUrl: "https://www.runners.nl/pagina/tip-de-redactie",
    applicationType: "TIP_FORM",
    applicationRequirements: "Verifiable source required. Do not paste copied news.",
  },
  "themorningshakeout.com": {
    domain: "themorningshakeout.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Mario Fraioli",
    contactRole: "newsletter_editor",
    contactUrl: "https://themorningshakeout.com/about/",
    contactEmail: "mario@themorningshakeout.com",
    contactSourceUrl: "https://themorningshakeout.com/about/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes: "About page lists mario@ for newsletter inquiries. chris@ is sponsorship — skip.",
  },
  "lauranorrisrunning.com": {
    domain: "lauranorrisrunning.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Laura Norris",
    contactRole: "coach",
    contactUrl: "https://lauranorrisrunning.com/press/",
    contactEmail: "laura@lauranorrisrunning.com",
    contactSourceUrl: "https://lauranorrisrunning.com/press/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes: "Press page publishes laura@ for interviews/quotes. Form also on /contact-me/.",
    applicationUrl: "https://lauranorrisrunning.com/contact-me/",
    applicationType: "CONTACT_FORM",
  },
  "strengthrunning.com": {
    domain: "strengthrunning.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Jason Fitzgerald",
    contactRole: "coach",
    contactUrl: "https://strengthrunning.com/contact/",
    contactEmail: "support@strengthrunning.com",
    contactSourceUrl: "https://strengthrunning.com/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Contact page lists support@ for media inquiries and “work together”, plus @JasonFitz1.",
    xUrl: "https://x.com/JasonFitz1",
  },
  "irunfar.com": {
    domain: "irunfar.com",
    contactMethod: "CONTACT_FORM",
    contactPerson: "Bryon Powell",
    contactRole: "editor",
    contactUrl: "https://www.irunfar.com/contact",
    contactSourceUrl: "https://www.irunfar.com/contact",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Official contact form. Page says they cannot reply to every editorial tip. No public inbox listed.",
    applicationUrl: "https://www.irunfar.com/contact",
    applicationType: "EDITORIAL_FORM",
    applicationRequirements: "Story lead / resource suggestion via the form. Expect no reply unless it fits.",
  },
  "runningmagazine.ca": {
    domain: "runningmagazine.ca",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Anne Francis",
    contactRole: "editor",
    contactUrl: "https://runningmagazine.ca/masthead/contact/",
    contactEmail: "info@runningmagazine.ca",
    contactSourceUrl: "https://runningmagazine.ca/masthead/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Masthead: Editor-in-Chief Anne Francis — “for all editorial product-related inquiries” info@runningmagazine.ca. advertising@ is sales.",
  },
  "athleticsweekly.com": {
    domain: "athleticsweekly.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Euan Crumley",
    contactRole: "editor",
    contactUrl: "https://athleticsweekly.com/contact/",
    contactEmail: "officemanager@athleticsweekly.com",
    contactSourceUrl: "https://athleticsweekly.com/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Contact page: article/feature suggestions go to officemanager@athleticsweekly.com. Editorial director named on the same page.",
    applicationUrl: "https://athleticsweekly.com/contact/",
    applicationType: "SUBMISSION_FORM",
    applicationRequirements: "Email a basic outline plus contact details.",
  },
  "aapsm.org": {
    domain: "aapsm.org",
    contactMethod: "CONTACT_FORM",
    contactPerson: "Rita Yates",
    contactRole: "unknown",
    contactUrl: "https://www.aapsm.org/inquiry.php",
    contactEmail: "ritayates2@aol.com",
    contactSourceUrl: "https://www.aapsm.org/inquiry.php",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Official inquiry form plus Executive Director email on the same page. This is academy contact, not a journalist desk.",
    applicationUrl: "https://www.aapsm.org/inquiry.php",
    applicationType: "CONTACT_FORM",
  },
  "mcmillanrunning.com": {
    domain: "mcmillanrunning.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Greg McMillan",
    contactRole: "coach",
    contactUrl: "https://www.mcmillanrunning.com/contact/",
    contactEmail: "Greg@McMillanRunning.com",
    contactSourceUrl:
      "https://cdn.mcmillanrunning.com/wp-content/uploads/2026/05/McMillan-Media-Kit.pdf",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "May 2026 media kit lists Greg@McMillanRunning.com. helpdesk@ on /contact/ is plan/support — use Greg for resource citation.",
  },
  "trailrunnermag.com": {
    domain: "trailrunnermag.com",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: undefined,
    contactRole: "editor",
    contactUrl: "https://www.trailrunnermag.com/people/customer-queries/",
    contactEmail: "zrom@outsideinc.com",
    contactSourceUrl: "https://www.trailrunnermag.com/people/customer-queries/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Page labels zrom@outsideinc.com as Contact Editorial. support@outsideinc.com is customer support — do not use.",
  },
  "runningwarehouse.com": {
    domain: "runningwarehouse.com",
    contactMethod: "CONTACT_NOT_EDITORIAL",
    contactUrl: "https://www.runningwarehouse.com/contactus.html",
    contactSourceUrl: "https://www.runningwarehouse.com/contactus.html",
    verifiedAt: VERIFIED,
    editorialFit: "not_editorial",
    notes: "Retailer customer service. Do not send a citation pitch to shop support.",
  },
  "runnersneed.com": {
    domain: "runnersneed.com",
    contactMethod: "CONTACT_NOT_EDITORIAL",
    contactUrl: "https://www.runnersneed.com/about-us/contact-us.html",
    contactSourceUrl: "https://www.runnersneed.com/about-us/contact-us.html",
    verifiedAt: VERIFIED,
    editorialFit: "not_editorial",
    notes: "Shop customer services, not an editorial desk.",
  },
  "zappos.com": {
    domain: "zappos.com",
    contactMethod: "CONTACT_NOT_EDITORIAL",
    contactUrl: "https://www.zappos.com/c/contact-us",
    contactSourceUrl: "https://www.zappos.com/c/contact-us",
    verifiedAt: VERIFIED,
    editorialFit: "not_editorial",
    notes: "Customer care only.",
  },
  "dehardloopwinkel.nl": {
    domain: "dehardloopwinkel.nl",
    contactMethod: "CONTACT_NOT_EDITORIAL",
    contactUrl: "https://www.dehardloopwinkel.nl/service/contact/",
    contactSourceUrl: "https://www.dehardloopwinkel.nl/service/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "not_editorial",
    notes: "Webshop klantenservice (webshop@ / info@). Not a redactie.",
  },
  "trainingpeaks.com": {
    domain: "trainingpeaks.com",
    contactMethod: "UNKNOWN",
    contactUrl: "https://www.trainingpeaks.com/blog/how-to-find-your-perfect-running-shoe/",
    contactSourceUrl: "https://www.trainingpeaks.com/media/",
    verifiedAt: VERIFIED,
    editorialFit: "unknown",
    notes:
      "marketing@trainingpeaks.com is company PR, not a blog editor. Help-center is product support. No public author inbox for Lexi Miller stored — stay in NEEDS CONTACT RESEARCH. Do not send to marketing@.",
  },
  "hardlopen.nl": {
    domain: "hardlopen.nl",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: undefined,
    contactRole: "editor",
    contactUrl: "https://www.hardlopen.nl/contact/",
    contactEmail: "info@hardlopen.nl",
    contactSourceUrl: "https://www.hardlopen.nl/contact/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Official contact page: questions or samenwerking → info@hardlopen.nl. Powered by Atletiekunie. evenementen@atletiekunie.nl is calendar ops, not this pitch.",
  },
  "womensrunning.co.uk": {
    domain: "womensrunning.co.uk",
    contactMethod: "PUBLIC_EMAIL",
    contactPerson: "Esther Newman",
    contactRole: "editor",
    contactUrl: "https://www.womensrunning.co.uk/contact-us/",
    contactEmail: "esther.newman@anthem.co.uk",
    contactSourceUrl: "https://www.womensrunning.co.uk/contact-us/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Contact page lists Esther Newman (Editor) esther.newman@anthem.co.uk. Digital editor Holly Taylor holly.taylor@anthem.co.uk. megan.gibbings@ is advertising — skip.",
  },
  "sweatscience.substack.com": {
    domain: "sweatscience.substack.com",
    contactMethod: "AUTHOR_CONTACT_PAGE",
    contactPerson: "Alex Hutchinson",
    contactRole: "freelance_writer",
    contactUrl: "https://www.alexhutchinson.net/contact",
    contactSourceUrl: "https://www.alexhutchinson.net/contact",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "Public contact page lists speaking (request@speakers.ca) and book/podcast (HarperCollins). No public Sweat Science editorial inbox stored. Do not use the speaking bureau for a catalog cite.",
  },
  "alexhutchinson.net": {
    domain: "alexhutchinson.net",
    contactMethod: "AUTHOR_CONTACT_PAGE",
    contactPerson: "Alex Hutchinson",
    contactRole: "freelance_writer",
    contactUrl: "https://www.alexhutchinson.net/contact",
    contactSourceUrl: "https://www.alexhutchinson.net/contact",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "No public editorial inbox. request@speakers.ca is speaking only. lindsey.kennedy@harpercollins.com is book-related only.",
  },
  "wisdomrunning.com": {
    domain: "wisdomrunning.com",
    contactMethod: "AUTHOR_CONTACT_PAGE",
    contactPerson: "Alex Roven",
    contactRole: "site_owner",
    contactUrl: "https://wisdomrunning.com/about/",
    contactSourceUrl: "https://wisdomrunning.com/about/",
    verifiedAt: VERIFIED,
    editorialFit: "editorial",
    notes:
      "About page has a contact line but the address is obfuscated in HTML. No public inbox stored. Stay in NEEDS CONTACT RESEARCH until the address is visible.",
  },
};

export const CONTACT_BY_OPP_ID: Record<string, Partial<DomainContactRecord>> = {
  "opp-prorun-bas": {
    contactPerson: "Bas Stigter",
    contactRole: "running_editor",
    contactEmail: "bas@prorun.nl",
    contactUrl: "https://www.prorun.nl/borntorun/video-qa-met-klaas-boomsma-en-bas-stigter/",
    contactSourceUrl:
      "https://www.prorun.nl/borntorun/video-qa-met-klaas-boomsma-en-bas-stigter/",
    notes: "Q&A page publishes bas@prorun.nl for questions to Bas.",
  },
};

export function contactFor(
  domain: string,
  opportunityId?: string,
): DomainContactRecord | undefined {
  const host = domain.replace(/^www\./, "").toLowerCase();
  const base = CONTACT_BY_DOMAIN[host];
  const over = opportunityId ? CONTACT_BY_OPP_ID[opportunityId] : undefined;
  if (!base && !over) return undefined;
  if (!base) return undefined;
  return over ? { ...base, ...over, domain: host } : base;
}
