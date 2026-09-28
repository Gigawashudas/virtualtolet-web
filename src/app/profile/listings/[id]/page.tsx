import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft, ArrowRight, CheckCircle2, Edit3, Eye, Home, Trash2, XCircle } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Listing = {
  id: string;
  title: string;
  listing_type: string | null;
  monthly_rent: number | null;
  service_charge: number | null;
  available_from: string | null;
  publication_status: string | null;
  rental_lifecycle: string | null;
  availability_state: string | null;
  description: string | null;
  created_at: string;
  properties:
    | {
        area: string | null;
        house_number: string | null;
        address_line: string | null;
      }
    | {
        area: string | null;
        house_number: string | null;
        address_line: string | null;
      }[]
    | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function formatListingType(value: string | null) {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    room: "Room",
    hostel_seat: "Seat",
    garage: "Garage",
  };

  return value ? (labels[value] ?? value) : "Listing";
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
    inactive: "Inactive",
    rented: "Rented",
    expired: "Expired",
  };

  return value ? (labels[value] ?? value) : "Unknown";
}

function formatMoney(value: number | null) {
  if (value === null) {
    return "Not specified";
  }

  return `৳${new Intl.NumberFormat("en-BD").format(value)}`;
}

function getStatusClass(value: string | null) {
  if (value === "published") {
    return "border-brand-green/20 bg-brand-green/5 text-brand-green";
  }

  if (value === "rejected") {
    return "border-brand-red/20 bg-brand-red/5 text-brand-red";
  }

  return "border-border bg-background text-text-secondary";
}

function getLifecycleClass(value: string | null) {
  if (value === "active") {
    return "border-brand-green/20 bg-brand-green/5 text-brand-green";
  }

  return "border-border bg-background text-text-secondary";
}

export default async function ManageListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect=/profile/listings/${id}`);
  }

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        service_charge,
        available_from,
        publication_status,
        rental_lifecycle,
        availability_state,
        description,
        created_at,
        properties (
          area,
          house_number,
          address_line
        )
      `,
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) {
    console.error("MANAGE LISTING ERROR:", error);
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const typedListing = listing as Listing;
  const property = firstRelation(typedListing.properties);

  async function toggleLifecycle() {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const { data: currentListing, error: currentListingError } = await supabase.from("listings").select("id, rental_lifecycle").eq("id", id).eq("created_by", user.id).maybeSingle();

    if (currentListingError || !currentListing) {
      redirect(`/profile/listings/${id}?error=listing-not-found`);
    }

    const nextLifecycle = currentListing.rental_lifecycle === "active" ? "inactive" : "active";

    const { error: updateError } = await supabase
      .from("listings")
      .update({
        rental_lifecycle: nextLifecycle,
      })
      .eq("id", id)
      .eq("created_by", user.id);

    if (updateError) {
      console.error("LISTING LIFECYCLE UPDATE ERROR:", updateError);
      redirect(`/profile/listings/${id}?error=update-failed`);
    }

    redirect(`/profile/listings/${id}`);
  }

  async function deleteListing() {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const { data: ownedListing, error: ownedListingError } = await supabase.from("listings").select("id").eq("id", id).eq("created_by", user.id).maybeSingle();

    if (ownedListingError || !ownedListing) {
      redirect(`/profile/listings/${id}?error=listing-not-found`);
    }

    const { error: deleteError } = await supabase.from("listings").delete().eq("id", id).eq("created_by", user.id);

    if (deleteError) {
      console.error("DELETE LISTING ERROR:", deleteError);
      redirect(`/profile/listings/${id}?error=delete-failed`);
    }

    redirect("/profile");
  }

  const address = [property?.house_number ? `House ${property.house_number}` : null, property?.address_line, property?.area].filter(Boolean).join(", ");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-[1000px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-8">
          <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-hover-text">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Back to profile
          </Link>
        </div>

        <div className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-green">My listing</p>

            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Manage listing</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Review, edit, publish, deactivate or remove your TO-LET.</p>
          </div>

          <Link href={`/profile/listings/${id}/edit`} className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-text px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85">
            <Edit3 className="h-4 w-4" strokeWidth={1.8} />
            Edit listing
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <section className="rounded-xl border border-border bg-surface">
            <div className="border-b border-border p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-secondary">{formatListingType(typedListing.listing_type)}</span>

                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(typedListing.publication_status)}`}>{formatPublicationStatus(typedListing.publication_status)}</span>

                <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getLifecycleClass(typedListing.rental_lifecycle)}`}>{formatLifecycle(typedListing.rental_lifecycle)}</span>
              </div>

              <h2 className="mt-5 text-2xl font-bold text-text-primary">{typedListing.title}</h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">{address || "Location not specified"}</p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Monthly rent</p>

                <p className="mt-2 text-lg font-bold text-text-primary">{formatMoney(typedListing.monthly_rent)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Service charge</p>

                <p className="mt-2 text-lg font-bold text-text-primary">{formatMoney(typedListing.service_charge)}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Available from</p>

                <p className="mt-2 text-sm font-semibold text-text-primary">{typedListing.available_from || "Not specified"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Availability state</p>

                <p className="mt-2 text-sm font-semibold text-text-primary">{typedListing.availability_state || "Unknown"}</p>
              </div>
            </div>

            {typedListing.description && (
              <div className="border-t border-border p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-text-muted">Description</p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-text-secondary">{typedListing.description}</p>
              </div>
            )}
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-5">
              <h2 className="text-base font-bold text-text-primary">Listing actions</h2>

              <div className="mt-4 space-y-2">
                <Link href={`/profile/listings/${id}/edit`} className="flex h-11 w-full items-center gap-3 rounded-md border border-border px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-hover-background">
                  <Edit3 className="h-4 w-4" strokeWidth={1.8} />
                  Edit listing
                  <ArrowRight className="ml-auto h-4 w-4" strokeWidth={1.8} />
                </Link>

                {typedListing.publication_status === "published" && typedListing.rental_lifecycle === "active" && (
                  <Link href={`/rentals/${id}`} className="flex h-11 w-full items-center gap-3 rounded-md border border-border px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-hover-background">
                    <Eye className="h-4 w-4" strokeWidth={1.8} />
                    View public listing
                    <ArrowRight className="ml-auto h-4 w-4" strokeWidth={1.8} />
                  </Link>
                )}

                <form action={toggleLifecycle}>
                  <button type="submit" className="flex h-11 w-full items-center gap-3 rounded-md border border-border px-4 text-left text-sm font-semibold text-text-primary transition-colors hover:bg-hover-background">
                    {typedListing.rental_lifecycle === "active" ? (
                      <>
                        <XCircle className="h-4 w-4" strokeWidth={1.8} />
                        Deactivate listing
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                        Activate listing
                      </>
                    )}

                    <ArrowRight className="ml-auto h-4 w-4" strokeWidth={1.8} />
                  </button>
                </form>
              </div>
            </div>

            <div className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-950 dark:bg-red-950/20">
              <h2 className="text-base font-bold text-text-primary">Remove listing</h2>

              <p className="mt-2 text-sm leading-6 text-text-secondary">Permanently remove this listing from your account.</p>

              <form action={deleteListing} className="mt-4">
                <button type="submit" className="flex h-11 w-full items-center justify-center gap-2 rounded-md border border-brand-red/30 px-4 text-sm font-semibold text-brand-red transition-colors hover:bg-brand-red/5">
                  <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                  Delete listing
                </button>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
