"use client";

import { useState } from "react";

type Ticket = {
  id: string;
  subject: string;
  category: string | null;
  urgency: string | null;
  sentiment: string | null;
  status: string;
  created_at: string;
};

export default function TicketTable({ tickets }: { tickets: Ticket[] }) {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");

  const filteredTickets = tickets.filter((ticket) => {
    const matchesCategory =
      categoryFilter === "all" || ticket.category === categoryFilter;
    const matchesUrgency =
      urgencyFilter === "all" || ticket.urgency === urgencyFilter;
    return matchesCategory && matchesUrgency;
  });

  const categories = Array.from(
    new Set(tickets.map((t) => t.category).filter(Boolean))
  ) as string[];

  return (
    <section className="space-y-8">
      <div className="rounded-xl border border-line bg-surface p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Queue Filters
            </h2>
            <p className="text-sm text-muted">
              Narrow the queue by team category or urgency level.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[30rem]">
            <div>
              <label
                htmlFor="categoryFilter"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Category
              </label>
              <select
                id="categoryFilter"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="urgencyFilter"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Urgency
              </label>
              <select
                id="urgencyFilter"
                value={urgencyFilter}
                onChange={(e) => setUrgencyFilter(e.target.value)}
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
              >
                <option value="all">All Urgencies</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4 border-t border-line pt-5">
          <p className="font-mono text-xs uppercase tracking-wide text-muted">
            {filteredTickets.length} of {tickets.length} tickets visible
          </p>
        </div>
      </div>

      {filteredTickets.length > 0 && (
        <div className="space-y-3">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="cursor-pointer rounded-xl border border-line bg-surface p-5 shadow-sm transition-all duration-150 hover:border-signal/40 hover:shadow-md"
              onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="space-y-1">
                    <p className="font-display text-base font-semibold tracking-tight text-ink">
                      {ticket.subject}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-muted">
                      <span>{new Date(ticket.created_at).toLocaleDateString("en-US")}</span>
                      <span>{ticket.category ?? "Uncategorized"}</span>
                      <span>{ticket.sentiment ?? "No sentiment"}</span>
                      <span>{ticket.status}</span>
                    </div>
                  </div>
                </div>
                <div className="shrink-0">
                  <UrgencyBadge urgency={ticket.urgency} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredTickets.length === 0 && (
        <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="py-16 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-paper">
              <div className="h-5 w-5 rounded-sm border-2 border-muted/40" />
            </div>
            <h3 className="font-display text-lg font-bold tracking-tight text-ink">
              No tickets match these filters
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Try widening the category or urgency filters to bring more of the
              queue back into view.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

function UrgencyBadge({ urgency }: { urgency: string | null }) {
  if (!urgency) {
    return (
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        none
      </span>
    );
  }

  const urgencyClass =
    urgency === "high"
      ? "bg-urgency-high"
      : urgency === "medium"
        ? "bg-urgency-medium"
        : "bg-urgency-low";

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${urgencyClass}`} />
      <span className="font-mono text-xs uppercase tracking-wide text-muted">
        {urgency}
      </span>
    </span>
  );
}
