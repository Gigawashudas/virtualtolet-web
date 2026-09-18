import Link from "next/link";

import { ChevronRight, Home, Search } from "lucide-react";

import Navbar from "@/components/Navbar";
import VirtualToletLogo from "@/components/VirtualToletLogo";
import { createClient } from "@/lib/supabase/server";

type PublishedListing = {
  id: string;
  title: string;
  listing_type: string;
  monthly_rent: number | null;
  service_charge: number | null;
  available_from: string | null;
  details: Record<string, unknown>;
  properties: {
    area: string;
    house_number: string | null;
    address_line: string | null;
  } | null;
  property_units:
    | {
        unit_label: string | null;
        floor: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        size_sqft: number | null;
      }
    | {
        unit_label: string | null;
        floor: number | null;
        bedrooms: number | null;
        bathrooms: number | null;
        size_sqft: number | null;
      }[]
    | null;
  listing_media: {
    id: string;
    storage_path: string;
    media_type: string;
    alt_text: string | null;
    sort_order: number;
  }[];
};

function formatRent(value: number | null) {
  if (value === null) {
    return "Rent not specified";
  }

  return `৳${new Intl.NumberFormat("en-BD").format(value)} / month`;
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

function getPropertyUnit(listing: PublishedListing) {
  if (Array.isArray(listing.property_units)) {
    return listing.property_units[0] ?? null;
  }

  return listing.property_units;
}

function getListingDetails(listing: PublishedListing) {
  const unit = getPropertyUnit(listing);

  if (listing.listing_type === "apartment") {
    const details = [unit?.bedrooms !== null && unit?.bedrooms !== undefined ? `${unit.bedrooms} Bed` : null, unit?.bathrooms !== null && unit?.bathrooms !== undefined ? `${unit.bathrooms} Bath` : null, unit?.size_sqft !== null && unit?.size_sqft !== undefined ? `${unit.size_sqft} sqft` : null].filter(Boolean);

    return details.join(" · ") || "Apartment";
  }

  if (listing.listing_type === "room") {
    const occupancy = listing.details?.occupancy as
      | {
          capacity?: number;
        }
      | undefined;

    const details = [occupancy?.capacity ? `${occupancy.capacity} people` : null, unit?.size_sqft !== null && unit?.size_sqft !== undefined ? `${unit.size_sqft} sqft` : null].filter(Boolean);

    return details.join(" · ") || "Room";
  }

  if (listing.listing_type === "hostel_seat") {
    const occupancy = listing.details?.occupancy as
      | {
          capacity?: number;
          availableSeats?: number;
        }
      | undefined;

    const details = [occupancy?.availableSeats ? `${occupancy.availableSeats} seats` : null, occupancy?.capacity ? `${occupancy.capacity} people` : null].filter(Boolean);

    return details.join(" · ") || "Seat";
  }

  if (listing.listing_type === "garage") {
    const garage = listing.details?.garage as
      | {
          vehicleType?: string;
          garageType?: string;
          sizeSqft?: number;
        }
      | undefined;

    const details = [garage?.vehicleType ?? null, garage?.garageType ?? null, garage?.sizeSqft ? `${garage.sizeSqft} sqft` : null].filter(Boolean);

    return details.join(" · ") || "Garage";
  }

  return formatListingType(listing.listing_type);
}

function getLocation(listing: PublishedListing) {
  if (!listing.properties) {
    return "Location not specified";
  }

  const parts = [listing.properties.area, listing.properties.house_number ? `House ${listing.properties.house_number}` : null].filter(Boolean);

  return parts.join(" · ") || "Location not specified";
}

function ListingCard({ listing }: { listing: PublishedListing }) {
  const media = [...(listing.listing_media ?? [])].sort((a, b) => a.sort_order - b.sort_order).find((item) => item.media_type === "image");

  const imageUrl = media ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${media.storage_path}` : null;

  return (
    <Link href={`/rentals/${listing.id}`} className={["group overflow-hidden rounded-xl border border-border bg-background", "transition-all duration-200", "hover:-translate-y-0.5 hover:border-hover-border hover:shadow-sm"].join(" ")}>
      <div className="flex h-40 items-center justify-center bg-surface">{imageUrl ? <img src={imageUrl} alt={media?.alt_text ?? listing.title} className="h-full w-full object-cover" /> : <Home className="h-7 w-7 text-text-muted" strokeWidth={1.5} />}</div>

      <div className="p-4">
        <div className="mb-2 min-h-5" />

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-text-primary">{listing.title}</h3>

        <p className="mt-1 truncate text-xs text-text-secondary">{getLocation(listing)}</p>

        <div className="mt-4">
          <p className="text-sm font-bold text-text-primary">{formatRent(listing.monthly_rent)}</p>

          <p className="mt-0.5 truncate text-xs text-text-muted">{getListingDetails(listing)}</p>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        service_charge,
        available_from,
        details,
        properties (
          area,
          house_number,
          address_line
        ),
        property_units (
          unit_label,
          floor,
          bedrooms,
          bathrooms,
          size_sqft
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
    .eq("publication_status", "published")
    .eq("rental_lifecycle", "active")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("HOME LISTINGS ERROR:", error);
  }

  const publishedListings = (listings ?? []) as unknown as PublishedListing[];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-8 lg:px-10">
        {/* HERO */}

        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-bold tracking-[0.18em] text-brand-green">VIRTUALTOLET</p>

            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] text-text-primary sm:text-5xl lg:text-[52px]">
              Find a place that
              <br />
              feels like home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-text-secondary">Discover TO-LETs, check what is actually available, and connect directly with the people behind them.</p>

            <Link href="/rentals" className={["group mt-7 flex min-h-16 max-w-2xl items-center gap-3 rounded-xl", "border border-border bg-background px-5", "transition-all duration-200", "hover:border-hover-border hover:bg-hover-background"].join(" ")}>
              <Search className="h-5 w-5 shrink-0 text-brand-green transition-colors group-hover:text-hover-text" strokeWidth={1.8} />

              <span className="flex-1 text-sm font-medium text-text-muted transition-colors group-hover:text-hover-text">Search homes, areas or rent</span>

              <ChevronRight className="h-5 w-5 text-text-muted transition-colors group-hover:text-hover-text" strokeWidth={1.8} />
            </Link>
          </div>
        </section>

        {/* CONTENT */}

        <section>
          <div className="min-w-0">
            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold tracking-tight text-text-primary">Available TO-LETs</h2>

                <p className="mt-1 text-sm text-text-secondary">Currently available rental listings</p>
              </div>

              {publishedListings.length === 0 ? (
                <div className="rounded-xl border border-border bg-surface px-6 py-12 text-center">
                  <Home className="mx-auto mb-4 h-8 w-8 text-text-muted" strokeWidth={1.5} />

                  <h3 className="text-lg font-bold text-text-primary">No TO-LETs available</h3>

                  <p className="mt-2 text-sm text-text-secondary">New verified listings will appear here.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {publishedListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              )}
            </section>
          </div>
        </section>

        {/* FOOTER */}

        <footer className="mt-16 flex flex-col gap-5 border-t border-border pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <VirtualToletLogo className="origin-left scale-[0.82]" />

            <span className="text-xs text-text-muted">Find a place. Live better.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              About
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Help
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Privacy
            </Link>

            <Link href="#" className="text-xs font-medium text-text-secondary transition-colors hover:text-hover-text">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
