"use client";

type RentalSortProps = {
  defaultValue: string;
  searchParams: Record<string, string | undefined>;
};

export default function RentalSort({ defaultValue, searchParams }: RentalSortProps) {
  return (
    <form method="GET" action="/rentals" className="flex items-center gap-2">
      {Object.entries(searchParams).map(([key, value]) => {
        if (key === "sort" || value === undefined) {
          return null;
        }

        return <input key={key} type="hidden" name={key} value={value} />;
      })}

      <label htmlFor="rental-sort" className="text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">
        Sort
      </label>

      <select
        id="rental-sort"
        name="sort"
        defaultValue={defaultValue}
        onChange={(event) => {
          event.currentTarget.form?.requestSubmit();
        }}
        className="h-9 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-text"
      >
        <option value="newest">Newest</option>
        <option value="rent-low">Rent: Low to High</option>
        <option value="rent-high">Rent: High to Low</option>
        <option value="size-low">Size: Small to Large</option>
        <option value="size-high">Size: Large to Small</option>
      </select>

      <button type="submit" className="sr-only">
        Apply sort
      </button>
    </form>
  );
}
