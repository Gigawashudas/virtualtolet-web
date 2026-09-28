import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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
  floor: string | null;
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
  title: string | null;
  listing_type: string | null;
  monthly_rent: number | null;
  service_charge: number | null;
  available_from: string | null;
  security_deposit: number | null;
  description: string | null;
  details: Record<string, unknown> | null;
  property_id?: string | null;
  unit_id?: string | null;
  properties: Property | Property[] | null;
  property_units: PropertyUnit | PropertyUnit[] | null;
  listing_preferences: ListingPreference | ListingPreference[] | null;
  listing_contacts: ListingContact | ListingContact[] | null;
};

function firstRelation<T>(relation: T | T[] | null | undefined): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function getNestedValue(object: Record<string, unknown> | null | undefined, path: string): unknown {
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

function stringValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function numberValue(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function booleanValue(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value === "true";
  }

  return false;
}

function inputValue(value: unknown): string {
  return stringValue(value);
}

const inputClass = "w-full rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-500 dark:focus:ring-neutral-800";

function getListingTypeLabel(listingType: string | null): string {
  switch (listingType) {
    case "apartment":
      return "Apartment";
    case "room":
      return "Room";
    case "hostel_seat":
      return "Seat";
    case "garage":
      return "Garage";
    default:
      return listingType || "Property";
  }
}

function getFormSnapshot(details: Record<string, unknown> | null): Record<string, unknown> {
  const snapshot = getNestedValue(details, "form_snapshot");

  if (snapshot && typeof snapshot === "object" && !Array.isArray(snapshot)) {
    return snapshot as Record<string, unknown>;
  }

  return {};
}

export default async function EditListingPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string }> }) {
  const { id } = await params;
  const { error: queryError } = await searchParams;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  /*
   * DEBUG LOGGING
   *
   * These logs will tell us exactly what the Next.js server
   * sees when you open the edit page.
   */
  console.log("========================================");
  console.log("EDIT LISTING DEBUG");
  console.log("EDIT PAGE LISTING ID:", id);
  console.log("EDIT PAGE AUTH USER:", user?.id ?? null);
  console.log("EDIT PAGE AUTH ERROR:", authError);
  console.log("========================================");

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
      property_id,
      unit_id,
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

  /*
   * MORE DEBUG INFORMATION
   */
  console.log("EDIT LISTING QUERY ERROR:", error);
  console.log("EDIT LISTING FOUND:", listing ? listing.id : null);
  console.log("EDIT LISTING EXPECTED OWNER:", user.id);

  if (error) {
    console.error("EDIT LISTING LOAD ERROR:", JSON.stringify(error, null, 2));

    notFound();
  }

  if (!listing) {
    console.error("EDIT LISTING NOT FOUND FOR CURRENT USER");
    console.error("Listing ID:", id);
    console.error("Current user ID:", user.id);

    notFound();
  }

  const typedListing = listing as Listing;

  const property = firstRelation(typedListing.properties);

  const unit = firstRelation(typedListing.property_units);

  const preference = firstRelation(typedListing.listing_preferences);

  const contacts = Array.isArray(typedListing.listing_contacts) ? typedListing.listing_contacts : typedListing.listing_contacts ? [typedListing.listing_contacts] : [];

  const primaryPhone = contacts.find((contact) => contact.contact_type === "phone" && contact.is_primary) ?? contacts.find((contact) => contact.contact_type === "phone") ?? contacts[0] ?? null;

  const details = typedListing.details && typeof typedListing.details === "object" ? typedListing.details : {};

  const formSnapshot = getFormSnapshot(details);

  const propertyType = getListingTypeLabel(typedListing.listing_type);

  const suitableFor = preference?.tenant_preference || stringValue(getNestedValue(formSnapshot, "suitableFor"));

  const gender = stringValue(getNestedValue(formSnapshot, "gender"));

  const vehicleType = stringValue(getNestedValue(formSnapshot, "vehicleType"));

  const garageType = stringValue(getNestedValue(formSnapshot, "garageType"));

  async function handleUpdate(formData: FormData) {
    "use server";

    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(`/sign-in?redirect=/profile/listings/${id}/edit`);
    }

    const title = String(formData.get("title") ?? "").trim();

    const description = String(formData.get("description") ?? "").trim();

    const area = String(formData.get("area") ?? "").trim();

    const houseNumber = String(formData.get("house_number") ?? "").trim();

    const addressLine = String(formData.get("address_line") ?? "").trim();

    const monthlyRentValue = String(formData.get("monthly_rent") ?? "").trim();

    const serviceChargeValue = String(formData.get("service_charge") ?? "").trim();

    const securityDepositValue = String(formData.get("security_deposit") ?? "").trim();

    const availableFrom = String(formData.get("available_from") ?? "").trim();

    const bedroomsValue = String(formData.get("bedrooms") ?? "").trim();

    const bathroomsValue = String(formData.get("bathrooms") ?? "").trim();

    const sizeSqftValue = String(formData.get("size_sqft") ?? "").trim();

    const floor = String(formData.get("floor") ?? "").trim();

    const contactNumber = String(formData.get("contact_number") ?? "").trim();

    const monthlyRent = Number(monthlyRentValue);

    const serviceCharge = serviceChargeValue === "" ? null : Number(serviceChargeValue);

    const securityDeposit = securityDepositValue === "" ? null : Number(securityDepositValue);

    const bedrooms = bedroomsValue === "" ? null : Number(bedroomsValue);

    const bathrooms = bathroomsValue === "" ? null : Number(bathroomsValue);

    const sizeSqft = sizeSqftValue === "" ? null : Number(sizeSqftValue);

    if (!title) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Title is required.")}`);
    }

    if (!area) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Area is required.")}`);
    }

    if (!Number.isFinite(monthlyRent) || monthlyRent < 0) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid monthly rent.")}`);
    }

    if (serviceCharge !== null && (!Number.isFinite(serviceCharge) || serviceCharge < 0)) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid service charge.")}`);
    }

    if (securityDeposit !== null && (!Number.isFinite(securityDeposit) || securityDeposit < 0)) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid security deposit.")}`);
    }

    if (bedrooms !== null && (!Number.isFinite(bedrooms) || bedrooms < 0)) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid bedroom count.")}`);
    }

    if (bathrooms !== null && (!Number.isFinite(bathrooms) || bathrooms < 0)) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid bathroom count.")}`);
    }

    if (sizeSqft !== null && (!Number.isFinite(sizeSqft) || sizeSqft < 0)) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Please enter a valid property size.")}`);
    }

    const { data: existingListing, error: existingListingError } = await supabase
      .from("listings")
      .select(
        `
        id,
        property_id,
        unit_id,
        details
      `,
      )
      .eq("id", id)
      .eq("created_by", user.id)
      .maybeSingle();

    if (existingListingError) {
      console.error("EDIT UPDATE LOAD ERROR:", existingListingError);

      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(existingListingError.message)}`);
    }

    if (!existingListing) {
      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent("Listing not found or you do not own this listing.")}`);
    }

    const currentDetails = existingListing.details && typeof existingListing.details === "object" ? (existingListing.details as Record<string, unknown>) : {};

    const nextDetails: Record<string, unknown> = {
      ...currentDetails,
      property: {
        ...(currentDetails.property && typeof currentDetails.property === "object" ? currentDetails.property : {}),
        bedrooms,
        bathrooms,
        size_sqft: sizeSqft,
        available_from: availableFrom || null,
      },
      costs: {
        ...(currentDetails.costs && typeof currentDetails.costs === "object" ? currentDetails.costs : {}),
        monthly_rent: monthlyRent,
        service_charge: serviceCharge,
        security_deposit: securityDeposit,
      },
      form_snapshot: {
        ...(currentDetails.form_snapshot && typeof currentDetails.form_snapshot === "object" ? currentDetails.form_snapshot : {}),
        title,
        description,
        area,
        house: houseNumber,
        road: stringValue(getNestedValue(formSnapshot, "road")),
        block: stringValue(getNestedValue(formSnapshot, "block")),
        flatNumber: stringValue(getNestedValue(formSnapshot, "flatNumber")),
        floor,
        bedrooms: bedrooms === null ? "" : String(bedrooms),
        bathrooms: bathrooms === null ? "" : String(bathrooms),
        size: sizeSqft === null ? "" : String(sizeSqft),
        rent: String(monthlyRent),
        serviceCharge: serviceCharge === null ? "" : String(serviceCharge),
        securityDeposit: securityDeposit === null ? "" : String(securityDeposit),
        availableFrom,
        contactNumber,
      },
    };

    if (existingListing.property_id) {
      const { error: propertyError } = await supabase
        .from("properties")
        .update({
          title,
          description: description || null,
          address_line: addressLine || null,
          area,
          house_number: houseNumber || null,
        })
        .eq("id", existingListing.property_id);

      if (propertyError) {
        console.error("EDIT PROPERTY UPDATE ERROR:", propertyError);

        redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(propertyError.message)}`);
      }
    }

    if (existingListing.unit_id) {
      const { error: unitError } = await supabase
        .from("property_units")
        .update({
          floor: floor || null,
          bedrooms,
          bathrooms,
          size_sqft: sizeSqft,
          description: description || null,
        })
        .eq("id", existingListing.unit_id);

      if (unitError) {
        console.error("EDIT UNIT UPDATE ERROR:", unitError);

        redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(unitError.message)}`);
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
      console.error("EDIT LISTING UPDATE ERROR:", listingError);

      redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(listingError.message)}`);
    }

    if (contactNumber) {
      const existingPhone = await supabase.from("listing_contacts").select("id").eq("listing_id", id).eq("contact_type", "phone").eq("is_primary", true).maybeSingle();

      if (existingPhone.error) {
        console.error("EDIT CONTACT LOAD ERROR:", existingPhone.error);

        redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(existingPhone.error.message)}`);
      }

      if (existingPhone.data) {
        const { error: contactError } = await supabase
          .from("listing_contacts")
          .update({
            contact_value: contactNumber,
            label: "Primary phone",
            is_primary: true,
          })
          .eq("id", existingPhone.data.id);

        if (contactError) {
          console.error("EDIT CONTACT UPDATE ERROR:", contactError);

          redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(contactError.message)}`);
        }
      } else {
        const { error: contactInsertError } = await supabase.from("listing_contacts").insert({
          listing_id: id,
          contact_type: "phone",
          contact_value: contactNumber,
          label: "Primary phone",
          is_primary: true,
        });

        if (contactInsertError) {
          console.error("EDIT CONTACT INSERT ERROR:", contactInsertError);

          redirect(`/profile/listings/${id}/edit?error=${encodeURIComponent(contactInsertError.message)}`);
        }
      }
    }

    redirect(`/profile/listings/${id}`);
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-neutral-50 px-4 py-8 dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <Link href={`/profile/listings/${id}`} className="mb-3 inline-flex items-center gap-2 text-sm text-neutral-600 transition hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white">
                <ArrowLeft size={16} />
                Back to listing
              </Link>

              <h1 className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-white">Edit listing</h1>

              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Update your property information.</p>
            </div>
          </div>

          {queryError ? <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">{queryError}</div> : null}

          <form action={handleUpdate} className="space-y-6">
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Listing</h2>

              <div className="mt-5 space-y-5">
                <div>
                  <label htmlFor="title" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Title
                  </label>

                  <input id="title" name="title" defaultValue={inputValue(typedListing.title)} className={inputClass} required />
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Description
                  </label>

                  <textarea id="description" name="description" defaultValue={inputValue(typedListing.description)} className={`${inputClass} min-h-32 resize-y`} />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">Property type</label>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">{propertyType}</div>
                </div>

                {(suitableFor || gender || vehicleType || garageType) && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {suitableFor ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Suitable for</p>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">{suitableFor}</p>
                      </div>
                    ) : null}

                    {gender ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Gender</p>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">{gender}</p>
                      </div>
                    ) : null}

                    {vehicleType ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Vehicle type</p>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">{vehicleType}</p>
                      </div>
                    ) : null}

                    {garageType ? (
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Garage type</p>
                        <p className="mt-1 text-sm text-neutral-900 dark:text-white">{garageType}</p>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Location</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="area" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Area
                  </label>

                  <input id="area" name="area" defaultValue={inputValue(property?.area || getNestedValue(formSnapshot, "area"))} className={inputClass} required />
                </div>

                <div>
                  <label htmlFor="house_number" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    House
                  </label>

                  <input id="house_number" name="house_number" defaultValue={inputValue(property?.house_number || getNestedValue(formSnapshot, "house"))} className={inputClass} placeholder="e.g. 151" />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="address_line" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Address
                  </label>

                  <input id="address_line" name="address_line" defaultValue={inputValue(property?.address_line)} className={inputClass} placeholder="Road, block, flat, etc." />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Property details</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="floor" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Floor
                  </label>

                  <input id="floor" name="floor" defaultValue={inputValue(unit?.floor || getNestedValue(formSnapshot, "floor"))} className={inputClass} placeholder="e.g. 3rd" />
                </div>

                <div>
                  <label htmlFor="size_sqft" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Size (sq ft)
                  </label>

                  <input id="size_sqft" name="size_sqft" type="number" min="0" defaultValue={numberValue(unit?.size_sqft) ?? numberValue(getNestedValue(formSnapshot, "size")) ?? ""} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="bedrooms" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Bedrooms
                  </label>

                  <input id="bedrooms" name="bedrooms" type="number" min="0" defaultValue={numberValue(unit?.bedrooms) ?? numberValue(getNestedValue(formSnapshot, "bedrooms")) ?? ""} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="bathrooms" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Bathrooms
                  </label>

                  <input id="bathrooms" name="bathrooms" type="number" min="0" step="0.5" defaultValue={numberValue(unit?.bathrooms) ?? numberValue(getNestedValue(formSnapshot, "bathrooms")) ?? ""} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Costs</h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="monthly_rent" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Monthly rent
                  </label>

                  <input id="monthly_rent" name="monthly_rent" type="number" min="0" defaultValue={typedListing.monthly_rent ?? numberValue(getNestedValue(formSnapshot, "rent")) ?? ""} className={inputClass} required />
                </div>

                <div>
                  <label htmlFor="service_charge" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Service charge
                  </label>

                  <input id="service_charge" name="service_charge" type="number" min="0" defaultValue={typedListing.service_charge ?? numberValue(getNestedValue(formSnapshot, "serviceCharge")) ?? ""} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="security_deposit" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Security deposit
                  </label>

                  <input id="security_deposit" name="security_deposit" type="number" min="0" defaultValue={typedListing.security_deposit ?? numberValue(getNestedValue(formSnapshot, "securityDeposit")) ?? ""} className={inputClass} />
                </div>

                <div>
                  <label htmlFor="available_from" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    Available from
                  </label>

                  <input id="available_from" name="available_from" type="date" defaultValue={inputValue(typedListing.available_from)} className={inputClass} />
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
              <h2 className="text-lg font-semibold text-neutral-950 dark:text-white">Contact</h2>

              <div className="mt-5">
                <label htmlFor="contact_number" className="mb-2 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Phone number
                </label>

                <input id="contact_number" name="contact_number" type="tel" defaultValue={inputValue(primaryPhone?.contact_value)} className={inputClass} placeholder="01XXXXXXXXX" />
              </div>
            </section>

            <div className="flex justify-end">
              <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-neutral-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200">
                <Save size={17} />
                Save changes
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
