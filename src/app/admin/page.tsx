import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRight, ClipboardCheck, Home, ShieldCheck } from "lucide-react";

import Navbar from "@/components/Navbar";

import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError) {
    console.error("ADMIN ACCESS CHECK ERROR:", adminError);
    redirect("/");
  }

  if (!isAdmin) {
    redirect("/");
  }

  const { count: pendingListingsCount } = await supabase.from("listings").select("id", { count: "exact", head: true }).eq("publication_status", "pending_review");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar adminMode />

      <div className="mx-auto max-w-[1200px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-green">Administration</p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Admin Dashboard</h1>

          <p className="mt-3 text-text-secondary">Manage Virtual To-let listings and platform operations.</p>
        </div>

        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/listings" className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-hover-border hover:bg-hover-background">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
              <ClipboardCheck className="h-5 w-5 text-brand-green" strokeWidth={1.8} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Listing Verification</h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">Review and verify submitted TO-LET listings.</p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-brand-green transition group-hover:translate-x-1" strokeWidth={1.8} />
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-2xl font-extrabold">{pendingListingsCount ?? 0}</p>

              <p className="mt-1 text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Pending review</p>
            </div>
          </Link>

          <Link href="/admin/listings/all" className="group rounded-2xl border border-border bg-surface p-6 transition hover:-translate-y-0.5 hover:border-hover-border hover:bg-hover-background">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
              <Home className="h-5 w-5 text-brand-green" strokeWidth={1.8} />
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Listings</h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">View and manage all Virtual To-let listings.</p>
              </div>

              <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-brand-green transition group-hover:translate-x-1" strokeWidth={1.8} />
            </div>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">View all listings</p>
            </div>
          </Link>

          <div className="rounded-2xl border border-border bg-surface p-6">
            <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-background">
              <ShieldCheck className="h-5 w-5 text-brand-green" strokeWidth={1.8} />
            </div>

            <h2 className="text-lg font-bold">Administration</h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">Platform controls and administrative tools.</p>

            <div className="mt-6 border-t border-border pt-5">
              <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Coming next</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
