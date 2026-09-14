import Link from "next/link";
import { Bell, Bookmark, ChevronRight, Home, Plus, Search, UserRound } from "lucide-react";

const featuredListings = [
  {
    title: "Spacious 3 Bedroom Apartment",
    location: "Block C · Road 8 · Bashundhara R/A",
    rent: "৳35,000 / month",
    details: "3 Bed · 3 Bath · 1,450 sqft",
  },
  {
    title: "Modern Family Apartment",
    location: "Block D · Road 12 · Bashundhara R/A",
    rent: "৳42,000 / month",
    details: "3 Bed · 3 Bath · 1,650 sqft",
  },
  {
    title: "Bright Corner Apartment",
    location: "Block E · Road 4 · Bashundhara R/A",
    rent: "৳30,000 / month",
    details: "2 Bed · 2 Bath · 1,150 sqft",
  },
  {
    title: "Large Family Home",
    location: "Block F · Road 7 · Bashundhara R/A",
    rent: "৳48,000 / month",
    details: "4 Bed · 4 Bath · 1,900 sqft",
  },
];

const verifiedListings = [
  {
    title: "2 Bedroom Apartment",
    location: "Block A · Road 5",
    rent: "৳25,000 / month",
    details: "2 Bed · 2 Bath · 1,000 sqft",
  },
  {
    title: "Family Apartment",
    location: "Block B · Road 9",
    rent: "৳32,000 / month",
    details: "3 Bed · 3 Bath · 1,300 sqft",
  },
  {
    title: "Compact 2 Bedroom",
    location: "Block C · Road 3",
    rent: "৳22,000 / month",
    details: "2 Bed · 2 Bath · 900 sqft",
  },
];

const activeListings = [
  {
    title: "3 Bedroom Apartment",
    location: "Block D · Road 2",
    rent: "৳38,000 / month",
    details: "3 Bed · 3 Bath · 1,500 sqft",
  },
  {
    title: "2 Bedroom Family Home",
    location: "Block E · Road 11",
    rent: "৳28,000 / month",
    details: "2 Bed · 2 Bath · 1,050 sqft",
  },
  {
    title: "Large 4 Bedroom Apartment",
    location: "Block G · Road 6",
    rent: "৳50,000 / month",
    details: "4 Bed · 4 Bath · 2,000 sqft",
  },
];

const services = [
  ["Electrician", "Electrical work"],
  ["Plumber", "Water & plumbing"],
  ["Cleaning", "Home cleaning"],
  ["Moving", "House shifting"],
  ["Internet", "Internet connection"],
  ["AC Service", "Repair & maintenance"],
];

function ListingCard({ listing, featured = false, verified = false }: { listing: (typeof featuredListings)[number]; featured?: boolean; verified?: boolean }) {
  return (
    <Link href="#" className={["group overflow-hidden rounded-xl border border-black/10 bg-white transition", "hover:-translate-y-0.5 hover:border-black/20", featured ? "w-full" : "w-[280px] shrink-0"].join(" ")}>
      <div className="flex h-40 items-center justify-center bg-[#f3f3f0]">
        <Home className="h-7 w-7 text-black/25" strokeWidth={1.5} />
      </div>

      <div className="p-4">
        <div className="mb-2 min-h-5">{verified && <span className="inline-flex rounded-md bg-[#003049]/8 px-2 py-1 text-[9px] font-bold tracking-[0.12em] text-[#003049]">VERIFIED</span>}</div>

        <h3 className="line-clamp-2 text-sm font-bold leading-5 text-[#111]">{listing.title}</h3>

        <p className="mt-1 truncate text-xs text-black/50">{listing.location}</p>

        <div className="mt-4">
          <p className="text-sm font-bold text-[#111]">{listing.rent}</p>
          <p className="mt-0.5 truncate text-xs text-black/40">{listing.details}</p>
        </div>
      </div>
    </Link>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[#111]">{title}</h2>
        <p className="mt-1 text-sm text-black/45">{description}</p>
      </div>

      <Link href="/rentals" className="hidden items-center gap-1 text-sm font-semibold text-[#003049] sm:flex">
        View all
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function QuickAction({ icon: Icon, title, description, href = "#" }: { icon: typeof Search; title: string; description: string; href?: string }) {
  return (
    <Link href={href} className="group flex min-h-[76px] items-center gap-3 rounded-xl border border-black/10 bg-white p-3 transition hover:border-[#003049]/30 hover:bg-black/[0.015]">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#003049]/[0.07]">
        <Icon className="h-5 w-5 text-[#003049]" strokeWidth={1.8} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-[#111]">{title}</span>
        <span className="mt-0.5 block text-xs leading-4 text-black/40">{description}</span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-black/25 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

function ServiceItem({ title, description }: { title: string; description: string }) {
  return (
    <Link href="#" className="group flex min-h-16 items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition hover:border-black/10 hover:bg-black/[0.02]">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#003049]/[0.06]">
        <Home className="h-4 w-4 text-[#003049]" strokeWidth={1.7} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-[#111]">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-black/40">{description}</span>
      </span>

      <ChevronRight className="h-4 w-4 shrink-0 text-black/25" />
    </Link>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#111]">
      {/* NAVBAR */}
      <header className="border-b border-black/10 bg-[#fafaf8]">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-10">
          <Link href="/" className="flex h-full min-w-[120px] items-center" aria-label="VirtualTolet home">
            <span className="text-xl font-extrabold tracking-[-0.04em]">
              Virtual<span className="text-[#003049]">Tolet</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <Link href="/rentals" className="rounded-md px-2 py-2 text-sm font-medium transition hover:bg-black/[0.03]">
              Find a Rental
            </Link>

            <Link href="/post-to-let" className="rounded-md px-2 py-2 text-sm font-medium transition hover:bg-black/[0.03]">
              Post a TO-LET
            </Link>

            <Link href="#services" className="rounded-md px-2 py-2 text-sm font-medium transition hover:bg-black/[0.03]">
              Services
            </Link>

            <Link href="#" className="rounded-md px-2 py-2 text-sm font-medium transition hover:bg-black/[0.03]">
              Saved
            </Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <button type="button" aria-label="Toggle theme" className="flex h-10 w-10 items-center justify-center rounded-lg text-lg transition hover:bg-black/[0.04]">
              ☾
            </button>

            <button type="button" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-lg transition hover:bg-black/[0.04]">
              <Bell className="h-5 w-5" strokeWidth={1.8} />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#d62828]" />
            </button>

            <Link href="#" aria-label="Profile" className="flex h-11 items-center gap-2 rounded-lg px-1.5 transition hover:bg-black/[0.04]">
              <span className="flex h-8.5 w-8.5 items-center justify-center rounded-full bg-[#003049] text-xs font-bold text-white">G</span>

              <span className="hidden xl:block">
                <span className="block max-w-32 truncate text-xs font-semibold">Gigawashu</span>
                <span className="block text-[10px] text-black/40">Profile</span>
              </span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1440px] px-6 pb-16 sm:px-8 lg:px-10">
        {/* HERO */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="max-w-4xl">
            <p className="text-xs font-bold tracking-[0.18em] text-[#003049]">VIRTUALTOLET</p>

            <h1 className="mt-3 text-4xl font-extrabold leading-[1.08] tracking-[-0.045em] sm:text-5xl lg:text-[52px]">
              Find a place that
              <br />
              feels like home.
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-black/55">Discover TO-LETs, check what is actually available, and connect directly with the people behind them.</p>

            <Link href="/rentals" className="mt-7 flex min-h-16 max-w-2xl items-center gap-3 rounded-xl border border-black/15 bg-white px-5 transition hover:border-[#003049]/40">
              <Search className="h-5 w-5 shrink-0 text-[#003049]" strokeWidth={1.8} />

              <span className="flex-1 text-sm font-medium text-black/40">Search homes, areas or rent</span>

              <ChevronRight className="h-5 w-5 text-black/35" />
            </Link>
          </div>
        </section>

        {/* CONTENT */}
        <section className="grid grid-cols-1 gap-8 xl:grid-cols-[220px_minmax(0,1fr)_250px]">
          {/* LEFT ASIDE */}
          <aside>
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight">Quick actions</h2>
              <p className="mt-1 text-sm text-black/45">Get things done faster</p>
            </div>

            <div className="space-y-2">
              <QuickAction icon={Search} title="Find a rental" description="Browse homes around you." href="/rentals" />

              <QuickAction icon={Plus} title="Post a TO-LET" description="Share your rental with others." href="/post-to-let" />

              <QuickAction icon={Bookmark} title="Saved listings" description="Keep your favourites close." />

              <QuickAction icon={UserRound} title="My profile" description="Manage your account." />
            </div>
          </aside>

          {/* MAIN */}
          <div className="min-w-0">
            {/* FEATURED */}
            <section className="mb-12">
              <SectionHeader title="Featured TO-LET" description="Listings worth taking a closer look at" />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {featuredListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} featured />
                ))}
              </div>
            </section>

            {/* VERIFIED */}
            <section className="mb-12">
              <SectionHeader title="Recently verified" description="Listings with recent verification activity" />

              <div className="flex gap-4 overflow-x-auto pb-2">
                {verifiedListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} verified />
                ))}
              </div>
            </section>

            {/* ACTIVE */}
            <section className="mb-4">
              <SectionHeader title="Active TO-LET" description="Currently listed rental homes" />

              <div className="flex gap-4 overflow-x-auto pb-2">
                {activeListings.map((listing) => (
                  <ListingCard key={listing.title} listing={listing} />
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT ASIDE */}
          <aside id="services">
            <div className="mb-5">
              <h2 className="text-xl font-bold tracking-tight">Local services</h2>
              <p className="mt-1 text-sm text-black/45">Useful services around your home</p>
            </div>

            <div className="rounded-xl border border-black/10 bg-white p-1">
              {services.map(([title, description]) => (
                <ServiceItem key={title} title={title} description={description} />
              ))}
            </div>
          </aside>
        </section>

        {/* FOOTER */}
        <footer className="mt-16 flex flex-col gap-5 border-t border-black/10 pt-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-lg font-extrabold tracking-[-0.04em]">
              Virtual<span className="text-[#003049]">Tolet</span>
            </Link>

            <span className="text-xs text-black/40">Find a place. Live better.</span>
          </div>

          <div className="flex flex-wrap items-center gap-5">
            <Link href="#" className="text-xs font-medium text-black/50 hover:text-black">
              About
            </Link>

            <Link href="#" className="text-xs font-medium text-black/50 hover:text-black">
              Help
            </Link>

            <Link href="#" className="text-xs font-medium text-black/50 hover:text-black">
              Privacy
            </Link>

            <Link href="#" className="text-xs font-medium text-black/50 hover:text-black">
              Terms
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
