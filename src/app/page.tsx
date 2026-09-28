import Link from "next/link";

import { ArrowUpRight } from "lucide-react";

import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <section className="grid w-full max-w-[1200px] grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:gap-6">
          {/* Find a Rental */}
          <Link href="/rentals" className={["group flex min-h-[250px] flex-col justify-between", "border border-border bg-surface p-5", "xs:min-h-[270px]", "sm:min-h-[320px] sm:p-7", "md:min-h-[380px] md:p-8", "lg:min-h-[420px] lg:p-10", "transition-all duration-300 ease-out", "hover:-translate-y-2 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black"].join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-text-muted transition-colors duration-300 group-hover:text-black sm:text-xs sm:tracking-[0.16em]">01 / Explore</span>

              <ArrowUpRight className="h-6 w-6 shrink-0 text-text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-black sm:h-7 sm:w-7" strokeWidth={1.5} />
            </div>

            <div className="mt-auto pt-12 sm:pt-16 md:pt-20 lg:pt-24">
              <h1 className="text-[2.7rem] font-extrabold uppercase leading-[0.88] tracking-[-0.06em] text-text-primary transition-colors duration-300 group-hover:text-black min-[380px]:text-[3rem] sm:text-5xl md:text-6xl lg:text-7xl">
                Find a
                <br />
                Rental
              </h1>

              <p className="mt-4 max-w-[18rem] text-sm leading-6 text-text-secondary transition-colors duration-300 group-hover:text-black sm:mt-5">Explore apartments, rooms, seats and garages.</p>
            </div>

            <div className="mt-6 h-1 w-0 bg-black transition-all duration-300 group-hover:w-full sm:mt-8" />
          </Link>

          {/* Post To-Let */}
          <Link href="/post-to-let" className={["group flex min-h-[250px] flex-col justify-between", "border border-brand-green bg-brand-green p-5", "xs:min-h-[270px]", "sm:min-h-[320px] sm:p-7", "md:min-h-[380px] md:p-8", "lg:min-h-[420px] lg:p-10", "transition-all duration-300 ease-out", "hover:-translate-y-2 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black"].join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/70 transition-colors duration-300 group-hover:text-black sm:text-xs sm:tracking-[0.16em]">02 / Publish</span>

              <ArrowUpRight className="h-6 w-6 shrink-0 text-white transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-black sm:h-7 sm:w-7" strokeWidth={1.5} />
            </div>

            <div className="mt-auto pt-12 sm:pt-16 md:pt-20 lg:pt-24">
              <h2 className="text-[2.7rem] font-extrabold uppercase leading-[0.88] tracking-[-0.06em] text-white transition-colors duration-300 group-hover:text-black min-[380px]:text-[3rem] sm:text-5xl md:text-6xl lg:text-7xl">
                Post
                <br />
                To-Let
              </h2>

              <p className="mt-4 max-w-[18rem] text-sm leading-6 text-white/75 transition-colors duration-300 group-hover:text-black sm:mt-5">Publish your available property for potential tenants.</p>
            </div>

            <div className="mt-6 h-1 w-0 bg-black transition-all duration-300 group-hover:w-full sm:mt-8" />
          </Link>
        </section>
      </div>
    </main>
  );
}
