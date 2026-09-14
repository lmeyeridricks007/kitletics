"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

function CopyBtn({ label, text }: { label: string; text: string }) {
  const [ok, setOk] = useState(false);
  if (!text) return null;
  return (
    <Button
      type="button"
      size="sm"
      variant="outline"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        window.setTimeout(() => setOk(false), 1500);
      }}
    >
      {ok ? "Copied" : label}
    </Button>
  );
}

export function CopyTextButtons({
  subject,
  message,
  followUp,
  response,
}: {
  subject?: string;
  message?: string;
  followUp?: string;
  response?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {subject ? <CopyBtn label="Copy subject" text={subject} /> : null}
      {message ? <CopyBtn label="Copy message" text={message} /> : null}
      {followUp ? <CopyBtn label="Copy follow-up" text={followUp} /> : null}
      {response ? <CopyBtn label="Copy response" text={response} /> : null}
    </div>
  );
}
