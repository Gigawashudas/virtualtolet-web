import Link from "next/link";

import { ArrowLeft, ArrowUpRight, SlidersHorizontal } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  block?: string;
  sort?: string;
};

type Property = {
  area: string | null;
  house_number: string | null;
  address_line: string | null;
};

type PropertyUnit = {
  unit_label: string | null;
  floor: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
};

type ListingMedia = {
  id: string;
  storage_path: string;
  media_type: string | null;
  alt_text: string | null;
  sort_order: number | null;
};

type Listing = {
  id: string;
  title: string;
  listing_type: string | null;
  monthly_rent: number | null;
  created_at: string;
  available_from: string | null;
  properties: Property | Property[] | null;
  property_units: PropertyUnit | PropertyUnit[] | null;
  listing_media: ListingMedia[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function normalizeBlock(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const match = value.match(/\bblock\s+([a-z0-9-]+)\b/i);

  if (!match) {
    return null;
  }

  return `Block ${match[1].toUpperCase()}`;
}

function getListingBlock(listing: Listing): string | null {
  const property = firstRelation(listing.properties);

  return normalizeBlock(property?.address_line ?? null);
}

function formatMoney(value: number | null): string {
  if (value === null) {
    return "Rent not specified";
  }

  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getImageUrl(storagePath: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  return `${supabaseUrl}/storage/v1/object/public/listing-media/${storagePath}`;
}

function sortListings(listings: Listing[], sort: string | undefined): Listing[] {
  const sorted = [...listings];

  switch (sort) {
    case "oldest":
      sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      break;

    case "rent-low":
      sorted.sort((a, b) => (a.monthly_rent ?? Number.POSITIVE_INFINITY) - (b.monthly_rent ?? Number.POSITIVE_INFINITY));
      break;

    case "rent-high":
      sorted.sort((a, b) => (b.monthly_rent ?? Number.NEGATIVE_INFINITY) - (a.monthly_rent ?? Number.NEGATIVE_INFINITY));
      break;

    case "newest":
    default:
      sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      break;
  }

  return sorted;
}

export default async function GarageRentalPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const query = await searchParams;

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        monthly_rent,
        created_at,
        available_from,
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
    .eq("listing_type", "garage");

  if (error) {
    console.error("Garage rental listing error:", error);
  }

  const allListings = (data ?? []) as Listing[];

  const availableBlocks = Array.from(new Set(allListings.map((listing) => getListingBlock(listing)).filter((block): block is string => Boolean(block)))).sort((a, b) =>
    a.localeCompare(b, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );

  const selectedBlock = query.block?.trim() ?? "";

  const blockFilteredListings = selectedBlock ? allListings.filter((listing) => getListingBlock(listing) === selectedBlock) : allListings;

  const sortedListings = sortListings(blockFilteredListings, query.sort ?? "newest");

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-foreground">
      <Navbar />

      <section className="mx-auto min-w-0 max-w-[1440px] overflow-x-hidden px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <div className="min-w-0 border-b border-border pb-5 sm:pb-7">
          <Link href="/rentals" className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-black">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.6} />
            Rentals
          </Link>

          <div className="flex min-w-0 items-end justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted sm:text-xs">Rental / Garage</p>

              <h1 className="mt-2 text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] sm:text-5xl lg:text-7xl">Garage</h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary">Available garages and parking spaces for rent.</p>
            </div>

            <div className="hidden shrink-0 text-right sm:block">
              <p className="text-3xl font-extrabold tracking-[-0.04em]">{sortedListings.length}</p>

              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted">{sortedListings.length === 1 ? "Garage" : "Garages"}</p>
            </div>
          </div>
        </div>

        {/* Block filter + Sort */}
        <div className="flex min-w-0 flex-col gap-4 border-b border-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-text-muted" strokeWidth={1.7} />

            <span className="mr-1 shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Block</span>

            <Link href={`/rentals/garage${query.sort ? `?sort=${encodeURIComponent(query.sort)}` : ""}`} className={["border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]", "transition-colors", selectedBlock === "" ? "border-black bg-black text-white" : "border-border bg-surface text-text-primary hover:border-black hover:text-black"].join(" ")}>
              All
            </Link>

            {availableBlocks.map((block) => {
              const search = new URLSearchParams();

              search.set("block", block);
              search.set("sort", query.sort ?? "newest");

              return (
                <Link key={block} href={`/rentals/garage?${search.toString()}`} className={["border px-3 py-2 text-xs font-bold uppercase tracking-[0.08em]", "transition-colors", selectedBlock === block ? "border-black bg-black text-white" : "border-border bg-surface text-text-primary hover:border-black hover:text-black"].join(" ")}>
                  {block}
                </Link>
              );
            })}
          </div>

          <form method="GET" action="/rentals/garage" className="flex min-w-0 max-w-full flex-wrap items-center gap-2">
            {selectedBlock && <input type="hidden" name="block" value={selectedBlock} />}

            <label htmlFor="sort" className="shrink-0 text-xs font-bold uppercase tracking-[0.14em] text-text-muted">
              Sort
            </label>

            <select id="sort" name="sort" defaultValue={query.sort ?? "newest"} className="h-9 min-w-0 max-w-full border border-border bg-surface px-3 text-xs font-semibold outline-none transition-colors focus:border-black">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="rent-low">Rent: Low to High</option>
              <option value="rent-high">Rent: High to Low</option>
            </select>

            <button type="submit" className="h-9 shrink-0 border border-black bg-black px-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-opacity hover:opacity-80">
              Apply
            </button>
          </form>
        </div>

        {/* Listings */}
        {sortedListings.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center py-16">
            <div className="max-w-md border border-border bg-surface p-8 text-center sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-text-muted">No garages found</p>

              <h2 className="mt-3 text-2xl font-extrabold uppercase tracking-[-0.04em]">Nothing here yet.</h2>

              <p className="mt-3 text-sm leading-6 text-text-secondary">{selectedBlock ? `There are no garages available in ${selectedBlock}.` : "There are currently no garages available for rent."}</p>

              {selectedBlock && (
                <Link href="/rentals/garage" className="mt-6 inline-flex items-center gap-2 border border-black bg-black px-5 py-3 text-xs font-bold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-80">
                  View All Garages
                  <ArrowUpRight className="h-4 w-4" strokeWidth={1.7} />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="grid min-w-0 grid-cols-1 gap-3 pt-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedListings.map((listing) => {
              const property = firstRelation(listing.properties);
              const unit = firstRelation(listing.property_units);
              const block = getListingBlock(listing);

              const media = [...(listing.listing_media ?? [])].filter((item) => item.media_type === "image").sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))[0];

              const imageUrl = media ? getImageUrl(media.storage_path) : null;

              const availableDate = formatDate(listing.available_from);

              return (
                <Link key={listing.id} href={`/rentals/${listing.id}`} className="group block min-w-0">
                  <article className={["flex min-w-0 aspect-square flex-col justify-between", "border border-border bg-surface p-5 sm:p-6 lg:p-7", "transition-all duration-300 ease-out", "hover:-translate-y-1 hover:border-black", "hover:bg-hover-background hover:shadow-2xl"].join(" ")}>
                    {/* Top */}
                    <div className="flex min-w-0 items-start justify-between gap-4">
                      <div className="flex min-w-0 flex-wrap gap-2">
                        {block && <span className="border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted transition-colors group-hover:border-black group-hover:text-black">{block}</span>}

                        <span className="border border-border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted transition-colors group-hover:border-black group-hover:text-black">Garage</span>
                      </div>

                      <ArrowUpRight className="h-6 w-6 shrink-0 text-text-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black" strokeWidth={1.5} />
                    </div>

                    {/* Image */}
                    {imageUrl && (
                      <div className="my-4 aspect-[4/3] min-w-0 overflow-hidden border border-border bg-hover-background">
                        <img src={imageUrl} alt={media?.alt_text || `${block ?? "Garage"} garage`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      </div>
                    )}

                    {/* Main information */}
                    <div className="mt-auto min-w-0">
                      <div className="flex min-w-0 items-end justify-between gap-4">
                        <div className="min-w-0">
                          {block && <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">{block}</p>}

                          <h2 className="mt-2 break-words text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-text-primary transition-colors group-hover:text-black sm:text-4xl">{unit?.unit_label || "Garage"}</h2>
                        </div>

                        <div className="min-w-0 shrink-0 text-right">
                          <p className="break-words text-xl font-extrabold tracking-[-0.03em] text-text-primary transition-colors group-hover:text-black sm:text-2xl">{formatMoney(listing.monthly_rent)}</p>

                          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-text-muted">/ month</p>
                        </div>
                      </div>

                      <div className="mt-5 flex min-w-0 flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs font-semibold uppercase tracking-[0.08em] text-text-muted">
                        {unit?.floor !== null && unit?.floor !== undefined && <span>Floor {unit.floor}</span>}

                        {unit?.size_sqft !== null && unit?.size_sqft !== undefined && <span>{unit.size_sqft.toLocaleString("en-BD")} Sq Ft</span>}

                        {property?.area && <span className="break-words">{property.area}</span>}
                      </div>

                      {availableDate && <p className="mt-3 text-xs text-text-muted">Available {availableDate}</p>}
                    </div>

                    <div className="mt-5 h-1 w-0 bg-black transition-all duration-300 group-hover:w-full" />
                  </article>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
