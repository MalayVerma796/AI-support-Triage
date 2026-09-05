import TicketForm from "@/components/TicketForm";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  await supabase.auth.getUser();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col px-6 py-12 md:py-16">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-6 rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="inline-flex w-fit items-center rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            AI Support Operations
          </div>
          <div className="space-y-4">
            <h1 className="max-w-xl font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
              A calmer command center for support teams moving fast.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted sm:text-base">
              Triage turns incoming support issues into structured, actionable
              tickets with AI-assisted categorization, urgency scoring, and
              reply drafting that feels built for focused operator work.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Submit a new ticket
            </h2>
            <p className="text-sm leading-6 text-muted">
              Capture the issue cleanly so the dashboard can sort, prioritize,
              and route it with context.
            </p>
          </div>
          <div className="mt-6">
            <TicketForm />
          </div>
        </div>
      </section>
    </main>
  );
}
