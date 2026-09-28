import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import Navbar from "@/components/Navbar";

export default function HomePage() {
  return (
    <main className="flex min-h-dvh flex-col bg-background text-foreground">
      <Navbar />

      <div className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid w-full max-w-[1200px] grid-cols-1 gap-4 md:grid-cols-2">
          {/* Find a Rental */}
          <Link href="/rentals" className={["group flex min-h-[280px] flex-col justify-between", "border border-border bg-surface p-6 sm:min-h-[360px] sm:p-8 lg:p-10", "transition-all duration-300 ease-out", "hover:-translate-y-2 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black"].join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted transition-colors duration-300 group-hover:text-black">01 / Explore</span>

              <ArrowUpRight className="h-7 w-7 text-text-primary transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-black" strokeWidth={1.5} />
            </div>

            <div>
              <h1 className="text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-text-primary transition-colors duration-300 group-hover:text-black sm:text-5xl lg:text-7xl">
                Find a
                <br />
                Rental
              </h1>

              <p className="mt-5 max-w-xs text-sm leading-6 text-text-secondary transition-colors duration-300 group-hover:text-black">Explore apartments, rooms, seats and garages.</p>
            </div>

            <div className="mt-8 h-1 w-0 bg-black transition-all duration-300 group-hover:w-full" />
          </Link>

          {/* Post To-Let */}
          <Link href="/post-to-let" className={["group flex min-h-[280px] flex-col justify-between", "border border-brand-green bg-brand-green p-6 sm:min-h-[360px] sm:p-8 lg:min-h-[360px] lg:p-10", "transition-all duration-300 ease-out", "hover:-translate-y-2 hover:border-black", "hover:bg-hover-background hover:shadow-2xl", "focus-visible:outline-none focus-visible:ring-2", "focus-visible:ring-black"].join(" ")}>
            <div className="flex items-start justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 group-hover:text-black">02 / Publish</span>

              <ArrowUpRight className="h-7 w-7 text-white transition-all duration-300 group-hover:translate-x-2 group-hover:-translate-y-2 group-hover:text-black" strokeWidth={1.5} />
            </div>

            <div>
              <h2 className="text-4xl font-extrabold uppercase leading-[0.9] tracking-[-0.06em] text-white transition-colors duration-300 group-hover:text-black sm:text-5xl lg:text-7xl">
                Post
                <br />
                To-Let
              </h2>

              <p className="mt-5 max-w-xs text-sm leading-6 text-white/75 transition-colors duration-300 group-hover:text-black">Publish your available property for potential tenants.</p>
            </div>

            <div className="mt-8 h-1 w-0 bg-black transition-all duration-300 group-hover:w-full" />
          </Link>
        </section>
      </div>
    </main>
  );
}
