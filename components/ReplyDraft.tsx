"use client";

import { useState } from "react";

type SimilarTicket = {
  ticket_id: string;
  subject: string;
  body: string;
};

export default function ReplyDraft({
  subject,
  body,
  similarTickets,
}: {
  subject: string;
  body: string;
  similarTickets: SimilarTicket[];
}) {
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    const res = await fetch("/api/draft-reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body, similarTickets }),
    });
    const data = await res.json();
    setDraft(data.draft ?? "");
    setLoading(false);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
          AI-Suggested Reply
        </h2>
        <p className="text-sm text-muted">
          Generate a polished starting point, then tune the wording before
          sending it back to the customer.
        </p>
      </div>

      {!draft && (
        <div className="py-6">
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="inline-flex items-center justify-center rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-hover focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating draft..." : "Generate Reply Draft"}
          </button>
        </div>
      )}

      {draft && (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="replyDraft"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Draft Reply
            </label>
            <textarea
              id="replyDraft"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={8}
              className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-hover focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Regenerating..." : "Regenerate"}
            </button>
            <span className="font-mono text-xs text-muted">
              Uses ticket context and similar cases as guidance.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
