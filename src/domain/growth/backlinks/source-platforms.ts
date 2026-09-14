export interface SourcePlatformGuide {
  platform: string;
  registrationUrl: string;
  requestUrl?: string;
  howToRegister: string;
  approvalNeeded: string;
  cost: string;
  howRequestsArrive: string;
  categoriesToMonitor: string[];
  notes: string;
}

export const SOURCE_PLATFORM_GUIDES: SourcePlatformGuide[] = [
  {
    platform: "HARO",
    registrationUrl: "https://www.helpareporter.com/",
    requestUrl: "https://www.helpareporter.com/",
    howToRegister:
      "Open helpareporter.com, sign up as a source (I’m a Source / Sign Up). Complete name, email, topics.",
    approvalNeeded: "Free source account. Profile completeness helps; no Kitletics-specific approval step is published.",
    cost: "Free source digest. Featured paid plans are optional ($39/$79) and separate from HARO email.",
    howRequestsArrive: "Three daily email digests (morning / afternoon / evening) after Featured’s 2025 relaunch.",
    categoriesToMonitor: ["sports", "health", "fitness", "consumer", "lifestyle"],
    notes: "Reply on the platform/email thread for that query. Never invent statistics in a pitch.",
  },
  {
    platform: "Featured",
    registrationUrl: "https://featured.com/product/features/journalist-requests",
    requestUrl: "https://featured.com/product/features/journalist-requests",
    howToRegister: "Create a Featured account (free to start, no card). Describe beats in chat.",
    approvalNeeded: "Free plan available. Paid workflows are optional.",
    cost: "Free chat matching; Lite $39/mo and Pro $79/mo billed annually if you want workflows.",
    howRequestsArrive: "In-product matching of HARO, Connectively, Substack, X, LinkedIn requests.",
    categoriesToMonitor: ["running", "sports equipment", "consumer gear", "fitness"],
    notes: "Featured currently owns HARO and Connectively.",
  },
  {
    platform: "Connectively",
    registrationUrl: "https://www.connectively.us/experts",
    requestUrl: "https://www.connectively.us/experts",
    howToRegister: "Join as an Expert on connectively.us. Add LinkedIn, headshot, site, business email; set profile public.",
    approvalNeeded: "Verification Signals are optional (LinkedIn, headshot, site, business email).",
    cost: "Verification Signals listed as no cost on public profiles (Sep 2026 announcement).",
    howRequestsArrive: "Publisher questions / expert directory. Typical query draws many replies — be specific.",
    categoriesToMonitor: ["sports", "running", "health & fitness"],
    notes: "Do not overclaim credentials on the expert profile.",
  },
  {
    platform: "Qwoted",
    registrationUrl: "https://www.qwoted.com/for-smb-personal-brands/",
    requestUrl: "https://app.qwoted.com/",
    howToRegister:
      "Create an account at app.qwoted.com, complete photo, bio, topical tags (app.qwoted.com/my_interests).",
    approvalNeeded: "Profile completeness. Free vs Pro: free users may see delayed unlocks.",
    cost: "Free account exists. Pro is paid (amount not stored here — check the signup page).",
    howRequestsArrive: "Email alerts plus in-app feed based on tags.",
    categoriesToMonitor: ["running", "sports", "fitness", "consumer products"],
    notes: "Pitch inside Qwoted. support@qwoted.com is product support, not a journalist.",
  },
  {
    platform: "SourceBottle",
    registrationUrl: "https://www.sourcebottle.com/",
    requestUrl: "https://www.sourcebottle.com/",
    howToRegister: "Register as a source on sourcebottle.com and pick relevant topics.",
    approvalNeeded: "UNKNOWN — confirm on the current signup page before paying.",
    cost: "UNKNOWN — do not invent a price.",
    howRequestsArrive: "Email alerts for matched queries (confirm after signup).",
    categoriesToMonitor: ["sports", "health", "fitness"],
    notes: "Human must confirm current pricing after opening the registration URL.",
  },
  {
    platform: "Source of Sources",
    registrationUrl: "https://sourceofsources.com/",
    requestUrl: "https://sourceofsources.com/",
    howToRegister: "Open sourceofsources.com and complete the expert/source signup if still offered.",
    approvalNeeded: "UNKNOWN",
    cost: "UNKNOWN",
    howRequestsArrive: "UNKNOWN until account exists.",
    categoriesToMonitor: ["sports", "running"],
    notes: "If the site has changed, park this row. Do not invent a login URL.",
  },
];
