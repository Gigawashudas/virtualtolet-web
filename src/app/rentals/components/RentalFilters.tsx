"use client";

import Link from "next/link";

import { useState, type ReactNode } from "react";

import { ArrowRight, ChevronDown, Filter, X } from "lucide-react";

type FilterValues = {
  q?: string;
  type?: string;
  source?: string;
  sort?: string;
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
};

type RentalFiltersProps = {
  values: FilterValues;
  activeFilterCount: number;
  areas: string[];
  gateAccessValues: string[];
  vehicleTypes: string[];
  garageTypes: string[];
};

function normalizeType(value: string | undefined): string {
  const normalized = (value ?? "").trim().toLowerCase();

  if (normalized === "hostel_seat") {
    return "seat";
  }

  if (normalized === "parking") {
    return "garage";
  }

  return normalized;
}

function formatEnumValue(value: string | null): string | null {
  if (!value) return null;

  return value.replace(/[_-]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function SelectField({ name, label, defaultValue, children }: { name: string; label: string; defaultValue?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</span>

      <select name={name} defaultValue={defaultValue ?? ""} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-text">
        {children}
      </select>
    </label>
  );
}

function NumberField({ name, label, placeholder, defaultValue }: { name: string; label: string; placeholder?: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</span>

      <input type="number" name={name} min="0" defaultValue={defaultValue ?? ""} placeholder={placeholder} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-text-secondary focus:border-text" />
    </label>
  );
}

function BooleanSelect({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <SelectField name={name} label={label} defaultValue={defaultValue}>
      <option value="">Any</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </SelectField>
  );
}

function FilterSection({ title, children, defaultOpen = false }: { title: string; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border last:border-b-0">
      <button type="button" onClick={() => setOpen((current) => !current)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={open}>
        <span className="text-sm font-semibold">{title}</span>

        <ChevronDown className={`h-4 w-4 text-text-secondary transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={1.8} />
      </button>

      {open && <div className="pb-6">{children}</div>}
    </div>
  );
}

export default function RentalFilters({ values, activeFilterCount, areas, gateAccessValues, vehicleTypes, garageTypes }: RentalFiltersProps) {
  const [open, setOpen] = useState(false);

  const selectedType = normalizeType(values.type);

  const showApartmentFilters = selectedType === "" || selectedType === "apartment";

  const showRoomFilters = selectedType === "" || selectedType === "room";

  const showSeatFilters = selectedType === "" || selectedType === "seat";

  const showGarageFilters = selectedType === "" || selectedType === "garage";

  const showResidentialFilters = selectedType === "" || selectedType === "apartment" || selectedType === "room" || selectedType === "seat";

  const showOccupancyFilters = showApartmentFilters || showRoomFilters || showSeatFilters;

  const closeFilters = () => {
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-border bg-background px-5 text-sm font-semibold transition-colors hover:bg-hover-background">
        <Filter className="h-4 w-4" strokeWidth={1.8} />
        Filters
        {activeFilterCount > 0 && <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-text px-1.5 py-0.5 text-[10px] font-semibold leading-none text-background">{activeFilterCount}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <button type="button" aria-label="Close filters" onClick={closeFilters} className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-xl flex-col border-l border-border bg-surface shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary">Rentals</p>

                <h2 className="mt-1 text-xl font-semibold tracking-[-0.02em]">Filters</h2>

                {selectedType && <p className="mt-1 text-xs text-text-secondary">{formatEnumValue(selectedType)} filters</p>}
              </div>

              <button type="button" onClick={closeFilters} aria-label="Close filters" className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border transition-colors hover:bg-hover-background">
                <X className="h-5 w-5" strokeWidth={1.8} />
              </button>
            </div>

            <form method="GET" action="/rentals" onSubmit={() => setOpen(false)} className="flex min-h-0 flex-1 flex-col">
              <input type="hidden" name="q" value={values.q ?? ""} />

              <input type="hidden" name="type" value={values.type ?? ""} />

              <input type="hidden" name="source" value={values.source ?? ""} />

              <input type="hidden" name="sort" value={values.sort ?? ""} />

              <div className="min-h-0 flex-1 overflow-y-auto px-6">
                <FilterSection title="Rent & costs" defaultOpen>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <NumberField name="minRent" label="Minimum rent" placeholder="৳ Minimum" defaultValue={values.minRent} />

                    <NumberField name="maxRent" label="Maximum rent" placeholder="৳ Maximum" defaultValue={values.maxRent} />

                    <NumberField name="minServiceCharge" label="Min service charge" placeholder="৳ Minimum" defaultValue={values.minServiceCharge} />

                    <NumberField name="maxServiceCharge" label="Max service charge" placeholder="৳ Maximum" defaultValue={values.maxServiceCharge} />

                    {showGarageFilters && selectedType === "garage" && (
                      <>
                        <NumberField name="minDeposit" label="Minimum security deposit" placeholder="৳ Minimum" defaultValue={values.minDeposit} />

                        <NumberField name="maxDeposit" label="Maximum security deposit" placeholder="৳ Maximum" defaultValue={values.maxDeposit} />
                      </>
                    )}
                  </div>
                </FilterSection>

                <FilterSection title="Location & property">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Area</span>

                      <input type="text" name="area" list="rental-areas" defaultValue={values.area ?? ""} placeholder="e.g. Bashundhara" className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none placeholder:text-text-secondary focus:border-text" />

                      <datalist id="rental-areas">
                        {areas.map((area) => (
                          <option key={area} value={area} />
                        ))}
                      </datalist>
                    </label>

                    {showResidentialFilters && <NumberField name="floor" label="Floor" placeholder="Floor" defaultValue={values.floor} />}

                    {(showApartmentFilters || showRoomFilters || showSeatFilters || showGarageFilters) && (
                      <>
                        <NumberField name="minSize" label="Minimum size" placeholder="sq ft" defaultValue={values.minSize} />

                        <NumberField name="maxSize" label="Maximum size" placeholder="sq ft" defaultValue={values.maxSize} />
                      </>
                    )}
                  </div>
                </FilterSection>

                {showApartmentFilters && (
                  <FilterSection title={selectedType === "apartment" ? "Apartment details" : "Apartment"} defaultOpen={selectedType === "apartment"}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <NumberField name="bedrooms" label="Bedrooms" placeholder="Bedrooms" defaultValue={values.bedrooms} />

                      <NumberField name="bathrooms" label="Bathrooms" placeholder="Bathrooms" defaultValue={values.bathrooms} />

                      <SelectField name="suitableFor" label="Suitable for" defaultValue={values.suitableFor}>
                        <option value="">Any</option>
                        <option value="Family">Family</option>
                        <option value="Bachelor">Bachelor</option>
                        <option value="Both">Both</option>
                      </SelectField>

                      <BooleanSelect name="balconyAvailable" label="Balcony available" defaultValue={values.balconyAvailable} />
                    </div>
                  </FilterSection>
                )}

                {showRoomFilters && (
                  <FilterSection title={selectedType === "room" ? "Room details" : "Room"} defaultOpen={selectedType === "room"}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField name="gender" label="Gender" defaultValue={values.gender}>
                        <option value="">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </SelectField>

                      <NumberField name="roomCapacity" label="Room capacity" placeholder="Capacity" defaultValue={values.roomCapacity} />

                      <SelectField name="bathroomLocation" label="Bathroom location" defaultValue={values.bathroomLocation}>
                        <option value="">Any</option>
                        <option value="Inside the room">Inside the room</option>
                        <option value="Outside the room">Outside the room</option>
                      </SelectField>

                      <BooleanSelect name="balconyAvailable" label="Balcony available" defaultValue={values.balconyAvailable} />
                    </div>
                  </FilterSection>
                )}

                {showSeatFilters && (
                  <FilterSection title={selectedType === "seat" ? "Seat details" : "Seat"} defaultOpen={selectedType === "seat"}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField name="gender" label="Gender" defaultValue={values.gender}>
                        <option value="">Any</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </SelectField>

                      <NumberField name="roomCapacity" label="Room capacity" placeholder="Capacity" defaultValue={values.roomCapacity} />

                      <NumberField name="availableSeats" label="Available seats" placeholder="Seats" defaultValue={values.availableSeats} />

                      <SelectField name="bathroomLocation" label="Bathroom location" defaultValue={values.bathroomLocation}>
                        <option value="">Any</option>
                        <option value="Inside the room">Inside the room</option>
                        <option value="Outside the room">Outside the room</option>
                      </SelectField>

                      <BooleanSelect name="balconyAvailable" label="Balcony available" defaultValue={values.balconyAvailable} />
                    </div>
                  </FilterSection>
                )}

                {showGarageFilters && (
                  <FilterSection title={selectedType === "garage" ? "Garage details" : "Garage"} defaultOpen={selectedType === "garage"}>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <SelectField name="vehicleType" label="Vehicle type" defaultValue={values.vehicleType}>
                        <option value="">Any vehicle</option>

                        {vehicleTypes.map((value) => (
                          <option key={value} value={value}>
                            {formatEnumValue(value)}
                          </option>
                        ))}
                      </SelectField>

                      <SelectField name="garageType" label="Garage type" defaultValue={values.garageType}>
                        <option value="">Any garage type</option>

                        {garageTypes.map((value) => (
                          <option key={value} value={value}>
                            {formatEnumValue(value)}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </FilterSection>
                )}

                {showOccupancyFilters && (
                  <FilterSection title="Facilities">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <BooleanSelect name="lift" label="Lift" defaultValue={values.lift} />

                      <BooleanSelect name="generator" label="Generator" defaultValue={values.generator} />

                      <BooleanSelect name="security" label="Security guard" defaultValue={values.security} />

                      <BooleanSelect name="cctv" label="CCTV" defaultValue={values.cctv} />

                      <SelectField name="gateAccess" label="Gate access" defaultValue={values.gateAccess}>
                        <option value="">Any</option>

                        {gateAccessValues.map((value) => (
                          <option key={value} value={value}>
                            {formatEnumValue(value)}
                          </option>
                        ))}
                      </SelectField>
                    </div>
                  </FilterSection>
                )}

                {showOccupancyFilters && (
                  <FilterSection title="Parking">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <BooleanSelect name="carParking" label="Car parking" defaultValue={values.carParking} />

                      <BooleanSelect name="bikeParking" label="Bike parking" defaultValue={values.bikeParking} />
                    </div>
                  </FilterSection>
                )}

                <FilterSection title="Availability">
                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">Available from</span>

                    <input type="date" name="availableFrom" defaultValue={values.availableFrom ?? ""} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-text" />
                  </label>

                  <p className="mt-2 text-xs leading-5 text-text-secondary">Shows listings available on or before the selected date.</p>
                </FilterSection>
              </div>

              <div className="shrink-0 border-t border-border bg-surface px-6 py-4">
                <div className="flex gap-3">
                  <Link href="/rentals" onClick={closeFilters} className="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-border text-sm font-semibold transition-colors hover:bg-hover-background">
                    Clear all
                  </Link>

                  <button type="submit" className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-text px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85">
                    Apply filters
                    <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </form>
          </aside>
        </div>
      )}
    </>
  );
}
