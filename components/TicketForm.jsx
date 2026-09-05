"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TicketForm() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage("");

    const categorizeRes = await fetch("/api/categorize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, body }),
    });
    const categorization = await categorizeRes.json();

    const { data: insertedTicket, error } = await supabase
      .from("tickets")
      .insert({
        subject,
        body,
        customer_email: email,
        category: categorization.category,
        urgency: categorization.urgency,
        sentiment: categorization.sentiment,
      })
      .select()
      .single();

    if (!error && insertedTicket) {
      fetch("/api/embed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: insertedTicket.id,
          subject,
          body,
        }),
      });
    }

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage("Ticket submitted successfully!");
      setSubject("");
      setBody("");
      setEmail("");
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="subject"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Subject
        </label>
        <input
          id="subject"
          type="text"
          placeholder="Summarize the issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="body"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Issue Details
        </label>
        <textarea
          id="body"
          placeholder="Describe what happened, what was expected, and any urgency."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={6}
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-ink"
        >
          Customer Email
        </label>
        <input
          id="email"
          type="email"
          placeholder="customer@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex items-center justify-center rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-hover focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Submitting..." : "Submit Ticket"}
      </button>

      {message && (
        <p
          className={`rounded-lg px-4 py-3 text-sm ${
            message.startsWith("Error:")
              ? "border border-urgency-high/20 bg-urgency-high/5 text-urgency-high"
              : "border border-urgency-low/20 bg-urgency-low/5 text-urgency-low"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
