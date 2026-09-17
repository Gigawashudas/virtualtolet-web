"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

type RentalSearchInputProps = {
  defaultValue?: string;
};

export default function RentalSearchInput({ defaultValue = "" }: RentalSearchInputProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [value, setValue] = useState(() => searchParams.get("q") ?? defaultValue);

  useEffect(() => {
    const currentValue = searchParams.get("q") ?? "";
    const nextValue = value.trim();

    if (nextValue === currentValue) {
      return;
    }

    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (nextValue) {
        params.set("q", nextValue);
      } else {
        params.delete("q");
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 500);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [value, pathname, router, searchParams]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" strokeWidth={1.8} />

      <input type="search" name="q" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Title, area, address, unit, parking..." className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm outline-none placeholder:text-text-secondary focus:border-text" />
    </div>
  );
}
