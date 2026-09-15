import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, LogOut, ShieldCheck, UserRound } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: isAdmin, error: adminError } = await supabase.rpc("is_admin");

  if (adminError) {
    console.error("PROFILE ADMIN CHECK ERROR:", adminError);
  }

  const metadata = user.user_metadata ?? {};

  const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "User";

  const avatarUrl = metadata.avatar_url || metadata.picture || null;

  async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/sign-in");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-[1000px] px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-10">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.12em] text-brand-green">Account</p>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your profile</h1>

          <p className="mt-3 text-text-secondary">Manage your Virtual To-let account and access your services.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-5 border-b border-border pb-7">
              {avatarUrl ? (
                <img src={avatarUrl} alt={displayName} className="h-20 w-20 rounded-full border border-border object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-background">
                  <UserRound className="h-8 w-8 text-brand-green" strokeWidth={1.7} />
                </div>
              )}

              <div className="min-w-0">
                <h2 className="truncate text-2xl font-extrabold">{displayName}</h2>

                <p className="mt-1 truncate text-sm text-text-secondary">{user.email}</p>
              </div>
            </div>

            <div className="pt-2">
              <div className="border-b border-border py-5">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Name</p>

                <p className="mt-1 text-sm font-semibold text-text-primary">{displayName}</p>
              </div>

              <div className="border-b border-border py-5">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Email</p>

                <p className="mt-1 break-all text-sm font-semibold text-text-primary">{user.email ?? "Not available"}</p>
              </div>

              <div className="py-5">
                <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">Account</p>

                <p className="mt-1 text-sm font-semibold text-text-primary">{isAdmin ? "User & Administrator" : "User"}</p>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            {isAdmin && (
              <section className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-green" strokeWidth={1.8} />

                  <h2 className="font-bold">Administration</h2>
                </div>

                <p className="mb-5 text-sm leading-6 text-text-secondary">Manage listing verification and platform administration.</p>

                <Link href="/admin" target="_blank" rel="noopener noreferrer" className="group flex h-11 w-full items-center justify-between rounded-lg border border-border px-4 text-sm font-bold transition hover:border-hover-border hover:bg-hover-background hover:text-hover-text">
                  <span>Admin Dashboard</span>

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" strokeWidth={1.8} />
                </Link>
              </section>
            )}

            <section className="rounded-2xl border border-border bg-surface p-6">
              <h2 className="mb-2 font-bold">Account actions</h2>

              <p className="mb-5 text-sm leading-6 text-text-secondary">Sign out of your Virtual To-let account.</p>

              <form action={signOut}>
                <button type="submit" className="group flex h-11 w-full items-center justify-between rounded-lg border border-border px-4 text-sm font-bold transition hover:border-hover-border hover:bg-hover-background hover:text-hover-text">
                  <span>Sign out</span>

                  <LogOut className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
