import TicketForm from "@/components/TicketForm";
import Link from "next/link";

export default function Home() {
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-hover focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2"
            >
              Open Dashboard
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center text-sm font-medium text-muted transition-colors duration-150 hover:text-ink"
            >
              Agent sign in
            </Link>
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
