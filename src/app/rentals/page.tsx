import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Navbar from "@/components/Navbar";

const rentalTypes = [
  {
    number: "01",
    label: "Apartment",
    href: "/rentals/apartment",
  },
  {
    number: "02",
    label: "Room",
    href: "/rentals/room",
  },
  {
    number: "03",
    label: "Seat",
    href: "/rentals/seat",
  },
  {
    number: "04",
    label: "Garage",
    href: "/rentals/garage",
  },
];

export default function RentalsPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Navbar />

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="grid h-full max-h-[760px] w-full max-w-[1200px] grid-cols-2 grid-rows-2 gap-3 sm:gap-4">
          {rentalTypes.map((type) => (
            <Link key={type.label} href={type.href} className={["group flex min-h-0 flex-col justify-between", "border border-border bg-surface p-4", "transition-all duration-300 ease-out", "hover:-translate-y-1 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black", "sm:p-6", "lg:p-8"].join(" ")}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted transition-colors duration-300 group-hover:text-black sm:text-xs">{type.number} / Rent</span>

                <ArrowUpRight className="h-5 w-5 text-text-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>

              <h1 className="text-2xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-text-primary transition-colors duration-300 group-hover:text-black sm:text-4xl lg:text-6xl">{type.label}</h1>

              <div className="h-1 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
