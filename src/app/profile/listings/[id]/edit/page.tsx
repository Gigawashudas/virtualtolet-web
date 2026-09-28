import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { ArrowLeft, Save } from "lucide-react";

import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

type Property = {
  id: string;
  area: string | null;
  house_number: string | null;
  address_line: string | null;
  description: string | null;
};

type PropertyUnit = {
  id: string;
  unit_label: string | null;
  floor: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqft: number | null;
  description: string | null;
};

type ListingPreference = {
  id: string;
  tenant_preference: string | null;
  students_allowed: boolean | null;
  working_professionals_allowed: boolean | null;
  male_bachelors_allowed: boolean | null;
  female_bachelors_allowed: boolean | null;
  family_allowed: boolean | null;
};

type ListingContact = {
  id: string;
  contact_type: string | null;
  contact_value: string | null;
  label: string | null;
  is_primary: boolean | null;
};

type Listing = {
  id: string;
  title: string;
  listing_type: string | null;
  monthly_rent: number | null;
  service_charge: number | null;
  available_from: string | null;
  security_deposit: number | null;
  description: string | null;
  details: Record<string, unknown> | null;
  properties: Property | Property[] | null;
  property_units: PropertyUnit | PropertyUnit[] | null;
  listing_preferences: ListingPreference | ListingPreference[] | null;
  listing_contacts: ListingContact[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (!value) {
    return null;
  }

  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function getNestedValue(object: Record<string, unknown> | null | undefined, path: string) {
  if (!object) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, object);
}

function stringValue(object: Record<string, unknown> | null | undefined, path: string) {
  const value = getNestedValue(object, path);

  return typeof value === "string" ? value : "";
}

function numberValue(object: Record<string, unknown> | null | undefined, path: string) {
  const value = getNestedValue(object, path);

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function booleanValue(object: Record<string, unknown> | null | undefined, path: string) {
  const value = getNestedValue(object, path);

  if (typeof value === "boolean") {
    return value;
  }

  return null;
}

function inputValue(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function inputClass() {
  return "mt-2 h-11 w-full rounded-md border border-border bg-background px-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-text";
}

function getListingTypeLabel(value: string | null) {
  const labels: Record<string, string> = {
    apartment: "Apartment",
    room: "Room",
    hostel_seat: "Seat",
    garage: "Garage",
  };

  return value ? (labels[value] ?? value) : "Listing";
}

function getFormSnapshot(details: Record<string, unknown> | null) {
  const snapshot = getNestedValue(details, "form_snapshot");

  if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
    return snapshot as Record<string, unknown>;
  }

  return null;
}

export default async function EditListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const query = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/sign-in?redirect=/profile/listings/${id}/edit`);
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
        security_deposit,
        description,
        details,
        properties (
          id,
          area,
          house_number,
          address_line,
          description
        ),
        property_units (
          id,
          unit_label,
          floor,
          bedrooms,
          bathrooms,
          size_sqft,
          description
        ),
        listing_preferences (
          id,
          tenant_preference,
          students_allowed,
          working_professionals_allowed,
          male_bachelors_allowed,
          female_bachelors_allowed,
          family_allowed
        ),
        listing_contacts (
          id,
          contact_type,
          contact_value,
          label,
          is_primary
        )
      `,
    )
    .eq("id", id)
    .eq("created_by", user.id)
    .maybeSingle();

  if (error) {
    console.error("EDIT LISTING LOAD ERROR:", error);
    notFound();
  }

  if (!listing) {
    notFound();
  }

  const typedListing = listing as Listing;

  const property = firstRelation(typedListing.properties);
  const unit = firstRelation(typedListing.property_units);
  const preference = firstRelation(typedListing.listing_preferences);

  const primaryContact = typedListing.listing_contacts?.find((contact) => contact.contact_type === "phone" && contact.is_primary) ?? typedListing.listing_contacts?.find((contact) => contact.contact_type === "phone") ?? null;

  const details = typedListing.details ?? {};
  const formSnapshot = getFormSnapshot(details);

  const propertyType = stringValue(formSnapshot, "propertyType") || stringValue(details, "property.property_type") || getListingTypeLabel(typedListing.listing_type);

  const suitableFor = stringValue(formSnapshot, "suitableFor") || stringValue(details, "occupancy.suitable_for") || preference?.tenant_preference || "";

  const gender = stringValue(formSnapshot, "gender") || stringValue(details, "occupancy.gender") || "";

  const vehicleType = stringValue(formSnapshot, "vehicleType") || stringValue(details, "garage.vehicle_type") || "";

  const garageType = stringValue(formSnapshot, "garageType") || stringValue(details, "garage.garage_type") || "";

  const handleUpdate = async (formData: FormData) => {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect("/sign-in");
    }

    const title = String(formData.get("title") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    const area = String(formData.get("area") ?? "").trim();
    const houseNumber = String(formData.get("house_number") ?? "").trim();

    const addressLine = String(formData.get("address_line") ?? "").trim();

    const monthlyRentRaw = String(formData.get("monthly_rent") ?? "").trim();

    const serviceChargeRaw = String(formData.get("service_charge") ?? "").trim();

    const securityDepositRaw = String(formData.get("security_deposit") ?? "").trim();

    const availableFrom = String(formData.get("available_from") ?? "").trim();

    const bedroomsRaw = String(formData.get("bedrooms") ?? "").trim();

    const bathroomsRaw = String(formData.get("bathrooms") ?? "").trim();

    const sizeRaw = String(formData.get("size_sqft") ?? "").trim();

    const floorRaw = String(formData.get("floor") ?? "").trim();

    const contactNumber = String(formData.get("contact_number") ?? "").trim();

    if (!title) {
      redirect(`/profile/listings/${id}/edit?error=title-required`);
    }

    if (!area) {
      redirect(`/profile/listings/${id}/edit?error=area-required`);
    }

    const monthlyRent = monthlyRentRaw ? Number(monthlyRentRaw) : null;

    const serviceCharge = serviceChargeRaw ? Number(serviceChargeRaw) : null;

    const securityDeposit = securityDepositRaw ? Number(securityDepositRaw) : null;

    const bedrooms = bedroomsRaw ? Number(bedroomsRaw) : null;

    const bathrooms = bathroomsRaw ? Number(bathroomsRaw) : null;

    const sizeSqft = sizeRaw ? Number(sizeRaw) : null;

    const floor = floorRaw ? Number(floorRaw) : null;

    if ((monthlyRent !== null && !Number.isFinite(monthlyRent)) || (serviceCharge !== null && !Number.isFinite(serviceCharge)) || (securityDeposit !== null && !Number.isFinite(securityDeposit)) || (bedrooms !== null && !Number.isFinite(bedrooms)) || (bathrooms !== null && !Number.isFinite(bathrooms)) || (sizeSqft !== null && !Number.isFinite(sizeSqft)) || (floor !== null && !Number.isFinite(floor))) {
      redirect(`/profile/listings/${id}/edit?error=invalid-number`);
    }

    const { data: ownedListing, error: ownershipError } = await supabase
      .from("listings")
      .select(
        `
            id,
            property_id,
            unit_id,
            listing_type,
            details,
            properties (
              id
            ),
            property_units (
              id
            )
          `,
      )
      .eq("id", id)
      .eq("created_by", user.id)
      .maybeSingle();

    if (ownershipError || !ownedListing) {
      redirect(`/profile/listings/${id}/edit?error=listing-not-found`);
    }

    const ownedProperty = firstRelation(ownedListing.properties as { id: string } | { id: string }[] | null);

    const ownedUnit = firstRelation(ownedListing.property_units as { id: string } | { id: string }[] | null);

    const currentDetails = ownedListing.details && typeof ownedListing.details === "object" && !Array.isArray(ownedListing.details) ? (ownedListing.details as Record<string, unknown>) : {};

    const nextDetails: Record<string, unknown> = {
      ...currentDetails,
      property: {
        ...((currentDetails.property && typeof currentDetails.property === "object" && !Array.isArray(currentDetails.property) ? currentDetails.property : {}) as Record<string, unknown>),
        bedrooms,
        bathrooms,
        size_sqft: sizeSqft,
        available_from: availableFrom || null,
      },
      costs: {
        ...((currentDetails.costs && typeof currentDetails.costs === "object" && !Array.isArray(currentDetails.costs) ? currentDetails.costs : {}) as Record<string, unknown>),
        monthly_rent: monthlyRent,
        service_charge: serviceCharge,
        security_deposit: securityDeposit,
      },
    };

    if (formSnapshot) {
      nextDetails.form_snapshot = {
        ...formSnapshot,
        title,
        description,
        area,
        house: houseNumber,
        road: String(formData.get("road") ?? "").trim(),
        block: String(formData.get("block") ?? "").trim(),
        flatNumber: String(formData.get("flat_number") ?? "").trim(),
        floor: floorRaw,
        bedrooms: bedroomsRaw,
        bathrooms: bathroomsRaw,
        size: sizeRaw,
        rent: monthlyRentRaw,
        serviceCharge: serviceChargeRaw,
        securityDeposit: securityDepositRaw,
        availableFrom,
        contactNumber,
      };
    }

    const { error: propertyError } = await supabase
      .from("properties")
      .update({
        title,
        description: description || null,
        address_line: addressLine || null,
        area,
        house_number: houseNumber || null,
      })
      .eq("id", ownedProperty?.id ?? ownedListing.property_id);

    if (propertyError) {
      console.error("EDIT PROPERTY ERROR:", propertyError);
      redirect(`/profile/listings/${id}/edit?error=property-update`);
    }

    if (ownedUnit?.id ?? ownedListing.unit_id) {
      const { error: unitError } = await supabase
        .from("property_units")
        .update({
          floor,
          bedrooms,
          bathrooms,
          size_sqft: sizeSqft,
          description: description || null,
        })
        .eq("id", ownedUnit?.id ?? ownedListing.unit_id);

      if (unitError) {
        console.error("EDIT UNIT ERROR:", unitError);
        redirect(`/profile/listings/${id}/edit?error=unit-update`);
      }
    }

    const { error: listingError } = await supabase
      .from("listings")
      .update({
        title,
        description: description || null,
        monthly_rent: monthlyRent,
        service_charge: serviceCharge,
        available_from: availableFrom || null,
        security_deposit: securityDeposit,
        details: nextDetails,
      })
      .eq("id", id)
      .eq("created_by", user.id);

    if (listingError) {
      console.error("EDIT LISTING ERROR:", listingError);
      redirect(`/profile/listings/${id}/edit?error=listing-update`);
    }

    if (primaryContact) {
      const { error: contactError } = await supabase
        .from("listing_contacts")
        .update({
          contact_value: contactNumber || null,
        })
        .eq("id", primaryContact.id);

      if (contactError) {
        console.error("EDIT CONTACT ERROR:", contactError);
      }
    } else if (contactNumber) {
      const { error: contactInsertError } = await supabase.from("listing_contacts").insert({
        listing_id: id,
        contact_type: "phone",
        contact_value: contactNumber,
        label: "Primary phone",
        is_primary: true,
      });

      if (contactInsertError) {
        console.error("EDIT CONTACT INSERT ERROR:", contactInsertError);
      }
    }

    redirect(`/profile/listings/${id}`);
  };

  const errorMessage = query.error === "title-required" ? "Please enter a listing title." : query.error === "area-required" ? "Please enter an area." : query.error === "invalid-number" ? "Please enter valid numbers." : query.error ? "The listing could not be updated. Please try again." : null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />

      <div className="mx-auto max-w-[1000px] px-6 py-10 sm:px-8 lg:px-10">
        <div className="mb-8">
          <Link href={`/profile/listings/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-hover-text">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.8} />
            Back to listing
          </Link>
        </div>

        <div className="mb-8 border-b border-border pb-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand-green">Edit listing</p>

          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Update your listing</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Update the information tenants see about your property.</p>
        </div>

        {errorMessage && <div className="mb-6 rounded-lg border border-brand-red/20 bg-brand-red/5 px-4 py-3 text-sm font-semibold text-brand-red">{errorMessage}</div>}

        <form action={handleUpdate}>
          <div className="rounded-xl border border-border bg-surface">
            <section className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary">Listing</h2>

              <div className="mt-6 grid gap-6">
                <label>
                  <span className="text-sm font-bold text-text-primary">Title</span>

                  <input name="title" required defaultValue={typedListing.title} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Description</span>

                  <textarea name="description" rows={6} defaultValue={typedListing.description ?? ""} className="mt-2 w-full resize-y rounded-md border border-border bg-background px-3 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-text" />
                </label>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label>
                    <span className="text-sm font-bold text-text-primary">Property type</span>

                    <input value={propertyType} disabled className={`${inputClass()} cursor-not-allowed opacity-60`} />
                  </label>

                  <label>
                    <span className="text-sm font-bold text-text-primary">Available from</span>

                    <input name="available_from" type="date" defaultValue={typedListing.available_from ?? ""} className={inputClass()} />
                  </label>
                </div>
              </div>
            </section>

            <section className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary">Location</h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <label>
                  <span className="text-sm font-bold text-text-primary">Area</span>

                  <input name="area" required defaultValue={property?.area ?? ""} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">
                    House
                    <span className="ml-1 text-xs font-normal text-text-muted">Optional</span>
                  </span>

                  <input name="house_number" defaultValue={property?.house_number ?? ""} className={inputClass()} />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-bold text-text-primary">Address</span>

                  <input name="address_line" defaultValue={property?.address_line ?? ""} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">
                    Flat
                    <span className="ml-1 text-xs font-normal text-text-muted">Optional</span>
                  </span>

                  <input name="flat_number" defaultValue={stringValue(formSnapshot, "flatNumber") || unit?.unit_label || ""} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Floor</span>

                  <input name="floor" type="number" min="0" defaultValue={inputValue(unit?.floor ?? numberValue(formSnapshot, "floor"))} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Road</span>

                  <input name="road" defaultValue={stringValue(formSnapshot, "road")} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Block</span>

                  <input name="block" defaultValue={stringValue(formSnapshot, "block")} className={inputClass()} />
                </label>
              </div>
            </section>

            <section className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary">Property details</h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="text-sm font-bold text-text-primary">Bedrooms</span>

                  <input name="bedrooms" type="number" min="0" defaultValue={inputValue(unit?.bedrooms ?? numberValue(formSnapshot, "bedrooms"))} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Bathrooms</span>

                  <input name="bathrooms" type="number" min="0" defaultValue={inputValue(unit?.bathrooms ?? numberValue(formSnapshot, "bathrooms"))} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Size (sq ft)</span>

                  <input name="size_sqft" type="number" min="0" defaultValue={inputValue(unit?.size_sqft ?? numberValue(formSnapshot, "size"))} className={inputClass()} />
                </label>
              </div>
            </section>

            <section className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary">Costs</h2>

              <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <label>
                  <span className="text-sm font-bold text-text-primary">Monthly rent</span>

                  <input name="monthly_rent" type="number" min="0" defaultValue={inputValue(typedListing.monthly_rent)} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Service charge</span>

                  <input name="service_charge" type="number" min="0" defaultValue={inputValue(typedListing.service_charge)} className={inputClass()} />
                </label>

                <label>
                  <span className="text-sm font-bold text-text-primary">Security deposit</span>

                  <input name="security_deposit" type="number" min="0" defaultValue={inputValue(typedListing.security_deposit)} className={inputClass()} />
                </label>
              </div>
            </section>

            <section className="border-b border-border p-6 sm:p-8">
              <h2 className="text-lg font-bold text-text-primary">Contact</h2>

              <div className="mt-6">
                <label className="block">
                  <span className="text-sm font-bold text-text-primary">Contact number</span>

                  <input name="contact_number" type="tel" defaultValue={primaryContact?.contact_value ?? ""} placeholder="01XXXXXXXXX" className={inputClass()} />
                </label>
              </div>
            </section>

            <section className="p-6 sm:p-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-bold text-text-primary">Current listing type</p>

                  <p className="mt-1 text-sm text-text-secondary">
                    {getListingTypeLabel(typedListing.listing_type)}
                    {suitableFor ? ` · ${suitableFor}` : ""}
                    {gender ? ` · ${gender}` : ""}
                    {vehicleType ? ` · ${vehicleType}` : ""}
                    {garageType ? ` · ${garageType}` : ""}
                  </p>
                </div>

                <button type="submit" className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand-green px-7 text-sm font-bold text-white transition-opacity hover:opacity-90">
                  <Save className="h-4 w-4" strokeWidth={1.8} />
                  Save changes
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </main>
  );
}
