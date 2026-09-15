import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ArrowLeft, CalendarDays, Home, MapPin, ShieldCheck } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

import ReviewActions from "./ReviewActions";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatRent(value: number | null) {
  if (value === null) {
    return "Not specified";
  }

  return `৳${new Intl.NumberFormat("en-BD").format(value)}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatType(value: string) {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    room: "Room",
    hostel_seat: "Seat",
    garage: "Garage",
  };

  return labels[value] ?? value;
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-border py-4 last:border-0">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-text-muted">{label}</p>

      <p className="mt-1 text-sm font-semibold text-text-primary">{value}</p>
    </div>
  );
}

export default async function AdminListingReviewPage({ params }: PageProps) {
  const { id } = await params;

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

  const { data: listing, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        description,
        listing_type,
        source,
        monthly_rent,
        service_charge,
        utility_cost,
        security_deposit,
        advance_amount,
        minimum_rental_period,
        available_from,
        publication_status,
        rental_lifecycle,
        availability_state,
        details,
        created_at,
        properties (
          area,
          house_number,
          address_line,
          building_name,
          property_type
        ),
        property_units (
          unit_label,
          floor,
          bedrooms,
          bathrooms,
          size_sqft,
          description
        ),
        listing_media (
          id,
          storage_path,
          media_type,
          alt_text,
          sort_order
        )
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("ADMIN LISTING REVIEW ERROR:", error);
  }

  if (!listing) {
    notFound();
  }

  const property = Array.isArray(listing.properties) ? (listing.properties[0] ?? null) : listing.properties;

  const propertyUnit = Array.isArray(listing.property_units) ? (listing.property_units[0] ?? null) : listing.property_units;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar adminMode />

      <div className="mx-auto max-w-[1200px] px-6 py-10 sm:px-8">
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.12em] text-brand-green">
            <ShieldCheck className="h-4 w-4" />
            Review listing
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{listing.title}</h1>

          <p className="mt-3 text-sm text-text-secondary">Submitted {formatDate(listing.created_at)}</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-5 flex items-center gap-3">
                <Home className="h-5 w-5 text-brand-green" />

                <h2 className="text-lg font-bold">Listing details</h2>
              </div>

              <div className="grid gap-x-8 sm:grid-cols-2">
                <Detail label="Property type" value={formatType(listing.listing_type)} />

                <Detail label="Monthly rent" value={formatRent(listing.monthly_rent)} />

                <Detail label="Service charge" value={formatRent(listing.service_charge)} />

                <Detail label="Utility cost" value={formatRent(listing.utility_cost)} />

                <Detail label="Available from" value={formatDate(listing.available_from)} />

                <Detail label="Publication status" value={listing.publication_status} />
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-6">
              <div className="mb-5 flex items-center gap-3">
                <MapPin className="h-5 w-5 text-brand-green" />

                <h2 className="text-lg font-bold">Location</h2>
              </div>

              <div className="grid gap-x-8 sm:grid-cols-2">
                <Detail label="Area" value={property?.area ?? "Not specified"} />

                <Detail label="House" value={property?.house_number ?? "Not specified"} />

                <Detail label="Address" value={property?.address_line ?? "Not specified"} />

                <Detail label="Property type" value={property?.property_type ?? "Not specified"} />
              </div>
            </section>

            {propertyUnit && (
              <section className="rounded-2xl border border-border bg-surface p-6">
                <div className="mb-5 flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-brand-green" />

                  <h2 className="text-lg font-bold">Unit details</h2>
                </div>

                <div className="grid gap-x-8 sm:grid-cols-2">
                  <Detail label="Unit" value={propertyUnit.unit_label ?? "Not specified"} />

                  <Detail label="Floor" value={propertyUnit.floor !== null ? String(propertyUnit.floor) : "Not specified"} />

                  <Detail label="Bedrooms" value={propertyUnit.bedrooms !== null ? String(propertyUnit.bedrooms) : "Not specified"} />

                  <Detail label="Bathrooms" value={propertyUnit.bathrooms !== null ? String(propertyUnit.bathrooms) : "Not specified"} />

                  <Detail label="Size" value={propertyUnit.size_sqft !== null ? `${propertyUnit.size_sqft} sq ft` : "Not specified"} />
                </div>
              </section>
            )}

            {listing.description && (
              <section className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-4 text-lg font-bold">Description</h2>

                <p className="whitespace-pre-wrap text-sm leading-7 text-text-secondary">{listing.description}</p>
              </section>
            )}

            {listing.listing_media?.length > 0 && (
              <section className="rounded-2xl border border-border bg-surface p-6">
                <h2 className="mb-5 text-lg font-bold">Media</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  {listing.listing_media
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map((media) => {
                      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${media.storage_path}`;

                      return media.media_type === "video" ? <video key={media.id} src={url} controls className="aspect-video w-full rounded-xl border border-border object-cover" /> : <img key={media.id} src={url} alt={media.alt_text ?? listing.title} className="aspect-video w-full rounded-xl border border-border object-cover" />;
                    })}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ReviewActions listingId={listing.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
