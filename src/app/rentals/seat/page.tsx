import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

import Navbar from "@/components/Navbar";

const seatTypes = [
  {
    number: "01",
    label: "Male",
    href: "/rentals/seat/male",
  },
  {
    number: "02",
    label: "Female",
    href: "/rentals/seat/female",
  },
];

export default function SeatRentalPage() {
  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <Navbar />

      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <section className="grid h-full max-h-[760px] w-full max-w-[1200px] grid-cols-1 grid-rows-2 gap-3 sm:grid-cols-2 sm:grid-rows-1 sm:gap-4">
          {seatTypes.map((type) => (
            <Link key={type.label} href={type.href} className={["group flex min-h-0 flex-col justify-between", "border border-border bg-surface p-5", "transition-all duration-300 ease-out", "hover:-translate-y-1 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black", "sm:p-7", "lg:p-10"].join(" ")}>
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted transition-colors duration-300 group-hover:text-black sm:text-xs">{type.number} / Seat</span>

                <ArrowUpRight className="h-5 w-5 text-text-primary transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-black sm:h-6 sm:w-6" strokeWidth={1.5} />
              </div>

              <h1 className="text-3xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-text-primary transition-colors duration-300 group-hover:text-black sm:text-5xl lg:text-7xl">{type.label}</h1>

              <div className="h-1 w-0 bg-black transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </section>

        <Link href="/rentals" aria-label="Back to rental categories" className="absolute bottom-4 left-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-text-muted transition-colors hover:text-black sm:bottom-6 sm:left-6 lg:left-8">
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          Back
        </Link>
      </div>
    </main>
  );
}
