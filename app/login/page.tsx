"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl px-6 py-12 md:py-16">
      <section className="mx-auto grid w-full max-w-4xl gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-4">
            <div className="inline-flex w-fit items-center rounded-full border border-line bg-paper px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
              Agent Access
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
              Step into the support console.
            </h1>
            <p className="max-w-md text-sm leading-7 text-muted">
              Sign in to review active tickets, compare historical matches, and
              generate replies without breaking your workflow.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-line bg-surface p-8 shadow-sm">
          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
              Agent Login
            </h2>
            <p className="text-sm text-muted">
              Use your support credentials to continue.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="agent@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-line bg-paper px-4 py-2.5 text-sm focus:border-signal focus:ring-1 focus:ring-signal outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-lg bg-signal px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-signal-hover focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            {error && (
              <p className="rounded-lg border border-urgency-high/20 bg-urgency-high/5 px-4 py-3 text-sm text-urgency-high">
                {error}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
