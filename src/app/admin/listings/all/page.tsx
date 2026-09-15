import Link from "next/link";
import { redirect } from "next/navigation";

import { ArrowRight, CheckCircle2, Clock3, Eye, EyeOff, Home, ShieldCheck } from "lucide-react";

import Navbar from "@/components/Navbar";

import { createClient } from "@/lib/supabase/server";

type Listing = {
  id: string;
  title: string;
  listing_type: string;
  monthly_rent: number | null;
  available_from: string | null;
  publication_status: string;
  rental_lifecycle: string;
  availability_state: string;
  created_at: string;
  properties: {
    area: string;
    house_number: string | null;
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

function formatStatus(value: string) {
  const labels: Record<string, string> = {
    draft: "Draft",
    pending_review: "Pending review",
    published: "Published",
    hidden: "Rejected / Hidden",
  };

  return labels[value] ?? value;
}

function StatusIcon({ status }: { status: string }) {
  if (status === "published") {
    return <CheckCircle2 className="h-4 w-4 text-brand-green" strokeWidth={1.8} />;
  }

  if (status === "pending_review") {
    return <Clock3 className="h-4 w-4 text-text-muted" strokeWidth={1.8} />;
  }

  if (status === "hidden") {
    return <EyeOff className="h-4 w-4 text-text-muted" strokeWidth={1.8} />;
  }

  return <Eye className="h-4 w-4 text-text-muted" strokeWidth={1.8} />;
}

export default async function AdminAllListingsPage() {
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

  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        available_from,
        publication_status,
        rental_lifecycle,
        availability_state,
        created_at,
        properties (
          area,
          house_number
        )
      `,
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("ADMIN ALL LISTINGS ERROR:", error);
  }

  const allListings = (listings ?? []) as unknown as Listing[];

  const pendingCount = allListings.filter((listing) => listing.publication_status === "pending_review").length;

  const publishedCount = allListings.filter((listing) => listing.publication_status === "published").length;

  const hiddenCount = allListings.filter((listing) => listing.publication_status === "hidden").length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar adminMode />

      <div className="mx-auto max-w-[1440px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-10">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-green">
            <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
            Admin
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">All listings</h1>

          <p className="mt-3 max-w-2xl text-text-secondary">View and manage every TO-LET listing submitted to Virtual To-let.</p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <Home className="h-4 w-4" strokeWidth={1.8} />

              <span className="text-sm font-semibold">Total listings</span>
            </div>

            <p className="text-3xl font-extrabold">{allListings.length}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <Clock3 className="h-4 w-4" strokeWidth={1.8} />

              <span className="text-sm font-semibold">Pending</span>
            </div>

            <p className="text-3xl font-extrabold">{pendingCount}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-brand-green">
              <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />

              <span className="text-sm font-semibold">Published</span>
            </div>

            <p className="text-3xl font-extrabold">{publishedCount}</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <div className="mb-3 flex items-center gap-2 text-text-secondary">
              <EyeOff className="h-4 w-4" strokeWidth={1.8} />

              <span className="text-sm font-semibold">Hidden</span>
            </div>

            <p className="text-3xl font-extrabold">{hiddenCount}</p>
          </div>
        </div>

        {allListings.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface px-6 py-16 text-center">
            <Home className="mx-auto mb-4 h-10 w-10 text-brand-green" strokeWidth={1.8} />

            <h2 className="text-xl font-bold">No listings yet</h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text-secondary">Listings submitted by users will appear here.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="hidden border-b border-border bg-surface px-6 py-4 text-xs font-bold uppercase tracking-[0.1em] text-text-muted md:grid md:grid-cols-[1.6fr_0.7fr_1fr_0.9fr_0.9fr_0.7fr] md:gap-4">
              <span>Listing</span>
              <span>Type</span>
              <span>Location</span>
              <span>Status</span>
              <span>Submitted</span>
              <span />
            </div>

            <div className="divide-y divide-border">
              {allListings.map((listing) => (
                <Link key={listing.id} href={`/admin/listings/${listing.id}`} className="group block px-6 py-5 transition hover:bg-hover-background">
                  <div className="grid gap-4 md:grid-cols-[1.6fr_0.7fr_1fr_0.9fr_0.9fr_0.7fr] md:items-center md:gap-4">
                    <div>
                      <p className="font-bold">{listing.title}</p>

                      <p className="mt-1 text-sm text-text-secondary">{formatRent(listing.monthly_rent)}</p>
                    </div>

                    <div className="text-sm font-semibold">{formatListingType(listing.listing_type)}</div>

                    <div className="text-sm text-text-secondary">{listing.properties?.area ?? "Area not specified"}</div>

                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <StatusIcon status={listing.publication_status} />

                      <span>{formatStatus(listing.publication_status)}</span>
                    </div>

                    <div className="text-sm text-text-secondary">{formatDate(listing.created_at)}</div>

                    <div className="flex items-center justify-between md:justify-end">
                      <span className="text-sm font-bold text-brand-green">View</span>

                      <ArrowRight className="h-4 w-4 text-text-muted transition group-hover:translate-x-1 group-hover:text-brand-green" strokeWidth={1.8} />
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
