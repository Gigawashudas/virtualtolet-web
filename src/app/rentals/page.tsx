import Link from "next/link";

import { ArrowRight, Bath, BedDouble, CalendarDays, Car, Check, Home, MapPin, Ruler, Users } from "lucide-react";

import Navbar from "@/components/Navbar";

import RentalFilters from "./components/RentalFilters";
import RentalSearchInput from "./components/RentalSearchInput";
import RentalSelectField from "./components/RentalSelectField";
import RentalSort from "./components/RentalSort";

import { createClient } from "@/lib/supabase/server";

type SearchParams = {
  q?: string;
  type?: string;
  source?: string;
  minRent?: string;
  maxRent?: string;
  minServiceCharge?: string;
  maxServiceCharge?: string;
  minDeposit?: string;
  maxDeposit?: string;
  area?: string;
  floor?: string;
  bedrooms?: string;
  bathrooms?: string;
  minSize?: string;
  maxSize?: string;
  roomCapacity?: string;
  availableSeats?: string;
  suitableFor?: string;
  gender?: string;
  bathroomLocation?: string;
  balconyAvailable?: string;
  lift?: string;
  generator?: string;
  security?: string;
  cctv?: string;
  gateAccess?: string;
  vehicleType?: string;
  garageType?: string;
  carParking?: string;
  bikeParking?: string;
  availableFrom?: string;
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
  description?: string | null;
};

type ListingMedia = {
  id: string;
  storage_path: string;
  media_type: string | null;
  alt_text: string | null;
  sort_order: number | null;
};

type ListingPreference = {
  tenant_preference: string | null;
  students_allowed: boolean | null;
  working_professionals_allowed: boolean | null;
  male_bachelors_allowed: boolean | null;
  female_bachelors_allowed: boolean | null;
  family_allowed: boolean | null;
  required_documents?: unknown;
  pet_policy?: string | null;
  smoking_policy?: string | null;
  notes?: string | null;
};

type ListingContact = {
  contact_type?: string | null;
  contact_value?: string | null;
  label?: string | null;
  is_primary?: boolean | null;
};

type Listing = {
  id: string;
  title: string;
  listing_type: string | null;
  source: string | null;
  monthly_rent: number | null;
  service_charge: number | null;
  utility_cost: number | null;
  security_deposit: number | null;
  advance_amount: number | null;
  minimum_rental_period: string | null;
  available_from: string | null;
  details: Record<string, unknown> | null;
  description: string | null;
  properties: Property | Property[] | null;
  property_units: PropertyUnit | PropertyUnit[] | null;
  listing_media: ListingMedia[] | null;
  listing_preferences: ListingPreference | ListingPreference[] | null;
  listing_contacts: ListingContact[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getNestedValue(object: Record<string, unknown> | null | undefined, path: string): unknown {
  if (!object) return undefined;

  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, object);
}

function stringValue(object: Record<string, unknown> | null | undefined, path: string): string | null {
  const value = getNestedValue(object, path);

  if (typeof value === "string" && value.trim()) {
    return value.trim();
  }

  return null;
}

function numberValue(object: Record<string, unknown> | null | undefined, path: string): number | null {
  const value = getNestedValue(object, path);

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function booleanValue(object: Record<string, unknown> | null | undefined, path: string): boolean | null {
  const value = getNestedValue(object, path);

  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") {
      return true;
    }

    if (value.toLowerCase() === "false") {
      return false;
    }
  }

  return null;
}

function formatMoney(value: number | null): string | null {
  if (value === null) return null;

  return `৳${value.toLocaleString("en-BD")}`;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEnumValue(value: string | null): string | null {
  if (!value) return null;

  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatListingType(value: string | null): string {
  return formatEnumValue(value) ?? "Rental";
}

function parseNumber(value: string | undefined): number | null {
  if (!value || !value.trim()) {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function matchesMin(value: number | null, filter: string | undefined): boolean {
  const minimum = parseNumber(filter);

  if (minimum === null) return true;

  if (value === null) return false;

  return value >= minimum;
}

function matchesMax(value: number | null, filter: string | undefined): boolean {
  const maximum = parseNumber(filter);

  if (maximum === null) return true;

  if (value === null) return false;

  return value <= maximum;
}

function matchesBooleanFilter(value: boolean | null, filter: string | undefined): boolean {
  if (!filter) return true;

  if (filter === "yes") {
    return value === true;
  }

  if (filter === "no") {
    return value === false;
  }

  return true;
}

function matchesStringFilter(value: string | null, filter: string | undefined): boolean {
  if (!filter) return true;

  if (!value) return false;

  return value.toLowerCase() === filter.toLowerCase();
}

function normalizeListingType(value: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function getListingFields(listing: Listing) {
  const property = firstRelation(listing.properties);

  const unit = firstRelation(listing.property_units);

  const preference = firstRelation(listing.listing_preferences);

  const details = listing.details;

  const listingType = normalizeListingType(listing.listing_type);

  const propertyType = stringValue(details, "property.property_type") ?? listing.listing_type;

  const bedrooms = numberValue(details, "property.bedrooms") ?? unit?.bedrooms ?? null;

  const bathrooms = numberValue(details, "property.bathrooms") ?? unit?.bathrooms ?? null;

  const sizeSqft = numberValue(details, "property.size_sqft") ?? unit?.size_sqft ?? numberValue(details, "garage.size_sqft") ?? null;

  const floor = numberValue(details, "property.floor") ?? unit?.floor ?? null;

  const roomCapacity = numberValue(details, "occupancy.room_capacity");

  const availableSeats = numberValue(details, "occupancy.available_seats");

  const suitableFor = stringValue(details, "occupancy.suitable_for") ?? preference?.tenant_preference ?? null;

  const gender = stringValue(details, "occupancy.gender");

  const bathroomLocation = stringValue(details, "bathroom.location");

  const balconyAvailable = booleanValue(details, "balcony.available");

  const lift = booleanValue(details, "facilities.lift");

  const generator = booleanValue(details, "facilities.generator");

  const security = booleanValue(details, "facilities.security_guard");

  const cctv = booleanValue(details, "facilities.cctv");

  const cctvCoverage = stringValue(details, "facilities.cctv_coverage");

  const gateAccess = stringValue(details, "gate.access");

  const gateOpenFrom = stringValue(details, "gate.open_from");

  const gateOpenTo = stringValue(details, "gate.open_to");

  const vehicleType = stringValue(details, "garage.vehicle_type");

  const garageType = stringValue(details, "garage.garage_type");

  const carParking = booleanValue(details, "parking.car.available");

  const bikeParking = booleanValue(details, "parking.bike.available");

  const carParkingChargeType = stringValue(details, "parking.car.charge_type");

  const bikeParkingChargeType = stringValue(details, "parking.bike.charge_type");

  const carParkingMonthlyCharge = numberValue(details, "parking.car.monthly_charge");

  const bikeParkingMonthlyCharge = numberValue(details, "parking.bike.monthly_charge");

  const utilityDetails = stringValue(details, "costs.utility_details");

  const otherCharges = stringValue(details, "costs.other_charges");

  const securityDeposit = listing.security_deposit ?? numberValue(details, "costs.security_deposit") ?? null;

  const availableFrom = listing.available_from ?? stringValue(details, "property.available_from") ?? null;

  const location = [property?.area, property?.address_line, property?.house_number].filter(Boolean).join(", ");

  return {
    property,
    unit,
    preference,
    details,
    listingType,
    propertyType,
    bedrooms,
    bathrooms,
    sizeSqft,
    floor,
    roomCapacity,
    availableSeats,
    suitableFor,
    gender,
    bathroomLocation,
    balconyAvailable,
    lift,
    generator,
    security,
    cctv,
    cctvCoverage,
    gateAccess,
    gateOpenFrom,
    gateOpenTo,
    vehicleType,
    garageType,
    carParking,
    bikeParking,
    carParkingChargeType,
    bikeParkingChargeType,
    carParkingMonthlyCharge,
    bikeParkingMonthlyCharge,
    utilityDetails,
    otherCharges,
    securityDeposit,
    availableFrom,
    location,
  };
}

export default async function RentalsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;

  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from("listings")
    .select(
      `
        id,
        title,
        listing_type,
        source,
        monthly_rent,
        service_charge,
        utility_cost,
        security_deposit,
        advance_amount,
        minimum_rental_period,
        available_from,
        details,
        description,
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
          size_sqft,
          description
        ),
        listing_media (
          id,
          storage_path,
          media_type,
          alt_text,
          sort_order
        ),
        listing_preferences (
          tenant_preference,
          students_allowed,
          working_professionals_allowed,
          male_bachelors_allowed,
          female_bachelors_allowed,
          family_allowed,
          required_documents,
          pet_policy,
          smoking_policy,
          notes
        ),
        listing_contacts (
          contact_type,
          contact_value,
          label,
          is_primary
        )
      `,
    )
    .eq("publication_status", "published")
    .eq("rental_lifecycle", "active")
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error("Failed to load rentals:", error);
  }

  const allListings = (listings ?? []) as Listing[];

  const query = params.q?.trim().toLowerCase() ?? "";

  const selectedType = normalizeListingType(params.type ?? "");

  const filteredListings = allListings.filter((listing) => {
    const fields = getListingFields(listing);

    const listingType = fields.listingType;

    const isApartment = listingType === "apartment";

    const isRoom = listingType === "room";

    const isSeat = listingType === "seat" || listingType === "hostel_seat";

    const isGarage = listingType === "garage" || listingType === "parking";

    const searchableText = [listing.title, listing.listing_type, listing.source, fields.propertyType, fields.property?.area, fields.property?.house_number, fields.property?.address_line, fields.unit?.unit_label, fields.suitableFor, fields.gender, fields.bathroomLocation, fields.vehicleType, fields.garageType, fields.gateAccess, fields.utilityDetails, fields.otherCharges].filter(Boolean).join(" ").toLowerCase();

    if (query && !searchableText.includes(query)) {
      return false;
    }

    if (selectedType && listingType !== selectedType && !(selectedType === "seat" && listingType === "hostel_seat") && !(selectedType === "garage" && listingType === "parking")) {
      return false;
    }

    if (params.source && listing.source?.toLowerCase() !== params.source.toLowerCase()) {
      return false;
    }

    if (!matchesMin(listing.monthly_rent, params.minRent) || !matchesMax(listing.monthly_rent, params.maxRent)) {
      return false;
    }

    if (!matchesMin(listing.service_charge, params.minServiceCharge) || !matchesMax(listing.service_charge, params.maxServiceCharge)) {
      return false;
    }

    if (params.area) {
      const area = fields.property?.area ?? "";

      if (!area.toLowerCase().includes(params.area.toLowerCase())) {
        return false;
      }
    }

    if (!matchesMin(fields.sizeSqft, params.minSize) || !matchesMax(fields.sizeSqft, params.maxSize)) {
      return false;
    }

    if (params.availableFrom) {
      if (!fields.availableFrom) {
        return false;
      }

      if (fields.availableFrom > params.availableFrom) {
        return false;
      }
    }

    if (isGarage) {
      if (!matchesMin(fields.securityDeposit, params.minDeposit) || !matchesMax(fields.securityDeposit, params.maxDeposit)) {
        return false;
      }

      if (params.vehicleType && !matchesStringFilter(fields.vehicleType, params.vehicleType)) {
        return false;
      }

      if (params.garageType && !matchesStringFilter(fields.garageType, params.garageType)) {
        return false;
      }

      return true;
    }

    if (isApartment || isRoom || isSeat) {
      if (params.floor && fields.floor !== parseNumber(params.floor)) {
        return false;
      }

      if (!matchesBooleanFilter(fields.lift, params.lift) || !matchesBooleanFilter(fields.generator, params.generator) || !matchesBooleanFilter(fields.security, params.security) || !matchesBooleanFilter(fields.cctv, params.cctv)) {
        return false;
      }

      if (params.gateAccess && !matchesStringFilter(fields.gateAccess, params.gateAccess)) {
        return false;
      }

      if (!matchesBooleanFilter(fields.carParking, params.carParking) || !matchesBooleanFilter(fields.bikeParking, params.bikeParking)) {
        return false;
      }
    }

    if (isApartment) {
      if (params.bedrooms && fields.bedrooms !== parseNumber(params.bedrooms)) {
        return false;
      }

      if (params.bathrooms && fields.bathrooms !== parseNumber(params.bathrooms)) {
        return false;
      }

      if (params.suitableFor && !(fields.suitableFor ?? "").toLowerCase().includes(params.suitableFor.toLowerCase())) {
        return false;
      }

      if (params.balconyAvailable && !matchesBooleanFilter(fields.balconyAvailable, params.balconyAvailable)) {
        return false;
      }
    }

    if (isRoom || isSeat) {
      if (params.roomCapacity && fields.roomCapacity !== parseNumber(params.roomCapacity)) {
        return false;
      }

      if (params.availableSeats && fields.availableSeats !== parseNumber(params.availableSeats)) {
        return false;
      }

      if (params.gender && !matchesStringFilter(fields.gender, params.gender)) {
        return false;
      }

      if (params.bathroomLocation && !matchesStringFilter(fields.bathroomLocation, params.bathroomLocation)) {
        return false;
      }

      if (params.balconyAvailable && !matchesBooleanFilter(fields.balconyAvailable, params.balconyAvailable)) {
        return false;
      }
    }

    return true;
  });

  const sortedListings = [...filteredListings];

  if (params.sort === "rent-low") {
    sortedListings.sort((a, b) => (a.monthly_rent ?? Infinity) - (b.monthly_rent ?? Infinity));
  } else if (params.sort === "rent-high") {
    sortedListings.sort((a, b) => (b.monthly_rent ?? 0) - (a.monthly_rent ?? 0));
  } else if (params.sort === "size-low") {
    sortedListings.sort((a, b) => (getListingFields(a).sizeSqft ?? Infinity) - (getListingFields(b).sizeSqft ?? Infinity));
  } else if (params.sort === "size-high") {
    sortedListings.sort((a, b) => (getListingFields(b).sizeSqft ?? 0) - (getListingFields(a).sizeSqft ?? 0));
  }

  const listingTypes = Array.from(new Set(allListings.map((listing) => listing.listing_type).filter((value): value is string => Boolean(value)))).sort();

  const sources = Array.from(new Set(allListings.map((listing) => listing.source).filter((value): value is string => Boolean(value)))).sort();

  const areas = Array.from(new Set(allListings.map((listing) => firstRelation(listing.properties)?.area).filter((value): value is string => Boolean(value)))).sort();

  const gateAccessValues = Array.from(new Set(allListings.map((listing) => getListingFields(listing).gateAccess).filter((value): value is string => Boolean(value)))).sort();

  const vehicleTypes = Array.from(new Set(allListings.map((listing) => getListingFields(listing).vehicleType).filter((value): value is string => Boolean(value)))).sort();

  const garageTypes = Array.from(new Set(allListings.map((listing) => getListingFields(listing).garageType).filter((value): value is string => Boolean(value)))).sort();

  const activeFilterCount = Object.entries(params).filter(([key, value]) => key !== "sort" && key !== "type" && Boolean(value?.trim())).length;

  return (
    <main className="min-h-screen bg-background text-text">
      <Navbar />

      <section className="mx-auto max-w-[1440px] px-6 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-10 lg:pt-16">
        <div className="mb-10 flex flex-col gap-6 border-b border-border pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-text-secondary">Rentals</p>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-[-0.04em] sm:text-5xl lg:text-6xl">Find your next place.</h1>

            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg">Search and filter active rental listings by the details that matter to you.</p>
          </div>

          <Link href="/post-to-let" className="inline-flex w-fit items-center gap-2 rounded-md border border-border px-5 py-3 text-sm font-semibold transition-colors hover:bg-hover-background">
            Post a TO-LET
            <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
          </Link>
        </div>

        <div className="mb-10 overflow-hidden rounded-xl border border-border bg-surface">
          <div className="border-b border-border p-5">
            <form method="GET" action="/rentals" className="w-full">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_220px_220px_auto] lg:items-end">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Search</span>

                  <RentalSearchInput defaultValue={params.q ?? ""} />
                </label>

                <RentalSelectField name="type" label="Listing type" defaultValue={params.type}>
                  <option value="">All types</option>

                  {listingTypes.map((type) => (
                    <option key={type} value={type.toLowerCase()}>
                      {formatListingType(type)}
                    </option>
                  ))}
                </RentalSelectField>

                <RentalSelectField name="source" label="Source" defaultValue={params.source}>
                  <option value="">All sources</option>

                  {sources.map((source) => (
                    <option key={source} value={source.toLowerCase()}>
                      {formatEnumValue(source)}
                    </option>
                  ))}
                </RentalSelectField>

                <div className="flex gap-2">
                  <RentalFilters values={params} activeFilterCount={activeFilterCount} areas={areas} gateAccessValues={gateAccessValues} vehicleTypes={vehicleTypes} garageTypes={garageTypes} />

                  <button type="submit" className="h-11 rounded-md bg-text px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85">
                    Search
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-text-secondary">
              <span className="font-semibold text-text">{sortedListings.length}</span> {sortedListings.length === 1 ? "rental" : "rentals"} found
            </div>

            <RentalSort defaultValue={params.sort ?? "newest"} searchParams={params} />
          </div>
        </div>

        {sortedListings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-6 py-20 text-center">
            <Home className="mx-auto mb-5 h-9 w-9 text-text-secondary" strokeWidth={1.5} />

            <h2 className="text-xl font-semibold">No rentals found</h2>

            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-text-secondary">No active rental listing matches your current filters. Try removing one or more filters and search again.</p>

            <Link href="/rentals" className="mt-6 inline-flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-semibold transition-colors hover:bg-hover-background">
              Clear filters
              <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {sortedListings.map((listing) => {
              const fields = getListingFields(listing);

              const sortedMedia = [...(listing.listing_media ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

              const media = sortedMedia[0] ?? null;

              const imageUrl = media ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-media/${media.storage_path}` : null;

              const listingType = normalizeListingType(listing.listing_type);

              const isRoom = listingType === "room" || listingType === "hostel_seat" || listingType === "seat";

              const isGarage = listingType === "garage" || listingType === "parking";

              return (
                <Link key={listing.id} href={`/rentals/${listing.id}`} className="group block">
                  <article className="overflow-hidden rounded-xl border border-border bg-surface transition-transform duration-200 hover:-translate-y-0.5">
                    <div className="relative aspect-[4/3] overflow-hidden bg-hover-background">
                      {imageUrl ? (
                        <img src={imageUrl} alt={media?.alt_text || listing.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.025]" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Home className="h-10 w-10 text-text-secondary" strokeWidth={1.4} />
                        </div>
                      )}

                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white backdrop-blur-sm">{formatListingType(listing.listing_type)}</div>
                    </div>

                    <div className="p-5">
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h2 className="truncate text-lg font-semibold tracking-[-0.02em]">{listing.title}</h2>

                          {fields.location && (
                            <div className="mt-1.5 flex items-start gap-1.5 text-sm text-text-secondary">
                              <MapPin className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={1.7} />

                              <span className="line-clamp-2">{fields.location}</span>
                            </div>
                          )}
                        </div>

                        {listing.monthly_rent !== null && (
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-semibold">{formatMoney(listing.monthly_rent)}</p>

                            <p className="text-xs text-text-secondary">/ month</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-sm text-text-secondary">
                        {!isGarage && fields.bedrooms !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <BedDouble className="h-4 w-4" strokeWidth={1.7} />
                            {fields.bedrooms} {fields.bedrooms === 1 ? "Bedroom" : "Bedrooms"}
                          </span>
                        )}

                        {!isGarage && fields.bathrooms !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Bath className="h-4 w-4" strokeWidth={1.7} />
                            {fields.bathrooms} {fields.bathrooms === 1 ? "Bath" : "Baths"}
                          </span>
                        )}

                        {fields.sizeSqft !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Ruler className="h-4 w-4" strokeWidth={1.7} />
                            {fields.sizeSqft.toLocaleString("en-BD")} sq ft
                          </span>
                        )}

                        {isRoom && fields.availableSeats !== null && (
                          <span className="inline-flex items-center gap-1.5">
                            <Users className="h-4 w-4" strokeWidth={1.7} />
                            {fields.availableSeats} available
                          </span>
                        )}

                        {isGarage && fields.vehicleType && (
                          <span className="inline-flex items-center gap-1.5">
                            <Car className="h-4 w-4" strokeWidth={1.7} />

                            {formatEnumValue(fields.vehicleType)}
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
                        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                          <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.7} />

                          {listing.available_from ? `Available ${formatDate(listing.available_from)}` : "Availability not specified"}
                        </div>

                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                          View details
                          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" strokeWidth={1.8} />
                        </span>
                      </div>

                      {listing.service_charge !== null && <p className="mt-3 text-xs text-text-secondary">Service charge: {formatMoney(listing.service_charge)}</p>}

                      {fields.suitableFor && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          <span className="inline-flex items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] text-text-secondary">
                            <Check className="h-3 w-3" />

                            {formatEnumValue(fields.suitableFor)}
                          </span>
                        </div>
                      )}
                    </div>
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
