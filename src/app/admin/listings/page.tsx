import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, Clock3, Home, ShieldCheck } from "lucide-react";

import VirtualToletLogo from "@/components/VirtualToletLogo";
import { createClient } from "@/lib/supabase/server";

type Listing = {
  id: string;
  title: string;
  listing_type: string;
  monthly_rent: number | null;
  available_from: string | null;
  created_at: string;
  properties: {
    area: string;
    house_number: string | null;
  } | null;
  profiles: {
    display_name: string | null;
    email?: string | null;
  } | null;
};

function formatRent(value: number | null) {
  if (value === null) {
    return "Rent not specified";
  }

  return `৳${new Intl.NumberFormat("en-BD").format(value)}/month`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatListingType(value: string) {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    room: "Room",
    hostel_seat: "Seat",
    garage: "Garage",
  };

  return labels[value] ?? value;
}

export default async function AdminListingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: adminUser, error: adminError } = await supabase.from("admin_users").select("user_id").eq("user_id", user.id).eq("is_active", true).maybeSingle();

  if (adminError) {
    console.error("ADMIN ACCESS CHECK ERROR:", adminError);
    redirect("/");
  }

  if (!adminUser) {
    redirect("/");
  }

  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        available_from,
        created_at,
        properties (
          area,
          house_number
        ),
        profiles!listings_created_by_fkey (
          display_name
        )
      `,
    )
    .eq("publication_status", "pending_review")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("ADMIN LISTINGS ERROR:", error);
  }

  const pendingListings = (listings ?? []) as unknown as Listing[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <VirtualToletLogo />

          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold text-text-secondary sm:inline">Admin</span>

            <Link href="/" className="inline-flex h-10 items-center rounded-lg border border-border px-4 text-sm font-semibold transition hover:bg-hover-background hover:border-hover-border hover:text-hover-text">
              View site
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-green">
            <ShieldCheck className="h-4 w-4" strokeWidth={2} />
            Admin
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Listing verification</h1>

          <p className="mt-3 max-w-2xl text-text-secondary">Review submitted TO-LET listings before they become visible to renters.</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <Clock3 className="h-4 w-4" />
              <span className="text-sm font-semibold">Pending review</span>
            </div>

            <p className="text-3xl font-extrabold">{pendingListings.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <Home className="h-4 w-4" />
              <span className="text-sm font-semibold">Queue</span>
            </div>

            <p className="text-sm font-semibold text-text-secondary">Oldest submissions first</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-brand-green">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-semibold">Protected</span>
            </div>

            <p className="text-sm font-semibold text-text-secondary">Admin-only review</p>
          </div>
        </div>

        {pendingListings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <CheckCircle2 className="mx-auto mb-4 h-10 w-10 text-brand-green" />

            <h2 className="text-xl font-bold">No listings waiting</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">All submitted listings have been reviewed.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="hidden border-b border-border bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-text-muted md:grid md:grid-cols-[1.6fr_0.8fr_1fr_0.8fr_0.7fr] md:gap-4">
              <span>Listing</span>
              <span>Type</span>
              <span>Location</span>
              <span>Submitted</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {pendingListings.map((listing) => (
                <Link key={listing.id} href={`/admin/listings/${listing.id}`} className="group block px-6 py-5 transition hover:bg-hover-background">
                  <div className="grid gap-4 md:grid-cols-[1.6fr_0.8fr_1fr_0.8fr_0.7fr] md:items-center md:gap-4">
                    <div>
                      <p className="font-bold">{listing.title}</p>

                      <p className="mt-1 text-sm text-text-secondary">{formatRent(listing.monthly_rent)}</p>
                    </div>

                    <div className="text-sm font-semibold">{formatListingType(listing.listing_type)}</div>

                    <div className="text-sm text-text-secondary">{listing.properties?.area ?? "Area not specified"}</div>

                    <div className="text-sm text-text-secondary">{formatDate(listing.created_at)}</div>

                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-sm font-bold text-brand-green">Review</span>

                      <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-green" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
