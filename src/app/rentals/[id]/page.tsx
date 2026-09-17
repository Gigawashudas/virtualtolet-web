import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bath, BedDouble, CalendarDays, Car, Check, Home, MapPin, Phone, Ruler, ShieldCheck, Users } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

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
  facing: string | null;
  furnishing: string | null;
  description: string | null;
  master_bedrooms: number | null;
  semi_master_bedrooms: number | null;
  guest_rooms: number | null;
  has_servant_room: boolean | null;
  has_living_room: boolean | null;
  has_dining_room: boolean | null;
};

type ListingMedia = {
  id: string;
  storage_path: string;
  media_type: string;
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
  required_documents: string | null;
  pet_policy: string | null;
  smoking_policy: string | null;
  notes: string | null;
};

type ListingContact = {
  contact_type: string;
  contact_value: string;
  label: string | null;
  is_primary: boolean;
};

type Listing = {
  id: string;
  title: string;
  listing_type: string;
  source: string;
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
  listing_preferences: ListingPreference[] | null;
  listing_contacts: ListingContact[] | null;
};

function firstRelation<T>(relation: T | T[] | null): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function formatMoney(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return null;
  }

  return `৳${Number(value).toLocaleString("en-BD")}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getStorageUrl(path: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return "";
  }

  return `${supabaseUrl}/storage/v1/object/public/listing-media/${path}`;
}

function getNestedValue(object: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((current, key) => {
    if (current !== null && typeof current === "object" && !Array.isArray(current)) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, object);
}

function stringValue(details: Record<string, unknown>, ...paths: string[]): string | null {
  for (const path of paths) {
    const value = getNestedValue(details, path);

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function booleanValue(details: Record<string, unknown>, ...paths: string[]): boolean | null {
  for (const path of paths) {
    const value = getNestedValue(details, path);

    if (typeof value === "boolean") {
      return value;
    }
  }

  return null;
}

function numberValue(details: Record<string, unknown>, ...paths: string[]): number | null {
  for (const path of paths) {
    const value = getNestedValue(details, path);

    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

function formatEnumValue(value: string | null | undefined) {
  if (!value || value === "not_specified") {
    return null;
  }

  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatBoolean(value: boolean | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  return value ? "Available" : "Not available";
}

function formatParkingCharge(available: boolean | null | undefined, chargeType: string | null | undefined, monthlyCharge: number | null | undefined) {
  if (available !== true) {
    return "Not available";
  }

  if (chargeType === "extra") {
    return monthlyCharge !== null && monthlyCharge !== undefined ? `Extra charge — ${formatMoney(monthlyCharge)}/month` : "Extra charge";
  }

  return "Included";
}

function DetailItem({ icon: Icon, label, value }: { icon: typeof BedDouble; label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      <Icon className="h-5 w-5 shrink-0 text-brand-green" strokeWidth={1.8} />
      <div>
        <p className="text-xs text-text-muted">{label}</p>
        <p className="mt-0.5 text-sm font-semibold text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function Facility({ label, enabled }: { label: string; enabled: boolean | null }) {
  if (enabled === null || enabled === undefined) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm text-text-primary">
      <Check className={`h-4 w-4 ${enabled ? "text-brand-green" : "text-text-muted"}`} strokeWidth={2} />
      <span>
        {label}: {enabled ? "Available" : "Not available"}
      </span>
    </div>
  );
}

function InformationRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="flex flex-col gap-1 border-b border-border pb-3 last:border-b-0">
      <span className="text-xs text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  );
}

export default async function RentalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing, error } = await supabase
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
          facing,
          furnishing,
          description,
          master_bedrooms,
          semi_master_bedrooms,
          guest_rooms,
          has_servant_room,
          has_living_room,
          has_dining_room
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
    .eq("id", id)
    .eq("publication_status", "published")
    .eq("rental_lifecycle", "active")
    .maybeSingle();

  if (error) {
    console.error("Rental detail error:", JSON.stringify(error, null, 2));
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const typedListing = listing as Listing;
  const property = firstRelation(typedListing.properties);
  const unit = firstRelation(typedListing.property_units);
  const details = typedListing.details ?? {};
  const propertyType = typedListing.listing_type;

  const listingPreference = typedListing.listing_preferences?.[0] ?? null;

  const primaryContact = typedListing.listing_contacts?.find((contact) => contact.contact_type === "phone" && contact.is_primary) ?? typedListing.listing_contacts?.find((contact) => contact.contact_type === "phone") ?? null;

  const media = [...(typedListing.listing_media ?? [])].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const imageMedia = media.filter((item) => item.media_type === "image");
  const videoMedia = media.filter((item) => item.media_type === "video");

  const imageUrls = imageMedia.map((item) => ({
    ...item,
    url: getStorageUrl(item.storage_path),
  }));

  const mainImage = imageUrls[0] ?? null;

  const propertyBedrooms = numberValue(details, "property.bedrooms") ?? unit?.bedrooms ?? null;

  const propertyBathrooms = numberValue(details, "property.bathrooms") ?? unit?.bathrooms ?? null;

  const propertySize = numberValue(details, "property.size_sqft") ?? unit?.size_sqft ?? null;

  const balconies = numberValue(details, "property.balconies");

  const roomCapacity = numberValue(details, "occupancy.room_capacity");

  const availableSeats = numberValue(details, "occupancy.available_seats");

  const suitableFor = formatEnumValue(listingPreference?.tenant_preference) ?? formatEnumValue(stringValue(details, "occupancy.suitable_for"));

  const gender = formatEnumValue(stringValue(details, "occupancy.gender")) ?? null;

  const vehicleType = formatEnumValue(stringValue(details, "garage.vehicle_type")) ?? null;

  const garageType = formatEnumValue(stringValue(details, "garage.garage_type")) ?? null;

  const bathroomLocation = formatEnumValue(stringValue(details, "bathroom.location")) ?? null;

  const unitFacing = formatEnumValue(unit?.facing) ?? stringValue(details, "facing") ?? null;

  const furnishing = formatEnumValue(unit?.furnishing) ?? stringValue(details, "furnishing") ?? null;

  const balconyAvailable = booleanValue(details, "balcony.available");

  const lift = booleanValue(details, "facilities.lift");
  const generator = booleanValue(details, "facilities.generator");
  const security = booleanValue(details, "facilities.security_guard");
  const cctv = booleanValue(details, "facilities.cctv");

  const cctvCoverage = stringValue(details, "facilities.cctv_coverage") ?? null;

  const gateAccess = stringValue(details, "gate.access") ?? null;

  const gateOpenFrom = stringValue(details, "gate.open_from") ?? null;

  const gateOpenTo = stringValue(details, "gate.open_to") ?? null;

  const bikeParking = booleanValue(details, "parking.bike.available");

  const bikeParkingChargeType = stringValue(details, "parking.bike.charge_type") ?? null;

  const bikeParkingCharge = numberValue(details, "parking.bike.monthly_charge") ?? null;

  const carParking = booleanValue(details, "parking.car.available");

  const carParkingChargeType = stringValue(details, "parking.car.charge_type") ?? null;

  const carParkingCharge = numberValue(details, "parking.car.monthly_charge") ?? null;

  const utilityDetails = stringValue(details, "costs.utility_details") ?? null;

  const otherCharges = stringValue(details, "costs.other_charges") ?? null;

  const garageSize = numberValue(details, "garage.size_sqft") ?? null;

  const availableFrom = formatDate(typedListing.available_from) ?? formatDate(stringValue(details, "property.available_from"));

  const monthlyRent = formatMoney(typedListing.monthly_rent ?? numberValue(details, "costs.monthly_rent"));

  const serviceCharge = formatMoney(typedListing.service_charge ?? numberValue(details, "costs.service_charge"));

  const utilityCost = formatMoney(typedListing.utility_cost);

  const securityDeposit = formatMoney(typedListing.security_deposit ?? numberValue(details, "costs.security_deposit"));

  const advanceAmount = formatMoney(typedListing.advance_amount);

  const description = typedListing.description ?? unit?.description ?? null;

  const hasUnitRoomInformation = (unit?.master_bedrooms !== null && unit?.master_bedrooms !== undefined) || (unit?.semi_master_bedrooms !== null && unit?.semi_master_bedrooms !== undefined) || (unit?.guest_rooms !== null && unit?.guest_rooms !== undefined) || (unit?.has_servant_room !== null && unit?.has_servant_room !== undefined) || (unit?.has_living_room !== null && unit?.has_living_room !== undefined) || (unit?.has_dining_room !== null && unit?.has_dining_room !== undefined);

  const hasFacilities = balconyAvailable !== null || balconies !== null || lift !== null || generator !== null || security !== null || cctv !== null || bikeParking !== null || carParking !== null;

  const hasPreferenceInformation = Boolean(suitableFor) || Boolean(gender) || (listingPreference?.students_allowed !== null && listingPreference?.students_allowed !== undefined) || (listingPreference?.working_professionals_allowed !== null && listingPreference?.working_professionals_allowed !== undefined) || (listingPreference?.male_bachelors_allowed !== null && listingPreference?.male_bachelors_allowed !== undefined) || (listingPreference?.female_bachelors_allowed !== null && listingPreference?.female_bachelors_allowed !== undefined) || (listingPreference?.family_allowed !== null && listingPreference?.family_allowed !== undefined) || Boolean(listingPreference?.required_documents) || Boolean(listingPreference?.pet_policy) || Boolean(listingPreference?.smoking_policy) || Boolean(listingPreference?.notes);

  const hasSecurityInformation = Boolean(gateAccess) || Boolean(gateOpenFrom) || Boolean(gateOpenTo) || Boolean(cctvCoverage);

  const hasParkingInformation = bikeParking !== null || carParking !== null;

  const hasCostInformation = Boolean(utilityDetails) || Boolean(otherCharges) || Boolean(utilityCost) || Boolean(securityDeposit) || Boolean(advanceAmount);

  const addressParts = [property?.house_number ? `House ${property.house_number}` : null, property?.address_line, property?.area].filter(Boolean);

  const address = addressParts.join(", ");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-[1440px] px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <Link href="/rentals" className="group inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-hover-background hover:text-hover-text">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.8} />
          Back to rentals
        </Link>

        {/* Gallery */}
        <section className="mt-6">
          {mainImage ? (
            <div className="grid gap-3 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface">
                <img src={mainImage.url} alt={mainImage.alt_text ?? typedListing.title} className="h-full w-full object-cover" />
              </div>

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
                {imageUrls.slice(1, 3).map((image) => (
                  <div key={image.id} className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface lg:aspect-auto lg:min-h-0">
                    <img src={image.url} alt={image.alt_text ?? typedListing.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex aspect-[16/7] items-center justify-center rounded-xl bg-surface">
              <Home className="h-10 w-10 text-text-muted" strokeWidth={1.5} />
            </div>
          )}
        </section>

        {/* Main information */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-12">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-hover-background px-3 py-1.5 text-xs font-bold text-brand-green">{propertyType.replaceAll("_", " ").toUpperCase()}</span>

              {suitableFor && <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary">{suitableFor}</span>}

              {gender && <span className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-text-secondary">{gender}</span>}
            </div>

            <h1 className="mt-5 max-w-4xl text-3xl font-bold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">{typedListing.title}</h1>

            {address && (
              <div className="mt-4 flex items-start gap-2 text-text-secondary">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={1.8} />
                <span className="text-sm leading-6">{address}</span>
              </div>
            )}

            {/* Key details */}
            {(propertyBedrooms !== null || propertyBathrooms !== null || propertySize !== null || unit?.unit_label || unit?.floor !== null || unitFacing || furnishing || balconies !== null || roomCapacity !== null || availableSeats !== null || vehicleType || garageType || garageSize !== null || bathroomLocation) && (
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6 border-y border-border py-7 sm:grid-cols-3">
                <DetailItem icon={BedDouble} label="Bedrooms" value={propertyBedrooms} />

                <DetailItem icon={Bath} label="Bathrooms" value={propertyBathrooms} />

                <DetailItem icon={Ruler} label="Size" value={propertySize !== null ? `${propertySize.toLocaleString()} sqft` : null} />

                <DetailItem icon={Home} label="Unit" value={unit?.unit_label} />

                <DetailItem icon={Home} label="Floor" value={unit?.floor} />

                <DetailItem icon={MapPin} label="Facing" value={unitFacing} />

                <DetailItem icon={Home} label="Furnishing" value={furnishing} />

                <DetailItem icon={Home} label="Balconies" value={balconies} />

                <DetailItem icon={Users} label="Room capacity" value={roomCapacity} />

                <DetailItem icon={Users} label="Available seats" value={availableSeats} />

                <DetailItem icon={Car} label="Vehicle" value={vehicleType} />

                <DetailItem icon={Home} label="Garage" value={garageType} />

                <DetailItem icon={Ruler} label="Garage size" value={garageSize !== null ? `${garageSize.toLocaleString()} sqft` : null} />

                <DetailItem icon={Bath} label="Bathroom location" value={bathroomLocation} />
              </div>
            )}

            {/* Apartment room details */}
            {hasUnitRoomInformation && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Room details</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={BedDouble} label="Master bedrooms" value={unit?.master_bedrooms} />

                  <DetailItem icon={BedDouble} label="Semi-master bedrooms" value={unit?.semi_master_bedrooms} />

                  <DetailItem icon={BedDouble} label="Guest rooms" value={unit?.guest_rooms} />

                  <DetailItem icon={Home} label="Servant room" value={formatBoolean(unit?.has_servant_room)} />

                  <DetailItem icon={Home} label="Living room" value={formatBoolean(unit?.has_living_room)} />

                  <DetailItem icon={Home} label="Dining room" value={formatBoolean(unit?.has_dining_room)} />
                </div>
              </section>
            )}

            {/* Description */}
            {description && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">About this place</h2>

                <p className="mt-4 max-w-3xl whitespace-pre-line text-sm leading-7 text-text-secondary">{description}</p>
              </section>
            )}

            {/* Facilities */}
            {hasFacilities && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Facilities</h2>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Facility label="Balcony" enabled={balconyAvailable ?? (balconies !== null ? balconies > 0 : null)} />

                  <Facility label="Lift" enabled={lift} />
                  <Facility label="Generator / power backup" enabled={generator} />
                  <Facility label="Security guard" enabled={security} />
                  <Facility label="CCTV" enabled={cctv} />
                  <Facility label="Bike parking" enabled={bikeParking} />
                  <Facility label="Car parking" enabled={carParking} />
                </div>
              </section>
            )}

            {/* Tenant preferences */}
            {hasPreferenceInformation && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Tenant preferences</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={Users} label="Suitable for" value={suitableFor} />

                  <DetailItem icon={Users} label="Gender" value={gender} />

                  {listingPreference?.students_allowed !== null && listingPreference?.students_allowed !== undefined && <DetailItem icon={Users} label="Students" value={listingPreference.students_allowed ? "Allowed" : "Not allowed"} />}

                  {listingPreference?.working_professionals_allowed !== null && listingPreference?.working_professionals_allowed !== undefined && <DetailItem icon={Users} label="Working professionals" value={listingPreference.working_professionals_allowed ? "Allowed" : "Not allowed"} />}

                  {listingPreference?.male_bachelors_allowed !== null && listingPreference?.male_bachelors_allowed !== undefined && <DetailItem icon={Users} label="Male bachelors" value={listingPreference.male_bachelors_allowed ? "Allowed" : "Not allowed"} />}

                  {listingPreference?.female_bachelors_allowed !== null && listingPreference?.female_bachelors_allowed !== undefined && <DetailItem icon={Users} label="Female bachelors" value={listingPreference.female_bachelors_allowed ? "Allowed" : "Not allowed"} />}

                  {listingPreference?.family_allowed !== null && listingPreference?.family_allowed !== undefined && <DetailItem icon={Users} label="Family" value={listingPreference.family_allowed ? "Allowed" : "Not allowed"} />}

                  <DetailItem icon={ShieldCheck} label="Required documents" value={listingPreference?.required_documents} />

                  <DetailItem icon={ShieldCheck} label="Pet policy" value={listingPreference?.pet_policy} />

                  <DetailItem icon={ShieldCheck} label="Smoking policy" value={listingPreference?.smoking_policy} />
                </div>

                {listingPreference?.notes && <p className="mt-5 max-w-3xl whitespace-pre-line text-sm leading-7 text-text-secondary">{listingPreference.notes}</p>}
              </section>
            )}

            {/* Security and access */}
            {hasSecurityInformation && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Security & access</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={ShieldCheck} label="Gate access" value={gateAccess === "24/7" ? "Open 24/7" : gateAccess === "fixed" ? "Fixed hours" : formatEnumValue(gateAccess)} />

                  {gateOpenFrom && gateOpenTo && <DetailItem icon={CalendarDays} label="Gate opening hours" value={`${gateOpenFrom} – ${gateOpenTo}`} />}

                  <DetailItem icon={ShieldCheck} label="CCTV coverage" value={cctvCoverage} />
                </div>
              </section>
            )}

            {/* Parking */}
            {hasParkingInformation && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Parking</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <DetailItem icon={Car} label="Bike parking" value={formatParkingCharge(bikeParking, bikeParkingChargeType, bikeParkingCharge)} />

                  <DetailItem icon={Car} label="Car parking" value={formatParkingCharge(carParking, carParkingChargeType, carParkingCharge)} />
                </div>
              </section>
            )}

            {/* Rental information */}
            {(typedListing.minimum_rental_period || availableFrom || typedListing.source) && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Rental information</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InformationRow label="Available from" value={availableFrom} />

                  <InformationRow label="Minimum rental period" value={typedListing.minimum_rental_period} />

                  <InformationRow label="Listing source" value={formatEnumValue(typedListing.source)} />
                </div>
              </section>
            )}

            {/* Additional costs */}
            {hasCostInformation && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Additional costs</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  <InformationRow label="Utility cost" value={utilityCost} />

                  <InformationRow label="Utility details" value={utilityDetails} />

                  <InformationRow label="Security deposit" value={securityDeposit} />

                  <InformationRow label="Advance" value={advanceAmount} />

                  <InformationRow label="Other charges" value={otherCharges} />
                </div>
              </section>
            )}

            {/* Videos */}
            {videoMedia.length > 0 && (
              <section className="mt-10">
                <h2 className="text-xl font-bold text-text-primary">Property video</h2>

                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {videoMedia.map((video) => (
                    <video key={video.id} controls preload="metadata" className="w-full rounded-xl bg-surface">
                      <source src={getStorageUrl(video.storage_path)} />
                    </video>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Rent card */}
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="rounded-xl border border-border bg-background p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-text-muted">Monthly rent</p>

              <div className="mt-2">{monthlyRent ? <span className="text-3xl font-bold text-brand-green">{monthlyRent}</span> : <span className="text-lg font-semibold text-text-secondary">Contact for price</span>}</div>

              <div className="mt-6 space-y-3 border-t border-border pt-5 text-sm">
                {serviceCharge && (
                  <div className="flex justify-between gap-4">
                    <span className="text-text-muted">Service charge</span>
                    <span className="font-semibold">{serviceCharge}</span>
                  </div>
                )}

                {utilityCost && (
                  <div className="flex justify-between gap-4">
                    <span className="text-text-muted">Utility cost</span>
                    <span className="font-semibold">{utilityCost}</span>
                  </div>
                )}

                {securityDeposit && (
                  <div className="flex justify-between gap-4">
                    <span className="text-text-muted">Security deposit</span>
                    <span className="font-semibold">{securityDeposit}</span>
                  </div>
                )}

                {advanceAmount && (
                  <div className="flex justify-between gap-4">
                    <span className="text-text-muted">Advance</span>
                    <span className="font-semibold">{advanceAmount}</span>
                  </div>
                )}

                {otherCharges && (
                  <div className="flex flex-col gap-1 border-t border-border pt-3">
                    <span className="text-text-muted">Other charges</span>
                    <span className="font-semibold">{otherCharges}</span>
                  </div>
                )}
              </div>

              {availableFrom && (
                <div className="mt-6 flex items-start gap-3 rounded-lg bg-surface p-4">
                  <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" strokeWidth={1.8} />

                  <div>
                    <p className="text-xs text-text-muted">Available from</p>

                    <p className="mt-1 text-sm font-semibold">{availableFrom}</p>
                  </div>
                </div>
              )}

              {primaryContact && (
                <div className="mt-6 space-y-2">
                  <a href={`tel:${primaryContact.contact_value}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-brand-green px-5 text-sm font-bold text-white transition-colors hover:bg-hover-text">
                    <Phone className="h-4 w-4" strokeWidth={1.8} />
                    Call to inquire
                  </a>

                  {primaryContact.label && <p className="text-center text-xs text-text-muted">{primaryContact.label}</p>}
                </div>
              )}

              {!primaryContact && (
                <div className="mt-6 rounded-lg border border-border bg-surface p-4 text-center">
                  <p className="text-sm font-medium text-text-secondary">Contact information is not available for this listing.</p>
                </div>
              )}

              <p className="mt-4 text-center text-[11px] leading-5 text-text-muted">Never send money before viewing the property and verifying the landlord.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
