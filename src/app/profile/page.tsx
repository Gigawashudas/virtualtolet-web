import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Home, LogOut, ShieldCheck, UserRound, XCircle } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Listing = {
  id: string;
  title: string;
  listing_type: string;
  monthly_rent: number | null;
  publication_status: string | null;
  rental_lifecycle: string | null;
  created_at: string;
};

function formatListingType(value: string) {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    room: "Room",
    hostel_seat: "Seat",
    garage: "Garage",
  };

  return labels[value] ?? value;
}

function formatPublicationStatus(value: string | null) {
  const labels: Record<string, string> = {
    pending_review: "Pending review",
    published: "Published",
    rejected: "Rejected",
    draft: "Draft",
  };

  return value ? (labels[value] ?? value) : "Unknown";
}

function formatLifecycle(value: string | null) {
  const labels: Record<string, string> = {
    active: "Active",
    rented: "Rented",
    inactive: "Inactive",
  };

  return value ? (labels[value] ?? value) : "Unknown";
}

function formatRent(value: number | null) {
  if (value === null) {
    return "Rent not specified";
  }

  return `৳${new Intl.NumberFormat("en-BD").format(value)} / month`;
}

function getPublicationStatusClass(value: string | null) {
  if (value === "published") {
    return "border-brand-green/20 bg-brand-green/5 text-brand-green";
  }

  if (value === "rejected") {
    return "border-brand-red/20 bg-brand-red/5 text-brand-red";
  }

  return "border-border bg-background text-text-secondary";
}

function getLifecycleClass(value: string | null) {
  if (value === "rented") {
    return "border-brand-red/20 bg-brand-red/5 text-brand-red";
  }

  if (value === "active") {
    return "border-brand-green/20 bg-brand-green/5 text-brand-green";
  }

  return "border-border bg-background text-text-secondary";
}

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

  const { data: listings, error: listingsError } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        publication_status,
        rental_lifecycle,
        created_at
      `,
    )
    .eq("created_by", user.id)
    .order("created_at", { ascending: false });

  if (listingsError) {
    console.error("PROFILE LISTINGS ERROR:", listingsError);
  }

  const userListings: Listing[] = listings ?? [];

  const metadata = user.user_metadata ?? {};

  const displayName = metadata.full_name || metadata.name || user.email?.split("@")[0] || "User";

  const avatarUrl = metadata.avatar_url || metadata.picture || null;

  async function signOut() {
    "use server";

    const supabase = await createClient();

    await supabase.auth.signOut();

    redirect("/sign-in");
  }

  async function markAsRented(formData: FormData) {
    "use server";

    const listingId = String(formData.get("listingId") ?? "").trim();

    if (!listingId) {
      return;
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const { error } = await supabase
      .from("listings")
      .update({
        rental_lifecycle: "rented",
      })
      .eq("id", listingId)
      .eq("created_by", user.id);

    if (error) {
      console.error("MARK LISTING AS RENTED ERROR:", error);
      throw new Error("Failed to mark the listing as rented.");
    }

    redirect("/profile");
  }

  async function markAsAvailable(formData: FormData) {
    "use server";

    const listingId = String(formData.get("listingId") ?? "").trim();

    if (!listingId) {
      return;
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const { error } = await supabase
      .from("listings")
      .update({
        rental_lifecycle: "active",
      })
      .eq("id", listingId)
      .eq("created_by", user.id);

    if (error) {
      console.error("MARK LISTING AS AVAILABLE ERROR:", error);
      throw new Error("Failed to mark the listing as available.");
    }

    redirect("/profile");
  }

  async function removeListing(formData: FormData) {
    "use server";

    const listingId = String(formData.get("listingId") ?? "").trim();

    if (!listingId) {
      return;
    }

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const { error } = await supabase.from("listings").delete().eq("id", listingId).eq("created_by", user.id);

    if (error) {
      console.error("REMOVE LISTING ERROR:", error);
      throw new Error("Failed to remove the listing.");
    }

    redirect("/profile");
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
          <div className="space-y-6">
            {/* PROFILE */}
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

            {/* MY LISTINGS */}
            <section className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.08em] text-brand-green">Your activity</p>

                  <h2 className="mt-1 text-xl font-extrabold text-text-primary">My listings</h2>

                  <p className="mt-2 text-sm leading-6 text-text-secondary">View and manage the properties you have posted on Virtual To-let.</p>
                </div>

                <Link href="/post-to-let" className="hidden shrink-0 items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-bold text-text-primary transition-colors hover:border-hover-border hover:bg-hover-background hover:text-hover-text sm:flex">
                  Post a TO-LET
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </Link>
              </div>

              {userListings.length === 0 ? (
                <div className="py-12 text-center">
                  <Home className="mx-auto h-9 w-9 text-text-muted" strokeWidth={1.5} />

                  <h3 className="mt-4 text-lg font-bold text-text-primary">No listings yet</h3>

                  <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">You have not posted any listings yet.</p>

                  <Link href="/post-to-let" className="mt-6 inline-flex h-11 items-center gap-2 rounded-lg bg-text px-5 text-sm font-bold text-background transition-opacity hover:opacity-85">
                    Post a TO-LET
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {userListings.map((listing) => {
                    const isRented = listing.rental_lifecycle === "rented";
                    const isActive = listing.rental_lifecycle === "active";

                    return (
                      <div key={listing.id} className="py-6 first:pt-6 last:pb-0">
                        <div className="flex flex-col gap-5">
                          {/* LISTING INFO */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-text-muted">{formatListingType(listing.listing_type)}</span>

                                <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${getPublicationStatusClass(listing.publication_status)}`}>{formatPublicationStatus(listing.publication_status)}</span>

                                <span className={`rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${getLifecycleClass(listing.rental_lifecycle)}`}>{formatLifecycle(listing.rental_lifecycle)}</span>
                              </div>

                              <h3 className="mt-3 text-base font-bold text-text-primary">{listing.title}</h3>

                              <p className="mt-1 text-sm font-medium text-text-secondary">{formatRent(listing.monthly_rent)}</p>
                            </div>

                            {isRented ? <XCircle className="mt-1 h-5 w-5 shrink-0 text-brand-red" strokeWidth={1.8} /> : <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-brand-green" strokeWidth={1.8} />}
                          </div>

                          {/* ACTIONS */}
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/rentals/${listing.id}`} className="inline-flex h-10 items-center gap-2 rounded-lg border border-border px-4 text-sm font-bold text-text-primary transition-colors hover:border-hover-border hover:bg-hover-background hover:text-hover-text">
                              View
                              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                            </Link>

                            {isActive && (
                              <form action={markAsRented}>
                                <input type="hidden" name="listingId" value={listing.id} />

                                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 text-sm font-bold text-brand-red transition-colors hover:bg-brand-red/10">
                                  Mark as Rented
                                  <XCircle className="h-4 w-4" strokeWidth={1.8} />
                                </button>
                              </form>
                            )}

                            {isRented && (
                              <form action={markAsAvailable}>
                                <input type="hidden" name="listingId" value={listing.id} />

                                <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg border border-brand-green/20 bg-brand-green/5 px-4 text-sm font-bold text-brand-green transition-colors hover:bg-brand-green/10">
                                  Mark as Available
                                  <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                                </button>
                              </form>
                            )}

                            <form action={removeListing}>
                              <input type="hidden" name="listingId" value={listing.id} />

                              <button type="submit" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-bold text-text-secondary transition-colors hover:border-brand-red/20 hover:bg-brand-red/5 hover:text-brand-red">
                                Remove
                              </button>
                            </form>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link href="/post-to-let" className="mt-6 flex h-11 items-center justify-center gap-2 rounded-lg border border-border text-sm font-bold text-text-primary transition-colors hover:border-hover-border hover:bg-hover-background hover:text-hover-text sm:hidden">
                Post a TO-LET
                <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
              </Link>
            </section>
          </div>

          {/* SIDEBAR */}
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
