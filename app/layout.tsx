import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triage — AI Support Dashboard",
  description: "AI-powered support ticket triage",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en">
      <body className="min-h-screen bg-paper font-body text-ink antialiased">
        <div className="relative min-h-screen overflow-x-hidden bg-paper">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top,rgba(36,84,255,0.12),transparent_60%)]" />
          <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur-xl">
            <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
              <Link
                href="/"
                className="font-display text-lg font-bold tracking-tight text-ink transition-colors duration-150 hover:text-signal"
              >
                Triage
              </Link>
              <div className="flex min-w-0 items-center gap-3 text-sm">
                <Link
                  href="/dashboard"
                  className="hidden text-muted transition-colors duration-150 hover:text-ink sm:inline-flex"
                >
                  Dashboard
                </Link>
                {user ? (
                  <LogoutButton />
                ) : (
                  <Link
                    href="/login"
                    className="text-muted transition-colors duration-150 hover:text-ink"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
