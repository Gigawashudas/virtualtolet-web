"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Check, ChevronDown, ImagePlus, Play, ShieldCheck, Video, X } from "lucide-react";

import Navbar from "@/components/Navbar";

import { createClient } from "@/lib/supabase/client";

type PropertyType = "Apartment" | "Room" | "Seat" | "Garage";

type ListingMedia = {
  id: string;
  name: string;
  url: string;
  path: string;
  type: "photo" | "video";
};

type ListingForm = {
  propertyType: PropertyType;
  suitableFor: string;
  gender: string;
  bedrooms: string;
  bathrooms: string;
  balconies: string;
  roomCapacity: string;
  availableSeats: string;
  size: string;
  vehicleType: string;
  garageType: string;
  availableFrom: string;
  flatNumber: string;
  floor: string;
  house: string;
  road: string;
  block: string;
  area: string;
  bathroomLocation: string;
  balconyAvailable: boolean;
  lift: boolean;
  generator: boolean;
  security: boolean;
  cctv: boolean;
  cctvCoverage: string;
  gateAccess: string;
  gateOpenFrom: string;
  gateOpenTo: string;
  bikeParking: boolean;
  bikeParkingCharge: string;
  bikeParkingChargeAmount: string;
  carParking: boolean;
  carParkingCharge: string;
  carParkingChargeAmount: string;
  rent: string;
  serviceCharge: string;
  utilityDetails: string;
  securityDeposit: string;
  otherCharges: string;
  contactNumber: string;
  media: ListingMedia[];
  description: string;
};

const initialForm: ListingForm = {
  propertyType: "Apartment",
  suitableFor: "Family",
  gender: "Male",
  bedrooms: "",
  bathrooms: "",
  balconies: "",
  roomCapacity: "",
  availableSeats: "",
  size: "",
  vehicleType: "Car",
  garageType: "Covered",
  availableFrom: "",
  flatNumber: "",
  floor: "",
  house: "",
  road: "",
  block: "",
  area: "",
  bathroomLocation: "Inside the room",
  balconyAvailable: false,
  lift: false,
  generator: false,
  security: false,
  cctv: false,
  cctvCoverage: "",
  gateAccess: "24/7",
  gateOpenFrom: "",
  gateOpenTo: "",
  bikeParking: false,
  bikeParkingCharge: "included",
  bikeParkingChargeAmount: "",
  carParking: false,
  carParkingCharge: "included",
  carParkingChargeAmount: "",
  rent: "",
  serviceCharge: "",
  utilityDetails: "",
  securityDeposit: "",
  otherCharges: "",
  contactNumber: "",
  media: [],
  description: "",
};

const propertyTypes: PropertyType[] = ["Apartment", "Room", "Seat", "Garage"];

const inputClass = "mt-2 h-12 w-full rounded-lg border border-border bg-background px-4 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-green focus:ring-2 focus:ring-brand-green/10";

const textareaClass = "mt-2 min-h-28 w-full resize-y rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium text-text-primary outline-none transition placeholder:text-text-muted focus:border-brand-green focus:ring-2 focus:ring-brand-green/10";

const MAX_PHOTOS = 10;
const MAX_VIDEOS = 2;
const MAX_PHOTO_SIZE = 10 * 1024 * 1024;
const MAX_VIDEO_SIZE = 100 * 1024 * 1024;

const allowedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];
const allowedVideoTypes = ["video/mp4", "video/webm", "video/quicktime"];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-8 last:border-b-0">
      <div className="mb-6">
        <h2 className="text-lg font-extrabold text-text-primary">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ label, optional = false, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-text-primary">
        {label}
        {optional && <span className="ml-2 text-xs font-medium text-text-muted">Optional</span>}
      </span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${checked ? "border-brand-green bg-brand-green/5" : "border-border bg-background hover:border-hover-border hover:bg-hover-background"}`}>
      <span className="text-sm font-bold text-text-primary">{label}</span>
      <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${checked ? "border-brand-green bg-brand-green text-white" : "border-border-strong"}`}>{checked && <Check className="h-3 w-3" strokeWidth={3} />}</span>
    </button>
  );
}

function ChoiceButton({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`rounded-lg border px-4 py-3 text-sm font-bold transition ${selected ? "border-brand-green bg-brand-green/5 text-brand-green" : "border-border text-text-primary hover:border-hover-border hover:bg-hover-background hover:text-hover-text"}`}>
      {label}
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-b border-border py-4 last:border-b-0 sm:grid-cols-[190px_1fr] sm:gap-6">
      <span className="text-sm font-bold text-text-secondary">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value || "Not provided"}</span>
    </div>
  );
}

function getErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      details: "",
      hint: "",
      code: "",
      status: "",
    };
  }

  if (typeof error === "object" && error !== null) {
    const value = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
      status?: number;
      statusCode?: number;
    };

    return {
      message: value.message || "Unknown error",
      details: value.details || "",
      hint: value.hint || "",
      code: value.code || "",
      status: value.status ?? value.statusCode ?? "",
    };
  }

  return {
    message: String(error),
    details: "",
    hint: "",
    code: "",
    status: "",
  };
}

class ListingSubmissionError extends Error {
  step: string;
  originalError: unknown;

  constructor(step: string, originalError: unknown) {
    const details = getErrorDetails(originalError);

    super([`FAILED AT: ${step}`, "", `MESSAGE: ${details.message || "No message"}`, `CODE: ${details.code || "No code"}`, `DETAILS: ${details.details || "No details"}`, `HINT: ${details.hint || "No hint"}`, `STATUS: ${details.status || "No status"}`].join("\n"));

    this.name = "ListingSubmissionError";
    this.step = step;
    this.originalError = originalError;
  }
}

function failStep(step: string, error: unknown): never {
  const details = getErrorDetails(error);

  const debugPayload = {
    step,
    message: details.message,
    code: details.code,
    details: details.details,
    hint: details.hint,
    status: details.status,
  };

  console.error("LISTING SUBMISSION FAILED:", JSON.stringify(debugPayload, null, 2));

  throw new ListingSubmissionError(step, error);
}

export default function PostToLetPage() {
  const router = useRouter();

  const [form, setForm] = useState<ListingForm>(initialForm);
  const [reviewing, setReviewing] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    return () => {
      form.media.forEach((media) => {
        if (media.url.startsWith("blob:")) {
          URL.revokeObjectURL(media.url);
        }
      });
    };
  }, [form.media]);

  function updateField<K extends keyof ListingForm>(field: K, value: ListingForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handlePropertyTypeChange(type: PropertyType) {
    setForm((current) => ({
      ...current,
      propertyType: type,
      flatNumber: type === "Garage" ? "" : current.flatNumber,
      floor: type === "Garage" ? "" : current.floor,
      bikeParking: type === "Garage" ? false : current.bikeParking,
      carParking: type === "Garage" ? false : current.carParking,
      utilityDetails: type === "Garage" ? "" : current.utilityDetails,
      securityDeposit: type === "Garage" ? current.securityDeposit : "",
    }));
  }

  function isValidBangladeshPhone(phone: string) {
    const normalized = phone.replace(/[\s-]/g, "");

    return /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(normalized);
  }

  async function handleMediaUpload(event: React.ChangeEvent<HTMLInputElement>, mediaType: "photo" | "video") {
    const files = Array.from(event.target.files ?? []);

    if (!files.length) {
      return;
    }

    const currentCount = form.media.filter((media) => media.type === mediaType).length;

    const maxCount = mediaType === "photo" ? MAX_PHOTOS : MAX_VIDEOS;

    if (currentCount + files.length > maxCount) {
      window.alert(`You can upload up to ${maxCount} ${mediaType === "photo" ? "photos" : "videos"}.`);
      event.target.value = "";
      return;
    }

    const allowedTypes = mediaType === "photo" ? allowedPhotoTypes : allowedVideoTypes;

    const maxSize = mediaType === "photo" ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        window.alert(`${file.name} is not a supported ${mediaType === "photo" ? "image" : "video"} format.`);
        event.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        window.alert(`${file.name} is too large. Maximum ${mediaType === "photo" ? "photo" : "video"} size is ${mediaType === "photo" ? "10 MB" : "100 MB"}.`);
        event.target.value = "";
        return;
      }
    }

    setUploadingMedia(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("You must be signed in to upload media.");
      }

      const uploadedMedia: ListingMedia[] = [];

      for (const file of files) {
        const extension = file.name.split(".").pop()?.toLowerCase() || "bin";
        const id = crypto.randomUUID();
        const path = `${user.id}/${mediaType}/${id}.${extension}`;

        const { error: uploadError } = await supabase.storage.from("listing-media").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

        if (uploadError) {
          throw uploadError;
        }

        const { data: publicUrlData } = supabase.storage.from("listing-media").getPublicUrl(path);

        uploadedMedia.push({
          id,
          name: file.name,
          url: publicUrlData.publicUrl,
          path,
          type: mediaType,
        });
      }

      setForm((current) => ({
        ...current,
        media: [...current.media, ...uploadedMedia],
      }));
    } catch (error) {
      const details = getErrorDetails(error);

      console.error(
        "MEDIA UPLOAD ERROR:",
        JSON.stringify(
          {
            message: details.message,
            code: details.code,
            details: details.details,
            hint: details.hint,
            status: details.status,
          },
          null,
          2,
        ),
      );

      window.alert([`MESSAGE: ${details.message || "Failed to upload media."}`, details.code ? `CODE: ${details.code}` : "", details.details ? `DETAILS: ${details.details}` : "", details.hint ? `HINT: ${details.hint}` : "", details.status ? `STATUS: ${details.status}` : ""].filter(Boolean).join("\n"));
    } finally {
      setUploadingMedia(false);
      event.target.value = "";
    }
  }

  async function removeMedia(mediaToRemove: ListingMedia) {
    setForm((current) => ({
      ...current,
      media: current.media.filter((media) => media.id !== mediaToRemove.id),
    }));

    const supabase = createClient();

    const { error } = await supabase.storage.from("listing-media").remove([mediaToRemove.path]);

    if (error) {
      console.error("MEDIA DELETE ERROR:", error);
    }
  }

  function handleReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidBangladeshPhone(form.contactNumber)) {
      window.alert("Please enter a valid Bangladesh mobile number.");
      return;
    }

    setReviewing(true);
  }

  async function handleSubmit() {
    if (submitting) {
      return;
    }

    if (!isValidBangladeshPhone(form.contactNumber)) {
      window.alert("Please enter a valid Bangladesh mobile number.");
      return;
    }

    setSubmitting(true);
    let currentStep = "Starting submission";

    try {
      const supabase = createClient();

      currentStep = "Checking authentication";

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      console.log("AUTH USER:", user?.id);

      if (userError || !user) {
        failStep(currentStep, userError ?? new Error("You must be signed in to submit a listing."));
      }

      if (!user) {
        throw new Error("You must be signed in to submit a listing.");
      }

      const propertyType = form.propertyType === "Garage" ? "parking_storage" : "residential";

      const listingType = form.propertyType === "Apartment" ? "apartment" : form.propertyType === "Room" ? "room" : form.propertyType === "Seat" ? "hostel_seat" : "garage";

      const title = form.propertyType === "Apartment" ? `${form.bedrooms || "Apartment"} Bedroom Apartment${form.area ? ` in ${form.area}` : ""}` : form.propertyType === "Room" ? `${form.gender} Room${form.area ? ` in ${form.area}` : ""}` : form.propertyType === "Seat" ? `${form.gender} Seat${form.area ? ` in ${form.area}` : ""}` : `${form.vehicleType} Garage${form.area ? ` in ${form.area}` : ""}`;

      const addressParts = [form.propertyType !== "Garage" && form.flatNumber && `Flat ${form.flatNumber}`, form.propertyType !== "Garage" && form.floor && `${form.floor} Floor`, form.house && `House ${form.house}`, form.road && `Road ${form.road}`, form.block && `Block ${form.block}`].filter(Boolean);

      const addressLine = addressParts.join(", ");

      currentStep = "Creating property";

      const { data: property, error: propertyError } = await supabase
        .from("properties")
        .insert({
          created_by: user.id,
          property_type: propertyType,
          title,
          description: form.description || null,
          address_line: addressLine || null,
          area: form.area,
          city: "Dhaka",
          house_number: form.house || null,
        })
        .select("id")
        .single();

      if (propertyError || !property) {
        failStep(currentStep, propertyError ?? new Error("Failed to create property."));
      }

      if (!property) {
        throw new Error("Failed to create property.");
      }

      let unitId: string | null = null;

      if (form.propertyType !== "Garage") {
        currentStep = "Creating property unit";

        const unitLabel = form.flatNumber || (form.propertyType === "Apartment" ? "Apartment" : form.propertyType === "Room" ? "Room" : "Seat");

        const { data: unit, error: unitError } = await supabase
          .from("property_units")
          .insert({
            property_id: property.id,
            unit_label: unitLabel,
            floor: form.floor ? Number(form.floor.replace(/\D/g, "")) || null : null,
            bedrooms: form.propertyType === "Apartment" && form.bedrooms ? Number(form.bedrooms) : null,
            bathrooms: form.propertyType === "Apartment" && form.bathrooms ? Number(form.bathrooms) : null,
            size_sqft: (form.propertyType === "Apartment" || form.propertyType === "Room") && form.size ? Number(form.size) : null,
            description: form.description || null,
          })
          .select("id")
          .single();

        if (unitError || !unit) {
          failStep(currentStep, unitError ?? new Error("Failed to create property unit."));
        }

        if (!unit) {
          throw new Error("Failed to create property unit.");
        }

        unitId = unit.id;
      }

      const details = {
        property: {
          property_type: form.propertyType,
          bedrooms: form.propertyType === "Apartment" && form.bedrooms ? Number(form.bedrooms) : null,
          bathrooms: form.propertyType === "Apartment" && form.bathrooms ? Number(form.bathrooms) : null,
          balconies: form.propertyType === "Apartment" && form.balconies ? Number(form.balconies) : null,
          size_sqft: form.size ? Number(form.size) : null,
          available_from: form.availableFrom || null,
        },
        occupancy: {
          suitable_for: form.propertyType === "Apartment" ? form.suitableFor : null,
          gender: form.propertyType === "Room" || form.propertyType === "Seat" ? form.gender : null,
          room_capacity: form.propertyType === "Room" || form.propertyType === "Seat" ? (form.roomCapacity ? Number(form.roomCapacity) : null) : null,
          available_seats: form.propertyType === "Seat" && form.availableSeats ? Number(form.availableSeats) : null,
        },
        bathroom: {
          location: form.propertyType === "Room" || form.propertyType === "Seat" ? form.bathroomLocation : null,
        },
        balcony: {
          available: form.propertyType === "Room" || form.propertyType === "Seat" ? form.balconyAvailable : null,
        },
        facilities: {
          lift: form.propertyType === "Garage" ? null : form.lift,
          generator: form.propertyType === "Garage" ? null : form.generator,
          security_guard: form.security,
          cctv: form.cctv,
          cctv_coverage: form.cctv ? form.cctvCoverage || null : null,
        },
        gate: {
          access: form.gateAccess,
          open_from: form.gateAccess === "fixed" ? form.gateOpenFrom || null : null,
          open_to: form.gateAccess === "fixed" ? form.gateOpenTo || null : null,
        },
        parking:
          form.propertyType === "Garage"
            ? null
            : {
                bike: {
                  available: form.bikeParking,
                  charge_type: form.bikeParking ? form.bikeParkingCharge : null,
                  monthly_charge: form.bikeParking && form.bikeParkingCharge === "extra" && form.bikeParkingChargeAmount.trim() ? Number(form.bikeParkingChargeAmount) : null,
                },
                car: {
                  available: form.carParking,
                  charge_type: form.carParking ? form.carParkingCharge : null,
                  monthly_charge: form.carParking && form.carParkingCharge === "extra" && form.carParkingChargeAmount.trim() ? Number(form.carParkingChargeAmount) : null,
                },
              },
        costs: {
          monthly_rent: form.rent ? Number(form.rent) : null,
          service_charge: form.serviceCharge ? Number(form.serviceCharge) : null,
          utility_details: form.propertyType === "Garage" ? null : form.utilityDetails || null,
          other_charges: form.otherCharges || null,
          security_deposit: form.propertyType === "Garage" && form.securityDeposit ? Number(form.securityDeposit) : null,
        },
        garage:
          form.propertyType === "Garage"
            ? {
                vehicle_type: form.vehicleType,
                garage_type: form.garageType,
                size_sqft: form.size ? Number(form.size) : null,
              }
            : null,
      };

      currentStep = "Creating listing";

      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .insert({
          property_id: property.id,
          unit_id: unitId,
          created_by: user.id,
          owner_profile_id: null,
          listing_type: listingType,
          source: "community",
          title,
          description: form.description || null,
          monthly_rent: form.rent ? Number(form.rent) : null,
          service_charge: form.serviceCharge ? Number(form.serviceCharge) : null,
          available_from: form.availableFrom || null,
          security_deposit: form.propertyType === "Garage" && form.securityDeposit ? Number(form.securityDeposit) : null,
          publication_status: "pending_review",
          rental_lifecycle: "active",
          availability_state: "needs_confirmation",
          details,
        })
        .select("id")
        .single();

      if (listingError || !listing) {
        failStep(currentStep, listingError ?? new Error("Failed to create listing."));
      }

      if (!listing) {
        throw new Error("Failed to create listing.");
      }

      currentStep = "Saving contact number";

      const { error: contactError } = await supabase.from("listing_contacts").insert({
        listing_id: listing.id,
        contact_type: "phone",
        contact_value: form.contactNumber.trim(),
        label: "Primary contact",
        is_primary: true,
        created_by: user.id,
      });

      if (contactError) {
        failStep(currentStep, contactError);
      }

      if (form.propertyType === "Apartment" && form.suitableFor) {
        currentStep = "Saving apartment tenant preferences";

        const { error: preferenceError } = await supabase.from("listing_preferences").insert({
          listing_id: listing.id,
          tenant_preference: form.suitableFor.toLowerCase(),
          family_allowed: form.suitableFor === "Family" || form.suitableFor === "Both",
          male_bachelors_allowed: form.suitableFor === "Bachelor" || form.suitableFor === "Both",
          female_bachelors_allowed: form.suitableFor === "Bachelor" || form.suitableFor === "Both",
        });

        if (preferenceError) {
          failStep(currentStep, preferenceError);
        }
      }

      if (form.propertyType === "Room" || form.propertyType === "Seat") {
        currentStep = "Saving room or seat preferences";

        const { error: preferenceError } = await supabase.from("listing_preferences").insert({
          listing_id: listing.id,
          tenant_preference: "not_specified",
          notes: `${form.gender} ${form.propertyType.toLowerCase()} listing`,
        });

        if (preferenceError) {
          failStep(currentStep, preferenceError);
        }
      }

      if (form.media.length > 0) {
        currentStep = "Saving listing media";

        const mediaRows = form.media.map((media, index) => ({
          listing_id: listing.id,
          storage_path: media.path,
          media_type: media.type === "photo" ? "image" : "video",
          alt_text: media.name,
          sort_order: index,
          created_by: user.id,
        }));

        const { error: mediaError } = await supabase.from("listing_media").insert(mediaRows);

        if (mediaError) {
          failStep(currentStep, mediaError);
        }
      }

      currentStep = "Creating listing event";

      const { error: eventError } = await supabase.from("listing_events").insert({
        listing_id: listing.id,
        actor_id: user.id,
        event_type: "created",
        event_data: {
          source: "owner",
          property_type: form.propertyType,
        },
      });

      if (eventError) {
        failStep(currentStep, eventError);
      }

      window.alert("Your listing has been submitted for verification.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      const failedStep = error instanceof ListingSubmissionError ? error.step : currentStep;

      const originalError = error instanceof ListingSubmissionError ? error.originalError : error;

      const details = getErrorDetails(originalError);

      console.error(
        "LISTING SUBMISSION ERROR:",
        JSON.stringify(
          {
            step: failedStep,
            message: details.message,
            code: details.code,
            details: details.details,
            hint: details.hint,
            status: details.status,
          },
          null,
          2,
        ),
      );

      setSubmitting(false);

      window.alert([`FAILED AT: ${failedStep}`, "", `MESSAGE: ${details.message || "No message"}`, details.code ? `CODE: ${details.code}` : "", details.details ? `DETAILS: ${details.details}` : "", details.hint ? `HINT: ${details.hint}` : "", details.status ? `STATUS: ${details.status}` : ""].filter(Boolean).join("\n"));
    }
  }

  const locationParts = [form.propertyType !== "Garage" && form.flatNumber && `Flat ${form.flatNumber}`, form.propertyType !== "Garage" && form.floor && `${form.floor} Floor`, form.house && `House ${form.house}`, form.road && `Road ${form.road}`, form.block && `Block ${form.block}`, form.area].filter(Boolean);

  function renderParkingSection(currentForm: ListingForm) {
    return (
      <Section title="Parking">
        <div className="grid gap-8">
          <div>
            <Field label="Bike parking">
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceButton label="Not available" selected={!currentForm.bikeParking} onClick={() => updateField("bikeParking", false)} />
                <ChoiceButton label="Available" selected={currentForm.bikeParking} onClick={() => updateField("bikeParking", true)} />
              </div>
            </Field>

            {currentForm.bikeParking && (
              <div className="mt-5">
                <Field label="Bike parking charge">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceButton label="Included in rent" selected={currentForm.bikeParkingCharge === "included"} onClick={() => updateField("bikeParkingCharge", "included")} />
                    <ChoiceButton label="Extra charge" selected={currentForm.bikeParkingCharge === "extra"} onClick={() => updateField("bikeParkingCharge", "extra")} />
                  </div>
                </Field>

                {currentForm.bikeParkingCharge === "extra" && (
                  <div className="mt-5">
                    <Field label="Bike parking monthly charge">
                      <div className="relative">
                        <span className="absolute left-4 top-[26px] text-sm font-bold text-text-secondary">৳</span>
                        <input required type="number" min="0" value={currentForm.bikeParkingChargeAmount} onChange={(event) => updateField("bikeParkingChargeAmount", event.target.value)} placeholder="e.g. 1000" className={`${inputClass} pl-9`} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <Field label="Car parking">
              <div className="grid gap-3 sm:grid-cols-2">
                <ChoiceButton label="Not available" selected={!currentForm.carParking} onClick={() => updateField("carParking", false)} />
                <ChoiceButton label="Available" selected={currentForm.carParking} onClick={() => updateField("carParking", true)} />
              </div>
            </Field>

            {currentForm.carParking && (
              <div className="mt-5">
                <Field label="Car parking charge">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ChoiceButton label="Included in rent" selected={currentForm.carParkingCharge === "included"} onClick={() => updateField("carParkingCharge", "included")} />
                    <ChoiceButton label="Extra charge" selected={currentForm.carParkingCharge === "extra"} onClick={() => updateField("carParkingCharge", "extra")} />
                  </div>
                </Field>

                {currentForm.carParkingCharge === "extra" && (
                  <div className="mt-5">
                    <Field label="Car parking monthly charge">
                      <div className="relative">
                        <span className="absolute left-4 top-[26px] text-sm font-bold text-text-secondary">৳</span>
                        <input required type="number" min="0" value={currentForm.carParkingChargeAmount} onChange={(event) => updateField("carParkingChargeAmount", event.target.value)} placeholder="e.g. 3000" className={`${inputClass} pl-9`} />
                      </div>
                    </Field>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Section>
    );
  }

  if (reviewing) {
    const photos = form.media.filter((media) => media.type === "photo");
    const videos = form.media.filter((media) => media.type === "video");

    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-10">
          <div className="mb-10">
            <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-green">REVIEW LISTING</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">Review your listing</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Check the information below before submitting your listing for verification.</p>
          </div>

          <div className="rounded-xl border border-border bg-background px-6 sm:px-8">
            <Section title="Property">
              <ReviewRow label="Property type" value={form.propertyType} />
              {form.propertyType === "Apartment" && (
                <>
                  <ReviewRow label="Suitable for" value={form.suitableFor} />
                  <ReviewRow label="Bedrooms" value={form.bedrooms} />
                  <ReviewRow label="Bathrooms" value={form.bathrooms} />
                  <ReviewRow label="Balconies" value={form.balconies} />
                  <ReviewRow label="Size" value={form.size ? `${form.size} sq ft` : ""} />
                </>
              )}
              {form.propertyType === "Room" && (
                <>
                  <ReviewRow label="For" value={form.gender} />
                  <ReviewRow label="Room capacity" value={form.roomCapacity ? `${form.roomCapacity} people` : ""} />
                  <ReviewRow label="Room size" value={form.size ? `${form.size} sq ft` : ""} />
                  <ReviewRow label="Bathroom" value={form.bathroomLocation} />
                  <ReviewRow label="Balcony" value={form.balconyAvailable ? "Yes" : "No"} />
                </>
              )}
              {form.propertyType === "Seat" && (
                <>
                  <ReviewRow label="For" value={form.gender} />
                  <ReviewRow label="Total people in room" value={form.roomCapacity ? `${form.roomCapacity} people` : ""} />
                  <ReviewRow label="Available seats" value={form.availableSeats} />
                  <ReviewRow label="Bathroom" value={form.bathroomLocation} />
                  <ReviewRow label="Balcony" value={form.balconyAvailable ? "Yes" : "No"} />
                </>
              )}
              {form.propertyType === "Garage" && (
                <>
                  <ReviewRow label="Vehicle type" value={form.vehicleType} />
                  <ReviewRow label="Garage type" value={form.garageType} />
                  <ReviewRow label="Size" value={form.size ? `${form.size} sq ft` : ""} />
                </>
              )}
              <ReviewRow label="Available from" value={form.availableFrom} />
            </Section>

            <Section title="Location">
              <ReviewRow label="Address" value={locationParts.join(", ")} />
            </Section>

            <Section title={form.propertyType === "Garage" ? "Security & Access" : "Facilities & Security"}>
              {form.propertyType !== "Garage" && (
                <>
                  <ReviewRow label="Lift" value={form.lift ? "Available" : "Not available"} />
                  <ReviewRow label="Generator" value={form.generator ? "Available" : "Not available"} />
                </>
              )}
              <ReviewRow label="Security guard" value={form.security ? "Available" : "Not available"} />
              <ReviewRow label="CCTV" value={form.cctv ? "Available" : "Not available"} />
              {form.cctv && <ReviewRow label="CCTV coverage" value={form.cctvCoverage} />}
              <ReviewRow label="Gate access" value={form.gateAccess === "24/7" ? "24/7" : form.gateOpenFrom && form.gateOpenTo ? `${form.gateOpenFrom} – ${form.gateOpenTo}` : "Fixed hours"} />
            </Section>

            {form.propertyType !== "Garage" && renderParkingSection(form)}

            <Section title="Rent & Costs">
              <ReviewRow label="Monthly rent" value={form.rent ? `৳${form.rent}` : ""} />
              <ReviewRow label="Service charge" value={form.serviceCharge ? `৳${form.serviceCharge}/month` : ""} />
              {form.propertyType === "Garage" && <ReviewRow label="Security deposit" value={form.securityDeposit ? `৳${form.securityDeposit}` : ""} />}
              {form.propertyType !== "Garage" && <ReviewRow label="Utilities" value={form.utilityDetails} />}
              <ReviewRow label="Other charges" value={form.otherCharges || "None"} />
            </Section>

            <Section title="Contact">
              <ReviewRow label="Contact number" value={form.contactNumber} />
            </Section>

            <Section title="Photos & Videos">
              {photos.length > 0 && (
                <>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Photos</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {photos.map((photo, index) => (
                      <div key={photo.id} className="overflow-hidden rounded-lg border border-border bg-surface">
                        <img src={photo.url} alt={`Listing photo ${index + 1}`} className="h-32 w-full object-cover" />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {videos.length > 0 && (
                <div className={photos.length ? "mt-6" : ""}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">Videos</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {videos.map((video) => (
                      <video key={video.id} src={video.url} controls preload="metadata" className="h-48 w-full rounded-lg border border-border bg-black object-cover" />
                    ))}
                  </div>
                </div>
              )}

              {!form.media.length && <ReviewRow label="Media" value="No photos or videos added" />}
            </Section>

            <Section title="Description">
              <ReviewRow label="Description" value={form.description || "Not provided"} />
            </Section>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setReviewing(false)} className="h-12 rounded-lg border border-border px-6 text-sm font-bold text-text-primary transition hover:border-hover-border hover:bg-hover-background hover:text-hover-text">
              Edit listing
            </button>

            <button type="button" onClick={handleSubmit} disabled={submitting} className="h-12 rounded-lg bg-brand-green px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit listing"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-5xl px-6 py-12 sm:px-8 lg:px-10">
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold tracking-[0.2em] text-brand-green">POST TO LET</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-text-primary sm:text-4xl">List your property</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">Add the property details below. Your listing will be reviewed before it becomes publicly available.</p>
        </div>

        <form onSubmit={handleReview} className="rounded-xl border border-border bg-background px-6 sm:px-8">
          <Section title="Property">
            <div className="grid gap-6">
              <Field label="Property type">
                <div className="grid gap-3 sm:grid-cols-4">
                  {propertyTypes.map((type) => (
                    <ChoiceButton key={type} label={type} selected={form.propertyType === type} onClick={() => handlePropertyTypeChange(type)} />
                  ))}
                </div>
              </Field>

              {form.propertyType === "Apartment" && (
                <>
                  <Field label="Suitable for">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Family", "Bachelor", "Both"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.suitableFor === option} onClick={() => updateField("suitableFor", option)} />
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-3">
                    <Field label="Bedrooms">
                      <input required type="number" min="0" value={form.bedrooms} onChange={(event) => updateField("bedrooms", event.target.value)} placeholder="e.g. 3" className={inputClass} />
                    </Field>

                    <Field label="Bathrooms">
                      <input required type="number" min="0" value={form.bathrooms} onChange={(event) => updateField("bathrooms", event.target.value)} placeholder="e.g. 2" className={inputClass} />
                    </Field>

                    <Field label="Balconies">
                      <input required type="number" min="0" value={form.balconies} onChange={(event) => updateField("balconies", event.target.value)} placeholder="e.g. 2" className={inputClass} />
                    </Field>
                  </div>

                  <Field label="Size">
                    <div className="relative">
                      <input required type="number" min="0" value={form.size} onChange={(event) => updateField("size", event.target.value)} placeholder="e.g. 1200" className={`${inputClass} pr-20`} />
                      <span className="absolute right-4 top-[26px] text-sm font-bold text-text-secondary">sq ft</span>
                    </div>
                  </Field>
                </>
              )}

              {form.propertyType === "Room" && (
                <>
                  <Field label="For">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Male", "Female"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.gender === option} onClick={() => updateField("gender", option)} />
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Room capacity">
                      <input required type="number" min="1" value={form.roomCapacity} onChange={(event) => updateField("roomCapacity", event.target.value)} placeholder="e.g. 2" className={inputClass} />
                    </Field>

                    <Field label="Room size" optional>
                      <div className="relative">
                        <input type="number" min="0" value={form.size} onChange={(event) => updateField("size", event.target.value)} placeholder="e.g. 180" className={`${inputClass} pr-20`} />
                        <span className="absolute right-4 top-[26px] text-sm font-bold text-text-secondary">sq ft</span>
                      </div>
                    </Field>
                  </div>

                  <Field label="Bathroom">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Inside the room", "Shared"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.bathroomLocation === option} onClick={() => updateField("bathroomLocation", option)} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Balcony">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ChoiceButton label="Not available" selected={!form.balconyAvailable} onClick={() => updateField("balconyAvailable", false)} />
                      <ChoiceButton label="Available" selected={form.balconyAvailable} onClick={() => updateField("balconyAvailable", true)} />
                    </div>
                  </Field>
                </>
              )}

              {form.propertyType === "Seat" && (
                <>
                  <Field label="For">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Male", "Female"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.gender === option} onClick={() => updateField("gender", option)} />
                      ))}
                    </div>
                  </Field>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <Field label="Total people in room">
                      <input required type="number" min="1" value={form.roomCapacity} onChange={(event) => updateField("roomCapacity", event.target.value)} placeholder="e.g. 4" className={inputClass} />
                    </Field>

                    <Field label="Available seats">
                      <input required type="number" min="1" value={form.availableSeats} onChange={(event) => updateField("availableSeats", event.target.value)} placeholder="e.g. 1" className={inputClass} />
                    </Field>
                  </div>

                  <Field label="Bathroom">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Inside the room", "Shared"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.bathroomLocation === option} onClick={() => updateField("bathroomLocation", option)} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Balcony">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ChoiceButton label="Not available" selected={!form.balconyAvailable} onClick={() => updateField("balconyAvailable", false)} />
                      <ChoiceButton label="Available" selected={form.balconyAvailable} onClick={() => updateField("balconyAvailable", true)} />
                    </div>
                  </Field>
                </>
              )}

              {form.propertyType === "Garage" && (
                <>
                  <Field label="Vehicle type">
                    <div className="grid gap-3 sm:grid-cols-3">
                      {["Car", "Bike", "Car + Bike"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.vehicleType === option} onClick={() => updateField("vehicleType", option)} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Garage type">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {["Covered", "Open"].map((option) => (
                        <ChoiceButton key={option} label={option} selected={form.garageType === option} onClick={() => updateField("garageType", option)} />
                      ))}
                    </div>
                  </Field>

                  <Field label="Size" optional>
                    <div className="relative">
                      <input type="number" min="0" value={form.size} onChange={(event) => updateField("size", event.target.value)} placeholder="e.g. 250" className={`${inputClass} pr-20`} />
                      <span className="absolute right-4 top-[26px] text-sm font-bold text-text-secondary">sq ft</span>
                    </div>
                  </Field>
                </>
              )}

              <Field label="Available from" optional>
                <input type="date" value={form.availableFrom} onChange={(event) => updateField("availableFrom", event.target.value)} className={inputClass} />
              </Field>
            </div>
          </Section>

          <Section title="Location">
            <div className="grid gap-6">
              {form.propertyType !== "Garage" && (
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Flat number">
                    <input required value={form.flatNumber} onChange={(event) => updateField("flatNumber", event.target.value)} placeholder="e.g. 4A" className={inputClass} />
                  </Field>

                  <Field label="Floor">
                    <input required type="text" value={form.floor} onChange={(event) => updateField("floor", event.target.value)} placeholder="e.g. 4th" className={inputClass} />
                  </Field>
                </div>
              )}

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="House" optional>
                  <input value={form.house} onChange={(event) => updateField("house", event.target.value)} placeholder="e.g. 12" className={inputClass} />
                </Field>

                <Field label="Road">
                  <input required value={form.road} onChange={(event) => updateField("road", event.target.value)} placeholder="e.g. Road 5" className={inputClass} />
                </Field>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Block">
                  <input required value={form.block} onChange={(event) => updateField("block", event.target.value)} placeholder="e.g. Block B" className={inputClass} />
                </Field>

                <Field label="Area">
                  <input required value={form.area} onChange={(event) => updateField("area", event.target.value)} placeholder="e.g. Bashundhara R/A" className={inputClass} />
                </Field>
              </div>
            </div>
          </Section>

          <Section title={form.propertyType === "Garage" ? "Security & Access" : "Facilities & Security"}>
            {form.propertyType !== "Garage" && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Toggle label="Lift" checked={form.lift} onChange={(value) => updateField("lift", value)} />
                  <Toggle label="Generator / power backup" checked={form.generator} onChange={(value) => updateField("generator", value)} />
                </div>
              </>
            )}

            <div className={`grid gap-3 sm:grid-cols-2 ${form.propertyType !== "Garage" ? "mt-6" : ""}`}>
              <Toggle label="Security guard" checked={form.security} onChange={(value) => updateField("security", value)} />
              <Toggle label="CCTV" checked={form.cctv} onChange={(value) => updateField("cctv", value)} />
            </div>

            {form.cctv && (
              <div className="mt-6">
                <Field label="CCTV coverage" optional>
                  <input value={form.cctvCoverage} onChange={(event) => updateField("cctvCoverage", event.target.value)} placeholder="e.g. Entrance, parking and common areas" className={inputClass} />
                </Field>
              </div>
            )}

            <div className="mt-6">
              <Field label="Gate access">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ChoiceButton label="24/7" selected={form.gateAccess === "24/7"} onClick={() => updateField("gateAccess", "24/7")} />
                  <ChoiceButton label="Fixed hours" selected={form.gateAccess === "fixed"} onClick={() => updateField("gateAccess", "fixed")} />
                </div>
              </Field>

              {form.gateAccess === "fixed" && (
                <div className="mt-5 grid gap-6 sm:grid-cols-2">
                  <Field label="Open from">
                    <input required type="time" value={form.gateOpenFrom} onChange={(event) => updateField("gateOpenFrom", event.target.value)} className={inputClass} />
                  </Field>

                  <Field label="Open to">
                    <input required type="time" value={form.gateOpenTo} onChange={(event) => updateField("gateOpenTo", event.target.value)} className={inputClass} />
                  </Field>
                </div>
              )}
            </div>
          </Section>

          {form.propertyType !== "Garage" && renderParkingSection(form)}

          <Section title="Rent & Costs">
            <div className="grid gap-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <Field label="Monthly rent">
                  <div className="relative">
                    <span className="absolute left-4 top-[26px] text-sm font-bold text-text-secondary">৳</span>
                    <input required type="number" min="0" value={form.rent} onChange={(event) => updateField("rent", event.target.value)} placeholder="e.g. 25000" className={`${inputClass} pl-9`} />
                  </div>
                </Field>

                <Field label="Service charge" optional>
                  <div className="relative">
                    <span className="absolute left-4 top-[26px] text-sm font-bold text-text-secondary">৳</span>
                    <input type="number" min="0" value={form.serviceCharge} onChange={(event) => updateField("serviceCharge", event.target.value)} placeholder="e.g. 3000" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
              </div>

              {form.propertyType === "Garage" && (
                <Field label="Security deposit" optional>
                  <div className="relative">
                    <span className="absolute left-4 top-[26px] text-sm font-bold text-text-secondary">৳</span>
                    <input type="number" min="0" value={form.securityDeposit} onChange={(event) => updateField("securityDeposit", event.target.value)} placeholder="e.g. 10000" className={`${inputClass} pl-9`} />
                  </div>
                </Field>
              )}

              {form.propertyType !== "Garage" && (
                <Field label="Utility details" optional>
                  <textarea value={form.utilityDetails} onChange={(event) => updateField("utilityDetails", event.target.value)} placeholder="e.g. Electricity and gas billed separately" className={textareaClass} />
                </Field>
              )}

              <Field label="Other charges" optional>
                <textarea value={form.otherCharges} onChange={(event) => updateField("otherCharges", event.target.value)} placeholder="Mention any additional charges" className={textareaClass} />
              </Field>
            </div>
          </Section>

          <Section title="Contact">
            <Field label="Contact number">
              <input required type="tel" value={form.contactNumber} onChange={(event) => updateField("contactNumber", event.target.value)} placeholder="e.g. 01712345678" className={inputClass} />
            </Field>
          </Section>

          <Section title="Photos & Videos">
            <div className="grid gap-6">
              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">Photos</span>
                  <span className="text-xs font-medium text-text-muted">Optional · Up to {MAX_PHOTOS}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  {form.media
                    .filter((media) => media.type === "photo")
                    .map((photo, index) => (
                      <div key={photo.id} className="group relative overflow-hidden rounded-lg border border-border bg-surface">
                        <img src={photo.url} alt={`Listing photo ${index + 1}`} className="h-40 w-full object-cover" />
                        <button type="button" onClick={() => removeMedia(photo)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                  {form.media.filter((media) => media.type === "photo").length < MAX_PHOTOS && (
                    <label className="flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-center transition hover:border-hover-border hover:bg-hover-background">
                      <ImagePlus className="h-6 w-6 text-text-secondary" />
                      <span className="mt-3 text-sm font-bold text-text-primary">Add photos</span>
                      <span className="mt-1 text-xs text-text-muted">JPG, PNG or WebP · Max 10 MB</span>
                      <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => handleMediaUpload(event, "photo")} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-bold text-text-primary">Videos</span>
                  <span className="text-xs font-medium text-text-muted">Optional · Up to {MAX_VIDEOS}</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {form.media
                    .filter((media) => media.type === "video")
                    .map((video) => (
                      <div key={video.id} className="relative overflow-hidden rounded-lg border border-border bg-black">
                        <video src={video.url} controls preload="metadata" className="h-48 w-full object-cover" />
                        <button type="button" onClick={() => removeMedia(video)} className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}

                  {form.media.filter((media) => media.type === "video").length < MAX_VIDEOS && (
                    <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-center transition hover:border-hover-border hover:bg-hover-background">
                      <Video className="h-6 w-6 text-text-secondary" />
                      <span className="mt-3 text-sm font-bold text-text-primary">Add videos</span>
                      <span className="mt-1 text-xs text-text-muted">MP4, WebM or MOV · Max 100 MB</span>
                      <input type="file" accept="video/mp4,video/webm,video/quicktime" multiple onChange={(event) => handleMediaUpload(event, "video")} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {uploadingMedia && <p className="text-sm font-semibold text-text-secondary">Uploading media...</p>}
            </div>
          </Section>

          <Section title="Description">
            <Field label="Description" optional>
              <textarea value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Add any additional information about the property..." className={textareaClass} />
            </Field>
          </Section>

          <div className="flex flex-col gap-4 border-t border-border py-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
              <p className="max-w-xl text-xs leading-5 text-text-secondary">Your listing will be reviewed before publication. Please make sure all information is accurate.</p>
            </div>

            <button type="submit" disabled={uploadingMedia} className="flex h-12 items-center justify-center gap-2 rounded-lg bg-brand-green px-6 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
              Review listing
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
