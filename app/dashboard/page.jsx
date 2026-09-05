import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import TicketTable from "@/components/TicketTable";

export default async function Dashboard() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: tickets, error } = await supabase
    .from("tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
        <section className="py-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface shadow-sm">
            <div className="h-6 w-6 rounded-md border-2 border-urgency-high" />
          </div>
          <h1 className="font-display text-lg font-bold tracking-tight text-ink">
            Dashboard unavailable
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Tickets could not be loaded right now. {error.message}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12 md:py-16">
      <section className="space-y-8">
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-8 shadow-sm sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Support Queue
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
              Ticket Dashboard
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted">
              Review incoming issues, spot urgency at a glance, and move through
              your queue with less visual noise.
            </p>
          </div>
        </div>

        <TicketTable tickets={tickets ?? []} />
      </section>
    </main>
  );
}
