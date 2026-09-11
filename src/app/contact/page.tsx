import { TrustPageShell, trustMetadata } from "@/components/trust/TrustPageShell";
import { siteConfig } from "@/content/config";

export const metadata = trustMetadata(
  "Contact",
  "Get in touch with Kitletics.",
  "/contact",
);

export default function ContactPage() {
  return (
    <TrustPageShell
      title="Contact"
      description="Questions about methodology, partnerships or corrections."
    >
      <p>
        Reach us at{" "}
        <a
          className="font-medium text-accent hover:underline"
          href="mailto:hello@kitletics.com"
        >
          hello@kitletics.com
        </a>
        .
      </p>
      <p>
        For product data corrections, include the product URL on {siteConfig.url}.
      </p>
    </TrustPageShell>
  );
}
