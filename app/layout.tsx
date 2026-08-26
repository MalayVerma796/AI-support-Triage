import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase-server";
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
          <Navbar user={user} />
          {children}
        </div>
      </body>
    </html>
  );
}
