"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type RentalSelectFieldProps = {
  name: string;
  label: string;
  defaultValue?: string;
  children: ReactNode;
};

export default function RentalSelectField({ name, label, children }: RentalSelectFieldProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get(name) ?? "";

  function handleChange(nextValue: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextValue) {
      params.set(name, nextValue);
    } else {
      params.delete(name);
    }

    const queryString = params.toString();

    router.replace(queryString ? `${pathname}?${queryString}` : pathname);
  }

  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-text-secondary">{label}</span>

      <select name={name} value={value} onChange={(event) => handleChange(event.target.value)} className="h-11 w-full rounded-md border border-border bg-background px-3 text-sm outline-none transition-colors focus:border-text">
        {children}
      </select>
    </label>
  );
}
