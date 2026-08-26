"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import LogoutButton from "./LogoutButton";

interface NavbarProps {
  user: User | null;
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-ink transition-colors duration-150 hover:text-signal"
        >
          Triage
        </Link>
        <div className="flex min-w-0 items-center gap-3 text-sm">
          {pathname === "/login" ? (
            <Link
              href="/"
              className="text-muted transition-colors duration-150 hover:text-ink"
            >
              Back to ticket form
            </Link>
          ) : pathname === "/" ? (
            user ? (
              <Link
                href="/dashboard"
                className="text-muted transition-colors duration-150 hover:text-ink"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="text-muted transition-colors duration-150 hover:text-ink"
              >
                Agent Login
              </Link>
            )
          ) : (
            // Authenticated pages like /dashboard, /tickets/[id], etc.
            user && <LogoutButton />
          )}
        </div>
      </div>
    </header>
  );
}
