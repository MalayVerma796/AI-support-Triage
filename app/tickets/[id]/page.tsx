import ReplyDraft from "@/components/ReplyDraft";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { notFound } from "next/navigation";

type SimilarTicket = {
  ticket_id: string;
  subject: string;
  body: string;
  similarity: number;
};

export default async function TicketDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: ticket, error } = await supabase
    .from("tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !ticket) {
    notFound();
  }

  const { data: embeddingRow } = await supabase
    .from("ticket_embeddings")
    .select("embedding")
    .eq("ticket_id", id)
    .single();

  let similarTickets: SimilarTicket[] = [];

  if (embeddingRow) {
    const { data: matches } = await supabase.rpc("match_tickets", {
      query_embedding: embeddingRow.embedding,
      match_count: 3,
      exclude_ticket_id: id,
    });
    similarTickets = matches ?? [];
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <div className="space-y-8">
        <section className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-5">
            <Link
              href="/dashboard"
              className="inline-flex text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              ← Back to Dashboard
            </Link>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <StatusTag label={ticket.category} />
                <UrgencyTag label={ticket.urgency} />
                <StatusTag label={ticket.sentiment} />
                <StatusTag label={ticket.status} />
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                  {ticket.subject}
                </h1>
                <div className="flex flex-col gap-1 text-sm text-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                  <p>{ticket.customer_email}</p>
                  <p className="font-mono text-xs">
                    {new Date(ticket.created_at).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-3">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Customer Message
            </p>
            <p className="whitespace-pre-wrap text-sm leading-7 text-ink">
              {ticket.body}
            </p>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-5">
            <div className="space-y-2">
              <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
                Similar Past Tickets
              </h2>
              <p className="text-sm text-muted">
                Compare this issue with the closest historical matches.
              </p>
            </div>

            {similarTickets.length === 0 && (
              <div className="py-16 text-center">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper">
                  <div className="h-5 w-5 rounded-full border-2 border-muted/40" />
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-ink">
                  No similar tickets yet
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-muted">
                  Once comparable issues exist in the knowledge base, matching
                  tickets will appear here with confidence scores.
                </p>
              </div>
            )}

            {similarTickets.length > 0 && (
              <div className="space-y-3">
                {similarTickets.map((match) => {
                  const percentage = Math.round(match.similarity * 100);

                  return (
                    <Link
                      key={match.ticket_id}
                      href={`/tickets/${match.ticket_id}`}
                      className="block rounded-xl border border-line bg-surface p-5 shadow-sm transition-all duration-150 hover:border-signal/40 hover:shadow-md"
                    >
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <p className="font-display text-base font-semibold tracking-tight text-ink">
                            {match.subject}
                          </p>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted">
                            {match.body}
                          </p>
                        </div>
                        <div className="w-full sm:w-44">
                          <p className="text-right font-mono text-xs text-muted">
                            {percentage}% match
                          </p>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                            <div
                              className="h-full rounded-full bg-signal"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <ReplyDraft
            subject={ticket.subject}
            body={ticket.body}
            similarTickets={similarTickets}
          />
        </section>
      </div>
    </main>
  );
}

function StatusTag({ label }: { label: string | null }) {
  if (!label) return null;

  return (
    <span className="inline-flex items-center rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs uppercase tracking-wide text-muted">
      {label}
    </span>
  );
}

function UrgencyTag({ label }: { label: string | null }) {
  if (!label) return null;

  const urgencyClass =
    label === "high"
      ? "bg-urgency-high"
      : label === "medium"
        ? "bg-urgency-medium"
        : "bg-urgency-low";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${urgencyClass}`} />
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        {label}
      </span>
    </span>
  );
}
